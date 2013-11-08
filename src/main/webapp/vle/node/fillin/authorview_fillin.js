/**
 * Sets the FillinNode type as an object of this view
 * @constructor
 * @author patrick lawler
 */
View.prototype.FillinNode = {};
View.prototype.FillinNode.commonComponents = [];

/**
 * Sets initial variables then calls re-generate to build html dynamically
 */
View.prototype.FillinNode.generatePage = function(view){
	this.view = view;
	this.content = this.view.activeContent.getContentJSON();
	this.fillin = [];
	this.fillinIndexes = [];
	this.charCount;
	this.fullText;
	
	this.regeneratePage();
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 */
View.prototype.FillinNode.getCommonComponents = function() {
	return this.commonComponents;
};


/**
 * Dynamically generates the html elements used in this page.
 */
View.prototype.FillinNode.regeneratePage = function(){
	var parent = document.getElementById('dynamicParent');
	
	/* wipe out old elements and variables */
	parent.removeChild(document.getElementById('dynamicPage'));
	
	/* generate full text */
	this.generateFullText();
	
	/* create new elements */
	var pageDiv = createElement(document, 'div', {id:'dynamicPage', style:'width:100%;height:100%'});
	var promptDiv = createElement(document,'div', {id:'promptDiv'});
	var questionText = document.createTextNode('QUESTION');
	var questionText2 = document.createTextNode('Type your question below. To create fill-in blanks, highlight a section of text and click the TRANSFORM button. To edit or remove existing fillins, select the matching radio button.');
	var questionInput = createElement(document, 'textarea', {id: 'promptInput', cols: '90', rows: '30', wrap: 'hard', onkeyup: 'eventManager.fire("fillinTextUpdated")'});
	var fillinText = document.createTextNode('Edit/Remove existing fillins');
	questionInput.innerHTML = this.fullText;
	this.charCount = questionInput.value.length;
	
	var createFillin = createElement(document, 'input', {type: 'button', onclick: 'eventManager.fire("fillinCreateFillin")', value: 'Transform Highlighted Text into Fill-Blank'});
	
	promptDiv.appendChild(questionInput);
	
	pageDiv.appendChild(questionText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(questionText2);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(promptDiv);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createFillin);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(fillinText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(this.generateFillins());
	
	parent.appendChild(pageDiv);
};

/**
 * Generates the fulltext from the content and sets the textarea's value with the full text
 */
View.prototype.FillinNode.generateFullText = function(){
	this.fullText = "";
	this.fillin = [];
	this.fillinIndexes = [];
	
	var currentIndex = 0;
	var html = '';
	
	for(var x=0;x<this.content.assessmentItem.interaction.length;x++){
		if(this.content.assessmentItem.interaction[x].type=='htmltext'){
			html += this.spaceMaker(this.content.assessmentItem.interaction[x].text);
			currentIndex += this.spaceMaker(this.content.assessmentItem.interaction[x].text).length;
		} else if(this.content.assessmentItem.interaction[x].type=='textEntryInteraction'){
			var indexes = currentIndex + "|";
			this.fillin.push(this.content.assessmentItem.interaction[x].responseIdentifier);
			html += this.retrieveInteractionText(this.content.assessmentItem.interaction[x].responseIdentifier);
			currentIndex += this.retrieveInteractionText(this.content.assessmentItem.interaction[x].responseIdentifier).length;
			indexes += currentIndex;
			this.fillinIndexes.push(indexes);
		};
	};
	
	this.fullText = html;
	return html;
};

/**
 * Ensures that the index of the modification does not
 * overlap with any current fillins.
 */
View.prototype.FillinNode.validate = function(){
	var start = document.getElementById('promptInput').selectionStart + 1;
	var end = document.getElementById('promptInput').selectionEnd + 1;
	
	if(this.overlaps(start, end)){
		this.view.notificationManager.notify('You can not change this text because it is part of a fillin! If you want to change/edit/remove the fillin text, then do so below.', 3);
		return false;
	};
	return true;
};

/**
 * Returns the difference in the number of characters from
 * previous textarea and current modified textarea
 */
View.prototype.FillinNode.getDifference = function(){
	return this.charCount - document.getElementById('promptInput').value.length;
};

/**
 * Creates and returns a table with the existing fillins
 */
View.prototype.FillinNode.generateFillins = function(){
	var fillinTable = createElement(document, 'table', {id: 'fillinTable'});
	var headerRow = createElement(document, 'tr', {id: 'headerRow'});
	var fillinTD = createElement(document, 'td', {id: 'fillinTD'});
	var placeholderAllowableTD = createElement(document, 'td', {id: 'allowableTable'});
	
	/* cycle through existing fillins and create and append the appropriate elements to the the fillinTD */
	for(var g=0;g<this.fillin.length;g++){
		var endStart = this.fillinIndexes[g].split('|');
		var text = document.createTextNode('Blank #' + (g + 1) + ':');
		var removeButton = createElement(document, 'input', {type: 'button', value: 'Remove Fillin', onclick: 'eventManager.fire("fillinRemoveFillin")'});
		var radio = createElement(document, 'input', {type: 'radio', id: 'radio_' + g, value: this.fillin[g], name: 'fillinRadio', onclick: 'eventManager.fire("fillinClick",["' + this.fillin[g] + '","' + g + '"])'});
		var input = createElement(document, 'input', {type: 'text', id: 'input_' + g, name: 'input_' + g, onclick: 'eventManager.fire("fillinClick",["' + this.fillin[g] + '","' + g + '"])', onkeyup: 'eventManager.fire("fillinChangeSelected","' + g + '")', value: this.fullText.substring(endStart[0], endStart[1])});
		
		fillinTD.appendChild(createBreak());
		fillinTD.appendChild(text);
		fillinTD.appendChild(radio);
		fillinTD.appendChild(input);
	};
	
	fillinTD.appendChild(createBreak());
	if(removeButton){
		fillinTD.appendChild(removeButton);
	};
	headerRow.appendChild(fillinTD);
	headerRow.appendChild(placeholderAllowableTD);
	fillinTable.appendChild(headerRow);
	return fillinTable;
};

/**
 * Updates the fillin responseDeclaration and allowable answers when text
 * changes and updates text area to reflect changes
 */
View.prototype.FillinNode.changeSelected = function(index){
	var value = document.getElementById('input_' + index).value;
	var declaration = this.content.assessmentItem.responseDeclarations[index];
	
	if(value!=declaration.correctResponses[0].response){ //then text has changed and we must update, mustn't we
		declaration.correctResponses[0].response = value;
		document.getElementById('entryInput_0').value = value;
		document.getElementById('promptInput').value = generateFullText();
		
		/* fire source updated event */
		this.view.eventManager.fire('sourceUpdated');
	};
};

/**
 * Removes fillin responseDeclaration and textEntryInteraction with
 * the given identifier
 */
View.prototype.FillinNode.removeFillin = function(){
	var identifier = this.getSelectedIdentifier();
	
	if(identifier){
		var declarations = this.content.assessmentItem.responseDeclarations;
		var foundIndex;
		
		/* find the right location to remove because the remainder will need to be updated */
		for(var h=0;h<declarations.length;h++){
			if(declarations[h].identifier==identifier){ 
				/* remove declaration */
				declarations.splice(h,1);
				
				/* remove associated interaction */
				this.content.assessmentItem.interaction.splice(this.content.assessmentItem.interaction.indexOf(this.getInteraction(identifier)),1);
				foundIndex = h;
			};
		};
		
		/* now update remaining identifiers */
		for(var t=foundIndex;t<declarations.length;t++){
			this.decrementIdentifiers(declarations[t]);
		};
		
		/* regenerate page */
		this.regeneratePage();
		
		/* fire source updated event */
		this.view.eventManager.fire('sourceUpdated');
	} else {
		this.view.notificationManager.notify('Please select a fillin that you wish to remove first', 3);
	};
};

/**
 * Given a declaration, decrements its identifier by 1
 */
View.prototype.FillinNode.decrementIdentifiers = function(declaration){
	var interactions = this.content.assessmentItem.interaction;
	var identifier = declaration.identifier;
	var newNum = parseInt(identifier.substring(identifier.length - 1, identifier.length)) - 1;
	declaration.identifier = 'response_' + newNum;
		
	for(var z=0;z<interactions.length;z++){
		if(interactions[z].type=='textEntryInteraction' && interactions[z].responseIdentifier==identifier){
			interactions[z].responseIdentifier = 'response_' + newNum;
			break;
		};
	};
};

/**
 * Detects which fillin element is currently selected and returns the associated identifier
 */
View.prototype.FillinNode.getSelectedIdentifier = function(){
 	var identifier;
 	var checked = document.getElementsByName('fillinRadio');
	
	for(var x=0;x<checked.length;x++){
		if(checked[x].checked){
			identifier = checked[x].value;
		};
	};
	
	return identifier;
 };

/**
 * Detects which fillin element is currently selected andreturns it's index
 */
 View.prototype.FillinNode.getSelectedIndex = function(){
 	var checked = document.getElementsByName('fillinRadio');
 	
 	for(var x=0;x<checked.length;x++){
 		if(checked[x].checked){
 			return x;
 		};
 	};
 };

/**
 * When fillin is clicked, sets the clicked fillin as selected and
 * generates the associated allowable answers table
 */
 View.prototype.FillinNode.fillinClick = function(identifier, index){
	var parent = document.getElementById('headerRow');
	
	/* set the associated fillin as selected */
	document.getElementById('radio_' + index).checked = true;
	
	/* clear previous allowableTable */
	parent.removeChild(document.getElementById('allowableTable'));
	
	/* generate new allowableTable */
	parent.appendChild(this.generateAllowableAnswers(identifier));
};

/**
 * returns the text associated with the given identifier of a textEntryInteraction
 */
View.prototype.FillinNode.retrieveInteractionText = function(identifier){
	return this.spaceMaker(this.getDeclaration(identifier).correctResponses[0].response);
};

/**
 * Generates and returns a TD element that contains the allowable
 * answers and editing options that are associated with the given
 * identifier.
 */
View.prototype.FillinNode.generateAllowableAnswers = function(identifier){
	var allowableTD = createElement(document, 'td', {id: 'allowableTable'});
	var allowableText = document.createTextNode('Edit/add allowable answers for blank #' + this.getLineNumber(identifier));
	var declaration = this.getDeclaration(identifier);
	var addButton = createElement(document, 'input', {type: 'button', value: 'Add New', onclick: 'eventManager.fire("fillinAddNewAllowable","' + identifier + '")'});
	
	allowableTD.appendChild(allowableText);
	for(var i=0;i<declaration.correctResponses.length;i++){
		var entryInput = createElement(document, 'input', {type: 'text', id: 'entryInput_' + i, onkeyup: 'eventManager.fire("fillinEntryChanged","' + i + '")'});
		entryInput.value = declaration.correctResponses[i].response;
		var removeButton = createElement(document, 'input', {type: 'button', id: 'entryButton_' + i, value: 'remove', onclick: 'eventManager.fire("fillinRemoveAllowable",["' + identifier + '","' + i + '"])'});
		allowableTD.appendChild(createBreak());
		allowableTD.appendChild(entryInput);
		if(i!=0){
			allowableTD.appendChild(removeButton);
		};
	};
	allowableTD.appendChild(createBreak());
	allowableTD.appendChild(addButton);
	return allowableTD;
};

/**
 * Returns the blank number associated with this identifier
 */
View.prototype.FillinNode.getLineNumber = function(identifier){
	return parseInt(identifier.substring(identifier.length - 1, identifier.length)) + 1;
};

/**
 * Changes the appropriate mapping when an allowable answer is modified
 */
View.prototype.FillinNode.entryChanged = function(index){
 	var entryElement = document.getElementById('entryInput_' + index);
 	var value = entryElement.value;
 	var identifier = this.getSelectedIdentifier();
 	var declaration = this.getDeclaration(identifier);
 	var interaction = this.getInteraction(identifier);
 	
 	var response = declaration.correctResponses[index];
 	if(response.response!=value){
 		response.response = value;
 		if(index==0){ //then this is also the most correctResponse and also needs to be updated
 			document.getElementById('input_' + this.getSelectedIndex()).value = value;
 			document.getElementById('promptInput').value = this.generateFullText();
 		};
 		
 		//extend the expected lines if necessary
 		if(interaction.expectedLength < value.length){
 			interaction.expectedLength = value.length + 2;
 		};
 		
 		/* fire source updated event */
		this.view.eventManager.fire('sourceUpdated');
 	};
 };

/**
 * Removes an allowable answer for the responseDeclaration given the
 * identifier and the index of the allowable input
 */
 View.prototype.FillinNode.removeAllowable = function(identifier, index){
 	var parent = document.getElementById('allowableTable').parentNode;
 	
 	this.getDeclaration(identifier).correctResponses.splice(index,1);
 	parent.removeChild(document.getElementById('allowableTable'));
 	parent.appendChild(this.generateAllowableAnswers(this.getSelectedIdentifier()));
 	
 	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
 };

/**
 * Adds a new allowable answer for the responseDeclaration associated
 * with the given identifier
 */
 View.prototype.FillinNode.addNewAllowable = function(identifier){
 	var parent = document.getElementById('allowableTable').parentNode;
 	
 	this.getDeclaration(identifier).correctResponses.push({response:'',value:'1'});
 	parent.removeChild(document.getElementById('allowableTable'));
 	parent.appendChild(this.generateAllowableAnswers(identifier));
 	
 	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
 };

/**
 * Given an identifier, returns the associated responseDeclaration element from the content
 */
View.prototype.FillinNode.getDeclaration = function(identifier){
 	for(var t=0;t<this.content.assessmentItem.responseDeclarations.length;t++){
 		if(this.content.assessmentItem.responseDeclarations[t].identifier==identifier){
 			return this.content.assessmentItem.responseDeclarations[t];
 		};
 	};
};
 
 /**
  * Given an identifier, returns the associated textEntryInteraction element from the content
  */
View.prototype.FillinNode.getInteraction = function(identifier){
  	for(var a=0;a<this.content.assessmentItem.interaction.length;a++){
		if(this.content.assessmentItem.interaction[a].responseIdentifier==identifier){
			return this.content.assessmentItem.interaction[a];
		};
	};
};

/**
 * Creates a new fillin based on the selected text in the promptInput text area
 */
View.prototype.FillinNode.createFillin = function(){
	var start = document.getElementById('promptInput').selectionStart;
	var end = document.getElementById('promptInput').selectionEnd;
	
	/* make sure there are no overlaps */
	if(this.overlaps(start, end, true)){
		this.view.notificationManager.notify('The existing selection overlaps with another fillin. Either edit the existing fillin or remove it before proceeding. Exiting...', 3);
		return;
	};
	
	/* make sure text is selected */
	if(start==end){
		this.view.notificationManager.notify('Please select some text before creating a fillin. Exiting...', 3);
		return;
	};
	
	/* determine the location to insert new responseDeclaration in content */
	var location = 0;
	for(var k=0;k<this.fillinIndexes.length;k++){
		var startEnd = this.fillinIndexes[k].split('|');
		location = k;
		if(start<startEnd[0]){
			break;
		};
		if(k==this.fillinIndexes.length - 1){
			location = k + 1;
		};
	};
	
	/* then update content - textentry interaction, responsedeclaration */
	var identifier = 'response_' + location;
	this.createResponseDeclaration(identifier, this.fullText.substring(start, end), location);
	this.createTextInteraction(identifier, start, end, this.fullText.substring(start, end));
	
	/* regenerate page */
	this.regeneratePage();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Creates a responseDeclaration given an identifier and a correctResponse
 */
View.prototype.FillinNode.createResponseDeclaration = function(identifier, correctResponse, location){
	var declarations = this.content.assessmentItem.responseDeclarations;
	var interactions = this.getTextEntryInteractions();
	
	//get nextNode to insert responseDeclaration in right place and change identifiers for 
	//existing declarations appropriately as well as their associated textEntryInteractions
	if(declarations.length>0 && location < declarations.length){
		for(var s=location;s<declarations.length;s++){
			declarations[s].identifier = 'response_' + (s + 1);
			interactions[s].responseIdentifier = 'response_' + (s + 1);
		};
	};
	
	/* create declaration with appropriate values */
	var declaration = {correctResponses:[{response:correctResponse, value:'1'}], identifier:identifier};
	this.content.assessmentItem.responseDeclarations.splice(location,0,declaration);
};

/**
 * Returns only those interactions that have the type textEntryInteraction
 */
View.prototype.FillinNode.getTextEntryInteractions = function(){
	var interactions = [];
	for(var y=0;y<this.content.assessmentItem.interaction.length;y++){
		if(this.content.assessmentItem.interaction[y].type=='textEntryInteraction'){
			interactions.push(this.content.assessmentItem.interaction[y]);
		};
	};
	
	return interactions;
};

/**
 * Given an identifier that is associated with a responseDeclaration, the start and end indexes
 * of the characters in the full text that were selected by the user and the actual text between
 * those points, creates a textEntryInteraction element in the xmlPage at the appropriate point
 * and modifies the existing elements to accomodate the changes.
 */
View.prototype.FillinNode.createTextInteraction = function(identifier, start, end, fillinText){
	var runningText = '';
	for(var x=0;x<this.content.assessmentItem.interaction.length;x++){
		if(this.content.assessmentItem.interaction[x].type=='htmltext'){
			/* grab current text */
			var currentText = this.spaceMaker(this.content.assessmentItem.interaction[x].text);
			/* if start and end is included - then we need to modify existing element and insert new element here */
			if((runningText + currentText).length > start){
				/* create new textinteraction */
				var interaction = {type:'textEntryInteraction', responseIdentifier:identifier, expectedLength:(end-start)+2};
				
				/* create htmltext to hold any of the text after the new textinteraction text */
				var remainder = {type:'htmltext',text:currentText.substring(end - runningText.length, (runningText + currentText).length)};
				
				/* set the current html text to hold the text before the new textentryinteraction item */
				this.content.assessmentItem.interaction[x].text = currentText.substring(0, start - runningText.length);
				
				/* insert right after this one */
				this.content.assessmentItem.interaction.splice(x+1,0,interaction,remainder);
				return;
			} else {
				runningText += currentText;
			};
		} else if(this.content.assessmentItem.interaction[x].type=='textEntryInteraction'){
			runningText += this.retrieveInteractionText(this.content.assessmentItem.interaction[x].responseIdentifier);
		};
	};
};

/**
 * if the provided start or end overlaps with an existing fillin
 * this function returns true, otherwise, returns false
 */
View.prototype.FillinNode.overlaps = function(start, end, create){
	var runningText = '';
	var difference = this.getDifference();
	var realStart;
	var realEnd;
	
	if(difference > 0){
		/* deleting text */
		realStart = start;
		realEnd = end + difference;
	} else {
		/* adding text */
		realStart = start + difference - 1;
		realEnd = end - 1;
	};
	
	if(difference==0 && !create){
		/* no change */
		return false;
	} else {
		/* changed look for overlap */
		for(var x=0;x<this.content.assessmentItem.interaction.length;x++){
			if(this.content.assessmentItem.interaction[x].type=='htmltext'){
				runningText += this.spaceMaker(this.content.assessmentItem.interaction[x].text);
			} else if(this.content.assessmentItem.interaction[x].type=='textEntryInteraction'){
				var currentText = this.retrieveInteractionText(this.content.assessmentItem.interaction[x].responseIdentifier);
				var fullLength = (runningText + currentText).length;
				if((runningText.length > realStart && runningText.length < realEnd) || (fullLength > realStart && runningText < realEnd)){
					return true;
				};
				if(realStart >= runningText.length && realStart < fullLength){
					return true;
				};
				runningText += currentText;
			};
		};
	};
	return false;
};

/**
 * Returns a string with all '&nbsp;' replaced with a space
 */
View.prototype.FillinNode.spaceMaker = function(text){
	return text.toString().replace(/&nbsp;/g, ' ');
};

/**
 * Determines what user input has changed for the fillin and updates the content accordingly.
 */
View.prototype.FillinNode.fillinTextUpdated = function(){
	if(this.validate()){
		var difference = this.getDifference();
		if(difference==0){
			/* do nothing, no changes */
			return;
		} else if(difference>0){
			/* handle text removed case */
			var start = document.getElementById('promptInput').selectionStart;
			var end = start + difference;
			var runningText = '';
			for(var x=0;x<this.content.assessmentItem.interaction.length;x++){
				if(this.content.assessmentItem.interaction[x].type=='htmltext'){
					var currentText = this.spaceMaker(this.content.assessmentItem.interaction[x].text);
					if(start <= (runningText + currentText).length){
						/* this is where the change was made, update text */
						if(end <= (runningText + currentText).length){
							/* entire deletion occurs within this node */
							this.content.assessmentItem.interaction[x].text = currentText.substring(0, start - runningText.length) + currentText.substring(end - runningText.length, currentText.length);
							this.charCount -= difference;
							
							/* regenerate full text */
							this.generateFullText();
							
							/* fire source updated event */
							this.view.eventManager.fire('sourceUpdated');
							return;
						} else {
							/* deletion goes beyond this node */
							this.content.assessmentItem.interaction[x].text = currentText.substring(0, start - runningText.length);
							runningText += currentText;
							start = runningText.length;
						};
					} else {
						/* keep looking, the change was not here */
						runningText += currentText;
					};
				} else if(this.content.assessmentItem.interaction[x].type=='textEntryInteraction'){ //should never be the case that changed text is here.
					runningText += this.retrieveInteractionText(this.content.assessmentItem.interaction[x].responseIdentifier);
				};
			};
			/* set character count variable */
			this.charCount -= difference;
			
			/* generate the full text */
			this.generateFullText();
			
			/* fire source updated event */
			this.view.eventManager.fire('sourceUpdated');
		} else {
			/* handle text added case */
			var end = document.getElementById('promptInput').selectionStart;
			var start = end + difference;
			var newText = document.getElementById('promptInput').value.substring(start, end); //get new chars
			var runningText = '';
			if(this.content.assessmentItem.interaction.length>0){
				for(var x=0;x<this.content.assessmentItem.interaction.length;x++){
					if(this.content.assessmentItem.interaction[x].type=='htmltext'){
						if(this.content.assessmentItem.interaction[x].text && this.content.assessmentItem.interaction[x].text != ''){
							var currentText = this.spaceMaker(this.content.assessmentItem.interaction[x].text);
							if(start <= (runningText + currentText).length){
								/* this is where the change was made, update text */
								this.content.assessmentItem.interaction[x].text = currentText.substring(0, start - runningText.length) + newText + currentText.substring(start - runningText.length, currentText.length);
								
								/* update character count variable */
								this.charCount += newText.length;
								
								/* generate full text */
								this.generateFullText();
								
								/* fire source updated event */
								this.view.eventManager.fire('sourceUpdated');
								return;
							} else {
								runningText += currentText;
							};
						} else {
							/* no data in prompt - if this is the location add it here */
							this.content.assessmentItem.interaction[x].text = newText;
							
							/* update character count variable */
							this.charCount += newText.length;
							
							/* generate full text */
							this.generateFullText();
							
							/* fire source updated event */
							this.view.eventManager.fire('sourceUpdated');
							return;
						};
					} else if(this.content.assessmentItem.interaction[x].type=='textEntryInteraction'){
						runningText += this.retrieveInteractionText(this.content.assessmentItem.interaction[x].responseIdentifier);
					};
				};
			} else {
				/* this is the first added */
				this.content.assessmentItem.interaction.push({type:'htmltext', text:newText});
				
				/* update character count variable */
				this.charCount += newText.length;
				
				/* generate full text */
				this.generateFullText();
				
				/* fire source updated event */
				this.view.eventManager.fire('sourceUpdated');
				return;
			};
		};
	} else {
		this.regeneratePage();
	};
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 */
View.prototype.FillinNode.updateContent = function(){
	/* update content object */
	this.view.activeContent.setContent(this.content);
};

/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/fillin/authorview_fillin.js');
};