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
        console.log('OpenResponseController');
        this.nodeContent = null;
        this.nodeId = $stateParams.nodeId;
        this.studentResponse = "my response";
        this.isDisabled = false;
        
        console.log('openResponseController.js nodeId: ' + this.nodeId);
        
        $scope.$watch(function() {
                return $scope.$parent.nodeController.nodeContent;
            }, angular.bind(this, function(newNodeContent, oldNodeContent) {
                console.log('openRepsponseController.js nodeContent changed');
                if (newNodeContent != null) {
                    this.nodeContent = newNodeContent;
                    this.calculateDisabled();
                    $scope.$parent.nodeController.nodeLoaded(this.nodeId);
                }
        }));
        
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
            console.log('save clicked. studentResponse: ' + this.studentResponse);
            
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