'use strict';

class ProjectHistoryController {

    constructor($state, $stateParams, $scope, ProjectService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$scope = $scope;
        this.projectId = this.$stateParams.projectId;
        this.ProjectService = ProjectService;

        // Retrieve and display the commit history for the current project.
        this.ProjectService.getCommitHistory().then((commitHistoryArray) => {
            this.commitHistory = commitHistoryArray;
        });
    }

    exit() {
        this.$state.go('root.project', {projectId: this.projectId});
    }
}

ProjectHistoryController.$inject = ['$state', '$stateParams', '$scope', 'ProjectService'];

export default ProjectHistoryController