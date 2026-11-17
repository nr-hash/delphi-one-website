# Delphi One — Website

Sitio de Delphi One (delphi.one). Mismo stack que la landing que hoy está en
https://beta.delphi.one: **Astro 5, salida 100% estática, `@astrojs/sitemap`,
CSS plano con custom properties (sin Tailwind ni framework de UI), Montserrat
y Material Symbols desde Google Fonts**. El build es una carpeta `dist/` que
se sirve desde un CDN (beta hoy: S3 + CloudFront).

El contenido de partida es el port a Astro del prototipo de diseño de la landing. El markup, el CSS y los
scripts son **los mismos** del prototipo; lo único que cambia es cómo están
organizados (componentes, bundling, build estático).

## Correr el proyecto

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/ (100% estático, se sirve desde cualquier CDN)
npm run preview  # sirve dist/ para revisar el build
```

Requiere Node 22 (`.nvmrc`; con nvm: `nvm use`). `npm run build` corre
primero `astro check` (tipos) y después el build.

## Flujo de trabajo

- `main` es la rama estable. Trabajar en ramas y abrir PR.
- Cada push a `main` y cada PR corre el workflow de CI
  (`.github/workflows/ci.yml`): `npm ci` + `npm run build`, y deja el `dist/`
  como artifact descargable del run.
- El deploy no está conectado todavía: falta definir el destino (bucket S3 +
  distribución de CloudFront, como beta) y cargar las credenciales como
  secrets del repo.

## Paridad con beta.delphi.one

- `astro.config.mjs`: `site: https://delphi.one`, `output: static`,
  `build.format: directory` (URLs con barra final, como `/faq/`) y sitemap.
- `src/layouts/Layout.astro`: el mismo bloque de `<head>` que beta (robots,
  canonical, Open Graph, Twitter card, JSON-LD de Organization, favicon y
  sitemap). Props: `title`, `description`, `image`, `noindex`, `bodyClass`.
- Beta tiene además `/creators/`, `/faq/`, `/investors/`, `/privacy/` y
  `/terms/`. Acá sólo está la home; cada página nueva va en `src/pages/` y
  usa el mismo `Layout`.

## Estructura

```
src/
  pages/index.astro          la página: importa el Layout y las 11 secciones
  layouts/Layout.astro       <head> (fuentes, meta) + <body class="has-hero-scroll">
  components/                una sección por archivo, en orden de aparición
    Header.astro
    HeroScroll.astro         hero scroll-driven (#hero-scroll)
    WhatIsDelphiOne.astro
    HowItWorks.astro         sticky reveal + videos de los 4 pasos
    Investors.astro
    Analysts.astro
    WhyDelphiOne.astro
    UseCases.astro
    Plans.astro              tres planes + aviso de beta
    FoundingAnalystCta.astro
    Footer.astro
  styles/
    index.css                único punto de entrada: fija el orden de cascada
    styles.css               tokens de diseño + estilos base
    hero-parallax.css        hero
    how-it-works-parallax.css  how it works
  scripts/
    hero-asset-rotator.js    el "<asset>" que rota en el H1 del hero
    hero-parallax.js         campo de estrellas + scroll → --p + header sólido
    how-it-works-sticky.js   paso activo + cross-fade del panel
    hiwp-video.js            play/pause de los videos según visibilidad
public/                      imágenes y videos servidos tal cual, sin recomprimir
.claude/launch.json          config para levantar el dev server desde Claude Code
```

Los scripts entran como `import` dentro de un `<script>` del componente que los
usa, así que Astro los bundlea y los sirve como módulo. Los CSS entran por un
solo `import` en el Layout (`styles/index.css`), que los encadena con `@import`
en el orden correcto: `hero-parallax.css` y `how-it-works-parallax.css` pisan
reglas de `styles.css` y ese orden **no se puede cambiar**.

## Qué NO está incluido

- **Las animaciones DOM del How it works.** Existe una rama del prototipo donde
  cada paso está replicado como DOM animado en vez de video; acá los cuatro
  pasos usan el `.mp4` con su `.jpg` de póster, que es lo que se ve hoy en el
  prototipo.
- **La sección "A portfolio dashboard / but only of what matters"**
  (`#other-features`). Se sacó también su CSS (`.portfolio-dashboard`,
  `.portfolio-grid`, `.portfolio-card`) de `styles/styles.css`.

## Pendientes conocidos

1. **Assets hotlinkeados a producción.** Estos siguen apuntando a
   `https://delphi.one/...` y no están en `public/`: el fondo del hero
   (`images/hero.avif`, en un `style=` inline de `HeroScroll.astro`), los
   avatares `user-1..6.avif`, los íconos de `images/icons/` y el logo del
   footer. Conviene bajarlos a `public/` antes de publicar en otro dominio.
2. **Fuentes desde el CDN de Google.** Montserrat y Material Symbols se cargan
   con `<link>`. Self-hostearlas (`@fontsource-variable/montserrat`) saca dos
   round-trips, pero **hay que verificar el render**: la landing se ajustó al
   píxel contra el Figma y las métricas de Montserrat son sensibles al peso.
3. **Imágenes sin optimizar por Astro.** Están en `public/` con los bytes
   originales, a propósito, para no tocar la fidelidad. Si querés que Astro
   genere AVIF/WebP responsive, moverlas a `src/assets/` y usar
   `astro:assets`; las tres grandes de features (`delphi-one-investor.jpg` y
   compañía) son las que más pesan.
4. **Videos: ~7 MB** en total (`how-it-works-step-1..4.mp4`). Son el grueso del
   peso de la página. Sirviéndolos desde un CDN con `preload="metadata"` (ya
   está puesto) el impacto en el first load es bajo, pero vale tenerlo en el
   radar.
5. **Open Graph.** Usa la imagen de producción
   (`https://delphi.one/og_2026_v2.png`), igual que beta.
6. **`site` en `astro.config.mjs`** está en `https://delphi.one`: cambiarlo si
   se publica en otro dominio.

## Diferencia de comportamiento vs. el prototipo

Los `<script>` bundleados por Astro son módulos, así que corren **diferidos**
(después de parsear el HTML) en vez de en medio del parseo. En la práctica no
se nota: el estado inicial de las dos secciones scroll-driven es el que ya
está en el CSS.
