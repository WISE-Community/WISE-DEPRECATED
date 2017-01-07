'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthoringToolNewProjectController = function () {
    function AuthoringToolNewProjectController($state, $timeout, ConfigService, ProjectService) {
        _classCallCheck(this, AuthoringToolNewProjectController);

        this.$state = $state;
        this.$timeout = $timeout;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;

        this.project = this.ProjectService.getNewProjectTemplate();

        /*
         * we are showing the create new project view so we will give focus to
         * the newProjectTitle input element
         */
        this.$timeout(function () {
            var newProjectTitleInput = document.getElementById('newProjectTitle');

            if (newProjectTitleInput != null) {
                newProjectTitleInput.focus();
            }
        });
    }

    _createClass(AuthoringToolNewProjectController, [{
        key: 'registerNewProject',
        value: function registerNewProject() {
            var _this = this;

            var projectJSONString = angular.toJson(this.project, 4);
            var commitMessage = "Project created on " + new Date().getTime();
            this.ProjectService.registerNewProject(projectJSONString, commitMessage).then(function (projectId) {
                _this.$state.go('root.project', { projectId: projectId });
            });
        }
    }, {
        key: 'cancelRegisterNewProject',
        value: function cancelRegisterNewProject() {
            this.$state.go('root.main');
        }
    }]);

    return AuthoringToolNewProjectController;
}();

AuthoringToolNewProjectController.$inject = ['$state', '$timeout', 'ConfigService', 'ProjectService'];

exports.default = AuthoringToolNewProjectController;
//# sourceMappingURL=authoringToolNewProjectController.js.map