define(['app'], function(app) {
    app.$controllerProvider.register('MultipleChoiceController', 
            function($scope, 
                    $state, 
                    $stateParams, 
                    ConfigService,
                    NodeService,
                    ProjectService, 
                    StudentDataService) {
        
        this.nodeId = $stateParams.nodeId;
        this.studentResponse = "my response";
        
        this.saveButtonClicked = function() {
            var studentData = {'response': this.studentResponse};
            
            StudentDataService.addNodeStateToLatestNodeVisit(this.nodeId, studentData);
        };

        this.message = 'message from multipleChoiceController';
    });
});