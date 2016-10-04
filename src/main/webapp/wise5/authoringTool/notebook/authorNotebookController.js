'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthorNotebookController = function () {
    function AuthorNotebookController($state, $stateParams, $scope, ProjectService) {
        _classCallCheck(this, AuthorNotebookController);

        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$scope = $scope;
        this.projectId = this.$stateParams.projectId;
        this.ProjectService = ProjectService;
        this.project = this.ProjectService.project;

        if (this.project.notebook == null) {
            // some old projects may not have the notebook settings, so copy default settings from template project.
            var projectTemplate = this.ProjectService.getNewProjectTemplate();
            this.project.notebook = projectTemplate.notebook;
        }
    }

    /**
     * Adds a new report note item to this project's notebook. Currently we limit 1 report note per project.
     */


    _createClass(AuthorNotebookController, [{
        key: 'addReportNote',
        value: function addReportNote() {
            // some old projects may not have the notebook settings, so copy default settings from template project.
            var projectTemplate = this.ProjectService.getNewProjectTemplate();

            if (this.project.notebook.itemTypes.report.notes == null) {
                this.project.notebook.itemTypes.report.notes = [];
            }
            if (this.project.notebook.itemTypes.report.notes < 1) {
                this.project.notebook.itemTypes.report.notes.push(projectTemplate.notebook.itemTypes.report.notes[0]);
            }
        }
    }, {
        key: 'exit',
        value: function exit() {
            this.ProjectService.saveProject();
            this.$state.go('root.project', { projectId: this.projectId });
        }
    }]);

    return AuthorNotebookController;
}();

AuthorNotebookController.$inject = ['$state', '$stateParams', '$scope', 'ProjectService'];

exports.default = AuthorNotebookController;
//# sourceMappingURL=authorNotebookController.js.map