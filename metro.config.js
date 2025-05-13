const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

// Customize transformer settings
defaultConfig.transformer = {
  ...defaultConfig.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true, // Enable lazy loading for better performance
    },
  }),
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

// Customize resolver settings
defaultConfig.resolver = {
  ...defaultConfig.resolver,
  assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== "svg"),
  sourceExts: [...defaultConfig.resolver.sourceExts, "js", "jsx", "ts", "tsx", "json", "svg"],
};

module.exports = mergeConfig(defaultConfig, {});
