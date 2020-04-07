'use strict';

import ConfigService from '../../../../services/configService';
import ClassroomMonitorProjectService from '../../../classroomMonitorProjectService';
import TeacherDataService from '../../../../services/teacherDataService';

class TopBarController {
  avatarColor: any;
  contextPath: string;
  dismissedNotifications: any;
  newNotifications: any;
  notifications: any;
  runId: number;
  themePath: string;
  userInfo: any;
  workgroupId: number;
  static $inject = ['$rootScope', '$state', 'ConfigService', 'ProjectService', 'TeacherDataService'];

  constructor(
    private $rootScope: any,
    private $state: any,
    private ConfigService: ConfigService,
    private ProjectService: ClassroomMonitorProjectService,
    private TeacherDataService: TeacherDataService
  ) {
    this.workgroupId = this.ConfigService.getWorkgroupId();
    if (this.workgroupId == null) {
      this.workgroupId = 100 * Math.random();
    }
    this.avatarColor = this.ConfigService.getAvatarColorForWorkgroupId(this.workgroupId);
    this.userInfo = this.ConfigService.getMyUserInfo();
    this.$rootScope.$on('notificationChanged', (event, notification) => {
      this.setNotifications();
    });
    this.themePath = this.ProjectService.getThemePath();
    this.contextPath = this.ConfigService.getContextPath();
  }

  $onChanges(changesObj) {
    if (changesObj.notifications) {
      this.setNotifications();
    }
  }

  /**
   * Find all teacher notifications and separate into new and dismissed arrays
   * TODO: move to TeacherDataService?
   */
  setNotifications() {
    // get all notifications for the logged in teacher
    // TODO: take into account shared teacher users!
    let userNotifications = this.notifications.filter(notification => {
      return notification.toWorkgroupId === this.workgroupId;
    });

    this.newNotifications = userNotifications.filter(notification => {
      return notification.timeDismissed == null;
    });

    this.dismissedNotifications = userNotifications.filter(notification => {
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
    if (this.$state.params.nodeId) {
      this.$state.go('root.at.project.node', {
        projectId: this.runId,
        nodeId: this.$state.params.nodeId
      });
    } else {
      this.$state.go('root.at.project', {
        projectId: this.runId
      });
    }
  }

  goHome() {
    var context = 'ClassroomMonitor';
    var nodeId = null;
    var componentId = null;
    var componentType = null;
    var category = 'Navigation';
    var event = 'goHomeButtonClicked';
    var eventData = {};
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      event,
      eventData
    );
    this.$rootScope.$broadcast('goHome');
  }

  logOut() {
    var context = 'ClassroomMonitor';
    var nodeId = null;
    var componentId = null;
    var componentType = null;
    var category = 'Navigation';
    var event = 'logOutButtonClicked';
    var eventData = {};
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      event,
      eventData
    );
    this.$rootScope.$broadcast('logOut');
  }
}

const TopBar = {
  bindings: {
    logoPath: '@',
    notifications: '<',
    projectId: '<',
    projectTitle: '<',
    runId: '<'
  },
  controller: TopBarController,
  template: `<md-toolbar class="l-header">
            <div class="md-toolbar-tools">
                <span class="md-button logo-link">
                    <a href="{{::$ctrl.contextPath}}/teacher" target="_self">
                        <img ng-src="{{ ::$ctrl.logoPath }}" alt="{{ ::'WISE_LOGO' | translate }}" class="logo" />
                    </a>
                </span>
                <h3>{{ ::$ctrl.projectTitle }} <span class="md-caption">({{ ::'RUN_ID_DISPLAY' | translate:{id: $ctrl.runId} }})</span>
                <md-button style="text-transform: none;" ng-click="$ctrl.switchToAuthoringView()">
                  {{ ::'switchToAuthoringView' | translate }}
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
                        <md-icon md-menu-origin ng-if="$ctrl.isAnyPeriodPaused()"> lock </md-icon>
                        <md-icon md-menu-origin ng-if="!$ctrl.isAnyPeriodPaused()"> lock_open </md-icon>
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
