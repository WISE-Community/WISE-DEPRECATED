
/**
 * The matchsequenceDispatcher catches events specific to authoring individual
 * match sequence steps and delegates them to the appropriate functions for
 * this view.
 */
View.prototype.matchsequenceDispatcher = function(type,args,obj){
	if(type=='msUpdatePrompt'){
		obj.MatchSequenceNode.updatePrompt();
	} else if(type=='msUpdateOrdered'){
		obj.MatchSequenceNode.updateOrdered(args[0]);
	} else if(type=='msAddContainer'){
		obj.MatchSequenceNode.addContainer();
	} else if(type=='msAddChoice'){
		obj.MatchSequenceNode.addChoice();
	} else if(type=='msRemoveChoice'){
		obj.MatchSequenceNode.removeChoice();
	} else if(type=='msRemoveContainer'){
		obj.MatchSequenceNode.removeContainer();
	} else if(type=='msEditFeedback'){
		obj.MatchSequenceNode.editFeedback();
	} else if(type=='msShuffleChanged'){
		obj.MatchSequenceNode.shuffleChanged();
	} else if(type=='msContainerSelected'){
		obj.MatchSequenceNode.containerSelected(args[0]);
	} else if(type=='msContainerTextUpdated'){
		obj.MatchSequenceNode.containerTextUpdated(args[0]);
	} else if(type=='msSourceBucketNameUpdated'){
		obj.MatchSequenceNode.sourceBucketNameUpdated();
	} else if(type=='msChoiceSelected'){
		obj.MatchSequenceNode.choiceSelected(args[0],args[1]);
	} else if(type=='msChoiceTextUpdated'){
		obj.MatchSequenceNode.choiceTextUpdated(args[0]);
	} else if(type=='msOrderUpdated'){
		obj.MatchSequenceNode.orderUpdated(args[0]);
	} else if(type=='msHideFeedback'){
		obj.MatchSequenceNode.hideFeedback();
	} else if(type=='msEditIndividualFeedback'){
		obj.MatchSequenceNode.editIndividualFeedback(args[0],args[1]);
	} else if(type=='msSaveFeedback'){
		obj.MatchSequenceNode.saveFeedback();
	} else if(type=='msUpdateDisplayLayout'){
		obj.MatchSequenceNode.updateDisplayLayout(args[0]);
	} else if(type=='msUpdateLogLevel'){
		obj.MatchSequenceNode.updateLogLevel(args[0]);
	} else if(type=='msUpdateShowFeedback'){
		obj.MatchSequenceNode.updateShowFeedback(args[0]);
	} else if(type=='matchSequenceChallengeNavigateToChanged'){
		obj.MatchSequenceNode.challengeNavigateToChanged();
	} else if(type=='matchSequenceChallengeAddNew'){
		obj.MatchSequenceNode.addNewAttemptScore();
	} else if(type=='matchSequenceChallengeRemoveLast'){
		obj.MatchSequenceNode.removeLastAttemptScore();
	} else if(type=='matchSequenceChallengeScoreChanged'){
		obj.MatchSequenceNode.scoreChanged(args[0]);
	};
};

//this list of events
var events = [
	'msUpdatePrompt',
	'msUpdateOrdered',
	'msAddContainer',
	'msAddChoice',
	'msRemoveChoice',
	'msRemoveContainer',
	'msEditFeedback',
	'msShuffleChanged',
	'msContainerSelected',
	'msContainerTextUpdated',
	'msSourceBucketNameUpdated',
	'msChoiceSelected',
	'msChoiceTextUpdated',
	'msOrderUpdated',
	'msHideFeedback',
	'msEditIndividualFeedback',
	'msSaveFeedback',
	'msUpdateDisplayLayout',
	'msUpdateLogLevel',
	'msUpdateShowFeedback',
	'matchSequenceChallengeNavigateToChanged',
	'matchSequenceChallengeAddNew',
	'matchSequenceChallengeRemoveLast',
	'matchSequenceChallengeScoreChanged'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'matchsequenceDispatcher');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/matchsequence/matchSequenceEvents.js');
};