AssessmentListNode.prototype = new Node();
AssessmentListNode.prototype.constructor = AssessmentListNode;
AssessmentListNode.prototype.parent = Node.prototype;
AssessmentListNode.authoringToolName = "Questionnaire";
AssessmentListNode.authoringToolDescription = "Students answer a collection of questions that require text or multiple choice answers";
AssessmentListNode.prototype.i18nEnabled = true;
AssessmentListNode.prototype.i18nPath = "vle/node/assessmentlist/i18n/";
AssessmentListNode.prototype.supportedLocales = {
		"en":"en",
	    "el":"el",
		"es":"es",
		"fr":"fr",
		"iw":"he",
		"ja":"ja",
		"ko":"ko",
		"nl":"nl",
		"nl_GE":"nl",
		"nl_DE":"nl",
		"tr":"tr",
		"zh_CN":"zh_CN",
		"zh_TW":"zh_TW"
};

AssessmentListNode.tagMapFunctions = [
                                      {functionName:'importWork', functionArgs:[]},
                                      {functionName:'showPreviousWork', functionArgs:[]}
                                      ];

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {AssessmentListNode}
 */
function AssessmentListNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;

	this.tagMapFunctions = this.tagMapFunctions.concat(AssessmentListNode.tagMapFunctions);
};

AssessmentListNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	return ASSESSMENTLISTSTATE.prototype.parseDataJSONObj(stateJSONObj);
};

/**
 * Sets up a WorkOnXConstraint before rendering so that students will
 * not be able to navigate to any other step before completing work on
 * this step if that was specified in the content.
 * 
 * @param contentPanel
 * @param studentWork
 */
AssessmentListNode.prototype.render = function(contentPanel,studentWork, disable){
	/* call super */
	Node.prototype.render.call(this, contentPanel, studentWork, disable);
};

/**
 * Renders the student work into the div. The grading tool will pass in a
 * div id to this function and this function will insert the student data
 * into the div.
 * 
 * @param displayStudentWorkDiv the div we will render the student work into
 * @param nodeVisit the student work
 * @param childDivIdPrefix (optional) a string that will be prepended to all the 
 * div ids use this to prevent DOM conflicts such as when the show all work div
 * uses the same ids as the show flagged work div
 * @param workgroupId the id of the workgroup this work belongs to
 */
AssessmentListNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	// Get the latest student state object for this step
	var assessmentListState = nodeVisit.getLatestState();

	// get human readable work string
	var showAutoScoreResult = true;

	var isLockAfterSubmit = false;
	var contentJSON = this.content.getContentJSON();

	if(contentJSON != null) {
		//get whether this step locks after submit
		isLockAfterSubmit = contentJSON.isLockAfterSubmit;
	}

	var readableStudentWork = assessmentListState.getStudentWorkString(showAutoScoreResult, isLockAfterSubmit);

	//replace \n with <br> so that newlines will be visible
	readableStudentWork = this.view.replaceSlashNWithBR(readableStudentWork);

	displayStudentWorkDiv.html(readableStudentWork);
};

/**
 * Override of Node.overridesIsCompleted
 * Specifies whether the node overrides Node.isCompleted
 */
AssessmentListNode.prototype.overridesIsCompleted = function() {
	return true;
};

/**
 * Override of Node.isCompleted
 * Get whether the step is completed or not
 * @return a boolean value whether the step is completed or not
 */
AssessmentListNode.prototype.isCompleted = function(nodeVisits) {
	if (nodeVisits != null) {
		for (var i=0; i < nodeVisits.length; i++) {
			var nodeVisitForThisNode = nodeVisits[i];
			if (nodeVisitForThisNode.nodeStates != null) {
				for (var k=0;k<nodeVisitForThisNode.nodeStates.length;k++) {
					var nodeState = nodeVisitForThisNode.nodeStates[k];
					if (nodeState.isSubmit || nodeState.submit) {
						return true;
					}
				}
			}
		}
	}
	return false;
};

/**
 * Returns the prompt for this node by loading the content and then
 * obtaining it from the object
 * @return the prompt for this node
 */
AssessmentListNode.prototype.getPrompt = function() {
	//get the content for the node
	var contentJSON = this.content.getContentJSON();

	var prompt = null;

	//see if the node content has an assessmentItem
	if(contentJSON.prompt != null) {
		//obtain the prompt
		prompt = contentJSON.prompt + "<br/>";	
	}
	// add the prompts from each part
	for (var i=0; i < contentJSON.assessments.length; i++) {
		var assessment = contentJSON.assessments[i];
		prompt += "Part " + (i+1) + ": " + assessment.prompt;
		// if radio assessment, also show choices
		if (assessment.type == "radio") {
			prompt += "<br/>&nbsp;&nbsp;&nbsp;&nbsp;Choices:<br/>";
			for (var x=0; x<assessment.choices.length; x++) {
				prompt += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + assessment.choices[x].text;
				if (x != (assessment.choices.length - 1)) {
					prompt += "<br/>";
				}
			}
		}
		prompt += "<br/>";
	}

	//return the prompt
	return prompt;
};

/**
 * This is called when the node is exited
 * @return
 */
AssessmentListNode.prototype.onExit = function() {
	try {
		//check if the content panel has been set
		if(this.contentPanel) {
			if(this.contentPanel.onExit) {
				//run the on exit cleanup
				this.contentPanel.onExit();		
			}	
		}	
	} catch(e) {

	}
};

/**
 * Display the work for an assessmentliststate object
 * @param nodeState the node state to display work from
 */
AssessmentListNode.prototype.getStudentWorkHtmlView = function(nodeState) {
	var showAutoScoreResult = false;

	var studentWorkSoFar = "";
	var autoScoreTotalScore = 0;   // total auto scored points the student earned
	var autoScoreTotalMaxScore = 0;   // total auto scored points possible

	var isLockAfterSubmit = false;
	var contentJSON = this.content.getContentJSON();

	if(contentJSON != null) {
		//get whether this step locks after submit
		isLockAfterSubmit = contentJSON.isLockAfterSubmit;
	}

	if(nodeState != null) {
		//check if there were any responses
		if(nodeState.assessments) {
			//loop through the array of assessments
			for(var x=0; x<nodeState.assessments.length; x++) {
				if(studentWorkSoFar != "") {
					//separate each response
					studentWorkSoFar += "<br/><br/>";
				}

				//add the response to the student work
				studentWorkSoFar += view.getI18NStringWithParams("grading_item_part_number",[(x+1)], "AssessmentListNode") + "<br/>";
				var assessment = nodeState.assessments[x];

				if (assessment.type && assessment.response) {
					if (assessment.type == "radio") {
						studentWorkSoFar += assessment.response.text;
						if (assessment.response.autoScoreResult && showAutoScoreResult) {
							// append results from auto score
							var autoScoreResult = assessment.response.autoScoreResult;
							studentWorkSoFar += "<br/>Auto Score Results:<br/>";
							if (autoScoreResult.isCorrect) {
								studentWorkSoFar += "Student got this question CORRECT";
							} else {
								studentWorkSoFar += "Student got this question INCORRECT";							
							}
							var studentScore = autoScoreResult.choiceScore ? autoScoreResult.choiceScore : 0;
							var maxScore = autoScoreResult.maxScore ? autoScoreResult.maxScore : 0;
							studentWorkSoFar += " and received ";
							studentWorkSoFar += studentScore;
							studentWorkSoFar += " points out of ";
							studentWorkSoFar += maxScore;

							// update total scores
							autoScoreTotalScore += studentScore;
							autoScoreTotalMaxScore += maxScore;
						}
					} else if (assessment.type == "text") {
						studentWorkSoFar += assessment.response.text;
					}
				}
			}
		}

		// append autoScore result summary at the end, if request
		if (showAutoScoreResult && autoScoreTotalMaxScore > 0) {
			studentWorkSoFar += "<br/><br/>";
			studentWorkSoFar += "Auto Score Results Summary: ";
			studentWorkSoFar += "Student got " + autoScoreTotalScore + " points out of " + autoScoreTotalMaxScore;
		}

		var isSubmit = nodeState.isSubmit;

		if(isLockAfterSubmit) {
			/*
			 * this is a lock after submit step so we will display whether
			 * this node state was a submit
			 */
			studentWorkSoFar += "<br/><br/>";
			studentWorkSoFar += "Is Submit: " + isSubmit;
		}
	}

	return studentWorkSoFar;
};


/**
 * Returns the criteria value for this node based on student response.
 * Currently, this node will 
 */
AssessmentListNode.prototype.getCriteriaValue = function(criteriaParam) {
	var result = null;
	if (criteriaParam != null) {
		var itemId = criteriaParam.itemId;  // item id in this assessmentlist step to get student response for
		var latestState = view.getLatestStateForNode(this.id);
		if (latestState != null) {
			var assessments = latestState.assessments;
			if (assessments != null) {
				for (var i=0; i<assessments.length; i++) {
					var assessment = assessments[i];
					if (assessment.id == itemId) {
						if (assessment.type == "radio") {
							result = assessment.response.id;  // get the radio choice identifier
						}
					}
				}
			}

		}
	}

	return result;
};

AssessmentListNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/assessmentlist/assessmentlist.html');
};

/**
 * Returns whether this step type can be special exported
 * @return a boolean value
 */
AssessmentListNode.prototype.canSpecialExport = function() {
    return true;
};

NodeFactory.addNode('AssessmentListNode', AssessmentListNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/assessmentlist/AssessmentListNode.js');
};