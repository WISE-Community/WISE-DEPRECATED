'use strict';

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

angular.element(document).ready(function () {
    angular.bootstrap(document, [_main2.default.name], { strictDi: true });
});
//# sourceMappingURL=bootstrap.js.map