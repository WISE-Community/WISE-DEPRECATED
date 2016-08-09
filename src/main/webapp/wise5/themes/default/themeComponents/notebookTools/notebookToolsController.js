"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookToolsCtrl = function () {
    function NotebookToolsCtrl($scope, $rootScope, NotebookService, ProjectService) {
        _classCallCheck(this, NotebookToolsCtrl);

        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;

        this.notebookConfig = this.NotebookService.getNotebookConfig();
    }

    _createClass(NotebookToolsCtrl, [{
        key: 'getTemplateUrl',
        value: function getTemplateUrl() {
            return this.ProjectService.getThemePath() + '/themeComponents/notebookTools/notebookTools.html';
        }
    }, {
        key: 'toggleNotebookNav',
        value: function toggleNotebookNav(ev) {
            this.$rootScope.$broadcast('toggleNotebookNav', { ev: ev });
        }
    }, {
        key: 'toggleNotebook',
        value: function toggleNotebook(ev) {
            this.$rootScope.$broadcast('toggleNotebook', { ev: ev });
        }
    }]);

    return NotebookToolsCtrl;
}();

NotebookToolsCtrl.$inject = ['$scope', '$rootScope', 'NotebookService', 'ProjectService'];

exports.default = NotebookToolsCtrl;
//# sourceMappingURL=notebookToolsController.js.map