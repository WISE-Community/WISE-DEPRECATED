'use strict';

import '../lib/jquery/jquery-global';
import '../lib/bootstrap/js/bootstrap.min';
import '../themes/default/js/webfonts';
import AchievementService from '../services/achievementService';
import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import * as angularDragula from 'angular-dragula';
import 'angular-file-saver';
import 'angular-inview';
import 'angular-moment';
import 'angular-toarrayfilter';
import 'angular-ui-router';
import 'ng-file-upload';
import 'angular-material';
import 'angular-sanitize';
import 'ng-stomp';
import 'angular-translate';
import 'angular-translate-loader-partial';
import '../components/animation/animationComponentModule';
import { AnnotationService } from '../services/annotationService';
import '../components/audioOscillator/audioOscillatorComponentModule';
import '../classroomMonitor/classroomMonitorComponents';
import ClassroomMonitorController from '../classroomMonitor/classroomMonitorController';
import '../components/conceptMap/conceptMapComponentModule';
import { ConfigService } from '../services/configService';
import { CRaterService } from '../services/cRaterService';
import '../directives/components';
import ComponentService from '../components/componentService';
import '../classroomMonitor/dashboard/dashboardController';
import DataExportController from '../classroomMonitor/dataExport/dataExportController';
import ExportController from '../classroomMonitor/dataExport/exportController';
import ExportVisitsController from '../classroomMonitor/dataExport/exportVisitsController';
import '../components/discussion/discussionComponentModule';
import '../components/draw/drawComponentModule';
import '../components/embedded/embeddedComponentModule';
import '../components/graph/graphComponentModule';
import '../lib/highcharts/highcharts-ng';
import * as Highcharts from '../../wise5/lib/highcharts/highcharts.src';
import '../../wise5/lib/draggable-points/draggable-points';
import * as HighchartsExporting from '../../wise5/lib/highcharts-exporting@4.2.1';
import * as covariance from 'compute-covariance';
window['Highcharts'] = Highcharts;
window['HighchartsExporting'] = HighchartsExporting;
window['covariance'] = covariance;
import '../components/html/htmlComponentModule';
import HttpInterceptor from '../services/httpInterceptor';
import '../components/label/labelComponentModule';
import '../components/match/matchComponentModule';
import ManageStudentsController from '../classroomMonitor/manageStudents/manageStudentsController';
import MilestonesController from '../classroomMonitor/milestones/milestonesController';
import MilestoneService from '../services/milestoneService';
import '../components/multipleChoice/multipleChoiceComponentModule';
import NodeService from '../services/nodeService';
import '../themes/default/notebook/notebookComponents';
import NotebookGradingController from '../classroomMonitor/notebook/notebookGradingController';
import NotebookService from '../services/notebookService';
import NotificationService from '../services/notificationService';
import '../components/openResponse/openResponseComponentModule';
import '../components/outsideURL/outsideURLComponentModule';
import { SessionService } from '../services/sessionService';
import * as SockJS from 'sockjs-client';
import * as StompJS from '@stomp/stompjs';
window['SockJS'] = SockJS;
window['Stomp'] = StompJS.Stomp;
import { StudentAssetService } from '../services/studentAssetService';
import { StudentDataService } from '../services/studentDataService';
import StudentGradingController from '../classroomMonitor/studentGrading/studentGradingController';
import StudentProgressController from '../classroomMonitor/studentProgress/studentProgressController';
import { StudentStatusService } from '../services/studentStatusService';
import '../components/summary/summaryComponentModule';
import '../components/table/tableComponentModule';
import TeacherDataService from '../services/teacherDataService';
import TeacherWebSocketService from '../services/teacherWebSocketService';
import { UtilService } from '../services/utilService';
import * as moment from 'moment';
import { AudioRecorderService } from '../services/audioRecorderService';
import { TeacherProjectService } from '../services/teacherProjectService';
import '../components/animation/animationAuthoringComponentModule';
import '../components/audioOscillator/audioOscillatorAuthoringComponentModule';
import '../authoringTool/components/authoringToolComponents';
import AdvancedAuthoringController from '../authoringTool/advanced/advancedAuthoringController';
import AuthoringToolController from '../authoringTool/authoringToolController';
import AuthoringToolMainController from '../authoringTool/main/authoringToolMainController';
import AuthorNotebookController from '../authoringTool/notebook/authorNotebookController';
import '../components/conceptMap/conceptMapAuthoringComponentModule';
import '../directives/components';
import '../components/discussion/discussionAuthoringComponentModule';
import '../components/draw/drawAuthoringComponentModule';
import '../components/embedded/embeddedAuthoringComponentModule';
import '../filters/filters';
import '../lib/highcharts/highcharts-ng';
import '../../wise5/lib/draggable-points/draggable-points';
import '../components/graph/graphAuthoringComponentModule';
import '../components/html/htmlAuthoringComponentModule';
import '../authoringTool/importStep/importStepModule';
import '../components/label/labelAuthoringComponentModule';
import '../components/match/matchAuthoringComponentModule';
import '../components/multipleChoice/multipleChoiceAuthoringComponentModule';
import MilestonesAuthoringController from '../authoringTool/milestones/milestonesAuthoringController';
import NodeAuthoringController from '../authoringTool/node/nodeAuthoringController';
import '../components/openResponse/openResponseAuthoringComponentModule';
import '../components/outsideURL/outsideURLAuthoringComponentModule';
import ProjectAssetController from '../authoringTool/asset/projectAssetController';
import { ProjectAssetService } from '../../site/src/app/services/projectAssetService';
import ProjectController from '../authoringTool/project/projectController';
import ProjectInfoController from '../authoringTool/info/projectInfoController';
import RubricAuthoringController from '../authoringTool/rubric/rubricAuthoringController';
import { SpaceService } from '../services/spaceService';
import '../authoringTool/structure/structureAuthoringModule';
import '../components/summary/summaryAuthoringComponentModule';
import '../components/table/tableAuthoringComponentModule';
import WISELinkAuthoringController from '../authoringTool/wiseLink/wiseLinkAuthoringController';
import { TagService } from '../services/tagService';
import '../lib/summernote/dist/summernote.min';
import '../lib/angular-summernote/dist/angular-summernote.min';
import '../lib/summernoteExtensions/summernote-ext-addNote.js';
import '../lib/summernoteExtensions/summernote-ext-print.js';

const teacherModule = angular
  .module('teacher', [
    angularDragula(angular),
    'angularMoment',
    'angular-inview',
    'angular-toArrayFilter',
    'summaryAuthoringComponentModule',
    'animationComponentModule',
    'animationAuthoringComponentModule',
    'audioOscillatorComponentModule',
    'audioOscillatorAuthoringComponentModule',
    'authoringTool.components',
    'components',
    'conceptMapComponentModule',
    'classroomMonitor.components',
    'conceptMapAuthoringComponentModule',
    'discussionAuthoringComponentModule',
    'discussionComponentModule',
    'drawAuthoringComponentModule',
    'drawComponentModule',
    'embeddedAuthoringComponentModule',
    'embeddedComponentModule',
    'filters',
    'graphAuthoringComponentModule',
    'graphComponentModule',
    'highcharts-ng',
    'htmlAuthoringComponentModule',
    'htmlComponentModule',
    'importStepModule',
    'labelAuthoringComponentModule',
    'labelComponentModule',
    'matchAuthoringComponentModule',
    'matchComponentModule',
    'multipleChoiceAuthoringComponentModule',
    'multipleChoiceComponentModule',
    'ngAnimate',
    'ngAria',
    'ngFileSaver',
    'ngFileUpload',
    'ngMaterial',
    'ngSanitize',
    'ngStomp',
    'openResponseAuthoringComponentModule',
    'openResponseComponentModule',
    'outsideURLAuthoringComponentModule',
    'outsideURLComponentModule',
    'pascalprecht.translate',
    'summernote',
    'structureAuthoringModule',
    'tableAuthoringComponentModule',
    'tableComponentModule',
    'theme.notebook',
    'ui.router'])
  .service('AchievementService', AchievementService)
  .factory('AnnotationService', downgradeInjectable(AnnotationService))
  .factory('AudioRecorderService', downgradeInjectable(AudioRecorderService))
  .service('ComponentService', ComponentService)
  .factory('ConfigService', downgradeInjectable(ConfigService))
  .factory('CRaterService', downgradeInjectable(CRaterService))
  .service('HttpInterceptor', HttpInterceptor)
  .service('MilestoneService', MilestoneService)
  .service('NodeService', NodeService)
  .service('NotebookService', NotebookService)
  .service('NotificationService', NotificationService)
  .factory('ProjectService', downgradeInjectable(TeacherProjectService))
  .factory('ProjectAssetService', downgradeInjectable(ProjectAssetService))
  .factory('SessionService', downgradeInjectable(SessionService))
  .factory('SpaceService', downgradeInjectable(SpaceService))
  .factory('StudentAssetService', downgradeInjectable(StudentAssetService))
  .factory('StudentDataService', downgradeInjectable(StudentDataService))
  .factory('StudentStatusService', downgradeInjectable(StudentStatusService))
  .factory('TagService', downgradeInjectable(TagService))
  .service('TeacherDataService', TeacherDataService)
  .service('TeacherWebSocketService', TeacherWebSocketService)
  .factory('UtilService', downgradeInjectable(UtilService))
  .controller('AuthoringToolController', AuthoringToolController)
  .controller('AuthoringToolMainController', AuthoringToolMainController)
  .controller('AdvancedAuthoringController', AdvancedAuthoringController)
  .controller('AuthorNotebookController', AuthorNotebookController)
  .controller('ClassroomMonitorController', ClassroomMonitorController)
  .controller('DataExportController', DataExportController)
  .controller('ExportController', ExportController)
  .controller('ExportVisitsController', ExportVisitsController)
  .controller('ManageStudentsController', ManageStudentsController)
  .controller('MilestonesAuthoringController', MilestonesAuthoringController)
  .controller('MilestonesController', MilestonesController)
  .controller('NodeAuthoringController', NodeAuthoringController)
  .controller('NotebookGradingController', NotebookGradingController)
  .controller('ProjectAssetController', ProjectAssetController)
  .controller('ProjectController', ProjectController)
  .controller('ProjectInfoController', ProjectInfoController)
  .controller('RubricAuthoringController', RubricAuthoringController)
  .controller('StudentGradingController', StudentGradingController)
  .controller('StudentProgressController', StudentProgressController)
  .controller('WISELinkAuthoringController', WISELinkAuthoringController)
  .config([
    '$locationProvider',
    '$stateProvider',
    '$urlRouterProvider',
    '$translateProvider',
    '$translatePartialLoaderProvider',
    '$controllerProvider',
    '$mdThemingProvider',
    '$httpProvider',
    ($locationProvider, $stateProvider, $urlRouterProvider, $translateProvider,
        $translatePartialLoaderProvider, $controllerProvider, $mdThemingProvider, $httpProvider) => {
      $locationProvider.html5Mode(true);
      $stateProvider.state('root', {
        url: '/teacher',
        abstract: true
      })
      .state('root.at', {
        url: '/edit',
        abstract: true,
        templateUrl: '/wise5/authoringTool/authoringTool.html',
        controller: 'AuthoringToolController',
        controllerAs: 'authoringToolController',
        resolve: {}
      })
      .state('root.at.main', {
        url: '/home',
        templateUrl: '/wise5/authoringTool/main/main.html',
        controller: 'AuthoringToolMainController',
        controllerAs: 'authoringToolMainController',
        resolve: {
          config: [
            'ConfigService',
            ConfigService => {
              return ConfigService.retrieveConfig(`/author/config`);
            }
          ],
          language: [
            '$translate',
            'ConfigService',
            'config',
            ($translate, ConfigService, config) => {
              $translate.use(ConfigService.getLocale());
            }
          ]
        }
      })
      .state('root.at.project', {
        url: '/unit/:projectId',
        templateUrl: '/wise5/authoringTool/project/project.html',
        controller: 'ProjectController',
        controllerAs: 'projectController',
        resolve: {
          projectConfig: [
            'ConfigService',
            '$stateParams',
            (ConfigService, $stateParams) => {
              return ConfigService.retrieveConfig(`/author/config/${$stateParams.projectId}`);
            }
          ],
          project: [
            'ProjectService',
            'projectConfig',
            (ProjectService, projectConfig) => {
              return ProjectService.retrieveProject();
            }
          ],
          projectAssets: [
            'ProjectAssetService',
            'projectConfig',
            'project',
            (ProjectAssetService, projectConfig, project) => {
              return ProjectAssetService.retrieveProjectAssets();
            }
          ],
          language: [
            '$translate',
            'ConfigService',
            'projectConfig',
            ($translate, ConfigService, projectConfig) => {
              $translate.use(ConfigService.getLocale());
            }
          ]
        }
      })
      .state('root.at.project.node', {
        url: '/node/:nodeId',
        templateUrl: '/wise5/authoringTool/node/node.html',
        controller: 'NodeAuthoringController',
        controllerAs: 'nodeAuthoringController',
        resolve: {}
      })
      .state('root.at.project.nodeConstraints', {
        url: '/node/constraints/:nodeId',
        templateUrl: '/wise5/authoringTool/node/node.html',
        controller: 'NodeAuthoringController',
        controllerAs: 'nodeAuthoringController',
        resolve: {}
      })
      .state('root.at.project.nodeEditPaths', {
        url: '/node/editpaths/:nodeId',
        templateUrl: '/wise5/authoringTool/node/node.html',
        controller: 'NodeAuthoringController',
        controllerAs: 'nodeAuthoringController',
        resolve: {}
      })
      .state('root.at.project.asset', {
        url: '/asset',
        templateUrl: '/wise5/authoringTool/asset/asset.html',
        controller: 'ProjectAssetController',
        controllerAs: 'projectAssetController',
        resolve: {}
      })
      .state('root.at.project.info', {
        url: '/info',
        templateUrl: '/wise5/authoringTool/info/info.html',
        controller: 'ProjectInfoController',
        controllerAs: 'projectInfoController',
        resolve: {}
      })
      .state('root.at.project.advanced', {
        url: '/advanced',
        templateUrl: '/wise5/authoringTool/advanced/advancedAuthoring.html',
        controller: 'AdvancedAuthoringController',
        controllerAs: 'advancedAuthoringController'
      })
      .state('root.at.project.rubric', {
        url: '/rubric',
        templateUrl: '/wise5/authoringTool/rubric/rubricAuthoring.html',
        controller: 'RubricAuthoringController',
        controllerAs: 'rubricAuthoringController'
      })
      .state('root.at.project.notebook', {
        url: '/notebook',
        templateUrl: '/wise5/authoringTool/notebook/notebookAuthoring.html',
        controller: 'AuthorNotebookController',
        controllerAs: 'authorNotebookController',
        resolve: {}
      })
      .state('root.at.project.milestones', {
        url: '/milestones',
        templateUrl: '/wise5/authoringTool/milestones/milestonesAuthoring.html',
        controller: 'MilestonesAuthoringController',
        controllerAs: 'milestonesAuthoringController',
        resolve: {}
      })
      .state('root.cm', {
        url: '/manage/unit/:runId',
        templateUrl: '/wise5/classroomMonitor/classroomMonitor.html',
        controller: 'ClassroomMonitorController',
        controllerAs: 'classroomMonitorController',
        abstract: true,
        resolve: {
          config: [
            'ConfigService',
            '$stateParams',
            (ConfigService, $stateParams) => {
              return ConfigService.retrieveConfig(
                `/config/classroomMonitor/${$stateParams.runId}`
              );
            }
          ],
          project: [
            'ProjectService',
            'config',
            (ProjectService, config) => {
              return ProjectService.retrieveProject();
            }
          ],
          runStatus: [
            'TeacherDataService',
            'config',
            (TeacherDataService, config) => {
              return TeacherDataService.retrieveRunStatus();
            }
          ],
          studentStatuses: [
            'StudentStatusService',
            'config',
            (StudentStatusService, config) => {
              return StudentStatusService.retrieveStudentStatuses();
            }
          ],
          achievements: [
            'AchievementService',
            'studentStatuses',
            'config',
            'project',
            (AchievementService, studentStatuses, config, project) => {
              return AchievementService.retrieveStudentAchievements();
            }
          ],
          notifications: [
            'NotificationService',
            'ConfigService',
            'studentStatuses',
            'config',
            'project',
            (NotificationService, ConfigService, studentStatuses, config, project) => {
              return NotificationService.retrieveNotifications();
            }
          ],
          webSocket: [
            'TeacherWebSocketService',
            'config',
            (TeacherWebSocketService, config) => {
              return TeacherWebSocketService.initialize();
            }
          ],
          language: [
            '$translate',
            'ConfigService',
            'config',
            ($translate, ConfigService, config) => {
              let locale = ConfigService.getLocale(); // defaults to "en"
              $translate.use(locale);
            }
          ],
          annotations: [
            'TeacherDataService',
            'config',
            (TeacherDataService, config) => {
              return TeacherDataService.retrieveAnnotations();
            }
          ],
          notebook: [
            'NotebookService',
            'ConfigService',
            'config',
            'project',
            (NotebookService, ConfigService, config, project) => {
              if (
                NotebookService.isNotebookEnabled() ||
                NotebookService.isTeacherNotebookEnabled()
              ) {
                return NotebookService.retrieveNotebookItems().then(notebook => {
                  return notebook;
                });
              } else {
                return NotebookService.notebook;
              }
            }
          ]
        }
      })
      .state('root.cm.teamLanding', {
        url: '/team',
        templateUrl: '/wise5/classroomMonitor/studentProgress/studentProgress.html',
        controller: 'StudentProgressController',
        controllerAs: 'studentProgressController'
      })
      .state('root.cm.team', {
        url: '/team/:workgroupId',
        templateUrl: '/wise5/classroomMonitor/studentGrading/studentGrading.html',
        controller: 'StudentGradingController',
        controllerAs: 'studentGradingController',
        resolve: {
          studentData: [
            '$stateParams',
            'TeacherDataService',
            'config',
            ($stateParams, TeacherDataService, config) => {
              return TeacherDataService.retrieveStudentDataByWorkgroupId(
                $stateParams.workgroupId
              );
            }
          ]
        }
      })
      .state('root.cm.unit', {
        url: '',
        component: 'nodeProgressView',
        params: { nodeId: null }
      })
      .state('root.cm.unit.node', {
        url: '/node/:nodeId',
        component: 'nodeProgressView',
        params: { nodeId: null }
      })
      .state('root.cm.manageStudents', {
        url: '/manageStudents',
        templateUrl: '/wise5/classroomMonitor/manageStudents/manageStudents.html',
        controller: 'ManageStudentsController',
        controllerAs: 'manageStudentsController'
      })
      .state('root.cm.dashboard', {
        url: '/dashboard',
        templateUrl: '/wise5/classroomMonitor/dashboard/dashboard.html',
        controller: 'DashboardController',
        controllerAs: 'dashboardController'
      })
      .state('root.cm.export', {
        url: '/export',
        templateUrl: '/wise5/classroomMonitor/dataExport/dataExport.html',
        controller: 'DataExportController',
        controllerAs: 'dataExportController'
      })
      .state('root.cm.exportVisits', {
        url: '/export/visits',
        templateUrl: '/wise5/classroomMonitor/dataExport/exportVisits.html',
        controller: 'ExportVisitsController',
        controllerAs: 'exportVisitsController'
      })
      .state('root.cm.milestones', {
        url: '/milestones',
        templateUrl: '/wise5/classroomMonitor/milestones/milestones.html',
        controller: 'MilestonesController',
        controllerAs: 'milestonesController'
      })
      .state('root.cm.notebooks', {
        url: '/notebook',
        templateUrl: '/wise5/classroomMonitor/notebook/notebookGrading.html',
        controller: 'NotebookGradingController',
        controllerAs: 'notebookGradingController'
      })
      .state("sink", {
        url: "/*path",
        template: ""
      });

      $httpProvider.interceptors.push('HttpInterceptor');

      $translatePartialLoaderProvider.addPart('i18n');
      $translatePartialLoaderProvider.addPart('authoringTool/i18n');
      $translatePartialLoaderProvider.addPart('classroomMonitor/i18n');
      $translateProvider
        .useLoader('$translatePartialLoader', {
          urlTemplate: '/wise5/{part}/i18n_{lang}.json'
        })
        .registerAvailableLanguageKeys(
          ['ar', 'el', 'en', 'es', 'ja', 'ko', 'pt', 'tr', 'zh_CN', 'zh_TW'],
          {
            en_US: 'en',
            en_UK: 'en'
          }
        )
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
        A100: 'ff897d',
        A200: 'ff7061',
        A400: 'ff3829',
        A700: 'cc1705',
        contrastDefaultColor: 'light',
        contrastDarkColors: ['50', '100', '200', '300', 'A100'],
        contrastLightColors: undefined
      });
      $mdThemingProvider
        .theme('at')
        .primaryPalette('deep-purple', { default: '400' })
        .accentPalette('accent', { default: '500' })
        .warnPalette('red', { default: '800' });

      $mdThemingProvider
        .theme('cm')
        .primaryPalette('blue', {
          default: '800'
        })
        .accentPalette('accent', {
          default: '500'
        })
        .warnPalette('red', {
          default: '800'
        });

      const lightMap = $mdThemingProvider.extendPalette('grey', {
        A100: 'ffffff'
      });
      $mdThemingProvider.definePalette('light', lightMap);
      $mdThemingProvider
        .theme('light')
        .primaryPalette('light', { default: 'A100' })
        .accentPalette('pink', { default: '900' });
      $mdThemingProvider.setDefaultTheme('at');
      $mdThemingProvider.enableBrowserColor();

      // moment.js default overrides
      // TODO: add i18n support
      moment.updateLocale('en', {
        calendar: {
          lastDay: '[Yesterday at] LT',
          sameDay: '[Today at] LT',
          nextDay: '[Tomorrow at] LT',
          lastWeek: '[last] dddd [at] LT',
          nextWeek: 'dddd [at] LT',
          sameElse: 'll'
        }
      });
    }
  ]);

export default teacherModule;
