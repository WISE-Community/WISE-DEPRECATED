
/*
 * This handles events and calls the appropriate function to handle
 * the event.
 */
View.prototype.surgeDispatcher = function(type,args,obj){
	/*
	 * check to see if the event name matches 
	 */ 
	if(type == 'surgeUpdateLevelString') {
		obj.SurgeNode.updateLevelString(args);
	} else if (type == 'surgeImportLevelStringToEditor') {
		obj.SurgeNode.importLevelStringToEditor(args);
	} else if (type == 'surgeUpdateSource'){
		obj.SurgeNode.updateSwfSource(args);
	} else if (type == 'surgeSwfUrlChanged'){
		obj.SurgeNode.updateSwfUrl(args);
	} else if (type == 'surgeBrowseClicked'){
		obj.SurgeNode.browseFlashAssets(args);
	} else if (type == 'surgeDimensionsChanged'){
		obj.SurgeNode.updateDimensions(args);
	}
};

/*
 * this is a list of events that can be fired. when the event is fired,
 * the dispatcher function above will be called and then call the
 * appropriate function to handle the event.
 */
var events = [
	'surgeUpdateLevelString',
	'surgeImportLevelStringToEditor',
	'surgeUpdateSource',
	'surgeSwfUrlChanged',
	'surgeBrowseClicked',
	'surgeDimensionsChanged'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'surgeDispatcher');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/surge/surgeEvents.js');
};