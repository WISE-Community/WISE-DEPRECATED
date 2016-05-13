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
        this.noteEnabled = this.notebookConfig.itemTypes.note.enabled;
        this.questionEnabled = this.notebookConfig.itemTypes.question.enabled;
        this.reportEnabled = this.notebookConfig.itemTypes.report.enabled;
        this.noteLabel = this.notebookConfig.itemTypes.note.label.link;
        this.questionLabel = this.notebookConfig.itemTypes.question.label.link;
        this.reportLabel = this.notebookConfig.itemTypes.report.label.link;
    }

    addNewNote(ev) {
        this.NotebookService.addNewItem(ev);
    }

    openNotebook(ev, filter) {
        this.$rootScope.$broadcast('setNotebookFilter', {filter: filter, ev: ev});
        this.$rootScope.$broadcast('toggleNotebook', {ev: ev});
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
