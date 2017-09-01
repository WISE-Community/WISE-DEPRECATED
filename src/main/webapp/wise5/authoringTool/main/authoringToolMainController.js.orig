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

        // get list of projects owned by this user and shared with this
        this.projects = this.ConfigService.getConfigParam("projects");
        this.sharedProjects = this.ConfigService.getConfigParam("sharedProjects");

        this.showCreateProjectView = false;

        this.$rootScope.$on('goHome', function () {
            // save the go to teacher home event to the server
            _this.saveEvent('goToTeacherHome', 'Navigation', null, null);
        });

        this.$rootScope.$on('logOut', function () {
            // save the log out event to the server
            _this.saveEvent('logOut', 'Navigation', null, null);
        });
    }

    /**
     * Get a project by project id
     * @param projectId the project id
     * @return the project object that just contains the name and id and run id
     * if it is associated with a run
     */


    _createClass(AuthoringToolMainController, [{
        key: 'getProjectByProjectId',
        value: function getProjectByProjectId(projectId) {

            // loop through all my projects
            for (var p = 0; p < this.projects.length; p++) {
                var project = this.projects[p];

                if (project != null) {
                    if (project.id == projectId) {
                        // we have found the project we want
                        return project;
                    }
                }
            }

            // loop through all the shared projects
            for (var sp = 0; sp < this.sharedProjects.length; sp++) {
                var sharedProject = this.sharedProjects[sp];

                if (sharedProject != null) {
                    if (sharedProject.id == projectId) {
                        // we have found the project we want
                        return sharedProject;
                    }
                }
            }

            return null;
        }

        /**
         * Copy a project
         * @param projectId the project to copy
         */

    }, {
        key: 'copyProject',
        value: function copyProject(projectId) {
            var _this2 = this;

            // get the project info
            var project = this.getProjectByProjectId(projectId);

            // get the project name
            var projectName = project.name;

            // get the project run id if any
            var projectRunId = project.runId;

            // get the project info that we will display in the confirm message
            var projectInfo = projectId + ' ' + projectName;

            if (projectRunId != null) {
                // add the run id to the info
                projectInfo += ' (Run ID: ' + projectRunId + ')';
            }

            /*
             * the message that we will use to confirm that the author wants to copy
             * the project
             */
            var message = this.$translate('areYouSureYouWantToCopyThisProject') + '\n\n' + projectInfo;

            var answer = confirm(message);

            if (answer) {
                // the author answered yes they want to copy

                // copy the project
                this.ProjectService.copyProject(projectId).then(function (projectId) {

                    // save the project copied event to the server
                    _this2.saveEvent('projectCopied', 'Authoring', null, projectId);

                    // refresh the project list
                    var configURL = window.configURL;
                    _this2.ConfigService.retrieveConfig(configURL).then(function () {
                        _this2.projects = _this2.ConfigService.getConfigParam("projects");

                        // scroll to the top of the page
                        _this2.$anchorScroll('top');

                        // briefly highlight the new project to draw attention to it
                        _this2.$timeout(function () {

                            // get the component UI element
                            var componentElement = $("#" + projectId);

                            // save the original background color
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

        /**
         * Download a project as a zip file
         * @param projectId the project id
         */

    }, {
        key: 'downloadProject',
        value: function downloadProject(projectId) {

            // save the project downloaded event to the server
            this.saveEvent('projectDownloaded', 'Authoring', null, projectId);

            // make a request to download the project as a zip file
            var exportProjectURL = this.ConfigService.getWISEBaseURL() + "/project/export/" + projectId;
            window.location.href = exportProjectURL;
        }

        /**
         * The create new project button was clicked
         */

    }, {
        key: 'createNewProjectButtonClicked',
        value: function createNewProjectButtonClicked() {
            // generate a project template for the new project
            this.project = this.ProjectService.getNewProjectTemplate();

            // show the view where the author enters the title for the new project
            this.showCreateProjectView = true;

            /*
             * we are showing the create project view so we will give focus to the
             * newProjectTitle input element
             */
            this.$timeout(function () {
                var createGroupTitleInput = document.getElementById('newProjectTitle');

                if (createGroupTitleInput != null) {
                    createGroupTitleInput.focus();
                }
            });
        }

        /**
         * Create a new project
         */

    }, {
        key: 'registerNewProject',
        value: function registerNewProject() {
            var _this3 = this;

            // get the project title the author has entered
            var projectTitle = this.project.metadata.title;

            if (projectTitle == null || projectTitle == '') {
                // the author has not entered a project title
                alert(this.$translate('pleaseEnterAProjectTitleForYourNewProject'));
            } else {
                // the author has entered a project title

                // get the project json string
                var projectJSONString = angular.toJson(this.project, 4);
                var commitMessage = this.$translate('projectCreatedOn') + new Date().getTime();

                // create the new project on the server
                this.ProjectService.registerNewProject(projectJSONString, commitMessage).then(function (projectId) {
                    // hide the create project view
                    _this3.showCreateProjectView = false;

                    // save the project created event to the server
                    _this3.saveEvent('projectCreated', 'Authoring', null, projectId);

                    // open the new project in the authoring tool
                    _this3.$state.go('root.project', { projectId: projectId });
                });
            }
        }

        /**
         * Cancel the create new project
         */

    }, {
        key: 'cancelRegisterNewProject',
        value: function cancelRegisterNewProject() {
            // clear the project template
            this.project = null;

            // hide the create project view
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
         * Launch the project in preview mode
         */

    }, {
        key: 'previewProject',
        value: function previewProject(projectId) {

            var data = {};
            data.constraints = true;

            // save the project previewed event
            this.saveEvent('projectPreviewed', 'Authoring', data, projectId);

            var previewProjectURL = this.ConfigService.getWISEBaseURL() + "/project/" + projectId;
            window.open(previewProjectURL);
        }

        /**
         * Go to the teacher home
         */

    }, {
        key: 'goHome',
        value: function goHome() {

            // send the user to the teacher home page
            var wiseBaseURL = this.ConfigService.getWISEBaseURL();
            var teacherHomePageURL = wiseBaseURL + '/teacher';
            window.location = teacherHomePageURL;
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

            // save the event to the server
            this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, eventName, data, projectId);
        }
    }]);

    return AuthoringToolMainController;
}();

;

AuthoringToolMainController.$inject = ['$anchorScroll', '$filter', '$rootScope', '$state', '$timeout', 'ConfigService', 'ProjectService', 'TeacherDataService'];

exports.default = AuthoringToolMainController;
//# sourceMappingURL=authoringToolMainController.js.map