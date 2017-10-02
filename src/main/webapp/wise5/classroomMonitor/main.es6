'use strict';

import '../themes/default/js/webfonts';
import $ from 'jquery';
import AchievementService from '../services/achievementService';
import angular from 'angular';
import angularDragula from 'angular-dragula';
import angularFileSaver from 'angular-file-saver';
import angularInview from 'angular-inview';
import angularMoment from 'angular-moment';
import angularToArrayFilter from 'lib/angular-toArrayFilter/toArrayFilter';
import angularUIRouter from 'angular-ui-router';
import ngFileUpload from 'ng-file-upload';
import ngMaterial from 'angular-material';
import angularSanitize from 'angular-sanitize';
import angularTranslate from 'angular-translate';
import angularTranslateLoaderPartial from 'angular-translate-loader-partial';
import ngWebSocket from 'angular-websocket';
import AnimationComponentModule from '../components/animation/animationComponentModule';
import AnnotationService from '../services/annotationService';
import AudioOscillatorComponentModule from '../components/audioOscillator/audioOscillatorComponentModule';
import ClassroomMonitorComponents from './classroomMonitorComponents';
import ClassroomMonitorController from './classroomMonitorController';
import ConceptMapComponentModule from '../components/conceptMap/conceptMapComponentModule';
import ConfigService from '../services/configService';
import CRaterService from '../services/cRaterService';
import Components from '../directives/components';
import DashboardController from './dashboard/dashboardController';
import DataExportController from './dataExport/dataExportController';
import DiscussionComponentModule from '../components/discussion/discussionComponentModule';
import DrawComponentModule from '../components/draw/drawComponentModule';
import EmbeddedComponentModule from '../components/embedded/embeddedComponentModule';
import GraphComponentModule from '../components/graph/graphComponentModule';
import Highcharts from '../lib/highcharts@4.2.1';
import highchartsng from 'highcharts-ng';
import HTMLComponentModule from '../components/html/htmlComponentModule';
import HttpInterceptor from '../services/httpInterceptor';
import LabelComponentModule from '../components/label/labelComponentModule';
import MatchComponentModule from '../components/match/matchComponentModule';
import MilestonesController from './milestones/milestonesController';
import MultipleChoiceComponentModule from '../components/multipleChoice/multipleChoiceComponentModule';
import NodeGradingController from './nodeGrading/nodeGradingController';
import NodeProgressController from './nodeProgress/nodeProgressController';
import NodeService from '../services/nodeService';
import Notebook from '../directives/notebook/notebook';
import NotebookGradingController from './notebook/notebookGradingController';
import NotebookService from '../services/notebookService';
import NotificationService from '../services/notificationService';
import OpenResponseComponentModule from '../components/openResponse/openResponseComponentModule';
import OutsideURLComponentModule from '../components/outsideURL/outsideURLComponentModule';
import ProjectService from '../services/projectService';
import SessionService from '../services/sessionService';
import StudentAssetService from '../services/studentAssetService';
import StudentDataService from '../services/studentDataService';
import StudentGradingController from './studentGrading/studentGradingController';
import StudentProgressController from './studentProgress/studentProgressController';
import StudentStatusService from '../services/studentStatusService';
import StudentWebSocketService from '../services/studentWebSocketService';
import TableComponentModule from '../components/table/tableComponentModule';
import TeacherDataService from '../services/teacherDataService';
import TeacherWebSocketService from '../services/teacherWebSocketService';
import UtilService from '../services/utilService';

import moment from 'moment';

let classroomMonitorModule = angular.module('classroomMonitor', [
        angularDragula(angular),
        'angularMoment',
        'angular-inview',
        'angular-toArrayFilter',
        'animationComponentModule',
        'audioOscillatorComponentModule',
        'components',
        'conceptMapComponentModule',
        'classroomMonitor.components',
        'discussionComponentModule',
        'drawComponentModule',
        'embeddedComponentModule',
        'graphComponentModule',
        'highcharts-ng',
        'htmlComponentModule',
        'labelComponentModule',
        'matchComponentModule',
        'multipleChoiceComponentModule',
        'ngAnimate',
        'ngAria',
        'ngFileSaver',
        'ngFileUpload',
        'ngMaterial',
        'ngSanitize',
        'ngWebSocket',
        'notebook',
        'openResponseComponentModule',
        'outsideURLComponentModule',
        'pascalprecht.translate',
        'tableComponentModule',
        'ui.router'
    ])
    .service(AchievementService.name, AchievementService)
    .service(AnnotationService.name, AnnotationService)
    .service(ConfigService.name, ConfigService)
    .service(CRaterService.name, CRaterService)
    .service(HttpInterceptor.name, HttpInterceptor)
    .service(NodeService.name, NodeService)
    .service(NotebookService.name, NotebookService)
    .service(NotificationService.name, NotificationService)
    .service(ProjectService.name, ProjectService)
    .service(SessionService.name, SessionService)
    .service(StudentAssetService.name, StudentAssetService)
    .service(StudentDataService.name, StudentDataService)
    .service(StudentStatusService.name, StudentStatusService)
    .service(StudentWebSocketService.name, StudentWebSocketService)
    .service(TeacherDataService.name, TeacherDataService)
    .service(TeacherWebSocketService.name, TeacherWebSocketService)
    .service(UtilService.name, UtilService)
    .controller(ClassroomMonitorController.name, ClassroomMonitorController)
    .controller(DataExportController.name, DataExportController)
    .controller(MilestonesController.name, MilestonesController)
    .controller(NodeGradingController.name, NodeGradingController)
    .controller(NodeProgressController.name, NodeProgressController)
    .controller(NotebookGradingController.name, NotebookGradingController)
    .controller(StudentGradingController.name, StudentGradingController)
    .controller(StudentProgressController.name, StudentProgressController)
    .config([
        '$urlRouterProvider',
        '$stateProvider',
        '$translateProvider',
        '$translatePartialLoaderProvider',
        '$controllerProvider',
        '$mdThemingProvider',
        '$httpProvider',
        ($urlRouterProvider,
         $stateProvider,
         $translateProvider,
         $translatePartialLoaderProvider,
         $controllerProvider,
         $mdThemingProvider,
         $httpProvider) => {

            $urlRouterProvider.otherwise('/project/');

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
                        achievements: function (AchievementService, studentStatuses, config, project) {
                            return AchievementService.retrieveAchievements();
                        },
                        notifications: function (NotificationService, ConfigService, studentStatuses, config, project) {
                            //return NotificationService.retrieveNotifications(ConfigService.getWorkgroupId());
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
                        },
                        annotations: function(TeacherDataService, config) {
                            return TeacherDataService.retrieveAnnotations();
                        }
                    }
                })
                .state('root.teamLanding', {
                    url: '/team',
                    templateUrl: 'wise5/classroomMonitor/studentProgress/studentProgress.html',
                    controller: 'StudentProgressController',
                    controllerAs: 'studentProgressController'
                })
                .state('root.team', {
                    url: '/team/:workgroupId',
                    templateUrl: 'wise5/classroomMonitor/studentGrading/studentGrading.html',
                    controller: 'StudentGradingController',
                    controllerAs: 'studentGradingController',
                    resolve: {
                        studentData: function($stateParams, TeacherDataService, config) {
                            return TeacherDataService.retrieveStudentDataByWorkgroupId($stateParams.workgroupId);
                        }
                    }
                })
                .state('root.project', {
                    url: '/project/:nodeId?periodId&workgroupId',
                    views: {
                        'nodeView': {
                            templateUrl: 'wise5/classroomMonitor/nodeGrading/nodeGrading.html',
                            controller: 'NodeGradingController',
                            controllerAs: 'nodeGradingController'
                        }
                    }
                })
                .state('root.dashboard', {
                    url: '/dashboard',
                    templateUrl: 'wise5/classroomMonitor/dashboard/dashboard.html',
                    controller: 'DashboardController',
                    controllerAs: 'dashboardController'
                })
                .state('root.export', {
                    url: '/export',
                    templateUrl: 'wise5/classroomMonitor/dataExport/dataExport.html',
                    controller: 'DataExportController',
                    controllerAs: 'dataExportController'
                })
                .state('root.milestones', {
                    url: '/milestones',
                    templateUrl: 'wise5/classroomMonitor/milestones/milestones.html',
                    controller: 'MilestonesController',
                    controllerAs: 'milestonesController'
                })
                .state('root.notebooks', {
                    url: '/notebook',
                    templateUrl: 'wise5/classroomMonitor/notebook/notebook.html',
                    controller: 'NotebookGradingController',
                    controllerAs: 'notebookGradingController',
                    resolve: {
                        notebook: function (NotebookService, ConfigService, config, project, StudentAssetService) {
                            if (!ConfigService.isPreview()) {
                                //StudentAssetService.retrieveAssets().then((studentAssets) => {
                                    return NotebookService.retrieveNotebookItems().then((notebook) => {
                                        return notebook;
                                    });
                                //});
                            } else {
                                return NotebookService.notebook;
                            }
                        }
                    }
                });

            $httpProvider.interceptors.push('HttpInterceptor');

            // Set up Translations
            $translatePartialLoaderProvider.addPart('i18n');
            $translatePartialLoaderProvider.addPart('classroomMonitor/i18n');
            $translateProvider.useLoader('$translatePartialLoader', {
                    urlTemplate: 'wise5/{part}/i18n_{lang}.json'
            })
            .fallbackLanguage(['en'])
            .registerAvailableLanguageKeys(['el','en','es','ja','ko','pt','tr','zh_CN','zh_TW'], {
                'en_US': 'en',
                'en_UK': 'en'
            })
            .determinePreferredLanguage()
            .useSanitizeValueStrategy('sanitizeParameters', 'escape');

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
                .primaryPalette('blue', {
                    'default': '800'
                })
                .accentPalette('accent',  {
                    'default': '500'
                })
                .warnPalette('red', {
                    'default': '800'
                });

            var lightMap = $mdThemingProvider.extendPalette('grey', {
                'A100': 'ffffff'
            });
            $mdThemingProvider.definePalette('light', lightMap);

            $mdThemingProvider.theme('light')
                .primaryPalette('light', {
                    'default': 'A100'
                })
                .accentPalette('blue', {
                    'default': '900'
                });

            $mdThemingProvider.setDefaultTheme('default');
            $mdThemingProvider.enableBrowserColor();

            // moment.js default overrides
            // TODO: add i18n support
            moment.updateLocale('en', {
                calendar: {
                    lastDay : '[Yesterday at] LT',
                    sameDay : '[Today at] LT',
                    nextDay : '[Tomorrow at] LT',
                    lastWeek : '[last] dddd [at] LT',
                    nextWeek : 'dddd [at] LT',
                    sameElse : 'll'
                }
            });
        }]);

export default classroomMonitorModule;
