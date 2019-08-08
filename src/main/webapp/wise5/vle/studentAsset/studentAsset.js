'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _studentAssetController = _interopRequireDefault(require("./studentAssetController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var studentAssetModule = angular.module('studentAsset', []).directive('studentassets', function () {
  return {
    scope: {
      filter: '=',
      templateUrl: '=',
      componentController: '='
    },
    template: '<ng-include src="studentAssetController.getTemplateUrl()"></ng-include>',
    controller: 'StudentAssetController',
    controllerAs: 'studentAssetController',
    bindToController: true
  };
}).controller('StudentAssetController', _studentAssetController["default"]);
var _default = studentAssetModule;
exports["default"] = _default;
//# sourceMappingURL=studentAsset.js.map
