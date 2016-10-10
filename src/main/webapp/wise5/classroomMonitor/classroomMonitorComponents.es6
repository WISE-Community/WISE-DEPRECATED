'use strict';

import PeriodSelectController from './classroomMonitorComponents/periodSelect/periodSelectController';
import NavItemController from './classroomMonitorComponents/navItem/navItemController';
import WorkgroupsOnNodeController from './classroomMonitorComponents/workgroupsOnNode/workgroupsOnNodeController';

const PeriodSelect = {
    templateUrl: 'wise5/classroomMonitor/classroomMonitorComponents/periodSelect/periodSelect.html',
    controller: 'PeriodSelectController'
};

const NavItem = {
    bindings: {
        nodeId: '<',
        showPosition: '<',
        type: '<',
        isPlanningNode: '<'
    },
    templateUrl: 'wise5/classroomMonitor/classroomMonitorComponents/navItem/navItem.html',
    controller: 'NavItemController'
};

const WorkgroupsOnNode = {
    bindings: {
        nodeTitle: '<',
        workgroups: '<',
        online: '<'
    },
    templateUrl: 'wise5/classroomMonitor/classroomMonitorComponents/workgroupsOnNode/workgroupsOnNode.html',
    controller: 'WorkgroupsOnNodeController'
};

let ClassroomMonitorComponents = angular.module('classroomMonitor.components', []);

ClassroomMonitorComponents
    .controller(PeriodSelectController.name, PeriodSelectController)
    .component('periodSelect', PeriodSelect)
    .controller(NavItemController.name, NavItemController)
    .component('navItem', NavItem)
    .controller(WorkgroupsOnNodeController.name, WorkgroupsOnNodeController)
    .component('workgroupsOnNode', WorkgroupsOnNode);

export default ClassroomMonitorComponents;
