define(['app'], function(app) {
    app.$controllerProvider.register('QuestionnaireController', 
            function($rootScope,
                    $scope,
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
        
        // the node id of the current node
        this.nodeId = null;
        
        // field that will hold the node content
        this.nodeContent = null;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        // the current node state
        this.nodeState = null;
        
        /*
         * an object that holds the mappings with the key being the part
         * and the value being the scope object from the child controller
         */
        $scope.partToScope = {};
        
        /**
         * Perform setup of the node
         */
        this.setup = function() {
            
            // get the current node and node id
            var currentNode = CurrentNodeService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }
            
            // get the source for the node content
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
                
                //this.importWork();
                
                // tell the parent controller that this node has loaded
                $scope.$parent.nodeController.nodeLoaded(this.nodeId);
                
                // start the auto save interval
                this.startAutoSaveInterval();
                
                // register this controller to listen for the exit event
                this.registerExitListener();
            }));
        };
        
        /**
         * Populate the student work into the node
         * @param nodeState the node state to populate into the node
         */
        this.setStudentWork = function(nodeState) {
            if (nodeState != null) {
                /*
                 * remember the node state so that we can use it later
                 * when we call getPartStudentData()
                 */
                this.nodeState = nodeState;
            }
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
         * Import work from another node
         */
        this.importWork = function() {
            
        };
        
        /**
         * Called when the student clicks the save button
         */
        this.saveButtonClicked = function() {
            var saveTriggeredBy = 'saveButton';
            
            // create and add the node state to the node visit
            this.createAndAddNodeState(saveTriggeredBy);
            
            // save the node visit to the server
            this.saveNodeVisitToServer();
        };
        
        /**
         * Called when the student clicks the submit button
         */
        this.submitButtonClicked = function() {
            var saveTriggeredBy = 'submitButton';
            
            // create add the node state to the node visit
            this.createAndAddNodeState(saveTriggeredBy);
            
            // save the node visit to the server
            this.saveNodeVisitToServer();
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
         */
        this.createAndAddNodeState = function(saveTriggeredBy) {
            if (saveTriggeredBy != null) {
                /*
                 * check if the save was triggered by the submit button
                 * or if the student data is dirty
                 */
                if (saveTriggeredBy === 'submitButton' || this.isDirty) {
                    
                    // create the node state
                    var nodeState = this.createNodeState();
                    
                    if (saveTriggeredBy === 'submitButton') {
                        nodeState.isSubmit = true;
                    } 
                    // add the node state to the latest node visit
                    $scope.$parent.nodeController.addNodeStateToLatestNodeVisit(this.nodeId, nodeState);
                }
            }
        };
        
        /**
         * Save the node visit to the server
         */
        this.saveNodeVisitToServer = function() {
            // save the node visit to the server
            return $scope.$parent.nodeController.saveNodeVisitToServer(this.nodeId).then(angular.bind(this, function() {
                
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
         * Get the parts for this node. Each part is another node.
         * @return an array that contains node content for the node parts
         */
        this.getParts = function() {
            var parts = null;
            
            if (this.nodeContent != null) {
                parts = this.nodeContent.parts;
            }
            
            return parts;
        };
        
        /**
         * Get the part given the part id
         * @param partId the part id we want
         * @return the part object with the given part id
         */
        this.getPartByPartId = function(partId) {
            
            var part = null;
            
            if (partId != null) {
                
                // get all the parts
                var parts = this.getParts();
                
                // loop through all the parts
                for (var p = 0; p < parts.length; p ++) {
                    
                    // get a part
                    var tempPart = parts[p];
                    
                    if (tempPart != null) {
                        var tempPartId = tempPart.id;
                        
                        // check if the part id matches the one we want
                        if (tempPartId === partId) {
                            // the part id matches
                            part = tempPart;
                            break;
                        }
                    }
                }
            }
            
            return part;
        };
        
        /**
         * Get the html template for the node part
         * @param partType the node type
         * @return the path to the html template for the node part
         */
        this.getPartTypeHTML = function(partType) {
            
            if (partType == null) {
                // error
            } else if (NodeService.isStringUpperCase(partType)) {
                /*
                 * the part type is all uppercase so we will convert it to all
                 * lowercase
                 */
                partType = partType.toLowerCase();
            } else {
                // get the part type in camel case
                partType = NodeService.toCamelCase(partType);
            }
            
            var partTypeHTML = 'wise5/nodes/' + partType + '/index.html';
            
            return partTypeHTML;
        };
        
        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        this.showSaveButton = function() {
            var result = false;
            
            if (this.nodeContent != null && this.nodeContent.showSaveButton) {
                result = true;
            }
            
            return result;
        };
        
        /**
         * Check whether we need to show the submit button
         * @return whether to show the submit button
         */
        this.showSubmitButton = function() {
            var result = false;
            
            if (this.nodeContent != null && this.nodeContent.showSubmitButton) {
                result = true;
            }
            
            return result;
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
         * Create a new node state and populate with the student data
         * @return a node state that contains the student data
         */
        this.createNodeState = function() {
            
            // create a new empty node state
            var nodeState = StudentDataService.createNodeState();
            
            // add the parts array
            nodeState.parts = [];
            
            // get the parts for this node
            var parts = this.getParts();
            
            if (parts != null) {
                
                // loop through all the parts
                for (var p = 0; p < parts.length; p++) {
                    
                    // get a part
                    var part = parts[p];
                    
                    var studentWorkObject = {};
                    
                    if (part != null) {
                        // get the part id
                        var partId = part.id;
                        
                        // get the scope for the part
                        var childScope = $scope.partToScope[partId];
                        
                        // get the student work object from the child scope
                        studentWorkObject = childScope.getStudentWorkObject();
                        
                        // set the part id into the student work object
                        studentWorkObject.id = partId;
                    }
                    
                    // add the student work object to our parts array
                    nodeState.parts.push(studentWorkObject);
                }
            }
            
            return nodeState;
        };
        
        /**
         * The function that child part controllers will call to register
         * themselves with this Questionnaire node
         * @param childScope the child scope object
         * @param part the node content for the part
         */
        $scope.registerPartController = function(childScope, part) {
            
            if ($scope != null && part != null) {
                // get the part id
                var partId = part.id;
                
                // add the part id to child scope mapping
                $scope.partToScope[partId] = childScope;
            }
        }
        
        /**
         * Listen for the partStudentDataChanged event that will come from 
         * child part scopes
         * @param event
         * @param args the arguments provided when the event is fired
         */
        $scope.$on('partStudentDataChanged', angular.bind(this, function(event, args) {
            /*
             * the student data in one of our child scopes has changed so
             * we will need to save
             */
            this.isDirty = true;
            
            if (args != null) {
                
                // get the part id
                var partId = args.partId;
                
                // get the new node state
                var nodeState = args.nodeState;
                
                if (partId != null && nodeState != null) {
                    
                    /*
                     * notify the parts that are connected that the student 
                     * data has changed
                     */
                    this.notifyConnectedParts(partId, nodeState);
                }
            }
        }));
        
        /**
         * Notify any connected parts that the student data has changed
         * @param partId the part id that has changed
         * @param nodeState the new student data
         */
        this.notifyConnectedParts = function(changedPartId, nodeState) {
            
            if (changedPartId != null && nodeState != null) {
                
                // get all the parts
                var parts = this.getParts();
                
                if (parts != null) {
                    
                    /*
                     * loop through all the parts and look for parts that
                     * are listening for the given part id to change.
                     * only notify parts that are listening for changes
                     * from the specific part id.
                     */
                    for (var p = 0; p < parts.length; p ++) {
                        
                        // get a part
                        var part = parts[p];
                        
                        if (part != null) {
                            
                            // get this part id
                            var partId = part.id;
                            
                            /*
                             * get the connected parts that this part is 
                             * listening for
                             */
                            var connectedParts = part.connectedParts;
                            
                            if (connectedParts != null) {
                                
                                // loop through all the connected parts
                                for (var c = 0; c < connectedParts.length; c++) {
                                    
                                    // get a connected part
                                    var connectedPart = connectedParts[c];
                                    
                                    if (connectedPart != null) {
                                        
                                        // get the connected part id
                                        var connectedPartId = connectedPart.id;
                                        
                                        // check if the part id matches the one that has changed
                                        if (connectedPartId === changedPartId) {
                                            
                                            // get the scope for the listening part
                                            var partScope = $scope.partToScope[partId];
                                            
                                            // check if the listening part has a handler function
                                            if (partScope.handleConnectedPartStudentDataChanged != null) {
                                                
                                                // get the part object that has changed
                                                var partObject = this.getPartByPartId(changedPartId);
                                                
                                                if (partObject != null) {
                                                    /*
                                                     * inject the part type so we will know what type of
                                                     * node the student data is coming from
                                                     */
                                                    connectedPart.partType = partObject.partType;
                                                }
                                                
                                                // tell the listening part to handle the student data changing
                                                partScope.handleConnectedPartStudentDataChanged(connectedPart, nodeState);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        
        /**
         * Get the student data for a specific part
         * @param the node content for the part
         * @return the student data for the given part
         */
        this.getPartStudentData = function(part) {
            
            var partStudentData = null;
            
            // get the node state
            var nodeState = this.nodeState;
            
            if (part != null) {
                // get the part id
                var partId = part.id;
                
                if (partId != null) {
                    
                    // get the part from the node state
                    partStudentData = this.getPartFromNodeState(nodeState, partId)
                }
            }
            
            return partStudentData;
        };
        
        /**
         * Get the part from the node state
         * @param nodeState the node state
         * @param partId the part id to get
         * @return an object containing the student data for the part
         */
        this.getPartFromNodeState = function(nodeState, partId) {
            var partFromNodeState = null;
            
            if (nodeState != null && partId != null) {
                
                // get the parts from the node state
                var parts = nodeState.parts;
                
                if (parts != null) {
                    
                    // loop through all the parts
                    for (var p = 0; p < parts.length; p++) {
                        
                        // get a part
                        var part = parts[p];
                        
                        if (part != null) {
                            var tempPartId = part.id;
                            
                            // check if the part id matches the one we want
                            if (partId === tempPartId) {

                                //we have found the part we want
                                partFromNodeState = part;
                                break;
                            }
                        }
                    }
                }
            }
            
            return partFromNodeState;
        };
        
        /**
         * Listen for the 'nodeOnExit' event which is fired when the student
         * exits the node. This will perform saving when the student exits
         * the node.
         */
        $scope.$on('nodeOnExit', angular.bind(this, function(event, args) {
            
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
        }));
        
        /**
         * Register the the listener that will listen for the exit event
         * so that we can perform saving before exiting.
         */
        this.registerExitListener = function() {
            /**
             * Listen for the 'exit' event which is fired when the student exits
             * the VLE. This will perform saving before exiting.
             */
            this.logOutListener = $scope.$on('exit', angular.bind(this, function(event, args) {
                
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
                this.logOutListener();
                
                /*
                 * tell the session service that this listener is done
                 * performing everything it needs to do before exiting
                 */
                $rootScope.$broadcast('doneExiting');
            }));
        };
        
        // perform setup of this node
        this.setup();
    });
});