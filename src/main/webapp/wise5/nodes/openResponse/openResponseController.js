define(['app'], function(app) {
    app.$controllerProvider.register('OpenResponseController', 
            function($scope,
                    $rootScope,
                    $state, 
                    $stateParams, 
                    ConfigService,
                    CurrentNodeService,
                    NodeService,
                    OpenResponseService,
                    ProjectService,
                    SessionService,
                    StudentAssetService,
                    StudentDataService) {
        this.autoSaveInterval = 10000; // auto-save interval in milliseconds
        this.nodeContent = null;
        this.nodeId = null;
        this.studentResponse = null;
        this.isDisabled = false;
        this.isDirty = false;
        
        var currentNode = CurrentNodeService.getCurrentNode();
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
        
        this.addNodeState = function(saveTriggeredBy) {
            if (saveTriggeredBy != null) {
                if (saveTriggeredBy === 'submitButton' || 
                        (saveTriggeredBy = 'saveButton' && this.isDirty) || 
                        (saveTriggeredBy = 'autoSave' && this.isDirty)) {
                    var studentState = {};
                    studentState.response = this.studentResponse;
                    studentState.saveTriggeredBy = saveTriggeredBy;
                    studentState.timestamp = Date.parse(new Date());
                    if (saveTriggeredBy === 'submitButton') {
                        studentState.isSubmit = true;
                    } 
                    
                    $scope.$parent.nodeController.addNodeStateToLatestNodeVisit(this.nodeId, studentState);
                }
            }
        }
        
        this.saveNodeVisitToServer = function() {
            $scope.$parent.nodeController.saveNodeVisitToServer(this.nodeId).then(angular.bind(this, function() {
                this.calculateDisabled();
                this.isDirty = false;
            }));;
        };
        
        this.saveButtonClicked = function() {
            var saveTriggeredBy = 'saveButton';
            
            // add the node state to the node visit
            this.addNodeState(saveTriggeredBy);
            
            // save the node visit to the server
            this.saveNodeVisitToServer();
        };
        
        this.submitButtonClicked = function() {
            var saveTriggeredBy = 'submitButton';
            
            // add the node state to the node visit
            this.addNodeState(saveTriggeredBy);
            
            // save the node visit to the server
            this.saveNodeVisitToServer();
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
            
            $scope.$parent.nodeController.nodeLoaded(this, this.nodeId);
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
                
                this.addNodeState(saveTriggeredBy);
                clearInterval(this.autoSaveIntervalId);
                $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
            }
        }));
        
        this.handleLogOut = function() {
            // add node state
            
            // tell VLE to save
        };
        
        this.logOutListener = $scope.$on('logOut', angular.bind(this, function(event, args) {
            console.log('logOut openResponseController this.nodeId: ' + this.nodeId);
            
            var saveTriggeredBy = 'logOut';
            
            this.addNodeState(saveTriggeredBy);
            clearInterval(this.autoSaveIntervalId);
            
            $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
            
            this.logOutListener();
            SessionService.logOut();
        }));
        
        // auto-save
        this.autoSaveIntervalId = setInterval(angular.bind(this, function() {
            var saveTriggeredBy = 'autoSave';
            
            // add the node state to the node visit
            this.addNodeState(saveTriggeredBy);
            
            // save the node visit to the server
            this.saveNodeVisitToServer();
            
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
            
            var objectType = $(ui.helper.context).data('objectType');
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
            } else if (objectType === 'StudentAsset') {
                var studentAsset = $(ui.helper.context).data('objectData');
                StudentAssetService.copyAssetForReference(studentAsset).then(angular.bind(this, function(copiedAssetURL) {
                    if (copiedAssetURL != null && copiedAssetURL != '') {
                        var nodeState = StudentDataService.createNodeState();
                        var copiedAssetImg = '<img class="studentAssetReference" src="' + copiedAssetURL + '"></img>';
                        // if student already has work, prepend it
                        var latestNodeState = null;
                        
                        if (this.isDirty) {
                            // if student has edited but not saved yet, append student asset to the unsaved work
                            var studentState = {};
                            studentState.response = this.studentResponse;
                            studentState.timestamp = Date.parse(new Date());
                            latestNodeState = studentState;
                        } else {
                            latestNodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);                            
                        }
                        
                        if (latestNodeState != null && latestNodeState.response != null) {
                            nodeState.response = latestNodeState.response + copiedAssetImg;
                        } else {
                            nodeState.response = copiedAssetImg;
                        }
                        this.setStudentWork(nodeState);
                        this.studentResponseChanged()
                    }
                }));
            }
        });
    });
});