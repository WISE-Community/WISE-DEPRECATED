var classroomManagerApp = angular.module('classroomManagerApp', [
   'ui.router',
   'AnnotationService',
   'ConfigService',
   'ProjectService',
   'StepProgressView',
   'StudentProgressView',
   'StudentStatusService',
   'StudentWorkService',
   'UserAndClassInfoService'
]);


classroomManagerApp.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {
	$urlRouterProvider.otherwise('/studentProgress');

	$stateProvider
		.state('root', {
			url: '',
			abstract: true,
			template: '<ui-view/>',
			resolve: {
				config: function(ConfigService) {
					return ConfigService.retrieveConfig();
				},
				project: function(ProjectService, config) {
					return ProjectService.retrieveProject();
				},
				studentStatuses: function(StudentStatusService, config) {
					return StudentStatusService.retrieveStudentStatuses();
				},
				userAndClassInfo: function(UserAndClassInfoService, config) {
					var update = true;
					return UserAndClassInfoService.retrieveUserAndClassInfo(update);
				},
				annotations: function(AnnotationService, config) {
					return AnnotationService.retrieveAnnotations();
				}
			}
		})
		.state('studentProgress', {
			parent: 'root',
			url: '/studentProgress',
			templateUrl: 'progress/student/studentProgress.html',
			controller: 'StudentProgressController',
			controllerAs: 'studentProgress'
		})
		.state('stepProgress', {
			parent: 'root',
			url: '/stepProgress',
			templateUrl: 'progress/step/stepProgress.html',
			controller: 'StepProgressController',
			controllerAs: 'stepProgress'
		})
		.state('studentGrading', {
			url: '/studentGrading',
			templateUrl: 'grading/student/studentGrading.html'
		})
		.state('stepGrading', {
			url: '/stepGrading',
			templateUrl: 'grading/step/stepGrading.html'
		})
}]);

