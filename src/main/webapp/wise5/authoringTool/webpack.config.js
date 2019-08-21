'use strict';
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

var ENV = process.env.npm_lifecycle_event;
var isTest = ENV === 'test' || ENV === 'test-watch';
var isProd = ENV === 'build';

module.exports = {
  mode: 'development',
  entry: './main.js',
  devtool: 'inline-source-map',
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      fabric: ['fabric', 'fabric'],
      hopscotch: 'hopscotch',
      summernote: 'summernote'
    })
  ],
  devServer: {
    proxy: {
      '/config': 'http://localhost:8080',
      '/authorConfig': 'http://localhost:8080',
      '/teacher': 'http://localhost:8080',
      '/project': 'http://localhost:8080',
      '/wise5': 'http://localhost:8080',
      '/curriculum': 'http://localhost:8080',
      '/sockjs-node': {
        target: 'http://localhost:8080/websocket',
        ws: true
      }
    }
  },
  output: {
    // Absolute output directory
    path: path.resolve(__dirname, 'build'),

    // Output path from the view of the page
    // Uses webpack-dev-server in development
    publicPath: '/',

    // Filename for entry points
    // Only adds hash in build mode
    filename: isProd ? '[name].[hash].js' : 'bundle.js',

    // Filename for non-entry points
    // Only adds hash in build mode
    chunkFilename: isProd ? '[name].[hash].js' : 'bundle.js'
  },
  target: 'web',
  externals : [nodeExternals()],
  node: {
    fs: 'empty',
    tls: 'empty',
    'aws-sdk': 'empty',
    'child_process': 'empty',
    'net': 'empty'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        loader: 'style!css!sass',
        exclude: [
          '/node_modules/'
        ]
      },
      {
        test: /\.es6$/,
        loader: 'babel-loader',
        exclude: [
          '/node_modules/'
        ]
      }
    ]
  }
}
