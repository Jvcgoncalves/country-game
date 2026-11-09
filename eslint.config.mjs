import eslint from '@eslint/js';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

export default typescriptEslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    extends: [eslint.configs.recommended, ...typescriptEslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
);
