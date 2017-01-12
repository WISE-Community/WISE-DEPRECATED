'use strict';

class AuthorNotebookController {

    constructor($filter,
                $state,
                $stateParams,
                $scope,
                ProjectService) {

        this.$filter = $filter;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$scope = $scope;
        this.ProjectService = ProjectService;
        this.$translate = this.$filter('translate');
        this.projectId = this.$stateParams.projectId;
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
        let commitMessage = this.$translate('madeChangesToNotebook');

        this.ProjectService.saveProject(commitMessage);
        this.$state.go('root.project', {projectId: this.projectId});
    }
}

AuthorNotebookController.$inject = [
    '$filter',
    '$state',
    '$stateParams',
    '$scope',
    'ProjectService'];

export default AuthorNotebookController;
