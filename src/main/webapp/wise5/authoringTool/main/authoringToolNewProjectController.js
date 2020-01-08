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

    this.$timeout(() => {
      let newProjectTitleInput = document.getElementById('newProjectTitle');
      if (newProjectTitleInput != null) {
        newProjectTitleInput.focus();
      }
    });
  }

  registerNewProject() {
    const projectName = this.project.metadata.title;
    const projectJSONString = angular.toJson(this.project, 4);
    this.ProjectService.registerNewProject(projectName, projectJSONString).then((projectId) => {
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
