

/**
 * Generate the html for the import view, insert the html into
 * the import view dialog popup and then open the dialog popup
 */
View.prototype.displayImportView = function() {
	//generate the html for the tag view
	var html = this.getImportView();
	
	//insert the html into the dialog
	$('#importView').html(html);
	
	//retrieve the projects that are authorable by the user
	this.connectionManager.request('GET', 1, (this.portalUrl ? this.portalUrl : this.requestUrl), {command: 'projectList', 'projectPaths': this.projectPaths, projectTag: 'authorable'}, this.retrieveImportProjectListSuccess, {thisView:this, projectType:'authorable'}, this.retrieveImportProjectListFail);
	
	//retrieve the library projects
	this.connectionManager.request('GET', 1, (this.portalUrl ? this.portalUrl : this.requestUrl), {command: 'projectList', 'projectPaths': this.projectPaths, projectTag: 'library'}, this.retrieveImportProjectListSuccess, {thisView:this, projectType:'library'}, this.retrieveImportProjectListFail);
	
	//display the dialog
	$('#importViewDialog').dialog('open');
};

/**
 * Generate the import view
 * @returns the html that will display the import UI
 */
View.prototype.getImportView = function() {
	var html = "";

	html += "<div id='importViewSelectProjectDiv'>";
	html += "<p>Authorable Projects</p>";
	
	//drop down list that will be populated with the projects that are authorable by the user
	html += "<select id='importFromAuthorableProjectList' onchange='eventManager.fire(\"openProjectInImportView\", \"authorable\")'></select>";
	html += "<br>";
	html += "<br>";
	html += "<p>Library Projects</p>";
	
	//drop down list that will be populated with the library projects
	html += "<select id='importFromLibraryProjectList' onchange='eventManager.fire(\"openProjectInImportView\", \"library\")'></select>";
	html += "<br>";
	html += "<br>";
	html += "</div>";
	html += "<hr>";
	
	//div that will be populated with the project that the user has chosen to import from
	html += "<div id='importViewDisplayProjectDiv'></div>";
	
	return html;
};

/**
 * Success callback for when we have retrieved the list of projects
 */
View.prototype.retrieveImportProjectListSuccess = function(responseText, responseXML, args) {
	var thisView = args.thisView;
	
	//get the project type 'authorable' or 'library'
	var projectType = args.projectType;
	
	//create the JSONArray from the response
	var projectsArray = JSON.parse(responseText);
	
	//sort the array by id
	projectsArray.sort(thisView.sortProjectsById);
	
	if(projectType == 'authorable') {
		thisView.authorableProjectsArray = projectsArray;
	} else if(projectType == 'library') {
		thisView.libraryProjectsArray = projectsArray;
	}
	
	if(projectType == 'authorable') {
		$('#importFromAuthorableProjectList').append('<option name="authorableProjectOption" value="">Select Authorable Project</option>');			
	} else if(projectType == 'library') {
		$('#importFromLibraryProjectList').append('<option name="libraryProjectOption" value="">Select Library Project</option>');
	}
	
	//loop through all the projects
	for(var x=0; x<projectsArray.length; x++) {
		//get the project attributes
		var project = projectsArray[x];
		var projectId = project.id;
		var projectPath = project.path;
		var projectTitle = project.title;
		
		//add the project as an element in the appropriate drop down list
		if(projectType == 'authorable') {
			$('#importFromAuthorableProjectList').append('<option name="authorableProjectOption" value="' + projectId + '">' +  projectId + ': ' + projectTitle +'</option>');			
		} else if(projectType == 'library') {
			$('#importFromLibraryProjectList').append('<option name="libraryProjectOption" value="' + projectId + '">' +  projectId + ': ' + projectTitle +'</option>');
		}
	}
};

/**
 * Fail callback when trying to retrieve the list of projects
 * @param responseText
 * @param args
 */
View.prototype.retrieveImportProjectListFail = function(responseText, args) {
	//get the project type 'authorable' or 'library'
	var projectType = args.projectType;
	
	if(projectType == 'authorable') {
		alert('Error: Failed to retrieve Authorable project list');
	} else if(projectType == 'library') {
		alert('Error: Failed to retrieve Library project list');
	}
};

/**
 * Open the selected project and display all the steps to the author
 * so they can select which steps to import
 * @param projectType the type of project 'authorable' or 'library'
 */
View.prototype.openProjectInImportView = function(projectType) {
	var selectedProject = null;
	var projectArray = [];
	
	//get the project that they selected
	if(projectType == 'authorable') {
		selectedProject = $('#importFromAuthorableProjectList :selected');
		projectArray = this.authorableProjectsArray;
	} else if(projectType == 'library') {
		selectedProject = $('#importFromLibraryProjectList :selected');
		projectArray = this.libraryProjectsArray;
	}
	
	//get the project id they selected
	var projectId = selectedProject[0].value;
	var projectPath = '';
	var projectTitle = '';
	
	if(projectId != null && projectId != '') {
		//loop through the array of projects and find the one they chose
		for(var x=0; x<projectArray.length; x++) {
			var project = projectArray[x];
			
			if(project.id == projectId) {
				//we found the project so we will obtain the path and title
				projectPath = project.path;
				projectTitle = project.title;
				break;
			}
		}

		//remember the project id
		this.importProjectId = projectId;
		
		//create the base url for retrieving the project file
		var baseUrl = this.portalUrl + '?forward=filemanager&projectId=' + projectId + '&command=retrieveFile&fileName=';
		
		//create the html that will display the project to the user
		var html = this.displayProjectInImportView(baseUrl + projectPath);
		
		//set the html into the div
		$('#importViewDisplayProjectDiv').html(html);		
	}
};

/**
 * Retrieves the project and displays it to the user
 * @param projectFileUrl the url for the project file
 * @returns the html that will allow the user to choose which
 * steps to import
 */
View.prototype.displayProjectInImportView = function(projectFileUrl) {
	
	//get the project
	var project = createProject(createContent(projectFileUrl), this.utils.getContentBaseFromFullUrl(projectFileUrl), true, this);
	
	//remember the project so we can reference it later
	this.importProject = project;
	
	//get the root node of the project
	var rootNode = project.getRootNode();
	
	//activity counter for display purposes
	this.importViewActivityNumber = 0;
	
	var html = "";
	
	//button to import steps
	html += "<input type='button' value='Import Selected Items' onclick='eventManager.fire(\"importSelectedItems\")' />";
	
	//div that we will use to display the message 'Importing steps...' to the user
	html += "<div id='topImportMessageDiv' style='display:inline'></div>";
	
	html += "<br>";
	html += "<br>";
	
	//display the project title and project id
	html += "<u>" + this.importProject.getTitle() + " (ID:" + this.importProjectId + ")</u>";
	
	html += "<br>";
	html += "<br>";
	
	//create the html that will display the project
	html += this.displayProjectInImportViewHelper(rootNode);
	
	html += "<br>";
	
	//button to import steps
	html += "<input type='button' value='Import Selected Items' onclick='eventManager.fire(\"importSelectedItems\")' />";
	
	//div that we will use to display the message 'Importing steps...' to the user 
	html += "<div id='bottomImportMessageDiv' style='display:inline'></div>";
	
	return html;
};

/**
 * Recursive function that loops through all the activities and steps and
 * creates the html that displays them.
 * @param node the current node
 * @param stepNumberSoFar the step number e.g.
 * if we are on the first activity it would be '1'
 * if we are on the second activity it would be '2'
 * if we are on the first step of the first activity it would be '1.1'
 */
View.prototype.displayProjectInImportViewHelper = function(node, stepNumberSoFar) {
	var html = "";
	
	if(node.isLeafNode()) {
		//we are on a step
		
		//the checkbox to select the step
		html += "&nbsp;&nbsp;&nbsp;<input type='checkbox' name='importViewStepCheckbox' value='" + node.id + "' />";
		
		//the step number and title
		html += "Step " + stepNumberSoFar + ": " + node.title;
		html += "<br>";
	} else {
		//we are on an activity
		
		if(stepNumberSoFar == null) {
			//we are on the root node
			stepNumberSoFar = "";
		} else {
			//html += "<input type='checkbox' name='importViewActivityCheckbox' value='" + node.id + "' />";
			
			//the activity number and title
			html += "Activity " + stepNumberSoFar + ": " + node.title;
			html += "<br>";
			
			stepNumberSoFar += ".";
		}
		
		//loop through all the children of this activity
		for(var x=0; x<node.children.length; x++) {
			//get the html for the children
			html += this.displayProjectInImportViewHelper(node.children[x], stepNumberSoFar + (x + 1));
		}
	}
	
	return html;
};

/**
 * The user has selected the steps they want to import and clicked on the
 * 'Import Selected Items' button so now we will import those steps into 
 * the project
 */
View.prototype.importSelectedItems = function() {
	var nodeIds = [];
	
	//get all the steps that were checked
	var checkedSteps = $('input[name=importViewStepCheckbox]:checked');
	
	/*
	 * variable that will be used to hold all the titles of the steps
	 * that we will import so that after we successfully import the
	 * steps, we can display which steps were imported
	 */
	var stepTitles = '';
	
	if(checkedSteps == null || checkedSteps.length == 0) {
		//the user did not check any steps so we will display an error message
		alert('Error: You did not select any steps to import');
	} else {
		//display a message to the user to notify them that we are in the process of importing the steps
		this.setImportMessage('Importing steps...');
		
		//loop through all the steps they checked
		for(var x=0; x<checkedSteps.length; x++) {
			//get a step
			var checkedStep = checkedSteps[x];
			
			//get the node id
			var nodeId = checkedStep.value;
			
			//add the node id to our array
			nodeIds.push(nodeId);
			
			//get the node position and title
			var node = this.importProject.getNodeById(nodeId);
			var nodeTitle = node.title;
			var nodePosition = this.importProject.getVLEPositionById(nodeId);

			if(stepTitles != '') {
				stepTitles += '\n';
			}
			
			//add the step to our step titles
			stepTitles += 'Step ' + nodePosition + ': ' + nodeTitle;
		}
		
		var requestArgs = {
			forward:'filemanager',
			projectId:this.portalProjectId,
			fromProjectId:this.importProjectId,
			command:'importSteps',
			nodeIds:JSON.stringify(nodeIds)
		};
		
		/*
		 * make the request to import the steps. all the step copying and
		 * updating of the project fill will occur on the server.
		 */
		this.connectionManager.request('POST', 3, this.requestUrl, requestArgs, this.importStepsSuccess, {thisView:this, stepTitles:stepTitles}, this.importStepsFail);
	}
};

/**
 * Success callback for when we have successfully imported the steps
 * @param responseText
 * @param responseXML
 * @param args
 */
View.prototype.importStepsSuccess = function(responseText, responseXML, args) {
	var thisView = args.thisView;
	var stepTitles = args.stepTitles;
	
	//clear any messages
	thisView.setImportMessage('');
	
	/*
	 * display to the user that we successfully imported the steps and
	 * also display which steps were imported
	 */
	alert("Successfully imported steps\n\n" + stepTitles + "\n\nYou will find the imported steps in the 'Inactive Steps' section of your project at the bottom of the Authoring Tool");
	
	//reload the project so the new steps show up in the project
	thisView.reloadProject();
};

/**
 * Fail callback for when failing to import steps
 * @param responseText
 * @param args
 */
View.prototype.importStepsFail = function(responseText, args) {
	var thisView = args.thisView;
	thisView.setImportMessage('');
	alert('Error: Failed to import steps');
};

/**
 * Sets the message at the bottom and top of the import view
 * next to the 'Import Selected Items' buttons
 * @param message
 */
View.prototype.setImportMessage = function(message) {
	$('#topImportMessageDiv').html(message);
	$('#bottomImportMessageDiv').html(message);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/authorview_import.js');
}