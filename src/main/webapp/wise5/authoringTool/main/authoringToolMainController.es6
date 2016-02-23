'use strict';

class AuthoringToolMainController {

    constructor($state, ConfigService) {
        this.ConfigService = ConfigService;
        this.$state = $state;

        // get list of projects owned by this user
        this.projects = this.ConfigService.getConfigParam("projects");
    }

    createNewProject() {
        this.$state.go('root.new');
    }

    openProject(projectId) {
        this.$state.go('root.project', {projectId:projectId});
    }
};

AuthoringToolMainController.$inject = ['$state', 'ConfigService'];

export default AuthoringToolMainController;