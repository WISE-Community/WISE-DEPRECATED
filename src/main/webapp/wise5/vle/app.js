define([
        'angular',
        'd3',
        'directives',
        'jquery',
        'jqueryUI',
        'angularAnimate',
        'angularDragDrop',
        'angularFileUpload',
        'angularSortable',
        'angularUIRouter',
        'angularWebSocket',
        'configService',
        'multipleChoiceService',
        'nodeService',
        'openResponseService',
        'portfolioService',
        'projectService',
        'sessionService',
        'studentAssetService',
        'studentDataService',
        'studentStatusService',
        'studentWebSocketService'
        ], function(
                angular,
                d3,
                directives,
                $,
                jqueryUI,
                angularAnimate,
                angularDragDrop,
                angularFileUpload,
                angularSortable,
                angularUIRouter,
                angularWebSocket,
                configService,
                multipleChoiceService,
                nodeService,
                openResponseService,
                portfolioService,
                projectService,
                sessionService,
                studentAssetService,
                studentDataService,
                studentStatusService,
                studentWebSocketService
                ) {

    var app = angular.module('app', [
                                     'angularFileUpload',
                                     'directives',
                                     'ui.router',
                                     'ui.sortable',
                                     'ngAnimate',
                                     'ngDragDrop',
                                     'ngWebSocket'
                                     ]);
    
    // core services
    app.factory('ConfigService', configService);
    app.factory('NodeService', nodeService);
    app.factory('PortfolioService', portfolioService);
    app.factory('ProjectService', projectService);
    app.factory('SessionService', sessionService);
    app.factory('StudentAssetService', studentAssetService);
    app.factory('StudentDataService', studentDataService);
    app.factory('StudentStatusService', studentStatusService);
    app.factory('StudentWebSocketService', studentWebSocketService);
    
    // node services
    app.factory('OpenResponseService', openResponseService);
    app.factory('MultipleChoiceService', multipleChoiceService);
    

    
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
                templateUrl: 'wise5/vle/vle.html',
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
                    sessionTimers: function(SessionService, config) {
                        return SessionService.initializeSession();
                    },
                    studentData: function(StudentDataService, config, project) {
                        return StudentDataService.retrieveStudentData();
                    },
                    webSocket: function(StudentWebSocketService, config) {
                        return StudentWebSocketService.initialize();
                    }
                }              
            })
            .state('root.vle', {
                url: '/vle/:nodeId',
                views: {
                    'navigationView': {
                        templateUrl: 'wise5/vle/navigation/navigation.html',
                        resolve: {
                            navigationController: app.loadController('navigationController')
                        }
                    },
                    'nodeView': {
                        templateUrl: 'wise5/vle/node/node.html',
                        resolve: {
                            nodeController: app.loadController('nodeController'),
                            openResponseController: app.loadController('openResponseController'),
                            multipleChoiceController: app.loadController('multipleChoiceController'),
                            htmlController: app.loadController('htmlController'),
                            planningController: app.loadController('planningController')
                        }
                    }
                }
            });
            
    }]);
    
    return app;
});