const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    proxy: {
      '/achievement': 'http://localhost:8080',
      '/config': 'http://localhost:8080',
      '/curriculum': 'http://localhost:8080',
      '/notification': 'http://localhost:8080',
      '/runStatus': 'http://localhost:8080',
      '/student': 'http://localhost:8080',
      '/wise5': 'http://localhost:8080',
      '/websocket': {
        target: 'http://localhost:8080',
        ws: true
     },
    }
  }
});
