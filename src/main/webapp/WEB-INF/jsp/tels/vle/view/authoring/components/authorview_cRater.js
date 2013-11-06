
View.prototype.cRaterManager = function() {
	this.view;
};

View.prototype.cRaterManager.dispatcher = function(type, args, obj) {
	if(type=='cRaterVerify') {
		obj.updateCRater();
	} else if(type=='cRaterItemIdChanged') {
		obj.cRaterItemIdChanged();
	} else if(type=='cRaterItemTypeChanged') {
		obj.cRaterItemTypeChangedListener(args[0]);
	} else if(type=='cRaterFeedbackChanged') {
		obj.updateCRaterFeedback(args);
	} else if(type=='cRaterDisplayScoreToStudentChanged') {
		obj.updateCRaterDisplayScoreToStudent();
	} else if(type=='cRaterDisplayFeedbackToStudentChanged') {
		obj.updateCRaterDisplayFeedbackToStudent();
	} else if(type=='cRaterMustSubmitAndReviseBeforeExitChanged') {
		obj.updateCRaterMustSubmitAndReviseBeforeExit();
	} else if(type=='cRaterAddFeedback') {
		obj.cRaterAddFeedback(args);
	} else if(type=='cRaterRemoveFeedback') {
		obj.cRaterRemoveFeedback(args);
	} else if(type=='cRaterMaxCheckAnswersChanged') {
		obj.updateCRaterMaxCheckAnswers();
	} else if(type=='enableCRater') {
		obj.updateEnableCRater();
	} else if(type=='cRaterStudentActionUpdated') {
		obj.cRaterStudentActionUpdated(args);
	}
};

/**
 * Insert the CRater authoring items into the author step page
 * @param view
 */
View.prototype.cRaterManager.insertCRater = function(view) {
	this.view = view;
	$('#cRaterContainer').append($('#cRaterDiv').show().detach());
	
	//populate the CRater values from the authored step content
	this.view.populateCRater();
};

/**
 * Clear input values and remove the div from the author step page
 * and put it back into the main authoring page
 */
View.prototype.cRaterManager.cleanupCRater = function() {
	$('#enableCRaterCheckbox').attr('checked', false);
	$('#cRaterItemIdInput').val('');
	$('#cRaterItemIdStatus').html('');
	$('#cRaterDisplayScoreToStudent').attr('checked', false);
	$('#cRaterDisplayFeedbackToStudent').attr('checked', false);
	$('#cRaterMustSubmitAndReviseBeforeExit').attr('checked', false);
	$('#cRaterMaxCheckAnswers').val('');
	$('#cRaterFeedback').html('');
	$('#cRaterSettingsDiv').hide();
	$('body').append($('#cRaterDiv').hide().detach());
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/components/authorview_cRater.js');
};