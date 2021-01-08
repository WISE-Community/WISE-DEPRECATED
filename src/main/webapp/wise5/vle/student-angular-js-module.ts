import '../lib/jquery/jquery-global';
import * as angular from 'angular';
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import '../common-angular-js-module';
import NavigationController from '../vle/navigation/navigationController';
import NodeController from '../vle/node/nodeController';
import { StudentWebSocketService } from '../services/studentWebSocketService';
import VLEController from '../vle/vleController';
import { VLEProjectService } from '../vle/vleProjectService';
import { NavItemComponent } from './nav-item/nav-item.component';
import { ComponentAnnotationsComponent } from '../directives/componentAnnotations/component-annotations.component';

export function createStudentAngularJSModule(type = 'preview') {
  return angular
    .module(type, [
      'common',
      'ngOnload',
      'studentAsset',
      'summaryComponentModule',
      'theme',
      'ui.scrollpoint'
    ])
    .factory('ProjectService', downgradeInjectable(VLEProjectService))
    .factory('StudentWebSocketService', downgradeInjectable(StudentWebSocketService))
    .directive(
      'navItem',
      downgradeComponent({ component: NavItemComponent }) as angular.IDirectiveFactory
    )
    .controller('NavigationController', NavigationController)
    .controller('NodeController', NodeController)
    .controller('VLEController', VLEController)
    .directive(
      'componentAnnotations',
      downgradeComponent({ component: ComponentAnnotationsComponent }) as angular.IDirectiveFactory
    )
    .config([
      '$stateProvider',
      '$translatePartialLoaderProvider',
      '$mdThemingProvider',
      ($stateProvider, $translatePartialLoaderProvider, $mdThemingProvider) => {
        $stateProvider
          .state('root', {
            url: type === 'preview' ? '/preview' : '/student',
            abstract: true,
            resolve: {
              config: [
                'ConfigService',
                (ConfigService) => {
                  return ConfigService.retrieveConfig(`/config/vle`);
                }
              ]
            },
            templateProvider: [
              '$http',
              'ProjectService',
              ($http, ProjectService) => {
                let themePath = ProjectService.getThemePath();
                return $http.get(themePath + '/vle.html').then((response) => {
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
                'SessionService',
                '$stateParams',
                (ConfigService, SessionService, $stateParams) => {
                  if (type === 'preview') {
                    return ConfigService.retrieveConfig(
                      `/config/preview/${$stateParams.projectId}`
                    );
                  } else {
                    return ConfigService.retrieveConfig(
                      `/config/studentRun/${$stateParams.runId}`
                    ).then(() => {
                      SessionService.initializeSession();
                    });
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
                  return StudentAssetService.retrieveAssets().then((studentAssets) => {
                    return NotebookService.retrieveNotebookItems(
                      ConfigService.getWorkgroupId()
                    ).then((notebook) => {
                      return notebook;
                    });
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
                    return $http
                      .get(wiseBaseURL + '/wise5/vle/project/index.html')
                      .then((response) => {
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
                    return $http
                      .get(wiseBaseURL + '/wise5/vle/node/index.html')
                      .then((response) => {
                        return response.data;
                      });
                  }
                ],
                controller: 'NodeController',
                controllerAs: 'nodeController'
              }
            }
          })
          .state('sink', {
            url: '/*path',
            template: ''
          });
        $translatePartialLoaderProvider.addPart('vle/i18n');
        $mdThemingProvider
          .theme('default')
          .primaryPalette('primary')
          .accentPalette('accent', {
            default: '500'
          })
          .warnPalette('red', {
            default: '800'
          });
        $mdThemingProvider
          .theme('light')
          .primaryPalette('light', { default: 'A100' })
          .accentPalette('primary');
        $mdThemingProvider.setDefaultTheme('default');
      }
    ]);
}
