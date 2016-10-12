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
};

DashboardController.$inject = ['$rootScope', '$scope', '$state', 'ConfigService', 'ProjectService', 'StudentStatusService', 'TeacherDataService', 'TeacherWebSocketService'];

exports.default = DashboardController;
//# sourceMappingURL=dashboardController.js.map