
View.prototype.netlogoDispatcher = function(type,args,obj){
	if(type == 'netlogoPromptChanged') {
		obj.NetlogoNode.updatePrompt(args);
	} else if (type == 'netlogoUrlChanged') {
		obj.NetlogoNode.updateUrl(args);
	} else if (type == 'netlogoHeightChanged') {
		obj.NetlogoNode.updateHeight(args);
	} else if (type == 'netlogoWidthChanged') {
		obj.NetlogoNode.updateWidth(args);
	} else if (type == 'netlogoBrowseClicked') {
		obj.NetlogoNode.browseAssets(args);
	}
};

//this list of events
var events = [
  'netlogoPromptChanged',
  'netlogoUrlChanged',
  'netlogoHeightChanged',
  'netlogoWidthChanged',
  'netlogoBrowseClicked'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'netlogoDispatcher');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/netlogo/netlogoEvents.js');
};