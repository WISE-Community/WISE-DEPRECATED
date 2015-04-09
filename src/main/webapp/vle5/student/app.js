define([
        'angular',
        'jquery',
        'jqueryUI',
        'angularAnimate',
        'angularDragDrop',
        'angularUIRouter',
        'angularSortable',
        'configService',
        'projectService',
        'nodeApplicationService',
        'nodeService',
        'openResponseService',
        'portfolioService',
        'studentDataService'
        ], function(angular, $) {

	var app = angular.module('app', [
	                                 'ui.router',
	                                 'ui.sortable',
	                                 'ngAnimate',
	                                 'ngDragDrop',
	                                 'ConfigService',
	                                 'ProjectService',
	                                 'NodeApplicationService',
	                                 'NodeService',
	                                 'OpenResponseService',
	                                 'PortfolioService',
	                                 'StudentDataService'
	                                 ]);
	
	app.directive('compile', function($compile) {
        return function(scope, ele, attrs) {
            scope.$watch(
                    function(scope) {
                        return scope.$eval(attrs.compile);
                    },
                    function(value) {
                        ele.html(value);
                        $compile(ele.contents())(scope);
                    }
            );
        };
    });
	
	app.filter('sanitizeHTML', ['$sce', function($sce) {
	    return function(htmlCode) {
	        return $sce.trustAsHtml(htmlCode);
	    };
	}]);
	
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
                resolve: {
                    vleController: app.loadController('vleController'),
                    portfolioController: app.loadController('portfolioController'),
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
                        resolve: {
                            navigationController: app.loadController('navigationController')
                        }
                    },
                    'nodeView': {
                        templateUrl: 'vle5/student/node/node.html',
                        resolve: {
                            nodeController: app.loadController('nodeController'),
                            openResponseController: app.loadController('openResponseController'),
                            htmlController: app.loadController('htmlController'),
                            planningController: app.loadController('planningController')
                        }
                    }
                }
            });
            
	}]);
	return app;
});