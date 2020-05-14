const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  plugins: [
    new MomentLocalesPlugin({
      localesToKeep: ['zh-cn', 'zh-tw']
    }),
    new webpack.IgnorePlugin(/^codemirror$/),
  ]
};
