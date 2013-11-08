
/**
 * @constructor
 * @param node
 * @param view
 * @returns
 */
function ASSESSMENTLIST(node, view) {
	this.node = node;
	this.view = view;
	this.content = node.getContent().getContentJSON();
	if(node.studentWork != null) {
		this.states = node.studentWork; 
	} else {
		this.states = [];  
	};
	
	//check if there is an associated node whose work we might display in this step
	if(this.node.associatedStartNode != null) {
		//get the node id for the associated node that the student will be reviewing work for
		this.associatedStartNodeId = this.node.associatedStartNode;
		
		//get the associated node object
		this.associatedStartNode = this.view.getProject().getNodeById(this.associatedStartNodeId);
		
		if(this.associatedStartNode != null) {
			//get the content for the associated node
			this.associatedStartNodeContent = this.associatedStartNode.getContent().getContentJSON();			
		}
	}
	
	//check if this step is being used for a peer review
	if(this.node.peerReview != null) {
		//values to be set after we retrieve the other student work that this student will be reviewing
		this.otherStudentWorkgroupId = null;
		this.otherStudentStepWorkId = null;
		this.otherStudentNodeVisit = null;
		this.showAuthorContent = false;

		//this will store the peer review as an annotation
		this.annotation = null;	
		
		if(this.node.peerReview == 'annotate') {
			this.openPercentageTrigger = this.content.openPercentageTrigger;
			this.openNumberTrigger = this.content.openNumberTrigger;
			this.openLogicTrigger = this.content.openLogicTrigger;
		}
	}
	
	if(this.node.peerReview != null || this.node.teacherReview != null) {
		//tell the node that it is part of a review sequence
		this.node.setIsPartOfReviewSequence();
		
		//get the custom message to display to the student when the step is not open to work on
		this.stepNotOpenCustomMessage = this.content.stepNotOpenCustomMessage;
	}

	//check if this step is locked
	if(this.view != null && this.view.isLatestNodeStateLocked && this.view.isLatestNodeStateLocked(this.node.id)) {
		//set this flag for future look up
		this.locked = true;
		
		//tell the node that the student has completed it
		this.node.setCompleted();
	}
	
	if (this.isSubmitted()) {
		//tell the node that the student has completed it
		this.node.setCompleted();
	}
	
	this.workToImport = [];

	this.stateChanged = false;
};


/**
 * Hide all the divs in the assessmentlist html 
 */
ASSESSMENTLIST.prototype.hideAll = function() {
	$('#promptDisplayDiv').hide();
	$('#originalPromptDisplayDiv').hide();
	$('#associatedWorkDisplayDiv').hide();
	$('#annotationDisplayDiv').hide();
	$('#starterParent').hide();
	$('#responseDisplayDiv').hide();
	$('#buttonDiv').hide();
	$("#submitButtonDiv").hide();
	$('#assessmentsDiv').hide();
	$('#saveDraftButton').hide();
};


/**
 * Hide all the divs in the openresponse.html and just display a message
 */
ASSESSMENTLIST.prototype.onlyDisplayMessage = function(message) {
	//set the node closed because the student can't work on it yet
	this.node.setStepClosed();
	
	//hide all the divs
	this.hideAll();
	
	//display the prompt div
	$('#promptDisplayDiv').show();
	
	//remove the text in this label div
	$('#promptLabelDiv').html("");
	
	//set the prompt div to this message
	$('#promptDiv').html(message);
};

/**
 * Make the request to retrieve the other student work
 */
ASSESSMENTLIST.prototype.retrieveOtherStudentWork = function() {
	//get the url
	var getPeerReviewUrl = this.view.getConfig().getConfigParam('getPeerReviewUrl');
	
	//get the parameters to retrieve the other student work
	var action = "studentRequest";
	var runId = this.view.getConfig().getConfigParam('runId');
	var workgroupId = this.view.getUserAndClassInfo().getWorkgroupId();
	var periodId = this.view.getUserAndClassInfo().getPeriodId();
	var nodeId = this.associatedStartNodeId;
	var openPercentageTrigger = this.openPercentageTrigger;
	var openNumberTrigger = this.openNumberTrigger;
	var openLogicTrigger = this.openLogicTrigger;
	var peerReviewAction = "annotate";
	var classmateWorkgroupIds = this.view.getUserAndClassInfo().getWorkgroupIdsInClass().toString();
	
	//compile the parameters into an object for cleanliness
	var getPeerReviewUrlArgs = {
			action:action,
			runId:runId,
			workgroupId:workgroupId,
			periodId:periodId,
			nodeId:nodeId,
			openPercentageTrigger:openPercentageTrigger,
			openNumberTrigger:openNumberTrigger,
			openLogicTrigger:openLogicTrigger,
			peerReviewAction:peerReviewAction,
			classmateWorkgroupIds:classmateWorkgroupIds
	};
	
	//make the request
	this.view.connectionManager.request('GET', 1, getPeerReviewUrl, getPeerReviewUrlArgs, this.retrieveOtherStudentWorkCallback, [this]);
};

/**
 * Parses the other student work response and then renders everything in the vle.
 * Everything includes, the prompt for the associated node, the other student work,
 * and the text box for this current to write their peer review.
 * @param text a JSON string containing a NodeVisit from the other student
 * @param xml
 * @param args contains the PEERREVIEWANNOTATE object so we can have access to it
 */
ASSESSMENTLIST.prototype.retrieveOtherStudentWorkCallback = function(text, xml, args) {
	//get the or object
	var thisAl = args[0];
	
	//clear this variable to make sure we don't use old data
	thisAl.otherStudentNodeVisit = null;
	
	//check if there was any text response
	if(text != null && text != "") {
		//there was text returned so we will parse it, the text should be a NodeVisit in JSON form
		var peerWorkToReview = $.parseJSON(text);
		
		var peerWorkText = "";
		
		//handle error cases
		if(peerWorkToReview.error) {
			if(peerWorkToReview.error == 'peerReviewUserHasNotSubmittedOwnWork') {
				/*
				 * the message that tells the user they must complete a previous step before
				 * they can work on this step
				 */
				var to_start_this_step_you_must = thisAl.view.getI18NString("to_start_this_step_you_must", "AssessmentListNode");
				
				//the word link
				var link = thisAl.view.getI18NString("link", "AssessmentListNode");
				
				//the user has not submitted work for the original step
				thisAl.onlyDisplayMessage('<p>' + to_start_this_step_you_must + ' <b><a style=\"color:blue\" onclick=\"eventManager.fire(\'nodeLinkClicked\', [\'' + thisAl.view.getProject().getPositionById(thisAl.associatedStartNode.id) + '\']) \">' + thisAl.view.getProject().getStepNumberAndTitle(thisAl.associatedStartNode.id) + '</a></b> (' + link + ').</p>');
			} else if(peerWorkToReview.error == 'peerReviewNotAbleToAssignWork' || peerWorkToReview.error == 'peerReviewNotOpen') {
				/*
				 * server was unable to assign student any work to review, most likely because there was no available work to assign
				 * or
				 * the peer review has not opened yet
				 */
				
				var startNodeTitle = "";
				if(thisAl.associatedStartNode != null) {
					//get the step number and node title for the start node
					startNodeTitle = thisAl.view.getProject().getStepNumberAndTitle(thisAl.associatedStartNode.id);
				}
				
				if(thisAl.stepNotOpenCustomMessage != null && thisAl.stepNotOpenCustomMessage != "") {
					//use the custom authored message
					thisAl.onlyDisplayMessage(thisAl.stepNotOpenCustomMessage.replace(/associatedStartNode.title/g, startNodeTitle));
				} else {
					/*
					 * the message that tells the student that the step is not available yet
					 * because more of their classmates need to submit a response before
					 * they can receive a classmate work to review. then it says they should
					 * return to this step later.
					 */
					var this_step_is_not_available_yet = thisAl.view.getI18NString("this_step_is_not_available_yet", "AssessmentListNode");
					var more_of_your_peers_need_to_submit = thisAl.view.getI18NString("more_of_your_peers_need_to_submit", "AssessmentListNode");
					var you_will_then_be_assigned_a_response = thisAl.view.getI18NString("you_will_then_be_assigned_a_response", "AssessmentListNode");
					var please_return_to_this_step_again = thisAl.view.getI18NString("please_return_to_this_step_again", "AssessmentListNode");
					
					//use the default message
					thisAl.onlyDisplayMessage('<p>' + this_step_is_not_available_yet + '</p></p><p>' + more_of_your_peers_need_to_submit + ' <b>"' + startNodeTitle + '"</b>. <br/>' + you_will_then_be_assigned_a_response + '</p><p>' + please_return_to_this_step_again + '</p>');					
				}
			}
			
			//check if we should show the authored work
			if(peerWorkToReview.error == 'peerReviewShowAuthoredWork') {
				//show the authored work for the student to review
				peerWorkText = thisAl.content.authoredWork;
				thisAl.showAuthorContent = true;
			} else {
				return;
			}
		} else {
			//set the variables for the other student
			thisAl.otherStudentWorkgroupId = peerWorkToReview.workgroupId;
			thisAl.otherStudentStepWorkId = peerWorkToReview.stepWorkId;
			thisAl.otherStudentNodeVisit = peerWorkToReview.nodeVisit;
			
			peerWorkText = thisAl.associatedStartNode.getPeerReviewOtherStudentWork(thisAl.otherStudentNodeVisit);
		}
		
		//reaplce \n with <br>
		peerWorkText = thisAl.replaceSlashNWithBR(peerWorkText);
		
		//show regular divs such as prompt, starter, and response and populate them
		thisAl.showDefaultDivs();
		//thisAl.showDefaultValues();
		
		/*
		 * the labels for the instructions and the work from another group and the
		 * feedback that the student needs to give to that other group
		 */
		var instructions = thisAl.view.getI18NString('instructions', 'AssessmentListNode');
		var your_feedback_for = thisAl.view.getI18NString('your_feedback_for', 'AssessmentListNode');
		var work_submitted_by = thisAl.view.getI18NString('work_submitted_by', 'AssessmentListNode');
		var team_anonymous = thisAl.view.getI18NString('team_anonymous', 'AssessmentListNode');
		
		
		//set more informative labels
		$('#promptLabelDiv').html(instructions);
		$('#responseLabelDiv').html(your_feedback_for + ' <i>' + team_anonymous + '</i>:');
		
		//display the prompt
		$('#originalPromptTextDiv').html(thisAl.associatedStartNode.getPeerReviewPrompt());
		$('#originalPromptDisplayDiv').show();
		
		/*
		 * display the other student's work or a message saying there is no other student work
		 * available yet
		 */
		$('#associatedWorkLabelDiv').html(work_submitted_by + ' <i>' + team_anonymous + '</i>:');		
		$('#associatedWorkTextDiv').html(peerWorkText);
		$('#associatedWorkDisplayDiv').show();
		
		//set the response if there were previous revisions 
		//thisAl.setResponse();
	}
	
	/*
	 * perform any final tasks after we have finished retrieving
	 * any other work and have displayed it to the student
	 */
	thisAl.doneRendering();
};

/**
 * This is for displaying the authored work for the student to
 * review.
 */
ASSESSMENTLIST.prototype.displayTeacherWork = function() {
	//check that the original node is locked
	var isOriginalNodeLocked = this.view.isLatestNodeStateLocked(this.associatedStartNode.id);
	
	if(!isOriginalNodeLocked) {
		//original step is not locked
		
		/*
		 * the message that tells the user they must complete a previous step before
		 * they can work on this step
		 */
		var to_start_this_step_you_must = thisAl.view.getI18NString("to_start_this_step_you_must", "AssessmentListNode");
		
		//the word link
		var link = thisAl.view.getI18NString("link", "AssessmentListNode");
		
		//display message telling student to go back and submit that original step
		this.onlyDisplayMessage('<p>' + to_start_this_step_you_must + ' <b><a style=\"color:blue\" onclick=\"view.goToNodePosition(' + this.view.getProject().getPositionById(this.associatedStartNode.id) + ')\">' + this.view.getProject().getStepNumberAndTitle(this.associatedStartNode.id) + '</a></b> (' + link + ').</p>');
	} else {
		//original step is locked
		
		//get the authored work
		var teacherWorkText = this.content.authoredWork;
		
		//replace \n with <br>
		teacherWorkText = this.replaceSlashNWithBR(teacherWorkText);
		
		//show regular divs such as prompt, starter, and response and populate them
		this.showDefaultDivs();
		this.showDefaultValues();
		
		/*
		 * the labels for the instructions and the work from another group and the
		 * feedback that the student needs to give to that other group
		 */
		var instructions = thisAl.view.getI18NString('instructions', 'AssessmentListNode');
		var your_feedback_for = thisAl.view.getI18NString('your_feedback_for', 'AssessmentListNode');
		var work_submitted_by = thisAl.view.getI18NString('work_submitted_by', 'AssessmentListNode');
		var team_anonymous = thisAl.view.getI18NString('team_anonymous', 'AssessmentListNode');

		//set more informative labels
		document.getElementById('promptLabelDiv').innerHTML = instructions;
		document.getElementById('responseLabelDiv').innerHTML = your_feedback_for + ' <i>' + team_anonymous + '</i>:';
		
		//display the original prompt
		document.getElementById('originalPromptTextDiv').innerHTML = this.associatedStartNode.getPeerReviewPrompt();
		document.getElementById('originalPromptDisplayDiv').style.display = 'block';
		
		//display the authored work for the student to review
		document.getElementB$('#iv').innerHTML = work_submitted_by + ' <i>' + team_anonymous + '</i>:' ;		
		document.getElementById('associatedWorkTextDiv').innerHTML = teacherWorkText;
		document.getElementById('associatedWorkDisplayDiv').style.display = 'block';
		
		//set the response if there were previous revisions
		//this.setResponse();
	}
	
	/*
	 * perform any final tasks after we have finished retrieving
	 * any other work and have displayed it to the student
	 */
	this.doneRendering();
};

/**
 * Render the AssessmentList
 */
ASSESSMENTLIST.prototype.render = function() {
	var enableStep = true;
	var message = '';
	
	//process the tag maps if we are not in authoring mode
	if(this.view.authoringMode == null || !this.view.authoringMode) {
		//get the tag map results
		var tagMapResults = this.processTagMaps();
		
		//get the result values
		enableStep = tagMapResults.enableStep;
		message = tagMapResults.message;
		this.workToImport = tagMapResults.workToImport;
	}
	
	if(this.content.isMustCompleteAllPartsBeforeExit) {
		//the student must complete all parts before leaving the step
		if(this.states.length == 0) {
			/*
			 * check that the addActiveTagMapConstraint() function exists.
			 * if we are in step preview mode in the authoring tool, this
			 * function will not exist so we will not create the constraint.
			 */
			if(this.view.addActiveTagMapConstraint != null) {
				/*
				 * the student has not submitted any work yet so we will create
				 * the constraint. in order to have work, the student must have
				 * completed all the parts which is why we only need to check for
				 * existence of any work and we don't have to specifically check
				 * for all parts.
				 */
				this.view.addActiveTagMapConstraint(this.node.id, null, 'mustCompleteBeforeExiting', null, null);				
			}
		}
	}
	
	//create the submit button
	$("#submitButtonDiv").html('<input id="submitButton" type="button" onclick="submit()" data-i18n="submit" value="Submit the Questionnaire"></input>');
	
	if(this.node.peerReview == 'annotate' || this.node.teacherReview == 'annotate') {
		/*
		 * this is a peer or teacher review annotate node (part 2 of a review sequence)
		 * so we will create a save draft button
		 */
		if ($("#saveDraftButton").size() == 0) {
			$("#submitButtonDiv").before('<div class="buttonDiv"><input type="button" id="saveDraftButton" data-i18n="save_draft" value="SAVE DRAFT" onclick="javascript:save();" /></div>&nbsp;');
			
			/*
			 * disable the save draft button initially. the save
			 * draft button will be enabled once the student 
			 * modifies any of the assessment parts
			 */
			this.setSaveDraftUnavailable();
		}
	}
	
	/* if student has already done this step
	 * && isLockAfterSubmit is true
	 * && is displayAnswerSubmit is false,
	 * don't show the step, just display
	 * the fact that they've already completed it.
	 */
	if (this.content.isLockAfterSubmit
			&& !this.content.displayAnswerAfterSubmit
			&& this.isSubmitted()) {
		
		/* if this is part 2 of peer-review sequence and the student has completed it */
		if((this.node.peerReview == 'annotate' || this.node.teacherReview == 'annotate') && this.isSubmitted()) {
			//the message to tell the student they have successfully reviewed another groups work
			var you_have_successfully_reviewed = this.view.getI18NString('you_have_successfully_reviewed', 'AssessmentListNode');
			var team_anonymous = this.view.getI18NString('team_anonymous', 'AssessmentListNode');
			var well_done = this.view.getI18NString('well_done', 'AssessmentListNode');
			
			//display this message in the step frame
			this.onlyDisplayMessage('<p>' + you_have_successfully_reviewed + ' <i>' + team_anonymous + '</i>.</p><p>' + well_done + '</p>');
		} else {
			//this is a regular assessment list so we will just lock the screen
			this.lockScreen();
		}
		return;
	};
	
	if((this.node.peerReview == 'annotate' || this.node.teacherReview == 'annotate') && this.content.isLockAfterSubmit) {
		//this is a peer or teacher review annotate step (part 2 of a review sequence)
		if(this.associatedStartNode != null) {
			if(this.node.peerReview != null) {
				//this is a peer review
				
				if(this.view.authoringMode) {
					/*
					 * we are in authoring mode so we will just display default values
					 * so the author can get an idea of how it will look to the students
					 */
					
					var instructions = this.view.getI18NString('instructions', 'AssessmentListNode');
					
					//set more informative labels
					$('#promptLabelDiv').html(instructions);
					
					var prompt_from_first_peer_review = this.view.getI18NString('prompt_from_first_peer_review', 'AssessmentListNode');
					
					//display the prompt
					$('#originalPromptTextDiv').html('[' + prompt_from_first_peer_review + ']');
					$('#originalPromptDisplayDiv').show();
					
					/*
					 * the label for the work from another group
					 */
					var work_submitted_by = this.view.getI18NString('work_submitted_by', 'AssessmentListNode');
					var team_anonymous = this.view.getI18NString('team_anonymous', 'AssessmentListNode');
					var work_from_a_random_classmate = this.view.getI18NString('work_from_a_random_classmate', 'AssessmentListNode');
					
					/*
					 * display the other student's work or a message saying there is no other student work
					 * available yet
					 */
					$('#associatedWorkLabelDiv').html(work_submitted_by + ' <i>' + team_anonymous + '</i>:');		
					$('#associatedWorkTextDiv').html('[' + work_from_a_random_classmate + ']');
					$('#associatedWorkDisplayDiv').show();
				} else {
					//this is the step where the student writes comments on their classmates work
					this.retrieveOtherStudentWork();					
				}
			} else if(this.node.teacherReview != null) {
				//this is a teacher review
				
				//this is the step where the student annotates the authored work
				this.displayTeacherWork();
			}
		}
	}
	
	/* render the overall prompt for the whole step */
	$("#promptDiv").html(this.content.prompt);

	var assessmentHTML = "";
	/* for each assessment in the list, render them, including the state, if any */
	for (var i=0; i<this.content.assessments.length; i++) {
		var assessment = this.content.assessments[i];
		assessmentHTML += this.getHTML(assessment,i);
	};
	$("#assessmentsDiv").html(assessmentHTML);
	
	/* if student has already done this step, don't show the step, just display
	 * the fact that they've already completed it.
	 */
	if (this.isSubmitted() && this.content.isLockAfterSubmit) {
		this.lockScreen();
		return;
	};
	
	/*
	 * if this step does not lock, we will set submit button to be unavailable.
	 * when the student changes any of their answers in any field, the submit
	 * button will become available.
	 */
	if(!this.content.isLockAfterSubmit) {
		this.setSaveUnavailable();
	}
	
	this.node.view.eventManager.fire('contentRenderCompleted', this.node.id, this.node);
};

ASSESSMENTLIST.prototype.submit = function() {
	var allCompleted = this.isAllPartsCompleted();
	
	if (allCompleted) {
		if (this.content.isLockAfterSubmit) {
			var click_ok_to_save = this.view.getI18NString('click_ok_to_save', 'AssessmentListNode');
			
			doLockStep=confirm(click_ok_to_save);
			if (doLockStep==true) { 
				//disable the submit and save draft buttons
				this.setSaveUnavailable();
				this.setSaveDraftUnavailable();
				var isSubmit = true;
				this.save(isSubmit);
				this.lockScreen();
				
				// if this is a peer review 'annotate' part, also post the answer as annotation.
				if(this.node.peerReview != null) {
					//this is a peer review of a previous step

					if(this.node.peerReview == 'annotate' && !this.showAuthorContent) {
						//send the annotation for the peer review
						var response = this.getResponsesToImportantParts();
						this.postAnnotation(response);
					}
				}
			} 
		} else {
			//disable the submit and save draft buttons
			this.setSaveUnavailable();
			this.setSaveDraftUnavailable();
			var isSubmit = true;
			this.save(isSubmit);
		};
	} else {
		//the message that tells the student that they need to answer all the questions
		var please_answer_all_the_questions = this.view.getI18NString('please_answer_all_the_questions', 'AssessmentListNode');
		
		/* all not completed yet, notify user and have them finish */
		alert(please_answer_all_the_questions);
	};
};

/**
 * Obtains the student's responses to the important parts in the review sequence.
 */
ASSESSMENTLIST.prototype.getResponsesToImportantParts = function() {
	var response = "";
	/* for each assessment in the list, render them, including the state, if any */
	for (var i=0; i<this.content.assessments.length; i++) {
		var assessment = this.content.assessments[i];
		if (assessment.isImportantReviewSequencePart) {
			var lastResponse = this.getLastSavedResponse(assessment);
			if (assessment.type == "radio") {
				lastResponse = this.getChoiceText(assessment,lastResponse);
			};
			response += lastResponse + "<br/><br/>";
		}
	};
	return response;
};

/**
 * returns the corresponding choice text
 */
ASSESSMENTLIST.prototype.getChoiceText = function(assessmentJSON,choiceId) {
	for (var i=0;i<assessmentJSON.choices.length;i++) {
		var choice = assessmentJSON.choices[i];
		if (choiceId != null && choiceId == choice.id) {
			return choice.text;
		}
	}
	return "";
};

/**
 * Send the response back as an annotation. Used for Peer Review. 
 * @param response
 */
ASSESSMENTLIST.prototype.postAnnotation = function(response) {
	//obtain the parameters needed to post the annotation
	var runId = this.view.getConfig().getConfigParam('runId');
	var nodeId = this.otherStudentNodeVisit.nodeId;
	var toWorkgroup = this.otherStudentWorkgroupId;
	var fromWorkgroup = this.view.getUserAndClassInfo().getWorkgroupId();
	var type = "comment";
	var value = response;
	var stepWorkId = this.otherStudentStepWorkId;
	var action = "peerReviewAnnotate";
	var periodId = this.view.getUserAndClassInfo().getPeriodId();
	
	//get the url
	var postAnnotationsUrl = this.view.getConfig().getConfigParam('postAnnotationsUrl');
	
	//compile the args into an object for cleanliness
	var postAnnotationsUrlArgs = {runId:runId,
								  nodeId: nodeId,
								  toWorkgroup:toWorkgroup,
								  fromWorkgroup:fromWorkgroup,
								  annotationType:type,
								  value:encodeURIComponent(value),
								  stepWorkId: stepWorkId,
								  action:action,
								  periodId:periodId};
	
	//create the view's annotations object if it does not exist
	if(this.view.getAnnotations() == null) {
		this.view.setAnnotations(new Annotations());
	}
	
	//create the annotation locally to keep our local copy up to date
	var annotation = new Annotation(runId, nodeId, toWorkgroup, fromWorkgroup, type, value, stepWorkId);
	
	//add the annotation to the view's annotations
	this.view.getAnnotations().updateOrAddAnnotation(annotation);
	
	//a callback function that does nothing
	var postAnnotationsCallback = function(text, xml, args) {};
	
	//post the annotation to the server
	this.view.connectionManager.request('POST', 1, postAnnotationsUrl, postAnnotationsUrlArgs, postAnnotationsCallback);
};

/**
 * Returns true iff all parts have been completed 
 */
ASSESSMENTLIST.prototype.isAllPartsCompleted = function() {
	var totalRadioCount = $('.choicesDiv').length; /* total number of radio assessments, including follow-ups */
	var radioNumChecked = 0;
	/* check that all radio button assessment have been answered */
	$('input:radio:checked').each(function() {
		radioNumChecked++;
	});

	if (totalRadioCount != radioNumChecked) {
		return false;
	}

	var textBoxesAllComplete = true;
	/* check that all textboxes have been populated */
	$(".textboxTextArea").each(function() { 
		if ($(this).val() == null || $(this).val() == "") {
			textBoxesAllComplete = false;
	    }
	}); 
	return textBoxesAllComplete;
};

/**
 * Saves the current page.
 */
ASSESSMENTLIST.prototype.save = function(isSubmit) {
	/*
	 * we need to save a new state if the state has changed
	 * or if the student is submitting their final answer
	 */
	if(this.stateChanged || isSubmit) {
		var alState = new ASSESSMENTLISTSTATE();
		alState.isSubmit = isSubmit;
		
		if(isSubmit) {
			alState.locked = true;			
			// denote that this step is completed.		
			this.node.setCompleted();
		}
		
		for (var i=0; i<this.content.assessments.length; i++) {
			var assessment = this.content.assessments[i];
			var assessmentState = {};
			assessmentState.id = assessment.id;
			assessmentState.type = assessment.type;
			assessmentState.response = this.getResponse(assessment);
			alState.assessments.push(assessmentState);
		};
		
		//fire the event to push this state to the global view.states object
		this.view.pushStudentWork(this.node.id, alState);
		
		this.states.push(alState);
		
		//disable the save draft button
		this.setSaveDraftUnavailable();	
		
		//the message that says their work has been saved or submitted
		var your_work_has_been_saved = this.view.getI18NString('your_work_has_been_saved', 'AssessmentListNode');
		var your_work_has_been_submitted = this.view.getI18NString('your_work_has_been_submitted', 'AssessmentListNode');
		
		// show "saved" or "submitted" message
		var confMSG = your_work_has_been_saved;
		if (isSubmit) {
			confMSG = your_work_has_been_submitted;				
		}
		if ($("#saveConfirmation").size() == 0) {
			$("#submitButtonDiv").after('<br/><span style=\'font-size:.8em\' id="saveConfirmation">'+confMSG+'</span>&nbsp;');
		} else {
			$('#saveConfirmation').show();
		}
		$('#saveConfirmation').html(confMSG).delay(5000).fadeOut('medium');

		
		this.stateChanged = false;
	}
};

/**
 * Returns student's current response to be saved for the specified assessment object.
 * @param assessmentJSON JSON obj of assessment item.
 *   Currently, we only support assessments of type 
 *   - "radio" (for multiple choice)
 *   - "text" (for open response)
 * @return html string
 */
ASSESSMENTLIST.prototype.getResponse = function(assessmentJSON) {
	if (assessmentJSON.type == "text") {
		var text = $("#"+assessmentJSON.id+"textbox").val();
		if (text != null && text != "") {
			var response = {};
			response.text = text;
			return response;
		} else {
			return null;
		}
	} else if  (assessmentJSON.type == "radio") {
		var maxScoreSoFar = 0;
		if (assessmentJSON.isAutoScoreEnabled) {
			// compute total possible score for this item by summing its choice scores
			for (var x=0; x < assessmentJSON.choices.length; x++) {				
				if (assessmentJSON.choices[x].choiceScore && maxScoreSoFar < assessmentJSON.choices[x].choiceScore) {
					maxScoreSoFar = assessmentJSON.choices[x].choiceScore;
				}
			}
		}
		var choiceId = $("input[name='" + assessmentJSON.id + "']:checked").val();
		if (choiceId != null && choiceId != "") {
			var response = {};
			response.id = choiceId;
			// get text of choice from assessment obj
			for (var x=0; x < assessmentJSON.choices.length; x++) {
				if (assessmentJSON.choices[x].id == choiceId) {
					response.text = assessmentJSON.choices[x].text;
					// if this radio item has a correct answer to it, add how the student did to the response
					if (assessmentJSON.isAutoScoreEnabled) {
						response.autoScoreResult = {
								isCorrect:assessmentJSON.choices[x].isCorrect,
								choiceScore:assessmentJSON.choices[x].choiceScore,
								maxScore:maxScoreSoFar
						};
						// include total possible score
					}
				}
			}
			return response; 
		} else {
			return null;
		}
	};
	return "";
};

/**
 * Returns HTML string to display in the assessmentlist page for the specified assessment
 * @param assessmentJSON JSON obj of assessment item.
 *   Currently, we only support assessments of type 
 *   - "radio" (for multiple choice)
 *   - "text" (for open response)
 *   @index: 0-based index of this assessment in the whole step.
 * @return html string
 */
ASSESSMENTLIST.prototype.getHTML = function(assessmentJSON,index) {
	var html = "<div id='"+assessmentJSON.id+"Div' class='"+assessmentJSON.type+" assessment'>" +
	    "<div id='"+assessmentJSON.id+"PromptDiv' class='promptDiv'><span class='partSpan'>" + (index+1) + ".&nbsp;&nbsp;</span>"+assessmentJSON.prompt+"</div>";
	if (assessmentJSON.type == "text") {
		html += this.getHTMLText(assessmentJSON);
	} else if  (assessmentJSON.type == "radio") {
		html += this.getHTMLRadio(assessmentJSON);
	};
	html += "</div>";
	return html;
};

/**
 * Returns HTML String to display a radio button assessment, like multiple choice. The assessment object
 * is passed in as JSON object, and is of type radio.
 * @param radioJSON
 * @return
 */
ASSESSMENTLIST.prototype.getHTMLRadio = function(radioJSON) {
	var html = "";
	
	if(radioJSON.choices.length > 0) {
		html = "<div id='"+radioJSON.id+"choicesDiv' class='choicesDiv'>";
		var lastChosenChoiceId = this.getLastSavedResponse(radioJSON);
		for (var i=0;i<radioJSON.choices.length;i++) {
			var choice = radioJSON.choices[i];
			html+="<div id='"+choice.id+"choiceDiv' class='choiceDiv'>";
			if (lastChosenChoiceId != null && lastChosenChoiceId == choice.id) {
			    html += "<input class='interactable' type='radio' name='"+radioJSON.id+"' value='"+choice.id+"' onchange='javascript:assessmentListChanged()' checked>";
			} else {
			    html += "<input class='interactable' type='radio' name='"+radioJSON.id+"' value='"+choice.id+"' onchange='javascript:assessmentListChanged()'>";
			}
			html += "<span class='choicetextSpan'>"+choice.text+"</span>"
			    +"</div>";
		};
		html += "</div>";
	}

	return html;
};

/**
 * Returns HTML String to display a textbox assessment, like open response. The assessment object
 * is passed in as JSON object, and is of type text.
 * @param textJSON
 * @return
 */
ASSESSMENTLIST.prototype.getHTMLText = function(textJSON) {
	var html = "<div id='"+textJSON.id+"textboxDiv' class='textboxDiv'>";
	var starterprompt = "";
	/* display starter prompt if specified */
	if (textJSON.starter != null && textJSON.starter.text != null) {
		if (textJSON.starter.display == 1 || textJSON.starter.display == 2) {
			starterprompt = textJSON.starter.text;
		};
	};

	html += "<textarea id='"+textJSON.id+"textbox' class='textboxTextArea interactable' onkeypress='javascript:assessmentListChanged()'>";
	var lastSavedResponse = this.getLastSavedResponse(textJSON);
	if (lastSavedResponse != null) {
		html += lastSavedResponse;
	} else {
		html += starterprompt;
	}
	html += "</textarea>";
	html += "</div>";	
	return html;
};

/**
 * Returns true iff student has "submitted" (ie locked) 
 * this step, so no more editing can be done.
 * @param assessmentJSON
 * @return
 */
ASSESSMENTLIST.prototype.isSubmitted = function() {
	if (this.states && this.states.length > 0) {
		for (var i=0; i < this.states.length; i++) {
			if (this.states[i].isSubmit || this.states[i].submit) {
				return true;
			}
		}
	}
	return false;
};

/**
 * Returns last saved response for given assessment part.
 */
ASSESSMENTLIST.prototype.getLastSavedResponse = function(assessmentJSON) {
	var latestState = null;
	
	if (this.states && this.states.length > 0) {
		latestState = this.states[this.states.length-1];
	} else {
		//there is no previous work so we will check if there is any work to import
		if(this.workToImport != null && this.workToImport.length > 0) {
			latestState = this.workToImport[this.workToImport.length - 1];
		}
	}
	
	if(latestState != null) {
		for (var i=0; i<latestState.assessments.length; i++) {
			if (latestState.assessments[i].id == assessmentJSON.id) {
				//check if the response is null
				if(latestState.assessments[i].response != null) {
					//the student does have a previous response/answer
					if (assessmentJSON.type == "radio") {
						return latestState.assessments[i].response.id;
					} else if (assessmentJSON.type == "text") {
						return latestState.assessments[i].response.text;
					};
				} else {
					//the student does not have a previous response/answer
					return null;
				}
			};
		};
	}
	
	return null;
};

/**
 * disables user from making any more changes
 */
ASSESSMENTLIST.prototype.lockScreen = function() {
	this.setSaveUnavailable();
	$(".interactable").attr("disabled",true);
	
	//the message that says the student has completed this step
	var you_have_completed_this_step = this.view.getI18NString('you_have_completed_this_step', 'AssessmentListNode');
	
	$(".stepAlreadyCompleteDiv").html(you_have_completed_this_step);
};


/**
 * Turn the save button on so the student can click it
 */
ASSESSMENTLIST.prototype.setSaveAvailable = function() {
	$("#submitButton").parent().removeClass("ui-state-disabled");
	$("#submitButton").attr("disabled", false);
};

/**
 * Turn the save button off so the student can't click it.
 * This is used when the data is saved and there is no need
 * to save.
 */
ASSESSMENTLIST.prototype.setSaveUnavailable = function() {
	$("#submitButton").parent().addClass("ui-state-disabled");
	$("#submitButton").attr("disabled", true);
};

/**
 * Enable the save draft button
 */
ASSESSMENTLIST.prototype.setSaveDraftAvailable = function() {
	$("#saveDraftButton").parent().removeClass("ui-state-disabled");
	$("#saveDraftButton").attr("disabled", false);	
};

/**
 * Disable the save draft button
 */
ASSESSMENTLIST.prototype.setSaveDraftUnavailable = function() {
	$("#saveDraftButton").parent().addClass("ui-state-disabled");
	$("#saveDraftButton").attr("disabled", true);	
};

/**
 * Determine whether the save button is available or not.
 * @return true if the save button is available, false is greyed out
 * and is not available
 */
ASSESSMENTLIST.prototype.isSaveAvailable = function() {
	//return !$("#submitButton").hasClass("disabledLink");
	return !$("#submitButton").parent().hasClass("ui-state-disabled");
};

/**
 * Called when the student modifies a field in any assessment part
 */
ASSESSMENTLIST.prototype.assessmentListChanged = function() {
	//set this flag to true so we know that we will need to save a new state
	this.stateChanged = true;
	
	//enable the submit and save draft buttons
	this.setSaveAvailable();
	this.setSaveDraftAvailable();
};

/**
 * Make the default divs visible, these include prompt, starter,
 * response, button, divs
 */
ASSESSMENTLIST.prototype.showDefaultDivs = function() {
	$('#promptDisplayDiv').show();
	$('#starterParent').show();
	$('#responseDisplayDiv').show();
	$('#buttonDiv').show();
};

/**
 * Set the prompt, starter, and response values
 */
ASSESSMENTLIST.prototype.showDefaultValues = function() {
	
	/* set html prompt element values */
	$('#promptDiv').html(this.content.prompt);
	
	//the question label
	var question = this.view.getI18NString('question', 'AssessmentListNode');
	
	$('#promptLabelDiv').html(question);
	
	/* set text area size: set row based on expectedLines */
	$('#responseBox').attr('rows', this.content.assessmentItem.interaction.expectedLines);
};

/*
 * Perform any final tasks after we are done retrieving and rendering
 * any necessary data to the student.
 */
ASSESSMENTLIST.prototype.doneRendering = function() {
	//create any constraints if necessary
	eventManager.fire('contentRenderCompleted', this.node.id, this.node);
};

/**
 * Replace \n with <br> so that the new lines are displayed to the
 * students
 * @param response an array containing the response string or just
 * the response string
 * @return the response string with all \n replaced with <br>
 */
ASSESSMENTLIST.prototype.replaceSlashNWithBR = function(response) {
	var responseString = '';
	
	//check if the response is an array
	if(response.constructor.toString().indexOf('Array') != -1) {
		//the response is an array so we will obtain the string that is in it
		responseString = response[0];
	} else {
		//the response is a string
		responseString = response;
	}
	
	//replace \n with <br>
	return responseString.replace(/\n/g, '<br>');
};

/**
 * Process the tag maps and obtain the results
 * @return an object containing the results from processing the
 * tag maps. the object contains three fields
 * enableStep
 * message
 * workToImport
 */
ASSESSMENTLIST.prototype.processTagMaps = function() {
	var enableStep = true;
	var message = '';
	var workToImport = [];
	
	//the tag maps
	var tagMaps = this.node.tagMaps;
	
	//check if there are any tag maps
	if(tagMaps != null) {
		
		//loop through all the tag maps
		for(var x=0; x<tagMaps.length; x++) {
			
			//get a tag map
			var tagMapObject = tagMaps[x];
			
			if(tagMapObject != null) {
				//get the variables for the tag map
				var tagName = tagMapObject.tagName;
				var functionName = tagMapObject.functionName;
				var functionArgs = tagMapObject.functionArgs;
				
				if(functionName == "importWork") {
					//get the work to import
					workToImport = this.node.getWorkToImport(tagName, functionArgs);
				} else if(functionName == "showPreviousWork") {
					//show the previous work in the previousWorkDiv
					this.node.showPreviousWork($('#previousWorkDiv'), tagName, functionArgs);
				} else if(functionName == "checkCompleted") {
					//we will check that all the steps that are tagged have been completed
					
					//get the result of the check
					var result = this.node.checkCompleted(tagName, functionArgs);
					enableStep = enableStep && result.pass;
					
					if(message == '') {
						message += result.message;
					} else {
						//message is not an empty string so we will add a new line for formatting
						message += '<br>' + result.message;
					}
				}
			}
		}
	}
	
	if(message != '') {
		//message is not an empty string so we will add a new line for formatting
		message += '<br>';
	}
	
	//put the variables in an object so we can return multiple variables
	var returnObject = {
		enableStep:enableStep,
		message:message,
		workToImport:workToImport
	};
	
	return returnObject;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/assessmentlist/assessmentlist.js');
};