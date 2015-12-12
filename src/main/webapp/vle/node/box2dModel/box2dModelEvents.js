
/*
 * This handles events and calls the appropriate function to handle
 * the event.
 * 
 * TODO: rename box2dModelDispatcher
 * For example if you are creating a quiz node you would change it to
 * quizDispatcher
 */
View.prototype.box2dModelDispatcher = function(type,args,obj){
	/*
	 * check to see if the event name matches 
	 * 
	 * TODO: rename box2dModelUpdatePrompt
	 * wait until you implement the authoring before you rename this
	 */ 
	if(type == 'box2dModelUpdatePrompt') {
		obj.Box2dModelNode.updatePrompt(args);
	} else {
		if (typeof obj.currentNode != "undefined"){
			obj.currentNode.contentPanel.box2dModel.interpretEvent(type, args, obj.currentNode.contentPanel.box2dModel);	
		} else if (typeof obj.activeNode != "undefined"){
			obj.activeNode.contentPanel.box2dModel.interpretEvent(type, args, obj.activeNode.contentPanel.box2dModel);	
		}
	}
};

/*
 * this is a list of events that can be fired. when the event is fired,
 * the dispatcher function above will be called and then call the
 * appropriate function to handle the event.
 */
var events = 
[
	/*
	 * TODO: rename box2dModelUpdatePrompt
	 * wait until you implement the authoring before you rename this
	 */
	'make-model', 
	'revise-model',
	'duplicate-model', 
	'delete-model', 
	'make-beaker', 
	'delete-beaker', 
	'make-scale', 
	'delete-scale', 
	'add-to-beaker', 
	'add-to-scale', 
	'add-to-balance', 
	'remove-from-beaker', 
	'remove-from-scale', 
	'remove-from-balance', 
	'test-in-beaker', 
	'test-on-scale', 
	'test-on-balance',
	'release-from-beaker',
	'gave-feedback',
	'save-pressed',
	'graph-clicked',
	'table-changed'
];


/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	/*
	 * TODO: rename box2dModelDispatcher
	 * For example if you are creating a quiz node you would change it to
	 * quizDispatcher. The name for the dispatcher should match the function
	 * name at the top of this file.
	 */
	componentloader.addEvent(events[x], 'box2dModelDispatcher');
	
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename box2dModel to your new folder name
	 * TODO: rename box2dModelEvents
	 * 
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/quizEvents.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/box2dModel/box2dModelEvents.js');

};