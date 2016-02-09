class StudentProgressController {
    constructor($rootScope,
                $state,
                ConfigService,
                ProjectService,
                StudentStatusService,
                TeacherDataService,
                TeacherWebSocketService) {
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;

        this.title = 'Grade By Student ';

        this.workgroups = this.ConfigService.getClassmateUserInfos();

        this.studentStatuses = this.StudentStatusService.getStudentStatuses();

        this.maxScore = this.ProjectService.getMaxScore();

        this.periods = [];

        // create an option for all periods
        var allPeriodOption = {
            periodId: -1,
            periodName: 'All'
        };

        this.periods.push(allPeriodOption);

        this.periods = this.periods.concat(this.ConfigService.getPeriods());

        // set the current period if it hasn't been set yet
        if (this.getCurrentPeriod() == null) {
            if (this.periods != null && this.periods.length > 0) {
                // set it to the all periods option
                this.setCurrentPeriod(this.periods[0]);
            }
        }

        this.studentsOnline = this.TeacherWebSocketService.getStudentsOnline();

        /**
         * Listen for the studentsOnlineReceived event
         */
        $rootScope.$on('studentsOnlineReceived', angular.bind(this, function (event, args) {
            this.studentsOnline = args.studentsOnline;
        }));

    }

    getNewNodeVisits() {
        return this.StudentStatusService.getNewNodeVisits();
    };

    getCurrentNodeForWorkgroupId(workgroupId) {
        return this.StudentStatusService.getCurrentNodeTitleForWorkgroupId(workgroupId);
    };

    getStudentProjectCompletion(workgroupId) {
        return this.StudentStatusService.getStudentProjectCompletion(workgroupId);
    };

    studentRowClicked(workgroup) {
        var workgroupId = workgroup.workgroupId;

        this.$state.go('root.studentGrading', {workgroupId: workgroupId});
    };

    isWorkgroupOnline(workgroupId) {
        return this.studentsOnline.indexOf(workgroupId) != -1;
    };

    /**
     * Set the current period
     * @param period the period object
     */
    setCurrentPeriod(period) {
        this.TeacherDataService.setCurrentPeriod(period);
    };

    /**
     * Get the current period
     */
    getCurrentPeriod() {
        return this.TeacherDataService.getCurrentPeriod();
    };

    getStudentTotalScore(workgroupId) {
        return this.TeacherDataService.getTotalScoreByWorkgroupId(workgroupId);
    }
}

StudentProgressController.$inject = [
    '$rootScope',
    '$state',
    'ConfigService',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService',
    'TeacherWebSocketService'
];

export default StudentProgressController;