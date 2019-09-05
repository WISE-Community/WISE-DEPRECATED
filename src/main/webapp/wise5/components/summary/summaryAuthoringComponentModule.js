'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _summaryService = _interopRequireDefault(require("./summaryService"));

var _summaryController = _interopRequireDefault(require("./summaryController"));

var _summaryAuthoringController = _interopRequireDefault(require("./summaryAuthoringController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var summaryAuthoringComponentModule = angular.module('summaryAuthoringComponentModule', ['pascalprecht.translate']).service(_summaryService["default"].name, _summaryService["default"]).controller(_summaryController["default"].name, _summaryController["default"]).controller(_summaryAuthoringController["default"].name, _summaryAuthoringController["default"]).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
  $translatePartialLoaderProvider.addPart('components/summary/i18n');
}]);
var _default = summaryAuthoringComponentModule;
exports["default"] = _default;
//# sourceMappingURL=summaryAuthoringComponentModule.js.map
