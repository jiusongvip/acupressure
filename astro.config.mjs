import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.acupressureguide.com',
  trailingSlash: 'never',
  integrations: [sitemap({
    lastmod: new Date(),
    changefreq: 'weekly',
    priority: 0.7,
    serialize: (item) => {
      if (item.url === 'https://www.acupressureguide.com') {
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
