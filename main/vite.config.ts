import type { UserConfig } from 'vite';
import * as path from 'node:path';

export default {
  resolve: {
    alias: {
      '@main': path.resolve(__dirname, 'src/main'),
      '@lib': path.resolve(__dirname, 'src/lib')
    }
  },
  build: {
    outDir: 'build'
  },
  base: './'
} satisfies UserConfig;
