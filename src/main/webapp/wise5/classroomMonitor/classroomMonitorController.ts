'use strict';

import { ConfigService } from '../services/configService';
import NodeService from '../services/nodeService';
import NotebookService from '../services/notebookService';
import NotificationService from '../services/notificationService';
import TeacherDataService from '../services/teacherDataService';
import { SessionService } from '../services/sessionService';
import * as angular from 'angular';
import { ClassroomMonitorProjectService } from './classroomMonitorProjectService';

class ClassroomMonitorController {
  $translate: any;
  connectionLostDisplay: any;
  connectionLostShown: boolean;
  currentViewName: string;
  enableProjectAchievements: boolean;
  logoPath: string;
  menuOpen: boolean = false;
  notifications: any;
  numberProject: boolean = true;
  projectTitle: string;
  runId: number;
  showGradeByStepTools: boolean = false;
  showGradeByTeamTools: boolean;
  showPeriodSelect: boolean = false;
  showSideMenu: boolean = true;
  showToolbar: boolean = true;
  themePath: string;
  views: any;
  workgroupId: number;

  static $inject = [
    '$filter',
    '$mdDialog',
    '$mdToast',
    '$scope',
    '$state',
    '$transitions',
    '$window',
    'ConfigService',
    'NodeService',
    'NotebookService',
    'NotificationService',
    'ProjectService',
    'SessionService',
    'TeacherDataService'
  ];

  constructor(
    $filter,
    private $mdDialog: any,
    private $mdToast: any,
    private $scope: any,
    private $state: any,
    $transitions: any,
    private $window: any,
    private ConfigService: ConfigService,
    private NodeService: NodeService,
    private NotebookService: NotebookService,
    private NotificationService: NotificationService,
    private ProjectService: ClassroomMonitorProjectService,
    private SessionService: SessionService,
    private TeacherDataService: TeacherDataService
  ) {
    this.$translate = $filter('translate');
    this.projectTitle = this.ProjectService.getProjectTitle();
    this.runId = this.ConfigService.getRunId();
    this.enableProjectAchievements = this.ProjectService.getAchievements().isEnabled;
    this.views = {
      'root.cm.dashboard': {
        name: this.$translate('dashboard'),
        icon: 'dashboard',
        type: 'primary',
        active: false
      },
      'root.cm.milestones': {
        name: this.$translate('milestones'),
        icon: 'flag',
        type: 'primary',
        active: this.enableProjectAchievements
      },
      'root.cm.unit': {
        name: this.$translate('gradeByStep'),
        icon: 'view_list',
        type: 'primary',
        action: () => {
          let currentView = this.$state.current.name;
          if (currentView === 'root.cm.unit') {
            // if we're currently grading a step, close the node when a nodeProgress menu button is clicked
            this.NodeService.closeNode();
          }
        },
        active: true
      },
      'root.cm.teamLanding': {
        name: this.$translate('gradeByTeam'),
        icon: 'people',
        type: 'primary',
        active: true
      },
      'root.cm.manageStudents': {
        name: this.$translate('manageStudents'),
        icon: 'face',
        type: 'primary',
        active: true
      },
      'root.cm.notebooks': {
        name: this.$translate('studentNotebooks'),
        icon: 'chrome_reader_mode',
        type: 'primary',
        active: this.NotebookService.isNotebookEnabled()
      },
      'root.cm.export': {
        name: this.$translate('dataExport'),
        icon: 'file_download',
        type: 'secondary',
        active: true
      }
    };

    this.connectionLostDisplay = this.$mdToast.build({
      template: `<md-toast>
                        <span>{{ ::'ERROR_CHECK_YOUR_INTERNET_CONNECTION' | translate }}</span>
                      </md-toast>`,
      hideDelay: 0
    });
    this.connectionLostShown = false;

    this.$scope.$on('showSessionWarning', () => {
      const confirm = $mdDialog
        .confirm()
        .parent(angular.element(document.body))
        .title(this.$translate('SESSION_TIMEOUT'))
        .content(this.$translate('SESSION_TIMEOUT_MESSAGE'))
        .ariaLabel(this.$translate('SESSION_TIMEOUT'))
        .ok(this.$translate('YES'))
        .cancel(this.$translate('NO'));
      $mdDialog.show(confirm).then(
        () => {
          this.SessionService.closeWarningAndRenewSession();
        },
        () => {
          this.logOut();
        }
      );
    });

    this.$scope.$on('logOut', () => {
      this.logOut();
    });

    this.$scope.$on('showRequestLogout', ev => {
      const alert = $mdDialog
        .confirm()
        .parent(angular.element(document.body))
        .title(this.$translate('serverUpdate'))
        .textContent(this.$translate('serverUpdateRequestLogoutMessage'))
        .ariaLabel(this.$translate('serverUpdate'))
        .targetEvent(ev)
        .ok(this.$translate('ok'));
      $mdDialog.show(alert);
    });

    $transitions.onSuccess({}, $transition => {
      this.menuOpen = false;
      this.processUI();
    });

    this.$scope.$on('serverDisconnected', () => {
      this.handleServerDisconnect();
    });

    this.$scope.$on('serverConnected', () => {
      this.handleServerReconnect();
    });

    // TODO: make dynamic, set somewhere like in config?
    this.logoPath = this.ProjectService.getThemePath() + '/images/WISE-logo-ffffff.svg';
    this.processUI();
    this.themePath = this.ProjectService.getThemePath();
    this.notifications = this.NotificationService.notifications;

    const context = 'ClassroomMonitor',
      nodeId = null,
      componentId = null,
      componentType = null,
      category = 'Navigation',
      event = 'sessionStarted',
      data = {},
      projectId = null;
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      event,
      data,
      projectId
    );

    this.$window.onbeforeunload = () => {
      const periods = this.TeacherDataService.getRunStatus().periods;
      if (periods != null) {
        for (var p = 0; p < periods.length; p++) {
          const period = periods[p];
          if (period != null && period.periodId !== -1 && period.paused) {
            this.TeacherDataService.pauseScreensChanged(period.periodId, false);
          }
        }
      }
    };
  }

  /**
   * Update UI items based on state, show or hide relevant menus and toolbars
   * TODO: remove/rework this and put items in their own ui states?
   */
  processUI() {
    const viewName = this.$state.$current.name;
    const currentView = this.views[viewName];
    if (currentView) {
      this.currentViewName = currentView.name;
    }
    this.showGradeByStepTools = false;
    this.showGradeByTeamTools = false;
    this.showPeriodSelect = true;
    this.workgroupId = null;
    if (viewName === 'root.cm.unit.node') {
      let nodeId = this.$state.params.nodeId;
      this.showGradeByStepTools = this.ProjectService.isApplicationNode(nodeId);
    } else if (viewName === 'root.cm.team') {
      this.workgroupId = parseInt(this.$state.params.workgroupId);
      this.showGradeByTeamTools = true;
    } else if (viewName === 'root.cm.export') {
      this.showPeriodSelect = false;
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  mouseMoved() {
    this.SessionService.mouseMoved();
  }

  handleServerDisconnect() {
    if (!this.connectionLostShown) {
      this.$mdToast.show(this.connectionLostDisplay);
      this.connectionLostShown = true;
    }
  }

  handleServerReconnect() {
    this.$mdToast.hide(this.connectionLostDisplay);
    this.connectionLostShown = false;
  }

  logOut() {
    this.saveEvent('logOut', 'Navigation').then(() => {
      this.SessionService.logOut();
    });
  }

  saveEvent(eventName, category): any {
    const context = 'ClassroomMonitor';
    const nodeId = null;
    const componentId = null;
    const componentType = null;
    const data = {};
    const projectId = null;
    return this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      eventName,
      data,
      projectId
    ).then((result) => {
      return result;
    });
  }
}

export default ClassroomMonitorController;
