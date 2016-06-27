'use strict';

class AuthoringToolMainController {

    constructor($state, ConfigService, ProjectService) {
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;

        // get list of projects owned by this user and shared with this
        this.projects = this.ConfigService.getConfigParam("projects");
        this.sharedProjects = this.ConfigService.getConfigParam("sharedProjects");
    }

    copyProject(projectId) {
        this.ProjectService.copyProject(projectId).then((projectId) => {
            // refresh the project list
            var configURL = window.configURL;
            this.ConfigService.retrieveConfig(configURL).then(() => {
                this.projects = this.ConfigService.getConfigParam("projects");
            });
        });
    }

    createNewProject() {
        this.$state.go('root.new');
    }

    openProject(projectId) {
        this.$state.go('root.project', {projectId:projectId});
    }

    /**
     * Launch the project in preview mode
     */
    previewProject(projectId) {
        let previewProjectURL = this.ConfigService.getWISEBaseURL() + "/project/" + projectId;
        window.open(previewProjectURL);
    };
};

AuthoringToolMainController.$inject = ['$state', 'ConfigService', 'ProjectService'];

export default AuthoringToolMainController;