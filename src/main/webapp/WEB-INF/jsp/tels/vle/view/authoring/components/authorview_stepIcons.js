
/**
 * The step icon manager
 */
View.prototype.stepIconsManager = function() {
	this.view;
};

/**
 * Handles events for authoring step icons
 */
View.prototype.stepIconsManager.dispatcher = function(type, args, obj) {
	if(type=='stepIconUpdated') {
		obj.stepIconsManager.stepIconUpdated(args[0]);
	}
};

/**
 * Insert the step icon authoring items into the author step page
 * @param view the view
 */
View.prototype.stepIconsManager.insertStepIcons = function(view) {
	this.view = view;
	
	//add the stepIconsDiv to the end of the authoring page
	$('#dynamicPage').append("<div id='stepIconsDiv'>Step Icons (enter the path to one of your assets e.g. assets/goldStar.jpg)<div id='stepIconsListDiv'></div></div>");
	
	//get the content for the current step we are authoring
	var content = this.view[this.view.resolveType(this.view.activeNode.type)].content;
	
	if(content.stepIcons == null || content.stepIcons.length == 0) {
		/*
		 * the content does not have a stepIcons field so we will retrieve
		 * it from the step
		 */
		content.stepIcons = this.createStepIconsContent();
	}
	
	//get the step icons
	var stepIcons = content.stepIcons;
	
	//loop through all the step icons
	for(var x=0; x<stepIcons.length; x++) {
		//get one of the step icon objects
		var stepIcon = stepIcons[x];
		
		//get the step icon status
		var status = stepIcon.status;
		
		//get the step icon path
		var iconPath = stepIcon.iconPath;
		
		//display the status
		var statusText = document.createTextNode(status);
		
		//create a text input so the author can input the path of an image for this status
		var iconPathInput = createElement(document, 'input', {type: 'text', id: 'iconPathInput_' + x, value: iconPath, onkeyup: 'eventManager.fire("stepIconUpdated", ' + x + ')'});
		
		//add the elements to the authoring
		$('#stepIconsListDiv').append(statusText);
		$('#stepIconsListDiv').append(iconPathInput);
		$('#stepIconsListDiv').append('<br>');
	}
};

/**
 * Create the step icons array that will contain all the step
 * icon status and icon path pairings
 */
View.prototype.stepIconsManager.createStepIconsContent = function() {
	var icons = [];
	
	//get all the statuses available for the current step we are authoring
	var availableStatuses = this.view.activeNode.getAvailableStatuses();
	
	if(availableStatuses != null) {
		//loop through all the statuses
		for(var x=0; x<availableStatuses.length; x++) {
			//get a status
			var status = availableStatuses[x];
			
			//create an object to hold the status and icon path
			var stepIcon = {};
			
			//set the status and icon path
			stepIcon.status = status;
			stepIcon.iconPath = '';
			
			//add the object to the array
			stepIcons.push(stepIcon);
		}
	}
	
	return stepIcons;
};

/**
 * The author has updated the step icon path
 * @param index the index of the step icon object in the array
 * that has been updated
 */
View.prototype.stepIconsManager.stepIconUpdated = function(index) {
	//get the value that the author has entered
	var iconPath = $('#iconPathInput_' + index).val();
	
	//get the content for the current step we are authoring
	var content = this.view[this.view.resolveType(this.view.activeNode.type)].content;
	
	if(content.stepIcons == null) {
		//create an empty stepIcons array if one does not exist
		content.icons = [];
	}
	
	if(content.stepIcons[index] != null) {
		//update the iconPath of the object at the given index
		content.stepIcons[index].iconPath = iconPath;
		
		//fire the source updated event, this will update the preview
		this.view.eventManager.fire('sourceUpdated');
	}
};

/**
 * Clear input values and remove the div from the author step page
 * and put it back into the main authoring page
 */
View.prototype.stepIconsManager.cleanupStepIcons = function() {
	/*
	 * nothing needs to be done since the step icons div
	 * is dynamically created each time the step authoring
	 * is opened
	 */
};


//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/components/authorview_stepIcons.js');
};