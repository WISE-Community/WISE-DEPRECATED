define([
        'angular',
        'jquery',
        'angularUIRouter',
        'angularPostMessage',
        'configService',
        'projectService',
        'nodeApplicationService',
        'nodeService',
        'openResponseService',
        'studentDataService'
        ], function(angular, $) {

	var app = angular.module('app', [
	                                 'ui.router',
	                                 'ngPostMessage',
	                                 'ConfigService',
	                                 'ProjectService',
	                                 'NodeApplicationService',
	                                 'NodeService',
	                                 'OpenResponseService',
	                                 'StudentDataService'
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
		
		$urlRouterProvider.otherwise('/vle/node0');
		
		app.$controllerProvider = $controllerProvider;
		
		$stateProvider
    		.state('root', {
                url: '',
                abstract: true,
                templateUrl: 'vle5/student/vle.html',
                //template: '<ui-view />',
                controller: 'VLEController',
                controllerAs: 'vleController',
                resolve: {
                    loadController: app.loadController('vleController'),
                    config: function(ConfigService) {
                        var configUrl = window.configUrl;
                        
                        return ConfigService.retrieveConfig(configUrl);
                    },
                    project: function(ProjectService, config) {
                        return ProjectService.retrieveProject();
                    },
                    studentData: function(StudentDataService, config, project) {
                        return StudentDataService.retrieveStudentData();
                    }
                }              
            })
            .state('root.vle', {
                url: '/vle/:nodeId',
                views: {
                    'navigationView': {
                        templateUrl: 'vle5/student/navigation/navigation.html',
                        controller: 'NavigationController',
                        controllerAs: 'navigationController',
                        resolve: {
                            navigationController: app.loadController('navigationController')
                        }
                    },
                    'nodeView': {
                        templateUrl: 'vle5/student/node/node.html',
                        controller: 'NodeController',
                        controllerAs: 'nodeController',
                        resolve: {
                            nodeController: app.loadController('nodeController'),
                            openResponseController: app.loadController('openResponseController'),
                            htmlController: app.loadController('htmlController')                  
                        }
                    }
                }
            });
	}]);
	return app;
});