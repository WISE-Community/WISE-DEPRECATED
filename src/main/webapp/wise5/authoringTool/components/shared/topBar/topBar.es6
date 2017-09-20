"use strict";

class TopBarController {
  constructor(
      $rootScope,
      ConfigService,
      ProjectService,
      TeacherDataService) {
    this.$rootScope = $rootScope;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.TeacherDataService = TeacherDataService;

    // get the teacher workgroup id
    this.workgroupId = this.ConfigService.getWorkgroupId();

    if (this.workgroupId == null) {
      /*
       * the teacher doesn't have a workgroup id so we will use a random
       * number
       */
      this.workgroupId = parseInt(100 * Math.random());
    }

    // get the avatar color for the teacher
    this.avatarColor =
        this.ConfigService.getAvatarColorForWorkgroupId(this.workgroupId);

    // get the teacher name and user name
    this.userName = this.ConfigService.getMyUserName();

    this.themePath = this.ProjectService.getThemePath();
  }

  /**
   * Navigate the teacher to the teacher home page
   */
  goHome() {
    // fire the goHome event
    this.$rootScope.$broadcast('goHome');
  };

  /**
   * Log the teacher out of WISE
   */
  logOut() {
    // fire the logOut event
    this.$rootScope.$broadcast('logOut');
  };
}

TopBarController.$inject = [
    '$rootScope',
    'ConfigService',
    'ProjectService',
    'TeacherDataService'
];

const TopBar = {
  bindings: {
    logoPath: '@',
    projectId: '<',
    projectTitle: '<',
    runId: '<'
  },
  controller: TopBarController,
  template:
    `<md-toolbar class="l-header">
      <div class="md-toolbar-tools">
        <span class="md-button logo-link">
          <img ng-src="{{ $ctrl.logoPath }}" alt="{{ 'WISE_LOGO' | translate }}" class="logo" />
        </span>
        <h3>
          <span ng-if="$ctrl.projectTitle">{{ $ctrl.projectTitle }}</span>
          <span ng-if="!$ctrl.projectTitle">{{ 'authoringTool' | translate }}</span>
          <span class="md-caption" ng-if="$ctrl.projectId">
            ({{ 'PROJECT_ID_DISPLAY' | translate:{id: $ctrl.projectId} }}<span class="md-caption" ng-if="$ctrl.runId"> | {{ 'RUN_ID_DISPLAY' | translate:{id: $ctrl.runId} }}</span>)
          </span>
        </h3>
        <span flex></span>
        <md-menu id='accountMenu' md-position-mode="target-right target" md-offset="8 26">
          <md-button aria-label="{{ 'USER_MENU' | translate }}" class="md-icon-button" ng-click="$mdMenu.open($event)">
            <md-icon md-menu-origin> account_box </md-icon>
          </md-button>
          <md-menu-content width="5" class="account-menu">
            <ng-include src="$ctrl.themePath + '/templates/teacherAccountMenu.html'"></ng-include>
          </md-menu-content>
        </md-menu>
      </div>
    </md-toolbar>`
};

export default TopBar;
