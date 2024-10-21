module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    // Consistent with Prettier settings
    semi: ['error', 'never'], // No semicolons
    quotes: ['error', 'single'], // Use single quotes
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'never',
        exports: 'never',
        functions: 'never',
      },
    ],
    'space-before-function-paren': ['error', 'never'], // No space before function parentheses
    'object-curly-spacing': ['error', 'always'], // Spaces inside curly braces
    'import/order': ['error', { groups: ['builtin', 'external', 'internal'] }],
    indent: ['error', 2], // 2 spaces for indentation
    'max-len': ['error', { code: 122 }], // Max line length of 100
    'jsx-quotes': ['error', 'prefer-sigle'], // Enforce single quotes in JSX
    'react/jsx-closing-bracket-location': [1, 'line-aligned'], // Place closing bracket of multiline JSX element correctly
    'react/jsx-first-prop-new-line': ['error', 'multiline'], // Enforce new line for first prop in JSX if it is multiline
    'react/jsx-max-props-per-line': ['error', { maximum: 1, when: 'multiline' }], // Limit props per line in JSX
  },
}
