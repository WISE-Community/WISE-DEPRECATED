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
import Highcharts from 'highcharts';
//import HTMLService from '../components/html/htmlService';
import HTMLController from '../components/html/htmlController';
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
    //.service(HTMLService.name, HTMLService)
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
        function($urlRouterProvider,
                 $stateProvider,
                 $controllerProvider,
                 $mdThemingProvider) {

            $urlRouterProvider.otherwise('/vle/');

            angular.module('vle').$controllerProvider = $controllerProvider;

            $stateProvider
                .state('root', {
                    url: '',
                    abstract: true,
                    templateProvider: ['$http', 'ProjectService', function ($http, ProjectService) {
                        var vlePath = ProjectService.getThemePath();
                        return $http.get(vlePath + '/vle.html').then(
                            function (response) {
                                return response.data;
                            }
                        );
                    }],
                    controller: 'VLEController',
                    controllerAs: 'vleController',
                    resolve: {
                        config: function (ConfigService) {
                            var configURL = window.configURL;
                            return ConfigService.retrieveConfig(configURL);
                        },
                        project: function (ProjectService, config) {
                            return ProjectService.retrieveProject();
                        },
                        studentData: function (StudentDataService, config, project) {
                            return StudentDataService.retrieveStudentData();
                        },
                        sessionTimers: function (SessionService, config, project, studentData) {
                            return SessionService.initializeSession();
                        },
                        webSocket: function (StudentWebSocketService, config) {
                            return StudentWebSocketService.initialize();
                        }
                    }
                })
                .state('root.vle', {
                    url: '/vle/:nodeId',
                    views: {
                        'nodeView': {
                            templateProvider: ['$http', 'ConfigService', function ($http, ConfigService) {
                                var wiseBaseURL = ConfigService.getConfigParam('wiseBaseURL');
                                return $http.get(wiseBaseURL + '/wise5/node/index.html').then(
                                    function (response) {
                                        return response.data;
                                    }
                                );
                            }],
                            controller: 'NodeController',
                            controllerAs: 'nodeController',
                            resolve: {
                                load: () => {
                                    /*
                                    System.import('components/audioRecorder/audioRecorderController').then((AudioRecorderController) => {
                                        $controllerProvider.register(AudioRecorderController.default.name, AudioRecorderController.default);
                                    });
                                    */
                                    /*
                                    System.import('components/cRater/cRaterController').then((CRaterController) => {
                                        $controllerProvider.register(CRaterController.default.name, CRaterController.default);
                                    });
                                    */
                                    /*
                                    System.import('components/discussion/discussionController').then((DiscussionController) => {
                                        $controllerProvider.register(DiscussionController.default.name, DiscussionController.default);
                                    });

                                    System.import('components/draw/drawController').then((DrawController) => {
                                        $controllerProvider.register(DrawController.default.name, DrawController.default);
                                    });

                                    System.import('components/embedded/embeddedController').then((EmbeddedController) => {
                                        $controllerProvider.register(EmbeddedController.default.name, EmbeddedController.default);
                                    });

                                    System.import('components/graph/graphController').then((GraphController) => {
                                        $controllerProvider.register(GraphController.default.name, GraphController.default);
                                    });

                                    System.import('components/html/htmlController').then((HTMLController) => {
                                        $controllerProvider.register(HTMLController.default.name, HTMLController.default);
                                    });

                                    System.import('components/label/labelController').then((LabelController) => {
                                        $controllerProvider.register(LabelController.default.name, LabelController.default);
                                    });

                                    System.import('components/match/matchController').then((MatchController) => {
                                        $controllerProvider.register(MatchController.default.name, MatchController.default);
                                    });

                                    System.import('components/multipleChoice/multipleChoiceController').then((MultipleChoiceController) => {
                                        $controllerProvider.register(MultipleChoiceController.default.name, MultipleChoiceController.default);
                                    });
                                    System.import('components/openResponse/openResponseController').then((OpenResponseController) => {
                                        $controllerProvider.register(OpenResponseController.default.name, OpenResponseController.default);
                                    });

                                    System.import('components/outsideURL/outsideURLController').then((OutsideURLController) => {
                                        $controllerProvider.register(OutsideURLController.default.name, OutsideURLController.default);
                                    });
                                     */
                                    /*
                                    System.import('components/photoBooth/photoBoothController').then((PhotoBoothController) => {
                                        $controllerProvider.register(PhotoBoothController.default.name, PhotoBoothController.default);
                                    });
                                    System.import('components/table/tableController').then((TableController) => {
                                        $controllerProvider.register(TableController.default.name, TableController.default);
                                    });
                                     */
                                }
                            }
                        }
                    }
                });

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

/*
require.config({
    baseUrl: 'wise5/',
    waitSeconds: 0,
    paths: {
        'angular': [
            '//ajax.googleapis.com/ajax/libs/angularjs/1.3.20/angular.min',
            'vendor/angular/angular.min'
            ],
        'angularAnimate': 'vendor/angular-animate/angular-animate.min',
        'angularAria': 'vendor/angular-aria/angular-aria.min',
        'angularAudio': 'vendor/angular-audio/app/angular.audio',
        'angularDragDrop': 'vendor/angular-dragdrop/src/angular-dragdrop.min',
        'angularFileUpload': 'vendor/ng-file-upload/ng-file-upload.min',
        'angularMaterial': 'vendor/angular-material/angular-material.min',
        'angularMoment': 'vendor/angular-moment/angular-moment.min',
        'angularSanitize': 'vendor/angular-sanitize/angular-sanitize.min',
        'angularSortable': 'vendor/angular-ui-sortable/sortable.min',
        'angularToArrayFilter': 'vendor/angular-toArrayFilter/toArrayFilter',
        'angularUIRouter': 'vendor/angular-ui-router/release/angular-ui-router.min',
        'angularUITinymce': 'vendor/angular-ui-tinymce/src/tinymce',
        'angularUITree': 'vendor/angular-ui-tree/dist/angular-ui-tree.min',
        'angularWebSocket': 'vendor/angular-websocket/angular-websocket.min',
        'annotationController': 'controllers/annotationController',
        'annotationService': 'services/annotationService',
        'app': 'vle/app',
        'audioRecorderController': 'components/audioRecorder/audioRecorderController',
        'audioRecorderService': 'components/audioRecorder/audioRecorderService',
        'bootstrap': [ // TODO: remove once no longer using
            '//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min',
            'lib/bootstrap/bootstrap.min'
            ],
        'configService': 'services/configService',
        'cRaterController': 'components/cRater/cRaterController',
        'cRaterService': 'components/cRater/cRaterService',
        'd3': 'lib/d3/d3',
        'drawingTool': 'lib/drawingTool/drawing-tool',
        'vendor': 'lib/drawingTool/vendor',
        'directives': 'directives/directives',
        'discussionController': 'components/discussion/discussionController',
        'discussionService': 'components/discussion/discussionService',
        'draggablePoints': 'vendor/draggable-points/draggable-points',
        'drawController': 'components/draw/drawController',
        'drawService': 'components/draw/drawService',
        'embeddedController': 'components/embedded/embeddedController',
        'embeddedService': 'components/embedded/embeddedService',
        'fabric': 'vendor/fabric/dist/fabric.min',
        'filters': 'filters/filters',
        'graphController': 'components/graph/graphController',
        'graphService': 'components/graph/graphService',
        'highcharts': 'vendor/highcharts/lib/highcharts',
        'highcharts-more': 'vendor/highcharts/lib/highcharts-more',
        'highcharts-ng': 'vendor/highcharts-ng/dist/highcharts-ng',
        'htmlController': 'components/html/htmlController',
        'htmlService': 'components/html/htmlService',
        'jquery': [
            '//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min',
            'vendor/jquery/dist/jquery.min'
            ],
        'jqueryUI': [ // TODO: switch to pared down custom build
            '//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min',
            'vendor/jquery-ui/jquery-ui.min'
            ],
        'labelController': 'components/label/labelController',
        'labelService': 'components/label/labelService',
        'matchController': 'components/match/matchController',
        'matchService': 'components/match/matchService',
        'moment': 'vendor/moment/min/moment.min',
        'multipleChoiceController': 'components/multipleChoice/multipleChoiceController',
        'multipleChoiceService': 'components/multipleChoice/multipleChoiceService',
        'navigationController': 'vle/navigation/navigationController',
        'nodeController': 'node/nodeController',
        'nodeService': 'services/nodeService',
        'ocLazyLoad': 'vendor/oclazyload/dist/ocLazyLoad.require',
        'openResponseController': 'components/openResponse/openResponseController',
        'openResponseService': 'components/openResponse/openResponseService',
        'outsideURLController': 'components/outsideURL/outsideURLController',
        'outsideURLService': 'components/outsideURL/outsideURLService',
        'photoBoothController': 'components/photoBooth/photoBoothController',
        'photoBoothService': 'components/photoBooth/photoBoothService',
        'planningController': 'components/planning/planningController',
        'planningService': 'components/planning/planningService',
        'notebook': 'vle/notebook/notebook',
        //'notebookController': 'vle/notebook/notebookController',
        'notebookService': 'services/notebookService',
        'projectService': 'services/projectService',
        'sessionService': 'services/sessionService',
        'studentAssetService': 'services/studentAssetService',
        'studentDataService': 'services/studentDataService',
        'studentStatusService': 'services/studentStatusService',
        'studentWebSocketService': 'services/studentWebSocketService',
        'tableController': 'components/table/tableController',
        'tableService': 'components/table/tableService',
        'teacherDataService': 'services/teacherDataService',
        'tinymce': 'vendor/tinymce-dist/tinymce.min',
        'utilService': 'services/utilService',
        'vleController': 'vle/vleController',
        'webfont': [
            '//ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont',
            'vendor/webfontloader/webfontloader'
            ],
        'webfonts': 'js/webfonts'
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
        'angularAudio': {
            'exports': 'angularAudio',
            'deps': [
                    'angular'
                    ]
        },
        'angularDragDrop': {
            'exports': 'angularDragDrop',
            'deps': [
                    'angular'
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
        'angularMoment': {
            'exports': 'angularMoment',
            'deps': [
                'angular',
                'moment'
            ]
        },
        'angularSanitize': {
            'exports': 'angularSanitize',
            'deps': [
                'angular'
            ]
        },
        'angularSortable': {
            'exports': 'angularSortable',
            'deps': [
                     'angular'
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
        'angularUITinymce': {
            'exports': 'angularUITinymce',
            'deps': [
                'tinymce',
                'angular'
            ]
        },
        'angularUITree': {
            'exports': 'angularUITree',
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
        'bootstrap': {
            'exports': 'bootstrap',
            'deps': [
                    'jquery'
                    ]
        },
        'draggablePoints': {
            'exports': 'draggablePoints',
            'deps': [
                'angular',
                'highcharts'
            ]
        },
        'drawingTool': {
            'exports': 'drawingTool',
            'deps': [
                'vendor'
            ]
        },
        'fabric': {
            'exports': 'fabric'
        },
        'highcharts': {
            'exports': 'highcharts',
            'deps': [
                    'angular',
                    'jquery'
                    ]
        },
        'highcharts-more': {
            'exports': 'highcharts-more',
            'deps': [
                    'angular',
                    'highcharts'
                    ]
        },
        'highcharts-ng': {
            'exports': 'highcharts-ng',
            'deps': [
                    'angular',
                    'highcharts'
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
        },
        'moment': {
            'exports': 'moment'
        },
        'ocLazyLoad': {
            'expports': 'ocLazyLoad',
            'deps': [
                    'angular'
            ]
        },
        'tinymce': {
            'exports': 'tinymce'
        },
        'vendor': {
            'exports': 'vendor'
        },
        'webfont': {
            'exports': 'webfont'
        },
        'webfonts': {
            'exports': 'webfonts',
            'deps': [
                'webfont'
            ]
        }
    }
});

require(['app'],function(app){
    app.init();
});
*/
