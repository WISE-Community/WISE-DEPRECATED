'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProjectHistoryController = function () {
    function ProjectHistoryController($state, $stateParams, $scope, ProjectService) {
        var _this = this;

        _classCallCheck(this, ProjectHistoryController);

        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$scope = $scope;
        this.projectId = this.$stateParams.projectId;
        this.ProjectService = ProjectService;

        // Retrieve and display the commit history for the current project.
        this.ProjectService.getCommitHistory().then(function (commitHistoryArray) {
            _this.commitHistory = commitHistoryArray;
        });
    }

    _createClass(ProjectHistoryController, [{
        key: 'exit',
        value: function exit() {
            this.$state.go('root.project', { projectId: this.projectId });
        }
    }]);

    return ProjectHistoryController;
}();

ProjectHistoryController.$inject = ['$state', '$stateParams', '$scope', 'ProjectService'];

exports.default = ProjectHistoryController;
//# sourceMappingURL=projectHistoryController.js.map