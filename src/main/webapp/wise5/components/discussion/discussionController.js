define(['app', 'angular'], function(app, angular) {
    app.$controllerProvider.register('DiscussionController', 
        function($rootScope,
            $scope,
            $state, 
            $stateParams,
            ConfigService,
            DiscussionService,
            NodeService,
            ProjectService,
            SessionService,
            StudentAssetService,
            StudentDataService) {
        
        // the node id of the current node
        this.nodeId = null;
        
        // the component id
        this.componentId = null;
        
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

        // whether the student work is for a submit
        this.isSubmit = false;

        // will hold the class responses
        this.classResponses = [];
        
        // the text that is being submitted
        this.submitText = null;
        
        // map from component state id to response
        this.responsesMap = {};

        /**
         * Perform setup of the component
         */
        this.setup = function() {
            
            // get the current node and node id
            var currentNode = StudentDataService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }
            
            // get the component content from the scope
            this.componentContent = $scope.component;
            
            if (this.componentContent != null) {
                
                // get the component id
                this.componentId = this.componentContent.id;
                
                
                // get the show previous work node id if it is provided
                var showPreviousWorkNodeId = this.componentContent.showPreviousWorkNodeId;
                
                if (showPreviousWorkNodeId != null) {
                    // this component is showing previous work
                    this.isShowPreviousWork = true;

                    // get the show previous work component id if it is provided
                    var showPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;

                    // get the node content for the other node
                    var showPreviousWorkNodeContent = ProjectService.getNodeContentByNodeId(showPreviousWorkNodeId);

                    // get the node content for the component we are showing previous work for
                    this.componentContent = NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);

                    // get the component state for the show previous work
                    var componentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(showPreviousWorkNodeId, showPreviousWorkComponentId);

                    // populate the student work into this component
                    this.setStudentWork(componentState);

                    // disable the component since we are just showing previous work
                    this.isDisabled = true;

                    // register this component with the parent node
                    $scope.$parent.registerComponentController($scope, this.componentContent);
                } else {
                    // this is a regular component

                    // get the component state from the scope
                    //var componentState = $scope.componentState;
                    
                    // populate the student work into this component
                    //this.setStudentWork(componentState);
                    
                    if (ConfigService.isPreview()) {
                        // we are in preview mode
                    } else {
                        // we are in regular student run mode
                        
                        this.getClassmateResponses();
                    }
                    
                    // check if we need to lock this component
                    this.calculateDisabled();
                    
                    // register this component with the parent node
                    $scope.$parent.registerComponentController($scope, this.componentContent);
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
            var componentId = this.componentId;
            
            // make the request for the classmate responses
            DiscussionService.getClassmateResponses(runId, periodId, nodeId, componentId).then(angular.bind(this, function(result) {
                
                if (result != null) {
                    var componentStates = result.componentStates;
                    
                    // set the classmate responses
                    this.setClassResponses(componentStates);
                }
            }));
        };
        
        /**
         * Populate the student work into the component
         * @param componentState the component state to populate into the component
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

            // tell the parent node that this component wants to save
            $scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
        };
        
        /**
         * Called when the student clicks the submit button
         */
        this.submitButtonClicked = function() {
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
                
                if (this.componentStateIdReplyingTo != null) {
                    // if this step is replying, set the component state id replying to
                    studentData.componentStateIdReplyingTo = this.componentStateIdReplyingTo;
                }

                if (this.isSubmit) {
                    // the student submitted this work
                    studentData.isSubmit = this.isSubmit;

                    /*
                     * reset the isSubmit value so that the next component state
                     * doesn't maintain the same value
                     */
                    this.isSubmit = false;
                }
                
                componentState.studentData = studentData;
            }
            
            return componentState;
        };
        
        /**
         * Clear the component values so they aren't accidentally used again
         */
        this.clearComponentValues = function() {
            
            // clear the student response
            this.studentResponse = '';
            
            // clear the component state id replying to
            this.componentStateIdReplyingTo = null;
        }
        
        /**
         * Check if we need to lock the component
         */
        this.calculateDisabled = function() {
            
            var nodeId = this.nodeId;
            
            // get the component content
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

        this.dropCallback = angular.bind(this, function(event, ui, title, $index) {
            if (this.isDisabled) {
                // don't import if step is disabled/locked
                return;
            }

            var objectType = $(ui.helper.context).data('objectType');
            if (objectType === 'NotebookItem') {
                var notebookItem = $(ui.helper.context).data('objectData');
                if (notebookItem.studentAsset != null) {
                    // we're importing a StudentAssetNotebookItem
                    var studentAsset = notebookItem.studentAsset;
                    StudentAssetService.copyAssetForReference(studentAsset).then(angular.bind(this, function(copiedAsset) {
                        if (copiedAsset != null) {
                            var copiedAssetImg = '<img notebookItemId="' + notebookItem.id + '" studentAssetId="' + copiedAsset.id + '" id="studentAsset_' + copiedAsset.id + '" class="studentAssetReference" src="' + copiedAsset.iconURL + '"></img>';
                            this.newResponse += copiedAssetImg;
                            this.studentDataChanged();
                        }
                    }));
                }
            }
            /*
            var importWorkNodeState = $(ui.helper.context).data('importWorkNodeState');
            var importWorkNodeType = $(ui.helper.context).data('importWorkNodeType');
            var importNotebookItem = $(ui.helper.context).data('importNotebookItem');
            if (importNotebookItem != null) {
                var nodeId = importNotebookItem.nodeId;
                var node = ProjectService.getNodeById(nodeId);
                importWorkNodeType = node.type;

                var nodeVisit = importNotebookItem.nodeVisit;
                var nodeStates = nodeVisit.nodeStates;
                if (nodeStates !== null) {
                    if (nodeStates.length > 0) {
                        importWorkNodeState = nodeStates[nodeStates.length - 1];
                    }
                }
            }
            if (importWorkNodeState != null && importWorkNodeType != null) {
                var populatedNodeState = DiscussionService.populateNodeState(importWorkNodeState, importWorkNodeType);

                // if student already has work, prepend it
                var latestNodeState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
                if (latestNodeState != null) {
                    var latestResponse = latestNodeState.studentData;
                    if (latestResponse != null) {
                        populatedNodeState.studentData = latestResponse + populatedNodeState.studentData;
                    }
                }

                this.setStudentWork(populatedNodeState);
                this.studentDataChanged();
            } else if (objectType === 'StudentAsset') {
                var studentAsset = $(ui.helper.context).data('objectData');
                StudentAssetService.copyAssetForReference(studentAsset).then(angular.bind(this, function(copiedAsset) {
                    if (copiedAsset != null) {
                        var copiedAssetImg = '<img studentAssetId="' + copiedAsset.id + '" id="studentAsset_' + copiedAsset.id + '" class="studentAssetReference" src="' + copiedAsset.iconURL + '"></img>';
                        this.newResponse += copiedAssetImg;

                        this.studentDataChanged();
                    }
                }));
            }
            */
        });

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
         * Import work from another component
         */
        this.importWork = function() {
            
            // get the component content
            var componentContent = this.componentContent;
            
            if (componentContent != null) {
                
                var importWorkNodeId = componentContent.importWorkNodeId;
                var importWorkComponentId = componentContent.importWorkComponentId;
                
                if (importWorkNodeId != null && importWorkComponentId != null) {
                    
                    // get the latest component state for this component
                    var componentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
                    
                    /*
                     * we will only import work into this component if the student
                     * has not done any work for this component
                     */
                    if(componentState == null) {
                        // the student has not done any work for this component
                        
                        // get the latest component state from the component we are importing from
                        var importWorkComponentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importWorkNodeId, importWorkComponentId);
                        
                        if (importWorkComponentState != null) {
                            /*
                             * populate a new component state with the work from the 
                             * imported component state
                             */
                            var populatedComponentState = DiscussionService.populateComponentState(importWorkComponentState);
                            
                            // populate the component state into this component
                            this.setStudentWork(populatedComponentState);
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
         * Set the class responses into the controller
         * @param componentStates the class component states
         */
        this.setClassResponses = function(componentStates) {
            
            if (componentStates != null) {
                
                // loop through all the component states
                for (var c = 0; c < componentStates.length; c++) {
                    var componentState = componentStates[c];
                    
                    if (componentState != null) {
                        
                        // get the component state id
                        var id = componentState.id;
                        
                        // get the workgroup id
                        var workgroupId = componentState.workgroupId;
                        
                        // get the student data
                        var studentData = componentState.studentData;
                        
                        if (studentData != null) {
                            
                            if (studentData.isSubmit) {
                                
                                /*
                                 * add the user name to the component state so we can
                                 * display it next to the response
                                 */
                                componentState.userName = ConfigService.getUserNameByWorkgroupId(workgroupId);
                                
                                /*
                                 * add a replies array to the component state that
                                 * we will fill with component state replies later
                                 */
                                componentState.replies = [];
                                
                                // add the component state to our array
                                this.classResponses.push(componentState);
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
         * @param classResponses an array of component states
         */
        this.processResponses = function(componentStates) {
            
            if (componentStates != null) {
                
                // loop through all the component states
                for (var c = 0; c < componentStates.length; c++) {
                    var componentState = componentStates[c];
                    
                    if (componentState != null) {
                        var componentStateId = componentState.id;
                        
                        // set the component state into the map
                        this.responsesMap[componentStateId] = componentState;
                    }
                }
                
                // loop through all the component states
                for (var c = 0; c < componentStates.length; c++) {
                    var componentState = componentStates[c];
                    
                    if (componentState != null && componentState.studentData != null) {
                        
                        // get the student data
                        var studentData = componentState.studentData;
                        
                        // get the component state id replying to if any
                        var componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;
                        
                        if (componentStateIdReplyingTo != null) {
                            
                            if (this.responsesMap[componentStateIdReplyingTo] != null &&
                                    this.responsesMap[componentStateIdReplyingTo].replies != null) {
                                /*
                                 * add this component state to the replies array of the 
                                 * component state that was replied to
                                 */
                                this.responsesMap[componentStateIdReplyingTo].replies.push(componentState);
                            }
                        }
                    }
                }
            }
        };
        
        /**
         * Add a class response to our model
         * @param componentState the component state to add to our model
         */
        this.addClassResponse = function(componentState) {
            
            if (componentState != null) {
                
                // get the student data
                var studentData = componentState.studentData;
                
                if (studentData != null) {
                    
                    // check if the student data was a submit
                    var isSubmit = studentData.isSubmit;
                    
                    if (isSubmit) {
                        // this component state is a submit so we will add it
                        
                        if (componentState != null) {
                            
                            // get the workgroup id
                            var workgroupId = componentState.workgroupId;
                            
                            /*
                             * add the user name to the component state so we can
                             * display it next to the response
                             */
                            componentState.userName = ConfigService.getUserNameByWorkgroupId(workgroupId);
                            
                            
                            /*
                             * add a replies array to the component state that
                             * we will fill with component state replies later
                             */
                            componentState.replies = [];
                            
                            // add the component state to our array of class responses
                            this.classResponses.push(componentState);
                            
                            // get the component state id
                            var componentStateId = componentState.timestamp;
                            
                            // add the response to our map
                            this.responsesMap[componentStateId] = componentState;
                            
                            // get the component state id replying to if any
                            var componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;
                            
                            if (componentStateIdReplyingTo != null) {
                                
                                // check if we have the component state that was replied to
                                if (this.responsesMap[componentStateIdReplyingTo] != null &&
                                        this.responsesMap[componentStateIdReplyingTo].replies != null) {
                                    /*
                                     * add this response to the replies array of the response
                                     * that was replied to
                                     */
                                    this.responsesMap[componentStateIdReplyingTo].replies.push(componentState);
                                }
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
                        var studentData = tempClassResponse.studentData;
                        
                        // get the component state id replying to if any
                        var componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;
                        
                        if (componentStateIdReplyingTo == null) {
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
         * used to reply to the specific component state
         * @param componentState the component state that the student wants to reply to
         */
        $scope.replybuttonclicked = function(componentState) {
            
            /*
             * get the value for whether the textarea is currently shown
             * or not
             */
            var previousValue = componentState.showReplyTextarea;
            
            // change the value to the opposite of what it was previously
            componentState.showReplyTextarea = !previousValue;
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
                
                var componentState = response;
                
                // get the component state id
                var componentStateId = componentState.id;
                
                /*
                 * remember the values in the controller so we can read
                 * from them later when the student data is saved
                 */
                $scope.discussionController.studentResponse = componentState.replyText;
                $scope.discussionController.componentStateIdReplyingTo = componentStateId;
                
                // clear the reply textarea
                response.replyText = null;
                
                // hide the reply textarea
                response.showReplyTextarea = null;
                
                $scope.discussionController.isSubmit = true;
            }

            // tell the parent node that this component wants to submit
            $scope.$emit('componentSubmitTriggered', {nodeId: $scope.discussionController.nodeId, componentId: $scope.discussionController.componentId});
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
                 * clear the component values so they aren't accidentally used again
                 * later
                 */
                $scope.discussionController.clearComponentValues();
                
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
         * Listen for the 'studentWorkSavedToServer' event which is fired when
         * we receive the response from saving a component state to the server
         */
        $scope.$on('studentWorkSavedToServer', angular.bind(this, function(event, args) {
            
            var componentState = args.studentWork;
            
            if (componentState != null) {
                
                var nodeId = componentState.nodeId;
                var componentId = componentState.componentId;
                
                // check that the component state is for this component
                if (this.nodeId === nodeId && this.componentId == componentId) {
                    
                    // add the component state to our collection of class responses
                    this.addClassResponse(componentState);
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
        
        // perform setup of this component
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