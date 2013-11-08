/**
 * Sets the MultipleChoiceNode type as an object of this view
 * @constructor
 * @author patrick lawler
 */
View.prototype.MultipleChoiceNode = {};
View.prototype.MultipleChoiceNode.commonComponents = ['Prompt', 'LinkTo'];

/**
 * Generates the authoring page for open response node types
 */
View.prototype.MultipleChoiceNode.generatePage = function(view){
	this.view = view;
	this.content = this.view.activeContent.getContentJSON();
	this.nodeUtils = new Node().utils;
	
	var parent = document.getElementById('dynamicParent');
	
	//wipe out old
	parent.removeChild(document.getElementById('dynamicPage'));
	
	//create new
	var pageDiv = createElement(document, 'div', {id:'dynamicPage', style:'width:100%;height:100%'});
	var answerText = document.createTextNode('Answers & Feedback:');
	var shuffleText = document.createTextNode('Shuffle answers before next try');
	var feedbackText = document.createTextNode('Feedback Options');
	var challengeText = document.createTextNode('Challenge Question Setup');
	var branchText = document.createTextNode('Branching Setup');
	
	pageDiv.appendChild(shuffleText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(this.generateShuffle());
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(feedbackText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(this.generateFeedbackOptions());
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(this.generateHideQuestionAndAnswersAfterAnsweredCorrectly());
	
	/* if this is a branch node, we always want the bullets to
	 * show up for a choice, so do not allow athors to modify it */
	if(this.view.activeNode.getType()!='BranchNode'){
		pageDiv.appendChild(createBreak());
		pageDiv.appendChild(this.generateNumChoiceOption());
	} 
	
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(document.createTextNode("Edit prompt:"));
	pageDiv.appendChild(createElement(document, 'div', {id:'promptContainer'}));
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	
	/* if the activeNode is a challengeNode, insert the challenge authoring options here */
	if(this.view.activeNode.getType()=='ChallengeNode'){
		pageDiv.appendChild(challengeText);
		pageDiv.appendChild(this.generateChallengeSetup());
		pageDiv.appendChild(createBreak());
		pageDiv.appendChild(createBreak());
	}
	
	pageDiv.appendChild(answerText);
	pageDiv.appendChild(this.generateAnswers());
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createElement(document, 'input', {type: "button", id: "createNewButton", value: "Create New Answer", onclick: 'eventManager.fire("mcCreateNewChoice")'}));
	pageDiv.appendChild(createElement(document, 'input', {type: "button", value: "Reset Correct Answer selection", onclick: 'eventManager.fire("mcClearCorrectChoice")'}));
	
	parent.appendChild(pageDiv);
	
	/* if the activeNode is a BranchNode, insert the branch authoring here */
	if(this.view.activeNode.getType()=='BranchNode'){
		this.generateBranchSetup();
	}
	
	/* generate drag and drop */
	this.generateDD();
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 */
View.prototype.MultipleChoiceNode.getCommonComponents = function() {
	return this.commonComponents;
};

/**
 * Generates shuffle element options for this page and sets option based on xml data
 */
View.prototype.MultipleChoiceNode.generateShuffle = function(){
	var shuffleDiv = createElement(document, 'div', {id: "shuffleDiv"});
	var shuffleTrue = createElement(document, 'input', {type: 'radio', name: 'shuffleOption', value: "true", onclick: 'eventManager.fire("mcShuffleChange","true")'});
	var shuffleFalse = createElement(document, 'input', {type: 'radio', name: 'shuffleOption', value: "false", onclick: 'eventManager.fire("mcShuffleChange","false")'});
	var trueText = createElement(document, 'label');
	trueText.innerHTML = 'shuffle choices';
	var falseText = createElement(document, 'label');
	falseText.innerHTML = 'do NOT shuffle choices';

	shuffleDiv.appendChild(shuffleTrue);
	shuffleDiv.appendChild(trueText);
	shuffleDiv.appendChild(createBreak());
	shuffleDiv.appendChild(shuffleFalse);
	shuffleDiv.appendChild(falseText);
	
	if(this.content.assessmentItem.interaction.shuffle){
		shuffleTrue.checked = true;
	} else {
		shuffleFalse.checked = true;
	};
	return shuffleDiv;
};

/**
 * Generates feedback element options and sets option based on xml data
 */
View.prototype.MultipleChoiceNode.generateFeedbackOptions = function(){
	var feedbackOptionDiv = createElement(document, 'div', {id: 'feedbackOptionsDiv'});
	var feedbackOptionTrue = createElement(document, 'input', {type: 'radio', name: 'feedbackOption', value: "true", onclick: 'eventManager.fire("mcFeedbackOptionChange","true")'});
	var feedbackOptionFalse = createElement(document, 'input', {type: 'radio', name: 'feedbackOption', value: "false", onclick: 'eventManager.fire("mcFeedbackOptionChange","false")'});
	var trueText = createElement(document, 'label');
	trueText.innerHTML = 'has inline feedback';
	var falseText = createElement(document, 'label');
	falseText.innerHTML = 'does NOT have inline feedback';
	
	feedbackOptionDiv.appendChild(feedbackOptionTrue);
	feedbackOptionDiv.appendChild(trueText);
	feedbackOptionDiv.appendChild(createBreak());
	feedbackOptionDiv.appendChild(feedbackOptionFalse);
	feedbackOptionDiv.appendChild(falseText);
	
	if(this.content.assessmentItem.interaction.hasInlineFeedback){
		feedbackOptionTrue.checked = true;
	} else {
		feedbackOptionFalse.checked = true;
	};
	return feedbackOptionDiv;
};

/**
 * Generate the checkbox to specify to not display anything after the student
 * answers correctly
 */
View.prototype.MultipleChoiceNode.generateHideQuestionAndAnswersAfterAnsweredCorrectly = function() {
	//create a div to contain the elements we are about to make
	var hideQuestionAndAnswersDiv = createElement(document, 'div', {id: 'hideQuestionAndAnswersAfterAnsweredCorrectlyDiv'});
	
	//make the text
	var hideQuestionAndAnswersText = document.createTextNode("Hide Question and Answers after answered correctly");
	
	//make the checkbox
	var hideQuestionAndAnswersCheckBox = createElement(document, 'input', {id: 'hideQuestionAndAnswersAfterAnsweredCorrectlyCheckBox', type: 'checkbox', onclick: 'eventManager.fire("mcHideQuestionAndAnswersAfterAnsweredCorrectlyChanged")'});
	
	//add the elements to the div
	hideQuestionAndAnswersDiv.appendChild(hideQuestionAndAnswersText);
	hideQuestionAndAnswersDiv.appendChild(hideQuestionAndAnswersCheckBox);
	
	if(this.content.hideQuestionAndAnswersAfterAnsweredCorrectly) {
		//populate the checkbox
		hideQuestionAndAnswersCheckBox.checked = true;
	}
	
	return hideQuestionAndAnswersDiv;
};

/**
 * Dynamically generates the elements used to
 * specify the number of correct choices for this
 * multiple choice
 */
View.prototype.MultipleChoiceNode.generateNumChoiceOption = function(){
	var numChoiceDiv = createElement(document, 'div', {id: 'numChoiceDiv'});
	var numChoiceText = document.createTextNode('Enter the number of answers the student is allowed to choose as correct. Enter \'0\' to allow the student to choose as many as they want.');
	var numChoiceInput = createElement(document, 'input', {type: "text", id: 'numChoiceInput', onchange: 'eventManager.fire("mcNumChoiceChanged")'});
	
	numChoiceInput.value = this.content.assessmentItem.interaction.maxChoices;
	
	numChoiceDiv.appendChild(numChoiceText);
	numChoiceDiv.appendChild(createBreak());
	numChoiceDiv.appendChild(numChoiceInput);
	return numChoiceDiv;
};

/**
 * Returns an element that contains the possible answers to the prompt for
 * this content with the appopriate feedback element
 */
View.prototype.MultipleChoiceNode.generateAnswers = function(){
	var answerElements = [];
	var answerDiv = createElement(document, 'div', {id: 'answerDiv', name: 'answerDiv'});
	var answerUL = createElement(document, 'ul', {id: 'answerUL', 'class': 'container'});
	
	
	var answers = this.content.assessmentItem.interaction.choices;
	for(var h=0;h<answers.length;h++){
		var answerText = answers[h].text;
		var answerTextLabel = document.createTextNode('Answer: ');
		var feedbackTextLabel = document.createTextNode('Feedback:');
		feedback = this.generateFeedback(answers[h], h);
		options = this.generateOptions(h, answers.length);
		var answerLI = createElement(document, 'li', {id: 'answerLI_' + h, name: 'answerLI', 'class': 'draggable'});
		var answer = createElement(document, 'input', {type: 'text', key: answers[h].identifier, name: "answerInput", value: answerText, size: '90', wrap: 'hard', onkeyup: 'eventManager.fire("mcXmlUpdated")'});
		answerLI.appendChild(answerTextLabel);
		answerLI.appendChild(answer);
		answerLI.appendChild(createBreak());
		answerLI.appendChild(feedbackTextLabel);
		answerLI.appendChild(feedback);
		answerLI.appendChild(createBreak());
		answerLI.appendChild(options);
		answerUL.appendChild(answerLI);
	};
	
	answerDiv.appendChild(answerUL);
	return answerDiv;
};

/**
 * Generates a text input element with associated feedback as value for a choice object
 * when inline feedback exists and is specified for the entire MC question, otherwise
 * feedback is not available
 */
View.prototype.MultipleChoiceNode.generateFeedback = function(choice, index){
	if(this.content.assessmentItem.interaction.hasInlineFeedback){
		var feedbackEl = createElement(document, 'input', {type: 'text', wrap: 'hard', id: 'feedbackInput_' + index, name: "feedbackInput", size:'90', onkeyup: 'eventManager.fire("mcXmlUpdated")'});
		feedbackEl.value = choice.feedback;
	} else {
		var feedbackEl = createElement(document, 'div', {id: 'feedbackInput_' + index, name: 'feedbackInput_' + index});
	};
	return feedbackEl;
};

/**
 * Generates and returns an option element that contains all the available options
 * for the given choice.
 */
View.prototype.MultipleChoiceNode.generateOptions = function(index, length){
	var options = createElement(document, 'div');
	
	if(this.isCorrect(this.content.assessmentItem.interaction.choices[index].identifier)){
		var outStr = '<input CHECKED type="checkbox" name="correctRadio" id="radio_' + index + '" value="' + index + '" onclick="eventManager.fire(\'mcCorrectChoiceChange\',\'' + index + '\')">This is a correct Choice ';
	} else {
		var outStr = '<input type="checkbox" name="correctRadio" id="radio_' + index + '" value="' + index + '" onclick="eventManager.fire(\'mcCorrectChoiceChange\',\'' + index + '\')">This is a correct Choice ';
	}
	
	outStr = outStr + '<a href="#" onclick="eventManager.fire(\'mcRemoveChoice\',\'' + index + '\')">Remove Choice</a>';
	
	options.innerHTML = outStr;
	return options;
};

/**
 * Returns true if the choice with the given id is a correct response, returns false otherwise.
 */
View.prototype.MultipleChoiceNode.isCorrect = function(id){
	for(var h=0;h<this.content.assessmentItem.responseDeclaration.correctResponse.length;h++){
		if(this.content.assessmentItem.responseDeclaration.correctResponse[h]==id){
			return true;
		};
	};
	return false;
};

/**
 * Generates answers in xmlPage based on the choice elements on this page and the corresponding correctResponse values
 */
View.prototype.MultipleChoiceNode.updateAnswer = function(parent){
	var answers = document.getElementsByName('answerLI');
	this.content.assessmentItem.interaction.choices = [];
	this.content.assessmentItem.responseDeclaration.correctResponse = [];
	
	for(var d=0;d<answers.length;d++){
		/* create new choice object, setting values for the fixed, identifier and text fields */
		var choice = {feedback:'', fixed:true, identifier: answers[d].childNodes[1].getAttribute('key'), text: answers[d].childNodes[1].value};
		
		/* set value for feedback field */
		if(answers[d].childNodes[4]!=null && answers[d].childNodes[4].getAttribute('type')=='text'){
			choice.feedback = answers[d].childNodes[4].value;
		};
		
		/* set the correct response if this choice has been chosen as the correct response */
		if(this.content.assessmentItem.interaction.hasInlineFeedback){
			var checked = answers[d].getElementsByTagName('input')[2].checked;
		} else {
			var checked = answers[d].getElementsByTagName('input')[1].checked;
		};
		
		if(checked){
			this.addCorrectChoice(choice.identifier);
		};
		
		this.content.assessmentItem.interaction.choices.push(choice);
	};
};

/**
 * Removes the choice of the given index
 */
View.prototype.MultipleChoiceNode.removeChoice = function(index){
	/* remove this choice as correct response if it was */
	this.removeCorrectChoice(this.content.assessmentItem.interaction.choices[index].identifier);
	
	/* remove this choice */
	this.content.assessmentItem.interaction.choices.splice(index, 1);
	
	/* regenerate the answers and fire updated event */
	this.regenerateAnswers();
	this.view.eventManager.fire("mcXmlUpdated");
};

/**
 * Creates a new choice object in the content and updates page
 */
View.prototype.MultipleChoiceNode.createNewChoice = function(){
	var choice = {feedback:'Enter feedback',fixed:true,identifier:this.nodeUtils.generateKey(),text:''};
	
	this.content.assessmentItem.interaction.choices.push(choice);
	
	this.regenerateAnswers();
	
	this.view.eventManager.fire("mcXmlUpdated");
};

/**
 * Regenerates the html answer elements based on the content and regenerates the drag and drop
 */
View.prototype.MultipleChoiceNode.regenerateAnswers = function(){
	var parent = document.getElementById('dynamicPage');
	parent.removeChild(document.getElementById('answerDiv'));
	var answer = this.generateAnswers();
	var nextNode = document.getElementById('createNewButton');
	parent.insertBefore(answer, nextNode);
	
	this.generateDD();
};

/**
 * Updates the content with the specified shuffle value and refreshes page
 */
View.prototype.MultipleChoiceNode.shuffleChange = function(val){
	if(val=='true'){
		this.content.assessmentItem.interaction.shuffle = true;
	} else {
		this.content.assessmentItem.interaction.shuffle = false;
	};
	
	this.view.eventManager.fire("mcXmlUpdated");
};

/**
 * Updates the content with the specified correct choice and refreshes page
 */
View.prototype.MultipleChoiceNode.correctChoiceChange = function(index){
	if(document.getElementById('radio_' + index).checked){
		this.addCorrectChoice(this.content.assessmentItem.interaction.choices[index].identifier);
	} else {
		this.removeCorrectChoice(this.content.assessmentItem.interaction.choices[index].identifier);
	};
	
	this.view.eventManager.fire("mcXmlUpdated");
};

/**
 * Adds the given identifier to the correct choices if it does not already exist
 */
View.prototype.MultipleChoiceNode.addCorrectChoice = function(identifier){
	var ndx = this.content.assessmentItem.responseDeclaration.correctResponse.indexOf(identifier);
	if(ndx==-1){
		this.content.assessmentItem.responseDeclaration.correctResponse.push(identifier);
	};
};

/**
 * Removes the given identifier from the correct choices if it exists
 */
View.prototype.MultipleChoiceNode.removeCorrectChoice = function(identifier){
	var ndx = this.content.assessmentItem.responseDeclaration.correctResponse.indexOf(identifier);
	if(ndx!=-1){
		this.content.assessmentItem.responseDeclaration.correctResponse.splice(ndx,1);
	};
};

/**
 * Updates the content with the specified number of correct choices and refreshes page
 */
View.prototype.MultipleChoiceNode.numChoiceChanged = function(){
	this.content.assessmentItem.interaction.maxChoices = document.getElementById('numChoiceInput').value;
	
	this.view.eventManager.fire("mcXmlUpdated");
};

/**
 * Removes check from all correct choice radio buttons and updates
 * xmlPage so that there is no correct choice
 */
View.prototype.MultipleChoiceNode.clearCorrectChoice = function(){
	var radios = document.getElementsByName('correctRadio');
	for(var p=0;p<radios.length;p++){
		radios[p].checked = false;
	};
	
	this.content.assessmentItem.responseDeclaration.correctResponse = [];
	
	this.view.eventManager.fire("mcXmlUpdated");
};

/**
 * Returns true iff all of the choice fields are not blank, otherwise, returns false
 */
View.prototype.MultipleChoiceNode.validate = function(){
	var choices = document.getElementsByName('answerInput');
	var empty = false;
	
	for(var c=0;c<choices.length;c++){
		if(choices[c].value==null || choices[c].value==""){
			empty = true;
		};
	};
	
	if(empty){
		this.view.notificationManager.notify("No choice fields are allowed to be empty or null. Exiting...", 3);
		return false;
	};
	return true;
};

/**
 * Updates the has inline feedback option in the content and refreshes the html
 */
View.prototype.MultipleChoiceNode.feedbackOptionChange = function(val){
	if(val=='true'){
		this.content.assessmentItem.interaction.hasInlineFeedback = true;
	} else {
		this.content.assessmentItem.interaction.hasInlineFeedback = false;
	};
	
	this.regenerateAnswers();
	this.view.eventManager.fire("mcXmlUpdated");
};


View.prototype.MultipleChoiceNode.populatePrompt = function() {
	$('#promptInput').val(this.content.assessmentItem.interaction.prompt);
};

/**
 * Called on several keyup events, regenerates necessary elements and fires source updated event
 */
View.prototype.MultipleChoiceNode.updatePrompt = function(){
	/* update prompt and answers */
	var content = '';
	if(typeof tinymce != 'undefined' && $('#promptInput').tinymce()){
		content = $('#promptInput').tinymce().getContent();
	} else {
		content = $('#promptInput').val();
	}
	
	this.content.assessmentItem.interaction.prompt = content;
	this.updateAnswer();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 */
View.prototype.MultipleChoiceNode.updateContent = function(){
	/* update content object */
	this.view.activeContent.setContent(this.content);
};

/**
 * Generates the drag and drop for multiple choice authoring using jquery
 */
View.prototype.MultipleChoiceNode.generateDD = function(){
	$('#answerDiv ul').sortable(
			{
				stop:function(e,ui){
					eventManager.fire('mcXmlUpdated');
				}
			});
};

/**
 * When needed, generates the challenge setup for authors to author ChallengeNodes.
 */
View.prototype.MultipleChoiceNode.generateChallengeSetup = function(){
	/* create challenge setup structure */
	var challengeDiv = createElement(document, 'div', {id:'challengeDiv'});
	var navigateToDiv = createElement(document, 'div', {id:'navigateToDiv'});
	var attemptsDiv = createElement(document, 'div', {id:'attemptsDiv'});
	challengeDiv.appendChild(navigateToDiv);
	challengeDiv.appendChild(createBreak());
	challengeDiv.appendChild(attemptsDiv);
	
	/* create the navigateTo elements */
	var navToText = document.createTextNode('Select the step that students should review before being allowed to try again.');
	var navToSelect = createElement(document,'select', {id:'navigateToSelect', onchange:'eventManager.fire("challengeNavigateToChanged")'});
	var nodeIds = this.view.getProject().getNodeIds();
	var noneOption = createElement(document, 'option', {value:''});
	noneOption.text = '-- none --';
	navToSelect.appendChild(noneOption);
	
	/* add all of the nodes in the project */
	for(var a=0;a<nodeIds.length;a++){
		var nodeId = nodeIds[a];
		var stepNumberAndTitle = this.view.getProject().getStepNumberAndTitle(nodeId);
		var currentOption = createElement(document, 'option', {value:nodeId});
		currentOption.text = stepNumberAndTitle;
		navToSelect.appendChild(currentOption);
		
		/* check to see if this should be the selected node */
		if(this.content.assessmentItem.interaction.attempts.navigateTo==nodeIds[a]){
			navToSelect.selectedIndex = a + 1;
		}
	}
	
	challengeDiv.appendChild(navToText);
	challengeDiv.appendChild(createBreak());
	challengeDiv.appendChild(navToSelect);
	challengeDiv.appendChild(createBreak());
	challengeDiv.appendChild(createBreak());
	
	/* create the attempts elements */
	var attemptsText = document.createTextNode('Specify the score for each attempt by the student.');
	var attemptsTable = createElement(document, 'table', {id:'scoreAttemptsTable'});
	var ath = createElement(document, 'thead', {id:'scoreAttemptsTableHead'});
	var athRow = createElement(document, 'tr', {id:'scoreAttemptsHeaderRow'});
	var attemptTH = createElement(document, 'th', {id:'attemptTH'});
	var scoreTH = createElement(document, 'th', {id:'scoreHeadTH'});
	var atb = createElement(document, 'tbody', {id:'scoreAttemtpsTableBody'});
	var addNewButton = createElement(document, 'input', {type:'button', value:'Add new attempt/score', onclick:'eventManager.fire("challengeAddNew")'});
	var removeLastButton = createElement(document, 'input', {type:'button', value:'Remove last attempt/score', onclick:'eventManager.fire("challengeRemoveLast")'});
	
	challengeDiv.appendChild(attemptsText);
	challengeDiv.appendChild(createBreak());
	challengeDiv.appendChild(attemptsTable);
	challengeDiv.appendChild(addNewButton);
	challengeDiv.appendChild(removeLastButton);
	
	attemptsTable.appendChild(ath);
	attemptsTable.appendChild(atb);
	ath.appendChild(athRow);
	athRow.appendChild(attemptTH);
	athRow.appendChild(scoreTH);
	
	attemptTH.innerHTML = 'Attempt #';
	scoreTH.innerHTML = 'Score';
	
	/* add attempts/scores that are specified in the content */
	for(var attempt in this.content.assessmentItem.interaction.attempts.scores){
		var score = this.content.assessmentItem.interaction.attempts.scores[attempt];
		var currentRow = createElement(document, 'tr', {id:'attemptRow_' + attempt});
		var attemptTD = createElement(document, 'td', {id:'attemptTD_' + attempt});
		var scoreTD = createElement(document, 'td', {id:'scoreTD_' + attempt});
		var scoreInput = createElement(document, 'input', {type:'text', id:'scoreInput_' + attempt, size:3, onkeyup:'eventManager.fire("challengeScoreChanged","' + attempt + '")', value: score});
		
		atb.appendChild(currentRow);
		currentRow.appendChild(attemptTD);
		currentRow.appendChild(scoreTD);
		attemptTD.innerHTML = attempt;
		scoreTD.appendChild(scoreInput);
	}
	
	return challengeDiv;
};

/**
 * Updates the content with the author selected value of the nodeId that should
 * be navigated to when the student incorrectly answers a challenge question.
 */
View.prototype.MultipleChoiceNode.challengeNavigateToChanged = function(){
	/* update content */
	this.content.assessmentItem.interaction.attempts.navigateTo = $('#navigateToSelect').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Adds a new attempt/score to the content and the authoring.
 */
View.prototype.MultipleChoiceNode.addNewAttemptScore = function(){
	/* get the new attempt number */
	var attemptNum = this.getLastAttemptNumber() + 1;
	
	/* update the content */
	this.content.assessmentItem.interaction.attempts.scores[attemptNum] = 0;
	
	/* update the attempts/scores table */
	var trHtml = '<tr id="attemptRow_' + attemptNum + '"><td id="attemptTD_' + attemptNum + '">' + attemptNum + 
		'</td><td id="scoreTD_' + attemptNum + '"><input type="text" size="3" onkeyup="eventManager.fire(\'challengeScoreChanged\',\'' + 
		attemptNum + '\')" value="0" id="scoreInput_' + attemptNum  + '"></input></td></tr>';
	$('#scoreAttemtpsTableBody').append(trHtml);
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Removes the last attempt/score from the content and the authoring.
 */
View.prototype.MultipleChoiceNode.removeLastAttemptScore = function(){
	/* get the last attempt number */
	var attemptNum = this.getLastAttemptNumber();
	
	if(attemptNum > 0){
		/* update the content */
		this.content.assessmentItem.interaction.attempts.scores = this.getScoresMinus(attemptNum);
		
		/* remove from the attempts/score table */
		$('#attemptRow_' + attemptNum).remove();
		
		/* fire source updated event */
		this.view.eventManager.fire('sourceUpdated');
	}
};

/**
 * Given the attempt number, updates the associated score in the content.
 * 
 * @param int - attempt number
 */
View.prototype.MultipleChoiceNode.scoreChanged = function(attemptNum){
	/* get the value entered by the author */
	var val = $('#scoreInput_' + attemptNum).val();
	
	/* validate that the user specified value is a number */
	if(isNaN(val)){
		/* set the value in the content into the input area and notify user */
		$('#scoreInput_' + attemptNum).val(this.content.assessmentItem.interaction.attempts.scores[attemptNum]);
		this.view.notificationManager.notify('The entered score must be a number.');
	} else {
		/* set the value of the input area to the content */
		this.content.assessmentItem.interaction.attempts.scores[attemptNum] = parseInt(val);
	}
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Returns the last attempt number that is specified in the content.
 * 
 * @return int - attempt number
 */
View.prototype.MultipleChoiceNode.getLastAttemptNumber = function(){
	var last = 0;
	
	for(var attempt in this.content.assessmentItem.interaction.attempts.scores){
		if(!isNaN(attempt)){
			last = Math.max(last, parseInt(attempt));
		}
	}
	
	return last;
};

/**
 * Returns a new scores object minus the given attemptNum.
 * 
 * @return object - scores
 */
View.prototype.MultipleChoiceNode.getScoresMinus = function(attemptNum){
	var scores = {};
	
	for(var attempt in this.content.assessmentItem.interaction.attempts.scores){
		if(attempt != attemptNum){
			scores[attempt] = this.content.assessmentItem.interaction.attempts.scores[attempt];
		}
	}
	
	return scores;
};

/**
 * When needed generates the html for setting up branches and appends them.
 */
View.prototype.MultipleChoiceNode.generateBranchSetup = function(){
	if (!this.content.branches) {
		return;
	}
	
	/* remove any existing */
	$('#branchAuthoring').remove();
	
	/* create new */
	var html = '<div id="branchAuthoring"><div>Branching Setup: <input type="button" value="create new branch" onclick="eventManager.fire(\'branchCreateNewBranch\')"/></div>';
	for(var a=0;a<this.content.branches.length;a++){
		html += this.getBranchHtml(this.content.branches[a]);
	}	
	html += '</div>';
	
	/* append to page */
	$('#dynamicPage').append(html);
};

/**
 * Given a branch object, generates and returns the html for that specific
 * branch.
 * 
 * @param object - branch
 * @return string - html
 */
View.prototype.MultipleChoiceNode.getBranchHtml = function(branch){
	var hasUnusedChoices = this.getUnusedChoices().length > 0;
	var html = '<div class="branchDiv"><table><tbody><tr>';
	
	/* display and set options for associating answers with this branch */
	html += '<td><div>Answers associated with this branch:</div><div><ul>';
	for(var b=0;b<branch.choiceIds.length;b++){
		var choice = this.getChoiceById(branch.choiceIds[b]);
		html += '<li id="branchChoice' + choice.identifier + '">' + choice.text + ' <input type="button" value="remove" onclick="eventManager.fire(\'branchRemoveChoice\',[\'' + choice.identifier + '\',\'' + branch.id + '\'])"/></li>';
	}
	html += '</ul></div><div id="associateAnswer_' + branch.id + '">';
	
	/* we only want to display a button to associate and answer (choice) with
	 * a branch if there are any choices left that are not associated with branches */
	if(hasUnusedChoices){
		html += '<input type="button" value="associate answer" onclick="eventManager.fire(\'branchAssociateAnswer\',\'' + branch.id + '\')"/>';
	}
	
	html += '</div></td>';
	
	/* display and set options for associating this branch with nodes and sequences */
	html += '<td><div>Activities/Steps of this branch:</div><div><ul>';
	for(var c=0;c<branch.branchIds.length;c++){
		var node = this.view.getProject().getNodeById(branch.branchIds[c]);
		var pre = (node.isSequence() ? 'Activity' : 'Step');
		html += '<li id="branchNode_' + node.id.replace('.','-') + '">' + pre + ' ' + node.getTitle() +  ' <input type="button" value="remove" onclick="eventManager.fire(\'branchRemoveNode\',[\'' + node.id + '\',\'' + branch.id + '\'])"/></li>';
	}
	html += '</ul><div id="associateNode_' + branch.id + '"><input type="button" value="add another" onclick="eventManager.fire(\'branchAssociateNode\',\'' + branch.id + '\')"/></div></td>';
	html += '<td><div>Branch Options</div><div><input type="button" value="remove branch" onclick="eventManager.fire(\'branchRemoveBranch\',\'' + branch.id + '\')"/></div></td>';
	html += '</tr></tbody></table></div>';
	
	return html;
};

/**
 * Given an id, returns the choice in the content associated with that id.
 * 
 * @param string - id
 * @return object - choice
 */
View.prototype.MultipleChoiceNode.getChoiceById = function(id){
	var choices = this.content.assessmentItem.interaction.choices;
	for(var c=0;c<choices.length;c++){
		if(choices[c].identifier == id){
			return choices[c];
		}
	}
};

/**
 * Returns a list of all Ids of the given type that are already in use for branching.
 * 
 * @param  string - type
 * @return array - used ids of given type
 */
View.prototype.MultipleChoiceNode.getAllUsedIdsOf = function(type){
	var returnIds = [];
	
	/* loop through all specified branches and concat the Ids of the given type */
	for(var d=0;d<this.content.branches.length;d++){
		if(type=='choice'){
			returnIds = returnIds.concat(this.content.branches[d].choiceIds);
		} else if(type=='branch'){
			returnIds.push(this.content.branches[d].id);
		} else if(type=='node'){
			returnIds = returnIds.concat(this.content.branches[d].branchIds);
		}
	}
	
	/* return the concatenated ids */
	return returnIds;
};

/**
 * Returns an array of all choices that are not currently used by
 * any of the branches.
 * 
 * @return array - choice
 */
View.prototype.MultipleChoiceNode.getUnusedChoices = function(){
	var returnChoices = [];
	var choices = this.content.assessmentItem.interaction.choices;
	var usedChoiceIds = this.getAllUsedIdsOf('choice');
	
	for(var f=0;f<choices.length;f++){
		if(usedChoiceIds.indexOf(choices[f].identifier) == -1){
			returnChoices.push(choices[f]);
		}
	}
	
	return returnChoices;
};

/**
 * Returns the branch in the content with the given id if it
 * exists, returns null otherwise.
 * 
 * @param string - id
 * @return object - branch
 */
View.prototype.MultipleChoiceNode.getBranchById = function(id){
	if (!this.content.branches) {
		return null;
	}
	for(var e=0;e<this.content.branches.length;e++){
		if(this.content.branches[e].id==id){
			return this.content.branches[e];
		}
	}
};

/**
 * Creates a new branch and updates the html
 */
View.prototype.MultipleChoiceNode.createNewBranch = function(type){
	/* add a new branch object to the content */
	this.content.branches.push({id:this.view.activeNode.utils.generateKey(),choiceIds:[],branchIds:[]});
	
	/* update the html by regenerating it */
	this.generateBranchSetup();
};

/**
 * Removes the branch with the given id from the content and updates the html
 * 
 * @param string - id
 */
View.prototype.MultipleChoiceNode.removeBranch = function(id){
	/* check the content for the branch with the given id and remove
	 * it if it exists */
	var branch = this.getBranchById(id);
	if(branch){
		this.content.branches.splice(this.content.branches.indexOf(branch), 1);
	}
	
	/* update the html by regenerating it */
	this.generateBranchSetup();
};

/**
 * Given a choice id and a branch id removes the choice from the branch and
 * updates the html.
 * 
 * @param string - choice id
 * @param string - branch id
 */
View.prototype.MultipleChoiceNode.branchRemoveChoice = function(choiceId,branchId){
	/* retrieve the branch and remove the choice if the branch and choice exist */
	var branch = this.getBranchById(branchId);
	if(branch){
		if(branch.choiceIds.indexOf(choiceId) != -1){
			branch.choiceIds.splice(branch.choiceIds.indexOf(choiceId),1);
		}
	}
	
	/* update the html by regenerating it */
	this.generateBranchSetup();
};

/**
 * Given a branch id, creates the appropriate html to allow the author to
 * add a answer (choice) to that branch.
 * 
 * @param string - branch id
 */
View.prototype.MultipleChoiceNode.associateAnswer = function(branchId){
	var html = '<div><select id="selectAssociateAnswer_' + branchId + '">';
	var choices = this.getUnusedChoices();
	
	for(var g=0;g<choices.length;g++){
		html += '<option value="' + choices[g].identifier + '">' + choices[g].text + '</option>';
	}
	html += '</select><input type="button" value="choose" onclick="eventManager.fire(\'branchSelectAssociateAnswer\',\'' + branchId + '\')"/></div>';
	$('#associateAnswer_' + branchId).append(html);
};

/**
 * Updates the content an html with the author selected answer (choice) to the branch
 * 
 * @param string - branch id
 */
View.prototype.MultipleChoiceNode.selectedAssociateAnswer = function(branchId){
	/* update the branch with the given id with the author selected value */
	var branch = this.getBranchById(branchId);
	if(branch){
		branch.choiceIds.push($('#selectAssociateAnswer_' + branchId).val());
	}
	
	/* update the html by regenerating it */
	this.generateBranchSetup();
};

/**
 * Given a node id and a branch id, removes the node from the branch and
 * updates the html.
 * 
 * @param string - node id
 * @param string - branch id
 */
View.prototype.MultipleChoiceNode.removeNode = function(nodeId,branchId){
	/* retrieve the branch and remove the node id if the branch and node id exist */
	var branch = this.getBranchById(branchId);
	if(branch){
		if(branch.branchIds.indexOf(nodeId) != -1){
			branch.branchIds.splice(branch.branchIds.indexOf(nodeId),1);
		}
	}
	
	/* update the html by regenerating it */
	this.generateBranchSetup();
};

/**
 * Given a branch id, creates the appropriate html to allow the author to
 * add a node to that branch.
 * 
 * @param string - branch id
 */
View.prototype.MultipleChoiceNode.associateNode = function(branchId){
	/* get the node ids for the project and remove the id for the
	 * node that is currently being authored */
	var nodeIds = this.view.getProject().getDescendentNodeIds(this.view.getProject().getRootNode().id,true);
	if(nodeIds.indexOf(this.view.activeNode.id) != -1){
		nodeIds.splice(nodeIds.indexOf(this.view.activeNode.id), 1);
	}
	
	var html = '<div><select id="selectAssociateNode_' + branchId + '">';
	for(var g=0;g<nodeIds.length;g++){
		var node = this.view.getProject().getNodeById(nodeIds[g]);
		html += '<option value="' + node.id + '">' + node.getTitle() + '</option>';
	}
	html += '</select><input type="button" value="choose" onclick="eventManager.fire(\'branchSelectAssociateNode\',\'' + branchId + '\')"/></div>';
	$('#associateNode_' + branchId).append(html);	
};

/**
 * Updates the content an html with the author selected node to the branch
 * 
 * @param string - branch id
 */
View.prototype.MultipleChoiceNode.selectedAssociateNode = function(branchId){
	/* update the branch with the given id with the author selected value */
	var branch = this.getBranchById(branchId);
	if(branch){
		branch.branchIds.push($('#selectAssociateNode_' + branchId).val());
	}
	
	/* update the html by regenerating it */
	this.generateBranchSetup();
};

/**
 * Validates the branch authoring if this is a branch node and notifies
 * the user of any problems.
 */
View.prototype.MultipleChoiceNode.save = function(close){
	if(this.view.activeNode.getType()=='BranchNode'){
		
		/* validate that there are at least two branches */
		if(this.content.branches.length < 2){
			this.view.notificationManager.notify('You are saving but you must specify at least TWO branches for branching to be of any use!', 3);
		}
		
		/* validate that all of the choices were used */
		if(this.getUnusedChoices().length > 0){
			this.view.notificationManager.notify('Not all of the Answers have been associated with a branch. This will cause problems if a student selects it!', 3);
		}
		
		/* validate that at least on activity/step is associated with each branch */
		for(var h=0;h<this.content.branches.length;h++){
			if(this.content.branches[h].branchIds.length==0){
				this.view.notificationManager.notify('You have specified a branch that contains no activities or steps, you should consider removing this branch or associating activities or steps to it!', 3);
			}
		}
	}
};

/**
 * Updates the displayNothingAfterAnsweredCorrectly field which specifies
 * whether to display anything after the student answers correctly and
 * comes back to the step.
 */
View.prototype.MultipleChoiceNode.mcHideQuestionAndAnswersAfterAnsweredCorrectlyChanged = function() {
	var value = false;
	
	//get the checkbox value
	var checked = $('#hideQuestionAndAnswersAfterAnsweredCorrectlyCheckBox').attr('checked');
	
	if(checked == 'checked') {
		//checkbox was checked
		value = true;
	}
	
	//update the value in the content
	this.content.hideQuestionAndAnswersAfterAnsweredCorrectly = value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/multiplechoice/authorview_multiplechoice.js');
};