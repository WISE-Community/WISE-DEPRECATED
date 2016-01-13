'use strict';

define(['configService'], function (configService) {

    var service = ['$http', 'ConfigService', function ($http, ConfigService) {
        var serviceObject = {};

        serviceObject.config = null;

        serviceObject.getConfig = function () {
            return this.config;
        };

        /**
         * Make the request to CRater to score the student work
         * @param cRaterItemType [CRATER,HENRY]
         * @param cRaterItemId [GREENROOF-II,SPOON,...]
         * @param cRaterRequestType [scoring,verify]
         * @param cRaterResponseId ID to keep track of this crater request
         * @param studentData student work
         */
        serviceObject.makeCRaterRequest = function (cRaterItemType, cRaterItemId, cRaterRequestType, cRaterResponseId, studentData) {
            //gather the arguments to make the CRater request
            //var cRaterItemType = this.content.cRater.cRaterItemType;
            //var cRaterItemId = this.content.cRater.cRaterItemId;
            //var cRaterRequestType = 'scoring';
            //var cRaterResponseId = new Date().getTime();
            //var studentData = nodeState.response;
            //var nodeVisit = this.view.getState().getCurrentNodeVisit();
            //var timeout = waitTime * 1000;

            //create the object that will be accessible in the callback function
            /*
            var callbackData = {
                    view:this.view,
                    nodeId:this.node.id,
                    cRaterItemType:cRaterItemType,
                    studentData:studentData,
                    or:this,
                    orState:nodeState,
                    nodeVisit:nodeVisit
            };
            */

            // invoke CRater in preview mode.
            var config = {};
            config.method = 'GET';
            config.url = ConfigService.getCRaterRequestURL();
            config.params = {
                cRaterItemType: cRaterItemType,
                itemId: cRaterItemId,
                cRaterRequestType: cRaterRequestType,
                responseId: cRaterResponseId,
                studentData: studentData,
                wiseRunMode: 'preview'
            };

            // GET the annotation
            return $http(config).then(angular.bind(this, function (response) {
                return response;
            }));
        };

        /**
         * Get the feedback for the given concepts
         * @param scoringRules an array of scoring rules
         * @param concepts a string containing the concepts
         * @param score the score
         * @param cRaterItemType the crater item type e.g. 'CRATER' or 'HENRY'
         * @returns the feedback
         */
        serviceObject.getCRaterFeedback = function (scoringRules, concepts, score, cRaterItemType) {
            var feedbackSoFar = "No Feedback";
            var maxScoreSoFar = 0;

            if (scoringRules) {
                //loop through all the scoring rules
                for (var i = 0; i < scoringRules.length; i++) {
                    //get a scoring rule
                    var scoringRule = scoringRules[i];

                    if (cRaterItemType === null || cRaterItemType === 'CRATER') {
                        if (this.satisfiesCRaterRulePerfectly(concepts, scoringRule.concepts)) {
                            //the concepts perfectly match this scoring rule

                            //if this scoring rule has more than one feedback, choose one randomly
                            feedbackSoFar = this.chooseFeedbackRandomly(scoringRule.feedback);

                            //no longer need to check other rules if we have a pefect match
                            break;
                        } else if (scoringRule.score > maxScoreSoFar && this.satisfiesCRaterRule(concepts, scoringRule.concepts, parseInt(scoringRule.numMatches))) {
                            /*
                             * the concepts match this scoring rule but we still need to
                             * look at the other scoring rules to make sure there aren't
                             * any better matches that will give the student a better score
                             */

                            //if this scoring rule has more than one feedback, choose one randomly
                            feedbackSoFar = this.chooseFeedbackRandomly(scoringRule.feedback);
                            maxScoreSoFar = scoringRule.score;
                        }
                    } else if (cRaterItemType == 'HENRY') {
                        //get the score for this scoring rule
                        var scoringRuleScore = scoringRule.score;

                        if (score == scoringRuleScore) {
                            //if this scoring rule has more than one feedback, choose one randomly
                            feedbackSoFar = this.chooseFeedbackRandomly(scoringRule.feedback);
                        }
                    }
                }
            }

            return feedbackSoFar;
        };

        /**
         * If the feedback is an array we will choose one of the elements at random.
         * If the feedback is a string we will just return the string.
         * @param feedback a string or an array of strings
         * @return a feedback string
         */
        serviceObject.chooseFeedbackRandomly = function (feedback) {
            var chosenFeedback = "";

            if (feedback == null) {
                //feedback is null
            } else if (feedback.constructor.toString().indexOf("String") != -1) {
                    //feedback is a string
                    chosenFeedback = feedback;
                } else if (feedback.constructor.toString().indexOf("Array") != -1) {
                    //feedback is an array

                    if (feedback.length > 0) {
                        /*
                         * randomly choose one of the elements in the array
                         * Math.random() returns a value between 0 and 1
                         * Math.random() * feedback.length returns a value between 0 and feedback.length (not inclusive)
                         * Math.floor(Math.random() * feedback.length) returns an integer between 0 and feedback.length (not inclusive)
                         */
                        var index = Math.floor(Math.random() * feedback.length);
                        chosenFeedback = feedback[index];
                    }
                }

            return chosenFeedback;
        };

        /**
         * Returns the string of concepts converted into an array
         * @param conceptsString, can be "1,2,3" or "1-4" or "1-4,7" or ""
         * @return array [1,2,3], [1,2,3,4], [1,2,3,4,7], []
         */
        serviceObject.convertCRaterConceptsToArray = function (conceptsString) {
            var allConcepts = [];
            if (conceptsString && conceptsString != "") {
                var conceptsArr = conceptsString.split(",");
                for (var i = 0; i < conceptsArr.length; i++) {
                    var conceptsElement = conceptsArr[i];
                    if (conceptsElement.indexOf("-") >= 0) {
                        var conceptsElementArr = conceptsElement.split("-");
                        for (var k = conceptsElementArr[0]; k <= conceptsElementArr[1]; k++) {
                            allConcepts.push(parseInt(k));
                        }
                    } else {
                        allConcepts.push(parseInt(conceptsElement));
                    }
                }
            }
            return allConcepts;
        };

        /**
         * Return true iff the specified studentConcepts exactly matches the specified ruleConcepts
         * @param studentConcepts string of concepts the student got. like "1,2"
         * @param ruleConcepts string of concepts in the rule. looks like "1", "1,2", "1-4"
         */
        serviceObject.satisfiesCRaterRulePerfectly = function (studentConcepts, ruleConcepts) {
            var studentConceptsArr = this.convertCRaterConceptsToArray(studentConcepts);
            var ruleConceptsArr = this.convertCRaterConceptsToArray(ruleConcepts);
            return studentConceptsArr.length == ruleConceptsArr.length && studentConceptsArr.compare(ruleConceptsArr);
        };

        /**
         * Return true iff the specified studentConcepts matches the specified ruleConcepts numMatches or more times
         * @param studentConcepts string of concepts the student got
         * @param ruleConcepts string of concepts in the rule
         * @param numMatches number of concepts that need to match to be true.
         */
        serviceObject.satisfiesCRaterRule = function (studentConcepts, ruleConcepts, numMatches) {
            var studentConceptsArr = this.convertCRaterConceptsToArray(studentConcepts);
            var ruleConceptsArr = this.convertCRaterConceptsToArray(ruleConcepts);
            var countMatchSoFar = 0; // keep track of matched concepts
            for (var i = 0; i < studentConceptsArr.length; i++) {
                var studentConcept = studentConceptsArr[i];
                if (ruleConceptsArr.indexOf(studentConcept) >= 0) {
                    countMatchSoFar++;
                }
            }
            return countMatchSoFar >= numMatches;
        };

        /**
         * The success callback for making the CRater request
         * @param responseText the response from CRater
         * @param responseJSON the response from CRater
         * @param successArgs the arguments passed to the callback function
         */
        serviceObject.cRaterRequestSuccessCallback = function (responseText, responseJSON, successArgs) {
            var view = successArgs.view;
            var nodeId = successArgs.nodeId;
            var or = successArgs.or;
            var studentData = successArgs.studentData;
            var currentNode = view.getProject().getNodeById(nodeId); //get the node                           
            var cRaterItemId = successArgs.cRaterItemId; //get the crater item id e.g. "SPOON", "GREENROOF-II"
            var cRaterItemType = successArgs.cRaterItemType; //get the crater item type e.g. 'CRATER' or 'HENRY'
            var orState = successArgs.orState;
            var nodeVisit = successArgs.nodeVisit;
            var runId = view.getConfig().getConfigParam('runId');
            var toWorkgroupId = view.getUserAndClassInfo().getWorkgroupId();
            var suppressFeedback = successArgs.suppressFeedback;
            var stepContent = view.getProject().getNodeById(nodeId).content.getContentJSON();

            if (responseJSON != null) {
                try {
                    //get the CRater response text
                    var cRaterResponse = JSON.parse(responseText);

                    //get the CRater step content
                    var cRaterStepContent = view.getProject().getNodeById(nodeId).content.getContentJSON().cRater;

                    //get the score and concepts the student received
                    var score = cRaterResponse.score;
                    var concepts = cRaterResponse.concepts;

                    // now find the feedback that the student should see
                    var scoringRules = cRaterStepContent.cRaterScoringRules;
                    var maxScore = cRaterStepContent.cRaterMaxScore;

                    //get the feedback for the given concepts the student satisfied
                    var feedbackTextObject = view.getCRaterFeedback(scoringRules, concepts, score, cRaterItemType);

                    //get the feedback text and feedback id
                    var feedbackText = feedbackTextObject.feedbackText;
                    var feedbackId = feedbackTextObject.feedbackId;

                    //handle multipleAttemptFeedback, if this step has it enabled
                    if (cRaterStepContent.enableMultipleAttemptFeedbackRules && cRaterStepContent.multipleAttemptFeedbackRules != null && cRaterStepContent.multipleAttemptFeedbackRules.rules != null && cRaterStepContent.multipleAttemptFeedbackRules.rules.length > 0) {

                        var authoredScoreSequenceRules = cRaterStepContent.multipleAttemptFeedbackRules.rules;
                        var fromWorkgroups = [-1];
                        var type = "autoGraded";

                        // get the last annotation, if exists
                        var latestCRaterAnnotation = view.model.annotations.getLatestAnnotation(runId, nodeId, toWorkgroupId, fromWorkgroups, type);
                        if (latestCRaterAnnotation != null && latestCRaterAnnotation.value.length > 0) {
                            var lastCRaterAnnotation = latestCRaterAnnotation.value[latestCRaterAnnotation.value.length - 1];
                            if (lastCRaterAnnotation != null && lastCRaterAnnotation.autoScore) {
                                var lastCRaterScore = lastCRaterAnnotation.autoScore;

                                // test against authored scoreSequences
                                for (var ruleIndex = 0; ruleIndex < authoredScoreSequenceRules.length; ruleIndex++) {
                                    var ruleScoreSequenceLastScore = authoredScoreSequenceRules[ruleIndex].scoreSequence[0];
                                    var ruleScoreSequenceCurrentScore = authoredScoreSequenceRules[ruleIndex].scoreSequence[1];

                                    if (lastCRaterScore.toString().match("[" + ruleScoreSequenceLastScore + "]") && score.toString().match("[" + ruleScoreSequenceCurrentScore + "]")) {
                                        feedbackText = authoredScoreSequenceRules[ruleIndex].feedback;
                                        feedbackId = authoredScoreSequenceRules[ruleIndex].id;
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    //get the node state timestamp which we will use as the node state id
                    var nodeStateId = orState.timestamp;

                    //create the auto graded annotation value
                    var annotationValue = {
                        autoScore: score,
                        maxAutoScore: maxScore,
                        autoFeedback: feedbackText,
                        concepts: concepts,
                        nodeStateId: nodeStateId
                    };

                    //add the auto graded annotation value to the auto graded annotation for this step current node visit
                    view.addAutoGradedAnnotation(nodeVisit, annotationValue);

                    //check if we need to display the auto score or auto feedback to the student
                    var displayCRaterScoreToStudent = cRaterStepContent.displayCRaterScoreToStudent;
                    var displayCRaterFeedbackToStudent = cRaterStepContent.displayCRaterFeedbackToStudent;

                    if (displayCRaterScoreToStudent || displayCRaterFeedbackToStudent) {
                        //we will display the score or feedback (or both) to the student

                        var hasScore = false;
                        var hasFeedback = false;

                        if (displayCRaterScoreToStudent) {
                            if (score != null && score != "") {
                                //the student has received a score
                                hasScore = true;
                            }
                        }

                        if (displayCRaterFeedbackToStudent) {
                            if (feedbackText != null && feedbackText != "") {
                                //the student has received feedback
                                hasFeedback = true;
                            }
                        }

                        if (hasScore || hasFeedback) {
                            if (!suppressFeedback) {
                                //popup the auto graded annotation to the student
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
                                    /*
                                     * move the current work to the previous work response box
                                     * because we want to display the previous work to the student
                                     * and have them re-write another response after they
                                     * receive the immediate CRater feedback
                                     */
                                    or.showPreviousWorkThatHasAnnotation(studentData);

                                    //clear the response box so they will need to write a new response
                                    $('#responseBox').val('');
                                } else if (studentAction == 'revise') {
                                    /*
                                     * the student will need to revise their work so we will hide the
                                     * previous response display
                                     */
                                    $('#previousResponseDisplayDiv').hide();
                                }
                        }
                    }

                    //this student work was graded by CRater
                    orState.checkWork = true;

                    //check if we need to disable the check answer button
                    if (or.content.cRater != null && or.content.cRater.maxCheckAnswers != null && or.isCRaterMaxCheckAnswersUsedUp() || or.isLocked()) {
                        //student has used up all of their CRater check answer submits so we will disable the check answer button
                        or.setCheckAnswerUnavailable();
                    } else {
                        //the student still has check answer submits available
                        or.setCheckAnswerAvailable();
                    }

                    /*
                     * process the student work to see if we need to activate any 
                     * teacher notifications
                     */
                    or.processTeacherNotifications(nodeVisit, orState, cRaterResponse);

                    //save the student work to the server immediately
                    view.getProject().getNodeById(nodeId).save(orState);
                } catch (err) {
                    /*
                     * failed to parse JSON. this can occur if the item id is invalid which
                     * causes an error to be returned from the server instead of the JSON
                     * that we expect.
                     */
                }
            }

            /*
             * unlock the screen since we previously locked it to make the student wait
             * for the feedback to be displayed
             */
            eventManager.fire('unlockScreenEvent');
        };

        serviceObject.getStudentWorkAsHTML = function (componentState) {
            var studentWorkAsHTML = null;

            if (componentState != null && componentState.studentData != null) {
                var response = componentState.studentData.response;

                if (response != null) {
                    studentWorkAsHTML = '<p>' + response + '</p>';
                }
            }

            return studentWorkAsHTML;
        };

        /**
         * Check if the component was completed
         * @param component the component object
         * @param componentStates the component states for the specific component
         * @param componentEvents the events for the specific component
         * @param nodeEvents the events for the parent node of the component
         * @returns whether the component was completed
         */
        serviceObject.isCompleted = function (component, componentStates, componentEvents, nodeEvents) {
            var result = false;

            if (componentStates != null) {

                // loop through all the component states
                for (var c = 0; c < componentStates.length; c++) {

                    // the component state
                    var componentState = componentStates[c];

                    // get the student data from the component state
                    var studentData = componentState.studentData;

                    if (studentData != null) {
                        var response = studentData.response;

                        if (response != null) {
                            // there is a response so the component is completed
                            result = true;
                            break;
                        }
                    }
                }
            }

            return result;
        };

        return serviceObject;
    }];

    return service;
});