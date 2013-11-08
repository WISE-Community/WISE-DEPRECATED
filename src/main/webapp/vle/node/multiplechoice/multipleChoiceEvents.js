
/**
 * The multiplechoiceDispatcher catches events specific to authoring individual
 * multiple choice steps and delegates them to the appropriate functions for
 * this view.
 */
View.prototype.multiplechoiceDispatcher = function(type,args,obj){
	if(type=='mcCreateNewChoice'){
		obj.MultipleChoiceNode.createNewChoice();
	} else if(type=='mcClearCorrectChoice'){
		obj.MultipleChoiceNode.clearCorrectChoice();
	} else if(type=='mcShuffleChange'){
		obj.MultipleChoiceNode.shuffleChange(args[0]);
	} else if(type=='mcFeedbackOptionChange'){
		obj.MultipleChoiceNode.feedbackOptionChange(args[0]);
	} else if(type=='mcNumChoiceChanged'){
		obj.MultipleChoiceNode.numChoiceChanged();
	} else if(type=='mcXmlUpdated'){
		obj.MultipleChoiceNode.updatePrompt();
	} else if(type=='mcCorrectChoiceChange'){
		obj.MultipleChoiceNode.correctChoiceChange(args[0]);
	} else if(type=='mcRemoveChoice'){
		obj.MultipleChoiceNode.removeChoice(args[0]);
	} else if(type=='challengeNavigateToChanged'){
		obj.MultipleChoiceNode.challengeNavigateToChanged();
	} else if(type=='challengeAddNew'){
		obj.MultipleChoiceNode.addNewAttemptScore();
	} else if(type=='challengeRemoveLast'){
		obj.MultipleChoiceNode.removeLastAttemptScore();
	} else if(type=='challengeScoreChanged'){
		obj.MultipleChoiceNode.scoreChanged(args[0]);
	} else if(type=='branchCreateNewBranch'){
		obj.MultipleChoiceNode.createNewBranch();
	} else if(type=='branchRemoveBranch'){
		obj.MultipleChoiceNode.removeBranch(args[0]);
	} else if(type=='branchRemoveChoice'){
		obj.MultipleChoiceNode.branchRemoveChoice(args[0],args[1]);
	} else if(type=='branchAssociateAnswer'){
		obj.MultipleChoiceNode.associateAnswer(args[0]);
	} else if(type=='branchRemoveNode'){
		obj.MultipleChoiceNode.removeNode(args[0],args[1]);
	} else if(type=='branchAssociateNode'){
		obj.MultipleChoiceNode.associateNode(args[0]);
	} else if(type=='branchSelectAssociateAnswer'){
		obj.MultipleChoiceNode.selectedAssociateAnswer(args[0]);
	} else if(type=='branchSelectAssociateNode'){
		obj.MultipleChoiceNode.selectedAssociateNode(args[0]);
	} else if(type=='mcHideQuestionAndAnswersAfterAnsweredCorrectlyChanged'){
		obj.MultipleChoiceNode.mcHideQuestionAndAnswersAfterAnsweredCorrectlyChanged();
	}
};

//this list of events
var events = [
	'mcCreateNewChoice',
	'mcClearCorrectChoice',
	'mcShuffleChange',
	'mcFeedbackOptionChange',
	'mcNumChoiceChanged',
	'mcXmlUpdated',
	'mcCorrectChoiceChange',
	'mcRemoveChoice',
	'challengeNavigateToChanged',
	'challengeAddNew',
	'challengeRemoveLast',
	'challengeScoreChanged',
	'branchCreateNewBranch',
	'branchRemoveBranch',
	'branchRemoveChoice',
	'branchAssociateAnswer',
	'branchRemoveNode',
	'branchAssociateNode',
	'branchSelectAssociateAnswer',
	'branchSelectAssociateNode',
	'mcHideQuestionAndAnswersAfterAnsweredCorrectlyChanged'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'multiplechoiceDispatcher');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/multiplechoice/multipleChoiceEvents.js');
};