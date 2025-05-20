module.exports = {
  presets: ["module:@react-native/babel-preset"],
  env: {
    production: {
      plugins: ["react-native-paper/babel"],
    },
  },
  plugins: [
    [
      "module:react-native-dotenv",
      {
        moduleName: "react-native-dotenv",
        path: ".env",
        blocklist: null,
        allowlist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
    // 'import-glob-meta',
    "@babel/plugin-proposal-export-namespace-from",
    "react-native-reanimated/plugin",
    "babel-plugin-inline-import",
    [
      "module-resolver",
      {
        root: ["./src"],
        alias: {
          components: "./src/components",
          constants: "./src/constants",
          assets: "./src/assets",
          screens: "./src/screens",
          util: "./src/util",
          config: "./src/config",
          network: "./src/network",
        },
      },
    ],
  ],
};
