angular.module('StepProgressView', [
	'ui.router'
])

.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {
	
}])

.controller('StepProgressController', ['StudentStatusService', 'ProjectService', function(StudentStatusService, ProjectService) {
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
}]);