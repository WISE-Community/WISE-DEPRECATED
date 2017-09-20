'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthoringToolNewProjectController = function () {
  function AuthoringToolNewProjectController($filter, $state, $timeout, ConfigService, ProjectService) {
    _classCallCheck(this, AuthoringToolNewProjectController);

    this.$filter = $filter;
    this.$state = $state;
    this.$timeout = $timeout;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.$translate = this.$filter('translate');
    this.project = this.ProjectService.getNewProjectTemplate();

    // focus on the newProjectTitle input element
    this.$timeout(function () {
      var newProjectTitleInput = document.getElementById('newProjectTitle');
      if (newProjectTitleInput != null) {
        newProjectTitleInput.focus();
      }
    });
  }

  /**
   * Register a new project with WISE
   */


  _createClass(AuthoringToolNewProjectController, [{
    key: 'registerNewProject',
    value: function registerNewProject() {
      var _this = this;

      var projectJSONString = angular.toJson(this.project, 4);
      var commitMessage = this.$translate('projectCreatedOn') + new Date().getTime();
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

AuthoringToolNewProjectController.$inject = ['$filter', '$state', '$timeout', 'ConfigService', 'ProjectService'];

exports.default = AuthoringToolNewProjectController;
//# sourceMappingURL=authoringToolNewProjectController.js.map
