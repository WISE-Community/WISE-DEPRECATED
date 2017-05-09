'use strict';

import '../themes/default/js/webfonts';
import $ from 'jquery';
import angular from 'angular';
import angularDragula from 'angular-dragula';
import angularFileUpload from 'ng-file-upload';
import angularHighcharts from 'highcharts-ng';
import angularUIRouter from 'angular-ui-router';
import angularMaterial from 'angular-material';
import angularMoment from 'angular-moment';
import angularSanitize from 'angular-sanitize';
import angularToArrayFilter from 'lib/angular-toArrayFilter/toArrayFilter';
import angularTranslate from 'angular-translate';
import angularTranslateLoaderPartial from 'angular-translate-loader-partial';
import angularWebSocket from 'angular-websocket';
import AnnotationService from '../services/annotationService';
import AudioOscillatorComponentModule from '../components/audioOscillator/audioOscillatorComponentModule';
import AuthoringToolComponents from './authoringToolComponents';
import AuthoringToolController from './authoringToolController';
import AuthoringToolMainController from './main/authoringToolMainController';
import AuthoringToolNewProjectController from './main/authoringToolNewProjectController';
import AuthorNotebookController from './notebook/authorNotebookController';
import AuthorWebSocketService from '../services/authorWebSocketService';
import ConceptMapComponentModule from '../components/conceptMap/conceptMapComponentModule';
import ConfigService from '../services/configService';
import CRaterService from '../services/cRaterService';
import Components from '../directives/components';
import DiscussionComponentModule from '../components/discussion/discussionComponentModule';
import DrawComponentModule from '../components/draw/drawComponentModule';
import EmbeddedComponentModule from '../components/embedded/embeddedComponentModule';
import Filters from '../filters/filters';
import Highcharts from '../lib/highcharts@4.2.1';
import GraphComponentModule from '../components/graph/graphComponentModule';
import HTMLComponentModule from '../components/html/htmlComponentModule';
import LabelComponentModule from '../components/label/labelComponentModule';
import MatchComponentModule from '../components/match/matchComponentModule';
import MultipleChoiceComponentModule from '../components/multipleChoice/multipleChoiceComponentModule';
import NodeAuthoringController from './node/nodeAuthoringController';
import NodeService from '../services/nodeService';
import Notebook from '../directives/notebook/notebook';
import NotebookService from '../services/notebookService';
import NotificationService from '../services/notificationService';
import OpenResponseComponentModule from '../components/openResponse/openResponseComponentModule';
import OutsideURLComponentModule from '../components/outsideURL/outsideURLComponentModule';
import ProjectAssetController from './asset/projectAssetController';
import ProjectAssetService from '../services/projectAssetService';
import ProjectController from './project/projectController';
import ProjectHistoryController from './history/projectHistoryController';
import ProjectService from '../services/projectService';
import SessionService from '../services/sessionService';
import StudentAssetService from '../services/studentAssetService';
import StudentDataService from '../services/studentDataService';
import StudentStatusService from '../services/studentStatusService';
import StudentWebSocketService from '../services/studentWebSocketService';
import TableComponentModule from '../components/table/tableComponentModule';
import TeacherDataService from '../services/teacherDataService';
import TeacherWebSocketService from '../services/teacherWebSocketService';
import UtilService from '../services/utilService';
import WISELinkAuthoringController from './wiseLink/wiseLinkAuthoringController';

import angularSummernote from 'lib/angular-summernote/dist/angular-summernote.min';

let authoringModule = angular.module('authoring', [
    angularDragula(angular),
    'angularMoment',
    'angular-toArrayFilter',
    'audioOscillatorComponentModule',
    'authoringTool.components',
    'components',
    'conceptMapComponentModule',
    'discussionComponentModule',
    'drawComponentModule',
    'embeddedComponentModule',
    'filters',
    'graphComponentModule',
    'highcharts-ng',
    'htmlComponentModule',
    'labelComponentModule',
    'matchComponentModule',
    'multipleChoiceComponentModule',
    'ngAnimate',
    'ngAria',
    'ngFileUpload',
    'ngMaterial',
    'ngSanitize',
    'ngWebSocket',
    'notebook',
    'openResponseComponentModule',
    'outsideURLComponentModule',
    'pascalprecht.translate',
    'summernote',
    'tableComponentModule',
    'ui.router'
    ])
    .service(AnnotationService.name, AnnotationService)
    .service(AuthorWebSocketService.name, AuthorWebSocketService)
    .service(ConfigService.name, ConfigService)
    .service(CRaterService.name, CRaterService)
    .service(NodeService.name, NodeService)
    .service(NotebookService.name, NotebookService)
    .service(NotificationService.name, NotificationService)
    .service(ProjectService.name, ProjectService)
    .service(ProjectAssetService.name, ProjectAssetService)
    .service(SessionService.name, SessionService)
    .service(StudentAssetService.name, StudentAssetService)
    .service(StudentDataService.name, StudentDataService)
    .service(StudentStatusService.name, StudentStatusService)
    .service(StudentWebSocketService.name, StudentWebSocketService)
    .service(TeacherDataService.name, TeacherDataService)
    .service(TeacherWebSocketService.name, TeacherWebSocketService)
    .service(UtilService.name, UtilService)
    .controller(AuthoringToolController.name, AuthoringToolController)
    .controller(AuthoringToolMainController.name, AuthoringToolMainController)
    .controller(AuthoringToolNewProjectController.name, AuthoringToolNewProjectController)
    .controller(AuthorNotebookController.name, AuthorNotebookController)
    .controller(NodeAuthoringController.name, NodeAuthoringController)
    .controller(ProjectAssetController.name, ProjectAssetController)
    .controller(ProjectController.name, ProjectController)
    .controller(ProjectHistoryController.name, ProjectHistoryController)
    .controller(WISELinkAuthoringController.name, WISELinkAuthoringController)
    .config([
        '$urlRouterProvider',
        '$stateProvider',
        '$translateProvider',
        '$translatePartialLoaderProvider',
        '$controllerProvider',
        '$mdThemingProvider',
        ($urlRouterProvider,
         $stateProvider,
         $translateProvider,
         $translatePartialLoaderProvider,
         $controllerProvider,
         $mdThemingProvider) => {

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
                        projectAssets: (ProjectAssetService, projectConfig, project) => {
                            return ProjectAssetService.retrieveProjectAssets();
                        },
                        language: ($translate, ConfigService, projectConfig) => {
                            let locale = ConfigService.getLocale();  // defaults to "en"
                            $translate.use(locale);
                        },
                        sessionTimers: (SessionService, projectConfig) => {
                            return SessionService.initializeSession();
                        },
                        webSocket: (AuthorWebSocketService, projectConfig) => {
                            return AuthorWebSocketService.initialize();
                        }
                    }
                })
                .state('root.project.node', {
                    url: '/node/:nodeId',
                    templateUrl: 'wise5/authoringTool/node/node.html',
                    controller: 'NodeAuthoringController',
                    controllerAs: 'nodeAuthoringController',
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
                })
                .state('root.project.notebook', {
                    url: '/notebook',
                    templateUrl: 'wise5/authoringTool/notebook/notebook.html',
                    controller: 'AuthorNotebookController',
                    controllerAs: 'authorNotebookController',
                    resolve: {
                    }
                });

            // Set up Translations
            $translatePartialLoaderProvider.addPart('i18n');
            $translatePartialLoaderProvider.addPart('authoringTool/i18n');
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

            // ngMaterial default theme configuration
            /*$mdThemingProvider.definePalette('primary', {
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
            });*/

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
                .primaryPalette('pink', {
                    'default': '900'
                })
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
                .accentPalette('pink', {
                    'default': '900'
                });

            $mdThemingProvider.setDefaultTheme('default');
    }]);

export default authoringModule;
