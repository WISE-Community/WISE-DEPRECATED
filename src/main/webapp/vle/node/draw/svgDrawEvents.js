
/**
 * The svg draw dispatcher catches events specific to authoring individual
 * svg draw steps and delegates them to the appropriate functions for
 * this view.
 */
View.prototype.svgdrawDispatcher = function(type,args,obj){
	if(type=='drawingPromptChanged'){
		obj.DrawNode.updatePrompt();
	} else if(type=='drawingBackgroundInfoChanged'){
		obj.DrawNode.backgroundInfoChanged();
	} else if(type=='drawingRemoveBackgroundImage'){
		obj.DrawNode.removeBackgroundImage();
	} else if(type=='drawingCreateBackgroundSpecified'){
		obj.DrawNode.createBackgroundSpecified();
	} else if(type=='drawingAddNewStamp'){
		obj.DrawNode.addNewStamp();
	} else if(type=='drawingStampInfoChanged'){
		obj.DrawNode.stampInfoChanged(args[0]);
	} else if(type=='drawingRemoveStamp'){
		obj.DrawNode.removeStamp(args[0]);
	} else if(type=='drawingCreateStampsSpecified'){
		obj.DrawNode.createStampsSpecified();
	} else if(type=='svgdrawToolbarOptionsChanged'){
		obj.SVGDrawNode.toolbarOptionsChanged();
	} else if(type=='svgdrawSnapshotOptionChanged'){
		obj.SVGDrawNode.snapshotOptionChanged();
	} else if(type=='svgdrawSnapshotMaxOptionChanged'){
		obj.SVGDrawNode.snapshotMaxChanged();
	} else if(type=='svgdrawDescriptionOptionChanged'){
		obj.SVGDrawNode.descriptionOptionChanged();
	} else if(type=='svgdrawDefaultDescriptionChanged'){
		obj.SVGDrawNode.defaultDescriptionChanged();
	} else if(type=='svgdrawPromptChanged'){
		obj.SVGDrawNode.updatePrompt();
	} else if(type=='svgdrawBackgroundChanged'){
		obj.SVGDrawNode.backgroundChanged();
	} else if(type=='svgdrawAddNewStamp'){
		obj.SVGDrawNode.addNewStamp();
	} else if(type=='svgdrawStampValueChanged'){
		obj.SVGDrawNode.stampValueChanged(args[0]);
	} else if(type=='svgdrawStampLabelChanged'){
		obj.SVGDrawNode.stampLabelChanged(args[0]);
	} else if(type=='svgdrawRemoveStamp'){
		obj.SVGDrawNode.removeStamp(args[0]);
	} else if(type=='svgdrawStampWidthChanged'){
		obj.SVGDrawNode.stampWidthChanged(args[0]);
	} else if(type=='svgdrawStampHeightChanged'){
		obj.SVGDrawNode.stampHeightChanged(args[0]);
	} else if(type=='svgdrawStampTitleClicked'){
		obj.SVGDrawNode.stampTitleClicked(args[0]);
	} else if(type=='svgdrawDescriptionClicked'){
		obj.SVGDrawNode.descriptionClicked();
	} else if(type=='svgdrawStampWidthClicked'){
		obj.SVGDrawNode.stampWidthClicked(args[0]);
	} else if(type=='svgdrawStampHeightClicked'){
		obj.SVGDrawNode.stampHeightClicked(args[0]);
	} else if(type=='svgdrawUpdateBackgroundImageUrl') {
		obj.SVGDrawNode.updateBackgroundImageUrl();
	} else if(type=='svgdrawBrowseClicked') {
		obj.SVGDrawNode.browseImageAssets();
	} else if(type=='svgdrawUpdateBgAlign') {
		obj.SVGDrawNode.updateBgAlign();
	} else if(type=='svgdrawUpdateAutoScoringCriteria') {
		obj.SVGDrawNode.updateAutoScoringCriteria();
	} else if(type=='svgdrawUpdateAutoScoringFeedback') {
		obj.SVGDrawNode.updateAutoScoringFeedback(args[0]);
	} else if(type=='svgdrawUpdateAutoScoringDisplayScoreToStudentClicked') {
		obj.SVGDrawNode.updateAutoScoringDisplayScoreToStudent();
	} else if(type=='svgdrawUpdateAutoScoringDisplayFeedbackToStudentClicked') {
		obj.SVGDrawNode.updateAutoScoringDisplayFeedbackToStudent();
	} else if(type=='svgdrawUpdateAutoScoringCheckWorkChancesChanged') {
		obj.SVGDrawNode.updateAutoScoringCheckWorkChances();
	} else if(type=='svgdrawUpdateDoNotDisplayFeedbackToStudentOnLastChanceClicked') {
		obj.SVGDrawNode.updateDoNotDisplayFeedbackToStudentOnLastChance();
	} else if(type=='svgdrawUpdateAutoScoringSubmitConfirmationMessageChanged') {
		obj.SVGDrawNode.updateAutoScoringSubmitConfirmationMessageChanged();
	};
};

//this list of events
var events = [
	'drawingPromptChanged',
	'drawingBackgroundInfoChanged',
	'drawingRemoveBackgroundImage',
	'drawingCreateBackgroundSpecified',
	'drawingAddNewStamp',
	'drawingStampInfoChanged',
	'drawingRemoveStamp',
	'drawingCreateStampsSpecified',
	'svgdrawToolbarOptionsChanged',
	'svgdrawSnapshotOptionChanged',
	'svgdrawSnapshotMaxOptionChanged',
	'svgdrawDescriptionOptionChanged',
	'svgdrawDefaultDescriptionChanged',
	'svgdrawPromptChanged',
	'svgdrawBackgroundChanged',
	'svgdrawAddNewStamp',
	'svgdrawStampValueChanged',
	'svgdrawRemoveStamp',
	'svgdrawStampLabelChanged',
	'svgdrawStampWidthChanged',
	'svgdrawStampHeightChanged',
	'svgdrawStampTitleClicked',
	'svgdrawDescriptionClicked',
	'svgdrawStampWidthClicked',
	'svgdrawStampHeightClicked',
	'svgdrawUpdateBackgroundImageUrl',
	'svgdrawBrowseClicked',
	'svgdrawUpdateBgAlign',
	'svgdrawUpdateAutoScoringCriteria',
	'svgdrawUpdateAutoScoringFeedback',
	'svgdrawUpdateAutoScoringDisplayScoreToStudentClicked',
	'svgdrawUpdateAutoScoringDisplayFeedbackToStudentClicked',
	'svgdrawUpdateAutoScoringCheckWorkChancesChanged',
	'svgdrawUpdateDoNotDisplayFeedbackToStudentOnLastChanceClicked',
	'svgdrawUpdateAutoScoringSubmitConfirmationMessageChanged'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'svgdrawDispatcher');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/draw/svgDrawEvents.js');
};