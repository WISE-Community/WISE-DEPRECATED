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
        
        $scope.$watch(function() {
                return $scope.$parent.nodeController.nodeContent;
            }, angular.bind(this, function(newNodeContent, oldNodeContent) {
                if (newNodeContent != null) {
                    this.prompt = newNodeContent.prompt;
                    this.title = newNodeContent.title;
                    $scope.$parent.nodeController.nodeLoaded(this.nodeId);
                }
        }));
        
        this.saveButtonClicked = function() {
            var studentData = {'response': this.studentResponse};
            
            StudentDataService.addNodeStateToLatestNodeVisit(this.nodeId, studentData);
        };

        this.message = 'message from multipleChoiceController';
        
        //this.nodeLoaded = function() {
        //    $scope.$parent.nodeController.nodeLoaded(this.nodeId);
        //}
    });
});