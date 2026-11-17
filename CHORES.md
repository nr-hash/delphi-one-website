# Chores

Pendientes del sitio, al 17/11/2026 (actualizado en la revisión final). Marcar con `[x]` al cerrar y sumar lo nuevo abajo de su grupo.

## Infraestructura

- [ ] **Deploy.** Conectar el CI a S3 + CloudFront, como beta: definir bucket y
      distribución, cargar las credenciales de AWS como secrets del repo y sumar el
      paso de deploy a `.github/workflows/ci.yml`.
- [ ] **`/api/ticker`.** El ticker del header pide precios a `/api/ticker`, que en beta es
      un backend aparte. Acá da 404 y quedan los precios fijos del markup.
- [ ] **Analytics.** GA4 (`G-J386F4YV1J`) y Clarity usan los IDs de producción de beta y
      se cargan en todo `npm run build`. Si se publica en un dominio de prueba, sacarlos
      o usar `noindex`, para no mezclar datos.
- [ ] **Dependencias.** `npm audit` marca 5 vulnerabilidades (1 crítica, 3 altas, 1 baja),
      entre ellas las de libvips que trae `sharp` vía Astro. Revisar si alcanza con
      actualizar Astro antes de forzar `npm audit fix --force`.
- [ ] **Accesos.** Invitar al dev como colaborador. La deploy key de esta Mac
      (`delphi-one-website deploy key`) es sólo para subir desde acá: borrarla cuando ya
      no haga falta.

## Contenido y páginas

- [ ] **Páginas que faltan.** El menú y los CTAs enlazan a `/creators` e `/investors`, que
      existen en beta pero no en este repo. Beta además tiene `/faq/`, `/privacy/` y
      `/terms/`.
- [ ] **Capturas de Research.** "Good judgment is small data" ya tiene su captura
      (`jd1_good_judgment.webp`, 2000×1135) y "Pick your analysts" también
      (`jd2_leaderboard.webp`, 2000×1138). Faltan "Chair your investment committee" y
      "John Maven AI, at your service".
- [ ] **Redes del footer.** El artifact tenía "Discord" sin URL; se puso YouTube, como en
      beta. Confirmar cuál va.

## Decisiones de copy (revisión de jerarquía y lógica)

- [ ] **Dos titulares en el hero.** "You are now a hedge fund." y "Pick analysts, not
      stocks." compiten; elegir uno y que el otro sea la bajada.
- [ ] **Menú vs. secciones.** "WHY DELPHI ONE?" lleva a "We give you the AI…", y "Which one
      are you?" no está en el menú.
- [ ] **Mensajes a creadores.** Aparecen en el menú, el link de Valuations, el último
      callout de Portfolio y el selector de personas. Decidir cuáles quedan.
- [ ] **Título de Plans.** Dice "Start free. Scale up when you're ready." pero el plan
      destacado ahora es Premium (gratis en beta).
- [ ] **Cierre.** "Investment alpha, distilled." repite el badge del principio en lugar de
      resumir la propuesta.
- [ ] **Bajada de Valuations.** Para entrar en 2 líneas quedó a ~130 caracteres por línea
      (lo cómodo son ~90). Recortar el texto permitiría una columna más angosta.

## Sincronización con el diseño

- [ ] **Pasar los cambios al artifact "Delphi One Home Design".** Accesibilidad,
      jerarquía, espaciado y toda la revisión mobile están sólo en este repo (lista en el
      README, "Diferencias a propósito con el artifact"). Si no se pasan, la próxima copia
      desde el artifact los pisa. Las revisiones de mobile y tablet incluyen cambios de
      markup, no sólo CSS: `.hero-run` en el hero, `data-chip` en Valuations, `data-co` y
      `data-stack` en Portfolio, `.nav-cta` en el menú y dos scripts inline en el Layout
      (`html.touch` y `html.tp`).

## Mobile y tablet

Revisiones de mobile y de tablet (vertical y horizontal) cerradas el 17/11/2026: hero en 2
etapas, cards del hero en columna, Valuations con marcadores, Portfolio con la ventana grande
y las cards superpuestas, capturas con alto máximo, separación entre secciones, header de
tablet, planes con encabezado en 2 columnas. Quedó abierto:

- [x] **iPad Pro 12,9" en vertical (1024×1366).** Resuelto: las tablets en vertical de
      901–1100 px usan el hero en 2 etapas (clase `html.tp`).
- [ ] **Reglas del hero duplicadas para `html.tp`.** El bloque "Portrait tablets 901–1100px" de
      `global.css` es una copia generada de las reglas del hero de celular. Si se cambia el hero
      mobile, hay que regenerarlo (o pasarlo a una media query cuando se limpie el CSS).
- [ ] **Probar el header de tablet en un iPad real.** El modo táctil se detecta con
      `(hover:none) and (pointer:coarse)`; un iPad con mouse o trackpad conectado muestra el
      menú de escritorio en horizontal.
- [ ] **Secciones más altas que la pantalla.** En un teléfono, Portfolio, Personas
      (~1550 px) y Plans (~3000) superan la pantalla. Se decidió no cambiar su estructura;
      si molesta, la opción es pasar personas y planes a carrusel.
- [ ] **Portfolio en escritorio.** Desde 1200 px sigue con la composición original (cards a
      los costados con conectores). En mobile y tablet ya tiene la ventana grande con cards
      superpuestas; decidir si escritorio también.
- [ ] **Plans en celular.** Con el encabezado en 2 columnas, la descripción de Alexandria
      ocupa 4 líneas a 375 px y la nota de su precio 3 a 360 px. Un texto más corto lo
      resolvería.
- [ ] **Probar en dispositivos reales.** Todo se verificó en navegador con marcos de 360 a
      1920 px de ancho (celular, tablet vertical y horizontal, escritorio). Falta Safari de
      iOS: la barra de direcciones cambia el alto de la pantalla y el hero en 2 etapas depende
      de ese alto (sólo se re-mide si cambia más de 120 px).

## Limpieza de código

- [ ] **Consolidar `global.css`.** Las revisiones se sumaron como bloques al final del
      archivo (accesibilidad, jerarquía, mobile, tablet, Portfolio, Plans) que pisan reglas
      anteriores con `!important` y selectores más específicos. Funciona, pero conviene
      fundirlos con las reglas originales cuando se haga la limpieza.

- [ ] **CSS sin uso en la Home.** `global.css` trae del artifact las reglas de las otras
      landings (`.ftabs`, `.hiw-*`, `.earn`, `.pgrid`, `.mx*`, `.an-*`…) y `.h-alt`, que ya
      no está en el markup. Conservarlas mientras falten `/creators` e `/investors`;
      podarlas cuando esas páginas existan.
- [ ] **Clase `.art` duplicada.** El chip "Article" de Valuations (`.bm.art`) comparte nombre
      con la mesa de trabajo del hero (`.art`) y hereda sus reglas; hoy se compensa en el CSS
      de mobile. Renombrar una de las dos al limpiar.

## Revisión final (17/11/2026)

Sin pendientes de código. Build y `astro check` sin errores ni avisos. Chequeo automático en
9 tamaños (360×740, 375×667, 393×852, 768×1024, 1024×1366, 1024×768, 1180×820, 1440×900 y
1920×1080): sin desborde horizontal, sin imágenes rotas, sin texto de menos de 12 px, sin
links ni botones sin nombre accesible y sin errores de JavaScript. En escritorio se
mantienen las medidas de la revisión de jerarquía (encabezado → contenido 40 px, hero 56/56,
cards a 40 px de la ventana) y los planes en orden Free, Premium, Alexandria en todos los
tamaños. El HTML de producción incluye analytics, detección de tablet, skip link, JSON-LD,
canonical, Open Graph y sitemap.

