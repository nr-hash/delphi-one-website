/* ============================================================
   HOW IT WORKS — VIDEOS DE LOS PASOS
   Cada [data-hiwp-video] corre en loop mientras la persona está
   viendo la sección, y se pausa cuando no. Sin autoplay en el
   markup a propósito: el play lo dispara este gate, así un video
   fuera de pantalla no gasta decodificador ni datos.

   Mismo criterio que asset-switcher.js:
     gate 1 — el elemento está en el viewport;
     gate 2 — si vive dentro del panel sticky, ese panel es el
              activo (los otros están en opacity 0, superpuestos).
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setup(video) {
    /* Sin muted el navegador rechaza el play() sin gesto. El atributo ya
       está en el markup; esto cubre el caso de un video inyectado a mano. */
    video.muted = true;

    /* Menos movimiento: se queda en el póster, quieto. */
    if (REDUCED.matches) {
      video.removeAttribute('loop');
      return;
    }

    video.loop = true;

    var visible = false;
    var panelOn = true;

    function sync() {
      if (visible && panelOn && !document.hidden) {
        var p = video.play();
        /* Si la política de autoplay lo rechaza, queda el póster. */
        if (p && p.catch) p.catch(function () {});
      } else {
        video.pause();
      }
    }

    /* Gate 1: sólo cuando se ve. En desktop el visual inline está en
       display:none y en mobile lo está el panel, así que el que no
       corresponde nunca intersecta y nunca arranca. */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        sync();
      }, { threshold: 0.25 }).observe(video);
    } else {
      visible = true;
    }

    /* Gate 2: el panel activo del sticky. */
    var panel = video.closest ? video.closest('[data-hiwp-panel]') : null;
    if (panel) {
      panelOn = panel.getAttribute('data-active') === 'true';
      new MutationObserver(function () {
        panelOn = panel.getAttribute('data-active') === 'true';
        sync();
      }).observe(panel, { attributes: true, attributeFilter: ['data-active'] });
    }

    /* Volver a la pestaña no debería dejarlo congelado a mitad de loop. */
    document.addEventListener('visibilitychange', sync);

    sync();
  }

  function init() {
    var nodes = document.querySelectorAll('[data-hiwp-video]');
    for (var i = 0; i < nodes.length; i++) setup(nodes[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
