import eslintJs from '@eslint/js';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import typescriptEslintParser from '@typescript-eslint/parser';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import eslintPluginPreferArrow from 'eslint-plugin-prefer-arrow';
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
      'eslint-plugin-prefer-arrow': eslintPluginPreferArrow
    },
    rules: {
      ...eslintJs.configs.recommended.rules,
      ...typescriptEslintPlugin.configs.recommended.rules,
      ...eslintPluginPreferArrow.rules,
      '@typescript-eslint/no-namespace': 'off',
      'no-redeclare': 'off',
      'prettier/prettier': 'error'
    }
  },
  eslintConfigPrettier
];
