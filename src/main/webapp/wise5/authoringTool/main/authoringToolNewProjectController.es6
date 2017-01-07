'use strict';

class AuthoringToolNewProjectController {

    constructor($state,
                $timeout,
                ConfigService,
                ProjectService) {
        this.$state = $state;
        this.$timeout = $timeout;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;

        this.project = this.ProjectService.getNewProjectTemplate();

        /*
         * we are showing the create new project view so we will give focus to
         * the newProjectTitle input element
         */
        this.$timeout(() => {
            var newProjectTitleInput = document.getElementById('newProjectTitle');

            if (newProjectTitleInput != null) {
                newProjectTitleInput.focus();
            }
        });
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

AuthoringToolNewProjectController.$inject = [
    '$state',
    '$timeout',
    'ConfigService',
    'ProjectService'
];

export default AuthoringToolNewProjectController;
