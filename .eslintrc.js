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
    'plugin:vue/vue3-recommended',
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
  plugins: ['react', '@typescript-eslint', 'vue'],
  rules: {
    // Consistent with Prettier settings
    semi: ['error', 'never'], // No semicolons
    quotes: ['error', 'single'], // Use single quotes
    'comma-dangle': ['error', 'es5'], // Trailing commas as per ES5
    'space-before-function-paren': ['error', 'never'], // No space before function parentheses
    'object-curly-spacing': ['error', 'always'], // Spaces inside curly braces
    'import/order': ['error', { groups: ['builtin', 'external', 'internal'] }],
    indent: ['error', 2], // 2 spaces for indentation
    'max-len': ['error', { code: 100 }], // Max line length of 100
    'jsx-quotes': ['error', 'prefer-single'], // Enforce single quotes in JSX
    'react/jsx-closing-bracket-location': [1, 'line-aligned'], // Place closing bracket of multiline JSX element correctly
    'react/jsx-first-prop-new-line': ['error', 'multiline'], // Enforce new line for first prop in JSX if it is multiline
    'react/jsx-max-props-per-line': ['error', { maximum: 1, when: 'multiline' }], // Limit props per line in JSX
    'vue/html-indent': ['error', 2], // 2 spaces for indentation in Vue files
    'vue/max-attributes-per-line': ['error', { singleline: 1, multiline: 1 }], // Limit Vue attributes per line
  },
}
