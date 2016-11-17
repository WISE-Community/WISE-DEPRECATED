'use strict';

class NotebookGradingController {

    constructor($rootScope,
                $scope,
                $state,
                ConfigService,
                NotebookService,
                ProjectService,
                StudentStatusService,
                TeacherDataService,
                TeacherWebSocketService) {
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;

        this.teacherWorkgroupId = this.ConfigService.getWorkgroupId();

        // get the workgroups sorted alphabetically
        this.workgroups = this.ConfigService.getClassmateUserInfos();

        this.canViewStudentNames = true;
        this.canGradeStudentWork = true;

        // get the role of the teacher for the run e.g. 'owner', 'write', 'read'
        let role = this.ConfigService.getTeacherRole(this.teacherWorkgroupId);

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

        this.notebookItems;

        this.NotebookService.retrieveNotebookItems().then((notebookItems) => {
            this.notebookItems = notebookItems;
        });

        // save event when notebook grading view is displayed
        let context = "ClassroomMonitor", nodeId = null, componentId = null, componentType = null,
            category = "Navigation", event = "notebookViewDisplayed", data = {};
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }

    /**
     * Get the current period
     */
    getCurrentPeriod() {
        return this.TeacherDataService.getCurrentPeriod();
    };

    /**
     * Set the current period
     * @param period the period object
     */
    setCurrentPeriod(period) {
        this.TeacherDataService.setCurrentPeriod(period);
        this.$rootScope.$broadcast('periodChanged', {period: period});
    };

}

NotebookGradingController.$inject = [
    '$rootScope',
    '$scope',
    '$state',
    'ConfigService',
    'NotebookService',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService',
    'TeacherWebSocketService'
];

export default NotebookGradingController;
