import { defineConfig } from 'eslint-define-config';

export default defineConfig({
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    // Override Airbnb rules for shared code if needed
  },
});
