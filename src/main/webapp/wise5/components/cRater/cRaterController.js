define(['app'], function (app) {
    app.$controllerProvider.register('CRaterController',
        function ($rootScope,
                  $scope,
                  $state,
                  $stateParams,
                  ConfigService,
                  CurrentNodeService,
                  NodeService,
                  CRaterService,
                  ProjectService,
                  SessionService,
                  StudentDataService) {

            // the node id of the current node
            this.nodeId = null;

            // the component id
            this.componentId = null;

            // field that will hold the component content
            this.componentContent = null;

            // holds the text that the student has typed
            this.studentResponse = '';

            // holds unsaved annotation
            this.unSavedAnnotation;

            // whether the step should be disabled
            this.isDisabled = false;

            // whether the student work is dirty and needs saving
            this.isDirty = false;

            // whether the student work is for a submit
            this.isSubmit = false;

            /**
             * Perform setup of the component
             */
            this.setup = function () {

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
            };

            /**
             * Populate the student work into the component
             * @param componentState the component state to populate into the component
             */
            this.setStudentWork = function (componentState) {

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
            this.saveButtonClicked = function () {

                // tell the parent node that this component wants to save
                $scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
            };

            /**
             * Called when the student clicks the submit button
             */
            this.submitButtonClicked = function () {
                this.isSubmit = true;

                // check if we need to lock the component after the student submits
                if (this.isLockAfterSubmit()) {
                    this.isDisabled = true;
                }

                // get the text the student typed
                var response = this.getStudentResponse();

                this.makeCRaterRequest(response);

                // tell the parent node that this component wants to submit
                //$scope.$emit('componentSubmitTriggered', {nodeId: this.nodeId, componentId: this.componentId});
            };

            /**
             * Called when the student changes their work
             */
            this.studentDataChanged = function () {
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
            this.getStudentResponse = function () {
                return this.studentResponse;
            };

            /**
             * Create a new component state populated with the student data
             * @return the componentState after it has been populated
             */
            this.createComponentState = function () {

                // create a new component state
                var componentState = NodeService.createNewComponentState();

                // get the text the student typed
                var response = this.getStudentResponse();

                // set the response into the component state
                var studentData = {};
                studentData.response = response;

                if (this.isSubmit) {
                    // the student submitted this work
                    studentData.isSubmit = this.isSubmit;

                    /*
                     * reset the isSubmit value so that the next component state
                     * doesn't maintain the same value
                     */
                    this.isSubmit = false;
                }

                // set the student data into the component state
                componentState.studentData = studentData;

                return componentState;
            };

            /**
             * Check if we need to lock the component
             */
            this.calculateDisabled = function () {

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
            this.showSaveButton = function () {
                return this.componentContent != null && this.componentContent.showSaveButton;
            };

            /**
             * Check whether we need to show the submit button
             * @return whether to show the submit button
             */
            this.showSubmitButton = function () {
                return this.componentContent != null && this.componentContent.showSubmitButton;
            };

            /**
             * Check whether we need to lock the component after the student
             * submits an answer.
             */
            this.isLockAfterSubmit = function () {
                var result = false;

                if (this.componentContent != null) {

                    // check the lockAfterSubmit field in the component content
                    if (this.componentContent.lockAfterSubmit) {
                        result = true;
                    }
                }

                return result;
            };

            this.makeCRaterRequest = function (studentData) {
                var componentContent = this.componentContent;

                if (componentContent != null) {
                    var cRaterItemType = componentContent.cRaterItemType;
                    var cRaterItemId = componentContent.cRaterItemId;
                    var cRaterRequestType = 'scoring';
                    var cRaterResponseId = new Date().getTime(); // used to keep track of this cRater request
                    CRaterService
                        .makeCRaterRequest(cRaterItemType, cRaterItemId, cRaterRequestType, cRaterResponseId, studentData)
                        .then(angular.bind(this, function (response) {
                            this.handleCRaterResponse(response);
                        }));
                }
            };

            // create a cRater annotation based on the response and POST to server along with ComponentState
            this.handleCRaterResponse = function (response) {
                var runId = ConfigService.getRunId();
                var nodeId = this.nodeId;
                var componentId = this.componentId;
                var cRaterItemId = response.config.params.itemId;
                var cRaterItemType = response.config.params.cRaterItemType;

                // get the score and concepts the student received
                var cRaterResponse = response.data;
                var score = cRaterResponse.score;
                var concepts = cRaterResponse.concepts;

                // now find the feedback that the student should see
                var scoringRules = this.componentContent.cRaterScoringRules;
                var maxScore = this.componentContent.cRaterMaxScore;

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
                //var nodeStateId = nodeState.timestamp;

                // add the auto graded annotation value to the auto graded annotation for this step current node visit
                var annotationId = null;
                var periodId = ConfigService.getPeriodId();
                var fromWorkgroupId = null;
                var toWorkgroupId = ConfigService.getWorkgroupId();
                var componentStateId = null; // we haven't saved the componentState yet.
                // It will be saved along with this annotation. and the server will set it for us
                var annotationType = "autoGraded";

                //create the auto graded annotation value
                var data = {
                    autoScore: score,
                    maxAutoScore: maxScore,
                    autoFeedback: feedbackText,
                    concepts: concepts,
                    autoGrader: "cRater"
                };

                var clientSaveTime = Date.parse(new Date());

                this.unSavedAnnotation = StudentDataService.createAnnotation(
                    annotationId, runId, periodId, fromWorkgroupId, toWorkgroupId,
                    nodeId, componentId, componentStateId,
                    annotationType, data, clientSaveTime);

                // check if we need to display the auto score or auto feedback to the student
                var displayCRaterScoreToStudent = this.componentContent.displayCRaterScoreToStudent;
                var displayCRaterFeedbackToStudent = this.componentContent.displayCRaterFeedbackToStudent;

                if (displayCRaterScoreToStudent || displayCRaterFeedbackToStudent) {
                    // we will display the score or feedback (or both) to the student

                    var hasScore = false;
                    var hasFeedback = false;

                    if (displayCRaterScoreToStudent) {
                        if (score != null && score != "") {
                            // the student has received a score
                            hasScore = true;
                        }
                    }

                    if (displayCRaterFeedbackToStudent) {
                        if (feedbackText != null && feedbackText != "") {
                            // the student has received feedback
                            hasFeedback = true;
                        }
                    }

                    if (hasScore || hasFeedback) {
                        alert("[WISE5 temporary feedback display]\n\n Score: " + score + "\nFeedback: " + feedbackText);
                        // popup the auto graded annotation to the student
                        //eventManager.fire("showNodeAnnotations", [nodeId]);
                    }

                    // handle rewrite/revise
                    /*
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
                    */
                }


                // this student work was graded by CRater
                //nodeState.checkWork = true;

                // check if we need to disable the check answer button
                /*
                if ((or.content.cRater != null && or.content.cRater.maxCheckAnswers != null
                    && or.isCRaterMaxCheckAnswersUsedUp()) || or.isLocked()) {
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
                */

                // tell NodeController to save both the ComponentState and the Annotation
                $scope.$emit('componentSubmitTriggered', {nodeId: nodeId, componentId: componentId});
            };

            /**
             * Get the prompt to show to the student
             */
            this.getPrompt = function () {
                var prompt = null;

                if (this.componentContent != null) {
                    prompt = this.componentContent.prompt;
                }

                return prompt;
            };

            /**
             * Get the number of rows for the textarea
             */
            this.getNumRows = function () {
                var numRows = null;

                if (this.componentContent != null) {
                    numRows = this.componentContent.numRows;
                }

                return numRows;
            };

            /**
             * Get the number of columns for the textarea
             */
            this.getNumColumns = function () {
                var numColumns = null;

                if (this.componentContent != null) {
                    numColumns = this.componentContent.numColumns;
                }

                return numColumns;
            };

            /**
             * Get the text the student typed
             */
            this.getResponse = function () {
                var response = null;

                if (this.studentResponse != null) {
                    response = this.studentResponse;
                }

                return response;
            };

            /**
             * Import work from another component
             */
            this.importWork = function () {

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
                        if (componentState == null) {
                            // the student has not done any work for this component

                            // get the latest component state from the component we are importing from
                            var importWorkComponentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importWorkNodeId, importWorkComponentId);

                            if (importWorkComponentState != null) {
                                /*
                                 * populate a new component state with the work from the
                                 * imported component state
                                 */
                                var populatedComponentState = CRaterService.populateComponentState(importWorkComponentState);

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
            this.getComponentId = function () {
                return this.componentContent.id;
            };

            /**
             * Get the component state from this component. The parent node will
             * call this function to obtain the component state when it needs to
             * save student data.
             * @return a component state containing the student data
             */
            $scope.getComponentState = function () {

                var componentState = null;

                if ($scope.cRaterController.isDirty) {
                    // create a component state populated with the student data
                    componentState = $scope.cRaterController.createComponentState();

                    // set isDirty to false since this student work is about to be saved
                    $scope.cRaterController.isDirty = false;
                }

                return componentState;
            };

            /**
             * Get the component state from this component. The parent node will
             * call this function to obtain the component state when it needs to
             * save student data.
             * @return a component state containing the student data
             */
            $scope.getUnSavedAnnotation = function () {
                return $scope.cRaterController.unSavedAnnotation;
            };

            /**
             * Get the component state from this component. The parent node will
             * call this function to obtain the component state when it needs to
             * save student data.
             * @return a component state containing the student data
             */
            $scope.setUnSavedAnnotation = function (unSavedAnnotation) {
                $scope.cRaterController.unSavedAnnotation = unSavedAnnotation;
            };

            /**
             * The parent node submit button was clicked
             */
            $scope.$on('nodeSubmitClicked', angular.bind(this, function (event, args) {

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
            $scope.$on('exitNode', angular.bind(this, function (event, args) {

            }));

            /**
             * Register the the listener that will listen for the exit event
             * so that we can perform saving before exiting.
             */
            this.registerExitListener = function () {

                /*
                 * Listen for the 'exit' event which is fired when the student exits
                 * the VLE. This will perform saving before the VLE exits.
                 */
                this.exitListener = $scope.$on('exit', angular.bind(this, function (event, args) {

                }));
            };

            // perform setup of this component
            this.setup();
        });
});