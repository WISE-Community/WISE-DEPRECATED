'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _summaryService = _interopRequireDefault(require("./summaryService"));

var _summaryController = _interopRequireDefault(require("./summaryController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var summaryComponentModule = angular.module('summaryComponentModule', ['pascalprecht.translate']).service(_summaryService["default"].name, _summaryService["default"]).controller(_summaryController["default"].name, _summaryController["default"]).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
  $translatePartialLoaderProvider.addPart('components/summary/i18n');
}]);
var _default = summaryComponentModule;
exports["default"] = _default;
//# sourceMappingURL=summaryComponentModule.js.map
