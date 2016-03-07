'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthoringToolMainController = function () {
    function AuthoringToolMainController($state, ConfigService) {
        _classCallCheck(this, AuthoringToolMainController);

        this.ConfigService = ConfigService;
        this.$state = $state;

        // get list of projects owned by this user
        this.projects = this.ConfigService.getConfigParam("projects");
    }

    _createClass(AuthoringToolMainController, [{
        key: 'createNewProject',
        value: function createNewProject() {
            this.$state.go('root.new');
        }
    }, {
        key: 'openProject',
        value: function openProject(projectId) {
            this.$state.go('root.project', { projectId: projectId });
        }
    }]);

    return AuthoringToolMainController;
}();

;

AuthoringToolMainController.$inject = ['$state', 'ConfigService'];

exports.default = AuthoringToolMainController;
//# sourceMappingURL=authoringToolMainController.js.map