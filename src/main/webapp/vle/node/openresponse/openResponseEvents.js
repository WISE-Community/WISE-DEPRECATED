
/**
 * The openResponseDispatcher catches events specific to authoring individual
 * open response type steps and delegates them to the appropriate functions for
 * this view.
 */
View.prototype.openResponseDispatcher = function(type,args,obj){
	if(type=='openResponsePromptChanged'){
		obj.OpenResponseNode.updatePrompt();
	} else if(type=='openResponseStarterOptionChanged'){
		obj.OpenResponseNode.starterChanged();
	} else if(type=='openResponseStarterSentenceUpdated'){
		obj.OpenResponseNode.starterUpdated();
	} else if(type=='openResponseUpdateRichText'){
		obj.OpenResponseNode.updateRichText();
	} else if(type=='openresponseOptionChanged'){
		obj.OpenResponseNode.optionChanged(args[0]);
	} else if(type=='openResponseLinesChanged'){
		obj.OpenResponseNode.linesUpdated();
	} else if(type=='openResponsePeerReviewAuthoredWorkUpdated'){
		obj.OpenResponseNode.peerReviewAuthoredWorkUpdated();
	} else if(type=='openResponsePeerReviewPercentageTriggerUpdated'){
		obj.OpenResponseNode.peerReviewPercentageTriggerUpdated();
	} else if(type=='openResponsePeerReviewNumberTriggerUpdated'){
		obj.OpenResponseNode.peerReviewNumberTriggerUpdated();
	} else if(type=='openResponsePeerReviewAuthoredReviewUpdated'){
		obj.OpenResponseNode.peerReviewAuthoredReviewUpdated();
	} else if(type=='openResponsePeerReviewStepNotOpenCustomMessageUpdated'){
		obj.OpenResponseNode.peerReviewStepNotOpenCustomMessageUpdated();
	} else if(type=='openResponseUpdateShowPreviousWorkThatHasAnnotation'){
		obj.OpenResponseNode.updateShowPreviousWorkThatHasAnnotation();
	};
};

//this list of events
var events = [
	'openResponsePromptChanged',
	'openResponseStarterOptionChanged',
	'openResponseStarterSentenceUpdated',
	'openresponseOptionChanged',
	'openResponseUpdateRichText',
	'openResponseLinesChanged',
	'openResponsePeerReviewAuthoredWorkUpdated',
	'openResponsePeerReviewPercentageTriggerUpdated',
	'openResponsePeerReviewNumberTriggerUpdated',
	'openResponsePeerReviewAuthoredReviewUpdated',
	'openResponsePeerReviewStepNotOpenCustomMessageUpdated',
	'openResponseUpdateShowPreviousWorkThatHasAnnotation'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'openResponseDispatcher');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/openresponse/openResponseEvents.js');
};