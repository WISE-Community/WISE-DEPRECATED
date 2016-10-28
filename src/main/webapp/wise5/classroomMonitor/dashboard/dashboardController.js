'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DashboardController = function DashboardController($rootScope, $scope, $state, ConfigService, ProjectService, StudentStatusService, TeacherDataService, TeacherWebSocketService) {
    _classCallCheck(this, DashboardController);

    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$state = $state;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.StudentStatusService = StudentStatusService;
    this.TeacherDataService = TeacherDataService;
    this.TeacherWebSocketService = TeacherWebSocketService;

    // save event when dashboard view is displayed
    var context = "ClassroomMonitor",
        nodeId = null,
        componentId = null,
        componentType = null,
        category = "Navigation",
        event = "dashboardViewDisplayed",
        data = {};
    this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
};

DashboardController.$inject = ['$rootScope', '$scope', '$state', 'ConfigService', 'ProjectService', 'StudentStatusService', 'TeacherDataService', 'TeacherWebSocketService'];

exports.default = DashboardController;
//# sourceMappingURL=dashboardController.js.map