module.exports = {
  root: true,
  extends: [
    "@react-native",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-native", "prettier"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    project: "./tsconfig.json",
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        semi: true,
        trailingComma: "es5",
        singleQuote: false,
        jsxSingleQuote: false,
        printWidth: 100,
        tabWidth: 2,
        endOfLine: "auto",
      },
    ],
    "react/react-in-jsx-scope": "off",
    "react-native/no-inline-styles": "warn",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "react/prop-types": "off",
    semi: ["error", "always"],
    quotes: ["error", "double"],
    "object-curly-spacing": ["error", "always"],
    "array-bracket-spacing": ["error", "never"],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    "react-native/react-native": true,
  },
};
