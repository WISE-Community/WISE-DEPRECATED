'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _drawService = require('./drawService');

var _drawService2 = _interopRequireDefault(_drawService);

var _drawController = require('./drawController');

var _drawController2 = _interopRequireDefault(_drawController);

var _drawAuthoringController = require('./drawAuthoringController');

var _drawAuthoringController2 = _interopRequireDefault(_drawAuthoringController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var drawAuthoringComponentModule = angular.module('drawAuthoringComponentModule', ['pascalprecht.translate']).service(_drawService2.default.name, _drawService2.default).controller(_drawController2.default.name, _drawController2.default).controller(_drawAuthoringController2.default.name, _drawAuthoringController2.default).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
  $translatePartialLoaderProvider.addPart('components/draw/i18n');
}]);

exports.default = drawAuthoringComponentModule;
//# sourceMappingURL=drawAuthoringComponentModule.js.map
