import eslintJs from '@eslint/js';
import eslintPluginPrettier from 'eslint-plugin-prettier';
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
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslintJs.configs.recommended.rules,
      ...typescriptEslintPlugin.configs.recommended.rules,
      '@typescript-eslint/no-namespace': 'off',
      'no-alert': 'warn',
      'no-console': ['warn', { 'allow': ['debug', 'warn', 'error'] }],
      'no-redeclare': 'off',
      'prefer-arrow-callback': 'warn',
      'prettier/prettier': 'warn'
    }
  },
  eslintConfigPrettier
];
