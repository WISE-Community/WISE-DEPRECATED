define(['app'], function(app) {
	
	app
	.$controllerProvider
	.register('StudentGradingController', function($scope, $state, $stateParams, StudentWorkService, ProjectService, UserAndClassInfoService) {
		this.title = 'Student Grading';
	
		this.workgroupId = $stateParams.workgroupId;
		
		this.nodes = ProjectService.getSequenceAndStepNodesInTraversalOrder();
		
		this.getStudentNameForWorkgroupId = function(workgroupId) {
			return UserAndClassInfoService.getStudentNameForWorkgroupId(workgroupId);
		};
		
		this.getNodeNumberAndTitle = function(nodeId) {
			return ProjectService.getNodeNumberAndTitle(nodeId);
		};
		
		this.getNodeVisitsForWorkgroupIdAndNodeId = function(workgroupId, nodeId) {
			return StudentWorkService.getNodeVisitsForWorkgroupIdAndNodeId(workgroupId, nodeId)
		};
	});
	
});