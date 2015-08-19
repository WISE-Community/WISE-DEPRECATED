define([
    'angular',
    'd3',
    'directives',
    'filters',
    'jquery',
    'jqueryUI',
    'angularAnimate',
    'angularAria',
    'angularDragDrop',
    'angularMaterial',
    'angularSortable',
    'angularUIRouter',
    'angularWebSocket',
    'annotationService',
    'configService',
    'cRaterService',
    'currentNodeService',
    'discussionService',
    'drawService',
    'graphService',
    'matchService',
    'multipleChoiceService',
    'nodeService',
    'openResponseService',
    'outsideURLService',
    'photoBoothService',
    'portfolioService',
    'projectService',
    'sessionService',
    'studentDataService',
    'studentStatusService',
    'tableService',
    'teacherDataService',
    'teacherWebSocketService'
], function(
    angular,
    d3,
    directives,
    filters,
    $,
    jqueryUI,
    angularAnimate,
    angularAria,
    angularDragDrop,
    angularMaterial,
    angularSortable,
    angularUIRouter,
    angularWebSocket,
    annotationService,
    configService,
    cRaterService,
    currentNodeService,
    discussionService,
    drawService,
    graphService,
    matchService,
    multipleChoiceService,
    nodeService,
    openResponseService,
    outsideURLService,
    photoBoothService,
    portfolioService,
    projectService,
    sessionService,
    studentDataService,
    studentStatusService,
    tableService,
    teacherDataService,
    teacherWebSocketService) {

    var app = angular.module('app', [
        'directives',
        'filters',
        'ui.router',
        'ui.sortable',
        'ngAnimate',
        'ngAria',
        'ngDragDrop',
        'ngMaterial',
        'ngWebSocket'
    ]);

    // core services
    app.factory('AnnotationService', annotationService);
    app.factory('ConfigService', configService);
    app.factory('CRaterService', cRaterService);
    app.factory('CurrentNodeService', currentNodeService);
    app.factory('NodeService', nodeService);
    app.factory('PortfolioService', portfolioService);
    app.factory('ProjectService', projectService);
    app.factory('SessionService', sessionService);
    app.factory('StudentDataService', studentDataService);
    app.factory('StudentStatusService', studentStatusService);
    app.factory('TeacherDataService', teacherDataService);
    app.factory('TeacherWebSocketService', teacherWebSocketService);

    // node services
    app.factory('DiscussionService', discussionService);
    app.factory('DrawService', drawService);
    app.factory('GraphService', graphService);
    app.factory('MatchService', matchService);
    app.factory('MultipleChoiceService', multipleChoiceService);
    app.factory('OpenResponseService', openResponseService);
    app.factory('OutsideURLService', outsideURLService);
    app.factory('PhotoBoothService', photoBoothService);
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

    app.config(['$urlRouterProvider',
        '$stateProvider',
        '$controllerProvider',
        '$mdThemingProvider',
        function($urlRouterProvider,
                 $stateProvider,
                 $controllerProvider,
                 $mdThemingProvider) {

            $urlRouterProvider.otherwise('/project');

            app.$controllerProvider = $controllerProvider;

            $stateProvider
                .state('root', {
                    url: '',
                    abstract: true,
                    templateUrl: 'wise5/authoringTool/authoringTool.html',
                    controller: 'AuthoringToolController',
                    controllerAs: 'authoringToolController',
                    resolve: {
                        authoringToolController: app.loadController('authoringToolController'),
                        portfolioController: app.loadController('portfolioController'),
                        config: function(ConfigService) {
                            var configURL = window.configURL;

                            return ConfigService.retrieveConfig(configURL);
                        },
                        project: function(ProjectService, config) {
                            return ProjectService.retrieveProject();
                        },
                        sessionTimers: function (SessionService, config) {
                            return SessionService.initializeSession();
                        }
                    }
                })
                .state('root.project', {
                    url: '/project',
                    templateUrl: 'wise5/authoringTool/project/project.html',
                    controller: 'ProjectController',
                    controllerAs: 'projectController',
                    resolve: {
                        loadController: app.loadController('projectController')
                    }
                });
            /*
                .state('root.nodeProgress', {
                    url: '/nodeProgress',
                    templateUrl: 'wise5/classroomMonitor/nodeProgress/nodeProgress.html',
                    controller: 'NodeProgressController',
                    controllerAs: 'nodeProgressController',
                    resolve: {
                        loadController: app.loadController('nodeProgressController')
                    }
                })
                .state('root.nodeGrading', {
                    url: '/nodeGrading',
                    templateUrl: 'wise5/classroomMonitor/nodeGrading/nodeGrading.html',
                    controller: 'NodeGradingController',
                    controllerAs: 'nodeGradingController',
                    resolve: {
                        studentData: function(TeacherDataService, config) {
                            return TeacherDataService.retrieveStudentDataByNodeId();
                        },
                        annotations: function(AnnotationService, config) {
                            return AnnotationService.retrieveAnnotationsByNodeId();
                        },
                        loadController: app.loadController('nodeGradingController')
                    }
                })
                .state('root.studentGrading', {
                    url: '/studentGrading/:workgroupId',
                    templateUrl: 'wise5/classroomMonitor/studentGrading/studentGrading.html',
                    controller: 'StudentGradingController',
                    controllerAs: 'studentGradingController',
                    resolve: {
                        studentData: function(TeacherDataService, config) {
                            return TeacherDataService.retrieveStudentDataByNodeId();
                        },
                        annotations: function(AnnotationService, config) {
                            return AnnotationService.retrieveAnnotationsByNodeId();
                        },
                        loadController: app.loadController('studentGradingController')
                    }
                });
                */

        // ngMaterial default theme configuration
        // TODO: make dynamic and support alternate themes; allow projects to specify theme parameters and settings
        $mdThemingProvider.definePalette('primaryPaletteWise', {
            '50': 'e1f0f4',
            '100': 'b8dbe4',
            '200': '8ec6d4',
            '300': '5faec2',
            '400': '3d9db5',
            '500': '1c8ca8',
            '600': '197f98',
            '700': '167188',
            '800': '136377',
            '900': '0e4957',
            'A100': 'abf3ff',
            'A200': '66e2ff',
            'A400': '17bee5',
            'A700': '00A1C6',
            'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                                // on this palette should be dark or light
            'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
                '200', '300', 'A100'],
            'contrastLightColors': undefined    // could also specify this if default was 'dark'
        });

        $mdThemingProvider.definePalette('accentPaletteWise', {
            '50': 'fde9e6',
            '100': 'fbcbc4',
            '200': 'f8aca1',
            '300': 'f4897b',
            '400': 'f2705f',
            '500': 'f05843',
            '600': 'da503c',
            '700': 'c34736',
            '800': 'aa3e2f',
            '900': '7d2e23',
            'A100': 'ff897d',
            'A200': 'ff7061',
            'A400': 'ff3829',
            'A700': 'cc1705',
            'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                                // on this palette should be dark or light
            'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
                '200', '300', 'A100'],
            'contrastLightColors': undefined    // could also specify this if default was 'dark'
        });

        $mdThemingProvider.theme('default')
            .primaryPalette('primaryPaletteWise')
            .accentPalette('accentPaletteWise');
        }]);
    return app;
});