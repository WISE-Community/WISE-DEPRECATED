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

    downloadProject(projectId) {
        let exportProjectURL = this.ConfigService.getWISEBaseURL() + "/project/export/" + projectId;
        window.location.href = exportProjectURL;
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
    }

    goHome() {
        // send the user to the teacher home page
        let wiseBaseURL = this.ConfigService.getWISEBaseURL();
        let teacherHomePageURL = wiseBaseURL + '/teacher';
        window.location = teacherHomePageURL;
    }
};

AuthoringToolMainController.$inject = ['$state', 'ConfigService', 'ProjectService'];

export default AuthoringToolMainController;