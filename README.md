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

## Pendientes conocidos

1. **`/api/ticker`:** el ticker del header pide precios a `/api/ticker`, que en
   beta es un backend aparte. Acá no existe: el pedido da 404 y quedan los
   precios fijos del markup. Al deployar junto a beta, funciona solo.
2. **Placeholders:** las 4 cards de Research muestran "Placeholder" porque el
   artifact todavía no tiene esas capturas.
3. **Analytics:** GA4 (`G-J386F4YV1J`) y Clarity, los mismos IDs de beta, sólo
   en `npm run build`. Si se publica en un dominio de prueba, sacarlos o pasar
   `noindex` en el Layout.
