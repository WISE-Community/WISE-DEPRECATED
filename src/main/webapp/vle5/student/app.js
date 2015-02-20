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
		
		$urlRouterProvider.otherwise('/studentMap');
		
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
			.state('studentLeft', {
				url: '/studentLeft',
				parent: 'root',
				templateUrl: 'vle5/student/viewLeftNav.html',
				controller: 'ViewLeftController',
				controllerAs: 'viewLeft',
				resolve: {
					loadController: app.loadController('viewLeftController')
				}
            })
            .state('studentRight', {
                url: '/studentRight',
                parent: 'root',
                templateUrl: 'vle5/student/viewRightNav.html',
                controller: 'ViewRightController',
                controllerAs: 'viewRight',
                resolve: {
                    loadController: app.loadController('viewRightController')
                }
            })
            .state('studentMap', {
                parent: 'root',
                url: '/studentMap',
                templateUrl: 'vle5/student/viewMap.html',
                controller: 'ViewMapController',
                controllerAs: 'viewMap',
                resolve: {
                    loadController: app.loadController('viewMapController')
                }
            })
            .state('studentList', {
                parent: 'root',
                url: '/studentList',
                templateUrl: 'vle5/student/viewList.html',
                controller: 'ViewListController',
                controllerAs: 'viewList',
                resolve: {
                    loadController: app.loadController('viewListController')
                }
            });
	}]);
	
	return app;
});