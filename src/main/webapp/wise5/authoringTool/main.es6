'use strict';

import $ from 'jquery';
import angular from 'angular';
import angularFileUpload from 'ng-file-upload';
import angularHighcharts from 'highcharts-ng';
import angularUIRouter from 'angular-ui-router';
import angularUITree from 'angular-ui-tree';
import angularMaterial from 'angular-material';
import angularMoment from 'angular-moment';
import angularSanitize from 'angular-sanitize';
import angularToArrayFilter from 'lib/angular-toArrayFilter/toArrayFilter';
import angularTranslate from 'angular-translate';
import angularTranslateLoaderPartial from 'angular-translate-loader-partial';
import angularWebSocket from 'angular-websocket';
import AnnotationService from '../services/annotationService';
import AudioOscillatorController from '../components/audioOscillator/audioOscillatorController';
import AudioOscillatorService from '../components/audioOscillator/audioOscillatorService';
import AuthoringToolController from './authoringToolController';
import AuthoringToolMainController from './main/authoringToolMainController';
import AuthoringToolNewProjectController from './main/authoringToolNewProjectController';
import AuthorWebSocketService from '../services/authorWebSocketService';
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
import Highcharts from '../lib/highcharts@4.2.1';
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
import NotebookService from '../services/notebookService';
import OpenResponseController from '../components/openResponse/openResponseController';
import OpenResponseService from '../components/openResponse/openResponseService';
import OutsideURLController from '../components/outsideURL/outsideURLController';
import OutsideURLService from '../components/outsideURL/outsideURLService';
import ProjectAssetController from './asset/projectAssetController';
import ProjectAssetService from '../services/projectAssetService';
import ProjectController from './project/projectController';
import ProjectHistoryController from './history/projectHistoryController';
import ProjectService from '../services/projectService';
import SessionService from '../services/sessionService';
import StudentAssetService from '../services/studentAssetService';
import StudentDataService from '../services/studentDataService';
import StudentStatusService from '../services/studentStatusService';
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
    'ngSanitize',
    'ngWebSocket',
    'pascalprecht.translate',
    'ui.router',
    'ui.tree'
])
    .service(AnnotationService.name, AnnotationService)
    .service(AudioOscillatorService.name, AudioOscillatorService)
    .service(AuthorWebSocketService.name, AuthorWebSocketService)
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
    .service(NotebookService.name, NotebookService)
    .service(OpenResponseService.name, OpenResponseService)
    .service(OutsideURLService.name, OutsideURLService)
    .service(ProjectService.name, ProjectService)
    .service(ProjectAssetService.name, ProjectAssetService)
    .service(SessionService.name, SessionService)
    .service(StudentAssetService.name, StudentAssetService)
    .service(StudentDataService.name, StudentDataService)
    .service(StudentStatusService.name, StudentStatusService)
    .service(TableService.name, TableService)
    .service(TeacherDataService.name, TeacherDataService)
    .service(UtilService.name, UtilService)
    .controller(AudioOscillatorController.name, AudioOscillatorController)
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
    .controller(ProjectAssetController.name, ProjectAssetController)
    .controller(ProjectController.name, ProjectController)
    .controller(ProjectHistoryController.name, ProjectHistoryController)
    .controller(TableController.name, TableController)
    .config(['$urlRouterProvider',
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

            $urlRouterProvider.otherwise('/');

            $stateProvider
                .state('root', {
                    url: '',
                    abstract: true,
                    templateUrl: 'wise5/authoringTool/authoringTool.html',
                    controller: 'AuthoringToolController',
                    controllerAs: 'authoringToolController',
                    resolve: {
                    }
                })
                .state('root.main', {
                    url: '/',
                    templateUrl: 'wise5/authoringTool/main/main.html',
                    controller: 'AuthoringToolMainController',
                    controllerAs: 'authoringToolMainController',
                    resolve: {
                        config: (ConfigService) => {
                            var configURL = window.configURL;

                            return ConfigService.retrieveConfig(configURL);
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
                .state('root.new', {
                    url: '/new',
                    templateUrl: 'wise5/authoringTool/main/new.html',
                    controller: 'AuthoringToolNewProjectController',
                    controllerAs: 'authoringToolNewProjectController',
                    resolve: {
                        config: (ConfigService) => {
                            var configURL = window.configURL;

                            return ConfigService.retrieveConfig(configURL);
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
                .state('root.project', {
                    url: '/project/:projectId',
                    templateUrl: 'wise5/authoringTool/project/project.html',
                    controller: 'ProjectController',
                    controllerAs: 'projectController',
                    resolve: {
                        projectConfig: (ConfigService, $stateParams) => {
                            var configURL = window.configURL + '/' + $stateParams.projectId;

                            return ConfigService.retrieveConfig(configURL);
                        },
                        project: (ProjectService, projectConfig) => {
                            return ProjectService.retrieveProject();
                        },
                        projectAssets: (ProjectAssetService, projectConfig) => {
                            return ProjectAssetService.retrieveProjectAssets();
                        },
                        language: ($translate, ConfigService, projectConfig) => {
                            let locale = ConfigService.getLocale();  // defaults to "en"
                            $translate.use(locale);
                        },
                        sessionTimers: (SessionService, projectConfig) => {
                            return SessionService.initializeSession();
                        }
                        /*,
                        webSocket: (AuthorWebSocketService, projectConfig, $stateParams) => {
                            return AuthorWebSocketService.initialize($stateParams.projectId);
                        }
                        */
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
                .state('root.project.history', {
                    url: '/history',
                    templateUrl: 'wise5/authoringTool/history/history.html',
                    controller: 'ProjectHistoryController',
                    controllerAs: 'projectHistoryController',
                    resolve: {
                    }
                });

            // Set up Translations
            $translatePartialLoaderProvider.addPart('common');
            $translatePartialLoaderProvider.addPart('authoringTool');
            $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: 'wise5/i18n/{part}/i18n_{lang}.json'
            });
            $translateProvider.fallbackLanguage(['en']);
            $translateProvider.registerAvailableLanguageKeys(['en','es','ja','ko','pt','zh_CN'], {
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
