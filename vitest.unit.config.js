import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/unit/**/*.test.js'],
  },
  resolve: {
    alias: {
      $lib: resolve('./src/lib'),
      '@': resolve('./src')
    }
  }
});