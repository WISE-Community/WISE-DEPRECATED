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
        
        // field that will hold the node content
        this.nodeContent = null;
        
        // holds the text that the student has typed
        this.studentResponse = '';
        
        // whether the step should be disabled
        this.isDisabled = false;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        // whether this is part of another node such as a Questionnaire node
        this.isNodePart = false;
        
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
            } else {
                // this is a regular standalone node
                var nodeSrc = ProjectService.getNodeSrcByNodeId(this.nodeId);
                
                // get the node content for this node
                NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
                    
                    this.nodeContent = nodeContent;
                    
                    // get the latest node state
                    var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                    
                    // popualte the student work into this node
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
            
            $('.openResponse').off('dragover').off('drop');
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
         * Called when the student changes their text response
         */
        this.studentResponseChanged = function() {
            /*
             * set the dirty flag so we will know we need to save the 
             * student work later
             */
            this.isDirty = true;
            
            if (this.isNodePart) {
                /*
                 * this step is a node part so we will tell its parent that
                 * the student work is dirty and will need to be saved
                 */
                $scope.$emit('isDirty');
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
                        
                        // create the node state
                        nodeState = NodeService.createNewNodeState();
                        
                        // set the values into the node state
                        nodeState.studentData = this.getStudentResponse();
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
        
        this.makeCRaterRequest = function(nodeState, nodeVisit) {
            var nodeContent = this.nodeContent;
            
            if (nodeContent != null && nodeContent.cRater != null) {
                var cRaterSettings = nodeContent.cRater;
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
            var cRaterStepContent = this.nodeContent.cRater;
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
                var latestNodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
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
                        var nodeState = StudentDataService.createNodeState();
                        var copiedAssetImg = '<img id="' + copiedAsset.url + '" class="studentAssetReference" src="' + copiedAsset.iconURL + '"></img>';
                        
                        var latestNodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                        
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
         * Get the student work object that will contain the student
         * work for the node. This is only used when this node is
         * part of another node such as a Questionnaire node.
         * The Questionnaire node will call this function to obtain
         * the student work.
         * @return an object containing the student work
         */
        $scope.getStudentWorkObject = function() {
            var studentWork = {};
            
            // get the text the student typed
            var studentResponse = $scope.openResponseController.studentResponse;
            
            if (studentResponse != null) {
                /*
                 * set the student response into the student data field in the
                 * student work
                 */
                studentWork.studentData = studentResponse;
            }
            
            return studentWork;
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