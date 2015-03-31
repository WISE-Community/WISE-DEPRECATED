define(['app'], function(app) {
    app.$controllerProvider.register('OpenResponseController', 
            function($scope, 
                    $state, 
                    $stateParams, 
                    ConfigService,
                    NodeService,
                    OpenResponseService,
                    ProjectService, 
                    StudentDataService) {
        this.nodeContent = null;
        this.nodeId = $stateParams.nodeId;
        this.studentResponse = "my response";
        this.isDisabled = false;
        
        console.log('OpenResponseController ooooooooooooooooooooo');
        
        /*
        $scope.$watch(function() {
            console.log('openResponseController: Checking nodeContent');
                return $scope.$parent.nodeController.nodeContent;
            }, angular.bind(this, function(newNodeContent, oldNodeContent) {
                console.log('openResponseController: nodeContent changed cccccccccccc');
                if (newNodeContent != null) {
                    console.log('openResponseController: different');
                    this.nodeContent = newNodeContent;
                    this.calculateDisabled();
                    $scope.$parent.nodeController.nodeLoaded(this.nodeId);
                } else {
                    console.log('openResponseController: same');
                }
        }));
        */
        
        this.nodeContent = $scope.$parent.nodeController.nodeContent;
        $scope.$parent.nodeController.nodeLoaded(this.nodeId);
        
        this.calculateDisabled = function() {
            var nodeContent = this.nodeContent;
            var nodeId = this.nodeId;
            
            if (nodeContent) {
                var lockAfterSubmit = nodeContent.lockAfterSubmit;
                
                if (lockAfterSubmit) {
                    var nodeVisits = StudentDataService.getNodeVisitsByNodeId(nodeId);
                    var isSubmitted = OpenResponseService.isWorkSubmitted(nodeVisits);
                    
                    if (isSubmitted) {
                        this.isDisabled = true;
                    }
                }
            }
        };
        
        this.saveButtonClicked = function() {
            var studentData = {'response': this.studentResponse};
            
            StudentDataService.addNodeStateToLatestNodeVisit(this.nodeId, studentData);
            
            this.calculateDisabled();
        }
        
        this.submitButtonClicked = function() {
            var studentData = {};
            studentData.response = this.studentResponse;
            studentData.isSubmit = true;
            
            StudentDataService.addNodeStateToLatestNodeVisit(this.nodeId, studentData);
            
            this.calculateDisabled();
        };

    });
});