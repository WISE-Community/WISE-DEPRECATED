'use strict';

import $ from 'jquery';
import angular from 'angular';
import angularDragula from 'angular-dragula';
import angularFileUpload from 'ng-file-upload';
import angularHighcharts from 'highcharts-ng';
import angularMaterial from 'angular-material';
import angularMoment from 'angular-moment';
import angularSanitize from 'angular-sanitize';
import angularToArrayFilter from 'lib/angular-toArrayFilter/toArrayFilter';
import angularTranslate from 'angular-translate';
import angularTranslateLoaderPartial from 'angular-translate-loader-partial';
import angularUIRouter from 'angular-ui-router';
import angularUIScrollpoint from 'angular-ui-scrollpoint';
import angularWebSocket from 'angular-websocket';
import AnnotationService from '../services/annotationService';
import AudioOscillatorComponentModule from '../components/audioOscillator/audioOscillatorComponentModule';
import ConceptMapComponentModule from '../components/conceptMap/conceptMapComponentModule';
import ConfigService from '../services/configService';
import CRaterService from '../services/cRaterService';
import Components from '../directives/components';
import DiscussionComponentModule from '../components/discussion/discussionComponentModule';
import DrawComponentModule from '../components/draw/drawComponentModule';
import EmbeddedComponentModule from '../components/embedded/embeddedComponentModule';
import Filters from '../filters/filters';
import Highcharts from '../lib/highcharts@4.2.1';
import draggablePoints from '../lib/draggable-points/draggable-points';
import GraphComponentModule from '../components/graph/graphComponentModule';
import HTMLComponentModule from '../components/html/htmlComponentModule';
import HttpInterceptor from '../services/httpInterceptor';
import LabelComponentModule from '../components/label/labelComponentModule';
import MatchComponentModule from '../components/match/matchComponentModule';
import MultipleChoiceComponentModule from '../components/multipleChoice/multipleChoiceComponentModule';
import NavigationController from './navigation/navigationController';
import NodeController from '../node/nodeController';
import NodeService from '../services/nodeService';
import Notebook from './notebook/notebook';
import NotebookService from '../services/notebookService';
import NotificationService from '../services/notificationService';
import OpenResponseComponentModule from '../components/openResponse/openResponseComponentModule';
import OutsideURLComponentModule from '../components/outsideURL/outsideURLComponentModule';
import ProjectService from '../services/projectService';
import SessionService from '../services/sessionService';
import StudentAsset from './studentAsset/studentAsset';
import StudentAssetService from '../services/studentAssetService';
import StudentDataService from '../services/studentDataService';
import StudentStatusService from '../services/studentStatusService';
import StudentWebSocketService from '../services/studentWebSocketService';
import TableComponentModule from '../components/table/tableComponentModule';
import UtilService from '../services/utilService';
import VLEController from './vleController';
import ocLazyLoad from 'oclazyload';
import moment from 'moment';

//import bootstrap from 'bootstrap';
//import summernote from 'summernote';
import angularSummernote from 'lib/angular-summernote/dist/angular-summernote.min';

let vleModule = angular.module('vle', [
    angularDragula(angular),
    'angularMoment',
    'angular-toArrayFilter',
    'audioOscillatorComponentModule',
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
    'ngAria',
    'ngFileUpload',
    'ngMaterial',
    'ngSanitize',
    'ngWebSocket',
    'notebook',
    'oc.lazyLoad',
    'openResponseComponentModule',
    'outsideURLComponentModule',
    'pascalprecht.translate',
    'studentAsset',
    'summernote',
    'tableComponentModule',
    'ui.router',
    'ui.scrollpoint'
    ])
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
    .service(UtilService.name, UtilService)
    .controller(NavigationController.name, NavigationController)
    .controller(NodeController.name, NodeController)
    .controller(VLEController.name, VLEController)
    .filter(Filters.name, Filters)
    .config([
        '$urlRouterProvider',
        '$stateProvider',
        '$translateProvider',
        '$translatePartialLoaderProvider',
        '$controllerProvider',
        '$mdThemingProvider',
        '$httpProvider',
        '$provide',
        function($urlRouterProvider,
                 $stateProvider,
                 $translateProvider,
                 $translatePartialLoaderProvider,
                 $controllerProvider,
                 $mdThemingProvider,
                 $httpProvider,
                 $provide) {

            $urlRouterProvider.otherwise('/vle/');

            angular.module('vle').$controllerProvider = $controllerProvider;

            $stateProvider
                .state('root', {
                    url: '',
                    abstract: true,
                    templateProvider: ['$http', 'ProjectService', function ($http, ProjectService) {
                        var themePath = ProjectService.getThemePath();
                        return $http.get(themePath + '/vle.html').then(
                            response => {
                                return response.data;
                            });
                    }],
                    controller: 'VLEController',
                    controllerAs: 'vleController',
                    resolve: {
                        config: function (ConfigService) {
                            let configURL = window.configURL;
                            return ConfigService.retrieveConfig(configURL);
                        },
                        project: function (ProjectService, config) {
                            return ProjectService.retrieveProject();
                        },
                        studentData: function (StudentDataService, config, project) {
                            return StudentDataService.retrieveStudentData();
                        },
                        notebook: function (NotebookService, ConfigService, StudentAssetService, studentData, config, project) {
                            if (!ConfigService.isPreview()) {
                                StudentAssetService.retrieveAssets().then((studentAssets) => {
                                    NotebookService.retrieveNotebookItems(ConfigService.getWorkgroupId()).then((notebook) => {
                                        return notebook;
                                    });
                                });
                            } else {
                                return NotebookService.notebook;
                            }
                        },
                        notifications: function (NotificationService, studentData, config, project) {
                            return NotificationService.retrieveNotifications();
                        },
                        runStatus: function(StudentDataService, config) {
                            return StudentDataService.retrieveRunStatus();
                        },
                        sessionTimers: function (SessionService, config, project, studentData) {
                            return SessionService.initializeSession();
                        },
                        webSocket: function (StudentWebSocketService, config, project) {
                            return StudentWebSocketService.initialize();
                        },
                        language: ($translate, ConfigService, config) => {
                            let locale = ConfigService.getLocale();  // defaults to "en"
                            $translate.use(locale);
                        },
                        theme: function (ProjectService, config, project, $ocLazyLoad, $q) {
                            let theme = ProjectService.getThemePath() + '/theme.js';
                            let def = $q.defer();

                  					System.import(theme).then(m => {
                  						let themeModule = m.default;
                  						if (!m.default.name) {
                  							let key = Object.keys(m.default);
                  							themeModule = m.default[key[0]];
                  						}

                  						$ocLazyLoad.load(themeModule).then(() => {
                  							def.resolve();
                  						}, err => {
                  							throw err;
                  						});
                  					});

                  					return def.promise;
                        }
                    }
                })
                .state('root.vle', {
                    url: '/vle/:nodeId',
                    views: {
                        'nodeView': {
                            templateProvider: ['$http', 'ConfigService', function ($http, ConfigService) {
                                let wiseBaseURL = ConfigService.getWISEBaseURL();
                                return $http.get(wiseBaseURL + '/wise5/node/index.html').then(
                                    response => {
                                        return response.data;
                                    }
                                );
                            }],
                            controller: 'NodeController',
                            controllerAs: 'nodeController'
                        }
                    }
                })
                .state('root.notebook', {
                    url: '/notebook/:nodeid',
                    views: {
                        'notebookView': {
                            templateProvider: ['$http', 'ConfigService', function ($http, ConfigService) {
                                let wiseBaseURL = ConfigService.getWISEBaseURL();
                                return $http.get(wiseBaseURL + '/wise5/notebook/index.html').then(
                                    response => {
                                        return response.data;
                                    }
                                );
                            }]
                        }
                    }
                });

            $httpProvider.interceptors.push('HttpInterceptor');

            // Set up Translations
            $translatePartialLoaderProvider.addPart('common');
            $translatePartialLoaderProvider.addPart('vle');
            $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: 'wise5/i18n/{part}/i18n_{lang}.json'
            });
            $translateProvider.fallbackLanguage(['en']);
            $translateProvider.registerAvailableLanguageKeys(['en','ja','ko','pt','tr','zh_CN'], {
                'en_US': 'en',
                'en_UK': 'en'
            });
            $translateProvider.useSanitizeValueStrategy('sanitizeParameters', 'escape');

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

            // moment.js default overrides
            moment.locale('en', {
                calendar : {
                    lastDay : '[Yesterday at] LT',
                    sameDay : '[Today at] LT',
                    nextDay : '[Tomorrow at] LT',
                    lastWeek : '[Last] dddd [at] LT',
                    nextWeek : 'dddd [at] LT',
                    sameElse : 'MMM D, YYYY [at] LT'
                },
                relativeTime : {
                    future: "in %s",
                    past:   "%s",
                    s:  "seconds ago",
                    m:  "1 minute ago",
                    mm: "%d minutes ago",
                    h:  "1 hour ago",
                    hh: "%d hours ago",
                    d:  "1 day ago",
                    dd: "%d days ago",
                    M:  "1 month ago",
                    MM: "%d months ago",
                    y:  "1 year ago",
                    yy: "%d years ago"
                }
            });
        }
    ]);

export default vleModule;
