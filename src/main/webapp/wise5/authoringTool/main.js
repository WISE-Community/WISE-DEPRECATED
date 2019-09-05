'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("../themes/default/js/webfonts");

require("jquery");

var _angular = _interopRequireDefault(require("angular"));

var _angularDragula = _interopRequireDefault(require("angular-dragula"));

require("ng-file-upload");

require("highcharts-ng");

require("angular-ui-router");

require("angular-material");

require("angular-moment");

require("angular-sanitize");

var _angularSockjs = _interopRequireDefault(require("angular-sockjs"));

var _ngStompStandalone = _interopRequireDefault(require("../lib/stomp/ng-stomp.standalone.min"));

require("lib/angular-toArrayFilter/toArrayFilter");

require("angular-translate");

require("angular-translate-loader-partial");

require("angular-websocket");

require("../components/animation/animationAuthoringComponentModule");

var _annotationService = _interopRequireDefault(require("../services/annotationService"));

require("../components/audioOscillator/audioOscillatorAuthoringComponentModule");

require("./components/authoringToolComponents");

var _authoringToolController = _interopRequireDefault(require("./authoringToolController"));

var _authoringToolMainController = _interopRequireDefault(require("./main/authoringToolMainController"));

var _authoringToolNewProjectController = _interopRequireDefault(require("./main/authoringToolNewProjectController"));

var _authoringToolProjectService = _interopRequireDefault(require("./authoringToolProjectService"));

var _authorNotebookController = _interopRequireDefault(require("./notebook/authorNotebookController"));

require("../components/conceptMap/conceptMapAuthoringComponentModule");

var _configService = _interopRequireDefault(require("../services/configService"));

var _cRaterService = _interopRequireDefault(require("../services/cRaterService"));

require("../directives/components");

var _componentService = _interopRequireDefault(require("../components/componentService"));

require("../components/discussion/discussionAuthoringComponentModule");

require("../components/draw/drawAuthoringComponentModule");

require("../components/embedded/embeddedAuthoringComponentModule");

require("../filters/filters");

require("../lib/highcharts@4.2.1");

require("../components/graph/graphAuthoringComponentModule");

require("../components/html/htmlAuthoringComponentModule");

require("../components/label/labelAuthoringComponentModule");

require("../components/match/matchAuthoringComponentModule");

require("../components/multipleChoice/multipleChoiceAuthoringComponentModule");

var _nodeAuthoringController = _interopRequireDefault(require("./node/nodeAuthoringController"));

var _nodeService = _interopRequireDefault(require("../services/nodeService"));

var _notebookService = _interopRequireDefault(require("../services/notebookService"));

var _notificationService = _interopRequireDefault(require("../services/notificationService"));

require("../components/openResponse/openResponseAuthoringComponentModule");

require("../components/outsideURL/outsideURLAuthoringComponentModule");

var _projectAssetController = _interopRequireDefault(require("./asset/projectAssetController"));

var _projectAssetService = _interopRequireDefault(require("../services/projectAssetService"));

var _projectController = _interopRequireDefault(require("./project/projectController"));

var _projectHistoryController = _interopRequireDefault(require("./history/projectHistoryController"));

var _projectInfoController = _interopRequireDefault(require("./info/projectInfoController"));

var _planningService = _interopRequireDefault(require("../services/planningService"));

var _projectService = _interopRequireDefault(require("../services/projectService"));

var _sessionService = _interopRequireDefault(require("../services/sessionService"));

var _spaceService = _interopRequireDefault(require("../services/spaceService"));

var _studentAssetService = _interopRequireDefault(require("../services/studentAssetService"));

var _studentDataService = _interopRequireDefault(require("../services/studentDataService"));

var _studentStatusService = _interopRequireDefault(require("../services/studentStatusService"));

var _studentWebSocketService = _interopRequireDefault(require("../services/studentWebSocketService"));

var _summaryAuthoringComponentModule = _interopRequireDefault(require("../components/summary/summaryAuthoringComponentModule"));

require("../components/table/tableAuthoringComponentModule");

var _teacherDataService = _interopRequireDefault(require("../services/teacherDataService"));

var _teacherWebSocketService = _interopRequireDefault(require("../services/teacherWebSocketService"));

var _utilService = _interopRequireDefault(require("../services/utilService"));

var _wiseLinkAuthoringController = _interopRequireDefault(require("./wiseLink/wiseLinkAuthoringController"));

require("lib/angular-summernote/dist/angular-summernote.min");

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var authoringModule = _angular["default"].module('authoring', [(0, _angularDragula["default"])(_angular["default"]), 'angularMoment', 'angular-toArrayFilter', 'summaryAuthoringComponentModule', 'animationAuthoringComponentModule', 'audioOscillatorAuthoringComponentModule', 'authoringTool.components', 'components', 'conceptMapAuthoringComponentModule', 'discussionAuthoringComponentModule', 'drawAuthoringComponentModule', 'embeddedAuthoringComponentModule', 'filters', 'graphAuthoringComponentModule', 'highcharts-ng', 'htmlComponentModule', 'labelAuthoringComponentModule', 'matchAuthoringComponentModule', 'multipleChoiceAuthoringComponentModule', 'ngAnimate', 'ngAria', 'ngFileUpload', 'ngMaterial', 'ngSanitize', 'bd.sockjs', 'ngStomp', 'ngWebSocket', 'openResponseAuthoringComponentModule', 'outsideURLAuthoringComponentModule', 'pascalprecht.translate', 'summernote', 'tableAuthoringComponentModule', 'ui.router']).service(_annotationService["default"].name, _annotationService["default"]).service(_componentService["default"].name, _componentService["default"]).service(_configService["default"].name, _configService["default"]).service(_cRaterService["default"].name, _cRaterService["default"]).service(_nodeService["default"].name, _nodeService["default"]).service(_notebookService["default"].name, _notebookService["default"]).service(_notificationService["default"].name, _notificationService["default"]).service(_planningService["default"].name, _planningService["default"]).service(_projectService["default"].name, _authoringToolProjectService["default"]).service(_projectAssetService["default"].name, _projectAssetService["default"]).service(_sessionService["default"].name, _sessionService["default"]).service(_spaceService["default"].name, _spaceService["default"]).service(_studentAssetService["default"].name, _studentAssetService["default"]).service(_studentDataService["default"].name, _studentDataService["default"]).service(_studentStatusService["default"].name, _studentStatusService["default"]).service(_studentWebSocketService["default"].name, _studentWebSocketService["default"]).service(_teacherDataService["default"].name, _teacherDataService["default"]).service(_teacherWebSocketService["default"].name, _teacherWebSocketService["default"]).service(_utilService["default"].name, _utilService["default"]).controller(_authoringToolController["default"].name, _authoringToolController["default"]).controller(_authoringToolMainController["default"].name, _authoringToolMainController["default"]).controller(_authoringToolNewProjectController["default"].name, _authoringToolNewProjectController["default"]).controller(_authorNotebookController["default"].name, _authorNotebookController["default"]).controller(_nodeAuthoringController["default"].name, _nodeAuthoringController["default"]).controller(_projectAssetController["default"].name, _projectAssetController["default"]).controller(_projectController["default"].name, _projectController["default"]).controller(_projectHistoryController["default"].name, _projectHistoryController["default"]).controller(_projectInfoController["default"].name, _projectInfoController["default"]).controller(_wiseLinkAuthoringController["default"].name, _wiseLinkAuthoringController["default"]).config(['$urlRouterProvider', '$stateProvider', '$translateProvider', '$translatePartialLoaderProvider', '$controllerProvider', '$mdThemingProvider', function ($urlRouterProvider, $stateProvider, $translateProvider, $translatePartialLoaderProvider, $controllerProvider, $mdThemingProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider.state('root', {
    url: '',
    "abstract": true,
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
    templateUrl: 'wise5/authoringTool/notebook/notebookAuthoring.html',
    controller: 'AuthorNotebookController',
    controllerAs: 'authorNotebookController',
    resolve: {}
  });
  $translatePartialLoaderProvider.addPart('i18n');
  $translatePartialLoaderProvider.addPart('authoringTool/i18n');
  $translateProvider.useLoader('$translatePartialLoader', {
    urlTemplate: 'wise5/{part}/i18n_{lang}.json'
  }).registerAvailableLanguageKeys(['ar', 'el', 'en', 'es', 'ja', 'ko', 'pt', 'tr', 'zh_CN', 'zh_TW'], {
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
  $mdThemingProvider.theme('default').primaryPalette('deep-purple', {
    'default': '400'
  }).accentPalette('accent', {
    'default': '500'
  }).warnPalette('red', {
    'default': '800'
  });
  var lightMap = $mdThemingProvider.extendPalette('grey', {
    'A100': 'ffffff'
  });
  $mdThemingProvider.definePalette('light', lightMap);
  $mdThemingProvider.theme('light').primaryPalette('light', {
    'default': 'A100'
  }).accentPalette('pink', {
    'default': '900'
  });
  $mdThemingProvider.setDefaultTheme('default');
  $mdThemingProvider.enableBrowserColor(); // moment.js default overrides
  // TODO: add i18n support

  _moment["default"].updateLocale('en', {
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

var _default = authoringModule;
exports["default"] = _default;
//# sourceMappingURL=main.js.map
