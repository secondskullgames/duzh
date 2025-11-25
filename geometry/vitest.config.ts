import { ViteUserConfig } from 'vitest/config';
import path from 'node:path';

export default {
  test: {
    globals: true,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['json', 'text-summary', 'lcov', 'clover'],
      include: ['src/lib/**/*.ts', 'src/main/**/*.ts'],
      thresholds: {
        //statements: 7.0,
        //branches: 6.0,
        //functions: 7.0,
        //lines: 7.0
      }
    },
    alias: {
      '@data': path.resolve(__dirname, './data'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@main': path.resolve(__dirname, './src/main'),
      '@test': path.resolve(__dirname, './src/test')
    }
  }
} satisfies ViteUserConfig;
