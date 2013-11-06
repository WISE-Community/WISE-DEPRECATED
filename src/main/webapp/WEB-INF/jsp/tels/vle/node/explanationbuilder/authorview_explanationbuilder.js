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