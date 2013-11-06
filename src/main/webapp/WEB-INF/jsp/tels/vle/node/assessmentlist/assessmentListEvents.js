
/**
 * The assessmentlist dispatcher catches events specific to authoring individual
 * assessmentlist steps and delegates them to the appropriate functions for
 * this view.
 */
View.prototype.assessmentlistDispatcher = function(type,args,obj){
	if(type=='assessmentlistPromptChanged'){
		obj.AssessmentListNode.updatePrompt();
	} else if(type=='assessmentlistFieldUpdated'){
		obj.AssessmentListNode.fieldUpdated(args[0], args[1]);
	} else if(type=='assessmentlistRadioItemFieldUpdated'){
		obj.AssessmentListNode.radioItemFieldUpdated(args[0], args[1], args[2]);
	} else if(type=='assessmentlistAddChoice'){
		obj.AssessmentListNode.addChoice(args[0]);
	} else if(type=='assessmentlistRadioItemRemoveChoice'){
		obj.AssessmentListNode.radioItemRemoveChoice(args[0],args[1]);
	} else if(type=='assessmentlistAddNewItem'){
		obj.AssessmentListNode.addNewItem(args[0]);
	} else if(type=='assessmentlistRemoveItem'){
		obj.AssessmentListNode.removeItem(args[0]);
	} else if(type=='assessmentlistStarterSentenceUpdated'){
		obj.AssessmentListNode.starterSentenceChanged(args[0]);
	} else if(type=='assessmentlistStarterOptionChanged'){
		obj.AssessmentListNode.starterOptionChanged(args[0]);
	} else if(type=='assessmentlistUpdateRichText'){
		obj.AssessmentListNode.updateRichText(args[0]);
	} else if(type=='assessmentOptionChanged'){
		obj.AssessmentListNode.optionChanged(args[0]);
	} else if(type=='assessmentListCorrectChoiceChanged'){
		obj.AssessmentListNode.correctChoiceChanged(args[0], args[1]);
	} else if(type=='assessmentListIsAutoScoringEnabledChanged'){
		obj.AssessmentListNode.isAutoScoringEnabledChanged(args[0]);
	} else if(type=='assessmentListUpdateImportantReviewSequencePart'){
		obj.AssessmentListNode.updateImportantReviewSequencePart(args[0]);
	} else if(type=='assessmentListPeerReviewPercentageTriggerUpdated'){
		obj.AssessmentListNode.peerReviewPercentageTriggerUpdated();
	} else if(type=='assessmentListPeerReviewNumberTriggerUpdated'){
		obj.AssessmentListNode.peerReviewNumberTriggerUpdated();
	} else if(type=='assessmentListPeerReviewAuthoredWorkUpdated'){
		obj.AssessmentListNode.peerReviewAuthoredWorkUpdated();
	} else if(type=='assessmentListPeerReviewStepNotOpenCustomMessageUpdated'){
		obj.AssessmentListNode.peerReviewStepNotOpenCustomMessageUpdated();
	}
};

//this list of events
var events = [
	'assessmentlistPromptChanged',
	'assessmentlistFieldUpdated',
	'assessmentlistRadioItemFieldUpdated',
	'assessmentlistAddNewItem',
	'assessmentlistRemoveItem',
	'assessmentlistAddChoice',
	'assessmentlistRadioItemRemoveChoice',
	'assessmentlistUpdateRichText',
	'assessmentlistStarterOptionChanged',
	'assessmentlistStarterSentenceUpdated',
	'assessmentOptionChanged',
	'assessmentListCorrectChoiceChanged',
	'assessmentListIsAutoScoringEnabledChanged',
	'assessmentListUpdateImportantReviewSequencePart',
	'assessmentListPeerReviewPercentageTriggerUpdated',
	'assessmentListPeerReviewNumberTriggerUpdated',
	'assessmentListPeerReviewAuthoredWorkUpdated',
	'assessmentListPeerReviewStepNotOpenCustomMessageUpdated'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'assessmentlistDispatcher');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/assessmentlist/assessmentListEvents.js');
};