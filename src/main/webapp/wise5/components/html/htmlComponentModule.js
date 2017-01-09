'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _htmlService = require('./htmlService');

var _htmlService2 = _interopRequireDefault(_htmlService);

var _htmlController = require('./htmlController');

var _htmlController2 = _interopRequireDefault(_htmlController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var htmlComponentModule = angular.module('htmlComponentModule', []).service(_htmlService2.default.name, _htmlService2.default).controller(_htmlController2.default.name, _htmlController2.default).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('components/html/i18n');
}]);

exports.default = htmlComponentModule;
//# sourceMappingURL=htmlComponentModule.js.map