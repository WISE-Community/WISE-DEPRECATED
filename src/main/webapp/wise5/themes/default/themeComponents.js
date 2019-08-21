'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _helpIcon = _interopRequireDefault(require("./themeComponents/helpIcon/helpIcon"));

var _navItemController = _interopRequireDefault(require("./themeComponents/navItem/navItemController"));

var _nodeIcon = _interopRequireDefault(require("./themeComponents/nodeIcon/nodeIcon"));

var _stepToolsController = _interopRequireDefault(require("./themeComponents/stepTools/stepToolsController"));

var _nodeStatusIconController = _interopRequireDefault(require("./themeComponents/nodeStatusIcon/nodeStatusIconController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var NavItem = {
  bindings: {
    nodeId: '<',
    showPosition: '<',
    type: '<'
  },
  template: '<ng-include src="navitemCtrl.getTemplateUrl()"></ng-include>',
  controller: 'NavItemController as navitemCtrl'
};
var NodeStatusIcon = {
  bindings: {
    nodeId: '<',
    customClass: '<'
  },
  template: '<ng-include src="nodeStatusIconCtrl.getTemplateUrl()"></ng-include>',
  controller: 'NodeStatusIconCtrl as nodeStatusIconCtrl'
};
var StepTools = {
  bindings: {
    showPosition: '<'
  },
  template: '<ng-include src="stepToolsCtrl.getTemplateUrl()"></ng-include>',
  controller: 'StepToolsCtrl as stepToolsCtrl'
};
var ThemeComponents = angular.module('theme.components', []);
ThemeComponents.controller('NavItemController', _navItemController["default"]).controller('StepToolsCtrl', _stepToolsController["default"]).controller('NodeStatusIconCtrl', _nodeStatusIconController["default"]).component('helpIcon', _helpIcon["default"]).component('navItem', NavItem).component('nodeIcon', _nodeIcon["default"]).component('nodeStatusIcon', NodeStatusIcon).component('stepTools', StepTools);
var _default = ThemeComponents;
exports["default"] = _default;
//# sourceMappingURL=themeComponents.js.map
