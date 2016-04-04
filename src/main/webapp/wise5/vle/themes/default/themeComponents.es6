'use strict';

import NavItemController from './themeComponents/navItem/navItemController';
import StepToolsCtrl from './themeComponents/stepTools/stepToolsController';
import NodeStatusIconCtrl from './themeComponents/nodeStatusIcon/nodeStatusIconController';
import ProjectStatusController from './themeComponents/projectStatus/projectStatusController';

const NavItem = {
    bindings: {
        nodeId: '<',
        showPosition: '<',
        type: '<'
    },
    template: '<ng-include src="navitemCtrl.getTemplateUrl()"></ng-include>',
    controller: 'NavItemController as navitemCtrl'
}

const NodeStatusIcon = {
    bindings: {
        nodeId: '<',
        customClass: '<'
    },
    template: '<ng-include src="nodeStatusIconCtrl.getTemplateUrl()"></ng-include>',
    controller: 'NodeStatusIconCtrl as nodeStatusIconCtrl'
}

const StepTools = {
    bindings: {
        showPosition: '<'
    },
    template: '<ng-include src="stepToolsCtrl.getTemplateUrl()"></ng-include>',
    controller: 'StepToolsCtrl as stepToolsCtrl'
}

let ThemeComponents = angular.module('theme.components', []);

ThemeComponents.controller(NavItemController.name, NavItemController)
               .controller(StepToolsCtrl.name, StepToolsCtrl)
               .controller(NodeStatusIconCtrl.name, NodeStatusIconCtrl)
               .component('navItem', NavItem)
               .component('nodeStatusIcon', NodeStatusIcon)
               .component('stepTools', StepTools);

export default ThemeComponents;
