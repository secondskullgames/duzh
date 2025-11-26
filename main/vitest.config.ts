import { ViteUserConfig } from 'vitest/config';
import * as path from 'node:path';

export default {
  test: {
    globals: true,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['json', 'text-summary', 'lcov', 'clover'],
      include: ['src/**/*.ts'],
      thresholds: {
        //statements: 7.0,
        //branches: 6.0,
        //functions: 7.0,
        //lines: 7.0
      }
    },
    alias: {
      '@main': path.resolve(__dirname, './src')
    }
  }
} satisfies ViteUserConfig;
