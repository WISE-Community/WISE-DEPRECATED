define(['app'], function(app) {
    app.$controllerProvider.register('OpenResponseController', 
            function($scope,
                    $rootScope,
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
        this.autoSaveInterval = 10000; // auto-save interval in milliseconds
        this.nodeContent = null;
        this.nodeId = null;
        this.studentResponse = null;
        this.isDisabled = false;
        this.isDirty = false;
        
        var currentNode = CurrentNodeService.getCurrentNode();
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        }
        
        this.calculateDisabled = function() {
            var nodeContent = this.nodeContent;
            var nodeId = this.nodeId;
            
            if (nodeContent) {
                var lockAfterSubmit = nodeContent.lockAfterSubmit;
                
                if (lockAfterSubmit) {
                    var nodeVisits = StudentDataService.getNodeVisitsByNodeId(nodeId);
                    var isSubmitted = OpenResponseService.isWorkSubmitted(nodeVisits);
                    
                    if (isSubmitted) {
                        this.isDisabled = true;
                    }
                }
            }
        };
        
        this.addNodeState = function(saveTriggeredBy) {
            if (saveTriggeredBy != null) {
                if (saveTriggeredBy === 'submitButton' || 
                        (saveTriggeredBy = 'saveButton' && this.isDirty) || 
                        (saveTriggeredBy = 'autoSave' && this.isDirty)) {
                    var studentState = {};
                    studentState.response = this.studentResponse;
                    studentState.saveTriggeredBy = saveTriggeredBy;
                    studentState.timestamp = Date.parse(new Date());
                    if (saveTriggeredBy === 'submitButton') {
                        studentState.isSubmit = true;
                    } 
                    
                    $scope.$parent.nodeController.addNodeStateToLatestNodeVisit(this.nodeId, studentState);
                    return studentState;
                }
            }
        }
        
        this.saveNodeVisitToServer = function() {
            return $scope.$parent.nodeController.saveNodeVisitToServer(this.nodeId).then(angular.bind(this, function(nodeVisit) {
                this.calculateDisabled();
                this.isDirty = false;
                return nodeVisit;
            }));;
        };
        
        this.saveButtonClicked = function() {
            var saveTriggeredBy = 'saveButton';
            
            // add the node state to the node visit
            var nodeState = this.addNodeState(saveTriggeredBy);
            
            // save the node visit to the server
            this.saveNodeVisitToServer().then(angular.bind(this, function(nodeState, nodeVisit) {
                // if this is a CRater step, score it
                this.makeCRaterRequest(nodeState, nodeVisit);
            }, nodeState));
        };
        
        this.submitButtonClicked = function() {
            var saveTriggeredBy = 'submitButton';
            
            // add the node state to the node visit
            var nodeState = this.addNodeState(saveTriggeredBy);
            
            // save the node visit to the server
            this.saveNodeVisitToServer().then(angular.bind(this, function(nodeState, nodeVisit) {
                // if this is a CRater step, score it
                this.makeCRaterRequest(nodeState, nodeVisit);
            }, nodeState));
        };
        
        this.makeCRaterRequest = function(nodeState, nodeVisit) {
            var nodeContent = this.nodeContent;
            
            if (nodeContent != null && nodeContent.cRater != null) {
                var cRaterSettings = nodeContent.cRater;
                var cRaterItemType = cRaterSettings.cRaterItemType;
                var cRaterItemId = cRaterSettings.cRaterItemId;
                var cRaterRequestType = 'scoring';
                var cRaterResponseId = new Date().getTime();
                var studentData = nodeState.response;
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

            console.log(response);
            console.log(feedbackTextObject);
            
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
            
            /*
            //check if we need to display the auto score or auto feedback to the student
            var displayCRaterScoreToStudent = cRaterStepContent.displayCRaterScoreToStudent;
            var displayCRaterFeedbackToStudent = cRaterStepContent.displayCRaterFeedbackToStudent;

            if (displayCRaterScoreToStudent || displayCRaterFeedbackToStudent) {
                //we will display the score or feedback (or both) to the student

                var hasScore = false;
                var hasFeedback = false;
                
                var cRaterFeedbackStringSoFar = "<span class='nodeAnnotationsCRater'>";

                if(displayCRaterScoreToStudent) {
                    if(score != null && score != "") {
                        //the student has received a score
                        hasScore = true;
                    }
                }

                if(displayCRaterFeedbackToStudent) {
                    if(feedbackText != null && feedbackText != "") {
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
                    } else if(studentAction == 'rewrite') {
                        //
                        // move the current work to the previous work response box
                        // because we want to display the previous work to the student
                        // and have them re-write another response after they
                        // receive the immediate CRater feedback
                        //
                        or.showPreviousWorkThatHasAnnotation(studentData);
                        
                        //clear the response box so they will need to write a new response
                        $('#responseBox').val('');
                    } else if(studentAction == 'revise') {
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
            or.processTeacherNotifications(nodeVisit, orState, cRaterResponse);
            
            //save the student work to the server immediately
            view.getProject().getNodeById(nodeId).save(orState);            
            */
        };
        
        this.studentResponseChanged = function() {
            this.isDirty = true;
        };
        
        var nodeSrc = ProjectService.getNodeSrcByNodeId(this.nodeId);

        NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
            this.nodeContent = nodeContent;
            var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
            
            this.setStudentWork(nodeState);
            this.importWork();
            
            $scope.$parent.nodeController.nodeLoaded(this, this.nodeId);
        }));
        
        this.setStudentWork = function(nodeState) {
            if (nodeState != null) {
                var response = nodeState.response;
                this.studentResponse = response;
                this.calculateDisabled();
            }
        };
        
        $scope.$on('nodeOnExit', angular.bind(this, function(event, args) {
            var nodeToExit = args.nodeToExit;
            if (nodeToExit.id === this.nodeId) {
                // save and cancel autoSave interval
                var saveTriggeredBy = 'nodeOnExit';
                
                this.addNodeState(saveTriggeredBy);
                clearInterval(this.autoSaveIntervalId);
                $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
            }
        }));
        
        this.handleLogOut = function() {
            // add node state
            
            // tell VLE to save
        };
        
        this.logOutListener = $scope.$on('logOut', angular.bind(this, function(event, args) {
            console.log('logOut openResponseController this.nodeId: ' + this.nodeId);
            
            var saveTriggeredBy = 'logOut';
            
            this.addNodeState(saveTriggeredBy);
            clearInterval(this.autoSaveIntervalId);
            
            $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
            
            this.logOutListener();
            SessionService.logOut();
        }));
        
        // auto-save
        this.autoSaveIntervalId = setInterval(angular.bind(this, function() {
            if (this.isDirty) {
                var saveTriggeredBy = 'autoSave';
                
                // add the node state to the node visit
                this.addNodeState(saveTriggeredBy);
                
                // save the node visit to the server
                this.saveNodeVisitToServer();
            }
        }), this.autoSaveInterval);
        
        this.importWork = function() {
            var nodeContent = this.nodeContent;
            
            if (nodeContent != null) {
                var importWork = nodeContent.importWork;
                
                if (importWork != null) {
                    var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                    
                    if(nodeState == null) {
                        var importWorkNodeId = importWork.nodeId;
                        
                        if (importWorkNodeId != null) {
                            var importWorkNode = ProjectService.getNodeById(importWorkNodeId);
                            
                            if (importWorkNode != null) {
                                var importWorkNodeType = importWorkNode.type;
                                
                                var importWorkNodeState = StudentDataService.getLatestNodeStateByNodeId(importWorkNodeId);
                                
                                var populatedNodeState = OpenResponseService.populateNodeState(importWorkNodeState, importWorkNodeType);
                                
                                this.setStudentWork(populatedNodeState);
                            }
                        }
                    }
                }
            }
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
                    var latestResponse = latestNodeState.response;
                    if (latestResponse != null) {
                        populatedNodeState.response = latestResponse + populatedNodeState.response;
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
                        
                        if (this.isDirty) {
                            // if student has edited but not saved yet, append student asset to the unsaved work
                            nodeState.response = this.studentResponse + copiedAssetImg;
                        } else if (latestNodeState != null) {
                            // if student already has saved work, prepend it
                            nodeState.response = latestNodeState.response + copiedAssetImg;
                        } else {
                            // otherwise, just use the asset image
                            nodeState.response = copiedAssetImg;
                        }
                        this.setStudentWork(nodeState);
                        this.studentResponseChanged()
                    }
                }));
            }
        });
        
        $('.openResponse').off('dragover').off('drop');
        
        /*
        $('.openResponse').unbind('dragover').unbind('drop');

        $('.openResponse').bind('dragover', function(e) {
            return true;
        });
        
        $('.openResponse').bind('drop', function(e) {
            return true;
        });
        */

        
    });
});