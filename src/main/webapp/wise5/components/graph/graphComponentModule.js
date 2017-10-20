'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _graphService = require('./graphService');

var _graphService2 = _interopRequireDefault(_graphService);

var _graphController = require('./graphController');

var _graphController2 = _interopRequireDefault(_graphController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var graphComponentModule = angular.module('graphComponentModule', ['pascalprecht.translate']).service(_graphService2.default.name, _graphService2.default).controller(_graphController2.default.name, _graphController2.default).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
  $translatePartialLoaderProvider.addPart('components/graph/i18n');
}]);

exports.default = graphComponentModule;
//# sourceMappingURL=graphComponentModule.js.map
