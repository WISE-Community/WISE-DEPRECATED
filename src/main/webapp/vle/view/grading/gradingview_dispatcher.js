View.prototype.gradingDispatcher = function(type, args, obj) {
	if(type=='scoreUpdated') {
		obj.scoreUpdatedEventListener(args[0], args[1], args[2], args[3], args[4]);
	} else if(type=='commentUpdated') {
		obj.commentUpdatedEventListener(args[0], args[1], args[2], args[3], args[4], args[5]);
	} else if(type=='flagCheckboxClicked') {
		obj.flagCheckboxClickedEventListener(args[0], args[1], args[2], args[3], args[4], args[5]);
	} else if(type=='inappropriateFlagCheckboxClicked') {
		obj.inappropriateFlagCheckboxClickedEventListener(args[0], args[1], args[2], args[3], args[4], args[5]);
	} else if(type=='processUserAndClassInfoCompleted') {
		obj.retrieveAnnotations();
	} else if(type=='gradingConfigUrlReceived') {
		obj.getGradingConfig(args[0]);
	} else if(type=='getGradingConfigCompleted') {
		obj.retrieveLocales("main");		
		obj.loadProject(obj.config.getConfigParam('projectURL'), obj.config.getConfigParam('projectBaseURL'), true);
		obj.initializeSession();
	} else if(type=='loadingProjectCompleted') {
		obj.getStudentUserInfo();
	} else if(type=='exportButtonClicked') {
		obj.exportButtonClickedEventListener(args[0], args[1]);
	} else if(type=='customActivityCheckBoxClicked') {
		obj.customActivityCheckBoxClicked(args[0]);
	} else if(type=='customSelectAllStepsCheckBoxClicked') {
		obj.customSelectAllStepsCheckBoxClicked();
	} else if(type=='retrieveProjectMetaDataCompleted') {
		obj.retrieveAnnotations();
	} else if(type=='maxScoreChanged') {
		//get the node id
		var nodeId = args[1];
		
		//get the max score input for the node id
		var maxScoreInputId = 'maxScore_' + nodeId;
		var maxScoreInput = $('#' + obj.escapeIdForJquery(maxScoreInputId));
		
		if(maxScoreInput != null) {
			//get the max score value
			var maxScoreValue = maxScoreInput.val();
			
			//save the max score to the server
			obj.saveMaxScore(nodeId, maxScoreValue);
		}
	} else if(type=='gradeByStepViewSelected') {
		//display the grade by step view
		obj.displayGradeByStepSelectPage();
		
		/*
		 * this will set off a chain of events that will retrieve the
		 * annotations and the student statuses
		 */
		obj.retrieveAnnotations();
	} else if(type=='gradeByTeamViewSelected') {
		//display the grade by team view
		obj.displayGradeByTeamSelectPage();
		
		/*
		 * this will set off a chain of events that will retrieve the
		 * annotations and the student statuses
		 */
		obj.retrieveAnnotations();
	} else if(type=='displayStudentUploadedFilesSelected') {
		obj.displayStudentUploadedFiles();
	} else if(type=='checkForNewWorkButtonClicked') {
		obj.checkForNewWorkButtonClickedEventListener();
	} else if(type=='smartFilter') {
		obj.smartFilter();
	} else if(type=='retrieveAnnotationsCompleted') {
		eventManager.fire("projectDataReceived");
		obj.initiateGradingDisplay();
	} else if(type=='retrieveIdeaBasketsCompleted') {
		
	} else if(type=='retrieveStudentWorkCompleted') {
		obj.calculateGradingStatistics();
		obj.reloadRefreshScreen();
		if (obj.gradingType == "monitor") {
			// if we're doing a classroom monitor, we need to display the student work in the div
			obj.displayNodeVisitsInStream();
		}
	} else if(type=='hidePersonalInfoOptionClicked') {
		obj.hidePersonalInfoOptionClickedEventListener();
	} else if(type=='filterStudentRowsRequested') {
		obj.filterStudentRows();
	} else if(type=='enlargeStudentWorkTextOptionClicked') {
		obj.enlargeStudentWorkText();
	} else if(type=='premadeCommentWindowLoaded') {
		obj.premadeCommentWindowLoaded();
	} else if(type=='premadeCommentLabelClicked') {
		obj.premadeCommentLabelClickedEventListener(args[0]);
	} else if(type=='exportExplanationButtonClicked') {
		obj.exportExplanationButtonClickedEventListener(args[0]);
	} else if(type=='groupClicked') {
		obj.groupClickedEventListener(args[0], args[1]);
	} else if(type=='specialExportButtonClicked') {
		obj.specialExportButtonClickedEventListener(args[0]);
	} else if(type=='realTimeMonitorSelectWorkgroupIdDropDownClicked') {
		obj.realTimeMonitorSelectWorkgroupIdDropDownClicked();
	} else if(type=='realTimeMonitorSelectStepDropDownClicked') {
		obj.realTimeMonitorSelectStepDropDownClicked();
	} else if(type=='realTimeMonitorShareWithClassClicked') {
		obj.realTimeMonitorShareWithClassClicked(args[0],args[1]);
	} else if(type=='lockScreenAndShareWithClass') {
		obj.lockScreenAndShareWithClass(args[0]);
	}
};


//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/grading/gradingview_dispatcher.js');
};