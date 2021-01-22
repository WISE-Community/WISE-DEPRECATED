'use strict';

import { ConfigService } from '../../../../services/configService';
import { TeacherProjectService } from '../../../../services/teacherProjectService';
import { SessionService } from '../../../../services/sessionService';
import { TeacherDataService } from '../../../../services/teacherDataService';

class TopBarController {
  translate: any;
  avatarColor: any;
  workgroupId: number;
  userInfo: any;
  themePath: string;
  contextPath: string;
  projectId: number;
  runId: number;
  runCode: string;
  projectInfo: string;

  static $inject = [
    '$filter',
    '$state',
    '$window',
    'ConfigService',
    'ProjectService',
    'SessionService',
    'TeacherDataService'
  ];

  constructor(
    private $filter: any,
    private $state: any,
    private $window: any,
    private ConfigService: ConfigService,
    private ProjectService: TeacherProjectService,
    private SessionService: SessionService,
    private TeacherDataService: TeacherDataService
  ) {
    this.translate = this.$filter('translate');
    this.workgroupId = this.ConfigService.getWorkgroupId();
    if (this.workgroupId == null) {
      this.workgroupId = 100 * Math.random();
    }
    this.avatarColor = this.ConfigService.getAvatarColorForWorkgroupId(this.workgroupId);
    this.userInfo = this.ConfigService.getMyUserInfo();
    this.themePath = this.ProjectService.getThemePath();
    this.contextPath = this.ConfigService.getContextPath();
  }

  $onChanges() {
    this.projectInfo = this.getProjectInfo();
  }

  getProjectInfo(): string {
    let projectInfo = this.translate('PROJECT_ID_DISPLAY', { id: this.projectId });
    if (this.runId) {
      projectInfo += ` | ${this.translate('RUN_ID_DISPLAY', { id: this.runId })}
          | ${this.translate('RUN_CODE_DISPLAY', { code: this.runCode })}`;
    }
    return projectInfo;
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
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      eventName,
      data
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
    runId: '<',
    runCode: '<'
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
          <span ng-if="!$ctrl.projectTitle" id="projectTitleSpan">{{ ::'authoringTool' | translate }}</span>&nbsp;
          <span class="md-caption" ng-if="$ctrl.projectId" layout="row" layout-align="start center">
            <span hide-xs hide-sm hide-md>({{ $ctrl.projectInfo }})</span>
            <md-button aria-label="{{ ::'PROJECT_INFO' | translate }}" hide-gt-md class="md-icon-button">
              <md-icon>info</md-icon>
              <md-tooltip>{{ $ctrl.projectInfo }}</md-tooltip>
            </md-button>
            <md-button ng-if="$ctrl.runId" hide-xs aria-label="{{ ::'switchToGradingView' | translate }}" class="md-icon-button" ng-click="$ctrl.switchToGradingView()">
                <md-icon> assignment_turned_in </md-icon>
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
