'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _studentAssetController = require('./studentAssetController');

var _studentAssetController2 = _interopRequireDefault(_studentAssetController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
}).controller('StudentAssetController', _studentAssetController2.default);

exports.default = studentAssetModule;
//# sourceMappingURL=studentAsset.js.map
