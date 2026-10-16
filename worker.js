// =====================================================================
// THE SCENIC INN – BACKEND (Cloudflare Worker)
//
// Serves the website files and handles everything under /api:
//   POST /api/booking-submission        bookings and preorders from the website
//   POST /api/auth/login                staff sign in
//   POST /api/auth/create-admin         create a staff login (needs SETUP_CODE)
//   GET  /api/admin/bookings            bookings for the staff dashboard
//   PUT  /api/admin/bookings/:id/status mark confirmed / pending / cancelled
//   DELETE /api/admin/bookings/:id      delete a booking for good
//   GET  /api/health                    quick check that it's running
//
// Settings (Cloudflare → this Worker → Settings → Variables and Secrets):
//   AUTH_SECRET       long random text, used to sign staff logins (required)
//   SETUP_CODE        code needed to create a staff login (required for setup)
//   RESEND_API_KEY    from resend.com, to send emails (optional)
//   RESTAURANT_EMAIL  where new bookings are emailed, e.g. enquiries@thescenicinn.co.uk
//   EMAIL_FROM        e.g. The Scenic Inn <bookings@thescenicinn.co.uk>
//                     (needs the domain verified in Resend; also turns on
//                      confirmation emails to customers)
// =====================================================================

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const STATUSES = ['pending', 'confirmed', 'cancelled'];
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_LOGINS = 10;
const MAX_SUBMISSIONS_PER_HOUR = 20;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    try {
      await ensureSchema(env);
      const path = url.pathname.replace(/\/+$/, '');
      const method = request.method;

      if (path === '/api/health') return json({ success: true, ok: true });
      if (path === '/api/booking-submission' && method === 'POST') return await submitBooking(request, env, ctx, url);
      if (path === '/api/auth/login' && method === 'POST') return await login(request, env);
      if (path === '/api/auth/create-admin' && method === 'POST') return await createStaff(request, env);

      if (path.startsWith('/api/admin/')) {
        const user = await authenticate(request, env);
        if (!user) return json({ success: false, message: 'Please sign in again.' }, 401);
        if (path === '/api/admin/bookings' && method === 'GET') return await listBookings(env, url);
        const m = /^\/api\/admin\/bookings\/(\d+)\/status$/.exec(path);
        if (m && method === 'PUT') return await updateStatus(request, env, Number(m[1]));
        const d = /^\/api\/admin\/bookings\/(\d+)$/.exec(path);
        if (d && method === 'DELETE') return await deleteBooking(env, Number(d[1]));
      }
      return json({ success: false, message: 'Not found' }, 404);
    } catch (err) {
      console.error('API error:', err && err.stack || err);
      return json({ success: false, message: 'Something went wrong on our side.' }, 500);
    }
  }
};

// ---------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
async function readJson(request) {
  const text = await request.text();
  if (text.length > 200000) throw new HttpError(413, 'That request is too large.');
  try { return JSON.parse(text || '{}'); } catch (e) { throw new HttpError(400, 'Invalid request.'); }
}
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
function str(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max); }
function clientIp(request) { return request.headers.get('CF-Connecting-IP') || 'unknown'; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

let schemaReady = false;
async function ensureSchema(env) {
  if (schemaReady) return;
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_reference TEXT UNIQUE,
      created_at TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      party_size INTEGER NOT NULL,
      first_name TEXT, last_name TEXT, email TEXT, phone TEXT,
      source TEXT, menu_name TEXT, experience_id TEXT,
      special_requests TEXT,
      preorder TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      updated_at TEXT)`),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS bookings_date ON bookings (date)'),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS staff_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL COLLATE NOCASE,
      email TEXT,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL)`),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS rate_events (kind TEXT NOT NULL, key TEXT NOT NULL, at INTEGER NOT NULL)'),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS rate_events_lookup ON rate_events (kind, key, at)')
  ]);
  // Remembers that the "your booking is confirmed" email went out (so it is only sent once)
  try { await env.DB.prepare('ALTER TABLE bookings ADD COLUMN confirmation_emailed_at TEXT').run(); } catch (e) { /* column already exists */ }
  schemaReady = true;
}

async function countRecent(env, kind, key, windowMs) {
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM rate_events WHERE kind = ? AND key = ? AND at > ?')
    .bind(kind, key, Date.now() - windowMs).first();
  return row ? row.n : 0;
}
async function addEvent(env, kind, key) {
  await env.DB.batch([
    env.DB.prepare('INSERT INTO rate_events (kind, key, at) VALUES (?, ?, ?)').bind(kind, key, Date.now()),
    env.DB.prepare('DELETE FROM rate_events WHERE at < ?').bind(Date.now() - 24 * 3600 * 1000)
  ]);
}

// ---------------------------------------------------------------------
// bookings from the website
// ---------------------------------------------------------------------
async function submitBooking(request, env, ctx, url) {
  const ip = clientIp(request);
  if (await countRecent(env, 'submit', ip, 3600 * 1000) >= MAX_SUBMISSIONS_PER_HOUR) {
    return json({ success: false, message: 'Too many bookings from this connection. Please call us instead.' }, 429);
  }
  let body;
  try { body = await readJson(request); } catch (e) { return json({ success: false, message: e.message }, e.status || 400); }

  const b = body.bookingData || {};
  const booking = {
    first_name: str(b.firstName || b.first_name, 80),
    last_name: str(b.lastName || b.last_name, 80),
    email: str(b.email, 160),
    phone: str(b.phone, 40),
    date: str(b.date, 10),
    time: str(b.time, 5),
    party_size: parseInt(b.partySize || b.party_size, 10),
    source: str(b.source, 40),
    menu_name: str(b.menu_name, 80),
    experience_id: str(b.experience_id, 40) || null,
    special_requests: str(b.specialRequests || b.special_requests, 3000)
  };
  const problems = [];
  if (!booking.first_name) problems.push('first name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email)) problems.push('email');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(booking.date)) problems.push('date');
  if (!/^\d{2}:\d{2}$/.test(booking.time)) problems.push('time');
  if (!(booking.party_size >= 1 && booking.party_size <= 500)) problems.push('number of guests');
  if (problems.length) return json({ success: false, message: 'Please check: ' + problems.join(', ') }, 400);

  const people = (Array.isArray(body.preorderData) ? body.preorderData : []).slice(0, 500).map((p, i) => ({
    person_number: parseInt(p.person_number, 10) || i + 1,
    person_name: str(p.person_name, 80) || 'Guest ' + (i + 1),
    special_instructions: str(p.special_instructions, 500),
    items: (Array.isArray(p.items) ? p.items : []).slice(0, 60).map(it => {
      const out = { course_type: str(it.course_type, 20), item_name: str(it.item_name || it.name, 120) };
      if (typeof it.menu_order === 'number' && isFinite(it.menu_order)) out.menu_order = it.menu_order;
      if (it.quantity != null) out.quantity = parseInt(it.quantity, 10) || 1;
      return out;
    }).filter(it => it.item_name)
  }));

  const ref = 'SCENIC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  const now = new Date().toISOString();
  const res = await env.DB.prepare(`INSERT INTO bookings
      (booking_reference, created_at, date, time, party_size, first_name, last_name, email, phone,
       source, menu_name, experience_id, special_requests, preorder, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`)
    .bind(ref, now, booking.date, booking.time, booking.party_size, booking.first_name, booking.last_name,
      booking.email, booking.phone, booking.source, booking.menu_name, booking.experience_id,
      booking.special_requests, people.length ? JSON.stringify(people) : null)
    .run();
  await addEvent(env, 'submit', ip);

  const saved = { ...booking, id: res.meta && res.meta.last_row_id, booking_reference: ref, preorder: people };
  ctx.waitUntil(sendEmails(env, saved, url.origin).catch(err => console.error('Email error:', err && err.stack || err)));
  return json({ success: true, bookingReference: ref, message: 'Booking received' });
}

// ---------------------------------------------------------------------
// staff accounts
// ---------------------------------------------------------------------
const enc = new TextEncoder();
function b64(bytes) { let s = ''; new Uint8Array(bytes).forEach(c => { s += String.fromCharCode(c); }); return btoa(s); }
function unb64(s) { const bin = atob(s); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; }
function b64url(bytes) { return b64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function unb64url(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return unb64(s); }

async function hashPassword(password, saltBytes, iterations = 100000) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes, iterations }, key, 256);
  return `pbkdf2$${iterations}$${b64(saltBytes)}$${b64(bits)}`;
}
async function checkPassword(password, stored) {
  const [kind, iter, salt, expected] = String(stored).split('$');
  if (kind !== 'pbkdf2') return false;
  const again = (await hashPassword(password, unb64(salt), Number(iter))).split('$')[3];
  return safeEqual(again, expected);
}
function safeEqual(a, b) {
  const x = enc.encode(String(a)), y = enc.encode(String(b));
  if (x.length !== y.length) return false;
  return crypto.subtle.timingSafeEqual(x, y);
}
async function hmacKey(env) {
  return crypto.subtle.importKey('raw', enc.encode(env.AUTH_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function makeToken(env, user, days) {
  const payload = b64url(enc.encode(JSON.stringify({ id: user.id, u: user.username, exp: Date.now() + days * 86400000 })));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(env), enc.encode(payload));
  return payload + '.' + b64url(sig);
}
async function authenticate(request, env) {
  if (!env.AUTH_SECRET) return null;
  const h = request.headers.get('Authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  let ok = false;
  try { ok = await crypto.subtle.verify('HMAC', await hmacKey(env), unb64url(sig), enc.encode(payload)); } catch (e) { return null; }
  if (!ok) return null;
  let data;
  try { data = JSON.parse(new TextDecoder().decode(unb64url(payload))); } catch (e) { return null; }
  if (!data.exp || data.exp < Date.now()) return null;
  const user = await env.DB.prepare('SELECT id, username FROM staff_users WHERE id = ?').bind(data.id).first();
  return user || null;
}

async function login(request, env) {
  if (!env.AUTH_SECRET) return json({ success: false, message: 'Staff login isn’t set up yet: add AUTH_SECRET in Cloudflare.' }, 500);
  const ip = clientIp(request);
  if (await countRecent(env, 'login-fail', ip, LOGIN_WINDOW_MS) >= MAX_FAILED_LOGINS) {
    return json({ success: false, message: 'Too many wrong attempts. Wait 15 minutes and try again.' }, 429);
  }
  const body = await readJson(request);
  const username = str(body.username, 60), password = String(body.password || '');
  if (!username || !password) return json({ success: false, message: 'Enter your username and password.' }, 400);
  const user = await env.DB.prepare('SELECT * FROM staff_users WHERE username = ?').bind(username).first();
  if (!user || !(await checkPassword(password, user.password_hash))) {
    await addEvent(env, 'login-fail', ip);
    return json({ success: false, message: 'Wrong username or password.' }, 401);
  }
  const token = await makeToken(env, user, body.rememberMe ? 30 : 1);
  return json({ success: true, token, user: { id: user.id, username: user.username } });
}

async function createStaff(request, env) {
  if (!env.SETUP_CODE || !env.AUTH_SECRET) {
    return json({ success: false, message: 'Add SETUP_CODE and AUTH_SECRET in Cloudflare first.' }, 403);
  }
  const ip = clientIp(request);
  if (await countRecent(env, 'login-fail', ip, LOGIN_WINDOW_MS) >= MAX_FAILED_LOGINS) {
    return json({ success: false, message: 'Too many wrong attempts. Wait 15 minutes and try again.' }, 429);
  }
  const body = await readJson(request);
  if (!safeEqual(String(body.secret || ''), env.SETUP_CODE)) {
    await addEvent(env, 'login-fail', ip);
    return json({ success: false, message: 'That setup code isn’t right.' }, 403);
  }
  const username = str(body.username, 60), email = str(body.email, 160), password = String(body.password || '');
  if (!/^[A-Za-z0-9._-]{3,60}$/.test(username)) return json({ success: false, message: 'Username: 3 or more letters or numbers, no spaces.' }, 400);
  if (password.length < 10) return json({ success: false, message: 'Password needs at least 10 characters.' }, 400);
  const exists = await env.DB.prepare('SELECT id FROM staff_users WHERE username = ?').bind(username).first();
  if (exists) return json({ success: false, message: 'That username is already taken.' }, 400);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  await env.DB.prepare('INSERT INTO staff_users (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)')
    .bind(username, email, await hashPassword(password, salt), new Date().toISOString()).run();
  return json({ success: true, message: 'Login created' });
}

// ---------------------------------------------------------------------
// staff dashboard data
// ---------------------------------------------------------------------
async function listBookings(env, url) {
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit'), 10) || 300, 1), 1000);
  const { results } = await env.DB.prepare('SELECT * FROM bookings ORDER BY date DESC, time DESC, id DESC LIMIT ?').bind(limit).all();
  const data = results.map(r => ({ ...r, preorder: r.preorder ? safeParse(r.preorder) : null }));
  return json({ success: true, data, count: data.length });
}
function safeParse(s) { try { return JSON.parse(s); } catch (e) { return null; } }

async function updateStatus(request, env, id) {
  const body = await readJson(request);
  const status = str(body.status, 20);
  if (STATUSES.indexOf(status) === -1) return json({ success: false, message: 'Unknown status.' }, 400);
  const before = await env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first();
  if (!before) return json({ success: false, message: 'Booking not found.' }, 404);
  await env.DB.prepare('UPDATE bookings SET status = ?, updated_at = ? WHERE id = ?')
    .bind(status, new Date().toISOString(), id).run();

  // Staff tapped "Mark confirmed": email the customer (once)
  let emailStatus = 'none';
  if (status === 'confirmed' && before.status !== 'confirmed') {
    emailStatus = await sendConfirmedEmail(env, before);
  }
  return json({ success: true, message: 'Updated', emailStatus });
}

async function deleteBooking(env, id) {
  const res = await env.DB.prepare('DELETE FROM bookings WHERE id = ?').bind(id).run();
  if (!res.meta || !res.meta.changes) return json({ success: false, message: 'Booking not found.' }, 404);
  return json({ success: true, message: 'Deleted' });
}

// ---------------------------------------------------------------------
// emails (Resend)
// ---------------------------------------------------------------------
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function niceDate(s) { const p = s.split('-'); const d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); return `${DOW[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`; }
function niceTime(t) { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`; }
function fullName(b) { return `${b.first_name} ${b.last_name}`.trim(); }
function isBuffet(b) { return b.experience_id === 'buffet'; }
function hasPreorder(b) { return isBuffet(b) || (b.preorder || []).some(p => p.items.length); }

async function resend(env, msg) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(msg)
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function sendEmails(env, b, origin) {
  if (!env.RESEND_API_KEY) { console.log('No RESEND_API_KEY set, skipping emails'); return; }
  const from = env.EMAIL_FROM || 'The Scenic Inn <onboarding@resend.dev>';
  const when = `${niceDate(b.date)} at ${niceTime(b.time)}`;
  const kind = isBuffet(b) ? 'Buffet booking' : hasPreorder(b) ? 'Preorder' : 'Booking';

  if (env.RESTAURANT_EMAIL) {
    const msg = {
      from, to: [env.RESTAURANT_EMAIL], reply_to: b.email,
      subject: `New ${kind.toLowerCase()}: ${fullName(b)}, ${b.party_size} guests, ${when}`,
      html: restaurantHtml(b, kind, when, origin)
    };
    if (hasPreorder(b)) {
      try {
        const pdf = await kitchenPdf(env, b, origin);
        msg.attachments = [{ filename: `kitchen-order-${b.date}-${(b.last_name || 'guest').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`, content: b64(pdf) }];
      } catch (err) { console.error('PDF error:', err && err.stack || err); }
    }
    await resend(env, msg);
  }

  // "We've received it" email to the customer (only once a verified sending address is set)
  if (env.EMAIL_FROM && b.email) {
    await resend(env, {
      from, to: [b.email], reply_to: env.RESTAURANT_EMAIL || undefined,
      subject: 'We’ve received your booking request – The Scenic Inn',
      html: `<div style="font-family:Arial,sans-serif;font-size:16px;color:#28221E;max-width:560px">
        <p>Hi ${esc(b.first_name)},</p>
        <p>Thanks for booking with The Scenic Inn. We’ve received your request:</p>
        ${bookingSummaryHtml(b, when)}
        <p><strong>It isn’t confirmed yet.</strong> We’ll email you again as soon as a member of the team has confirmed it. If you need to change anything in the meantime, reply to this email or call us on 028 2075 1260.</p>
        <p>The Scenic Inn<br>38 Fivey Road, Armoy, BT53 8UT</p></div>`
    });
  }
}

function bookingSummaryHtml(b, when) {
  return `<p style="background:#F4EFE4;padding:12px 14px;border-radius:4px"><strong>${esc(when)}</strong><br>${b.party_size} guest${Number(b.party_size) === 1 ? '' : 's'}${b.menu_name ? '<br>' + esc(b.menu_name) + (isBuffet(b) ? '' : ' menu') : ''}${b.booking_reference ? '<br><span style="color:#6E645C">Reference: ' + esc(b.booking_reference) + '</span>' : ''}</p>`;
}

// Sent when staff mark a booking as confirmed on the dashboard.
// Returns: 'sent' | 'already' | 'no-email' | 'not-configured' | 'failed'
async function sendConfirmedEmail(env, row) {
  if (row.confirmation_emailed_at) return 'already';
  if (!row.email) return 'no-email';
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) return 'not-configured';
  const b = { ...row, preorder: row.preorder ? (safeParse(row.preorder) || []) : [] };
  const when = `${niceDate(b.date)} at ${niceTime(b.time)}`;
  try {
    await resend(env, {
      from: env.EMAIL_FROM, to: [b.email], reply_to: env.RESTAURANT_EMAIL || undefined,
      subject: `Your booking is confirmed – ${niceDate(b.date)} at ${niceTime(b.time)}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:16px;color:#28221E;max-width:560px">
        <p>Hi ${esc(b.first_name)},</p>
        <p><strong>Good news: your booking at The Scenic Inn is confirmed.</strong></p>
        ${bookingSummaryHtml(b, when)}
        ${hasPreorder(b) ? '<p>We’ve got your food choices and they’ve been passed to the kitchen.</p>' : ''}
        <p>If you need to change anything, or if your plans change, just reply to this email or call us on 028 2075 1260.</p>
        <p>We look forward to seeing you.</p>
        <p>The Scenic Inn<br>38 Fivey Road, Armoy, BT53 8UT</p></div>`
    });
  } catch (err) {
    console.error('Confirmation email error:', err && err.stack || err);
    return 'failed';
  }
  await env.DB.prepare('UPDATE bookings SET confirmation_emailed_at = ? WHERE id = ?').bind(new Date().toISOString(), row.id).run();
  return 'sent';
}

function restaurantHtml(b, kind, when, origin) {
  const row = (k, v) => v ? `<tr><td style="padding:4px 12px 4px 0;color:#6E645C">${k}</td><td style="padding:4px 0"><strong>${esc(v)}</strong></td></tr>` : '';
  let html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#28221E;max-width:640px">
    <h2 style="margin:0 0 12px">${esc(kind)}: ${esc(when)}</h2>
    <table style="border-collapse:collapse">
      ${row('Name', fullName(b))}${row('Guests', String(b.party_size))}${row('Phone', b.phone)}${row('Email', b.email)}
      ${row('Menu', b.menu_name)}${row('Reference', b.booking_reference)}
    </table>`;
  if (b.special_requests) html += `<p style="background:#F4EFE4;padding:10px 12px">${esc(b.special_requests)}</p>`;
  if (hasPreorder(b)) {
    html += isBuffet(b)
      ? `<p><strong>Buffet:</strong> ${esc(((b.preorder[0] || {}).items || []).map(i => i.item_name).join(', ') || 'to be chosen by phone')}</p>` +
        b.preorder.slice(1).map(pl => `<p><strong>${/^Allergy plate/.test(pl.person_name) ? esc(pl.person_name) : 'Allergy plate, ' + esc(pl.person_name)}:</strong> <span style="color:#8E3B22">${esc((pl.special_instructions || '').replace(/^Allergy:\s*/, ''))}</span>. ${esc(pl.items.map(i => i.item_name).join(', ') || 'check with the organiser')}</p>`).join('') +
        `<p>The kitchen order is attached as a PDF.</p>`
      : `<p>The kitchen order is attached as a PDF, with matching dishes grouped together.</p>`;
  }
  html += `<p><a href="${origin}/staff.html">Open the staff dashboard</a> to confirm it.</p></div>`;
  return html;
}

// ---------------------------------------------------------------------
// kitchen PDF (pdf-lib): logo, booking details, then each course with
// identical dishes grouped together
// ---------------------------------------------------------------------
const WIN_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
function pdfSafe(s) {
  return String(s == null ? '' : s).split('').map(c => (c.charCodeAt(0) < 256 || WIN_EXTRA.indexOf(c) !== -1) ? c : (c === '⚠' ? '!' : '?')).join('');
}

function groupsFor(people, course) {
  const map = new Map();
  people.forEach(p => {
    const it = p.items.find(i => i.course_type === course);
    const name = it ? it.item_name : (course === 'main' ? 'NOT CHOSEN YET' : null);
    if (!name) return;
    if (!map.has(name)) map.set(name, { name, guests: [], order: name === 'NOT CHOSEN YET' ? 99999 : 9999 });
    const g = map.get(name);
    g.guests.push(p);
    if (it && typeof it.menu_order === 'number') g.order = Math.min(g.order, it.menu_order);
  });
  return [...map.values()].sort((a, z) => a.order - z.order || a.name.localeCompare(z.name));
}

async function kitchenPdf(env, b, origin) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const INK = rgb(0.157, 0.133, 0.118), GREY = rgb(0.43, 0.39, 0.36), RUST = rgb(0.557, 0.231, 0.133), LINE = rgb(0.85, 0.82, 0.77);
  const W = 595.28, H = 841.89, M = 40, CW = W - M * 2;
  let page = doc.addPage([W, H]), y = H - M;

  const wrap = (text, f, size, width) => {
    const words = pdfSafe(text).split(/\s+/).filter(Boolean), lines = [];
    let line = '';
    words.forEach(w => {
      const test = line ? line + ' ' + w : w;
      if (f.widthOfTextAtSize(test, size) <= width || !line) line = test; else { lines.push(line); line = w; }
    });
    if (line) lines.push(line);
    return lines.length ? lines : [''];
  };
  const text = (s, x, yy, f, size, color, align, width) => {
    s = pdfSafe(s);
    if (align === 'right') x = x + width - f.widthOfTextAtSize(s, size);
    page.drawText(s, { x, y: yy, size, font: f, color: color || INK });
  };
  const newPage = () => { page = doc.addPage([W, H]); y = H - M; };
  const room = need => { if (y - need < M + 20) { newPage(); return true; } return false; };

  // Header
  try {
    const res = await env.ASSETS.fetch(new Request(origin + '/logo.png'));
    if (res.ok) {
      const img = await doc.embedPng(await res.arrayBuffer());
      const w = 130, h = w * img.height / img.width;
      page.drawImage(img, { x: M, y: y - h, width: w, height: h });
    }
  } catch (e) { console.error('Logo not added:', e && e.message); }
  text('KITCHEN ORDER', M, y - 20, bold, 22, INK, 'right', CW);
  text(`${niceDate(b.date)} at ${niceTime(b.time)}`, M, y - 40, bold, 14, INK, 'right', CW);
  text(`${b.party_size} guests  ·  ${isBuffet(b) ? 'Buffet' : (b.menu_name ? b.menu_name + ' menu' : 'Preorder')}`, M, y - 56, font, 11, INK, 'right', CW);
  y -= 80;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: LINE });
  y -= 18;
  [`Organiser: ${fullName(b)}${b.phone ? '  ·  ' + b.phone : ''}`, b.special_requests ? `Notes: ${b.special_requests}` : '']
    .filter(Boolean).forEach(s => wrap(s, font, 10.5, CW).forEach(l => { text(l, M, y, font, 10.5); y -= 14; }));
  y -= 10;

  if (isBuffet(b)) {
    const p0 = b.preorder[0] || { items: [] };
    text(`Buffet for ${b.party_size}`, M, y, bold, 14); y -= 22;
    (p0.items.length ? p0.items.map(i => i.item_name) : ['To be chosen by phone']).forEach(n => {
      room(20);
      page.drawRectangle({ x: M + 2, y: y - 1, width: 9, height: 9, borderColor: INK, borderWidth: 0.8 });
      text(n, M + 18, y, font, 12); y -= 20;
    });
    if (p0.special_instructions) { y -= 6; wrap('Notes: ' + p0.special_instructions, bold, 11, CW).forEach(l => { room(15); text(l, M, y, bold, 11, RUST); y -= 15; }); }

    // Allergy plates: made separately, one per person
    const plates = b.preorder.slice(1);
    if (plates.length) {
      y -= 14; room(60);
      page.drawRectangle({ x: M, y: y - 6, width: CW, height: 20, color: INK });
      text(`ALLERGY PLATES   ${plates.length}`, M + 8, y, bold, 11.5, rgb(1, 1, 1));
      y -= 30;
      plates.forEach(pl => {
        const lines = wrap(pl.items.length ? pl.items.map(i => i.item_name).join(', ') : 'Check with the organiser', font, 11, CW - 12);
        room(20 + lines.length * 14);
        text(pl.person_name, M, y, bold, 12);
        const allergy = (pl.special_instructions || '').replace(/^Allergy:\s*/, '');
        if (allergy) text(allergy, M + 12 + bold.widthOfTextAtSize(pdfSafe(pl.person_name), 12), y, bold, 12, RUST);
        y -= 16;
        lines.forEach(l => { text(l, M + 12, y, font, 11); y -= 14; });
        y -= 8;
      });
    }
  } else {
    [['starter', 'STARTERS'], ['main', 'MAINS'], ['dessert', 'DESSERTS']].forEach(([course, title]) => {
      const groups = groupsFor(b.preorder, course);
      if (!groups.length) return;
      const total = groups.reduce((a, g) => a + g.guests.length, 0);
      room(70);
      page.drawRectangle({ x: M, y: y - 6, width: CW, height: 20, color: INK });
      text(`${title}   ${total}`, M + 8, y, bold, 11.5, rgb(1, 1, 1));
      y -= 30;
      groups.forEach((grp, gi) => {
        let cont = false;
        const head = () => {
          wrap(`${grp.guests.length} x ${grp.name}${cont ? ' (cont.)' : ''}`, bold, 13, CW).forEach(l => { text(l, M, y, bold, 13); y -= 17; });
          y -= 2;
        };
        if (gi > 0) room(50);
        head();
        grp.guests.forEach(p => {
          const sideItem = course === 'main' ? p.items.find(i => i.course_type === 'side') : null;
          const nameL = wrap(p.person_name, bold, 10, 140);
          const sideL = sideItem ? wrap('Side: ' + sideItem.item_name, font, 10, 105) : [];
          const noteL = p.special_instructions ? wrap(p.special_instructions, bold, 10, CW - 270) : [];
          const lines = Math.max(nameL.length, sideL.length, noteL.length, 1);
          const rh = lines * 12.5 + 6;  // row height
          if (room(rh)) { cont = true; head(); }
          nameL.forEach((l, k) => text(l, M + 12, y - k * 12.5, bold, 10));
          sideL.forEach((l, k) => text(l, M + 160, y - k * 12.5, font, 10));
          noteL.forEach((l, k) => text(l, M + 270, y - k * 12.5, bold, 10, RUST));
          const lineY = y - (lines - 1) * 12.5 - 5;
          page.drawLine({ start: { x: M + 12, y: lineY }, end: { x: W - M, y: lineY }, thickness: 0.4, color: rgb(0.89, 0.87, 0.83) });
          y -= rh + 1;
        });
        y -= 6;
      });
      y -= 6;
    });
  }

  const pages = doc.getPages();
  pages.forEach((pg, i) => {
    const s = pdfSafe(`The Scenic Inn  ·  ${b.last_name || fullName(b)}, ${niceDate(b.date)}  ·  page ${i + 1} of ${pages.length}`);
    pg.drawText(s, { x: (W - font.widthOfTextAtSize(s, 8)) / 2, y: 22, size: 8, font, color: GREY });
  });
  return doc.save();
}
