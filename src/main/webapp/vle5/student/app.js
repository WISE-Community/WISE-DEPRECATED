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
		
		$urlRouterProvider.otherwise('/studentRight');
		
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
                url: '/studentMap',
                parent: 'root',
                templateUrl: 'vle5/student/viewMap.html',
                controller: 'ViewMapController',
                controllerAs: 'viewMap',
                resolve: {
                    loadController: app.loadController('viewMapController')
                }
            });
	}]);
	
	return app;
	
});