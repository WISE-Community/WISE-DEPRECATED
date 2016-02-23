'use strict';

class AuthoringToolNewProjectController {

    constructor($state, ConfigService, ProjectService) {
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;

        this.newProjectTemplate1 =
        {
            "nodes": [
                {
                    "id": "group0",
                    "type": "group",
                    "title": "Master",
                    "startId": "",
                    "ids": [
                        "group1"
                    ]
                },
                {
                    "id": "group1",
                    "type": "group",
                    "title": "First Activity",
                    "startId": "",
                    "ids": [
                    ],
                    "icons": {
                        "default": {
                            "color": "#2196F3",
                            "type": "font",
                            "fontSet": "material-icons",
                            "fontName": "info"
                        }
                    }
                }
            ],
            "constraints": [],
            "startGroupId": "group0",
            "startNodeId": "node1",
            "navigationMode": "guided",
            "layout": {
                "template": "starmap|leftNav|rightNav"
            },
            "metadata": {
                "title": "My New Project!"
            }
        };

        this.project = this.newProjectTemplate1;
    }

    registerNewProject() {
        var projectJSONString = angular.toJson(this.project, 4);
        var commitMessage = "Project created on " + new Date().getTime();
        this.ProjectService.registerNewProject(projectJSONString, commitMessage).then((projectId) => {
            this.$state.go('root.project', {projectId: projectId});
        });
    }
};

AuthoringToolNewProjectController.$inject = ['$state', 'ConfigService', 'ProjectService'];

export default AuthoringToolNewProjectController;