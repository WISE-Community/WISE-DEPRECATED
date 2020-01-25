'use strict';

class AuthoringToolNewProjectController {

  constructor(
      $state,
      $timeout,
      ProjectService) {
    this.$state = $state;
    this.$timeout = $timeout;
    this.ProjectService = ProjectService;
    this.$translate = this.$filter('translate');
    this.project = this.ProjectService.getNewProjectTemplate();

    this.$timeout(() => {
      const newProjectTitleInput = document.getElementById('newProjectTitle');
      if (newProjectTitleInput != null) {
        newProjectTitleInput.focus();
      }
    });
  }

  registerNewProject() {
    this.ProjectService.registerNewProject(this.project.metadata.title,
        angular.toJson(this.project, 4)).then((projectId) => {
      this.$state.go('root.project', {projectId: projectId});
    });
  }

  cancelRegisterNewProject() {
    this.$state.go('root.main');
  }
}

AuthoringToolNewProjectController.$inject = [
  '$state',
  '$timeout',
  'ProjectService'
];

export default AuthoringToolNewProjectController;
