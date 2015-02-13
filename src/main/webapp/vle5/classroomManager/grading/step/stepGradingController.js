define(['app'], function(app) {

	app
	.$controllerProvider
	.register('StepGradingController', function($state, $stateParams, UserAndClassInfoService, ProjectService, StudentWorkService) {
		this.title = 'Step Grading';
		
		this.nodeId = $stateParams.nodeId;
		
		this.classmateUserInfos = UserAndClassInfoService.getClassmateUserInfos();
		
		this.getNodeNumberAndTitle = function(nodeId) {
			return ProjectService.getNodeNumberAndTitle(nodeId);
		};
		
		this.getNodeVisitsForNodeIdAndWorkgroupId = function(nodeId, workgroupId) {
			return StudentWorkService.getNodeVisitsForNodeIdAndWorkgroupId(nodeId, workgroupId);
		};
	});
	
});