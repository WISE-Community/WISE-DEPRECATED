/**
 * Sets the OpenResponseNode type as an object of this view
 * @constructor
 * @author patrick lawler
 */
View.prototype.OpenResponseNode = {};
View.prototype.OpenResponseNode.commonComponents = ['StudentResponseBoxSize', 'RichTextEditorToggle', 'StarterSentenceAuthoring', 'Prompt', 'LinkTo', 'CRater'];

/**
 * Generates the authoring page for open response node types
 */
View.prototype.OpenResponseNode.generatePage = function(view){
	this.view = view;
	this.content = this.view.activeContent.getContentJSON();
	
	var parent = document.getElementById('dynamicParent');
	
	//wipe out old
	parent.removeChild(document.getElementById('dynamicPage'));
	
	//create new
	var pageDiv = createElement(document, 'div', {id:'dynamicPage', style:'width:100%;height:100%'});
	var promptText = document.createTextNode("Question for Student:");
	var linesText = document.createTextNode("Size of Student Response Box (# rows):");
	var richTextEditorText = document.createTextNode("Use Rich Text Editor");
	
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(document.createTextNode("Open Response Options:"));
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createElement(document, 'div', {id: 'openresponseOptionsContainer'}));
	pageDiv.appendChild(createBreak());
	
	if(this.content.type != 'Note') {
		/*
		 * add the checkbox for showing the previous work that has an annotation.
		 * this is not available for note steps.
		 */
		pageDiv.appendChild(document.createTextNode("Show previous work that has annotation "));
		var showPreviousWorkThatHasAnnotation = createElement(document, 'input', {id: 'showPreviousWorkThatHasAnnotation', type: 'checkbox', onclick: 'eventManager.fire("openResponseUpdateShowPreviousWorkThatHasAnnotation")'});
		pageDiv.appendChild(showPreviousWorkThatHasAnnotation);
		showPreviousWorkThatHasAnnotation.checked = this.content.showPreviousWorkThatHasAnnotation;
		pageDiv.appendChild(createBreak());
	}

	pageDiv.appendChild(createElement(document, 'div', {id: 'studentResponseBoxSizeContainer'}));
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createElement(document, 'div', {id: 'richTextEditorToggleContainer'}));
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createElement(document, 'div', {id: 'starterSentenceAuthoringContainer'}));
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());

	//display any additional text entry areas for peer/teacher review if necessary
	if(this.view.activeNode.peerReview) {
		pageDiv.appendChild(this.generatePeerReview(this.view.activeNode.peerReview));
		pageDiv.appendChild(createBreak());
		pageDiv.appendChild(createBreak());		
	} else if(this.view.activeNode.teacherReview) {
		pageDiv.appendChild(this.generateTeacherReview(this.view.activeNode.teacherReview));
		pageDiv.appendChild(createBreak());
		pageDiv.appendChild(createBreak());
	}
	
	pageDiv.appendChild(promptText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createElement(document, 'div', {id: 'promptContainer'}));
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createElement(document, 'div', {id: 'cRaterContainer'}));
	
	parent.appendChild(pageDiv);
	this.generateOptions();
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 */
View.prototype.OpenResponseNode.getCommonComponents = function() {
	return this.commonComponents;
};

/**
 * Generates the options for an assessment list node
 */
View.prototype.OpenResponseNode.generateOptions = function(){
	var optionsHtml = '<table id="openresponseOptionsTable"><thead><tr><td>Display Answer After Submit</td><td>Lock After Submit</td><td>Complete All Before Exit</td></tr></thead>' + 
		'<tbody><tr><td><label for="displayRadioYes"><input type="radio" name="displayRadio" id="displayRadioYes" value="true" onclick="eventManager.fire(\'openresponseOptionChanged\',\'display\')"/>Yes</label></br>' +
		'<label for="displayRadioNo"><input type="radio" name="displayRadio" id="displayRadioNod" value="false" onclick="eventManager.fire(\'openresponseOptionChanged\',\'display\')"/>No</label></td>' +
		'<td><label for="lockRadioYes"><input type="radio" name="lockRadio" id="lockRadioYes" value="true" onclick="eventManager.fire(\'openresponseOptionChanged\',\'lock\')"/>Yes</label></br>' +
		'<label for="lockRadioNo"><input type="radio" name="lockRadio" id="lockRadioNo" value="false" onclick="eventManager.fire(\'openresponseOptionChanged\',\'lock\')"/>No</label></td>' +
		'<td><label for="completeRadioYes"><input type="radio" name="completeRadio" id="completeRadioYes" value="true" onclick="eventManager.fire(\'openresponseOptionChanged\',\'complete\')"/>Yes</label></br>' +
		'<label for="completeRadioNo"><input type="radio" name="completeRadio" id="completeRadioNo" value="false" onclick="eventManager.fire(\'openresponseOptionChanged\',\'complete\')"/>No</label></td></tr></tbody></table>';
	
	$('#openresponseOptionsContainer').append(optionsHtml);

	$('input[name=displayRadio]').filter('[value=' + this.content.displayAnswerAfterSubmit + ']').attr('checked', true);
	$('input[name=lockRadio]').filter('[value=' + this.content.isLockAfterSubmit + ']').attr('checked', true);
	$('input[name=completeRadio]').filter('[value=' + this.content.isMustCompleteAllPartsBeforeExit + ']').attr('checked', true);
};

/**
 * Given the option type, updates the corresponding option in the content
 * with the user specified value.
 * 
 * @param String - type
 */
View.prototype.OpenResponseNode.optionChanged = function(type){
	var val = $('input[name=' + type + 'Radio]:checked').val();
	val = (val==="true") ? true : false;
	
	if(type=='display'){
		this.content.displayAnswerAfterSubmit = val;
	} else if(type=='lock'){
		this.content.isLockAfterSubmit = val;
	} else if(type=='complete'){
		this.content.isMustCompleteAllPartsBeforeExit = val;
	}
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};


/**
 * Generates and returns the lines element for the html
 * and set the value from the content.
 */
View.prototype.OpenResponseNode.generateLines = function(){
	return createElement(document, 'input', {type: 'text', id: 'linesInput', value: this.content.assessmentItem.interaction.expectedLines, onkeyup: 'eventManager.fire("openResponseLinesChanged")'});
};


/**
 * Generates the starter sentence input options for this open response
 */
View.prototype.OpenResponseNode.generateStarter = function(){
	//create div for starterSentence options
	var starterDiv = createElement(document, 'div', {id: 'starterDiv'});
	
	//create starter sentence options
	var noStarterInput = createElement(document, 'input', {type: 'radio', name: 'starterRadio', onclick: 'eventManager.fire("openResponseStarterOptionChanged")', value: '0'});
	var starterOnClickInput = createElement(document, 'input', {type: 'radio', name: 'starterRadio', onclick: 'eventManager.fire("openResponseStarterOptionChanged")', value: '1'});
	var starterImmediatelyInput = createElement(document, 'input', {type: 'radio', name: 'starterRadio', onclick: 'eventManager.fire("openResponseStarterOptionChanged")', value: '2'});
	var starterSentenceInput = createElement(document, 'textarea', {id: 'starterSentenceInput', cols: '60', rows: '4', wrap: 'soft', onchange: 'eventManager.fire("openResponseStarterSentenceUpdated")'});
	var noStarterInputText = document.createTextNode('Do not use starter sentence');
	var starterOnClickInputText = document.createTextNode('Starter sentence available upon request');
	var starterImmediatelyInputText = document.createTextNode('Starter sentence shows immediately');
	var starterSentenceText = document.createTextNode('Starter sentence: ');
	
	starterDiv.appendChild(noStarterInput);
	starterDiv.appendChild(noStarterInputText);
	starterDiv.appendChild(createBreak());
	starterDiv.appendChild(starterOnClickInput);
	starterDiv.appendChild(starterOnClickInputText);
	starterDiv.appendChild(createBreak());
	starterDiv.appendChild(starterImmediatelyInput);
	starterDiv.appendChild(starterImmediatelyInputText);
	starterDiv.appendChild(createBreak());
	starterDiv.appendChild(starterSentenceText);
	starterDiv.appendChild(starterSentenceInput);
	
	//set value of textarea
	starterSentenceInput.value = this.content.starterSentence.sentence;
	
	//set appropriate radio button and enable/disable textarea
	var displayOption = this.content.starterSentence.display;
	
	if(displayOption=='0'){
		starterSentenceInput.disabled = true;
		noStarterInput.checked = true;
	} else if(displayOption=='1'){
		starterOnClickInput.checked = true;
	} else if(displayOption=='2'){
		starterImmediatelyInput.checked = true;
	};
	
	return starterDiv;
};

/**
 * Create a div the will display text areas for peer review attributes if necessary
 */
View.prototype.OpenResponseNode.generatePeerReview = function(peerReviewType) {
	var peerReviewDiv = createElement(document, 'div', {id: 'peerReviewDiv'});
	
	if(peerReviewType == 'start') {
		//do nothing
	} else if(peerReviewType == 'annotate') {
		//create the label and text area for the percentage trigger
		var peerReviewPercentageTriggerText = document.createTextNode('Enter the percentage of the class needed to open this step: ');
		var peerReviewPercentageTrigger = createElement(document, 'input', {type: 'text', id: 'peerReviewOpenPercentageTriggerInput', value: this.content.openPercentageTrigger, onkeyup: 'eventManager.fire("openResponsePeerReviewPercentageTriggerUpdated")'});

		//add the label and text area to the div that we will return
		peerReviewDiv.appendChild(peerReviewPercentageTriggerText);
		peerReviewDiv.appendChild(peerReviewPercentageTrigger);
		peerReviewDiv.appendChild(createBreak());
		
		//create the label and text area for the number trigger
		var peerReviewNumberTriggerText = document.createTextNode('Enter the number of students in the class needed to open this step: ');
		var peerReviewNumberTrigger = createElement(document, 'input', {type: 'text', id: 'peerReviewOpenNumberTriggerInput', value: this.content.openNumberTrigger, onkeyup: 'eventManager.fire("openResponsePeerReviewNumberTriggerUpdated")'});

		//add the label and text area to the div that we will return
		peerReviewDiv.appendChild(peerReviewNumberTriggerText);
		peerReviewDiv.appendChild(peerReviewNumberTrigger);
		peerReviewDiv.appendChild(createBreak());
		
		//create label and text area for the authored work
		var peerReviewAuthoredWorkText = document.createTextNode('Enter the canned work: ');
		var peerReviewAuthoredWorkInput = createElement(document, 'textarea', {id: 'peerReviewAuthoredWorkInput', cols: '60', rows: '4', wrap: 'soft', onchange: 'eventManager.fire("openResponsePeerReviewAuthoredWorkUpdated")'});
		
		//add the label and text area to the div that we will return
		peerReviewDiv.appendChild(peerReviewAuthoredWorkText);
		peerReviewDiv.appendChild(peerReviewAuthoredWorkInput);
		
		//set any previously set values for the authoredWork
		peerReviewAuthoredWorkInput.value = this.content.authoredWork;
		
		peerReviewDiv.appendChild(createBreak());
		peerReviewDiv.appendChild(createBreak());
		
		//create label and text area for the step not open custom message
		var peerReviewStepNotOpenCustomMessageText = document.createTextNode('Enter the step not open custom message: ');
		var peerReviewStepNotOpenCustomMessageInput = createElement(document, 'textarea', {id: 'peerReviewStepNotOpenCustomMessageInput', cols: '60', rows: '4', wrap: 'soft', onchange: 'eventManager.fire("openResponsePeerReviewStepNotOpenCustomMessageUpdated")'});
		var peerReviewStepNotOpenCustomMessageNoteText = document.createTextNode('(note: if you delete everything in the textarea, it will re-populate with the default message. also, associatedStartNode.title will be replaced with the title of the first node in the review sequence when this is displayed to the student.)');
		
		//add the label and text area to the div
		peerReviewDiv.appendChild(peerReviewStepNotOpenCustomMessageText);
		peerReviewDiv.appendChild(peerReviewStepNotOpenCustomMessageInput);
		peerReviewDiv.appendChild(createBreak());
		peerReviewDiv.appendChild(peerReviewStepNotOpenCustomMessageNoteText);
		
		//set any previously set values for the step not open custom message
		peerReviewStepNotOpenCustomMessageInput.value = this.content.stepNotOpenCustomMessage;
		
		peerReviewDiv.appendChild(createBreak());
	} else if(peerReviewType == 'revise') {
		//create label and text area
		var peerReviewAuthoredReviewText = document.createTextNode('Enter the canned review: ');
		var peerReviewAuthoredReviewInput = createElement(document, 'textarea', {id: 'peerReviewAuthoredReviewInput', cols: '60', rows: '4', wrap: 'soft', onchange: 'eventManager.fire("openResponsePeerReviewAuthoredReviewUpdated")'});
		
		//add the label and text area to the div that we will return
		peerReviewDiv.appendChild(peerReviewAuthoredReviewText);
		peerReviewDiv.appendChild(peerReviewAuthoredReviewInput);
		
		//set any previously set values for the authoredWork
		peerReviewAuthoredReviewInput.value = this.content.authoredReview;
		
		peerReviewDiv.appendChild(createBreak());
		peerReviewDiv.appendChild(createBreak());
		
		//create label and text area for the step not open custom message
		var peerReviewStepNotOpenCustomMessageText = document.createTextNode('Enter the step not open custom message: ');
		var peerReviewStepNotOpenCustomMessageInput = createElement(document, 'textarea', {id: 'peerReviewStepNotOpenCustomMessageInput', cols: '60', rows: '4', wrap: 'soft', onchange: 'eventManager.fire("openResponsePeerReviewStepNotOpenCustomMessageUpdated")'});
		var peerReviewStepNotOpenCustomMessageNoteText = document.createTextNode('(note: if you delete everything in the textarea, it will re-populate with the default message. also, associatedStartNode.title will be replaced with the title of the first node in the review sequence and associatedAnnotateNode.title will be replaced with the title of the second node in the review sequence when this is displayed to the student.)');
		
		//add the label and text area to the div
		peerReviewDiv.appendChild(peerReviewStepNotOpenCustomMessageText);
		peerReviewDiv.appendChild(peerReviewStepNotOpenCustomMessageInput);
		peerReviewDiv.appendChild(createBreak());
		peerReviewDiv.appendChild(peerReviewStepNotOpenCustomMessageNoteText);
		
		//set any previously set values for the step not open custom message
		peerReviewStepNotOpenCustomMessageInput.value = this.content.stepNotOpenCustomMessage;
		
		peerReviewDiv.appendChild(createBreak());
	}
	
	return peerReviewDiv;
};

/**
 * Create a div the will display text areas for teacher review attributes if necessary
 */
View.prototype.OpenResponseNode.generateTeacherReview = function(peerReviewType) {
	var peerReviewDiv = createElement(document, 'div', {id: 'peerReviewDiv'});
	
	if(peerReviewType == 'start') {
		//do nothing
	} else if(peerReviewType == 'annotate') {
		//create label and text area
		var peerReviewAuthoredWorkText = document.createTextNode('Enter the canned work: ');
		var peerReviewAuthoredWorkInput = createElement(document, 'textarea', {id: 'peerReviewAuthoredWorkInput', cols: '60', rows: '4', wrap: 'soft', onchange: 'eventManager.fire("openResponsePeerReviewAuthoredWorkUpdated")'});
		
		//add the label and text area to the div that we will return
		peerReviewDiv.appendChild(peerReviewAuthoredWorkText);
		peerReviewDiv.appendChild(peerReviewAuthoredWorkInput);
		
		//set any previously set values for the authoredWork
		peerReviewAuthoredWorkInput.value = this.content.authoredWork;
	} else if(peerReviewType == 'revise') {
		//do nothing
	}
	
	return peerReviewDiv;
};

/**
 * Updates this content when the starter sentence option has changed.
 */
View.prototype.OpenResponseNode.starterChanged = function(){
	var options = document.getElementsByName('starterRadio');
	var optionVal;
	
	/* get the checked option and update the content's starter sentence attribute */
	for(var q=0;q<options.length;q++){
		if(options[q].checked){
			this.content.starterSentence.display = options[q].value;
			if(options[q].value=='0'){
				document.getElementById('starterSentenceInput').disabled = true;
			} else {
				document.getElementById('starterSentenceInput').disabled = false;
			};
		};
	};
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates content with text in starter sentence textarea
 */
View.prototype.OpenResponseNode.starterUpdated = function(){
	/* update content */
	this.content.starterSentence.sentence = document.getElementById('starterSentenceInput').value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Generates and returns an HTML Input Element of type checkbox 
 * used to determine whether a rich text editor should be used.
 */
View.prototype.OpenResponseNode.generateRichText = function(){
	var richTextChoice = createElement(document, 'input', {id: 'richTextChoice', type: 'checkbox', onclick: 'eventManager.fire("openResponseUpdateRichText")'});
	
	/* set whether this input is checked */
	richTextChoice.checked = this.content.isRichTextEditorAllowed;
	
	//disable the checkbox if the step is for a peer/teacher review sequence
	if(this.view.activeNode.peerReview || this.view.activeNode.teacherReview) {
		richTextChoice.disabled = true;
	}
	
	return richTextChoice;
};

/**
 * Updates the richtext option in the content and updates the preview page.
 */
View.prototype.OpenResponseNode.updateRichText = function(){
	this.content.isRichTextEditorAllowed = document.getElementById('richTextChoice').checked;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 */
View.prototype.OpenResponseNode.updateContent = function(){
	/* update content object */
	this.view.activeContent.setContent(this.content);
};

/**
 * Updates the content with the value from the textarea
 */
View.prototype.OpenResponseNode.peerReviewAuthoredWorkUpdated = function(){
	this.content.authoredWork = document.getElementById('peerReviewAuthoredWorkInput').value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the content with the value from the text input
 */
View.prototype.OpenResponseNode.peerReviewPercentageTriggerUpdated = function(){
	this.content.openPercentageTrigger = document.getElementById('peerReviewOpenPercentageTriggerInput').value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the content with the value from the text input
 */
View.prototype.OpenResponseNode.peerReviewNumberTriggerUpdated = function(){
	this.content.openNumberTrigger = document.getElementById('peerReviewOpenNumberTriggerInput').value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the content with the value from the textarea
 */
View.prototype.OpenResponseNode.peerReviewAuthoredReviewUpdated = function(){
	this.content.authoredReview = document.getElementById('peerReviewAuthoredReviewInput').value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

View.prototype.OpenResponseNode.populatePrompt = function() {
	$('#promptInput').val(this.content.assessmentItem.interaction.prompt);
};

/**
 * Updates the content's prompt to match that of what the user input
 */
View.prototype.OpenResponseNode.updatePrompt = function(){
	/* update content */
	var content = '';
	if(typeof tinymce != 'undefined' && $('#promptInput').tinymce()){
		content = $('#promptInput').tinymce().getContent();
	} else {
		content = $('#promptInput').val();
	}
	
	this.content.assessmentItem.interaction.prompt = content;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

View.prototype.OpenResponseNode.populateStudentResponseBoxSize = function() {
	$('#studentResponseBoxSizeInput').val(this.content.assessmentItem.interaction.expectedLines);
};

/**
 * Updates the number of line elements for this open response to that
 * input by the user.
 */
View.prototype.OpenResponseNode.updateStudentResponseBoxSize = function(){
	/* update content */
	this.content.assessmentItem.interaction.expectedLines = document.getElementById('studentResponseBoxSizeInput').value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

View.prototype.OpenResponseNode.populateRichTextEditorToggle = function() {
	$('#richTextEditorToggleInput').attr('checked', this.content.isRichTextEditorAllowed);
};

View.prototype.OpenResponseNode.updateRichTextEditorToggle = function(){
	/* update content */
	this.content.isRichTextEditorAllowed = document.getElementById('richTextEditorToggleInput').checked;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

View.prototype.OpenResponseNode.populateStarterSentenceAuthoring = function() {
	var displayOption = this.content.starterSentence.display;
	
	$('input[name=starterRadio]').each(function() {
		if($(this).val() == displayOption) {
			$(this).attr('checked', true);
		}
	});
	
	if(displayOption == 2) {
		$('#starterSentenceAuthoringInput').val(this.content.starterSentence.sentence);		
	}
};

View.prototype.OpenResponseNode.updateStarterSentenceAuthoring = function(){
	/* update content */
	this.content.starterSentence.display = $('input[name=starterRadio]:checked').val();
	
	this.content.starterSentence.sentence = $('#starterSentenceAuthoringInput').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the content with the value from the text input
 */
View.prototype.OpenResponseNode.peerReviewStepNotOpenCustomMessageUpdated = function(){
	var customMessage = $('#peerReviewStepNotOpenCustomMessageInput').val();
	
	if(customMessage == "") {
		//custom message field is empty so we will re-populate it with the default message
		customMessage = '<p>This step is not available yet.</p><p>Your response in step <b>"associatedStartNode.title"</b> has not been reviewed by a peer yet.</p><p>More of your peers need to submit a response for step <b>"associatedAnnotateNode.title"</b>.</p><p>Please return to this step in a few minutes.</p>';
		$('#peerReviewStepNotOpenCustomMessageInput').val(customMessage);
	}
	
	this.content.stepNotOpenCustomMessage = customMessage;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Populate the CRater item id from the content
 */
View.prototype.OpenResponseNode.populateCRater = function() {
	if(this.content.cRater != null) {
		//show the CRater item id div and the CRater settings div
		$('#cRaterSettingsDiv').show();
		
		if(this.content.cRater.cRaterItemId != null) {
			$('#enableCRaterCheckbox').attr('checked', true);
			
			//populate the item id
			$('#cRaterItemIdInput').val(this.content.cRater.cRaterItemId);
		}
		
		if (this.content.cRater.cRaterItemType == null) {
			// if cRater type is not set, assume it's CRater (version 1)
			this.content.cRater.cRaterItemType = "CRATER";
		}
		
		if (this.content.cRater.cRaterItemType == "CRATER") {
			$("#cRaterItemTypeCRATER").attr('checked', true);			
		} else if (this.content.cRater.cRaterItemType == "HENRY") {
			$("#cRaterItemTypeHENRY").attr('checked', true);
		}
		
		if(this.content.cRater.displayCRaterScoreToStudent != null) {
			//populate the display score to student checkbox
			$('#cRaterDisplayScoreToStudent').attr('checked', this.content.cRater.displayCRaterScoreToStudent);
		}
		
		if(this.content.cRater.displayCRaterFeedbackToStudent != null) {
			//populate the display feedback to student checkbox
			$('#cRaterDisplayFeedbackToStudent').attr('checked', this.content.cRater.displayCRaterFeedbackToStudent);
		}
		
		if(this.content.cRater.mustSubmitAndReviseBeforeExit != null) {
			//populate the must submit and revise before exit checkbox
			$('#cRaterMustSubmitAndReviseBeforeExit').attr('checked', this.content.cRater.mustSubmitAndReviseBeforeExit);
		}
		
		if(this.content.cRater.maxCheckAnswers != null) {
			//populate the max check answers text input
			$('#cRaterMaxCheckAnswers').val(this.content.cRater.maxCheckAnswers);
		}
		
		if(this.content.cRater.cRaterScoringRules != null) {
			//populate the feedback
			this.displayCRaterFeedback(this.content.cRater.cRaterScoringRules);
		}
	}
};

/**
 * Updates the CRater item id to match what the user has input
 */
View.prototype.OpenResponseNode.updateCRater = function(){
	//create the cRater object in the content if it does not exist
	if(this.content.cRater == null) {
		this.content.cRater = {};
	}
	
	//get the item id the user has entered
	var itemId = $('#cRaterItemIdInput').val();

	var cRaterItemType = this.content.cRater.cRaterItemType;
	
	//make a verify request to the CRater server with the item id the user has entered
	this.view.makeCRaterVerifyRequest(itemId,cRaterItemType);
	
	//obtain the CRater server response from our request
	var responseText = this.view.cRaterResponseText;
	
	//check if the item id is valid
	var isCRaterItemIdValid = this.view.checkCRaterVerifyResponse(responseText);
	
	var updateCRater = false;
	var maxScore = null;
	var cRaterScoringRules = null;
	
	if(isCRaterItemIdValid) {
		//create the cRater.cRaterItemId in the content if it does not exist
		if(this.content.cRater.cRaterItemId == null) {
			this.content.cRater.cRaterItemId = '';
		}
		
		//create the cRater.displayCRaterScoreToStudent in the content if it does not exist
		if(this.content.cRater.displayCRaterScoreToStudent == null) {
			this.content.cRater.displayCRaterScoreToStudent = false;
		}
		
		//create the cRater.displayCRaterFeedbackToStudent in the content if it does not exist
		if(this.content.cRater.displayCRaterFeedbackToStudent == null) {
			this.content.cRater.displayCRaterFeedbackToStudent = false;
		}
		
		//create the cRater.cRaterMaxScore in the content if it does not exist
		if(this.content.cRater.cRaterMaxScore == null) {
			this.content.cRater.cRaterMaxScore = null;
		}
		
		//item id is valid so we will display a green valid message to the author
		$('#cRaterItemIdStatus').html('<font color="green">Valid Item Id</font>');
		
		//obtain the max score from the response
		maxScore = this.view.getCRaterMaxScoreFromXML(responseText);
		
		// obtain the cRaterScoringResults from the response as JSON
		cRaterScoringRules = this.view.getCRaterScoringRulesFromXML(responseText);
		
		//re-use the old feedback to re-populate the feedback for the new scoring rules
		this.transferFeedback(this.content.cRater.cRaterScoringRules, cRaterScoringRules);
		
		//display the feedback UI
		this.displayCRaterFeedback(cRaterScoringRules);
		
		//set the CRater settings into the content
		this.content.cRater.cRaterItemId = itemId;
		this.content.cRater.cRaterMaxScore = maxScore;
		this.content.cRater.cRaterScoringRules = cRaterScoringRules;
	} else {
		//item id is invalid so we will display a red invalid message to the author
		$('#cRaterItemIdStatus').html('<font color="red">Invalid Item Id</font>');
		
		//the item id is invalid so we will ask them if they want to save it
		var answer = confirm('The CRater Item Id is invalid, are you sure you want to keep it?');
		
		if(answer) {
			//the author wants to save the invalid item id
			
			//update the CRater feedback
			this.displayCRaterFeedback(cRaterScoringRules);
			
			//set the CRater item id into the content
			this.content.cRater.cRaterItemId = itemId;
		} else {
			//the author does not want to save the invalid item id so we will revert the item id to the previous value
			
			//set the previous item id back into the text input
			$('#cRaterItemIdInput').val(this.content.cRater.cRaterItemId);
			
			//item id is invalid so we will display a red invalid message to the author
			$('#cRaterItemIdStatus').html('');
		}
	}
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * 
 */
View.prototype.OpenResponseNode.cRaterItemTypeChangedListener = function(cRaterItemType) {
	this.content.cRater.cRaterItemType = cRaterItemType;

	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * 
 */
View.prototype.OpenResponseNode.cRaterItemIdChanged = function() {
	$('#cRaterItemIdStatus').html('<font color="blue">Click Verify to Check Item Id</font>');
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the display score to student value
 */
View.prototype.OpenResponseNode.updateCRaterDisplayScoreToStudent = function() {
	var value = false;
	
	//get the 'checked' attribute which will either be null or the string 'checked'
	var checked = $('#cRaterDisplayScoreToStudent').attr('checked');
	
	if(checked == 'checked') {
		//checkbox was checked
		value = true;
	}
	
	//update the value in the content
	this.content.cRater.displayCRaterScoreToStudent = value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the display feedback to student value
 */
View.prototype.OpenResponseNode.updateCRaterDisplayFeedbackToStudent = function() {
	var value = false;
	
	//get the 'checked' attribute which will either be null or the string 'checked'
	var checked = $('#cRaterDisplayFeedbackToStudent').attr('checked');
	
	if(checked == 'checked') {
		//checkbox was checked
		value = true;
	}
	
	//update the value in the content
	this.content.cRater.displayCRaterFeedbackToStudent = value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the must submit and revise before exit value
 */
View.prototype.OpenResponseNode.updateCRaterMustSubmitAndReviseBeforeExit = function() {
	var value = false;
	
	//get the 'checked' attribute which will either be null or the string 'checked'
	var checked = $('#cRaterMustSubmitAndReviseBeforeExit').attr('checked');
	
	if(checked == 'checked') {
		//checkbox was checked
		value = true;
	}
	
	//update the value in the content
	this.content.cRater.mustSubmitAndReviseBeforeExit = value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Transfer the old feedback from the old scoring rules to the new scoring rules.
 * We do this because we don't want the author to accidentally lose all
 * their feedback if they accidentally click on the 'Verify' button again.
 */
View.prototype.OpenResponseNode.transferFeedback = function(oldCRaterScoringRules, newCRaterScoringRules) {
	
	if(oldCRaterScoringRules != null && newCRaterScoringRules != null) {
		//loop through all the old scoring rules
		for(var x=0; x<oldCRaterScoringRules.length; x++) {
			//get the old scoring rule
			var oldCRaterScoringRule = oldCRaterScoringRules[x];
			
			//get the new scoring rule
			var newCRaterScoringRule = newCRaterScoringRules[x];
			
			if(oldCRaterScoringRule != null && newCRaterScoringRule != null) {
				//set the old feedback into the new scoring rule
				var oldFeedback = oldCRaterScoringRule.feedback;
				newCRaterScoringRule.feedback = oldFeedback;
			}
		}
	}
};

/**
 * Display the CRater feedback authoring UI
 * @param cRaterScoringRules an array of scoring rule objects
 */
View.prototype.OpenResponseNode.displayCRaterFeedback = function(cRaterScoringRules) {
	var cRaterFeedbackHtml = '';
	
	if(cRaterScoringRules != null) {
		
		//loop through all the scoring rules
		for(var x=0; x<cRaterScoringRules.length; x++) {
			//get a scoring rul
			var cRaterScoringRule = cRaterScoringRules[x];
			
			//get the fields in the scoring rule
			var concepts = cRaterScoringRule.concepts;
			var numMatches = cRaterScoringRule.numMatches;
			var rank = cRaterScoringRule.rank;
			var score = cRaterScoringRule.score;
			var feedback = cRaterScoringRule.feedback;
			var studentAction = cRaterScoringRule.studentAction;
			
			//display all the fields in the scoring rule
			cRaterFeedbackHtml += "Concepts: " + concepts + ", ";
			cRaterFeedbackHtml += "Num Matches: " + numMatches + ", ";
			cRaterFeedbackHtml += "Rank: " + rank + ", ";
			cRaterFeedbackHtml += "Score: " + score + "<br>";
			
			if(feedback == null) {
				
			} else if(feedback.constructor.toString().indexOf("String") != -1) {
				//the feedback is a string
				
				//make the feedback field into an authorable text input
				cRaterFeedbackHtml += "Feedback: <input id='cRaterFeedback_" + x + "_0' type='text' value='" + feedback + "' size='50' onchange='eventManager.fire(\"cRaterFeedbackChanged\", [" + x + ", " + y + "])'/>";
				
				//add the button to remove the feedback
				cRaterFeedbackHtml += "<input id='' type='button' value='Remove' onclick='eventManager.fire(\"cRaterRemoveFeedback\", [" + x + ", " + y + "])'>";
				cRaterFeedbackHtml += "<br>";
			} else if(feedback.constructor.toString().indexOf("Array") != -1) {
				//the feedback is an array
				
				if(feedback.length > 0) {
					//loop through the elements in the array
					for(var y=0; y<feedback.length; y++) {
						//get a feedback string
						var feedbackObject = feedback[y];
						
						if(feedbackObject != null) {
							var feedbackText = feedbackObject.feedbackText;
							
							if(feedbackText == null) {
								feedbackText = "";
							}
							
							//make the feedback field into an authorable text input
							cRaterFeedbackHtml += "Feedback: <input id='cRaterFeedback_" + x + "_" + y + "' type='text' value='" + feedbackText + "' size='50' onchange='eventManager.fire(\"cRaterFeedbackChanged\", [" + x + ", " + y + "])'/>";
							
							//add the button to remove the feedback
							cRaterFeedbackHtml += "<input id='' type='button' value='Remove' onclick='eventManager.fire(\"cRaterRemoveFeedback\", [" + x + ", " + y + "])'>";
							
							cRaterFeedbackHtml += "<br>";
						}
					}
				}
			}
			
			//add the button to add feedback
			cRaterFeedbackHtml += "<input id='cRaterAddFeedbackButton_" + x + "' type='button' value='Add Feedback' onclick='eventManager.fire(\"cRaterAddFeedback\", " + x + ")'>";
			
			cRaterFeedbackHtml += "<br>";
			cRaterFeedbackHtml += "<br>";
			
			//the label for the student action radio buttons
			cRaterFeedbackHtml += "Student Action:";
			
			cRaterFeedbackHtml += "<br>";
			
			//add the revise radio button
			if(studentAction == 'revise') {
				cRaterFeedbackHtml += "<input id='' type='radio' name='studentAction_" + x + "' value='revise' onclick='eventManager.fire(\"cRaterStudentActionUpdated\", [" + x + ", \"revise\"])' checked='checked'>Revise";
			} else {
				cRaterFeedbackHtml += "<input id='' type='radio' name='studentAction_" + x + "' value='revise' onclick='eventManager.fire(\"cRaterStudentActionUpdated\", [" + x + ", \"revise\"])'>Revise";
			}
			
			cRaterFeedbackHtml += "<br>";
			
			//add the rewrite radio button
			if(studentAction == 'rewrite') {
				cRaterFeedbackHtml += "<input id='' type='radio' name='studentAction_" + x + "' value='rewrite' onclick='eventManager.fire(\"cRaterStudentActionUpdated\", [" + x + ", \"rewrite\"])' checked='checked'>Rewrite";	
			} else {
				cRaterFeedbackHtml += "<input id='' type='radio' name='studentAction_" + x + "' value='rewrite' onclick='eventManager.fire(\"cRaterStudentActionUpdated\", [" + x + ", \"rewrite\"])'>Rewrite";
			}
			
			cRaterFeedbackHtml += "<br>";
			cRaterFeedbackHtml += "<br>";
		}
	}
	
	$('#cRaterFeedback').html(cRaterFeedbackHtml);
};

/**
 * Update the CRater feedback for a specific scoring rule
 * @params args an array whose first element is the index of the scoring rule
 */
View.prototype.OpenResponseNode.updateCRaterFeedback = function(args) {
	//get the scoring rule index
	var x = args[0];
	var y = args[1];
	
	if(x == null) {
		//default to 0
		x = 0;
	}
	
	if(y == null) {
		//default to 0
		y = 0;
	}
	
	//get the feedback input
	var feedbackInput = $('#cRaterFeedback_' + x + '_' + y);
	
	if(feedbackInput != null) {
		//get the feedback text
		var feedbackText = feedbackInput.val();
		
		if(this.content.cRater.cRaterScoringRules != null) {
			if(this.content.cRater.cRaterScoringRules[x] != null) {
				
				//get the feedback from the scoring rule
				var feedbackObject = this.content.cRater.cRaterScoringRules[x].feedback;
				
				if(feedbackObject != null) {
					if(feedbackObject.constructor.toString().indexOf("String") != -1) {
						/*
						 * feedback is a string so we will convert it to an array.
						 * we used to store feedback as just a string but have switched
						 * to an array so that authors can specify multiple feedback
						 * for a single scoring rule.
						 */
						this.content.cRater.cRaterScoringRules[x].feedback = [];
					}
					
					if(this.content.cRater.cRaterScoringRules[x].feedback[y] == null) {
						//create the feedback text object
						this.content.cRater.cRaterScoringRules[x].feedback[y] = this.view.createCRaterFeedbackTextObject(feedbackText);
					} else {
						//update the feedback
						this.content.cRater.cRaterScoringRules[x].feedback[y].feedbackText = feedbackText;
					}
				}
			}
		}		
	}
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Add a feedback to the content and update the authoring UI
 * @param args an array whose first element is the scoring rule index
 */
View.prototype.OpenResponseNode.cRaterAddFeedback = function(args) {
	//get the scoring rule index we are going to add feedback to
	var x = args[0];
	
	//get all the scoring rules
	var cRaterScoringRules = this.content.cRater.cRaterScoringRules;
	
	if(cRaterScoringRules != null && cRaterScoringRules.length > x) {
		//get the scoring rule
		var cRaterScoringRule = cRaterScoringRules[x];
		
		if(cRaterScoringRule != null) {
			//get the current scoring rule feedback
			var feedback = cRaterScoringRule.feedback;
			
			if(feedback == null) {
				//feedback is null
				
				//make the feedback an array
				cRaterScoringRule.feedback = [];
				
				//add an empty string which will be the new feedback
				cRaterScoringRule.feedback.push(this.view.createCRaterFeedbackTextObject());
			} else if(feedback.constructor.toString().indexOf("String") != -1) {
				//feedback is a string
				
				//make the feedback an array
				cRaterScoringRule.feedback = [];
				
				//push the existing feedback into the array
				cRaterScoringRule.feedback.push(this.view.createCRaterFeedbackTextObject(feedback));
				
				//add an empty string which will be the new feedback
				cRaterScoringRule.feedback.push(this.view.createCRaterFeedbackTextObject());
			} else if(feedback.constructor.toString().indexOf("Array") != -1) {
				//feedback is an array
				
				//add an empty string which will be the new feedback
				cRaterScoringRule.feedback.push(this.view.createCRaterFeedbackTextObject());
			}
		}
	}
	
	//update the CRater authoring UI
	this.displayCRaterFeedback(cRaterScoringRules);
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Remove a feedback from the content and update the authoring UI
 * @param args an array whose first element is the scoring rule index and
 * whose second element is the index of the feedback within the scoring rule
 */
View.prototype.OpenResponseNode.cRaterRemoveFeedback = function(args) {
	//get the scoring rule index we are going to remove feedback from
	var x = args[0];
	
	//get the index of the feedback within the scoring rule
	var y = args[1];
	
	//get the scoring rules
	var cRaterScoringRules = this.content.cRater.cRaterScoringRules;
	
	if(cRaterScoringRules != null && cRaterScoringRules.length > x) {
		//get the scoring rule
		var cRaterScoringRule = cRaterScoringRules[x];
		
		if(cRaterScoringRule != null) {
			//get the feedback
			var feedback = cRaterScoringRule.feedback;
			
			if(feedback == null) {
				//feedback is null
				
				//make the feedback into an array
				cRaterScoringRule.feedback = [];
			} else if(feedback.constructor.toString().indexOf("String") != -1) {
				//the feedback is a string
				
				//make the feedback into an array
				cRaterScoringRule.feedback = [];
			} else if(feedback.constructor.toString().indexOf("Array") != -1) {
				//the feedback is an array
				
				//remove the feedback at the specified index
				cRaterScoringRule.feedback.splice(y, 1);
			}
		}
	}
	
	//update the CRater authoring UI
	this.displayCRaterFeedback(cRaterScoringRules);
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the student action for a CRater feedback
 */
View.prototype.OpenResponseNode.cRaterStudentActionUpdated = function(args) {
	//get the scoring rule index we are going to update the student action for
	var x = args[0];
	
	//get the student action 'revise' or 'rewrite'
	var studentAction = args[1];
	
	if(x == null) {
		//default to 0
		x = 0;
	}
	
	if(this.content.cRater.cRaterScoringRules != null &&
			this.content.cRater.cRaterScoringRules[x] != null) {
		
		//get the feedback object
		var feedbackObject = this.content.cRater.cRaterScoringRules[x];
		
		if(feedbackObject != null) {
			//update the student action in the feedback object
			feedbackObject.studentAction = studentAction;
		}
	}	
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the CRater max check answer value
 */
View.prototype.OpenResponseNode.updateCRaterMaxCheckAnswers = function() {
	//get the value the author has entered
	var maxCheckAnswers = $('#cRaterMaxCheckAnswers').val();
	
	//update the value in the content
	this.content.cRater.maxCheckAnswers = maxCheckAnswers;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

View.prototype.OpenResponseNode.populateStudentResponseBoxSize = function() {
	$('#studentResponseBoxSizeInput').val(this.content.assessmentItem.interaction.expectedLines);
};

/**
 * Update the showPreviousWorkThatHasAnnotation value
 */
View.prototype.OpenResponseNode.updateShowPreviousWorkThatHasAnnotation = function() {
	var value = false;
	
	//get the 'checked' attribute which will either be null or the string 'checked'
	var checked = $('#showPreviousWorkThatHasAnnotation').attr('checked');
	
	if(checked == 'checked') {
		//checkbox was checked
		value = true;
	}
	
	//update the value in the content
	this.content.showPreviousWorkThatHasAnnotation = value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Enable or disable CRater for this step
 */
View.prototype.OpenResponseNode.updateEnableCRater = function() {
	var enableCRater = false;
	
	//get the 'checked' attribute which will either be null or the string 'checked'
	var checked = $('#enableCRaterCheckbox').attr('checked');
	
	if(checked == 'checked') {
		//checkbox was checked
		enableCRater = true;
	}
	
	if(enableCRater) {
		//enable CRater
		
		if(this.content.cRater == null) {
			//CRater does not exist in content so we will add CRater in the content
			this.content.cRater = {
				cRaterItemId:'',
				displayCRaterScoreToStudent:false,
				displayCRaterFeedbackToStudent:false,
				cRaterMaxScore:null,
				cRaterScoringRules:null
			};
			$('#cRaterSettingsDiv').show();
		} else {
			//CRater already exists so we don't need to do anything
		}
		
		//set the export columns
		this.setAutoGradedExportColumns();
	} else {
		//disable CRater
		
		if(this.content.cRater == null) {
			//CRater doesn't exist in the content so we don't need to do anything
		} else {
			//CRater exists in the content so we will remove it
			
			//make sure the author wants to remove all of the CRater settings for this step
			var answer = confirm('Are you sure you want to disable CRater for this step? All of the CRater settings and feedback will be removed.');
			
			if(answer) {
				//the author is sure they want to disable and remove all the CRater settings
				this.content.cRater = null;
				
				//clear all the CRater settings in the authoring UI
				$('#cRaterItemIdInput').val('');
				$('#cRaterItemIdStatus').html('');
				$('#cRaterDisplayScoreToStudent').attr('checked', false);
				$('#cRaterDisplayFeedbackToStudent').attr('checked', false);
				$('#cRaterMustSubmitAndReviseBeforeExit').attr('checked', false);
				$('#cRaterMaxCheckAnswers').val('');
				$('#cRaterFeedback').html('');
				
				$('#cRaterSettingsDiv').hide();				
			} else {
				/*
				 * the author does not want to remove all the CRater settings so we will
				 * check the 'Enable CRater' checkbox and not touch the content
				 */
				$('#enableCRaterCheckbox').attr('checked', true);
			}
		}
		
		//set the export columns
		this.setRegularExportColumns();
	}
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Set the export columns for regular open response steps
 */
View.prototype.OpenResponseNode.setRegularExportColumns = function() {
	this.content.exportColumns = [
          {
        	  "columnName": "Response",
        	  "field": "response"
          }
  	];
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Set the export columns for the auto graded open response steps
 */
View.prototype.OpenResponseNode.setAutoGradedExportColumns = function() {
	this.content.exportColumns = [
          {
        	  "columnName": "Submit",
        	  "field": "isCRaterSubmit"
          },
          {
        	  "columnName": "Auto-Score",
        	  "field": "cRaterScore"
          },
          {
        	  "columnName": "Auto-Feedback",
        	  "field": "cRaterFeedbackText"
          },
          {
        	  "columnName": "Response",
        	  "field": "response"
          }
  	];
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/openresponse/authorview_openresponse.js');
};