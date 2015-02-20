define([
        'angular',
        'jquery',
        'angularUIRouter',
        'angularPostMessage',
        'configService',
        'projectService',
        'nodeApplicationService',
        'nodeService'
        ], function(angular, $) {

	var app = angular.module('app', [
	                                 'ui.router',
	                                 'ngPostMessage',
	                                 'ConfigService',
	                                 'ProjectService',
	                                 'NodeApplicationService',
	                                 'NodeService'
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
	
	app.config(['$urlRouterProvider', '$stateProvider', '$controllerProvider', 
	            function($urlRouterProvider, $stateProvider, $controllerProvider) {
		
		$urlRouterProvider.otherwise('/vle');
		
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
		            },
		            nodeApplication: function(NodeApplicationService, config) {
		                return NodeApplicationService.intializeNodeApplications();
		            }
		        }
		    })
            .state('vle', {
                parent: 'root',
                url: '/vle',
                templateUrl: 'vle5/student/vle.html',
                controller: 'VLEController',
                controllerAs: 'vle',
                resolve: {
                    loadController: app.loadController('vleController')
                }
            })
	}]);
	
	return app;
});