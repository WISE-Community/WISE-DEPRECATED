'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _periodSelectController = require('./classroomMonitorComponents/periodSelect/periodSelectController');

var _periodSelectController2 = _interopRequireDefault(_periodSelectController);

var _navItemController = require('./classroomMonitorComponents/navItem/navItemController');

var _navItemController2 = _interopRequireDefault(_navItemController);

var _stepToolsController = require('./classroomMonitorComponents/stepTools/stepToolsController');

var _stepToolsController2 = _interopRequireDefault(_stepToolsController);

var _workgroupsOnNodeController = require('./classroomMonitorComponents/workgroupsOnNode/workgroupsOnNodeController');

var _workgroupsOnNodeController2 = _interopRequireDefault(_workgroupsOnNodeController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PeriodSelect = {
    templateUrl: 'wise5/classroomMonitor/classroomMonitorComponents/periodSelect/periodSelect.html',
    controller: 'PeriodSelectController'
};

var NavItem = {
    bindings: {
        nodeId: '<',
        showPosition: '<',
        type: '<',
        isPlanningNode: '<'
    },
    templateUrl: 'wise5/classroomMonitor/classroomMonitorComponents/navItem/navItem.html',
    controller: 'NavItemController'
};

var StepTools = {
    bindings: {
        showPosition: '<'
    },
    templateUrl: 'wise5/classroomMonitor/classroomMonitorComponents/stepTools/stepTools.html',
    controller: 'StepToolsCtrl'
};

var WorkgroupsOnNode = {
    bindings: {
        nodeTitle: '<',
        workgroups: '<',
        online: '<'
    },
    templateUrl: 'wise5/classroomMonitor/classroomMonitorComponents/workgroupsOnNode/workgroupsOnNode.html',
    controller: 'WorkgroupsOnNodeController'
};

var ClassroomMonitorComponents = angular.module('classroomMonitor.components', []);

ClassroomMonitorComponents.controller(_periodSelectController2.default.name, _periodSelectController2.default).component('periodSelect', PeriodSelect).controller(_navItemController2.default.name, _navItemController2.default).component('navItem', NavItem).controller(_stepToolsController2.default.name, _stepToolsController2.default).component('stepTools', StepTools).controller(_workgroupsOnNodeController2.default.name, _workgroupsOnNodeController2.default).component('workgroupsOnNode', WorkgroupsOnNode);

exports.default = ClassroomMonitorComponents;
//# sourceMappingURL=classroomMonitorComponents.js.map