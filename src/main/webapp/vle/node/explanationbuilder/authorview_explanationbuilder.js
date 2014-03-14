/**
 * Sets the TemplateNode type as an object of this view
 * @constructor
 * xTODO: rename TemplateNode
 */
View.prototype.ExplanationBuilderNode = {};

/*
 * Add the name of the common component that this step will use. The
 * common components will be handled by the authoring tool. You will
 * need to create div elements with the appropriate id for the
 * authoring tool to insert the component into. Any additional custom
 * authoring components specific to your step type will be written 
 * by you in the generatePage() function. You may leave the array
 * empty if you are not using any common components.
 * 
 * Here are the available common components
 * 'Prompt'
 * 'LinkTo'
 * 'StudentResponseBoxSize'
 * 'RichTextEditorToggle'
 * 'StarterSentenceAuthoring'
 * 
 * If you use a common components, you must create a div with the
 * appropriate id, here are the respective ids
 * 'promptContainer'
 * (LinkTo does not require a div)
 * 'studentResponseBoxSizeContainer'
 * 'richTextEditorToggleContainer'
 * 'starterSentenceAuthoringContainer'
 * 
 * 
 * xTODO: rename TemplateNode
 */
View.prototype.ExplanationBuilderNode.commonComponents = [];

/**
 * Generates the authoring page. This function will create the authoring
 * components such as textareas, radio buttons, check boxes, etc. that
 * authors will use to author the step. For example if the step has a
 * text prompt that the student will read, this function will create
 * a textarea that will allow the author to type the text that the
 * student will see. You will also need to populate the textarea with
 * the pre-existing prompt if the step has been authored before.
 * 
 * xTODO: rename TemplateNode
 */
View.prototype.ExplanationBuilderNode.generatePage = function(view){
	this.view = view;
	
	//get the content of the step
	this.content = this.view.activeContent.getContentJSON();
	
	this.version = 1;
	//get the Idea Manager version
	if('ideaManagerSettings' in this.view.projectMeta.tools){
		this.version = this.view.projectMeta.tools.ideaManagerSettings.version;
	}
	
	//get the html element that all the authoring components will be located
	var parent = document.getElementById('dynamicParent');
	
	/*
	 * wipe out the div that contains the authoring components because it
	 * may still be populated with the authoring components from a previous
	 * step the author has been authoring since we re-use the div id
	 */
	parent.removeChild(document.getElementById('dynamicPage'));

	//create a new div that will contain the authroing components
	var pageDiv = createElement(document, 'div', {id:'dynamicPage', style:'width:100%;height:100%'});
	
	//create the label for the require work checkbox
	var requireWorkText = document.createTextNode("Require students to complete this step before moving forward:");
	
	//create the checkbox for requiring students to complete work on the step before moving on in the project
	var requireWorkToggle = createElement(document, 'input', {id: 'requireWorkToggle', type: 'checkbox', onclick: 'eventManager.fire("explanationBuilderUpdateWorkRequired")'});
	
	//create the label for the textarea that the author will write the prompt in
	var promptText = document.createTextNode("Prompt/Question for Students:");
	
	/*
	 * create the textarea that the author will write the prompt in
	 * 
	 * onkeyup will fire the 'templateUpdatePrompt' event which will
	 * be handled in the <new step type name>Events.js file
	 * 
	 * For example if you are creating a quiz step you would look in
	 * your quizEvents.js file.
	 * 
	 * when you add new authoring components you will need to create
	 * new events in the <new step type name>Events.js file and then
	 * create new functions to handle the event
	 */
	var promptTextArea = createElement(document, 'textarea', {id: 'promptTextArea', rows:'3', cols:'85', onkeyup:"eventManager.fire('explanationBuilderUpdatePrompt')"});
	
	//create the text for the enable student text area checkbox
	var enableStudentTextAreaText = document.createTextNode("Enable Student Response Box:");
	
	//create the checkbox for enabling the student response area
	var enableStudentTextAreaCheckBox = createElement(document, 'input', {id: 'enableStudentTextAreaCheckBox', type: 'checkbox', onclick: 'eventManager.fire("explanationBuilderUpdateEnableStudentTextAreaCheckBox")'});
	enableStudentTextAreaCheckBox.checked = true;
	
	// create the section for student response area
	var instructionsTextAreaDiv = document.createElement('div');
	$(instructionsTextAreaDiv).attr('id','instructions');
	
	//create the label for the textarea that the author will write the instructions in
	var instructionsText = document.createTextNode("Instructions for Student Response:");
	
	//get the instructions
	var instructionsValue = this.content.instructions;
	
	if(instructionsValue == null) {
		//set instructions to empty string if instructions is not in the content
		instructionsValue = "";
	}
	
	//create the textarea that the author will write the instructions in
	var instructionsTextArea = createElement(document, 'textarea', {id: 'instructionsTextArea', rows:'3', cols:'85', onkeyup:"eventManager.fire('explanationBuilderUpdateInstructions')"});

	//populate the instructions text area
	instructionsTextArea.value = instructionsValue;
	
	//get the existing background url
	var background = this.content.background;
	
	//the label for the background url input
	var backgroundImageUrlLabel = document.createTextNode("Organizing Space Background Image:");
	var maxImageSizeLabel = document.createTextNode(" - organizing space dimensions are 640x480 pixels");
	//the text input for the background url
	var backgroundImageUrl = createElement(document, 'input', {type: 'text', id: 'backgroundImageUrl', name: 'backgroundImageUrl', value: background, size:50, onchange: 'eventManager.fire("explanationBuilderUpdateBackgroundImageUrl")'});
	//create the browse button that allows author to choose swf from project assets
	var backgroundBrowseButton = $(createElement(document, 'button', {id: 'backgroundBrowseButton', onclick:'eventManager.fire("explanationBuilderBrowseClicked")'})).text('Browse');
	
	//the label for the background align drop-down select
	var backgroundAlignLabel = document.createTextNode("Background Alignment: ");
	//create the background align drop-down select
	var backgroundAlignSelect = $(createElement(document, 'select', {id: 'backgroundAlignSelect', onchange:'eventManager.fire("explanationBuilderUpdateBgAlign")'}));
	//create the options for background align drop-down select
	var leftTopOption = $(createElement(document, 'option', {value: 'left-top'})).append($(document.createTextNode('Left-Top')));
	var leftMiddleOption = $(createElement(document, 'option', {value: 'left-middle'})).append($(document.createTextNode('Left-Middle')));
	var leftBottomOption = $(createElement(document, 'option', {value: 'left-bottom'})).append($(document.createTextNode('Left-Bottom')));
	var centerTopOption = $(createElement(document, 'option', {value: 'center-top'})).append($(document.createTextNode('Center-Top')));
	var centerMiddleOption = $(createElement(document, 'option', {value: 'center-middle'})).append($(document.createTextNode('Center-Middle')));
	var centerBottomOption = $(createElement(document, 'option', {value: 'center-bottom'})).append($(document.createTextNode('Center-Bottom')));
	var rightTopOption = $(createElement(document, 'option', {value: 'right-top'})).append($(document.createTextNode('Right-Top')));
	var rightMiddleOption = $(createElement(document, 'option', {value: 'right-middle'})).append($(document.createTextNode('Right-Middle')));
	var rightBottomOption = $(createElement(document, 'option', {value: 'right-bottom'})).append($(document.createTextNode('Right-Bottom')));
	
	$(backgroundAlignSelect).append(leftTopOption).append(leftMiddleOption).append(leftBottomOption).append(centerTopOption).append(centerMiddleOption).append(centerBottomOption).append(rightTopOption).append(rightMiddleOption).append(rightBottomOption);
	
	//add the authoring components to the page
	pageDiv.appendChild(requireWorkText);
	pageDiv.appendChild(requireWorkToggle);
	pageDiv.appendChild(createBreak());
	
	if(this.version > 1){
		//the label for the background align drop-down select
		var chooseAttributeLabel = $(document.createTextNode("Choose which idea attribute to show: "));
		var chooseAttribute = $(createElement(document,'select',{id: 'attributeSelect', onchange: 'eventManager.fire("explanationBuilderUpdateAttribute")'}));
		var attributes = this.view.getProjectMetadata().tools.ideaManagerSettings.ideaAttributes;
		for(var i=0;i<attributes.length;i++){
			var option = $(createElement(document, 'option', {value: attributes[i].id})).append($(document.createTextNode((i+1).toString() + ': ' + attributes[i].name + ' (Type: ' + this.view.utils.capitalize(attributes[i].type) + ')')));
			if(i==0){
				option.attr('checked','checked');
			}
			chooseAttribute.append(option);
		}
		chooseAttribute.append($(createElement(document, 'option', {value: ''})).append($(document.createTextNode('None'))));
		$(pageDiv).append(chooseAttributeLabel).append(chooseAttribute);
		pageDiv.appendChild(createBreak());
	}
	
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(promptText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(promptTextArea);
	pageDiv.appendChild(createBreak());
	
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(enableStudentTextAreaText);
	pageDiv.appendChild(enableStudentTextAreaCheckBox);
	pageDiv.appendChild(createBreak());
	
	instructionsTextAreaDiv.appendChild(instructionsText);
	instructionsTextAreaDiv.appendChild(createBreak());
	instructionsTextAreaDiv.appendChild(instructionsTextArea);
	pageDiv.appendChild(instructionsTextAreaDiv);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(backgroundImageUrlLabel);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(maxImageSizeLabel);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(backgroundImageUrl);
	$(pageDiv).append(backgroundBrowseButton);
	pageDiv.appendChild(createBreak());
	$(pageDiv).append(backgroundAlignLabel);
	$(pageDiv).append(backgroundAlignSelect);
	
	//add the filter ideas authoring
	this.addFilterIdeasAuthoring(pageDiv);
	
	//add the page to the parent
	parent.appendChild(pageDiv);
	
	//populate the prompt if this step has been authored before
	this.populatePrompt();
	
	//populate the enable student text area checkbox
	if(!this.content.enableStudentTextArea) {
		enableStudentTextAreaCheckBox.checked = false;
		$('#instructions').hide();
	}
	
	//populate the require work checkbox
	if("isMustComplete" in this.content && this.content.isMustComplete) {
		requireWorkToggle.checked = true;
	}
	
	//populate the background align select
	if("bgPosition" in this.content) {
		$('#backgroundAlignSelect').val(this.content.bgPosition);
	}
	
	if(this.version > 1){
		//populate which attribute to show if this step has been authored before
		this.populateAttribute(attributes);
	}
};

/**
 * Add the authoring for filtering ideas
 * @param pageDiv the authoring page div
 */
View.prototype.ExplanationBuilderNode.addFilterIdeasAuthoring = function(pageDiv) {
	//create the label for the filter ideas checkbox
	var filterIdeasLabel = $(document.createTextNode("Filter Ideas: "));
	
	//create the filter ideas checkbox
	var filterIdeasCheckBox = $('<input>');
	filterIdeasCheckBox.attr('id', 'filterIdeasCheckBox');
	filterIdeasCheckBox.attr('type', 'checkbox');
	filterIdeasCheckBox.click({thisContext:this}, this.filterIdeasCheckBoxClicked);
	
	//create the div that will contain the select option boxes to choose which steps to filter
	var filterIdeasDiv = $('<div>');
	filterIdeasDiv.attr('id','filterIdeasDiv');
	filterIdeasDiv.attr('display', 'none');
	
	//create a table to hold the select option boxes and buttons for filtering steps
	var filterIdeasTable = $('<table>');
	var filterIdeasTR = $('<tr>');
	
	//get all the step node ids in the project
	var nodeIdsInProject = this.view.getProject().getNodeIds();
	
	if(this.content.nodeIdsToFilter == null) {
		this.content.nodeIdsToFilter = [];
	}
	
	//get all the node ids to filter on
	var nodeIdsToFilter = this.content.nodeIdsToFilter;

	//get all the node ids that are not in the nodeIdsToFilter on
	var projectSteps = this.removeElementsFromArray(nodeIdsInProject, nodeIdsToFilter);
	
	//create the TD that will contain the project steps
	var filterIdeasProjectStepsTD = $('<td>');
	filterIdeasProjectStepsTD.css('width', '200px');
	
	//create the project steps select box
	var filterIdeasProjectSteps = $('<select>');
	filterIdeasProjectSteps.attr('id', 'filteredIdeasProjectStepsSelect');
	filterIdeasProjectSteps.attr('size', 15);
	filterIdeasProjectSteps.attr('multiple', true);
	filterIdeasProjectSteps.css('width', '200px');
	
	//fill the project steps select box
	for(var x=0; x<projectSteps.length; x++) {
		//get the node id
		var projectStepNodeId = projectSteps[x];
		
		//get the step number and title
		var projectStepNodeTitle = this.view.getProject().getStepNumberAndTitle(projectStepNodeId);
		
		//create the option
		var tempOption = $('<option>');
		tempOption.attr('value', projectStepNodeId);
		tempOption.text(projectStepNodeTitle)
		
		//add the option to the project steps select box
		filterIdeasProjectSteps.append(tempOption);
	}
	
	//add the project steps label and select box
	filterIdeasProjectStepsTD.append('Project Steps');
	filterIdeasProjectStepsTD.append(filterIdeasProjectSteps);
	
	//create the TD that will contain the add step and remove step button
	var filterIdeasButtonsTD = $('<td>');
	filterIdeasButtonsTD.css('text-align', 'center');
	filterIdeasButtonsTD.css('vertical-align', 'middle');
	
	//create the add step button
	var addFilteredStepButton = $('<input>');
	addFilteredStepButton.attr('type', 'button');
	addFilteredStepButton.val('Add Step =>');
	addFilteredStepButton.click({thisContext:this}, this.addFilteredStepButtonClicked);
	
	//create the remove step button
	var removeFilteredStepButton = $('<input>');
	removeFilteredStepButton.attr('type', 'button');
	removeFilteredStepButton.val('<= Remove Step');
	removeFilteredStepButton.click({thisContext:this}, this.removeFilteredStepButtonClicked);
	
	//add the buttons to the TD
	filterIdeasButtonsTD.append(addFilteredStepButton);
	filterIdeasButtonsTD.append('<br>');
	filterIdeasButtonsTD.append('<br>');
	filterIdeasButtonsTD.append('<br>');
	filterIdeasButtonsTD.append(removeFilteredStepButton);
	
	//create the TD that will contain the filtered steps select box
	var filterIdeasFilteredStepsTD = $('<td>');
	filterIdeasFilteredStepsTD.css('width', '200px');
	
	//create the filtered steps select box
	var filterIdeasFilteredSteps = $('<select>');
	filterIdeasFilteredSteps.attr('size', 15);
	filterIdeasFilteredSteps.attr('id', 'filteredIdeasFilteredStepsSelect');
	filterIdeasFilteredSteps.attr('multiple', true);
	filterIdeasFilteredSteps.css('width', '200px');
	
	//fill the filtered steps select box
	for(var y=0; y<nodeIdsToFilter.length; y++) {
		//get the node id
		var filteredStepNodeId = nodeIdsToFilter[y];
		
		//get the step number and title
		var filteredStepNodeTitle = this.view.getProject().getStepNumberAndTitle(filteredStepNodeId);
		
		//create the option
		var tempOption = $('<option>');
		tempOption.attr('value', filteredStepNodeId);
		tempOption.text(filteredStepNodeTitle)
		
		//add the option to the filtered steps select box
		filterIdeasFilteredSteps.append(tempOption);
	}
	
	//add the filtered steps label and select box
	filterIdeasFilteredStepsTD.append('Filtered Steps');
	filterIdeasFilteredStepsTD.append(filterIdeasFilteredSteps);
	
	//add the TDs to the div
	filterIdeasDiv.append(filterIdeasProjectStepsTD);
	filterIdeasDiv.append(filterIdeasButtonsTD);
	filterIdeasDiv.append(filterIdeasFilteredStepsTD);
	
	//add line breaks for spacing
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	
	//add the label, checkbox, and div
	$(pageDiv).append(filterIdeasLabel);
	$(pageDiv).append(filterIdeasCheckBox);
	$(pageDiv).append(filterIdeasDiv);
	
	if(this.content.filterIdeasByNodeIds == null) {
		this.content.filterIdeasByNodeIds = false;
	}
	
	//populate the values from the content
	if(this.content.filterIdeasByNodeIds) {
		//we are filtering ideas so we will check the box and display the div
		filterIdeasCheckBox.attr('checked', true);
		filterIdeasDiv.show();
	} else {
		//we are not filtering ideas so we will hide the div
		filterIdeasDiv.hide();
	}
};

/**
 * Called when the Add Step button is clicked
 * @param event the fired event jquery object
 */
View.prototype.ExplanationBuilderNode.addFilteredStepButtonClicked = function(event) {
	var thisContext = event.data.thisContext;
	thisContext.addFilteredStepButtonClickedHandler();
};

/**
 * Handles the logic for when the Add Step button is clicked
 */
View.prototype.ExplanationBuilderNode.addFilteredStepButtonClickedHandler = function() {
	//get all the selected options in the project steps select box
	var selectedOptions = $('#filteredIdeasProjectStepsSelect option:selected');
	
	var selectedNodeIds = [];

	//accumulate all the node ids that were selected
	for(var x=0; x<selectedOptions.length; x++) {
		//get an option
		var selectedOption = selectedOptions[x];
		
		//get the value which will be the node id
		var selectedOptionValue = $(selectedOption).val();
		
		//add the node id to the array
		selectedNodeIds.push(selectedOptionValue);
	}
	
	//add the filtered steps to the content and update the select boxes
	this.addFilteredSteps(selectedNodeIds);
};

/**
 * Add the filtered steps to the content and update the select boxes
 * @param nodeIds the node ids to add to the nodeIdsToFilter array
 */
View.prototype.ExplanationBuilderNode.addFilteredSteps = function(nodeIds) {
	if(nodeIds != null) {
		if(this.content.nodeIdsToFilter == null) {
			this.content.nodeIdsToFilter = [];
		}
		
		//get the existing nodeIdsToFilter array
		var nodeIdsToFilter = this.content.nodeIdsToFilter;
		
		//loop through all the node ids that we will be adding
		for(var x=0; x<nodeIds.length; x++) {
			//get a node id
			var nodeId = nodeIds[x];
			
			//check if the node id is already in the nodeIdsToFilter array
			if(nodeIdsToFilter.indexOf(nodeId) == -1) {
				//the node id is not in the array so we will add it
				nodeIdsToFilter.push(nodeId);
			}
		}
		
		//update the select boxes
		this.updateFilterStepsSelectBoxes();
		
		/*
		 * fire source updated event, this will update the preview
		 */
		this.view.eventManager.fire('sourceUpdated');
	}
};

/**
 * Called when the Remove Step button is clicked
 * @param event the fired event jquery object
 */
View.prototype.ExplanationBuilderNode.removeFilteredStepButtonClicked = function(event) {
	var thisContext = event.data.thisContext;
	thisContext.removeFilteredStepButtonClickedHandler();
};

/**
 * Handles the logic for when the Remove Step button is clicked
 */
View.prototype.ExplanationBuilderNode.removeFilteredStepButtonClickedHandler = function() {
	//get the selected options in the filtered steps select box
	var selectedOptions = $('#filteredIdeasFilteredStepsSelect option:selected');
	
	var selectedNodeIds = [];

	//accumulate all the node ids that were selected
	for(var x=0; x<selectedOptions.length; x++) {
		//get an option
		var selectedOption = selectedOptions[x];
		
		//get the value which will be the node id
		var selectedOptionValue = $(selectedOption).val();

		//add the node id to the array
		selectedNodeIds.push(selectedOptionValue);
	}
	
	//remove the filtered steps from the content and update the select boxes
	this.removeFilteredSteps(selectedNodeIds);
};

/**
 * Remove the filtered steps from the content and update the select boxes
 * @param nodeIds the node ids to remove from the nodeIdsToFilter array
 */
View.prototype.ExplanationBuilderNode.removeFilteredSteps = function(nodeIds) {
	if(nodeIds != null) {
		if(this.content.nodeIdsToFilter == null) {
			this.content.nodeIdsToFilter = [];
		}
		
		//get the nodeIdsToFilter array from the content
		var nodeIdsToFilter = this.content.nodeIdsToFilter;
		
		//loop through all the values in the array in the content
		for(var x=0; x<nodeIdsToFilter.length; x++) {
			//get a node id from the array in the content
			var tempNodeId = nodeIdsToFilter[x];
			
			//check if the node id is in the array of node ids to remove
			if(nodeIds.indexOf(tempNodeId) != -1) {
				/*
				 * the node is in the array of node ids to remove so we will
				 * remove it from the array in the content
				 */
				nodeIdsToFilter.splice(x, 1);
				
				/*
				 * move the counter back one since we have just removed an element
				 * and we don't want to skip over the new element that was just
				 * moved into the current x position
				 */
				x--;
			}
		}
		
		//update the select boxes
		this.updateFilterStepsSelectBoxes();
		
		/*
		 * fire source updated event, this will update the preview
		 */
		this.view.eventManager.fire('sourceUpdated');
	}
};

/**
 * Update the project steps and filtered steps select boxes
 */
View.prototype.ExplanationBuilderNode.updateFilterStepsSelectBoxes = function() {
	this.updateProjectStepsSelect();
	this.updateFilteredStepsSelect();
};

/**
 * Update the project steps select box
 */
View.prototype.ExplanationBuilderNode.updateProjectStepsSelect = function() {
	if(this.content.nodeIdsToFilter == null) {
		this.content.nodeIdsToFilter = [];
	}
	
	//get all the step node ids in the project
	var nodeIdsInProject = this.view.getProject().getNodeIds();
	
	//get all the filtered steps
	var nodeIdsToFilter = this.content.nodeIdsToFilter;
	
	//get all the project steps with the filtered steps removed
	var projectSteps = this.removeElementsFromArray(nodeIdsInProject, nodeIdsToFilter);
	
	//clear the project steps select box because we will re-populate it now
	$('#filteredIdeasProjectStepsSelect').html('');
	
	//loop through all the project steps that are not filtered
	for(var x=0; x<projectSteps.length; x++) {
		//get the node id
		var projectStepNodeId = projectSteps[x];
		
		//get the step number and title
		var projectStepNodeTitle = this.view.getProject().getStepNumberAndTitle(projectStepNodeId);
		
		//create the option
		var tempOption = $('<option>');
		tempOption.attr('value', projectStepNodeId);
		tempOption.text(projectStepNodeTitle)
		
		//add the option to the project steps select box
		$('#filteredIdeasProjectStepsSelect').append(tempOption);
	}
	
};

/**
 * Update the filtered steps select box
 */
View.prototype.ExplanationBuilderNode.updateFilteredStepsSelect = function() {
	if(this.content.nodeIdsToFilter == null) {
		this.content.nodeIdsToFilter = [];
	}
	
	//get the filtered steps
	var nodeIdsToFilter = this.content.nodeIdsToFilter;
	
	//clear the filtered steps select box because we will re-populte it now
	$('#filteredIdeasFilteredStepsSelect').html('');
	
	//loop through all the filtered steps
	for(var x=0; x<nodeIdsToFilter.length; x++) {
		//get the node id
		var filteredStepNodeId = nodeIdsToFilter[x];
		
		//get the step number and title
		var filteredStepNodeTitle = this.view.getProject().getStepNumberAndTitle(filteredStepNodeId);
		
		//create the option
		var tempOption = $('<option>');
		tempOption.attr('value', filteredStepNodeId);
		tempOption.text(filteredStepNodeTitle)
		
		//add the option to the filtered steps select box
		$('#filteredIdeasFilteredStepsSelect').append(tempOption);
	}
};

/**
 * Remove elements from an array
 * @param arrayToRemoveFrom an array containing elements that we will remove elements from
 * @param elementsToRemove an array containing the elements we want to remove
 * @return an array with all the elements in elementsToRemove removed
 */
View.prototype.ExplanationBuilderNode.removeElementsFromArray = function(arrayToRemoveFrom, elementsToRemove) {
	var resultArray = [];
	
	if(arrayToRemoveFrom != null && elementsToRemove != null) {
		
		//loop through all the elements in the array to remove from
		for(var x=0; x<arrayToRemoveFrom.length; x++) {
			//get an element
			var tempElement = arrayToRemoveFrom[x];
			
			/*
			 * check if the element is an element we want to remove
			 * by seeing if the element is in the elementsToRemove array
			 */
			if(elementsToRemove.indexOf(tempElement) == -1) {
				/*
				 * the element is not in the elementsToRemove array so
				 * we will keep it
				 */ 
				resultArray.push(tempElement);
			}
		}
	}
	
	return resultArray;
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 * 
 * xTODO: rename TemplateNode
 */
View.prototype.ExplanationBuilderNode.getCommonComponents = function() {
	return this.commonComponents;
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 * 
 * xTODO: rename TemplateNode
 */
View.prototype.ExplanationBuilderNode.updateContent = function(){
	/* update content object */
	this.view.activeContent.setContent(this.content);
};

/**
 * Populate the authoring textarea where the user types the prompt that
 * the student will read
 * 
 * xTODO: rename TemplateNode
 */
View.prototype.ExplanationBuilderNode.populatePrompt = function() {
	//get the prompt from the content and set it into the authoring textarea
	$('#promptTextArea').val(this.content.prompt);
};

/**
 * Updates the content's prompt to match that of what the user input
 * 
 * xTODO: rename TemplateNode
 */
View.prototype.ExplanationBuilderNode.updatePrompt = function(){
	/* update content */
	this.content.prompt = document.getElementById('promptTextArea').value;
	
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the background image url to match that of what the user input
 * 
 * xTODO: rename TemplateNode
 */
View.prototype.ExplanationBuilderNode.updateBackgroundImageUrl = function(){
	/* update content */
	this.content.background = document.getElementById('backgroundImageUrl').value;
	
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the instructions in the content
 */
View.prototype.ExplanationBuilderNode.updateInstructions = function(){
	/* update content */
	this.content.instructions = $('#instructionsTextArea').val();
	
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update whether to display the student text area or not
 */
View.prototype.ExplanationBuilderNode.updateEnableStudentTextAreaCheckBox = function() {
	var checked = $('#enableStudentTextAreaCheckBox').attr('checked');
	//update the content
	this.content.enableStudentTextArea = this.isChecked(checked);
	
	// show/hide the instructions prompt
	if(checked){
		$('#instructions').slideDown('fast');
	} else {
		$('#instructions').slideUp('fast');
	}
	
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update whether to require student work on step before moving on
 */
View.prototype.ExplanationBuilderNode.updateWorkRequired = function() {
	//update the content
	this.content.isMustComplete = this.isChecked($('#requireWorkToggle').attr('checked'));
	
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Populate the authoring textarea where the user types the prompt that
 * the student will read
 * @param attributes Array of attributes for the project this node belongs to
 */
View.prototype.ExplanationBuilderNode.populateAttribute = function(attributes) {
	//get the set attribute from the content and set it as the authoring select's value
	if('selectedAttribute' in this.content){
		for(var i=0;i<attributes.length;i++){
			if (this.content.selectedAttribute == attributes[i].id){
				$('#attributeSelect').val(this.content.selectedAttribute);
			}
		}
	}
	this.updateAttribute();
};

/**
 * Updates the content's selected attribute to match that of what the user input
 */
View.prototype.ExplanationBuilderNode.updateAttribute = function(){
	/* update content */
	this.content.selectedAttribute = document.getElementById('attributeSelect').value;
	
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Determine if the value is checked or not
 * @param the string 'checked' or the value null
 * @return true if the value is 'checked'
 */
View.prototype.ExplanationBuilderNode.isChecked = function(value) {
	var checked = false;
	
	//check if the value is the string 'checked' or boolean value true
	if(value == 'checked' || value == true) {
		checked = true;
	} else {
		checked = false;
	}
	
	return checked;
};

/**
 * Open asset editor dialog and allows user to choose the image to use for the background
 */
View.prototype.ExplanationBuilderNode.browseImageAssets = function() {
	var callback = function(field_name, url, type, win){
		url = 'assets/' + url;
		document.getElementById(field_name).value = url;
		
		//fire background url changed event
		this.eventManager.fire('explanationBuilderUpdateBackgroundImageUrl');
	};
	var params = {};
	params.field_name = 'backgroundImageUrl';
	params.type = 'image';
	params.win = null;
	params.callback = callback;
	eventManager.fire('viewAssets',params);
};

/**
 * Update background image position
 */
View.prototype.ExplanationBuilderNode.updateBgAlign = function() {
	//update the content
	this.content.bgPosition = $('#backgroundAlignSelect').val();
	
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Called when the filter ideas checkbox is clicked
 */
View.prototype.ExplanationBuilderNode.filterIdeasCheckBoxClicked = function(event) {
	var thisContext = event.data.thisContext;
	thisContext.filterIdeasCheckBoxClickedHandler();
};

/**
 * Handles the logic for when the filter ideas checkbox is clicked
 */
View.prototype.ExplanationBuilderNode.filterIdeasCheckBoxClickedHandler = function() {
	//get whether the checkbox is clicked or not
	var isChecked = this.isChecked($('#filterIdeasCheckBox').attr('checked'));
	
	//set the value into the content
	this.content.filterIdeasByNodeIds = isChecked;
	
	if(isChecked) {
		//the checkbox is checked so we will show the filter ideas div
		$('#filterIdeasDiv').show();
	} else {
		//the checkbox is not checked so we will not show the filter ideas div
		$('#filterIdeasDiv').hide();
	}
	
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * xTODO: rename template to your new folder name
	 * xTODO: rename authorview_template
	 * 
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/authorview_quiz.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/explanationbuilder/authorview_explanationbuilder.js');
};