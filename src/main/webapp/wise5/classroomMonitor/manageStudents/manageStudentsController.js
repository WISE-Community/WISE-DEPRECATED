'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _milestonesController = require("../milestones/milestonesController");

var _milestonesController2 = _interopRequireDefault(_milestonesController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ManageStudentsController = function ManageStudentsController($injector, $filter, $mdDialog, $rootScope, $scope, $state, AchievementService, ConfigService, ProjectService, StudentStatusService, TeacherDataService, TeacherWebSocketService, UtilService, moment) {
    _classCallCheck(this, ManageStudentsController);

    this.runId = ConfigService.getRunId();
    this.iframeSrc = "/wise/teacher/management/viewmystudents?runId=" + this.runId;
};

ManageStudentsController.$inject = ['$injector', '$filter', '$mdDialog', '$rootScope', '$scope', '$state', 'AchievementService', 'ConfigService', 'ProjectService', 'StudentStatusService', 'TeacherDataService', 'TeacherWebSocketService', 'UtilService', 'moment'];

exports.default = ManageStudentsController;
//# sourceMappingURL=manageStudentsController.js.map
