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
                    "startId": "group1",
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
            "startNodeId": "group0",
            "navigationMode": "guided",
            "layout": {
                "template": "starmap|leftNav|rightNav"
            },
            "metadata": {
                "title": "My New Project!"
            },
            "notebook": {
                "enabled": false,
                "label": "Notebook",
                "itemTypes": {
                    "note": {
                        "enabled": true,
                        "enableAddNote": true,
                        "enableClipping": true,
                        "enableStudentUploads": true,
                        "label": {
                            "singular": "note",
                            "plural": "notes",
                            "link": "Notes"
                        }
                    },
                    "question": {
                        "enabled": false,
                        "label": {
                            "singular": "question",
                            "plural": "questions",
                            "link": "Questions"
                        }
                    },
                    "report": {
                        "enabled": false,
                        "label": {
                            "singular": "report",
                            "plural": "reports",
                            "link": "Report"
                        },
                        "notes": [
                            {
                                "reportId": "finalReport",
                                "title": "Final Report",
                                "description": "Final summary report of what you learned in this project",
                                "prompt": "Use this space to write your final report using evidence from your notebook.",
                                "content": "<h3>This is a heading</h3><p>This is a paragraph.</p>"
                            }
                        ]
                    }
                }
            },
            "inactiveGroups": [],
            "inactiveNodes": []
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

    cancelRegisterNewProject() {
        this.$state.go('root.main');
    }
};

AuthoringToolNewProjectController.$inject = ['$state', 'ConfigService', 'ProjectService'];

export default AuthoringToolNewProjectController;