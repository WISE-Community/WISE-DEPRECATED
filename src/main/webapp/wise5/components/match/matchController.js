define(['app', 'angular'], function(app, angular) {
    app.$controllerProvider.register('MatchController', 
        function($rootScope,
            $scope,
            $state, 
            $stateParams,
            AnnotationService,
            ConfigService,
            CurrentNodeService,
            MatchService,
            NodeService,
            ProjectService,
            SessionService,
            StudentAssetService,
            StudentDataService) {
        
        // the node id of the current node
        this.nodeId = null;
        
        // field that will hold the component content
        this.componentContent = null;
        
        // whether the step should be disabled
        this.isDisabled = false;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        // whether this part is showing previous work
        this.isShowPreviousWork = false;
        
        // the choices
        this.choices = [];
        
        // the buckets
        this.buckets = [];
        
        // the number of times the student has submitted
        this.numberOfSubmits = 0;
        
        // whether the student has correctly placed the choices
        this.isCorrect = null;
        
        /**
         * Perform setup of the node
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
                        this.componentContent = NodeService.getNodeContentPartById(showPreviousWorkNodeContent, showPreviousWorkComponentId);
                        
                        /*
                         * initialize the choices and buckets with the values from the
                         * node content
                         */
                        this.initializeChoices();
                        this.initializeBuckets();
                        
                        // get the component state for the show previous work
                        var componentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(showPreviousWorkNodeId, showPreviousWorkComponentId);
                        
                        // populate the student work into this component
                        this.setStudentWork(componentState);
                        
                        // disable the component since we are just showing previous work
                        this.isDisabled = true;
                        
                        // get the component
                        var component = $scope.component;
                        
                        // register this component with the parent node
                        $scope.$parent.registerPartController($scope, component);
                    }));
                } else {
                    // this is a regular component
                    
                    /*
                     * initialize the choices and buckets with the values from the
                     * node content
                     */
                    this.initializeChoices();
                    this.initializeBuckets();
                    
                    // get the component from the scope
                    var component = $scope.component;
                    
                    // get the component state from the scope
                    var componentState = $scope.componentState;
                    
                    // populate the student work into this component
                    this.setStudentWork(componentState);
                    
                    // check if we need to lock this node
                    this.calculateDisabled();
                    
                    // register this component with the parent node
                    $scope.$parent.registerPartController($scope, component);
                }
            }
        };
        
        /**
         * Populate the student work into the node
         * @param nodeState the node state to populate into the node
         */
        this.setStudentWork = function(nodeState) {
            
            if (nodeState != null) {
                // populate the previous student work
                
                var studentData = nodeState.studentData
                
                if (studentData != null) {
                    
                    var nodeStateBuckets = studentData.buckets;
                    var nodeStateNumberOfSubmits = studentData.numberOfSubmits;
                    
                    // set the buckets
                    if (nodeStateBuckets != null) {
                        this.buckets = nodeStateBuckets;
                    }
                    
                    // set the number of submits
                    if (nodeStateNumberOfSubmits != null) {
                        this.numberOfSubmits = nodeStateNumberOfSubmits;
                    }
                }
            }
        };
        
        /**
         * Initialize the available choices from the node content
         */
        this.initializeChoices = function() {
            
            this.choices = [];
            
            if(this.componentContent != null && this.componentContent.choices != null) {
                this.choices = this.componentContent.choices;
            }
        };
        
        /**
         * Get the choices
         */
        this.getChoices = function() {
            return this.choices;
        };
        
        /**
         * Initialize the available buckets from the node content
         */
        this.initializeBuckets = function() {
            
            this.buckets = [];
            
            if(this.componentContent != null && this.componentContent.buckets != null) {
                
                // get the buckets from the node content
                var buckets = this.componentContent.buckets;
                
                /*
                 * create a bucket that will contain the choices when
                 * the student first starts working
                 */
                var originBucket = {};
                originBucket.id = 0;
                originBucket.value = 'Choices';
                originBucket.type = 'bucket';
                originBucket.items = [];
                
                var choices = this.getChoices();
                
                // add all the choices to the origin bucket
                for (var c = 0; c < choices.length; c++) {
                    var choice = choices[c];
                    
                    originBucket.items.push(choice);
                }
                
                // add the origin bucket to our array of buckets
                this.buckets.push(originBucket);
                
                // add all the other buckets to our array of buckets
                for (var b = 0; b < buckets.length; b++) {
                    var bucket = buckets[b];
                    
                    bucket.items = [];
                    
                    this.buckets.push(bucket);
                }
            }
        };
        
        /**
         * Get the buckets
         */
        this.getBuckets = function() {
            return this.buckets;
        };
        
        /**
         * Create a copy of the buckets for cases when we want to make
         * sure we don't accidentally change a bucket and have it also
         * change previous versions of the buckets.
         * @return a copy of the buckets
         */
        this.getCopyOfBuckets = function() {
            var buckets = this.getBuckets();
            
            // get a JSON string representation of the buckets
            var bucketsJSONString = angular.toJson(buckets);
            
            // turn the JSON string back into a JSON array
            var copyOfBuckets = angular.fromJson(bucketsJSONString);
            
            return copyOfBuckets;
        };
        
        /**
         * Called when the student clicks the save button
         */
        this.saveButtonClicked = function() {
            
            $scope.$emit('componentSaveClicked');
        };
        
        /**
         * Called when the student clicks the submit button
         */
        this.submitButtonClicked = function() {
            
            // check if the student answered correctly
            this.checkAnswer();
            this.numberOfSubmits++;
            
            // notify the parent that this child node has clicked submit
            $scope.$emit('componentSubmitClicked');
        };
        
        /**
         * Check if the student has answered correctly
         */
        this.checkAnswer = function() {
            var isCorrect = true;
            
            // get the buckets
            var buckets = this.getBuckets();
            
            if (buckets != null) {
                
                // loop through all the buckets
                for(var b = 0; b < buckets.length; b++) {
                    
                    // get a bucket
                    var bucket = buckets[b];
                    
                    if (bucket != null) {
                        var bucketId = bucket.id;
                        var items = bucket.items;
                        
                        if (items != null) {
                            
                            // loop through all the items in the bucket
                            for (var i = 0; i < items.length; i++) {
                                var item = items[i];
                                var position = i + 1;
                                
                                if (item != null) {
                                    var choiceId = item.id;
                                    
                                    // get the feedback object for the bucket and choice
                                    var feedbackObject = this.getFeedbackObject(bucketId, choiceId);
                                    
                                    if (feedbackObject != null) {
                                        var feedback = feedbackObject.feedback;
                                        
                                        var feedbackPosition = feedbackObject.position;
                                        var feedbackIsCorrect = feedbackObject.isCorrect;
                                        
                                        if (feedbackPosition == null) {
                                            /*
                                             * position does not matter and the choice may be
                                             * in the correct or incorrect bucket
                                             */
                                            
                                            // set the feedback into the item
                                            item.feedback = feedback;
                                            
                                            // set whether the choice is in the correct bucket
                                            item.isCorrect = feedbackIsCorrect;
                                            
                                            /*
                                             * there is no feedback position in the feeback object so
                                             * position doesn't matter
                                             */
                                            item.isIncorrectPosition = false;
                                            
                                            // update whether the student has answered the step correctly
                                            isCorrect = isCorrect && feedbackIsCorrect;
                                        } else {
                                            /*
                                             * position does matter and the choice is in a correct
                                             * bucket. we know this because a feedback object will
                                             * only have a non-null position value if the choice is
                                             * in the correct bucket. if the feedback object is for
                                             * a choice that is in an incorrect bucket, the position
                                             * value will be null.
                                             */
                                            
                                            if (position === feedbackPosition) {
                                                // the item is in the correct position
                                                
                                                // set the feedback into the item
                                                item.feedback = feedback;
                                                
                                                // set whether the choice is in the correct bucket
                                                item.isCorrect = feedbackIsCorrect;
                                                
                                                // the choice is in the correct position
                                                item.isIncorrectPosition = false;
                                                
                                                // update whether the student has answered the step correctly
                                                isCorrect = isCorrect && feedbackIsCorrect;
                                            } else {
                                                // item is in the correct bucket but wrong position
                                                
                                                /*
                                                 * get the feedback for when the choice is in the correct
                                                 * bucket but wrong position
                                                 */
                                                var incorrectPositionFeedback = feedbackObject.incorrectPositionFeedback;
                                                item.feedback = incorrectPositionFeedback;
                                                
                                                /*
                                                 * the choice is in the incorrect position so it isn't correct
                                                 */
                                                item.isCorrect = false;
                                                
                                                // the choice is in the incorrect position
                                                item.isIncorrectPosition = true;
                                                
                                                // the student has answered incorrectly
                                                isCorrect = false;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            /*
             * set the isCorrect value into the controller 
             * so we can read it later
             */
            this.isCorrect = isCorrect;
        };
        
        /**
         * Get the feedback object for the combination of bucket and choice
         * @param bucketId the bucket id
         * @param choiceId the choice id
         * @return the feedback object for the combination of bucket and choice
         */
        this.getFeedbackObject = function(bucketId, choiceId) {
            var feedbackObject = null;
            
            var componentContent = this.componentContent;
            
            if (componentContent != null) {
                
                // get the array of feedback objects
                var feedbackArray = componentContent.feedback;
                
                if (feedbackArray != null) {
                    
                    // loop througha ll the feedback objects
                    for (var f = 0; f < feedbackArray.length; f++) {
                        var tempFeedback = feedbackArray[f];
                        
                        if (tempFeedback != null) {
                            
                            var tempBucketId = tempFeedback.bucketId;
                            var tempChoiceId = tempFeedback.choiceId;
                            
                            // check if the bucket id and choice id matches
                            if (bucketId === tempBucketId && choiceId === tempChoiceId) {
                                // we have found the feedback object we want
                                feedbackObject = tempFeedback;
                                break;
                            }
                        }
                    }
                }
            }
            
            return feedbackObject;
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
            
            /*
             * this step is a node part so we will tell its parent that
             * the student work has changed and will need to be saved
             */
            
            // get this part id
            var componentId = this.getComponentId();
            
            // create a node state populated with the student data
            var componentState = this.createComponentState();
            
            /*
             * this step is a node part so we will tell its parent that
             * the student work has changed and will need to be saved.
             * this will also notify connected parts that this part's
             * student data has changed.
             */
            $scope.$emit('partStudentDataChanged', {componentId: componentId, componentState: componentState});
        };
        
        /**
         * Create a new component state populated with the student data
         * @return the componentState after it has been populated
         */
        this.createComponentState = function() {
            
            // create a new node state
            var componentState = NodeService.createNewComponentState();
            
            if (componentState != null) {
                // set the response into the node state
                var studentData = {};
                studentData.buckets = this.getCopyOfBuckets();
                studentData.numberOfSubmits = this.numberOfSubmits;
                
                if (this.isCorrect != null) {
                    studentData.isCorrect = this.isCorrect;
                }
                
                componentState.studentData = studentData;
                
                if(this.saveTriggeredBy != null) {
                    // set the saveTriggeredBy value
                    componentState.saveTriggeredBy = this.saveTriggeredBy;
                }
            }
            
            return componentState;
        };
        
        /**
         * Check if we need to lock the node
         */
        this.calculateDisabled = function() {
            
            var nodeId = this.nodeId;
            
            // get the node content
            var componentContent = this.componentContent;
            
            if (componentContent) {
                var lockAfterSubmit = componentContent.lockAfterSubmit;
                
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
            
            if (this.componentContent != null) {
                
                // check the showSaveButton field in the node content
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
                
                // check the showSubmitButton field in the node content
                if (this.componentContent.showSubmitButton) {
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
            
            if (this.componentContent != null) {
                prompt = this.componentContent.prompt;
            }
            
            return prompt;
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
         * Get the component id
         * @return the component id
         */
        this.getComponentId = function() {
            var componentId = this.componentContent.id;
            
            return componentId;
        };
        
        $scope.options = {
            accept: function(sourceNode, destNodes, destIndex) {
                var result = false;
                
                // get the value of the source node
                var data = sourceNode.$modelValue;
                
                // get the type of the nodes in the destination
                var destType = destNodes.$element.attr('data-type');
                
                if (data != null) {
                    
                    // check if the types match
                    if (data.type === destType) {
                        // the types match so we will accept it
                        result = true
                    }
                }
                
                return result;
            },
            dropped: function(event) {
                var sourceNode = event.source.nodeScope;
                var destNodes = event.dest.nodesScope;
                
                // tell the controller that the student data has changed
                $scope.matchController.studentDataChanged();
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
            
            var componentState = null;
            
            if ($scope.matchController.isDirty) {
                // create a component state populated with the student data
                componentState = $scope.matchController.createComponentState();
                
                // set isDirty to false since this student work is about to be saved
                $scope.matchController.isDirty = false;
            }
            
            return componentState;
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
    
});