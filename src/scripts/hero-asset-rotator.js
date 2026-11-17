/* ============================================================
     SCRIPT: ASSET ROTATIVO DEL TÍTULO DEL HERO
     "Be the #1 analyst on <asset>" + su vector (24x24 en el SVG, escalado
     por CSS al tamaño del h1).
     La lista rota cada 3s; el swap ocurre con el grupo en opacity 0.

     Los tres cripto llevan su marca dibujada (formas simples). Los logos
     corporativos son marcas registradas: van como badge neutro con el
     ticker para no meter arte de terceros en el prototipo. Para usar el
     logo real, reemplazar el campo `icon` del asset por su SVG oficial
     (press kit de cada compañía o un set con licencia), a 24x24.
     ============================================================ */
(function () {
  var slot = document.querySelector('[data-hero2-asset]');
  if (!slot) return;

  var nameEl = slot.querySelector('.hero2-asset-name');
  var iconEl = slot.querySelector('.hero2-asset-icon');

  // Badge neutro: círculo + ticker.
  function badge(ticker, bg, fg) {
    return '<svg viewBox="0 0 24 24" width="24" height="24">'
      + '<circle cx="12" cy="12" r="12" fill="' + bg + '"/>'
      + '<text x="12" y="15.2" text-anchor="middle" fill="' + fg + '"'
      + ' font-family="Montserrat, sans-serif" font-weight="700"'
      + ' font-size="' + (ticker.length > 3 ? 6.4 : 8) + '">' + ticker + '</text>'
      + '</svg>';
  }

  var BITCOIN =
    '<svg viewBox="0 0 24 24" width="24" height="24">'
    + '<circle cx="12" cy="12" r="12" fill="#F7931A"/>'
    + '<g fill="#fff">'
    + '<rect x="9.5" y="2.4" width="1.7" height="3.6" rx="0.6"/>'
    + '<rect x="12.6" y="2.4" width="1.7" height="3.6" rx="0.6"/>'
    + '<rect x="9.5" y="18" width="1.7" height="3.6" rx="0.6"/>'
    + '<rect x="12.6" y="18" width="1.7" height="3.6" rx="0.6"/>'
    + '</g>'
    + '<text x="11.8" y="17" text-anchor="middle" fill="#fff"'
    + ' font-family="Montserrat, sans-serif" font-weight="700" font-size="13">B</text>'
    + '</svg>';

  var ETHEREUM =
    '<svg viewBox="0 0 24 24" width="24" height="24">'
    + '<circle cx="12" cy="12" r="12" fill="#627EEA"/>'
    + '<g fill="#fff">'
    + '<path d="M12 3.6v6.5l5.3 2.4z" opacity=".55"/>'
    + '<path d="M12 3.6 6.7 12.5 12 10.1z"/>'
    + '<path d="M12 16.3v4.1l5.3-7.2z" opacity=".55"/>'
    + '<path d="M12 20.4v-4.1l-5.3-3.1z"/>'
    + '<path d="M12 15.2l5.3-3.1L12 10.1z" opacity=".35"/>'
    + '<path d="M6.7 12.1 12 15.2v-5.1z" opacity=".75"/>'
    + '</g></svg>';

  var SOLANA =
    '<svg viewBox="0 0 24 24" width="24" height="24">'
    + '<circle cx="12" cy="12" r="12" fill="#12121C"/>'
    + '<g fill="#14F195">'
    + '<path d="M8.3 6.4h10.9l-2.7 2.7H5.6z"/>'
    + '<path d="M5.6 10.7h10.9l2.7 2.7H8.3z"/>'
    + '<path d="M8.3 15h10.9l-2.7 2.7H5.6z"/>'
    + '</g></svg>';

  // Los 10 assets del título. `color` es el color de marca con el que se
  // pinta el nombre; algunos van un punto más claros que el oficial para
  // que se lean sobre el hero oscuro. Editar acá lista, colores o logos.
  var ASSETS = [
    { name: 'Bitcoin',   color: '#F7931A', icon: BITCOIN },
    { name: 'Ethereum',  color: '#8198F5', icon: ETHEREUM },
    { name: 'Tesla',     color: '#FF4B4F', icon: badge('TSLA', '#E82127', '#ffffff') },
    { name: 'SpaceX',    color: '#FFFFFF', icon: badge('SPX',  '#FFFFFF', '#0B1D33') },
    { name: 'Nvidia',    color: '#76B900', icon: badge('NVDA', '#76B900', '#10171E') },
    { name: 'Solana',    color: '#14F195', icon: SOLANA },
    { name: 'Apple',     color: '#F5F5F7', icon: badge('AAPL', '#F5F5F7', '#10171E') },
    { name: 'Amazon',    color: '#FF9900', icon: badge('AMZN', '#FF9900', '#10171E') },
    { name: 'Microsoft', color: '#00A4EF', icon: badge('MSFT', '#00A4EF', '#ffffff') },
    { name: 'OpenAI',    color: '#19C79B', icon: badge('OAI',  '#10A37F', '#ffffff') }
  ];

  var HOLD = 3000;  // ms que dura cada asset en pantalla
  var FADE = 300;   // debe coincidir con la transición de .hero2-asset

  // --- Zona de swap de ancho fijo --------------------------------------
  // El nombre + su vector se cambian juntos, como una unidad. Para que el
  // renglón no se corra de costado en cada rotación, la caja reserva de
  // entrada el ancho del nombre más largo de la lista y centra adentro.
  // Se mide con una sonda fuera de flujo (position:absolute no es flex
  // item) que hereda la tipografía del h1, así el número sale del render
  // real y no de una tabla de anchos.
  var probe = document.createElement('span');
  probe.className = 'hero2-asset-name';
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;';
  slot.appendChild(probe);

  function sizeSlot() {
    slot.style.removeProperty('--hero2-asset-w');
    var widest = 0;
    for (var k = 0; k < ASSETS.length; k++) {
      probe.textContent = ASSETS[k].name;
      widest = Math.max(widest, probe.getBoundingClientRect().width);
    }
    probe.textContent = '';
    var icon = iconEl.getBoundingClientRect().width;
    var gap = parseFloat(getComputedStyle(slot).columnGap) || 0;
    slot.style.setProperty('--hero2-asset-w', Math.ceil(widest + gap + icon) + 'px');
  }

  // El ancho depende del tamaño del h1, que cambia por breakpoint (y también
  // por alto de viewport, con la escala compacta). Se observa el h1 en vez
  // de escuchar sólo `resize`, así cualquier cambio de layout que mueva la
  // tipografía vuelve a medir. No hay bucle: --hero2-asset-w vive en el
  // grupo del asset y no cambia el ancho del h1, que es de bloque.
  var h1 = slot.closest('h1') || slot.parentNode;
  var lastKey = '';

  function remeasure() {
    var cs = getComputedStyle(h1);
    var key = cs.fontSize + '|' + cs.fontFamily + '|' + cs.fontWeight + '|'
      + h1.clientWidth + '|' + iconEl.getBoundingClientRect().width;
    if (key === lastKey) return;
    lastKey = key;
    sizeSlot();
  }

  function forceRemeasure() { lastKey = ''; remeasure(); }

  remeasure();
  window.addEventListener('resize', remeasure);
  if (window.ResizeObserver) new ResizeObserver(remeasure).observe(h1);
  // Dos reintentos baratos (el guard por clave los deja en nada si no
  // cambió el render): `load` cubre el caso de medir antes de que aplique
  // la hoja de estilos, y fonts.ready el de medir con la fuente de
  // respaldo, que da anchos distintos a los de Montserrat.
  window.addEventListener('load', forceRemeasure);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      requestAnimationFrame(forceRemeasure);
    });
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var i = 0;

  function paint(index) {
    nameEl.textContent = ASSETS[index].name;
    nameEl.style.color = ASSETS[index].color;
    iconEl.innerHTML = ASSETS[index].icon;
  }

  paint(0);

  setInterval(function () {
    i = (i + 1) % ASSETS.length;
    if (reduced) { paint(i); return; }
    slot.classList.add('is-swapping');
    setTimeout(function () {
      paint(i);
      slot.classList.remove('is-swapping');
    }, FADE);
  }, HOLD);
})();
