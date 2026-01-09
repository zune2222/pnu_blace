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
  // Point to local node_modules (EAS build compatibility)
  reactNativePath: path.resolve(__dirname, './node_modules/react-native'),
};
