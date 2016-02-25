'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _ngFileUpload = require('ng-file-upload');

var _ngFileUpload2 = _interopRequireDefault(_ngFileUpload);

var _highchartsNg = require('highcharts-ng');

var _highchartsNg2 = _interopRequireDefault(_highchartsNg);

var _angularUiRouter = require('angular-ui-router');

var _angularUiRouter2 = _interopRequireDefault(_angularUiRouter);

var _angularUiTree = require('angular-ui-tree');

var _angularUiTree2 = _interopRequireDefault(_angularUiTree);

var _angularMaterial = require('angular-material');

var _angularMaterial2 = _interopRequireDefault(_angularMaterial);

var _angularMoment = require('angular-moment');

var _angularMoment2 = _interopRequireDefault(_angularMoment);

var _toArrayFilter = require('lib/angular-toArrayFilter/toArrayFilter');

var _toArrayFilter2 = _interopRequireDefault(_toArrayFilter);

var _angularWebsocket = require('angular-websocket');

var _angularWebsocket2 = _interopRequireDefault(_angularWebsocket);

var _annotationService = require('../services/annotationService');

var _annotationService2 = _interopRequireDefault(_annotationService);

var _authoringToolController = require('./authoringToolController');

var _authoringToolController2 = _interopRequireDefault(_authoringToolController);

var _authoringToolMainController = require('./main/authoringToolMainController');

var _authoringToolMainController2 = _interopRequireDefault(_authoringToolMainController);

var _authoringToolNewProjectController = require('./main/authoringToolNewProjectController');

var _authoringToolNewProjectController2 = _interopRequireDefault(_authoringToolNewProjectController);

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

var _filters = require('../filters/filters');

var _filters2 = _interopRequireDefault(_filters);

var _graphController = require('../components/graph/graphController');

var _graphController2 = _interopRequireDefault(_graphController);

var _graphService = require('../components/graph/graphService');

var _graphService2 = _interopRequireDefault(_graphService);

var _highcharts = require('../lib/highcharts@4.2.1');

var _highcharts2 = _interopRequireDefault(_highcharts);

var _htmlController = require('../components/html/htmlController');

var _htmlController2 = _interopRequireDefault(_htmlController);

var _htmlService = require('../components/html/htmlService');

var _htmlService2 = _interopRequireDefault(_htmlService);

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

var _nodeController = require('./node/nodeController');

var _nodeController2 = _interopRequireDefault(_nodeController);

var _nodeService = require('../services/nodeService');

var _nodeService2 = _interopRequireDefault(_nodeService);

var _openResponseController = require('../components/openResponse/openResponseController');

var _openResponseController2 = _interopRequireDefault(_openResponseController);

var _openResponseService = require('../components/openResponse/openResponseService');

var _openResponseService2 = _interopRequireDefault(_openResponseService);

var _outsideURLController = require('../components/outsideURL/outsideURLController');

var _outsideURLController2 = _interopRequireDefault(_outsideURLController);

var _outsideURLService = require('../components/outsideURL/outsideURLService');

var _outsideURLService2 = _interopRequireDefault(_outsideURLService);

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

var _tableController = require('../components/table/tableController');

var _tableController2 = _interopRequireDefault(_tableController);

var _tableService = require('../components/table/tableService');

var _tableService2 = _interopRequireDefault(_tableService);

var _teacherDataService = require('../services/teacherDataService');

var _teacherDataService2 = _interopRequireDefault(_teacherDataService);

var _utilService = require('../services/utilService');

var _utilService2 = _interopRequireDefault(_utilService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mainModule = _angular2.default.module('authoring', ['angularMoment', 'angular-toArrayFilter', 'directives', 'filters', 'highcharts-ng', 'ngAnimate', 'ngAria', 'ngFileUpload', 'ngMaterial', 'ngWebSocket', 'ui.router', 'ui.tree']).service(_annotationService2.default.name, _annotationService2.default).service(_configService2.default.name, _configService2.default).service(_discussionService2.default.name, _discussionService2.default).service(_drawService2.default.name, _drawService2.default).service(_embeddedService2.default.name, _embeddedService2.default).service(_graphService2.default.name, _graphService2.default).service(_htmlService2.default.name, _htmlService2.default).service(_labelService2.default.name, _labelService2.default).service(_matchService2.default.name, _matchService2.default).service(_multipleChoiceService2.default.name, _multipleChoiceService2.default).service(_nodeService2.default.name, _nodeService2.default).service(_openResponseService2.default.name, _openResponseService2.default).service(_outsideURLService2.default.name, _outsideURLService2.default).service(_projectService2.default.name, _projectService2.default).service(_projectAssetService2.default.name, _projectAssetService2.default).service(_sessionService2.default.name, _sessionService2.default).service(_studentAssetService2.default.name, _studentAssetService2.default).service(_studentDataService2.default.name, _studentDataService2.default).service(_studentStatusService2.default.name, _studentStatusService2.default).service(_studentWebSocketService2.default.name, _studentWebSocketService2.default).service(_tableService2.default.name, _tableService2.default).service(_teacherDataService2.default.name, _teacherDataService2.default).service(_utilService2.default.name, _utilService2.default).controller(_authoringToolController2.default.name, _authoringToolController2.default).controller(_authoringToolMainController2.default.name, _authoringToolMainController2.default).controller(_authoringToolNewProjectController2.default.name, _authoringToolNewProjectController2.default).controller(_discussionController2.default.name, _discussionController2.default).controller(_drawController2.default.name, _drawController2.default).controller(_embeddedController2.default.name, _embeddedController2.default).controller(_graphController2.default.name, _graphController2.default).controller(_htmlController2.default.name, _htmlController2.default).controller(_labelController2.default.name, _labelController2.default).controller(_matchController2.default.name, _matchController2.default).controller(_multipleChoiceController2.default.name, _multipleChoiceController2.default).controller(_nodeController2.default.name, _nodeController2.default).controller(_openResponseController2.default.name, _openResponseController2.default).controller(_outsideURLController2.default.name, _outsideURLController2.default).controller(_projectAssetController2.default.name, _projectAssetController2.default).controller(_projectController2.default.name, _projectController2.default).controller(_projectHistoryController2.default.name, _projectHistoryController2.default).controller(_tableController2.default.name, _tableController2.default).config(['$urlRouterProvider', '$stateProvider', '$controllerProvider', '$mdThemingProvider', function ($urlRouterProvider, $stateProvider, $controllerProvider, $mdThemingProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider.state('root', {
        url: '',
        abstract: true,
        templateUrl: 'wise5/authoringTool/authoringTool.html',
        controller: 'AuthoringToolController',
        controllerAs: 'authoringToolController',
        resolve: {
            config: function config(ConfigService) {
                var configURL = window.configURL;

                return ConfigService.retrieveConfig(configURL);
            },
            sessionTimers: function sessionTimers(SessionService, config) {
                return SessionService.initializeSession();
            }
        }
    }).state('root.main', {
        url: '/',
        templateUrl: 'wise5/authoringTool/main/main.html',
        controller: 'AuthoringToolMainController',
        controllerAs: 'authoringToolMainController',
        resolve: {}
    }).state('root.new', {
        url: '/new',
        templateUrl: 'wise5/authoringTool/main/new.html',
        controller: 'AuthoringToolNewProjectController',
        controllerAs: 'authoringToolNewProjectController',
        resolve: {}
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
            }
        }
    }).state('root.project.node', {
        url: '/node/:nodeId',
        templateUrl: 'wise5/authoringTool/node/node.html',
        controller: 'NodeController',
        controllerAs: 'nodeController',
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
    // ngMaterial default theme configuration
    // TODO: make dynamic and support alternate themes; allow projects to specify theme parameters and settings
    $mdThemingProvider.definePalette('primaryPaletteWise', {
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

    $mdThemingProvider.definePalette('accentPaletteWise', {
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
        'contrastDefaultColor': 'light', // whether, by default, text (contrast)
        // on this palette should be dark or light
        'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
        '200', '300', 'A100'],
        'contrastLightColors': undefined // could also specify this if default was 'dark'
    });

    $mdThemingProvider.theme('default').primaryPalette('primaryPaletteWise').accentPalette('accentPaletteWise');
}]);

exports.default = mainModule;
//# sourceMappingURL=main.js.map