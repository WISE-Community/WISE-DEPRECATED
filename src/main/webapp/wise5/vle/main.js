'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _achievementService = require('../services/achievementService');

var _achievementService2 = _interopRequireDefault(_achievementService);

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _angularDragula = require('angular-dragula');

var _angularDragula2 = _interopRequireDefault(_angularDragula);

var _ngFileUpload = require('ng-file-upload');

var _ngFileUpload2 = _interopRequireDefault(_ngFileUpload);

var _highchartsNg = require('highcharts-ng');

var _highchartsNg2 = _interopRequireDefault(_highchartsNg);

var _angularMaterial = require('angular-material');

var _angularMaterial2 = _interopRequireDefault(_angularMaterial);

var _angularMoment = require('angular-moment');

var _angularMoment2 = _interopRequireDefault(_angularMoment);

var _ngOnload = require('ng-onload');

var _ngOnload2 = _interopRequireDefault(_ngOnload);

var _angularSanitize = require('angular-sanitize');

var _angularSanitize2 = _interopRequireDefault(_angularSanitize);

var _toArrayFilter = require('lib/angular-toArrayFilter/toArrayFilter');

var _toArrayFilter2 = _interopRequireDefault(_toArrayFilter);

var _angularTranslate = require('angular-translate');

var _angularTranslate2 = _interopRequireDefault(_angularTranslate);

var _angularTranslateLoaderPartial = require('angular-translate-loader-partial');

var _angularTranslateLoaderPartial2 = _interopRequireDefault(_angularTranslateLoaderPartial);

var _angularUiRouter = require('angular-ui-router');

var _angularUiRouter2 = _interopRequireDefault(_angularUiRouter);

var _angularUiScrollpoint = require('angular-ui-scrollpoint');

var _angularUiScrollpoint2 = _interopRequireDefault(_angularUiScrollpoint);

var _angularWebsocket = require('angular-websocket');

var _angularWebsocket2 = _interopRequireDefault(_angularWebsocket);

var _animationComponentModule = require('../components/animation/animationComponentModule');

var _animationComponentModule2 = _interopRequireDefault(_animationComponentModule);

var _annotationService = require('../services/annotationService');

var _annotationService2 = _interopRequireDefault(_annotationService);

var _audioOscillatorComponentModule = require('../components/audioOscillator/audioOscillatorComponentModule');

var _audioOscillatorComponentModule2 = _interopRequireDefault(_audioOscillatorComponentModule);

var _conceptMapComponentModule = require('../components/conceptMap/conceptMapComponentModule');

var _conceptMapComponentModule2 = _interopRequireDefault(_conceptMapComponentModule);

var _configService = require('../services/configService');

var _configService2 = _interopRequireDefault(_configService);

var _cRaterService = require('../services/cRaterService');

var _cRaterService2 = _interopRequireDefault(_cRaterService);

var _components = require('../directives/components');

var _components2 = _interopRequireDefault(_components);

var _componentService = require('../components/componentService');

var _componentService2 = _interopRequireDefault(_componentService);

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

var _draggablePoints = require('../lib/draggable-points/draggable-points');

var _draggablePoints2 = _interopRequireDefault(_draggablePoints);

var _graphComponentModule = require('../components/graph/graphComponentModule');

var _graphComponentModule2 = _interopRequireDefault(_graphComponentModule);

var _htmlComponentModule = require('../components/html/htmlComponentModule');

var _htmlComponentModule2 = _interopRequireDefault(_htmlComponentModule);

var _httpInterceptor = require('../services/httpInterceptor');

var _httpInterceptor2 = _interopRequireDefault(_httpInterceptor);

var _labelComponentModule = require('../components/label/labelComponentModule');

var _labelComponentModule2 = _interopRequireDefault(_labelComponentModule);

var _matchComponentModule = require('../components/match/matchComponentModule');

var _matchComponentModule2 = _interopRequireDefault(_matchComponentModule);

var _multipleChoiceComponentModule = require('../components/multipleChoice/multipleChoiceComponentModule');

var _multipleChoiceComponentModule2 = _interopRequireDefault(_multipleChoiceComponentModule);

var _navigationController = require('./navigation/navigationController');

var _navigationController2 = _interopRequireDefault(_navigationController);

var _nodeController = require('./node/nodeController');

var _nodeController2 = _interopRequireDefault(_nodeController);

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

var _planningService = require('../services/planningService');

var _planningService2 = _interopRequireDefault(_planningService);

var _projectService = require('../services/projectService');

var _projectService2 = _interopRequireDefault(_projectService);

var _sessionService = require('../services/sessionService');

var _sessionService2 = _interopRequireDefault(_sessionService);

var _studentAsset = require('./studentAsset/studentAsset');

var _studentAsset2 = _interopRequireDefault(_studentAsset);

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

var _utilService = require('../services/utilService');

var _utilService2 = _interopRequireDefault(_utilService);

var _vleController = require('./vleController');

var _vleController2 = _interopRequireDefault(_vleController);

var _vleProjectService = require('./vleProjectService');

var _vleProjectService2 = _interopRequireDefault(_vleProjectService);

var _oclazyload = require('oclazyload');

var _oclazyload2 = _interopRequireDefault(_oclazyload);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _angularSummernote = require('lib/angular-summernote/dist/angular-summernote.min');

var _angularSummernote2 = _interopRequireDefault(_angularSummernote);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var vleModule = _angular2.default.module('vle', [(0, _angularDragula2.default)(_angular2.default), 'angularMoment', 'angular-toArrayFilter', 'animationComponentModule', 'audioOscillatorComponentModule', 'components', 'conceptMapComponentModule', 'discussionComponentModule', 'drawComponentModule', 'embeddedComponentModule', 'filters', 'graphComponentModule', 'highcharts-ng', 'htmlComponentModule', 'labelComponentModule', 'matchComponentModule', 'multipleChoiceComponentModule', 'ngAria', 'ngFileUpload', 'ngMaterial', 'ngOnload', 'ngSanitize', 'ngWebSocket', 'oc.lazyLoad', 'openResponseComponentModule', 'outsideURLComponentModule', 'pascalprecht.translate', 'studentAsset', 'summernote', 'tableComponentModule', 'ui.router', 'ui.scrollpoint']).service(_achievementService2.default.name, _achievementService2.default).service(_annotationService2.default.name, _annotationService2.default).service(_configService2.default.name, _configService2.default).service(_componentService2.default.name, _componentService2.default).service(_cRaterService2.default.name, _cRaterService2.default).service(_httpInterceptor2.default.name, _httpInterceptor2.default).service(_nodeService2.default.name, _nodeService2.default).service(_notebookService2.default.name, _notebookService2.default).service(_notificationService2.default.name, _notificationService2.default).service(_planningService2.default.name, _planningService2.default).service(_projectService2.default.name, _vleProjectService2.default).service(_sessionService2.default.name, _sessionService2.default).service(_studentAssetService2.default.name, _studentAssetService2.default).service(_studentDataService2.default.name, _studentDataService2.default).service(_studentStatusService2.default.name, _studentStatusService2.default).service(_studentWebSocketService2.default.name, _studentWebSocketService2.default).service(_utilService2.default.name, _utilService2.default).controller(_navigationController2.default.name, _navigationController2.default).controller(_nodeController2.default.name, _nodeController2.default).controller(_vleController2.default.name, _vleController2.default).filter(_filters2.default.name, _filters2.default).config(['$urlRouterProvider', '$stateProvider', '$translateProvider', '$translatePartialLoaderProvider', '$controllerProvider', '$mdThemingProvider', '$httpProvider', '$provide', function ($urlRouterProvider, $stateProvider, $translateProvider, $translatePartialLoaderProvider, $controllerProvider, $mdThemingProvider, $httpProvider, $provide) {
  $urlRouterProvider.otherwise('/vle/');

  _angular2.default.module('vle').$controllerProvider = $controllerProvider;

  $stateProvider.state('root', {
    url: '',
    abstract: true,
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
        return AchievementService.retrieveAchievements();
      },
      notifications: function notifications(NotificationService, studentData, config, project) {
        return NotificationService.retrieveNotifications();
      },
      runStatus: function runStatus(StudentDataService, config) {
        return StudentDataService.retrieveRunStatus();
      },
      sessionTimers: function sessionTimers(SessionService, config, project, studentData) {
        return SessionService.initializeSession();
      },
      webSocket: function webSocket(StudentWebSocketService, config, project) {
        return StudentWebSocketService.initialize();
      },
      language: function language($translate, ConfigService, config) {
        var locale = ConfigService.getLocale(); // defaults to "en"
        $translate.use(locale);
      },
      theme: function theme(ProjectService, config, project, $ocLazyLoad, $q) {
        var theme = ProjectService.getThemePath() + '/theme.js';
        var def = $q.defer();

        System.import(theme).then(function (m) {
          var themeModule = m.default;
          if (!m.default.name) {
            var key = Object.keys(m.default);
            themeModule = m.default[key[0]];
          }

          $ocLazyLoad.load(themeModule).then(function () {
            def.resolve();
          }, function (err) {
            throw err;
          });
        });

        return def.promise;
      }
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

  $httpProvider.interceptors.push('HttpInterceptor');

  // Set up Translations
  $translatePartialLoaderProvider.addPart('i18n');
  $translatePartialLoaderProvider.addPart('vle/i18n');
  $translateProvider.useLoader('$translatePartialLoader', {
    urlTemplate: 'wise5/{part}/i18n_{lang}.json'
  }).fallbackLanguage(['en']).registerAvailableLanguageKeys(['ar', 'el', 'en', 'es', 'ja', 'ko', 'pt', 'tr', 'zh_CN', 'zh_TW'], {
    'en_US': 'en',
    'en_UK': 'en'
  }).determinePreferredLanguage().useSanitizeValueStrategy('sanitizeParameters', 'escape');

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
exports.default = vleModule;
//# sourceMappingURL=main.js.map
