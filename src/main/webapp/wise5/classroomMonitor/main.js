'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("../themes/default/js/webfonts");

var _jquery = _interopRequireDefault(require("jquery"));

var _achievementService = _interopRequireDefault(require("../services/achievementService"));

var _angular = _interopRequireDefault(require("angular"));

var _angularDragula = _interopRequireDefault(require("angular-dragula"));

var _angularFileSaver = _interopRequireDefault(require("angular-file-saver"));

var _angularInview = _interopRequireDefault(require("angular-inview"));

var _angularMoment = _interopRequireDefault(require("angular-moment"));

var _toArrayFilter = _interopRequireDefault(require("lib/angular-toArrayFilter/toArrayFilter"));

var _angularUiRouter = _interopRequireDefault(require("angular-ui-router"));

var _ngFileUpload = _interopRequireDefault(require("ng-file-upload"));

var _angularMaterial = _interopRequireDefault(require("angular-material"));

var _angularSanitize = _interopRequireDefault(require("angular-sanitize"));

var _angularSockjs = _interopRequireDefault(require("angular-sockjs"));

var _ngStompStandalone = _interopRequireDefault(require("../lib/stomp/ng-stomp.standalone.min"));

var _angularTranslate = _interopRequireDefault(require("angular-translate"));

var _angularTranslateLoaderPartial = _interopRequireDefault(require("angular-translate-loader-partial"));

var _angularWebsocket = _interopRequireDefault(require("angular-websocket"));

var _animationComponentModule = _interopRequireDefault(require("../components/animation/animationComponentModule"));

var _annotationService = _interopRequireDefault(require("../services/annotationService"));

var _audioOscillatorComponentModule = _interopRequireDefault(require("../components/audioOscillator/audioOscillatorComponentModule"));

var _classroomMonitorComponents = _interopRequireDefault(require("./classroomMonitorComponents"));

var _classroomMonitorController = _interopRequireDefault(require("./classroomMonitorController"));

var _classroomMonitorProjectService = _interopRequireDefault(require("./classroomMonitorProjectService"));

var _conceptMapComponentModule = _interopRequireDefault(require("../components/conceptMap/conceptMapComponentModule"));

var _configService = _interopRequireDefault(require("../services/configService"));

var _cRaterService = _interopRequireDefault(require("../services/cRaterService"));

var _components = _interopRequireDefault(require("../directives/components"));

var _componentService = _interopRequireDefault(require("../components/componentService"));

var _dashboardController = _interopRequireDefault(require("./dashboard/dashboardController"));

var _dataExportController = _interopRequireDefault(require("./dataExport/dataExportController"));

var _discussionComponentModule = _interopRequireDefault(require("../components/discussion/discussionComponentModule"));

var _drawComponentModule = _interopRequireDefault(require("../components/draw/drawComponentModule"));

var _embeddedComponentModule = _interopRequireDefault(require("../components/embedded/embeddedComponentModule"));

var _graphComponentModule = _interopRequireDefault(require("../components/graph/graphComponentModule"));

var _highcharts = _interopRequireDefault(require("../lib/highcharts@4.2.1"));

var _highchartsNg = _interopRequireDefault(require("highcharts-ng"));

var _htmlComponentModule = _interopRequireDefault(require("../components/html/htmlComponentModule"));

var _httpInterceptor = _interopRequireDefault(require("../services/httpInterceptor"));

var _labelComponentModule = _interopRequireDefault(require("../components/label/labelComponentModule"));

var _matchComponentModule = _interopRequireDefault(require("../components/match/matchComponentModule"));

var _manageStudentsController = _interopRequireDefault(require("./manageStudents/manageStudentsController"));

var _milestonesController = _interopRequireDefault(require("./milestones/milestonesController"));

var _multipleChoiceComponentModule = _interopRequireDefault(require("../components/multipleChoice/multipleChoiceComponentModule"));

var _nodeGradingController = _interopRequireDefault(require("./nodeGrading/nodeGradingController"));

var _nodeProgressController = _interopRequireDefault(require("./nodeProgress/nodeProgressController"));

var _nodeService = _interopRequireDefault(require("../services/nodeService"));

var _notebookComponents = _interopRequireDefault(require("../themes/default/notebook/notebookComponents"));

var _notebookGradingController = _interopRequireDefault(require("./notebook/notebookGradingController"));

var _notebookItemGrading = _interopRequireDefault(require("./notebook/notebookItemGrading/notebookItemGrading"));

var _notebookService = _interopRequireDefault(require("../services/notebookService"));

var _notificationService = _interopRequireDefault(require("../services/notificationService"));

var _openResponseComponentModule = _interopRequireDefault(require("../components/openResponse/openResponseComponentModule"));

var _outsideURLComponentModule = _interopRequireDefault(require("../components/outsideURL/outsideURLComponentModule"));

var _planningService = _interopRequireDefault(require("../services/planningService"));

var _projectService = _interopRequireDefault(require("../services/projectService"));

var _sessionService = _interopRequireDefault(require("../services/sessionService"));

var _studentAssetService = _interopRequireDefault(require("../services/studentAssetService"));

var _studentDataService = _interopRequireDefault(require("../services/studentDataService"));

var _studentGradingController = _interopRequireDefault(require("./studentGrading/studentGradingController"));

var _studentProgressController = _interopRequireDefault(require("./studentProgress/studentProgressController"));

var _studentStatusService = _interopRequireDefault(require("../services/studentStatusService"));

var _studentWebSocketService = _interopRequireDefault(require("../services/studentWebSocketService"));

var _summaryComponentModule = _interopRequireDefault(require("../components/summary/summaryComponentModule"));

var _tableComponentModule = _interopRequireDefault(require("../components/table/tableComponentModule"));

var _teacherDataService = _interopRequireDefault(require("../services/teacherDataService"));

var _teacherWebSocketService = _interopRequireDefault(require("../services/teacherWebSocketService"));

var _utilService = _interopRequireDefault(require("../services/utilService"));

require("lib/angular-summernote/dist/angular-summernote.min");

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var classroomMonitorModule = _angular["default"].module('classroomMonitor', [(0, _angularDragula["default"])(_angular["default"]), 'summaryComponentModule', 'angularMoment', 'angular-inview', 'angular-toArrayFilter', 'animationComponentModule', 'audioOscillatorComponentModule', 'components', 'conceptMapComponentModule', 'classroomMonitor.components', 'discussionComponentModule', 'drawComponentModule', 'embeddedComponentModule', 'graphComponentModule', 'highcharts-ng', 'htmlComponentModule', 'labelComponentModule', 'matchComponentModule', 'multipleChoiceComponentModule', 'ngAnimate', 'ngAria', 'ngFileSaver', 'ngFileUpload', 'ngMaterial', 'ngSanitize', 'bd.sockjs', 'ngStomp', 'ngWebSocket', 'theme.notebook', 'openResponseComponentModule', 'outsideURLComponentModule', 'pascalprecht.translate', 'summernote', 'tableComponentModule', 'ui.router']).service(_achievementService["default"].name, _achievementService["default"]).service(_annotationService["default"].name, _annotationService["default"]).service(_componentService["default"].name, _componentService["default"]).service(_configService["default"].name, _configService["default"]).service(_cRaterService["default"].name, _cRaterService["default"]).service(_httpInterceptor["default"].name, _httpInterceptor["default"]).service(_nodeService["default"].name, _nodeService["default"]).service(_notebookService["default"].name, _notebookService["default"]).service(_notificationService["default"].name, _notificationService["default"]).service(_planningService["default"].name, _planningService["default"]).service(_projectService["default"].name, _classroomMonitorProjectService["default"]).service(_sessionService["default"].name, _sessionService["default"]).service(_studentAssetService["default"].name, _studentAssetService["default"]).service(_studentDataService["default"].name, _studentDataService["default"]).service(_studentStatusService["default"].name, _studentStatusService["default"]).service(_studentWebSocketService["default"].name, _studentWebSocketService["default"]).service(_teacherDataService["default"].name, _teacherDataService["default"]).service(_teacherWebSocketService["default"].name, _teacherWebSocketService["default"]).service(_utilService["default"].name, _utilService["default"]).controller(_classroomMonitorController["default"].name, _classroomMonitorController["default"]).controller(_dataExportController["default"].name, _dataExportController["default"]).controller(_manageStudentsController["default"].name, _manageStudentsController["default"]).controller(_milestonesController["default"].name, _milestonesController["default"]).controller(_nodeGradingController["default"].name, _nodeGradingController["default"]).controller(_nodeProgressController["default"].name, _nodeProgressController["default"]).controller(_notebookGradingController["default"].name, _notebookGradingController["default"]).controller(_studentGradingController["default"].name, _studentGradingController["default"]).controller(_studentProgressController["default"].name, _studentProgressController["default"]).component('notebookItemGrading', _notebookItemGrading["default"]).config(['$urlRouterProvider', '$stateProvider', '$translateProvider', '$translatePartialLoaderProvider', '$controllerProvider', '$mdThemingProvider', '$httpProvider', function ($urlRouterProvider, $stateProvider, $translateProvider, $translatePartialLoaderProvider, $controllerProvider, $mdThemingProvider, $httpProvider) {
  $urlRouterProvider.otherwise('/project/');
  $stateProvider.state('root', {
    url: '',
    "abstract": true,
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
      achievements: function achievements(AchievementService, studentStatuses, config, project) {
        return AchievementService.retrieveStudentAchievements();
      },
      notifications: function notifications(NotificationService, ConfigService, studentStatuses, config, project) {
        return NotificationService.retrieveNotifications();
      },
      webSocket: function webSocket(TeacherWebSocketService, config) {
        return TeacherWebSocketService.initialize();
      },
      language: function language($translate, ConfigService, config) {
        var locale = ConfigService.getLocale(); // defaults to "en"

        $translate.use(locale);
      },
      annotations: function annotations(TeacherDataService, config) {
        return TeacherDataService.retrieveAnnotations();
      },
      notebook: function notebook(NotebookService, ConfigService, config, project) {
        if (NotebookService.isNotebookEnabled() || NotebookService.isTeacherNotebookEnabled()) {
          return NotebookService.retrieveNotebookItems().then(function (notebook) {
            return notebook;
          });
        } else {
          return NotebookService.notebook;
        }
      }
    }
  }).state('root.teamLanding', {
    url: '/team',
    templateUrl: 'wise5/classroomMonitor/studentProgress/studentProgress.html',
    controller: 'StudentProgressController',
    controllerAs: 'studentProgressController'
  }).state('root.team', {
    url: '/team/:workgroupId',
    templateUrl: 'wise5/classroomMonitor/studentGrading/studentGrading.html',
    controller: 'StudentGradingController',
    controllerAs: 'studentGradingController',
    resolve: {
      studentData: function studentData($stateParams, TeacherDataService, config) {
        return TeacherDataService.retrieveStudentDataByWorkgroupId($stateParams.workgroupId);
      }
    }
  }).state('root.project', {
    url: '/project/:nodeId?periodId&workgroupId',
    views: {
      'nodeView': {
        templateUrl: 'wise5/classroomMonitor/nodeGrading/nodeGrading.html',
        controller: 'NodeGradingController',
        controllerAs: 'nodeGradingController'
      }
    }
  }).state('root.manageStudents', {
    url: '/manageStudents',
    templateUrl: 'wise5/classroomMonitor/manageStudents/manageStudents.html',
    controller: 'ManageStudentsController',
    controllerAs: 'manageStudentsController'
  }).state('root.dashboard', {
    url: '/dashboard',
    templateUrl: 'wise5/classroomMonitor/dashboard/dashboard.html',
    controller: 'DashboardController',
    controllerAs: 'dashboardController'
  }).state('root.export', {
    url: '/export',
    templateUrl: 'wise5/classroomMonitor/dataExport/dataExport.html',
    controller: 'DataExportController',
    controllerAs: 'dataExportController'
  }).state('root.milestones', {
    url: '/milestones',
    templateUrl: 'wise5/classroomMonitor/milestones/milestones.html',
    controller: 'MilestonesController',
    controllerAs: 'milestonesController'
  }).state('root.notebooks', {
    url: '/notebook',
    templateUrl: 'wise5/classroomMonitor/notebook/notebookGrading.html',
    controller: 'NotebookGradingController',
    controllerAs: 'notebookGradingController'
  });
  $httpProvider.interceptors.push('HttpInterceptor'); // Set up Translations

  $translatePartialLoaderProvider.addPart('i18n');
  $translatePartialLoaderProvider.addPart('classroomMonitor/i18n');
  $translateProvider.useLoader('$translatePartialLoader', {
    urlTemplate: 'wise5/{part}/i18n_{lang}.json'
  }).fallbackLanguage(['en']).registerAvailableLanguageKeys(['ar', 'el', 'en', 'es', 'ja', 'ko', 'pt', 'tr', 'zh_CN', 'zh_TW'], {
    'en_US': 'en',
    'en_UK': 'en'
  }).determinePreferredLanguage().useSanitizeValueStrategy('sanitizeParameters', 'escape');
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
  $mdThemingProvider.theme('default').primaryPalette('blue', {
    'default': '800'
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
  }).accentPalette('blue', {
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

var _default = classroomMonitorModule;
exports["default"] = _default;
//# sourceMappingURL=main.js.map
