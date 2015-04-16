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
    
            $state.go('studentGrading', {workgroupId:workgroupId});
        };
        
        


		/*
		this.studentStatuses = StudentStatusService.getStudentStatuses();
		
		this.workgroups = UserAndClassInfoService.getClassmateUserInfos();
		
		this.annotations = AnnotationService.getAnnotations();
		
		this.getCurrentStepForWorkgroupId = function(workgroupId) {
			return StudentStatusService.getCurrentStepTitleForWorkgroupId(workgroupId);
		};
		
		this.getStudentProjectCompletion = function(workgroupId) {
			return StudentStatusService.getStudentProjectCompletion(workgroupId);
		};
		
		this.studentRowClicked = function(workgroup) {
			var workgroupId = workgroup.workgroupId;
	
			$state.go('studentGrading', {workgroupId:workgroupId});
		};
		*/
	}]);
	
});