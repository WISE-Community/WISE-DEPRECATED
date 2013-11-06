/**
 * Sets the AssessmentList type as an object of this view
 * @constructor
 * @author hiroki
 */
View.prototype.AssessmentListNode = {};
View.prototype.AssessmentListNode.commonComponents = ['Prompt', 'LinkTo'];

/**
 * Generates the authoring page for assessment list node types
 */
View.prototype.AssessmentListNode.generatePage = function(view){
	this.view = view;
	this.content = this.view.activeContent.getContentJSON();
	
	var parent = document.getElementById('dynamicParent');
	
	/* wipe out old */
	parent.removeChild(document.getElementById('dynamicPage'));
	
	/* create new */
	var pageDiv = createElement(document, 'div', {id:'dynamicPage', style:'width:100%;height:100%'});
	var assessmentsDiv = createElement(document, 'div', {id: 'assessmentsDiv'});
	
	parent.appendChild(pageDiv);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(document.createTextNode("Assessment List Options:"));
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createElement(document, 'div', {id: 'assessmentOptionsContainer'}));
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(document.createTextNode("Enter instructions"));
	pageDiv.appendChild(createElement(document, 'div', {id: 'promptContainer'}));
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(assessmentsDiv);
	
	this.generateOptions();
	this.generateAssessments();
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 */
View.prototype.AssessmentListNode.getCommonComponents = function() {
	return this.commonComponents;
};

/**
 * Generates the options for an assessment list node
 */
View.prototype.AssessmentListNode.generateOptions = function(){
	var optionsHtml = '<table id="assessmentOptionsTable"><thead><tr><td>Display Answer After Submit</td><td>Lock After Submit</td><td>Complete All Before Exit</td></tr></thead>' + 
		'<tbody><tr><td><label for="displayRadioYes"><input type="radio" name="displayRadio" id="displayRadioYes" value="true" onclick="eventManager.fire(\'assessmentOptionChanged\',\'display\')"/>Yes</label></br>' +
		'<label for="displayRadioNo"><input type="radio" name="displayRadio" id="displayRadioNod" value="false" onclick="eventManager.fire(\'assessmentOptionChanged\',\'display\')"/>No</label></td>' +
		'<td><label for="lockRadioYes"><input type="radio" name="lockRadio" id="lockRadioYes" value="true" onclick="eventManager.fire(\'assessmentOptionChanged\',\'lock\')"/>Yes</label></br>' +
		'<label for="lockRadioNo"><input type="radio" name="lockRadio" id="lockRadioNo" value="false" onclick="eventManager.fire(\'assessmentOptionChanged\',\'lock\')"/>No</label></td>' +
		'<td><label for="completeRadioYes"><input type="radio" name="completeRadio" id="completeRadioYes" value="true" onclick="eventManager.fire(\'assessmentOptionChanged\',\'complete\')"/>Yes</label></br>' +
		'<label for="completeRadioNo"><input type="radio" name="completeRadio" id="completeRadioNo" value="false" onclick="eventManager.fire(\'assessmentOptionChanged\',\'complete\')"/>No</label></td></tr></tbody></table>';
	
	$('#assessmentOptionsContainer').append(optionsHtml);
	
	$('input[name=displayRadio]').filter('[value=' + this.content.displayAnswerAfterSubmit + ']').attr('checked', true);
	$('input[name=lockRadio]').filter('[value=' + this.content.isLockAfterSubmit + ']').attr('checked', true);
	$('input[name=completeRadio]').filter('[value=' + this.content.isMustCompleteAllPartsBeforeExit + ']').attr('checked', true);
	
	if(this.view.activeNode.peerReview) {
		/*
		 * this step is in a peer review sequence and requires
		 * specific assessment list options to be set. we will disable
		 * these options so that the author can't modify what they
		 * have been set to.
		 */
		$('input[name=displayRadio]').attr('disabled', true);
		$('input[name=lockRadio]').attr('disabled', true);
		$('input[name=completeRadio]').attr('disabled', true);
	}
};

/**
 * Given the option type, updates the corresponding option in the content
 * with the user specified value.
 * 
 * @param String - type
 */
View.prototype.AssessmentListNode.optionChanged = function(type){
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
 * Updates specified assessmentIndex.choiceIndex mc item's is correct value
 * 
 * @param assessmentItemIndex - integer index of assessment item
 * @param choiceIndex - integer index of choice item within assessment item
 */
View.prototype.AssessmentListNode.correctChoiceChanged = function(assessmentItemIndex,choiceIndex){
	// check to see if the checkbox was checked or not
	var checkedValue = $('input#isCorrectInput_'+assessmentItemIndex+'_'+choiceIndex).attr("checked");
	var isChecked = (checkedValue==="checked") ? true : false;
	var choiceItem = this.content.assessments[assessmentItemIndex].choices[choiceIndex];
	choiceItem.isCorrect = isChecked;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates specified assessmentIndex assessment's isAutoScoreEnabled value
 * Also updates UI by showing/hiding autoScoring options div.
 * 
 * @param assessmentItemIndex - integer index of assessment item
 */
View.prototype.AssessmentListNode.isAutoScoringEnabledChanged = function(assessmentItemIndex){
	// check to see if the checkbox was checked or not
	var checkedValue = $('input#isAutoScoreEnabledInput_'+assessmentItemIndex).attr("checked");
	var isChecked = (checkedValue==="checked") ? true : false;
	var assessmentItem = this.content.assessments[assessmentItemIndex];
	assessmentItem.isAutoScoreEnabled = isChecked;
	
	// show hide autoScoringDiv
	if (isChecked) {
		$(".choiceAutoScoreDiv_"+assessmentItemIndex).show();
	} else {
		$(".choiceAutoScoreDiv_"+assessmentItemIndex).hide();
	}
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};


/**
 * Generates the assessments creation elements
 */
View.prototype.AssessmentListNode.generateAssessments = function(){
	var parent = document.getElementById('assessmentsDiv');
	
	//remove old elements first
	while(parent.firstChild){
		parent.removeChild(parent.firstChild);
	};

	if(this.view.activeNode.peerReview == 'annotate') {
		//this step is part 2 of a peer review sequence
		
		//create the label and text area for the percentage trigger
		var peerReviewPercentageTriggerText = document.createTextNode('Enter the percentage of the class needed to open this step: ');
		var peerReviewPercentageTrigger = createElement(document, 'input', {type: 'text', id: 'peerReviewOpenPercentageTriggerInput', value: this.content.openPercentageTrigger, onkeyup: 'eventManager.fire("assessmentListPeerReviewPercentageTriggerUpdated")'});
		var peerReviewPercentageText = document.createTextNode('%');
		
		//add the label and text area to the div
		parent.appendChild(peerReviewPercentageTriggerText);
		parent.appendChild(peerReviewPercentageTrigger);
		parent.appendChild(peerReviewPercentageText);
		parent.appendChild(createBreak());
		
		//create the label and text area for the number trigger
		var peerReviewNumberTriggerText = document.createTextNode('Enter the number of students in the class needed to open this step: ');
		var peerReviewNumberTrigger = createElement(document, 'input', {type: 'text', id: 'peerReviewOpenNumberTriggerInput', value: this.content.openNumberTrigger, onkeyup: 'eventManager.fire("assessmentListPeerReviewNumberTriggerUpdated")'});

		//add the label and text area to the div
		parent.appendChild(peerReviewNumberTriggerText);
		parent.appendChild(peerReviewNumberTrigger);
		parent.appendChild(createBreak());
		
		//create label and text area for the authored work
		var peerReviewAuthoredWorkText = document.createTextNode('Enter the canned work: ');
		var peerReviewAuthoredWorkInput = createElement(document, 'textarea', {id: 'peerReviewAuthoredWorkInput', cols: '60', rows: '4', wrap: 'soft', onchange: 'eventManager.fire("assessmentListPeerReviewAuthoredWorkUpdated")'});
		
		//add the label and text area to the div
		parent.appendChild(peerReviewAuthoredWorkText);
		parent.appendChild(peerReviewAuthoredWorkInput);
		
		//set any previously set values for the authoredWork
		peerReviewAuthoredWorkInput.value = this.content.authoredWork;
		
		parent.appendChild(createBreak());
		parent.appendChild(createBreak());
		
		//create label and text area for the step not open custom message
		var peerReviewStepNotOpenCustomMessageText = document.createTextNode('Enter the step not open custom message: ');
		var peerReviewStepNotOpenCustomMessageInput = createElement(document, 'textarea', {id: 'peerReviewStepNotOpenCustomMessageInput', cols: '60', rows: '4', wrap: 'soft', onchange: 'eventManager.fire("assessmentListPeerReviewStepNotOpenCustomMessageUpdated")'});
		var peerReviewStepNotOpenCustomMessageNoteText = document.createTextNode('(note: if you delete everything in the textarea, it will re-populate with the default message. also, associatedStartNode.title will be replaced with the title of the first node in the review sequence when this is displayed to the student.)');
		
		//add the label and text area to the div
		parent.appendChild(peerReviewStepNotOpenCustomMessageText);
		parent.appendChild(peerReviewStepNotOpenCustomMessageInput);
		parent.appendChild(createBreak());
		parent.appendChild(peerReviewStepNotOpenCustomMessageNoteText);
		
		//set any previously set values for the step not open custom message
		peerReviewStepNotOpenCustomMessageInput.value = this.content.stepNotOpenCustomMessage;
		
		parent.appendChild(createBreak());
	}

	parent.appendChild(createBreak());
	
	if(this.content.assessments.length>0){
		var assText = document.createTextNode("Existing Assessments");
	} else {
		var assText = document.createTextNode("Create Assessments");
	};
	
	parent.appendChild(assText);
	parent.appendChild(createBreak());
	
	//create current mod elements
	for(var a=0;a<this.content.assessments.length;a++){
		var assDiv = createElement(document, 'div', {id: 'assDiv_' + a});
		var assText = document.createTextNode('Assessment Item');
		if (this.content.assessments[a].type == "radio") {
			var typeText = document.createTextNode("Type: Multiple Choice");
		} else if (this.content.assessments[a].type == "text") {
			var typeText = document.createTextNode("Type: Open Response");
		};
		
		var promptText = document.createTextNode("Prompt: ");
		
		var promptInput = createElement(document, 'textarea', {id: 'promptInput_' + a, cols: '60', rows: '4', wrap: 'soft', onchange: "eventManager.fire('assessmentlistFieldUpdated',['prompt','" + a + "'])"});
		
		//populate the prompt text
		promptInput.value = this.content.assessments[a].prompt;
		

		parent.appendChild(assDiv);
		assDiv.appendChild(assText);
		assDiv.appendChild(createBreak());
		assDiv.appendChild(typeText);
		assDiv.appendChild(createBreak());
		assDiv.appendChild(promptText);
		assDiv.appendChild(promptInput);
		assDiv.appendChild(createBreak());		

		if (this.content.assessments[a].type == "radio") {
			var choiceText = document.createTextNode("Choices: ");
			assDiv.appendChild(choiceText);
			assDiv.appendChild(createBreak());
			// add "enable automated scoring" checkbox
			if (this.content.assessments[a].isAutoScoreEnabled) {
				var isAutoScoringEnabledInput = createElement(document, "input", 
					{id:'isAutoScoreEnabledInput_' + a, type:"checkbox", "class":"isAutoScoringEnabledInput", checked:"checked", 
				     onclick:"eventManager.fire('assessmentListIsAutoScoringEnabledChanged',["+a+"])"});			
			} else {
				var isAutoScoringEnabledInput = createElement(document, "input", 
						{id:'isAutoScoreEnabledInput_' + a, type:"checkbox", "class":"isAutoScoringEnabledInput", 
					     onclick:"eventManager.fire('assessmentListIsAutoScoringEnabledChanged',["+a+"])"});			
			}
			assDiv.appendChild(isAutoScoringEnabledInput);
			assDiv.appendChild(document.createTextNode("Enable automated scoring for this item"));
			
			var choices = this.content.assessments[a].choices;
			for (var c=0; c<choices.length; c++) {
				var choiceText = choices[c].text;
				var choiceDiv = createElement(document, 'div', {"class":'assessmentlistRadioItemDiv'});
				
				// add choice text input
				var choiceInput = createElement(document, 'input', 
						{id: 'textInput_' + a + '_' + c, 'class':'assessmentlistRadioItemInput', type:'text', size:'80',
						 name:'choiceInput',value:choiceText,wrap:'hard',
						 onkeyup:"eventManager.fire('assessmentlistRadioItemFieldUpdated',['text','"+ a +"','"+ c +"'])"});
				choiceDiv.appendChild(choiceInput);
				choiceDiv.appendChild(createBreak());

				// create choiceAutoScoreDiv that will contain isCorrect and score fields.
				if (this.content.assessments[a].isAutoScoreEnabled) {
					var choiceAutoScoreDiv = createElement(document, 'div', {id:'choiceAutoScoreDiv_' + a + '_' + c, 'class':'choiceAutoScoreDiv_'+a});
				} else {
					var choiceAutoScoreDiv = createElement(document, 'div', {id:'choiceAutoScoreDiv_' + a + '_' + c, 'class':'choiceAutoScoreDiv_'+a, 'style':'display:none'});				
				}
				// add "this is correct choice" checkbox
				if (choices[c].isCorrect) {
					var isCorrectCheckbox = createElement(document, "input", 
							{id:'isCorrectInput_' + a + '_' + c, type:"checkbox", "class":"isCorrectInput", checked:"checked", 
						     onclick:"eventManager.fire('assessmentListCorrectChoiceChanged',["+a+","+c+"])"});
				} else {
					var isCorrectCheckbox = createElement(document, "input", 
							{id:'isCorrectInput_' + a + '_' + c, type:"checkbox", "class":"isCorrectInput", 
						     onclick:"eventManager.fire('assessmentListCorrectChoiceChanged',["+a+","+c+"])"});
				}		
				choiceAutoScoreDiv.appendChild(isCorrectCheckbox);
				choiceAutoScoreDiv.appendChild(document.createTextNode("This is a correct choice."));
				choiceAutoScoreDiv.appendChild(createBreak());

				// add Score field
				choiceAutoScoreDiv.appendChild(document.createTextNode("Score:"));
				var choiceScore = (choices[c].choiceScore || choices[c].choiceScore == 0) ? choices[c].choiceScore : null;
				var choiceScoreInput = createElement(document, "input",							
						{id:'choiceScoreInput_' + a + '_' + c, type:"text", "class":"choiceScoreInput",size:'5',
						 name:'choiceScoreInput',value:choiceScore,wrap:'hard',
						 onkeyup:"eventManager.fire('assessmentlistRadioItemFieldUpdated',['choiceScore',"+ a +","+ c +"])"});
				choiceAutoScoreDiv.appendChild(choiceScoreInput);
				choiceDiv.appendChild(choiceAutoScoreDiv);
				choiceDiv.appendChild(createBreak());

				// add "Remove this choice" button
				var removeChoiceButt = createElement(document, 'input', {type:'button',id:'removeChoiceButt',value:'remove choice',onclick: "eventManager.fire('assessmentlistRadioItemRemoveChoice',['"+ a +"','"+ c +"'])"});
				choiceDiv.appendChild(removeChoiceButt);
				assDiv.appendChild(choiceDiv);
				assDiv.appendChild(createBreak());
			};
			var addChoiceButt = createElement(document, 'input', {type:'button',id:'addChoiceButt',value:'add choice',onclick: "eventManager.fire('assessmentlistAddChoice','"+ a + "')"});
			assDiv.appendChild(addChoiceButt);
			assDiv.appendChild(createBreak());
		} else if(this.content.assessments[a].type == "text") {
			var richTextEditorText = document.createTextNode("Use Rich Text Editor");
			/* not sure if we really need rich text editor for assessmentlist at this time
			assDiv.appendChild(richTextEditorText);
			assDiv.appendChild(this.generateRichText(a));
			assDiv.appendChild(createBreak());
			*/
			assDiv.appendChild(this.generateStarter(a));
			assDiv.appendChild(createBreak());
		}
		
		if(this.view.activeNode.peerReview == 'annotate') {
			//this step is part of a peer review sequence so we need to add the check boxes for important part
			
			//create the checkbox
			var richTextChoice = createElement(document, 'input', {id: 'importantPart_' + a, type: 'checkbox', onclick: 'eventManager.fire("assessmentListUpdateImportantReviewSequencePart", "' + a + '")'});
			
			//create the text associated with the checkbox
			var importantPartText = document.createTextNode("Important Review Sequence Part");

			//check if this assessment part is set to important
			var isImportantReviewSequencePart = this.content.assessments[a].isImportantReviewSequencePart;
			
			if(isImportantReviewSequencePart) {
				//check the check box since it is important
				richTextChoice.checked = true;
			}
			
			//add the elements to the div
			assDiv.appendChild(richTextChoice);
			assDiv.appendChild(importantPartText);
			assDiv.appendChild(createBreak());
			assDiv.appendChild(createBreak());
		}
		
		var removeButt = createElement(document, 'input', {type: 'button', id: 'removeButt', value: 'remove item', onclick: "eventManager.fire('assessmentlistRemoveItem','" + a + "')"});
		
		assDiv.appendChild(removeButt);
		assDiv.appendChild(createBreak());
		assDiv.appendChild(createBreak());
	};
	
	//create buttons to create new assessments
	var createNewRadioButt = createElement(document, 'input', {type:'button', value:'add new multiple choice item', onclick:"eventManager.fire('assessmentlistAddNewItem','radio')"});
	parent.appendChild(createNewRadioButt);
	var createNewOpenResponseButt = createElement(document, 'input', {type:'button', value:'add new open response item', onclick:"eventManager.fire('assessmentlistAddNewItem','text')"});
	parent.appendChild(createNewOpenResponseButt);
};

/**
 * Generates the starter sentence input options for this open response item
 */
View.prototype.AssessmentListNode.generateStarter = function(ndx){
	//create div for starterSentence options
	var starterDiv = createElement(document, 'div', {id: 'starterDiv_'+ndx});
	
	//create starter sentence options
	var noStarterInput = createElement(document, 'input', {type: 'radio', name: 'starterRadio_'+ndx, onclick: "eventManager.fire('assessmentlistStarterOptionChanged','"+ ndx +"')", value: '0'});
	var starterOnClickInput = createElement(document, 'input', {type: 'radio', name: 'starterRadio_'+ndx, onclick: "eventManager.fire('assessmentlistStarterOptionChanged','"+ ndx +"')", value: '1'});
	var starterImmediatelyInput = createElement(document, 'input', {type: 'radio', name: 'starterRadio_'+ndx, onclick: "eventManager.fire('assessmentlistStarterOptionChanged','"+ ndx +"')", value: '2'});
	var starterSentenceInput = createElement(document, 'textarea', {id: 'starterSentenceInput_'+ndx, cols: '60', rows: '4', wrap: 'soft', onchange: "eventManager.fire('assessmentlistStarterSentenceUpdated','"+ ndx +"')"});
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
	starterSentenceInput.value = this.content.assessments[ndx].starter.text;
	
	//set appropriate radio button and enable/disable textarea
	var displayOption = this.content.assessments[ndx].starter.display;
	
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
 * Updates this content when the starter sentence option has changed.
 */
View.prototype.AssessmentListNode.starterOptionChanged = function(ndx){
	var options = document.getElementsByName('starterRadio_'+ndx);
	var optionVal;
	
	/* get the checked option and update the content's starter sentence attribute */
	for(var q=0;q<options.length;q++){
		if(options[q].checked){
			this.content.assessments[ndx].starter.display = options[q].value;
			if(options[q].value=='0'){
				document.getElementById('starterSentenceInput_'+ndx).disabled = true;
			} else {
				document.getElementById('starterSentenceInput_'+ndx).disabled = false;
			};
		};
	};
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates content with text in starter sentence textarea
 */
View.prototype.AssessmentListNode.starterSentenceChanged = function(ndx){
	/* update content */
	this.content.assessments[ndx].starter.text = document.getElementById('starterSentenceInput_'+ndx).value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Generates and returns an HTML Input Element of type checkbox 
 * used to determine whether a rich text editor should be used.
 */
View.prototype.AssessmentListNode.generateRichText = function(ndx){
	var richTextChoice = createElement(document, 'input', {id: 'richTextChoice_' + ndx, type: 'checkbox', onclick: "eventManager.fire('assessmentlistUpdateRichText','"+ ndx +"')"});
	
	/* set whether this input is checked */
	richTextChoice.checked = this.content.assessments[ndx].isRichTextEditorAllowed;
	
	return richTextChoice;
};

/**
 * Updates the richtext option in the content and updates the preview page.
 */
View.prototype.AssessmentListNode.updateRichText = function(ndx){
	this.content.assessments[ndx].isRichTextEditorAllowed = document.getElementById('richTextChoice_'+ndx).checked;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Creates a new dummy assessment object and adds it to the mods array
 */
View.prototype.AssessmentListNode.addNewItem = function(type){
	if (type == "radio") {
		var item = {id:this.view.activeNode.utils.generateKey(),
			    type:'radio',
			    prompt:'Edit prompt here',
			    choices:[]
			    };
	
		this.content.assessments.push(item);
		this.generateAssessments();
		
		/* fire source updated event */
		this.view.eventManager.fire('sourceUpdated');
	} else if (type == "text"){
		var item = {id:this.view.activeNode.utils.generateKey(),
			    type:'text',
			    prompt:'Edit prompt here',
			    isRichTextEditorAllowed:false,
			    starter: {
					display:1,
					text: 'Edit starter sentence here'
				}
			    };
	
		this.content.assessments.push(item);
		this.generateAssessments();
		
		/* fire source updated event */
		this.view.eventManager.fire('sourceUpdated');
	}
};

/**
 * Creates a new dummy choice adds it to the array
 */
View.prototype.AssessmentListNode.addChoice = function(ndx){
	var choice = {id:this.view.activeNode.utils.generateKey(),
			    text:["Enter choice text here"]
			    };
	
	this.content.assessments[ndx].choices.push(choice);
	this.generateAssessments();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Removes assessment item at specified index
 */
View.prototype.AssessmentListNode.removeItem = function(ndx){
	this.content.assessments.splice(ndx,1);
	this.generateAssessments();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * removes a specific choice from a specific assessment item obj
 * ndx = index of choice assessment obj in assessments array
 * idx = index of choice obj in the choice assessment obj
 */
View.prototype.AssessmentListNode.radioItemRemoveChoice = function(ndx,idx){

	this.content.assessments[ndx].choices.splice(idx,1);
	this.generateAssessments();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

View.prototype.AssessmentListNode.populatePrompt = function() {
	$('#promptInput').val(this.content.prompt);
};

/**
 * Updates the prompt value of the content to the user specified value and 
 * refreshes the preview.
 */
View.prototype.AssessmentListNode.updatePrompt = function(){
	/* update content */
	var content = '';
	if(typeof tinymce != 'undefined' && $('#promptInput').tinymce()){
		content = $('#promptInput').tinymce().getContent();
	} else {
		content = $('#promptInput').val();
	}
	
	this.content.prompt = content;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates a assessmentitem, at the given index, filed of the given name
 * with the given value.
 */
View.prototype.AssessmentListNode.fieldUpdated = function(name,ndx){
	this.content.assessments[ndx][name] = document.getElementById(name + 'Input_' + ndx).value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates a assessmentitem's field, at the given index, filed of the given name
 * with the given value.
 */
View.prototype.AssessmentListNode.radioItemFieldUpdated = function(name,ndx,idx){
	var fieldValue = document.getElementById(name + 'Input_' + ndx + '_' + idx).value;
	if (name == "choiceScore") {
		// parse it to an integer
		fieldValue = parseInt(fieldValue);
	}
	this.content.assessments[ndx].choices[idx][name] = fieldValue;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the isImportantReviewSequencePart field of an assessment part
 * @param ndx the assessment part index
 */
View.prototype.AssessmentListNode.updateImportantReviewSequencePart = function(ndx){
	var index = parseInt(ndx);
	
	//see if the checkbox was checked in the UI and set the content accordingly
	this.content.assessments[index].isImportantReviewSequencePart = $('#importantPart_' + index).attr('checked');
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the content with the value from the textarea
 */
View.prototype.AssessmentListNode.peerReviewAuthoredWorkUpdated = function(){
	this.content.authoredWork = $('#peerReviewAuthoredWorkInput').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the content with the value from the text input
 */
View.prototype.AssessmentListNode.peerReviewPercentageTriggerUpdated = function(){
	this.content.openPercentageTrigger = $('#peerReviewOpenPercentageTriggerInput').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the content with the value from the text input
 */
View.prototype.AssessmentListNode.peerReviewNumberTriggerUpdated = function(){
	this.content.openNumberTrigger = $('#peerReviewOpenNumberTriggerInput').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the content with the value from the text input
 */
View.prototype.AssessmentListNode.peerReviewStepNotOpenCustomMessageUpdated = function(){
	var customMessage = $('#peerReviewStepNotOpenCustomMessageInput').val();
	
	if(customMessage == "") {
		//custom message field is empty so we will re-populate it with the default message
		customMessage = '<p>This step is not available yet.</p></p><p>More of your peers need to submit a response for step <b>"associatedStartNode.title"</b>. <br/>You will then be assigned a response to review.</p><p>Please return to this step again in a few minutes.</p>';
		$('#peerReviewStepNotOpenCustomMessageInput').val(customMessage);
	}
	
	this.content.stepNotOpenCustomMessage = customMessage;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 */
View.prototype.AssessmentListNode.updateContent = function(){
	/* update content object */
	this.view.activeContent.setContent(this.content);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/assessmentlist/authorview_assessmentlist.js');
};