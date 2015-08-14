define(['app'], function(app) {

    app
    .$controllerProvider
    .register('StudentProgressController', ['$rootScope', '$state', 'ConfigService', 'StudentStatusService', 'TeacherWebSocketService',
    function ($rootScope, $state, ConfigService, StudentStatusService, TeacherWebSocketService) {
        this.title = 'Student Progress!!!';

        this.workgroups = ConfigService.getClassmateUserInfos();

        this.studentStatuses = StudentStatusService.getStudentStatuses();

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

        this.studentsOnline = TeacherWebSocketService.getStudentsOnline();

        /**
         * Listen for the studentsOnlineReceived event
         */
        $rootScope.$on('studentsOnlineReceived', angular.bind(this, function (event, args) {
            this.studentsOnline = args.studentsOnline;
        }));
    }])
});