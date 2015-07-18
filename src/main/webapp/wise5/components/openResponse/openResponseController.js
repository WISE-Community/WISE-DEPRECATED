define(['app'], function(app) {
    app.$controllerProvider.register('OpenResponseController', 
        function($rootScope,
            $scope,
            $state, 
            $stateParams,
            AnnotationService,
            ConfigService,
            CurrentNodeService,
            CRaterService,
            NodeService,
            OpenResponseService,
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
        
        // whether the step should be disabled
        this.isDisabled = false;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        // whether this component is showing previous work
        this.isShowPreviousWork = false;
        
        // used to hold a string that declares what triggered the save
        this.saveTriggeredBy = null;
        
        // whether the student work is for a submit
        this.isSubmit = false;
        
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
                
                // get the component id
                this.componentId = this.componentContent.id;
                
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
                        
                        // get the component content for the component we are showing previous work for
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
                    $scope.$parent.registerComponentController($scope, component);
                }
            }
            
            $('.openResponse').off('dragover').off('drop');
        };
        
        /**
         * Populate the student work into the component
         * @param componentState the component state to populate into the component
         */
        this.setStudentWork = function(componentState) {
            
            if (componentState != null) {
                var studentData = componentState.studentData;
                
                if (studentData != null) {
                    var response = studentData.response;
                    
                    if (response != null) {
                        // populate the text the student previously typed
                        this.studentResponse = response;
                    }
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
            
            $scope.$emit('componentSubmitClicked');
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
            
            // get the text the student typed
            var response = this.getStudentResponse();
            
            // set the response into the component state
            var studentData = {}
            studentData.response = response;
            
            // set the student data into the component state
            componentState.studentData = studentData;
            
            if (this.saveTriggeredBy == null) {
                /*
                 * the controller has not specified how this save was triggered
                 * which means it was triggered by an auto save from the parent
                 */
                componentState.saveTriggeredBy = 'autoSave';
            } else if (this.saveTriggeredBy != null) {
                // set the saveTriggeredBy value
                componentState.saveTriggeredBy = this.saveTriggeredBy;
            }
            
            if (this.isSubmit) {
                // the student submitted this work
                componentState.isSubmit = this.isSubmit;
            }
            
            return componentState;
        };
        
        /**
         * Check if we need to lock the component
         */
        this.calculateDisabled = function() {
            
            // get the component content
            var componentContent = this.componentContent;
            
            if (componentContent != null) {
                
                // check if the parent has set this component to disabled
                if (componentContent.isDisabled) {
                    this.isDisabled = true;
                } else if (componentContent.lockAfterSubmit) {
                    // we need to lock the component after the student has submitted
                    
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
        
        this.makeCRaterRequest = function(nodeState, nodeVisit) {
            var componentContent = this.componentContent;
            
            if (componentContent != null && componentContent.cRater != null) {
                var cRaterSettings = componentContent.cRater;
                var cRaterItemType = cRaterSettings.cRaterItemType;
                var cRaterItemId = cRaterSettings.cRaterItemId;
                var cRaterRequestType = 'scoring';
                var cRaterResponseId = new Date().getTime();
                var studentData = nodeState.studentData;
                var nodeState = nodeState;
                var nodeVisit = nodeVisit;
                CRaterService
                    .makeCRaterRequest(cRaterItemType, cRaterItemId, cRaterRequestType, cRaterResponseId, studentData, nodeState, nodeVisit)
                    .then(angular.bind(this, function(response) {
                        this.handleCRaterResponse(response);
                    }));
            }
        };
        
        this.handleCRaterResponse = function(response) {
            var nodeId = this.nodeId;
            var nodeState = response.nodeState;
            var nodeVisit = response.nodeVisit;
            var nodeVisitId = nodeVisit.id;
            var runId = ConfigService.getRunId();
            var cRaterItemId = response.config.params.itemId;
            var cRaterItemType = response.config.params.cRaterItemType;

            // get the score and concepts the student received
            var cRaterResponse = response.data;
            var score = cRaterResponse.score;
            var concepts = cRaterResponse.concepts;

            // now find the feedback that the student should see
            var cRaterStepContent = this.componentContent.cRater;
            var scoringRules = cRaterStepContent.cRaterScoringRules;
            var maxScore = cRaterStepContent.cRaterMaxScore;

            // get the feedback for the given concepts the student satisfied
            var feedbackTextObject = CRaterService.getCRaterFeedback(scoringRules, concepts, score, cRaterItemType);

            // get the feedback text and feedback id
            var feedbackText = feedbackTextObject.feedbackText;
            var feedbackId = feedbackTextObject.feedbackId;

            //handle multipleAttemptFeedback, if this step has it enabled
            /*
            if (cRaterStepContent.enableMultipleAttemptFeedbackRules && 
                cRaterStepContent.multipleAttemptFeedbackRules != null &&
                cRaterStepContent.multipleAttemptFeedbackRules.rules != null &&
                cRaterStepContent.multipleAttemptFeedbackRules.rules.length > 0) {
                
                var authoredScoreSequenceRules = cRaterStepContent.multipleAttemptFeedbackRules.rules;
                var fromWorkgroups = [-1];
                var type = "autoGraded";
            
                // get the last annotation, if exists
                var latestCRaterAnnotation = view.model.annotations.getLatestAnnotation(runId, nodeId, toWorkgroupId, fromWorkgroups, type);
                if (latestCRaterAnnotation != null && latestCRaterAnnotation.value.length > 0) {
                    var lastCRaterAnnotation = latestCRaterAnnotation.value[latestCRaterAnnotation.value.length-1];
                    if (lastCRaterAnnotation != null && lastCRaterAnnotation.autoScore) {
                        var lastCRaterScore = lastCRaterAnnotation.autoScore;
                                                    
                        // test against authored scoreSequences
                        for (var ruleIndex = 0; ruleIndex < authoredScoreSequenceRules.length; ruleIndex++) {
                            var ruleScoreSequenceLastScore = authoredScoreSequenceRules[ruleIndex].scoreSequence[0];
                            var ruleScoreSequenceCurrentScore = authoredScoreSequenceRules[ruleIndex].scoreSequence[1];
                            
                            if (lastCRaterScore.toString().match("["+ruleScoreSequenceLastScore+"]") &&
                                    score.toString().match("["+ruleScoreSequenceCurrentScore+"]")) {
                                feedbackText = authoredScoreSequenceRules[ruleIndex].feedback;
                                feedbackId = authoredScoreSequenceRules[ruleIndex].id;
                                break;
                            }
                        }                       
                    }
                }
            }
            */
            
            // get the node state timestamp which we will use as the node state id
            var nodeStateId = nodeState.timestamp;            
            
            //create the auto graded annotation value
            var annotationValue = {
                autoScore: score,
                maxAutoScore: maxScore,
                autoFeedback: feedbackText,
                concepts: concepts,
                nodeStateId:nodeStateId
            }
            
            var annotationType = 'autoGraded';
            
            // add the auto graded annotation value to the auto graded annotation for this step current node visit
            var fromWorkgroup = -1;
            var toWorkgroup = ConfigService.getWorkgroupId();;
            var postTime = null;
                
            var annotation = AnnotationService.createAnnotation(annotationType, nodeId, annotationValue, nodeVisitId, runId, fromWorkgroup, toWorkgroup, postTime);
            AnnotationService.saveAnnotation(annotation);
            
            // check if we need to display the auto score or auto feedback to the student
            var displayCRaterScoreToStudent = cRaterStepContent.displayCRaterScoreToStudent;
            var displayCRaterFeedbackToStudent = cRaterStepContent.displayCRaterFeedbackToStudent;

            if (displayCRaterScoreToStudent || displayCRaterFeedbackToStudent) {
                // we will display the score or feedback (or both) to the student

                var hasScore = false;
                var hasFeedback = false;
                
                var cRaterFeedbackStringSoFar = "<span class='nodeAnnotationsCRater'>";

                if (displayCRaterScoreToStudent) {
                    if (score != null && score != "") {
                        // the student has received a score
                        hasScore = true;
                    }
                }

                if(displayCRaterFeedbackToStudent) {
                    if (feedbackText != null && feedbackText != "") {
                        // the student has received feedback
                        hasFeedback = true;
                    }
                }

                if (hasScore || hasFeedback) {
                    if (!suppressFeedback) {
                        // popup the auto graded annotation to the student
                        eventManager.fire("showNodeAnnotations", [nodeId]);                      
                    }
                }
                
                // handle rewrite/revise
                if (score != null) {
                    //get the student action for the given score
                    var studentAction = or.getStudentAction(score);
                    
                    if (studentAction == null) {
                        //do nothing
                    } else if (studentAction == 'rewrite') {
                        //
                        // move the current work to the previous work response box
                        // because we want to display the previous work to the student
                        // and have them re-write another response after they
                        // receive the immediate CRater feedback
                        //
                        or.showPreviousWorkThatHasAnnotation(studentData);
                        
                        //clear the response box so they will need to write a new response
                        $('#responseBox').val('');
                    } else if (studentAction == 'revise') {
                        //
                        // the student will need to revise their work so we will hide the
                        // previous response display
                        //
                        $('#previousResponseDisplayDiv').hide();
                    }
                }
            }
            
            // this student work was graded by CRater
            nodeState.checkWork = true;
            
            // check if we need to disable the check answer button
            if ((or.content.cRater != null && or.content.cRater.maxCheckAnswers != null && or.isCRaterMaxCheckAnswersUsedUp()) || or.isLocked()) {
                //student has used up all of their CRater check answer submits so we will disable the check answer button
                or.setCheckAnswerUnavailable();
            } else {
                //the student still has check answer submits available
                or.setCheckAnswerAvailable();
            }
            
            // process the student work to see if we need to activate any 
            // teacher notifications
            // or.processTeacherNotifications(nodeVisit, nodeState, cRaterResponse);
            
            // save the student work to the server immediately
            view.getProject().getNodeById(nodeId).save(nodeState);            
            
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
                var latestNodeState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
                if (latestNodeState != null) {
                    var latestResponse = latestNodeState.studentData;
                    if (latestResponse != null) {
                        populatedNodeState.studentData = latestResponse + populatedNodeState.studentData;
                    }
                }
                
                this.setStudentWork(populatedNodeState);
                this.studentResponseChanged()
            } else if (objectType === 'StudentAsset') {
                var studentAsset = $(ui.helper.context).data('objectData');
                StudentAssetService.copyAssetForReference(studentAsset).then(angular.bind(this, function(copiedAsset) {
                    if (copiedAsset != null) {
                        var nodeState = StudentDataService.createComponentState();
                        var copiedAssetImg = '<img id="' + copiedAsset.url + '" class="studentAssetReference" src="' + copiedAsset.iconURL + '"></img>';
                        
                        var latestNodeState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
                        
                        if (this.isDirty && this.studentResponse != null) {
                            // if student has edited but not saved yet, append student asset to the unsaved work
                            nodeState.studentData = this.studentResponse + copiedAssetImg;
                        } else if (latestNodeState != null && latestNodeState.studentData != null) {
                            // if student already has saved work, prepend it
                            nodeState.studentData = latestNodeState.studentData + copiedAssetImg;
                        } else {
                            // otherwise, just use the asset image
                            nodeState.studentData = copiedAssetImg;
                        }
                        this.setStudentWork(nodeState);
                        this.studentResponseChanged();
                    }
                }));
            }
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
                            var populatedComponentState = OpenResponseService.populateComponentState(importWorkComponentState);
                            
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
         * Get the component state from this component. The parent node will 
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a component state containing the student data
         */
        $scope.getComponentState = function() {
            
            var componentState = null;
            
            if ($scope.openResponseController.isDirty) {
                // create a component state populated with the student data
                componentState = $scope.openResponseController.createComponentState();
                
                // set isDirty to false since this student work is about to be saved
                $scope.openResponseController.isDirty = false;
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
                
            }));
        };
        
        // perform setup of this component
        this.setup();
    });
});