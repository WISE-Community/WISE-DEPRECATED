
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _jqueryUi = require('jquery-ui');

var _jqueryUi2 = _interopRequireDefault(_jqueryUi);

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _ngFileUpload = require('ng-file-upload');

var _ngFileUpload2 = _interopRequireDefault(_ngFileUpload);

var _highchartsNg = require('highcharts-ng');

var _highchartsNg2 = _interopRequireDefault(_highchartsNg);

var _angularMaterial = require('angular-material');

var _angularMaterial2 = _interopRequireDefault(_angularMaterial);

var _angularMoment = require('angular-moment');

var _angularMoment2 = _interopRequireDefault(_angularMoment);

var _angularSanitize = require('angular-sanitize');

var _angularSanitize2 = _interopRequireDefault(_angularSanitize);

var _toArrayFilter = require('lib/angular-toArrayFilter/toArrayFilter');

var _toArrayFilter2 = _interopRequireDefault(_toArrayFilter);

var _angularUiRouter = require('angular-ui-router');

var _angularUiRouter2 = _interopRequireDefault(_angularUiRouter);

var _angularUiTree = require('angular-ui-tree');

var _angularUiTree2 = _interopRequireDefault(_angularUiTree);

var _angularWebsocket = require('angular-websocket');

var _angularWebsocket2 = _interopRequireDefault(_angularWebsocket);

var _annotationController = require('../controllers/annotationController');

var _annotationController2 = _interopRequireDefault(_annotationController);

var _annotationService = require('../services/annotationService');

var _annotationService2 = _interopRequireDefault(_annotationService);

var _configService = require('../services/configService');

var _configService2 = _interopRequireDefault(_configService);

var _directives = require('../directives/directives');

var _directives2 = _interopRequireDefault(_directives);

var _discussionController = require('../components/discussion/discussionController');

var _discussionController2 = _interopRequireDefault(_discussionController);

var _discussionService = require('../components/discussion/discussionService');

var _discussionService2 = _interopRequireDefault(_discussionService);

var _drawController = require('../components/draw/drawController');

var _drawController2 = _interopRequireDefault(_drawController);

var _drawService = require('../components/draw/drawService');

var _drawService2 = _interopRequireDefault(_drawService);

var _embeddedController = require('../components/embedded/embeddedController');

var _embeddedController2 = _interopRequireDefault(_embeddedController);

var _embeddedService = require('../components/embedded/embeddedService');

var _embeddedService2 = _interopRequireDefault(_embeddedService);

var _graphController = require('../components/graph/graphController');

var _graphController2 = _interopRequireDefault(_graphController);

var _graphService = require('../components/graph/graphService');

var _graphService2 = _interopRequireDefault(_graphService);

var _highcharts = require('highcharts');

var _highcharts2 = _interopRequireDefault(_highcharts);

var _htmlController = require('../components/html/htmlController');

var _htmlController2 = _interopRequireDefault(_htmlController);

var _labelController = require('../components/label/labelController');

var _labelController2 = _interopRequireDefault(_labelController);

var _labelService = require('../components/label/labelService');

var _labelService2 = _interopRequireDefault(_labelService);

var _matchController = require('../components/match/matchController');

var _matchController2 = _interopRequireDefault(_matchController);

var _matchService = require('../components/match/matchService');

var _matchService2 = _interopRequireDefault(_matchService);

var _multipleChoiceController = require('../components/multipleChoice/multipleChoiceController');

var _multipleChoiceController2 = _interopRequireDefault(_multipleChoiceController);

var _multipleChoiceService = require('../components/multipleChoice/multipleChoiceService');

var _multipleChoiceService2 = _interopRequireDefault(_multipleChoiceService);

var _navigationController = require('./navigation/navigationController');

var _navigationController2 = _interopRequireDefault(_navigationController);

var _nodeController = require('../node/nodeController');

var _nodeController2 = _interopRequireDefault(_nodeController);

var _nodeService = require('../services/nodeService');

var _nodeService2 = _interopRequireDefault(_nodeService);

var _notebookService = require('../services/notebookService');

var _notebookService2 = _interopRequireDefault(_notebookService);

var _openResponseController = require('../components/openResponse/openResponseController');

var _openResponseController2 = _interopRequireDefault(_openResponseController);

var _openResponseService = require('../components/openResponse/openResponseService');

var _openResponseService2 = _interopRequireDefault(_openResponseService);

var _outsideURLController = require('../components/outsideURL/outsideURLController');

var _outsideURLController2 = _interopRequireDefault(_outsideURLController);

var _outsideURLService = require('../components/outsideURL/outsideURLService');

var _outsideURLService2 = _interopRequireDefault(_outsideURLService);

var _projectService = require('../services/projectService');

var _projectService2 = _interopRequireDefault(_projectService);

var _sessionService = require('../services/sessionService');

var _sessionService2 = _interopRequireDefault(_sessionService);

var _studentAssetService = require('../services/studentAssetService');

var _studentAssetService2 = _interopRequireDefault(_studentAssetService);

var _studentDataService = require('../services/studentDataService');

var _studentDataService2 = _interopRequireDefault(_studentDataService);

var _studentStatusService = require('../services/studentStatusService');

var _studentStatusService2 = _interopRequireDefault(_studentStatusService);

var _studentWebSocketService = require('../services/studentWebSocketService');

var _studentWebSocketService2 = _interopRequireDefault(_studentWebSocketService);

var _tableController = require('../components/table/tableController');

var _tableController2 = _interopRequireDefault(_tableController);

var _tableService = require('../components/table/tableService');

var _tableService2 = _interopRequireDefault(_tableService);

var _teacherDataService = require('../services/teacherDataService');

var _teacherDataService2 = _interopRequireDefault(_teacherDataService);

var _utilService = require('../services/utilService');

var _utilService2 = _interopRequireDefault(_utilService);

var _vleController = require('./vleController');

var _vleController2 = _interopRequireDefault(_vleController);

var _oclazyload = require('oclazyload');

var _oclazyload2 = _interopRequireDefault(_oclazyload);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import ocLazyLoad from '../vendor/oclazyload/dist/ocLazyLoad.require';

//import HTMLService from '../components/html/htmlService';

//import CRaterService from '../components/cRater/cRaterService';

var mainModule = _angular2.default.module('vle', ['angularMoment', 'angular-toArrayFilter', 'directives',
//'filters',
'highcharts-ng',
//'ngAudio',
'ngAria', 'ngFileUpload', 'ngMaterial', 'ngSanitize', 'ngWebSocket',
//'notebook',
'oc.lazyLoad', 'ui.router',
//'ui.tinymce',
'ui.tree']).service(_annotationService2.default.name, _annotationService2.default)
//.service(AudioRecorderService.name, AudioRecorderService)
.service(_configService2.default.name, _configService2.default)
//.service(CRaterService.name, CRaterService)
.service(_discussionService2.default.name, _discussionService2.default).service(_drawService2.default.name, _drawService2.default).service(_embeddedService2.default.name, _embeddedService2.default).service(_graphService2.default.name, _graphService2.default)
//.service(HTMLService.name, HTMLService)
.service(_labelService2.default.name, _labelService2.default).service(_matchService2.default.name, _matchService2.default).service(_multipleChoiceService2.default.name, _multipleChoiceService2.default).service(_nodeService2.default.name, _nodeService2.default).service(_notebookService2.default.name, _notebookService2.default).service(_openResponseService2.default.name, _openResponseService2.default).service(_outsideURLService2.default.name, _outsideURLService2.default)
//.service(PhotoBoothService.name, PhotoBoothService)
.service(_projectService2.default.name, _projectService2.default).service(_sessionService2.default.name, _sessionService2.default).service(_studentAssetService2.default.name, _studentAssetService2.default).service(_studentDataService2.default.name, _studentDataService2.default).service(_studentStatusService2.default.name, _studentStatusService2.default).service(_studentWebSocketService2.default.name, _studentWebSocketService2.default).service(_tableService2.default.name, _tableService2.default).service(_teacherDataService2.default.name, _teacherDataService2.default).service(_utilService2.default.name, _utilService2.default).controller(_annotationController2.default.name, _annotationController2.default).controller(_discussionController2.default.name, _discussionController2.default).controller(_drawController2.default.name, _drawController2.default).controller(_embeddedController2.default.name, _embeddedController2.default).controller(_graphController2.default.name, _graphController2.default).controller(_htmlController2.default.name, _htmlController2.default).controller(_labelController2.default.name, _labelController2.default).controller(_matchController2.default.name, _matchController2.default).controller(_multipleChoiceController2.default.name, _multipleChoiceController2.default).controller(_navigationController2.default.name, _navigationController2.default).controller(_nodeController2.default.name, _nodeController2.default).controller(_vleController2.default.name, _vleController2.default).controller(_openResponseController2.default.name, _openResponseController2.default).controller(_outsideURLController2.default.name, _outsideURLController2.default).controller(_tableController2.default.name, _tableController2.default).config(['$urlRouterProvider', '$stateProvider', '$controllerProvider', '$mdThemingProvider', function ($urlRouterProvider, $stateProvider, $controllerProvider, $mdThemingProvider) {

    $urlRouterProvider.otherwise('/vle/');

    _angular2.default.module('vle').$controllerProvider = $controllerProvider;

    $stateProvider.state('root', {
        url: '',
        abstract: true,
        templateProvider: ['$http', 'ProjectService', function ($http, ProjectService) {
            var vlePath = ProjectService.getThemePath();
            return $http.get(vlePath + '/vle.html').then(function (response) {
                return response.data;
            });
        }],
        controller: 'VLEController',
        controllerAs: 'vleController',
        resolve: {
            config: function config(ConfigService) {
                var configUrl = window.configUrl;
                return ConfigService.retrieveConfig(configUrl);
            },
            project: function project(ProjectService, config) {
                return ProjectService.retrieveProject();
            },
            studentData: function studentData(StudentDataService, config, project) {
                return StudentDataService.retrieveStudentData();
            },
            sessionTimers: function sessionTimers(SessionService, config, project, studentData) {
                return SessionService.initializeSession();
            },
            webSocket: function webSocket(StudentWebSocketService, config) {
                return StudentWebSocketService.initialize();
            }
        }
    }).state('root.vle', {
        url: '/vle/:nodeId',
        views: {
            'nodeView': {
                templateUrl: 'wise5/node/index.html',
                controller: 'NodeController',
                controllerAs: 'nodeController',
                resolve: {
                    load: function load() {
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
        'contrastDefaultColor': 'light', // whether, by default, text (contrast)
        // on this palette should be dark or light
        'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
        '200', '300', 'A100'],
        'contrastLightColors': undefined // could also specify this if default was 'dark'
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
        'contrastDarkColors': ['50', '100', '200', '300', 'A100'],
        'contrastLightColors': undefined
    });

    $mdThemingProvider.theme('default').primaryPalette('primary').accentPalette('accent', {
        'default': '500'
    });

    var lightMap = $mdThemingProvider.extendPalette('grey', {
        'A100': 'ffffff'
    });
    $mdThemingProvider.definePalette('light', lightMap);

    $mdThemingProvider.theme('light').primaryPalette('light', {
        'default': 'A100'
    }).accentPalette('primary');

    $mdThemingProvider.setDefaultTheme('default');

    // moment.js default overrides
    _moment2.default.locale('en', {
        calendar: {
            lastDay: '[Yesterday at] LT',
            sameDay: '[Today at] LT',
            nextDay: '[Tomorrow at] LT',
            lastWeek: '[Last] dddd [at] LT',
            nextWeek: 'dddd [at] LT',
            sameElse: 'MMM D, YYYY [at] LT'
        },
        relativeTime: {
            future: "in %s",
            past: "%s",
            s: "just now",
            m: "1 min ago",
            mm: "%d mins ago",
            h: "1 hr ago",
            hh: "%d hrs ago",
            d: "1 day ago",
            dd: "%d days ago",
            M: "1 month ago",
            MM: "%d months ago",
            y: "1 yr ago",
            yy: "%d yrs ago"
        }
    });
}]);
//import PhotoBoothService from '../components/photoBooth/photoBoothService';

//import AudioRecorderService from '../components/audioRecorder/audioRecorderService';

exports.default = mainModule;

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