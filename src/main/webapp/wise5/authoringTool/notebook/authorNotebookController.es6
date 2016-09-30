'use strict';

class AuthorNotebookController {

    constructor($state, $stateParams, $scope, ProjectService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$scope = $scope;
        this.projectId = this.$stateParams.projectId;
        this.ProjectService = ProjectService;
        this.project = this.ProjectService.project;

        if (this.project.notebook == null) {
            // some old projects may not have the notebook settings, so copy default settings from template project.
            let projectTemplate = this.ProjectService.getNewProjectTemplate();
            this.project.notebook = projectTemplate.notebook;
        }
    }

    /**
     * Adds a new report note item to this project's notebook. Currently we limit 1 report note per project.
     */
    addReportNote() {
        // some old projects may not have the notebook settings, so copy default settings from template project.
        let projectTemplate = this.ProjectService.getNewProjectTemplate();

        if (this.project.notebook.itemTypes.report.notes == null) {
            this.project.notebook.itemTypes.report.notes = [];
        }
        if (this.project.notebook.itemTypes.report.notes < 1) {
            this.project.notebook.itemTypes.report.notes.push(projectTemplate.notebook.itemTypes.report.notes[0]);
        }
    }

    exit() {
        this.ProjectService.saveProject();
        this.$state.go('root.project', {projectId: this.projectId});
    }
}

AuthorNotebookController.$inject = ['$state', '$stateParams', '$scope', 'ProjectService'];

export default AuthorNotebookController;