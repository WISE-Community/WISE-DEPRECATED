var studentGradingView = angular.module('studentGradingView', [
	'ui.router'
]);

studentGradingView.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {
	
}]);

studentGradingView.controller('StudentGradingController', [function() {
	this.title = 'Student Grading';
}]);