'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataExportController = function DataExportController($rootScope, $scope, $state, ConfigService, ProjectService, StudentStatusService, TeacherDataService, TeacherWebSocketService) {
    _classCallCheck(this, DataExportController);

    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$state = $state;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.StudentStatusService = StudentStatusService;
    this.TeacherDataService = TeacherDataService;
    this.TeacherWebSocketService = TeacherWebSocketService;

    // save event when data export view is displayed
    var context = "ClassroomMonitor",
        nodeId = null,
        componentId = null,
        componentType = null,
        category = "Navigation",
        event = "dataExportViewDisplayed",
        data = {};
    this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
};

DataExportController.$inject = ['$rootScope', '$scope', '$state', 'ConfigService', 'ProjectService', 'StudentStatusService', 'TeacherDataService', 'TeacherWebSocketService'];

exports.default = DataExportController;
//# sourceMappingURL=dataExportController.js.map