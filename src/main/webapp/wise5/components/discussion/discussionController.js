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
                // this part is loading the node part for the student to work on
                
                if(ConfigService.isPreview()) {
                    // preview
                } else {
                    // run
                    
                    this.getClassmateResponses();
                }
                
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
        
        /**
         * Get the classmate responses
         */
        this.getClassmateResponses = function() {
            var runId = ConfigService.getRunId();
            var periodId = ConfigService.getPeriodId();
            var nodeId = this.nodeId;
            var includeSelf = true;
            var workgroupIds = ConfigService.getClassmateWorkgroupIds(includeSelf);
            
            // make the request for the classmate responses
            DiscussionService.getClassmateResponses(runId, periodId, nodeId, workgroupIds).then(angular.bind(this, function(result) {
                
                // set the classmate responses
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
            // not used
        };
        
        /**
         * Called when the student clicks the submit button
         */
        this.submitButtonClicked = function() {
            
            // handle the submit button click
            $scope.submitbuttonclicked();
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
         * Create a new node state populated with the student data
         * @return the nodeState after it has been populated
         */
        this.createNodeState = function() {
            
            // create a new node state
            var nodeState = NodeService.createNewNodeState();
            
            // set the response into the node state
            nodeState.studentData = this.getStudentResponse();
            
            if (this.nodeVisitIdReplyingTo != null) {
                // if this step is replying, set the node visit id replying to
                nodeState.nodeVisitIdReplyingTo = this.nodeVisitIdReplyingTo;
            }
            
            if (this.nodeStateIdReplyingTo != null) {
                // if this step is replying, set the node state id replying to
                nodeState.nodeStateIdReplyingTo = this.nodeStateIdReplyingTo;
                
            }
            
            return nodeState;
        };
        
        /**
         * Clear the node values so they aren't accidentally used again
         */
        this.clearNodeValues = function() {
            
            // clear the student response
            this.studentResponse = '';
            
            // clear the node visit id replying to
            this.nodeVisitIdReplyingTo = null;
            
            // clear the node state id replying to
            this.nodeStateIdReplyingTo = null;
        }
        
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
        
        /**
         * Set the class responses into the node
         * @param responses the class responses
         */
        this.setClassResponses = function(responses) {
            
            if (responses != null) {
                
                // loop through all the class responses
                for (var r = 0; r < responses.length; r++) {
                    var response = responses[r];
                    
                    if (response != null) {
                        
                        // get the node visit id
                        var id = response.id;
                        
                        // get the workgroup id
                        var workgroupId = response.userId;
                        
                        // get the student data
                        var data = response.data;
                        
                        if (data != null) {
                            
                            // get the node states
                            var nodeStates = data.nodeStates;
                            
                            // loop through all the node states
                            for (var ns = 0; ns < nodeStates.length; ns++) {
                                var tempNodeState = nodeStates[ns];
                                
                                if (tempNodeState != null) {
                                    var isSubmit = tempNodeState.isSubmit;
                                    
                                    if (isSubmit) {
                                        /*
                                         * the node state is a submit so we will add it to our
                                         * class responses
                                         */
                                        
                                        // get the node state part from the node state
                                        var nodeState = NodeService.getNodeStateByPartId(tempNodeState, this.getPartId());
                                        
                                        // set the workgroup id, user name, and node visit id into the node state part
                                        nodeState.workgroupId = workgroupId;
                                        nodeState.userName = ConfigService.getUserNameByWorkgroupId(workgroupId);
                                        nodeState.nodeVisitId = id;
                                        nodeState.replies = [];
                                        
                                        // add the node state part to our array
                                        this.classResponses.push(nodeState);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // process the class responses
            this.processResponses(this.classResponses);
        };
        
        /**
         * Process the class responses. This will put responses into the
         * replies arrays.
         * @param classResponses an array of all the class responses
         */
        this.processResponses = function(classResponses) {
            
            if (classResponses != null) {
                
                // loop through all the class responses
                for (var x = 0; x < classResponses.length; x++) {
                    var classResponse = classResponses[x];
                    
                    if (classResponse != null) {
                        var nodeVisitId = classResponse.nodeVisitId;
                        var nodeStateId = classResponse.timestamp;
                        
                        // create the key for this response
                        var key = nodeVisitId + '-' + nodeStateId;
                        
                        // set the response into the map
                        this.responsesMap[key] = classResponse;
                    }
                }
                
                // loop through all the class responses
                for (var x = 0; x < classResponses.length; x++) {
                    var classResponse = classResponses[x];
                    
                    if (classResponse != null) {
                        
                        // get the replying to values if any
                        var nodeVisitIdReplyingTo = classResponse.nodeVisitIdReplyingTo;
                        var nodeStateIdReplyingTo = classResponse.nodeStateIdReplyingTo;
                        
                        if (nodeVisitIdReplyingTo != null && nodeStateIdReplyingTo != null) {
                            // this response is a reply to another response
                            
                            // get the key for the response that was replied to
                            var replyKey = nodeVisitIdReplyingTo + '-' + nodeStateIdReplyingTo;
                            
                            if (this.responsesMap[replyKey] != null &&
                                    this.responsesMap[replyKey].replies != null) {
                                /*
                                 * add this response to the replies array of the response
                                 * that was replied to
                                 */
                                this.responsesMap[replyKey].replies.push(classResponse);
                            }
                        }
                    }
                }
            }
            
        };
        
        /**
         * Add a class response to our model
         * @param workgroupId the workgroup id
         * @param nodeVisitId the node visit id
         * @param nodeState the node state
         */
        this.addClassResponse = function(workgroupId, nodeVisitId, nodeState) {
            
            if (workgroupId != null && nodeVisitId != null && nodeState != null) {
                
                var isSubmit = nodeState.isSubmit;
                
                if (isSubmit) {
                    // this node state is a submit so we will add it
                    
                    // get the node state part
                    nodeState = NodeService.getNodeStateByPartId(nodeState, this.getPartId());
                    
                    // set the workgroup id, user name, and node visit id into the node state
                    nodeState.workgroupId = workgroupId;
                    nodeState.userName = ConfigService.getUserNameByWorkgroupId(workgroupId);
                    nodeState.nodeVisitId = nodeVisitId;
                    nodeState.replies = [];
                    
                    // add the node state to our array of class responses
                    this.classResponses.push(nodeState);
                    
                    // get the node state id
                    var nodeStateId = nodeState.timestamp;
                    
                    // get the response key
                    var key = nodeVisitId + '-' + nodeStateId;
                    
                    // add the response to our map
                    this.responsesMap[key] = nodeState;
                    
                    // get the replying to values if any
                    var nodeVisitIdReplyingTo = nodeState.nodeVisitIdReplyingTo;
                    var nodeStateIdReplyingTo = nodeState.nodeStateIdReplyingTo;
                    
                    if (nodeVisitIdReplyingTo != null && nodeStateIdReplyingTo != null) {
                        
                        // get the key for the response that was replied to
                        var replyKey = nodeVisitIdReplyingTo + '-' + nodeStateIdReplyingTo;
                        
                        if (this.responsesMap[replyKey] != null &&
                                this.responsesMap[replyKey].replies != null) {
                            /*
                             * add this response to the replies array of the response
                             * that was replied to
                             */
                            this.responsesMap[replyKey].replies.push(nodeState);
                        }
                    }
                }
            }
        };
        
        /**
         * Get the class responses
         */
        this.getClassResponses = function() {
            return this.classResponses;
        };
        
        /**
         * Get the level 1 responses which are posts that are not a 
         * reply to another response.
         * @return an array of responses that are not a reply to another
         * response
         */
        this.getLevel1Responses = function() {
            var level1Responses = [];
            var classResponses = this.classResponses;
            
            if (classResponses != null) {
                
                // loop through all the class responses
                for (var r = 0; r < classResponses.length; r++) {
                    var tempClassResponse = classResponses[r];
                    
                    if (tempClassResponse != null) {
                        // get the replying to values if any
                        var nodeVisitIdReplyingTo = tempClassResponse.nodeVisitIdReplyingTo;
                        var nodeStateIdReplyingTo = tempClassResponse.nodeStateIdReplyingTo;
                        
                        if (nodeVisitIdReplyingTo == null && nodeStateIdReplyingTo == null) {
                            /*
                             * this response was not a reply to another post so it is a
                             * level 1 response
                             */
                            level1Responses.push(tempClassResponse);
                        }
                    }
                }
            }
            
            return level1Responses;
        };
        
        /**
         * The reply button was clicked so we will show or hide the textarea
         * used to reply to the specific node state
         * @param nodeState the node state that the student wants to reply to
         */
        $scope.replybuttonclicked = function(nodeState) {
            
            /*
             * get the value for whether the textarea is currently shown
             * or not
             */
            var previousValue = nodeState.showReplyTextarea;
            
            // change the value to the opposite of what it was previously
            nodeState.showReplyTextarea = !previousValue;
        };
        
        /**
         * The submit button was clicked
         * @param response the response object related to the submit button
         */
        $scope.submitbuttonclicked = function(response) {
            
            if (response == null) {
                // the submit button was clicked for the new post textarea
                
                /*
                 * set the response from the top textarea into the 
                 * studentResponse field that we will read from later
                 * when the student data is saved
                 */
                this.discussionController.studentResponse = this.discussionController.newResponse;
                
                // clear the top textarea
                this.discussionController.newResponse = '';
                
            } else {
                // this submit button was clicked for a reply textarea
                
                // get the values of the response
                var nodeState = response;
                var nodeVisitId = response.nodeVisitId;
                var nodeStateId = response.timestamp;
                
                /*
                 * remember the values in the controller so we can read
                 * from them later when the student data is saved
                 */
                $scope.discussionController.studentResponse = nodeState.replyText;
                $scope.discussionController.nodeVisitIdReplyingTo = nodeVisitId;
                $scope.discussionController.nodeStateIdReplyingTo = nodeStateId;
                
                // clear the reply textarea
                response.replyText = null;
                
                // hide the reply textarea
                response.showReplyTextarea = null;
            }
            
            // tell the parent that the submit button was clicked
            $scope.$emit('partSubmitClicked');
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
                
                /*
                 * clear the node values so they aren't accidentally used again
                 * later
                 */
                $scope.discussionController.clearNodeValues();
            }
            
            return nodeState;
        };
        
        /**
         * Listen for the 'nodeOnExit' event which is fired when the student
         * exits the node. This will perform saving when the student exits
         * the node.
         */
        $scope.$on('nodeOnExit', angular.bind(this, function(event, args) {
            
            // do nothing
        }));
        
        /**
         * Listen for the 'nodeVisitSavedToServer' event which is fired when
         * we receive the response from saving a node visit to the server
         */
        $scope.$on('nodeVisitSavedToServer', angular.bind(this, function(event, args) {
            
            var nodeVisit = args.nodeVisit;
            
            if (nodeVisit != null) {
                
                var nodeVisitNodeId = nodeVisit.nodeId;
                
                // check that the node visit was for this node
                if (this.nodeId === nodeVisitNodeId) {
                    
                    var workgroupId = ConfigService.getWorkgroupId();
                    var nodeVisitId = nodeVisit.id;
                    var nodeStates = nodeVisit.nodeStates;
                    
                    if (nodeStates != null && nodeStates.length > 0) {
                        
                        // get the latest node state
                        var nodeState = nodeStates[nodeStates.length - 1];
                        
                        // add the node state to our collection of class responses
                        this.addClassResponse(workgroupId, nodeVisitId, nodeState);
                    }
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
                
                // do nothing
                $rootScope.$broadcast('doneExiting');
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
                submitbuttonclicked: '&'
            },
            link: function($scope, element, attrs) {
                
                // get the values from the scope
                var response = $scope.response;
                var replybuttonclicked = $scope.replybuttonclicked;
                var submitbuttonclicked = $scope.submitbuttonclicked;
                
                if (response != null) {
                    
                    // get the student data from the response
                    var studentData = response.studentData;
                    
                    var html = '';
                    
                    if (studentData != null) {
                        html += "<hr/>";
                        
                        // display the student user name and response
                        html += "<span style='display:inline-block'>{{response.userName}}: </span><span ng-bind-html='response.studentData' style='display:inline-block'></span>";
                        
                        // display all the replies for the response
                        html += "<div ng-repeat='reply in response.replies' style='margin-left: 50px'><span style='display:inline-block'>{{reply.userName}}: </span><span ng-bind-html='reply.studentData' style='display:inline-block'></span></div>";
                        html += "<br/>";
                        
                        // display the reply button
                        html += "<button ng-click='replyButtonClicked(response)' style='margin-left: 50px'>Reply</button>";
                        html += "<br/>";
                        html += "<br/>";
                        
                        // generate the reply textarea
                        html += "<div ng-show='response.showReplyTextarea' style='margin-left: 50px'>";
                        html += "<div text-angular ng-model='response.replyText'></div>";
                        html += "<br/>";
                        html += "<br/>";
                        
                        // generate the reply submit button
                        html += "<button ng-click='submitButtonClicked(response)'>Submit</button>";
                        html += "</div>";
                        
                        // handle the reply button click
                        $scope.replyButtonClicked = function(response) {
                            replybuttonclicked({r: response});
                        };
                        
                        // handle the submit button click
                        $scope.submitButtonClicked = function(response) {
                            submitbuttonclicked({r: response});
                        }
                    }
                    
                    // parse the html using angular
                    var angularHTML = angular.element(html);
                    $compile(angularHTML)($scope);
                    element.replaceWith(angularHTML);
                }
            }
        };
    });
    
});