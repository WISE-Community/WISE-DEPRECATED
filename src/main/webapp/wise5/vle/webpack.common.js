const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: {
    app: './main.js'
  },
  plugins: [
    new webpack.IgnorePlugin(/^codemirror$/),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      fabric: ['fabric', 'fabric'],
      EventEmitter2: 'EventEmitter2',
      hopscotch: 'hopscotch',
      SockJS: 'sockjs-client',
      Stomp: ['@stomp/stompjs', 'Stomp'],
      summernote: 'summernote'
    })
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        loader: 'style!css!sass',
        exclude: [
          '/node_modules/'
        ]
      }
    ]
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  target: 'web',
  externals : [nodeExternals()],
  node: {
    fs: 'empty',
    tls: 'empty',
    'aws-sdk': 'empty',
    'child_process': 'empty',
    'net': 'empty'
  }
};
