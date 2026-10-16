// Header menu.
// On phones and small tablets the links fold into a menu button, with
// "Book a table" kept visible next to it. The "Book for an event" dropdown
// closes when you tap elsewhere, press Escape, or pick a link.
(function () {
  var header = document.querySelector('.site-header');
  var nav = header && header.querySelector('.site-nav');
  if (!nav) return;
  var wrap = nav.parentNode;

  // Menu button + a copy of "Book a table" for the top bar on mobile
  var book = nav.querySelector('.nav-book');
  if (book) {
    var top = book.cloneNode(true);
    top.className = 'nav-book-top';
    wrap.insertBefore(top, nav);
  }
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-toggle';
  btn.setAttribute('aria-label', 'Menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<svg class="icon-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
    '<svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  wrap.insertBefore(btn, nav);
  header.classList.add('has-toggle');

  function setOpen(open) {
    header.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  btn.addEventListener('click', function () { setOpen(!header.classList.contains('nav-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 960) setOpen(false); });

  // "Book for an event" dropdown
  var drops = document.querySelectorAll('.nav-drop');
  function closeDrops(except) { drops.forEach(function (d) { if (d !== except) d.removeAttribute('open'); }); }
  document.addEventListener('click', function (e) {
    var inside = e.target.closest ? e.target.closest('.nav-drop') : null;
    // On mobile the dropdown sits inside the open menu, so only close it from outside the header
    if (header.classList.contains('nav-open') && header.contains(e.target)) return;
    closeDrops(inside);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var wasOpen = false;
    drops.forEach(function (d) { if (d.hasAttribute('open')) { d.removeAttribute('open'); wasOpen = true; var s = d.querySelector('summary'); if (s) s.focus(); } });
    if (!wasOpen && header.classList.contains('nav-open')) { setOpen(false); btn.focus(); }
  });
})();
