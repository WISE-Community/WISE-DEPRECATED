'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthoringToolMainController = function () {
    function AuthoringToolMainController($state, ConfigService, ProjectService) {
        _classCallCheck(this, AuthoringToolMainController);

        this.$state = $state;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;

        // get list of projects owned by this user and shared with this
        this.projects = this.ConfigService.getConfigParam("projects");
        this.sharedProjects = this.ConfigService.getConfigParam("sharedProjects");
    }

    _createClass(AuthoringToolMainController, [{
        key: "copyProject",
        value: function copyProject(projectId) {
            var _this = this;

            this.ProjectService.copyProject(projectId).then(function (projectId) {
                // refresh the project list
                var configURL = window.configURL;
                _this.ConfigService.retrieveConfig(configURL).then(function () {
                    _this.projects = _this.ConfigService.getConfigParam("projects");
                });
            });
        }
    }, {
        key: "downloadProject",
        value: function downloadProject(projectId) {
            var exportProjectURL = this.ConfigService.getWISEBaseURL() + "/project/export/" + projectId;
            window.location.href = exportProjectURL;
        }
    }, {
        key: "createNewProject",
        value: function createNewProject() {
            this.$state.go('root.new');
        }
    }, {
        key: "openProject",
        value: function openProject(projectId) {
            this.$state.go('root.project', { projectId: projectId });
        }

        /**
         * Launch the project in preview mode
         */

    }, {
        key: "previewProject",
        value: function previewProject(projectId) {
            var previewProjectURL = this.ConfigService.getWISEBaseURL() + "/project/" + projectId;
            window.open(previewProjectURL);
        }
    }, {
        key: "goHome",
        value: function goHome() {
            // send the user to the teacher home page
            var wiseBaseURL = this.ConfigService.getWISEBaseURL();
            var teacherHomePageURL = wiseBaseURL + '/teacher';
            window.location = teacherHomePageURL;
        }
    }]);

    return AuthoringToolMainController;
}();

;

AuthoringToolMainController.$inject = ['$state', 'ConfigService', 'ProjectService'];

exports.default = AuthoringToolMainController;
//# sourceMappingURL=authoringToolMainController.js.map