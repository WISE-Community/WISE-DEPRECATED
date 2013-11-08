
View.prototype.mwDispatcher = function(type,args,obj){
	if (type == 'mwUpdateCmlUrlInput') {
		obj.MWNode.updateCmlUrl();
	} else if (type == 'mwUpdatePrompt') {
		obj.MWNode.updatePrompt();
	}
};

//this list of events
var events = [
              'mwUpdatePrompt',
              'mwUpdateCmlUrlInput'
              ];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'mwDispatcher');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/mw/mwEvents.js');
};