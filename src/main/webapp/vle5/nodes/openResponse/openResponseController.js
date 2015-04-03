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
        this.autoSaveInterval = 10000; // auto-save interval in milliseconds
        this.nodeContent = null;
        this.nodeId = null;
        this.studentResponse = null;
        this.isDisabled = false;
        this.isDirty = false;
        
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
        
        this.saveStudentState = function(saveTriggeredBy) {
            if (saveTriggeredBy != null) {
                var studentState = {};
                studentState.response = this.studentResponse;
                studentState.saveTriggeredBy = saveTriggeredBy;
                studentState.timestamp = Date.parse(new Date());
                if (saveTriggeredBy === 'submitButton') {
                    studentState.isSubmit = true;
                }
                StudentDataService.addNodeStateToLatestNodeVisit(this.nodeId, studentState);
                
                this.calculateDisabled();
                this.isDirty = false;
            }
        };
        
        this.saveButtonClicked = function() {
            var saveTriggeredBy = 'saveButton';
            this.saveStudentState(saveTriggeredBy);
        };
        
        this.submitButtonClicked = function() {
            var saveTriggeredBy = 'submitButton';
            this.saveStudentState(saveTriggeredBy);
        };
        
        this.studentResponseChanged = function() {
            this.isDirty = true;
        };
        
        var nodeSrc = ProjectService.getNodeSrcByNodeId(this.nodeId);

        NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
            this.nodeContent = nodeContent;
            var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
            
            this.setStudentWork(nodeState);
            this.importWork();
            
            $scope.$parent.nodeController.nodeLoaded(this.nodeId);
        }));
        
        this.setStudentWork = function(nodeState) {
            if (nodeState != null) {
                var response = nodeState.response;
                this.studentResponse = response;
            }
        };
        
        $scope.$on('nodeOnExit', angular.bind(this, function(event, args) {
            var nodeToExit = args.nodeToExit;
            if (nodeToExit.id === this.nodeId) {
                // save and cancel autoSave interval
                var saveTriggeredBy = 'nodeOnExit';
                this.saveStudentState(saveTriggeredBy);
                clearInterval(this.autoSaveIntervalId);
                $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
            }
        }));
        
        // auto-save
        this.autoSaveIntervalId = setInterval(angular.bind(this, function() {
            if (this.isDirty) {
                var saveTriggeredBy = 'autoSave';
                this.saveStudentState(saveTriggeredBy);
            }
        }), this.autoSaveInterval);
        
        this.importWork = function() {
            var nodeContent = this.nodeContent;
            
            if (nodeContent != null) {
                var importWork = nodeContent.importWork;
                
                if (importWork != null) {
                    var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                    
                    if(nodeState == null) {
                        var importWorkNodeId = importWork.nodeId;
                        
                        if (importWorkNodeId != null) {
                            var importWorkNode = ProjectService.getNodeById(importWorkNodeId);
                            
                            if (importWorkNode != null) {
                                var importWorkNodeType = importWorkNode.type;
                                
                                var importWorkNodeState = StudentDataService.getLatestNodeStateByNodeId(importWorkNodeId);
                                
                                var populatedNodeState = OpenResponseService.populateNodeState(importWorkNodeState, importWorkNodeType);
                                
                                this.setStudentWork(populatedNodeState);
                            }
                        }
                    }
                }
            }
        };
    });
});