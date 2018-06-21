'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _labelService = require('./labelService');

var _labelService2 = _interopRequireDefault(_labelService);

var _labelController = require('./labelController');

var _labelController2 = _interopRequireDefault(_labelController);

var _labelAuthoringController = require('./labelAuthoringController');

var _labelAuthoringController2 = _interopRequireDefault(_labelAuthoringController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var labelAuthoringComponentModule = angular.module('labelAuthoringComponentModule', ['pascalprecht.translate']).service(_labelService2.default.name, _labelService2.default).controller(_labelController2.default.name, _labelController2.default).controller(_labelAuthoringController2.default.name, _labelAuthoringController2.default).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
  $translatePartialLoaderProvider.addPart('components/label/i18n');
}]);

exports.default = labelAuthoringComponentModule;
//# sourceMappingURL=labelAuthoringComponentModule.js.map
