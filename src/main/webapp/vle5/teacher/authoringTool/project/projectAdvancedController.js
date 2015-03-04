define(['app'], function(app) {
    app.$controllerProvider.register('ProjectAdvancedController',
        function($scope, ProjectService) {
            this.project = ProjectService.getProject();
        
            $('#projectContentJSON').html(JSON.stringify(this.project, null, 4));
            $('#projectContentJSON').keyup(function() {
                this.projectContentIsDirty = true;
                $('#saveProjectContentButton').attr('disabled', false);
            });
            
            $('#saveProjectContentButton').click(function() {
                var projectContentJSON = $('#projectContentJSON').val();
                
                // TODO: implement http POST to authoringToolEndPointURL 
                $('#saveProjectContentButton').attr('disabled', true);
                this.projectContentIsDirty = false;
    
                /*
                var callback = function() {
                    $('#saveProjectContentButton').attr('disabled', true);
                    this.projectContentIsDirty = false;
                };
                var callbackArgs = {};
                saveProjectContent(projectContentJSON, callback, callbackArgs);
                */
            });
        });
});