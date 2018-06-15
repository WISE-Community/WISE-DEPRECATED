'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _tableService = require('./tableService');

var _tableService2 = _interopRequireDefault(_tableService);

var _tableController = require('./tableController');

var _tableController2 = _interopRequireDefault(_tableController);

var _tableAuthoringController = require('./tableAuthoringController');

var _tableAuthoringController2 = _interopRequireDefault(_tableAuthoringController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var tableAuthoringComponentModule = angular.module('tableAuthoringComponentModule', ['pascalprecht.translate']).service(_tableService2.default.name, _tableService2.default).controller(_tableController2.default.name, _tableController2.default).controller(_tableAuthoringController2.default.name, _tableAuthoringController2.default).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
  $translatePartialLoaderProvider.addPart('components/table/i18n');
}]);

exports.default = tableAuthoringComponentModule;
//# sourceMappingURL=tableAuthoringComponentModule.js.map
