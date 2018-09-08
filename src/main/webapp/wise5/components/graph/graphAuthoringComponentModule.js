'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _graphService = require('./graphService');

var _graphService2 = _interopRequireDefault(_graphService);

var _graphController = require('./graphController');

var _graphController2 = _interopRequireDefault(_graphController);

var _graphAuthoringController = require('./graphAuthoringController');

var _graphAuthoringController2 = _interopRequireDefault(_graphAuthoringController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var graphAuthoringComponentModule = angular.module('graphAuthoringComponentModule', ['pascalprecht.translate']).service(_graphService2.default.name, _graphService2.default).controller(_graphController2.default.name, _graphController2.default).controller(_graphAuthoringController2.default.name, _graphAuthoringController2.default).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
  $translatePartialLoaderProvider.addPart('components/graph/i18n');
}]);

exports.default = graphAuthoringComponentModule;
//# sourceMappingURL=graphAuthoringComponentModule.js.map
