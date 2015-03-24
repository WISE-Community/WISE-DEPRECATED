define([
	'angular',
    'angularUIRouter',
    'annotationService',
    'configService',
    'projectMetadataService',
    'projectService',
    'studentStatusService',
    'studentWorkService',
    'userAndClassInfoService'
], function(angular) {
	
	var app = angular.module('app', [
	   'ui.router',
	   'AnnotationService',
	   'ConfigService',
	   'ProjectMetadataService',
	   'ProjectService',
	   'StudentStatusService',
	   'StudentWorkService',
	   'UserAndClassInfoService'
	]);
	
	app.init = function() {
		angular.bootstrap(document, ['app']);
	};

	app.loadController = function(controllerName) {
		return ['$q', function($q) {
			var deferred = $q.defer();
			require([controllerName], function() {
				deferred.resolve();
			});
			return deferred.promise;
		}];
	};

	app.config(['$urlRouterProvider', '$stateProvider', '$controllerProvider', function($urlRouterProvider, $stateProvider, $controllerProvider) {
		$urlRouterProvider.otherwise('/studentProgress');
	
		app.$controllerProvider = $controllerProvider;
		
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
				controllerAs: 'studentProgress',
				resolve: {
					loadController: app.loadController('studentProgressController')
				}
			})
			.state('stepProgress', {
				parent: 'root',
				url: '/stepProgress',
				templateUrl: 'progress/step/stepProgress.html',
				controller: 'StepProgressController',
				controllerAs: 'stepProgress',
				resolve: {
					loadController: app.loadController('stepProgressController')
				}
			})
			.state('studentGrading', {
				parent: 'root',
				url: '/studentGrading',
				params: {workgroupId:null},
				templateUrl: 'grading/student/studentGrading.html',
				controller: 'StudentGradingController',
				controllerAs: 'studentGrading',
				resolve: {
					loadController: app.loadController('studentGradingController'),
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
					loadController: app.loadController('stepGradingController'),
					studentWork: function(StudentWorkService, $stateParams) {
						var nodeId = $stateParams.nodeId;
						return StudentWorkService.retrieveStudentWorkForNodeId(nodeId);
					}
				}
			})
	}]);
	
	return app;
});