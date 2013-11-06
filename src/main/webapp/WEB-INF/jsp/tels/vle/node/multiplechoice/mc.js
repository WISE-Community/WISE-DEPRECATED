
/**
 * @constructor
 * @param node
 * @param view
 * @returns
 */
function MC(node, view) {
	this.node = node;
	this.view = node.view;
	this.content = node.getContent().getContentJSON();
	this.choices = [];
	this.attempts = [];
	this.stages = [];
	
	if(node.studentWork != null) {
		this.states = node.studentWork;
		
		this.attempts = this.states.slice();
	} else {
		this.states = [];  
	}
	
	/* add each choice object from the content to the choices array */
	for(var a=0;a<this.content.assessmentItem.interaction.choices.length;a++){
		this.choices.push(this.content.assessmentItem.interaction.choices[a]);
	}
	
	//boolean to prevent shuffling after each answer submit
	this.previouslyRendered = false;
};

/**
 * Load the state for this MC given the node and view but do
 * not call render
 * @param node
 * @param view
 */
MC.prototype.loadForTicker = function(node, view) {
	this.view = view;
	this.node = node;
	this.loadState();
};

/**
 * Loads state from the view
 */
MC.prototype.loadState = function() {
	for (var i=0; i < this.view.getVLEState().visitedNodes.length; i++) {
		var nodeVisit = this.view.getVLEState().visitedNodes[i];
		if (nodeVisit.getNodeId() == this.node.id) {
			for (var j=0; j<nodeVisit.nodeStates.length; j++) {
				this.states.push(nodeVisit.nodeStates[j]);
			};
		};
	};
};

/**
 * Get the latest state
 * @returns the latest state
 */
MC.prototype.getLatestState = function(){
	var latestState = null;
	
	if(this.states && this.states.length>0){
		latestState = this.states[this.states.length -1];
	};

	return latestState;
};

/**
 * Get the student's latest submission for this node that has work. 
 * The node is specific to a student.
 * @param nodeId the id of the node we want the student's work from
 * @return the newest NODE_STATE for this node
 */
MC.prototype.getLatestStateFromNodeId = function(nodeId) {
	var nodeVisits = this.view.getVLEState().getNodeVisitsByNodeId(nodeId);
	
	/*
	 * loop through all the nodeVisits and find the latest nodeVisit
	 * that has content in the nodeStates
	 */
	for(var x=0; x<nodeVisits.length; x++) {
		//loop through the nodeVisits starting from the end
		var nodeVisit = nodeVisits[nodeVisits.length - (x + 1)];
		if(nodeVisit != null) {
			//an array of nodeStates
			var nodeStates = nodeVisit.nodeStates;
			
			//check if there is anything in the nodeStates
			if(nodeStates != null && nodeStates.length > 0) {
				//get the latest nodeState
				var nodeState = nodeStates[nodeStates.length - 1];
				return nodeState;
			};
		};
	};
	return null;
};

//gets and returns a choice object given the choice's identifier
MC.prototype.getChoiceByIdentifier = function(identifier) {
	for (var i=0;i<this.choices.length;i++) {
		if (this.removeSpace(this.choices[i].identifier) == identifier) {
			return this.choices[i];
		};
	};
	return null;
};

/**
 * Render the MC
 */
MC.prototype.render = function() {
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
	
	//the label for the step type
	var multiple_choice = this.view.getI18NString('multiple_choice', 'MultipleChoiceNode');
	var challenge_question = this.view.getI18NString('challenge_question', 'MultipleChoiceNode');
	
	/* set the question type title */
	$('#questionType').html((this.node.getType()=='ChallengeNode') ? challenge_question : multiple_choice);
	
	//get the latest state
	var latestState = this.getLatestState();
	
	if(latestState == null && workToImport != null && workToImport.length > 0) {
		/*
		 * there was no previous node state but there is work to
		 * import so we will import the work
		 */
		latestState = workToImport[workToImport.length - 1];
	}
	
	if(latestState != null && latestState.isCorrect) {
		//the student previously answered the question correctly
		
		if(this.content.hideQuestionAndAnswersAfterAnsweredCorrectly) {
			//we do not want to show the question or the answers
			
			//hide the labels
			$('#questionLabelDiv').hide();
			$('#answersLabelDiv').hide();
			
			//the message that says they have completed the step
			var you_have_completed_this_step = this.view.getI18NString('you_have_completed_this_step', 'MultipleChoiceNode');
			
			//display the message to the student
			$('#promptDiv').html(you_have_completed_this_step);
			
			//we are done rendering the step
			this.node.view.eventManager.fire('contentRenderCompleted', this.node.id, this.node);
			return;
		}
	}
	
	/* render the prompt */
	$('#promptDiv').html(this.content.assessmentItem.interaction.prompt);

	/* remove buttons */
	var radiobuttondiv = document.getElementById('radiobuttondiv');
	while(radiobuttondiv.hasChildNodes()) {
		radiobuttondiv.removeChild(radiobuttondiv.firstChild);
	}
	
	/* 
	 * if shuffle is enabled, shuffle the choices when they enter the step
	 * but not each time after they submit an answer
	 */
	if(this.content.assessmentItem.interaction.shuffle && !this.previouslyRendered){
		this.choices.shuffle();
	}
	
	/* set variable whether this multiplechoice should be rendered with radio buttons or checkboxes */
	if(this.content.assessmentItem.interaction.maxChoices==1){
		var type = 'radio';
	} else {
		var type = 'checkbox';
	}
	
	/* render the choices */
	for(var i=0;i<this.choices.length;i++) {
		var choiceHTML = '<table><tbody><tr><td><input type="' + type + '" name="radiobutton" id="' + this.removeSpace(this.choices[i].identifier) + 
			'" value="' + this.removeSpace(this.choices[i].identifier) + '" class="' + type + '"/></td><td><div id="choicetext:' + this.removeSpace(this.choices[i].identifier) + 
			'">' + this.choices[i].text + '</div></td><td><div id="feedback_' + this.removeSpace(this.choices[i].identifier) + '" name="feedbacks"></div></td></tr></tbody></table>';
		
		$('#radiobuttondiv').append(choiceHTML);
		$('#' + this.removeSpace(this.choices[i].identifier)).click(function(){enableCheckAnswerButton('true');});
		
		if(this.selectedInSavedState(this.choices[i].identifier)){
			$('#' + this.removeSpace(this.choices[i].identifier)).attr('checked', true);
		}
	}
		
	//addClassToElement("checkAnswerButton", "disabledLink");
	$('#checkAnswerButton').parent().addClass('ui-state-disabled');
	//addClassToElement("tryAgainButton", "disabledLink");
	$('#tryAgainButton').parent().addClass('ui-state-disabled');
	clearFeedbackDiv();
	
	if (this.content.assessmentItem.responseDeclaration.correctResponse.length<1){
		// if there is no correct answer to this question (ie, when they're filling out a form),
		// change button to say "save answer" and "edit answer" instead of "check answer" and "try again"
		// and don't show the number of attempts.
		
		//the text for the save answer and edit answer buttons
		var save_answer = this.view.getI18NString('save_answer', 'MultipleChoiceNode');
		var edit_answer = this.view.getI18NString('edit_answer', 'MultipleChoiceNode');
		
		document.getElementById("checkAnswerButton").innerHTML = save_answer;
		document.getElementById("tryAgainButton").innerHTML = edit_answer;
	} else {
		//the text that shows this is your x attempt
		var this_is_your = this.view.getI18NString('this_is_your', 'MultipleChoiceNode');
		var attempt = this.view.getI18NString('attempt', 'MultipleChoiceNode');
		
		displayNumberAttempts(this_is_your, attempt, this.attempts);
	};
	
	if(latestState != null && latestState.isCorrect) {
		//the student previously answered the question correctly
		
		//display the message that they correctly answered the question
		var resultMessage = this.getResultMessage(latestState.isCorrect);
		
		//check if scoring is enabled
		if(this.isChallengeScoringEnabled()) {
			//the text that shows you received x points
			var you_received = this.view.getI18NString('you_received', 'MultipleChoiceNode');
			var points = this.view.getI18NString('points', 'MultipleChoiceNode');
			
			//display the score they received
			var score = this.getScore(this.attempts.length);
			resultMessage += " " + you_received + " " + score + " " + points;
		}
		
		$('#resultMessageDiv').html(resultMessage);
	} else {
		//student has not answered this question correctly
		
		//check if challenge question is enabled
		if(this.isChallengeEnabled()) {
			//challenge question is enabled so we will create the constraint
			this.view.addActiveTagMapConstraint(this.node.id, null, 'mustCompleteBeforeAdvancing', null, null);
		}
	}
	
	if(this.node.getType()=='ChallengeNode') {
		//check if scoring is enabled
		if(this.isChallengeScoringEnabled()) {
			//display the current possible score table
			var scoreMessage = this.getCurrentPossibleScoreTableHtml();
			
			//display the score
			$('#scoreDiv').html(scoreMessage);				
		}
	}
	
	//turn this flag on so that the step does not shuffle again during this visit
	this.previouslyRendered = true;
	
	this.node.view.eventManager.fire('contentRenderCompleted', this.node.id, this.node);
};

/**
 * Get the table that displays the current possible scores
 */
MC.prototype.getCurrentPossibleScoreTableHtml = function() {
	var html = "";
	
	//check if there is an attempts object
	if(this.content.assessmentItem.interaction.attempts != null) {
		
		//get the latest state
		var latestState = this.getLatestState();
		
		//get the scores
		var scores = this.content.assessmentItem.interaction.attempts.scores;
		
		//get the number of attempts the student has made
		var numAttempts = this.attempts.length;
		
		if(latestState != null && !latestState.isCorrect) {
			/*
			 * the student has not answered the question correctly so their
			 * possible current possible score is if they answer it on their
			 * next attempt
			 */ 
			numAttempts += 1;
		}
		
		//generate the current possible score table
		html = getCurrentPossibleScoreTable(numAttempts, scores);		
	}
	
	return html;
};

/**
 * Determine if challenge question is enabled
 */
MC.prototype.isChallengeEnabled = function() {
	var isChallengeQuestion = false;
	
	if(this.node.getType() == 'ChallengeNode') {
		if(this.content.assessmentItem.interaction.attempts != null) {
			var navigateTo = this.content.assessmentItem.interaction.attempts.navigateTo;
			
			/*
			 * get the navigateToPosition to make sure the navigateTo step is in the project.
			 * steps that are inactive will not have a position, so as long as getPositionById()
			 * returns a non null value, we know that step is an active step in the project.
			 */
			var navigateToPosition = this.node.view.getProject().getPositionById(navigateTo);
			
			if(navigateToPosition != null) {
				//the navigateTo field has been set which means challenge is enabled
				isChallengeQuestion = true;				
			}
		}
	}
	
	return isChallengeQuestion;
};


/**
 * Determine if scoring is enabled
 */
MC.prototype.isChallengeScoringEnabled = function() {
	var result = false;
	
	if(this.content.assessmentItem.interaction.attempts != null) {
		var scores = this.content.assessmentItem.interaction.attempts.scores;
		
		//check if there are scores
		result = challengeScoringEnabled(scores);
	}
	
	return result;
};

/**
 * Given a choiceId, checks the latest state and if the choiceId
 * is part of the state, returns true, returns false otherwise.
 * 
 * @param choiceId
 * @return boolean
 */
MC.prototype.selectedInSavedState = function(choiceId){
	if(this.states && this.states.length>0){
		var latestState = this.states[this.states.length -1];
		for(var b=0;b<latestState.choices.length;b++){
			if(latestState.choices[b]==choiceId){
				return true;
			};
		};
	};

	return false;
};

/**
 * If prototype 'shuffle' for array is not found, create it
 */
if(!Array.shuffle){
	Array.prototype.shuffle = function (){ 
        for(var rnd, tmp, i=this.length; i; rnd=parseInt(Math.random()*i), tmp=this[--i], this[i]=this[rnd], this[rnd]=tmp);
    };
};

/**
 * Returns true if the choice with the given id is correct, false otherwise.
 */
MC.prototype.isCorrect = function(id){
	/* if no correct answers specified by author, then always return true */
	if(this.content.assessmentItem.responseDeclaration.correctResponse.length==0){
		return true;
	};
	
	/* otherwise, return true if the given id is specified as a correct response */
	for(var h=0;h<this.content.assessmentItem.responseDeclaration.correctResponse.length;h++){
		if(this.content.assessmentItem.responseDeclaration.correctResponse[h]==id){
			return true;
		};
	};
	return false;
};

/**
 * Checks Answer and updates display with correctness and feedback
 * Disables "Check Answer" button and enables "Try Again" button
 */
MC.prototype.checkAnswer = function() {
	//if (hasClass("checkAnswerButton", "disabledLink")) {
	if ($('#checkAnswerButton').parent().hasClass('ui-state-disabled')) {
		return;
	}

	//clear the previous result message
	$('#resultMessageDiv').html('');
	
	this.attempts.push(null);
	
	var radiobuttondiv = document.getElementById('radiobuttondiv');
	var inputbuttons = radiobuttondiv.getElementsByTagName('input');
	var mcState = (this.node.getType()=='MultipleChoiceNode') ? new MCSTATE() : (this.node.getType()=='BranchNode' ? new BRANCHSTATE() : new CHALLENGESTATE());
	var isCorrect = true;
	var showFeedbackDialog = false;
	var choiceFeedback = "";
	var resultMsg = "";
	
	if(!this.enforceMaxChoices(inputbuttons)){
		return;
	}
	
	enableRadioButtons(false);        // disable radiobuttons
	//addClassToElement("checkAnswerButton", "disabledLink");
	$('#checkAnswerButton').parent().addClass('ui-state-disabled'); // disable checkAnswerButton
	//removeClassFromElement("tryAgainButton", "disabledLink");
	$('#tryAgainButton').parent().removeClass('ui-state-disabled'); // show try again button
	
	for (var i=0;i<inputbuttons.length;i++) {
		var checked = inputbuttons[i].checked;		
		var choiceIdentifier = inputbuttons[i].getAttribute('id');  // identifier of the choice that was selected
		// use the identifier to get the correctness and feedback
		var choice = this.getChoiceByIdentifier(choiceIdentifier);

		if (checked) {
			if (choice) {
				document.getElementById('feedback_' + choiceIdentifier).innerHTML = choice.feedback;

				if(this.node.getType()=='ChallengeNode') {
					//highlight the feedback in yellow if this is a challenge question
					$('#feedback_' + choiceIdentifier).css('background-color', 'yellow');
					
					//show the feedback in popup style dialog as well
					resultMsg = this.getResultMessage(this.isCorrect(choice.identifier));
					if ((choice.feedback.length + resultMsg.length) != 0) {
						//we will remember the feedback to display it in the popup dialog
						choiceFeedback = choice.feedback;
						showFeedbackDialog = true;
					}
				}
				
				var choiceTextDiv = document.getElementById("choicetext:" + choiceIdentifier);
				if (this.isCorrect(choice.identifier)) {
					choiceTextDiv.setAttribute("class", "correct");
				} else {
					choiceTextDiv.setAttribute("class", "incorrect");
					isCorrect = false;
				}
				
				mcState.addChoice(choice.identifier);
				
				//add the human readable value of the choice chosen
				mcState.addResponse(choice.text);
			} else {
				this.node.view.notificationManager('error retrieving choice by choiceIdentifier', 3);
			}
		} else {
			if(this.isCorrect(choice.identifier)){
				isCorrect = false;
			}
		}
	}
	
	mcState.isCorrect = isCorrect;
	
	/* If this is a challenge node, we need to get the score and message associated
	 * with the number of attempts and whether this attempt is correct or not. We
	 * also need to disable the try again button. */
	if(this.node.getType()=='ChallengeNode'){
		
		if(this.isChallengeScoringEnabled()) {
			//get the scores
			var scores = this.content.assessmentItem.interaction.attempts.scores;
			
			//get the number of attempts the student has made
			var numAttempts = this.attempts.length;
			
			if(!isCorrect) {
				/*
				 * the student has not answered the question correctly so their
				 * possible current possible score is if they answer it on their
				 * next attempt
				 */ 
				numAttempts += 1;
			}
			
			//get the current possible score table
			var scoreMessage = getCurrentPossibleScoreTable(numAttempts, scores);
			
			//display the score
			$('#scoreDiv').html(scoreMessage);			
		}
		
		//get the challenge message
		var resultMessage = this.getResultMessage(isCorrect);

		//check if scoring is enabled
		if(this.isChallengeScoringEnabled()) {
			if(isCorrect) {
				//get the score
				var score = this.getScore(this.attempts.length);
				
				/* add the score to the state */
				mcState.score = score;
				
				//the message that says you received x points
				var you_received = this.view.getI18NString('you_received', 'MultipleChoiceNode');
				var points = this.view.getI18NString('points', 'MultipleChoiceNode');
				
				//display the score they received
				resultMessage += " " + you_received + " " + score + " " + points;
			} else {
				//student answered incorrectly
				mcState.score = 0;
			}
		}
		
		if(!isCorrect) {
			/*
			 * the student answered incorrectly so we will make the 
			 * background yellow since we will also be highlighting
			 * the associated step in the menu yellow
			 */
			resultMessage = "<table style='background-color:yellow' align='center'><tr><td>" + resultMessage + "</td></tr></table>";
		}
		
		if(showFeedbackDialog) {
			//show the feedback in a popup dialog that will persist between steps
			this.node.showFeedbackDialog(choiceFeedback + "<br\><br\>" + resultMsg, isCorrect);
		}
		
		/* set feedback message */
		$('#resultMessageDiv').html(resultMessage);
		
		/* disable the try again button */
		//$('#tryAgainButton').addClass('disabledLink');
		$('#tryAgainButton').parent().addClass('ui-state-disabled');
	} else if(this.node.getType()=='BranchNode'){
		
		/* remove the notvisitablex constraints for the appropriate branch based
		 * on the student response
		 *
		 * the value will have the spaces removed, so we want to get the value
		 * of the identifier as specified in the content. */
		var checkedId = this.resolveIdentifier($('#radiobuttondiv input:radio:checked').val());
		for(var v=0;v<this.content.branches.length;v++){
			/* if the determined choiceId is in the choiceIds of this branch, then
			 * we need to remove the specified constraints for this branch */
			if(this.content.branches[v].choiceIds.indexOf(checkedId) != -1){
				for(var w=0;w<this.content.branches[v].constraintIds.length;w++){
				}
			}
		}
		
		/* disable the try again button */
		//$('#tryAgainButton').addClass('disabledLink');
		$('#tryAgainButton').parent().addClass('ui-state-disabled');
	} else if(isCorrect){
		//the student answered correctly
		
		//get the congratulations message and display it
		var resultMessage = this.getResultMessage(isCorrect);
		document.getElementById('resultMessageDiv').innerHTML = resultMessage;
	}
	
	//fire the event to push this state to the global view.states object
	this.view.pushStudentWork(this.node.id, mcState);
	
	//push the state object into this mc object's own copy of states
	this.states.push(mcState);
};

/**
 * Returns true iff this.maxChoices is less than two or
 * the number of checkboxes equals this.maxChoices. Returns
 * false otherwise.
 */
MC.prototype.enforceMaxChoices = function(inputs){
	var maxChoices = parseInt(this.content.assessmentItem.interaction.maxChoices);
	if(maxChoices>1){
		var countChecked = 0;
		for(var x=0;x<inputs.length;x++){
			if(inputs[x].checked){
				countChecked += 1;
			};
		};
		
		//the message that says you have selected too many choices
		var you_have_selected_too_many_please_select = this.view.getI18NString('you_have_selected_too_many_please_select', 'MultipleChoiceNode');
		
		//the message that says you have selected too few choices
		var you_have_not_selected_enough_please_select = this.view.getI18NString('you_have_not_selected_enough_please_select', 'MultipleChoiceNode');
		
		var choices = this.view.getI18NString('choices', 'MultipleChoiceNode');
		
		if(countChecked>maxChoices){
			this.node.view.notificationManager.notify(you_have_selected_too_many_please_select + ' ' + maxChoices + ' ' + choices,3);
			return false;
		} else if(countChecked<maxChoices){
			this.node.view.notificationManager.notify(you_have_not_selected_enough_please_select + ' ' + maxChoices + ' ' + choices,3);
			return false;
		};
	};
	return true;
};

/**
 * Look up and return the score in the content that corresponds with the 
 * given number of attempts. If one does not exist in the object, work 
 * backwards until we find the latest. If no scores exist, return null.
 * 
 * @param int - numOfAttempts
 * @return int - score
 */
MC.prototype.getScore = function(numAttempts){
	var score = 0;
	
	if(this.content.assessmentItem.interaction.attempts != null) {
		//get the scores object
		var scores = this.content.assessmentItem.interaction.attempts.scores;
		
		score = getCurrentScore(numAttempts, scores);
	}
	
	return score;
};

/**
 * Given whether this attempt is correct, adds any needed linkTo and
 * constraints and returns a message string.
 * 
 * @param boolean - isCorrect
 * @param boolean - noFormat, return plain text
 * @return string - html response
 */
MC.prototype.getResultMessage = function(isCorrect){
	var message = '';
	
	/* we need to retrieve the attempt object corresponding to the current number of attempts */
	var attempt = this.content.assessmentItem.interaction.attempts;
	
	/* if this attempt is correct, then we only need to return a msg */
	if(isCorrect){
		//the message that says you have completed this question
		var you_have_completed_this_question = this.view.getI18NString('you_have_completed_this_question', 'MultipleChoiceNode');
		message = you_have_completed_this_question;
	} else {
		/* this is not correct, so we need to set up a linkTo and constraint
		 * and return a message with the linkTo if a step has been specified
		 * to navigate to otherwise, we need to return an empty string */
		if(attempt.navigateTo && attempt.navigateTo != ''){
			//the beginning of the message that says the student should review a previous step
			var please_review = this.view.getI18NString('please_review', 'MultipleChoiceNode');
			
			var msg = please_review + ' ';
			var position = this.node.view.getProject().getPositionById(attempt.navigateTo);
			
			if(position != null) {
				//the message that says the student must visit a previous step before trying again
				var step = this.view.getI18NString('step', 'MultipleChoiceNode');
				var before_trying_again = this.view.getI18NString('before_trying_again', 'MultipleChoiceNode');
				var you_must_visit = this.view.getI18NString('you_must_visit', 'MultipleChoiceNode');
				
				var stepNumberAndTitle = this.node.view.getProject().getStepNumberAndTitle(attempt.navigateTo);

				// create the link to the revisit step
				msg += "<a style='color:blue;text-decoration:underline;font-weight:bold;cursor:pointer' onclick='eventManager.fire(\"nodeLinkClicked\", \"" + position + "\")'>" + step + " " + stepNumberAndTitle + "</a> " + before_trying_again;

				//create the message that will display in the alert
				var optsMsg = you_must_visit + ' "' + step + ' ' + stepNumberAndTitle + '" ' + before_trying_again;
				
				//create the args to pass to the tag map constraint
				var additionalFunctionArgs = {
					mustVisitNodeId:attempt.navigateTo,
					createTime:Date.parse(new Date()),
					mustVisitAfterCreateTime:true
				};
				
				//create the constraint to make the student visit the navigateTo step
				this.view.addActiveTagMapConstraint(this.node.id, null, 'mustVisitXBefore', null, additionalFunctionArgs);
				
				message = msg;
			}
		}
	}
	
	return message;
};

/**
 * Returns a string of the given string with all spaces removed.
 */
MC.prototype.removeSpace = function(text){
	return text.replace(/ /g,'');
};

/**
 * Given an id from a choice in the html, returns the identifier as specified
 * in the content. We need to do this because when setting ids in the html, we
 * needed to remove spaces and authors that created their content NOT using the
 * authoring tool may have included spaces.
 * 
 * @param string - id
 * @return string - id
 */
MC.prototype.resolveIdentifier = function(id){
	for(var a=0;a<this.choices.length;a++){
		if(this.removeSpace(this.choices[a].identifier)==id){
			return this.choices[a].identifier;
		}
	}
};

/**
 * Get the max possible score the student can receive for this step
 * @returns the max possible score
 */
MC.prototype.getMaxPossibleScore = function() {
	var maxScore = null;
	
	if(this.content.assessmentItem.interaction.attempts != null) {
		//get the scores object
		var scores = this.content.assessmentItem.interaction.attempts.scores;
		
		if(scores != null) {
			//get the max score
			maxScore = getMaxScore(scores);
		}
	}
	
	return maxScore;
};

/**
 * Process the tag maps and obtain the results
 * @return an object containing the results from processing the
 * tag maps. the object contains three fields
 * enableStep
 * message
 * workToImport
 */
MC.prototype.processTagMaps = function() {
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

/**
 * enable checkAnswerButton
 * OR
 * disable checkAnswerButton
 */
function enableCheckAnswerButton(doEnable) {
	if (doEnable == 'true') {
		//removeClassFromElement("checkAnswerButton", "disabledLink");
		$('#checkAnswerButton').parent().removeClass('ui-state-disabled'); // disable checkAnswerButton
	} else {
		//addClassToElement("checkAnswerButton", "disabledLink");
		$('#tryAgainButton').parent().addClass('ui-state-disabled'); // disable checkAnswerButton
	}
};


/**
 * Enables radiobuttons so that user can click on them
 */
function enableRadioButtons(doEnable) {	
	var radiobuttons = document.getElementsByName('radiobutton');
	for (var i=0; i < radiobuttons.length; i++) {
		if (doEnable == 'true') {
			radiobuttons[i].removeAttribute('disabled');
		} else {
			radiobuttons[i].setAttribute('disabled', 'true');
		};
	};
};

/**
 * Clears HTML inside feedbackdiv
 */
function clearFeedbackDiv() {
	var feedbackdiv = document.getElementById('feedbackdiv');
	feedbackdiv.innerHTML = "";
	
	var feedbacks = document.getElementsByName('feedbacks');
	for(var z=0;z<feedbacks.length;z++){
		feedbacks[z].innerHTML = "";
	};
};


//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/multiplechoice/mc.js');
};