# Chores

Pendientes del sitio, al 17/11/2026 (actualizado al cerrar la revisión mobile). Marcar con `[x]` al cerrar y sumar lo nuevo abajo de su grupo.

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
- [ ] **Capturas de Research.** Las 4 cards de "We give you the AI. You bring the
      judgment." muestran "Placeholder".
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
      desde el artifact los pisa. La revisión mobile incluye cambios de markup, no sólo CSS:
      `.hero-run` en el hero, `data-chip` en Valuations y `.nav-cta` en el menú.

## Mobile y tablet

Revisión mobile cerrada el 17/11/2026; revisión de tablet (vertical y horizontal) el mismo día (hero en 2 etapas, cards del hero en columna, Valuations
con marcadores, capturas con alto máximo, separación entre secciones, menú con CTA).
Quedó abierto:

- [x] **iPad Pro 12,9" en vertical (1024×1366).** Resuelto: las tablets en vertical de
      901–1100 px usan el hero en 2 etapas (clase `html.tp`).
- [ ] **Reglas del hero duplicadas para `html.tp`.** El bloque "Portrait tablets 901–1100px" de
      `global.css` es una copia generada de las reglas del hero de celular. Si se cambia el hero
      mobile, hay que regenerarlo (o pasarlo a una media query cuando se limpie el CSS).
- [ ] **Probar el header de tablet en un iPad real.** El modo táctil se detecta con
      `(hover:none) and (pointer:coarse)`; un iPad con mouse o trackpad conectado muestra el
      menú de escritorio en horizontal.
- [ ] **Secciones más altas que la pantalla.** Portfolio (~1350 px), Personas (~1550) y
      Plans (~3100) en un teléfono. Se decidió no cambiar su estructura; si molesta, la
      opción es pasar callouts, personas y planes a carrusel.
- [ ] **Probar en dispositivos reales.** Todo se verificó en Chrome con marcos de 375×667,
      393×852, 768×1024 y 844×390. Falta Safari de iOS: la barra de direcciones cambia el
      alto de la pantalla y el hero en 2 etapas depende de ese alto (sólo se re-mide si
      cambia más de 120 px).

## Limpieza de código

- [ ] **CSS sin uso en la Home.** `global.css` trae del artifact las reglas de las otras
      landings (`.ftabs`, `.hiw-*`, `.earn`, `.pgrid`, `.mx*`, `.an-*`…) y `.h-alt`, que ya
      no está en el markup. Conservarlas mientras falten `/creators` e `/investors`;
      podarlas cuando esas páginas existan.
- [ ] **Clase `.art` duplicada.** El chip "Article" de Valuations (`.bm.art`) comparte nombre
      con la mesa de trabajo del hero (`.art`) y hereda sus reglas; hoy se compensa en el CSS
      de mobile. Renombrar una de las dos al limpiar.
