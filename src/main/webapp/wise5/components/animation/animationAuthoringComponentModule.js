'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _animationService = require('./animationService');

var _animationService2 = _interopRequireDefault(_animationService);

var _animationController = require('./animationController');

var _animationController2 = _interopRequireDefault(_animationController);

var _animationAuthoringController = require('./animationAuthoringController');

var _animationAuthoringController2 = _interopRequireDefault(_animationAuthoringController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var animationAuthoringComponentModule = angular.module('animationAuthoringComponentModule', ['pascalprecht.translate']).service(_animationService2.default.name, _animationService2.default).controller(_animationController2.default.name, _animationController2.default).controller(_animationAuthoringController2.default.name, _animationAuthoringController2.default).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
  $translatePartialLoaderProvider.addPart('components/animation/i18n');
}]);
exports.default = animationAuthoringComponentModule;
//# sourceMappingURL=animationAuthoringComponentModule.js.map
