
/**
 * The annotator dispatcher catches events specific to authoring individual
 * annotator steps and delegates them to the appropriate functions for
 * this view.
 */
View.prototype.annotatorDispatcher = function(type,args,obj){
	if(type==='annotatorUpdateWorkRequired'){
		obj.AnnotatorNode.updateWorkRequired();
	} else if(type==='annotatorUpdateBackgroundImageUrl') {
		obj.AnnotatorNode.updateBackgroundImageUrl();
	} else if(type==='annotatorBrowseClicked') {
		obj.AnnotatorNode.browseImageAssets();
	} else if(type==='annotatorPromptChanged'){
		obj.AnnotatorNode.updatePrompt();
	} else if(type==='annotatorUpdateMaxLabels'){
		obj.AnnotatorNode.updateMaxLabels();
	} else if(type==='annotatorUpdateMinLabels'){
		obj.AnnotatorNode.updateMinLabels();
	} else if(type==='annotatorUpdateEnableStudentTextArea'){
		obj.AnnotatorNode.updateEnableStudentTextArea();
	} else if(type==='annotatorUpdateTextAreaInstructions'){
		obj.AnnotatorNode.updateTextAreaInstructions();
	} else if(type==='annotatorUpdateStudentResponseButton'){
		obj.AnnotatorNode.updateStudentResponseButton();
	} else if(type==='annotatorUpdateDefaultColor'){
		obj.AnnotatorNode.updateDefaultColor();
	} else if(type==='annotatorUpdateAutoScoringCriteria') {
		obj.AnnotatorNode.updateAutoScoringCriteria();
	} else if(type==='annotatorUpdateAutoScoringFeedback') {
		obj.AnnotatorNode.updateAutoScoringFeedback(args[0]);
	} else if(type==='annotatorUpdateAutoScoringDisplayScoreToStudentClicked') {
		obj.AnnotatorNode.updateAutoScoringDisplayScoreToStudent();
	} else if(type==='annotatorUpdateAutoScoringDisplayFeedbackToStudentClicked') {
		obj.AnnotatorNode.updateAutoScoringDisplayFeedbackToStudent();
	} else if(type==='annotatorUpdateAutoScoringCheckWorkChancesChanged') {
		obj.AnnotatorNode.updateAutoScoringCheckWorkChances();
	} else if(type==='annotatorUpdateDoNotDisplayFeedbackToStudentOnLastChanceClicked') {
		obj.AnnotatorNode.updateDoNotDisplayFeedbackToStudentOnLastChance();
	} else if(type==='annotatorUpdateAutoScoringSubmitConfirmationMessageChanged') {
		obj.AnnotatorNode.updateAutoScoringSubmitConfirmationMessageChanged();
	} else if(type==='annotatorUpdateEnableImport') {
        obj.AnnotatorNode.updateEnableImport();
    };
};

//this list of events
var events = [
    'annotatorUpdateWorkRequired',
	'annotatorPromptChanged',
	'annotatorUpdateBackgroundImageUrl',
	'annotatorBrowseClicked',
	'annotatorUpdateMaxLabels',
	'annotatorUpdateMinLabels',
	'annotatorUpdateEnableStudentTextArea',
	'annotatorUpdateTextAreaInstructions',
	'annotatorUpdateStudentResponseButton',
	'annotatorUpdateDefaultColor',
	'annotatorUpdateAutoScoringCriteria',
	'annotatorUpdateAutoScoringFeedback',
	'annotatorUpdateAutoScoringDisplayScoreToStudentClicked',
	'annotatorUpdateAutoScoringDisplayFeedbackToStudentClicked',
	'annotatorUpdateAutoScoringCheckWorkChancesChanged',
	'annotatorUpdateDoNotDisplayFeedbackToStudentOnLastChanceClicked',
	'annotatorUpdateAutoScoringSubmitConfirmationMessageChanged',
	'annotatorUpdateEnableImport'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'annotatorDispatcher');
}

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/draw/annotatorEvents.js');
}