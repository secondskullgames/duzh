import eslintJs from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintConfigPrettier from 'eslint-config-prettier';
import typescriptEslintParser from '@typescript-eslint/parser';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

export default [
  {
    files: ['src/**/*.ts', 'scripts/**/*.ts'],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: './tsconfig.json'
      },
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      prettier: eslintPluginPrettierRecommended
    },
    rules: {
      ...eslintJs.configs.recommended.rules,
      ...typescriptEslintPlugin.configs.recommended.rules,
      '@typescript-eslint/no-namespace': 'off',
      'no-redeclare': 'off'
    }
  },
  eslintConfigPrettier
];
