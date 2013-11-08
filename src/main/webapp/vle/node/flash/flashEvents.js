
/*
 * This handles events and calls the appropriate function to handle
 * the event.
 */
View.prototype.flashDispatcher = function(type,args,obj){
	/*
	 * check to see if the event name matches 
	 */ 
	if(type == 'flashPromptChanged') {
		obj.FlashNode.updatePrompt(args);
	} else if (type == 'flashSwfUrlChanged') {
		obj.FlashNode.updateSwfUrl(args);
	} else if (type == 'flashSwfHeightChanged') {
		obj.FlashNode.updateSwfHeight(args);
	} else if (type == 'flashSwfWidthChanged') {
		obj.FlashNode.updateSwfWidth(args);
	} else if (type == 'flashEnableDataChanged') {
		obj.FlashNode.updateEnableData(args);
	} else if (type == 'flashEnableGradingChanged') {
		obj.FlashNode.updateEnableGrading(args);
	} else if (type == 'flashBrowseClicked') {
		obj.FlashNode.browseFlashAssets(args);
	} else if (type == 'flashGradingTypeChanged') {
		obj.FlashNode.updateGradingType(args);
	} else if (type == 'flashAddFlashvar') {
		obj.FlashNode.createNewFlashvarInput(args);
	} else if (type == 'flashFlashvarsChanged') {
		obj.FlashNode.updateFlashvars(args);
	} else if (type == 'flashDeleteFlashvar') {
		obj.FlashNode.deleteFlashvar(args[0]);
	}
};

/*
 * this is a list of events that can be fired. when the event is fired,
 * the dispatcher function above will be called and then call the
 * appropriate function to handle the event.
 */
var events = [
	'flashPromptChanged',
	'flashSwfUrlChanged',
	'flashSwfHeightChanged',
	'flashSwfWidthChanged',
	'flashEnableDataChanged',
	'flashEnableGradingChanged',
	'flashBrowseClicked',
	'flashGradingTypeChanged',
	'flashAddFlashvar',
	'flashFlashvarsChanged',
	'flashDeleteFlashvar'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'flashDispatcher');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/flash/flashEvents.js');
};