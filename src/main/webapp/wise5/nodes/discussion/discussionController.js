define(['app', 'angular'], function(app, angular) {
    app.$controllerProvider.register('DiscussionController', 
        function($rootScope,
            $scope,
            $state, 
            $stateParams,
            AnnotationService,
            ConfigService,
            CurrentNodeService,
            DiscussionService,
            NodeService,
            ProjectService,
            SessionService,
            StudentAssetService,
            StudentDataService) {
        
        // the node id of the current node
        this.nodeId = null;
        
        // field that will hold the node content
        this.nodeContent = null;
        
        // holds the text that the student has typed
        this.studentResponse = '';
        
        this.newResponse = '';
        
        // whether the step should be disabled
        this.isDisabled = false;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        // whether this is part of another node such as a Questionnaire node
        this.isNodePart = false;
        
        // whether this part is showing previous work
        this.isShowPreviousWork = false;
        
        // will hold the class responses
        this.classResponses = [];
        
        // the text that is being submitted
        this.submitText = null;
        
        // map from node visit id and node state id to response
        this.responsesMap = {};
        
        /**
         * Perform setup of the node
         */
        this.setup = function() {
            
            // get the current node and node id
            var currentNode = CurrentNodeService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }
            
            // the node is part of another node
            this.isNodePart = true;
            
            // set the content
            this.nodeContent = $scope.part;
            
            // get the show previous work node id if it is provided
            var showPreviousWorkNodeId = this.nodeContent.showPreviousWorkNodeId;
            
            if (showPreviousWorkNodeId != null) {
                // this part is showing previous work
                this.isShowPreviousWork = true;
                
                // get the node src for the node we want previous work from
                var nodeSrc = ProjectService.getNodeSrcByNodeId(showPreviousWorkNodeId);
                
                // get the show previous work part id if it is provided
                var showPreviousWorkPartId = this.nodeContent.showPreviousWorkPartId;
                
                // get the node content for the show previous work node
                NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(showPreviousWorkNodeContent) {
                    
                    var nodeState = StudentDataService.getLatestNodeStateByNodeId(showPreviousWorkNodeId);
                    
                    // check if we are show previous work from a part
                    if (showPreviousWorkPartId != null) {
                        // we are showing previous work from a part
                        
                        // get the part from the node content
                        this.nodeContent = NodeService.getNodeContentPartById(showPreviousWorkNodeContent, showPreviousWorkPartId);
                        
                        // get the part from the node state
                        nodeState = NodeService.getNodeStateByPartId(nodeState, showPreviousWorkPartId);
                    } else {
                        // set the show previous work node content
                        this.nodeContent = showPreviousWorkNodeContent;
                    }
                    
                    // populate the student work into this node
                    this.setStudentWork(nodeState);
                    
                    // disable the node since we are just showing previous work
                    this.isDisabled = true;
                    
                    // get the part
                    var part = $scope.part;
                    
                    /*
                     * register this node with the parent node which will most  
                     * likely be a Questionnaire node
                     */
                    $scope.$parent.registerPartController($scope, part);
                }));
            } else {
                // this is a node part
                
                if(ConfigService.isPreview()) {
                    // preview
                } else {
                    // run
                    
                    this.getClassmateResponses();
                }
                
                // get the latest node state
                var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                
                // populate the student work into this node
                this.setStudentWork(nodeState);
                
                // check if we need to lock this node
                this.calculateDisabled();
                
                // get the part
                var part = $scope.part;
                
                /*
                 * register this node with the parent node which will most  
                 * likely be a Questionnaire node
                 */
                $scope.$parent.registerPartController($scope, part);
            }
        };
        
        this.getClassmateResponses = function() {
            var runId = ConfigService.getRunId();
            var periodId = ConfigService.getPeriodId();
            var nodeId = this.nodeId;
            var includeSelf = true;
            var workgroupIds = ConfigService.getClassmateWorkgroupIds(includeSelf);
            
            DiscussionService.getClassmateResponses(runId, periodId, nodeId, workgroupIds).then(angular.bind(this, function(result) {
                this.setClassResponses(result);
            }));
        };
        
        /**
         * Populate the student work into the node
         * @param nodeState the node state to populate into the node
         */
        this.setStudentWork = function(nodeState) {
            
            /*
             * check if the part student data has been passed. this will be
             * used when the node is part of a Questionnaire node
             */
            if ($scope.partStudentData != null) {
                // set the part student data as the node state
                nodeState = $scope.partStudentData;
            }
            
            if (nodeState != null) {
                // populate the text the student previously typed
                this.studentResponse = nodeState.studentData;
            }
        };
        
        /**
         * Called when the student clicks the save button
         */
        this.saveButtonClicked = function() {
            
            // get the text from the top textarea
            this.studentResponse = this.newResponse;
            
            // get this part id
            var partId = this.getPartId();
            
            var saveTriggeredBy = 'saveButton';
            
            // create and add the node state to the node visit
            var nodeState = this.createAndAddNodeState(saveTriggeredBy);
            
            $scope.$emit('partSaveClicked', {partId: partId, nodeState: nodeState});
            
            /*
            var saveTriggeredBy = 'saveButton';
            
            // create and add the node state to the node visit
            var nodeState = this.createAndAddNodeState(saveTriggeredBy);
            
            // save the node visit to the server
            this.saveNodeVisitToServer().then(angular.bind(this, function(nodeState, nodeVisit) {
                // if this is a CRater step, score it
                this.makeCRaterRequest(nodeState, nodeVisit);
            }, nodeState));
            */
        };
        
        /**
         * Called when the student clicks the submit button
         */
        this.submitButtonClicked = function() {
            
            // get the text from the top textarea
            this.studentResponse = this.newResponse;
            this.newResponse = '';
            
            // get this part id
            var partId = this.getPartId();
            
            var saveTriggeredBy = 'submitButton';
            
            // create and add the node state to the node visit
            var nodeState = this.createAndAddNodeState(saveTriggeredBy);
            
            $scope.$emit('partSubmitClicked', {partId: partId, nodeState: nodeState});
            
            /*
            var saveTriggeredBy = 'submitButton';
            
            // create and add the node state to the node visit
            var nodeState = this.createAndAddNodeState(saveTriggeredBy);
            
            // save the node visit to the server
            this.saveNodeVisitToServer().then(angular.bind(this, function(nodeState, nodeVisit) {
                // if this is a CRater step, score it
                this.makeCRaterRequest(nodeState, nodeVisit);
            }, nodeState));
            */
        };
        
        /**
         * Called when the student changes their work
         */
        this.studentDataChanged = function() {
            /*
             * set the dirty flag so we will know we need to save the 
             * student work later
             */
            this.isDirty = true;
            
            if (this.isNodePart) {
                /*
                 * this step is a node part so we will tell its parent that
                 * the student work has changed and will need to be saved
                 */
                
                // get this part id
                var partId = this.getPartId();
                
                // create a node state populated with the student data
                var nodeState = this.createNodeState();
                
                /*
                 * this step is a node part so we will tell its parent that
                 * the student work has changed and will need to be saved.
                 * this will also notify connected parts that this part's
                 * student data has changed.
                 */
                $scope.$emit('partStudentDataChanged', {partId: partId, nodeState: nodeState});
            }
        };
        
        /**
         * Get the student response
         */
        this.getStudentResponse = function() {
            return this.studentResponse;
        };
        
        /**
         * Create a node state and add it to the latest node visit
         * @param saveTriggeredBy the reason why we are saving a new node state
         * e.g.
         * 'autoSave'
         * 'saveButton'
         * 'submitButton'
         * 'nodeOnExit'
         * 'logOut'
         * @return the node state
         */
        this.createAndAddNodeState = function(saveTriggeredBy) {
            
            var nodeState = null;
            
            /*
             * check if this node is part of another node such as a
             * Questionnaire node. if it is part of a Questionnaire node
             * we do not need to create a node state or save anything
             * since the parent Questionnaire node will handle that.
             */
            if (!this.isNodePart) {
                // this is a standalone node
                
                if (saveTriggeredBy != null) {
                    
                    /*
                     * check if the save was triggered by the submit button
                     * or if the student data is dirty
                     */
                    if (saveTriggeredBy === 'submitButton' || this.isDirty) {
                        
                        // create a node state populated with the student data
                        nodeState = this.createNodeState();
                        
                        nodeState.saveTriggeredBy = saveTriggeredBy;
                        
                        if (saveTriggeredBy === 'submitButton') {
                            nodeState.isSubmit = true;
                        } 
                        
                        // add the node state to the latest node visit
                        $scope.$parent.nodeController.addNodeStateToLatestNodeVisit(this.nodeId, nodeState);
                    }
                }
            }
            
            return nodeState;
        };
        
        /**
         * Create a new node state populated with the student data
         * @return the nodeState after it has been populated
         */
        this.createNodeState = function() {
            
            // create a new node state
            var nodeState = NodeService.createNewNodeState();
            
            // set the response into the node state
            nodeState.studentData = this.getStudentResponse();
            this.studentResponse = '';
            
            
            if (this.nodeVisitIdReplyingTo) {
                nodeState.nodeVisitIdReplyingTo = this.nodeVisitIdReplyingTo;
                this.nodeVisitIdReplyingTo = null;
            }
            
            if (this.nodeStateIdReplyingTo) {
                nodeState.nodeStateIdReplyingTo = this.nodeStateIdReplyingTo;
                this.nodeStateIdReplyingTo = null;
            }
            
            return nodeState;
        };
        
        /**
         * Save the node visit to the server
         */
        this.saveNodeVisitToServer = function() {
            // save the node visit to the server
            return $scope.$parent.nodeController.saveNodeVisitToServer(this.nodeId).then(angular.bind(this, function(nodeVisit) {
                
                // check if we need to lock this node
                this.calculateDisabled();
                
                /*
                 * set the isDirty flag to false because the student work has 
                 * been saved to the server
                 */
                this.isDirty = false;
            }));
        };
        
        /**
         * Check if we need to lock the node
         */
        this.calculateDisabled = function() {
            
            var nodeId = this.nodeId;
            
            // get the node content
            var nodeContent = this.nodeContent;
            
            if (nodeContent) {
                var lockAfterSubmit = nodeContent.lockAfterSubmit;
                
                if (lockAfterSubmit) {
                    // we need to lock the step after the student has submitted
                    
                    // get the node visits for the node
                    var nodeVisits = StudentDataService.getNodeVisitsByNodeId(nodeId);
                    
                    // check if the student has ever submitted work for this node
                    var isSubmitted = NodeService.isWorkSubmitted(nodeVisits);
                    
                    if (isSubmitted) {
                        // the student has submitted work for this node
                        this.isDisabled = true;
                    }
                }
            }
        };
        
        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        this.showSaveButton = function() {
            var show = false;
            
            // check if this is a node part
            if (!this.isNodePart) {
                // this is not a node part so we will show the save button
                show = true;
            }
            
            return show;
        };
        
        /**
         * Check whether we need to show the submit button
         * @return whether to show the submit button
         */
        this.showSubmitButton = function() {
            var show = false;
            
            if (this.nodeContent != null) {
                
                // check the showSubmitButton field in the node content
                if (this.nodeContent.showSubmitButton) {
                    show = true;
                }
            }
            
            return show;
        };
        
        /**
         * Start the auto save interval for this node
         */
        this.startAutoSaveInterval = function() {
            this.autoSaveIntervalId = setInterval(angular.bind(this, function() {
                // check if the student work is dirty
                if (this.isDirty) {
                    // the student work is dirty so we will save
                    
                    var saveTriggeredBy = 'autoSave';
                    
                    // create and add a node state to the node visit
                    this.createAndAddNodeState(saveTriggeredBy);
                    
                    // save the node visit to the server
                    this.saveNodeVisitToServer();
                }
            }), $scope.$parent.nodeController.autoSaveInterval);
        };
        
        /**
         * Stop the auto save interval for this node
         */
        this.stopAutoSaveInterval = function() {
            clearInterval(this.autoSaveIntervalId);
        };
        
        
        /**
         * Get the prompt to show to the student
         */
        this.getPrompt = function() {
            var prompt = null;
            
            if (this.nodeContent != null) {
                prompt = this.nodeContent.prompt;
            }
            
            return prompt;
        };
        
        /**
         * Get the number of rows for the textarea
         */
        this.getNumRows = function() {
            var numRows = null;
            
            if (this.nodeContent != null) {
                numRows = this.nodeContent.numRows;
            }
            
            return numRows;
        };
        
        /**
         * Get the number of columns for the textarea
         */
        this.getNumColumns = function() {
            var numColumns = null;
            
            if (this.nodeContent != null) {
                numColumns = this.nodeContent.numColumns;
            }
            
            return numColumns;
        };
        
        /**
         * Get the text the student typed
         */
        this.getResponse = function() {
            var response = null;
            
            if (this.studentResponse != null) {
                response = this.studentResponse;
            }
            
            return response;
        };
        
        /**
         * Import work from another node
         */
        this.importWork = function() {
            
            // get the node content
            var nodeContent = this.nodeContent;
            
            if (nodeContent != null) {
                
                var importWork = nodeContent.importWork;
                
                if (importWork != null) {
                    
                    // get the latest node state for this node
                    var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                    
                    /*
                     * we will only import work into this node if the student
                     * has not done any work for this node
                     */
                    if(nodeState == null) {
                        // the student has not done any work for this node
                        
                        var importWorkNodeId = importWork.nodeId;
                        
                        if (importWorkNodeId != null) {
                            
                            // get the node that we want to import work from
                            var importWorkNode = ProjectService.getNodeById(importWorkNodeId);
                            
                            if (importWorkNode != null) {
                                
                                // get the node type of the node we are importing from
                                var importWorkNodeType = importWorkNode.type;
                                
                                // get the latest node state from the node we are importing from
                                var importWorkNodeState = StudentDataService.getLatestNodeStateByNodeId(importWorkNodeId);
                                
                                if (importWorkNodeState != null) {
                                    /*
                                     * populate a new node state with the work from the 
                                     * imported node state
                                     */
                                    var populatedNodeState = OpenResponseService.populateNodeState(importWorkNodeState, importWorkNodeType);
                                    
                                    // populate the node state into this node
                                    this.setStudentWork(populatedNodeState);
                                }
                            }
                        }
                    }
                }
            }
        };
        
        /**
         * Get the part id if this node is part of a Questionnaire node
         * @return the part id
         */
        this.getPartId = function() {
            var partId = null;
            
            if (this.isNodePart) {
                partId = this.nodeContent.id;
            }
            
            return partId;
        };
        
        this.setClassResponses = function(responses) {
            
            if (responses != null) {
                
                for (var r = 0; r < responses.length; r++) {
                    var response = responses[r];
                    
                    if (response != null) {
                        var id = response.id;
                        var workgroupId = response.userId;
                        var data = response.data;
                        
                        if (data != null) {
                            var nodeStates = data.nodeStates;
                            
                            for (var ns = 0; ns < nodeStates.length; ns++) {
                                var tempNodeState = nodeStates[ns];
                                
                                if (tempNodeState != null) {
                                    var isSubmit = tempNodeState.isSubmit;
                                    
                                    if (isSubmit) {
                                        var nodeState = NodeService.getNodeStateByPartId(tempNodeState, this.getPartId());
                                        nodeState.workgroupId = workgroupId;
                                        nodeState.userName = ConfigService.getUserNameByWorkgroupId(workgroupId);
                                        nodeState.nodeVisitId = id;
                                        nodeState.replies = [];
                                        
                                        this.classResponses.push(nodeState);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            this.processResponses(this.classResponses);
        };
        
        this.processResponses = function(classResponses) {
            
            if (classResponses != null) {
                for (var x = 0; x < classResponses.length; x++) {
                    var classResponse = classResponses[x];
                    
                    if (classResponse != null) {
                        var nodeVisitId = classResponse.nodeVisitId;
                        var nodeStateId = classResponse.timestamp;
                        
                        //var nodeVisitIdReplyingTo = classResponse.nodeVisitIdReplyingTo;
                        //var nodeStateIdReplyingTo = classResponse.nodeStateIdReplyingTo;
                        
                        var key = nodeVisitId + '-' + nodeStateId;
                        
                        this.responsesMap[key] = classResponse;
                        
                        /*
                        if (nodeVisitIdReplyingTo != null && nodeStateIdReplyingTo != null) {
                            var replyKey = nodeVisitIdReplyingTo + '-' + nodeStateIdReplyingTo;
                            
                            
                            if (this.responsesMap[replyKey] != null) {
                                this.responsesMap[replyKey].replies.push(classResponse);
                            }
                        }
                        */
                    }
                }
                
                for (var x = 0; x < classResponses.length; x++) {
                    var classResponse = classResponses[x];
                    
                    if (classResponse != null) {
                        //var nodeVisitId = classResponse.nodeVisitId;
                        //var nodeStateId = classResponse.timestamp;
                        
                        var nodeVisitIdReplyingTo = classResponse.nodeVisitIdReplyingTo;
                        var nodeStateIdReplyingTo = classResponse.nodeStateIdReplyingTo;
                        
                        //var key = nodeVisitId + '-' + nodeStateId;
                        
                        //this.responsesMap[key] = classResponse;
                        
                        if (nodeVisitIdReplyingTo != null && nodeStateIdReplyingTo != null) {
                            var replyKey = nodeVisitIdReplyingTo + '-' + nodeStateIdReplyingTo;
                            
                            if (this.responsesMap[replyKey] != null &&
                                    this.responsesMap[replyKey].replies != null) {
                                this.responsesMap[replyKey].replies.push(classResponse);
                            }
                        }
                    }
                }
            }
            
        };
        
        this.addClassResponse = function(workgroupId, nodeVisitId, nodeState) {
            
            if (workgroupId != null && nodeVisitId != null && nodeState != null) {
                
                var isSubmit = nodeState.isSubmit;
                
                if (isSubmit) {
                    nodeState = NodeService.getNodeStateByPartId(nodeState, this.getPartId());
                    
                    nodeState.workgroupId = workgroupId;
                    nodeState.userName = ConfigService.getUserNameByWorkgroupId(workgroupId);
                    nodeState.nodeVisitId = nodeVisitId;
                    nodeState.replies = [];
                    
                    this.classResponses.push(nodeState);
                    
                    var nodeStateId = nodeState.timestamp;
                    
                    var key = nodeVisitId + '-' + nodeStateId;
                    
                    this.responsesMap[key] = nodeState;
                    
                    var nodeVisitIdReplyingTo = nodeState.nodeVisitIdReplyingTo;
                    var nodeStateIdReplyingTo = nodeState.nodeStateIdReplyingTo;
                    
                    if (nodeVisitIdReplyingTo != null && nodeStateIdReplyingTo != null) {
                        var replyKey = nodeVisitIdReplyingTo + '-' + nodeStateIdReplyingTo;
                        
                        if (this.responsesMap[replyKey] != null &&
                                this.responsesMap[replyKey].replies != null) {
                            this.responsesMap[replyKey].replies.push(nodeState);
                        }
                    }
                }
            }
        };
        
        this.getClassResponses = function() {
            return this.classResponses;
        };
        
        this.getLevel1Responses = function() {
            var level1Responses = [];
            var classResponses = this.classResponses;
            
            if (classResponses != null) {
                for (var r = 0; r < classResponses.length; r++) {
                    var tempClassResponse = classResponses[r];
                    
                    if (tempClassResponse != null) {
                        var nodeVisitIdReplyingTo = tempClassResponse.nodeVisitIdReplyingTo;
                        var nodeStateIdReplyingTo = tempClassResponse.nodeStateIdReplyingTo;
                        
                        if (nodeVisitIdReplyingTo == null && nodeStateIdReplyingTo == null) {
                            level1Responses.push(tempClassResponse);
                        }
                    }
                }
            }
            
            return level1Responses;
        };
        
        this.replyButtonClicked = function(nodeState, nodeVisitId, nodeStateId) {
            var previousValue = nodeState.showResponseTextarea;
            nodeState.showResponseTextarea = !previousValue;
        };
        
        $scope.replybuttonclicked = function(nodeState) {
            var previousValue = nodeState.showResponseTextarea;
            nodeState.showResponseTextarea = !previousValue;
        };
        
        this.sendButtonClicked = function(nodeState, nodeVisitId, nodeStateId) {
            
            this.studentResponse = nodeState.replyText;
            this.nodeVisitIdReplyingTo = nodeVisitId;
            this.nodeStateIdReplyingTo = nodeStateId;
            
            // get this part id
            var partId = this.getPartId();
            
            var saveTriggeredBy = 'submitButton';
            
            // create and add the node state to the node visit
            var nodeState = this.createAndAddNodeState(saveTriggeredBy);
            
            $scope.$emit('partSubmitClicked', {partId: partId, nodeState: nodeState});
        };
        
        $scope.sendbuttonclicked = function(response) {
            
            if (response != null) {
                var nodeState = response;
                var nodeVisitId = response.nodeVisitId;
                var nodeStateId = response.timestamp;
                
                //, response.nodeVisitId, response.timestamp, response.replyText
                
                $scope.discussionController.studentResponse = nodeState.replyText;
                $scope.discussionController.nodeVisitIdReplyingTo = nodeVisitId;
                $scope.discussionController.nodeStateIdReplyingTo = nodeStateId;
                
                /*
                this.nodeVisitIdReplyingTo = nodeState.nodeVisitId;
                this.nodeStateIdReplyingTo = nodeState.timestamp;
                
                // get this part id
                var partId = $scope.discussionController.getPartId();
                
                var saveTriggeredBy = 'submitButton';
                
                // create and add the node state to the node visit
                var nodeState = $scope.discussionController.createAndAddNodeState(saveTriggeredBy);
                */
                $scope.$emit('partSubmitClicked');
                
                
                //$scope.discussionController.newResponse
                
                // clear the reply textarea
                response.replyText = null;
                
                // hide the reply textarea and send button
                $scope.replybuttonclicked(response);
            }
        };
        
        
        /**
         * Get the student work object that will contain the student
         * work for the node. This is only used when this node is
         * part of another node such as a Questionnaire node.
         * The Questionnaire node will call this function to obtain
         * the student work.
         * @return an object containing the student work
         */
        $scope.getStudentWorkObject = function() {
            
            var nodeState = {};
            
            /*
             * if this node is showing previous work we do not need to save the
             * student work
             */
            if (!this.isShowPreviousWork) {
                /*
                 * this is not a show previous work node so we will save the
                 * student work
                 */
                
                // create a node state populated with the student data
                nodeState = $scope.discussionController.createNodeState();
            }
            
            return nodeState;
        };
        
        /**
         * Listen for the 'nodeOnExit' event which is fired when the student
         * exits the node. This will perform saving when the student exits
         * the node.
         */
        $scope.$on('nodeOnExit', angular.bind(this, function(event, args) {
            
            /*
             * Check if this node is part of another node such as a
             * Questionnaire node. If this is part of another node we do
             * not need to perform any saving because the parent will
             * handle the saving.
             */
            if (!this.isNodePart) {
                // this is a standalone node so we will save
                
                // get the node that is exiting
                var nodeToExit = args.nodeToExit;
                
                /*
                 * make sure the node id of the node that is exiting is
                 * this node
                 */
                if (nodeToExit.id === this.nodeId) {
                    var saveTriggeredBy = 'nodeOnExit';
                    
                    // create and add a node state to the latest node visit
                    this.createAndAddNodeState(saveTriggeredBy);
                    
                    // stop the auto save interval for this node
                    this.stopAutoSaveInterval();
                    
                    /*
                     * tell the parent that this node is done performing
                     * everything it needs to do before exiting
                     */
                    $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
                }
            }
        }));
        
        $scope.$on('nodeVisitSavedToServer', angular.bind(this, function(event, args) {
            console.log('nodeVisitSavedToServer');
            
            var nodeVisit = args.nodeVisit;
            
            console.log('nodeVisit=' + nodeVisit);
            
            if (nodeVisit != null) {
                
                var workgroupId = ConfigService.getWorkgroupId();
                var nodeVisitId = nodeVisit.id;
                var nodeStates = nodeVisit.nodeStates;
                
                if (nodeStates != null && nodeStates.length > 0) {
                    var nodeState = nodeStates[nodeStates.length - 1];
                    
                    this.addClassResponse(workgroupId, nodeVisitId, nodeState);
                }
            }
        }));
        
        /**
         * Register the the listener that will listen for the exit event
         * so that we can perform saving before exiting.
         */
        this.registerExitListener = function() {
            
            /*
             * Listen for the 'exit' event which is fired when the student exits
             * the VLE. This will perform saving before the VLE exits.
             */
            this.exitListener = $scope.$on('exit', angular.bind(this, function(event, args) {
                
                /*
                 * Check if this node is part of another node such as a
                 * Questionnaire node. If this is part of another node we do
                 * not need to perform any saving because the parent will
                 * handle the saving.
                 */
                if (!this.isNodePart) {
                    // this is a standalone node so we will save
                    
                    var saveTriggeredBy = 'exit';
                    
                    // create and add a node state to the latest node visit
                    this.createAndAddNodeState(saveTriggeredBy);
                    
                    // stop the auto save interval for this node
                    this.stopAutoSaveInterval();
                    
                    /*
                     * tell the parent that this node is done performing
                     * everything it needs to do before exiting
                     */
                    $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
                    
                    // call this function to remove the listener
                    this.exitListener();
                    
                    /*
                     * tell the session service that this listener is done
                     * performing everything it needs to do before exiting
                     */
                    $rootScope.$broadcast('doneExiting');
                }
            }));
        };
        
        // perform setup of this node
        this.setup();
    });
    
    app.$compileProvider.directive('classResponse', function($compile) {
        return {
            restrict: 'E',
            scope: {
                response: '=',
                replybuttonclicked: '&',
                sendbuttonclicked: '&'
            },
            link: function($scope, element, attrs) {
                
                var response = $scope.response;
                var replybuttonclicked = $scope.replybuttonclicked;
                var sendbuttonclicked = $scope.sendbuttonclicked;
                
                if (response != null) {
                    var studentData = response.studentData;
                    
                    var html = '';
                    
                    if (studentData != null) {
                        html += "<hr/>";
                        html += "<span style='display:inline-block'>{{response.userName}}: </span><span ng-bind-html='response.studentData' style='display:inline-block'></span>";
                        
                        var replies = response.replies;
                        
                        if (replies != null && replies.length > 0) {
                            html += "<div ng-repeat='reply in response.replies' style='margin-left: 50px'><span style='display:inline-block'>{{reply.userName}}: </span><span ng-bind-html='reply.studentData' style='display:inline-block'></span></div>";
                        }
                        
                        html += "<br/>";
                        html += "<button ng-click='replyButtonClicked(response)'>Reply</button>";
                        html += "<br/>";
                        html += "<div ng-show='response.showResponseTextarea'>";
                        html += "<textarea ng-model='response.replyText'></textarea>";
                        html += "<br/>";
                        html += "<button ng-click='sendButtonClicked(response)'>Send</button>";
                        html += "</div>";
                        
                        $scope.replyButtonClicked = function(response) {
                            replybuttonclicked({r: response});
                        };
                        
                        $scope.sendButtonClicked = function(response) {
                            sendbuttonclicked({r: response});
                        }
                    }
                    
                    var angularHTML = angular.element(html);
                    $compile(angularHTML)($scope);
                    element.replaceWith(angularHTML);
                }
            }
        };
    });
    
    app.$compileProvider.directive('classresponse2', function($compile) {
        return {
            restrict: 'E',
            scope: {
                response: '=',
                replybuttonclicked: '&',
                sendbuttonclicked: '&'
            },
            link: function($scope, element, attrs, discussionController) {
                var response = $scope.response;
                var replybuttonclicked = $scope.replybuttonclicked;
                var sendbuttonclicked = $scope.sendbuttonclicked;
                
                if (response != null) {
                    var studentData = response.studentData;
                    
                    if (studentData != null) {
                        var html = "";
                        html += "<span style='display:inline-block'>{{response.userName}}: </span><span ng-bind-html='response.studentData' style='display:inline-block'></span>";
                        html += "<button ng-click='replyButtonClicked(response)'>Reply</button>";
                        html += "<br/>";
                        html += "<div ng-show='response.showResponseTextarea'>";
                        html += "<textarea ng-model='response.replyText'></textarea><button ng-click='sendButtonClicked(response)'>Send</button>";
                        html += "</div>";
                        
                        $scope.replyButtonClicked = function(response) {
                            replybuttonclicked({r: response});
                        };
                        
                        $scope.sendButtonClicked = function(response) {
                            sendbuttonclicked({r: response});
                        }
                        
                        var replies = response.replies;
                        
                        if (replies != null && replies.length > 0) {
                            html += "<div ng-repeat='reply in response.replies' style='margin-left: 50px'><classresponse response='reply' replybuttonclicked='replyButtonClicked(r)' sendbuttonclicked='sendbuttonclicked(r)'></classresponse></div>";
                        }
                        
                        var angularHTML = angular.element(html);
                        $compile(angularHTML)($scope);
                        element.replaceWith(angularHTML);
                    }
                }
            }
        };
    });
});