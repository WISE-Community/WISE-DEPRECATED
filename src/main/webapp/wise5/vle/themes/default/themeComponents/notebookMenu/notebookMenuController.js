"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookMenuCtrl = function () {
    function NotebookMenuCtrl($scope, $element, $rootScope, NotebookService, ProjectService, StudentDataService) {
        _classCallCheck(this, NotebookMenuCtrl);

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

    _createClass(NotebookMenuCtrl, [{
        key: 'addNewNote',
        value: function addNewNote(ev) {
            this.NotebookService.addNewItem(ev);
        }
    }, {
        key: 'openNotebook',
        value: function openNotebook(ev, filter) {
            this.$rootScope.$broadcast('setNotebookFilter', { filter: filter, ev: ev });
            this.$rootScope.$broadcast('toggleNotebook', { ev: ev, open: true });
        }
    }, {
        key: 'toggleNotebook',
        value: function toggleNotebook(ev) {
            this.$rootScope.$broadcast('toggleNotebook', { ev: ev });
        }
    }, {
        key: 'setNotebookFilter',
        value: function setNotebookFilter(ev, filter) {
            this.$rootScope.$broadcast('setNotebookFilter', { filter: filter, ev: ev });
            this.$rootScope.$broadcast('toggleNotebookNav', { ev: ev });
        }
    }, {
        key: 'getTemplateUrl',
        value: function getTemplateUrl() {
            return this.ProjectService.getThemePath() + '/themeComponents/notebookMenu/notebookMenu.html';
        }
    }]);

    return NotebookMenuCtrl;
}();

NotebookMenuCtrl.$inject = ['$scope', '$element', '$rootScope', 'NotebookService', 'ProjectService', 'StudentDataService'];

exports.default = NotebookMenuCtrl;
//# sourceMappingURL=notebookMenuController.js.map