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

ThemeComponents.component('navItem', NavItem);
ThemeComponents.component('nodeStatusIcon', NodeStatusIcon);
ThemeComponents.component('stepTools', StepTools);

export default ThemeComponents;
