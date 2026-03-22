const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Drizzle ORM: .sql マイグレーションファイルをソースとして扱う（babel-plugin-inline-importで文字列化）
config.resolver.sourceExts.push('sql');

module.exports = withNativewind(config, { inlineRem: 16 });
