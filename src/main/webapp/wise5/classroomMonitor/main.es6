'use strict';

import $ from 'jquery';
import angular from 'angular';
import angularMoment from 'angular-moment';
import angularToArrayFilter from 'lib/angular-toArrayFilter/toArrayFilter';
import angularUIRouter from 'angular-ui-router';
import ngFileUpload from 'ng-file-upload';
import ngMaterial from 'angular-material';
import angularSanitize from 'angular-sanitize';
import angularTranslate from 'angular-translate';
import angularTranslateLoaderPartial from 'angular-translate-loader-partial';
import ngWebSocket from 'angular-websocket';
import AnnotationService from '../services/annotationService';
import AudioOscillatorController from '../components/audioOscillator/audioOscillatorController';
import AudioOscillatorService from '../components/audioOscillator/audioOscillatorService';
import ClassroomMonitorController from './classroomMonitorController';
import ConceptMapController from '../components/conceptMap/conceptMapController';
import ConceptMapService from '../components/conceptMap/conceptMapService';
import ConfigService from '../services/configService';
import CRaterService from '../services/cRaterService';
import Directives from '../directives/directives';
import DiscussionController from '../components/discussion/discussionController';
import DiscussionService from '../components/discussion/discussionService';
import DrawController from '../components/draw/drawController';
import DrawService from '../components/draw/drawService';
import EmbeddedController from '../components/embedded/embeddedController';
import EmbeddedService from '../components/embedded/embeddedService';
import GraphController from '../components/graph/graphController';
import GraphService from '../components/graph/graphService';
import Highcharts from '../lib/highcharts@4.2.1';
import highchartsng from 'highcharts-ng';
import HTMLController from '../components/html/htmlController';
import LabelController from '../components/label/labelController';
import LabelService from '../components/label/labelService';
import MatchController from '../components/match/matchController';
import MatchService from '../components/match/matchService';
import MultipleChoiceController from '../components/multipleChoice/multipleChoiceController';
import MultipleChoiceService from '../components/multipleChoice/multipleChoiceService';
import NodeProgressController from './nodeProgress/nodeProgressController';
import NodeGradingController from './nodeGrading/nodeGradingController';
import NodeService from '../services/nodeService';
import NotebookService from '../services/notebookService';
import NotificationService from '../services/notificationService';
import OpenResponseController from '../components/openResponse/openResponseController';
import OpenResponseService from '../components/openResponse/openResponseService';
import OutsideURLController from '../components/outsideURL/outsideURLController';
import OutsideURLService from '../components/outsideURL/outsideURLService';
import ProjectService from '../services/projectService';
import SessionService from '../services/sessionService';
import StudentAssetService from '../services/studentAssetService';
import StudentDataService from '../services/studentDataService';
import StudentGradingController from './studentGrading/studentGradingController';
import StudentProgressController from './studentProgress/studentProgressController';
import StudentStatusService from '../services/studentStatusService';
import StudentWebSocketService from '../services/studentWebSocketService';
import TableController from '../components/table/tableController';
import TableService from '../components/table/tableService';
import TeacherDataService from '../services/teacherDataService';
import TeacherWebSocketService from '../services/teacherWebSocketService';
import UtilService from '../services/utilService';

let mainModule = angular.module('classroomMonitor', [
        'angularMoment',
        'angular-toArrayFilter',
        'directives',
        'highcharts-ng',
        'ngAnimate',
        'ngAria',
        'ngFileUpload',
        'ngMaterial',
        'ngSanitize',
        'ngWebSocket',
        'pascalprecht.translate',
        'ui.router'
    ])
    .service(AnnotationService.name, AnnotationService)
    .service(AudioOscillatorService.name, AudioOscillatorService)
    .service(ConceptMapService.name, ConceptMapService)
    .service(ConfigService.name, ConfigService)
    .service(CRaterService.name, CRaterService)
    .service(DiscussionService.name, DiscussionService)
    .service(DrawService.name, DrawService)
    .service(EmbeddedService.name, EmbeddedService)
    .service(GraphService.name, GraphService)
    .service(LabelService.name, LabelService)
    .service(MatchService.name, MatchService)
    .service(MultipleChoiceService.name, MultipleChoiceService)
    .service(NodeService.name, NodeService)
    .service(NotebookService.name, NotebookService)
    .service(NotificationService.name, NotificationService)
    .service(OpenResponseService.name, OpenResponseService)
    .service(OutsideURLService.name, OutsideURLService)
    .service(ProjectService.name, ProjectService)
    .service(SessionService.name, SessionService)
    .service(StudentAssetService.name, StudentAssetService)
    .service(StudentDataService.name, StudentDataService)
    .service(StudentStatusService.name, StudentStatusService)
    .service(StudentWebSocketService.name, StudentWebSocketService)
    .service(TableService.name, TableService)
    .service(TeacherDataService.name, TeacherDataService)
    .service(TeacherWebSocketService.name, TeacherWebSocketService)
    .service(UtilService.name, UtilService)
    .controller(AudioOscillatorController.name, AudioOscillatorController)
    .controller(ClassroomMonitorController.name, ClassroomMonitorController)
    .controller(ConceptMapController.name, ConceptMapController)
    .controller(DiscussionController.name, DiscussionController)
    .controller(DrawController.name, DrawController)
    .controller(EmbeddedController.name, EmbeddedController)
    .controller(GraphController.name, GraphController)
    .controller(HTMLController.name, HTMLController)
    .controller(LabelController.name, LabelController)
    .controller(MatchController.name, MatchController)
    .controller(MultipleChoiceController.name, MultipleChoiceController)
    .controller(NodeGradingController.name, NodeGradingController)
    .controller(NodeProgressController.name, NodeProgressController)
    .controller(OpenResponseController.name, OpenResponseController)
    .controller(OutsideURLController.name, OutsideURLController)
    .controller(StudentGradingController.name, StudentGradingController)
    .controller(StudentProgressController.name, StudentProgressController)
    .controller(TableController.name, TableController)
    .config([
        '$urlRouterProvider',
        '$stateProvider',
        '$translateProvider',
        '$translatePartialLoaderProvider',
        '$controllerProvider',
        '$mdThemingProvider',
        function($urlRouterProvider,
                 $stateProvider,
                 $translateProvider,
                 $translatePartialLoaderProvider,
                 $controllerProvider,
                 $mdThemingProvider) {

            $urlRouterProvider.otherwise('/studentProgress');

            $stateProvider
                .state('root', {
                    url: '',
                    abstract: true,
                    templateUrl: 'wise5/classroomMonitor/classroomMonitor.html',
                    controller: 'ClassroomMonitorController',
                    controllerAs: 'classroomMonitorController',
                    resolve: {
                        config: function(ConfigService) {
                            var configURL = window.configURL;

                            return ConfigService.retrieveConfig(configURL);
                        },
                        project: function(ProjectService, config) {
                            return ProjectService.retrieveProject();
                        },
                        runStatus: function(TeacherDataService, config) {
                            return TeacherDataService.retrieveRunStatus();
                        },
                        studentStatuses: function(StudentStatusService, config) {
                            return StudentStatusService.retrieveStudentStatuses();
                        },
                        notifications: function (NotificationService, studentStatuses, config, project) {
                            return NotificationService.retrieveNotifications();
                        },
                        webSocket: function(TeacherWebSocketService, config) {
                            return TeacherWebSocketService.initialize();
                        },
                        language: ($translate, ConfigService, config) => {
                            let locale = ConfigService.getLocale();  // defaults to "en"
                            $translate.use(locale);
                        },
                        sessionTimers: (SessionService, config) => {
                            return SessionService.initializeSession();
                        }
                    }
                })
                .state('root.studentProgress', {
                    url: '/studentProgress',
                    templateUrl: 'wise5/classroomMonitor/studentProgress/studentProgress.html',
                    controller: 'StudentProgressController',
                    controllerAs: 'studentProgressController',
                    resolve: {
                        studentData: function($stateParams, TeacherDataService, config) {
                            return TeacherDataService.retrieveAnnotations();
                        }
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
                        }
                    }
                })
                .state('root.nodeProgress', {
                    url: '/nodeProgress',
                    templateUrl: 'wise5/classroomMonitor/nodeProgress/nodeProgress.html',
                    controller: 'NodeProgressController',
                    controllerAs: 'nodeProgressController',
                    resolve: {
                        studentData: function($stateParams, TeacherDataService, config) {
                            return TeacherDataService.retrieveAnnotations();
                        }
                    }
                })
                .state('root.nodeGrading', {
                    url: '/nodeGrading/:nodeId',
                    templateUrl: 'wise5/classroomMonitor/nodeGrading/nodeGrading.html',
                    controller: 'NodeGradingController',
                    controllerAs: 'nodeGradingController',
                    resolve: {
                        studentData: function($stateParams, TeacherDataService, config, project) {
                            return TeacherDataService.retrieveStudentDataByNodeId($stateParams.nodeId);
                        }
                    }
                });

            // Set up Translations
            $translatePartialLoaderProvider.addPart('common');
            $translatePartialLoaderProvider.addPart('classroomMonitor');
            $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: 'wise5/i18n/{part}/i18n_{lang}.json'
            });
            $translateProvider.fallbackLanguage(['en']);
            $translateProvider.registerAvailableLanguageKeys(['en','es','ja','ko','pt','tr','zh_CN'], {
                'en_US': 'en',
                'en_UK': 'en'
            });
            $translateProvider.useSanitizeValueStrategy('escape');

            // ngMaterial default theme configuration
            // TODO: make dynamic and support alternate themes; allow projects to specify theme parameters and settings
            $mdThemingProvider.definePalette('primary', {
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

            $mdThemingProvider.definePalette('accent', {
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
                'contrastDefaultColor': 'light',
                'contrastDarkColors': ['50', '100',
                    '200', '300', 'A100'],
                'contrastLightColors': undefined
            });

            $mdThemingProvider.theme('default')
                .primaryPalette('primary')
                .accentPalette('accent',  {
                    'default': '500'
                })
                .warnPalette('red', {
                    'default': 'A700'
                });

            var lightMap = $mdThemingProvider.extendPalette('grey', {
                'A100': 'ffffff'
            });
            $mdThemingProvider.definePalette('light', lightMap);

            $mdThemingProvider.theme('light')
                .primaryPalette('light', {
                    'default': 'A100'
                })
                .accentPalette('primary');

            $mdThemingProvider.setDefaultTheme('default');
        }]);

export default mainModule;
