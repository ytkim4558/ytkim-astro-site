import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://ytkim4558.pages.dev',
  integrations: [mdx(), react()],
  output: 'static',
});
