import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.acupressured.com',
  trailingSlash: 'always',
  build: {
    // Inline the small global stylesheet to remove the render-blocking CSS request.
    inlineStylesheets: 'always',
  },
  integrations: [sitemap({
    lastmod: new Date(),
    changefreq: 'weekly',
    priority: 0.7,
    serialize: (item) => {
      if (item.url === 'https://www.acupressured.com') {
        item.priority = 1.0;
        item.changefreq = 'daily';
      }
      return item;
    }
  })],
  vite: {
    plugins: [tailwindcss()],
  },
});
