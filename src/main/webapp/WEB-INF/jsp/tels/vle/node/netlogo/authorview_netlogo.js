/**
 * Sets the NetlogoNode type as an object of this view
 * 
 * TODO: rename NetlogoNode
 * @constructor
 */
View.prototype.NetlogoNode = {};

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
 * TODO: rename NetlogoNode
 */
View.prototype.NetlogoNode.commonComponents = [];

/**
 * Generates the authoring page. This function will create the authoring
 * components such as textareas, radio buttons, check boxes, etc. that
 * authors will use to author the step. For example if the step has a
 * text prompt that the student will read, this function will create
 * a textarea that will allow the author to type the text that the
 * student will see. You will also need to populate the textarea with
 * the pre-existing prompt if the step has been authored before.
 * 
 * TODO: rename NetlogoNode
 */
View.prototype.NetlogoNode.generatePage = function(view){
	
	this.view = view;
	
	this.projectPath = this.view.getProjectFolderPath();
	
	//get the content of the step
	this.content = this.view.activeContent.getContentJSON();
	
	//get the html element that all the authoring components will be located
	var parent = document.getElementById('dynamicParent');
	
	/*
	 * wipe out the div that contains the authoring components because it
	 * may still be populated with components from a previous step since we re-use the div id
	 */
	var pageDiv = $('#dynamicPage').html('').css({'width':'100%','height':'100%'}).addClass('authorContent');
	
	var promptDiv = $(document.createElement('div')).addClass('authorComponent');
	
	//create the label for the textarea that the author will write the prompt in
	var promptLabel = $(document.createElement('div')).text('Introductory Content (optional):');
	
	//create the textarea that the author will write the prompt in
	var promptTextArea = $(createElement(document, 'textarea', {id: 'promptTextArea', name: 'promptTextArea', onkeyup:"eventManager.fire('netlogoPromptChanged')"})).css({'width':'100%','min-height':'100px'});
	
	promptDiv.append(promptLabel).append(promptTextArea);
	
	var nlogoUrlDiv = $(document.createElement('div')).addClass('authorComponent');
	
	//create the label for the textarea that the author will write the nlogo url in
	var nlogoUrlLabel = $(document.createElement('span')).text('Netlogo (.nlogo) URL:');
	//create the textarea that the author will write the nlogo url in
	var nlogoUrlInput = $(createElement(document, 'input', {id: 'nlogoUrlInput', type:'text', size:'50', onchange:"eventManager.fire('netlogoUrlChanged')"}));
	//create the browse button that allows author to choose nlogo from project assets
	var nlogoBrowseButton = $(createElement(document, 'button', {id: 'nlogoBrowseButton', onclick:'eventManager.fire("netlogoBrowseClicked")'})).text('Browse');
	
	nlogoUrlDiv.append(nlogoUrlLabel).append(nlogoUrlInput).append(nlogoBrowseButton);
	
	var nlogoDimensionsDiv = $(document.createElement('div')).addClass('authorComponent');
	
	//create the label for the dimensions section
	var nlogoDimensionsLabel = $(document.createElement('div')).text('Dimensions (px):');
	//create the label for the textarea that the author will write the height in
	var nlogoHeightLabel = $(document.createElement('span')).text('Height:');
	//create the textarea that the author will write the height in
	// TODO: add validation (only allow digits)
	var nlogoHeightInput = createElement(document, 'input', {id: 'nlogoHeightInput', type:'text', size:'4', onchange:"eventManager.fire('netlogoHeightChanged')"});
	
	//create the label for the textarea that the author will write the width in
	var nlogoWidthLabel = $(document.createElement('span')).text('Width:');
	//create the textarea that the author will write the width in
	// TODO: add validation (only allow digits)
	var nlogoWidthInput = createElement(document, 'input', {id: 'nlogoWidthInput', type:'text', size:'4', onchange:"eventManager.fire('netlogoWidthChanged')"});
	
	nlogoDimensionsDiv.append(nlogoDimensionsLabel).append(nlogoHeightLabel).append(nlogoHeightInput).append(nlogoWidthLabel).append(nlogoWidthInput);
	
	// TODO: add select item to choose which version of Netlogo to use (4 or 5)
	
	//add the authoring components to the page
	pageDiv.append(nlogoUrlDiv).append(createBreak()).append(nlogoDimensionsDiv).append(createBreak()).append(promptDiv);
	
	// populate nlogo url if it has been authored before
	if(this.content.activity_uri != '') {
		this.populateUrl();
	}
	
	//populate the dimensions if this step has been authored before
	this.populateDimensions();
	
	// populate the advanced options (data logging, grading)
	this.populateAdvancedOptions();
	
	// populate the prompt text that has been authored before
	this.populatePrompt();
	
	// enable rich text editing for prompt input
	this.view.addRichTextAuthoring('promptTextArea',function() {eventManager.fire('netlogoPromptChanged');});
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 * 
 * TODO: rename NetlogoNode
 */
View.prototype.NetlogoNode.getCommonComponents = function() {
	return this.commonComponents;
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 * 
 * TODO: rename NetlogoNode
 */
View.prototype.NetlogoNode.updateContent = function(){
	/* update content object */
	this.view.activeContent.setContent(this.content);
};

/**
 * Populate the authoring textarea where the user types the prompt that
 * the student will read
 */
View.prototype.NetlogoNode.populatePrompt = function() {
	//get the prompt from the content and set it into the authoring textarea
	if(this.content.prompt){
		$('#promptTextArea').val(this.content.prompt);
	}
};

/**
 * Updates the content's prompt to match that of what the user input
 */
View.prototype.NetlogoNode.updatePrompt = function(){
	/* update content */
	if(typeof tinymce != 'undefined' && $('#promptTextArea').tinymce()){
		// rich text editor is active on textarea, so get contents from editor
		this.content.prompt = $('#promptTextArea').tinymce().getContent();
	} else {
		this.content.prompt = $('#promptTextArea').val();
	}
	
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Populate the nlogo textarea where the user types the url for the nlogo file
 */
View.prototype.NetlogoNode.populateUrl = function() {
	//get the url from the content and set it into the authoring textarea
	$('#nlogoUrlInput').val(this.content.activity_uri);
};

/**
 * Updates the content's activity_uri to the user input
 * 
 * TODO: rename NetlogoNode
 */
View.prototype.NetlogoNode.updateUrl = function(){
	/* update content */
	this.content.activity_uri = $('#nlogoUrlInput').val();
	
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Populate the height and width textareas where the user types the dimensions for the nlogo file
 */
View.prototype.NetlogoNode.populateDimensions = function() {
	//get the height from the content and set it into the authoring textarea
	$('#nlogoHeightInput').val(this.content.height);
	
	//get the width from the content and set it into the authoring textarea
	$('#nlogoWidthInput').val(this.content.width);
};


/**
*PLACEHOLDER -- this is called from the code but i don't know what it should do ;) --CB
*This is where we can show advanced options like enabling student data logging, researcher export,
*and teacher grading once they are implemented --JLB
*/
View.prototype.NetlogoNode.populateAdvancedOptions = function() {
  console.log("populateAdvancedOptions - placeholder -- TODO: fill in body");
};

/**
 * Updates the content's height to the user input
 */
View.prototype.NetlogoNode.updateHeight = function(){
	/* update content */
	this.content.height = $('#nlogoHeightInput').val();
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the content's width to the user input
 */
View.prototype.NetlogoNode.updateWidth = function(){
	/* update content */
	this.content.width = $('#nlogoWidthInput').val();
	
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Open asset editor dialog and allows user to choose the swf to use for this step
 */
View.prototype.NetlogoNode.browseAssets = function() {
	var callback = function(field_name, url, type, win){
		url = 'assets/' + url;
		document.getElementById(field_name).value = url;
		
		//fire swfUrlChanged event
		this.eventManager.fire('netlogoUrlChanged');
	};
	var params = {};
	params.field_name = 'nlogoUrlInput';
	params.type = 'netlogo';
	params.buttonText = 'Please select a file from the list.';
	params.extensions = ['nlogo'];
	params.win = null;
	params.callback = callback;
	eventManager.fire('viewAssets',params);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/netlogo/authorview_netlogo.js');
};