define(['app'], function(app) {

    app
    .$controllerProvider
    .register('StudentProgressController', ['$rootScope',
                                            '$state',
                                            'ConfigService',
                                            'StudentStatusService',
                                            'TeacherDataService',
                                            'TeacherWebSocketService',
    function ($rootScope,
              $state,
              ConfigService,
              StudentStatusService,
              TeacherDataService,
              TeacherWebSocketService) {
        this.title = 'Grade By Student';

        this.workgroups = ConfigService.getClassmateUserInfos();

        this.studentStatuses = StudentStatusService.getStudentStatuses();

        this.periods = [];

        this.getNewNodeVisits = function() {
            return StudentStatusService.getNewNodeVisits();
        };

        this.getCurrentNodeForWorkgroupId = function(workgroupId) {
            return StudentStatusService.getCurrentNodeTitleForWorkgroupId(workgroupId);
        };

        this.getStudentProjectCompletion = function(workgroupId) {
            return StudentStatusService.getStudentProjectCompletion(workgroupId);
        };

        this.studentRowClicked = function(workgroup) {
            var workgroupId = workgroup.workgroupId;

            $state.go('root.studentGrading', {workgroupId: workgroupId});
        };

        this.isWorkgroupOnline = function(workgroupId) {
            return this.studentsOnline.indexOf(workgroupId) != -1;
        };

        /**
         * Set the current period
         * @param period the period object
         */
        this.setCurrentPeriod = function(period) {
            TeacherDataService.setCurrentPeriod(period);
        };

        /**
         * Get the current period
         */
        this.getCurrentPeriod = function() {
            return TeacherDataService.getCurrentPeriod();
        };

        /**
         * Initialize the periods
         */
        this.initializePeriods = function() {

            // create an option for all periods
            var allPeriodOption = {
                periodId: -1,
                periodName: 'All'
            };

            this.periods.push(allPeriodOption);

            this.periods = this.periods.concat(ConfigService.getPeriods());

            // set the current period if it hasn't been set yet
            if (this.getCurrentPeriod() == null) {
                if (this.periods != null && this.periods.length > 0) {
                    // set it to the all periods option
                    this.setCurrentPeriod(this.periods[0]);
                }
            }
        };

        this.initializePeriods();

        this.studentsOnline = TeacherWebSocketService.getStudentsOnline();

        /**
         * Listen for the studentsOnlineReceived event
         */
        $rootScope.$on('studentsOnlineReceived', angular.bind(this, function (event, args) {
            this.studentsOnline = args.studentsOnline;
        }));
    }])
});