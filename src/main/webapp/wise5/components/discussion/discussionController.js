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
        
        // field that will hold the component content
        this.componentContent = null;
        
        // holds the text that the student has typed
        this.studentResponse = '';
        
        // holds the text for a new response (not a reply)
        this.newResponse = '';
        
        // whether the step should be disabled
        this.isDisabled = false;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        // whether this part is showing previous work
        this.isShowPreviousWork = false;
        
        // will hold the class responses
        this.classResponses = [];
        
        // the text that is being submitted
        this.submitText = null;
        
        // map from node visit id and node state id to response
        this.responsesMap = {};
        
        // used to hold a string that declares what triggered the save
        this.saveTriggeredBy = null;
        
        /**
         * Perform setup of the component
         */
        this.setup = function() {
            
            // get the current node and node id
            var currentNode = CurrentNodeService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }
            
            // get the component content from the scope
            this.componentContent = $scope.component;
            
            if (this.componentContent != null) {
                
                // get the show previous work node id if it is provided
                var showPreviousWorkNodeId = this.componentContent.showPreviousWorkNodeId;
                
                if (showPreviousWorkNodeId != null) {
                    // this component is showing previous work
                    this.isShowPreviousWork = true;
                    
                    // get the node src for the node we want previous work from
                    var nodeSrc = ProjectService.getNodeSrcByNodeId(showPreviousWorkNodeId);
                    
                    // get the show previous work component id if it is provided
                    var showPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;
                    
                    // get the node content for the show previous work node
                    NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(showPreviousWorkNodeContent) {
                        
                        // get the node content for the component we are showing previous work for
                        this.componentContent = NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);
                        
                        // get the component state for the show previous work
                        var componentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(showPreviousWorkNodeId, showPreviousWorkComponentId);
                        
                        // populate the student work into this component
                        this.setStudentWork(componentState);
                        
                        // disable the component since we are just showing previous work
                        this.isDisabled = true;
                        
                        // get the component
                        var component = $scope.component;
                        
                        // register this component with the parent node
                        $scope.$parent.registerComponentController($scope, component);
                    }));
                } else {
                    // this is a regular component
                    
                    // get the component from the scope
                    var component = $scope.component;
                    
                    // get the component state from the scope
                    //var componentState = $scope.componentState;
                    
                    // populate the student work into this component
                    //this.setStudentWork(componentState);
                    
                    if(ConfigService.isPreview()) {
                        // we are in preview mode
                    } else {
                        // we are in regular student run mode
                        
                        this.getClassmateResponses();
                    }
                    
                    // check if we need to lock this component
                    this.calculateDisabled();
                    
                    // register this component with the parent node
                    $scope.$parent.registerComponentController($scope, component);
                }
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
         * Populate the student work into the component
         * @param nodeState the component state to populate into the component
         */
        this.setStudentWork = function(componentState) {
            
            if (componentState != null) {
                // populate the text the student previously typed
                var studentData = componentState.studentData;
                
                if (studentData != null) {
                    
                }
            }
        };
        
        /**
         * Called when the student clicks the save button
         */
        this.saveButtonClicked = function() {
            this.saveTriggeredBy = 'saveButton';
            
            $scope.$emit('componentSaveClicked');
        };
        
        /**
         * Called when the student clicks the submit button
         */
        this.submitButtonClicked = function() {
            this.saveTriggeredBy = 'submitButton';
            this.isSubmit = true;
            
            // check if we need to lock the component after the student submits
            if (this.isLockAfterSubmit()) {
                this.isDisabled = true;
            }
            
            // handle the submit button click
            $scope.submitbuttonclicked();
        };
        
        $scope.studentdatachanged = function() {
            $scope.discussionController.studentDataChanged();
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
            
            // get this part id
            var componentId = this.getComponentId();
            
            // create a component state populated with the student data
            var componentState = this.createComponentState();
            
            /*
             * the student work in this component has changed so we will tell
             * the parent node that the student data will need to be saved. 
             * this will also notify connected parts that this component's student 
             * data has changed.
             */
            $scope.$emit('componentStudentDataChanged', {componentId: componentId, componentState: componentState});
        };
        
        /**
         * Get the student response
         */
        this.getStudentResponse = function() {
            return this.studentResponse;
        };
        
        /**
         * Create a new component state populated with the student data
         * @return the componentState after it has been populated
         */
        this.createComponentState = function() {
            
            // create a new component state
            var componentState = NodeService.createNewComponentState();
            
            if (componentState != null) {
                var studentData = {};
                
                // set the response into the component state
                var studentResponse = this.getStudentResponse();
                
                studentData.studentResponse = studentResponse;
                
                if (this.nodeVisitIdReplyingTo != null) {
                    // if this step is replying, set the node visit id replying to
                    studentData.nodeVisitIdReplyingTo = this.nodeVisitIdReplyingTo;
                }
                
                if (this.nodeStateIdReplyingTo != null) {
                    // if this step is replying, set the node state id replying to
                    studentData.nodeStateIdReplyingTo = this.nodeStateIdReplyingTo;
                    
                }
                
                if(this.saveTriggeredBy != null) {
                    // set the saveTriggeredBy value
                    componentState.saveTriggeredBy = this.saveTriggeredBy;
                }
                
                if (this.isSubmit) {
                    // the student submitted this work
                    studentData.isSubmit = this.isSubmit;
                    componentState.isSubmit = this.isSubmit;
                }
                
                componentState.studentData = studentData;
            }
            
            return componentState;
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
            var componentContent = this.componentContent;
            
            if (componentContent != null) {
                
                // check if the parent has set this component to disabled
                if (componentContent.isDisabled) {
                    this.isDisabled = true;
                } else if (componentContent.lockAfterSubmit) {
                    // we need to lock the step after the student has submitted
                    
                    // get the component states for this component
                    var componentStates = StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
                    
                    // check if any of the component states were submitted
                    var isSubmitted = NodeService.isWorkSubmitted(componentStates);
                    
                    if (isSubmitted) {
                        // the student has submitted work for this component
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
            
            if (this.componentContent != null) {
                
                // check the showSaveButton field in the component content
                if (this.componentContent.showSaveButton) {
                    show = true;
                }
            }
            
            return show;
        };
        
        /**
         * Check whether we need to show the submit button
         * @return whether to show the submit button
         */
        this.showSubmitButton = function() {
            var show = false;
            
            if (this.componentContent != null) {
                
                // check the showSubmitButton field in the component content
                if (this.componentContent.showSubmitButton) {
                    show = true;
                }
            }
            
            return show;
        };
        
        /**
         * Check whether we need to lock the component after the student
         * submits an answer.
         */
        this.isLockAfterSubmit = function() {
            var result = false;
            
            if (this.componentContent != null) {
                
                // check the lockAfterSubmit field in the component content
                if (this.componentContent.lockAfterSubmit) {
                    result = true;
                }
            }
            
            return result;
        };
        
        /**
         * Get the prompt to show to the student
         */
        this.getPrompt = function() {
            var prompt = null;
            
            if (this.componentContent != null) {
                prompt = this.componentContent.prompt;
            }
            
            return prompt;
        };
        
        /**
         * Get the number of rows for the textarea
         */
        this.getNumRows = function() {
            var numRows = null;
            
            if (this.componentContent != null) {
                numRows = this.componentContent.numRows;
            }
            
            return numRows;
        };
        
        /**
         * Get the number of columns for the textarea
         */
        this.getNumColumns = function() {
            var numColumns = null;
            
            if (this.componentContent != null) {
                numColumns = this.componentContent.numColumns;
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
            var componentContent = this.componentContent;
            
            if (componentContent != null) {
                
                var importWork = componentContent.importWork;
                
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
                                     * populate a new component state with the work from the 
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
         * Get the component id
         * @return the component id
         */
        this.getComponentId = function() {
            var componentId = this.componentContent.id;
            
            return componentId;
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
                                        var componentState = NodeService.getNodeStateByPartId(tempNodeState, this.getComponentId());
                                        
                                        if (componentState != null) {
                                            // set the workgroup id, user name, and node visit id into the node state part
                                            componentState.workgroupId = workgroupId;
                                            componentState.userName = ConfigService.getUserNameByWorkgroupId(workgroupId);
                                            componentState.nodeVisitId = id;
                                            componentState.replies = [];
                                            
                                            // add the node state part to our array
                                            this.classResponses.push(componentState);
                                        }
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
                    
                    if (classResponse != null && classResponse.studentData != null) {
                        
                        // get the student data
                        var studentData = classResponse.studentData;
                        
                        // get the replying to values if any
                        var nodeVisitIdReplyingTo = studentData.nodeVisitIdReplyingTo;
                        var nodeStateIdReplyingTo = studentData.nodeStateIdReplyingTo;
                        
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
        this.addClassResponse = function(workgroupId, nodeVisitId, componentState) {
            
            if (workgroupId != null && nodeVisitId != null && componentState != null) {
                
                var isSubmit = componentState.isSubmit;
                
                if (isSubmit) {
                    // this node state is a submit so we will add it
                    
                    if (componentState != null) {
                        // set the workgroup id, user name, and node visit id into the node state
                        componentState.workgroupId = workgroupId;
                        componentState.userName = ConfigService.getUserNameByWorkgroupId(workgroupId);
                        componentState.nodeVisitId = nodeVisitId;
                        componentState.replies = [];
                        
                        // add the node state to our array of class responses
                        this.classResponses.push(componentState);
                        
                        // get the node state id
                        var componentStateId = componentState.timestamp;
                        
                        // get the response key
                        var key = nodeVisitId + '-' + componentStateId;
                        
                        // add the response to our map
                        this.responsesMap[key] = componentState;
                        
                        // get the student data
                        var studentData = componentState.studentData;
                        
                        // get the replying to values if any
                        var nodeVisitIdReplyingTo = studentData.nodeVisitIdReplyingTo;
                        var componentStateIdReplyingTo = studentData.nodeStateIdReplyingTo;
                        
                        if (nodeVisitIdReplyingTo != null && componentStateIdReplyingTo != null) {
                            
                            // get the key for the response that was replied to
                            var replyKey = nodeVisitIdReplyingTo + '-' + componentStateIdReplyingTo;
                            
                            if (this.responsesMap[replyKey] != null &&
                                    this.responsesMap[replyKey].replies != null) {
                                /*
                                 * add this response to the replies array of the response
                                 * that was replied to
                                 */
                                this.responsesMap[replyKey].replies.push(componentState);
                            }
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
                    
                    if (tempClassResponse != null && tempClassResponse.studentData) {
                        
                        // get the student data
                        var studentData= tempClassResponse.studentData;
                        
                        // get the replying to values if any
                        var nodeVisitIdReplyingTo = studentData.nodeVisitIdReplyingTo;
                        var nodeStateIdReplyingTo = studentData.nodeStateIdReplyingTo;
                        
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
                $scope.discussionController.studentResponse = $scope.discussionController.newResponse;
                
                // clear the top textarea
                $scope.discussionController.newResponse = '';
                
                $scope.discussionController.isSubmit = true;
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
                
                $scope.discussionController.isSubmit = true;
            }
            
            // tell the parent that the submit button was clicked
            $scope.$emit('componentSubmitClicked');
        };
        
        /**
         * Get the component state from this component. The parent node will 
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a component state containing the student data
         */
        $scope.getComponentState = function() {
            var componentState = null;
            
            // check if the student work is dirty and the student clicked the submit button
            if ($scope.discussionController.isDirty && $scope.discussionController.isSubmit) {
                // create a component state populated with the student data
                componentState = $scope.discussionController.createComponentState();
                
                /*
                 * clear the node values so they aren't accidentally used again
                 * later
                 */
                $scope.discussionController.clearNodeValues();
                
                // set isDirty to false since this student work is about to be saved
                $scope.discussionController.isDirty = false;
            }
            
            return componentState;
        };
        
        /**
         * The parent node submit button was clicked
         */
        $scope.$on('nodeSubmitClicked', angular.bind(this, function(event, args) {
            
            // get the node id of the node
            var nodeId = args.nodeId;
            
            // make sure the node id matches our parent node
            if (this.nodeId === nodeId) {
                
                if (this.isLockAfterSubmit()) {
                    // disable the component if it was authored to lock after submit
                    this.isDisabled = true;
                }
            }
        }));
        
        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        $scope.$on('exitNode', angular.bind(this, function(event, args) {
            
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
                        
                        // get the work for this component
                        componentState = NodeService.getNodeStateByPartId(nodeState, this.getComponentId());
                        
                        // add the node state to our collection of class responses
                        this.addClassResponse(workgroupId, nodeVisitId, componentState);
                    }
                }
            }
            
            this.isSubmit = null;
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
                submitbuttonclicked: '&',
                studentdatachanged: '&'
            },
            link: function($scope, element, attrs) {
                
                // get the values from the scope
                var response = $scope.response;
                var replybuttonclicked = $scope.replybuttonclicked;
                var submitbuttonclicked = $scope.submitbuttonclicked;
                var studentdatachanged = $scope.studentdatachanged;
                
                if (response != null) {
                    
                    // get the student data from the response
                    var studentData = response.studentData;
                    
                    var html = '';
                    
                    if (studentData != null) {
                        html += "<hr/>";
                        
                        // display the student user name and response
                        html += "<span style='display:inline-block'>{{response.userName}}: </span><span ng-bind-html='response.studentData.studentResponse' style='display:inline-block'></span>";
                        
                        // display all the replies for the response
                        html += "<div ng-repeat='reply in response.replies' style='margin-left: 50px'><span style='display:inline-block'>{{reply.userName}}: </span><span ng-bind-html='reply.studentData.studentResponse' style='display:inline-block'></span></div>";
                        html += "<br/>";
                        
                        // display the reply button
                        html += "<button ng-click='replyButtonClicked(response)' style='margin-left: 50px'>Reply</button>";
                        html += "<br/>";
                        html += "<br/>";
                        
                        // generate the reply textarea
                        html += "<div ng-show='response.showReplyTextarea' style='margin-left: 50px'>";
                        html += "<div text-angular ng-model='response.replyText' ng-change='studentDataChanged()'></div>";
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
                        
                        // handle the student data changing
                        $scope.studentDataChanged = function() {
                            studentdatachanged();
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