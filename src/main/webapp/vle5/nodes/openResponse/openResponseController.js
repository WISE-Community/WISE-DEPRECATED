define(['app'], function(app) {
    app.$controllerProvider.register('OpenResponseController', 
            function($scope, 
                    $state, 
                    $stateParams, 
                    ConfigService,
                    NodeService,
                    ProjectService, 
                    StudentDataService) {
        
        this.nodeId = $stateParams.nodeId;
        this.studentResponse = "my response";
        console.log('openResponseController.js nodeId: ' + this.nodeId);
        
        $scope.$watch(function() {
                return $scope.$parent.nodeController.nodeContent;
            }, angular.bind(this, function(newNodeContent, oldNodeContent) {
                console.log('nodeController.js nodeContent changed');
                if (newNodeContent != null) {
                    this.prompt = newNodeContent.prompt;
                    this.title = newNodeContent.title;
                    $scope.$parent.nodeController.nodeLoaded(this.nodeId);
                }
        }));
        
        this.saveButtonClicked = function() {
            console.log('save clicked. studentResponse: ' + this.studentResponse);
            
            var studentData = {'response': this.studentResponse};
            
            StudentDataService.addNodeStateToLatestNodeVisit(this.nodeId, studentData);
        }

        this.message = 'message from openResponseController';
        
        //this.nodeLoaded = function() {
        //    $scope.$parent.nodeController.nodeLoaded(this.nodeId);
        //}
        
        console.log('openResponseController');
    });
});