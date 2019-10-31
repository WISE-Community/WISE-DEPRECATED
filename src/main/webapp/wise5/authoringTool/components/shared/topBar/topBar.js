"use strict";

class TopBarController {
  constructor(
      $rootScope,
      $window,
      ConfigService,
      ProjectService,
      TeacherDataService) {
    this.$rootScope = $rootScope;
    this.$window = $window;
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

    this.userInfo = this.ConfigService.getMyUserInfo();
    this.themePath = this.ProjectService.getThemePath();
    this.contextPath = this.ConfigService.getContextPath();
  }

  /**
   * Open the Authoring Tool FAQ Google document in a new tab.
   */
  helpButtonClicked() {
    this.$window.open('https://docs.google.com/document/d/1G8lVtiUlGXLRAyFOvkEdadHYhJhJLW4aor9dol2VzeU', '_blank');
  }

  goHome() {
    this.ProjectService.notifyAuthorProjectEnd().then(() => {
      this.$rootScope.$broadcast('goHome');
    });
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
    '$window',
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
          <a href="{{::$ctrl.contextPath}}/teacher" target="_self">
            <img ng-src="{{ ::$ctrl.logoPath }}" alt="{{ ::'WISE_LOGO' | translate }}" class="logo" />
          </a>
        </span>
        <span flex>
        <h3>
          <span ng-if="$ctrl.projectTitle" id="projectTitleSpan">{{ $ctrl.projectTitle }}</span>
          <span ng-if="!$ctrl.projectTitle" id="projectTitleSpan">{{ ::'authoringTool' | translate }}</span>
          <span class="md-caption" ng-if="$ctrl.projectId">
            ({{ 'PROJECT_ID_DISPLAY' | translate:{id: $ctrl.projectId} }}<span class="md-caption" ng-if="$ctrl.runId"> | {{ 'RUN_ID_DISPLAY' | translate:{id: $ctrl.runId} }}</span>)
          </span>
        </h3>
        </span>
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
