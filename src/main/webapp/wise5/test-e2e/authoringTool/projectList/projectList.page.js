'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProjectListPage = function () {
  function ProjectListPage() {
    _classCallCheck(this, ProjectListPage);

    this.createNewProjectButton = element(by.id('createNewProjectButton'));
    this.goHomeButton = element(by.id('goHomeButton'));
    this.createProjectButton = element(by.id('createProjectButton'));
    this.cancelCreateProjectButton = element(by.id('cancelCreateProjectButton'));
    this.newProjectTitleInput = element(by.model('authoringToolMainController.project.metadata.title'));
    this.projects = element.all(by.css('.projectItem'));
  }

  /**
   * Start the process of creating a new project by showing a project title
   * input.
   */


  _createClass(ProjectListPage, [{
    key: 'createNewProject',
    value: function createNewProject() {
      this.createNewProjectButton.click();
    }

    /**
     * Create the new project.
     */

  }, {
    key: 'createProject',
    value: function createProject() {
      this.createProjectButton.click();
    }

    /**
     * Cancel the process of creating a new project.
     */

  }, {
    key: 'cancelCreateProject',
    value: function cancelCreateProject() {
      this.cancelCreateProjectButton.click();
    }

    /**
     * Set the project title when in the process of creating a new project.
     */

  }, {
    key: 'setNewProjectTitle',
    value: function setNewProjectTitle(title) {
      this.newProjectTitleInput.sendKeys(title);
    }
  }]);

  return ProjectListPage;
}();

exports.default = ProjectListPage;
//# sourceMappingURL=projectList.page.js.map
