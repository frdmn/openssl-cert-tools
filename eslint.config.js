'use strict';

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    },
    rules: {
      'comma-dangle': ['error', 'never'],
      'eol-last': 'error',
      'indent': ['error', 2, { SwitchCase: 1 }],
      'no-var': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-const': 'error',
      'quotes': ['error', 'single']
    }
  },
  {
    ignores: ['node_modules/']
  }
];
