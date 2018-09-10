'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _matchService = require('./matchService');

var _matchService2 = _interopRequireDefault(_matchService);

var _matchController = require('./matchController');

var _matchController2 = _interopRequireDefault(_matchController);

var _matchAuthoringController = require('./matchAuthoringController');

var _matchAuthoringController2 = _interopRequireDefault(_matchAuthoringController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var matchAuthoringComponentModule = angular.module('matchAuthoringComponentModule', ['pascalprecht.translate']).service(_matchService2.default.name, _matchService2.default).controller(_matchController2.default.name, _matchController2.default).controller(_matchAuthoringController2.default.name, _matchAuthoringController2.default).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
  $translatePartialLoaderProvider.addPart('components/match/i18n');
}]);

exports.default = matchAuthoringComponentModule;
//# sourceMappingURL=matchAuthoringComponentModule.js.map
