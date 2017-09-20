'use strict';

class AuthoringToolNewProjectController {

  constructor(
      $filter,
      $state,
      $timeout,
      ConfigService,
      ProjectService) {
    this.$filter = $filter;
    this.$state = $state;
    this.$timeout = $timeout;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.$translate = this.$filter('translate');
    this.project = this.ProjectService.getNewProjectTemplate();

    // focus on the newProjectTitle input element
    this.$timeout(() => {
      let newProjectTitleInput = document.getElementById('newProjectTitle');
      if (newProjectTitleInput != null) {
        newProjectTitleInput.focus();
      }
    });
  }

  /**
   * Register a new project with WISE
   */
  registerNewProject() {
    let projectJSONString = angular.toJson(this.project, 4);
    let commitMessage =
        this.$translate('projectCreatedOn') + new Date().getTime();
    this.ProjectService.registerNewProject(projectJSONString, commitMessage)
        .then((projectId) => {
      this.$state.go('root.project', {projectId: projectId});
    });
  }

  cancelRegisterNewProject() {
    this.$state.go('root.main');
  }
}

AuthoringToolNewProjectController.$inject = [
    '$filter',
    '$state',
    '$timeout',
    'ConfigService',
    'ProjectService'
];

export default AuthoringToolNewProjectController;
