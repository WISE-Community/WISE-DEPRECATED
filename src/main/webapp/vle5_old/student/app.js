define([
        'angular',
        'jquery',
        'angularUIRouter',
        'angularPostMessage',
        'configService',
        'projectService',
        'nodeApplicationService',
        'nodeService',
        'postMessageService',
        'studentDataService'
        ], function(angular, $) {

	var app = angular.module('app', [
	                                 'ui.router',
	                                 'ngPostMessage',
	                                 'ConfigService',
	                                 'ProjectService',
	                                 'NodeApplicationService',
	                                 'NodeService',
	                                 'PostMessageService',
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
		
		$urlRouterProvider.otherwise('/vle/');
		
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
                    nodeApplication: function(NodeApplicationService, config) {
                        return NodeApplicationService.intializeNodeApplications();
                    },
                    studentData: function(StudentDataService, config, project) {
                        return StudentDataService.retrieveStudentData();
                    }
                }              
            })
            .state('root.vle', {
                url: '/vle/:nodeId',
                views: {
                    'projectView': {
                        templateUrl: 'vle5/student/project/project.html',
                        controller: 'ProjectController',
                        controllerAs: 'projectController',
                        resolve: {
                            loadController: app.loadController('projectController'),
                        }
                    },
                    'nodeView': {
                        templateUrl: 'vle5/student/node/node.html',
                        controller: 'NodeController',
                        controllerAs: 'nodeController',
                        resolve: {
                            loadController: app.loadController('nodeController'),
                        }
                    },
                    'nodeHelperView': {
                        templateUrl: 'vle5/student/nodeHelper/nodeHelper.html',
                        controller: 'NodeHelperController',
                        controllerAs: 'nodeHelperController',
                        resolve: {
                            loadController: app.loadController('nodeHelperController'),
                        }
                    }
                }
            })
		/*
		$stateProvider
		    .state('root', {
		        url: '',
		        abstract:true,
                templateUrl: 'vle5/student/root.html',
                controller: 'RootController',
                controllerAs: 'rootController',
                params: {nodeId: null},
		        resolve: {
                    loadController: app.loadController('rootController'),
		            config: function(ConfigService) {
		                var configUrl = window.configUrl;
		                return ConfigService.retrieveConfig(configUrl);
		            },
		            project: function(ProjectService, config) {
		                return ProjectService.retrieveProject();
		            },
                    nodeApplication: function(NodeApplicationService, config) {
                        return NodeApplicationService.intializeNodeApplications();
                    },
                    studentData: function(StudentDataService, config) {
                        return StudentDataService.retrieveStudentData();
                    }
		        }		       
		    })
		    .state('root.vle', {
                url: '/vle/:nodeId',
                views: {
                    'projectView': {
                        templateUrl: 'vle5/student/project/project.html',
                        controller: 'ProjectController',
                        controllerAs: 'projectController',
                        resolve: {
                            loadController: app.loadController('projectController'),
                        }
                    },
                    'nodeView': {
                        templateUrl: 'vle5/student/node/node.html',
                        controller: 'NodeController',
                        controllerAs: 'nodeController',
                        resolve: {
                            loadController: app.loadController('nodeController'),
                        }
                    }
                }              
            })
            */
	}]);
	
	return app;
});