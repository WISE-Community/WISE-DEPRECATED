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
	//set the classroom monitor header
	$('#classroomMonitorHeader').text('Classroom Monitor');
	
	//display a loading message
	$('#classroomMonitorButtonDiv').text('Loading...');
	
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
};


/**
 * Show the pause all screens display
 */
View.prototype.showPauseScreensDisplay = function() {
	//hide the other display divs and show the pause all screens div
	$('#studentProgressDisplay').hide();
	$('#stepProgressDisplay').hide();
	$('#pauseScreensDisplay').show();
	
	//fix the height so scrollbars display correctly
	this.fixClassroomMonitorDisplayHeight();
};


/**
 * Show the student progress display
 */
View.prototype.showStudentProgressDisplay = function() {
	//hide the other display divs and show the student progress div
	$('#pauseScreensDisplay').hide();
	$('#stepProgressDisplay').hide();
	$('#studentProgressDisplay').show();
	
	//fix the height so scrollbars display correctly
	this.fixClassroomMonitorDisplayHeight();
};


/**
 * Show the step progress display
 */
View.prototype.showStepProgressDisplay = function() {
	//hide the other display divs and show the step progress div
	$('#pauseScreensDisplay').hide();
	$('#studentProgressDisplay').hide();
	$('#stepProgressDisplay').show();
	
	//fix the height so scrollbars display correctly
	this.fixClassroomMonitorDisplayHeight();
};


/**
 * Create the classroom monitor buttons
 */
View.prototype.createClassroomMonitorButtons = function() {
	//make the period button class
	var chooseClassroomMonitorDisplayButtonClass = 'chooseClassroomMonitorDisplayButton';
	
	//create the pause all screens tool button
	var pauseScreensToolButton = $('<input/>').attr({id:'pauseScreensButton', type:'button', name:'pauseScreensButton', value:'Pause Screens Tool'});
	pauseScreensToolButton.addClass(chooseClassroomMonitorDisplayButtonClass);
	
	/*
	 * make the button yellow since the pause screens display is 
	 * the display we show when the classroom monitor starts up
	 */
	this.setActiveButtonBackgroundColor(pauseScreensToolButton);
	
	//create the student progress button
	var studentProgressButton = $('<input/>').attr({id:'studentProgressButton', type:'button', name:'studentProgressButton', value:'Student Progress'});
	studentProgressButton.addClass(chooseClassroomMonitorDisplayButtonClass);
	
	//create the step progress button
	var stepProgressButton = $('<input/>').attr({id:'stepProgressButton', type:'button', name:'stepProgressButton', value:'Step Progress'});
	stepProgressButton.addClass(chooseClassroomMonitorDisplayButtonClass);
	
	//set the click event for the pause all screens tool button
	pauseScreensToolButton.click({thisView:this}, function(event) {
		var thisView = event.data.thisView;
		
		//clear the background from the other display buttons and make this button background yellow
		thisView.setActiveButtonBackgroundColor(this, chooseClassroomMonitorDisplayButtonClass);
		
		//show the pause all screens display
		thisView.showPauseScreensDisplay();
	});
	
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
	
	//add all the buttons to the button div
	$('#classroomMonitorButtonDiv').append(pauseScreensToolButton);
	$('#classroomMonitorButtonDiv').append(studentProgressButton);
	$('#classroomMonitorButtonDiv').append(stepProgressButton);
	
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
	$('#classroomMonitorPeriodsDiv').append(allPeriodsButton);
	
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
			$('#classroomMonitorPeriodsDiv').append(periodButton);
			
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
		$('.studentRow').show();
	} else if(periodId != null) {
		/*
		 * period id is provided so we will hide all student rows except the
		 * ones in the period
		 */
		
		//hide all the student rows in the student progress display
		$('.studentRow').hide();
		
		//get the period id class
		var periodIdClass = 'periodId_' + periodId;
		
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
 * Fix the height of the classroomMonitorIfrm so no scrollbars are displayed
 * for the iframe
 */
View.prototype.fixClassroomMonitorDisplayHeight = function() {
	//get the height of the classroomMonitorIfrm
	var height = $('#classroomMonitorIfrm',window.parent.parent.document).height();
	
	/*
	 * resize the height of the topifrm that contains the classroomMonitorIfrm
	 * so that there will be no scroll bars
	 */
	$('#topifrm', parent.document).height(height);
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
	var pauseScreenStatus = $('<span>').attr({id:'pauseScreenStatus'});
	
	//add the pause status span
	$('#pauseScreensDisplay').append(pauseScreenStatus);
	
	//see if all periods have been paused
	var isAllPeriodsPaused = this.isPeriodPaused();
	
	//the class for the pause and unpause buttons
	var pauseButtonsClass = 'pauseButtons';
	
	//create the pause button
	var pauseButton = $('<input/>').attr({id:'pauseButton', type:'button', name:'pauseButton', value:'Paused'});
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
	var workgroupIds = this.getUserAndClassInfo().getClassmateWorkgroupIds();
	
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
		var studentRowClass = 'studentRow';
		studentTR.addClass(studentRowClass);
		
		//create the period id class and add it to the student row
		var periodIdClass = 'periodId_' + periodId;
		studentTR.addClass(periodIdClass);
		
		//create the cell to display whether the workgroup is online
		var onlineTD = $('<td>').attr({id:'studentProgressTableDataOnline_' + workgroupId});
		onlineTD.text(studentOnline);
		
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
		completionPercentageTD.text(completionPercentage + '%');
		
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
			view:this,
			workgroupId:workgroupId
		}
		
		//set the function to be called when the row is clicked 
		studentTR.click(studentRowClickedParams, this.studentRowClicked);
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
	var thisView = event.data.view;
	
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
	//get the url for retrieving student data
	var getStudentDataUrl = this.getConfig().getConfigParam('getStudentDataUrl');
	
	var runId = this.getConfig().getConfigParam('runId');
	var grading = true;
	var getRevisions = true;
	
	//get all the step node ids that are used in the project
	var nodeIds = this.getProject().getNodeIds();
	nodeIds = nodeIds.join(':');
	
	//create the GET params for retrieving the student data
	var getStudentDataUrlWithParams = getStudentDataUrl + 
		"?userId=" + workgroupId + 
		"&grading=true" + 
		"&runId=" + runId + 
		"&nodeIds" + nodeIds + 
		"&getRevisions=true";
	
	//make the request to retrieve the student data
	this.connectionManager.request('GET', 1, getStudentDataUrlWithParams, null, this.getStudentWorkInClassroomMonitorCallback, [this, workgroupId], this.getStudentWorkInClassroomMonitorCallbackFail);
};

/**
 * The success callback when retrieving student work
 * 
 * @param text the student work as text
 * @param xml 
 * @param args 
 */
View.prototype.getStudentWorkInClassroomMonitorCallback = function(text, xml, args) {
	var thisView = args[0];
	var workgroupId = args[1];
	
	//get the student work and do whatever we need to do with it
	thisView.getStudentWorkInClassroomMonitorCallbackHandler(workgroupId, text);
};

/**
 * Called when we successfully retrieve the student work
 * 
 * @param text the student work vle state as a JSON string
 */
View.prototype.getStudentWorkInClassroomMonitorCallbackHandler = function(workgroupId, text) {
	if(text != null) {
		//parse the vle state
		var vleState = VLE_STATE.prototype.parseDataJSONString(text);
		
		if(vleState != null) {
			//add the vle state to our model
			this.model.addWorkByStudent(workgroupId, vleState);
		}		
	}
};

/**
 * The failure callback when trying to retrieve student work
 */
View.prototype.getStudentWorkInClassroomMonitorCallbackFail = function(text, xml, args) {
	var thisView = args;
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
				var nodePrefix = '';
				
				//get the prefix
				if(node.type == 'sequence') {
					nodePrefix = 'Activity';
				} else {
					nodePrefix = 'Step';
				}
				
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
				
				//create the step title
				var stepTitle = nodePrefix + ' ' + stepNumberAndTitle + ' (' + nodeType + ')';
				
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
		
		if(completionPercentage == null) {
			completionPercentage = '';
		} else {
			//append the % sign
			completionPercentage += '%';
		}
		
		completionPercentageTD.text(completionPercentage);

		//add the cells to the row
		stepTR.append(stepTitleTD);
		stepTR.append(numberStudentsOnStepTD);
		stepTR.append(completionPercentageTD);
		
		//create the params to be used when this the teacher clicks this row
		var stepRowClickedParams = {
			view:this,
			nodeId:nodeId
		}
		
		//set the function to be called when the row is clicked
		stepTR.click(stepRowClickedParams, this.stepRowClicked);
	}
	
	return stepTR;
};

/**
 * The function that is called when a student row is clicked
 * 
 * @param event the click event
 */
View.prototype.stepRowClicked = function(event) {
	var thisView = event.data.view;
	
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
	//get the url for retrieving student data
	var getStudentDataUrl = this.getConfig().getConfigParam('getStudentDataUrl');
	
	var runId = this.getConfig().getConfigParam('runId');
	var grading = true;
	var getRevisions = true;
	
	//get the workgroup ids in the run
	var workgroupIds = this.getUserAndClassInfo().getClassmateWorkgroupIds();
	
	//join the workgroup ids into a single string delimited by ':'
	userIds = workgroupIds.join(':');
	
	//create the GET params for retrieving the student data
	var getStudentDataUrlWithParams = getStudentDataUrl + 
		"?nodeId=" + nodeId +
		"&userId=" + userIds + 
		"&grading=true" + 
		"&runId=" + runId + 
		"&getRevisions=true";
	
	//make the request to retrieve the student data
	this.connectionManager.request('GET', 1, getStudentDataUrlWithParams, null, this.getStepWorkInClassroomMonitorCallback, [this, nodeId], this.getStepWorkInClassroomMonitorCallbackFail);

};

/**
 * The success callback when retrieving student work
 * 
 * @param text the student work as text
 * @param xml 
 * @param args 
 */
View.prototype.getStepWorkInClassroomMonitorCallback = function(text, xml, args) {
	var thisView = args[0];
	var nodeId = args[1];

	//get the student work and do whatever we need to do with it
	thisView.getStepWorkInClassroomMonitorCallbackHandler(nodeId, text);
};

/**
 * Called when we successfully retrieve the student work
 * 
 * @param text the student work for the step
 */
View.prototype.getStepWorkInClassroomMonitorCallbackHandler = function(nodeId, text) {
	//get the student work as an array of node visits
	var studentWork = JSON.parse(text);
	
	//add the student work to the model
	this.model.addWorkByStep(nodeId, studentWork);
};

/**
 * The failure callback when trying to retrieve student work
 */
View.prototype.getStepWorkInClassroomMonitorCallbackFail = function(text, xml, args) {
	var thisView = args;
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
	$('#classroomMonitorButtonDiv').text("");
	
	//get the list of workgroup ids that are online
	var studentsOnlineList = data.studentsOnlineList;
	
	/*
	 * create all of the UI for the classroom monitor now that we have
	 * all the information we need
	 */
	this.createClassroomMonitorDisplays();
	
	/*
	 * show the pause all screens display as the default screen to show
	 * when the classroom monitor initially loads
	 */
	this.showPauseScreensDisplay();
	
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
	$('#studentProgressTableDataOnline_' + workgroupId).text(true);
	
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
		//update the online status in the UI for the student
		$('#studentProgressTableDataOnline_' + workgroupId).text(isOnline);
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
 * Called when the classroom monitor window closes
 */
View.prototype.onWindowUnload = function() {
	
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/classroomMonitor/classroomMonitorView_main.js');
}