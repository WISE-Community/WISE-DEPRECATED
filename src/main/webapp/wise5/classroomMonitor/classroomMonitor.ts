'use strict';

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
import AnnotationService from '../services/annotationService';
import '../components/audioOscillator/audioOscillatorComponentModule';
import './classroomMonitorComponents';
import ClassroomMonitorController from './classroomMonitorController';
import { ClassroomMonitorProjectService } from './classroomMonitorProjectService';
import '../components/conceptMap/conceptMapComponentModule';
import { ConfigService } from '../services/configService';
import { CRaterService } from '../services/cRaterService';
import '../directives/components';
import ComponentService from '../components/componentService';
import './dashboard/dashboardController';
import DataExportController from './dataExport/dataExportController';
import ExportController from './dataExport/exportController';
import ExportVisitsController from './dataExport/exportVisitsController';
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
import ManageStudentsController from './manageStudents/manageStudentsController';
import MilestonesController from './milestones/milestonesController';
import MilestoneService from '../services/milestoneService';
import '../components/multipleChoice/multipleChoiceComponentModule';
import NodeService from '../services/nodeService';
import '../themes/default/notebook/notebookComponents';
import NotebookGradingController from './notebook/notebookGradingController';
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
import StudentDataService from '../services/studentDataService';
import StudentGradingController from './studentGrading/studentGradingController';
import StudentProgressController from './studentProgress/studentProgressController';
import StudentStatusService from '../services/studentStatusService';
import StudentWebSocketService from '../services/studentWebSocketService';
import '../components/summary/summaryComponentModule';
import '../components/table/tableComponentModule';
import TeacherDataService from '../services/teacherDataService';
import TeacherWebSocketService from '../services/teacherWebSocketService';
import { UtilService } from '../services/utilService';
import * as moment from 'moment';
import { AudioRecorderService } from '../services/audioRecorderService';

const classroomMonitorModule = angular
  .module('classroomMonitor', [
    angularDragula(angular),
    'summaryComponentModule',
    'angularMoment',
    'angular-inview',
    'angular-toArrayFilter',
    'animationComponentModule',
    'audioOscillatorComponentModule',
    'components',
    'conceptMapComponentModule',
    'classroomMonitor.components',
    'discussionComponentModule',
    'drawComponentModule',
    'embeddedComponentModule',
    'graphComponentModule',
    'highcharts-ng',
    'htmlComponentModule',
    'labelComponentModule',
    'matchComponentModule',
    'multipleChoiceComponentModule',
    'ngAnimate',
    'ngAria',
    'ngFileSaver',
    'ngFileUpload',
    'ngMaterial',
    'ngSanitize',
    'ngStomp',
    'theme.notebook',
    'openResponseComponentModule',
    'outsideURLComponentModule',
    'pascalprecht.translate',
    'summernote',
    'tableComponentModule',
    'ui.router'
  ])
  .service('AchievementService', AchievementService)
  .service('AnnotationService', AnnotationService)
  .service('AudioRecorderService', AudioRecorderService)
  .service('ComponentService', ComponentService)
  .factory('ConfigService', downgradeInjectable(ConfigService))
  .factory('CRaterService', downgradeInjectable(CRaterService))
  .service('HttpInterceptor', HttpInterceptor)
  .service('MilestoneService', MilestoneService)
  .service('NodeService', NodeService)
  .service('NotebookService', NotebookService)
  .service('NotificationService', NotificationService)
  .factory('ProjectService', downgradeInjectable(ClassroomMonitorProjectService))
  .factory('SessionService', downgradeInjectable(SessionService))
  .factory('StudentAssetService', downgradeInjectable(StudentAssetService))
  .service('StudentDataService', StudentDataService)
  .service('StudentStatusService', StudentStatusService)
  .service('StudentWebSocketService', StudentWebSocketService)
  .service('TeacherDataService', TeacherDataService)
  .service('TeacherWebSocketService', TeacherWebSocketService)
  .factory('UtilService', downgradeInjectable(UtilService))
  .controller('ClassroomMonitorController', ClassroomMonitorController)
  .controller('DataExportController', DataExportController)
  .controller('ExportController', ExportController)
  .controller('ExportVisitsController', ExportVisitsController)
  .controller('ManageStudentsController', ManageStudentsController)
  .controller('MilestonesController', MilestonesController)
  .controller('NotebookGradingController', NotebookGradingController)
  .controller('StudentGradingController', StudentGradingController)
  .controller('StudentProgressController', StudentProgressController)
  .config([
    '$urlRouterProvider',
    '$stateProvider',
    '$translateProvider',
    '$translatePartialLoaderProvider',
    '$controllerProvider',
    '$mdThemingProvider',
    '$httpProvider',
    (
      $urlRouterProvider,
      $stateProvider,
      $translateProvider,
      $translatePartialLoaderProvider,
      $controllerProvider,
      $mdThemingProvider,
      $httpProvider
    ) => {
      $httpProvider.interceptors.push('HttpInterceptor');

      // Set up Translations
      $translatePartialLoaderProvider.addPart('i18n');
      $translatePartialLoaderProvider.addPart('classroomMonitor/i18n');
      $translateProvider
        .useLoader('$translatePartialLoader', {
          urlTemplate: '/wise5/{part}/i18n_{lang}.json'
        })
        .fallbackLanguage(['en'])
        .registerAvailableLanguageKeys(
          ['ar', 'el', 'en', 'es', 'ja', 'ko', 'pt', 'tr', 'zh_CN', 'zh_TW'],
          {
            en_US: 'en',
            en_UK: 'en'
          }
        )
        .determinePreferredLanguage()
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

      var lightMap = $mdThemingProvider.extendPalette('grey', {
        A100: 'ffffff'
      });
      $mdThemingProvider.definePalette('light', lightMap);

      $mdThemingProvider
        .theme('light')
        .primaryPalette('light', {
          default: 'A100'
        })
        .accentPalette('blue', {
          default: '900'
        });

      $mdThemingProvider.setDefaultTheme('cm');
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

export default classroomMonitorModule;
