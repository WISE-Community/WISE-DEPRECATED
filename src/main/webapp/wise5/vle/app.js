define([
        'angular',
        'bootstrap',
        'd3',
        'directives',
        'filters',
        'jquery',
        'jqueryUI',
        'angularAnimate',
        'angularAudio',
        'angularDragDrop',
        'angularFileUpload',
        'angularSortable',
        'angularTextAngular',
        'angularUIRouter',
        'angularWebSocket',
        'annotationService',
        'audioRecorderService',
        'configService',
        'currentNodeService',
        'cRaterService',
        'graphService',
        'highcharts-more',
        'highcharts-ng',
        'multipleChoiceService',
        'nodeService',
        'openResponseService',
        'outsideURLService',
        'photoBoothService',
        'portfolioService',
        'projectService',
        'questionnaireService',
        'sessionService',
        'studentAssetService',
        'studentDataService',
        'studentStatusService',
        'studentWebSocketService',
        'tableService'
        ], function(
                angular,
                bootstrap,
                d3,
                directives,
                filters,
                $,
                jqueryUI,
                angularAnimate,
                angularAudio,
                angularDragDrop,
                angularFileUpload,
                angularSortable,
                angularTextAngular,
                angularUIRouter,
                angularWebSocket,
                annotationService,
                audioRecorderService,
                configService,
                currentNodeService,
                cRaterService,
                graphService,
                highchartsmore,
                highchartsng,
                multipleChoiceService,
                nodeService,
                openResponseService,
                outsideURLService,
                photoBoothService,
                portfolioService,
                projectService,
                questionnaireService,
                sessionService,
                studentAssetService,
                studentDataService,
                studentStatusService,
                studentWebSocketService,
                tableService
                ) {

    var app = angular.module('app', [
                                     'angularFileUpload',
                                     'directives',
                                     'filters',
                                     'highcharts-ng',
                                     'ui.router',
                                     'ui.sortable',
                                     'ngAnimate',
                                     'ngAudio',
                                     'ngDragDrop',
                                     'ngWebSocket',
                                     'textAngular'
                                     ]);
    
    // core services
    app.factory('AnnotationService', annotationService);
    app.factory('ConfigService', configService);
    app.factory('CurrentNodeService', currentNodeService);
    app.factory('CRaterService', cRaterService);
    app.factory('NodeService', nodeService);
    app.factory('PortfolioService', portfolioService);
    app.factory('ProjectService', projectService);
    app.factory('SessionService', sessionService);
    app.factory('StudentAssetService', studentAssetService);
    app.factory('StudentDataService', studentDataService);
    app.factory('StudentStatusService', studentStatusService);
    app.factory('StudentWebSocketService', studentWebSocketService);
    
    // node services
    app.factory('AudioRecorderService', audioRecorderService);
    app.factory('GraphService', graphService);
    app.factory('MultipleChoiceService', multipleChoiceService);
    app.factory('PhotoBoothService', photoBoothService);
    app.factory('OpenResponseService', openResponseService);
    app.factory('OutsideURLService', outsideURLService);
    app.factory('QuestionnaireService', questionnaireService);
    app.factory('TableService', tableService);
    
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
                    annotations: function(AnnotationService, config) {
                        return AnnotationService.retrieveAnnotationsForStudent();
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
                            audioRecorderController: app.loadController('audioRecorderController'),
                            graphController: app.loadController('graphController'),
                            htmlController: app.loadController('htmlController'),
                            multipleChoiceController: app.loadController('multipleChoiceController'),
                            nodeController: app.loadController('nodeController'),
                            openResponseController: app.loadController('openResponseController'),
                            outsideURLController: app.loadController('outsideURLController'),
                            photoBoothController: app.loadController('photoBoothController'),
                            planningController: app.loadController('planningController'),
                            questionnaireController: app.loadController('questionnaireController'),
                            tableController: app.loadController('tableController')
                        }
                    }
                }
            });
            
    }]);
    
    return app;
});