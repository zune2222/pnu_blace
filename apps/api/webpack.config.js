const path = require('path');

module.exports = {
  entry: './src/main.ts',
  target: 'node',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@pnu-blace/db': path.resolve(__dirname, '../../packages/db/src'),
      '@pnu-blace/types': path.resolve(__dirname, '../../packages/types/src'),
    },
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'module',
  },
  experiments: {
    outputModule: true,
  },
};