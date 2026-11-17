/* ============================================================
     SCRIPT: HERO PARALLAX
     Genera el campo de estrellas (semilla fija para que no cambie entre
     recargas), traduce el scroll de la sección a --p, y alterna el header
     entre transparente y sólido al terminar el hero.
     ============================================================ */
(function () {
  var section = document.getElementById('hero-scroll');
  var stage   = section && section.querySelector('[data-hero2-stage]');
  var header  = document.getElementById('header');
  if (!section || !stage) return;

  // El progreso se mide contra el runway, no contra la sección: en modo
  // apilado la sección incluye además la columna de tarjetas de abajo.
  var runway = section.querySelector('[data-hero2-runway]') || section;

  // --- Campo de estrellas determinístico (LCG con semilla fija) ---
  Array.prototype.forEach.call(stage.querySelectorAll('[data-hero2-stars]'), function (starsHost) {
    var seed = 20260817;
    var rand = function () {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    var frag = document.createDocumentFragment();
    for (var s = 0; s < 110; s++) {
      var star = document.createElement('span');
      var size = (0.9 + rand() * 1.8).toFixed(2);
      star.className = 'hero2-star';
      star.style.cssText =
        'left:' + (rand() * 100).toFixed(2) + '%;' +
        'top:' + (rand() * 100).toFixed(2) + '%;' +
        'width:' + size + 'px;height:' + size + 'px;' +
        '--o:' + (0.18 + rand() * 0.7).toFixed(2) + ';' +
        'animation-delay:' + (rand() * 6).toFixed(2) + 's;' +
        'animation-duration:' + (2.6 + rand() * 3.6).toFixed(2) + 's;';
      frag.appendChild(star);
    }
    starsHost.appendChild(frag);
  });

  // El header deja de ser transparente cuando el hero sale del viewport.
  function syncHeader() {
    if (!header) return;
    var headerH = header.offsetHeight;
    header.classList.toggle(
      'is-solid',
      section.getBoundingClientRect().bottom <= headerH
    );
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Tarjetas: laterales o apiladas --------------------------------
  // REGLA FIJA: de 1024px para arriba —desktop y tablet horizontal— las
  // tarjetas van siempre a los costados del equipo. Lo que se ajusta para que
  // entren es el ancho del equipo, nunca la posición de las tarjetas.
  // Por debajo de 1024 no hay costados: ahí la escena hace el relevo y las
  // tarjetas van al centro. Todo el detalle está en hero-parallax.css.
  var sideHost  = stage.querySelector('[data-hero2-side]');
  var stackHost = stage.querySelector('[data-hero2-stack]');
  var stackWindow = stage.querySelector('[data-hero2-stack-window]');
  var sideMode  = window.matchMedia('(min-width: 1024px)');
  // Por debajo de este alto el equipo arriba y una ventana usable abajo no
  // entran juntos, así que la columna pasa a flujo normal.
  var shortMode = window.matchMedia('(max-height: 560px)');
  var cards = Array.prototype.slice.call(section.querySelectorAll('.hero2-card'));
  var deviceEl = stage.querySelector('.hero2-device');
  var ctaEl = stage.querySelector('.hero2-cta');

  function placeCards() {
    var host = sideMode.matches ? sideHost : stackHost;
    if (host && cards.length && cards[0].parentNode !== host) {
      cards.forEach(function (card) { host.appendChild(card); });
    }

    // El CTA acompaña a las tarjetas: en columna cierra la fila debajo de la
    // última, y en modo lateral vuelve a colgar del equipo. Va después del
    // bucle de arriba para quedar siempre último dentro de la columna.
    var ctaHost = sideMode.matches ? deviceEl : stackHost;
    if (ctaEl && ctaHost && ctaEl.parentNode !== ctaHost) {
      ctaHost.appendChild(ctaEl);
    }
  }

  // La columna sale del stage y va al final de la sección cuando no puede
  // moverse por transform: reduced motion, o viewport demasiado bajo.
  function syncStaticStack() {
    if (!stackWindow) return;
    var wantStatic = !sideMode.matches && (reduced || shortMode.matches);
    if (wantStatic) {
      if (stackWindow.parentNode !== section) section.appendChild(stackWindow);
      section.classList.add('is-static-stack');
    } else {
      if (stackWindow.parentNode !== stage) stage.appendChild(stackWindow);
      section.classList.remove('is-static-stack');
    }
  }

  placeCards();
  syncStaticStack();

  [sideMode, shortMode].forEach(function (mq) {
    if (mq.addEventListener) mq.addEventListener('change', onModeChange);
    else if (mq.addListener) mq.addListener(onModeChange);
  });

  if (reduced) {
    stage.style.setProperty('--p', '1');
    stage.classList.add('is-revealed');
    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();
    return;
  }

  // --- Banda del copy -------------------------------------------------
  // El copy se centra entre el header y el borde superior de la laptop en
  // reposo. Ese borde hay que calcularlo, no medirlo con getBoundingClientRect:
  // el rect ya viene con el transform del scroll aplicado, así que daría un
  // valor distinto según dónde esté parado el usuario. Se toma la posición
  // de layout (offsetTop, inmune al transform) y se le aplica a mano el
  // reposo que declara el CSS.
  function cssPx(name, fallback) {
    var raw = getComputedStyle(stage).getPropertyValue(name).trim();
    var n = parseFloat(raw);
    if (isNaN(n)) return fallback;
    return raw.indexOf('vh') > -1 ? window.innerHeight * n / 100 : n;
  }

  function layoutTop(el) {
    var y = 0;
    while (el && el !== stage) {
      y += el.offsetTop;
      el = el.offsetParent;
    }
    return y;
  }

  // El alto real del bloque de texto. Se mide sobre los hijos y no sobre
  // .hero2-copy, que es absoluto con top/bottom fijados: su altura es la de
  // la banda, no la del contenido. Del contenido sale el techo del equipo,
  // así que esto tiene que correr antes que syncDock.
  function syncCopyMetrics() {
    var copy = stage.querySelector('.hero2-copy');
    var badge = copy && copy.querySelector('.hero2-badge');
    var lede = copy && copy.querySelector('.hero2-lede');
    if (!copy || !badge || !lede) return;
    var contentH = lede.offsetTop + lede.offsetHeight - badge.offsetTop;
    stage.style.setProperty('--hero2-copy-h', Math.round(contentH) + 'px');
  }

  function syncCopyBand() {
    var frame = stage.querySelector('.hero2-laptop-frame');
    if (!frame) return;

    var stageH = stage.clientHeight;
    var scale = cssPx('--hero2-rest-scale', 0.9);
    var drop = cssPx('--hero2-drop', window.innerHeight * 0.47);

    // El equipo escala desde el centro del stage y después baja.
    var mid = stageH / 2;
    var restTop = mid + (layoutTop(frame) - mid) * scale + drop;

    stage.style.setProperty('--hero2-copy-top', (header ? header.offsetHeight : 0) + 'px');
    stage.style.setProperty('--hero2-copy-bottom', Math.max(stageH - restTop, 0) + 'px');

    // Cuánto tiene que subir el copy para pasar de centrado en su banda a
    // apoyado en el techo. En modo lateral no se mide: se va con el velo y
    // el recorrido son los 22vh de siempre.
    if (sideMode.matches) {
      stage.style.setProperty('--hero2-copy-rise', '22vh');
      return;
    }
    var bandH = stageH - (header ? header.offsetHeight : 0)
      - Math.max(stageH - restTop, 0);
    var copyH = parseFloat(getComputedStyle(stage).getPropertyValue('--hero2-copy-h')) || 0;
    stage.style.setProperty(
      '--hero2-copy-rise',
      Math.round(Math.max((bandH - copyH) / 2 - 16, 0)) + 'px'
    );
  }

  // --- Acople del equipo y recorrido de la columna ---------------------
  // Las dos medidas salen del alto real del equipo ya montado, y por eso se
  // toman con offsetHeight (valor de layout, inmune al transform del scroll)
  // en vez de getBoundingClientRect, que devolvería algo distinto según
  // dónde esté parado el usuario.
  function syncDock() {
    var device = stage.querySelector('.hero2-device');
    var laptop = stage.querySelector('.hero2-laptop');
    if (!device || !laptop) return;

    if (sideMode.matches || section.classList.contains('is-static-stack')) {
      stage.style.setProperty('--hero2-dock-rise', '0px');
      stage.style.setProperty('--hero2-stack-top', '100%');
      stage.style.setProperty('--hero2-stack-travel', '0px');
      stage.style.setProperty('--hero2-touch-st', '1');
      stage.style.setProperty('--hero2-dev-fade', '0');
      return;
    }

    var stageH = stage.clientHeight;
    // Sólo cuenta el CTA si sigue colgando del equipo: en columna se fue con
    // las tarjetas y el bloque del equipo es nada más la laptop.
    var cta = device.querySelector('.hero2-cta');
    var gap = parseFloat(getComputedStyle(device).rowGap) || 0;
    var contentH = laptop.offsetHeight + (cta ? gap + cta.offsetHeight : 0);

    // El equipo no cambia de tamaño: el techo de --hero2-frame-cap ya dejó
    // reservado el lugar del texto, el CTA y la ventana. Sólo hay que subirlo
    // desde el centro del stage —donde lo deja el layout— hasta debajo del
    // bloque de texto, que ahora se queda arriba.
    var copyH = parseFloat(getComputedStyle(stage).getPropertyValue('--hero2-copy-h')) || 0;
    var want = (header ? header.offsetHeight : 0) + 16 + copyH + 24;
    // Puede dar negativo: si el bloque de texto empuja el equipo por debajo
    // del centro del stage, el "subir" es en realidad bajar. Sin este signo
    // el equipo se quedaba centrado y se montaba sobre el texto.
    var rise = stageH / 2 - contentH / 2 - want;
    // La ventana de las tarjetas ya no arranca debajo del equipo sino debajo
    // del header: el equipo se va a correr y ese espacio queda para ellas.
    var windowTop = header ? header.offsetHeight : 0;
    var windowH = Math.max(stageH - windowTop, 0);

    // La columna arranca al pie del stage y termina ocupando el hueco que
    // dejó el equipo: centrada ahí si entra entera, y si no —un teléfono
    // angosto no da para las cuatro— apoyada abajo, con la primera
    // deshaciéndose en la sombra del título. El recorrido es la distancia
    // entre las dos posiciones.
    var freeTop = windowTop + copyH;
    var freeH = Math.max(stageH - freeTop, 0);
    var stackH = stackHost ? stackHost.offsetHeight : 0;
    var restTop = stackH <= freeH
      ? freeTop + (freeH - stackH) / 2
      : stageH - stackH - 24;
    var travel = Math.max(stageH - restTop, 1);

    // El punto en que la primera tarjeta toca el equipo: la tarjeta arranca
    // al pie del stage y sube, así que lo alcanza después de recorrer lo que
    // hay entre el pie y el borde inferior del equipo. De ahí en más el
    // equipo viaja con la columna y se apaga en 200px de recorrido.
    var deviceBottom = want + contentH;
    var touch = Math.min(Math.max((stageH - deviceBottom) / travel, 0), 0.9);

    stage.style.setProperty('--hero2-dock-rise', Math.round(rise) + 'px');
    stage.style.setProperty('--hero2-stack-top', Math.round(windowTop) + 'px');
    stage.style.setProperty('--hero2-stack-fade', Math.round(Math.min(Math.max(windowH * 0.3, 32), 88)) + 'px');
    stage.style.setProperty('--hero2-stack-travel', Math.round(travel) + 'px');
    stage.style.setProperty('--hero2-touch-st', touch.toFixed(4));
    stage.style.setProperty('--hero2-dev-fade', (travel / 200).toFixed(3));
  }

  function onModeChange() {
    placeCards();
    syncStaticStack();
    if (reduced) return;
    syncCopyMetrics();
    syncCopyBand();
    syncDock();
    onScroll();
  }

  // Progreso crudo que dicta el scroll: 0 al entrar la sección, 1 cuando
  // el stage sticky termina de recorrerla.
  function targetProgress() {
    var travel = runway.offsetHeight - window.innerHeight;
    if (travel <= 0) return 0;
    return Math.min(Math.max(-runway.getBoundingClientRect().top / travel, 0), 1);
  }

  // El scroll llega a saltos (una muesca de rueda mueve 100px de golpe) y
  // atar la escena directo a esa señal es lo que se siente brusco. En vez
  // de eso el scroll fija un objetivo y la escena persigue ese objetivo
  // con amortiguación, así cada salto se reparte en varios cuadros.
  var target = 0;
  var current = 0;
  var raf = null;
  var EASE = 0.11;      // fracción de la distancia que se recorre por cuadro
  var SNAP = 0.0004;    // por debajo de esto ya no vale la pena seguir

  function paint(v) {
    stage.style.setProperty('--p', v.toFixed(4));
    // El umbral es del tramo de revelado: en modo apilado el revelado ocupa
    // sólo el primer 38% del recorrido, así que un 0.6 fijo dejaría el CTA
    // sin clic hasta mucho después de que ya está en pantalla.
    var end = parseFloat(getComputedStyle(stage).getPropertyValue('--hero2-reveal-end')) || 1;
    stage.classList.toggle('is-revealed', v > 0.6 * end);
  }

  function tick() {
    var delta = target - current;
    if (Math.abs(delta) < SNAP) {
      current = target;
      paint(current);
      raf = null;
      return;
    }
    current += delta * EASE;
    paint(current);
    raf = requestAnimationFrame(tick);
  }

  function onScroll() {
    target = targetProgress();
    syncHeader();
    if (raf === null) raf = requestAnimationFrame(tick);
  }

  function onResize() {
    syncCopyMetrics();
    syncCopyBand();
    syncDock();
    onScroll();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  // Primer cuadro sin amortiguar: si la página abre scrolleada (recarga,
  // ancla) la escena tiene que aparecer ya en su posición.
  syncCopyMetrics();
  syncCopyBand();
  syncDock();
  target = current = targetProgress();
  paint(current);
  syncHeader();

  // La foto de la carcasa define el alto del equipo; hasta que no decodifica
  // la banda medida es provisoria.
  var frameImg = stage.querySelector('.hero2-laptop-frame');
  if (frameImg && !frameImg.complete) {
    frameImg.addEventListener('load', function () {
      syncCopyMetrics();
      syncCopyBand();
      syncDock();
    }, { once: true });
  }

  // Las tipografías llegan después del primer paint y cambian el alto de las
  // tarjetas, que es de lo que sale el recorrido de la columna.
  // Las tipografías cambian el alto del bloque de texto, y de ahí sale todo
  // lo demás: hay que rehacer la cadena entera, no sólo el equipo.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {
    syncCopyMetrics();
    syncCopyBand();
    syncDock();
  });
})();
