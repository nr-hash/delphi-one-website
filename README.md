# Delphi One — Website

Sitio de Delphi One (delphi.one). Está armado **igual que beta.delphi.one**, para
que pasar cambios de un repo al otro (o migrar) sea copiar archivos:

- **Astro 5**, salida 100% estática, `@astrojs/sitemap`, URLs con barra final.
- **El diseño sale del artifact "Delphi One Home Design"** (claude.ai). Ese
  artifact arma la página con JavaScript en el navegador; acá, como en beta, su
  HTML ya renderizado vive como markup estático en componentes `.astro`, con las
  mismas clases, el mismo CSS y los mismos ids.
- **Un solo CSS global** (`src/styles/global.css`): el CSS del artifact sin las
  herramientas de edición (barra de edición, modo "Edit text", comparador de
  versiones, documento de cambios). `--bar` no existe: el header va pegado arriba.
- **Un solo script compartido** (`src/scripts/landing.js`): las funciones
  `setup*` del artifact (hero scroll-driven, composiciones escaladas, carruseles,
  selector de personas, reveal, menú) + lo que Dan sumó en beta (scroll suave a
  anclas, ticker de precios en vivo).
- **Imágenes en `public/images/v2/<clave>.webp|svg`**: las claves son las del
  mapa `ASSETS` del artifact. Son los mismos archivos que sirve beta.

## Correr el proyecto

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro check + build → dist/
npm run preview  # sirve dist/ para revisar el build
```

Requiere Node 22 (`.nvmrc`; con nvm: `nvm use`).

## Estructura

```
src/
  pages/index.astro          Home: Layout + Header + 8 secciones + Footer + landing.js
  layouts/Layout.astro       <head> (meta de beta, fuentes, analytics en prod) + <body>
  components/
    Header.astro             ticker, logo, menú de anclas, CTA, burger
    Hero.astro               #hero      hero scroll-driven (setupHero)
    Research.astro           #how       "We give you the AI…" — carrusel (setupRails)
    Valuations.astro         #mf-val    composición escalada (setupStages)
    Trade.astro              #trade     carrusel
    Portfolio.astro          #mf        composición con callouts
    Personas.astro           #personas  "Which one are you?" (setupCaseSwitch)
    Plans.astro              #plans
    ManyApps.astro           #many      cierre
    Footer.astro
  styles/global.css
  scripts/landing.js
public/images/v2/            60 assets (webp/svg)
.claude/launch.json          config para levantar el dev server desde Claude Code
```

## Cómo traer un cambio del artifact

El artifact es la fuente del diseño y del copy. Cuando cambia:

1. **Copy o markup de una sección:** renderizar el artifact, copiar el HTML de
   esa `<section>` y pegarlo en su componente, aplicando las mismas reglas que
   el resto del repo (son las que usa beta):
   - sacar los atributos del editor: `data-k` y `data-a`;
   - `<img data-a="clave">` → `<img src="/images/v2/clave.webp" alt="…" loading="lazy" decoding="async">`
     (`eager` sólo para lo que se ve al cargar: logo, fondos y ventana del hero);
   - `href="#home2" data-scroll="x"` → `href="#x"`; `data-go="creators"` → `/creators`,
     `data-go="readers"` → `/investors`, `data-go="home2"` → `/`;
   - los `href="#home2"` sueltos son CTAs de registro →
     `https://app.delphi.one/?nav=login&snav=register` con `target="_blank" rel="noopener"`.
2. **CSS:** el bloque `<style>` del artifact, menos las reglas del editor
   (`.editbar`, `.eb-*`, `.editing`, `.toast`, `.edit-tip`, `[data-k]`, `.imp`,
   `.cx*`, `.cmp*`, `.flayout`, `.v-compare`) y con `var(--bar)` resuelto a 0.
3. **Imagen nueva:** guardarla como `public/images/v2/<clave>.webp` (las PNG se
   pasan a WebP, como en beta).

## Flujo de trabajo

- `main` es la rama estable. Trabajar en ramas y abrir PR.
- Cada push a `main` y cada PR corre el CI (`.github/workflows/ci.yml`):
  `npm ci` + `npm run build`, y deja `dist/` como artifact del run.
- El deploy no está conectado todavía (beta: S3 + CloudFront).

## Diferencias a propósito con el artifact

- **Footer:** el artifact tiene "Discord" sin URL; va YouTube, como en beta. El
  mail es un link `mailto:`.
- **Links a otras landings** (`/creators`, `/investors`): existen en beta y no
  en este repo todavía (el artifact hoy sólo publica la Home).
- **Accesibilidad** (revisión del 17/11/2026; conviene llevarlo también al artifact):
  - los botones "Get started with X" tienen el logo con `alt="X"`;
  - el "Φne" del cierre se lee "One for values." (texto `.sr-only`);
  - los "Learn more" del hero dicen a dónde llevan y las flechas `→` no se leen;
  - en el hero, los links de capas que están invisibles salen del orden de tabulación
    (`focusable()` en `landing.js`);
  - `--muted` pasa de `#6b7884` a `#63707c` y el texto de `.pbadge` a `#0067b1`,
    para llegar a 4,5:1 de contraste;
  - el selector Investor/Creator sigue el patrón de pestañas completo (ids,
    `aria-controls`, flechas, Home/End);
  - la decoración de Valuations y los conectores de Portfolio llevan `aria-hidden`;
  - hay un link "Skip to content", y los links internos mueven el foco a su sección.
- **Jerarquía** (misma revisión; bloque "Hierarchy review" al final de `global.css`):
  - escala única: título de sección 41 · título de card 24 · título chico 18 ·
    bajada de sección 18 · cuerpo de card 16 · meta 14;
  - hero: el botón principal se ve a 18 px (antes 13,5 px, porque escalaba con la
    mesa de trabajo); el link "Are you a creator?" y el badge bajan a 14 px;
  - Plans: el plan destacado es Premium (gratis en beta), con el badge "Free in beta".
    Free pierde el badge "Start here". Los badges de estado ("Coming soon") pasan a
    gris neutro, para no confundirse con la recomendación.
  - todos los títulos de card (carruseles, planes, personas, callouts, cards del hero)
    van en semibold (600);
  - final del hero: título, pantalla y botón separados por `--hg` (56 px en pantalla;
    40 px en ventanas de hasta 760 px de alto), y las cards a `--cg` de la pantalla
    (40 px, menos en ventanas angostas). El script usa `--hg` para centrar el conjunto.
  - Valuations: el link "Are you an analyst? Get paid for your Valuations" pasa del pie de
    la composición al encabezado (`.mf-link`, debajo de la bajada); la bajada va en 2
    líneas (≥1280 px) y la composición (`data-fit="screen"`) se achica según el alto,
    hasta 70 %, para que encabezado y composición entren en una pantalla. 
  - encabezado → contenido: 40 px en todas las secciones (`--head-gap`, antes 64), medido al
    primer elemento visible. Para eso el carrusel compensa su relleno de 8 px, la grilla de
    planes pierde su margen propio y las composiciones recortan el vacío de arriba con
    `data-trim` (Portfolio 44, Valuations 10), que aplica `fitStages`. En Personas el
    selector es parte del encabezado (24 px bajo el título) y las cards van a 40 px.
- **Mobile** (revisión del 17/11/2026, bloque "Mobile review" en `global.css`):
  - encabezado → contenido: 32 px en todas las secciones (antes 32 a 96);
  - separación entre secciones: 112 px (antes 64), para que se vean menos la anterior y la siguiente;
  - cards de Research y Trade con su propio alto: la captura va justo debajo del texto (30 px), sin hueco;
  - el header toma un fondo oscuro al hacer scroll sobre el hero (`.hdr.scrolled`), porque
    transparente se montaba sobre el texto;
  - Plans: el plan destacado (Premium) va primero cuando se apilan;
  - el link de Valuations se acomoda centrado y la flecha no queda sola en una línea;
  - "BETA" y "Coming soon" suben a 12 px (estaban en 10 y 11).
  - hero en 2 etapas en celulares y tablets en vertical (≤900 px, pantallas de ≥560 px de alto):
    la etapa 1 llena la pantalla con el texto centrado y la ventana asomando abajo; al hacer
    scroll (`.hero-run`) el hero queda fijo, el texto se va, sube la ventana bajo el segundo
    título (etapa 2) y entran las cards: una debajo de la otra, compactas y sin "Learn more",
    con el botón "Get started with X" al final. `setupHero` → `layoutScene`/`paintScene`. En pantallas
    más bajas (celular acostado) queda apilado;
  - el menú abierto termina con "Get started with X" (`.nav-cta`) por debajo de 640 px, donde el
    botón del header se oculta;
  - el logo es una zona táctil de 44 px.
  - Valuations (≤999 px): versión chica de la composición. 4 marcadores grandes sobre los bordes de
    la ventana (View 1, View 2, Post 1, Article) y el cursor arrastrando el Article hacia el texto,
    como en escritorio. Los marcadores llevan `data-chip` en `Valuations.astro`.
  - capturas de la app con alto máximo según el dispositivo (≤999 px, de Research al final): las
    de los carruseles hasta 30 % del alto de pantalla y las ventanas de Valuations y Portfolio
    hasta 45 % (se angostan para mantener la proporción).
- **Tablet** (revisión del 17/11/2026, bloques "Tablet header" y "Tablet review" en `global.css`):
  - header: logo a la izquierda; "Get started with X" y el menú juntos a la derecha; nada al
    centro. En vertical (≤1100 px) y en horizontal con pantalla táctil (hasta 1366 px, clase
    `html.touch` que pone un script inline del Layout). Las laptops del mismo ancho, con mouse,
    conservan el menú de escritorio;
  - hero a 1024 px: las cards se angostan para quedar a ≥32 px del borde;
  - capturas de los carruseles con tope de 42 % del alto en pantallas bajas (≤1366×900);
  - Portfolio usa el armado apilado hasta 1199 px (`data-stack="1200"`);
  - Personas y Plans en 3 columnas desde 901 px (antes 1101); Premium primero sólo al apilarse;
  - los badges de los planes no se parten.
  - tablets en vertical de 901–1100 px (iPad Pro 12,9"): hero en 2 etapas como en celular, con
    la clase `html.tp` (script inline del Layout, se actualiza al rotar en `syncTP`). El resto de
    la página mantiene el diseño de escritorio;
  - el botón del menú no tiene borde.
- **Portfolio por debajo de 1200 px** (bloque al final de `global.css`): ventana grande (72 % del
  ancho, hasta 70 % del alto de pantalla) con 3 cards por delante, en zigzag sobre sus bordes, y
  las otras 2 debajo, lado a lado (`data-co` en `Portfolio.astro`; posiciones en `cqw`). En celular (<600 px) la ventana va a ancho completo y
  las cards la siguen alternando izquierda y derecha, la primera montada sobre su borde.

## Pendientes conocidos

La lista completa y al día está en [`CHORES.md`](CHORES.md). Resumen:

1. **`/api/ticker`:** el ticker del header pide precios a `/api/ticker`, que en
   beta es un backend aparte. Acá no existe: el pedido da 404 y quedan los
   precios fijos del markup. Al deployar junto a beta, funciona solo.
2. **Placeholders:** las 4 cards de Research muestran "Placeholder" porque el
   artifact todavía no tiene esas capturas.
3. **Analytics:** GA4 (`G-J386F4YV1J`) y Clarity, los mismos IDs de beta, sólo
   en `npm run build`. Si se publica en un dominio de prueba, sacarlos o pasar
   `noindex` en el Layout.
