'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _navItemController = require('./themeComponents/navItem/navItemController');

var _navItemController2 = _interopRequireDefault(_navItemController);

var _stepToolsController = require('./themeComponents/stepTools/stepToolsController');

var _stepToolsController2 = _interopRequireDefault(_stepToolsController);

var _nodeStatusIconController = require('./themeComponents/nodeStatusIcon/nodeStatusIconController');

var _nodeStatusIconController2 = _interopRequireDefault(_nodeStatusIconController);

var _projectStatusController = require('./themeComponents/projectStatus/projectStatusController');

var _projectStatusController2 = _interopRequireDefault(_projectStatusController);

var _notebookMenuController = require('./themeComponents/notebookMenu/notebookMenuController');

var _notebookMenuController2 = _interopRequireDefault(_notebookMenuController);

var _notebookToolsController = require('./themeComponents/notebookTools/notebookToolsController');

var _notebookToolsController2 = _interopRequireDefault(_notebookToolsController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var NotebookMenu = {
    bindings: {
        nodeId: '<',
        viewMode: '@',
        notebookFilter: '<'
    },
    template: '<ng-include src="notebookMenuCtrl.getTemplateUrl()"></ng-include>',
    controller: 'NotebookMenuCtrl as notebookMenuCtrl'
};

var NotebookTools = {
    bindings: {
        notebookFilter: '<'
    },
    template: '<ng-include src="notebookToolsCtrl.getTemplateUrl()"></ng-include>',
    controller: 'NotebookToolsCtrl as notebookToolsCtrl'
};

var ThemeComponents = angular.module('theme.components', []);

ThemeComponents.controller(_navItemController2.default.name, _navItemController2.default).controller(_stepToolsController2.default.name, _stepToolsController2.default).controller(_nodeStatusIconController2.default.name, _nodeStatusIconController2.default).controller(_notebookMenuController2.default.name, _notebookMenuController2.default).controller(_notebookToolsController2.default.name, _notebookToolsController2.default).component('navItem', NavItem).component('nodeStatusIcon', NodeStatusIcon).component('stepTools', StepTools).component('notebookMenu', NotebookMenu).component('notebookTools', NotebookTools);

exports.default = ThemeComponents;
//# sourceMappingURL=themeComponents.js.map