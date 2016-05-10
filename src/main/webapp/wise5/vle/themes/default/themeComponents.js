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

var _notebookToolbarController = require('./themeComponents/notebookToolbar/notebookToolbarController');

var _notebookToolbarController2 = _interopRequireDefault(_notebookToolbarController);

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

var NotebookToolbar = {
    bindings: {
        nodeId: '<'
    },
    template: '<ng-include src="notebookToolbarCtrl.getTemplateUrl()"></ng-include>',
    controller: 'NotebookToolbarCtrl as notebookToolbarCtrl'
};

var ThemeComponents = angular.module('theme.components', []);

ThemeComponents.controller(_navItemController2.default.name, _navItemController2.default).controller(_stepToolsController2.default.name, _stepToolsController2.default).controller(_nodeStatusIconController2.default.name, _nodeStatusIconController2.default).controller(_notebookToolbarController2.default.name, _notebookToolbarController2.default).component('navItem', NavItem).component('nodeStatusIcon', NodeStatusIcon).component('stepTools', StepTools).component('notebookToolbar', NotebookToolbar);

exports.default = ThemeComponents;
//# sourceMappingURL=themeComponents.js.map