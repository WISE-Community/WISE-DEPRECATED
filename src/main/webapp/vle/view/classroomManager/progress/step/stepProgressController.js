angular.module('StepProgressView', [
	'ui.router'
])

.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {
	
}])

.controller('StepProgressController', ['StudentStatusService', 'ProjectService', function(StudentStatusService, ProjectService) {
	this.title = 'Step Progress';
	
	
}]);