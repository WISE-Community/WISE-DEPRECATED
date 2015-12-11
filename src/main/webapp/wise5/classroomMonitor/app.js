define([
    'angular',
    'bootstrap',
    'd3',
    'directives',
    'filters',
    'jquery',
    'jqueryUI',
    'angularAnimate',
    'angularAria',
    'angularMaterial',
    'angularAudio',
    'angularDragDrop',
    'angularFileUpload',
    'angularMoment',
    'angularSortable',
    'angularSanitize',
    'angularToArrayFilter',
    'angularUIRouter',
    'angularUITinymce',
    'angularUITree',
    'angularWebSocket',
    'annotationService',
    'audioRecorderService',
    'configService',
    'cRaterService',
    'discussionService',
    'drawService',
    'embeddedService',
    'graphService',
    'highcharts-ng',
    'htmlService',
    'labelService',
    'matchService',
    'moment',
    'multipleChoiceService',
    'nodeService',
    'ocLazyLoad',
    'openResponseService',
    'outsideURLService',
    'photoBoothService',
    'notebookService',
    'notebook',
    'projectService',
    'sessionService',
    'studentAssetService',
    'studentDataService',
    'studentStatusService',
    'studentWebSocketService',
    'tableService',
    'teacherDataService',
    'teacherWebSocketService',
    'tinymce',
    'utilService',
    'webfont',
    'webfonts'
], function (angular,
             bootstrap,
             d3,
             directives,
             filters,
             $,
             jqueryUI,
             angularAnimate,
             angularAria,
             angularMaterial,
             angularAudio,
             angularDragDrop,
             angularFileUpload,
             angularMoment,
             angularSortable,
             angularSanitize,
             angularToArrayFilter,
             angularUIRouter,
             angularUITinymce,
             angularUITree,
             angularWebSocket,
             annotationService,
             audioRecorderService,
             configService,
             cRaterService,
             discussionService,
             drawService,
             embeddedService,
             graphService,
             highchartsng,
             htmlService,
             labelService,
             matchService,
             moment,
             multipleChoiceService,
             nodeService,
             ocLazyLoad,
             openResponseService,
             outsideURLService,
             photoBoothService,
             notebookService,
             notebook,
             projectService,
             sessionService,
             studentAssetService,
             studentDataService,
             studentStatusService,
             studentWebSocketService,
             tableService,
             teacherDataService,
             teacherWebSocketService,
             tinymce,
             utilService,
             webfont,
             webfonts) {


    var app = angular.module('app', [
                                     'angular-toArrayFilter',
                                     'angularMoment',
                                     'directives',
                                     'filters',
                                     'highcharts-ng',
                                     'ngAnimate',
                                     'ngDragDrop',
                                     'ngFileUpload',
                                     'ngMaterial',
                                     'ngSanitize',
                                     'ngWebSocket',
                                     'ui.router',
                                     'ui.sortable'
                                     ]);

    // core services
    app.factory('AnnotationService', annotationService);
    app.factory('ConfigService', configService);
    app.factory('CRaterService', cRaterService);
    app.factory('EmbeddedService', embeddedService);
    app.factory('NodeService', nodeService);
    app.factory('NotebookService', notebookService);
    app.factory('ProjectService', projectService);
    app.factory('SessionService', sessionService);
    app.factory('StudentAssetService', studentAssetService);
    app.factory('StudentDataService', studentDataService);
    app.factory('StudentStatusService', studentStatusService);
    app.factory('StudentWebSocketService', studentWebSocketService);
    app.factory('TeacherDataService', teacherDataService);
    app.factory('TeacherWebSocketService', teacherWebSocketService);
    app.factory('UtilService', utilService);
    
    // node services
    app.factory('DiscussionService', discussionService);
    app.factory('DrawService', drawService);
    app.factory('GraphService', graphService);
    app.factory('LabelService', labelService);
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

    app.config([
        '$compileProvider',
        '$controllerProvider',
        '$mdThemingProvider',
        '$stateProvider',
        '$urlRouterProvider',
                function($compileProvider,
                         $controllerProvider,
                         $mdThemingProvider,
                         $stateProvider,
                         $urlRouterProvider) {

        $urlRouterProvider.otherwise('/studentProgress');

        app.$compileProvider = $compileProvider;
        app.$controllerProvider = $controllerProvider;

        $stateProvider
            .state('root', {
                url: '',
                abstract: true,
                templateUrl: 'wise5/classroomMonitor/classroomMonitor.html',
                controller: 'ClassroomMonitorController',
                controllerAs: 'classroomMonitorController',
                resolve: {
                    classroomMonitorController: app.loadController('classroomMonitorController'),
                    config: function(ConfigService) {
                        var configUrl = window.configUrl;

                        return ConfigService.retrieveConfig(configUrl);
                    },
                    project: function(ProjectService, config) {
                        return ProjectService.retrieveProject();
                    },
                    studentStatuses: function(StudentStatusService, config) {
                        return StudentStatusService.retrieveStudentStatuses();
                    },
                    webSocket: function(TeacherWebSocketService, config) {
                        return TeacherWebSocketService.initialize();
                    }
                }
            })
            .state('root.studentProgress', {
                url: '/studentProgress',
                templateUrl: 'wise5/classroomMonitor/studentProgress/studentProgress.html',
                controller: 'StudentProgressController',
                controllerAs: 'studentProgressController',
                resolve: {
                    loadController: app.loadController('studentProgressController')
                }
            })
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
                url: '/nodeGrading/:nodeId',
                templateUrl: 'wise5/classroomMonitor/nodeGrading/nodeGrading.html',
                controller: 'NodeGradingController',
                controllerAs: 'nodeGradingController',
                resolve: {
                    studentData: function($stateParams, TeacherDataService, config) {
                        return TeacherDataService.retrieveStudentDataByNodeId($stateParams.nodeId);
                    },
                    nodeGradingController: app.loadController('nodeGradingController'),
                    annotationController: app.loadController('annotationController'),
                    embeddedController: app.loadController('embeddedController'),
                    graphController: app.loadController('graphController'),
                    discussionController: app.loadController('discussionController'),
                    drawController: app.loadController('drawController'),
                    htmlChoiceController: app.loadController('htmlController'),
                    labelController: app.loadController('labelController'),
                    matchController: app.loadController('matchController'),
                    multipleChoiceController: app.loadController('multipleChoiceController'),
                    nodeController: app.loadController('nodeController'),
                    openResponseController: app.loadController('openResponseController'),
                    tableController: app.loadController('tableController')
                }
            })
            .state('root.studentGrading', {
                url: '/studentGrading/:workgroupId',
                templateUrl: 'wise5/classroomMonitor/studentGrading/studentGrading.html',
                controller: 'StudentGradingController',
                controllerAs: 'studentGradingController',
                resolve: {
                    studentData: function($stateParams, TeacherDataService, config) {
                        return TeacherDataService.retrieveStudentDataByWorkgroupId($stateParams.workgroupId);
                    },
                    studentGradingController: app.loadController('studentGradingController'),
                    annotationController: app.loadController('annotationController'),
                    embeddedController: app.loadController('embeddedController'),
                    graphController: app.loadController('graphController'),
                    discussionController: app.loadController('discussionController'),
                    drawController: app.loadController('drawController'),
                    htmlChoiceController: app.loadController('htmlController'),
                    labelController: app.loadController('labelController'),
                    matchController: app.loadController('matchController'),
                    multipleChoiceController: app.loadController('multipleChoiceController'),
                    nodeController: app.loadController('nodeController'),
                    openResponseController: app.loadController('openResponseController'),
                    tableController: app.loadController('tableController')
                }
            });
            
    }]);
    return app;
});