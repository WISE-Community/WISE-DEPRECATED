
/**
 * The brainstormDispatcher catches events specific to authoring individual
 * brainstorm steps and delegates them to the appropriate functions for
 * this view.
 */
View.prototype.brainstormDispatcher = function(type,args,obj){
	if(type=='brainstormUpdateExpectedLines'){
		obj.BrainstormNode.updateExpectedLines();
	} else if(type=='brainstromUpdateTitle'){
		obj.BrainstormNode.updateTitle();
	} else if(type=='brainstormUpdateGated'){
		obj.BrainstormNode.updateGated(args[0]);
	} else if(type=='brainstormUpdateDisplayName'){
		obj.BrainstormNode.updateDisplayName(args[0]);
	} else if(type=='brainstormUpdateRichText'){
		obj.BrainstormNode.updateRichText(args[0]);
	} else if(type=='brainstormUpdateAllowStudentReply'){
		obj.BrainstormNode.updateAllowStudentReply(args[0]);
	} else if(type=='brainstormUpdatePollEnded'){
		obj.BrainstormNode.updatePollEnded(args[0]);
	} else if(type=='brainstormUpdateInstantPoll'){
		obj.BrainstormNode.updateInstantPoll(args[0]);
	} else if(type=='brainstormStarterChanged'){
		obj.BrainstormNode.starterChanged();
	} else if(type=='brainstormStarterUpdated'){
		obj.BrainstormNode.starterUpdated();
	} else if(type=='brainstormUpdatePrompt'){
		obj.BrainstormNode.updatePrompt();
	} else if(type=='brainstormCreateNewResponse'){
		obj.BrainstormNode.createNewResponse();
	} else if(type=='brainstormRemoveResponse'){
		obj.BrainstormNode.removeResponse();
	} else if(type=='brainstormResponseNameChanged'){
		obj.BrainstormNode.responseNameChanged(args[0]);
	} else if(type=='brainstormResponseValueChanged'){
		obj.BrainstormNode.responseValueChanged(args[0]);
	} else if(type=='brainstormResponseSelected'){
		obj.BrainstormNode.responseSelected(args[0]);
	} else if(type=='brainstormUseServerUpdated') {
		obj.BrainstormNode.useServerUpdated(args[0]);
	};
};

//this list of events
var events = [
	'brainstormUpdateExpectedLines',
	'brainstromUpdateTitle',
	'brainstormUseServerUpdated',
	'brainstormUpdateGated',
	'brainstormUpdateDisplayName',
	'brainstormUpdateRichText',
	'brainstormUpdateAllowStudentReply',
	'brainstormUpdatePollEnded',
	'brainstormUpdateInstantPoll',
	'brainstormStarterChanged',
	'brainstormStarterUpdated',
	'brainstormUpdatePrompt',
	'brainstormCreateNewResponse',
	'brainstormRemoveResponse',
	'brainstormResponseNameChanged',
	'brainstormResponseValueChanged',
	'brainstormResponseSelected'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'brainstormDispatcher');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/brainstorm/brainstormEvents.js');
};