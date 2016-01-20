'use strict';

var _webfontloader = require('webfontloader');

var _webfontloader2 = _interopRequireDefault(_webfontloader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// WebFont Loader must be initialized
_webfontloader2.default.load({
    fontinactive: function fontinactive(family, fvd) {
        switch (family) {
            case 'RobotoDraft':
                _webfontloader2.default.load({
                    custom: {
                        families: ['RobotoDraft:300,400,500,700,i4'],
                        urls: ['wise5/style/fonts/localFonts.css']
                    }
                });
                break;
            case 'Material Icons':
                _webfontloader2.default.load({
                    custom: {
                        families: ['Material Icons'],
                        urls: ['wise5/style/fonts/localIconFonts.css']
                    }
                });
                break;
        }
    },
    google: {
        families: ['RobotoDraft:300,400,500,700,i4', 'Material Icons']
    }
});
//# sourceMappingURL=webfonts.js.map