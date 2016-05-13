"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookToolbarCtrl = function () {
    function NotebookToolbarCtrl($scope, $element, $rootScope, NotebookService, ProjectService, StudentDataService) {
        _classCallCheck(this, NotebookToolbarCtrl);

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

    _createClass(NotebookToolbarCtrl, [{
        key: 'addNewNote',
        value: function addNewNote(ev) {
            this.NotebookService.addNewItem(ev);
        }
    }, {
        key: 'openNotebook',
        value: function openNotebook(ev, filter) {
            this.$rootScope.$broadcast('setNotebookFilter', { filter: filter, ev: ev });
            this.$rootScope.$broadcast('toggleNotebook', { ev: ev });
        }
    }, {
        key: 'getTemplateUrl',
        value: function getTemplateUrl() {
            return this.ProjectService.getThemePath() + '/themeComponents/notebookToolbar/notebookToolbar.html';
        }
    }]);

    return NotebookToolbarCtrl;
}();

NotebookToolbarCtrl.$inject = ['$scope', '$element', '$rootScope', 'NotebookService', 'ProjectService', 'StudentDataService'];

exports.default = NotebookToolbarCtrl;
//# sourceMappingURL=notebookToolbarController.js.map