'use strict';

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

var _theme = require('./themes/default/theme3.js');

var _theme2 = _interopRequireDefault(_theme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

angular.element(document).ready(function () {
    angular.bootstrap(document, [_main2.default.name, _theme2.default.name], { strictDi: true });
});