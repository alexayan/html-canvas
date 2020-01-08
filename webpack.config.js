/* eslint-disable no-undef */
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '../html-canvas.js',
    library: 'htmlcanvas',
    libraryTarget: 'umd'
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'src')
        ],
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};
