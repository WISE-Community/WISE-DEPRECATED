import '../lib/jquery/jquery-global';
import '../lib/bootstrap/js/bootstrap.min'
import AchievementService from '../services/achievementService';
import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import * as angularDragula from 'angular-dragula';
import 'ng-file-upload';
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
import '../components/animation/animationComponentModule';
import { AnnotationService } from '../services/annotationService';
import '../components/audioOscillator/audioOscillatorComponentModule';
import { AudioRecorderService } from '../services/audioRecorderService';
import * as canvg from 'canvg';
import '../components/conceptMap/conceptMapComponentModule';
import { ConfigService } from '../services/configService';
import { CRaterService } from '../services/cRaterService';
import '../directives/components';
import ComponentService from '../components/componentService';
import '../components/discussion/discussionComponentModule';
import '../components/draw/drawComponentModule';
import '../components/embedded/embeddedComponentModule';
import * as fabric from 'fabric';
window['fabric'] = fabric.fabric
import Filters from '../filters/filters';
import '../lib/highcharts/highcharts-ng';
import * as Highcharts from '../lib/highcharts/highcharts.src';
import '../lib/draggable-points/draggable-points';
import * as HighchartsExporting from '../lib/highcharts-exporting@4.2.1';
import * as covariance from 'compute-covariance';
window['Highcharts'] = Highcharts;
window['HighchartsExporting'] = HighchartsExporting;
window['covariance'] = covariance;
import '../components/graph/graphComponentModule';
import * as hopscotch from 'hopscotch';
window['hopscotch'] = hopscotch;
import '../components/html/htmlComponentModule';
import HttpInterceptor from '../services/httpInterceptor';
import '../components/label/labelComponentModule';
import '../components/match/matchComponentModule';
import '../components/multipleChoice/multipleChoiceComponentModule';
import NavigationController from './navigation/navigationController';
import NodeController from './node/nodeController';
import NodeService from '../services/nodeService';
import NotebookService from '../services/notebookService';
import NotificationService from '../services/notificationService';
import '../components/openResponse/openResponseComponentModule';
import '../components/outsideURL/outsideURLComponentModule';
import { SessionService } from '../services/sessionService';
import './studentAsset/studentAsset';
import { StudentAssetService } from '../services/studentAssetService';
import { StudentDataService } from '../services/studentDataService';
import { StudentWebSocketService } from '../services/studentWebSocketService';
import '../components/summary/summaryComponentModule';
import '../components/table/tableComponentModule';
import { TagService } from '../services/tagService';
import { UtilService } from '../services/utilService';
import VLEController from './vleController';
import { VLEProjectService } from './vleProjectService';
import * as moment from 'moment';
import * as SockJS from 'sockjs-client';
import * as StompJS from '@stomp/stompjs';
window['SockJS'] = SockJS;
window['Stomp'] = StompJS.Stomp;
import '../lib/summernote/dist/summernote.min';
import '../lib/angular-summernote/dist/angular-summernote.min';
import '../lib/summernoteExtensions/summernote-ext-addNote.js';
import '../lib/summernoteExtensions/summernote-ext-print.js';
import '../themes/default/theme';

export function createModule(type = 'preview') {
  return angular.module(type, [
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
    'ngOnload',
    'ngSanitize',
    'ngStomp',
    'openResponseComponentModule',
    'outsideURLComponentModule',
    'pascalprecht.translate',
    'studentAsset',
    'summaryComponentModule',
    'summernote',
    'tableComponentModule',
    'theme',
    'ui.router',
    'ui.scrollpoint'
  ])
  .service('AchievementService', AchievementService)
  .factory('AnnotationService', downgradeInjectable(AnnotationService))
  .factory('AudioRecorderService', downgradeInjectable(AudioRecorderService))
  .factory('ConfigService', downgradeInjectable(ConfigService))
  .service('ComponentService', ComponentService)
  .factory('CRaterService', downgradeInjectable(CRaterService))
  .service('HttpInterceptor', HttpInterceptor)
  .service('NodeService', NodeService)
  .service('NotebookService', NotebookService)
  .service('NotificationService', NotificationService)
  .factory('ProjectService', downgradeInjectable(VLEProjectService))
  .factory('SessionService', downgradeInjectable(SessionService))
  .factory('StudentAssetService', downgradeInjectable(StudentAssetService))
  .factory('TagService', downgradeInjectable(TagService))
  .factory('StudentDataService', downgradeInjectable(StudentDataService))
  .factory('StudentWebSocketService', downgradeInjectable(StudentWebSocketService))
  .factory('UtilService', downgradeInjectable(UtilService))
  .controller('NavigationController', NavigationController)
  .controller('NodeController', NodeController)
  .controller('VLEController', VLEController)
  .filter('Filters', Filters)
  .config([
    '$stateProvider',
    '$translateProvider',
    '$translatePartialLoaderProvider',
    '$controllerProvider',
    '$locationProvider',
    '$mdThemingProvider',
    '$httpProvider',
    (
      $stateProvider,
      $translateProvider,
      $translatePartialLoaderProvider,
      $controllerProvider,
      $locationProvider,
      $mdThemingProvider,
      $httpProvider
    ) => {
      angular.module(type).$controllerProvider = $controllerProvider;
      $locationProvider.html5Mode(true);
      $stateProvider
        .state('root', {
          url: type === 'preview' ? '/preview' : '/student',
          abstract: true,
          resolve: {
            config: [
              'ConfigService',
              ConfigService => {
                return ConfigService.retrieveConfig(`/config/vle`);
              }
            ]
          },
          templateProvider: [
            '$http',
            'ProjectService',
            ($http, ProjectService) => {
              let themePath = ProjectService.getThemePath();
              return $http.get(themePath + '/vle.html').then(response => {
                return response.data;
              });
            }
          ],
          controller: 'VLEController',
          controllerAs: 'vleController'
        })
        .state(type === 'preview' ? 'root.preview' : 'root.run', {
          url: type === 'preview' ? '/unit/:projectId' : '/unit/:runId',
          resolve: {
            config: [
              'ConfigService',
              '$stateParams',
              (ConfigService, $stateParams) => {
                if (type === 'preview') {
                  return ConfigService.retrieveConfig(`/config/preview/${$stateParams.projectId}`);
                } else {
                  return ConfigService.retrieveConfig(`/config/studentRun/${$stateParams.runId}`);
                }
              }
            ],
            project: [
              'ProjectService',
              'config',
              (ProjectService, config) => {
                return ProjectService.retrieveProject();
              }
            ],
            studentData: [
              'StudentDataService',
              'config',
              'project',
              'tags',
              (StudentDataService, config, project, tags) => {
                return StudentDataService.retrieveStudentData();
              }
            ],
            notebook: [
              'NotebookService',
              'ConfigService',
              'StudentAssetService',
              'studentData',
              'config',
              'project',
              (
                NotebookService,
                ConfigService,
                StudentAssetService,
                studentData,
                config,
                project
              ) => {
                return StudentAssetService.retrieveAssets().then(studentAssets => {
                  return NotebookService.retrieveNotebookItems(ConfigService.getWorkgroupId()).then(
                    notebook => {
                      return notebook;
                    }
                  );
                });
              }
            ],
            achievements: [
              'AchievementService',
              'studentData',
              'config',
              'project',
              (AchievementService, studentData, config, project) => {
                return AchievementService.retrieveStudentAchievements();
              }
            ],
            notifications: [
              'NotificationService',
              'studentData',
              'config',
              'project',
              (NotificationService, studentData, config, project) => {
                return NotificationService.retrieveNotifications();
              }
            ],
            runStatus: [
              'StudentDataService',
              'config',
              (StudentDataService, config) => {
                return StudentDataService.retrieveRunStatus();
              }
            ],
            tags: [
              'TagService',
              'config',
              (TagService, config) => {
                if (type === 'preview') {
                  return {};
                } else {
                  return TagService.retrieveStudentTags().toPromise();
                }
              }
            ],
            webSocket: [
              'StudentWebSocketService',
              'ConfigService',
              'config',
              'project',
              (StudentWebSocketService, ConfigService, config, project) => {
                if (!ConfigService.isPreview()) {
                  return StudentWebSocketService.initialize();
                }
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
            ]
          },
          views: {
            nodeView: {
              templateProvider: [
                '$http',
                'ConfigService',
                ($http, ConfigService) => {
                  let wiseBaseURL = ConfigService.getWISEBaseURL();
                  return $http.get(wiseBaseURL + '/wise5/vle/project/index.html').then(response => {
                    return response.data;
                  });
                }
              ]
            }
          }
        })
        .state(type === 'preview' ? 'root.preview.node' : 'root.run.node', {
          url: '/:nodeId',
          views: {
            nodeView: {
              templateProvider: [
                '$http',
                'ConfigService',
                ($http, ConfigService) => {
                  let wiseBaseURL = ConfigService.getWISEBaseURL();
                  return $http.get(wiseBaseURL + '/wise5/vle/node/index.html').then(response => {
                    return response.data;
                  });
                }
              ],
              controller: 'NodeController',
              controllerAs: 'nodeController'
            }
          }
        })
        .state("sink", {
          url: "/*path",
          template: ""
        });

      $httpProvider.interceptors.push('HttpInterceptor');

      // Set up Translations
      $translatePartialLoaderProvider.addPart('i18n');
      $translatePartialLoaderProvider.addPart('vle/i18n');
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

      $mdThemingProvider
        .theme('default')
        .primaryPalette('primary')
        .accentPalette('accent', {
          default: '500'
        })
        .warnPalette('red', {
          default: '800'
        });

      let lightMap = $mdThemingProvider.extendPalette('grey', {
        A100: 'ffffff'
      });
      $mdThemingProvider.definePalette('light', lightMap);

      $mdThemingProvider
        .theme('light')
        .primaryPalette('light', {
          default: 'A100'
        })
        .accentPalette('primary');

      $mdThemingProvider.setDefaultTheme('default');
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
}
