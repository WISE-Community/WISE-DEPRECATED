'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookGradingController = function () {
    function NotebookGradingController($rootScope, $scope, $state, ConfigService, NotebookService, ProjectService, StudentStatusService, TeacherDataService, TeacherWebSocketService) {
        _classCallCheck(this, NotebookGradingController);

        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;

        this.themePath = this.ProjectService.getThemePath();

        this.teacherWorkgroupId = this.ConfigService.getWorkgroupId();

        // get the workgroups sorted alphabetically
        this.workgroups = this.ConfigService.getClassmateUserInfos();

        this.noteFilter = "note";
        this.reportFilter = "report";

        this.showAllNotes = false;
        this.showAllReports = false;
        this.showNoteForWorkgroup = {};
        this.showReportForWorkgroup = {};
        for (var i = 0; i < this.workgroups.length; i++) {
            var workgroup = this.workgroups[i];
            this.showNoteForWorkgroup[workgroup.workgroupId] = false;
            this.showReportForWorkgroup[workgroup.workgroupId] = false;
        }

        this.canViewStudentNames = true;
        this.canGradeStudentWork = true;

        // get the role of the teacher for the run e.g. 'owner', 'write', 'read'
        var role = this.ConfigService.getTeacherRole(this.teacherWorkgroupId);

        if (role === 'owner') {
            // the teacher is the owner of the run and has full access
            this.canViewStudentNames = true;
            this.canGradeStudentWork = true;
        } else if (role === 'write') {
            // the teacher is a shared teacher that can grade the student work
            this.canViewStudentNames = true;
            this.canGradeStudentWork = true;
        } else if (role === 'read') {
            // the teacher is a shared teacher that can only view the student work
            this.canViewStudentNames = false;
            this.canGradeStudentWork = false;
        }

        this.periods = this.ConfigService.getPeriods();

        // set the current period if it hasn't been set yet
        if (this.getCurrentPeriod() == null) {
            if (this.periods != null && this.periods.length > 0) {
                // set it to the all periods option
                this.setCurrentPeriod(this.periods[0]);
            }
        }

        // save event when notebook grading view is displayed
        var context = "ClassroomMonitor",
            nodeId = null,
            componentId = null,
            componentType = null,
            category = "Navigation",
            event = "notebookViewDisplayed",
            data = {};
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }

    _createClass(NotebookGradingController, [{
        key: "toggleDisplayNoteForWorkgroup",
        value: function toggleDisplayNoteForWorkgroup(workgroupId) {
            this.showNoteForWorkgroup[workgroupId] = !this.showNoteForWorkgroup[workgroupId];
        }
    }, {
        key: "toggleDisplayReportForWorkgroup",
        value: function toggleDisplayReportForWorkgroup(workgroupId) {
            this.showReportForWorkgroup[workgroupId] = !this.showReportForWorkgroup[workgroupId];
        }
    }, {
        key: "toggleDisplayAllNotes",
        value: function toggleDisplayAllNotes() {
            this.showAllNotes = !this.showAllNotes;

            for (var workgroupId in this.showNoteForWorkgroup) {
                this.showNoteForWorkgroup[workgroupId] = this.showAllNotes;
            }
        }
    }, {
        key: "toggleDisplayAllReports",
        value: function toggleDisplayAllReports() {
            this.showAllReports = !this.showAllReports;

            for (var workgroupId in this.showReportForWorkgroup) {
                this.showReportForWorkgroup[workgroupId] = this.showAllReports;
            }
        }

        /**
         * Handle request to view notes for the specified workgroup
         * @param workgroupId
         */

    }, {
        key: "viewNotes",
        value: function viewNotes(workgroupId) {
            alert(workgroupId);
        }

        /**
         * Handle request to view report for the specified workgroup
         * @param workgroupId
         */

    }, {
        key: "viewReport",
        value: function viewReport(workgroupId) {
            alert(workgroupId);
        }

        /**
         * Get the current period
         */

    }, {
        key: "getCurrentPeriod",
        value: function getCurrentPeriod() {
            return this.TeacherDataService.getCurrentPeriod();
        }
    }, {
        key: "setCurrentPeriod",


        /**
         * Set the current period
         * @param period the period object
         */
        value: function setCurrentPeriod(period) {
            this.TeacherDataService.setCurrentPeriod(period);
            this.$rootScope.$broadcast('periodChanged', { period: period });
        }
    }]);

    return NotebookGradingController;
}();

NotebookGradingController.$inject = ['$rootScope', '$scope', '$state', 'ConfigService', 'NotebookService', 'ProjectService', 'StudentStatusService', 'TeacherDataService', 'TeacherWebSocketService'];

exports.default = NotebookGradingController;
//# sourceMappingURL=notebookGradingController.js.map