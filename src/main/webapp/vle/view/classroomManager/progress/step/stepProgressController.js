angular.module('StepProgressView', [
	'ui.router'
])

.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {
	
}])

.controller('StepProgressController', ['$state', 'StudentStatusService', 'ProjectService', 'ProjectMetadataService', function($state, StudentStatusService, ProjectService, ProjectMetadataService) {
	this.title = 'Step Progress';
	
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
}]);