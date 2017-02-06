'use strict';

import NavItemController from './themeComponents/navItem/navItemController';
import StepToolsCtrl from './themeComponents/stepTools/stepToolsController';
import NodeStatusIconCtrl from './themeComponents/nodeStatusIcon/nodeStatusIconController';
import NotebookMenuCtrl from './themeComponents/notebookMenu/notebookMenuController';
import NotebookToolsCtrl from './themeComponents/notebookTools/notebookToolsController';

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

const NotebookMenu = {
    bindings: {
        nodeId: '<',
        viewMode: '@',
        notebookFilter: '<'
    },
    template: '<ng-include src="notebookMenuCtrl.getTemplateUrl()"></ng-include>',
    controller: 'NotebookMenuCtrl as notebookMenuCtrl'
}

const NotebookTools = {
    bindings: {
        notebookFilter: '<'
    },
    template: '<ng-include src="notebookToolsCtrl.getTemplateUrl()"></ng-include>',
    controller: 'NotebookToolsCtrl as notebookToolsCtrl'
}

let ThemeComponents = angular.module('theme.components', []);

ThemeComponents.controller(NavItemController.name, NavItemController)
               .controller(StepToolsCtrl.name, StepToolsCtrl)
               .controller(NodeStatusIconCtrl.name, NodeStatusIconCtrl)
               .controller(NotebookMenuCtrl.name, NotebookMenuCtrl)
               .controller(NotebookToolsCtrl.name, NotebookToolsCtrl)
               .component('navItem', NavItem)
               .component('nodeStatusIcon', NodeStatusIcon)
               .component('stepTools', StepTools)
               .component('notebookMenu', NotebookMenu)
               .component('notebookTools', NotebookTools);

export default ThemeComponents;
