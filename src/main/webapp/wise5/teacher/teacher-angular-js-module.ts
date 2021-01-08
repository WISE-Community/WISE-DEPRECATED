import '../lib/jquery/jquery-global';
import * as angular from 'angular';
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import '../common-angular-js-module';
import { MilestoneService } from '../services/milestoneService';
import { TeacherProjectService } from '../services/teacherProjectService';
import { ProjectAssetService } from '../../site/src/app/services/projectAssetService';
import { SpaceService } from '../services/spaceService';
import { StudentStatusService } from '../services/studentStatusService';
import { TeacherDataService } from '../services/teacherDataService';
import { TeacherWebSocketService } from '../services/teacherWebSocketService';
import { AdvancedProjectAuthoringComponent } from '../authoringTool/advanced/advanced-project-authoring.component';
import AuthoringToolController from '../authoringTool/authoringToolController';
import AuthoringToolMainController from '../authoringTool/main/authoringToolMainController';
import AuthorNotebookController from '../authoringTool/notebook/authorNotebookController';
import ClassroomMonitorController from '../classroomMonitor/classroomMonitorController';
import DataExportController from '../classroomMonitor/dataExport/dataExportController';
import ExportController from '../classroomMonitor/dataExport/exportController';
import ExportVisitsController from '../classroomMonitor/dataExport/exportVisitsController';
import MilestonesAuthoringController from '../authoringTool/milestones/milestonesAuthoringController';
import { MilestonesComponent } from '../../site/src/app/classroom-monitor/milestones/milestones.component';
import { NodeAdvancedAuthoringComponent } from '../authoringTool/node/advanced/node-advanced-authoring.component';
import { NodeAdvancedBranchAuthoringComponent } from '../authoringTool/node/advanced/branch/node-advanced-branch-authoring.component';
import { NodeAdvancedConstraintAuthoringComponent } from '../authoringTool/node/advanced/constraint/node-advanced-constraint-authoring.component';
import { NodeAdvancedGeneralAuthoringComponent } from '../authoringTool/node/advanced/general/node-advanced-general-authoring.component';
import { NodeAdvancedJsonAuthoringComponent } from '../authoringTool/node/advanced/json/node-advanced-json-authoring.component';
import { NodeAdvancedPathAuthoringComponent } from '../authoringTool/node/advanced/path/node-advanced-path-authoring.component';
import NodeAuthoringController from '../authoringTool/node/nodeAuthoringController';
import NotebookGradingController from '../classroomMonitor/notebook/notebookGradingController';
import ProjectAssetController from '../authoringTool/asset/projectAssetController';
import ProjectController from '../authoringTool/project/projectController';
import ProjectInfoController from '../authoringTool/info/projectInfoController';
import { RubricAuthoringComponent } from '../authoringTool/rubric/rubric-authoring.component';
import StudentGradingController from '../classroomMonitor/studentGrading/studentGradingController';
import StudentProgressController from '../classroomMonitor/studentProgress/studentProgressController';
import WISELinkAuthoringController from '../authoringTool/wiseLink/wiseLinkAuthoringController';
import { WiseAuthoringTinymceEditorComponent } from '../directives/wise-tinymce-editor/wise-authoring-tinymce-editor.component';
import { EditComponentJsonComponent } from '../../site/src/app/authoring-tool/edit-component-json/edit-component-json.component';
import { EditComponentMaxScoreComponent } from '../../site/src/app/authoring-tool/edit-component-max-score/edit-component-max-score.component';
import { EditComponentRubricComponent } from '../../site/src/app/authoring-tool/edit-component-rubric/edit-component-rubric.component';
import { EditComponentTagsComponent } from '../../site/src/app/authoring-tool/edit-component-tags/edit-component-tags.component';
import { EditComponentWidthComponent } from '../../site/src/app/authoring-tool/edit-component-width/edit-component-width.component';

import '../classroomMonitor/classroomMonitorComponents';
import '../authoringTool/structure/structureAuthoringModule';
import '../components/animation/animationAuthoringComponentModule';
import '../components/audioOscillator/audioOscillatorAuthoringComponentModule';
import '../authoringTool/components/authoringToolComponents';
import '../components/conceptMap/conceptMapAuthoringComponentModule';
import '../components/discussion/discussionAuthoringComponentModule';
import '../components/draw/drawAuthoringComponentModule';
import '../components/embedded/embeddedAuthoringComponentModule';
import '../components/graph/graphAuthoringComponentModule';
import '../components/html/htmlAuthoringComponentModule';
import '../authoringTool/addComponent/addComponentModule';
import '../authoringTool/node/editRubric/editRubricModule';
import '../authoringTool/importComponent/importComponentModule';
import '../authoringTool/importStep/importStepModule';
import '../components/label/labelAuthoringComponentModule';
import '../components/match/matchAuthoringComponentModule';
import '../components/multipleChoice/multipleChoiceAuthoringComponentModule';
import '../components/openResponse/openResponseAuthoringComponentModule';
import '../components/outsideURL/outsideURLAuthoringComponentModule';
import '../components/summary/summaryAuthoringComponentModule';
import '../components/table/tableAuthoringComponentModule';

angular
  .module('teacher', [
    'common',
    'angular-inview',
    'addComponentModule',
    'editRubricModule',
    'summaryAuthoringComponentModule',
    'animationAuthoringComponentModule',
    'audioOscillatorAuthoringComponentModule',
    'authoringTool.components',
    'classroomMonitor.components',
    'conceptMapAuthoringComponentModule',
    'discussionAuthoringComponentModule',
    'drawAuthoringComponentModule',
    'embeddedAuthoringComponentModule',
    'graphAuthoringComponentModule',
    'htmlAuthoringComponentModule',
    'importComponentModule',
    'importStepModule',
    'labelAuthoringComponentModule',
    'matchAuthoringComponentModule',
    'multipleChoiceAuthoringComponentModule',
    'ngAnimate',
    'ngFileSaver',
    'openResponseAuthoringComponentModule',
    'outsideURLAuthoringComponentModule',
    'structureAuthoringModule',
    'tableAuthoringComponentModule',
    'theme.notebook'
  ])
  .service('MilestoneService', downgradeInjectable(MilestoneService))
  .factory('ProjectService', downgradeInjectable(TeacherProjectService))
  .factory('ProjectAssetService', downgradeInjectable(ProjectAssetService))
  .factory('SpaceService', downgradeInjectable(SpaceService))
  .factory('StudentStatusService', downgradeInjectable(StudentStatusService))
  .service('TeacherDataService', downgradeInjectable(TeacherDataService))
  .service('TeacherWebSocketService', downgradeInjectable(TeacherWebSocketService))
  .directive(
    'editComponentJson',
    downgradeComponent({ component: EditComponentJsonComponent }) as angular.IDirectiveFactory
  )
  .directive(
    'editComponentRubric',
    downgradeComponent({ component: EditComponentRubricComponent }) as angular.IDirectiveFactory
  )
  .directive(
    'editComponentTags',
    downgradeComponent({ component: EditComponentTagsComponent }) as angular.IDirectiveFactory
  )
  .directive(
    'editComponentWidth',
    downgradeComponent({ component: EditComponentWidthComponent }) as angular.IDirectiveFactory
  )
  .directive(
    'editComponentMaxScore',
    downgradeComponent({ component: EditComponentMaxScoreComponent }) as angular.IDirectiveFactory
  )
  .component('nodeAdvancedAuthoringComponent', NodeAdvancedAuthoringComponent)
  .component('nodeAdvancedBranchAuthoringComponent', NodeAdvancedBranchAuthoringComponent)
  .component('nodeAdvancedConstraintAuthoringComponent', NodeAdvancedConstraintAuthoringComponent)
  .directive(
    'nodeAdvancedGeneralAuthoringComponent',
    downgradeComponent({
      component: NodeAdvancedGeneralAuthoringComponent
    }) as angular.IDirectiveFactory
  )
  .directive(
    'nodeAdvancedJsonAuthoringComponent',
    downgradeComponent({
      component: NodeAdvancedJsonAuthoringComponent
    }) as angular.IDirectiveFactory
  )
  .component('nodeAdvancedPathAuthoringComponent', NodeAdvancedPathAuthoringComponent)
  .directive(
    'advancedProjectAuthoringComponent',
    downgradeComponent({
      component: AdvancedProjectAuthoringComponent
    }) as angular.IDirectiveFactory
  )
  .directive(
    'wiseAuthoringTinymceEditor',
    downgradeComponent({
      component: WiseAuthoringTinymceEditorComponent
    }) as angular.IDirectiveFactory
  )
  .controller('AuthoringToolController', AuthoringToolController)
  .controller('AuthoringToolMainController', AuthoringToolMainController)
  .controller('AuthorNotebookController', AuthorNotebookController)
  .controller('ClassroomMonitorController', ClassroomMonitorController)
  .controller('DataExportController', DataExportController)
  .controller('ExportController', ExportController)
  .controller('ExportVisitsController', ExportVisitsController)
  .controller('MilestonesAuthoringController', MilestonesAuthoringController)
  .directive(
    'milestones',
    downgradeComponent({ component: MilestonesComponent }) as angular.IDirectiveFactory
  )
  .controller('NodeAuthoringController', NodeAuthoringController)
  .controller('NotebookGradingController', NotebookGradingController)
  .controller('ProjectAssetController', ProjectAssetController)
  .controller('ProjectController', ProjectController)
  .controller('ProjectInfoController', ProjectInfoController)
  .directive(
    'rubricAuthoringComponent',
    downgradeComponent({ component: RubricAuthoringComponent }) as angular.IDirectiveFactory
  )
  .controller('StudentGradingController', StudentGradingController)
  .controller('StudentProgressController', StudentProgressController)
  .controller('WISELinkAuthoringController', WISELinkAuthoringController)
  .config([
    '$stateProvider',
    '$translatePartialLoaderProvider',
    '$mdThemingProvider',
    ($stateProvider, $translatePartialLoaderProvider, $mdThemingProvider) => {
      $stateProvider
        .state('root', {
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
              (ConfigService) => {
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
              'SessionService',
              '$stateParams',
              (ConfigService, SessionService, $stateParams) => {
                return ConfigService.retrieveConfig(
                  `/author/config/${$stateParams.projectId}`
                ).then(() => {
                  SessionService.initializeSession();
                });
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
          resolve: {},
          params: {
            newComponents: []
          }
        })
        .state('root.at.project.node.advanced', {
          url: '/advanced',
          component: 'nodeAdvancedAuthoringComponent'
        })
        .state('root.at.project.node.advanced.branch', {
          url: '/branch',
          component: 'nodeAdvancedBranchAuthoringComponent'
        })
        .state('root.at.project.node.advanced.constraint', {
          url: '/constraint',
          component: 'nodeAdvancedConstraintAuthoringComponent'
        })
        .state('root.at.project.node.advanced.general', {
          url: '/general',
          component: 'nodeAdvancedGeneralAuthoringComponent'
        })
        .state('root.at.project.node.advanced.json', {
          url: '/json',
          component: 'nodeAdvancedJsonAuthoringComponent'
        })
        .state('root.at.project.node.advanced.path', {
          url: '/path',
          component: 'nodeAdvancedPathAuthoringComponent'
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
          component: 'advancedProjectAuthoringComponent'
        })
        .state('root.at.project.rubric', {
          url: '/rubric',
          component: 'rubricAuthoringComponent'
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
              'SessionService',
              '$stateParams',
              (ConfigService, SessionService, $stateParams) => {
                return ConfigService.retrieveConfig(
                  `/config/classroomMonitor/${$stateParams.runId}`
                ).then(() => {
                  SessionService.initializeSession();
                });
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
                  NotebookService.isNotebookEnabled('teacherNotebook')
                ) {
                  return NotebookService.retrieveNotebookItems().then((notebook) => {
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
          component: 'manageStudentsComponent'
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
          component: 'milestones'
        })
        .state('root.cm.notebooks', {
          url: '/notebook',
          templateUrl: '/wise5/classroomMonitor/notebook/notebookGrading.html',
          controller: 'NotebookGradingController',
          controllerAs: 'notebookGradingController'
        })
        .state('sink', {
          url: '/*path',
          template: ''
        });

      $translatePartialLoaderProvider.addPart('authoringTool/i18n');
      $translatePartialLoaderProvider.addPart('classroomMonitor/i18n');
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
      $mdThemingProvider
        .theme('light')
        .primaryPalette('light', { default: 'A100' })
        .accentPalette('pink', { default: '900' });
      $mdThemingProvider.setDefaultTheme('at');
    }
  ]);
