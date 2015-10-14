define(['app', 'angular'], function(app, angular) {
    app.$controllerProvider.register('MatchController', 
        function($rootScope,
            $scope,
            $state, 
            $stateParams,
            ConfigService,
            MatchService,
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
        
        // whether the step should be disabled
        this.isDisabled = false;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        // whether this part is showing previous work
        this.isShowPreviousWork = false;

        // whether the student work is for a submit
        this.isSubmit = false;
        
        // the choices
        this.choices = [];
        
        // the buckets
        this.buckets = [];
        
        // the number of times the student has submitted
        this.numberOfSubmits = 0;
        
        // whether the student has correctly placed the choices
        this.isCorrect = null;
        
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

                    // get the component content for the component we are showing previous work for
                    this.componentContent = NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);

                    /*
                     * initialize the choices and buckets with the values from the
                     * component content
                     */
                    this.initializeChoices();
                    this.initializeBuckets();

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
                    
                    /*
                     * initialize the choices and buckets with the values from the
                     * component content
                     */
                    this.initializeChoices();
                    this.initializeBuckets();

                    // get the component state from the scope
                    var componentState = $scope.componentState;
                    
                    if (componentState == null) {
                        /*
                         * only import work if the student does not already have
                         * work for this component
                         */
                        
                        // check if we need to import work
                        var importWorkNodeId = this.componentContent.importWorkNodeId;
                        var importWorkComponentId = this.componentContent.importWorkComponentId;
                        
                        if (importWorkNodeId != null && importWorkComponentId != null) {
                            // import the work from the other component
                            this.importWork();
                        }
                    } else {
                        // populate the student work into this component
                        this.setStudentWork(componentState);
                    }
                    
                    // check if we need to lock this component
                    this.calculateDisabled();
                    
                    // register this component with the parent node
                    $scope.$parent.registerComponentController($scope, this.componentContent);
                }
            }
        };
        
        /**
         * Populate the student work into the component
         * @param componentState the component state to populate into the component
         */
        this.setStudentWork = function(componentState) {
            
            if (componentState != null) {
                
                // get the student data from the component state
                var studentData = componentState.studentData
                
                if (studentData != null) {
                    
                    // get the buckets and number of submits
                    var componentStateBuckets = studentData.buckets;
                    var componentStateNumberOfSubmits = studentData.numberOfSubmits;
                    
                    // set the buckets
                    if (componentStateBuckets != null) {
                        this.buckets = componentStateBuckets;
                    }
                    
                    // set the number of submits
                    if (componentStateNumberOfSubmits != null) {
                        this.numberOfSubmits = componentStateNumberOfSubmits;
                    }
                }
            }
        };
        
        /**
         * Initialize the available choices from the component content
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
         * Initialize the available buckets from the component content
         */
        this.initializeBuckets = function() {
            
            this.buckets = [];
            
            if(this.componentContent != null && this.componentContent.buckets != null) {
                
                // get the buckets from the component content
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
            
            // check if the student answered correctly
            this.checkAnswer();
            this.numberOfSubmits++;

            // tell the parent node that this component wants to submit
            $scope.$emit('componentSubmitTriggered', {nodeId: this.nodeId, componentId: this.componentId});
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
         * Create a new component state populated with the student data
         * @return the componentState after it has been populated
         */
        this.createComponentState = function() {
            
            // create a new component state
            var componentState = NodeService.createNewComponentState();
            
            if (componentState != null) {
                
                var studentData = {};
                
                // set the buckets into the student data
                studentData.buckets = this.getCopyOfBuckets();
                
                // set the number of submits into the student data
                studentData.numberOfSubmits = this.numberOfSubmits;
                
                if (this.isCorrect != null) {
                    // set whether the student was correct
                    studentData.isCorrect = this.isCorrect;
                }

                if (this.isSubmit) {
                    // the student submitted this work
                    componentState.isSubmit = this.isSubmit;

                    /*
                     * reset the isSubmit value so that the next component state
                     * doesn't maintain the same value
                     */
                    this.isSubmit = false;
                }
                
                //set the student data into the component state
                componentState.studentData = studentData;
            }
            
            return componentState;
        };
        
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
                            var populatedComponentState = MatchService.populateComponentState(importWorkComponentState);
                            
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
         * Get the component state from this component. The parent node will 
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a component state containing the student data
         */
        $scope.getComponentState = function() {
            
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
                    
                    // check if the student answered correctly
                    this.checkAnswer();
                    this.numberOfSubmits++;
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
    
});