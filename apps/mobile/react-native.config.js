const path = require('path');

module.exports = {
  project: {
    ios: {
      sourceDir: './ios',
    },
    android: {
      sourceDir: './android',
    },
  },
  dependencies: {},
  // Monorepo configuration - point to root node_modules
  reactNativePath: path.resolve(__dirname, '../../node_modules/react-native'),
};
