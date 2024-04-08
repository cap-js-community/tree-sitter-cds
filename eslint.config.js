'use strict';

const eslint_js = require('@eslint/js');

module.exports = [
  eslint_js.configs.recommended,
  {
    ignores: [
      'temp.js',
      'target/**/*',
      'build/**/*',
    ],
  },
  {
    files: [ '**/*.js' ],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
    },
  },
  {
    files: [ '**/*.mjs' ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  {
    files: [ '**/*.js', '**/*.mjs' ],
    languageOptions: {
      globals: {
        // node
        __dirname: 'readonly',
        process: 'readonly',
        console: 'readonly',
        // tree-sitter
        seq: 'readonly',
        choice: 'readonly',
        optional: 'readonly',
        repeat: 'readonly',
        repeat1: 'readonly',
        field: 'readonly',
        prec: 'readonly',
        token: 'readonly',
        alias: 'readonly',
        grammar: 'readonly',
      },
    },
    rules: {
      'max-len': 'off',
      'indent': 'off',
      'camelcase': 'off',
      'no-empty': 'off',
      'comma-dangle': [ 'error', 'always-multiline' ],
      'no-unused-vars': 'off',
    },
  },
];
