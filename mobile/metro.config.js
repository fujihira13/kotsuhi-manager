const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Drizzle ORM: .sql マイグレーションファイルをアセットとして扱う
config.resolver.assetExts.push('sql');

module.exports = withNativewind(config, { inlineRem: 16 });
