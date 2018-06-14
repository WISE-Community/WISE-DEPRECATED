'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

require('../themes/default/js/webfonts');

require('jquery');

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _angularDragula = require('angular-dragula');

var _angularDragula2 = _interopRequireDefault(_angularDragula);

require('ng-file-upload');

require('highcharts-ng');

require('angular-ui-router');

require('angular-material');

require('angular-moment');

require('angular-sanitize');

require('lib/angular-toArrayFilter/toArrayFilter');

require('angular-translate');

require('angular-translate-loader-partial');

require('angular-websocket');

require('../components/animation/animationAuthoringComponentModule');

var _annotationService = require('../services/annotationService');

var _annotationService2 = _interopRequireDefault(_annotationService);

require('../components/audioOscillator/audioOscillatorComponentModule');

require('./components/authoringToolComponents');

var _authoringToolController = require('./authoringToolController');

var _authoringToolController2 = _interopRequireDefault(_authoringToolController);

var _authoringToolMainController = require('./main/authoringToolMainController');

var _authoringToolMainController2 = _interopRequireDefault(_authoringToolMainController);

var _authoringToolNewProjectController = require('./main/authoringToolNewProjectController');

var _authoringToolNewProjectController2 = _interopRequireDefault(_authoringToolNewProjectController);

var _authoringToolProjectService = require('./authoringToolProjectService');

var _authoringToolProjectService2 = _interopRequireDefault(_authoringToolProjectService);

var _authorNotebookController = require('./notebook/authorNotebookController');

var _authorNotebookController2 = _interopRequireDefault(_authorNotebookController);

var _authorWebSocketService = require('../services/authorWebSocketService');

var _authorWebSocketService2 = _interopRequireDefault(_authorWebSocketService);

require('../components/conceptMap/conceptMapAuthoringComponentModule');

var _configService = require('../services/configService');

var _configService2 = _interopRequireDefault(_configService);

var _cRaterService = require('../services/cRaterService');

var _cRaterService2 = _interopRequireDefault(_cRaterService);

require('../directives/components');

var _componentService = require('../components/componentService');

var _componentService2 = _interopRequireDefault(_componentService);

require('../components/discussion/discussionComponentModule');

require('../components/draw/drawComponentModule');

require('../components/embedded/embeddedComponentModule');

require('../filters/filters');

require('../lib/highcharts@4.2.1');

require('../components/graph/graphAuthoringComponentModule');

require('../components/html/htmlAuthoringComponentModule');

require('../components/label/labelComponentModule');

require('../components/match/matchComponentModule');

require('../components/multipleChoice/multipleChoiceComponentModule');

var _nodeAuthoringController = require('./node/nodeAuthoringController');

var _nodeAuthoringController2 = _interopRequireDefault(_nodeAuthoringController);

var _nodeService = require('../services/nodeService');

var _nodeService2 = _interopRequireDefault(_nodeService);

require('../directives/notebook/notebook');

var _notebookService = require('../services/notebookService');

var _notebookService2 = _interopRequireDefault(_notebookService);

var _notificationService = require('../services/notificationService');

var _notificationService2 = _interopRequireDefault(_notificationService);

require('../components/openResponse/openResponseComponentModule');

require('../components/outsideURL/outsideURLComponentModule');

var _projectAssetController = require('./asset/projectAssetController');

var _projectAssetController2 = _interopRequireDefault(_projectAssetController);

var _projectAssetService = require('../services/projectAssetService');

var _projectAssetService2 = _interopRequireDefault(_projectAssetService);

var _projectController = require('./project/projectController');

var _projectController2 = _interopRequireDefault(_projectController);

var _projectHistoryController = require('./history/projectHistoryController');

var _projectHistoryController2 = _interopRequireDefault(_projectHistoryController);

var _projectInfoController = require('./info/projectInfoController');

var _projectInfoController2 = _interopRequireDefault(_projectInfoController);

var _planningService = require('../services/planningService');

var _planningService2 = _interopRequireDefault(_planningService);

var _projectService = require('../services/projectService');

var _projectService2 = _interopRequireDefault(_projectService);

var _sessionService = require('../services/sessionService');

var _sessionService2 = _interopRequireDefault(_sessionService);

var _spaceService = require('../services/spaceService');

var _spaceService2 = _interopRequireDefault(_spaceService);

var _studentAssetService = require('../services/studentAssetService');

var _studentAssetService2 = _interopRequireDefault(_studentAssetService);

var _studentDataService = require('../services/studentDataService');

var _studentDataService2 = _interopRequireDefault(_studentDataService);

var _studentStatusService = require('../services/studentStatusService');

var _studentStatusService2 = _interopRequireDefault(_studentStatusService);

var _studentWebSocketService = require('../services/studentWebSocketService');

var _studentWebSocketService2 = _interopRequireDefault(_studentWebSocketService);

require('../components/table/tableComponentModule');

var _teacherDataService = require('../services/teacherDataService');

var _teacherDataService2 = _interopRequireDefault(_teacherDataService);

var _teacherWebSocketService = require('../services/teacherWebSocketService');

var _teacherWebSocketService2 = _interopRequireDefault(_teacherWebSocketService);

var _utilService = require('../services/utilService');

var _utilService2 = _interopRequireDefault(_utilService);

var _wiseLinkAuthoringController = require('./wiseLink/wiseLinkAuthoringController');

var _wiseLinkAuthoringController2 = _interopRequireDefault(_wiseLinkAuthoringController);

require('lib/angular-summernote/dist/angular-summernote.min');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var authoringModule = _angular2.default.module('authoring', [(0, _angularDragula2.default)(_angular2.default), 'angularMoment', 'angular-toArrayFilter', 'animationAuthoringComponentModule', 'audioOscillatorComponentModule', 'authoringTool.components', 'components', 'conceptMapAuthoringComponentModule', 'discussionComponentModule', 'drawComponentModule', 'embeddedComponentModule', 'filters', 'graphAuthoringComponentModule', 'highcharts-ng', 'htmlComponentModule', 'labelComponentModule', 'matchComponentModule', 'multipleChoiceComponentModule', 'ngAnimate', 'ngAria', 'ngFileUpload', 'ngMaterial', 'ngSanitize', 'ngWebSocket', 'notebook', 'openResponseComponentModule', 'outsideURLComponentModule', 'pascalprecht.translate', 'summernote', 'tableComponentModule', 'ui.router']).service(_annotationService2.default.name, _annotationService2.default).service(_authorWebSocketService2.default.name, _authorWebSocketService2.default).service(_componentService2.default.name, _componentService2.default).service(_configService2.default.name, _configService2.default).service(_cRaterService2.default.name, _cRaterService2.default).service(_nodeService2.default.name, _nodeService2.default).service(_notebookService2.default.name, _notebookService2.default).service(_notificationService2.default.name, _notificationService2.default).service(_planningService2.default.name, _planningService2.default).service(_projectService2.default.name, _authoringToolProjectService2.default).service(_projectAssetService2.default.name, _projectAssetService2.default).service(_sessionService2.default.name, _sessionService2.default).service(_spaceService2.default.name, _spaceService2.default).service(_studentAssetService2.default.name, _studentAssetService2.default).service(_studentDataService2.default.name, _studentDataService2.default).service(_studentStatusService2.default.name, _studentStatusService2.default).service(_studentWebSocketService2.default.name, _studentWebSocketService2.default).service(_teacherDataService2.default.name, _teacherDataService2.default).service(_teacherWebSocketService2.default.name, _teacherWebSocketService2.default).service(_utilService2.default.name, _utilService2.default).controller(_authoringToolController2.default.name, _authoringToolController2.default).controller(_authoringToolMainController2.default.name, _authoringToolMainController2.default).controller(_authoringToolNewProjectController2.default.name, _authoringToolNewProjectController2.default).controller(_authorNotebookController2.default.name, _authorNotebookController2.default).controller(_nodeAuthoringController2.default.name, _nodeAuthoringController2.default).controller(_projectAssetController2.default.name, _projectAssetController2.default).controller(_projectController2.default.name, _projectController2.default).controller(_projectHistoryController2.default.name, _projectHistoryController2.default).controller(_projectInfoController2.default.name, _projectInfoController2.default).controller(_wiseLinkAuthoringController2.default.name, _wiseLinkAuthoringController2.default).config(['$urlRouterProvider', '$stateProvider', '$translateProvider', '$translatePartialLoaderProvider', '$controllerProvider', '$mdThemingProvider', function ($urlRouterProvider, $stateProvider, $translateProvider, $translatePartialLoaderProvider, $controllerProvider, $mdThemingProvider) {

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
        return ConfigService.retrieveConfig(window.configURL);
      },
      language: function language($translate, ConfigService, config) {
        $translate.use(ConfigService.getLocale());
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
        return ConfigService.retrieveConfig(window.configURL);
      },
      language: function language($translate, ConfigService, config) {
        $translate.use(ConfigService.getLocale());
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
      projectAssets: function projectAssets(ProjectAssetService, projectConfig, project) {
        return ProjectAssetService.retrieveProjectAssets();
      },
      language: function language($translate, ConfigService, projectConfig) {
        $translate.use(ConfigService.getLocale());
      },
      sessionTimers: function sessionTimers(SessionService, projectConfig) {
        return SessionService.initializeSession();
      },
      webSocket: function webSocket(AuthorWebSocketService, projectConfig) {
        return AuthorWebSocketService.initialize();
      }
    }
  }).state('root.project.node', {
    url: '/node/:nodeId',
    templateUrl: 'wise5/authoringTool/node/node.html',
    controller: 'NodeAuthoringController',
    controllerAs: 'nodeAuthoringController',
    resolve: {}
  }).state('root.project.nodeConstraints', {
    url: '/node/constraints/:nodeId',
    templateUrl: 'wise5/authoringTool/node/node.html',
    controller: 'NodeAuthoringController',
    controllerAs: 'nodeAuthoringController',
    resolve: {}
  }).state('root.project.nodeEditPaths', {
    url: '/node/editpaths/:nodeId',
    templateUrl: 'wise5/authoringTool/node/node.html',
    controller: 'NodeAuthoringController',
    controllerAs: 'nodeAuthoringController',
    resolve: {}
  }).state('root.project.asset', {
    url: '/asset',
    templateUrl: 'wise5/authoringTool/asset/asset.html',
    controller: 'ProjectAssetController',
    controllerAs: 'projectAssetController',
    resolve: {}
  }).state('root.project.info', {
    url: '/info',
    templateUrl: 'wise5/authoringTool/info/info.html',
    controller: 'ProjectInfoController',
    controllerAs: 'projectInfoController',
    resolve: {}
  }).state('root.project.history', {
    url: '/history',
    templateUrl: 'wise5/authoringTool/history/history.html',
    controller: 'ProjectHistoryController',
    controllerAs: 'projectHistoryController',
    resolve: {}
  }).state('root.project.notebook', {
    url: '/notebook',
    templateUrl: 'wise5/authoringTool/notebook/notebook.html',
    controller: 'AuthorNotebookController',
    controllerAs: 'authorNotebookController',
    resolve: {}
  });

  $translatePartialLoaderProvider.addPart('i18n');
  $translatePartialLoaderProvider.addPart('authoringTool/i18n');
  $translateProvider.useLoader('$translatePartialLoader', {
    urlTemplate: 'wise5/{part}/i18n_{lang}.json'
  }).registerAvailableLanguageKeys(['el', 'en', 'es', 'ja', 'ko', 'pt', 'tr', 'zh_CN', 'zh_TW'], {
    'en_US': 'en',
    'en_UK': 'en'
  }).determinePreferredLanguage().fallbackLanguage(['en']).useSanitizeValueStrategy('sanitizeParameters', 'escape');

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
  $mdThemingProvider.theme('default').primaryPalette('deep-purple', { 'default': '400' }).accentPalette('accent', { 'default': '500' }).warnPalette('red', { 'default': '800' });
  var lightMap = $mdThemingProvider.extendPalette('grey', {
    'A100': 'ffffff'
  });
  $mdThemingProvider.definePalette('light', lightMap);
  $mdThemingProvider.theme('light').primaryPalette('light', { 'default': 'A100' }).accentPalette('pink', { 'default': '900' });
  $mdThemingProvider.setDefaultTheme('default');
  $mdThemingProvider.enableBrowserColor();

  // moment.js default overrides
  // TODO: add i18n support
  _moment2.default.updateLocale('en', {
    calendar: {
      lastDay: '[Yesterday at] LT',
      sameDay: '[Today at] LT',
      nextDay: '[Tomorrow at] LT',
      lastWeek: '[last] dddd [at] LT',
      nextWeek: 'dddd [at] LT',
      sameElse: 'll'
    }
  });
}]);

exports.default = authoringModule;
//# sourceMappingURL=main.js.map
