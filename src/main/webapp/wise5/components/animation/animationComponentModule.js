'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _animationService = require('./animationService');

var _animationService2 = _interopRequireDefault(_animationService);

var _animationController = require('./animationController');

var _animationController2 = _interopRequireDefault(_animationController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var animationComponentModule = angular.module('animationComponentModule', ['pascalprecht.translate']).service(_animationService2.default.name, _animationService2.default).controller(_animationController2.default.name, _animationController2.default).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('components/animation/i18n');
}]);

exports.default = animationComponentModule;
//# sourceMappingURL=animationComponentModule.js.map