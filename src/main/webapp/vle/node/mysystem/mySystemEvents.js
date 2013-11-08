
/**
 * The mysystemDispatcher catches events specific to authoring individual
 * my system steps and delegates them to the appropriate functions for
 * this view.
 */
View.prototype.mysystemDispatcher = function(type,args,obj){
	if(type=='mysystemPromptChanged'){
		obj.MySystemNode.updatePrompt();
	} else if(type=='mysystemFieldUpdated'){
		obj.MySystemNode.fieldUpdated(args[0], args[1]);
	} else if(type=='mysystemRemoveMod'){
		obj.MySystemNode.removeMod(args[0]);
	} else if(type=='mysystemAddNew'){
		obj.MySystemNode.addNew();
	};
};

//this list of events
var events = [
	'mysystemPromptChanged',
	'mysystemFieldUpdated',
	'mysystemRemoveMod',
	'mysystemAddNew'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'mysystemDispatcher');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/mysystem/mySystemEvents.js');
};