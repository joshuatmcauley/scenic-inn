// Header dropdown: closes when you tap elsewhere, press Escape, or pick a link.
(function () {
  var drops = document.querySelectorAll('.nav-drop');
  if (!drops.length) return;
  function closeAll(except) { drops.forEach(function (d) { if (d !== except) d.removeAttribute('open'); }); }
  document.addEventListener('click', function (e) {
    var inside = e.target.closest ? e.target.closest('.nav-drop') : null;
    closeAll(inside);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    drops.forEach(function (d) {
      if (d.hasAttribute('open')) { d.removeAttribute('open'); var s = d.querySelector('summary'); if (s) s.focus(); }
    });
  });
})();
