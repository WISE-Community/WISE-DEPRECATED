var classroomManagerApp = angular.module('classroomManagerApp', [
   'ui.router',
   'AnnotationService',
   'ConfigService',
   'ProjectService',
   'ProjectMetadataService',
   'StepGradingView',
   'StepProgressView',
   'StudentGradingView',
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
				projectMetadata: function(ProjectMetadataService, config) {
					return ProjectMetadataService.retrieveProjectMetadata();
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
			parent: 'root',
			url: '/studentGrading',
			params: {workgroupId:null},
			templateUrl: 'grading/student/studentGrading.html',
			controller: 'StudentGradingController',
			controllerAs: 'studentGrading',
			resolve: {
				studentWork: function(StudentWorkService, $stateParams) {
					var workgroupId = $stateParams.workgroupId;
					return StudentWorkService.retrieveStudentWorkForWorkgroupId(workgroupId);
				}
			}
		})
		.state('stepGrading', {
			parent: 'root',
			url: '/stepGrading',
			params: {nodeId:null},
			templateUrl: 'grading/step/stepGrading.html',
			controller: 'StepGradingController',
			controllerAs: 'stepGrading',
			resolve: {
				studentWork: function(StudentWorkService, $stateParams) {
					var nodeId = $stateParams.nodeId;
					return StudentWorkService.retrieveStudentWorkForNodeId(nodeId);
				}
			}
		})
}]);

