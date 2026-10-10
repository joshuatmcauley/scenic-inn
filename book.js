// Booking flow for The Scenic Inn.
// This is front-end only. submitBooking() is where to call your backend
// (backend/routes/dojo.js) once the Dojo API credentials are set up.

var DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var LARGE_PARTY = 11;

var state = { step: 1, adults: 2, children: 0, dateIdx: 0, time: null, menu: '' };

// Next 14 days
var days = [];
var base = new Date(); base.setHours(0, 0, 0, 0);
for (var i = 0; i < 14; i++) { var d = new Date(base); d.setDate(base.getDate() + i); days.push(d); }

function range(from, to) { var out = []; for (var m = from; m <= to; m += 30) out.push(m); return out; }

// Slots follow the menu schedule (minutes after midnight)
function schedule(dow) {
  var lunch = range(720, 990), eve = range(1020, 1230), tea = range(1020, 1200);
  if (dow === 0) return [{ menu: 'Sunday lunch', hours: '12pm to 5pm', mins: lunch }, { menu: 'Weekend evening', hours: '5pm to 9pm', mins: eve }];
  if (dow >= 5) return [{ menu: 'Lunch', hours: '12pm to 4:45pm', mins: lunch }, { menu: 'Weekend evening', hours: '5pm to 9pm', mins: eve }];
  return [{ menu: 'Lunch', hours: '12pm to 4:45pm', mins: lunch }, { menu: 'Tea time', hours: '5pm to 8:30pm', mins: tea }];
}

function fmt(m) {
  var h = Math.floor(m / 60), mm = m % 60;
  return (h > 12 ? h - 12 : h) + ':' + (mm < 10 ? '0' + mm : mm) + (h >= 12 ? 'pm' : 'am');
}
function dayText(d) { return DOW[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()]; }
function guestsText() {
  var s = state.adults + (state.adults === 1 ? ' adult' : ' adults');
  if (state.children) s += ', ' + state.children + (state.children === 1 ? ' child' : ' children');
  return s;
}
function isLarge() { return state.adults + state.children >= LARGE_PARTY; }
function $(id) { return document.getElementById(id); }

function renderDates() {
  var box = $('dates'); box.innerHTML = '';
  days.forEach(function (d, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'date';
    b.setAttribute('aria-pressed', i === state.dateIdx ? 'true' : 'false');
    b.innerHTML = '<span>' + (i === 0 ? 'Today' : DOW[d.getDay()].slice(0, 3)) + '</span><strong>' + d.getDate() + '</strong><span>' + MON[d.getMonth()] + '</span>';
    b.addEventListener('click', function () { state.dateIdx = i; state.time = null; state.menu = ''; render(); });
    box.appendChild(b);
  });
}

function renderSlots() {
  var d = days[state.dateIdx];
  $('day-label').textContent = dayText(d);
  var box = $('slot-groups'); box.innerHTML = '';
  schedule(d.getDay()).forEach(function (g) {
    var group = document.createElement('div');
    group.className = 'slot-group';
    group.innerHTML = '<p class="title">' + g.menu + ' <span>' + g.hours + '</span></p>';
    var grid = document.createElement('div');
    grid.className = 'slots';
    g.mins.forEach(function (m) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot';
      b.textContent = fmt(m);
      b.setAttribute('aria-pressed', state.time === m ? 'true' : 'false');
      b.addEventListener('click', function () { state.time = m; state.menu = g.menu; $('time-error').hidden = true; render(); });
      grid.appendChild(b);
    });
    group.appendChild(grid);
    box.appendChild(group);
  });
}

function render() {
  document.querySelectorAll('[data-step]').forEach(function (s) { s.hidden = Number(s.dataset.step) !== state.step; });
  document.querySelectorAll('#steps li').forEach(function (li, i) {
    li.className = i + 1 === state.step ? 'current' : (i + 1 < state.step ? 'done' : '');
  });
  $('adults').textContent = state.adults;
  $('children').textContent = state.children;
  $('large-notice').hidden = !isLarge();

  var d = days[state.dateIdx];
  $('sum-guests').textContent = guestsText();
  $('sum-date').textContent = dayText(d);
  $('sum-time').textContent = state.time === null ? 'Time not chosen yet' : fmt(state.time);
  $('sum-menu').textContent = state.menu ? state.menu + ' menu' : '';

  if (state.step === 1) renderDates();
  if (state.step === 2) renderSlots();
  if (state.step === 4) {
    $('confirm-line').textContent = guestsText() + ', ' + dayText(d) + ' at ' + fmt(state.time) + '.';
    $('confirm-preorder').hidden = !isLarge();
  }
}

function go(step) {
  if (step === 3 && state.time === null) { $('time-error').hidden = false; return; }
  state.step = step;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-change]').forEach(function (b) {
  b.addEventListener('click', function () {
    var parts = b.dataset.change.split(':'), key = parts[0], delta = Number(parts[1]);
    var min = key === 'adults' ? 1 : 0, max = key === 'adults' ? 40 : 20;
    state[key] = Math.min(max, Math.max(min, state[key] + delta));
    render();
  });
});
document.querySelectorAll('[data-go]').forEach(function (b) {
  b.addEventListener('click', function () { go(Number(b.dataset.go)); });
});

$('details').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!this.checkValidity()) { $('details-error').hidden = false; return; }
  $('details-error').hidden = true;
  submitBooking(Object.fromEntries(new FormData(this)));
});

function submitBooking(details) {
  var d = days[state.dateIdx];
  var booking = {
    adults: state.adults,
    children: state.children,
    date: d.toISOString().slice(0, 10),
    time: fmt(state.time),
    menu: state.menu,
    preorder: isLarge(),
    customer: details
  };
  // TODO: send `booking` to the backend, e.g.
  // fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(booking) })
  console.log('Booking', booking);
  go(4);
}

$('restart').addEventListener('click', function () {
  state = { step: 1, adults: 2, children: 0, dateIdx: 0, time: null, menu: '' };
  $('details').reset();
  render();
});

render();
