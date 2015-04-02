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
        this.nodeId = null;
        this.studentResponse = "my response";
        this.isDisabled = false;
        
        var currentNode = StudentDataService.getCurrentNode();
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        }
        
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

        
        var nodeSrc = ProjectService.getNodeSrcByNodeId(this.nodeId);

        NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
            this.nodeContent = nodeContent;
            var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
            
            if (nodeState != null) {
                var response = nodeState.response;
                this.studentResponse = response;
            }
            
            $scope.$parent.nodeController.nodeLoaded(this.nodeId);
        }));
    });
});