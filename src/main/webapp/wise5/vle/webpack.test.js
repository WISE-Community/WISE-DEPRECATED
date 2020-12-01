const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  // entry: {
  //   app: './main.js'
  // },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    //new CleanWebpackPlugin(),
    new webpack.IgnorePlugin(/^codemirror$/),
    /*
    new HtmlWebpackPlugin({
      inject: false,
      base: {
        'href': '/',
        'target': '_blank'
      },
      title: 'WISE',
      template: require('html-webpack-template'),
      headHtmlSnippet:
          '<meta name="description" content="WISE Student Virtual Learning Environment (VLE)">' +
          '<meta name="viewport" content="width=device-width, initial-scale=1">' +
          '<link rel="apple-touch-icon" href="apple-touch-icon.png">',
      bodyHtmlSnippet: '<script>if (global === undefined) { var global = window; }</script><app></app><div ng-view><div ui-view></div></div>'
    }),
    */
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      fabric: ['fabric', 'fabric'],
      hopscotch: 'hopscotch',
      SockJS: 'sockjs-client',
      Stomp: ['@stomp/stompjs', 'Stomp']
    })
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        loader: 'style!css!sass',
        exclude: ['/node_modules/']
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  //target: 'web',
  //externals : [nodeExternals()],
  node: {
    fs: 'empty',
    tls: 'empty',
    'aws-sdk': 'empty',
    child_process: 'empty',
    net: 'empty'
  }
};
