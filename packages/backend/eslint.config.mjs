import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['build/**', 'node_modules/**', 'coverage/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { prettier: eslintPluginPrettier },
    rules: {
      'prettier/prettier': 'warn',
      // This codebase leans on `any` at a lot of ORM/DTO boundaries; treat the
      // whole "unsafe when the type is any" family as advisory, matching the
      // no-explicit-any: off call below, rather than hard errors nothing can
      // realistically clear in one pass.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
    },
  },
  eslintConfigPrettier,
);
