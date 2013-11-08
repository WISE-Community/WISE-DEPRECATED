
/*
 * This handles events and calls the appropriate function to handle
 * the event.
 * 
 * xTODO: rename templateDispatcher
 * For example if you are creating a quiz node you would change it to
 * quizDispatcher
 */
View.prototype.explanationBuilderDispatcher = function(type,args,obj){
	/*
	 * check to see if the event name matches 
	 * 
	 * xTODO: rename templateUpdatePrompt
	 * wait until you implement the authoring before you rename this
	 */ 
	if(type == 'explanationBuilderUpdatePrompt') {
		/*
		 * the event name matches so we will call the function that
		 * handles that event
		 * 
		 * xTODO: rename TemplateNode
		 * wait until you implement the authoring before you rename this 
		 */
		obj.ExplanationBuilderNode.updatePrompt();
	} else if(type == 'explanationBuilderUpdateBackgroundImageUrl') {
		obj.ExplanationBuilderNode.updateBackgroundImageUrl();
	} else if(type == 'explanationBuilderUpdateInstructions') {
		obj.ExplanationBuilderNode.updateInstructions();
	} else if(type == 'explanationBuilderUpdateEnableStudentTextAreaCheckBox') {
		obj.ExplanationBuilderNode.updateEnableStudentTextAreaCheckBox();
	} else if(type == 'explanationBuilderBrowseClicked'){
		obj.ExplanationBuilderNode.browseImageAssets();
	} else if(type=='explanationBuilderUpdateWorkRequired') {
		obj.ExplanationBuilderNode.updateWorkRequired();
	} else if(type=='explanationBuilderUpdateBgAlign') {
		obj.ExplanationBuilderNode.updateBgAlign();
	} else if(type=='explanationBuilderUpdateAttribute'){
		obj.ExplanationBuilderNode.updateAttribute();
	}
};

/*
 * this is a list of events that can be fired. when the event is fired,
 * the dispatcher function above will be called and then call the
 * appropriate function to handle the event.
 */
var events = [
	/*
	 * xTODO: rename templateUpdatePrompt
	 * wait until you implement the authoring before you rename this
	 */
	'explanationBuilderUpdatePrompt',
	'explanationBuilderUpdateBackgroundImageUrl',
	'explanationBuilderUpdateInstructions',
	'explanationBuilderUpdateEnableStudentTextAreaCheckBox',
	'explanationBuilderBrowseClicked',
	'explanationBuilderUpdateWorkRequired',
	'explanationBuilderUpdateBgAlign',
	'explanationBuilderUpdateAttribute'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	/*
	 * xTODO: rename templateDispatcher
	 * For example if you are creating a quiz node you would change it to
	 * quizDispatcher. The name for the dispatcher should match the function
	 * name at the top of this file.
	 */
	componentloader.addEvent(events[x], 'explanationBuilderDispatcher');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * xTODO: rename template to your new folder name
	 * xTODO: rename templateEvents
	 * 
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/quizEvents.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/explanationbuilder/explanationBuilderEvents.js');
};