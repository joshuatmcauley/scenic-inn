// Loading screen: a collage of photos at half opacity with the logo.
// Shown on the first page of each visit, then skipped for the rest of the visit.
(function () {
  var seen = false;
  try { seen = sessionStorage.getItem('scenic-loaded') === '1'; } catch (e) {}
  if (seen) return;
  var photos = ['darkhedges.jpg', 'goats-cheese.jpg', 'diningroom.jpg', 'pork-belly.jpg', 'prawns-toast.jpg', 'bar.jpg',
    'garlic-bread.jpg', 'christmas-room.jpg', 'salmon.jpg', 'building.jpg', 'cheesecake.jpg', 'terrace.jpg'];
  var el = document.createElement('div');
  el.className = 'loader';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-label', 'Loading The Scenic Inn');
  el.innerHTML = '<div class="loader-collage" aria-hidden="true">' +
    photos.map(function (p) { return '<span style="background-image:url(' + p + ')"></span>'; }).join('') +
    '</div><img class="loader-logo" src="logo_light.png" alt="">';
  document.body.appendChild(el);
  document.documentElement.classList.add('is-loading');
  var start = Date.now();
  function hide() {
    var wait = Math.max(0, 5000 - (Date.now() - start));
    setTimeout(function () {
      el.classList.add('done');
      document.documentElement.classList.remove('is-loading');
      try { sessionStorage.setItem('scenic-loaded', '1'); } catch (e) {}
      setTimeout(function () { el.remove(); }, 700);
    }, wait);
  }
  if (document.readyState === 'complete') hide();
  else window.addEventListener('load', hide);
  setTimeout(hide, 7000); // never hold people up for long
})();
