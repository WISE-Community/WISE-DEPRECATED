var stepGradingView = angular.module('stepGradingView', [
	'ui.router'
]);

stepGradingView.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {
	
}]);

stepGradingView.controller('StepGradingController', [function() {
	this.title = 'Step Grading';
}]);