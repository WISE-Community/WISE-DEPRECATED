"use strict";

class NotebookToolsCtrl {
    constructor($scope,
                $rootScope,
                NotebookService,
                ProjectService) {

        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;

        this.notebookConfig = this.NotebookService.getNotebookConfig();
    }

    getTemplateUrl(){
        return this.ProjectService.getThemePath() + '/themeComponents/notebookTools/notebookTools.html';
    }

    toggleNotebookNav(ev) {
        this.$rootScope.$broadcast('toggleNotebookNav', {ev: ev});
    }

    toggleNotebook(ev) {
        this.$rootScope.$broadcast('toggleNotebook', {ev: ev});
    }
}

NotebookToolsCtrl.$inject = [
    '$scope',
    '$rootScope',
    'NotebookService',
    'ProjectService'
];

export default NotebookToolsCtrl;
