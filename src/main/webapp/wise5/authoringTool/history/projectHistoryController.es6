'use strict';

class ProjectHistoryController {

  constructor(
      $state,
      $stateParams,
      $scope,
      ProjectService) {
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$scope = $scope;
    this.projectId = this.$stateParams.projectId;
    this.ProjectService = ProjectService;

    this.retrieveCommitHistory();
  }

  /**
   * Return to main authoring view
   * TODO rename to returnToAuthoringView
   */
  exit() {
    this.$state.go('root.project', {projectId: this.projectId});
  }

  retrieveCommitHistory() {
    this.ProjectService.getCommitHistory().then((commitHistoryArray) => {
      this.commitHistory = commitHistoryArray;
    });
  }
}

ProjectHistoryController.$inject = [
    '$state',
    '$stateParams',
    '$scope',
    'ProjectService'
];

export default ProjectHistoryController
