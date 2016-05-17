"use strict";

class NotebookMenuCtrl {
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
        //this.viewMode ? this.viewMode : 'toolbar'; // default view is the side toolbar; 'nav' mode will show a sidenav with more options

        this.notebookConfig = this.NotebookService.getNotebookConfig();
        this.noteEnabled = this.notebookConfig.itemTypes.note.enabled;
        this.questionEnabled = this.notebookConfig.itemTypes.question.enabled;
        this.reportEnabled = this.notebookConfig.itemTypes.report.enabled;
        this.noteLabel = this.notebookConfig.itemTypes.note.label.link;
        this.questionLabel = this.notebookConfig.itemTypes.question.label.link;
        this.reportLabel = this.notebookConfig.itemTypes.report.label.link;
        this.noteIcon = this.notebookConfig.itemTypes.note.label.icon;
        this.questionIcon = this.notebookConfig.itemTypes.question.label.icon;
        this.reportIcon = this.notebookConfig.itemTypes.report.label.icon;
        this.noteColor = this.notebookConfig.itemTypes.note.label.color;
        this.questionColor = this.notebookConfig.itemTypes.question.label.color;
        this.reportColor = this.notebookConfig.itemTypes.report.label.color;
    }

    addNewNote(ev) {
        this.NotebookService.addNewItem(ev);
    }

    openNotebook(ev, filter) {
        this.$rootScope.$broadcast('setNotebookFilter', {filter: filter, ev: ev});
        this.$rootScope.$broadcast('toggleNotebook', {ev: ev, open: true});
    }

    toggleNotebook(ev) {
        this.$rootScope.$broadcast('toggleNotebook', {ev: ev});
    }

    setNotebookFilter(ev, filter) {
        this.$rootScope.$broadcast('setNotebookFilter', {filter: filter, ev: ev});
        this.$rootScope.$broadcast('toggleNotebookNav', {ev: ev});
    }

    getTemplateUrl() {
        return this.ProjectService.getThemePath() + '/themeComponents/notebookMenu/notebookMenu.html';
    }
}

NotebookMenuCtrl.$inject = [
    '$scope',
    '$element',
    '$rootScope',
    'NotebookService',
    'ProjectService',
    'StudentDataService'
];

export default NotebookMenuCtrl;
