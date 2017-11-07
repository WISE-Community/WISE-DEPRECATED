'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classResponse = require('./classResponse');

var _discussionService = require('./discussionService');

var _discussionService2 = _interopRequireDefault(_discussionService);

var _discussionController = require('./discussionController');

var _discussionController2 = _interopRequireDefault(_discussionController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var discussionComponentModule = angular.module('discussionComponentModule', ['pascalprecht.translate']).service(_discussionService2.default.name, _discussionService2.default).controller(_discussionController2.default.name, _discussionController2.default).controller(_classResponse.ClassResponseController.name, _classResponse.ClassResponseController).component('classResponse', _classResponse.ClassResponseComponentOptions).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
  $translatePartialLoaderProvider.addPart('components/discussion/i18n');
}]);

exports.default = discussionComponentModule;
//# sourceMappingURL=discussionComponentModule.js.map
