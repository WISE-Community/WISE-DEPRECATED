'use strict';

import $ from 'jquery';
import angular from 'angular';
import angularFileUpload from 'ng-file-upload';
import angularHighcharts from 'highcharts-ng';
import angularMaterial from 'angular-material';
import angularMoment from 'angular-moment';
import angularSanitize from 'angular-sanitize';
import angularToArrayFilter from 'lib/angular-toArrayFilter/toArrayFilter';
import angularUIRouter from 'angular-ui-router';
import angularUITree from 'angular-ui-tree';
import angularWebSocket from 'angular-websocket';
import AnnotationController from '../controllers/annotationController';
import AnnotationService from '../services/annotationService';
//import AudioRecorderService from '../components/audioRecorder/audioRecorderService';
import ConfigService from '../services/configService';
//import CRaterService from '../components/cRater/cRaterService';
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
import HTMLService from '../components/html/htmlService';
import HTMLController from '../components/html/htmlController';
import HttpInterceptor from '../services/httpInterceptor';
import LabelController from '../components/label/labelController';
import LabelService from '../components/label/labelService';
import MatchController from '../components/match/matchController';
import MatchService from '../components/match/matchService';
import MultipleChoiceController from '../components/multipleChoice/multipleChoiceController';
import MultipleChoiceService from '../components/multipleChoice/multipleChoiceService';
import NavigationController from './navigation/navigationController';
import NodeController from '../node/nodeController';
import NodeService from '../services/nodeService';
import Notebook from './notebook/notebook';
import NotebookService from '../services/notebookService';
import OpenResponseController from '../components/openResponse/openResponseController';
import OpenResponseService from '../components/openResponse/openResponseService';
import OutsideURLController from '../components/outsideURL/outsideURLController';
import OutsideURLService from '../components/outsideURL/outsideURLService';
//import PhotoBoothService from '../components/photoBooth/photoBoothService';
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
import VLEController from './vleController';

import ocLazyLoad from 'oclazyload';
import moment from 'moment';

let mainModule = angular.module('vle', [
    'angularMoment',
    'angular-toArrayFilter',
    'directives',
    'filters',
    'highcharts-ng',
    //'ngAudio',
    'ngAria',
    'ngFileUpload',
    'ngMaterial',
    'ngSanitize',
    'ngWebSocket',
    'notebook',
    'oc.lazyLoad',
    'ui.router',
    //'ui.tinymce',
    'ui.tree'
    ])

    .service(AnnotationService.name, AnnotationService)
    //.service(AudioRecorderService.name, AudioRecorderService)
    .service(ConfigService.name, ConfigService)
    //.service(CRaterService.name, CRaterService)
    .service(DiscussionService.name, DiscussionService)
    .service(DrawService.name, DrawService)
    .service(EmbeddedService.name, EmbeddedService)
    .service(GraphService.name, GraphService)
    .service(HTMLService.name, HTMLService)
    .service(HttpInterceptor.name, HttpInterceptor)
    .service(LabelService.name, LabelService)
    .service(MatchService.name, MatchService)
    .service(MultipleChoiceService.name, MultipleChoiceService)
    .service(NodeService.name, NodeService)
    .service(NotebookService.name, NotebookService)
    .service(OpenResponseService.name, OpenResponseService)
    .service(OutsideURLService.name, OutsideURLService)
    //.service(PhotoBoothService.name, PhotoBoothService)
    .service(ProjectService.name, ProjectService)
    .service(SessionService.name, SessionService)
    .service(StudentAssetService.name, StudentAssetService)
    .service(StudentDataService.name, StudentDataService)
    .service(StudentStatusService.name, StudentStatusService)
    .service(StudentWebSocketService.name, StudentWebSocketService)
    .service(TableService.name, TableService)
    .service(TeacherDataService.name, TeacherDataService)
    .service(UtilService.name, UtilService)
    .controller(AnnotationController.name, AnnotationController)
    .controller(DiscussionController.name, DiscussionController)
    .controller(DrawController.name, DrawController)
    .controller(EmbeddedController.name, EmbeddedController)
    .controller(GraphController.name, GraphController)
    .controller(HTMLController.name, HTMLController)
    .controller(LabelController.name, LabelController)
    .controller(MatchController.name, MatchController)
    .controller(MultipleChoiceController.name, MultipleChoiceController)
    .controller(NavigationController.name, NavigationController)
    .controller(NodeController.name, NodeController)
    .controller(VLEController.name, VLEController)
    .controller(OpenResponseController.name, OpenResponseController)
    .controller(OutsideURLController.name, OutsideURLController)
    .controller(TableController.name, TableController)
    .filter(Filters.name, Filters)
    .config([
        '$urlRouterProvider',
        '$stateProvider',
        '$controllerProvider',
        '$mdThemingProvider',
        '$httpProvider',
        '$provide',
        function($urlRouterProvider,
                 $stateProvider,
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
                        sessionTimers: function (SessionService, config,   project, studentData) {
                            return SessionService.initializeSession();
                        },
                        webSocket: function (StudentWebSocketService, config, project) {
                            return StudentWebSocketService.initialize();
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
                                let wiseBaseURL = ConfigService.getConfigParam('wiseBaseURL');
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
                });

            $httpProvider.interceptors.push('HttpInterceptor');

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
                    s:  "just now",
                    m:  "1 min ago",
                    mm: "%d mins ago",
                    h:  "1 hr ago",
                    hh: "%d hrs ago",
                    d:  "1 day ago",
                    dd: "%d days ago",
                    M:  "1 month ago",
                    MM: "%d months ago",
                    y:  "1 yr ago",
                    yy: "%d yrs ago"
                }
            });
        }
    ]);

export default mainModule;
