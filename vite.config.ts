import type { UserConfig } from 'vite';
import path from 'node:path';

export default {
  resolve: {
    alias: {
      '@data': path.resolve(__dirname, 'data'),
      '@main': path.resolve(__dirname, 'src/main'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@models': path.resolve(__dirname, 'src/models'),
      '@png': path.resolve(__dirname, 'png')
    }
  },
  build: {
    outDir: 'build'
  }
} satisfies UserConfig;
