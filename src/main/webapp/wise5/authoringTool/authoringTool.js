'use strict';

import '../themes/default/js/webfonts';
import 'jquery';
import angular from 'angular';
import angularDragula from 'angular-dragula';
import 'ng-file-upload';
import 'highcharts-ng';
import 'angular-ui-router';
import 'angular-material';
import 'angular-moment';
import 'angular-sanitize';
import 'ng-stomp';
import 'angular-toarrayfilter';
import 'angular-translate';
import 'angular-translate-loader-partial';
import '../components/animation/animationAuthoringComponentModule';
import AnnotationService from '../services/annotationService';
import '../components/audioOscillator/audioOscillatorAuthoringComponentModule';
import './components/authoringToolComponents';
import AuthoringToolController from './authoringToolController';
import AuthoringToolMainController from './main/authoringToolMainController';
import AuthoringToolNewProjectController from './main/authoringToolNewProjectController';
import AuthoringToolProjectService from './authoringToolProjectService';
import AuthorNotebookController from './notebook/authorNotebookController';
import bootstrap from 'bootstrap';
import '../components/conceptMap/conceptMapAuthoringComponentModule';
import ConfigService from '../services/configService';
import CRaterService from '../services/cRaterService';
import '../directives/components';
import ComponentService from '../components/componentService';
import '../components/discussion/discussionAuthoringComponentModule';
import '../components/draw/drawAuthoringComponentModule';
import '../components/embedded/embeddedAuthoringComponentModule';
import '../filters/filters';
import '../lib/highcharts@4.2.1';
import '../components/graph/graphAuthoringComponentModule';
import '../components/html/htmlAuthoringComponentModule';
import '../components/label/labelAuthoringComponentModule';
import '../components/match/matchAuthoringComponentModule';
import '../components/multipleChoice/multipleChoiceAuthoringComponentModule';
import NodeAuthoringController from './node/nodeAuthoringController';
import NodeService from '../services/nodeService';
import NotebookService from '../services/notebookService';
import NotificationService from '../services/notificationService';
import '../components/openResponse/openResponseAuthoringComponentModule';
import '../components/outsideURL/outsideURLAuthoringComponentModule';
import ProjectAssetController from './asset/projectAssetController';
import ProjectAssetService from '../services/projectAssetService';
import ProjectController from './project/projectController';
import ProjectHistoryController from './history/projectHistoryController';
import ProjectInfoController from './info/projectInfoController';
import PlanningService from '../services/planningService';
import ProjectService from '../services/projectService';
import SessionService from '../services/sessionService';
import SockJS from 'sockjs-client';
import Stomp from "@stomp/stompjs"
import SpaceService from '../services/spaceService';
import StudentAssetService from '../services/studentAssetService';
import StudentDataService from '../services/studentDataService';
import StudentStatusService from '../services/studentStatusService';
import StudentWebSocketService from '../services/studentWebSocketService';
import '../components/summary/summaryAuthoringComponentModule'
import '../components/table/tableAuthoringComponentModule';
import TeacherDataService from '../services/teacherDataService';
import TeacherWebSocketService from '../services/teacherWebSocketService';
import UtilService from '../services/utilService';
import WISELinkAuthoringController from './wiseLink/wiseLinkAuthoringController';
import '../lib/angular-summernote/dist/angular-summernote';
import moment from 'moment';

const authoringModule = angular.module('authoring', [
    angularDragula(angular),
    'angularMoment',
    'angular-toArrayFilter',
    'summaryAuthoringComponentModule',
    'animationAuthoringComponentModule',
    'audioOscillatorAuthoringComponentModule',
    'authoringTool.components',
    'components',
    'conceptMapAuthoringComponentModule',
    'discussionAuthoringComponentModule',
    'drawAuthoringComponentModule',
    'embeddedAuthoringComponentModule',
    'filters',
    'graphAuthoringComponentModule',
    'highcharts-ng',
    'htmlComponentModule',
    'labelAuthoringComponentModule',
    'matchAuthoringComponentModule',
    'multipleChoiceAuthoringComponentModule',
    'ngAnimate',
    'ngAria',
    'ngFileUpload',
    'ngMaterial',
    'ngSanitize',
    'ngStomp',
    'openResponseAuthoringComponentModule',
    'outsideURLAuthoringComponentModule',
    'pascalprecht.translate',
    'summernote',
    'tableAuthoringComponentModule',
    'ui.router'
    ])
    .service('AnnotationService', AnnotationService)
    .service('ComponentService', ComponentService)
    .service('ConfigService', ConfigService)
    .service('CRaterService', CRaterService)
    .service('NodeService', NodeService)
    .service('NotebookService', NotebookService)
    .service('NotificationService', NotificationService)
    .service('PlanningService', PlanningService)
    .service('ProjectService', AuthoringToolProjectService)
    .service('ProjectAssetService', ProjectAssetService)
    .service('SessionService', SessionService)
    .service('SpaceService', SpaceService)
    .service('StudentAssetService', StudentAssetService)
    .service('StudentDataService', StudentDataService)
    .service('StudentStatusService', StudentStatusService)
    .service('StudentWebSocketService', StudentWebSocketService)
    .service('TeacherDataService', TeacherDataService)
    .service('TeacherWebSocketService', TeacherWebSocketService)
    .service('UtilService', UtilService)
    .controller('AuthoringToolController', AuthoringToolController)
    .controller('AuthoringToolMainController', AuthoringToolMainController)
    .controller('AuthoringToolNewProjectController', AuthoringToolNewProjectController)
    .controller('AuthorNotebookController', AuthorNotebookController)
    .controller('NodeAuthoringController', NodeAuthoringController)
    .controller('ProjectAssetController', ProjectAssetController)
    .controller('ProjectController', ProjectController)
    .controller('ProjectHistoryController', ProjectHistoryController)
    .controller('ProjectInfoController', ProjectInfoController)
    .controller('WISELinkAuthoringController', WISELinkAuthoringController)
    .config([
    '$urlRouterProvider',
    '$stateProvider',
    '$translateProvider',
    '$translatePartialLoaderProvider',
    '$controllerProvider',
    '$mdThemingProvider',
    ($urlRouterProvider,
     $stateProvider,
     $translateProvider,
     $translatePartialLoaderProvider,
     $controllerProvider,
     $mdThemingProvider) => {
  $urlRouterProvider.otherwise('/');

  $stateProvider
      .state('root', {
        url: '',
        abstract: true,
        templateUrl: 'wise5/authoringTool/authoringTool.html',
        controller: 'AuthoringToolController',
        controllerAs: 'authoringToolController',
        resolve: {}
      })
      .state('root.main', {
        url: '/',
        templateUrl: 'wise5/authoringTool/main/main.html',
        controller: 'AuthoringToolMainController',
        controllerAs: 'authoringToolMainController',
        resolve: {
          config: ['ConfigService', (ConfigService) => {
            if (window.configURL != null) {
              return ConfigService.retrieveConfig(window.configURL);
            } else {
              return ConfigService.retrieveConfig(`/authorConfig`);
            }
          }],
          language: ['$translate', 'ConfigService', 'config', ($translate, ConfigService, config) => {
            $translate.use(ConfigService.getLocale());
          }]
        }
      })
      .state('root.new', {
        url: '/new',
        templateUrl: 'wise5/authoringTool/main/new.html',
        controller: 'AuthoringToolNewProjectController',
        controllerAs: 'authoringToolNewProjectController',
        resolve: {
          config: ['ConfigService', (ConfigService) => {
            let configURL = window.configURL;
            if (configURL == null) {
              configURL = prompt('Please enter configURL', '/authorConfig/24678');
            }
            return ConfigService.retrieveConfig(configURL);
          }],
          language: ['$translate', 'ConfigService', 'config', ($translate, ConfigService, config) => {
            $translate.use(ConfigService.getLocale());
          }]
        }
      })
      .state('root.project', {
        url: '/project/:projectId',
        templateUrl: 'wise5/authoringTool/project/project.html',
        controller: 'ProjectController',
        controllerAs: 'projectController',
        resolve: {
          projectConfig: ['ConfigService', '$stateParams', (ConfigService, $stateParams) => {
            return ConfigService.retrieveConfig(`/authorConfig/${$stateParams.projectId}`);
          }],
          project: ['ProjectService', 'projectConfig', (ProjectService, projectConfig) => {
            return ProjectService.retrieveProject();
          }],
          projectAssets: ['ProjectAssetService', 'projectConfig', 'project',
              (ProjectAssetService, projectConfig, project) => {
            return ProjectAssetService.retrieveProjectAssets();
          }],
          language: ['$translate', 'ConfigService', 'projectConfig',
              ($translate, ConfigService, projectConfig) => {
            $translate.use(ConfigService.getLocale());
          }]
        }
      })
      .state('root.project.node', {
        url: '/node/:nodeId',
        templateUrl: 'wise5/authoringTool/node/node.html',
        controller: 'NodeAuthoringController',
        controllerAs: 'nodeAuthoringController',
        resolve: {}
      })
      .state('root.project.nodeConstraints', {
        url: '/node/constraints/:nodeId',
        templateUrl: 'wise5/authoringTool/node/node.html',
        controller: 'NodeAuthoringController',
        controllerAs: 'nodeAuthoringController',
        resolve: {}
      })
      .state('root.project.nodeEditPaths', {
        url: '/node/editpaths/:nodeId',
        templateUrl: 'wise5/authoringTool/node/node.html',
        controller: 'NodeAuthoringController',
        controllerAs: 'nodeAuthoringController',
        resolve: {}
      })
      .state('root.project.asset', {
        url: '/asset',
        templateUrl: 'wise5/authoringTool/asset/asset.html',
        controller: 'ProjectAssetController',
        controllerAs: 'projectAssetController',
        resolve: {}
      })
      .state('root.project.info', {
        url: '/info',
        templateUrl: 'wise5/authoringTool/info/info.html',
        controller: 'ProjectInfoController',
        controllerAs: 'projectInfoController',
        resolve: {}
      })
      .state('root.project.history', {
        url: '/history',
        templateUrl: 'wise5/authoringTool/history/history.html',
        controller: 'ProjectHistoryController',
        controllerAs: 'projectHistoryController',
        resolve: {}
      })
      .state('root.project.notebook', {
        url: '/notebook',
        templateUrl: 'wise5/authoringTool/notebook/notebookAuthoring.html',
        controller: 'AuthorNotebookController',
        controllerAs: 'authorNotebookController',
        resolve: {}
      });

  $translatePartialLoaderProvider.addPart('i18n');
  $translatePartialLoaderProvider.addPart('authoringTool/i18n');
  $translateProvider
      .useLoader('$translatePartialLoader', {
        urlTemplate: 'wise5/{part}/i18n_{lang}.json'
      })
      .registerAvailableLanguageKeys(
        ['ar','el','en','es','ja','ko','pt','tr','zh_CN','zh_TW'], {
        'en_US': 'en',
        'en_UK': 'en'
      })
      .determinePreferredLanguage()
      .fallbackLanguage(['en'])
      .useSanitizeValueStrategy('sanitizeParameters', 'escape');

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
  $mdThemingProvider.theme('default')
      .primaryPalette('deep-purple', { 'default': '400' })
      .accentPalette('accent',  { 'default': '500' })
      .warnPalette('red', { 'default': '800' });
  const lightMap = $mdThemingProvider.extendPalette('grey', {
  'A100': 'ffffff'
  });
  $mdThemingProvider.definePalette('light', lightMap);
  $mdThemingProvider.theme('light')
      .primaryPalette('light', { 'default': 'A100' })
      .accentPalette('pink', { 'default': '900' });
  $mdThemingProvider.setDefaultTheme('default');
  $mdThemingProvider.enableBrowserColor();

  // moment.js default overrides
  // TODO: add i18n support
  moment.updateLocale('en', {
    calendar: {
      lastDay : '[Yesterday at] LT',
      sameDay : '[Today at] LT',
      nextDay : '[Tomorrow at] LT',
      lastWeek : '[last] dddd [at] LT',
      nextWeek : 'dddd [at] LT',
      sameElse : 'll'
    }
  });
}]);

export default authoringModule;
