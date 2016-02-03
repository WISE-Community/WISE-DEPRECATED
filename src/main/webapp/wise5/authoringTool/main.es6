'use strict';

import $ from 'jquery';
import angular from 'angular';
import angularFileUpload from 'ng-file-upload';
import angularHighcharts from 'highcharts-ng';
import angularUIRouter from 'angular-ui-router';
import angularUITree from 'angular-ui-tree';
import ngMaterial from 'angular-material';
import angularMoment from 'angular-moment';
import angularToArrayFilter from 'lib/angular-toArrayFilter/toArrayFilter';
import angularWebSocket from 'angular-websocket';
import AnnotationService from '../services/annotationService';
import AuthoringToolController from './authoringToolController';
import AuthoringToolMainController from './main/authoringToolMainController';
import AuthoringToolNewProjectController from './main/authoringToolNewProjectController';
import ConfigService from '../services/configService';
import Directives from '../directives/directives';
import DiscussionController from '../components/discussion/discussionController';
import DiscussionService from '../components/discussion/discussionService';
import DrawController from '../components/draw/drawController';
import DrawService from '../components/draw/drawService';
import EmbeddedController from '../components/embedded/embeddedController';
import EmbeddedService from '../components/embedded/embeddedService';
import Filters from '../filters/filters';
import GraphController from '../components/graph/graphController';
import GraphService from '../components/graph/graphService';
import Highcharts from 'highcharts';
import HTMLController from '../components/html/htmlController';
import HTMLService from '../components/html/htmlService';
import LabelController from '../components/label/labelController';
import LabelService from '../components/label/labelService';
import MatchController from '../components/match/matchController';
import MatchService from '../components/match/matchService';
import MultipleChoiceController from '../components/multipleChoice/multipleChoiceController';
import MultipleChoiceService from '../components/multipleChoice/multipleChoiceService';
import NodeController from './node/nodeController';
import NodeService from '../services/nodeService';
import OpenResponseController from '../components/openResponse/openResponseController';
import OpenResponseService from '../components/openResponse/openResponseService';
import OutsideURLController from '../components/outsideURL/outsideURLController';
import OutsideURLService from '../components/outsideURL/outsideURLService';
import ProjectAssetController from './asset/projectAssetController';
import ProjectAssetService from '../services/projectAssetService';
import ProjectController from './project/projectController';
import ProjectService from '../services/projectService';
import SessionService from '../services/sessionService';
import StudentAssetService from '../services/studentAssetService';
import StudentDataService from '../services/studentDataService';
import StudentStatusService from '../services/studentStatusService';
import StudentWebSocketService from '../services/studentWebSocketService';
import TableController from '../components/table/tableController';
import TableService from '../components/table/tableService';
import TeacherDataService from '../services/teacherDataService';
import UtilService from '../services/utilService';

let mainModule = angular.module('authoring', [
    'angularMoment',
    'angular-toArrayFilter',
    'directives',
    'filters',
    'highcharts-ng',
    'ngAnimate',
    'ngAria',
    'ngFileUpload',
    'ngMaterial',
    'ngWebSocket',
    'ui.router',
    'ui.tree'
])
    .service(AnnotationService.name, AnnotationService)
    .service(ConfigService.name, ConfigService)
    .service(DiscussionService.name, DiscussionService)
    .service(DrawService.name, DrawService)
    .service(EmbeddedService.name, EmbeddedService)
    .service(GraphService.name, GraphService)
    .service(HTMLService.name, HTMLService)
    .service(LabelService.name, LabelService)
    .service(MatchService.name, MatchService)
    .service(MultipleChoiceService.name, MultipleChoiceService)
    .service(NodeService.name, NodeService)
    .service(OpenResponseService.name, OpenResponseService)
    .service(OutsideURLService.name, OutsideURLService)
    .service(ProjectService.name, ProjectService)
    .service(ProjectAssetService.name, ProjectAssetService)
    .service(SessionService.name, SessionService)
    .service(StudentAssetService.name, StudentAssetService)
    .service(StudentDataService.name, StudentDataService)
    .service(StudentStatusService.name, StudentStatusService)
    .service(StudentWebSocketService.name, StudentWebSocketService)
    .service(TableService.name, TableService)
    .service(TeacherDataService.name, TeacherDataService)
    .service(UtilService.name, UtilService)
    .controller(AuthoringToolController.name, AuthoringToolController)
    .controller(AuthoringToolMainController.name, AuthoringToolMainController)
    .controller(AuthoringToolNewProjectController.name, AuthoringToolNewProjectController)
    .controller(DiscussionController.name, DiscussionController)
    .controller(DrawController.name, DrawController)
    .controller(EmbeddedController.name, EmbeddedController)
    .controller(GraphController.name, GraphController)
    .controller(HTMLController.name, HTMLController)
    .controller(LabelController.name, LabelController)
    .controller(MatchController.name, MatchController)
    .controller(MultipleChoiceController.name, MultipleChoiceController)
    .controller(NodeController.name, NodeController)
    .controller(OpenResponseController.name, OpenResponseController)
    .controller(OutsideURLController.name, OutsideURLController)
    .controller(ProjectController.name, ProjectController)
    .controller(ProjectAssetController.name, ProjectAssetController)
    .controller(TableController.name, TableController)
    .config(['$urlRouterProvider',
        '$stateProvider',
        '$controllerProvider',
        '$mdThemingProvider',
        function($urlRouterProvider,
                 $stateProvider,
                 $controllerProvider,
                 $mdThemingProvider) {

            $urlRouterProvider.otherwise('/');

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
                        sessionTimers: function (SessionService, config) {
                            return SessionService.initializeSession();
                        }
                    }
                })
                .state('root.main', {
                    url: '/',
                    templateUrl: 'wise5/authoringTool/main/main.html',
                    controller: 'AuthoringToolMainController',
                    controllerAs: 'authoringToolMainController',
                    resolve: {
                    }
                })
                .state('root.new', {
                    url: '/new',
                    templateUrl: 'wise5/authoringTool/main/new.html',
                    controller: 'AuthoringToolNewProjectController',
                    controllerAs: 'authoringToolNewProjectController',
                    resolve: {
                    }
                })
                .state('root.project', {
                    url: '/project/:projectId',
                    templateUrl: 'wise5/authoringTool/project/project.html',
                    controller: 'ProjectController',
                    controllerAs: 'projectController',
                    resolve: {
                        projectConfig: function(ConfigService, $stateParams) {
                            var configURL = window.configURL + '/' + $stateParams.projectId;

                            return ConfigService.retrieveConfig(configURL);
                        },
                        project: function(ProjectService, projectConfig) {
                            return ProjectService.retrieveProject();
                        },
                        projectAssets: function(ProjectAssetService, projectConfig) {
                            return ProjectAssetService.retrieveProjectAssets();
                        }
                    }
                })
                .state('root.project.node', {
                    url: '/node/:nodeId',
                    templateUrl: 'wise5/authoringTool/node/node.html',
                    controller: 'NodeController',
                    controllerAs: 'nodeController',
                    resolve: {
                        load: () => {

                        }
                    }
                })
                .state('root.project.asset', {
                    url: '/asset',
                    templateUrl: 'wise5/authoringTool/asset/asset.html',
                    controller: 'ProjectAssetController',
                    controllerAs: 'projectAssetController',
                    resolve: {
                    }
                })
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