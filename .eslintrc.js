module.exports = {
  'extends': [
    'airbnb-base',
    'plugin:promise/recommended'
  ],
  'parserOptions': {
    'ecmaVersion': 9,
    'ecmaFeatures': {
      'jsx': false
    },
    'sourceType': 'module'
  },
  'env': {
    'es6': true,
    'node': true,
    'jest': true
  },
  'plugins': [
    'import',
    'node',
    'promise'
  ],
  'rules': {
    'no-console': 'off',
    'arrow-body-style': 'off',
    'no-unused-vars': 'warn',
    'space-before-function-paren': 'off',
    'prefer-rest-params': 'off',
    'import/first': 'off',
    'quotes': 'off',
    'import/extensions': 'off',
    'arrow-parens': 'off',
    'comma-dangle': [
      'error',
      'only-multiline'
    ],
    'complexity': 'off',
    'func-names': 'off',
    'global-require': 'off',
    'handle-callback-err': [
      'error',
      '^(err|error)$'
    ],
    'import/no-unresolved': [
      'warn',
      {
        'caseSensitive': true,
        'commonjs': true,
        'ignore': ['^[^.]']
      }
    ],
    'class-methods-use-this': 'off',
    'import/prefer-default-export': 'off',
    'linebreak-style': 'off',
    'no-catch-shadow': 'error',
    'no-continue': 'off',
    'no-div-regex': 'warn',
    'no-else-return': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-shadow': 'off',
    'no-multi-assign': 'off',
    'no-underscore-dangle': 'off',
    'node/no-deprecated-api': 'error',
    'node/process-exit-as-throw': 'error',
    'object-curly-spacing': 'off',
    'operator-linebreak': [
      'error',
      'after',
      {
        'overrides': {
          ':': 'before',
          '?': 'before'
        }
      }
    ],
    'prefer-arrow-callback': 'off',
    'prefer-destructuring': 'off',
    'prefer-template': 'off',
    'quote-props': [
      1,
      'as-needed',
      {
        'unnecessary': true
      }
    ],
    'semi': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'promise/always-return': 'off',
  },
  'globals': {
    'window': true,
    'document': true,
    'App': true,
    'Page': true,
    'Component': true,
    'Behavior': true,
    'wx': true,
    'getCurrentPages': true,
  }
}
