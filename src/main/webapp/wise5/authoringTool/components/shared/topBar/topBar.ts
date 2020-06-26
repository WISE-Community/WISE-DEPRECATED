'use strict';

import { ConfigService } from '../../../../services/configService';
import { AuthoringToolProjectService } from '../../../authoringToolProjectService';
import { SessionService } from '../../../../services/sessionService';
import TeacherDataService from '../../../../services/teacherDataService';

class TopBarController {
  avatarColor: any;
  workgroupId: number;
  userInfo: any;
  themePath: string;
  contextPath: string;
  runId: number;

  static $inject = [
    '$rootScope',
    '$state',
    '$window',
    'ConfigService',
    'ProjectService',
    'SessionService'
  ];

  constructor(
    private $rootScope: any,
    private $state: any,
    private $window: any,
    private ConfigService: ConfigService,
    private ProjectService: AuthoringToolProjectService,
    private SessionService: SessionService,
    private TeacherDataService: TeacherDataService
  ) {
    this.workgroupId = this.ConfigService.getWorkgroupId();
    if (this.workgroupId == null) {
      this.workgroupId = 100 * Math.random();
    }
    this.avatarColor = this.ConfigService.getAvatarColorForWorkgroupId(this.workgroupId);
    this.userInfo = this.ConfigService.getMyUserInfo();
    this.themePath = this.ProjectService.getThemePath();
    this.contextPath = this.ConfigService.getContextPath();
  }

  helpButtonClicked() {
    this.$window.open(
      'https://docs.google.com/document/d/1G8lVtiUlGXLRAyFOvkEdadHYhJhJLW4aor9dol2VzeU',
      '_blank'
    );
  }

  switchToGradingView() {
    if (this.$state.current.name === 'root.at.project.notebook') {
      this.$state.go('root.cm.notebooks', {
        runId: this.runId
      });
    } else if (this.$state.current.name === 'root.at.project.node') {
      this.$state.go('root.cm.unit.node', {
        runId: this.runId,
        nodeId: this.$state.params.nodeId
      });
    } else {
      this.$state.go('root.cm.unit', {
        runId: this.runId
      });
    }

  }

  goHome() {
    this.ProjectService.notifyAuthorProjectEnd().then(() => {
      this.SessionService.goHome();
    });
  }

  logOut() {
    const context = 'AuthoringTool';
    const category = 'Navigation';
    const eventName = 'logOutButtonClicked';
    const nodeId = null;
    const componentId = null;
    const componentType = null;
    const data = {};
    const projectId = null;
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      eventName,
      data,
      projectId
    ).then((result) => {
      this.SessionService.logOut();
    });
  }
}

const TopBar = {
  bindings: {
    logoPath: '@',
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
        <h3 layout="row" layout-align="start center">
          <span ng-if="$ctrl.projectTitle" id="projectTitleSpan">{{ $ctrl.projectTitle }}</span>
          <span ng-if="!$ctrl.projectTitle" id="projectTitleSpan">{{ ::'authoringTool' | translate }}</span>
          <span class="md-caption" ng-if="$ctrl.projectId" layout="row" layout-align="start center">
            &nbsp;({{ 'PROJECT_ID_DISPLAY' | translate:{id: $ctrl.projectId} }}
            <span class="md-caption" ng-if="$ctrl.runId">&nbsp;| {{ 'RUN_ID_DISPLAY' | translate:{id: $ctrl.runId} }}
            </span>)
            <md-button ng-if="$ctrl.runId" aria-label="{{ ::'switchToGradingView' | translate }}" class="md-icon-button" ng-click="$ctrl.switchToGradingView()">
                <md-icon md-menu-origin> assignment_turned_in </md-icon>
                <md-tooltip>{{ ::'switchToGradingView' | translate }}</md-tooltip>
            </md-button>
          </span>
        </h3>
        <span flex></span>
        <md-button style="text-transform: none;"
            ng-click="$ctrl.helpButtonClicked()">{{ ::'HELP' | translate }}</md-button>
        <md-menu id='accountMenu' md-position-mode="target-right target" md-offset="8 26">
          <md-button aria-label="{{ ::'USER_MENU' | translate }}" class="md-icon-button" ng-click="$mdMenu.open($event)">
            <md-icon md-menu-origin> account_box </md-icon>
          </md-button>
          <md-menu-content width="5" class="account-menu">
            <ng-include src="::$ctrl.themePath + '/templates/teacherAccountMenu.html'"></ng-include>
          </md-menu-content>
        </md-menu>
      </div>
    </md-toolbar>`
};

export default TopBar;
