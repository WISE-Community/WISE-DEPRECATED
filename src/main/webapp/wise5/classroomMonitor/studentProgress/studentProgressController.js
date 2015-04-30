define(['app'], function(app) {

    app
    .$controllerProvider
    .register('StudentProgressController', ['$state', 'ConfigService', 'StudentStatusService', 
                                            function ($state, ConfigService, StudentStatusService) {
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
    
            $state.go('root.studentGrading', {workgroupId:workgroupId});
        };
    }]);
    
});