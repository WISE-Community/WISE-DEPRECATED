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
            try {
                var projectJSON = JSON.parse(projectJSONString);
                ProjectService.saveProject(projectJSON);
            } catch (error) {
                alert("JSON stringify failed. Check that JSON is valid");
                return;
            }
        };
    }]);
});