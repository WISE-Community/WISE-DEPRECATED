angular.module('StepGradingView', [
	'ui.router'
])

.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {
	
}])

.controller('StepGradingController', ['$state', '$stateParams', 'UserAndClassInfoService', 'ProjectService', 'StudentWorkService', function($state, $stateParams, UserAndClassInfoService, ProjectService, StudentWorkService) {
	this.title = 'Step Grading';
	
	this.nodeId = $stateParams.nodeId;
	
	this.classmateUserInfos = UserAndClassInfoService.getClassmateUserInfos();
	
	this.getNodeNumberAndTitle = function(nodeId) {
		return ProjectService.getNodeNumberAndTitle(nodeId);
	};
	
	this.getNodeVisitsForNodeIdAndWorkgroupId = function(nodeId, workgroupId) {
		return StudentWorkService.getNodeVisitsForNodeIdAndWorkgroupId(nodeId, workgroupId);
	};
}]);