import type { UserConfig } from 'vite';
import * as path from 'node:path';

export default {
  resolve: {
    alias: {
      '@main': path.resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'build'
  },
  base: './'
} satisfies UserConfig;
