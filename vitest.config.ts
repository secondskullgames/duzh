import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['json', 'text-summary', 'lcov', 'clover'],
      include: ['src/lib/**/*.ts', 'src/main/**/*.ts'],
      thresholds: {
        statements: 17.0,
        branches: 46.0,
        functions: 13.0,
        lines: 17.0
      }
    },
    alias: {
      '@data': path.resolve(__dirname, './data'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@main': path.resolve(__dirname, './src/main'),
      '@models': path.resolve(__dirname, './src/models'),
      '@test': path.resolve(__dirname, './src/test')
    }
  }
});
