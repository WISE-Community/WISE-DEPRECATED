'use strict';

import { ConfigService } from '../../../../services/configService';
import { TeacherDataService } from '../../../../services/teacherDataService';
import { SessionService } from '../../../../services/sessionService';
import { TeacherProjectService } from '../../../../services/teacherProjectService';
import { NotificationService } from '../../../../services/notificationService';
import { Directive } from '@angular/core';

@Directive()
class TopBarController {
  translate: any;
  avatarColor: any;
  canAuthorProject: boolean;
  contextPath: string;
  dismissedNotifications: any;
  newNotifications: any;
  notifications: any;
  projectId: number;
  runId: number;
  runCode: string;
  runInfo: string;
  themePath: string;
  userInfo: any;
  workgroupId: number;
  notificationChangedSubscription: any;

  static $inject = [
    '$filter',
    '$rootScope',
    '$scope',
    '$state',
    'ConfigService',
    'NotificationService',
    'ProjectService',
    'TeacherDataService',
    'SessionService'
  ];

  constructor(
    $filter: any,
    private $rootScope: any,
    private $scope: any,
    private $state: any,
    private ConfigService: ConfigService,
    private NotificationService: NotificationService,
    private ProjectService: TeacherProjectService,
    private TeacherDataService: TeacherDataService,
    private SessionService: SessionService
  ) {
    this.translate = $filter('translate');
    this.workgroupId = this.ConfigService.getWorkgroupId();
    if (this.workgroupId == null) {
      this.workgroupId = 100 * Math.random();
    }
    this.avatarColor = this.ConfigService.getAvatarColorForWorkgroupId(this.workgroupId);
    this.userInfo = this.ConfigService.getMyUserInfo();
    this.notificationChangedSubscription = this.NotificationService.notificationChanged$.subscribe(
      () => {
        this.setNotifications();
      }
    );
    this.themePath = this.ProjectService.getThemePath();
    this.contextPath = this.ConfigService.getContextPath();

    this.$scope.$on('$destroy', () => {
      this.ngOnDestroy();
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.notificationChangedSubscription.unsubscribe();
  }

  $onInit() {
    const permissions = this.ConfigService.getPermissions();
    this.canAuthorProject = permissions.canAuthorProject;
    this.runInfo = this.getRunInfo();
  }

  $onChanges(changesObj) {
    if (changesObj.notifications) {
      this.setNotifications();
    }
  }

  getRunInfo(): string {
    let runInfo = `${this.translate('RUN_ID_DISPLAY', { id: this.runId })}
        | ${this.translate('RUN_CODE_DISPLAY', { code: this.runCode })}`;
    return runInfo;
  }

  /**
   * Find all teacher notifications and separate into new and dismissed arrays
   * TODO: move to TeacherDataService?
   */
  setNotifications() {
    // get all notifications for the logged in teacher
    // TODO: take into account shared teacher users!
    let userNotifications = this.notifications.filter((notification) => {
      return notification.toWorkgroupId === this.workgroupId;
    });

    this.newNotifications = userNotifications.filter((notification) => {
      return notification.timeDismissed == null;
    });

    this.dismissedNotifications = userNotifications.filter((notification) => {
      return notification.timeDismissed != null;
    });
  }

  /**
   * Check whether any period in the run is paused
   * @return Boolean whether any of the periods are paused
   */
  isAnyPeriodPaused() {
    return this.TeacherDataService.isAnyPeriodPaused();
  }

  switchToAuthoringView() {
    const proceed = confirm(this.translate('editRunUnitWarning'));
    if (proceed) {
      this.doAuthoringViewSwitch();
    }
  }

  doAuthoringViewSwitch() {
    if (this.$state.current.name === 'root.cm.notebooks') {
      this.$state.go('root.at.project.notebook', {
        projectId: this.projectId
      });
    } else if (this.$state.current.name === 'root.cm.unit.node') {
      this.$state.go('root.at.project.node', {
        projectId: this.projectId,
        nodeId: this.$state.params.nodeId
      });
    } else {
      this.$state.go('root.at.project', {
        projectId: this.projectId
      });
    }
  }

  previewProject() {
    this.saveEvent('projectPreviewed').then(() => {
      window.open(`${this.ConfigService.getConfigParam('previewProjectURL')}`);
    });
  }

  goHome() {
    this.saveEvent('goHomeButtonClicked').then(() => {
      this.SessionService.goHome();
    });
  }

  logOut() {
    this.saveEvent('logOutButtonClicked').then(() => {
      this.SessionService.logOut();
    });
  }

  saveEvent(eventName): any {
    const context = 'ClassroomMonitor';
    const category = 'Navigation';
    const nodeId = null;
    const componentId = null;
    const componentType = null;
    const data = {};
    return this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      eventName,
      data
    ).then((result) => {
      return result;
    });
  }
}

const TopBar = {
  bindings: {
    logoPath: '@',
    notifications: '<',
    projectId: '<',
    projectTitle: '<',
    runId: '<',
    runCode: '<'
  },
  controller: TopBarController,
  template: `<md-toolbar class="l-header">
            <div class="md-toolbar-tools" >
                <span class="md-button logo-link">
                    <a href="{{::$ctrl.contextPath}}/teacher" target="_self">
                        <img ng-src="{{ ::$ctrl.logoPath }}" alt="{{ ::'WISE_LOGO' | translate }}" class="logo" />
                    </a>
                </span>
                <h3 layout="row" layout-align="start center">
                  <span>{{ ::$ctrl.projectTitle }}</span>&nbsp;
                  <span class="md-caption" hide-xs hide-sm hide-md>({{ $ctrl.runInfo }})</span>
                  <md-button aria-label="{{ ::'PROJECT_INFO' | translate }}" hide-gt-md class="md-icon-button">
                    <md-icon>info</md-icon>
                    <md-tooltip>{{ $ctrl.runInfo }}</md-tooltip>
                  </md-button>
                  <md-button ng-if="$ctrl.canAuthorProject" hide-xs aria-label="{{ ::'switchToAuthoringView' | translate }}" class="md-icon-button" ng-click="$ctrl.switchToAuthoringView()">
                      <md-icon md-menu-origin> edit </md-icon>
                      <md-tooltip>{{ ::'switchToAuthoringView' | translate }}</md-tooltip>
                  </md-button>
                  <md-button aria-label="{{ ::'previewProject' | translate }}" hide-xs class="md-icon-button" ng-click="$ctrl.previewProject()">
                      <md-icon md-menu-origin> visibility </md-icon>
                      <md-tooltip>{{ ::'previewProject' | translate }}</md-tooltip>
                  </md-button>
                </h3>
                <span flex></span>
                <md-menu md-position-mode="target-right target" md-offset="52 26">
                    <md-button aria-label="{{ ::'ALERTS' | translate }}" class="md-icon-button notification-btn" ng-click="$mdMenu.open($event)">
                        <span ng-show="$ctrl.newNotifications.length" class="notification-count">{{$ctrl.newNotifications.length}}</span>
                        <md-icon md-menu-origin> notifications </md-icon>
                    </md-button>
                    <md-menu-content width="5" class="account-menu">
                        <notifications-menu new-notifications="$ctrl.newNotifications" dismissed-notifications="$ctrl.dismissedNotifications" with-pause="true"></notifications-menu>
                    </md-menu-content>
                </md-menu>
                <md-menu md-position-mode="target-right target" md-offset="40 26">
                    <md-button aria-label="{{ ::'pauseStudentScreens' | translate }}"
                               class="md-icon-button"
                               ng-class="{ 'has-indicator has-indicator--icon-button': $ctrl.isAnyPeriodPaused() }"
                               ng-click="$mdMenu.open($event)">
                        <md-icon md-menu-origin ng-if="$ctrl.isAnyPeriodPaused()"> pause_circle_filled </md-icon>
                        <md-icon md-menu-origin ng-if="!$ctrl.isAnyPeriodPaused()"> pause_circle_outline </md-icon>
                    </md-button>
                    <md-menu-content width="5" class="account-menu">
                        <pause-screens-menu></pause-screens-menu>
                    </md-menu-content>
                </md-menu>
                <md-menu id='accountMenu' md-position-mode="target-right target" md-offset="8 26">
                    <md-button aria-label="{{ ::'USER_MENU' | translate }}" class="md-icon-button" ng-click="$mdMenu.open($event)">
                        <md-icon md-menu-origin> account_box </md-icon>
                    </md-button>
                    <md-menu-content width="5" class="account-menu">
                        <ng-include src="::$ctrl.themePath + '/templates/teacherAccountMenu.html'"></ng-include>
                    </md-menu-content>
                </md-menu>
            </div>
        </md-toolbar>
`
};

export default TopBar;
