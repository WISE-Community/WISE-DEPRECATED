'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var NavItem = {
    bindings: {
        nodeId: '=',
        showPosition: '=',
        type: '='
    },
    template: '<ng-include src="navitemCtrl.getTemplateUrl()"></ng-include>',
    controller: 'NavItemController as navitemCtrl'
};

var NodeStatusIcon = {
    bindings: {
        nodeId: '=',
        customClass: '='
    },
    template: '<ng-include src="nodeStatusIconCtrl.getTemplateUrl()"></ng-include>',
    controller: 'NodeStatusIconCtrl as nodeStatusIconCtrl'
};

var StepTools = {
    bindings: {
        nodeId: '=',
        showPosition: '='
    },
    template: '<ng-include src="stepToolsCtrl.getTemplateUrl()"></ng-include>',
    controller: 'StepToolsCtrl as stepToolsCtrl'
};

var ThemeComponents = angular.module('theme.components', []);

ThemeComponents.component('navItem', NavItem);
ThemeComponents.component('nodeStatusIcon', NodeStatusIcon);
ThemeComponents.component('stepTools', StepTools);

exports.default = ThemeComponents;
//# sourceMappingURL=themeComponents.js.map