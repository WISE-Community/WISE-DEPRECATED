/**
 * @constructor
 * @param node
 * @param view
 * @returns
 */
function OPENRESPONSE(node, view) {
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
	
	//check if there is an associated node whose work we might display in this step
	if(this.node.associatedAnnotateNode != null) {
		//get the node id for the associated node that the student will be reviewing work for
		this.associatedAnnotateNodeId = this.node.associatedAnnotateNode;
		
		//get the associated node object
		this.associatedAnnotateNode = this.view.getProject().getNodeById(this.associatedAnnotateNodeId);
		
		if(this.associatedAnnotateNode != null) {
			//get the content for the associated node
			this.associatedAnnotateNodeContent = this.associatedAnnotateNode.getContent().getContentJSON();			
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
	
	/*
	 * subscribe this open response to listen for the 'getAnnotationsComplete' event.
	 * this is for when we need to retrieve annotations for the teacher review
	 */
	eventManager.subscribe('retrieveAnnotationsCompleted', this.retrieveAnnotationsCompletedListener, this);
};

/**
 * Check if this step needs to be locked by looking at the states
 * and seeing if any of them contain a state with the locked
 * attribute set to true which means the student has previously
 * saved and locked their answer.
 * @return whether the step is locked or not
 */
OPENRESPONSE.prototype.isLocked = function() {
	//loop through all the states
	for(var x=0; x<this.states.length; x++) {
		//get a state
		var state = this.states[x];
		
		//check if the locked attribute is set to true
		if(state.locked) {
			return true;
		}
	}
	
	return false;
};

/**
 * Retrieve the response from the responseBox
 * @return the answer the student wrote in the responseBox
 */
OPENRESPONSE.prototype.getResponse = function() {
	var response = null;
	
	if(this.richTextEditor){
		response = this.richTextEditor.getContent();
	} else {
		response = document.getElementById('responseBox').value;
	}
	
	return response;
};

/**
 * Saves current state of the OpenResponse item
 * - what the students typed
 * - timestamp
 * 
 * Then disable the textarea and save button and show the edit button
 */
OPENRESPONSE.prototype.save = function(saveAndLock,checkAnswer) {
	/*
	 * check if the save button is available. if it is available
	 * it means the student has modified the response. if it
	 * is not available, it means the student has not made any
	 * changes so we do not to do anything.
	 */
	if (this.isSaveAvailable() || this.isSaveAndLockAvailable() || this.isCheckAnswerAvailable()) {
		var response = "";
		
		/* set html to textarea if richtexteditor exists */
		response = this.getResponse();
		
		//check if the student changed their response
		if(this.isResponseChanged() || saveAndLock || checkAnswer) {
			//response was changed so we will create a new state and save it
			var orState = new OPENRESPONSESTATE(response);
			
			//set the cRaterItemId into the node state if this step is a CRater item
			if(this.content.cRater != null && this.content.cRater.cRaterItemId != null
					&& this.content.cRater.cRaterItemId != '') {
				
				if(checkAnswer && !isNaN(parseInt(this.content.cRater.maxCheckAnswers))) {
					/*
					 * the student has clicked check answer and there is a max 
					 * number of check answer submits specified for this step
					 */
					
					/*
					 * the messsage that says they have x chance(s) to receive feedback, 
					 * are they sure they want to submit?
					 */
					var you_have = this.view.getI18NString('you_have', 'OpenResponseNode');
					var chances = this.view.getI18NString('chances', 'OpenResponseNode');
					var chance = this.view.getI18NString('chance', 'OpenResponseNode');
					var to_receive_feedback = this.view.getI18NString('to_receive_feedback', 'OpenResponseNode');
					var are_you_ready_to_receive_feedback = this.view.getI18NString('are_you_ready_to_receive_feedback', 'OpenResponseNode');
					
					//create the message to display to the student to notify them that there are a limited number of check answers
					var numChancesLeft = this.content.cRater.maxCheckAnswers - (parseInt(this.getNumberOfCRaterSubmits()));
					var submitCheckAnswerMessage = you_have + ' ' + numChancesLeft;
					if (numChancesLeft > 1) {
						submitCheckAnswerMessage += ' ' + chances;
					} else {
						submitCheckAnswerMessage += ' ' + chance;
					}
					submitCheckAnswerMessage += ' ' + to_receive_feedback + '\n\n';	
					submitCheckAnswerMessage += are_you_ready_to_receive_feedback;
							
					//popup a confirm dialog
					var submitCheckAnswer = confirm(submitCheckAnswerMessage);
					
					if(!submitCheckAnswer) {
						//the student has cancelled their check answer submit
						return;
					}
				}
				
				orState.cRaterItemId = this.content.cRater.cRaterItemId;
				orState.cRaterItemType = this.content.cRater.cRaterItemType;
				
				if (checkAnswer || !(this.content.cRater.displayCRaterScoreToStudent || this.content.cRater.displayCRaterFeedbackToStudent)) {
					/*
					 * set the cRaterItemId into the node state if the student has clicked
					 * check answer or if we are not displaying the score or feedback to
					 * the student in which case we always want to CRater submit because
					 * we are not displaying the check answer button to them.
					 */
					orState.isCRaterSubmit = true;
					checkAnswer = true; // we want to also check the answer immediately, just not show the score or feedback.
				}
				
				if(!checkAnswer && this.content.cRater != null && 
						(this.content.cRater.displayCRaterScoreToStudent || this.content.cRater.displayCRaterFeedbackToStudent) 
						&& this.content.cRater.maxCheckAnswers != null && !this.isCRaterMaxCheckAnswersUsedUp()) {
					/*
					 * the student has clicked the save button or made changes and is moving to another step
					 * and we are displaying CRater score or feedback immediately to the student
					 * and the student still has check answer submits left so we will display
					 * a popup to remind them to click the check answer button
					 */
					var if_you_are_ready = this.view.getI18NString('if_you_are_ready', 'OpenResponseNode');
					
					alert(if_you_are_ready);
				}
			}

			var lock = false;

			if(saveAndLock) {
				//the message that tells the student they will not be able to edit after submitting
				var you_will_not_be_able_to_make_edits_after = this.view.getI18NString('you_will_not_be_able_to_make_edits_after', 'OpenResponseNode');
				
				//display a confirm message to make sure they want to submit and lock
				lock = confirm(you_will_not_be_able_to_make_edits_after);
				
				//check if they answered yes
				if(lock) {
					if(this.node.peerReview != null && this.node.peerReview == 'start') {
						/*
						 * set the submitPeerReview attribute in the state so the VLEPostData
						 * handles the peer review work correctly
						 */
						orState.submitForPeerReview = true;
					}
					
					//set the locked attribute in the state
					orState.locked = true;
					
					//disable the response box
					this.lockResponseBox();
					
					//disable the save and lock button
					this.setSaveAndLockUnavailable();
					
					//set the lock flag for future lookup
					this.locked = true;
					
					//tell the node that the student has completed the step
					this.node.setCompleted();
					
					if(this.node.peerReview != null) {
						//this is a peer review of a previous step

						if(this.node.peerReview == 'annotate' && !this.showAuthorContent) {
							//send the annotation for the peer review
							this.postAnnotation(response);
						}
					}
				}
			} 

			if(this.node.peerReview == 'revise' || this.node.teacherReview == 'revise') {
				/*
				 * if the node is a peer/teacher review revise step we will set completed
				 * to true because revise steps do not save and lock
				 */
				
				//tell the node that the student has completed it
				this.node.setCompleted();
			}

			//fire the event to push this state to the global view.states object
			this.view.pushStudentWork(this.node.id, orState);

			//push the state object into this or object's own copy of states
			this.states.push(orState);

			/*
			 * if we want to check answer immediately (e.g. for CRater), post answer immediately, before going to the next step.
			 * if checkAnswer is true and saveAndLock is false, we will run the CRater check answer
			 * if checkAnswer is true and saveAndLock is true and lock is true, we will run the CRater check answer
			 */
			if (checkAnswer && (!saveAndLock || (saveAndLock && lock))) {
				//set the cRaterItemId into the node state if this step is a CRater item
				if(this.content.cRater != null && this.content.cRater.cRaterItemId != null
						&& this.content.cRater.cRaterItemId != '') {
					
					//the message to display while we are auto grading the student's work
					var please_wait_we_are_checking_your_work = this.view.getI18NString('please_wait_we_are_checking_your_work', 'OpenResponseNode');
					var seconds = this.view.getI18NString('seconds', 'OpenResponseNode');
					
					/*
					 * lock the screen so the student doesn't move to another step before
					 * they see the CRater feedback. display a waiting spinner and a message
					 * to the student on the wait screen.
					 */
					var waitTime = 15;
					var lockScreenObj = {};
					lockScreenObj.shareType = 'TeacherMessage';
					lockScreenObj.shareObject = '<p align="center"><img src="images/ajax-loader.gif" /> ' + please_wait_we_are_checking_your_work + ' ' + waitTime + ' ' + seconds + '</p>';
					eventManager.fire('lockScreenAndShareWithClass', lockScreenObj);
					
					/*
					 * create a timeout to unlock the screen in case it takes too long 
					 * for the CRater request to respond
					 */
					setTimeout("eventManager.fire('unlockScreenEvent')", waitTime * 1000);
					
					/*
					 * post the current node visit to the db immediately without waiting
					 * for the student to exit the step.
					 */
					this.node.view.postCurrentNodeVisit();
				}
				
				if((this.content.cRater != null && this.content.cRater.maxCheckAnswers != null && this.isCRaterMaxCheckAnswersUsedUp()) || this.isLocked()) {
					//student has used up all of their CRater check answer submits so we will disable the check answer button
					this.setCheckAnswerUnavailable();
				} else {
					//the student still has check answer submits available
					this.setCheckAnswerAvailable();
				}
			}

			if(this.content.cRater != null) {
				//check if the student is required to submit and revise before exiting the step
				if(this.content.cRater.mustSubmitAndReviseBeforeExit) {
					var nodeId = this.node.id;
					
					//get all the node visits for this step
					var nodeVisits = this.view.getState().getNodeVisitsByNodeId(nodeId);
					
					//check if the student has submitted and revised their work
					var completed = this.node.isCompleted(nodeVisits);
					
					if(!completed) {
						//the student has not submitted and revised so we will lock them in the step until they revise
						this.view.addActiveTagMapConstraint(this.node.id, null, 'mustCompleteBeforeAdvancing', null, null);				
					}
				}
			}
		};

		//turn the save button off
		this.setSaveUnavailable();
	}
};

/**
 * Send the response back as an annotation. Used for Peer Review. 
 * @param response
 */
OPENRESPONSE.prototype.postAnnotation = function(response) {
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
 * Save the student work and lock the step so the student can't
 * change their answer
 */
OPENRESPONSE.prototype.saveAndLock = function() {
	var doSaveAndLock=true;
	var doCheckAnswer=false;
	this.save(doSaveAndLock,doCheckAnswer);
};

/**
 * Save the student work and lock the step so the student can't
 * change their answer
 */
OPENRESPONSE.prototype.checkAnswer = function() {
	var doSaveAndLock=false;
	var doCheckAnswer=true;
	
	if(this.content.isLockAfterSubmit) {
		doSaveAndLock = true;
	}
	
	this.save(doSaveAndLock,doCheckAnswer);
};


/**
 * The student has modified their response so we will perform
 * whatever we will set the Save button available.
 */
OPENRESPONSE.prototype.responseEdited = function() {
	this.setSaveAvailable();
	
	if(this.content.cRater != null && this.content.cRater.maxCheckAnswers != null && this.isCRaterMaxCheckAnswersUsedUp()) {
		//student has used up all of their CRater check answer submits so we will disable the check answer button
		this.setCheckAnswerUnavailable();
	} else {
		this.setCheckAnswerAvailable();
	}
	var numberAttemptsMessage = this.view.getI18NStringWithParams("this_is_revision_x",[this.states.length+1],"OpenResponseNode");
	$("#numberAttemptsDiv").html(numberAttemptsMessage);
};

/**
 * Turn the save button on so the student can click it
 */
OPENRESPONSE.prototype.setSaveAvailable = function() {
	$('#saveButton').removeAttr('disabled');
};

/**
 * Turn the save button off so the student can't click it.
 * This is used when the data is saved and there is no need
 * to save.
 */
OPENRESPONSE.prototype.setSaveUnavailable = function() {
	$('#saveButton').attr('disabled','disabled');
};

/**
 * Determine whether the save button is available or not.
 * @return true if the save button is available, false is greyed out
 * and is not available
 */
OPENRESPONSE.prototype.isSaveAvailable = function() {
	if($('#saveButton').attr('disabled')=='disabled'){
		return false;
	} else {
		return true;
	}
};

/**
 * Turn the save button on so the student can click it
 */
OPENRESPONSE.prototype.setSaveAndLockAvailable = function() {
	$('#saveAndLockButton').removeAttr('disabled');
};

/**
 * Turn the save button off so the student can't click it.
 * This is used when the data is saved and there is no need
 * to save.
 */
OPENRESPONSE.prototype.setSaveAndLockUnavailable = function() {
	$('#saveAndLockButton').attr('disabled','disabled');
};

/**
 * Determine whether the save button is available or not.
 * @return true if the save button is available, false is greyed out
 * and is not available
 */
OPENRESPONSE.prototype.isSaveAndLockAvailable = function() {
	if($('#saveAndLockButton').attr('disabled')=='disabled'){
		return false;
	} else {
		return true;
	}
};



/**
 * Turn the save button on so the student can click it
 */
OPENRESPONSE.prototype.setCheckAnswerAvailable = function() {
	$('#checkAnswerButton').removeAttr('disabled');
};

/**
 * Turn the save button off so the student can't click it.
 * This is used when the data is saved and there is no need
 * to save.
 */
OPENRESPONSE.prototype.setCheckAnswerUnavailable = function() {
	$('#checkAnswerButton').attr('disabled','disabled');
};

/**
 * Determine whether the save button is available or not.
 * @return true if the save button is available, false is greyed out
 * and is not available
 */
OPENRESPONSE.prototype.isCheckAnswerAvailable = function() {
	if($('#checkAnswerButton').attr('disabled')=='disabled'){
		return false;
	} else {
		return true;
	}
};

/**
 * Determines whether the student has changed their response
 * by comparing the previous state with the current state.
 * @return whether the student changed their response
 */
OPENRESPONSE.prototype.isResponseChanged = function() {
	//obtain the previous state
	var previousState = this.states[this.states.length - 1];
	
	var previousResponse = "";
	
	if(previousState != null) {
		previousResponse = previousState.response;
	}
	
	var currentResponse = this.getResponse();
	
	//check if there were any changes
	if(previousResponse != currentResponse) {
		//there were changes
		return true;
	} else {
		//there were no changes
		return false;
	}
};

/**
 * Hide all the divs in the openresponse.html 
 */
OPENRESPONSE.prototype.hideAll = function() {
	$('#promptDisplayDiv').hide();
	$('#originalPromptDisplayDiv').hide();
	$('#associatedWorkDisplayDiv').hide();
	$('#annotationDisplayDiv').hide();
	$('#starterParent').hide();
	$('#responseDisplayDiv').hide();
	$('#buttonDiv').hide();
};

/**
 * Hide all the divs in the openresponse.html and just display a message
 */
OPENRESPONSE.prototype.onlyDisplayMessage = function(message) {
	//set the node closed because the student can't work on it yet
	this.node.setStepClosed();
	
	//hide all the divs
	this.hideAll();
	
	//display the prompt div
	$('#promptDisplayDiv').show();
	
	//remove the text in this label div
	document.getElementById('promptLabelDiv').innerHTML = '';
	
	//set the prompt div to this message
	document.getElementById('orPromptDiv').innerHTML = message;
};

/**
 * Render this OpenResponse item
 */
OPENRESPONSE.prototype.render = function() {
	var enableStep = true;
	var message = '';
	var workToImport = [];
	
	//process the tag maps if we are not in authoring mode
	if(this.view.authoringMode == null || !this.view.authoringMode) {
		//get the tag map results
		var tagMapResults = this.processTagMaps();
		
		//get the result values
		enableStep = tagMapResults.enableStep;
		message = tagMapResults.message;
		workToImport = tagMapResults.workToImport;
	}
	
	/*
	 * check if this is a peer/teacher review annotation step and it is locked.
	 * a peer/teacher review annotation step becomes locked once the student
	 * submits their annotation.
	 */
	if((this.node.peerReview == 'annotate' || this.node.teacherReview == 'annotate') && 
			this.locked) {
		//disable save buttons
		this.setSaveUnavailable();
		this.setSaveAndLockUnavailable();
		this.setCheckAnswerUnavailable();
		
		if (typeof this.content.keepAnnotatedWork == "undefined" || !this.content.keepAnnotatedWork){
			//the message that tells the student they have successfully reviewed a classmate's work
			var you_have_successfully_reviewed = this.view.getI18NString('you_have_successfully_reviewed', 'OpenResponseNode');
			var team_anonymous = this.view.getI18NString('team_anonymous', 'OpenResponseNode');
			var well_done = this.view.getI18NString('well_done', 'OpenResponseNode');
			
			//display this message in the step frame
			this.onlyDisplayMessage('<p>' + you_have_successfully_reviewed + ' <i>' + team_anonymous + '</i>.</p><p>' + well_done + '</p>');
			return;
		}
	}
	

	
	//check if we need to display the save and lock button
	if(this.node.peerReview != null || this.node.teacherReview != null) {
		if(this.node.peerReview == 'start' || this.node.peerReview == 'annotate' ||
				this.node.teacherReview == 'start' || this.node.teacherReview == 'annotate') {
			/*
			 * this is the start step for the peer review where the student
			 * submits their original work or the step where they annotate
			 * another student's work
			 */
			$('#saveAndLockButton').show();
		}
	} else if (this.content.cRater && (this.content.cRater.displayCRaterScoreToStudent || this.content.cRater.displayCRaterFeedbackToStudent)) {
		// if this is a CRater-enabled item and we are displaying the score or feedback to the student, also show the "check" button
		$('#checkAnswerButton').show();
		
		if((this.content.cRater != null && this.content.cRater.maxCheckAnswers != null && this.isCRaterMaxCheckAnswersUsedUp()) || this.isLocked()) {
			//student has used up all of their CRater check answer submits so we will disable the check answer button
			this.setCheckAnswerUnavailable();
		} else {
			//the student still has check answer submits available so we will enable the check answer button
			this.setCheckAnswerAvailable();
		}
	} else if (this.content.isLockAfterSubmit) {
		// this node is set to lock after the student submits the answer. show saveAndLock button
		$('#saveAndLockButton').show();
	}
	
	if(this.view != null && this.view.activeNode != null) {
		//we are in authoring step preview mode so we will just show the regular openresponse display
		this.displayRegular();
		
		//check if we need to display the save and lock button
		if(this.node.peerReview != null || this.node.teacherReview != null) {
			if(this.node.peerReview == 'start' || this.node.peerReview == 'annotate' ||
					this.node.teacherReview == 'start' || this.node.teacherReview == 'annotate') {
				/*
				 * this is the start step for the peer review where the student
				 * submits their original work or the step where they annotate
				 * another student's work
				 */
				$('#saveAndLockButton').show();
			}
			
			/*
			 * display the appropriate divs that the student would see for peer/teacher review
			 */
			if(this.node.peerReview == 'annotate' || this.node.teacherReview == 'annotate') {
				//the instructions label
				var instructions = this.view.getI18NString('instructions', 'OpenResponseNode');
				
				//the label for this student's feedback that they need to write
				var your_feedback_for = this.view.getI18NString('your_feedback_for', 'OpenResponseNode');
				var team_anonymous = this.view.getI18NString('team_anonymous', 'OpenResponseNode');
				
				//the label for the prompt from the first step
				var prompt_from_the_first_peer_review_step = this.view.getI18NString('prompt_from_the_first_peer_review_step', 'OpenResponseNode');
				
				//set more informative labels
				document.getElementById('promptLabelDiv').innerHTML = instructions;
				document.getElementById('responseLabelDiv').innerHTML = your_feedback_for + ' <i>' + team_anonymous + '</i>:';
				
				//display the prompt
				document.getElementById('originalPromptTextDiv').innerHTML = '[' + prompt_from_the_first_peer_review_step + ']';
				$('#originalPromptDisplayDiv').show();
				
				//the label for the work from another classmate
				var work_submitted_by = this.view.getI18NString('work_submitted_by', 'OpenResponseNode');
				var team_anonymous = this.view.getI18NString('team_anonymous', 'OpenResponseNode');
				var work_from_a_random_classmate_will_display = this.view.getI18NString('work_from_a_random_classmate_will_display', 'OpenResponseNode');
				
				/*
				 * display the other student's work or a message saying there is no other student work
				 * available yet
				 */
				document.getElementById('associatedWorkLabelDiv').innerHTML = work_submitted_by + ' <i>' + team_anonymous + '</i>:';		
				document.getElementById('associatedWorkTextDiv').innerHTML = '[' + work_from_a_random_classmate_will_display + ']';
				$('#associatedWorkDisplayDiv').show();
			} else if(this.node.peerReview == 'revise' || this.node.teacherReview == 'revise') {
				//the label for the instructions
				var instructions = this.view.getI18NString('instructions', 'OpenResponseNode');
				
				//the label for the student's revised work
				var your_second_draft = this.view.getI18NString('your_second_draft', 'OpenResponseNode');
				
				//the label for the prompt from the first step
				var prompt_from_the_first_peer_review_step = this.view.getI18NString('prompt_from_the_first_peer_review_step', 'OpenResponseNode');
				
				//set more informative labels
				document.getElementById('promptLabelDiv').innerHTML = instructions;
				document.getElementById('responseLabelDiv').innerHTML = your_second_draft + ':';
				
				//set the original prompt text and make it visible
				document.getElementById('originalPromptTextDiv').innerHTML = '[' + prompt_from_the_first_peer_review_step + ']';
				$('#originalPromptDisplayDiv').show();
				
				//the label for the student's first response
				var your_original_response = this.view.getI18NString('your_original_response', 'OpenResponseNode');
				var show_hide_text = this.view.getI18NString('show_hide_text', 'OpenResponseNode');
				var students_work_from_first_peer_review_step = this.view.getI18NString('students_work_from_first_peer_review_step', 'OpenResponseNode');
				
				//set the original work text and make it visible
				document.getElementById('associatedWorkLabelDiv').innerHTML = your_original_response + '&nbsp;&nbsp;&nbsp;<a id="toggleSwitch" onclick="toggleDetails2()">' + show_hide_text + '</a>';
				document.getElementById('associatedWorkTextDiv').innerHTML = "[" + students_work_from_first_peer_review_step + "]";
				$('#associatedWorkDisplayDiv').show();
				
				//hide the original work
				$('#associatedWorkTextDiv').hide();
				
				//display the div that says "text is hidden"
				$('#associatedWorkTextDiv2').show();
				
				//the text for the feedback this student has received
				var team_anonymous = this.view.getI18NString('team_anonymous', 'OpenResponseNode');
				var has_given_you_the_following_feedback = this.view.getI18NString('has_given_you_the_following_feedback', 'OpenResponseNode');
				var feedback_from_classmate_or_teacher = this.view.getI18NString('feedback_from_classmate_or_teacher', 'OpenResponseNode');
				
				//set the annotation text and make it visible
				document.getElementById('annotationLabelDiv').innerHTML = '<i>' + team_anonymous + '</i> ' + has_given_you_the_following_feedback + ':';
				document.getElementById('annotationTextDiv').innerHTML = '[' + feedback_from_classmate_or_teacher + ']';
				$('#annotationDisplayDiv').show();
			}
		}
		
	} else if(this.associatedStartNode != null) {
		if(this.node.peerReview != null) {
			//this is a peer review of a previous step
			
			if(this.node.peerReview == 'annotate') {
				//this is the step where the student writes comments on their classmates work. retrieve other student work if not in preview
				if (this.view.getConfig().getConfigParam("mode") == "run") {					
					this.retrieveOtherStudentWork();
				}
			} else if(this.node.peerReview == 'revise') {
				/*
				 * this is the step where the student reads the comments from their classmate
				 * and revises their original work
				 */
				if (this.view.getConfig().getConfigParam("mode") == "run") {
					this.retrieveAnnotationAndWork();
				}
			}
		} else if(this.node.teacherReview != null) {
			if(this.node.teacherReview == 'annotate') {
				//this is the step where the student annotates the authored work
				this.displayTeacherWork();
			} else if(this.node.teacherReview == 'revise') {
				/*
				 * this is the step where the student reads comments from their teacher
				 * and revises their work
				 */
				if (this.view.getConfig().getConfigParam("mode") == "run") {
					this.retrieveTeacherReview();
				}
			}
		} else {
			//this is a self review of a previous step
			//implement me later
		}
	} else {
		/*
		 * this is just a regular open response so we will just show
		 * the regular divs and populate them
		 */
		this.displayRegular();
	}

	if(this.content.showPreviousWorkThatHasAnnotation && this.node.type != 'NoteNode') {
		/*
		 * show the previous work that has a teacher comment annotation.
		 * this is not available for note steps.
		 */
		this.showPreviousWorkThatHasAnnotation(null, 'comment');
	}
	
	if(this.content.showPreviousWorkThatHasAnnotation && this.content.cRater &&
			(this.content.cRater.displayCRaterScoreToStudent || this.content.cRater.displayCRaterFeedbackToStudent)) {
		//show the previous work that has a CRater annotation
		this.showPreviousWorkThatHasAnnotation(null, 'cRater');
	}
	
	/*
	 * check if the student has previously submitted work and received a crater
	 * score or feedback.
	 */
	if(this.states.length > 0 && this.content.cRater && (this.content.cRater.displayCRaterScoreToStudent || this.content.cRater.displayCRaterFeedbackToStudent) && !this.isLocked()) {
		//get the latest node state
		var nodeState = this.states[this.states.length - 1];
		
		if(nodeState != null) {
			//get the previous student response
			var response = nodeState.response;
			
			/*
			 * if the student work is blank and the crater score requires the student to rewrite
			 * their response, we will show the previous response
			 */
			if(response == '') {
				//get the latest crater annotation if any
				var latestCRaterAnnotation = this.getLatestAnnotationByType('cRater');
				
				if(latestCRaterAnnotation != null) {
					//get the value of the annotation
					var value = latestCRaterAnnotation.value;
					
					if(value != null) {
						//get the latest value
						var latestValue = value[value.length - 1];
						
						if(latestValue != null) {
							//get the score
							var score = latestValue.score;
							
							if(score != null) {
								//get the student action for the given score
								var studentAction = this.getStudentAction(score);
								
								if(studentAction == null) {
									//do nothing
								} else if(studentAction == 'rewrite') {
									this.showPreviousWorkThatHasAnnotation(null, 'cRater');
								}
							}
						}
					}
				}
			}
		}
	}
	
	//import any work if necessary
	this.importWork(workToImport);
	
	if (this.content.isLockAfterSubmit) {
		// this node is set to lock after the student submits the answer. show saveAndLock button
		$("#saveButton").hide();
	}
	
	//check if this step is locked
	if(this.locked) {
		//the step is locked so we will disable the response box and save and lock button
		this.lockResponseBox();
		this.setSaveAndLockUnavailable();
	} else {
		//make the save and lock button clickable
		this.setSaveAndLockAvailable();
	}
	
	//check if this is a CRater step and if we have already subscribed to the event for this step
	if(this.content.cRater != null && !this.node.subscribedToCRaterResponseReceived) {
		//set the CRater response received listener
		eventManager.subscribe('cRaterResponseReceived', this.cRaterResponseReceivedListener, this);
		
		this.node.subscribedToCRaterResponseReceived = true;
	}
};

/**
 * The function that is called when we receive a CRater response
 * @param type the type of event in this case 'cRaterResponseReceived'
 * @param args an array containing the node id and CRater annotation
 * @param obj this openresponse object
 */
OPENRESPONSE.prototype.cRaterResponseReceivedListener = function(type, args, obj) {
	var thisOr = obj;
	var nodeId = args[0];
	var annotationJSON = args[1];
	
	/*
	 * check if this listener function is from the same open response step
	 * that the CRater request originated from
	 */
	if(thisOr.node.id == nodeId) {
		//call the function to perform any necessary processing with the CRater response
		thisOr.cRaterResponseReceivedHandler(nodeId, annotationJSON);		
	}
};

/**
 * Performs any necessary processing on the CRater response
 * @param nodeId the node id for which the CRater response is for
 * @param annotationJSON the CRater annotation
 */
OPENRESPONSE.prototype.cRaterResponseReceivedHandler = function(nodeId, annotationJSON) {
	if(this.node.id == nodeId && annotationJSON != null) {
		
		/*
		 * check if we are displaying the score or feedback to the student
		 * and that the step is not locked
		 */
		if((this.content.cRater.displayCRaterScoreToStudent || this.content.cRater.displayCRaterFeedbackToStudent) && !this.isLocked()) {
			//get the value of the annotation
			var value = annotationJSON.value;
			
			if(value != null) {
				//get the latest value
				var latestValue = value[value.length - 1];
				
				if(latestValue != null) {
					//get the score
					var score = latestValue.score;
					
					if(score != null) {
						//get the student action for the given score
						var studentAction = this.getStudentAction(score);
						
						if(studentAction == null) {
							//do nothing
						} else if(studentAction == 'rewrite') {
							/*
							 * move the current work to the previous work response box
							 * because we want to display the previous work to the student
							 * and have them re-write another response after they
							 * receive the immediate CRater feedback
							 */
							this.showPreviousWorkThatHasAnnotation($('#responseBox').val());
							
							//clear the response box so they will need to write a new response
							$('#responseBox').val('');
						} else if(studentAction == 'revise') {
							/*
							 * the student will need to revise their work so we will hide the
							 * previous response display
							 */
							$('#previousResponseDisplayDiv').hide();
						}
					}
				}
			}
		}
	}
};

/**
 * Get the student action given the score. If there are multiple feedbacks
 * with the same score, we will just use the first feedback we find.
 * @param score the score
 * @return the student action 'revise' or 'rewrite'
 */
OPENRESPONSE.prototype.getStudentAction = function(score) {
	var studentAction = null;
	
	if(this.content != null &&
			this.content.cRater != null &&
			this.content.cRater.cRaterScoringRules != null) {
		//get the CRater scoring rules
		var cRaterScoringRules = this.content.cRater.cRaterScoringRules;
		
		//loop through all the CRater scoring rules
		for(var x=0; x<cRaterScoringRules.length; x++) {
			//get a CRater scoring rule
			var cRaterScoringRule = cRaterScoringRules[x];
			
			//get the score
			var tempScore = cRaterScoringRule.score;
			
			//get the action
			var tempStudentAction = cRaterScoringRule.studentAction;
			
			if(score == tempScore) {
				//we have found the CRater scoring rule with the score we want
				if(tempStudentAction != null) {
					//we will return this student action
					studentAction = tempStudentAction;
					break;
				}				
			}
		}
	}
	
	return studentAction;
};

/**
 * Show the previous work that has had a teacher comment annotation.
 * @param previousResponse an optional argument which is the previous work which
 * we will show without having to look it up
 * @param annotationType an optional argument which is the type of annotation
 */
OPENRESPONSE.prototype.showPreviousWorkThatHasAnnotation = function(previousResponse, annotationType) {
	
	if(previousResponse != null) {
		//display the previous response div
		$('#previousResponseDisplayDiv').show();
		
		//set the student response into the previous response disabled textarea
		$('#previousResponseBox').val(previousResponse);
		
		//clear the response box so the student will have to type a new response
		$('#responseBox').val('');
	} else {
		//get the annotation attributes that we will use to look up the teacher comment annotation
		var runId = this.view.getConfig().getConfigParam('runId');
		var nodeId = this.view.currentNode.id;
		var toWorkgroup = this.view.getUserAndClassInfo().getWorkgroupId();
		var fromWorkgroups = null;
		var type = null;
		var stepWorkId = null;
		
		if(annotationType != null) {
			//use the annotation type that was passed in
			type = annotationType;
		}
		
		if(annotationType == 'cRater') {
			//crater annotations have fromWorkgroup=-1
			fromWorkgroups = [-1];
		} else {
			//get the teacher and shared teacher workgroups
			fromWorkgroups = this.view.getUserAndClassInfo().getAllTeacherWorkgroupIds();
		}
		
		//get the latest annotation for this step with the given parameters
		var latestAnnotation = this.view.getAnnotations().getLatestAnnotation(runId, nodeId, toWorkgroup, fromWorkgroups, type, stepWorkId);
		
		if(latestAnnotation != null) {
			//get the step work id that the annotation was for
			var stepWorkId = latestAnnotation.stepWorkId;
			
			//get the node visit with the step work id
			var annotationNodeVisit = this.view.getState().getNodeVisitById(stepWorkId);

			//get the annotation post time
			var annotationPostTime = latestAnnotation.postTime;
			
			//get all the node visits for this step
			var nodeVisitsForNodeId = this.view.getState().getNodeVisitsByNodeId(nodeId);
			
			//whether to show the previous work
			var showPreviousResponse = true;
			
			if(nodeVisitsForNodeId != null) {
				
				/*
				 * we will loop through all the node visits and look for any work that
				 * is newer than the annotation. if there is no new work after the
				 * annotation it means the student has not revised their work based
				 * on the annotation so we will display their previous response
				 * in the greyed out previous response box and clear out the
				 * regular response box so that they need to type a new response.
				 */ 
				for(var x=0; x<nodeVisitsForNodeId.length; x++) {
					//get a node visit
					var tempNodeVisit = nodeVisitsForNodeId[x];
					
					if(tempNodeVisit != null) {
						//get the latest node state for the node visit
						var nodeState = tempNodeVisit.getLatestWork();
						
						//get the response from the node state
						var response = this.node.getStudentWorkString(nodeState.response);
						
						if(response != null && response != "") {
							//get the post time for the node visit
							var tempPostTime = tempNodeVisit.visitPostTime;
							
							//get the node state timestamp
							//var nodeStateTimestamp = nodeState.timestamp;
							
							if(tempPostTime > annotationPostTime) {
								/*
								 * the node visit post time is later than the annotation
								 */
								showPreviousResponse = false;
							}
						}
					}
				}				
			}
			
			if(showPreviousResponse) {
				/*
				 * we are going to show the previous response and clear out the response textarea
				 * so that the student needs to write a new response based on the new annotation
				 * they have received
				 */
				
				if(annotationType == 'cRater' && latestAnnotation != null) {
					if(latestAnnotation.value != null && latestAnnotation.value.length > 0) {
						//get the annotation value which contains the student response submitted to CRater
						var latestCRaterValue = latestAnnotation.value[latestAnnotation.value.length - 1];
						
						if(latestCRaterValue != null && latestCRaterValue.studentResponse != null && latestCRaterValue.studentResponse.response != null) {
							//get the student response
							var response = this.node.getStudentWorkString(latestCRaterValue.studentResponse.response);
							
							//display the previous response div
							$('#previousResponseDisplayDiv').show();
							
							//set the student response into the previous response disabled textarea
							$('#previousResponseBox').val(response);
							
							//clear the response box so the student will have to type a new response
							$('#responseBox').val('');
						}
					}
				} else {
					if(annotationNodeVisit != null) {
						//get all the node states in the node visit
						var nodeStates = annotationNodeVisit.nodeStates;
						
						if(nodeStates != null && nodeStates.length != 0) {
							//get the last node state
							var nodeState = nodeStates[nodeStates.length - 1];
							
							if(nodeState != null) {
								//get the student response
								var response = nodeState.response;
								response = this.node.getStudentWorkString(response);
								
								//display the previous response div
								$('#previousResponseDisplayDiv').show();
								
								//set the student response into the previous response disabled textarea
								$('#previousResponseBox').val(response);
								
								//clear the response box so the student will have to type a new response
								$('#responseBox').val('');
							}
						}
					}
				}
			}
		}
	}
};

/**
 * This is when the step is just a regular open response and not
 * a special peer review or teacher review. We will just display
 * the normal divs and populate their values like normal.
 */
OPENRESPONSE.prototype.displayRegular = function() {
	//display the regular divs such as prompt, starter, and response
	this.showDefaultDivs();
	
	//populate the divs
	this.showDefaultValues();
	
	//set the response if there were previous revisions
	this.setResponse();
	
	/* start the rich text editor if specified */
	if(this.content.isRichTextEditorAllowed){
		var context = this;
		var loc = window.location.toString();
		var vleLoc = loc.substring(0, loc.indexOf('/vle/')) + '/vle/';
		var contextPath = this.view.getConfig().getConfigParam('contextPath');
		
		//set the text editor to be editable by default
		var readOnly = 0;
		
		if(this.locked) {
			//the text editor should be locked so we will make it read only
			readOnly = 1;
		}
		
		$('#responseBox').tinymce({
			// Location of TinyMCE script
			script_url : contextPath + '/vle/jquery/tinymce/jscripts/tiny_mce/tiny_mce.js',
			
			// General options
			theme : "advanced",
			plugins : "emotions",
			readonly:readOnly,
			
			// Theme options
			theme_advanced_buttons1: 'bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,|,bullist,numlist,|,emotions,|,forecolor,backcolor,|,formatselect,fontselect,fontsizeselect',
			theme_advanced_buttons2: '',
			theme_advanced_buttons3: '',
			theme_advanced_buttons4: '',
			theme_advanced_toolbar_location : "top",
			theme_advanced_toolbar_align : "left",
			theme_advanced_statusbar_location : "bottom",
			relative_urls: false,
			remove_script_host: true,
			document_base_url: vleLoc,
			
			onchange_callback: function(ed){
				/* add change listener */
		        context.responseEdited();
		    },
			setup: function(ed){
				// store editor as prototype variable
				context.richTextEditor = ed;
				
				/* add keyup listener */
		        ed.onKeyUp.add(context.responseEdited, context);
		    }
		});
	}
	
	/*
	 * perform any final tasks after we have finished rendering
	 */
	this.doneRendering();
};

/**
 * This is for displaying the authored work for the student to
 * review.
 */
OPENRESPONSE.prototype.displayTeacherWork = function() {
	//check that the original node is locked
	var isOriginalNodeLocked = this.view.isLatestNodeStateLocked(this.associatedStartNode.id);
	
	if(!isOriginalNodeLocked) {
		//original step is not locked
		
		//the message to tell the student they need to submit a previous step
		var to_start_this_step = this.view.getI18NString('to_start_this_step', 'OpenResponseNode');
		var link = this.view.getI18NString('link', 'OpenResponseNode');
		
		//display message telling student to go back and submit that original step
		this.onlyDisplayMessage('<p>' + to_start_this_step + ' <b><a style=\"color:blue\" onclick=\"eventManager.fire(\'nodeLinkClicked\', [\'' + this.view.getProject().getPositionById(this.associatedStartNode.id) + '\']) \">' + this.view.getProject().getStepNumberAndTitle(this.associatedStartNode.id) + '</a></b> (' + link + ').</p>');
	} else {
		//original step is locked
		
		//get the authored work
		var teacherWorkText = this.content.authoredWork;
		
		//replace \n with <br>
		teacherWorkText = this.replaceSlashNWithBR(teacherWorkText);
		
		//show regular divs such as prompt, starter, and response and populate them
		this.showDefaultDivs();
		this.showDefaultValues();

		//the instructions label
		var instructions = this.view.getI18NString('instructions', 'OpenResponseNode');
		
		//the label for this student's feedback to another student
		var your_feedback_for = this.view.getI18NString('your_feedback_for', 'OpenResponseNode');
		var team_anonymous = this.view.getI18NString('team_anonymous', 'OpenResponseNode');
		var work_submitted_by = this.view.getI18NString('work_submitted_by', 'OpenResponseNode');
		
		//set more informative labels
		document.getElementById('promptLabelDiv').innerHTML = instructions;
		document.getElementById('responseLabelDiv').innerHTML = your_feedback_for + ' <i>' + team_anonymous + '</i>:';
		
		//display the original prompt
		document.getElementById('originalPromptTextDiv').innerHTML = this.associatedStartNode.getPeerReviewPrompt();
		$('#originalPromptDisplayDiv').show();
		
		//display the authored work for the student to review
		document.getElementById('associatedWorkLabelDiv').innerHTML = work_submitted_by + ' <i>' + team_anonymous + '</i>:' ;		
		document.getElementById('associatedWorkTextDiv').innerHTML = teacherWorkText;
		$('#associatedWorkDisplayDiv').show();
		
		//set the response if there were previous revisions
		this.setResponse();
	}
	
	/*
	 * perform any final tasks after we have finished retrieving
	 * any other work and have displayed it to the student
	 */
	this.doneRendering();
};

/**
 * Called after annotations are received so that we can then obtain
 * the teacher annotation and display it to the student
 * @param type
 * @param args
 * @param obj
 */
OPENRESPONSE.prototype.retrieveAnnotationsCompletedListener = function(type,args,obj) {
	if(args[0] == obj.node.id) {
		obj.displayTeacherReview();
	}
};

/**
 * This is for displaying the teacher annotation to the student so the student
 * can revise their work.
 */
OPENRESPONSE.prototype.displayTeacherReview = function() {
	//check if the original node and the annotate node is locked
	var isOriginalNodeLocked = this.view.isLatestNodeStateLocked(this.associatedStartNode.id);
	var isAnnotateNodeLocked = this.view.isLatestNodeStateLocked(this.associatedAnnotateNode.id);
	
	var startNodeTitle = "";
	if(this.associatedStartNode != null) {
		//get the step number and node title for the start node
		startNodeTitle = this.view.getProject().getStepNumberAndTitle(this.associatedStartNode.id);
	}
	
	var annotateNodeTitle = "";
	if(this.associatedAnnotateNode != null) {
		//get the step number and node title for the annotate node
		annotateNodeTitle = this.view.getProject().getStepNumberAndTitle(this.associatedAnnotateNode.id);
	}
	
	if(!isOriginalNodeLocked) {
		//the message that says they need to work on a previous step
		var to_start_this_step = this.view.getI18NString('to_start_this_step', 'OpenResponseNode');
		var link = this.view.getI18NString('link', 'OpenResponseNode');
		
		//student still needs to submit work for the original step before they can work on this step
		this.onlyDisplayMessage('<p>' + to_start_this_step + ' <b><a style=\"color:blue\" onclick=\"eventManager.fire(\'nodeLinkClicked\', [\'' + this.view.getProject().getPositionById(this.associatedStartNode.id) + '\']) \">' + startNodeTitle + '</a></b> (' + link + ').</p>');
	} else if(!isAnnotateNodeLocked){
		//the message that says they need to work on a previous step
		var to_start_this_step = this.view.getI18NString('to_start_this_step', 'OpenResponseNode');
		var link = this.view.getI18NString('link', 'OpenResponseNode');
		
		//student still needs to submit work for the annotate step before they can work on this step
		this.onlyDisplayMessage('<p>' + to_start_this_step + ' <a style=\"color:blue\" onclick=\"eventManager.fire(\'nodeLinkClicked\', [\'' + this.view.getProject().getPositionById(this.associatedAnnotateNode.id) + '\']) \">' + annotateNodeTitle + '</a></b> (' + link + ').</p>');
	} else {
		/*
		 * student has submitted work for original and annotate step
		 * so we can now try to get the teacher annotation for their work
		 */
		
		var latestCommentAnnotationForStep = '';
		
		if(this.view.getAnnotations() != null) {
			//get the latest comment annotation for the original step
			var latestCommentAnnotationForStep = this.view.getAnnotations().getLatestAnnotation(
					this.view.getConfig().getConfigParam('runId'),
					this.associatedStartNode.id,
					this.view.getUserAndClassInfo().getWorkgroupId(),
					this.view.getUserAndClassInfo().getAllTeacherWorkgroupIds(),
					'comment'
					);
			
			//check if there was an annotation
			if(latestCommentAnnotationForStep == null) {
				//the message that tells the student the teacher has not given them feedback yet
				var your_teacher_has_not_yet = this.view.getI18NString('your_teacher_has_not_yet', 'OpenResponseNode');
				var yet = this.view.getI18NString('yet', 'OpenResponseNode');
				var please_return_later = this.view.getI18NString('please_return_later', 'OpenResponseNode');
				
				/*
				 * teacher has not given an annotation to the student's work so
				 * they can't work on this step yet
				 */
				this.onlyDisplayMessage('<p>' + your_teacher_has_not_yet + ' <b>"' + startNodeTitle + '"</b> ' + yet + '</p><p>' + please_return_later + '</p>');
				
				/*
				 * perform any final tasks after we have finished retrieving
				 * any other work and have displayed it to the student
				 */
				this.doneRendering();
				
				return;
			} else {
				//teacher has written an annotation so this student can work on this step
				latestCommentAnnotationForStep = this.replaceSlashNWithBR(latestCommentAnnotationForStep.value);
			}
		}
		
		//get the latest node state for the original step
		var associatedOriginalLatestNodeState = this.view.getLatestStateForNode(this.associatedStartNode.id);
		
		//get the text written for the latest node state for the original step
		var latestWorkForassociatedStartNode = associatedOriginalLatestNodeState.response;
		
		//replace \n with <br>
		var latestWorkForassociatedStartNodeHtml = this.replaceSlashNWithBR(latestWorkForassociatedStartNode);
		
		//show regular divs such as prompt, starter, and response and populate them
		this.showDefaultDivs();
		this.showDefaultValues();
		
		//the instructions label
		var instructions = this.view.getI18NString('instructions', 'OpenResponseNode');
		
		//the label for the revision textarea
		var your_second_draft = this.view.getI18NString('your_second_draft', 'OpenResponseNode');
		
		//the label for the first revision
		var your_first_response = this.view.getI18NString('your_first_response', 'OpenResponseNode');
		
		//the text for the show/hide text button
		var show_hide_text = this.view.getI18NString('show_hide_text', 'OpenResponseNode');
		
		//set more informative labels
		document.getElementById('promptLabelDiv').innerHTML = instructions;
		document.getElementById('responseLabelDiv').innerHTML = your_second_draft + ':';
		
		//set the original prompt text and make it visible
		document.getElementById('originalPromptTextDiv').innerHTML = this.associatedStartNodeContent.assessmentItem.interaction.prompt;
		$('#originalPromptDisplayDiv').show();
		
		//set the original work text and make it visible
		document.getElementById('associatedWorkLabelDiv').innerHTML = your_first_response + '&nbsp;&nbsp;<a id="toggleSwitch" onclick="toggleDetails2()">' + show_hide_text;
		document.getElementById('associatedWorkTextDiv').innerHTML = latestWorkForassociatedStartNodeHtml;
		$('#associatedWorkDisplayDiv').show();
		
		//hide the original work
		$('#associatedWorkTextDiv').hide();
		
		//display the div that says "text is hidden"
		$('#associatedWorkTextDiv2').show();
		
		//the label for the teacher feedback
		var teacher_feedback = this.view.getI18NString('teacher_feedback', 'OpenResponseNode');
		
		//set the teacher annotation text and make it visible
		document.getElementById('annotationLabelDiv').innerHTML = teacher_feedback;
		document.getElementById('annotationTextDiv').innerHTML = latestCommentAnnotationForStep;
		$('#annotationDisplayDiv').show();
		
		/* set value of text area base on previous work, if any */
		if (this.states!=null && this.states.length > 0) {
			//set their previous revision to when they last worked on this step
			document.getElementById('responseBox').value = this.states[this.states.length - 1].response;
			this.setSaveUnavailable();
			
			var numberAttemptsMessage = this.view.getI18NStringWithParams("this_is_revision_x",[this.states.length+1],"OpenResponseNode");
			$("#numberAttemptsDiv").html(numberAttemptsMessage);

			//tell the node that the student has completed it
			this.node.setCompleted();
		} else {
			//the message that says this is your first revision
			var numberAttemptsMessage = this.view.getI18NStringWithParams("this_is_revision_x",[1],"OpenResponseNode");
			$("#numberAttemptsDiv").html(numberAttemptsMessage);
			
			if(latestWorkForassociatedStartNode != null && latestWorkForassociatedStartNode != '') {
				//set the latest work from the original step in the responseBox so the student can revise it
				document.getElementById('responseBox').value = latestWorkForassociatedStartNode;
			}
		};
	}
	
	/*
	 * perform any final tasks after we have finished retrieving
	 * any other work and have displayed it to the student
	 */
	this.doneRendering();
};

/**
 * Retrieves annotations if necessary and then displays the teacher review
 * to the student for them to revise their work.
 */
OPENRESPONSE.prototype.retrieveTeacherReview = function() {
	if(this.view.getAnnotations() == null) {
		/*
		 * retrieve the annotations. this OPENRESPONSE is subscribed to listen
		 * for retrieveAnnotationsCompleted and when that event is fired it will
		 * call retrieveAnnotationsCompletedListener() which calls displayTeacherReview()
		 */
		this.view.retrieveAnnotations(this.node.id);
	} else {
		//display the teacher review to the student
		this.displayTeacherReview();
	}
};

/**
 * Make the request to retrieve the other student work
 */
OPENRESPONSE.prototype.retrieveOtherStudentWork = function() {
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
	var classmateWorkgroupIds = this.view.getUserAndClassInfo().getClassmateIdsByPeriodId(periodId).split(':').toString();
	
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
OPENRESPONSE.prototype.retrieveOtherStudentWorkCallback = function(text, xml, args) {
	//get the or object
	var thisOr = args[0];
	
	//clear this variable to make sure we don't use old data
	thisOr.otherStudentNodeVisit = null;
	
	//check if there was any text response
	if(text != null && text != "") {
		//there was text returned so we will parse it, the text should be a NodeVisit in JSON form
		var peerWorkToReview = $.parseJSON(text);
		
		var peerWorkText = "";
		
		var startNodeTitle = "";
		if(thisOr.associatedStartNode != null) {
			//get the step number and node title for the start node
			startNodeTitle = thisOr.view.getProject().getStepNumberAndTitle(thisOr.associatedStartNode.id);
		}
		
		//handle error cases
		if(peerWorkToReview.error) {
			if(peerWorkToReview.error == 'peerReviewUserHasNotSubmittedOwnWork') {
				//the message that says they must submit work from a previous step
				var to_start_this_step = thisOr.view.getI18NString('to_start_this_step', 'OpenResponseNode');
				var link = thisOr.view.getI18NString('link', 'OpenResponseNode');
				
				//the user has not submitted work for the original step
				thisOr.onlyDisplayMessage('<p>' + to_start_this_step + ' <b><a style=\"color:blue\" onclick=\"eventManager.fire(\'nodeLinkClicked\', [\'' + thisOr.view.getProject().getPositionById(thisOr.associatedStartNode.id) + '\']) \">' + startNodeTitle + '</a></b> (' + link + ').</p>');
			} else if(peerWorkToReview.error == 'peerReviewNotAbleToAssignWork' || peerWorkToReview.error == 'peerReviewNotOpen') {
				/*
				 * server was unable to assign student any work to review, most likely because there was no available work to assign
				 * or
				 * the peer review has not opened yet
				 */
				
				if(thisOr.stepNotOpenCustomMessage != null && thisOr.stepNotOpenCustomMessage != "") {
					//use the custom authored message
					thisOr.onlyDisplayMessage(thisOr.stepNotOpenCustomMessage.replace(/associatedStartNode.title/g, startNodeTitle));
				} else {
					//the message that says this step is not available yet and they should come back later
					var this_step_not_available_yet = thisOr.view.getI18NString('this_step_not_available_yet', 'OpenResponseNode');
					var more_of_your_peers_need_to_submit = thisOr.view.getI18NString('more_of_your_peers_need_to_submit', 'OpenResponseNode');
					var you_will_then_be_assigned = thisOr.view.getI18NString('you_will_then_be_assigned', 'OpenResponseNode');
					var please_return_in_a_few_minutes = thisOr.view.getI18NString('please_return_in_a_few_minutes', 'OpenResponseNode');
					
					//use the default message
					thisOr.onlyDisplayMessage('<p>' + this_step_not_available_yet + '</p></p><p>' + more_of_your_peers_need_to_submit + ' <b>"' + startNodeTitle + '"</b>. <br/>' + you_will_then_be_assigned + '</p><p>' + please_return_in_a_few_minutes + '</p>');	
				}
			}
			
			//check if we should show the authored work
			if(peerWorkToReview.error == 'peerReviewShowAuthoredWork') {
				//show the authored work for the student to review
				peerWorkText = thisOr.content.authoredWork;
				thisOr.showAuthorContent = true;
			} else {
				return;
			}
		} else {
			//set the variables for the other student
			thisOr.otherStudentWorkgroupId = peerWorkToReview.workgroupId;
			thisOr.otherStudentStepWorkId = peerWorkToReview.stepWorkId;
			thisOr.otherStudentNodeVisit = peerWorkToReview.nodeVisit;
			
			peerWorkText = thisOr.associatedStartNode.getPeerReviewOtherStudentWork(thisOr.otherStudentNodeVisit);
		}
		
		//reaplce \n with <br>
		peerWorkText = thisOr.replaceSlashNWithBR(peerWorkText);
		
		//show regular divs such as prompt, starter, and response and populate them
		thisOr.showDefaultDivs();
		thisOr.showDefaultValues();
		
		//the instructions label
		var instructions = thisOr.view.getI18NString('instructions', 'OpenResponseNode');
		
		//the label for the feedback textarea the student needs to fill out to give feedback to another classmate
		var your_feedback_for = thisOr.view.getI18NString('your_feedback_for', 'OpenResponseNode');
		var team_anonymous = thisOr.view.getI18NString('team_anonymous', 'OpenResponseNode');
		var work_submitted_by = thisOr.view.getI18NString('work_submitted_by', 'OpenResponseNode');
		
		//set more informative labels
		document.getElementById('promptLabelDiv').innerHTML = instructions;
		document.getElementById('responseLabelDiv').innerHTML = your_feedback_for + ' <i>' + team_anonymous + '</i>:';
		
		//display the prompt
		document.getElementById('originalPromptTextDiv').innerHTML = thisOr.associatedStartNode.getPeerReviewPrompt();
		$('#originalPromptDisplayDiv').show();
		
		/*
		 * display the other student's work or a message saying there is no other student work
		 * available yet
		 */
		document.getElementById('associatedWorkLabelDiv').innerHTML = work_submitted_by + ' <i>' + team_anonymous + '</i>:';		
		document.getElementById('associatedWorkTextDiv').innerHTML = peerWorkText;
		$('#associatedWorkDisplayDiv').show();
		
		//set the response if there were previous revisions 
		thisOr.setResponse();
	}
	
	/*
	 * perform any final tasks after we have finished retrieving
	 * any other work and have displayed it to the student
	 */
	thisOr.doneRendering();
};

/**
 * Retrieve the annotation and work for the peer review revise step.
 */
OPENRESPONSE.prototype.retrieveAnnotationAndWork = function() {
	//get the url
	var getPeerReviewUrl = this.view.getConfig().getConfigParam('getPeerReviewUrl');
	
	//get the parameters
	var action = "studentRequest";
	var runId = this.view.getConfig().getConfigParam('runId');
	var workgroupId = this.view.getUserAndClassInfo().getWorkgroupId();
	var periodId = this.view.getUserAndClassInfo().getPeriodId();
	var nodeId = this.associatedStartNodeId;
	var peerReviewAction = "revise";
	var classmateWorkgroupIds = this.view.getUserAndClassInfo().getWorkgroupIdsInClass().toString();
	
	//compile the parameters into an object for cleanliness
	var getPeerReviewUrlArgs = {
			action:action,
			runId:runId,
			workgroupId:workgroupId,
			periodId:periodId,
			nodeId:nodeId,
			peerReviewAction:peerReviewAction,
			classmateWorkgroupIds:classmateWorkgroupIds
	};
	
	//make the request
	this.view.connectionManager.request('GET', 1, getPeerReviewUrl, getPeerReviewUrlArgs, this.retrieveAnnotationAndWorkCallback, [this]);
};

/**
 * Parses the annotation and work and display it.
 * @param text
 * @param xml
 * @param args
 */
OPENRESPONSE.prototype.retrieveAnnotationAndWorkCallback = function(text, xml, args) {
	//get the or object
	var thisOr = args[0];
	
	if(text != null && text != "") {
		//parse the JSON object that contains the annotation and work
		var annotationAndWork = $.parseJSON(text);
		
		var annotationText = "";
		
		var startNodeTitle = "";
		if(thisOr.associatedStartNode != null) {
			//get the step number and node title for the start node
			startNodeTitle = thisOr.view.getProject().getStepNumberAndTitle(thisOr.associatedStartNode.id);
		}
		
		var annotateNodeTitle = "";
		if(thisOr.associatedAnnotateNode != null) {
			//get the step number and node title for the annotate node
			annotateNodeTitle = thisOr.view.getProject().getStepNumberAndTitle(thisOr.associatedAnnotateNode.id);
		}
		
		//handle error cases
		if(annotationAndWork.error) {
			if(annotationAndWork.error == 'peerReviewUserHasNotSubmittedOwnWork') {
				//the message that says they need to submit work on a previous step to work on this step
				var to_start_this_step = thisOr.view.getI18NString('to_start_this_step', 'OpenResponseNode');
				var link = thisOr.view.getI18NString('link', 'OpenResponseNode');
				
				//the user has not submitted work for the original step
				thisOr.onlyDisplayMessage('<p>' + to_start_this_step + ' <b><a style=\"color:blue\" onclick=\"eventManager.fire(\'nodeLinkClicked\', [\'' + thisOr.view.getProject().getPositionById(thisOr.associatedStartNode.id) + '\']) \">' + startNodeTitle + '</a></b> (' + link + ').</p>');
			} else if(annotationAndWork.error == 'peerReviewUserHasNotBeenAssignedToClassmateWork') {
				//the message that says this step isn't available yet and that they should come back later
				var this_step_not_available_yet = thisOr.view.getI18NString('this_step_not_available_yet', 'OpenResponseNode');
				var more_of_your_peers_need_to_submit = thisOr.view.getI18NString('more_of_your_peers_need_to_submit', 'OpenResponseNode');
				var you_will_then_be_assigned = thisOr.view.getI18NString('you_will_then_be_assigned', 'OpenResponseNode');
				var please_return_to_step = thisOr.view.getI18NString('please_return_to_step', 'OpenResponseNode');
				var in_a_few_minutes = thisOr.view.getI18NString('in_a_few_minutes', 'OpenResponseNode');
				
				//user has not been assigned to any classmate work yet, most likely because there is no available work to assign
				thisOr.onlyDisplayMessage('<p>' + this_step_not_available_yet + '</p></p><p>' + more_of_your_peers_need_to_submit + ' <b>"' + startNodeTitle + '"</b>. <br/>' + you_will_then_be_assigned + '</p><p>' + please_return_to_step + ' "' + annotateNodeTitle + '" ' + in_a_few_minutes + '</p>');
			} else if(annotationAndWork.error == 'peerReviewUserHasNotAnnotatedClassmateWork') {
				//the message that says they need to submit work on a previous step to work on this step
				var to_start_this_step = thisOr.view.getI18NString('to_start_this_step', 'OpenResponseNode');
				var link = thisOr.view.getI18NString('link', 'OpenResponseNode');
				
				//the user has not reviewed the assigned classmate work yet
				thisOr.onlyDisplayMessage('<p>' + to_start_this_step + ' <a style=\"color:blue\" onclick=\"eventManager.fire(\'nodeLinkClicked\', [\'' + thisOr.view.getProject().getPositionById(thisOr.associatedAnnotateNode.id) + '\']) \">' + annotateNodeTitle + '</a></b> (' + link + ').</p>');
			} else if(annotationAndWork.error == 'peerReviewUserWorkHasNotBeenAssignedToClassmate' || annotationAndWork.error == 'peerReviewUserWorkHasNotBeenAnnotatedByClassmate') {
				/*
				 * the user's work has not been assigned to a classmate yet
				 * or
				 * the user's classmate has not reviewed the user's work yet
				 */
				
				if(thisOr.stepNotOpenCustomMessage != null && thisOr.stepNotOpenCustomMessage != "") {
					//use the custom authored message
					thisOr.onlyDisplayMessage(thisOr.stepNotOpenCustomMessage.replace(/associatedStartNode.title/g, startNodeTitle).replace(/associatedAnnotateNode.title/g, annotateNodeTitle));
				} else {
					//the message that says this step isn't available yet and that they should come back later
					var this_step_not_available_yet = thisOr.view.getI18NString('this_step_not_available_yet', 'OpenResponseNode');
					var your_response_in_step = thisOr.view.getI18NString('your_response_in_step', 'OpenResponseNode');
					var has_not_been_reviewed = thisOr.view.getI18NString('has_not_been_reviewed', 'OpenResponseNode');
					var more_of_your_peers_need_to_submit = thisOr.view.getI18NString('more_of_your_peers_need_to_submit', 'OpenResponseNode');
					var please_return_in_a_few_minutes = thisOr.view.getI18NString('please_return_in_a_few_minutes', 'OpenResponseNode');
					
					//use the default message
					thisOr.onlyDisplayMessage('<p>' + this_step_not_available_yet + '</p><p>' + your_response_in_step + ' <b>"' + startNodeTitle + '"</b> ' + has_not_been_reviewed + '</p><p>' + more_of_your_peers_need_to_submit + ' <b>"' + annotateNodeTitle + '"</b>.</p><p>' + please_return_in_a_few_minutes + '</p>');
				}
			}
			
			//check if we should show the authored review
			if(annotationAndWork.error == 'peerReviewShowAuthoredReview') {
				//check if the student has performed the review of the author work
				
				//obtain the work for the associated annotate node
				var associatedAnnotateNodeWork = thisOr.view.getStudentWorkForNodeId(thisOr.associatedAnnotateNode.id);

				/*
				 * if the latest work for the reviewing step is locked, it means the student
				 * has submitted the review for the author and they can go on to this
				 * step where they receive the author review and revise their own work
				 */
				if(thisOr.view.isLatestNodeStateLocked(thisOr.associatedAnnotateNode.id)) {
					//show the authored review
					annotationText = thisOr.content.authoredReview;
				} else {
					//the message that says they need to submit work on a previous step to work on this step
					var to_start_this_step = thisOr.view.getI18NString('to_start_this_step', 'OpenResponseNode');
					
					//the user has not reviewed the authored work yet
					thisOr.onlyDisplayMessage('<p>' + to_start_this_step + ' <a style=\"color:blue\" onclick=\"eventManager.fire(\'nodeLinkClicked\', [\'' + thisOr.view.getProject().getPositionById(thisOr.associatedAnnotateNode.id) + '\']) \">' + annotateNodeTitle + '</a>.</p>');
					return;
				}
			} else {
				return;
			}
		} else {
			//there was no error so we will get the annotation
			var annotation = annotationAndWork.annotation;
			annotationText = annotation.value;
		}
		
		//replace \n with <br>
		annotationText = thisOr.replaceSlashNWithBR(annotationText);
		
		//get the node visit
		var nodeVisit = NODE_VISIT.prototype.parseDataJSONObj(annotationAndWork.nodeVisit, thisOr.view);
		
		//get the latest state from the node visit
		var latestWork = nodeVisit.getLatestWork();
		var latestWorkText = "";
		var latestWorkHtml = "";
		
		if(latestWork != null) {
			//get the response string the student wrote
			latestWorkText = thisOr.node.getStudentWorkString(latestWork.response);
			
			//replace \n with <br>
			latestWorkHtml = thisOr.replaceSlashNWithBR(latestWorkText);			
		}
		
		//show regular divs such as prompt, starter, and response and populate them
		thisOr.showDefaultDivs();
		thisOr.showDefaultValues();
		
		//the instructions label
		var instructions = thisOr.view.getI18NString('instructions', 'OpenResponseNode');
		
		//the label for the revision textarea
		var your_second_draft = thisOr.view.getI18NString('your_second_draft', 'OpenResponseNode');
		
		//set more informative labels
		document.getElementById('promptLabelDiv').innerHTML = instructions;
		document.getElementById('responseLabelDiv').innerHTML = your_second_draft + ':';
		
		//set the original prompt text and make it visible
		document.getElementById('originalPromptTextDiv').innerHTML = thisOr.associatedStartNodeContent.assessmentItem.interaction.prompt;
		$('#originalPromptDisplayDiv').show();
		
		//the label for the original response
		var your_original_response = thisOr.view.getI18NString('your_original_response', 'OpenResponseNode');
		var show_hide_text = thisOr.view.getI18NString('show_hide_text', 'OpenResponseNode');
		
		//set the original work text and make it visible
		document.getElementById('associatedWorkLabelDiv').innerHTML = your_original_response + '&nbsp;&nbsp;&nbsp;<a id="toggleSwitch" onclick="toggleDetails2()">' + show_hide_text;
		document.getElementById('associatedWorkTextDiv').innerHTML = latestWorkHtml;
		$('#associatedWorkDisplayDiv').show();
		
		//hide the original work
		$('#associatedWorkTextDiv').hide();
		
		//display the div that says "text is hidden"
		$('#associatedWorkTextDiv2').show();
		
		//the label for the feedback another classmate has given them
		var team_anonymous = thisOr.view.getI18NString('team_anonymous', 'OpenResponseNode');
		var has_given_you_the_following_feedback = thisOr.view.getI18NString('has_given_you_the_following_feedback', 'OpenResponseNode');
		
		//set the annotation text and make it visible
		document.getElementById('annotationLabelDiv').innerHTML = '<i>' + team_anonymous + '</i> ' + has_given_you_the_following_feedback + ':';
		document.getElementById('annotationTextDiv').innerHTML = annotationText;
		$('#annotationDisplayDiv').show();
		
		/* set value of text area base on previous work, if any */
		if (thisOr.states!=null && thisOr.states.length > 0) {
			//the message that says this is your x revision
			document.getElementById('responseBox').value = thisOr.states[thisOr.states.length - 1].response;
			thisOr.setSaveUnavailable();
			var numberAttemptsMessage = this.view.getI18NStringWithParams("this_is_revision_x",[thisOr.states.length+1],"OpenResponseNode");
			$("#numberAttemptsDiv").html(numberAttemptsMessage);

			//tell the node that the student has completed it
			thisOr.node.setCompleted();
		} else {
			//the message that says this is your first revision
			var numberAttemptsMessage = this.view.getI18NStringWithParams("this_is_revision_x",[1],"OpenResponseNode");
			$("#numberAttemptsDiv").html(numberAttemptsMessage);

			if(latestWork != null && latestWorkText != null) {
				if(thisOr.richTextEditor != null) {
					thisOr.richTextEditor.setContent(latestWorkText);
				} else {
					//set the latest work in the responseBox
					document.getElementById('responseBox').value = latestWorkText;	
				}
			}
		}
	}
	
	/*
	 * perform any final tasks after we have finished retrieving
	 * any other work and have displayed it to the student
	 */
	thisOr.doneRendering();
};

/**
 * Places the starter sentence, if provided, at the top of the
 * response and appends any of the student's work after it.
 */
OPENRESPONSE.prototype.showStarter = function(){
	if(this.content.starterSentence.display != '0'){

		//get the response box element
		var responseBox = document.getElementById('responseBox');
		
		//update normally if rich text editor is not available
		if(!this.richTextEditor){
			//set the starter sentence appending the students work
			responseBox.value = this.content.starterSentence.sentence + '\n\n' + responseBox.value;
		} else {//otherwise, we need to set it in the editor instance
			this.richTextEditor.setContent(this.content.starterSentence.sentence + '<br/><br/>' + this.richTextEditor.getContent());
		};
	} else {
		//the message that says there is no starter sentence
		var there_is_no_starter_sentence = this.view.getI18NString('there_is_no_starter_sentence', 'OpenResponseNode');
		
		this.node.view.notificationManager.notify(there_is_no_starter_sentence, 3);
	};
};

/**
 * Get the prompt for displaying in a PeerReviewNode
 * @return the prompt for this open response content
 */
OPENRESPONSE.prototype.getPeerReviewPrompt = function() {
	var peerReviewPrompt = "";
	if(this.content != null && this.content.assessmentItem != null) {
		peerReviewPrompt += this.content.assessmentItem.interaction.prompt;	
	}
	return peerReviewPrompt;
};

/**
 * Get the latest student work from the passed in JSON NodeVisit
 * @param otherStudentWorkJSONObj a JSON NodeVisit object
 * @return the latest student work from the passed in JSON NodeVisit
 */
OPENRESPONSE.prototype.getPeerReviewOtherStudentWork = function(otherStudentWorkJSONObj) {
	var peerReviewOtherStudentWork = "";
	
	if(otherStudentWorkJSONObj != null) {
		//get the nodeStates from the NodeVisit
		var nodeStates = otherStudentWorkJSONObj.nodeStates;
		if(nodeStates.length > 0) {
			//get the latest state
			var nodeState = nodeStates[nodeStates.length - 1];
			
			//get the response from the state
			var response = nodeState.response;
			
			peerReviewOtherStudentWork += response;
		}
	} else {
		//the message that says there is no classmate work yet so they should return later
		var responses_from_peers_not_available = this.view.getI18NString('responses_from_peers_not_available', 'OpenResponseNode');
		var please_return_later = this.view.getI18NString('please_return_later', 'OpenResponseNode');
		
		//display this message if there was no other student work
		peerReviewOtherStudentWork += "<p>" + responses_from_peers_not_available + "</p><p>" + please_return_later + "</p>";
	}
	
	return peerReviewOtherStudentWork;
};

/**
 * Disables the response box
 */
OPENRESPONSE.prototype.lockResponseBox = function() {
	document.getElementById('responseBox').disabled = true;

	//check if this step uses the tinymce editor
	if(typeof tinymce != 'undefined' && tinymce != null && tinymce.activeEditor != null && tinymce.activeEditor.getBody() != null) {
		//make the tinymce editor uneditable
		tinymce.activeEditor.getBody().setAttribute('contenteditable', false);		
	}
};

/**
 * Enables the response box
 */
OPENRESPONSE.prototype.unlockResponseBox = function() {
	document.getElementById('responseBox').disabled = false;	
};

/**
 * Make the default divs visible, these include prompt, starter,
 * response, button, divs
 */
OPENRESPONSE.prototype.showDefaultDivs = function() {
	$('#promptDisplayDiv').show();
	$('#starterParent').show();
	$('#responseDisplayDiv').show();
	$('#buttonDiv').show();
};

/**
 * Set the prompt, starter, and response values
 */
OPENRESPONSE.prototype.showDefaultValues = function() {
	if(this.content.starterSentence.display=='1' || this.content.starterSentence.display=='2'){
		$('#starterParent').show();
	} else {
		$('#starterParent').hide();
	};
	
	/* set html prompt element values */
	document.getElementById('orPromptDiv').innerHTML=this.content.assessmentItem.interaction.prompt;
	document.getElementById('promptLabelDiv').innerHTML = 'question';
	
	/* set text area size: set row based on expectedLines */
	document.getElementById('responseBox').setAttribute('rows', this.content.assessmentItem.interaction.expectedLines);
};

/**
 * Appends response to curently-displayed response
 * @param response String response that will be appended at the end of current response
 * @return
 */
OPENRESPONSE.prototype.appendResponse = function(response) {
	if (!this.content.isRichTextEditorAllowed) {
		document.getElementById('responseBox').value += response;
	} else {		
		var contentBefore = this.richTextEditor.getContent();
		var contentAfter = contentBefore + response;
		this.richTextEditor.setContent(contentAfter);
	};
};

/**
 * Set the reponse into the response box
 */
OPENRESPONSE.prototype.setResponse = function() {
	/* set value of text area base on previous work, if any */
	if (this.states!=null && this.states.length > 0) {
		//the message that says this is your x revision
		document.getElementById('responseBox').value = this.states[this.states.length - 1].response;
		this.setSaveUnavailable();
		
		var numberAttemptsMessage = this.view.getI18NStringWithParams("this_is_revision_x",[this.states.length+1],"OpenResponseNode");
		$("#numberAttemptsDiv").html(numberAttemptsMessage);

	} else {
		//the message that says this is your first revision
		var numberAttemptsMessage = this.view.getI18NStringWithParams("this_is_revision_x",[1],"OpenResponseNode");
		$("#numberAttemptsDiv").html(numberAttemptsMessage);

		document.getElementById('responseBox').value = "";
	 	this.setSaveAvailable();
	 	
		/* set starter sentence html element values */
		if(this.content.starterSentence.display=='2'){
			this.showStarter();
		};
	};
};

/**
 * Replace \n with <br> so that the new lines are displayed to the
 * students
 * @param response an array containing the response string or just
 * the response string
 * @return the response string with all \n replaced with <br>
 */
OPENRESPONSE.prototype.replaceSlashNWithBR = function(response) {
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

/*
 * Perform any final tasks after we are done retrieving and rendering
 * any necessary data to the student.
 */
OPENRESPONSE.prototype.doneRendering = function() {

	//create any constraints if necessary
	eventManager.fire('contentRenderCompleted', this.node.id, this.node);
};

/**
 * Determine if the student has used up all their CRater check answer submits
 * @return whether the student has used up all their CRater check answer submits
 */
OPENRESPONSE.prototype.isCRaterMaxCheckAnswersUsedUp = function() {
	var result = false;

	//check if this step is a CRater step and if maxCheckAnswers is set
	if(this.content.cRater != null && this.content.cRater.maxCheckAnswers != null) {
		var maxCheckAnswers = this.content.cRater.maxCheckAnswers;
		
		if(!isNaN(parseInt(maxCheckAnswers))) {
			//maxCheckAnswers is a number
			
			//get the number of times the student made a CRater submit aka check answer
			var numCheckAnswers = this.getNumberOfCRaterSubmits();
			
			if(numCheckAnswers >= maxCheckAnswers) {
				//student has checked answer more than or equal to the max allowed
				result = true;
			}			
		}
	}
	
	return result;
};

OPENRESPONSE.prototype.getNumberOfCRaterSubmits = function() {
	var numCRaterSubmits = 0;
	
	//loop through all the node states for this step
	for(var x=0; x<this.states.length; x++) {
		//get a node state
		var nodeState = this.states[x];
		
		if(nodeState != null) {
			if(nodeState.isCRaterSubmit) {
				//the node state was a CRater submit
				numCRaterSubmits++;
			}
		}
	}
	
	return numCRaterSubmits;
};

/**
 * Process the tag maps and obtain the results
 * @return an object containing the results from processing the
 * tag maps. the object contains three fields
 * enableStep
 * message
 * workToImport
 */
OPENRESPONSE.prototype.processTagMaps = function() {
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
				} else if(functionName == "showAggregateWork") {
					//show the previous work in the previousWorkDiv
					this.node.showAggregateWork($('#aggregateWorkDiv'), tagName, functionArgs);
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
	
	//put the variables in an object so we can return multiple variables
	var returnObject = {
		enableStep:enableStep,
		message:message,
		workToImport:workToImport
	};
	
	return returnObject;
};

/**
 * Import work if necessary
 * @param workToImport an array of node states to import into this step
 */
OPENRESPONSE.prototype.importWork = function(workToImport) {
	if(workToImport != null && workToImport != "" && workToImport.length != 0) {
		var currentResponse = $('#responseBox').val();
		
		//check if the response box is empty
		if(currentResponse == '') {
			//the response box is empty so we will import the previous work
			var response = '';
			
			for(var x=0; x<workToImport.length; x++) {
				//get one of the work
				var nodeState = workToImport[x];
				
				if(nodeState != null) {
					var type = nodeState.constructor.name;
					if(type == 'OPENRESPONSESTATE') {
						if(response != '') {
							//separate work with a blank line
							response += '\n\n';
						}
						
						//append the response
						response += nodeState.response;
					} else if(type == 'ExplanationBuilderState') {
						//the work is from an explanation builder step
						
						//get the text answer the student submitted in the explanation builder step
						var answer = nodeState.answer;
						
						if(answer != null && answer != '') {
							if(response != '') {
								//separate work with a blank line
								response += '\n\n';
							}
							
							//append the answer
							response += answer;							
						}
					}
				}
			}
			
			//set the imported work into the response box
			$('#responseBox').val(response);
		}
	}
};

/**
 * Get the latest annotation with the given annotation type
 * 
 * @param annotationType the annotation type
 * 
 * @return the latest annotation with the given annotation type or null
 */
OPENRESPONSE.prototype.getLatestAnnotationByType = function(annotationType) {
	//get the annotation attributes that we will use to look up the teacher comment annotation
	var runId = this.view.getConfig().getConfigParam('runId');
	var nodeId = this.view.currentNode.id;
	var toWorkgroup = this.view.getUserAndClassInfo().getWorkgroupId();
	var fromWorkgroups = null;
	var type = null;
	var stepWorkId = null;
	
	if(annotationType != null) {
		//use the annotation type that was passed in
		type = annotationType;
	}
	
	if(annotationType == 'cRater') {
		//crater annotations have fromWorkgroup=-1
		fromWorkgroups = [-1];
	} else {
		//get the teacher and shared teacher workgroups
		fromWorkgroups = this.view.getUserAndClassInfo().getAllTeacherWorkgroupIds();
	}
	
	//get the latest annotation for this step with the given parameters
	var latestAnnotation = this.view.getAnnotations().getLatestAnnotation(runId, nodeId, toWorkgroup, fromWorkgroups, type, stepWorkId);
	
	return latestAnnotation;
}

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/openresponse/openresponse.js');
}