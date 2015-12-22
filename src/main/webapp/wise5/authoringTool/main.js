'use strict';

import $ from 'jquery';
import angular from 'angular';
import angularUIRouter from 'angular-ui-router';
import ngFileUpload from 'ng-file-upload';
import ngMaterial from 'angular-material';
import angularToArrayFilter from '../lib/angular-toArrayFilter/toArrayFilter';
import AnnotationService from '../services/annotationService2';
import AuthoringToolController from './authoringToolController2';
import ConfigService from '../services/configService2';
import Directives from '../directives/directives2';
import NodeController from './node/nodeController2';
import NodeService from '../services/nodeService2';
import OpenResponseService from '../components/openResponse/openResponseService2';
import ProjectController from './project/projectController2';
import ProjectService from '../services/projectService2';
import SessionService from '../services/sessionService2';
import StudentAssetService from '../services/studentAssetService2';
import StudentDataService from '../services/studentDataService2';
import UtilService from '../services/utilService2';

console.log(angular.version, $.fn.jquery);
var mainModule = angular.module('app', [
    'angular-toArrayFilter',
    'directives',
    'ui.router',
    //'ui.sortable',
    'ngAnimate',
    'ngAria',
    //'ngDragDrop',
    'ngFileUpload',
    'ngMaterial',
])
    .service(AnnotationService.name, AnnotationService)
    .service(ConfigService.name, ConfigService)
    .service(NodeService.name, NodeService)
    .service(OpenResponseService.name, OpenResponseService)
    .service(ProjectService.name, ProjectService)
    .service(SessionService.name, SessionService)
    .service(StudentAssetService.name, StudentAssetService)
    .service(StudentDataService.name, StudentDataService)
    .service(UtilService.name, UtilService)
    .controller(AuthoringToolController.name, AuthoringToolController)
    .controller(NodeController.name, NodeController)
    .controller(ProjectController.name, ProjectController)
    .config(['$urlRouterProvider',
        '$stateProvider',
        '$controllerProvider',
        '$mdThemingProvider',
        function($urlRouterProvider,
                 $stateProvider,
                 $controllerProvider,
                 $mdThemingProvider) {

            $urlRouterProvider.otherwise('/project');

            $stateProvider
                .state('root', {
                    url: '',
                    abstract: true,
                    templateUrl: 'wise5/authoringTool/authoringTool.html',
                    controller: 'AuthoringToolController',
                    controllerAs: 'authoringToolController',
                    resolve: {
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
                    }
                })
                .state('root.node', {
                    url: '/node/:nodeId',
                    templateUrl: 'wise5/authoringTool/node/node.html',
                    controller: 'NodeController',
                    controllerAs: 'nodeController',
                    resolve: {
                        load: () => {
                             System.import('components/html/htmlController2').then((HTMLController) => {
                                $controllerProvider.register(HTMLController.default.name, HTMLController.default);
                             });
                            System.import('components/openResponse/openResponseController2').then((OpenResponseController) => {
                                $controllerProvider.register(OpenResponseController.default.name, OpenResponseController.default);
                            });

                        }
                    }
                });
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

export default mainModule;

/*
require.config({
    baseUrl: 'wise5/',
    paths: {
        'angular': [
            '//ajax.googleapis.com/ajax/libs/angularjs/1.3.20/angular.min',
            'vendor/angular/angular.min'
        ],
        'angularAnimate': 'vendor/angular-animate/angular-animate.min',
        'angularAria': 'vendor/angular-aria/angular-aria.min',
        'angularDragDrop': 'vendor/angular-dragdrop/src/angular-dragdrop.min',
        'angularFileUpload': 'vendor/ng-file-upload/ng-file-upload.min',
        'angularMaterial': 'vendor/angular-material/angular-material.min',
        'angularSortable': 'vendor/angular-ui-sortable/sortable.min',
        'angularToArrayFilter': 'vendor/angular-toArrayFilter/toArrayFilter',
        'angularUIRouter': 'vendor/angular-ui-router/release/angular-ui-router.min',
        'angularWebSocket': 'vendor/angular-websocket/angular-websocket.min',
        'annotationService': 'services/annotationService',
        'app': 'authoringTool/app',
        'authoringToolController': 'authoringTool/authoringToolController',
        'configService': 'services/configService',
        'cRaterService': 'components/cRater/cRaterService',
        'd3': 'lib/d3/d3',
        'directives': 'directives/directives',
        'discussionService': 'components/discussion/discussionService',
        'drawService': 'components/draw/drawService',
        'filters': 'filters/filters',
        'graphService': 'components/graph/graphService',
        'htmlController': 'components/html/htmlController',
        'jquery': [
            '//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min',
            'vendor/jquery/dist/jquery.min'
        ],
        'jqueryUI': [ // TODO: switch to pared down custom build
            '//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min',
            'vendor/jquery-ui/jquery-ui.min'
        ],
        'matchService': 'components/match/matchService',
        'multipleChoiceService': 'components/multipleChoice/multipleChoiceService',
        'navigationController': 'classroomMonitor/navigation/navigationController',
        'nodeController': 'authoringTool/node/nodeController',
        'nodeGradingController': 'classroomMonitor/nodeGrading/nodeGradingController',
        'nodeProgressController': 'classroomMonitor/nodeProgress/nodeProgressController',
        'nodeService': 'services/nodeService',
        'openResponseController': 'components/openResponse/openResponseController',
        'openResponseService': 'components/openResponse/openResponseService',
        'outsideURLService': 'components/outsideURL/outsideURLService',
        'photoBoothService': 'components/photoBooth/photoBoothService',
        'planningController': 'components/planning/planningController',
        'planningService': 'components/planning/planningService',
        'notebookService': 'services/notebookService',
        'projectController': 'authoringTool/project/projectController',
        'projectService': 'services/projectService',
        'sessionService': 'services/sessionService',
        'studentAssetService': 'services/studentAssetService',
        'studentDataService': 'services/studentDataService',
        'studentGradingController': 'classroomMonitor/studentGrading/studentGradingController',
        'studentProgressController': 'classroomMonitor/studentProgress/studentProgressController',
        'studentStatusService': 'services/studentStatusService',
        'tableService': 'components/table/tableService',
        'teacherDataService': 'services/teacherDataService',
        'teacherWebSocketService': 'services/teacherWebSocketService',
        'utilService': 'services/utilService'
    },
    shim: {
        'angular': {
            'exports': 'angular',
            'deps': [
                'jquery'
            ]
        },
        'angularAnimate': {
            'exports': 'angularAnimate',
            'deps': [
                'angular'
            ]
        },
        'angularAria': {
            'exports': 'angularAria',
            'deps': [
                'angular'
            ]
        },
        'angularDragDrop': {
            'exports': 'angularDragDrop',
            'deps': [
                'angular',
                'jqueryUI'
            ]
        },
        'angularFileUpload': {
            'exports': 'angularFileUpload',
            'deps': [
                'angular'
            ]
        },
        'angularMaterial': {
            'exports': 'angularMaterial',
            'deps': [
                'angularAnimate',
                'angularAria'
            ]
        },
        'angularSortable': {
            'exports': 'angularSortable',
            'deps': [
                'angular',
                'jqueryUI'
            ]
        },
        'angularToArrayFilter': {
            'exports': 'angularToArrayFilter',
            'deps': [
                'angular'
            ]
        },
        'angularUIRouter': {
            'exports': 'angularUIRouter',
            'deps': [
                'angular'
            ]
        },
        'angularWebSocket': {
            'exports': 'angularWebSocket',
            'deps': [
                'angular'
            ]
        },
        'jquery': {
            'exports': 'jquery'
        },
        'jqueryUI': {
            'exports': 'jqueryUI',
            'deps': [
                'jquery'
            ]
        }
    }
});

require(['app'],function(app){
    app.init();
});
    */