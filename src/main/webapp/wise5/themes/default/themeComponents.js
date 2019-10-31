'use strict';

import HelpIcon from './themeComponents/helpIcon/helpIcon';
import NavItemController from './themeComponents/navItem/navItemController';
import NodeIcon from './themeComponents/nodeIcon/nodeIcon';
import StepToolsCtrl from './themeComponents/stepTools/stepToolsController';
import NodeStatusIconCtrl from './themeComponents/nodeStatusIcon/nodeStatusIconController';

const NavItem = {
  bindings: {
    nodeId: '<',
    showPosition: '<',
    type: '<'
  },
  template: '<ng-include src="::navitemCtrl.getTemplateUrl()"></ng-include>',
  controller: 'NavItemController as navitemCtrl'
}

const NodeStatusIcon = {
  bindings: {
    nodeId: '<',
    customClass: '<'
  },
  template: '<ng-include src="::nodeStatusIconCtrl.getTemplateUrl()"></ng-include>',
  controller: 'NodeStatusIconCtrl as nodeStatusIconCtrl'
}

const StepTools = {
  bindings: {
    showPosition: '<'
  },
  template: '<ng-include src="::stepToolsCtrl.getTemplateUrl()"></ng-include>',
  controller: 'StepToolsCtrl as stepToolsCtrl'
}

let ThemeComponents = angular.module('theme.components', []);

ThemeComponents.controller('NavItemController', NavItemController)
    .controller('StepToolsCtrl', StepToolsCtrl)
    .controller('NodeStatusIconCtrl', NodeStatusIconCtrl)
    .component('helpIcon', HelpIcon)
    .component('navItem', NavItem)
    .component('nodeIcon', NodeIcon)
    .component('nodeStatusIcon', NodeStatusIcon)
    .component('stepTools', StepTools);

export default ThemeComponents;
