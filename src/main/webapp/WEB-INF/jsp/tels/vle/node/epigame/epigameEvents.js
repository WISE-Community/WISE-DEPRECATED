
/*
 * This handles events and calls the appropriate function to handle
 * the event.
 */
View.prototype.epigameDispatcher = function(type,args,obj){
	/*
	 * check to see if the event name matches 
	 */ 
	if(type == 'epigameUpdateLevelString') {
		obj.EpigameNode.updateLevelString(args);
	} else if (type == 'epigameImportLevelStringToEditor') {
		obj.EpigameNode.importLevelStringToEditor(args);
	} else if (type == 'epigameUpdateSource'){
		obj.EpigameNode.updateSwfSource(args);
	} else if (type == 'epigameSwfUrlChanged'){
		obj.EpigameNode.updateSwfUrl(args);
	} else if (type == 'epigameBrowseClicked'){
		obj.EpigameNode.browseFlashAssets(args);
	} else if (type == 'epigameChangeMode'){
		obj.EpigameNode.updateModeSelection(args);
	} else if (type == 'epigameToggleSettings'){
		obj.EpigameNode.toggleSettings(args);
	} else if (type == 'epigameChangeSettings'){
		obj.EpigameNode.updateSettings(args);
	}
};

/*
 * this is a list of events that can be fired. when the event is fired,
 * the dispatcher function above will be called and then call the
 * appropriate function to handle the event.
 */
var events = [
	'epigameUpdateLevelString',
	'epigameImportLevelStringToEditor',
	'epigameUpdateSource',
	'epigameSwfUrlChanged',
	'epigameBrowseClicked',
	'epigameChangeMode',
	'epigameToggleSettings',
	'epigameChangeSettings'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'epigameDispatcher');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/epigame/epigameEvents.js');
};