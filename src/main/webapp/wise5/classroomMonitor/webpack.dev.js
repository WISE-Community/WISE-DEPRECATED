const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    port: 8082,
    proxy: {
      '/achievement': 'http://localhost:8080',
      '/authorConfig': 'http://localhost:8080',
      '/config': 'http://localhost:8080',
      '/curriculum': 'http://localhost:8080',
      '/notification': 'http://localhost:8080',
      '/portal': 'http://localhost:8080',
      '/project': 'http://localhost:8080',
      '/runStatus': 'http://localhost:8080',
      '/session': 'http://localhost:8080',
      '/studentStatus': 'http://localhost:8080',
      '/teacher': 'http://localhost:8080',
      '/vle': 'http://localhost:8080',
      '/websocket': {
        target: 'http://localhost:8080',
        ws: true
      },
      '/wise5': 'http://localhost:8080'
    }
  }
});
