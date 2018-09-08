'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthoringToolMainController = function () {
  function AuthoringToolMainController($anchorScroll, $filter, $mdDialog, $rootScope, $state, $timeout, ConfigService, ProjectService, TeacherDataService, UtilService) {
    var _this = this;

    _classCallCheck(this, AuthoringToolMainController);

    this.$anchorScroll = $anchorScroll;
    this.$filter = $filter;
    this.$mdDialog = $mdDialog;
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$timeout = $timeout;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.TeacherDataService = TeacherDataService;
    this.UtilService = UtilService;

    this.$translate = this.$filter('translate');
    this.projects = this.ConfigService.getConfigParam('projects');
    this.sharedProjects = this.ConfigService.getConfigParam('sharedProjects');
    this.showCreateProjectView = false;
    this.inProcessOfCreatingProject = false;
    this.showCreatingProjectMessage = false;
    this.showErrorCreatingProjectMessage = false;

    this.$rootScope.$on('logOut', function () {
      _this.saveEvent('logOut', 'Navigation', null, null);
    });
  }

  /**
   * Get my project or shared project by project id
   * @param projectId the project id
   * @return the project object that just contains the name and id and run id
   * if it is associated with a run. If none were found, return null.
   */


  _createClass(AuthoringToolMainController, [{
    key: 'getProjectByProjectId',
    value: function getProjectByProjectId(projectId) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.projects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var project = _step.value;

          if (project != null && project.id == projectId) {
            return project;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.sharedProjects[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var sharedProject = _step2.value;

          if (sharedProject != null && sharedProject.id == projectId) {
            return sharedProject;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return null;
    }

    /**
     * Copy a project after confirming and highlight it to draw attention to it
     * @param projectId the project to copy
     */

  }, {
    key: 'copyProject',
    value: function copyProject(projectId) {
      var _this2 = this;

      var project = this.getProjectByProjectId(projectId);
      var projectName = project.name;

      // get the project info that we will display in the confirm message
      var projectInfo = projectId + ' ' + projectName;
      var projectRunId = project.runId;
      if (projectRunId != null) {
        projectInfo += ' (Run ID: ' + projectRunId + ')';
      }

      /*
       * the message that we will use to confirm that the author wants to copy
       * the project
       */
      var doCopyConfirmMessage = this.$translate('areYouSureYouWantToCopyThisProject') + '\n\n' + projectInfo;
      if (confirm(doCopyConfirmMessage)) {
        this.ProjectService.copyProject(projectId).then(function (projectId) {
          _this2.showCopyingProjectMessage();
          _this2.saveEvent('projectCopied', 'Authoring', null, projectId);

          // refresh the project list and highlight the newly copied project
          _this2.ConfigService.retrieveConfig(window.configURL).then(function () {
            _this2.projects = _this2.ConfigService.getConfigParam('projects');
            _this2.scrollToTopOfPage();
            // the timeout is necessary for new element to appear on the page
            _this2.$timeout(function () {
              var highlightDuration = 3000;
              _this2.UtilService.temporarilyHighlightElement(projectId, highlightDuration);
            });
            _this2.$mdDialog.hide();
          });
        });
      }
    }
  }, {
    key: 'showCopyingProjectMessage',
    value: function showCopyingProjectMessage() {
      this.showMessageInModalDialog(this.$translate('copyingProject'));
    }
  }, {
    key: 'showLoadingProjectMessage',
    value: function showLoadingProjectMessage() {
      this.showMessageInModalDialog(this.$translate('loadingProject'));
    }
  }, {
    key: 'showMessageInModalDialog',
    value: function showMessageInModalDialog(message) {
      this.$mdDialog.show({
        template: '\n        <div align="center">\n          <div style="width: 200px; height: 100px; margin: 20px;">\n            <span>' + message + '...</span>\n            <br/>\n            <br/>\n            <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n          </div>\n        </div>\n      ',
        clickOutsideToClose: false
      });
    }
  }, {
    key: 'createNewProjectButtonClicked',
    value: function createNewProjectButtonClicked() {
      this.project = this.ProjectService.getNewProjectTemplate();
      this.showCreateProjectView = true;

      // focus on the newProjectTitle input element
      this.$timeout(function () {
        var createGroupTitleInput = document.getElementById('newProjectTitle');
        if (createGroupTitleInput != null) {
          createGroupTitleInput.focus();
        }
      });
    }

    /**
     * Create a new project and open it
     */

  }, {
    key: 'registerNewProject',
    value: function registerNewProject() {
      var _this3 = this;

      var projectTitle = this.project.metadata.title;
      if (projectTitle == null || projectTitle == '') {
        alert(this.$translate('pleaseEnterAProjectTitleForYourNewProject'));
      } else {
        /*
         * Make sure we are not already in the process of creating a project.
         * This is used to make sure the author does not inadvertently click
         * the register button twice which can lead to problems in the back
         * end.
         */
        if (!this.isInProcessOfCreatingProject()) {
          this.turnOnInProcessOfCreatingProject();
          this.turnOnCreatingProjectMessage();
          this.startErrorCreatingProjectTimeout();
          var projectJSONString = angular.toJson(this.project, 4);
          var commitMessage = this.$translate('projectCreatedOn') + new Date().getTime();
          this.ProjectService.registerNewProject(projectJSONString, commitMessage).then(function (projectId) {
            _this3.cancelErrorCreatingProjectTimeout();
            _this3.saveEvent('projectCreated', 'Authoring', null, projectId);
            _this3.$state.go('root.project', { projectId: projectId });
          }).catch(function () {
            _this3.turnOffInProcessOfCreatingProject();
            _this3.turnOnErrorCreatingProjectMessage();
            _this3.cancelErrorCreatingProjectTimeout();
          });
        }
      }
    }
  }, {
    key: 'turnOnInProcessOfCreatingProject',
    value: function turnOnInProcessOfCreatingProject() {
      this.inProcessOfCreatingProject = true;
    }
  }, {
    key: 'turnOffInProcessOfCreatingProject',
    value: function turnOffInProcessOfCreatingProject() {
      this.inProcessOfCreatingProject = false;
    }

    /**
     * @returns {boolean} Whether we have made a request to the server to create
     * a project and are now waiting for a response.
     */

  }, {
    key: 'isInProcessOfCreatingProject',
    value: function isInProcessOfCreatingProject() {
      return this.inProcessOfCreatingProject;
    }

    /**
     * Show the message that says "Creating Project..." after the author clicks
     * the "Create" button that makes the request to create the project on the
     * server.
     */

  }, {
    key: 'turnOnCreatingProjectMessage',
    value: function turnOnCreatingProjectMessage() {
      this.showCreatingProjectMessage = true;
      this.showErrorCreatingProjectMessage = false;
    }

    /**
     * Show the message that says "Error Creating Project".
     */

  }, {
    key: 'turnOnErrorCreatingProjectMessage',
    value: function turnOnErrorCreatingProjectMessage() {
      this.showCreatingProjectMessage = false;
      this.showErrorCreatingProjectMessage = true;
    }

    /**
     * Hide the messages that say "Creating Project..." and "Error Creating Project".
     */

  }, {
    key: 'clearAllCreatingProjectMessages',
    value: function clearAllCreatingProjectMessages() {
      this.showCreatingProjectMessage = false;
      this.showErrorCreatingProjectMessage = false;
    }

    /**
     * Create a timeout to display the "Error Creating Project" message in case
     * an error occurs and the server does not respond.
     */

  }, {
    key: 'startErrorCreatingProjectTimeout',
    value: function startErrorCreatingProjectTimeout() {
      var _this4 = this;

      this.errorCreatingProjectTimeout = this.$timeout(function () {
        _this4.turnOffInProcessOfCreatingProject();
        _this4.turnOnErrorCreatingProjectMessage();
      }, 10000);
    }

    /**
     * Cancel the timeout for displaying the "Error Creating Project" message.
     */

  }, {
    key: 'cancelErrorCreatingProjectTimeout',
    value: function cancelErrorCreatingProjectTimeout() {
      this.$timeout.cancel(this.errorCreatingProjectTimeout);
    }
  }, {
    key: 'cancelRegisterNewProject',
    value: function cancelRegisterNewProject() {
      // clear the project template
      this.project = null;
      this.showCreateProjectView = false;
      this.clearAllCreatingProjectMessages();
    }

    /**
     * Open a project in the authoring tool, replacing any current view
     * @param projectId the project id to open
     */

  }, {
    key: 'openProject',
    value: function openProject(projectId) {
      this.showLoadingProjectMessage();
      this.$state.go('root.project', { projectId: projectId });
    }

    /**
     * Launch the project in preview mode in a new tab
     */

  }, {
    key: 'previewProject',
    value: function previewProject(projectId) {
      var data = { constraints: true };
      this.saveEvent('projectPreviewed', 'Authoring', data, projectId);
      window.open(this.ConfigService.getWISEBaseURL() + '/project/' + projectId);
    }

    /**
     * Send the user to the teacher home page
     */

  }, {
    key: 'goHome',
    value: function goHome() {
      this.saveEvent('goToTeacherHome', 'Navigation', null, null);
      window.location = this.ConfigService.getWISEBaseURL() + '/teacher';
    }

    /**
     * Save an Authoring Tool event
     * @param eventName the name of the event
     * @param category the category of the event
     * example 'Navigation' or 'Authoring'
     */

  }, {
    key: 'saveEvent',
    value: function saveEvent(eventName, category, data, projectId) {
      var context = 'AuthoringTool';
      var nodeId = null;
      var componentId = null;
      var componentType = null;
      if (data == null) {
        data = {};
      }
      this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, eventName, data, projectId);
    }
  }, {
    key: 'scrollToTopOfPage',
    value: function scrollToTopOfPage() {
      this.$anchorScroll('top');
    }
  }]);

  return AuthoringToolMainController;
}();

;

AuthoringToolMainController.$inject = ['$anchorScroll', '$filter', '$mdDialog', '$rootScope', '$state', '$timeout', 'ConfigService', 'ProjectService', 'TeacherDataService', 'UtilService'];

exports.default = AuthoringToolMainController;
//# sourceMappingURL=authoringToolMainController.js.map
