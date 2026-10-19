const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const nativewindConfig = withNativewind(config, {
  typescriptEnvPath: "types/nativewind-env.d.ts",
});

const nativewindResolveRequest = nativewindConfig.resolver.resolveRequest;

// NativeWind's `globalClassNamePolyfill` rewrites every `react-native` import to
// its own subset shim (`react-native-css/components`). That shim omits many
// React Native exports (for example `AssetRegistry`), which breaks libraries
// such as expo-asset / expo-font / @react-native-vector-icons on native.
//
// Only apply the className polyfill to application code; dependencies in
// node_modules get the real `react-native` module.
nativewindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  const fromNodeModules = /[\\/]node_modules[\\/]/.test(
    context.originModulePath ?? "",
  );

  if (moduleName === "react-native" && fromNodeModules) {
    return context.resolveRequest(context, moduleName, platform);
  }

  return nativewindResolveRequest(context, moduleName, platform);
};

module.exports = nativewindConfig;
