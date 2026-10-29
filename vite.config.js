import { fileURLToPath } from 'node:url';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';

// Build frame for the kb export: .svx pages through mdsvex, the `runbook` layout, every page prerendered.
export default defineConfig({
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx'],
      preprocess: [
        vitePreprocess(),
        mdsvex({
          extensions: ['.svx'],
          layout: { runbook: fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url)) },
          layoutPropForwarding: 'runes',
        }),
      ],
      adapter: adapter({ pages: 'build', assets: 'build' }),
      prerender: { entries: ['*'] },
    }),
  ],
});
