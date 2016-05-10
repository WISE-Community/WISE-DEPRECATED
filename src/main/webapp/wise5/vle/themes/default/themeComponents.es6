'use strict';

import NavItemController from './themeComponents/navItem/navItemController';
import StepToolsCtrl from './themeComponents/stepTools/stepToolsController';
import NodeStatusIconCtrl from './themeComponents/nodeStatusIcon/nodeStatusIconController';
import ProjectStatusController from './themeComponents/projectStatus/projectStatusController';
import NotebookToolbarCtrl from './themeComponents/notebookToolbar/notebookToolbarController';

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

const NotebookToolbar = {
    bindings: {
        nodeId: '<'
    },
    template: '<ng-include src="notebookToolbarCtrl.getTemplateUrl()"></ng-include>',
    controller: 'NotebookToolbarCtrl as notebookToolbarCtrl'
}

let ThemeComponents = angular.module('theme.components', []);

ThemeComponents.controller(NavItemController.name, NavItemController)
               .controller(StepToolsCtrl.name, StepToolsCtrl)
               .controller(NodeStatusIconCtrl.name, NodeStatusIconCtrl)
               .controller(NotebookToolbarCtrl.name, NotebookToolbarCtrl)
               .component('navItem', NavItem)
               .component('nodeStatusIcon', NodeStatusIcon)
               .component('stepTools', StepTools)
               .component('notebookToolbar', NotebookToolbar);

export default ThemeComponents;
