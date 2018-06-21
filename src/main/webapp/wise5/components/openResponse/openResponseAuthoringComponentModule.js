'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _openResponseService = require('./openResponseService');

var _openResponseService2 = _interopRequireDefault(_openResponseService);

var _openResponseController = require('./openResponseController');

var _openResponseController2 = _interopRequireDefault(_openResponseController);

var _openResponseAuthoringController = require('./openResponseAuthoringController');

var _openResponseAuthoringController2 = _interopRequireDefault(_openResponseAuthoringController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var openResponseAuthoringComponentModule = angular.module('openResponseAuthoringComponentModule', ['pascalprecht.translate']).service(_openResponseService2.default.name, _openResponseService2.default).controller(_openResponseController2.default.name, _openResponseController2.default).controller(_openResponseAuthoringController2.default.name, _openResponseAuthoringController2.default).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
  $translatePartialLoaderProvider.addPart('components/openResponse/i18n');
}]);

exports.default = openResponseAuthoringComponentModule;
//# sourceMappingURL=openResponseAuthoringComponentModule.js.map
