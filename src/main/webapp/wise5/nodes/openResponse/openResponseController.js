define(['app'], function(app) {
    app.$controllerProvider.register('OpenResponseController', 
            function($scope,
                    $rootScope,
                    $state, 
                    $stateParams, 
                    ConfigService,
                    NodeService,
                    OpenResponseService,
                    ProjectService,
                    SessionService,
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
        
        this.saveStudentWork = function(saveTriggeredBy) {
            if (saveTriggeredBy != null) {
                var doSave = false;
                if (saveTriggeredBy === 'nodeOnExit') {
                    StudentDataService.endNodeVisitByNodeId(this.nodeId);
                    doSave = true;
                }
                
                if (saveTriggeredBy === 'submitButton' || this.isDirty) {
                    var studentState = {};
                    studentState.response = this.studentResponse;
                    studentState.saveTriggeredBy = saveTriggeredBy;
                    studentState.timestamp = Date.parse(new Date());
                    if (saveTriggeredBy === 'submitButton') {
                        studentState.isSubmit = true;
                    } 
                    
                    StudentDataService.addNodeStateToLatestNodeVisit(this.nodeId, studentState);
                    doSave = true;
                }
                
                if (doSave) {
                    var nodeVisit = StudentDataService.getLatestNodeVisitByNodeId(this.nodeId);
                    return StudentDataService.saveNodeVisitToServer(nodeVisit).then(angular.bind(this, function() {
                                this.calculateDisabled();
                                this.isDirty = false;
                            }));
                }
            }
        };
        
        this.saveButtonClicked = function() {
                var saveTriggeredBy = 'saveButton';
                this.saveStudentWork(saveTriggeredBy);
        };
        
        this.submitButtonClicked = function() {
            var saveTriggeredBy = 'submitButton';
            this.saveStudentWork(saveTriggeredBy);
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
                this.calculateDisabled();
            }
        };
        
        $scope.$on('nodeOnExit', angular.bind(this, function(event, args) {
            var nodeToExit = args.nodeToExit;
            if (nodeToExit.id === this.nodeId) {
                // save and cancel autoSave interval
                var saveTriggeredBy = 'nodeOnExit';
                this.saveStudentWork(saveTriggeredBy).then(angular.bind(this, function() {
                    clearInterval(this.autoSaveIntervalId);
                    $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
                }));
            }
        }));
        
        this.logOutListener = $scope.$on('logOut', angular.bind(this, function(event, args) {
            console.log('logOut openResponseController this.nodeId: ' + this.nodeId);
            
            var saveTriggeredBy = 'logOut';
            this.saveStudentWork(saveTriggeredBy).then(angular.bind(this, function() {
                clearInterval(this.autoSaveIntervalId);
                this.logOutListener();
                SessionService.logOut();
            }));
        }));
        
        // auto-save
        this.autoSaveIntervalId = setInterval(angular.bind(this, function() {
            var saveTriggeredBy = 'autoSave';
            this.saveStudentWork(saveTriggeredBy);
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
        
        this.startCallback = function(event, ui, title) {
            console.log('You started dragging');
        };
        
        this.dropCallback = angular.bind(this, function(event, ui, title, $index) {
            if (this.isDisabled) {
                // don't import if step is disabled/locked
                return;
            }
            
            var importWorkNodeState = $(ui.helper.context).data('importWorkNodeState');
            var importWorkNodeType = $(ui.helper.context).data('importWorkNodeType');
            var importPortfolioItem = $(ui.helper.context).data('importPortfolioItem');
            if (importPortfolioItem != null) {
                var nodeId = importPortfolioItem.nodeId;
                var node = ProjectService.getNodeById(nodeId);
                importWorkNodeType = node.type;

                var nodeVisit = importPortfolioItem.nodeVisit;
                var nodeStates = nodeVisit.nodeStates;
                if (nodeStates !== null) {
                    if (nodeStates.length > 0) {
                        importWorkNodeState = nodeStates[nodeStates.length - 1];
                    }
                }
                
            }
            if (importWorkNodeState != null && importWorkNodeType != null) {
                var populatedNodeState = OpenResponseService.populateNodeState(importWorkNodeState, importWorkNodeType);

                // if student already has work, prepend it
                var latestNodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                if (latestNodeState != null) {
                    var latestResponse = latestNodeState.response;
                    if (latestResponse != null) {
                        populatedNodeState.response = latestResponse + populatedNodeState.response;
                    }
                }
                
                this.setStudentWork(populatedNodeState);
                this.studentResponseChanged()
            } 
        });
    });
});