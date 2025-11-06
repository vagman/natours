import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import eslintPluginImport from 'eslint-plugin-import';

export default [
  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.vscode/**',
      'public/js/bundle.js',
    ],
  },

  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      // Remove 'prettier/prettier'
      'spaced-comment': 'off',
      'no-console': 'warn',
      'consistent-return': 'off',
      'func-names': 'off',
      'object-shorthand': 'off',
      'no-process-exit': 'off',
      'no-param-reassign': 'off',
      'no-return-await': 'off',
      'no-underscore-dangle': 'off',
      'class-methods-use-this': 'off',
      'prefer-destructuring': ['error', { object: true, array: false }],
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'import/extensions': ['error', 'ignorePackages', { js: 'always' }],
    },
  },
  // Disable rules that conflict with Prettier
  prettier,
];
