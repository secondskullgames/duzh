import { ViteUserConfig } from 'vitest/config';

export default {
  test: {
    include: ['**/*.test.ts'],
    globals: true
  }
} satisfies ViteUserConfig;
