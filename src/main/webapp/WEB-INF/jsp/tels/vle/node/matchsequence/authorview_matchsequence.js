/**
 * Sets the MatchSequenceNode type as an object of this view
 * @constructor
 * @author patrick lawler
 */
View.prototype.MatchSequenceNode = {};
View.prototype.MatchSequenceNode.commonComponents = ['Prompt', 'LinkTo'];

/**
 * Generates the authoring page for matchsequence node types
 */
View.prototype.MatchSequenceNode.generatePage = function(view){
	this.view = view;
	this.content = this.view.activeContent.getContentJSON();
	this.feedbackMode = false;
	this.currentChoiceId;
	this.currentContainerId;
	
	this.buildPage();
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 */
View.prototype.MatchSequenceNode.getCommonComponents = function() {
	return this.commonComponents;
};

/**
 * Dynamically generates the page based on the current state of xmlPage
 */
View.prototype.MatchSequenceNode.buildPage = function(){
	var parent = document.getElementById('dynamicParent');
	
	//wipe out old elements and variables
	parent.removeChild(document.getElementById('dynamicPage'));
	
	//create new elements
	var pageDiv = createElement(document, 'div', {id:'dynamicPage', style:'width:100%;height:100%'});
	//var promptDiv = createElement(document, 'div', {id:'promptDiv'});
	//var prompt = createElement(document, 'textarea', {id: 'promptInput', rows: '10', cols: '75', wrap: 'hard', onchange: 'eventManager.fire("msUpdatePrompt")'});
	var promptText = document.createTextNode('Edit prompt:');
	var orderingDiv = createElement(document, 'div', {id: 'orderingOptions'});
	var order = createElement(document, 'input', {type: 'radio', id: 'ordered', name: 'ordered', value: true, onclick: 'eventManager.fire("msUpdateOrdered","true")'});
	var notOrder = createElement(document, 'input', {type: 'radio', id: 'notOrdered', name: 'ordered', value: false, onclick: 'eventManager.fire("msUpdateOrdered","false")'});
	var orderedText = document.createTextNode('Select ordering option:');
	var orderText = document.createTextNode('Choices have a specific sequential order per Target');
	var notOrderText = document.createTextNode('Choices are unordered per Target');
	var addNewContainerButton = createElement(document, 'input', {type: 'button', id: 'addContainerButton', onclick: 'eventManager.fire("msAddContainer")', value: 'Add Container'});
 	var createNew = createElement(document, 'input', {id: 'addChoiceButton', type: 'button', value: 'Create New Choice', onclick: 'eventManager.fire("msAddChoice")'});
	var removeChoice = createElement(document, 'input', {id: 'removeChoiceButton', type: 'button', value: 'Remove Choice', onclick: 'eventManager.fire("msRemoveChoice")'});
	var removeContainerButton = createElement(document, 'input', {type: 'button', id: 'removeContainerButton', onclick: 'eventManager.fire("msRemoveContainer")', value: 'Remove Container'});
	var editFeedback = createElement(document, 'input', {id: 'editFeedbackButton', type: 'button', value: 'Edit/Create Feedback', onclick: 'eventManager.fire("msEditFeedback")'});
	var shuffle = createElement(document, 'input', {type: 'checkbox', id: 'shuffled', onclick: 'eventManager.fire("msShuffleChanged")'});
	var shuffleText = document.createTextNode('Shuffle Choices');
	
	//will contain the displayLayout, loglevel, and showFeedback options
	var advancedOptionsDiv = createElement(document, 'div', {id: 'advancedOptions'});
	
	//the displayLayout radio option
	var displayLayoutText = document.createTextNode('Select display layout:');
	var displayLayoutVertical = createElement(document, 'input', {type: 'radio', id: 'displayLayoutVertical', name: 'displayLayout', value: 'vertical', onclick: 'eventManager.fire("msUpdateDisplayLayout","vertical")'});
	var displayLayoutVerticalText = document.createTextNode('Vertical (Default)');
	var displayLayoutHorizontal = createElement(document, 'input', {type: 'radio', id: 'displayLayoutHorizontal', name: 'displayLayout', value: 'horizontal', onclick: 'eventManager.fire("msUpdateDisplayLayout","horizontal")'});
	var displayLayoutHorizontalText = document.createTextNode('Horizontal');
	
	//the logLevel radio option
	var logLevelText = document.createTextNode('Select log level:');
	var logLevelRegular = createElement(document, 'input', {type: 'radio', id: 'logLevelRegular', name: 'logLevel', value: 'regular', onclick: 'eventManager.fire("msUpdateLogLevel","regular")'});
	var logLevelRegularText = document.createTextNode('Regular (Default)');
	var logLevelHigh = createElement(document, 'input', {type: 'radio', id: 'logLevelHigh', name: 'logLevel', value: 'high', onclick: 'eventManager.fire("msUpdateLogLevel","high")'});
	var logLevelHighText = document.createTextNode('High');
	
	//the showFeedback radio option
	var showFeedbackText = document.createTextNode('Show feedback:');
	var showFeedbackEnabled = createElement(document, 'input', {type: 'radio', id: 'showFeedbackEnabled', name: 'showFeedback', value: 'enabled', onclick: 'eventManager.fire("msUpdateShowFeedback", "true")'});
	var showFeedbackEnabledText = document.createTextNode('True (Default)');
	var showFeedbackDisabled = createElement(document, 'input', {type: 'radio', id: 'showFeedbackDisabled', name: 'showFeedback', value: 'disabled', onclick: 'eventManager.fire("msUpdateShowFeedback","false")'});
	var showFeedbackDisabledText = document.createTextNode('False');
	
	shuffle.checked = this.getShuffle();
	
	if(this.getOrdered()){
		order.checked = true;
	} else {
		notOrder.checked = true;
	};
	
	orderingDiv.appendChild(orderedText);
	orderingDiv.appendChild(createBreak());
	orderingDiv.appendChild(order);
	orderingDiv.appendChild(orderText);
	orderingDiv.appendChild(createBreak());
	orderingDiv.appendChild(notOrder);
	orderingDiv.appendChild(notOrderText);
	orderingDiv.appendChild(createBreak());
	orderingDiv.appendChild(createBreak());
	orderingDiv.appendChild(shuffle);
	orderingDiv.appendChild(shuffleText);
	orderingDiv.appendChild(createBreak());
	
	//get the value of displayLayout from the content
	var displayLayoutValue = this.getDisplayLayout();
	
	//determine which displayLayout radio button should be checked
	if(displayLayoutValue == null || displayLayoutValue == 'vertical') {
		displayLayoutVertical.checked = true;
	} else if(displayLayoutValue == 'horizontal') {
		displayLayoutHorizontal.checked = true;
	}
	
	//add the displayLayout elements to the authoring display
	advancedOptionsDiv.appendChild(displayLayoutText);
	advancedOptionsDiv.appendChild(createBreak());
	advancedOptionsDiv.appendChild(displayLayoutVertical);
	advancedOptionsDiv.appendChild(displayLayoutVerticalText);
	advancedOptionsDiv.appendChild(displayLayoutHorizontal);
	advancedOptionsDiv.appendChild(displayLayoutHorizontalText);
	advancedOptionsDiv.appendChild(createBreak());
	advancedOptionsDiv.appendChild(createBreak());
	
	//get the value of the logLevel from the content
	var logLevelValue = this.getLogLevel();
	
	//determine which logLevel radio button should be checked
	if(logLevelValue == null || logLevelValue == 'regular') {
		logLevelRegular.checked = true;
	} else if(logLevelValue == 'high') {
		logLevelHigh.checked = true;
	}

	//add the logLevel elements to the authoring display
	advancedOptionsDiv.appendChild(logLevelText);
	advancedOptionsDiv.appendChild(createBreak());
	advancedOptionsDiv.appendChild(logLevelRegular);
	advancedOptionsDiv.appendChild(logLevelRegularText);
	advancedOptionsDiv.appendChild(logLevelHigh);
	advancedOptionsDiv.appendChild(logLevelHighText);
	advancedOptionsDiv.appendChild(createBreak());
	advancedOptionsDiv.appendChild(createBreak());
	
	//get the value of the showFeedback from the content
	var showFeedbackValue = this.getShowFeedback();
	
	//determine which showFeedback radio button should be checked
	if(showFeedbackValue == null || showFeedbackValue == true) {
		showFeedbackEnabled.checked = true;
	} else if(showFeedbackValue == false) {
		showFeedbackDisabled.checked = true;
	}
	
	//add the showFeedback elements to the authoring display
	advancedOptionsDiv.appendChild(showFeedbackText);
	advancedOptionsDiv.appendChild(createBreak());
	advancedOptionsDiv.appendChild(showFeedbackEnabled);
	advancedOptionsDiv.appendChild(showFeedbackEnabledText);
	advancedOptionsDiv.appendChild(showFeedbackDisabled);
	advancedOptionsDiv.appendChild(showFeedbackDisabledText);
	advancedOptionsDiv.appendChild(createBreak());
	advancedOptionsDiv.appendChild(createBreak());
	
	pageDiv.appendChild(promptText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createElement(document, 'div', {id:'promptContainer'}));
	pageDiv.appendChild(orderingDiv);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(advancedOptionsDiv);
	pageDiv.appendChild(createBreak());
	
	//create the authoring section to enable challenge question
	var challengeText = document.createTextNode('Challenge Question Setup');
	pageDiv.appendChild(challengeText);
	pageDiv.appendChild(this.generateChallengeSetup());
	
	
	// allow user to change heading title for sources
	pageDiv.appendChild(createBreak());
	var sourceBucketNameTextContainer = createElement(document, 'input', {type: 'text', id: 'sourceBucketName', onchange: 'eventManager.fire("msSourceBucketNameUpdated")'});
	var sourceBucketText = document.createTextNode('Source Bucket Name: ');
	sourceBucketNameTextContainer.value = (this.content.sourceBucketName != null) ? this.content.sourceBucketName : this.view.getI18NString("choices","MatchSequenceNode");
	pageDiv.appendChild(sourceBucketText);
	pageDiv.appendChild(sourceBucketNameTextContainer);

	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(addNewContainerButton);
	pageDiv.appendChild(removeContainerButton);
	pageDiv.appendChild(createSpace());
	pageDiv.appendChild(createSpace());
	pageDiv.appendChild(createSpace());
	pageDiv.appendChild(createNew);
	pageDiv.appendChild(removeChoice);
	pageDiv.appendChild(editFeedback);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(this.generateFeedback());
	pageDiv.appendChild(this.generateContainerTable());
	
	parent.appendChild(pageDiv);
	
	this.generateContainers();
	
	if(this.feedbackMode){
		showElement('feedbackDiv');
		hideElement('containerTable');
	} else {
		showElement('containerTable');
		hideElement('feedbackDiv');
	};
};

/**
 * Generates the hidden feedback element
 */
View.prototype.MatchSequenceNode.generateFeedback = function(){
	var feedbackDiv = createElement(document, 'div', {id:'feedbackDiv'});
	var instructions = document.createTextNode('Click any colored field to add/edit its text. Click "Hide Feedback" when finished.');
	var hideFeedbackButt = createElement(document, 'input', {type:'button', value:'Hide Feedback', onclick:'eventManager.fire("msHideFeedback")'});
	var feedbackEditDiv = createElement(document, 'div', {id:'feedbackEditDiv', style:'display:none;'});
	var feedbackEditInput = createElement(document, 'textarea', {id:'feedbackEditInput', cols:'85', rows:'10'});
	var feedbackEditSave = createElement(document,'input',{type:'button', value:'Save', onclick:'eventManager.fire("msSaveFeedback")'});
	
	feedbackDiv.appendChild(createBreak());
	feedbackDiv.appendChild(instructions);
	feedbackDiv.appendChild(createBreak());
	feedbackDiv.appendChild(hideFeedbackButt);
	feedbackDiv.appendChild(createBreak());
	feedbackDiv.appendChild(feedbackEditDiv);
	feedbackEditDiv.appendChild(feedbackEditInput);
	feedbackEditDiv.appendChild(createBreak());
	feedbackEditDiv.appendChild(feedbackEditSave);
	feedbackDiv.appendChild(createBreak());
	feedbackDiv.appendChild(createBreak());
	
	return feedbackDiv;
};

/**
 * Generates a table of choices vs. containters which will allow for editing
 * creating feedback that choice in that container
 */
View.prototype.MatchSequenceNode.generateFeedbackTable = function(){
	var parent = document.getElementById('feedbackDiv');
 	var old = document.getElementById('containerChoiceTable');
 	
 	//wipe out old
 	if(old){
 		parent.removeChild(old);
 	};
 	
 	//create new
	var choices = this.getChoices();
	var containers = this.getFields();
 	var table = createElement(document, 'table', {id: 'containerChoiceTable'});
 	var headerRow = createElement(document, 'tr', {id: 'headerRow'});
 	var headerLabel = createElement(document, 'td', {id: 'headerLabel'});
 	var containerLabelDiv = createElement(document, 'div', {id: 'containerLabelDiv', align: 'right'});
 	var choiceLabelDiv = createElement(document, 'div', {id: 'choiceLabelDiv'});
				 	
 	containerLabelDiv.innerHTML = 'Containers:';
 	choiceLabelDiv.innerHTML = 'Choices';
 	
 	headerLabel.appendChild(containerLabelDiv);
 	headerLabel.appendChild(choiceLabelDiv);
 	headerRow.appendChild(headerLabel);
 	for(var a=0;a<containers.length;a++){
 		var containerName = createElement(document, 'td', {id: 'containerName_' + containers[a].identifier});
 		containerName.innerHTML = containers[a].name;
 		headerRow.appendChild(containerName);
 	};
 	
 	table.appendChild(headerRow);
 	
 	for(var b=0;b<choices.length;b++){
 		var row = createElement(document, 'tr', {id: 'row_' + b});
 		var choiceLabelTD = createElement(document, 'td', {id: 'choiceLabelTD_' + b});
 		
 		choiceLabelTD.innerHTML = choices[b].value;
 		row.appendChild(choiceLabelTD);
 		for(var c=0;c<containers.length;c++){
 			var choiceId = choices[b].identifier;
 			var containerId = containers[c].identifier;
 			var val = this.getValueByChoiceAndFieldIdentifiers(choiceId, containerId);
 			var feedbackTD = createElement(document, 'td', {id: 'cell_' + b + '_' + c, onclick: 'eventManager.fire("msEditIndividualFeedback",["' + choiceId + '","' + containerId + '"])'});
 			
 			if(val){ //feedback exists
 				var html;
 				if(val.isCorrect){
 					feedbackTD.setAttribute('bgcolor', '#99FFCC');
 					html = val.feedback;
 				} else {
 					feedbackTD.setAttribute('bgcolor', '#FF9999');
 					html = val.feedback;
 				};
 				feedbackTD.innerHTML = html;
 			} else { //feedback not there
 				feedbackTD.setAttribute('bgcolor', '#FF9999');
 				feedbackTD.innerHTML = 'Create Feedback';
 			};
 			
 			row.appendChild(feedbackTD);
 		};
 		
 		table.appendChild(row);
 	};
 	
 	parent.appendChild(table);
};

/**
 * Hides the edit feedback html elements and shows the container table.
 */
View.prototype.MatchSequenceNode.hideFeedback = function(){
	this.feedbackMode = false;
	$('#feedbackDiv').hide();
	$('#containerTable,#addContainerButton,#removeContainerButton,#addChoiceButton,#removeChoiceButton,#editFeedbackButton').show();
};

/**
 * Sets the clicked on choice in the edit feedback input field and shows that field
 */
View.prototype.MatchSequenceNode.editIndividualFeedback = function(choiceId,containerId){
	this.currentChoiceId = choiceId;
	this.currentContainerId = containerId;
	
	var value = this.getValueByChoiceAndFieldIdentifiers(choiceId,containerId);
	
	if(value != null) {
		document.getElementById('feedbackEditInput').value = this.getValueByChoiceAndFieldIdentifiers(choiceId,containerId).feedback;	
	}
	
	showElement('feedbackEditDiv');
};

/**
 * Saves the user entered feedback and refreshes the table
 */
View.prototype.MatchSequenceNode.saveFeedback = function(){
	var feedback = this.getValueByChoiceAndFieldIdentifiers(this.currentChoiceId, this.currentContainerId);
 	
 	if(!feedback){
 		this.createNewFeedback(this.currentChoiceId, this.currentContainerId);
 		feedback = this.getValueByChoiceAndFieldIdentifiers(this.currentChoiceId, this.currentContainerId);
 	};
 	this.updateFeedback(this.currentChoiceId, this.currentContainerId, document.getElementById('feedbackEditInput').value);
 	
 	this.generateFeedbackTable();
 	document.getElementById('feedbackEditInput').value = '';
 	hideElement('feedbackEditDiv');
 	
 	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Returns a table element for containers and generates
 * the row element to which existing containers will be appended
 */
View.prototype.MatchSequenceNode.generateContainerTable = function(){
	var containerTable = createElement(document, 'table', {id: 'containerTable'});
	var row = createElement(document, 'tr', {name: 'containerRow'});
	
	containerTable.appendChild(row);
	return containerTable;
};

/**
 * Removes previous containerSelect element (if exists) and
 * generates a new one based on the gapMultiple elements
 * defined in xmlPage
 */
View.prototype.MatchSequenceNode.generateContainers = function(){
 	var parent = document.getElementById('containerTable');
 	var fields = this.getFields();
 	
 	//remove old tr elements
 	var rows = document.getElementsByName('containerRow');
 	for(var v=rows.length - 1;v>=0;v--){
 		parent.removeChild(rows[v]);
 	};
 	
 	for(var u=0;u<fields.length;u++){
 		var row = createElement(document, 'tr', {name: 'containerRow'});
 		row.appendChild(this.generateContainer(fields[u], u));
 		parent.appendChild(row);
 	};
 };

/**
 * Given a field object from the content, generates and returns
 * a TD Element based on the container information
 */
View.prototype.MatchSequenceNode.generateContainer = function(field,index){
	var identifier = field.identifier;
	var containerTD = createElement(document, 'td', {id: 'containerTD_' + identifier});
	var radioContainer = createElement(document, 'input', {type: 'radio', name: 'radioContainer', id: 'radioContainer_' + identifier, onfocus: 'eventManager.fire("msContainerSelected","radioContainer_' + identifier + '")', value: identifier});
	var textContainer = createElement(document, 'input', {type: 'text', id: 'textContainer_' + identifier, onfocus: 'eventManager.fire("msContainerSelected","radioContainer_' + identifier + '")', onchange: 'eventManager.fire("msContainerTextUpdated","' + identifier + '")'});
	var choiceDiv = createElement(document, 'div', {id: 'choiceDiv_' + identifier});
	var titleText = document.createTextNode('Title: ');
	var targetText = document.createTextNode('Target Box ' + index);
	
	textContainer.value = field.name;
	
	containerTD.appendChild(radioContainer);
	containerTD.appendChild(targetText);
	containerTD.appendChild(createBreak());
	containerTD.appendChild(titleText);
	containerTD.appendChild(textContainer);
	containerTD.appendChild(choiceDiv);
	
	this.generateChoices(choiceDiv, identifier);
	
	return containerTD;
};

/**
 * Given the parent element and gapMultiple identifier
 * generates and appends the associated choices table
 */
View.prototype.MatchSequenceNode.generateChoices = function(parent,fieldIdentifier){
	var choiceTable = createElement(document, 'table', {id: 'choiceTable_' + fieldIdentifier, border: '1'});
	var choices = this.getChoicesByContainerIdentifier(fieldIdentifier);
	
	for(var e=0;e<choices.length;e++){
		choiceTable.appendChild(this.generateChoice(choices[e], fieldIdentifier));
	};
	
	parent.appendChild(choiceTable);
	parent.appendChild(createBreak());
};

/**
 * Given a choice (gapText) and its associated gapIdentifier, generates
 * and returns a table row with the choice Text
 */
View.prototype.MatchSequenceNode.generateChoice = function(choice,fieldIdentifier){
	var identifier = choice.identifier;
	var row = createElement(document, 'tr', {id: 'choiceRow_'+ identifier});
	var td = createElement(document, 'td', {id: 'choiceTD_' + identifier});
	var radioChoice = createElement(document, 'input', {type: 'radio', name: 'radioChoice_' + fieldIdentifier, onfocus: 'eventManager.fire("msChoiceSelected",["' + identifier + '", "' + fieldIdentifier + '"])', value: identifier});
	var textChoice = createElement(document, 'input', {type: 'text', id: 'textChoice_' + identifier, size:75, onfocus: 'eventManager.fire("msChoiceSelected",["' + identifier + '", "' + fieldIdentifier + '"])', onchange: 'eventManager.fire("msChoiceTextUpdated","' + identifier + '")'});
	var ordered = createElement(document, 'input', {type: 'text', size: '1', id: 'orderChoice_' + identifier, onfocus: 'eventManager.fire("msChoiceSelected",["' + identifier + '", "' + fieldIdentifier + '"])', onkeyup: 'eventManager.fire("msOrderUpdated","' + identifier + '")'});
	var textOrder = document.createTextNode('order pos:');
	
	textChoice.value = choice.value;
	
	td.appendChild(radioChoice);
	td.appendChild(textChoice);
	
	if(this.getOrdered()){
		ordered.value = this.getOrderPositionByChoiceIdentifier(identifier);
		td.appendChild(textOrder);
		td.appendChild(ordered);
	};
	
	row.appendChild(td);
	return row;
};


/**
 * Returns the prompt element in the content
 */
View.prototype.MatchSequenceNode.getPrompt = function(){
	return this.content.assessmentItem.interaction.prompt;
};


View.prototype.MatchSequenceNode.populatePrompt = function() {
	$('#promptInput').val(this.content.assessmentItem.interaction.prompt);
};

/**
 * Updates the prompt element in xmlPage with the text
 * in prompt textarea box
 */
View.prototype.MatchSequenceNode.updatePrompt = function(){
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

/**
 * Returns the value of the order element in xmlPage
 */
View.prototype.MatchSequenceNode.getOrdered = function(){
	return this.content.assessmentItem.interaction.ordered;
 };
 
 /**
  * Updates the order element in xmlPage with the value
  * selected by the radio inputs
  */
 View.prototype.MatchSequenceNode.updateOrdered = function(val){
	this.content.assessmentItem.interaction.ordered = (val === true || val=='true') ? true : false;
  	this.generateContainers();
  	
  	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
  };

/**
 * Selects the appropriate option button given the index
 */
 View.prototype.MatchSequenceNode.containerSelected = function(index){
 	document.getElementsByName('radioContainer')[index].checked = true;
 	this.clearOtherChoices(this.getSelectedContainerIdentifier());
 };

/**
 * Selects the appropriate option button given the identifier
 */
View.prototype.MatchSequenceNode.containerSelectedByIdentifier = function(identifier){
	document.getElementById('radioContainer_' + identifier).checked = true;
};
 
/**
 * Selects the appopriate option button given the choice identifier and
 * container identifier
 */
View.prototype.MatchSequenceNode.choiceSelected = function(choiceId,containerId){
	var choices = document.getElementsByName('radioChoice_' + containerId);
	this.clearOtherChoices(containerId);
	this.containerSelectedByIdentifier(containerId); //ensures that associated container is also selected
	if(choices!=null && choices.length>0){
		for(var f=0;f<choices.length;f++){
			if(choices[f].value == choiceId){
				choices[f].checked = true;
			};
		};
	};
};

/**
 * Clears the selection of choices not associated
 * with this identifier
 */
View.prototype.MatchSequenceNode.clearOtherChoices = function(identifier){
	var gaps = this.getFields();
	for(var m=0;m<gaps.length;m++){
		if(gaps[m].identifier!=identifier){
			var choices = document.getElementsByName('radioChoice_' + gaps[m].identifier);
			for(var n=0;n<choices.length;n++){
				choices[n].checked = false;
			};
		};
	};
};

/**
 * Updates the text of a gapMultiple element in the content
 * given the associated identifier
 */
View.prototype.MatchSequenceNode.containerTextUpdated = function(identifier){
	this.getField(identifier).name = document.getElementById('textContainer_' + identifier).value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the source bucket name for this match sequence item
 */
View.prototype.MatchSequenceNode.sourceBucketNameUpdated = function(){
	this.content.sourceBucketName = document.getElementById('sourceBucketName').value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the gapText element specified by the given identifier
 * in xmlPage when a change is detected
 */
View.prototype.MatchSequenceNode.choiceTextUpdated = function(identifier){
	this.getChoiceByChoiceIdentifier(identifier).value = document.getElementById('textChoice_' + this.getSelectedChoiceIdentifier()).value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the value element's order attribute with the value in the orderInput
 * that is associated with the given choice identifier in xmlPage
 */
View.prototype.MatchSequenceNode.orderUpdated = function(identifier){
	this.updateOrderPositionByChoiceIdentifier(identifier, document.getElementById('orderChoice_' + identifier).value);
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Returns the radio element of the corresponding selected container
 */
View.prototype.MatchSequenceNode.getSelectedContainer = function(){
	var radios = document.getElementsByName('radioContainer');
	for(var g=0;g<radios.length;g++){
		if(radios[g].checked){
			return radios[g];
		};
	};
};

/**
 * Returns the identifier of the corresponding selected container
 */
View.prototype.MatchSequenceNode.getSelectedContainerIdentifier = function(){
	var radio = this.getSelectedContainer();
	if(radio){
		return radio.value;
	};
};

/**
 * Returns the radio element corresponding to the selected choice
 */
View.prototype.MatchSequenceNode.getSelectedChoice = function(){
	var choices = document.getElementsByName('radioChoice_' + this.getSelectedContainerIdentifier());
	for(var h=0;h<choices.length;h++){
		if(choices[h].checked){
			return choices[h];
		};
	};
};

/**
 * Returns the identifier of the corresponding selected choice
 */
View.prototype.MatchSequenceNode.getSelectedChoiceIdentifier = function(){
	var choice = this.getSelectedChoice();
	if(choice){
		return choice.value;
	};
};

/**
 * Returns all gapMultiple elements in xmlPage
 */
View.prototype.MatchSequenceNode.getFields = function(){
	return this.content.assessmentItem.interaction.fields;
};

/**
 * Returns the gapMultiple element in the xmlPage
 * that is associated with the given identifier
 */
View.prototype.MatchSequenceNode.getField = function(identifier){
	var fields = this.getFields();
	for(var t=0;t<fields.length;t++){
		if(fields[t].identifier==identifier){
			return fields[t];
		};
	};
};

/**
 * Returns all value elements in the correctResponse element in xmlPage
 */
View.prototype.MatchSequenceNode.getResponseValues = function(){
	return this.content.assessmentItem.responseDeclaration.correctResponses;
 };
 
 /**
  * Returns all value elements in the correctResponse element that
  * has a field identifier that matches the given identifier
  */
 View.prototype.MatchSequenceNode.getResponseValuesByFieldIdentifier = function(identifier){
 	var allVals = this.getResponseValues();
 	var vals = [];
 	for(var y=0;y<allVals.length;y++){
 		if(allVals[y].fieldIdentifier==identifier){
 			vals.push(allVals[y]);
 		};
 	};
 	return vals;
 };

/**
 * Returns all value elemens in the correctResponse elemnt that
 * has a choiceIdentifier that matches the given identifier
 */
View.prototype.MatchSequenceNode.getResponseValuesByChoiceIdentifier = function(identifier){
	var allVals = this.getResponseValues();
	var vals =[];
	for(var y=0;y<allVals.length;y++){
		if(allVals[y].choiceIdentifier==identifier){
			vals.push(allVals[y]);
		};
	};
	return vals;
};

/**
 * Returns the order position given a choice identifier
 */
View.prototype.MatchSequenceNode.getOrderPositionByChoiceIdentifier = function(identifier){
	var vals = this.getResponseValuesByChoiceIdentifier(identifier);
	for(var i=0;i<vals.length;i++){
		return vals[i].order;
	};
};

/**
 * Updates the order position in the content given a choice identifier
 * and the order position
 */
View.prototype.MatchSequenceNode.updateOrderPositionByChoiceIdentifier = function(identifier,order){
	var vals = this.getResponseValuesByChoiceIdentifier(identifier);
	for(var j=0;j<vals.length;j++){
		vals[j].order = order;
	};
};

/**
 * Returns all available choices defined in the content for this
 * match sequence
 */
View.prototype.MatchSequenceNode.getChoices = function(){
	return this.content.assessmentItem.interaction.choices;
};

/**
 * Given an identifier, returns the choice (gap text) associated with it
 */
View.prototype.MatchSequenceNode.getChoiceByChoiceIdentifier = function(identifier){
	var choices = this.getChoices();
	for(var a=0;a<choices.length;a++){
		if(choices[a].identifier==identifier){
			return choices[a];
		};
	};
};

/**
 * Given a container identifier, returns all choices associated with it
 */
View.prototype.MatchSequenceNode.getChoicesByContainerIdentifier = function(identifier){
 	var vals = this.getResponseValuesByFieldIdentifier(identifier);
 	var choiceIds = [];
 	var choices = [];
 	
 	/* get the choiceIdentifiers from the response values associated with the container identifier */
 	for(var b=0;b<vals.length;b++){
 		var id = vals[b].choiceIdentifier;
 		if(id!=null && choiceIds.indexOf(id)==-1 && vals[b].isCorrect){
 			choiceIds.push(id);
 		};
 	};
 	
 	/* then get the choices by the found identifiers */
 	for(var c=0;c<choiceIds.length;c++){
 		choices.push(this.getChoiceByChoiceIdentifier(choiceIds[c]));
 	};
 	
 	return choices;
 };

/**
 * Returns all value elements in the content that are associated
 * with the given choice and container identifiers
 */
View.prototype.MatchSequenceNode.getValueByChoiceAndFieldIdentifiers = function(choiceId,containerId){
	var vals = this.getResponseValuesByChoiceIdentifier(choiceId);
	for(var s=0;s<vals.length;s++){
		if(vals[s].fieldIdentifier==containerId){
			return vals[s];
		};
	};
	return null;
};

/**
 * Generates and returns a unique identifier
 */
View.prototype.MatchSequenceNode.generateUniqueIdentifier = function(type){
	var count = 0;
	var gaps;
	
	if(type=='field'){
		gaps = this.getFields();
	} else if(type=='choice'){
		gaps = this.getChoices();
	};
	
	while(true){
		var id = type + '_' + count;
		var found = false;
		for(var k=0;k<gaps.length;k++){
			if(gaps[k].identifier==id){
				found = true;
			};
		};
		
		if(!found){
			return id;
		};
		
		count ++;
	};
};

/**
 * Adds a new container to this content and refreshes
 */
View.prototype.MatchSequenceNode.addContainer = function(){
	var field = {identifier: this.generateUniqueIdentifier('field'), numberOfEntries: '0', ordinal: false, name:'Enter Title Here'};
	this.content.assessmentItem.interaction.fields.push(field);
	
	this.setIncorrectExistingChoices(field.identifier);
	
	this.generateContainers();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Removes the selected container and ALL references
 * to it from xmlPage and refreshes page
 */
View.prototype.MatchSequenceNode.removeContainer = function(){
	var identifier = this.getSelectedContainerIdentifier();
	if(identifier){
		if(confirm('Removing a container also removes all associated choices, ordering, etc. This can not be undone. Are you sure you wish to continue?')){
			var vals = this.getResponseValuesByFieldIdentifier(identifier);
			var choices = this.getChoicesByContainerIdentifier(identifier);
			
			this.getFields().splice(this.getFields().indexOf(this.getField(identifier)),1);
			for(var l=0;l<choices.length;l++){
				this.getChoices().splice(this.getChoices().indexOf(choices[l]), 1);
			};
			
			for(var m=0;m<vals.length;m++){
				this.getResponseValues().splice(this.getResponseValues().indexOf(vals[m]), 1);
			};
			
			this.generateContainers();
			
			/* fire source updated event */
			this.view.eventManager.fire('sourceUpdated');
		};
	} else {
		this.view.notificationManager.notify('One of the containers must be selected before removing it', 3);
	};
};

/**
 * Given a container identifier, adds a new choice to xmlPage and 
 * appends it to the associated container
 */
View.prototype.MatchSequenceNode.addChoice = function(){
	var identifier = this.getSelectedContainerIdentifier();
	
	if(!identifier){
		this.view.notificationManager.notify('Please select a container in which you wish to create a new choice.', 3);
		return;
	};
	
	var choice = {matchMax:'1', value: 'Enter Choice', identifier: this.generateUniqueIdentifier('choice')};
	var correct = {choiceIdentifier: choice.identifier, fieldIdentifier: identifier, feedback:'Correct.', isCorrect:true, isDefault:false, order:'0'};
	this.content.assessmentItem.interaction.choices.push(choice);
	this.content.assessmentItem.responseDeclaration.correctResponses.push(correct);
	
	this.setIncorrectOtherContainers(choice.identifier, identifier);
	
	this.generateContainers();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Given a choiceId and the containerId that it is associated
 * with, sets default feedback as 'Incorrect' for any other
 * containers that may exist. Used when creating a new choice.
 */
View.prototype.MatchSequenceNode.setIncorrectOtherContainers = function(choiceId,containerId){
	var containers = this.getFields();
	
	for(var o=0;o<containers.length;o++){
		var identifier = containers[o].identifier;
		if(identifier!=containerId){
			this.createNewFeedback(choiceId, identifier);
			this.updateFeedback(choiceId, identifier, 'Incorrect');
		};
	};
};

/**
 * Given a container Id, sets all existing choices to default
 * as incorrect for that container. Used when creating a new container
 */
View.prototype.MatchSequenceNode.setIncorrectExistingChoices = function(containerId){
	var choices = this.getChoices();
	
	for(var a=0;a<choices.length;a++){
		this.createNewFeedback(choices[a].identifier, containerId);
		this.updateFeedback(choices[a].identifier, containerId, 'Incorrect');
	};
};

/**
 * Removes the selected choice from the content, refreshes and updates preview
 */
View.prototype.MatchSequenceNode.removeChoice = function(){
	var choice = this.getChoiceByChoiceIdentifier(this.getSelectedChoiceIdentifier());
	if(choice){
		if(confirm('Removing a choice also removes all associated feedback. This can not be undone. Are you sure you wish to continue?')){
			var vals = this.getResponseValuesByChoiceIdentifier(choice.identifier);

			this.getChoices().splice(this.getChoices().indexOf(choice), 1);
			
			for(var o=0;o<vals.length;o++){
				this.getResponseValues().splice(this.getResponseValues().indexOf(vals[o]), 1);
			};
			
			this.generateContainers();
			
			/* fire source updated event */
			this.view.eventManager.fire('sourceUpdated');
		};
	} else {
		this.view.notificationManager.notify('A choice must be selected before removing it.', 3);
	};
};

/**
 * Given a choice identifier and a container identifier,
 * creates a new value element for feedback in xmlPage
 */
View.prototype.MatchSequenceNode.createNewFeedback = function(choiceId,containerId,isCorrect){
	var val = {choiceIdentifier:choiceId,fieldIdentifier:containerId,isCorrect:false,isDefault:false,order:'0',feedback:''};
	
	if(this.getOrdered()){
		var vals = this.getResponseValuesByChoiceIdentifier(choiceId);
		if(vals!=null & vals.length>0){
			for(var r=0;r<vals.length;r++){
				var foundOrder = vals[r].order;
				if(vals[r].order!=''){
					val.order = foundOrder;
				};
			};
		};
	};
	
	this.content.assessmentItem.responseDeclaration.correctResponses.push(val);
};

/**
 * Given the choice identifier, container identifier and new text,
 * updates the associated value (feedback element) in the content
 */
View.prototype.MatchSequenceNode.updateFeedback = function(choiceId,containerId,text){
	this.getValueByChoiceAndFieldIdentifiers(choiceId, containerId).feedback = text;
};

/**
 * Validates the ordering of each container when ordering is specified
 */
View.prototype.MatchSequenceNode.validateOrdering = function(){
	if(this.getOrdered()){
		if(this.duplicated()){
			return false;
		} else if(!this.sequential()){
			return false;
		} else {
			return true;
		};
	} else {
		return true;
	};
};

/**
 * returns true if any of the ordering variables for any of the containers
 * is duplicated, otherwise, returns false
 */
View.prototype.MatchSequenceNode.duplicated = function(){
	var containers = this.getFields();
	for(var t=0;t<containers.length;t++){
		var choices = this.getChoicesByContainerIdentifier(containers[t].identifier);
		var order = [];
		for(var u=0;u<choices.length;u++){
			var orderVal = this.getValueByChoiceAndFieldIdentifiers(choices[u].identifier, containers[t].identifier).order;
			if(orderVal!=null && orderVal!=''){
				if(order.indexOf(orderVal)==-1){
					order.push(orderVal);
				} else {
					return true;
				};
			};
		};
	};
	return false;
};

/**
 * returns 1 if a is > b, 0 if a = b and -1 if a < b
 */
View.prototype.MatchSequenceNode.sort = function(a,b){
	if(a > b){
		return 1;
	} else if (a==b){
	 	return 0;
	} else {
		return -1;
	};
};

/**
 * returns true if there is < 2 order values or if all of the values
 * are exactly 1 more than the previous
 */
View.prototype.MatchSequenceNode.sequential = function(){
	var containers = this.getFields();
	for(var u=0;u<containers.length;u++){
		var choices = this.getChoicesByContainerIdentifier(containers[u].identifier);
		var order = [];
		for(var v=0;v<choices.length;v++){
			var val = this.getValueByChoiceAndFieldIdentifiers(choices[v].identifier, containers[u].identifier).order;
			order.push(val);
		};
		order.sort(this.sort);
		for(var w=0;w<order.length;w++){
			if(w!=0){
				if(parseInt(order[w])!=(parseInt(order[w-1]) + 1)){
					return false;
				};
			};
		};
	};
	return true;
};

/**
 * Returns a boolean, whether or not to shuffle choices when displaying
 */
View.prototype.MatchSequenceNode.getShuffle = function(){
	return this.content.assessmentItem.interaction.shuffle;
};

/**
 * Changes the shuffle option in xmlPage
 */
View.prototype.MatchSequenceNode.shuffleChanged = function(){
	this.content.assessmentItem.interaction.shuffle = document.getElementById('shuffled').checked;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Shows the edit feedback div element to allow for editing of feedback
 */
View.prototype.MatchSequenceNode.editFeedback = function(){
	this.generateFeedbackTable();
	this.feedbackMode = true;
	$('#feedbackDiv').show();
	$('#containerTable,#addContainerButton,#removeContainerButton,#addChoiceButton,#removeChoiceButton,#editFeedbackButton').hide();
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 */
View.prototype.MatchSequenceNode.updateContent = function(){
	/* update content object */
	this.view.activeContent.setContent(this.content);
};

/**
 * Get the display layout ('vertical' or 'horizontal')
 */
View.prototype.MatchSequenceNode.getDisplayLayout = function() {
	return this.content.displayLayout;
};

/**
 * Get the log level ('regular' or 'high')
 */
View.prototype.MatchSequenceNode.getLogLevel = function() {
	return this.content.logLevel;
};

/**
 * Get whether to show feedback (true or false)
 */
View.prototype.MatchSequenceNode.getShowFeedback = function() {
	return this.content.showFeedback;
};

/**
 * Set the value of the displayLayout to the content
 */
View.prototype.MatchSequenceNode.updateDisplayLayout = function(val){
	this.content.displayLayout = val;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Set the value of the logLevel to the content
 */
View.prototype.MatchSequenceNode.updateLogLevel = function(val){
	this.content.logLevel = val;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Set the value of the showFeedback to the content
 */
View.prototype.MatchSequenceNode.updateShowFeedback = function(val){
	this.content.showFeedback = (val === true || val=='true') ? true : false;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * When needed, generates the challenge setup for authors to author ChallengeNodes.
 */
View.prototype.MatchSequenceNode.generateChallengeSetup = function(){
	/* create challenge setup structure */
	var challengeDiv = createElement(document, 'div', {id:'challengeDiv'});
	var navigateToDiv = createElement(document, 'div', {id:'navigateToDiv'});
	var attemptsDiv = createElement(document, 'div', {id:'attemptsDiv'});
	challengeDiv.appendChild(navigateToDiv);
	challengeDiv.appendChild(createBreak());
	challengeDiv.appendChild(attemptsDiv);
	
	/* create the navigateTo elements */
	var navToText = document.createTextNode('Select the step that students should review before being allowed to try again.');
	var navToSelect = createElement(document,'select', {id:'navigateToSelect', onchange:'eventManager.fire("matchSequenceChallengeNavigateToChanged")'});
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
		
		if(this.content.assessmentItem.interaction.attempts != null) {
			/* check to see if this should be the selected node */
			if(this.content.assessmentItem.interaction.attempts.navigateTo==nodeIds[a]){
				navToSelect.selectedIndex = a + 1;
			}			
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
	var addNewAttemptScoreButton = createElement(document, 'input', {type:'button', value:'Add new attempt/score', onclick:'eventManager.fire("matchSequenceChallengeAddNew")'});
	var removeLastButton = createElement(document, 'input', {type:'button', value:'Remove last attempt/score', onclick:'eventManager.fire("matchSequenceChallengeRemoveLast")'});
	
	challengeDiv.appendChild(attemptsText);
	challengeDiv.appendChild(createBreak());
	challengeDiv.appendChild(attemptsTable);
	challengeDiv.appendChild(addNewAttemptScoreButton);
	challengeDiv.appendChild(removeLastButton);
	
	attemptsTable.appendChild(ath);
	attemptsTable.appendChild(atb);
	ath.appendChild(athRow);
	athRow.appendChild(attemptTH);
	athRow.appendChild(scoreTH);
	
	attemptTH.innerHTML = 'Attempt #';
	scoreTH.innerHTML = 'Score';
	
	if(this.content.assessmentItem.interaction.attempts != null) {
		/* add attempts/scores that are specified in the content */
		for(var attempt in this.content.assessmentItem.interaction.attempts.scores){
			var score = this.content.assessmentItem.interaction.attempts.scores[attempt];
			var currentRow = createElement(document, 'tr', {id:'attemptRow_' + attempt});
			var attemptTD = createElement(document, 'td', {id:'attemptTD_' + attempt});
			var scoreTD = createElement(document, 'td', {id:'scoreTD_' + attempt});
			var scoreInput = createElement(document, 'input', {type:'text', id:'scoreInput_' + attempt, size:3, onkeyup:'eventManager.fire("matchSequenceChallengeScoreChanged","' + attempt + '")', value: score});
			
			atb.appendChild(currentRow);
			currentRow.appendChild(attemptTD);
			currentRow.appendChild(scoreTD);
			attemptTD.innerHTML = attempt;
			scoreTD.appendChild(scoreInput);
		}		
	}
	
	return challengeDiv;
};

/**
 * Updates the content with the author selected value of the nodeId that should
 * be navigated to when the student incorrectly answers a challenge question.
 */
View.prototype.MatchSequenceNode.challengeNavigateToChanged = function(){
	//make sure this.content.assessmentItem.interaction.attempts is populated
	this.populateAttemptsObjectIfNecessary();
	
	/* update content */
	this.content.assessmentItem.interaction.attempts.navigateTo = $('#navigateToSelect').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Adds a new attempt/score to the content and the authoring.
 */
View.prototype.MatchSequenceNode.addNewAttemptScore = function(){
	//make sure this.content.assessmentItem.interaction.attempts is populated
	this.populateAttemptsObjectIfNecessary();
	
	/* get the new attempt number */
	var attemptNum = this.getLastAttemptNumber() + 1;
	
	/* update the content */
	this.content.assessmentItem.interaction.attempts.scores[attemptNum] = 0;
	
	/* update the attempts/scores table */
	var trHtml = '<tr id="attemptRow_' + attemptNum + '"><td id="attemptTD_' + attemptNum + '">' + attemptNum + 
		'</td><td id="scoreTD_' + attemptNum + '"><input type="text" size="3" onkeyup="eventManager.fire(\'matchSequenceChallengeScoreChanged\',\'' + 
		attemptNum + '\')" value="0" id="scoreInput_' + attemptNum  + '"></input></td></tr>';
	$('#scoreAttemtpsTableBody').append(trHtml);
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Removes the last attempt/score from the content and the authoring.
 */
View.prototype.MatchSequenceNode.removeLastAttemptScore = function(){
	//make sure this.content.assessmentItem.interaction.attempts is populated
	this.populateAttemptsObjectIfNecessary();
	
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
View.prototype.MatchSequenceNode.scoreChanged = function(attemptNum){
	//make sure this.content.assessmentItem.interaction.attempts is populated
	this.populateAttemptsObjectIfNecessary();
	
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
 * Returns a new scores object minus the given attemptNum.
 * 
 * @return object - scores
 */
View.prototype.MatchSequenceNode.getScoresMinus = function(attemptNum){
	//make sure this.content.assessmentItem.interaction.attempts is populated
	this.populateAttemptsObjectIfNecessary();
	
	var scores = {};
	
	for(var attempt in this.content.assessmentItem.interaction.attempts.scores){
		if(attempt != attemptNum){
			scores[attempt] = this.content.assessmentItem.interaction.attempts.scores[attempt];
		}
	}
	
	return scores;
};

/**
 * Returns the last attempt number that is specified in the content.
 * 
 * @return int - attempt number
 */
View.prototype.MatchSequenceNode.getLastAttemptNumber = function(){
	//make sure this.content.assessmentItem.interaction.attempts is populated
	this.populateAttemptsObjectIfNecessary();
	
	var last = 0;
	
	for(var attempt in this.content.assessmentItem.interaction.attempts.scores){
		if(!isNaN(attempt)){
			last = Math.max(last, parseInt(attempt));
		}
	}
	
	return last;
};

/**
 * Populate the attempts object if necessary. This is for previously authored
 * match & sequence steps that do not have this object in their content.
 */
View.prototype.MatchSequenceNode.populateAttemptsObjectIfNecessary = function() {
	if(this.content.assessmentItem.interaction.attempts == null) {
		this.content.assessmentItem.interaction.attempts = {
			"navigateTo": "",
			"scores": {}
	    };
	}
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/matchsequence/authorview_matchsequence.js');
};