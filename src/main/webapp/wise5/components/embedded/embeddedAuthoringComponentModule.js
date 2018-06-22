'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _embeddedService = require('./embeddedService');

var _embeddedService2 = _interopRequireDefault(_embeddedService);

var _embeddedController = require('./embeddedController');

var _embeddedController2 = _interopRequireDefault(_embeddedController);

var _embeddedAuthoringController = require('./embeddedAuthoringController');

var _embeddedAuthoringController2 = _interopRequireDefault(_embeddedAuthoringController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var embeddedAuthoringComponentModule = angular.module('embeddedAuthoringComponentModule', ['pascalprecht.translate']).service(_embeddedService2.default.name, _embeddedService2.default).controller(_embeddedController2.default.name, _embeddedController2.default).controller(_embeddedAuthoringController2.default.name, _embeddedAuthoringController2.default).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
  $translatePartialLoaderProvider.addPart('components/embedded/i18n');
}]);

exports.default = embeddedAuthoringComponentModule;
//# sourceMappingURL=embeddedAuthoringComponentModule.js.map
