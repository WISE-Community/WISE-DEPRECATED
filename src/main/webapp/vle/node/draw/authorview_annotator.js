/**
 * Sets the AnnotatorNode type as an object of this view
 * @constructor
 * @author geoffrey kwan
 * @author jonathan lim-breitbart
 */
View.prototype.AnnotatorNode = {};
View.prototype.AnnotatorNode.commonComponents = ['Prompt', 'LinkTo'];

/**
 * Generates the authoring page for annotator node types
 */
View.prototype.AnnotatorNode.generatePage = function(view){
	this.view = view;
	this.content = this.view.activeContent.getContentJSON();
	
	var parent = document.getElementById('dynamicParent');
	
	/* wipe out old */
	parent.removeChild(document.getElementById('dynamicPage'));
	
	/* create new */
	var pageDiv = createElement(document, 'div', {id:'dynamicPage', style:'width:100%;height:100%'});
	
	//create the label for the require work checkbox
	var requireWorkText = document.createTextNode(view.getI18NString('annotator_authoring_require','SVGDrawNode'));
	//create the checkbox for requiring students to complete work on the step before moving on in the project
	var requireWorkToggle = createElement(document, 'input', {id: 'requireWorkToggle', type: 'checkbox', onclick: 'eventManager.fire("annotatorUpdateWorkRequired")'});
	requireWorkToggle.checked = this.content.isMustComplete ? true : false;
	
	//get the existing background url
	var backgroundImg = this.content.backgroundImg ? this.content.backgroundImg : '';
	//the label for the background url input
	var backgroundImageUrlLabel = document.createTextNode(view.getI18NString('annotator_authoring_imageLabel','SVGDrawNode'));
	//the text input for the background url
	var backgroundImageUrl = createElement(document, 'input', {type: 'text', id: 'backgroundImageUrl', name: 'backgroundImageUrl', value: backgroundImg, size:50, onchange: 'eventManager.fire("annotatorUpdateBackgroundImageUrl")'});
	//create the browse button that allows author to choose swf from project assets
	var backgroundBrowseButton = $(createElement(document, 'button', {id: 'backgroundBrowseButton', onclick:'eventManager.fire("annotatorBrowseClicked")'})).text(view.getI18NString('annotator_authoring_imageBrowse','SVGDrawNode'));
	
	var colorDiv = createElement(document, 'div', {id: 'colorDiv'});
	
	//get the existing max labels value
	var maxLabels = this.content.maxLabels ? this.content.maxLabels : 0;
	//the label for the maximum number of lables input
	var maxLabelsLabel = document.createTextNode(view.getI18NString('annotator_authoring_maxLabel','SVGDrawNode'));
	//the text input for the maximum number of labels allowed
	var maxLabelsInput = createElement(document, 'input', {type: 'number', id: 'maxLabels', name: 'maxLabels', value: maxLabels, size:2, onchange: 'eventManager.fire("annotatorUpdateMaxLabels")'});
	
	//get the existing min labels value
	var minLabels = this.content.maxLabels ? this.content.maxLabels : 1;
	//the label for the minimum number of lables input
	var minLabelsLabel = document.createTextNode(view.getI18NString('annotator_authoring_minLabel','SVGDrawNode'));
	//the text input for the minimum number of labels required
	var minLabelsInput = createElement(document, 'input', {type: 'number', id: 'minLabels', name: 'minLabels', value: minLabels, size:2, onchange: 'eventManager.fire("annotatorUpdateMinLabels")'});
	
	// create the text for the prompt input
	var promptText = document.createTextNode(view.getI18NString('annotator_authoring_promptLabel','SVGDrawNode'));
	
	//create the text for the enable student text area checkbox
	var enableStudentTextAreaLabel = document.createTextNode(view.getI18NString('annotator_authoring_responseLabel','SVGDrawNode'));
	//create the checkbox for enabling the student response area
	var enableStudentTextAreaCheckBox = createElement(document, 'input', {id: 'enableStudentTextArea', type: 'checkbox', onclick: 'eventManager.fire("annotatorUpdateEnableStudentTextArea")'});
	var enableTextBox = this.content.enableStudentTextArea ? true : false;
	enableStudentTextAreaCheckBox.checked = enableTextBox;
	
	// create the section for student response area
	var instructionsTextAreaDiv = document.createElement('div');
	$(instructionsTextAreaDiv).attr('id','textAreaInstructionsDiv');
	if(!enableTextBox){ $(instructionsTextAreaDiv).hide(); };
	//create the label for the textarea that the author will write the student response instructions in
	var instructionsLabel = document.createTextNode(view.getI18NString('annotator_authoring_responseInstructionsLabel','SVGDrawNode'));
	//get and set the instructions
	var instructionsValue = this.content.textAreaInstructions ? this.content.textAreaInstructions : view.getI18NString('annotator_authoring_responseInstructions','SVGDrawNode');
	//create the textarea that the author will write the instructions in
	var instructionsTextArea = createElement(document, 'textarea', {id: 'textAreaInstructions', rows:'3', cols:'85', onkeyup:"eventManager.fire('annotatorUpdateTextAreaInstructions')"});
	instructionsTextArea.value = instructionsValue;
	
	//create the label for the input that the author will write the text for the button that opens the student response box
	var textAreaButtonLabel = document.createTextNode(view.getI18NString('annotator_authoring_responseButtonLabel','SVGDrawNode'));
	//get and set the button label text
	var textAreaButtonValue = this.content.textAreaButtonText ? this.content.textAreaButtonText : view.getI18NString('annotator_explain','SVGDrawNode');
	//create the textarea that the author will write the button label text in
	var textAreaButtonInput = createElement(document, 'input', {id: 'textAreaButtonText', type: 'text', size: '50', onkeyup:"eventManager.fire('annotatorUpdateStudentResponseButton')"});
	//populate the instructions text area
	textAreaButtonInput.value = textAreaButtonValue;
	
	//var autoScoringOptionsDiv = createElement(document, 'div', {id:'autoScoringOptionsDiv'});
	//var autoScoringFeedbackAuthoringDiv = createElement(document, 'div', {id:'autoScoringFeedbackAuthoringDiv'});
	
	parent.appendChild(pageDiv);
	
	// TODO: enable require before exit option
	//pageDiv.appendChild(requireWorkText);
	//pageDiv.appendChild(requireWorkToggle);
	//pageDiv.appendChild(createBreak());
	
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(backgroundImageUrlLabel);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(backgroundImageUrl);
	$(pageDiv).append(backgroundBrowseButton);
	pageDiv.appendChild(createBreak());
	
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(colorDiv);
	
	pageDiv.appendChild(maxLabelsLabel);
	pageDiv.appendChild(maxLabelsInput);
	pageDiv.appendChild(createBreak());
	
	pageDiv.appendChild(minLabelsLabel);
	pageDiv.appendChild(minLabelsInput);
	pageDiv.appendChild(createBreak());
	
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(promptText);
	pageDiv.appendChild(createElement(document, 'div', {id: 'promptContainer'}));
	pageDiv.appendChild(createBreak());
	
	pageDiv.appendChild(enableStudentTextAreaLabel);
	pageDiv.appendChild(enableStudentTextAreaCheckBox);
	pageDiv.appendChild(createBreak());
	
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(instructionsTextAreaDiv);
	instructionsTextAreaDiv.appendChild(instructionsLabel)
	instructionsTextAreaDiv.appendChild(instructionsTextArea);
	instructionsTextAreaDiv.appendChild(createBreak());
	instructionsTextAreaDiv.appendChild(createBreak());
	instructionsTextAreaDiv.appendChild(textAreaButtonLabel);
	instructionsTextAreaDiv.appendChild(textAreaButtonInput);
	pageDiv.appendChild(createBreak());
	
	//pageDiv.appendChild(autoScoringOptionsDiv);
	//pageDiv.appendChild(autoScoringFeedbackAuthoringDiv);
	
	this.generateColorOptions();
	//this.generateLabelMinOptions();
	//this.generateLabelMaxOptions();
	//this.generateAutoScoringOptions();
	//this.generateAutoScoringFeedbackAuthoringDiv();
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 */
View.prototype.AnnotatorNode.getCommonComponents = function() {
	return this.commonComponents;
};

/**
 * Update whether to require student work on step before moving on
 */
View.prototype.AnnotatorNode.updateWorkRequired = function() {
	// update the content
	this.content.isMustComplete = $('#requireWorkToggle').prop('checked');
	
	// fire source updated event, which will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the background image url to match that of what the user input
 */
View.prototype.AnnotatorNode.updateBackgroundImageUrl = function(){
	// update the content
	this.content.backgroundImg = document.getElementById('backgroundImageUrl').value;
	
	// fire source updated event, which will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Open asset editor dialog and allows user to choose the image to use for the background
 */
View.prototype.AnnotatorNode.browseImageAssets = function() {
	var callback = function(field_name, url, type, win){
		url = 'assets/' + url;
		document.getElementById(field_name).value = url;
		
		//fire background url changed event
		this.eventManager.fire('annotatorUpdateBackgroundImageUrl');
	};
	var params = {};
	params.field_name = 'backgroundImageUrl';
	params.type = 'image';
	params.win = null;
	params.callback = callback;
	eventManager.fire('viewAssets',params);
};

/**
 * Generates the color selector options
 */
View.prototype.AnnotatorNode.generateColorOptions = function(){
	view = this.view;
	
	// create the label for the default color drop-down select
	var colorLabel = document.createTextNode(view.getI18NString('annotator_authoring_defaultColor_label','SVGDrawNode'));
	// create the default color drop-down select
	var colorSelect = createElement(document, 'select', {id: 'colorDefault', onchange:'eventManager.fire("annotatorUpdateDefaultColor")'});
	// create the options for default color drop-down select
	var options = '<option value="000000">' + view.getI18NString('annotator_colors_black','SVGDrawNode') + ' </option>\
			<option value="0000FF">' + view.getI18NString('annotator_colors_blue','SVGDrawNode') + ' </option>\
			<option value="008000">' + view.getI18NString('annotator_colors_green','SVGDrawNode') + ' </option>\
			<option value="800000">' + view.getI18NString('annotator_colors_maroon','SVGDrawNode') + ' </option>\
			<option value="000080">' + view.getI18NString('annotator_colors_navy','SVGDrawNode') + ' </option>\
			<option value="FF8C00">' + view.getI18NString('annotator_colors_orange','SVGDrawNode') + ' </option>\
			<option value="800080">' + view.getI18NString('annotator_colors_purple','SVGDrawNode') + ' </option>\
			<option value="FF0000">' + view.getI18NString('annotator_colors_red','SVGDrawNode') + ' </option>\
			<option value="008080">' + view.getI18NString('annotator_colors_teal','SVGDrawNode') + ' </option>\
			<option value="FFFF00">' + view.getI18NString('annotator_colors_yellow','SVGDrawNode') + ' </option>';
	
	$(colorSelect).append(options).val(this.content.colorDefault ? this.content.colorDefault : 'FF0000');
	$(colorDiv).append(colorLabel).append(colorSelect);
};

/**
 * Updates the default label color in the content to the user specified value and
 * refreshes the preview.
 */
View.prototype.AnnotatorNode.updateDefaultColor = function(){
	this.content.colorDefault = $('#colorDefault').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

View.prototype.AnnotatorNode.populatePrompt = function() {
	$('#promptInput').val(this.content.prompt);
};

/**
 * Updates the prompt value of the content to the user specified value and 
 * refreshes the preview.
 */
View.prototype.AnnotatorNode.updatePrompt = function(){
	/* update content */
	var content = '',
		editor = tinymce.get('promptInput');
	if(editor){
		content = editor.getContent();
	} else {
		content = $('#promptInput').val();
	}
	
	this.content.prompt = content;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the maximum labels value of the content to the user specified value and 
 * refreshes the preview.
 */
View.prototype.AnnotatorNode.updateMaxLabels = function(){
	this.content.labels_max = $('#maxLabels').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the minimum labels value of the content to the user specified value and 
 * refreshes the preview.
 */
View.prototype.AnnotatorNode.updateMinLabels = function(){
	this.content.labels_min = $('#minLabels').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the enable student text area value of the content to the user specified value and 
 * refreshes the preview.
 */
View.prototype.AnnotatorNode.updateEnableStudentTextArea = function(){
	var enabled = $('#enableStudentTextArea').prop('checked');
	this.content.enableStudentTextArea = enabled;
	
	if(enabled){
		$('#textAreaInstructionsDiv').show();
	} else {
		$('#textAreaInstructionsDiv').hide();
	}
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the student text area instructions value of the content to the user specified value and 
 * refreshes the preview.
 */
View.prototype.AnnotatorNode.updateTextAreaInstructions = function(){
	this.content.textAreaInstructions = $('#textAreaInstructions').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the student response button text in the content to the user specified value and
 * refreshes the preview.
 */
View.prototype.AnnotatorNode.updateStudentResponseButton = function(){
	this.content.textAreaButtonText = $('#textAreaButtonText').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Generate the drop down to select the auto scoring criteria
 */
View.prototype.AnnotatorNode.generateAutoScoringOptions = function() {
	//get the div that we will put everything in
	var generateAutoScoringOptions = document.getElementById('autoScoringOptionsDiv');
	
	//make the text and drop down box
	var selectAutoScoringCriteriaText = document.createTextNode('Auto Scoring: ');
	var selectAutoScoringCriteriaDropDown = createElement(document, 'select', {id: 'selectAutoScoringCriteriaDropDown', name: 'selectAutoScoringCriteriaDropDown', onchange: 'eventManager.fire("svgdrawUpdateAutoScoringCriteria")'});
	
	//add the none option
	var noneOption = createElement(document, 'option', {value:'none'});
	noneOption.text = 'None';
	selectAutoScoringCriteriaDropDown.appendChild(noneOption);
	
	//add the methan option
	var methaneOption = createElement(document, 'option', {value:'methane'});
	methaneOption.text = 'Methane';
	selectAutoScoringCriteriaDropDown.appendChild(methaneOption);
	
	//add the ethane option
	var ethaneOption = createElement(document, 'option', {value:'ethane'});
	ethaneOption.text = 'Ethane';
	selectAutoScoringCriteriaDropDown.appendChild(ethaneOption);
	
	//add the text and drop down box to the div
	generateAutoScoringOptions.appendChild(selectAutoScoringCriteriaText);
	generateAutoScoringOptions.appendChild(selectAutoScoringCriteriaDropDown);
	
	//get the auto scoring criteria value from the content
	var autoScoringCriteria = this.getAutoScoringField('autoScoringCriteria');
	
	if(autoScoringCriteria != null && autoScoringCriteria != '') {
		//populate the drop down box
		$('#selectAutoScoringCriteriaDropDown').val(autoScoringCriteria);		
	}
};

/**
 * Generate the auto scoring feedback elements such as the textareas to
 * input the feedback for the different scores
 */
View.prototype.AnnotatorNode.generateAutoScoringFeedbackAuthoringDiv = function() {
	//get the div that we will put everything in
	var autoScoringFeedbackAuthoringDiv = document.getElementById('autoScoringFeedbackAuthoringDiv');
	
	//clear out the div in case it contained existing content
	autoScoringFeedbackAuthoringDiv.innerHTML = '';
	
	//get the auto scoring criteria
	var autoScoringCriteria = this.getAutoScoringField('autoScoringCriteria');
	
	if(autoScoringCriteria == '') {
		//there is no auto scoring criteria so we will hide the div
		this.hideAutoScoringFeedbackAuthoring();
	} else if(autoScoringCriteria == 'methane' || autoScoringCriteria == 'ethane') {
		//the auto scoring criteria is set so we will show the div
		this.showAutoScoringFeedbackAuthoring();
	}
	
	//create the text box to set whether we want to display the score to the student
	var displayScoreToStudentCheckbox = createElement(document, 'input', {id: 'autoScoringDisplayScoreToStudentCheckbox', type: 'checkbox', onclick: 'eventManager.fire("svgdrawUpdateAutoScoringDisplayScoreToStudentClicked")'});
	var displayScoreToStudentText = document.createTextNode('Display Score to Student');
	
	//populate the checkbox if necessary
	if(this.getAutoScoringField('autoScoringDisplayScoreToStudent')) {
		displayScoreToStudentCheckbox.checked = true;
	}

	//create the text box to set whether we want to display the feedback to the student
	var displayFeedbackToStudentCheckbox = createElement(document, 'input', {id: 'autoScoringDisplayFeedbackToStudentCheckbox', type: 'checkbox', onclick: 'eventManager.fire("svgdrawUpdateAutoScoringDisplayFeedbackToStudentClicked")'});
	var displayFeedbackToStudentText = document.createTextNode('Display Feedback Text to Student');
	
	//populate the checkbox if necessary
	if(this.getAutoScoringField('autoScoringDisplayFeedbackToStudent')) {
		displayFeedbackToStudentCheckbox.checked = true;
	}

	//create the text box to set whether we want to display the feedback to the student on the last chance
	var doNotDisplayFeedbackToStudentOnLastChanceCheckbox = createElement(document, 'input', {id: 'autoScoringDoNotDisplayFeedbackToStudentOnLastChanceCheckbox', type: 'checkbox', onclick: 'eventManager.fire("svgdrawUpdateDoNotDisplayFeedbackToStudentOnLastChanceClicked")'});
	var doNotDisplayFeedbackToStudentOnLastChanceText = document.createTextNode('Do Not Display Feedback to Student on Last Chance');
	
	//populate the checkbox if necessary
	if(this.getAutoScoringField('autoScoringDoNotDisplayFeedbackToStudentOnLastChance')) {
		doNotDisplayFeedbackToStudentOnLastChanceCheckbox.checked = true;
	}
	
	//create the text and input field for the check work chances
	var checkWorkChancesText = document.createTextNode('Check Work Chances (leave blank for unlimited tries)');
	var checkWorkChancesInput = createElement(document, 'input', {id: 'autoScoringCheckWorkChancesInput', type: 'text', size: '4', onchange: 'eventManager.fire("svgdrawUpdateAutoScoringCheckWorkChancesChanged")'});

	//populate the check work chances if necessary
	var checkWorkChances = this.getAutoScoringField('autoScoringCheckWorkChances');
	if(checkWorkChances != null) {
		checkWorkChancesInput.value = checkWorkChances;		
	}
	
	//create the text for the submit confirmation message text area
	var submitConfirmationMessageText = document.createTextNode('Submit Confirmation Message (leave this blank to use the default message. # will be replaced with the number of chances left.)');
	
	//create the textarea for the submit confirmation message
	var submitConfirmationMessageTextArea = createElement(document, 'textarea', {id: 'submitConfirmationMessageTextArea', cols: '60', rows: '4', wrap: 'soft', onchange: 'eventManager.fire("svgdrawUpdateAutoScoringSubmitConfirmationMessageChanged")'});
	
	//add all the elements into the div
	autoScoringFeedbackAuthoringDiv.appendChild(displayScoreToStudentCheckbox);
	autoScoringFeedbackAuthoringDiv.appendChild(displayScoreToStudentText);
	autoScoringFeedbackAuthoringDiv.appendChild(createBreak());
	autoScoringFeedbackAuthoringDiv.appendChild(displayFeedbackToStudentCheckbox);
	autoScoringFeedbackAuthoringDiv.appendChild(displayFeedbackToStudentText);
	autoScoringFeedbackAuthoringDiv.appendChild(createBreak());
	autoScoringFeedbackAuthoringDiv.appendChild(doNotDisplayFeedbackToStudentOnLastChanceCheckbox);
	autoScoringFeedbackAuthoringDiv.appendChild(doNotDisplayFeedbackToStudentOnLastChanceText);
	autoScoringFeedbackAuthoringDiv.appendChild(createBreak());
	autoScoringFeedbackAuthoringDiv.appendChild(checkWorkChancesText);
	autoScoringFeedbackAuthoringDiv.appendChild(checkWorkChancesInput);
	autoScoringFeedbackAuthoringDiv.appendChild(createBreak());
	autoScoringFeedbackAuthoringDiv.appendChild(submitConfirmationMessageText);
	autoScoringFeedbackAuthoringDiv.appendChild(submitConfirmationMessageTextArea);
	autoScoringFeedbackAuthoringDiv.appendChild(createBreak());
	
	//get the feedback array
	var autoScoringFeedback = this.getAutoScoringField('autoScoringFeedback');
	
	var possibleScores = [];
	
	var annotatorScorer = new AnnotatorAutoScore();
	
	/*if(autoScoringCriteria == 'methane') {
		//get the possible scores for methane
		possibleScores = annotatorScorer.getPossibleMethaneScoreKeys();
	} else if(autoScoringCriteria == 'ethane') {
		//get the possible scores for ethane
		possibleScores = annotatorScorer.getPossibleEthaneScoreKeys();
	}*/
	
	if(possibleScores != null) {
		//loop through all the possible scores
		for(var x=0; x<possibleScores.length; x++) {
			var feedback = '';
			var score = null;
			
			//get the possible score object
			var possibleScore = possibleScores[x];
			
			//get the key value
			var keyValue = possibleScore.key;
			
			if(autoScoringFeedback != null) {
				//get the feedback object
				var autoScoringFeedbackObject = autoScoringFeedback[x];
				
				if(autoScoringFeedbackObject != null) {
					//get the existing feedback that was previously authored for this key
					feedback = autoScoringFeedbackObject.feedback;
				}
			}
			
			//display the key value e.g. "0", "1", "2 Case 1", etc.
			var scoreText = document.createTextNode('Score: ' + keyValue);
			
			//create a textarea for the author to enter the feedback text
			var feedbackTextArea = createElement(document, 'textarea', {id: 'autoScoringFeedback_' + x, cols: '60', rows: '4', wrap: 'soft', onchange: 'eventManager.fire("annotatorUpdateAutoScoringFeedback", ' + x + ')'});
			feedbackTextArea.value = feedback;
			
			//add the elements to the div
			autoScoringFeedbackAuthoringDiv.appendChild(createElement(document, 'hr', null));
			autoScoringFeedbackAuthoringDiv.appendChild(scoreText);
			autoScoringFeedbackAuthoringDiv.appendChild(createBreak());
			autoScoringFeedbackAuthoringDiv.appendChild(feedbackTextArea);
			autoScoringFeedbackAuthoringDiv.appendChild(createBreak());
		}
	}
	
	//get the submit confirmation message if it was authored before
	var submitConfirmationMessage = this.getAutoScoringField('submitConfirmationMessage');

	if(submitConfirmationMessage != null) {
		//repopulate the submit confirmation message text area
		$('#submitConfirmationMessageTextArea').val(submitConfirmationMessage);
	}
};

/**
 * The author has changed the auto scoring criteria so we will save it
 * in the content
 */
View.prototype.AnnotatorNode.updateAutoScoringCriteria = function() {
	//get the auto scoring criteria
	var autoScoringCriteria = $('#selectAutoScoringCriteriaDropDown').val();
	
	if(autoScoringCriteria == 'none') {
		//set the value in the content
		this.setAutoScoringField('autoScoringCriteria', '');
		
		//hide the auto scoring feedback div
		this.hideAutoScoringFeedbackAuthoring();
		
		//set the export columns
		this.setRegularExportColumns();
	} else if(autoScoringCriteria == 'methane') {
		//set the value into the content
		this.setAutoScoringField('autoScoringCriteria', 'methane');
		
		//show the auto scoring feedback div
		this.generateAutoScoringFeedbackAuthoringDiv();
		this.showAutoScoringFeedbackAuthoring();
		
		//set the export columns
		this.setAutoGradedExportColumns();
	} else if(autoScoringCriteria == 'ethane') {
		//set the value into the content
		this.setAutoScoringField('autoScoringCriteria', 'ethane');
		
		//show the auto scoring feedback div
		this.generateAutoScoringFeedbackAuthoringDiv();
		this.showAutoScoringFeedbackAuthoring();
		
		//set the export columns
		this.setAutoGradedExportColumns();
	}
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Show the auto scoring feedback div
 */
View.prototype.AnnotatorNode.showAutoScoringFeedbackAuthoring = function() {
	$('#autoScoringFeedbackAuthoringDiv').show();
};

/**
 * Hide the auto scoring feedback div
 */
View.prototype.AnnotatorNode.hideAutoScoringFeedbackAuthoring = function() {
	$('#autoScoringFeedbackAuthoringDiv').hide();
};

/**
 * The author has changed the text for one of the feedback textareas
 * @param index this score has had its feedback changed
 */
View.prototype.AnnotatorNode.updateAutoScoringFeedback = function(index) {
	//get the feedback array
	var autoScoringFeedback = this.getAutoScoringFeedback();
	
	var possibleScores = [];
	
	//get the draw scorer object
	var drawScorer = new DrawScorer();
	
	//get the auto scoring criteria
	var autoScoringCriteria = this.getAutoScoringField('autoScoringCriteria');
	
	if(autoScoringCriteria == 'methane') {
		//get the possible scores for methane
		possibleScores = drawScorer.getPossibleMethaneScoreKeys();
	} else if(autoScoringCriteria == 'ethane') {
		//get the possible scores for ethane
		possibleScores = drawScorer.getPossibleEthaneScoreKeys();
	}
	
	if(autoScoringFeedback.length == 0) {
		if(possibleScores != null) {
			//loop through all the possible score objects
			for(var x=0; x<possibleScores.length; x++) {
				//get a possible score object
				var possibleScore = possibleScores[x];
				
				/*
				 * create the auto scoring feedback object and insert the
				 * score and key
				 */
				autoScoringFeedback[x] = {
					score:possibleScore.score,
					key:possibleScore.key,
					feedback:''
				};
			}
		}
	}
	
	//get the feedback text the author has written and set it in the content
	var feedback = $('#autoScoringFeedback_' + index).val();
	autoScoringFeedback[index].feedback = feedback;
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the value that determines whether the student will see the
 * auto score
 */
View.prototype.AnnotatorNode.updateAutoScoringDisplayScoreToStudent = function() {
	//get whether the checkbox was checked or not
	var checked = $('#autoScoringDisplayScoreToStudentCheckbox').attr('checked');
	
	if(checked == 'checked') {
		this.setAutoScoringField('autoScoringDisplayScoreToStudent', true);
	} else {
		this.setAutoScoringField('autoScoringDisplayScoreToStudent', false);
	}
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the value that determines whether the student will see the
 * auto feedback
 */
View.prototype.AnnotatorNode.updateAutoScoringDisplayFeedbackToStudent = function() {
	//get whether the checkbox was checked or not
	var checked = $('#autoScoringDisplayFeedbackToStudentCheckbox').attr('checked');
	
	if(checked == 'checked') {
		this.setAutoScoringField('autoScoringDisplayFeedbackToStudent', true);
	} else {
		this.setAutoScoringField('autoScoringDisplayFeedbackToStudent', false);
	}
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the value that determines how many times the student can click the
 * 'Check Work' button
 */
View.prototype.AnnotatorNode.updateAutoScoringCheckWorkChances = function() {
	if($('#autoScoringCheckWorkChancesInput').length > 0) {
		//get the check work chances value
		var checkWorkChances = $('#autoScoringCheckWorkChancesInput').val();
		
		if(checkWorkChances == '' || !isNaN(parseInt(checkWorkChances))) {
			//the user has entered '' or a number
			
			//set the value into the step content
			this.setAutoScoringField('autoScoringCheckWorkChances', checkWorkChances);
			
			//fire source updated event, this will update the preview
			this.view.eventManager.fire('sourceUpdated');
		} else {
			alert("Error: invalid 'Check Work Chances' value");
			
			//get the previous check work chances value
			checkWorkChances = this.getAutoScoringField('autoScoringCheckWorkChances');
			
			//set the old value back into the input
			$('#autoScoringCheckWorkChancesInput').val(checkWorkChances);
		}
	}
};

/**
 * Update the value that determines if the student will see the feedback
 * when they submit their last chance
 */
View.prototype.AnnotatorNode.updateDoNotDisplayFeedbackToStudentOnLastChance = function() {
	//get whether the checkbox was checked or not
	var checked = $('#autoScoringDoNotDisplayFeedbackToStudentOnLastChanceCheckbox').attr('checked');
	
	if(checked == 'checked') {
		this.setAutoScoringField('autoScoringDoNotDisplayFeedbackToStudentOnLastChance', true);
	} else {
		this.setAutoScoringField('autoScoringDoNotDisplayFeedbackToStudentOnLastChance', false);
	}
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Get the auto scoring feedback array
 */
View.prototype.AnnotatorNode.getAutoScoringFeedback = function() {
	//populate the autoScoring object in the content if it does not exist
	this.createAutoScoringObjectIfDoesNotExist();
	
	return this.content.autoScoring.autoScoringFeedback;
};

/**
 * Set the auto scoring field in the autoScoring object in the content
 * @param key the field
 * @param value the value
 */
View.prototype.AnnotatorNode.setAutoScoringField = function(key, value) {
	//populate the autoScoring object in the content if it does not exist
	this.createAutoScoringObjectIfDoesNotExist();
	
	//set the value
	this.content.autoScoring[key] = value;
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Get the auto scoring field in the autoScoring object in the content
 * @param key the field
 */
View.prototype.AnnotatorNode.getAutoScoringField = function(key) {
	//populate the autoScoring object in the content if it does not exist
	this.createAutoScoringObjectIfDoesNotExist();
	
	//get the value
	var value = this.content.autoScoring[key];
	
	return value;
};

/**
 * Populate the autoScoring object in the content if it does not exist
 */
View.prototype.AnnotatorNode.createAutoScoringObjectIfDoesNotExist = function() {
	if(this.content.autoScoring == null) {
		this.content.autoScoring = {
			autoScoringCheckWorkChances:'',
			autoScoringCriteria:'',
			autoScoringDisplayScoreToStudent:true,
			autoScoringDisplayFeedbackToStudent:true,
			autoScoringDoNotDisplayFeedbackToStudentOnLastChance:false,
			autoScoringFeedback:[]
		};
	}
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 */
View.prototype.AnnotatorNode.updateContent = function(){
	/* update content object */
	this.view.activeContent.setContent(this.content);
};

/**
 * Update the submit confirmation message field in the step content
 */
View.prototype.AnnotatorNode.updateAutoScoringSubmitConfirmationMessageChanged = function(){
	//get the message text
	var submitConfirmationMessage = $('#submitConfirmationMessageTextArea').val();
	
	//set the message text into the content
	this.setAutoScoringField('submitConfirmationMessage', submitConfirmationMessage);
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Clear the export columns
 */
View.prototype.AnnotatorNode.clearExportColumns = function() {
	this.content.exportColumns = null;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Set the export column for regular draw steps
 */
View.prototype.AnnotatorNode.setRegularExportColumns = function() {
	this.content.exportColumns = [
          {
        	  "columnName": "Data",
        	  "field": "data"
          }
  	];
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Set the export columns for auto graded draw steps
 */
View.prototype.AnnotatorNode.setAutoGradedExportColumns = function() {
	this.content.exportColumns = [
          {
        	  "columnName": "Data",
        	  "field": "data"
          },
          {
        	  "columnName": "Score",
        	  "field": "autoScore"
          },
          {
        	  "columnName": "Max Score",
        	  "field": "maxAutoScore"
          },
          {
        	  "columnName": "Feedback Key",
        	  "field": "autoFeedbackKey"
          },
          {
        	  "columnName": "Feedback",
        	  "field": "autoFeedback"
          },
          {
        	  "columnName": "Submit",
        	  "field": "checkWork"
          }
  	];
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/draw/authorview_annotator.js');
};