import '../lib/jquery/jquery-global';
import '../lib/bootstrap/js/bootstrap.min'
import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { createCommonModule } from '../common-angular-js-module';
import Filters from '../filters/filters';
import NavigationController from '../vle/navigation/navigationController';
import NodeController from '../vle/node/nodeController';
import { StudentWebSocketService } from '../services/studentWebSocketService';
import VLEController from '../vle/vleController';
import { VLEProjectService } from '../vle/vleProjectService';
import '../lib/summernote/dist/summernote.min';
import '../lib/summernoteExtensions/summernote-ext-addNote.js';
import '../lib/summernoteExtensions/summernote-ext-print.js'

export function createStudentAngularJSModule(type = 'preview') {
  createCommonModule();
  return angular.module(type, [
    'common',
    'ngOnload',
    'studentAsset',
    'summaryComponentModule',
    'theme',
    'ui.scrollpoint'
  ])
  .factory('ProjectService', downgradeInjectable(VLEProjectService))
  .factory('StudentWebSocketService', downgradeInjectable(StudentWebSocketService))
  .controller('NavigationController', NavigationController)
  .controller('NodeController', NodeController)
  .controller('VLEController', VLEController)
  .filter('Filters', Filters)
  .config([
    '$stateProvider',
    '$translatePartialLoaderProvider',
    '$mdThemingProvider',
    (
      $stateProvider,
      $translatePartialLoaderProvider,
      $mdThemingProvider
    ) => {
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
      $translatePartialLoaderProvider.addPart('vle/i18n');

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
    }
  ]);
}
