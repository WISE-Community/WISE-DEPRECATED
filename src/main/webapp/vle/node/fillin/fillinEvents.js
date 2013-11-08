
/**
 * The drawingDispatcher catches events specific to authoring individual
 * draw node steps and delegates them to the appropriate functions for
 * this view.
 */
View.prototype.fillinDispatcher = function(type,args,obj){
	if(type=='fillinTextUpdated'){
		obj.FillinNode.fillinTextUpdated();
	} else if(type=='fillinCreateFillin'){
		obj.FillinNode.createFillin();
	} else if(type=='fillinRemoveFillin'){
		obj.FillinNode.removeFillin();
	} else if(type=='fillinClick'){
		obj.FillinNode.fillinClick(args[0], args[1]);
	} else if(type=='fillinChangeSelected'){
		obj.FillinNode.changeSelected(args[0]);
	} else if(type=='fillinAddNewAllowable'){
		obj.FillinNode.addNewAllowable(args[0]);
	} else if(type=='fillinEntryChanged'){
		obj.FillinNode.entryChanged(args[0]);
	} else if(type=='fillinRemoveAllowable'){
		obj.FillinNode.removeAllowable(args[0], args[1]);
	};
};

//this list of events
var events = [
	'fillinTextUpdated',
	'fillinCreateFillin',
	'fillinRemoveFillin',
	'fillinClick',
	'fillinChangeSelected',
	'fillinAddNewAllowable',
	'fillinEntryChanged',
	'fillinRemoveAllowable'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'fillinDispatcher');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/fillin/fillinEvents.js');
};