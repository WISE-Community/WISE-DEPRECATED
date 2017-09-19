'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthoringToolMainController = function () {
  function AuthoringToolMainController($anchorScroll, $filter, $rootScope, $state, $timeout, ConfigService, ProjectService, TeacherDataService) {
    var _this = this;

    _classCallCheck(this, AuthoringToolMainController);

    this.$anchorScroll = $anchorScroll;
    this.$filter = $filter;
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$timeout = $timeout;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.TeacherDataService = TeacherDataService;

    this.$translate = this.$filter('translate');
    this.projects = this.ConfigService.getConfigParam("projects");
    this.sharedProjects = this.ConfigService.getConfigParam("sharedProjects");
    this.showCreateProjectView = false;

    this.$rootScope.$on('goHome', function () {
      _this.saveEvent('goToTeacherHome', 'Navigation', null, null);
    });
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
     * Copy a project and highlight it to draw attention to it
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
        // add the run id to the info
        projectInfo += ' (Run ID: ' + projectRunId + ')';
      }

      /*
       * the message that we will use to confirm that the author wants to copy
       * the project
       */
      var doCopyConfirmMessage = this.$translate('areYouSureYouWantToCopyThisProject') + '\n\n' + projectInfo;
      var doCopy = confirm(doCopyConfirmMessage);
      if (doCopy) {
        this.ProjectService.copyProject(projectId).then(function (projectId) {
          _this2.saveEvent('projectCopied', 'Authoring', null, projectId);

          // refresh the project list
          _this2.ConfigService.retrieveConfig(window.configURL).then(function () {
            _this2.projects = _this2.ConfigService.getConfigParam("projects");
            _this2.scrollToTopOfPage();

            // briefly highlight the new project to draw attention to it
            _this2.$timeout(function () {
              var componentElement = $("#" + projectId);

              // remember the original background color
              var originalBackgroundColor = componentElement.css("backgroundColor");

              // highlight the background briefly to draw attention to it
              componentElement.css("background-color", "#FFFF9C");

              /*
               * Use a timeout before starting to transition back to
               * the original background color. For some reason the
               * element won't get highlighted in the first place
               * unless this timeout is used.
               */
              _this2.$timeout(function () {
                // slowly fade back to original background color
                componentElement.css({
                  'transition': 'background-color 3s ease-in-out',
                  'background-color': originalBackgroundColor
                });

                /*
                 * remove these styling fields after we perform
                 * the fade otherwise the regular mouseover
                 * background color change will not work
                 */
                _this2.$timeout(function () {
                  componentElement.css({
                    'transition': '',
                    'background-color': ''
                  });
                }, 3000);
              });
            });
          });
        });
      }
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
        var projectJSONString = angular.toJson(this.project, 4);
        var commitMessage = this.$translate('projectCreatedOn') + new Date().getTime();
        this.ProjectService.registerNewProject(projectJSONString, commitMessage).then(function (projectId) {
          _this3.showCreateProjectView = false;
          _this3.saveEvent('projectCreated', 'Authoring', null, projectId);
          _this3.$state.go('root.project', { projectId: projectId });
        });
      }
    }
  }, {
    key: 'cancelRegisterNewProject',
    value: function cancelRegisterNewProject() {
      // clear the project template
      this.project = null;
      this.showCreateProjectView = false;
    }

    /**
     * Open a project in the authoring tool
     * @param projectId the project id to open
     */

  }, {
    key: 'openProject',
    value: function openProject(projectId) {
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
      window.open(this.ConfigService.getWISEBaseURL() + "/project/" + projectId);
    }

    /**
     * Send the user to the teacher home page
     */

  }, {
    key: 'goHome',
    value: function goHome() {
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

AuthoringToolMainController.$inject = ['$anchorScroll', '$filter', '$rootScope', '$state', '$timeout', 'ConfigService', 'ProjectService', 'TeacherDataService'];

exports.default = AuthoringToolMainController;
//# sourceMappingURL=authoringToolMainController.js.map
