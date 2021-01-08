import './lib/jquery/jquery-global';
import * as angular from 'angular';
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { AchievementService } from './services/achievementService';
import * as angularDragula from 'angular-dragula';
import 'angular-file-saver';
import 'ng-file-upload';
import 'angular-inview';
import 'angular-material';
import 'angular-moment';
import 'ng-onload';
import 'angular-sanitize';
import 'ng-stomp';
import 'angular-toarrayfilter';
import 'angular-translate';
import 'angular-translate-loader-partial';
import 'angular-ui-router';
import 'angular-ui-scrollpoint';
import './components/animation/animationComponentModule';
import { AnnotationService } from './services/annotationService';
import './components/audioOscillator/audioOscillatorComponentModule';
import { AudioRecorderService } from './services/audioRecorderService';
import * as canvg from 'canvg';
import './components/conceptMap/conceptMapComponentModule';
import { ConfigService } from './services/configService';
import { CRaterService } from './services/cRaterService';
import './directives/components';
import { ComponentService } from './components/componentService';
import './components/discussion/discussionComponentModule';
import './components/draw/drawComponentModule';
import './components/embedded/embeddedComponentModule';
import * as fabric from 'fabric';
window['fabric'] = fabric.fabric;
import Filters from './filters/filters';
import './lib/highcharts/highcharts-ng';
import * as Highcharts from './lib/highcharts/highcharts.src';
import './lib/draggable-points/draggable-points';
import * as HighchartsExporting from './lib/highcharts-exporting@4.2.1';
import * as covariance from 'compute-covariance';
window['Highcharts'] = Highcharts;
window['HighchartsExporting'] = HighchartsExporting;
window['covariance'] = covariance;
import './components/graph/graphComponentModule';
import * as hopscotch from 'hopscotch';
window['hopscotch'] = hopscotch;
import './components/html/htmlComponentModule';
import HttpInterceptor from './services/httpInterceptor';
import './components/label/labelComponentModule';
import './components/match/matchComponentModule';
import './components/multipleChoice/multipleChoiceComponentModule';
import { NodeService } from './services/nodeService';
import { NotebookService } from './services/notebookService';
import { NotificationService } from './services/notificationService';
import './components/openResponse/openResponseComponentModule';
import './components/outsideURL/outsideURLComponentModule';
import { SessionService } from './services/sessionService';
import './vle/studentAsset/studentAsset';
import { StudentAssetService } from './services/studentAssetService';
import { StudentDataService } from './services/studentDataService';
import './components/summary/summaryComponentModule';
import './components/table/tableComponentModule';
import { TagService } from './services/tagService';
import { UtilService } from './services/utilService';
import * as moment from 'moment';
import * as SockJS from 'sockjs-client';
import * as StompJS from '@stomp/stompjs';
window['SockJS'] = SockJS;
window['Stomp'] = StompJS.Stomp;
import './themes/default/theme';
import SideMenu from './common/sideMenuComponent';
import { EditorComponent } from '@tinymce/tinymce-angular';
import { WiseTinymceEditorComponent } from './directives/wise-tinymce-editor/wise-tinymce-editor.component';

angular
  .module('common', [
    angularDragula(angular),
    'angularMoment',
    'angular-toArrayFilter',
    'animationComponentModule',
    'audioOscillatorComponentModule',
    'components',
    'conceptMapComponentModule',
    'discussionComponentModule',
    'drawComponentModule',
    'embeddedComponentModule',
    'filters',
    'graphComponentModule',
    'highcharts-ng',
    'htmlComponentModule',
    'labelComponentModule',
    'matchComponentModule',
    'multipleChoiceComponentModule',
    'ngAria',
    'ngFileUpload',
    'ngMaterial',
    'ngSanitize',
    'ngStomp',
    'openResponseComponentModule',
    'outsideURLComponentModule',
    'pascalprecht.translate',
    'summaryComponentModule',
    'tableComponentModule',
    'ui.router'
  ])
  .service('AchievementService', downgradeInjectable(AchievementService))
  .directive(
    'editor',
    downgradeComponent({ component: EditorComponent }) as angular.IDirectiveFactory
  )
  .directive(
    'wiseTinymceEditor',
    downgradeComponent({ component: WiseTinymceEditorComponent }) as angular.IDirectiveFactory
  )
  .factory('AnnotationService', downgradeInjectable(AnnotationService))
  .factory('AudioRecorderService', downgradeInjectable(AudioRecorderService))
  .factory('ConfigService', downgradeInjectable(ConfigService))
  .factory('ComponentService', downgradeInjectable(ComponentService))
  .factory('CRaterService', downgradeInjectable(CRaterService))
  .service('HttpInterceptor', HttpInterceptor)
  .service('NodeService', downgradeInjectable(NodeService))
  .service('NotebookService', downgradeInjectable(NotebookService))
  .service('NotificationService', downgradeInjectable(NotificationService))
  .factory('SessionService', downgradeInjectable(SessionService))
  .factory('StudentAssetService', downgradeInjectable(StudentAssetService))
  .factory('TagService', downgradeInjectable(TagService))
  .factory('StudentDataService', downgradeInjectable(StudentDataService))
  .factory('UtilService', downgradeInjectable(UtilService))
  .component('sideMenu', SideMenu)
  .filter('Filters', Filters)
  .config([
    '$httpProvider',
    '$locationProvider',
    '$mdThemingProvider',
    '$translateProvider',
    '$translatePartialLoaderProvider',
    (
      $httpProvider,
      $locationProvider,
      $mdThemingProvider,
      $translateProvider,
      $translatePartialLoaderProvider
    ) => {
      $httpProvider.interceptors.push('HttpInterceptor');
      $locationProvider.html5Mode(true);
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
      $translatePartialLoaderProvider.addPart('i18n');
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
        A100: 'abf3ff',
        A200: '66e2ff',
        A400: '17bee5',
        A700: '00A1C6',
        contrastDefaultColor: 'light', // whether, by default, text (contrast)
        // on this palette should be dark or light
        contrastDarkColors: [
          '50',
          '100', //hues which contrast should be 'dark' by default
          '200',
          '300',
          'A100'
        ],
        contrastLightColors: undefined // could also specify this if default was 'dark'
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
        A100: 'ff897d',
        A200: 'ff7061',
        A400: 'ff3829',
        A700: 'cc1705',
        contrastDefaultColor: 'light',
        contrastDarkColors: ['50', '100', '200', '300', 'A100'],
        contrastLightColors: undefined
      });
      const lightMap = $mdThemingProvider.extendPalette('grey', {
        A100: 'ffffff'
      });
      $mdThemingProvider.definePalette('light', lightMap);
      $mdThemingProvider.enableBrowserColor();
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
