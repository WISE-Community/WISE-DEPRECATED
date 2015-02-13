define([
        'angular',
        'angularUIRouter',
        'configService',
        'projectService'
        ], function(angular) {
	
	var app = angular.module('app', [
	                                 'ui.router',
	                                 'ConfigService',
	                                 'ProjectService'
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
		
		$urlRouterProvider.otherwise('/student');
		
		app.$controllerProvider = $controllerProvider;
		
		$stateProvider
		    .state('root', {
		        url: '',
		        abstract: true,
		        template: '<ui-view/>',
		        resolve: {
		            config: function(ConfigService) {
		                var configUrl = window.configUrl;
		                return ConfigService.retrieveConfig(configUrl);
		            },
		            project: function(ProjectService, config) {
		                return ProjectService.retrieveProject();
		            }
		        }
		    })
			.state('student', {
				url: '/student',
				parent: 'root',
				templateUrl: 'vle5/student/view.html',
				controller: 'StudentViewController',
				controllerAs: 'studentView',
				resolve: {
					loadController: app.loadController('studentViewController')
				}
            });
	}]);
	
	return app;
	
});