// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Misma base que beta.delphi.one: Astro 5, salida 100% estática, sitemap
// generado en el build y URLs con barra final (/faq/, /terms/…).
export default defineConfig({
  // Lo usan el sitemap, el canonical y las URLs absolutas de OG.
  site: 'https://delphi.one',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    // Los CSS chicos se inlinean; el bundle grande queda como archivo.
    inlineStylesheets: 'auto',
  },
  integrations: [sitemap()],
  server: { port: 4321 },
});
