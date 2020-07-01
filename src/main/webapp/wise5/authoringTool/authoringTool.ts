'use strict';

import '../themes/default/js/webfonts';
import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import * as angularDragula from 'angular-dragula';
import 'ng-file-upload';
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
import AdvancedAuthoringController from './advanced/advancedAuthoringController';
import AuthoringToolController from './authoringToolController';
import AuthoringToolMainController from './main/authoringToolMainController';
import AuthorNotebookController from './notebook/authorNotebookController';
import '../components/conceptMap/conceptMapAuthoringComponentModule';
import { ConfigService } from '../services/configService';
import { CRaterService } from '../services/cRaterService';
import '../directives/components';
import { ClassroomMonitorProjectService } from '../classroomMonitor/classroomMonitorProjectService';
import ComponentService from '../components/componentService';
import '../components/discussion/discussionAuthoringComponentModule';
import '../components/draw/drawAuthoringComponentModule';
import '../components/embedded/embeddedAuthoringComponentModule';
import '../filters/filters';
import '../lib/highcharts/highcharts-ng';
import * as Highcharts from '../../wise5/lib/highcharts/highcharts.src';
import '../../wise5/lib/draggable-points/draggable-points';
import * as HighchartsExporting from '../../wise5/lib/highcharts-exporting@4.2.1';
import * as covariance from 'compute-covariance';
window['Highcharts'] = Highcharts;
window['HighchartsExporting'] = HighchartsExporting;
window['covariance'] = covariance;
import '../components/graph/graphAuthoringComponentModule';
import '../components/html/htmlAuthoringComponentModule';
import './importStep/importStepModule';
import '../components/label/labelAuthoringComponentModule';
import '../components/match/matchAuthoringComponentModule';
import '../components/multipleChoice/multipleChoiceAuthoringComponentModule';
import MilestonesAuthoringController from './milestones/milestonesAuthoringController';
import NodeAuthoringController from './node/nodeAuthoringController';
import NodeService from '../services/nodeService';
import NotebookService from '../services/notebookService';
import NotificationService from '../services/notificationService';
import '../components/openResponse/openResponseAuthoringComponentModule';
import '../components/outsideURL/outsideURLAuthoringComponentModule';
import ProjectAssetController from './asset/projectAssetController';
import { ProjectAssetService } from '../../site/src/app/services/projectAssetService';
import ProjectController from './project/projectController';
import ProjectInfoController from './info/projectInfoController';
import RubricAuthoringController from './rubric/rubricAuthoringController';
import { SessionService } from '../services/sessionService';
import * as SockJS from 'sockjs-client';
import * as StompJS from '@stomp/stompjs';
window['SockJS'] = SockJS;
window['Stomp'] = StompJS.Stomp;
import SpaceService from '../services/spaceService';
import './structure/structureAuthoringModule';
import { StudentAssetService } from '../services/studentAssetService';
import StudentDataService from '../services/studentDataService';
import StudentStatusService from '../services/studentStatusService';
import StudentWebSocketService from '../services/studentWebSocketService';
import '../components/summary/summaryAuthoringComponentModule';
import '../components/table/tableAuthoringComponentModule';
import TeacherDataService from '../services/teacherDataService';
import TeacherWebSocketService from '../services/teacherWebSocketService';
import { UtilService } from '../services/utilService';
import WISELinkAuthoringController from './wiseLink/wiseLinkAuthoringController';
import * as moment from 'moment';
import { AudioRecorderService } from '../services/audioRecorderService';

const authoringModule = angular
  .module('authoring', [
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
    'htmlAuthoringComponentModule',
    'importStepModule',
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
    'structureAuthoringModule',
    'tableAuthoringComponentModule',
    'ui.router'
  ])
  .service('AnnotationService', AnnotationService)
  .service('AudioRecorderService', AudioRecorderService)
  .service('ComponentService', ComponentService)
  .factory('ConfigService', downgradeInjectable(ConfigService))
  .factory('CRaterService', downgradeInjectable(CRaterService))
  .service('NodeService', NodeService)
  .service('NotebookService', NotebookService)
  .service('NotificationService', NotificationService)
  .factory('ProjectService', downgradeInjectable(ClassroomMonitorProjectService))
  .service('ProjectAssetService', downgradeInjectable(ProjectAssetService))
  .factory('SessionService', downgradeInjectable(SessionService))
  .service('SpaceService', SpaceService)
  .factory('StudentAssetService', downgradeInjectable(StudentAssetService))
  .service('StudentDataService', StudentDataService)
  .service('StudentStatusService', StudentStatusService)
  .service('StudentWebSocketService', StudentWebSocketService)
  .service('TeacherDataService', TeacherDataService)
  .service('TeacherWebSocketService', TeacherWebSocketService)
  .factory('UtilService', downgradeInjectable(UtilService))
  .controller('AuthoringToolController', AuthoringToolController)
  .controller('AuthoringToolMainController', AuthoringToolMainController)
  .controller('AdvancedAuthoringController', AdvancedAuthoringController)
  .controller('AuthorNotebookController', AuthorNotebookController)
  .controller('MilestonesAuthoringController', MilestonesAuthoringController)
  .controller('NodeAuthoringController', NodeAuthoringController)
  .controller('ProjectAssetController', ProjectAssetController)
  .controller('ProjectController', ProjectController)
  .controller('ProjectInfoController', ProjectInfoController)
  .controller('RubricAuthoringController', RubricAuthoringController)
  .controller('WISELinkAuthoringController', WISELinkAuthoringController)
  .config([
    '$urlRouterProvider',
    '$stateProvider',
    '$translateProvider',
    '$translatePartialLoaderProvider',
    '$mdThemingProvider',
    (
      $urlRouterProvider,
      $stateProvider,
      $translateProvider,
      $translatePartialLoaderProvider,
      $mdThemingProvider
    ) => {
      $translatePartialLoaderProvider.addPart('i18n');
      $translatePartialLoaderProvider.addPart('authoringTool/i18n');
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

export default authoringModule;
