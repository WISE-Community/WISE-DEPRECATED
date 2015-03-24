define(['app'], function(app) {

	app
	.$controllerProvider
	.register('StepProgressController', function ($state, StudentStatusService, ProjectService, ProjectMetadataService, ConfigService) {
		this.title = 'Step Progress';
		
		var runId=ConfigService.getRunId();
		
		this.nodes = ProjectService.getSequenceAndStepNodesInTraversalOrder();
		
		this.getNodeNumberAndTitle = function(nodeId) {
			return ProjectService.getNodeNumberAndTitle(nodeId);
		};
		
		this.getNumberOfStudentsOnStep = function(nodeId) {
			return StudentStatusService.getNumberOfStudentsOnStep(nodeId);
		};
		
		this.getStepCompletion = function(nodeId) {
			return StudentStatusService.getStepCompletion(nodeId);
		}
		
		this.getMaxScore = function(nodeId) {
			return ProjectMetadataService.getMaxScore(nodeId);
		}
		
		this.stepRowClicked = function(node) {
			var nodeId = node.identifier;
	
			$state.go('stepGrading', {nodeId:nodeId});
		};
	});
	
});