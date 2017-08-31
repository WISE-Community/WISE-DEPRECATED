'use strict';

class AuthoringToolMainController {

    constructor($anchorScroll, $filter, $state, $timeout, ConfigService, ProjectService) {
        this.$anchorScroll = $anchorScroll;
        this.$filter = $filter;
        this.$state = $state;
        this.$timeout = $timeout;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;

        this.$translate = this.$filter('translate');

        // get list of projects owned by this user and shared with this
        this.projects = this.ConfigService.getConfigParam("projects");
        this.sharedProjects = this.ConfigService.getConfigParam("sharedProjects");

        this.showCreateProjectView = false;
    }

    /**
     * Get a project by project id
     * @param projectId the project id
     * @return the project object that just contains the name and id and run id
     * if it is associated with a run
     */
    getProjectByProjectId(projectId) {

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
    copyProject(projectId) {

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
            this.ProjectService.copyProject(projectId).then((projectId) => {

                // refresh the project list
                var configURL = window.configURL;
                this.ConfigService.retrieveConfig(configURL).then(() => {
                    this.projects = this.ConfigService.getConfigParam("projects");

                    // scroll to the top of the page
                    this.$anchorScroll('top');

                    // briefly highlight the new project to draw attention to it
                    this.$timeout(() => {

                        // get the component UI element
                        let componentElement = $("#" + projectId);

                        // save the original background color
                        let originalBackgroundColor = componentElement.css("backgroundColor");

                        // highlight the background briefly to draw attention to it
                        componentElement.css("background-color", "#FFFF9C");

                        /*
                         * Use a timeout before starting to transition back to
                         * the original background color. For some reason the
                         * element won't get highlighted in the first place
                         * unless this timeout is used.
                         */
                        this.$timeout(() => {
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
                            this.$timeout(() => {
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
     * The create new project button was clicked
     */
    createNewProjectButtonClicked() {
        // generate a project template for the new project
        this.project = this.ProjectService.getNewProjectTemplate();

        // show the view where the author enters the title for the new project
        this.showCreateProjectView = true;

        /*
         * we are showing the create project view so we will give focus to the
         * newProjectTitle input element
         */
        this.$timeout(() => {
            var createGroupTitleInput = document.getElementById('newProjectTitle');

            if (createGroupTitleInput != null) {
                createGroupTitleInput.focus();
            }
        });
    }

    /**
     * Create a new project
     */
    registerNewProject() {

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
            this.ProjectService.registerNewProject(projectJSONString, commitMessage).then((projectId) => {
                // hide the create project view
                this.showCreateProjectView = false;

                // open the new project in the authoring tool
                this.$state.go('root.project', {projectId: projectId});
            });
        }
    }

    /**
     * Cancel the create new project
     */
    cancelRegisterNewProject() {
        // clear the project template
        this.project = null;

        // hide the create project view
        this.showCreateProjectView = false;
    }

    /**
     * Open a project in the authoring tool
     * @param projectId the project id to open
     */
    openProject(projectId) {
        this.$state.go('root.project', {projectId:projectId});
    }

    /**
     * Launch the project in preview mode
     */
    previewProject(projectId) {
        let previewProjectURL = this.ConfigService.getWISEBaseURL() + "/project/" + projectId;
        window.open(previewProjectURL);
    }

    /**
     * Go to the teacher home
     */
    goHome() {
        // send the user to the teacher home page
        let wiseBaseURL = this.ConfigService.getWISEBaseURL();
        let teacherHomePageURL = wiseBaseURL + '/teacher';
        window.location = teacherHomePageURL;
    }
};

AuthoringToolMainController.$inject = [
    '$anchorScroll',
    '$filter',
    '$state',
    '$timeout',
    'ConfigService',
    'ProjectService'
];

export default AuthoringToolMainController;
