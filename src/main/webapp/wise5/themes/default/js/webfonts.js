'use strict';

var _webfontloader = require('webfontloader');

var _webfontloader2 = _interopRequireDefault(_webfontloader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_webfontloader2.default.load({
  fontinactive: function fontinactive(family, fvd) {
    switch (family) {
      case 'Roboto':
        _webfontloader2.default.load({
          custom: {
            families: ['Roboto:300,400,500,700,400italic'],
            urls: ['wise5/style/fonts/roboto/roboto.css']
          }
        });
        break;
      case 'Material Icons':
        _webfontloader2.default.load({
          custom: {
            families: ['Material Icons'],
            urls: ['wise5/style/fonts/material-icons/material-icons.css']
          }
        });
        break;
    }
  },
  google: {
    families: ['Roboto:300,400,500,700,400italic', 'Material Icons']
  }
});
//# sourceMappingURL=webfonts.js.map
