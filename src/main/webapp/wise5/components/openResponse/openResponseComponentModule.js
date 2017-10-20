'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _openResponseService = require('./openResponseService');

var _openResponseService2 = _interopRequireDefault(_openResponseService);

var _openResponseController = require('./openResponseController');

var _openResponseController2 = _interopRequireDefault(_openResponseController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var openResponseComponentModule = angular.module('openResponseComponentModule', ['pascalprecht.translate']).service(_openResponseService2.default.name, _openResponseService2.default).controller(_openResponseController2.default.name, _openResponseController2.default).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
  $translatePartialLoaderProvider.addPart('components/openResponse/i18n');
}]);

exports.default = openResponseComponentModule;
//# sourceMappingURL=openResponseComponentModule.js.map
