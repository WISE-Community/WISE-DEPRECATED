'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _angularDragula = require('angular-dragula');

var _angularDragula2 = _interopRequireDefault(_angularDragula);

var _angularMoment = require('angular-moment');

var _angularMoment2 = _interopRequireDefault(_angularMoment);

var _toArrayFilter = require('lib/angular-toArrayFilter/toArrayFilter');

var _toArrayFilter2 = _interopRequireDefault(_toArrayFilter);

var _angularUiRouter = require('angular-ui-router');

var _angularUiRouter2 = _interopRequireDefault(_angularUiRouter);

var _ngFileUpload = require('ng-file-upload');

var _ngFileUpload2 = _interopRequireDefault(_ngFileUpload);

var _angularMaterial = require('angular-material');

var _angularMaterial2 = _interopRequireDefault(_angularMaterial);

var _angularSanitize = require('angular-sanitize');

var _angularSanitize2 = _interopRequireDefault(_angularSanitize);

var _angularTranslate = require('angular-translate');

var _angularTranslate2 = _interopRequireDefault(_angularTranslate);

var _angularTranslateLoaderPartial = require('angular-translate-loader-partial');

var _angularTranslateLoaderPartial2 = _interopRequireDefault(_angularTranslateLoaderPartial);

var _angularWebsocket = require('angular-websocket');

var _angularWebsocket2 = _interopRequireDefault(_angularWebsocket);

var _annotationService = require('../services/annotationService');

var _annotationService2 = _interopRequireDefault(_annotationService);

var _audioOscillatorComponentModule = require('../components/audioOscillator/audioOscillatorComponentModule');

var _audioOscillatorComponentModule2 = _interopRequireDefault(_audioOscillatorComponentModule);

var _classroomMonitorController = require('./classroomMonitorController');

var _classroomMonitorController2 = _interopRequireDefault(_classroomMonitorController);

var _conceptMapComponentModule = require('../components/conceptMap/conceptMapComponentModule');

var _conceptMapComponentModule2 = _interopRequireDefault(_conceptMapComponentModule);

var _configService = require('../services/configService');

var _configService2 = _interopRequireDefault(_configService);

var _cRaterService = require('../services/cRaterService');

var _cRaterService2 = _interopRequireDefault(_cRaterService);

var _components = require('../directives/components');

var _components2 = _interopRequireDefault(_components);

var _discussionComponentModule = require('../components/discussion/discussionComponentModule');

var _discussionComponentModule2 = _interopRequireDefault(_discussionComponentModule);

var _drawComponentModule = require('../components/draw/drawComponentModule');

var _drawComponentModule2 = _interopRequireDefault(_drawComponentModule);

var _embeddedComponentModule = require('../components/embedded/embeddedComponentModule');

var _embeddedComponentModule2 = _interopRequireDefault(_embeddedComponentModule);

var _graphComponentModule = require('../components/graph/graphComponentModule');

var _graphComponentModule2 = _interopRequireDefault(_graphComponentModule);

var _highcharts = require('../lib/highcharts@4.2.1');

var _highcharts2 = _interopRequireDefault(_highcharts);

var _highchartsNg = require('highcharts-ng');

var _highchartsNg2 = _interopRequireDefault(_highchartsNg);

var _htmlComponentModule = require('../components/html/htmlComponentModule');

var _htmlComponentModule2 = _interopRequireDefault(_htmlComponentModule);

var _labelComponentModule = require('../components/label/labelComponentModule');

var _labelComponentModule2 = _interopRequireDefault(_labelComponentModule);

var _matchComponentModule = require('../components/match/matchComponentModule');

var _matchComponentModule2 = _interopRequireDefault(_matchComponentModule);

var _multipleChoiceComponentModule = require('../components/multipleChoice/multipleChoiceComponentModule');

var _multipleChoiceComponentModule2 = _interopRequireDefault(_multipleChoiceComponentModule);

var _nodeProgressController = require('./nodeProgress/nodeProgressController');

var _nodeProgressController2 = _interopRequireDefault(_nodeProgressController);

var _nodeGradingController = require('./nodeGrading/nodeGradingController');

var _nodeGradingController2 = _interopRequireDefault(_nodeGradingController);

var _nodeService = require('../services/nodeService');

var _nodeService2 = _interopRequireDefault(_nodeService);

var _notebookService = require('../services/notebookService');

var _notebookService2 = _interopRequireDefault(_notebookService);

var _notificationService = require('../services/notificationService');

var _notificationService2 = _interopRequireDefault(_notificationService);

var _openResponseComponentModule = require('../components/openResponse/openResponseComponentModule');

var _openResponseComponentModule2 = _interopRequireDefault(_openResponseComponentModule);

var _outsideURLComponentModule = require('../components/outsideURL/outsideURLComponentModule');

var _outsideURLComponentModule2 = _interopRequireDefault(_outsideURLComponentModule);

var _projectService = require('../services/projectService');

var _projectService2 = _interopRequireDefault(_projectService);

var _sessionService = require('../services/sessionService');

var _sessionService2 = _interopRequireDefault(_sessionService);

var _studentAssetService = require('../services/studentAssetService');

var _studentAssetService2 = _interopRequireDefault(_studentAssetService);

var _studentDataService = require('../services/studentDataService');

var _studentDataService2 = _interopRequireDefault(_studentDataService);

var _studentGradingController = require('./studentGrading/studentGradingController');

var _studentGradingController2 = _interopRequireDefault(_studentGradingController);

var _studentProgressController = require('./studentProgress/studentProgressController');

var _studentProgressController2 = _interopRequireDefault(_studentProgressController);

var _studentStatusService = require('../services/studentStatusService');

var _studentStatusService2 = _interopRequireDefault(_studentStatusService);

var _studentWebSocketService = require('../services/studentWebSocketService');

var _studentWebSocketService2 = _interopRequireDefault(_studentWebSocketService);

var _tableComponentModule = require('../components/table/tableComponentModule');

var _tableComponentModule2 = _interopRequireDefault(_tableComponentModule);

var _teacherDataService = require('../services/teacherDataService');

var _teacherDataService2 = _interopRequireDefault(_teacherDataService);

var _teacherWebSocketService = require('../services/teacherWebSocketService');

var _teacherWebSocketService2 = _interopRequireDefault(_teacherWebSocketService);

var _utilService = require('../services/utilService');

var _utilService2 = _interopRequireDefault(_utilService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var classroomMonitorModule = _angular2.default.module('classroomMonitor', [(0, _angularDragula2.default)(_angular2.default), 'angularMoment', 'angular-toArrayFilter', 'audioOscillatorComponentModule', 'components', 'conceptMapComponentModule', 'discussionComponentModule', 'drawComponentModule', 'embeddedComponentModule', 'graphComponentModule', 'highcharts-ng', 'htmlComponentModule', 'labelComponentModule', 'matchComponentModule', 'multipleChoiceComponentModule', 'ngAnimate', 'ngAria', 'ngFileUpload', 'ngMaterial', 'ngSanitize', 'ngWebSocket', 'openResponseComponentModule', 'outsideURLComponentModule', 'pascalprecht.translate', 'tableComponentModule', 'ui.router']).service(_annotationService2.default.name, _annotationService2.default).service(_configService2.default.name, _configService2.default).service(_cRaterService2.default.name, _cRaterService2.default).service(_nodeService2.default.name, _nodeService2.default).service(_notebookService2.default.name, _notebookService2.default).service(_notificationService2.default.name, _notificationService2.default).service(_projectService2.default.name, _projectService2.default).service(_sessionService2.default.name, _sessionService2.default).service(_studentAssetService2.default.name, _studentAssetService2.default).service(_studentDataService2.default.name, _studentDataService2.default).service(_studentStatusService2.default.name, _studentStatusService2.default).service(_studentWebSocketService2.default.name, _studentWebSocketService2.default).service(_teacherDataService2.default.name, _teacherDataService2.default).service(_teacherWebSocketService2.default.name, _teacherWebSocketService2.default).service(_utilService2.default.name, _utilService2.default).controller(_classroomMonitorController2.default.name, _classroomMonitorController2.default).controller(_nodeGradingController2.default.name, _nodeGradingController2.default).controller(_nodeProgressController2.default.name, _nodeProgressController2.default).controller(_studentGradingController2.default.name, _studentGradingController2.default).controller(_studentProgressController2.default.name, _studentProgressController2.default).config(['$urlRouterProvider', '$stateProvider', '$translateProvider', '$translatePartialLoaderProvider', '$controllerProvider', '$mdThemingProvider', function ($urlRouterProvider, $stateProvider, $translateProvider, $translatePartialLoaderProvider, $controllerProvider, $mdThemingProvider) {

    $urlRouterProvider.otherwise('/studentProgress');

    $stateProvider.state('root', {
        url: '',
        abstract: true,
        templateUrl: 'wise5/classroomMonitor/classroomMonitor.html',
        controller: 'ClassroomMonitorController',
        controllerAs: 'classroomMonitorController',
        resolve: {
            config: function config(ConfigService) {
                var configURL = window.configURL;

                return ConfigService.retrieveConfig(configURL);
            },
            project: function project(ProjectService, config) {
                return ProjectService.retrieveProject();
            },
            runStatus: function runStatus(TeacherDataService, config) {
                return TeacherDataService.retrieveRunStatus();
            },
            studentStatuses: function studentStatuses(StudentStatusService, config) {
                return StudentStatusService.retrieveStudentStatuses();
            },
            notifications: function notifications(NotificationService, ConfigService, studentStatuses, config, project) {
                return NotificationService.retrieveNotifications(ConfigService.getWorkgroupId());
            },
            webSocket: function webSocket(TeacherWebSocketService, config) {
                return TeacherWebSocketService.initialize();
            },
            language: function language($translate, ConfigService, config) {
                var locale = ConfigService.getLocale(); // defaults to "en"
                $translate.use(locale);
            },
            sessionTimers: function sessionTimers(SessionService, config) {
                return SessionService.initializeSession();
            }
        }
    }).state('root.studentProgress', {
        url: '/studentProgress',
        templateUrl: 'wise5/classroomMonitor/studentProgress/studentProgress.html',
        controller: 'StudentProgressController',
        controllerAs: 'studentProgressController',
        resolve: {
            studentData: function studentData($stateParams, TeacherDataService, config) {
                return TeacherDataService.retrieveAnnotations();
            }
        }
    }).state('root.studentGrading', {
        url: '/studentGrading/:workgroupId',
        templateUrl: 'wise5/classroomMonitor/studentGrading/studentGrading.html',
        controller: 'StudentGradingController',
        controllerAs: 'studentGradingController',
        resolve: {
            studentData: function studentData($stateParams, TeacherDataService, config) {
                return TeacherDataService.retrieveStudentDataByWorkgroupId($stateParams.workgroupId);
            }
        }
    }).state('root.nodeProgress', {
        url: '/nodeProgress',
        templateUrl: 'wise5/classroomMonitor/nodeProgress/nodeProgress.html',
        controller: 'NodeProgressController',
        controllerAs: 'nodeProgressController',
        resolve: {
            studentData: function studentData($stateParams, TeacherDataService, config) {
                return TeacherDataService.retrieveAnnotations();
            }
        }
    }).state('root.nodeGrading', {
        url: '/nodeGrading/:nodeId',
        templateUrl: 'wise5/classroomMonitor/nodeGrading/nodeGrading.html',
        controller: 'NodeGradingController',
        controllerAs: 'nodeGradingController',
        resolve: {
            studentData: function studentData($stateParams, TeacherDataService, config, project) {
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
    $translateProvider.registerAvailableLanguageKeys(['en', 'es', 'ja', 'ko', 'pt', 'tr', 'zh_CN'], {
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
    }).warnPalette('red', {
        'default': 'A700'
    });

    var lightMap = $mdThemingProvider.extendPalette('grey', {
        'A100': 'ffffff'
    });
    $mdThemingProvider.definePalette('light', lightMap);

    $mdThemingProvider.theme('light').primaryPalette('light', {
        'default': 'A100'
    }).accentPalette('primary');

    $mdThemingProvider.setDefaultTheme('default');
}]);

exports.default = classroomMonitorModule;
//# sourceMappingURL=main.js.map