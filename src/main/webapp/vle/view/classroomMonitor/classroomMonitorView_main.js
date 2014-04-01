View.prototype.classroomMonitorDispatcher = function(type, args, obj) {
	if(type == 'classroomMonitorConfigUrlReceived') {
		obj.getClassroomMonitorConfig(args[0]);
	} else if(type == 'loadingProjectCompleted') {
		obj.getStudentStatuses();
	}
};

/**
 * Get the classroom monitor config so we can start the classroom monitor
 * @param classroomMonitorConfigUrl the url to retrieve the classroom monitor config
 */
View.prototype.getClassroomMonitorConfig = function(classroomMonitorConfigUrl) {
	//create the classroom monitor model
	this.model = new ClassroomMonitorModel();
	
	//get the classroom monitor config
	var classroomMonitorConfigContent = createContent(classroomMonitorConfigUrl);
	this.config = this.createConfig(classroomMonitorConfigContent);
	
	//load the user and class info
	this.loadUserAndClassInfo(createContent(this.config.getConfigParam('getUserInfoUrl')));
	
	//start the classroom monitor
	this.startClassroomMonitor();
};

/**
 * Start the classroom monitor
 */
View.prototype.startClassroomMonitor = function() {
	//get the run name
	var runName = this.config.getConfigParam("runName");
	
	//get the run id
	var runId = this.config.getConfigParam("runId");
	
	//set the classroom monitor header
	if(runName != null && runId != null) {
		$('#classroomMonitorHeader').text(runName + ' (Run ID ' + runId + ')');
	} else {
		$('#classroomMonitorHeader').text('Classroom Monitor');		
	}
	
	//display a loading message
	$('#selectDisplayButtonsDiv').html('<p style="display:inline;margin-left:5px">Loading...</p>');
	
	//initialize the session
	this.initializeSession();
	
	/*
	 * load the project. when the project loading is completed we will
	 * get the student statuses, get the students online list, and then
	 * start the websocket connection 
	 */
	this.loadProject(this.config.getConfigParam('getContentUrl'), this.config.getConfigParam('getContentBaseUrl'), true);
};


/**
 * Create all the UI elements for the classroom monitor
 */
View.prototype.createClassroomMonitorDisplays = function() {
	this.createClassroomMonitorButtons();
	this.createClassroomMonitorPeriods();
	this.createPauseScreensDisplay();
	this.createStudentProgressDisplay();
	this.createStepProgressDisplay();
	this.createGradeByStudentDisplay();
	this.createGradeByStepDisplay();
	this.createExportStudentWorkDisplay();
};

/**
 * Hide all the displays divs
 */
View.prototype.hideAllDisplays = function() {
	$('#studentProgressDisplay').hide();
	$('#stepProgressDisplay').hide();
	$('#gradeByStudentDisplay').hide();
	$('#gradeByStepDisplay').hide();
	$('#pauseScreensDisplay').hide();
	$('#exportStudentWorkDisplay').hide();
}

/**
 * Show the pause all screens display
 */
View.prototype.showPauseScreensDisplay = function() {
	//clear any existing buttons in the upper right
	this.clearDisplaySpecificButtonsDiv();
	this.clearSaveButtonDiv();
	
	//hide all the other display divs
	this.hideAllDisplays();
	
	//show the pause screens div
	$('#pauseScreensDisplay').show();
	
	//fix the height so scrollbars display correctly
	this.fixClassroomMonitorDisplayHeight();
};


/**
 * Show the student progress display
 */
View.prototype.showStudentProgressDisplay = function() {
	//clear any existing buttons in the upper right
	this.clearDisplaySpecificButtonsDiv();
	this.clearSaveButtonDiv();
	
	//hide all the other display divs
	this.hideAllDisplays();
	
	//show the student progress div
	$('#studentProgressDisplay').show();
	
	//fix the height so scrollbars display correctly
	this.fixClassroomMonitorDisplayHeight();
};


/**
 * Show the step progress display
 */
View.prototype.showStepProgressDisplay = function() {
	//clear any existing buttons in the upper right
	this.clearDisplaySpecificButtonsDiv();
	this.clearSaveButtonDiv();
	
	//hide all the other display divs
	this.hideAllDisplays();
	
	//show the step progress div
	$('#stepProgressDisplay').show();
	
	//fix the height so scrollbars display correctly
	this.fixClassroomMonitorDisplayHeight();
};

/**
 * Show the step progress display
 */
View.prototype.showGradeByStudentDisplay = function() {
	//hide all the other display divs
	this.hideAllDisplays();
	
	//show the grade by student div
	$('#gradeByStudentDisplay').show();
	
	//fix the height so scrollbars display correctly
	this.fixClassroomMonitorDisplayHeight();
};

/**
 * Show the step progress display
 */
View.prototype.showGradeByStepDisplay = function() {
	//hide all the other display divs
	this.hideAllDisplays();
	
	//show the grade by step div
	$('#gradeByStepDisplay').show();
	
	//fix the height so scrollbars display correctly
	this.fixClassroomMonitorDisplayHeight();
};

/**
 * Show the export student work display
 */
View.prototype.showExportStudentWorkDisplay = function() {
	//clear any existing buttons in the upper right
	this.clearDisplaySpecificButtonsDiv();
	this.clearSaveButtonDiv();
	
	//hide all the other display divs
	this.hideAllDisplays();
	
	//show the grade by step div
	$('#exportStudentWorkDisplay').show();
	
	//fix the height so scrollbars display correctly
	this.fixClassroomMonitorDisplayHeight();
};

/**
 * Opens teacher's notes for this run
 */
View.prototype.openTeacherRunNotes = function (runId) {
	var path = this.config.getConfigParam("wiseBaseURL") + "/teacher/run/notes.html?runId=" + runId;
	var myNotesDiv = $('<div>').attr('id', 'myNotesDialog').html('<iframe id="myNotesIfrm" width="100%" height="95%" src="'+path+'"></iframe>');
	$("#classroomMonitorMainDiv").append(myNotesDiv);
	myNotesDiv.dialog({
		modal: true,
		width: '700',
		height: '600',
		title: 'My Notes',
		close: function(){ $(this).html(''); },
		buttons: {
			Close: function(){
				$(this).dialog('close');
			}
		}
	});
};

/**
 * Create the classroom monitor buttons
 */
View.prototype.createClassroomMonitorButtons = function() {
	//make the period button class
	var chooseClassroomMonitorDisplayButtonClass = 'chooseClassroomMonitorDisplayButton';
	
	//create the student progress button
	var studentProgressButton = $('<input/>').attr({id:'studentProgressButton', type:'button', name:'studentProgressButton', value:'Student Progress'});
	studentProgressButton.addClass(chooseClassroomMonitorDisplayButtonClass);
	
	/*
	 * make the button yellow since the pause screens display is 
	 * the display we show when the classroom monitor starts up
	 */
	this.setActiveButtonBackgroundColor(studentProgressButton);
	
	//create the step progress button
	var stepProgressButton = $('<input/>').attr({id:'stepProgressButton', type:'button', name:'stepProgressButton', value:'Step Progress'});
	stepProgressButton.addClass(chooseClassroomMonitorDisplayButtonClass);
	
	//create the pause all screens tool button
	var pauseScreensToolButton = $('<input/>').attr({id:'pauseScreensButton', type:'button', name:'pauseScreensButton', value:'Pause Screens Tool'});
	pauseScreensToolButton.addClass(chooseClassroomMonitorDisplayButtonClass);
	
	//create the my notes button
	var myNotesButton = $('<input/>').attr({id:'myNotesButton', type:'button', name:'myNotesButton', value:'My Notes'});
	myNotesButton.addClass(chooseClassroomMonitorDisplayButtonClass);

	//create the export student work button
	var exportStudentWorkButton = $('<input/>').attr({id:'exportStudentWorkButton', type:'button', name:'exportStudentWorkButton', value:'Export Student Work'});
	exportStudentWorkButton.addClass(chooseClassroomMonitorDisplayButtonClass);
	
	//set the click event for the student progress button
	studentProgressButton.click({thisView:this}, function(event) {
		var thisView = event.data.thisView;
		
		//clear the background from the other display buttons and make this button background yellow
		thisView.setActiveButtonBackgroundColor(this, chooseClassroomMonitorDisplayButtonClass);
		
		//show the student progress display
		thisView.showStudentProgressDisplay();
	});
	
	//set the click event for the step progress button
	stepProgressButton.click({thisView:this}, function(event) {
		var thisView = event.data.thisView;
		
		//clear the background from the other display buttons and make this button background yellow
		thisView.setActiveButtonBackgroundColor(this, chooseClassroomMonitorDisplayButtonClass);
		
		//show the step progress display
		thisView.showStepProgressDisplay();
	});
	
	//set the click event for the pause all screens tool button
	pauseScreensToolButton.click({thisView:this}, function(event) {
		var thisView = event.data.thisView;
		
		//clear the background from the other display buttons and make this button background yellow
		thisView.setActiveButtonBackgroundColor(this, chooseClassroomMonitorDisplayButtonClass);
		
		//show the pause all screens display
		thisView.showPauseScreensDisplay();
	});
	
	//set the click event for the my notes button
	myNotesButton.click({thisView:this}, function(event) {
		var thisView = event.data.thisView;
		var runId = thisView.config.getConfigParam("runId");
		if (runId != null) {
			//open teacher run notes dialog
			thisView.openTeacherRunNotes(runId);			
		}
	});
	
	//set the click event for the export student work button
	exportStudentWorkButton.click({thisView:this}, function(event) {
		var thisView = event.data.thisView;
		
		//clear the background from the other display buttons and make this button background yellow
		thisView.setActiveButtonBackgroundColor(this, chooseClassroomMonitorDisplayButtonClass);
		
		//show the step progress display
		thisView.showExportStudentWorkDisplay();
	});
	
	//add the select display buttons
	$('#selectDisplayButtonsDiv').append(studentProgressButton);
	$('#selectDisplayButtonsDiv').append(stepProgressButton);
	$('#selectDisplayButtonsDiv').append(pauseScreensToolButton);
	$('#selectDisplayButtonsDiv').append(myNotesButton);
	$('#selectDisplayButtonsDiv').append(exportStudentWorkButton);
	
	//fix the height so scrollbars display correctly
	this.fixClassroomMonitorDisplayHeight();
};

/**
 * Set the background of the active button to yellow and remove
 * the background color from the other buttons that are in the
 * same class
 * @param button the button element to make yellow
 * @param classToRemoveBackgroundFrom the class that the button is
 * in so we can remove the yellow background from the other buttons
 */
View.prototype.setActiveButtonBackgroundColor = function(button, classToRemoveBackgroundFrom) {
	if(classToRemoveBackgroundFrom != null) {
		//remove the yellow background from the other buttons in the class
		$('.' + classToRemoveBackgroundFrom).css('background', '');
	}
	
	if(button != null) {
		//make this button yellow
		$(button).css('background', 'yellow');		
	}
};

/**
 * Create the period buttons for the teacher to filter by period
 */
View.prototype.createClassroomMonitorPeriods = function() {
	//make the class to give to all period buttons
	var periodButtonClass = 'periodButton';
	
	//get all the periods
	var periods = this.getUserAndClassInfo().getPeriods();
	
	//create a button for all the periods
	var allPeriodsButton = $('<input/>').attr({id:'periodButton_all', type:'button', name:'periodButton_all', value:'All'});
	allPeriodsButton.addClass(periodButtonClass);
	
	/*
	 * make the button yellow since all periods is selected 
	 * when the classroom monitor starts up
	 */
	this.setActiveButtonBackgroundColor(allPeriodsButton);
	
	//add the all periods button to the UI
	$('#selectPeriodButtonsDiv').append(allPeriodsButton);
	
	//set the click event for the all periods button
	allPeriodsButton.click({thisView:this}, function(event) {
		var thisView = event.data.thisView;
		
		//get the id of the button
		var buttonId = this.id;
		
		//get the period id
		var periodId = buttonId.replace('periodButton_', '');
		
		//clear the background from the other period buttons and make this button background yellow
		thisView.setActiveButtonBackgroundColor(this, periodButtonClass);
		
		/*
		 * a period button has been clicked so we will perform 
		 * any necessary changes to the UI
		 */
		thisView.periodButtonClicked(periodId);
	});
	
	if(periods != null) {
		//loop through all the periods
		for(var x=0; x<periods.length; x++) {
			//get a period
			var periodObject = periods[x];
			var periodId = periodObject.periodId;
			var periodName = periodObject.periodName;
			
			//make the id of the button
			var buttonId = 'periodButton_' + periodId;
			
			//make the label for the button
			var buttonLabel = 'Period ' + periodName;
			
			//create the button
			var periodButton = $('<input/>').attr({id:buttonId, type:'button', name:buttonId, value:buttonLabel});
			periodButton.addClass(periodButtonClass);
			
			//add the button to the UI
			$('#selectPeriodButtonsDiv').append(periodButton);
			
			//set the click event for the period button
			periodButton.click({thisView:this}, function(event) {
				var thisView = event.data.thisView;
				
				//get the id of the button
				var buttonId = this.id;
				
				//get the period id
				var periodId = buttonId.replace('periodButton_', '');
				
				//clear the background from the other period buttons and make this button background yellow
				thisView.setActiveButtonBackgroundColor(this, periodButtonClass);
				
				/*
				 * a period button has been clicked so we will perform 
				 * any necessary changes to the UI
				 */
				thisView.periodButtonClicked(periodId);
			});
		}
	}
	
	//when the classroom monitor first starts up it will be set to all periods
	this.classroomMonitorPeriodIdSelected = 'all';
};

/**
 * A period button was clicked so we will perform any necessary
 * changes to the UI such as filtering only for that period
 * @param periodId the period id
 */
View.prototype.periodButtonClicked = function(periodId) {
	if(periodId == null) {
		//if no period id was provided we will set the selected period to all
		this.classroomMonitorPeriodIdSelected = 'all';
	} else {
		//remember the period id that was selected
		this.classroomMonitorPeriodIdSelected = periodId;
	}
	
	//show the pause screens information for the period
	this.showPeriodInPauseScreensDisplay(periodId);
	
	//update the student progress display to only show students in the period
	this.showPeriodInStudentProgressDisplay(periodId);
	
	//update the step progress display to only show data from the period
	this.showPeriodInStepProgressDisplay(periodId);
	
	//update the grade by step display to only show students in the period
	this.showPeriodInGradeByStepDisplay(periodId);
};

/**
 * Show the pause screens information for a period
 * @param periodId the period id
 */
View.prototype.showPeriodInPauseScreensDisplay = function(periodId) {
	//get whether the period is paused or not
	var isPaused  = this.isPeriodPaused(periodId);
	
	//update the status text to show the teacher whether the period is paused or not
	this.setActivePausedButton(isPaused);
};

/**
 * Filter all the students to only show students in the period
 * @param periodId the period id
 */
View.prototype.showPeriodInStudentProgressDisplay = function(periodId) {
	if(periodId == null || periodId == 'all') {
		//show all the student rows for all the periods
		$('.studentProgressRow').show();
	} else if(periodId != null) {
		/*
		 * period id is provided so we will hide all student rows except the
		 * ones in the period
		 */
		
		//hide all the student rows in the student progress display
		$('.studentProgressRow').hide();
		
		//get the period id class
		var periodIdClass = 'studentProgressPeriodId_' + periodId;
		
		/*
		 * show all the student rows in the period within the
		 * student progress display. if the student progress display
		 * is not currently being displayed, the rows will
		 * not be shown but they will be shown when the teacher 
		 * switches to the student progress display.
		 */ 
		$('.' + periodIdClass).show();
	}
};

/**
 * Filter the step progress information to only show information
 * in a period
 * @param periodId the period id
 */
View.prototype.showPeriodInStepProgressDisplay = function(periodId) {
	
	//get all the node ids. this includes activity and step node ids.
	var nodeIds = this.getProject().getNodeIds();
	
	//loop through all the node ids
	for(var x=0; x<nodeIds.length; x++) {
		//get a node id
		var nodeId = nodeIds[x];
		
		//get the node
		var node = this.getProject().getNodeById(nodeId);
		
		if(node != null) {
			//get the number of students in the period that are on this step
			var numberOfStudentsOnStep = this.getNumberOfStudentsOnStep(nodeId, periodId);

			//get the percentage of students in the period who have completed this step
			var completionPercentage = this.calculateStepCompletionForNodeId(nodeId, periodId);
			
			/*
			 * update the number of students on the step and the 
			 * number of students who have completed the step
			 */
			this.updateStepProgress(nodeId, numberOfStudentsOnStep, completionPercentage);
		}
	}
};

/**
 * Filter the grade by step display by period
 * @param periodId only display students in this period
 */
View.prototype.showPeriodInGradeByStepDisplay = function(periodId) {
	if(periodId == null || periodId == 'all') {
		//show all the student rows for all the periods
		$('.gradeByStepRow').show();
	} else if(periodId != null) {
		/*
		 * period id is provided so we will hide all student rows except the
		 * ones in the period
		 */
		
		//hide all the student rows in the student progress display
		$('.gradeByStepRow').hide();
		
		//get the period id class
		var periodIdClass = 'gradeByStepRowPeriodId_' + periodId;
		
		/*
		 * show all the student rows in the period within the
		 * grade by step display
		 */ 
		$('.' + periodIdClass).show();
	}
};

/**
 * Fix the height of the classroomMonitorIfrm so no scrollbars are displayed
 * for the iframe
 */
View.prototype.fixClassroomMonitorDisplayHeight = function() {
	//get the height of the classroomMonitorIfrm
	var height = $('#classroomMonitorIfrm',window.parent.parent.document).height();
	if (height != null) {
		/*
		 * resize the height of the topifrm that contains the classroomMonitorIfrm
		 * so that there will be no scroll bars
		 * 
		 * this block is only applicable when classroom monitor is launched in a 
		 * floating window, not when launched in a new tab/window.
		 */
		$('#topifrm', parent.document).height(height);
	} else {
		$('#topifrm', parent.document).css("overflow-y", "auto");
	}
};

/**
 * Create the pause all screens display
 */
View.prototype.createPauseScreensDisplay = function() {
	//create the pause all screens div
	var pauseScreensDisplay = $('<div></div>').attr({id:'pauseScreensDisplay'});
	
	//add the pause all screens div to the main div
	$('#classroomMonitorMainDiv').append(pauseScreensDisplay);
	
	//hide the pause all screens div, we will show it later when necessary
	pauseScreensDisplay.hide();
	
	//create the span that will display the pause status
	var pauseScreenStatus = $('<span>').attr({id:'pauseScreenStatus'}).html("My students' screens are currently: ").css("display","block");
	
	//add the pause status span
	$('#pauseScreensDisplay').append(pauseScreenStatus);
	
	//see if all periods have been paused
	var isAllPeriodsPaused = this.isPeriodPaused();
	
	//the class for the pause and unpause buttons
	var pauseButtonsClass = 'pauseButtons';
	
	//create the pause button
	var pauseButton = $('<input/>').attr({id:'pauseButton', type:'button', name:'pauseButton', value:'Paused'});
	pauseButton.css('width', '300px');
	pauseButton.css('height', '100px');
	pauseButton.addClass(pauseButtonsClass);
	
	//set the click event for the pause button
	pauseButton.click({thisView:this}, function(event) {
		var thisView = event.data.thisView;
		
		//get the period id that was selected
		var classroomMonitorPeriodIdSelected = thisView.classroomMonitorPeriodIdSelected;
		
		//pause the student screens for the selected period
		thisView.pauseScreens(classroomMonitorPeriodIdSelected);
		
		//this is the pause button
		var isPaused = true;

		//make the pause button yellow		
		thisView.setActivePausedButton(isPaused);
	});

	//create the un-pause button
	var unPauseButton = $('<input/>').attr({id:'unPauseButton', type:'button', name:'unPauseButton', value:'Un-Paused'});
	unPauseButton.css('width', '300px');
	unPauseButton.css('height', '100px');
	unPauseButton.addClass(pauseButtonsClass);
	
	//set the click event for the un-pause button
	unPauseButton.click({thisView:this}, function(event) {
		var thisView = event.data.thisView;
		
		//get the period id that was selected
		var classroomMonitorPeriodIdSelected = thisView.classroomMonitorPeriodIdSelected;
		
		//un-pause the student screens for the selected period
		thisView.unPauseScreens(classroomMonitorPeriodIdSelected);
		
		//this is the unpause button
		var isPaused = false;

		//make the unpause button yellow		
		thisView.setActivePausedButton(isPaused);
	});
	
	//add the pause and un-pause buttons
	$('#pauseScreensDisplay').append(pauseButton);
	$('#pauseScreensDisplay').append(unPauseButton);
	
	//make the appropriate paused or unpaused button yellow
	this.setActivePausedButton(isAllPeriodsPaused);
};

/**
 * Set the appropriate paused/unpaused button to yellow show that
 * it is active
 * @param isPaused boolean value whether the student screens are
 * paused or not
 */
View.prototype.setActivePausedButton = function(isPaused) {
	var button = null;
	
	if(isPaused) {
		//get the paused button
		button = $('#pauseButton');
	} else {
		//get the unpaused button
		button = $('#unPauseButton');
	}
	
	//get the class for the pause buttons
	var classToRemoveBackgroundFrom = 'pauseButtons';

	//make the appropriate paused or unpaused button yellow
	this.setActiveButtonBackgroundColor(button, classToRemoveBackgroundFrom);
};

/**
 * Create the student progress display
 */
View.prototype.createStudentProgressDisplay = function() {
	//create the student progress div
	var studentProgressDisplay = $('<div></div>').attr({id:'studentProgressDisplay'});
	
	//add the student progress div to the main div
	$('#classroomMonitorMainDiv').append(studentProgressDisplay);
	
	//hide the student progress div, we will show it later when necessary
	studentProgressDisplay.hide();
	
	//create the table to display the students
	var studentProgressDisplayTable = $('<table>').attr({id:'studentProgressDisplayTable'});
	studentProgressDisplayTable.attr('border', '1px');

	//add the table to the student progress div
	$('#studentProgressDisplay').append(studentProgressDisplayTable);
	
	//create the header row
	var headerTR = $('<tr>');
	
	//create the column headers
	var onlineTH = $('<th>').text('Online');
	var studentNameTH = $('<th>').text('Student Name');
	var workgroupIdTH = $('<th>').text('Workgroup Id');
	var periodTH = $('<th>').text('Period');
	var currentStepTH = $('<th>').text('Current Step');
	var timeSpentTH = $('<th>').text('Time Spent On Current Step');
	var projectCompletionTH = $('<th>').text('Project Completion %');
	
	//add the column headers to the header row
	headerTR.append(onlineTH);
	headerTR.append(studentNameTH);
	headerTR.append(workgroupIdTH);
	headerTR.append(periodTH);
	headerTR.append(currentStepTH);
	headerTR.append(timeSpentTH);
	headerTR.append(projectCompletionTH);
	
	//add the header row to the table
	$('#studentProgressDisplayTable').append(headerTR);
	
	//get all the workgroup ids in the class
	var workgroupIds = this.getUserAndClassInfo().getClassmateWorkgroupIdsInAlphabeticalOrder();
	
	if(workgroupIds != null) {
		//loop through all the workgroup ids
		for(var x=0; x<workgroupIds.length; x++) {
			//get a workgroup id
			var workgroupId = workgroupIds[x];
			
			//check if the student is online
			var studentOnline = this.isStudentOnline(workgroupId);
			
			//get the project completion for the student
			var studentCompletion = this.calculateStudentCompletionForWorkgroupId(workgroupId);
			
			//get the usernames for this workgroup
			var userNames = this.userAndClassInfo.getUserNameByUserId(workgroupId);
			
			//get the period name the workgroup is in
			var periodName = this.userAndClassInfo.getClassmatePeriodNameByWorkgroupId(workgroupId);
			
			//get the period id the workgroup is in
			var periodId = this.userAndClassInfo.getClassmatePeriodIdByWorkgroupId(workgroupId);
			
			//get the current step the workgroup is on
			var currentStep = this.getStudentCurrentStepByWorkgroupId(workgroupId);
			
			/*
			 * set the time spent to be blank because it will be updated later when
			 * updateStudentProgressTimeSpentInterval() is called
			 */
			var timeSpent = '&nbsp';
			
			//create the row for the student
			var studentTR = this.createStudentProgressDisplayRow(studentOnline, userNames, workgroupId, periodId, periodName, currentStep, timeSpent, studentCompletion);
			
			if(studentTR != null) {
				//add the the row for this student to the end of the table
				$('#studentProgressDisplayTable tr:last').after(studentTR);				
			}
		}		
	}
	
	//set the interval to update the time spent values every 10 seconds for students that are online 
	setInterval(this.updateStudentProgressTimeSpentInterval, 10000);
};

/**
 * Create the student progress TR for a workgroup
 * @param studentOnline whether the workgroup is online
 * @param userNames the usernames for the workgroup
 * @param workgroupId the workgroup id
 * @param periodId the period id
 * @param periodName the period name
 * @param currentStep the current step the workgroup is on
 * @param timeSpent the time spent on the current step
 * @param completionPercentage the project completion percentage for the workgroup
 * @return a TR element containing the student progress values
 */
View.prototype.createStudentProgressDisplayRow = function(studentOnline, userNames, workgroupId, periodId, periodName, currentStep, timeSpent, completionPercentage) {
	var studentTR = null;
	
	if(workgroupId != null) {
		//create the student row
		var studentTR = $('<tr>').attr({id:'studentProgressTableRow_' + workgroupId});

		//set the student row class
		var studentRowClass = 'studentProgressRow';
		studentTR.addClass(studentRowClass);
		
		//create the period id class and add it to the student row
		var periodIdClass = 'studentProgressPeriodId_' + periodId;
		studentTR.addClass(periodIdClass);
		
		//create the cell to display whether the workgroup is online
		var onlineTD = $('<td>').attr({id:'studentProgressTableDataOnline_' + workgroupId});
		onlineTD.css('text-align', 'center');
		onlineTD.html(this.getIsOfflineHTML());
		
		//create the cell to display the usernames for the workgroup
		var userNameTD = $('<td>').attr({id:'studentProgressTableDataUserNames_' + workgroupId});
		userNameTD.text(userNames);
		
		//create the cell to display the workgroup id
		var workgroupIdTD = $('<td>').attr({id:'studentProgressTableDataWorkgroupId_' + workgroupId});
		workgroupIdTD.text(workgroupId);
		
		//create the cell to display the period name
		var periodTD = $('<td>').attr({id:'studentProgressTableDataPeriod_' + workgroupId});
		periodTD.text(periodName);
		
		//create the cell to display the current step the workgroup is on
		var currentStepTD = $('<td>').attr({id:'studentProgressTableDataCurrentStep_' + workgroupId});
		currentStepTD.text(currentStep);
		
		//create the cell to display the time spent on the current step
		var timeSpentTD = $('<td>').attr({id:'studentProgressTableDataTimeSpent_' + workgroupId});
		timeSpentTD.html(timeSpent);
		
		//create the cell to display the project completion percentage for the workgroup
		var completionPercentageTD = $('<td>').attr({id:'studentProgressTableDataCompletionPercentage_' + workgroupId});
		
		//get the student status for the workgroup id
		var studentStatus = this.getStudentStatusByWorkgroupId(workgroupId);
		
		if(studentStatus == null) {
			/*
			 * the student does not have a student status which can mean the 
			 * student has never loaded the vle or the run occurred before
			 * we implemented student statuses
			 */ 
			completionPercentageTD.text('N/A');
			completionPercentageTD.attr('title', 'This value is N/A because of one of these reasons:\n1. The student has never loaded the project.\n2. This is an old run and will not display completion percentages due to technical reasons. You may still view student work if you click on the student row.');
		} else {
			//the student has a student status so we will display the percentage
			completionPercentageTD.text(completionPercentage + '%');
		}
		
		//add all the cells to the student row
		studentTR.append(onlineTD);
		studentTR.append(userNameTD);
		studentTR.append(workgroupIdTD);
		studentTR.append(periodTD);
		studentTR.append(currentStepTD);
		studentTR.append(timeSpentTD);
		studentTR.append(completionPercentageTD);
		
		//create the params to be used when this the teacher clicks this row
		var studentRowClickedParams = {
			thisView:this,
			workgroupId:workgroupId
		}
		
		if(studentOnline) {
			//the student is online so we will make the row green
			studentTR.css('background', 'limegreen');
		}
		
		//set the function to be called when the row is clicked 
		studentTR.click(studentRowClickedParams, this.studentRowClicked);
		
		//make the cursor turn into a hand when the user mouseovers the row
		studentTR.css('cursor', 'pointer');
		
		//set the mouse enter event to highlight the row on mouse over
		studentTR.mouseenter({thisView:this}, this.mouseEnterTR);
		
		//set the mouse leave event to remove the highlight when the mouse exits the row
		studentTR.mouseleave({thisView:this, workgroupId:workgroupId}, this.mouseLeaveTR);
	}
	
	//return the student row
	return studentTR;
};

/**
 * The function that is called when a student row is clicked
 * 
 * @param event the click event
 */
View.prototype.studentRowClicked = function(event) {
	var thisView = event.data.thisView;
	
	//get the workgroup id of the row that was clicked
	var workgroupId = event.data.workgroupId;
	
	//call the function to handle the click
	thisView.studentRowClickedHandler(workgroupId);
};

/**
 * Called when a student row is clicked in the classroom monitor
 * 
 * @param workgroupId the workgroup id of the row that was clicked
 */
View.prototype.studentRowClickedHandler = function(workgroupId) {
	//hide all the other displays
	this.hideAllDisplays();
	
	//display a loading message in the grade by student display
	$('#gradeByStudentDisplay').html('<p style="display:inline;margin-left:5px">Loading...</p>');
	$('#gradeByStudentDisplay').show();
	
	//get the url for retrieving student data
	var getStudentDataUrl = this.getConfig().getConfigParam('getStudentDataUrl');
	
	var runId = this.getConfig().getConfigParam('runId');
	var grading = true;
	var getRevisions = true;
	
	//get all the step node ids that are used in the project
	var nodeIds = this.getProject().getNodeIds();
	nodeIds = nodeIds.join(':');
	
	var getStudentDataParams = {
		userId:workgroupId,
		grading:true,
		runId:runId,
		nodeIds:nodeIds,
		getRevisions:true,
		useCachedWork:false
	};
	
	//make the request to retrieve the student data
	this.connectionManager.request('GET', 1, getStudentDataUrl, getStudentDataParams, this.getGradeByStudentWorkInClassroomMonitorCallback, [this, workgroupId], this.getGradeByStudentWorkInClassroomMonitorCallbackFail);
};

/**
 * The success callback when retrieving student work
 * 
 * @param text the student work as text
 * @param xml 
 * @param args 
 */
View.prototype.getGradeByStudentWorkInClassroomMonitorCallback = function(text, xml, args) {
	var thisView = args[0];
	var workgroupId = args[1];
	
	//get the student work and do whatever we need to do with it
	thisView.getGradeByStudentWorkInClassroomMonitorCallbackHandler(workgroupId, text);
};

/**
 * Called when we successfully retrieve the student work
 * 
 * @param text the student work vle state as a JSON string
 */
View.prototype.getGradeByStudentWorkInClassroomMonitorCallbackHandler = function(workgroupId, text) {
	if(text != null) {
		//parse the vle state
		var vleState = VLE_STATE.prototype.parseDataJSONString(text);
		
		if(vleState != null) {
			//add the vle state to our model
			this.model.addWorkByStudent(workgroupId, vleState);
			
			//retrieve the annotations
			this.retrieveAnnotations('student', workgroupId);
		}
	}
};

/**
 * The failure callback when trying to retrieve student work
 */
View.prototype.getGradeByStudentWorkInClassroomMonitorCallbackFail = function(text, xml, args) {

};

/**
 * Display the grade by student display
 * @param workgroupId the workgroup id to display the grade by student display for
 */
View.prototype.displayGradeByStudent = function(workgroupId) {
	//clear the grade by student display
	$('#gradeByStudentDisplay').html('');
	
	//clear the grade by step display
	$('#gradeByStepDisplay').html('');
	
	//get the usernames for this workgroup
	var userNames = this.userAndClassInfo.getUserNameByUserId(workgroupId);
	
	//get the period name
	var periodName = this.userAndClassInfo.getClassmatePeriodNameByWorkgroupId(workgroupId);
	
	//get the period id
	var periodId = this.userAndClassInfo.getClassmatePeriodIdByWorkgroupId(workgroupId);
	
	//create the table that will display the user name, workgroup id, period name, navigation buttons, and save button
	var gradeByStudentHeaderTable = $('<table>');
	gradeByStudentHeaderTable.attr('id', 'gradeByStudentHeaderTable');
	gradeByStudentHeaderTable.attr('width', '100%');
	gradeByStudentHeaderTable.css('position', 'fixed');
	gradeByStudentHeaderTable.css('top', '105px');
	gradeByStudentHeaderTable.css('left', '10px');
	gradeByStudentHeaderTable.css('background', 'white');
	gradeByStudentHeaderTable.css('z-index', '1');
	
	//create the row that will display the user name, workgroup id, period name, navigation buttons, and save button
	var gradeByStudentHeaderTR = $('<tr>');
	
	/*
	 * create the div that will show the green or red dot to show whether
	 * the student is online
	 */
	var isOnlineDiv = $('<div>');
	isOnlineDiv.attr('id', 'isOnlineDiv_' + workgroupId);
	isOnlineDiv.css('float', 'left');
	isOnlineDiv.css('width', '20px');
	isOnlineDiv.css('margin', '1px');
	isOnlineDiv.css('text-align', 'center');
	
	var isOnline = this.isStudentOnline(workgroupId);
	
	if(isOnline) {
		//the student is online
		isOnlineDiv.html(this.getIsOnlineHTML());
	} else {
		//the student is offline
		isOnlineDiv.html(this.getIsOfflineHTML());
	}
	
	//create the table data that will display the user name, workgroup id, and period name
	var gradeByStudentHeaderUserNameTD = $('<td>');
	gradeByStudentHeaderUserNameTD.attr('width', '70%');
	gradeByStudentHeaderUserNameTD.css('background', 'yellow');
	
	//create the div to show the user name
	var userNameDiv = $('<div>');
	userNameDiv.css('float', 'left');
	userNameDiv.html(userNames + ' [Workgroup Id: ' + workgroupId + ']' + ' [Period ' + periodName + ']');
	
	gradeByStudentHeaderUserNameTD.append(isOnlineDiv);
	gradeByStudentHeaderUserNameTD.append(userNameDiv);
	
	//create the table data that will contain the navigation buttons, and save button
	var gradeByStudentHeaderRefreshButtonTD = $('<td>');
	gradeByStudentHeaderRefreshButtonTD.attr('width', '30%');
	
	//create the refresh button
	var refreshButton = $('<input>');
	refreshButton.attr('id', 'refreshButton');
	refreshButton.attr('type', 'button');
	refreshButton.val('Check for New Work');
	refreshButton.click({thisView:this, workgroupId:workgroupId}, this.studentRowClicked);
	
	//create the save button
	var saveButton = $('<input>');
	saveButton.attr('id', 'saveButton');
	saveButton.attr('type', 'button');
	saveButton.val('Save');
	saveButton.attr('disabled', true);
	
	var periodIdSelected = null;
	
	if(this.classroomMonitorPeriodIdSelected != null && this.classroomMonitorPeriodIdSelected != 'all') {
		//there was a period id that was selected
		periodIdSelected = this.classroomMonitorPeriodIdSelected;
	}
	
	//get the previous and next workgroup ids
	var previousAndNextWorkgroupIds = this.getUserAndClassInfo().getPreviousAndNextWorkgroupIdsInAlphabeticalOrder(workgroupId, periodIdSelected);
	var previousWorkgroupId = previousAndNextWorkgroupIds.previousWorkgroupId;
	var nextWorkgroupId = previousAndNextWorkgroupIds.nextWorkgroupId;

	//make the button for the previous workgroup id
	var previousWorkgroupIdButton = $('<input>');
	previousWorkgroupIdButton.attr('id', 'previousWorkgroup');
	previousWorkgroupIdButton.attr('type', 'button');
	previousWorkgroupIdButton.val('Previous Workgroup');
	
	if(previousWorkgroupId == null) {
		//there is no previous workgroup id so we will disable the button
		previousWorkgroupIdButton.attr('disabled', true);
	} else {
		//set the click event for the previous workgroup id button
		previousWorkgroupIdButton.click({thisView:this, workgroupId:previousWorkgroupId}, this.studentRowClicked);
	}
	
	//make the button for the next workgroup id
	var nextWorkgroupIdButton = $('<input>');
	nextWorkgroupIdButton.attr('id', 'nextWorkgroup');
	nextWorkgroupIdButton.attr('type', 'button');
	nextWorkgroupIdButton.val('Next Workgroup');
	
	if(nextWorkgroupId == null) {
		//there is no next workgroup id so we will disable the button
		nextWorkgroupIdButton.attr('disabled', true);
	} else {
		//set the click event for the next workgroup id button
		nextWorkgroupIdButton.click({thisView:this, workgroupId:nextWorkgroupId}, this.studentRowClicked);		
	}
	
	//clear any existing buttons in the upper right
	this.clearDisplaySpecificButtonsDiv();
	this.clearSaveButtonDiv();

	//add the buttons
	$('#displaySpecificButtonsDiv').append(previousWorkgroupIdButton);
	$('#displaySpecificButtonsDiv').append(refreshButton);
	$('#displaySpecificButtonsDiv').append(nextWorkgroupIdButton);
	$('#saveButtonDiv').append(saveButton);
	
	//add the tds to the row
	gradeByStudentHeaderTR.append(gradeByStudentHeaderUserNameTD);
	gradeByStudentHeaderTR.append(gradeByStudentHeaderRefreshButtonTD);
	
	//add the row to the header table
	gradeByStudentHeaderTable.append(gradeByStudentHeaderTR);
	
	//add the header table to the display
	$('#gradeByStudentDisplay').append(gradeByStudentHeaderTable);
	
	//create the table to display the grading rows
	var gradeByStudentDisplayTable = $('<table>').attr({id:'gradeByStudentDisplayTable'});
	gradeByStudentDisplayTable.css('border', 'none');
	gradeByStudentDisplayTable.css('width', '100%');

	//add the table to the student progress div
	$('#gradeByStudentDisplay').append(gradeByStudentDisplayTable);
	
	//get all the node ids. this includes activity and step node ids.
	var nodeIds = this.getProject().getAllNodeIds();
	
	//create an empty row for spacing
	var blankTR = $('<tr>');
	var emptyTD = $('<td>');
	emptyTD.html('&nbsp');
	emptyTD.css('border', 'none');
	blankTR.append(emptyTD);
	$('#gradeByStudentDisplayTable').append(blankTR);
	
	//loop through all the node ids
	for(var x=0; x<nodeIds.length; x++) {
		//get a node id
		var nodeId = nodeIds[x];
		
		//skip the master node
		if(nodeId != 'master') {
			if(nodeId != null) {
				//create the grading row for the step for the student
				var gradeByStudentDisplayTableRow = this.createGradeByStudentDisplayTableRow(nodeId, workgroupId);
				
				if(gradeByStudentDisplayTableRow != null) {
					//add the row to the grade by student table
					$('#gradeByStudentDisplayTable').append(gradeByStudentDisplayTableRow);					
				}
				
				//create an empty row for spacing
				var blankTR = $('<tr>');
				var emptyTD = $('<td>');
				emptyTD.html('&nbsp');
				emptyTD.css('border', 'none');
				blankTR.append(emptyTD);
				$('#gradeByStudentDisplayTable').append(blankTR);
			}			
		}
	}

	//show the grade by student display
	this.showGradeByStudentDisplay();
};

/**
 * Create a row for the grade by student table. Each row contains the row that
 * displays the step title, student work and teacher comment/score header and
 * all the student revisions for the step.
 * @param nodeId the node id
 * @param workgroup id the workgroup id
 */
View.prototype.createGradeByStudentDisplayTableRow = function(nodeId, workgroupId) {
	var gradeByStudentDisplayTableRow = null;
	
	if(nodeId != null && workgroupId != null) {
		//create the row
		gradeByStudentDisplayTableRow = $('<tr>').attr('id', 'gradeByStudentDisplayTableRow_' + nodeId);

		//create a table to display all the student work revisions for this node
		var nodeTable = $('<table>');
		nodeTable.attr('id', 'nodeTable_' + nodeId);
		nodeTable.attr('border', '1px');
		nodeTable.css('width', '100%');
		
		//get the node
		var node = this.getProject().getNodeById(nodeId);
		
		if(node != null) {
			//get the node type
			var nodeType = node.type;
			
			//get all the work for the student
			var vleState = this.model.getWorkByStudent(workgroupId);
			
			//get the step number and title
			var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId);
			
			var stepTitle = '';
			
			//we will not display number of students on step or completion percentage for sequences 
			if(nodeType == 'sequence') {
				//the node is an activity
				var nodePrefix = 'Activity';
				
				//create the step title
				stepTitle = nodePrefix + ' ' + stepNumberAndTitle;
			} else {
				//the node is a step
				var nodePrefix = 'Step';
				
				//create the step title
				stepTitle = nodePrefix + ' ' + stepNumberAndTitle + ' (' + nodeType + ')';
				
			}
			
			//create the row that will display the step title
			var stepTitleTR = $('<tr>');
			
			//create the table data that will display the step title
			var stepTitleTD = $('<td>');
			stepTitleTD.html(stepTitle);
			stepTitleTD.attr('colspan', 2);
			
			//add the step title table data to the row
			stepTitleTR.append(stepTitleTD);
			
			//add the row to the table
			nodeTable.append(stepTitleTR);
			
			if(nodeType != 'sequence') {
				//the node is a step
				
				//create the grading header row which contains the "Student Work" and "Teacher Comment/Score" tds
				var stepHeaderTR = this.createGradingHeaderRow();
				
				//add the row to the table
				nodeTable.append(stepHeaderTR);
			}
			
			if(vleState != null) {
				//get all the node visits for this student for this step
				var nodeVisits = vleState.getNodeVisitsWithWorkByNodeId(nodeId);
				
				//create the rows that will display all the student work revisions for this step
				this.createRowsForNodeVisits(nodeId, workgroupId, nodeTable, nodeVisits);
			}
			
			//add the step table to the step row
			gradeByStudentDisplayTableRow.append(nodeTable);
		}
	}
	
	return gradeByStudentDisplayTableRow;
};

/**
 * Create the row that will display the "Student Work" and "Teacher Comment/Score" text
 */
View.prototype.createGradingHeaderRow = function() {
	//create the row
	var stepHeaderTR = $('<tr>');
	
	//create the td that will display "Student Work"
	studentWorkTD = $('<td>');
	studentWorkTD.html('Student Work');
	studentWorkTD.attr('width', '70%');
	
	//create the td that will display "Teacher Comment/Score"
	teacherCommentScoreTD = $('<td>');
	teacherCommentScoreTD.html('Teacher Comment/Score');
	teacherCommentScoreTD.attr('width', '30%');
	
	//add the tds to the row
	stepHeaderTR.append(studentWorkTD);
	stepHeaderTR.append(teacherCommentScoreTD);
	
	return stepHeaderTR;
};

/**
 * Create the rows to display the node visits
 * @param nodeId the step the work is for
 * @param workgroupId the workgroup id
 * @param parentTable the table the rows will be added to
 * @param nodeVisits the node visits
 */
View.prototype.createRowsForNodeVisits = function(nodeId, workgroupId, parentTable, nodeVisits) {
	/*
	 * boolean to keep track of whether we are on the first revision or not.
	 * we will only display the score and comment grading for the first revision
	 * that we display.
	 */
	var isFirstRevision = true;
	
	//loop through all the node visits from newest to oldest
	for(var x=nodeVisits.length - 1; x>=0; x--) {
		//get a node visit
		var nodeVisit = nodeVisits[x];
		
		if(nodeVisit != null) {
			//get the step work id
			var stepWorkId = nodeVisit.id;
			
			//get the post time
			var visitPostTime = nodeVisit.visitPostTime;
			
			//create the row
			var stepWorkTR = $('<tr>');
			stepWorkTR.attr('id', 'stepWorkTR_' + stepWorkId);
			
			//create the td that will contain the student work
			var stepWorkTD = $('<td>');
			stepWorkTD.attr('id', 'stepWorkTD_' + stepWorkId);
			stepWorkTD.css('height', '100%');
			
			//create the div that will contain the student work
			var stepWorkDiv = $('<div>');
			stepWorkDiv.attr('id', 'stepWorkTD_' + stepWorkId);
			stepWorkDiv.css('height', '100%');
			
			//add the div to the td
			stepWorkTD.append(stepWorkDiv);
			
			//add the td to the row
			stepWorkTR.append(stepWorkTD);
			
			if(isFirstRevision) {
				//create the TD that contains the score and comment
				var stepCommentScoreTD = this.createGradingTD(nodeId, workgroupId, nodeVisit);
				
				//add the score and comment td to the row
				stepWorkTR.append(stepCommentScoreTD);
				
				//check if we should highlight the row
				if(this.shouldWeHighlightRow(nodeId, workgroupId, nodeVisit)) {
					//we will highlight the row since the student work is new
					stepWorkTR.css('background', '#FFEFED');
				}
			}
			
			//add the row to the table that contains all the revisions
			parentTable.append(stepWorkTR);
			
			//get the node
			var node = this.getProject().getNodeById(nodeId);
			
			try {
				//render the student work into the div
				node.renderGradingView(stepWorkDiv, nodeVisit, null, workgroupId);
			} catch(e) {
				console.log(e);
			}
			
			if(visitPostTime != null) {
				//set the timestamp for the student work
				var visitPostTimeDate = new Date(visitPostTime);
				stepWorkDiv.append('<br>Timestamp: ' + visitPostTimeDate);
			}
			
			/*
			 * set the boolean to false so that all subsequent revisions do
			 * not have the score and comment inputs
			 */
			isFirstRevision = false;
		}
	}
};

/**
 * Create the TD that will contain the grading input for score and comment
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 * @param stepWorkId the step work id
 */
View.prototype.createGradingTD = function(nodeId, workgroupId, nodeVisit) {
	//get the step work id
	var stepWorkId = nodeVisit.id;
	
	//get the post time
	var visitPostTime = nodeVisit.visitPostTime;
	
	var isWorkNewerThanScore = false;
	var isWorkNewerThanComment = false;
	var scorePostTime = null;
	var commentPostTime = null;
	
	//create the td that will contain everything
	var stepCommentScoreTD = $('<td>');
	stepCommentScoreTD.attr('id', 'stepCommentScoreTD_' + stepWorkId);
	stepCommentScoreTD.css('height', '100%');
	
	//create the div that will contain the score and comment inputs
	var stepCommentScoreDiv = $('<div>');
	stepCommentScoreDiv.attr('id', 'stepCommentScoreDiv_' + stepWorkId);
	stepCommentScoreDiv.css('height', '100%');
	
	//create the score input
	var scoreInput = $('<input>');
	scoreInput.attr('id', 'scoreInput_' + stepWorkId);
	scoreInput.attr('maxlength', 10);
	scoreInput.attr('size', 4);
	
	//get the latest score annotation for this step and student
	var latestScoreAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'score');
	
	if(latestScoreAnnotation != null) {
		//get the score
		var score = latestScoreAnnotation.value;
		
		//set the score into the input
		scoreInput.val(score);
		
		//get the post time for the score
		scorePostTime = latestScoreAnnotation.postTime;
		
		if(visitPostTime > scorePostTime) {
			//the student work is newer than the score annotation
			isWorkNewerThanScore = true;
		}
	} else {
		//the student work is new
		isWorkNewerThanScore = true;
	}
	
	//set the event for when anything is changed in the score input
	scoreInput.on('input', {thisView:this, stepWorkId:stepWorkId, nodeId:nodeId, workgroupId:workgroupId}, this.scoreChanged);
	
	//set the event for when the input value is changed and then loses focus
	scoreInput.on('change', {thisView:this, stepWorkId:stepWorkId, nodeId:nodeId, workgroupId:workgroupId}, this.saveScore);
	
	//create the comment textarea
	var commentTextArea = $('<textarea>');
	commentTextArea.attr('id', 'commentTextArea_' + stepWorkId);
	commentTextArea.attr('cols', 50);
	
	//get the latest comment annotation for this step and student
	var latestCommentAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'comment');
	
	if(latestCommentAnnotation != null) {
		//get the comment
		var comment = latestCommentAnnotation.value;
		
		//set the comment into the textarea
		commentTextArea.val(comment);
		
		//get the post time for the comment
		commentPostTime = latestCommentAnnotation.postTime;
		
		if(visitPostTime > commentPostTime) {
			//the student work is newer than the comment annotation
			isWorkNewerThanComment = true;
		}
	} else {
		//the student work is new
		isWorkNewerThanComment = true;
	}
	
	//set the event for when anything is changed in the comment textarea
	commentTextArea.on('input', {thisView:this, stepWorkId:stepWorkId, nodeId:nodeId, workgroupId:workgroupId}, this.commentChanged);
	
	//set the event for when the textarea value is changed and then loses focus
	commentTextArea.on('change', {thisView:this, stepWorkId:stepWorkId, nodeId:nodeId, workgroupId:workgroupId}, this.saveComment);
	
	//add the score input
	stepCommentScoreDiv.append('Score: ');
	stepCommentScoreDiv.append(scoreInput);
	stepCommentScoreDiv.append('<br>');
	
	//add the comment textarea
	stepCommentScoreDiv.append('Comment: ');
	stepCommentScoreDiv.append('<br>');
	stepCommentScoreDiv.append(commentTextArea);
	
	stepCommentScoreDiv.append('<br>');
	
	//add the div to the td
	stepCommentScoreTD.append(stepCommentScoreDiv);

	//create the div to display the annotation timestamp
	var annotationTimestampDiv = $('<div>');
	annotationTimestampDiv.attr('id', 'annotationTimestamp_' + stepWorkId);
	annotationTimestampDiv.css('font-size', '0.75em');
	
	//get the latest timestamp between the score and comment
	var annotationPostTime = Math.max(scorePostTime, commentPostTime);
	
	if(annotationPostTime != 0) {
		//create the annotation post time date
		var annotationPostTimeDate = new Date(annotationPostTime);
		
		//set the last annotation timestamp
		annotationTimestampDiv.html('Last Annotation: ' + annotationPostTimeDate);
	} else {
		//there has been no annotations
		annotationTimestampDiv.html('Last Annotation: not available');
	}
	
	//add the annotaiton timestamp div to the comment and score div
	stepCommentScoreDiv.append(annotationTimestampDiv);
	
	return stepCommentScoreTD;
};

/**
 * Check if we should highlight the row. We will highlight the row if the
 * student work is newer than the score and comment annotations
 * @param nodeId the node id
 * @param workgroup id the workgroup id
 * @param nodeVisit the node visit
 */
View.prototype.shouldWeHighlightRow = function(nodeId, workgroupId, nodeVisit) {
	var highlight = false;
	
	//get the step work id
	var stepWorkId = nodeVisit.id;
	
	//get the post time
	var visitPostTime = nodeVisit.visitPostTime;
	
	var isWorkNewerThanScore = false;
	var isWorkNewerThanComment = false;
	var scorePostTime = null;
	var commentPostTime = null;
	
	//get the latest score annotation for this step and student
	var latestScoreAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'score');
	
	if(latestScoreAnnotation != null) {
		//get the post time for the score
		scorePostTime = latestScoreAnnotation.postTime;
		
		if(visitPostTime > scorePostTime) {
			//the student work is newer than the score annotation
			isWorkNewerThanScore = true;
		}
	} else {
		//the student work is new
		isWorkNewerThanScore = true;
	}
	
	//get the latest comment annotation for this step and student
	var latestCommentAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'comment');
	
	if(latestCommentAnnotation != null) {
		//get the post time for the comment
		commentPostTime = latestCommentAnnotation.postTime;
		
		if(visitPostTime > commentPostTime) {
			//the student work is newer than the comment annotation
			isWorkNewerThanComment = true;
		}
	} else {
		//the student work is new
		isWorkNewerThanComment = true;
	}
	
	//check if the work is newer than the score and comment
	if(isWorkNewerThanScore && isWorkNewerThanComment) {
		highlight = true;
	}
	
	return highlight;
};

/**
 * Save the score
 */
View.prototype.saveScore = function(event) {
	var thisView = event.data.thisView;
	var stepWorkId = event.data.stepWorkId;
	var nodeId = event.data.nodeId;
	var workgroupId = event.data.workgroupId;
	
	thisView.saveScoreHandler(stepWorkId, nodeId, workgroupId);
};

/**
 * Check if the score is valid and then save the score to the server.
 * If the score is invalid we will revert it back to the previous value.
 * @param stepWorkId the step work id
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 */
View.prototype.saveScoreHandler = function(stepWorkId, nodeId, workgroupId) {
	var fromWorkgroup = this.getUserAndClassInfo().getWorkgroupId();
	var runId = this.getConfig().getConfigParam('runId');
	
	//check if the score has changed from the previous value
	if(this.isScoreChanged(stepWorkId, nodeId, workgroupId)) {
		//the score has changed so we will obtain the new value
		var scoreValue = $('#scoreInput_' + stepWorkId).val();
		
		if(this.isScoreValid(stepWorkId)) {
			//the score is valid so we will save it to the server
			this.postAnnotation(nodeId, workgroupId, fromWorkgroup, 'score', scoreValue, runId, stepWorkId);			
		} else {
			/*
			 * the score is invalid so we will display a message and revert it back
			 * to the previous value
			 */
			alert(scoreValue + ' is an invalid score.');
			this.revertScore(stepWorkId, nodeId, workgroupId);
		}
	}
};

/**
 * Save the comment
 */
View.prototype.saveComment = function(event) {
	var thisView = event.data.thisView;
	var stepWorkId = event.data.stepWorkId;
	var nodeId = event.data.nodeId;
	var workgroupId = event.data.workgroupId;
	
	thisView.saveCommentHandler(stepWorkId, nodeId, workgroupId);
};

/**
 * Save the comment to the server
 * @param stepWorkId the step work id
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 */
View.prototype.saveCommentHandler = function(stepWorkId, nodeId, workgroupId) {
	var fromWorkgroup = this.getUserAndClassInfo().getWorkgroupId();
	var runId = this.getConfig().getConfigParam('runId');
	
	//check if the comment has changed from the previous value
	if(this.isCommentChanged(stepWorkId, nodeId, workgroupId)) {
		//the comment has changed so we will obtain the new value
		var commentValue = $('#commentTextArea_' + stepWorkId).val();
		
		//save the comment to the server
		this.postAnnotation(nodeId, workgroupId, fromWorkgroup, 'comment', commentValue, runId, stepWorkId);
	}
};

/**
 * Post the annotation to the server
 * @param nodeId the node id
 * @param toWorkgroup the student workgroup id
 * @param fromWorkgroup the teacher workgroup id
 * @param type the type of annotation 'score' or 'comment'
 * @param value the annotation value
 * @param runId the run id
 * @param stepWorkId the step work id
 */
View.prototype.postAnnotation = function(nodeId, toWorkgroup, fromWorkgroup, type, value, runId, stepWorkId) {
	var postAnnotationsURL = this.getConfig().getConfigParam('postAnnotationsUrl');
	
	var postAnnotationParams = {
		runId:runId,
		toWorkgroup:toWorkgroup,
		fromWorkgroup:fromWorkgroup,
		annotationType:type,
		value:value,
		nodeId:nodeId,
		stepWorkId:stepWorkId
	}
	
	this.connectionManager.request('POST', 1, postAnnotationsURL, postAnnotationParams, this.postAnnotationCallbackSuccess, [this, stepWorkId], this.postAnnotationCallbackFailure);
};

/**
 * Callback for posting annotations
 */
View.prototype.postAnnotationCallbackSuccess = function(text, xml, args) {
	var thisView = args[0];
	var stepWorkId = args[1];
	
	thisView.postAnnotationCallbackSuccessHandler(stepWorkId, text);
};

/**
 * The function that actually handles the callback logic when posting annotations
 */
View.prototype.postAnnotationCallbackSuccessHandler = function(stepWorkId, timestamp) {
	//remove the background highlight color for the row
	$('#stepWorkTR_' + stepWorkId).css('background', '');
	
	if(timestamp != null) {
		//get the timestamp
		var timestampDate = new Date(parseInt(timestamp));
		
		//update the timestamp in the display
		$('#annotationTimestamp_' + stepWorkId).html('Last Annotation: ' + timestampDate);
	}
	
	//disable the save button
	$('#saveButton').attr('disabled', true);
};

/**
 * Callback failure function for posting annotations
 */
View.prototype.postAnnotationCallbackFailure = function() {
	
};

/**
 * Check if the score is valid
 * @param stepWorkId the step work id for the row
 */
View.prototype.isScoreValid = function(stepWorkId) {
	var result = false;
	
	//get the score from the input
	var scoreValue = $('#scoreInput_' + stepWorkId).val();
	
	//check if the score is a valid number
	if(!isNaN(scoreValue)) {
		//the score is a valid number
		result = true;
	}
	
	return result;
}

/**
 * Revert the score to the previous value
 * @param stepWorkId the step work id
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 */
View.prototype.revertScore = function(stepWorkId, nodeId, workgroupId) {
	var previousScore = '';
	
	//get the previous score annotation
	var latestScoreAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'score');
	
	if(latestScoreAnnotation != null) {
		//get the previous score value
		previousScore = latestScoreAnnotation.value;
	}
	
	//set the score input to the previous value
	$('#scoreInput_' + stepWorkId).val(previousScore);
}

/**
 * Check if the score has changed from the previous value
 * @param stepWorkId the step work id
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 */
View.prototype.isScoreChanged = function(stepWorkId, nodeId, workgroupId) {
	var result = false;
	
	//get the previous score annotation
	var latestScoreAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'score');
	
	var previousScore = '';
	
	if(latestScoreAnnotation != null) {
		//get the previous score
		previousScore = latestScoreAnnotation.value;
	}
	
	//get the new score input value
	var scoreValue = $('#scoreInput_' + stepWorkId).val();
	
	if(previousScore != scoreValue) {
		//the score has changed
		result = true;
	}
	
	return result;
};

/**
 * Check if the comment has changed from the previous value
 * @param stepWorkId the step work id
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 */
View.prototype.isCommentChanged = function(stepWorkId, nodeId, workgroupId) {
	var result = false;
	
	//get the previous comment annotation
	var latestCommentAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'comment');
	
	var previousComment = '';
	
	if(latestCommentAnnotation != null) {
		//get the previous comment
		previousComment = latestCommentAnnotation.value;
	}
	
	//get the new comment value
	var commentValue = $('#commentTextArea_' + stepWorkId).val();
	
	if(previousComment != commentValue) {
		//the comment has changed
		result = true;
	}
	
	return result;
};

/**
 * A score input has changed so we will enable the save button
 * @param event the jquery event object
 */
View.prototype.scoreChanged = function(event) {
	$('#saveButton').attr('disabled', false);
};

/**
 * A comment textarea has changed so we will enable the save button
 * @param event the jquery event object
 */
View.prototype.commentChanged = function(event) {
	$('#saveButton').attr('disabled', false);
};

/**
 * Get the latest annotation
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 * @param type the type of annotation
 */
View.prototype.getLatestAnnotation = function(nodeId, workgroupId, type) {
	var annotation = null;
	
	//get the annotations for the run
	var annotations = this.model.getAnnotations();
	
	//get the run id
	var runId = this.getConfig().getConfigParam('runId');
	
	//get the teacher workgroup ids
	var fromWorkgroups = this.getUserAndClassInfo().getAllTeacherWorkgroupIds();
	
	var stepWorkId = null;
	
	if(annotations != null) {
		//get the latest annotation with the given parameters
		annotation = annotations.getLatestAnnotation(runId, nodeId, workgroupId, fromWorkgroups, type, stepWorkId);
	}
	
	return annotation;
};

/**
 * Create the step progress display
 */
View.prototype.createStepProgressDisplay = function() {
	//create the step progress div
	var stepProgressDisplay = $('<div></div>').attr({id:'stepProgressDisplay'});
	
	//add the step progress display to the main div
	$('#classroomMonitorMainDiv').append(stepProgressDisplay);
	
	//hide the step progress div, we will show it later when necessary
	stepProgressDisplay.hide();
	
	//create the table that will display all the steps
	var stepProgressDisplayTable = $('<table>').attr({id:'stepProgressDisplayTable'});
	stepProgressDisplayTable.attr('border', '1px');
	
	//add the table to the step progress div
	$('#stepProgressDisplay').append(stepProgressDisplayTable);
	
	//create the header row
	var headerTR = $('<tr>');
	
	//create the header cells
	var stepTitleTH = $('<th>').text('Step Title');
	var numberOfStudentsOnStepTH = $('<th>').text('Number of Students on Step');
	var stepCompletionTH = $('<th>').text('Step Completion %');
	
	//add the header cells to the header row
	headerTR.append(stepTitleTH);
	headerTR.append(numberOfStudentsOnStepTH);
	headerTR.append(stepCompletionTH);
	
	//add the header row to the table
	$('#stepProgressDisplayTable').append(headerTR);
	
	//get all the node ids. this includes activity and step node ids.
	var nodeIds = this.getProject().getAllNodeIds();
	
	//loop through all the node ids
	for(var x=0; x<nodeIds.length; x++) {
		//get a node id
		var nodeId = nodeIds[x];
		
		//skip the master node
		if(nodeId != 'master') {
			//get the step number and title
			var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId);
			
			//get the node
			var node = this.getProject().getNodeById(nodeId);
			
			if(node != null) {
				//get the number of students on this step
				var numberOfStudentsOnStep = this.getNumberOfStudentsOnStep(nodeId);
				
				//get the percentage completion for this step
				var completionPercentage = this.calculateStepCompletionForNodeId(nodeId);
				
				//get the node type
				var nodeType = node.type;
				
				var tr = null;
				
				//we will not display number of students on step or completion percentage for sequences 
				if(nodeType == 'sequence') {
					numberOfStudentsOnStep= null;
					completionPercentage = null;
					nodeType = '';
				}
				
				var stepTitle = '';
				
				//create the step title
				if(node.type == 'sequence') {
					stepTitle = 'Activity ' + stepNumberAndTitle;
				} else {
					stepTitle = 'Step ' + stepNumberAndTitle + ' (' + nodeType + ')';
				}
				
				//create the row element for this step
				tr = this.createStepProgressDisplayRow(nodeId, stepTitle, numberOfStudentsOnStep, completionPercentage);
				
				if(tr != null) {
					//add the row to the end of the table
					$('#stepProgressDisplayTable tr:last').after(tr);
				}
			}			
		}
	}
};

/**
 * Create the step progress TR for a step
 * @param nodeId the node id for the step
 * @param stepTitle the step title
 * @param numberOfStudentsOnStep the number of students on the step
 * @param completionPercentage the percentage of students who have completed 
 * the step. this should be a number since we will append the % sign to it.
 * @return a TR element containing the step progress values
 */
View.prototype.createStepProgressDisplayRow = function(nodeId, stepTitle, numberOfStudentsOnStep, completionPercentage) {
	var stepTR = null;
	
	if(nodeId != null) {
		var node = this.getProject().getNodeById(nodeId);
		
		//create the row
		var stepTR = $('<tr>').attr({id:'stepProgressTableRow_' + nodeId});
		
		//create the step title cell
		var stepTitleTD = $('<td>').attr({id:'stepProgressTableDataStepTitle_' + nodeId});
		stepTitleTD.text(stepTitle);
		
		//create the number of students on step cell
		var numberStudentsOnStepTD = $('<td>').attr({id:'stepProgressTableDataNumberOfStudentsOnStep_' + nodeId});

		if(numberOfStudentsOnStep == null) {
			numberOfStudentsOnStep = '';
		}
		
		numberStudentsOnStepTD.text(numberOfStudentsOnStep);
		
		//create the completion percentage cell
		var completionPercentageTD = $('<td>').attr({id:'stepProgressTableDataCompletionPercentage_' + nodeId});
		
		//only show percentage completion for steps
		if(node != null && node.getType() != 'sequence') {
			//get the student statuses
			var studentStatuses = this.studentStatuses;
			
			//check if there are any student statuses in the array
			if(studentStatuses != null && studentStatuses.length > 0) {
				//there are student status objects so we will display the percentage
				completionPercentageTD.text(completionPercentage + '%');
			} else {
				/*
				 * there are no student status objects which can mean a
				 * student has never loaded the vle or the run occurred before
				 * we implemented student statuses
				 */ 
				completionPercentageTD.text('N/A');
				completionPercentageTD.attr('title', 'This value is N/A because of one of these reasons:\n1. A student has never loaded the project.\n2. This is an old run and will not display completion percentages due to technical reasons. You may still view student work if you click on the step row.');
			}			
		}
		
		//add the cells to the row
		stepTR.append(stepTitleTD);
		stepTR.append(numberStudentsOnStepTD);
		stepTR.append(completionPercentageTD);
		
		var node = this.getProject().getNodeById(nodeId);
		
		//make gradable steps clickable
		if(node != null && node.isLeafNode() && node.hasGradingView()) {
			//create the params to be used when this the teacher clicks this row
			var stepRowClickedParams = {
				thisView:this,
				nodeId:nodeId
			}
			
			//set the function to be called when the row is clicked
			stepTR.click(stepRowClickedParams, this.stepRowClicked);
			
			//make the cursor turn into a hand when the user mouseovers the row
			stepTR.css('cursor', 'pointer');
			
			//set the mouse enter event to highlight the row on mouse over
			stepTR.mouseenter({thisView:this}, this.mouseEnterTR);
			
			//set the mouse leave event to remove the highlight when the mouse exits the row
			stepTR.mouseleave({thisView:this}, this.mouseLeaveTR);
		}
	}
	
	return stepTR;
};

/**
 * The event that is fired when the mouse enters a row
 */
View.prototype.mouseEnterTR = function(event) {
	//highlight the row yellow
	$(this).css('background', 'yellow');
};

/**
 * The event that is fired when the mouse leaves a row
 */
View.prototype.mouseLeaveTR = function(event) {
	var thisView = event.data.thisView;
	var workgroupId = event.data.workgroupId;
	thisView.mouseLeaveTRHandler($(this), workgroupId);
};

/**
 * The function that handles the logic when the mouse leaves a row
 */
View.prototype.mouseLeaveTRHandler = function(trElement, workgroupId) {
	var studentOnline = false;
	
	if(workgroupId != null) {
		//check if the student is online
		if(this.isStudentOnline(workgroupId)) {
			studentOnline = true;
		}
	}
	
	if(studentOnline) {
		//the student is online so we will highlight the row green
		trElement.css('background', 'limegreen');
	} else {
		//the student is not online so we will not highlight the row
		trElement.css('background', '');		
	}
};


/**
 * The function that is called when a student row is clicked
 * 
 * @param event the click event
 */
View.prototype.stepRowClicked = function(event) {
	var thisView = event.data.thisView;
	
	//the node id of the row that was clicked
	var nodeId = event.data.nodeId;
	
	//call the function to handle the click
	thisView.stepRowClickedHandler(nodeId);
};

/**
 * Called when a step row is clicked in the classroom monitor
 * 
 * @param nodeId the node id of the row that was clicked
 */
View.prototype.stepRowClickedHandler = function(nodeId) {
	//hide all the other displays
	this.hideAllDisplays();

	//display a loading message in the grade by step display
	$('#gradeByStepDisplay').html('<p style="display:inline;margin-left:5px">Loading...</p>');
	$('#gradeByStepDisplay').show();
	
	//get the url for retrieving student data
	var getStudentDataUrl = this.getConfig().getConfigParam('getStudentDataUrl');
	
	var runId = this.getConfig().getConfigParam('runId');
	var grading = true;
	var getRevisions = true;
	
	//get the workgroup ids in the run
	var workgroupIds = this.getUserAndClassInfo().getClassmateWorkgroupIds();
	
	//join the workgroup ids into a single string delimited by ':'
	userIds = workgroupIds.join(':');
	
	var getStudentDataParams = {
		nodeIds:nodeId,
		userId:userIds,
		grading:true,
		runId:runId,
		getRevisions:true,
		useCachedWork:false
	}
	
	//make the request to retrieve the student data
	this.connectionManager.request('GET', 1, getStudentDataUrl, getStudentDataParams, this.getGradeByStepWorkInClassroomMonitorCallback, [this, nodeId], this.getStepWorkInClassroomMonitorCallbackFail);
};

/**
 * The success callback when retrieving student work
 * 
 * @param text the student work as text
 * @param xml 
 * @param args 
 */
View.prototype.getGradeByStepWorkInClassroomMonitorCallback = function(text, xml, args) {
	var thisView = args[0];
	var nodeId = args[1];

	//get the student work and do whatever we need to do with it
	thisView.getGradeByStepWorkInClassroomMonitorCallbackHandler(nodeId, text);
};

/**
 * Called when we successfully retrieve the student work
 * 
 * @param text the student work for the step
 */
View.prototype.getGradeByStepWorkInClassroomMonitorCallbackHandler = function(nodeId, text) {
	//get the student work as an array of node visits
	var vleStates = VLE_STATE.prototype.parseDataJSONString(text, true);
	
	//add the student work to the model
	this.model.addWorkByStep(nodeId, vleStates);
	
	//retrieve the annotations
	this.retrieveAnnotations('step', nodeId);
};

/**
 * The failure callback when trying to retrieve student work
 */
View.prototype.getGradeByStepWorkInClassroomMonitorCallbackFail = function(text, xml, args) {
	var thisView = args;
};

/**
 * Display the grade by step display
 * @param nodeId the node id
 */
View.prototype.displayGradeByStep = function(nodeId) {
	//clear the grade by student display
	$('#gradeByStudentDisplay').html('');
	
	//clear the grade by step display
	$('#gradeByStepDisplay').html('');
	
	if(nodeId != null) {
		
		//get the node
		var node = this.getProject().getNodeById(nodeId);
		
		if(node != null) {
			//get the node type
			var nodeType = node.type;
			
			//get the work for the step
			var workForStep = this.model.getWorkByStep(nodeId);
			
			//get the step number and title
			var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId);
			
			var stepTitle = '';
			
			//we will not display number of students on step or completion percentage for sequences 
			if(nodeType == 'sequence') {
				//the node is an activity
				var nodePrefix = 'Activity';
				
				//create the step title
				stepTitle = nodePrefix + ' ' + stepNumberAndTitle;
			} else {
				//the node is a step
				var nodePrefix = 'Step';
				
				//create the step title
				stepTitle = nodePrefix + ' ' + stepNumberAndTitle + ' (' + nodeType + ')';
			}
			
			//create the table that will contain the step title and the buttons
			var gradeByStepHeaderTable = $('<table>');
			gradeByStepHeaderTable.attr('id', 'gradeByStepHeaderTable');
			gradeByStepHeaderTable.attr('width', '100%');
			gradeByStepHeaderTable.css('position', 'fixed');
			gradeByStepHeaderTable.css('top', '105px');
			gradeByStepHeaderTable.css('left', '10px');
			gradeByStepHeaderTable.css('background', 'white');
			gradeByStepHeaderTable.css('z-index', '1');
			
			//create the row that will contain the step title and the buttons
			var gradeByStepHeaderTR = $('<tr>');
			
			//create the td that will contain the step title
			var gradeByStepHeaderStepTitleTD = $('<td>');
			gradeByStepHeaderStepTitleTD.attr('width', '70%');
			gradeByStepHeaderStepTitleTD.html(stepTitle);
			gradeByStepHeaderStepTitleTD.css('background', 'yellow');
			
			//create the td that will display the buttons
			var gradeByStepHeaderRefreshButtonTD = $('<td>');
			gradeByStepHeaderRefreshButtonTD.attr('width', '30%');
			
			//create the refresh button
			var refreshButton = $('<input>');
			refreshButton.attr('id', 'refreshButton');
			refreshButton.attr('type', 'button');
			refreshButton.val('Check for New Work');
			refreshButton.click({thisView:this, nodeId:nodeId}, this.stepRowClicked);
			
			//create the save button
			var saveButton = $('<input>');
			saveButton.attr('id', 'saveButton');
			saveButton.attr('type', 'button');
			saveButton.val('Save');
			saveButton.attr('disabled', true);
			
			//get the previous and next node ids
			var previousAndNextNodeIds = this.getProject().getPreviousAndNextNodeIds(nodeId);
			
			//create the previous step button
			var previousNodeId = previousAndNextNodeIds.previousNodeId;
			var previousStepButton = $('<input>');
			previousStepButton.attr('id', 'previousStepButton');
			previousStepButton.attr('type', 'button');
			previousStepButton.val('Previous Step');
			
			if(previousNodeId == null) {
				//there is no previous step so we will disable the button
				previousStepButton.attr('disabled', true);
			} else {
				//there is a previous step so we will set the click event
				previousStepButton.click({thisView:this, nodeId:previousNodeId}, this.stepRowClicked);				
			}
			
			//create the next step button
			var nextNodeId = previousAndNextNodeIds.nextNodeId;
			var nextStepButton = $('<input>');
			nextStepButton.attr('id', 'nextStepButton');
			nextStepButton.attr('type', 'button');
			nextStepButton.val('Next Step');
			
			if(nextNodeId == null) {
				//there is no next step so we will disable the button
				nextStepButton.attr('disabled', true);
			} else {
				//there is a next step so we will set the click event
				nextStepButton.click({thisView:this, nodeId:nextNodeId}, this.stepRowClicked);				
			}
			
			//clear any existing buttons in the upper right
			this.clearDisplaySpecificButtonsDiv();
			this.clearSaveButtonDiv();

			//add the buttons
			$('#displaySpecificButtonsDiv').append(previousStepButton);
			$('#displaySpecificButtonsDiv').append(refreshButton);
			$('#displaySpecificButtonsDiv').append(nextStepButton);
			$('#saveButtonDiv').append(saveButton);
			
			//add the tds to the row
			gradeByStepHeaderTR.append(gradeByStepHeaderStepTitleTD);
			gradeByStepHeaderTR.append(gradeByStepHeaderRefreshButtonTD);
			
			//add the row to the table
			gradeByStepHeaderTable.append(gradeByStepHeaderTR);
			
			//add the table to the div
			$('#gradeByStepDisplay').append(gradeByStepHeaderTable);
			
			//create the table that will contain the student work
			var gradeByStepDisplayTable = $('<table>').attr({id:'gradeByStepDisplayTable'});
			gradeByStepDisplayTable.css('border', 'none');
			gradeByStepDisplayTable.css('width', '100%');

			//add the table to the student progress div
			$('#gradeByStepDisplay').append(gradeByStepDisplayTable);
			
			//create a blank row for spacing
			var blankTR = $('<tr>');
			var emptyTD = $('<td>');
			emptyTD.html('&nbsp');
			emptyTD.css('border', 'none');
			blankTR.append(emptyTD);
			$('#gradeByStepDisplayTable').append(blankTR);
			
			//get the workgroup ids in alphabetical order
			var workgroupIds = this.getUserAndClassInfo().getClassmateWorkgroupIdsInAlphabeticalOrder();
			
			//loop through all the workgroup ids
			for(var x=0; x<workgroupIds.length; x++) {
				//get a workgroup id
				var workgroupId = workgroupIds[x];
				
				//create the row for this workgroup
				var gradeByStepDisplayTableRow = this.createGradeByStepDisplayTableRow(nodeId, workgroupId);
				
				//add the row to the table
				$('#gradeByStepDisplayTable').append(gradeByStepDisplayTableRow);
				
				//create a blank row for spacing
				var blankTR = $('<tr>');
				var emptyTD = $('<td>');
				emptyTD.html('&nbsp');
				emptyTD.css('border', 'none');
				blankTR.append(emptyTD);
				$('#gradeByStepDisplayTable').append(blankTR);
			}
		}
	}
	
	//make the grade by step display visible
	this.showGradeByStepDisplay();
	
};

/**
 * Create the row to display work for a student
 * @param nodeId the node id
 * @param workgrouopId the workgroup id
 */
View.prototype.createGradeByStepDisplayTableRow = function(nodeId, workgroupId) {
	var gradeByStepDisplayTableRow = null;
	
	if(nodeId != null && workgroupId != null) {
		//get the user names
		var userNames = this.userAndClassInfo.getUserNameByUserId(workgroupId);
		
		//get the period
		var period = this.userAndClassInfo.getClassmatePeriodNameByWorkgroupId(workgroupId);
		
		//get the period id
		var periodId = this.userAndClassInfo.getClassmatePeriodIdByWorkgroupId(workgroupId);

		//create the row
		gradeByStepDisplayTableRow = $('<tr>').attr('id', 'gradeByStepDisplayTableRow_' + nodeId);
		gradeByStepDisplayTableRow.addClass('gradeByStepRow');
		gradeByStepDisplayTableRow.addClass('gradeByStepRowPeriodId_' + periodId);
		
		if(this.classroomMonitorPeriodIdSelected != null && this.classroomMonitorPeriodIdSelected != 'all') {
			//we are filtering for a period
			
			if(this.classroomMonitorPeriodIdSelected != periodId) {
				//the period does not match the one that we want to show so we will hide this row
				gradeByStepDisplayTableRow.hide();				
			}
		}
		
		//create a table that will contain the grading rows
		var stepTable = $('<table>');
		stepTable.attr('id', 'stepTable_' + nodeId);
		stepTable.attr('border', '1px');
		stepTable.css('width', '100%');
		
		//create the row and td for the user name
		var userNameTR = $('<tr>');

		/*
		 * create the div that will show the green or red dot to show whether
		 * the student is online
		 */
		var isOnlineDiv = $('<div>');
		isOnlineDiv.attr('id', 'isOnlineDiv_' + workgroupId);
		isOnlineDiv.css('float', 'left');
		isOnlineDiv.css('width', '20px');
		isOnlineDiv.css('margin', '1px');
		isOnlineDiv.css('text-align', 'center');
		
		var isOnline = this.isStudentOnline(workgroupId);
		
		if(isOnline) {
			//the student is online
			isOnlineDiv.html(this.getIsOnlineHTML());
		} else {
			//the student is offline
			isOnlineDiv.html(this.getIsOfflineHTML());
		}
		
		//create the div to show the user name
		var userNameDiv = $('<div>');
		userNameDiv.css('float', 'left');
		userNameDiv.html(userNames + ' [Workgroup Id: ' + workgroupId + ']' + ' [Period ' + period + ']');
		
		userNameTR.append(isOnlineDiv);
		userNameTR.append(userNameDiv);
		
		//add the row to the table
		stepTable.append(userNameTR);
		
		//create the grading header row that contains the text "Student Work" and "Teacher Comment/Score"
		var headerTR = this.createGradingHeaderRow();
		
		//add the row to the table
		stepTable.append(headerTR);
		
		//get the work for this step for this student
		var vleStateForStepAndWorkgroupId = this.model.getWorkByStepAndWorkgroupId(nodeId, workgroupId);
		
		if(vleStateForStepAndWorkgroupId != null) {
			//get the node visits
			var nodeVisits = vleStateForStepAndWorkgroupId.getNodeVisitsWithWorkByNodeId(nodeId);
			
			//create the node visit rows
			this.createRowsForNodeVisits(nodeId, workgroupId, stepTable, nodeVisits);
		}
		
		//add the table to the row
		gradeByStepDisplayTableRow.append(stepTable);
	}

	return gradeByStepDisplayTableRow;
};

/**
 * Make a request to the server for all the student statuses for the run
 */
View.prototype.getStudentStatuses = function() {
	//get the student status url we will use to make the request
	var studentStatusUrl = this.getConfig().getConfigParam('studentStatusUrl');
	
	//get the run id
	var runId = this.getConfig().getConfigParam('runId');
	
	//create the params for the request
	var studentStatusParams = {
		runId:runId
	}
	
	if(studentStatusUrl != null) {
		//make the request to the server for the student statuses
		this.connectionManager.request('GET', 3, studentStatusUrl, studentStatusParams, this.getStudentStatusesCallback, this, this.getStudentStatusesFail, false, null);
	}
};

/**
 * The callback for getting the student statuses
 * @param responseText the student response JSONArray string
 * @param responseXML
 * @param view the view
 */
View.prototype.getStudentStatusesCallback = function(responseText, responseXML, view) {
	if(responseText != null) {
		//create the JSONArray from the response text
		var studentStatuses = JSON.parse(responseText);
		
		//loop through all the student statuses
		for(var x=0; x<studentStatuses.length; x++) {
			//get a student status
			var studentStatus = studentStatuses[x];
			
			/*
			 * insert the current timestamp so we can calculate how long
			 * the student has been on the current step they are on
			 */
			view.insertTimestamp(studentStatus);
		}
		
		//set the student statuses into the view so we can access it later
		view.studentStatuses = studentStatuses;

		//create the array to keep track of the students that are online
		view.studentsOnline = [];
		
		//get the run status which will tell us which periods are paused
		view.getRunStatus();
	}
};

/**
 * The failure callback for getting the student statuses
 */
View.prototype.getStudentStatusesFail = function(responseText, responseXML, view) {
	
};

/**
 * Get the run status from the server
 */
View.prototype.getRunStatus = function() {
	//get the run status url we will use to make the request
	var runStatusUrl = this.getConfig().getConfigParam('runStatusUrl');
	
	//get the run id
	var runId = this.getConfig().getConfigParam('runId');
	
	//create the params for the request
	var runStatusParams = {
		runId:runId
	}
	
	if(runStatusUrl != null) {
		//make the request to the server for the student statuses
		this.connectionManager.request('GET', 3, runStatusUrl, runStatusParams, this.getRunStatusCallback, this, this.getRunStatusFail, false, null);
	}
};

/**
 * Create a local run status object to keep track of the run status
 */
View.prototype.createRunStatus = function() {
	var runStatus = {};
	
	//get the run id
	runStatus.runId = this.getConfig().getConfigParam('runId');
	
	//set this to default to not paused
	runStatus.allPeriodsPaused = false;
	
	//get all the periods objects
	var periods = this.getUserAndClassInfo().getPeriods();
	
	//loop through all the periods
	for(var x=0; x<periods.length; x++) {
		//get a period
		var period = periods[x];
		
		//set this to default to not paused
		period.paused = false;
	}
	
	//set the periods into the run status
	runStatus.periods = periods;
	
	//set the run status into the view so we can access it later
	this.runStatus = runStatus;
	
	return this.runStatus;
};

/**
 * Update our local run status with the new run status values
 * @param newRunStatus the new run status to update our values to
 */
View.prototype.updateRunStatus = function(newRunStatus) {
	//get our local copy of the run status
	var runStatus = this.runStatus;
	
	//get our periods
	var periods = runStatus.periods;
	
	if(newRunStatus != null) {
		//see if the new run status has all periods paused
		var newRunStatusAllPeriodsPaused = newRunStatus.allPeriodsPaused;
		
		if(newRunStatusAllPeriodsPaused != null) {
			//update the all periods paused in our local run status
			runStatus.allPeriodsPaused = newRunStatus.allPeriodsPaused;			
		}
		
		//get the periods from the new run status
		var newRunStatusPeriods = newRunStatus.periods;
		
		if(newRunStatusPeriods != null) {
			/*
			 * loop through all the periods from the new run status and
			 * update our local periods
			 */
			for(var x=0; x<newRunStatusPeriods.length; x++) {
				//get a period from the new run status
				var newRunStatusPeriod = newRunStatusPeriods[x];
				
				//get the period id, period name, and whether the period is paused
				var newRunStatusPeriodPeriodId = newRunStatusPeriod.periodId;
				var newRunStatusPeriodPeriodName = newRunStatusPeriod.periodName;
				var newRunStatusPeriodPaused = newRunStatusPeriod.paused;
				
				//loop through all of our periods in our local run status
				for(var y=0; y<periods.length; y++) {
					//get a period from our local run status
					var period = periods[y];
					
					//get the period id
					var periodId = period.periodId;
					
					//check if we have found the period that we need to update
					if(periodId == newRunStatusPeriodPeriodId) {
						//we have found the period we need to update
						
						//update the paused value
						period.paused = newRunStatusPeriodPaused;
					}
				}
			}
		}
	}
};

/**
 * Called when we have received the run status from the server
 * @param responseText
 * @param responseXML
 * @param view
 */
View.prototype.getRunStatusCallback = function(responseText, responseXML, view) {
	//get the run status from the server
	var newRunStatus = JSON.parse(responseText);
	
	if(newRunStatus != null) {
		//create a local run status object
		view.createRunStatus();
		
		//update our local run status object with the values from the new run status
		view.updateRunStatus(newRunStatus);
	}
	
	//start the web socket connection
	view.startWebSocketConnection();
};

/**
 * The failure callback for getting the student statuses
 */
View.prototype.getRunStatusFail = function(responseText, responseXML, view) {
	
};


/**
 * Get the student status object for a workgroup id
 * @param workgroup id the workgroup id
 * @return the student status with the given workgroup id
 */
View.prototype.getStudentStatusByWorkgroupId = function(workgroupId) {
	var studentStatus = null;
	
	//get the student statuses
	var studentStatuses = this.studentStatuses;
	
	if(studentStatuses != null) {
		//loop through all the student statuses
		for(var x=0; x<studentStatuses.length; x++) {
			//get a student status
			var tempStudentStatus = studentStatuses[x];
			
			if(tempStudentStatus != null) {
				//get the workgroup id for the student status
				var tempWorkgroupId = tempStudentStatus.workgroupId;
				
				//check if the workgroup id is the one we want
				if(workgroupId == tempWorkgroupId) {
					//the workgroup id matches so we have found the student status we want
					studentStatus = tempStudentStatus;
					break;
				}
			}
		}
	}
	
	return studentStatus;
};

/**
 * Get the current step the given workgroup id is on
 * @param workgroupId the workgroup id
 * @return the current step the workgroup is on in the 
 * step number and title format e.g. '1.1: Introduction'
 */
View.prototype.getStudentCurrentStepByWorkgroupId = function(workgroupId) {
	var currentStep = '';
	
	//get the student statuses
	var studentStatuses = this.studentStatuses;

	if(studentStatuses != null) {
		//loop through all the student statuses
		for(var x=0; x<studentStatuses.length; x++) {
			//get a student status
			var tempStudentStatus = studentStatuses[x];
			
			if(tempStudentStatus != null) {
				//get the workgroup id
				var tempWorkgroupId = tempStudentStatus.workgroupId;
				
				//check if the workgroup matches the one we want
				if(workgroupId == tempWorkgroupId) {
					//the workgroup id matches the one we want
					var currentNodeId = tempStudentStatus.currentNodeId;
					
					if(currentNodeId != null) {
						//get the step number and title
						var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(currentNodeId);
						
						//remember the step number and title and break out of the loop
						currentStep = stepNumberAndTitle;
						break;						
					}
				}
			}
		}
	}
	
	return currentStep;
};

/**
 * This function is called when the teacher receives a websocket message
 * with messageType 'studentsOnlineList'.
 * Parses the list of students online and updates the UI accordingly
 * @param data the list of students that are online. this will be
 * an array of workgroup ids
 */
View.prototype.studentsOnlineListReceived = function(data) {
	//remove the loading message
	$('#selectDisplayButtonsDiv').text("");
	
	//get the list of workgroup ids that are online
	var studentsOnlineList = data.studentsOnlineList;
	
	/*
	 * create all of the UI for the classroom monitor now that we have
	 * all the information we need
	 */
	this.createClassroomMonitorDisplays();
	
	/*
	 * show the student progress display as the default screen to show
	 * when the classroom monitor initially loads
	 */
	this.showStudentProgressDisplay();
	
	if(studentsOnlineList != null) {
		//loop through all the students online
		for(var x=0; x<studentsOnlineList.length; x++) {
			//get a workgroup id that is online
			var workgroupId = studentsOnlineList[x];
			
			//add the workgroup id to our list of online students
			this.addStudentOnline(workgroupId);
			
			//update the UI to show that the student is online
			this.updateStudentOnline(workgroupId, true);
			
			/*
			 * update the timestamp for the student so we can start
			 * calculating how long they have been on the current step
			 */
			this.updateStudentProgressTimeSpent(workgroupId);
		}
	}
};

/**
 * This function is called when the teacher receives a websocket message
 * with messageType 'studentStatus'.
 * Parses the student status and updates the UI accordingly
 * @param data the student status object
 */
View.prototype.studentStatusReceived = function(data) {
	var runId = data.runId;
	var periodId = data.periodId;
	var workgroupId = data.workgroupId;
	var currentNodeId = data.currentNodeId;
	var previousNodeVisit = data.previousNodeVisit;
	var nodeStatuses = data.nodeStatuses;
	
	//we will reset the time spent value to 0 since the student has just moved to a new step
	var timeSpent = '0:00';

	//update our local copy of the student status object for the workgroup id
	var studentStatusObject = this.updateStudentStatusObject(data);
	
	//update the student progress row for the workgroup id
	this.updateStudentProgress(runId, periodId, workgroupId, currentNodeId, previousNodeVisit, nodeStatuses, timeSpent);
	
	//update the step progress for all steps
	this.updateAllStepProgress();
};

/**
 * Update our local copy of the student status object for the given workgroup id
 * @param studentStatusObject the student status object to replace our
 * old copy
 */
View.prototype.updateStudentStatusObject = function(studentStatusObject) {
	//get the student statuses
	var studentStatuses = this.studentStatuses;
	
	if(studentStatusObject != null) {
		//get the workgroup id
		var workgroupId = studentStatusObject.workgroupId;
		
		if(studentStatuses != null) {
			//loop through all the student status objects
			for(var x=0; x<studentStatuses.length; x++) {
				//get a student status object
				var tempStudentStatus = studentStatuses[x];
				
				//get the workgroup id
				var tempWorkgroupId = tempStudentStatus.workgroupId;
				
				//check if the workgroup id matches the one we want
				if(workgroupId == tempWorkgroupId) {
					//the workgroup id matches the one we want
					
					//insert the current timestamp into the object
					this.insertTimestamp(studentStatusObject);
					
					//replace the old student status object with this new one
					studentStatuses.splice(x, 1, studentStatusObject);
				}
			}
		}		
	}
	
	return studentStatusObject;
};

/**
 * Insert the current timestamp into the student status object so we
 * can calculate how long the student has been on the current step
 * @param studentStatusObject the student status object
 */
View.prototype.insertTimestamp = function(studentStatusObject) {
	if(studentStatusObject != null) {
		//get the current timestamp
		var date = new Date();
		var timestamp = date.getTime();
		
		//set the timestamp into the object
		studentStatusObject.timestamp = timestamp;
	}
};

/**
 * Update the student progress values in the UI for a workgroup
 * @param runId the run id
 * @param periodId the period id
 * @param workgroupId the workgroup id
 * @param currentNodeId the current node id
 * @param previousNodeVisit the previous node visit
 * @param nodeStatuses the node statuses
 * @param timeSpent the amount of time the student has spent on the current step
 */
View.prototype.updateStudentProgress = function(runId, periodId, workgroupId, currentNodeId, previousNodeVisit, nodeStatuses, timeSpent) {
	//set the student to be online
	this.updateStudentOnline(workgroupId, true);
	
	//set the current step
	var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(currentNodeId);
	$('#studentProgressTableDataCurrentStep_' + workgroupId).text(stepNumberAndTitle);
	
	//set the time spent on the current step
	$('#studentProgressTableDataTimeSpent_' + workgroupId).html(timeSpent);

	//set the student completion percentage
	var completionPercentage = this.calculateStudentCompletionForWorkgroupId(workgroupId);
	$('#studentProgressTableDataCompletionPercentage_' + workgroupId).text(completionPercentage + '%');
};

/**
 * The function that will get called every once in a while 
 * to update the time spent values for students
 */
View.prototype.updateStudentProgressTimeSpentInterval = function() {
	//update all the student progress time spent values
	view.updateAllStudentProgressTimeSpent();
};

/**
 * Update all the student progress time spent values for all
 * students that are online
 */
View.prototype.updateAllStudentProgressTimeSpent = function() {
	//get the student statuses
	var studentStatuses = this.studentStatuses;
	
	if(studentStatuses != null) {
		//loop through all the student statuses
		for(var x=0; x<studentStatuses.length; x++) {
			//get a student status
			var tempStudentStatus = studentStatuses[x];
			
			//get the workgroup id
			var tempWorkgroupId = tempStudentStatus.workgroupId;
			
			//update the student progress time spent value if the student is online
			this.updateStudentProgressTimeSpent(tempWorkgroupId);
		}
	}	
};

/**
 * Update the student progress time spent value if the student is online
 * @param workgroupId the workgroup id to update the time spent
 */
View.prototype.updateStudentProgressTimeSpent = function(workgroupId) {
	
	if(workgroupId != null) {
		//check if the student is online
		if(this.isStudentOnline(workgroupId)) {
			//the student is online
			
			//get the student status object
			var studentStatus = this.getStudentStatusByWorkgroupId(workgroupId);
			
			if(studentStatus != null) {
				//get the current timestamp
				var date = new Date();
				var timestamp = date.getTime();
				
				//get the timestamp for when the student began working on the step
				var studentTimestamp = studentStatus.timestamp;
				
				if(studentTimestamp != null) {
					//get the time difference
					var timeSpentMilliseconds = timestamp - studentTimestamp;
					
					//convert the time to seconds
					var timeSpentSeconds = parseInt(timeSpentMilliseconds / 1000);
					
					//get the number of minutes
					var minutes = Math.floor(timeSpentSeconds / 60);
					
					//get the number of seconds
					var seconds = timeSpentSeconds % 60;

					//prepent a '0' to the seconds if necessary
					if(seconds < 10) {
						seconds = '0' + seconds;
					}
				
					//create the time e.g. '1:32'
					var timeSpentDisplay = minutes + ':' + seconds;
					
					//update the time spent in the UI for the workgroup
					$('#studentProgressTableDataTimeSpent_' + workgroupId).text(timeSpentDisplay);
				}
			}
		} else {
			//the student is not online so we will clear the cell 
			$('#studentProgressTableDataTimeSpent_' + workgroupId).html('&nbsp');
		}
	}
};

/**
 * Update all the step progress rows
 */
View.prototype.updateAllStepProgress = function() {
	//get the period that is currently selected
	var periodId = this.classroomMonitorPeriodIdSelected;
	
	//recalculate the step progress for the period
	this.showPeriodInStepProgressDisplay(periodId);
};

/**
 * Update the step progress row for a specific step
 * @param nodeId the node id
 * @param numberOfStudentsOnStep the new number of students on the step
 * @param completionPercentage the new completion percentage value. this
 * will be an integer.
 */
View.prototype.updateStepProgress = function(nodeId, numberOfStudentsOnStep, completionPercentage) {

	//get the id of the number of students on step element
	var numberOfStudentsOnStepId = this.escapeIdForJquery('stepProgressTableDataNumberOfStudentsOnStep_' + nodeId);

	if(numberOfStudentsOnStep == null) {
		//set this to '' if it is not provided, sequences will not provide this parameter
		numberOfStudentsOnStep = '';
	}
	
	//set the new number of students on step value
	$('#' + numberOfStudentsOnStepId).text(numberOfStudentsOnStep);
	
	//get the id of the completion percentage element
	var completionPercentageId = this.escapeIdForJquery('stepProgressTableDataCompletionPercentage_' + nodeId);
	
	if(completionPercentage == null) {
		//set this to '' if it is not provided, sequences will not provide this parameter
		completionPercentage = '';
	} else {
		//append a % sign
		completionPercentage += '%';
	}
	
	//set the new completion percentage value
	$('#' + completionPercentageId).text(completionPercentage);
};

/**
 * Calculate the project completion percentage for a student
 * @param workgroup id the workgroup id
 * @return the project completion percentage as an integer
 */
View.prototype.calculateStudentCompletionForWorkgroupId = function(workgroupId) {
	var result = 0;
	
	//get the student status for the workgroup id
	var studentStatus = this.getStudentStatusByWorkgroupId(workgroupId);
	
	if(studentStatus != null) {
		//get the project completion percentage
		result = this.calculateStudentCompletionForStudentStatus(studentStatus);
	}
	
	return result;
};

/**
 * Calculate the project completion percentage for the student status
 * @param studentStatus the student status to calculate the project 
 * completion percentage
 * @return the project completion percentage as an integer
 */
View.prototype.calculateStudentCompletionForStudentStatus = function(studentStatus) {
	var completedNumberSteps = 0;
	var totalNumberSteps = 0;
	
	if(studentStatus != null) {
		//get the node statuses
		var nodeStatuses = studentStatus.nodeStatuses;
		
		//get all the step node ids in the project
		var nodeIds = this.getProject().getNodeIds();
		
		if(nodeIds != null) {
			//loop through all the node ids
			for(var x=0; x<nodeIds.length; x++) {
				//get a node id
				var nodeId = nodeIds[x];
				
				//check if the student has completed the step
				if(this.isNodeCompleted(nodeId, nodeStatuses)) {
					//the student has completed the step so we will update the counter
					completedNumberSteps++;
				}
				
				//update the number of steps counter
				totalNumberSteps++;
			}
		}
	}
	
	//calculate the percentage as an integer
	var completionPercentage = completedNumberSteps / totalNumberSteps;
	completionPercentage = parseInt(100 * completionPercentage);
	
	return completionPercentage;
};

/**
 * Check if the student has completed the step
 * @param nodeId the node id of the step we want to check for completion
 * @param nodeStatuses the node statuses from a student
 * @return whether the student has completed the step or not
 */
View.prototype.isNodeCompleted = function(nodeId, nodeStatuses) {
	var result = false;
	
	if(nodeId != null && nodeStatuses != null) {
		//loop through all the node statuses
		for(var x=0; x<nodeStatuses.length; x++) {
			//get a node status object
			var tempNodeStatus = nodeStatuses[x];
			
			if(tempNodeStatus != null) {
				//get the node id
				var tempNodeId = tempNodeStatus.nodeId;
				
				//get all the statuses for the node
				var tempStatuses = tempNodeStatus.statuses;
				
				//check if the node id matches the one we want
				if(nodeId == tempNodeId) {
					//the node id matches so we will get the 'isCompleted' status value
					result = Node.prototype.getStatus('isCompleted', tempStatuses);
					break;
				}
			}
		}
	}
	
	return result;
};

/**
 * Calculate the percentage of the class that has completed the step
 * @param nodeId the node id for the step
 * @param periodId the period id to get the step completion for. if this
 * parameter is null or 'all' we will calculate the step completion for
 * all periods.
 * @return the percentage of the class that has completed the step
 * as an integer
 */
View.prototype.calculateStepCompletionForNodeId = function(nodeId, periodId) {
	var numberStudentsCompleted = 0;
	var totalNumberStudents = 0;
	
	//get the number of students in the period
	totalNumberStudents = this.getNumberOfStudentsInPeriod(periodId);
	
	//get the number of students in the period that have completed the step
	numberStudentsCompleted = this.getNumberOfStudentsInPeriodThatCompletedStep(periodId, nodeId);
	
	//calculate the percentage as an integer
	var completionPercentage = numberStudentsCompleted / totalNumberStudents;
	completionPercentage = parseInt(100 * completionPercentage);
	
	return completionPercentage;
};

/**
 * Get the number of students in the period
 * @param periodId the period id. if this is null or 'all' we will
 * get the number of students in all the periods.
 * @return the number of students in the period
 */
View.prototype.getNumberOfStudentsInPeriod = function(periodId) {
	var numberOfStudentsInPeriod = 0;
	
	var userAndClassInfo = this.getUserAndClassInfo();
	
	if(userAndClassInfo != null) {
		//get the students in the run
		var classmateUserInfos = userAndClassInfo.getClassmateUserInfos();
		
		if(classmateUserInfos != null) {
			
			//loop through all the students in the run
			for(var x=0; x<classmateUserInfos.length; x++) {
				//get a student
				var classmateUserInfo = classmateUserInfos[x];
				
				//get the period id the student is in
				var tempPeriodId = classmateUserInfo.periodId;
				
				if(periodId == null || periodId == 'all') {
					//we are getting the number of students in all the periods
					numberOfStudentsInPeriod++;
				} else if(periodId == tempPeriodId) {
					/*
					 * we are getting the number of students in a specific period
					 * and this student is in the period
					 */
					numberOfStudentsInPeriod++;
				}
			}
		}
	}
	
	return numberOfStudentsInPeriod;
};

/**
 * Get the number of students in the period that have completed the step
 * @param periodId the period id. if this is null or 'all' we will get all periods.
 * @param nodeId the node id
 * @return the number of students in the period that have completed the step
 */
View.prototype.getNumberOfStudentsInPeriodThatCompletedStep = function(periodId, nodeId) {
	var numberOfStudentsInPeriodCompleted = 0;
	
	var studentStatuses = this.studentStatuses;
	
	if(studentStatuses != null) {
		//loop through all the student statuses
		for(var x=0; x<studentStatuses.length; x++) {
			//get a student status
			var studentStatus = studentStatuses[x];
			
			if(studentStatus != null) {
				var tempPeriodId = studentStatus.periodId;
				
				if(periodId == null || periodId == 'all' || periodId == tempPeriodId) {
					/*
					 * we are getting the number of students who have completed the step
					 * for all periods or if we are looking for a specific period and
					 * the student we are currently on is in that period
					 */
					
					//get the node statuses for the student
					var nodeStatuses = studentStatus.nodeStatuses;
					
					//check if the student has completed the step
					if(this.isNodeCompleted(nodeId, nodeStatuses)) {
						//the student has completed the step so we will update the counter
						numberOfStudentsInPeriodCompleted++;
					}
				}
			}
		}
	}
	
	return numberOfStudentsInPeriodCompleted;
};

/**
 * Get the number of students on the step
 * @param nodeId the node id of the step
 * @param period id the period id. if this is null or 'all' we will get all periods.
 * @return the number of students on the step
 */
View.prototype.getNumberOfStudentsOnStep = function(nodeId, periodId) {
	var numberOfStudentsOnStep = 0;
	
	//get the student statuses
	var studentStatuses = this.studentStatuses;
	
	if(studentStatuses != null) {
		//loop through all the student statuses
		for(var x=0; x<studentStatuses.length; x++) {
			//get a student status
			var studentStatus = studentStatuses[x];
			
			if(studentStatus != null) {
				//get the period id the student is in
				var tempPeriodId = studentStatus.periodId;
				
				//get the current node id the student is on
				var currentNodeId = studentStatus.currentNodeId;
				
				//check if the student is in the period we want
				if(periodId == null || periodId == 'all' || periodId == tempPeriodId) {
					//we want all periods or the student is in the period we want
					
					//check if the node id matches the one we want
					if(nodeId == currentNodeId) {
						//the node id matches so the student is on the step
						numberOfStudentsOnStep++;
					}
				}
			}
		}
	}
	
	return numberOfStudentsOnStep;
};

/**
 * This function is called when the teacher receives a websocket message
 * with messageType 'studentConnected'.
 * A student has connected to the web socket server so we will update
 * our list of online students and also update the UI accordingly.
 * @param data the web socket message that contains the user name
 * and workgroup id
 */
View.prototype.studentConnected = function(data) {
	if(data != null) {
		var userName = data.userName;
		var workgroupId = data.workgroupId;
		
		//update the UI to show the student is online
		this.updateStudentOnline(workgroupId, true);
		
		//add the student to our list of online students
		this.addStudentOnline(workgroupId);
	}
};

/**
 * This function is called when the teacher receives a websocket message
 * with messageType 'studentDisconnected'.
 * A student has disconnected from the web socket server so we will update
 * our list of online students and also update the UI accordingly.
 * @param data the web socket message that contains the user name
 * and workgroup id
 */
View.prototype.studentDisconnected = function(data) {
	if(data != null) {
		var userName = data.userName;
		var workgroupId = data.workgroupId;
		
		//update the UI to show the student is offline
		this.updateStudentOnline(workgroupId, false);
		
		//remove the student from our list of online students
		this.removeStudentOnline(workgroupId);
		
		//clear the time spent cell for the student
		this.updateStudentProgressTimeSpent(workgroupId);
	}
};

/**
 * Add the student to our list of online students
 * @param workgroupId the workgroup id of the student that has come online
 */
View.prototype.addStudentOnline = function(workgroupId) {
	//initialize the students online array if necessary
	if(this.studentsOnline == null) {
		this.studentsOnline = [];
	}
	
	//check if the workgroup id already exists in the array
	if(this.studentsOnline.indexOf(workgroupId) == -1) {
		//the workgroup id does not already exist so we will add it
		this.studentsOnline.push(workgroupId);
	}
};

/**
 * Remove the student from our list of online students
 * @param workgroupId the workgroup id of the student that has gone offline
 */
View.prototype.removeStudentOnline = function(workgroupId) {
	//initialize the students online array if necessary
	if(this.studentsOnline == null) {
		this.studentsOnline = [];
	}
	
	//loop through all the students online
	for(var x=0; x<this.studentsOnline.length; x++) {
		//get a workgroup id
		var studentOnline = this.studentsOnline[x];
		
		//check if the workgroup id matches
		if(workgroupId == studentOnline) {
			//the workgroup id matches so we will remove it from the array
			this.studentsOnline.splice(x, 1);
			
			/*
			 * set the counter back so we can continue looping through
			 * the array in case the workgroup id occurs more than once
			 */
			x--;
		}
	}
};

/**
 * Update the student online status in the UI
 * @param workgroupId the workgroup id
 * @param isOnline whether the student is online
 */
View.prototype.updateStudentOnline = function(workgroupId, isOnline) {
	if(workgroupId != null) {
		if(isOnline) {
			//the student is online so we will make the row green
			$('#studentProgressTableRow_' + workgroupId).css('background', 'limegreen');
			
			//set the green icon in the online column
			$('#studentProgressTableDataOnline_' + workgroupId).html(this.getIsOnlineHTML());
			
			//check if the isOnlineDiv is currently being displayed
			if($('#isOnlineDiv_' + workgroupId).length != 0){
				$('#isOnlineDiv_' + workgroupId).html(this.getIsOnlineHTML());
			}
		} else {
			//the student is not online so we will remove the color from the row
			$('#studentProgressTableRow_' + workgroupId).css('background', '');
			
			//set the red icon in the online column
			$('#studentProgressTableDataOnline_' + workgroupId).html(this.getIsOfflineHTML());
			
			//check if the isOnlineDiv is currently being displayed
			if($('#isOnlineDiv_' + workgroupId).length != 0){
				$('#isOnlineDiv_' + workgroupId).html(this.getIsOfflineHTML());
			}
		}
	}
};

/**
 * Check if the student is online
 * @param workgroupId the workgroup id of the student
 */
View.prototype.isStudentOnline = function(workgroupId) {
	var result = false;
	
	//initialize the students online array if necessary
	if(this.studentsOnline == null) {
		this.studentsOnline = [];
	}
	
	//check if the workgroup id is in the array
	if(this.studentsOnline.indexOf(workgroupId) != -1) {
		result = true;
	}
	
	return result;
};

/**
 * Send the run status back to the server to be saved in the db
 */
View.prototype.sendRunStatus = function() {
	//get the run status url we will use to make the request
	var runStatusUrl = this.getConfig().getConfigParam('runStatusUrl');
	
	//get the run id
	var runId = this.getConfig().getConfigParam('runId');
	
	//get the run status as a string
	var runStatus = JSON.stringify(this.runStatus);
	
	//encode the run status data
	runStatus = encodeURIComponent(runStatus);
	
	//create the params for the request
	var runStatusParams = {
		runId:runId,
		status:runStatus
	}
	
	if(runStatusUrl != null) {
		//make the request to the server for the student statuses
		this.connectionManager.request('POST', 3, runStatusUrl, runStatusParams, this.sendRunStatusCallback, this, this.sendRunStatusFail, false, null);
	}
};

/**
 * 
 */
View.prototype.sendRunStatusCallback = function(responseText, responseXML, view) {
	
};

/**
 * 
 */
View.prototype.sendRunStatusFail = function(responseText, responseXML, view) {
	
};

/**
 * Update the paused value for a period in our run status
 * @param periodId the period id
 * @param value whether the period is paused or not
 */
View.prototype.updatePausedRunStatusValue = function(periodId, value) {
	//create the local run status object if necessary
	if(this.runStatus == null) {
		this.createRunStatus();
	}
	
	//get the local run status object
	var runStatus = this.runStatus;
	
	if(periodId == null || periodId == 'all') {
		//we are updating the all periods value
		runStatus.allPeriodsPaused = value;
		
		//set all the periods to the value as well
		this.setAllPeriodsPaused(value);
	} else {
		//we are updating a specific period
		
		//get all the periods
		var periods = runStatus.periods;
		
		if(periods != null) {
			//loop through all the periods
			for(var x=0; x<periods.length; x++) {
				//get a period
				var tempPeriod = periods[x];
				
				//get the period id
				var tempPeriodId = tempPeriod.periodId;
				
				//check if the period id matches the one we need to update
				if(periodId == tempPeriodId) {
					//we have found the period we want to update
					tempPeriod.paused = value;
				}
			}			
		}
	}
};

/**
 * Set all the periods to be paused or not
 * @param isPaused boolean value that specifies if the periods are paused or not
 */
View.prototype.setAllPeriodsPaused = function(isPaused) {
	//create the local run status object if necessary
	if(this.runStatus == null) {
		this.createRunStatus();
	}
	
	//get the local run status object
	var runStatus = this.runStatus;
	
	//get all the periods
	var periods = runStatus.periods;
	
	if(periods != null) {
		//loop through all the peridos
		for(var x=0; x<periods.length; x++) {
			//get a period
			var tempPeriod = periods[x];

			//set the period to be paused or not
			tempPeriod.paused = isPaused;
		}			
	}
};

/**
 * Check if a period is paused
 * @param periodId the period id
 */
View.prototype.isPeriodPaused = function(periodId) {
	//we will default to not paused
	var paused = false;
	
	//create the local run status object if necessary
	if(this.runStatus == null) {
		this.createRunStatus();
	}
	
	//get the run status
	var runStatus = this.runStatus;
	
	if(periodId == null || periodId == 'all') {
		//we want to check if all periods are paused
		
		//check if our local run status object has the allPeriodsPaused value
		if(runStatus.allPeriodsPaused != null) {
			//get whether all periods are paused
			paused = runStatus.allPeriodsPaused;
		}
	} else {
		//we want to check if a specific period is paused
		
		//get all the periods
		var periods = runStatus.periods;
		
		if(periods != null) {
			//loop through all the periods
			for(var x=0; x<periods.length; x++) {
				//get the period
				var tempPeriod = periods[x];
				
				//get the period id
				var tempPeriodId = tempPeriod.periodId;
				
				//check if this is the period id we are looking for
				if(periodId == tempPeriodId) {
					/*
					 * we have found the period we are looking for so we will get
					 * whether it is paused or not
					 */
					paused = tempPeriod.paused;
				}
			}
		}
	}

	return paused;
};

/**
 * We have received a pause screen websocket message from another teacher
 * so we will update our local run status object as well as our UI to
 * reflect the period becoming paused or not
 */
View.prototype.pauseScreenReceived = function(data) {
	if(data != null) {
		//get a period id
		var periodId = data.periodId;
		
		//if period id is null we will treat it as all periods
		if(periodId == null) {
			periodId = 'all';
		}
		
		//get the message type
		var messageType = data.messageType;
		
		if(messageType != null) {
			
			var isPaused = false;
			
			if(messageType == 'pauseScreen') {
				//the message is to pause the student screen
				isPaused = true;
			} else if(messageType == 'unPauseScreen') {
				//the message is to unpause the student screens
				isPaused = false;
			}
			
			//update the run status value for the period
			this.updatePausedRunStatusValue(periodId, isPaused);
			
			if(this.classroomMonitorPeriodIdSelected == periodId) {
				/*
				 * if the period that the teacher has currently selected is
				 * the period that is changing paused value we will update
				 * the UI to reflect which button is active/yellow
				 */

				//make the appropriate paused or unpaused button yellow
				this.setActivePausedButton(isPaused);
			}
		}
	}
};

/**
 * Create the student work display
 */
View.prototype.createGradeByStudentDisplay = function() {
	//create the student work display div
	var gradeByStudentDisplay = $('<div></div>').attr({id:'gradeByStudentDisplay'});
	
	//add the student work display div to the main div
	$('#classroomMonitorMainDiv').append(gradeByStudentDisplay);
	
	//hide the student work display div, we will show it later when necessary
	gradeByStudentDisplay.hide();
}

/**
 * Create the step work display
 */
View.prototype.createGradeByStepDisplay = function() {
	//create the step work display div
	var gradeByStepDisplay = $('<div></div>').attr({id:'gradeByStepDisplay'});
	
	//add the step work display div to the main div
	$('#classroomMonitorMainDiv').append(gradeByStepDisplay);
	
	//hide the step work display div, we will show it later when necessary
	gradeByStepDisplay.hide();
}

/**
 * Retrieve all the annotations for this run
 * @param displayWorkFor the display to load after we retrieve the annotations
 * the value will either be 'student' or 'step'
 * @param id the node id or workgroup id
 */
View.prototype.retrieveAnnotations = function(displayWorkFor, id) {
	this.connectionManager.request('GET', 1, this.getConfig().getConfigParam('getAnnotationsUrl'), null, this.retrieveAnnotationsCallback, [this, displayWorkFor, id]);
};

/**
 * The callback function for retrieving annotations
 * @param text the annotations in JSON string format
 * @param xml
 * @param the args that we passed to the request
 */
View.prototype.retrieveAnnotationsCallback = function(text, xml, args) {
	var thisView = args[0];
	var displayWorkFor = args[1];
	var id = args[2];
	
	thisView.retrieveAnnotationsCallbackHandler(text, displayWorkFor, id);
};

/**
 * The function that handles the logic when the retrieve annotations callback
 * is called
 */
View.prototype.retrieveAnnotationsCallbackHandler = function(annotationsJSONString, displayWorkFor, id) {
	//set the annotations
	this.model.setAnnotations(Annotations.prototype.parseDataJSONString(annotationsJSONString));
	
	if(displayWorkFor == 'student') {
		//display the grade by student display
		this.displayGradeByStudent(id);	
	} else if(displayWorkFor == 'step') {
		//display the grade by step display
		this.displayGradeByStep(id);
	}
	
	eventManager.fire("retrieveAnnotationsCompleted");
};

/**
 * Remove everything in the display specific buttons div
 */
View.prototype.clearDisplaySpecificButtonsDiv = function() {
	$('#displaySpecificButtonsDiv').html('');
};

/**
 * Remove everything in the save button div
 */
View.prototype.clearSaveButtonDiv = function() {
	$('#saveButtonDiv').html('');
};

/**
 * Get the html that will display the green dot as an image
 */
View.prototype.getIsOnlineHTML = function() {
	var html = '<img src="images/greenDot.png"/>';
	
	return html;
};

/**
 * Get the html that will display the red dot as an image
 */
View.prototype.getIsOfflineHTML = function() {
	var html = '<img src="images/redDot.png"/>';
	
	return html;
};

/**
 * Create the export student work display
 */
View.prototype.createExportStudentWorkDisplay = function() {
	//create the export student work div
	var exportStudentWorkDisplay = $('<div></div>').attr({id:'exportStudentWorkDisplay'});
	
	//add the export student work div to the main div
	$('#classroomMonitorMainDiv').append(exportStudentWorkDisplay);
	
	//hide the export student work div, we will show it later when necessary
	exportStudentWorkDisplay.hide();
	
	//create the div that is shown when the user first clicks on the 'Export Student Work' button
	var mainExportDiv = this.createMainExportDiv();
	
	//create the div that will show the custom export display
	var customExportDiv = this.createCustomExportDiv();
	
	//create the div that will show the special export display
	var specialExportDiv = this.createSpecialExportDiv();
	
	//create the hidden form that is used to generate the request to download the export file
	var exportForm = this.createExportForm();
	
	//add the export student work table to the div
	$('#exportStudentWorkDisplay').append(mainExportDiv);
	$('#exportStudentWorkDisplay').append(customExportDiv);
	$('#exportStudentWorkDisplay').append(specialExportDiv);
	$('#exportStudentWorkDisplay').append(exportForm);
	
};

/**
 * Create the hidden form that is used to create the request to download the export file
 */
View.prototype.createExportForm = function() {
	//create the form
	var exportForm = $('<form>');
	exportForm.attr('id', 'exportForm');
	exportForm.css('display', 'none');
	exportForm.attr('action', '');
	exportForm.attr('method', 'GET');
	
	/*
	 * add the fields in the form that will be passed to the 
	 * server when the request for the export file is made
	 */
	exportForm.append('<input type="hidden" name="runId" id="runId" value=""/>');
	exportForm.append('<input type="hidden" name="runName" id="runName" value=""/>');
	exportForm.append('<input type="hidden" name="projectId" id="projectId" value=""/>');
	exportForm.append('<input type="hidden" name="parentProjectId" id="parentProjectId" value=""/>');
	exportForm.append('<input type="hidden" name="projectName" id="projectName" value=""/>');
	exportForm.append('<input type="hidden" name="exportType" id="exportType" value=""/>');
	exportForm.append('<input type="hidden" name="customStepsArray" id="customStepsArray" value=""/>');
	exportForm.append('<input type="hidden" name="contentBaseUrl" id="contentBaseUrl" value=""/>');
	exportForm.append('<input type="hidden" name="nodeId" id="nodeId" value=""/>');
	exportForm.append('<input type="hidden" name="fileType" id="fileType" value=""/>');
	
	return exportForm;
};

/**
 * Create the table row that contains the export name and the export type
 * @param exportName the export name e.g. 'Export Latest Student Work' or 'Export All Student Work'
 * @param exportType the export type that the server uses to determine what type
 * of export to generate e.g. 'latestStudentWork' 'allStudentWork'
 */
View.prototype.createExportStudentWorkRow = function(exportName, exportType) {
	//create the row
	var exportStudentWorkRow = $('<tr>');
	
	//create the cell that will contain the export name
	var exportStudentWorkCellLabel = $('<td>');
	exportStudentWorkCellLabel.html(exportName);
	
	//create the cell that will contain the XLS button
	var exportStudentWorkXLSButtonCell = $('<td>');
	var exportStudentWorkXLSButton = $('<input>');
	exportStudentWorkXLSButton.attr('type', 'button');
	exportStudentWorkXLSButton.val('XLS');
	exportStudentWorkXLSButtonCell.append(exportStudentWorkXLSButton);
	exportStudentWorkXLSButton.click({thisView:this, exportType:exportType, fileType:'xls'}, function(event) {
		var thisView = event.data.thisView;
		var exportType = event.data.exportType;
		var fileType = event.data.fileType;
		
		//generate the XLS file
		thisView.exportStudentWorkButtonClicked(exportType, fileType);
	});
	
	//create the cell that will contain the CSV button
	var exportStudentWorkCSVButtonCell = $('<td>');
	var exportStudentWorkCSVButton = $('<input>');
	exportStudentWorkCSVButton.attr('type', 'button');
	exportStudentWorkCSVButton.val('CSV');
	exportStudentWorkCSVButtonCell.append(exportStudentWorkCSVButton);
	exportStudentWorkCSVButton.click({thisView:this, exportType:exportType, fileType:'csv'}, function(event) {
		var thisView = event.data.thisView;
		var exportType = event.data.exportType;
		var fileType = event.data.fileType;
		
		//generate the CSV file
		thisView.exportStudentWorkButtonClicked(exportType, fileType);
	});
	
	exportStudentWorkRow.append(exportStudentWorkCellLabel);
	exportStudentWorkRow.append(exportStudentWorkXLSButtonCell);
	exportStudentWorkRow.append(exportStudentWorkCSVButtonCell);
	
	return exportStudentWorkRow;
};

/**
 * The button was clicked to download the export file
 * @param exportType the export type that the server uses to determine what type
 * of export to generate e.g. 'latestStudentWork' 'allStudentWork'
 * @param fileType the file type for the export e.g. 'xls' or 'csv'
 */
View.prototype.exportStudentWorkButtonClicked = function(exportType, fileType) {
	//get the parameters for the download export file request
	var getXLSExportUrl = this.getConfig().getConfigParam('getXLSExportUrl');
	var runId = this.getConfig().getConfigParam('runId');
	var projectId = this.getConfig().getConfigParam('projectId');
	var parentProjectId = this.getConfig().getConfigParam('parentProjectId');
	var runName = this.getConfig().getConfigParam('runName');
	var projectName = this.getProject().getTitle();
	
	//set the parameters into the form
	$('#exportForm input[name=runId]').val(runId);
	$('#exportForm input[name=runName]').val(runName);
	$('#exportForm input[name=projectId]').val(projectId);
	$('#exportForm input[name=parentProjectId]').val(parentProjectId);
	$('#exportForm input[name=projectName]').val(projectName);
	$('#exportForm input[name=exportType]').val(exportType);
	$('#exportForm input[name=fileType]').val(fileType);
	
	if(exportType == 'customLatestStudentWork' || exportType == 'customAllStudentWork') {
		//get all the node ids that were chosen for the custom export
		var customStepsArrayJSONString = this.getCustomStepsArrayJSONString();
		$('#exportForm input[name=customStepsArray]').val(customStepsArrayJSONString);
	}
	
	//set the action url
	$('#exportForm').attr('action', getXLSExportUrl);
	
	//submit the form to request the export file
	$('#exportForm').submit();
};

/**
 * The button was clicked to download the special export file
 * @param nodeId the node id for the step that we want the special
 * export for
 */
View.prototype.specialExportStepButtonClicked = function(nodeId) {
	//get the parameters for the download export file request
	var getXLSExportUrl = this.getConfig().getConfigParam('getSpecialExportUrl');
	var runId = this.getConfig().getConfigParam('runId');
	var projectId = this.getConfig().getConfigParam('projectId');
	var parentProjectId = this.getConfig().getConfigParam('parentProjectId');
	var runName = this.getConfig().getConfigParam('runName');
	var projectName = this.getProject().getTitle();
	
	//set the parameters into the form
	$('#exportForm input[name=runId]').val(runId);
	$('#exportForm input[name=runName]').val(runName);
	$('#exportForm input[name=projectId]').val(projectId);
	$('#exportForm input[name=parentProjectId]').val(parentProjectId);
	$('#exportForm input[name=projectName]').val(projectName);
	$('#exportForm input[name=nodeId]').val(nodeId);
	$('#exportForm input[name=exportType]').val('specialExport');
	
	//set the action url
	$('#exportForm').attr('action', getXLSExportUrl);
	
	//submit the form to request the export file
	$('#exportForm').submit();
};

/**
 * Get the custom steps array JSON string
 * @return a JSON string that contains all the custom node ids
 */
View.prototype.getCustomStepsArrayJSONString = function() {
	var customStepsJSONString = "";
	
	//get the steps that were checked in the custom export screen
	var customStepsArray = this.getCustomStepsArray();
	
	if(customStepsArray != null) {
		//get the string format of the array
		customStepsJSONString = JSON.stringify(customStepsArray);
	}
	
	return customStepsJSONString;
};

/**
 * Get the custom steps that were checked in the custom export screen
 * @return and array of node id strings
 */
View.prototype.getCustomStepsArray = function() {
	var customStepsArray = [];
	
	//get all the steps that were checked
	var customSteps = $("input:checkbox[name='customExportStepCheckbox']:checked");
	
	//loop through all the steps
	for(var x=0; x<customSteps.length; x++) {
		var customStep = customSteps[x];
		
		if(customStep != null) {
			//get the node id of the step
			var nodeId = customStep.value;
			
			if(nodeId != null) {
				//add the node id to our array
				customStepsArray.push(nodeId);			
			}			
		}
	}
	
	return customStepsArray;
};

/**
 * Create the div that will display the main export screen
 */
View.prototype.createMainExportDiv = function() {
	//create the div
	var mainExportDiv = $('<div>');
	mainExportDiv.attr('id', 'mainExportDiv');
	
	//create the table that will contain the export labels and buttons
	var exportStudentWorkTable = $('<table>');
	exportStudentWorkTable.attr('id', 'exportStudentWorkTable');
	
	//create the rows that will display the export labels and buttons
	var exportLatestStudentWorkRow = this.createExportStudentWorkRow('Export Latest Student Work', 'latestStudentWork');
	var exportAllStudentWorkRow = this.createExportStudentWorkRow('Export All Student Work', 'allStudentWork');
	var exportIdeaBasketsRow = this.createExportStudentWorkRow('Export Idea Baskets', 'ideaBaskets');
	var exportExplanationBuilderWorkRow = this.createExportStudentWorkRow('Export Explanation Builder Work', 'explanationBuilderWork');
	var customExportStudentWorkRow = this.createCustomExportStudentWorkRow();
	var specialExportStudentWorkRow = this.createSpecialExportStudentWorkRow();
	
	//add the rows to the table
	exportStudentWorkTable.append(exportLatestStudentWorkRow);
	exportStudentWorkTable.append(exportAllStudentWorkRow);
	exportStudentWorkTable.append(exportIdeaBasketsRow);
	exportStudentWorkTable.append(exportExplanationBuilderWorkRow);
	exportStudentWorkTable.append(customExportStudentWorkRow);
	exportStudentWorkTable.append(specialExportStudentWorkRow);
	
	//add the table to the main div
	mainExportDiv.append(exportStudentWorkTable);
	
	return mainExportDiv;
};

/**
 * Create the row that will display the custom export label and button
 */
View.prototype.createCustomExportStudentWorkRow = function() {
	//create the row
	var exportStudentWorkRow = $('<tr>');
	
	//create the cell that will display the export label
	var exportStudentWorkCellLabel = $('<td>');
	exportStudentWorkCellLabel.html('Export Custom Student Work');
	
	//create the cell that will contain the 'Choose Steps' button
	var exportStudentWorkButtonCell = $('<td>');
	exportStudentWorkButtonCell.attr('colspan', 2);
	
	//creat the 'Choose Steps' button
	var exportStudentWorkButton = $('<input>');
	exportStudentWorkButton.attr('type', 'button');
	exportStudentWorkButton.val('Choose Steps');
	exportStudentWorkButton.click({thisView:this}, function(event) {
		var thisView = event.data.thisView;
		
		/*
		 * the 'Choose Steps' button was clicked so we will display the
		 * custom export screen where the user chooses which steps they
		 * want to be exported
		 */ 
		thisView.customExportStudentWorkButtonClicked();
	});
	
	//add the 'Choose Steps' button
	exportStudentWorkButtonCell.append(exportStudentWorkButton);
	
	//add the label and the button to the row
	exportStudentWorkRow.append(exportStudentWorkCellLabel);
	exportStudentWorkRow.append(exportStudentWorkButtonCell);
	
	return exportStudentWorkRow;
};

/**
 * The 'Choose Steps' button was clicked so we will display the custom
 * export screen
 */
View.prototype.customExportStudentWorkButtonClicked = function() {
	//show the custom export div
	$('#mainExportDiv').hide();
	$('#customExportDiv').show();
	$('#specialExportDiv').hide();
	
	var customExportDiv = $('#customExportDiv');
	
	//populate the div if it hasn't already been populated
	if(customExportDiv.html() == '') {
		//create a table to contain the buttons and steps
		var customExportTable = $('<table>');
		
		//create the button to go back to the main export screen
		var backButtonRow = this.createExportBackButtonRow();
		customExportTable.append(backButtonRow);
		
		//create the row that will display 'Custom Export'
		var pageHeaderRow = $('<tr>');
		var pageHeaderCell = $('<td>');
		var pageHeader = $('<h3>');
		pageHeader.css('display', 'inline');
		pageHeader.html('Custom Export');
		pageHeaderCell.append(pageHeader);
		pageHeaderRow.append(pageHeaderCell);
		customExportTable.append(pageHeaderRow);
		
		//create the row for the custom latest student work export
		var exportCustomLatestStudentWorkRow = this.createExportStudentWorkRow('Export Custom Latest Student Work', 'customLatestStudentWork');
		customExportTable.append(exportCustomLatestStudentWorkRow);
		
		//create the row for the custom all student work export
		var exportCustomAllStudentWorkRow = this.createExportStudentWorkRow('Export Custom All Student Work', 'customAllStudentWork');
		customExportTable.append(exportCustomAllStudentWorkRow);
		
		//create the row that will contain all the steps with check boxes
		var selectStepsTableRow = $('<tr>');
		
		//create the table that will contain all the steps with check boxes
		var selectStepsTable = this.createCustomExportSelectStepsTable();
		
		selectStepsTableRow.append(selectStepsTable);
		customExportTable.append(selectStepsTableRow);

		/*
		 * create the row for the custom latest student work export 
		 * that will show up at the bottom of the screen
		 */
		var exportCustomLatestStudentWorkRow2 = this.createExportStudentWorkRow('Export Custom Latest Student Work', 'customLatestStudentWork');
		customExportTable.append(exportCustomLatestStudentWorkRow2);
		
		/*
		 * create the row for the custom all student work export
		 * that will show up at the bottom of the screen
		 */
		var exportCustomAllStudentWorkRow2 = this.createExportStudentWorkRow('Export Custom All Student Work', 'customAllStudentWork');
		customExportTable.append(exportCustomAllStudentWorkRow2);
		
		/*
		 * create the button to go back to the main export screen.
		 * this back button will show up at the bottom of the screen.
		 */ 
		var backButtonRow = this.createExportBackButtonRow();
		customExportTable.append(backButtonRow);
		
		customExportDiv.append(customExportTable);
	}
};

/**
 * Create the row that will contain the back button to go back
 * to the main export screen
 */
View.prototype.createExportBackButtonRow = function() {
	//create the button
	var backButton = $('<input>');
	backButton.attr('type', 'button');
	backButton.val('Back');
	backButton.click({}, function(event) {
		$('#mainExportDiv').show();
		$('#customExportDiv').hide();
		$('#specialExportDiv').hide();
	});
	
	//create the row
	var backButtonRow = $('<tr>');
	var backButtonCell = $('<td>');
	backButtonCell.append(backButton);
	backButtonRow.append(backButtonCell);
	
	return backButtonRow;
};

/**
 * Create the table that will display the steps and check boxes
 * for the custom export
 */
View.prototype.createCustomExportSelectStepsTable = function() {
	//create the table
	var table = $('<table>');
	
	//create the row for the 'Select All Steps' check boxes
	var selectAllStepsRow = $('<tr>');
	var selectAllStepsCell = $('<td>');
	
	//create the select all steps checkbox
	var selectAllStepsCellInput = $('<input>');
	selectAllStepsCellInput.attr('id', 'selectAllStepsCheckBox');
	selectAllStepsCellInput.attr('type', 'checkbox');
	selectAllStepsCellInput.click({thisView:this}, function(event) {
		var thisView = event.data.thisView;
		thisView.customExportSelectAllStepsCheckBoxClicked();
	});
	
	//create the label for the 'Select All Steps'
	selectAllStepsCellH4 = $('<h4>');
	selectAllStepsCellH4.html('Select All Steps');
	selectAllStepsCellH4.css('display', 'inline');
	
	//add the check box and label
	selectAllStepsCell.append(selectAllStepsCellInput);
	selectAllStepsCell.append(selectAllStepsCellH4);
	
	selectAllStepsRow.append(selectAllStepsCell);

	//add the row to the table
	table.append(selectAllStepsRow);
	
	//initialize the activity counter
	this.activityNumber = 0;
	
	//add the steps in the project
	this.createCustomExportSelectStepsTableHelper(table, this.getProject().getRootNode());
	
	return table;
};

/**
 * Adds the activities and steps to the table for the custom export page.
 * The activities and steps will have check boxes next to them. This is a recursive
 * function that will traverse the project.
 * @param table the table dome element to add step rows to
 * @param node the current node we are on
 */
View.prototype.createCustomExportSelectStepsTableHelper = function(table, node) {
	//get the current node id
	var nodeId = node.id;
	
	if(node.isLeafNode()) {
		//this node is a leaf/step

		//create the row and cell
		var row = $('<tr>');
		var cell = $('<td>');
		
		//create the check box
		var checkBox = $('<input>');
		checkBox.attr('id', 'stepCheckBox_' + nodeId);
		checkBox.addClass('activityStep_' + (this.activityNumber - 1));
		checkBox.addClass('stepCheckBox');
		checkBox.css('margin-left', '20px');
		checkBox.attr('type', 'checkbox');
		checkBox.attr('name', 'customExportStepCheckbox');
		checkBox.val(nodeId);
		
		var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId);
		var nodeType = node.getType();
		
		//create the step label
		var p = $('<p>');
		p.html(stepNumberAndTitle + ' (' + nodeType + ')');
		p.css('display', 'inline');
		
		//add the check box and label
		cell.append(checkBox);
		cell.append(p);
		
		row.append(cell);
		
		table.append(row);
	} else {
		/*
		 * we need to skip the first sequence because that is always the
		 * master sequence. we will encounter the master sequence when 
		 * this.activityNumber is 0, so all the subsequent activities will
		 * start at 1.
		 */
		if(this.activityNumber != 0) {
			//create the row and cell
			var row = $('<tr>');
			var cell = $('<td>');
			
			var activityCheckBoxId = 'activityCheckBox_' + this.activityNumber;

			//create the check box
			var checkBox = $('<input>');
			checkBox.attr('id', activityCheckBoxId);
			checkBox.addClass('activityCheckBox');
			checkBox.attr('type', 'checkbox');
			checkBox.attr('name', 'customExportActivityCheckbox');
			checkBox.val(nodeId);
			checkBox.click({thisView:this, activityCheckBoxId:activityCheckBoxId}, function(event) {
				var thisView = event.data.thisView;
				var activityCheckBoxId = event.data.activityCheckBoxId;
				
				thisView.customExportActivityCheckBoxClicked(activityCheckBoxId);
			});
			
			var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId);
			var title = node.getTitle();
			
			//create the activity label
			var h4 = $('<h4>');
			h4.html('Activity ' + stepNumberAndTitle);
			h4.css('display', 'inline');
			
			//add the check box and label
			cell.append(checkBox);
			cell.append(h4);
			
			row.append(cell);
			
			table.append(row);
		}

		//increment the activity number
		this.activityNumber++;
		
		//loop through all its children
		for(var x=0; x<node.children.length; x++) {
			//add the child
			this.createCustomExportSelectStepsTableHelper(table, node.children[x]);
		}
	}
};

/**
 * The select all steps check box in the custom export screen was clicked
 */
View.prototype.customExportSelectAllStepsCheckBoxClicked = function() {
	//get whether the checkbox was checked or unchecked
	var isSelectAllStepsChecked = $('#selectAllStepsCheckBox').attr('checked');
	
	if(isSelectAllStepsChecked == null) {
		isSelectAllStepsChecked = false;
	}
	
	//check or uncheck all the steps
	$(".stepCheckBox").each(function(index, element) {$(element).attr('checked', isSelectAllStepsChecked);});
	
	//check or uncheck all the activities
	$(".activityCheckBox").each(function(index, element) {$(element).attr('checked', isSelectAllStepsChecked);});
};

/**
 * One of the activity check boxes in the custom export screen was clicked
 * @param activityCheckBoxId the dom id of the activity checkbox
 */
View.prototype.customExportActivityCheckBoxClicked = function(activityCheckBoxId) {
	//get the activity number
	var activityNumber = activityCheckBoxId.replace("activityCheckBox_", "");
	
	//get whether the activity check box is checked or unchecked
	var isActivityChecked = $('#' + activityCheckBoxId).attr('checked');
	
	if(isActivityChecked == null) {
		isActivityChecked = false;
	}
	
	//check or uncheck all the steps in this activity
	$(".activityStep_" + activityNumber).each(function(index, element) {$(element).attr('checked', isActivityChecked);});
}

/**
 * Create the custom export div
 */
View.prototype.createCustomExportDiv = function() {
	var customExportDiv = $('<div>');
	customExportDiv.attr('id', 'customExportDiv');
	
	return customExportDiv;
};

/**
 * Create the row for the 'Special Export'
 */
View.prototype.createSpecialExportStudentWorkRow = function() {
	//create the row
	var exportStudentWorkRow = $('<tr>');
	
	//create the cell that will contain the label
	var exportStudentWorkCellLabel = $('<td>');
	exportStudentWorkCellLabel.html('Special Export');
	
	//create the cell that will contain the button
	var exportStudentWorkButtonCell = $('<td>');
	exportStudentWorkButtonCell.attr('colspan', 2);
	
	//create the button
	var exportStudentWorkButton = $('<input>');
	exportStudentWorkButton.attr('type', 'button');
	exportStudentWorkButton.val('Choose Step');
	exportStudentWorkButton.click({thisView:this}, function(event) {
		var thisView = event.data.thisView;
		
		//open the display that will let the user choose the step they want to export
		thisView.specialExportStudentWorkButtonClicked();
	});
	
	exportStudentWorkButtonCell.append(exportStudentWorkButton);
	
	exportStudentWorkRow.append(exportStudentWorkCellLabel);
	exportStudentWorkRow.append(exportStudentWorkButtonCell);
	
	return exportStudentWorkRow;
};

/**
 * Display the special export screen where the user chooses
 * which step to export
 */
View.prototype.specialExportStudentWorkButtonClicked = function() {
	$('#mainExportDiv').hide();
	$('#customExportDiv').hide();
	$('#specialExportDiv').show();
	
	//get the special export div
	var specialExportDiv = $('#specialExportDiv');
	
	//populate the div it is empty
	if(specialExportDiv.html() == '') {
		//create a table to display all the steps in the project
		var specialExportTable = $('<table>');
		
		//create the back button row
		var backButtonRow = this.createExportBackButtonRow();
		specialExportTable.append(backButtonRow);
		
		//create the row that will display 'Special Export'
		var pageHeaderRow = $('<tr>');
		var pageHeaderCell = $('<td>');
		var pageHeader = $('<h3>');
		pageHeader.css('display', 'inline');
		pageHeader.html('Special Export');
		pageHeaderCell.append(pageHeader);
		pageHeaderRow.append(pageHeaderCell);
		specialExportTable.append(pageHeaderRow);
		
		//create a row to hold all the steps
		var selectStepsTableRow = $('<tr>');
		
		//create the table that will contain all the steps
		var selectStepsTable = this.createSpecialExportSelectStepsTable();
		
		selectStepsTableRow.append(selectStepsTable);
		
		specialExportTable.append(selectStepsTableRow);
		
		//create the back button row that will show at the bottom of the screen
		var backButtonRow = this.createExportBackButtonRow();
		specialExportTable.append(backButtonRow);
		
		specialExportDiv.append(specialExportTable);
	}
};

/**
 * Create the table of steps for the special export
 */
View.prototype.createSpecialExportSelectStepsTable = function() {
	//create the table
	var table = $('<table>');
	
	//initialize the activity counter
	this.activityNumber = 0;
	
	//add the step rows to the table
	this.createSpecialExportSelectStepsTableHelper(table, this.getProject().getRootNode());
	
	return table;
};

/**
 * Populate the table with step rows. This is a recursive function
 * that will traverse the activities and steps in the project.
 * @param table the html table that will contain all the steps
 * @param node the current node we are on
 */
View.prototype.createSpecialExportSelectStepsTableHelper = function(table, node) {
	//get the current node id
	var nodeId = node.id;
	
	if(node.isLeafNode()) {
		//this node is a leaf/step

		var row = $('<tr>');
		var cell = $('<td>');
		
		//get the step number and title
		var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId);
		var nodeType = node.getType();

		//check if this step can be special exported
		if(node.canSpecialExport()) {
			//this step type can be special exported so we will display a button

			//create the button for the step
			var stepButton = $('<input>');
			stepButton.attr('type', 'button');
			stepButton.attr('id', 'stepButton_' + nodeId);
			stepButton.css('margin-left', '20px');
			stepButton.val(stepNumberAndTitle + '(' + nodeType + ')');
			stepButton.click({thisView:this, nodeId:nodeId}, function(event) {
				var thisView = event.data.thisView;
				var nodeId = event.data.nodeId;
				
				//make the request for the special export file
				thisView.specialExportStepButtonClicked(nodeId);
			});
			
			cell.append(stepButton);
		} else {
			//this step can't be special exported so we will just display the step name as text
			
			//create the step label
			var stepP = $('<p>');
			stepP.css('display', 'inline');
			stepP.css('margin-left', '20px');
			stepP.html(stepNumberAndTitle + '(' + nodeType + ')');
			
			cell.append(stepP);
		}
		
		row.append(cell);
		
		table.append(row);
	} else {
		/*
		 * we need to skip the first sequence because that is always the
		 * master sequence. we will encounter the master sequence when 
		 * this.activityNumber is 0, so all the subsequent activities will
		 * start at 1.
		 */
		if(this.activityNumber != 0) {
			//this node is a sequence so we will display a checkbox and label for the current activity
			
			var row = $('<tr>');
			var cell = $('<td>');
			
			//get the activity number and title
			var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId);
			
			//create the h4 to display the activity label
			var activityH4 = $('<h4>');
			activityH4.html('Activity ' + stepNumberAndTitle);
			activityH4.css('display', 'inline');
			
			cell.append(activityH4);
			
			row.append(cell);
			
			table.append(row);
		}

		//increment the activity number
		this.activityNumber++;
		
		//loop through all its children
		for(var x=0; x<node.children.length; x++) {
			//add the children
			this.createSpecialExportSelectStepsTableHelper(table, node.children[x]);
		}
	}
};

/**
 * Create the special export div
 */
View.prototype.createSpecialExportDiv = function() {
	var specialExportDiv = $('<div>');
	specialExportDiv.attr('id', 'specialExportDiv');
	
	return specialExportDiv;
};

/**
 * Called when the classroom monitor window closes
 */
View.prototype.onWindowUnload = function() {
	/*
	 * the classroom monitor window is being closed so we will make sure
	 * the student screens are unpaused so the students aren't stuck
	 * at the pause screen
	 */
	this.unPauseScreens();
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/classroomMonitor/classroomMonitorView_main.js');
}