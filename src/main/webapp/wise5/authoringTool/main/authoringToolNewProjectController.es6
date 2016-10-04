'use strict';

class AuthoringToolNewProjectController {

    constructor($state, ConfigService, ProjectService) {
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;

        this.project = this.ProjectService.getNewProjectTemplate();
    }

    registerNewProject() {
        var projectJSONString = angular.toJson(this.project, 4);
        var commitMessage = "Project created on " + new Date().getTime();
        this.ProjectService.registerNewProject(projectJSONString, commitMessage).then((projectId) => {
            this.$state.go('root.project', {projectId: projectId});
        });
    }

    cancelRegisterNewProject() {
        this.$state.go('root.main');
    }
}

AuthoringToolNewProjectController.$inject = ['$state', 'ConfigService', 'ProjectService'];

export default AuthoringToolNewProjectController;