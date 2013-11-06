/**
 * Sets the BrainstormNode type as an object of this view
 * @constructor
 * @author patrick lawler
 */
View.prototype.BrainstormNode = {};
View.prototype.BrainstormNode.commonComponents = ['Prompt', 'LinkTo'];

/**
 * Generates the authoring page for brainstorm nodes
 */
View.prototype.BrainstormNode.generatePage = function(view){
	this.view = view;
	this.content = this.view.activeContent.getContentJSON();
	this.currentResponse;
	this.nodeUtils = new Node().utils;
	
	var parent = document.getElementById('dynamicParent');
	
	//wipe out old elements
	parent.removeChild(document.getElementById('dynamicPage'));
	
	//create new elements
	var pageDiv = createElement(document, 'div', {id:'dynamicPage', style:'width:100%;height:100%'});
	var optionsDiv = createElement(document, 'div', {id:'optionsDiv'});
	
	parent.appendChild(pageDiv);
	pageDiv.appendChild(optionsDiv);
	
	this.generateOptions();
	pageDiv.appendChild(createElement(document, 'div', {id: 'studentResponseBoxSizeContainer'}));
	pageDiv.appendChild(createElement(document, 'div', {id: 'starterSentenceAuthoringContainer'}));
	pageDiv.appendChild(document.createTextNode("Edit/Enter prompt"));
	pageDiv.appendChild(createElement(document, 'div', {id:'promptContainer'}));
	pageDiv.appendChild(createElement(document, 'div', {id:'cannedResponsesDiv'}));
	this.generateCannedResponses();
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 */
View.prototype.BrainstormNode.getCommonComponents = function() {
	return this.commonComponents;
};

/**
 * Generates the option portion of this page dynamically based
 * on the content of xmlPage
 */
View.prototype.BrainstormNode.generateOptions = function(){
	var parent = document.getElementById('dynamicPage');
	var nextChild = document.getElementById('optionsDiv').nextChild;
	
	//wipe out old options
	parent.removeChild(document.getElementById('optionsDiv'));
	
	//create new options elements
	var optionsDiv = createElement(document, 'div', {id:'optionsDiv'});
	var optionsText = document.createTextNode('Available Options:');
	var optionsTable = createElement(document, 'table', {id:'optionsTable'});
	var optionsRow1 = createElement(document, 'tr', {id:'optionsRow1'});
	var optionsRow2 = createElement(document, 'tr', {id:'optionsRow2'});
	
	if(nextChild){
		parent.insertBefore(optionsDiv, nextChild);
	} else {
		parent.appendChild(optionsDiv);
	};
	
	optionsDiv.appendChild(optionsText);
	optionsDiv.appendChild(createBreak());
	optionsDiv.appendChild(optionsTable);
	optionsDiv.appendChild(createBreak());
	
	optionsTable.appendChild(optionsRow1);
	optionsTable.appendChild(optionsRow2);
	
	var titleTD = createElement(document, 'td', {id: 'titleTD'});
	var titleText = document.createTextNode('Title: ');
	var titleInput = createElement(document, 'input', {type: 'text', id: 'titleInput', onkeyup: 'eventManager.fire("brainstromUpdateTitle")', value: this.content.title});
	
	optionsRow1.appendChild(titleTD);
	
	titleTD.appendChild(titleText);
	titleTD.appendChild(titleInput);
	
	var gatedTD = createElement(document, 'td', {id: 'gatedTD'});
	var gatedText = document.createTextNode('Is Brainstorm gated?');
	var gatedYesText = document.createTextNode('Yes. Student must post a response before seing peer responses');
	var gatedNoText = document.createTextNode('No. Student sees peer responses immediately');
	var gatedYesRadio = createElement(document, 'input', {type: 'radio', name: 'isGated', onclick: 'eventManager.fire("brainstormUpdateGated","true")'});
	var gatedNoRadio = createElement(document, 'input', {type: 'radio', name: 'isGated', onclick: 'eventManager.fire("brainstormUpdateGated","false")'});
	
	var displayNameTD = createElement(document, 'td', {id: 'displayNameTD'});
	var displayNameText = document.createTextNode('When response is submitted by student, how is it labeled?');
	var displayNameUserOnlyText = document.createTextNode('Username');
	var displayNameAnonymousOnlyText = document.createTextNode('Anonymous');
	var displayNameUserOrAnonymousText = document.createTextNode('Student selects Username or Anonymous');
	var displayNameUserOnlyRadio = createElement(document, 'input', {type: 'radio', name: 'displayName', onclick: 'eventManager.fire("brainstormUpdateDisplayName","0")'});
	var displayNameAnonymousOnlyRadio = createElement(document, 'input', {type: 'radio', name: 'displayName', onclick: 'eventManager.fire("brainstormUpdateDisplayName","1")'});
	var displayNameUserOrAnonymousRadio = createElement(document, 'input', {type: 'radio', name: 'displayName', onclick: 'eventManager.fire("brainstormUpdateDisplayName","2")'});
	
	var richTextEditorTD = createElement(document, 'td', {id: 'richTextEditorTD'});
	var richTextEditorText = document.createTextNode('Rich Text Editor');
	var richTextEditorYesText = document.createTextNode('Rich editor visible to student');
	var richTextEditorNoText = document.createTextNode('Rich 	editor not visible');
	var richTextEditorYesRadio = createElement(document, 'input', {type: 'radio', name: 'richText', onclick: 'eventManager.fire("brainstormUpdateRichText","true")'});
	var richTextEditorNoRadio = createElement(document, 'input', {type: 'radio', name: 'richText', onclick: 'eventManager.fire("brainstormUpdateRichText","false")'});
	
	var pollEndedTD = createElement(document, 'td', {id: 'pollEndedTD'});
	var pollEndedText = document.createTextNode('Is poll ended');
	var pollEndedYesText = document.createTextNode('poll is ended');
	var pollEndedNoText = document.createTextNode('poll is not ended');
	var pollEndedYesRadio = createElement(document, 'input', {type: 'radio', name: 'pollEnded', onclick: 'eventManager.fire("brainstormUpdatePollEnded","true")'});
	var pollEndedNoRadio = createElement(document, 'input', {type: 'radio', name: 'pollEnded', onclick: 'eventManager.fire("brainstormUpdatePollEnded","false")'});

	var allowStudentReplyTD = createElement(document, 'td', {id: 'allowStudentReplyTD'});
	var allowStudentReplyText = document.createTextNode('Allow Students to Reply?');
	var allowStudentReplyYesText = document.createTextNode('Yes. Students can reply to posts.');
	var allowStudentReplyNoText = document.createTextNode('No. Students cannot reply to posts.');
	var allowStudentReplyYesRadio = createElement(document, 'input', {type: 'radio', name: 'allowStudentReply', onclick: 'eventManager.fire("brainstormUpdateAllowStudentReply","true")'});
	var allowStudentReplyNoRadio = createElement(document, 'input', {type: 'radio', name: 'allowStudentReply', onclick: 'eventManager.fire("brainstormUpdateAllowStudentReply","false")'});
	
	var instantPollTD = createElement(document, 'td', {id: 'instantPoll'});
	var instantPollText = document.createTextNode('Instant Poll Active?');
	var instantPollYesText = document.createTextNode('Instant Poll IS active');
	var instantPollNoText = document.createTextNode('Instant Poll IS NOT active');
	var instantPollYesRadio = createElement(document, 'input', {type: 'radio', name: 'instantPoll', onclick: 'eventManager.fire("brainstormUpdateInstantPoll","true")'});
	var instantPollNoRadio = createElement(document, 'input', {type: 'radio', name: 'instantPoll', onclick: 'eventManager.fire("brainstormUpdateInstantPoll","false")'});

	var useServerTD = createElement(document, 'td', {id: 'gatedTD'});
	var useServerText = document.createTextNode('Can students see peer responses?');
	var useServerYesText = document.createTextNode('Yes. Student can see peer responses');
	var useServerNoText = document.createTextNode('No. Student is working alone and should not see peer responses');
	var useServerYesRadio = createElement(document, 'input', {type: 'radio', name: 'useServer', onclick: 'eventManager.fire("brainstormUseServerUpdated", true)'});
	var useServerNoRadio = createElement(document, 'input', {type: 'radio', name: 'useServer', onclick: 'eventManager.fire("brainstormUseServerUpdated", false)'});

	if(this.content.isInstantPollActive){
		instantPollYesRadio.checked = true;
	} else {
		instantPollNoRadio.checked = true;
	};
	instantPollTD.appendChild(instantPollText);
	instantPollTD.appendChild(createBreak());
	instantPollTD.appendChild(instantPollYesRadio);
	instantPollTD.appendChild(instantPollYesText);
	instantPollTD.appendChild(createBreak());
	instantPollTD.appendChild(instantPollNoRadio);
	instantPollTD.appendChild(instantPollNoText);
	
	if(this.content.isPollEnded){
		pollEndedYesRadio.checked = true;
	} else {
		pollEndedNoRadio.checked = true;
	};
	pollEndedTD.appendChild(pollEndedText);
	pollEndedTD.appendChild(createBreak());
	pollEndedTD.appendChild(pollEndedYesRadio);
	pollEndedTD.appendChild(pollEndedYesText);
	pollEndedTD.appendChild(createBreak());
	pollEndedTD.appendChild(pollEndedNoRadio);
	pollEndedTD.appendChild(pollEndedNoText);
	
	if(this.content.isAllowStudentReply){
		allowStudentReplyYesRadio.checked = true;
	} else {
		allowStudentReplyNoRadio.checked = true;
	};
	allowStudentReplyTD.appendChild(allowStudentReplyText);
	allowStudentReplyTD.appendChild(createBreak());
	allowStudentReplyTD.appendChild(allowStudentReplyYesRadio);
	allowStudentReplyTD.appendChild(allowStudentReplyYesText);
	allowStudentReplyTD.appendChild(createBreak());
	allowStudentReplyTD.appendChild(allowStudentReplyNoRadio);
	allowStudentReplyTD.appendChild(allowStudentReplyNoText);	
	
	if(this.content.isRichTextEditorAllowed){
		richTextEditorYesRadio.checked = true;
	} else {
		richTextEditorNoRadio.checked = true;
	};
	richTextEditorTD.appendChild(richTextEditorText);
	richTextEditorTD.appendChild(createBreak());
	richTextEditorTD.appendChild(richTextEditorYesRadio);
	richTextEditorTD.appendChild(richTextEditorYesText);
	richTextEditorTD.appendChild(createBreak());
	richTextEditorTD.appendChild(richTextEditorNoRadio);
	richTextEditorTD.appendChild(richTextEditorNoText);
	
	if(this.content.displayName=='0'){
		displayNameUserOnlyRadio.checked = true;
	} else if(this.content.displayName=='1'){
		displayNameAnonymousOnlyRadio.checked = true;
	} else {
		displayNameUserOrAnonymousRadio.checked = true;
	};
	displayNameTD.appendChild(displayNameText);
	displayNameTD.appendChild(createBreak());
	displayNameTD.appendChild(displayNameUserOnlyRadio);
	displayNameTD.appendChild(displayNameUserOnlyText);
	displayNameTD.appendChild(createBreak());
	displayNameTD.appendChild(displayNameAnonymousOnlyRadio);
	displayNameTD.appendChild(displayNameAnonymousOnlyText);
	displayNameTD.appendChild(createBreak());
	displayNameTD.appendChild(displayNameUserOrAnonymousRadio);
	displayNameTD.appendChild(displayNameUserOrAnonymousText);
	
	if(this.content.isGated){
		gatedYesRadio.checked = true;	
	} else {
		gatedNoRadio.checked = true;
	};
	gatedTD.appendChild(gatedText);
	gatedTD.appendChild(createBreak());
	gatedTD.appendChild(gatedYesRadio);
	gatedTD.appendChild(gatedYesText);
	gatedTD.appendChild(createBreak());
	gatedTD.appendChild(gatedNoRadio);
	gatedTD.appendChild(gatedNoText);
	
	if(this.content.useServer){
		useServerYesRadio.checked = true;	
	} else {
		useServerNoRadio.checked = true;
	};
	useServerTD.appendChild(useServerText);
	useServerTD.appendChild(createBreak());
	useServerTD.appendChild(useServerYesRadio);
	useServerTD.appendChild(useServerYesText);
	useServerTD.appendChild(createBreak());
	useServerTD.appendChild(useServerNoRadio);
	useServerTD.appendChild(useServerNoText);
	
	optionsRow1.appendChild(gatedTD);
	optionsRow1.appendChild(displayNameTD);
	optionsRow2.appendChild(richTextEditorTD);
	optionsRow2.appendChild(allowStudentReplyTD);
	//optionsRow2.appendChild(pollEndedTD);
	optionsRow2.appendChild(useServerTD);
	//optionsRow2.appendChild(instantPollTD);
};


/**
 * Updates this content and preview when the starter sentence option has changed.
 */
View.prototype.BrainstormNode.starterChanged = function(){
	var options = document.getElementsByName('starterRadio');
	
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
 * Updates the content's starter sentence with text in starter sentence textarea and 
 * refreshes preview
 */
View.prototype.BrainstormNode.starterUpdated = function(){
	/* update starterSentence value */
	this.content.starterSentence.sentence = document.getElementById('starterSentenceInput').value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Generates the cannedResponses element and removes previous
 */
View.prototype.BrainstormNode.generateCannedResponses = function(){
	var parent = document.getElementById('cannedResponsesDiv');
	
	while(parent.firstChild){
		parent.removeChild(parent.firstChild);
	};
	
	var createButton = createElement(document, 'input', {type: 'button', 'class':'button', value: 'Create New Response', onclick: 'eventManager.fire("brainstormCreateNewResponse")'});
	var removeButton = createElement(document, 'input', {type: 'button', 'class':'button', value: 'Remove Response', onclick: 'eventManager.fire("brainstormRemoveResponse")'});
	var responses = this.content.cannedResponses;
	
	for(var t=0;t<responses.length;t++){
		/* if this is an older response, we will need to set an identifier */
		if(!responses[t].identifier){
			responses[t].identifier = this.nodeUtils.generateKey();
		}
		
		var responseTitleText = document.createTextNode('Name: ');
		var responseTitleInput = createElement(document, 'input', {type: 'text', id: 'responseInput_' + responses[t].identifier, value: responses[t].name, onkeyup: 'eventManager.fire("brainstormResponseNameChanged","' + responses[t].identifier + '")', onclick: 'eventManager.fire("brainstormResponseSelected","' + responses[t].identifier + '")'});
		var responseValueText = document.createTextNode('Response: ');
		var responseValueInput = createElement(document, 'textarea', {id: 'responseValue_' + responses[t].identifier, onkeyup: 'eventManager.fire("brainstormResponseValueChanged","' + responses[t].identifier + '")', onclick: 'eventManager.fire("brainstormResponseSelected","' + responses[t].identifier + '")'});
		responseValueInput.value = responses[t].response;
		
		parent.appendChild(createBreak());
		parent.appendChild(responseTitleText);
		parent.appendChild(responseTitleInput);
		parent.appendChild(createBreak());
		parent.appendChild(responseValueText);
		parent.appendChild(responseValueInput);
	};
	
	parent.appendChild(createBreak());
	parent.appendChild(createButton);
	parent.appendChild(removeButton);
};

/**
 * Updates the value of the title attribute in xmlPage
 */
View.prototype.BrainstormNode.updateTitle = function(){
	this.content.title = document.getElementById('titleInput').value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the value of the isGated attribute in xmlPage
 */
View.prototype.BrainstormNode.updateGated = function(val){
	if(val=='true'){
		this.content.isGated = true;
	} else {
		this.content.isGated = false;
	};
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the value of the displayName attribute in xmlPage
 */
View.prototype.BrainstormNode.updateDisplayName = function(val){
	this.content.displayName = val;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the value of the isAllowStudentReply attribute
 */
View.prototype.BrainstormNode.updateAllowStudentReply = function(val){
	if(val=='true'){
		this.content.isAllowStudentReply = true;
	} else {
		this.content.isAllowStudentReply = false;
	};
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the value of the isRichTextEditorAllowed attribute
 */
View.prototype.BrainstormNode.updateRichText = function(val){
	if(val=='true'){
		this.content.isRichTextEditorAllowed = true;
	} else {
		this.content.isRichTextEditorAllowed = false;
	};
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the value of the isPollEnded attribute in xmlPage
 */
View.prototype.BrainstormNode.updatePollEnded = function(val){
	if(val=='true'){
		this.content.isPollEnded = true;
	} else {
		this.content.isPollEnded = false;
	};
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the value of the isInstantPollActive attribute in xmlPage
 */
View.prototype.BrainstormNode.updateInstantPoll = function(val){
	if(val=='true'){
		this.content.isInstantPollActive = true;
	} else {
		this.content.isInstantPollActive = false;
	};
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the value of the expectedLines attribute of the extendedTextInteraction element in xmlPage
 */
View.prototype.BrainstormNode.updateExpectedLines = function(){
	this.content.assessmentItem.interaction.expectedLines = document.getElementById('expectedLines').value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Given the identifier, returns the associated canned response in xmlPage
 */
View.prototype.BrainstormNode.getResponse = function(identifier){
	var responses = this.content.cannedResponses;
	for(var c=0;c<responses.length;c++){
		if(responses[c].identifier==identifier){
			return responses[c];
		};
	};
};

/**
 * Given an existing identifier, updates associated name in page
 */
View.prototype.BrainstormNode.responseNameChanged = function(identifier){
	this.getResponse(identifier).name = document.getElementById('responseInput_' + identifier).value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Given an existing name, updates the associated value in page
 */
View.prototype.BrainstormNode.responseValueChanged = function(identifier){
	this.getResponse(identifier).response = document.getElementById('responseValue_' + identifier).value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * sets the currentResponse to the currently selected response
 */
View.prototype.BrainstormNode.responseSelected = function(identifier){
	this.currentResponse = this.getResponse(identifier);
};

/**
 * Removes the currently selected response, if none, notifies author
 */
View.prototype.BrainstormNode.removeResponse = function(){
	if(this.currentResponse){
		this.content.cannedResponses.splice(this.content.cannedResponses.indexOf(this.currentResponse), 1);
		this.generateCannedResponses();
		
		/* fire source updated event */
		this.view.eventManager.fire('sourceUpdated');
	} else {
		this.view.notificationManager.notify('No response is selected for removal. Please select a response and try again.', 3);
	};
};

/**
 * Creates a new canned response
 */
View.prototype.BrainstormNode.createNewResponse = function(){
	this.content.cannedResponses.push({identifier:this.nodeUtils.generateKey(),name:'Enter name',response:''});
	this.generateCannedResponses();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 */
View.prototype.BrainstormNode.updateContent = function(){
	/* update content object */
	this.view.activeContent.setContent(this.content);
};


View.prototype.BrainstormNode.populatePrompt = function() {
	$('#promptInput').val(this.content.assessmentItem.interaction.prompt);
};

/**
 * Updates the value of the prompt element in xmlPage
 */
View.prototype.BrainstormNode.updatePrompt = function(){
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


View.prototype.BrainstormNode.populateStudentResponseBoxSize = function() {
	$('#studentResponseBoxSizeInput').val(this.content.assessmentItem.interaction.expectedLines);
};

/**
 * Updates the number of line elements for this open response to that
 * input by the user.
 */
View.prototype.BrainstormNode.updateStudentResponseBoxSize = function(){
	/* update content */
	this.content.assessmentItem.interaction.expectedLines = document.getElementById('studentResponseBoxSizeInput').value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

View.prototype.BrainstormNode.populateStarterSentenceAuthoring = function() {
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

View.prototype.BrainstormNode.updateStarterSentenceAuthoring = function(){
	/* update content */
	this.content.starterSentence.display = $('input[name=starterRadio]:checked').val();
	
	this.content.starterSentence.sentence = $('#starterSentenceAuthoringInput').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the useServer field in the content
 */
View.prototype.BrainstormNode.useServerUpdated = function(useServer) {
	//update the use server field
	this.content.useServer = useServer;
	
	//fire source updated event
	this.view.eventManager.fire('sourceUpdated');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/brainstorm/authorview_brainstorm.js');
};