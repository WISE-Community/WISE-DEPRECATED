define(['app'], function(app) {
    app
    .$controllerProvider
    .register('ProjectController', ['$state', '$stateParams', 'ProjectService', 'ConfigService',
                                    function($state, $stateParams, ProjectService, ConfigService) {

        this.title = "project controller title";

        this.project = ProjectService.getProject();

        this.nodeIds = ProjectService.getFlattenedProjectAsNodeIds();

        this.previewProject = function() {
            var previewProjectURL = ConfigService.getConfigParam("previewProjectURL");
            window.open(previewProjectURL);
        };

        this.saveProject = function() {
            var projectJSONString = $("#project").val();
            var commitMessage = $("#commitMessageInput").val();
            try {
                // if projectJSONString is bad json, it will throw an exception and not save.
                JSON.parse(projectJSONString);

                ProjectService.saveProject(projectJSONString, commitMessage).then(angular.bind(this, function(commitHistoryArray) {
                    this.commitHistory = commitHistoryArray;
                    $("#commitMessageInput").val("");  // clear field after commit
                }));
            } catch (error) {
                alert("Invalid JSON. Please check syntax. Aborting save.");
                return;
            }
        };

        this.showCommitHistory = function() {
            ProjectService.getCommitHistory().then(angular.bind(this, function (commitHistoryArray) {
                this.commitHistory = commitHistoryArray;
            }));
        }

        this.showCommitHistory();

    }]);
});