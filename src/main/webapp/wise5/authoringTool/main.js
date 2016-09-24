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

var _ngFileUpload = require('ng-file-upload');

var _ngFileUpload2 = _interopRequireDefault(_ngFileUpload);

var _highchartsNg = require('highcharts-ng');

var _highchartsNg2 = _interopRequireDefault(_highchartsNg);

var _angularUiRouter = require('angular-ui-router');

var _angularUiRouter2 = _interopRequireDefault(_angularUiRouter);

var _angularMaterial = require('angular-material');

var _angularMaterial2 = _interopRequireDefault(_angularMaterial);

var _angularMoment = require('angular-moment');

var _angularMoment2 = _interopRequireDefault(_angularMoment);

var _angularSanitize = require('angular-sanitize');

var _angularSanitize2 = _interopRequireDefault(_angularSanitize);

var _toArrayFilter = require('lib/angular-toArrayFilter/toArrayFilter');

var _toArrayFilter2 = _interopRequireDefault(_toArrayFilter);

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

var _authoringToolController = require('./authoringToolController');

var _authoringToolController2 = _interopRequireDefault(_authoringToolController);

var _authoringToolMainController = require('./main/authoringToolMainController');

var _authoringToolMainController2 = _interopRequireDefault(_authoringToolMainController);

var _authoringToolNewProjectController = require('./main/authoringToolNewProjectController');

var _authoringToolNewProjectController2 = _interopRequireDefault(_authoringToolNewProjectController);

var _authorWebSocketService = require('../services/authorWebSocketService');

var _authorWebSocketService2 = _interopRequireDefault(_authorWebSocketService);

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

var _filters = require('../filters/filters');

var _filters2 = _interopRequireDefault(_filters);

var _highcharts = require('../lib/highcharts@4.2.1');

var _highcharts2 = _interopRequireDefault(_highcharts);

var _graphComponentModule = require('../components/graph/graphComponentModule');

var _graphComponentModule2 = _interopRequireDefault(_graphComponentModule);

var _htmlComponentModule = require('../components/html/htmlComponentModule');

var _htmlComponentModule2 = _interopRequireDefault(_htmlComponentModule);

var _labelComponentModule = require('../components/label/labelComponentModule');

var _labelComponentModule2 = _interopRequireDefault(_labelComponentModule);

var _matchComponentModule = require('../components/match/matchComponentModule');

var _matchComponentModule2 = _interopRequireDefault(_matchComponentModule);

var _multipleChoiceComponentModule = require('../components/multipleChoice/multipleChoiceComponentModule');

var _multipleChoiceComponentModule2 = _interopRequireDefault(_multipleChoiceComponentModule);

var _nodeAuthoringController = require('./node/nodeAuthoringController');

var _nodeAuthoringController2 = _interopRequireDefault(_nodeAuthoringController);

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

var _projectAssetController = require('./asset/projectAssetController');

var _projectAssetController2 = _interopRequireDefault(_projectAssetController);

var _projectAssetService = require('../services/projectAssetService');

var _projectAssetService2 = _interopRequireDefault(_projectAssetService);

var _projectController = require('./project/projectController');

var _projectController2 = _interopRequireDefault(_projectController);

var _projectHistoryController = require('./history/projectHistoryController');

var _projectHistoryController2 = _interopRequireDefault(_projectHistoryController);

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

var _tableComponentModule = require('../components/table/tableComponentModule');

var _tableComponentModule2 = _interopRequireDefault(_tableComponentModule);

var _teacherDataService = require('../services/teacherDataService');

var _teacherDataService2 = _interopRequireDefault(_teacherDataService);

var _utilService = require('../services/utilService');

var _utilService2 = _interopRequireDefault(_utilService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var authoringModule = _angular2.default.module('authoring', [(0, _angularDragula2.default)(_angular2.default), 'angularMoment', 'angular-toArrayFilter', 'audioOscillatorComponentModule', 'components', 'conceptMapComponentModule', 'discussionComponentModule', 'drawComponentModule', 'embeddedComponentModule', 'filters', 'graphComponentModule', 'highcharts-ng', 'htmlComponentModule', 'labelComponentModule', 'matchComponentModule', 'multipleChoiceComponentModule', 'ngAnimate', 'ngAria', 'ngFileUpload', 'ngMaterial', 'ngSanitize', 'ngWebSocket', 'openResponseComponentModule', 'outsideURLComponentModule', 'pascalprecht.translate', 'tableComponentModule', 'ui.router']).service(_annotationService2.default.name, _annotationService2.default).service(_authorWebSocketService2.default.name, _authorWebSocketService2.default).service(_configService2.default.name, _configService2.default).service(_cRaterService2.default.name, _cRaterService2.default).service(_nodeService2.default.name, _nodeService2.default).service(_notebookService2.default.name, _notebookService2.default).service(_notificationService2.default.name, _notificationService2.default).service(_projectService2.default.name, _projectService2.default).service(_projectAssetService2.default.name, _projectAssetService2.default).service(_sessionService2.default.name, _sessionService2.default).service(_studentAssetService2.default.name, _studentAssetService2.default).service(_studentDataService2.default.name, _studentDataService2.default).service(_studentStatusService2.default.name, _studentStatusService2.default).service(_studentWebSocketService2.default.name, _studentWebSocketService2.default).service(_teacherDataService2.default.name, _teacherDataService2.default).service(_utilService2.default.name, _utilService2.default).controller(_authoringToolController2.default.name, _authoringToolController2.default).controller(_authoringToolMainController2.default.name, _authoringToolMainController2.default).controller(_authoringToolNewProjectController2.default.name, _authoringToolNewProjectController2.default).controller(_nodeAuthoringController2.default.name, _nodeAuthoringController2.default).controller(_projectAssetController2.default.name, _projectAssetController2.default).controller(_projectController2.default.name, _projectController2.default).controller(_projectHistoryController2.default.name, _projectHistoryController2.default).config(['$urlRouterProvider', '$stateProvider', '$translateProvider', '$translatePartialLoaderProvider', '$controllerProvider', '$mdThemingProvider', function ($urlRouterProvider, $stateProvider, $translateProvider, $translatePartialLoaderProvider, $controllerProvider, $mdThemingProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider.state('root', {
        url: '',
        abstract: true,
        templateUrl: 'wise5/authoringTool/authoringTool.html',
        controller: 'AuthoringToolController',
        controllerAs: 'authoringToolController',
        resolve: {}
    }).state('root.main', {
        url: '/',
        templateUrl: 'wise5/authoringTool/main/main.html',
        controller: 'AuthoringToolMainController',
        controllerAs: 'authoringToolMainController',
        resolve: {
            config: function config(ConfigService) {
                var configURL = window.configURL;

                return ConfigService.retrieveConfig(configURL);
            },
            language: function language($translate, ConfigService, config) {
                var locale = ConfigService.getLocale(); // defaults to "en"
                $translate.use(locale);
            },
            sessionTimers: function sessionTimers(SessionService, config) {
                return SessionService.initializeSession();
            }
        }
    }).state('root.new', {
        url: '/new',
        templateUrl: 'wise5/authoringTool/main/new.html',
        controller: 'AuthoringToolNewProjectController',
        controllerAs: 'authoringToolNewProjectController',
        resolve: {
            config: function config(ConfigService) {
                var configURL = window.configURL;

                return ConfigService.retrieveConfig(configURL);
            },
            language: function language($translate, ConfigService, config) {
                var locale = ConfigService.getLocale(); // defaults to "en"
                $translate.use(locale);
            },
            sessionTimers: function sessionTimers(SessionService, config) {
                return SessionService.initializeSession();
            }
        }
    }).state('root.project', {
        url: '/project/:projectId',
        templateUrl: 'wise5/authoringTool/project/project.html',
        controller: 'ProjectController',
        controllerAs: 'projectController',
        resolve: {
            projectConfig: function projectConfig(ConfigService, $stateParams) {
                var configURL = window.configURL + '/' + $stateParams.projectId;

                return ConfigService.retrieveConfig(configURL);
            },
            project: function project(ProjectService, projectConfig) {
                return ProjectService.retrieveProject();
            },
            projectAssets: function projectAssets(ProjectAssetService, projectConfig) {
                return ProjectAssetService.retrieveProjectAssets();
            },
            language: function language($translate, ConfigService, projectConfig) {
                var locale = ConfigService.getLocale(); // defaults to "en"
                $translate.use(locale);
            },
            sessionTimers: function sessionTimers(SessionService, projectConfig) {
                return SessionService.initializeSession();
            }
            /*,
            webSocket: (AuthorWebSocketService, projectConfig, $stateParams) => {
                return AuthorWebSocketService.initialize($stateParams.projectId);
            }
            */
        }
    }).state('root.project.node', {
        url: '/node/:nodeId',
        templateUrl: 'wise5/authoringTool/node/node.html',
        controller: 'NodeAuthoringController',
        controllerAs: 'nodeAuthoringController',
        resolve: {
            load: function load() {}
        }
    }).state('root.project.asset', {
        url: '/asset',
        templateUrl: 'wise5/authoringTool/asset/asset.html',
        controller: 'ProjectAssetController',
        controllerAs: 'projectAssetController',
        resolve: {}
    }).state('root.project.history', {
        url: '/history',
        templateUrl: 'wise5/authoringTool/history/history.html',
        controller: 'ProjectHistoryController',
        controllerAs: 'projectHistoryController',
        resolve: {}
    });

    // Set up Translations
    $translatePartialLoaderProvider.addPart('common');
    $translatePartialLoaderProvider.addPart('authoringTool');
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

exports.default = authoringModule;
//# sourceMappingURL=main.js.map