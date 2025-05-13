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
    "no-console": ["warn", {allow: ["warn", "error"]}],
    // "@typescript-eslint/no-unused-vars": ["warn", {argsIgnorePattern: "^_"}],
    // "react/prop-types": "off",
    "react-native/no-inline-styles": "warn",
    "react/react-in-jsx-scope": "off",
    // "@typescript-eslint/explicit-function-return-type": "off",
    // "@typescript-eslint/explicit-module-boundary-types": "off",
    // semi: ["error", "always"],
    // quotes: ["error", "double"],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    "react-native/react-native": true,
    es2021: true,
    node: true,
  },
  overrides: [
    {
      files: ["src/**/*.{ts,tsx}"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        // Si usas reglas que requieren información de tipos, necesitas el siguiente extend
        // "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      parserOptions: {
        project: "./tsconfig.json",
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: "module", // Si tus archivos TS son módulos ES, configúralo
      },
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-unused-vars": ["warn", {argsIgnorePattern: "^_"}],
        "react/prop-types": "off",
      },
      exclude: [
        "node_modules",
        "babel.config.js", // Excluir archivos de configuración JS
        "metro.config.js",
        ".eslintrc.js",
        "jest.config.js",
        "tsconfig.json",
        // Añade aquí cualquier otro archivo o directorio que TS no deba procesar
        "**/*.test.ts", // Puedes excluir archivos de test si quieres
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "dist", // Excluir directorios de salida
      ],
    },
    // Opcional: Override para archivos JS/JSX si tienes reglas específicas para ellos
    // {
    //   files: ["**/*.{js,jsx}"],
    //   // Puedes poner extends o reglas específicas aquí si difieren de la base
    // },
    {
      files: [".eslintrc.js", "babel.config.js", "metro.config.js", "jest.config.js"],
      parserOptions: {
        // Asegúrate de que no tengan parserOptions.project
      },
      env: {
        node: true,
        commonjs: true,
      },
      rules: {
        "@typescript-eslint/no-var-requires": "off", // Permite require() en archivos CommonJS
        "react/react-in-jsx-scope": "off",
        "react-native/no-inline-styles": "off",
      },
    },
  ],
};
