const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ローカルネイティブモジュールを Metro に認識させる
config.watchFolders = [
  path.resolve(__dirname, 'modules'),
];

module.exports = config;
