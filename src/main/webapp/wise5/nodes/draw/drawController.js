define(['app', 'drawingTool', 'vendor'], function(app) {
    app.$controllerProvider.register('DrawController', 
        function($rootScope,
            $scope,
            $state, 
            $stateParams,
            AnnotationService,
            ConfigService,
            CurrentNodeService,
            CRaterService,
            DrawService,
            NodeService,
            ProjectService,
            SessionService,
            StudentAssetService,
            StudentDataService) {
        
        // the node id of the current node
        this.nodeId = null;
        
        // field that will hold the node content
        this.nodeContent = null;
        
        // holds the draw student data
        this.studentData = null;
        
        // whether the step should be disabled
        this.isDisabled = false;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        // whether this is part of another node such as a Questionnaire node
        this.isNodePart = false;
        
        // whether this part is showing previous work
        this.isShowPreviousWork = false;
        
        /**
         * Perform setup of the node
         */
        this.setup = function() {
            
            // get the current node and node id
            var currentNode = CurrentNodeService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }
            
            // check if the node is part of another node
            if ($scope.part != null) {
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
            } else {
                // this is a regular standalone node
                var nodeSrc = ProjectService.getNodeSrcByNodeId(this.nodeId);
                
                // get the node content for this node
                NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
                    
                    this.nodeContent = nodeContent;
                    
                    // get the latest node state
                    var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                    
                    // populate the student work into this node
                    this.setStudentWork(nodeState);
                    
                    // check if we need to lock this node
                    this.calculateDisabled();
                    
                    // import any work if necessary
                    this.importWork();
                    
                    // tell the parent controller that this node has loaded
                    $scope.$parent.nodeController.nodeLoaded(this.nodeId);
                    
                    // start the auto save interval
                    this.startAutoSaveInterval();
                    
                    // register this controller to listen for the exit event
                    this.registerExitListener();
                }));
            }
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
                this.studentData = nodeState.studentData;
            }
            
            if (this.studentData != null) {
                drawingTool.load(this.studentData);
            }
        };
        
        /**
         * Called when the student clicks the save button
         */
        this.saveButtonClicked = function() {
            var saveTriggeredBy = 'saveButton';
            
            // create and add the node state to the node visit
            var nodeState = this.createAndAddNodeState(saveTriggeredBy);
            
            // save the node visit to the server
            this.saveNodeVisitToServer().then(angular.bind(this, function(nodeState, nodeVisit) {
                // if this is a CRater step, score it
                this.makeCRaterRequest(nodeState, nodeVisit);
            }, nodeState));
        };
        
        /**
         * Called when the student clicks the submit button
         */
        this.submitButtonClicked = function() {
            var saveTriggeredBy = 'submitButton';
            
            // create and add the node state to the node visit
            var nodeState = this.createAndAddNodeState(saveTriggeredBy);
            
            // save the node visit to the server
            this.saveNodeVisitToServer().then(angular.bind(this, function(nodeState, nodeVisit) {
                // if this is a CRater step, score it
                this.makeCRaterRequest(nodeState, nodeVisit);
            }, nodeState));
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
                    if (saveTriggeredBy === 'submitButton' || this.isDirty || true) {
                        
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
            
            // get the draw JSON string
            var studentDataJSONString = drawingTool.save();
            nodeState.studentData = studentDataJSONString;
            
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
         * Get the draw data
         */
        this.getStudentData = function() {
            var studentData = null;
            
            if (this.studentData != null) {
                studentData = this.studentData;
            }
            
            return studentData;
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
                                    var populatedNodeState = DrawService.populateNodeState(importWorkNodeState, importWorkNodeType);
                                    
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
                nodeState = $scope.drawController.createNodeState();
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
});