import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.js'],
    include: [
      'tests/**/*.{test,spec}.{js,mjs,ts}',
      'src/**/*.{test,spec}.{js,mjs,ts}'
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js',
        '**/*.d.ts'
      ]
    },
    testTimeout: 10000, // Longer timeout for Three.js rendering tests
    pool: 'forks' // Use forks for better isolation with Three.js
  },
  resolve: {
    alias: {
      $lib: resolve('./src/lib'),
      '@': resolve('./src')
    }
  }
});