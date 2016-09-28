'use strict';

class AuthorNotebookController {

    constructor($state, $stateParams, $scope, ProjectService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$scope = $scope;
        this.projectId = this.$stateParams.projectId;
        this.ProjectService = ProjectService;
        this.project = this.ProjectService.project;
        this.originalProject = this.project; // keep a copy of the project

        // Retrieve and display the commit history for the current project.
        //this.ProjectService.getCommitHistory().then((commitHistoryArray) => {
        //    this.commitHistory = commitHistoryArray;
        //});
    }

    exit() {
        this.ProjectService.saveProject();
        this.$state.go('root.project', {projectId: this.projectId});
    }
}

AuthorNotebookController.$inject = ['$state', '$stateParams', '$scope', 'ProjectService'];

export default AuthorNotebookController