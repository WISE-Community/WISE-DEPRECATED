"use strict";

class NotebookToolbarCtrl {
    constructor($scope,
                $element,
                $rootScope,
                NotebookService,
                ProjectService,
                StudentDataService) {

        this.$scope = $scope;
        this.$element = $element;
        this.$rootScope = $rootScope;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        this.addMode = false;

        this.notebookConfig = this.NotebookService.getNotebookConfig();
        this.noteEnabled = (this.notebookConfig.note && this.notebookConfig.note.enabled);
        this.questionEnabled = (this.notebookConfig.question && this.notebookConfig.question.enabled);
        this.reportEnabled = (this.notebookConfig.report && this.notebookConfig.report.enabled);
    }

    addNewNote(ev) {
        this.NotebookService.addNewItem(ev);
    }

    openNotebook(ev) {
        this.$rootScope.$broadcast('setNotebookFilter', {filter: 'notes'}); // TODO: make into NotebookService function
        this.NotebookService.toggleNotebook(ev);
    }

    openReport(ev) {
        // TODO: support multiple reports
        this.$rootScope.$broadcast('setNotebookFilter', {filter: 'report'}); // TODO: make into NotebookService function
        this.NotebookService.toggleNotebook(ev);
    }

    getTemplateUrl() {
        return this.ProjectService.getThemePath() + '/themeComponents/notebookToolbar/notebookToolbar.html';
    }
}

NotebookToolbarCtrl.$inject = [
    '$scope',
    '$element',
    '$rootScope',
    'NotebookService',
    'ProjectService',
    'StudentDataService'
];

export default NotebookToolbarCtrl;
