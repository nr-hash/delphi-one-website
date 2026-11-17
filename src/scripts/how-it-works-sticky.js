/* ============================================================
     SCRIPT: HOW IT WORKS — STICKY REVEAL
     No secuestra el scroll. Marca como activo el paso que cruza la
     línea media del espacio que deja libre el header fijo, y el panel
     de la derecha hace cross-fade a ese paso.
     ============================================================ */
(function () {
  var section = document.getElementById('how-it-works');
  if (!section) return;

  var steps  = Array.prototype.slice.call(section.querySelectorAll('[data-hiwp-step]'));
  var panels = Array.prototype.slice.call(section.querySelectorAll('[data-hiwp-panel]'));
  var header = document.getElementById('header');
  if (!steps.length) return;

  var desktop = window.matchMedia('(min-width: 1024px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var ticking = false;
  var active = 0;

  var visual = section.querySelector('.hiwp-visual');

  // El CSS centra la imagen en el espacio libre bajo el header fijo, y
  // para eso necesita los dos altos reales.
  function syncMetrics() {
    section.style.setProperty('--hiwp-header', (header ? header.offsetHeight : 0) + 'px');
    if (visual) {
      section.style.setProperty('--hiwp-visual', Math.round(visual.getBoundingClientRect().height) + 'px');
    }
  }

  function setActive(i) {
    if (i === active) return;
    active = i;
    steps.forEach(function (el, n) { el.setAttribute('data-active', String(n === i)); });
    panels.forEach(function (el, n) { el.setAttribute('data-active', String(n === i)); });
  }

  // Por geometría y no por IntersectionObserver: así un salto por ancla
  // (o un scroll rápido que se saltea un paso) también deja el correcto.
  function render() {
    ticking = false;
    if (!desktop.matches) return;

    var top = header ? header.offsetHeight : 0;
    var mid = top + (window.innerHeight - top) / 2;

    var best = 0;
    var bestDist = Infinity;

    for (var i = 0; i < steps.length; i++) {
      var r = steps[i].getBoundingClientRect();
      var d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestDist) { bestDist = d; best = i; }
    }

    setActive(best);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(render);
  }

  function onResize() {
    syncMetrics();
    onScroll();
  }

  // El header es fixed: al saltar por anclas dejamos su alto libre arriba.
  document.querySelectorAll('a[href="#how-it-works"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var offset = header ? header.offsetHeight : 0;
      window.scrollTo({
        top: section.getBoundingClientRect().top + window.pageYOffset - offset,
        behavior: reduced.matches ? 'auto' : 'smooth'
      });
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  // Las fuentes llegan después del primer paint y cambian los altos.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);

  syncMetrics();
  render();
})();
