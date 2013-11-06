/**
 * Sets the SeasonsNode type as an object of this view
 * 
 * TODO: rename SeasonsNode
 */
View.prototype.SeasonsNode = {};

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
 * TODO: rename SeasonsNode
 */
View.prototype.SeasonsNode.commonComponents = [];

/**
 * Generates the authoring page. This function will create the authoring
 * components such as textareas, radio buttons, check boxes, etc. that
 * authors will use to author the step. For example if the step has a
 * text prompt that the student will read, this function will create
 * a textarea that will allow the author to type the text that the
 * student will see. You will also need to populate the textarea with
 * the pre-existing prompt if the step has been authored before.
 * 
 * TODO: rename SeasonsNode
 */
View.prototype.SeasonsNode.generatePage = function(view){
	this.view = view;
	
	//get the content of the step
	this.content = this.view.activeContent.getContentJSON();
	
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
	
	//create the label for the textarea that the author will write the prompt in
	var promptText = document.createTextNode("Select Model Type:");
	
	/*
	 * create the modelType dropdown
	 * 
	 * onchange will fire the 'seasonsModelTypeUpdated' event which will
	 * be handled in the seasonsEvents.js file
	 */
	var modelTypeDropDownHtml = '<select id="modelTypeDropDown" onchange="eventManager.fire(\'seasonsModelTypeUpdated\')">' + 
	'<option value="distanceAndShape">distanceAndShape</option>' +
	'<option value="distanceAndTemperature">distanceAndTemperature</option>' +
	'<option value="tiltAndTemperature">tiltAndTemperature</option>' +
	'<option value="tiltAndHoursOfDaylight">tiltAndHoursOfDaylight</option>' +
	'</select>';
		
	//var promptTextArea = createElement(document, 'textarea', {id: 'promptTextArea', rows:'20', cols:'85', onkeyup:"eventManager.fire('seasonsUpdatePrompt')"});
	
	//add the authoring components to the page
	pageDiv.appendChild(promptText);
	pageDiv.appendChild(createBreak());
	pageDiv.innerHTML+=modelTypeDropDownHtml;
	pageDiv.appendChild(createBreak());

	//add the page to the parent
	parent.appendChild(pageDiv);
	
	// show the selected model type in the drop down
	$("#modelTypeDropDown").val(this.content.modelType);
	
	//populate the prompt if this step has been authored before
	//this.populatePrompt();
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 * 
 * TODO: rename SeasonsNode
 */
View.prototype.SeasonsNode.getCommonComponents = function() {
	return this.commonComponents;
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 * 
 * TODO: rename SeasonsNode
 */
View.prototype.SeasonsNode.updateContent = function(){
	/* update content object */
	this.view.activeContent.setContent(this.content);
};

/**
 * Populate the authoring textarea where the user types the prompt that
 * the student will read
 * 
 * TODO: rename SeasonsNode
 */
View.prototype.SeasonsNode.populatePrompt = function() {
	//get the prompt from the content and set it into the authoring textarea
	$('#promptTextArea').val(this.content.prompt);
};

/**
 * Updates the content's modeltype to match that of what the user specified
 */
View.prototype.SeasonsNode.updateModelType = function(){
	/* update content */
	this.content.modelType = $('#modelTypeDropDown').val();
	
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the content's prompt to match that of what the user input
 */
View.prototype.SeasonsNode.updatePrompt = function(){
	/* update content */
	this.content.prompt = $('#promptTextArea').val();
	
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename seasons to your new folder name
	 * TODO: rename authorview_seasons
	 * 
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/authorview_quiz.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/seasons/authorview_seasons.js');
};