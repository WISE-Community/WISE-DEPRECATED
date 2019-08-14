'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _jquery = _interopRequireDefault(require("jquery"));

var _achievementService = _interopRequireDefault(require("../services/achievementService"));

var _angular = _interopRequireDefault(require("angular"));

var _angularDragula = _interopRequireDefault(require("angular-dragula"));

var _ngFileUpload = _interopRequireDefault(require("ng-file-upload"));

var _highchartsNg = _interopRequireDefault(require("highcharts-ng"));

var _angularMaterial = _interopRequireDefault(require("angular-material"));

var _angularMoment = _interopRequireDefault(require("angular-moment"));

var _ngOnload = _interopRequireDefault(require("ng-onload"));

var _angularSanitize = _interopRequireDefault(require("angular-sanitize"));

var _ngStompStandalone = _interopRequireDefault(require("../lib/stomp/ng-stomp.standalone.min"));

var _toArrayFilter = _interopRequireDefault(require("../lib/angular-toArrayFilter/toArrayFilter"));

var _angularTranslate = _interopRequireDefault(require("angular-translate"));

var _angularTranslateLoaderPartial = _interopRequireDefault(require("angular-translate-loader-partial"));

var _angularUiRouter = _interopRequireDefault(require("angular-ui-router"));

var _angularUiScrollpoint = _interopRequireDefault(require("angular-ui-scrollpoint"));

var _angularWebsocket = _interopRequireDefault(require("angular-websocket"));

var _animationComponentModule = _interopRequireDefault(require("../components/animation/animationComponentModule"));

var _annotationService = _interopRequireDefault(require("../services/annotationService"));

var _audioOscillatorComponentModule = _interopRequireDefault(require("../components/audioOscillator/audioOscillatorComponentModule"));

var _canvg = _interopRequireDefault(require("canvg"));

var _conceptMapComponentModule = _interopRequireDefault(require("../components/conceptMap/conceptMapComponentModule"));

var _configService = _interopRequireDefault(require("../services/configService"));

var _cRaterService = _interopRequireDefault(require("../services/cRaterService"));

var _components = _interopRequireDefault(require("../directives/components"));

var _componentService = _interopRequireDefault(require("../components/componentService"));

var _discussionComponentModule = _interopRequireDefault(require("../components/discussion/discussionComponentModule"));

var _drawComponentModule = _interopRequireDefault(require("../components/draw/drawComponentModule"));

var _embeddedComponentModule = _interopRequireDefault(require("../components/embedded/embeddedComponentModule"));

var _fabric = _interopRequireDefault(require("fabric"));

var _filters = _interopRequireDefault(require("../filters/filters"));

var _highcharts = _interopRequireDefault(require("../lib/highcharts@4.2.1"));

var _highchartsExporting = _interopRequireDefault(require("../lib/highcharts-exporting@4.2.1"));

var _draggablePoints = _interopRequireDefault(require("../lib/draggable-points/draggable-points"));

var _graphComponentModule = _interopRequireDefault(require("../components/graph/graphComponentModule"));

var _htmlComponentModule = _interopRequireDefault(require("../components/html/htmlComponentModule"));

var _httpInterceptor = _interopRequireDefault(require("../services/httpInterceptor"));

var _labelComponentModule = _interopRequireDefault(require("../components/label/labelComponentModule"));

var _matchComponentModule = _interopRequireDefault(require("../components/match/matchComponentModule"));

var _multipleChoiceComponentModule = _interopRequireDefault(require("../components/multipleChoice/multipleChoiceComponentModule"));

var _navigationController = _interopRequireDefault(require("./navigation/navigationController"));

var _nodeController = _interopRequireDefault(require("./node/nodeController"));

var _nodeService = _interopRequireDefault(require("../services/nodeService"));

var _notebookService = _interopRequireDefault(require("../services/notebookService"));

var _notificationService = _interopRequireDefault(require("../services/notificationService"));

var _openResponseComponentModule = _interopRequireDefault(require("../components/openResponse/openResponseComponentModule"));

var _outsideURLComponentModule = _interopRequireDefault(require("../components/outsideURL/outsideURLComponentModule"));

var _planningService = _interopRequireDefault(require("../services/planningService"));

var _projectService = _interopRequireDefault(require("../services/projectService"));

var _sessionService = _interopRequireDefault(require("../services/sessionService"));

var _studentAsset = _interopRequireDefault(require("./studentAsset/studentAsset"));

var _studentAssetService = _interopRequireDefault(require("../services/studentAssetService"));

var _studentDataService = _interopRequireDefault(require("../services/studentDataService"));

var _studentStatusService = _interopRequireDefault(require("../services/studentStatusService"));

var _studentWebSocketService = _interopRequireDefault(require("../services/studentWebSocketService"));

var _tableComponentModule = _interopRequireDefault(require("../components/table/tableComponentModule"));

var _utilService = _interopRequireDefault(require("../services/utilService"));

var _vleController = _interopRequireDefault(require("./vleController"));

var _vleProjectService = _interopRequireDefault(require("./vleProjectService"));

var _oclazyload = _interopRequireDefault(require("oclazyload"));

var _moment = _interopRequireDefault(require("moment"));

var _angularSummernote = _interopRequireDefault(require("../lib/angular-summernote/dist/angular-summernote.min"));

var _theme = _interopRequireDefault(require("../themes/default/theme"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var vleModule = _angular["default"].module('vle', [(0, _angularDragula["default"])(_angular["default"]), 'angularMoment', 'angular-toArrayFilter', 'animationComponentModule', 'audioOscillatorComponentModule', 'components', 'conceptMapComponentModule', 'discussionComponentModule', 'drawComponentModule', 'embeddedComponentModule', 'filters', 'graphComponentModule', 'highcharts-ng', 'htmlComponentModule', 'labelComponentModule', 'matchComponentModule', 'multipleChoiceComponentModule', 'ngAria', 'ngFileUpload', 'ngMaterial', 'ngOnload', 'ngSanitize', 'ngStomp', 'ngWebSocket', 'oc.lazyLoad', 'openResponseComponentModule', 'outsideURLComponentModule', 'pascalprecht.translate', 'studentAsset', 'summernote', 'tableComponentModule', 'theme', 'ui.router', 'ui.scrollpoint']).service(_achievementService["default"].name, _achievementService["default"]).service(_annotationService["default"].name, _annotationService["default"]).service(_configService["default"].name, _configService["default"]).service(_componentService["default"].name, _componentService["default"]).service(_cRaterService["default"].name, _cRaterService["default"]).service(_httpInterceptor["default"].name, _httpInterceptor["default"]).service(_nodeService["default"].name, _nodeService["default"]).service(_notebookService["default"].name, _notebookService["default"]).service(_notificationService["default"].name, _notificationService["default"]).service(_planningService["default"].name, _planningService["default"]).service(_projectService["default"].name, _vleProjectService["default"]).service(_sessionService["default"].name, _sessionService["default"]).service(_studentAssetService["default"].name, _studentAssetService["default"]).service(_studentDataService["default"].name, _studentDataService["default"]).service(_studentStatusService["default"].name, _studentStatusService["default"]).service(_studentWebSocketService["default"].name, _studentWebSocketService["default"]).service(_utilService["default"].name, _utilService["default"]).controller(_navigationController["default"].name, _navigationController["default"]).controller(_nodeController["default"].name, _nodeController["default"]).controller(_vleController["default"].name, _vleController["default"]).filter(_filters["default"].name, _filters["default"]).config(['$urlRouterProvider', '$stateProvider', '$translateProvider', '$translatePartialLoaderProvider', '$controllerProvider', '$mdThemingProvider', '$httpProvider', '$provide', function ($urlRouterProvider, $stateProvider, $translateProvider, $translatePartialLoaderProvider, $controllerProvider, $mdThemingProvider, $httpProvider, $provide) {
  $urlRouterProvider.otherwise('/vle/');
  _angular["default"].module('vle').$controllerProvider = $controllerProvider;
  $stateProvider.state('root', {
    url: '',
    "abstract": true,
    templateProvider: ['$http', 'ProjectService', function ($http, ProjectService) {
      var themePath = ProjectService.getThemePath();
      return $http.get(themePath + '/vle.html').then(function (response) {
        return response.data;
      });
    }],
    controller: 'VLEController',
    controllerAs: 'vleController',
    resolve: {
      config: function config(ConfigService) {
        var configURL = window.configURL;
        return ConfigService.retrieveConfig(configURL);
      },
      project: function project(ProjectService, config) {
        return ProjectService.retrieveProject();
      },
      studentData: function studentData(StudentDataService, config, project) {
        return StudentDataService.retrieveStudentData();
      },
      notebook: function notebook(NotebookService, ConfigService, StudentAssetService, studentData, config, project) {
        return StudentAssetService.retrieveAssets().then(function (studentAssets) {
          return NotebookService.retrieveNotebookItems(ConfigService.getWorkgroupId()).then(function (notebook) {
            return notebook;
          });
        });
      },
      achievements: function achievements(AchievementService, studentData, config, project) {
        return AchievementService.retrieveStudentAchievements();
      },
      notifications: function notifications(NotificationService, studentData, config, project) {
        return NotificationService.retrieveNotifications();
      },
      runStatus: function runStatus(StudentDataService, config) {
        return StudentDataService.retrieveRunStatus();
      },
      webSocket: function webSocket(StudentWebSocketService, ConfigService, config, project) {
        if (!ConfigService.isPreview()) {
          return StudentWebSocketService.initialize();
        }
      },
      language: function language($translate, ConfigService, config) {
        var locale = ConfigService.getLocale(); // defaults to "en"

        $translate.use(locale);
      }
      /*
      theme: (ProjectService, config, project, $ocLazyLoad, $q) => {
        let theme = ProjectService.getThemePath() + '/theme.js';
        let def = $q.defer();
         System.import('theme').then(m => {
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
      */

    }
  }).state('root.vle', {
    url: '/vle/:nodeId',
    views: {
      'nodeView': {
        templateProvider: ['$http', 'ConfigService', function ($http, ConfigService) {
          var wiseBaseURL = ConfigService.getWISEBaseURL();
          return $http.get(wiseBaseURL + '/wise5/vle/node/index.html').then(function (response) {
            return response.data;
          });
        }],
        controller: 'NodeController',
        controllerAs: 'nodeController'
      }
    }
  }).state('root.component', {
    url: '/vle/:nodeId/:componentId',
    views: {
      'nodeView': {
        templateProvider: ['$http', 'ConfigService', function ($http, ConfigService) {
          var wiseBaseURL = ConfigService.getWISEBaseURL();
          return $http.get(wiseBaseURL + '/wise5/vle/node/index.html').then(function (response) {
            return response.data;
          });
        }],
        controller: 'NodeController',
        controllerAs: 'nodeController'
      }
    }
  });
  $httpProvider.interceptors.push('HttpInterceptor'); // Set up Translations

  $translatePartialLoaderProvider.addPart('i18n');
  $translatePartialLoaderProvider.addPart('vle/i18n');
  $translateProvider.useLoader('$translatePartialLoader', {
    urlTemplate: 'wise5/{part}/i18n_{lang}.json'
  }).fallbackLanguage(['en']).registerAvailableLanguageKeys(['ar', 'el', 'en', 'es', 'ja', 'ko', 'pt', 'tr', 'zh_CN', 'zh_TW'], {
    'en_US': 'en',
    'en_UK': 'en'
  }).determinePreferredLanguage().useSanitizeValueStrategy('sanitizeParameters', 'escape'); // ngMaterial default theme configuration
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
    'contrastDefaultColor': 'light',
    // whether, by default, text (contrast)
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
    'default': '800'
  });
  var lightMap = $mdThemingProvider.extendPalette('grey', {
    'A100': 'ffffff'
  });
  $mdThemingProvider.definePalette('light', lightMap);
  $mdThemingProvider.theme('light').primaryPalette('light', {
    'default': 'A100'
  }).accentPalette('primary');
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

_angular["default"].element(document).ready(function () {
  _angular["default"].bootstrap(document.getElementsByTagName('body')[0], [vleModule.name], {
    strictDi: true
  });
});

var _default = vleModule;
exports["default"] = _default;
//# sourceMappingURL=main.js.map
