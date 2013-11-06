/**
 * The project cleaner analyzes the project file for any errors or inconsistencies
 * and recommends solutions to the user.
 * 
 * @author patrick lawler
 */

/* Declare cleaner object and initialize problem id counter */
View.prototype.cleaner = {problemIdCounter:1};

/**
 * Saves the changes to the project after cleaning and cleans up any results that may have been displayed.
 */
View.prototype.cleaner.save = function(){
	if(!this.projectPart.hasProblem() || confirm('The current project still has unresolved problems, do you wish to continue?')){
		var fixedProject = this.projectPart.save();
		$('#cleanProjectDialog').dialog('close');
		this.cleanup();
		this.view.eventManager.fire('cleanSavingProjectFileStart', fixedProject);
	};
};

/**
 * Aborts the project cleaning and cleans up any results that may have been displayed.
 */
View.prototype.cleaner.cancel = function(){
	if(!this.projectPart.hasProblem() || confirm('The current project still has unresolved problems, do you wish to continue?')){
		this.view.notificationManager.notify('Project cleaning canceled. No changes were saved.', 3);
		$('#cleanProjectDialog').dialog('close');
		this.cleanup();
		this.reloadProject();
	};
};

/**
 * Removes any table elements or messages from project cleaning.
 */
View.prototype.cleaner.cleanup = function(){
	var thead = document.getElementById('cleanProjectTableHead');
	var tbody = document.getElementById('cleanProjectTableBody');
	
	/* remove results html */
	document.getElementById('cleanProjectResultsText').innerHTML = '';
	
	/* remove table head elements */
	while(thead.firstChild){
		thead.removeChild(thead.firstChild);
	};
	
	/* remove table body elements */
	while(tbody.firstChild){
		tbody.removeChild(tbody.firstChild);
	};
};

/**
 * Creates the headers for the cleaning project results table
 */
View.prototype.cleaner.setTableHeaders = function(){
	var thead = document.getElementById('cleanProjectTableHead');
	
	/* create the elements */
	var theadTR = createElement(document, 'tr');
	var theadTHSeverity = createElement(document, 'th', {width:'10%'});
	var theadTHProblem = createElement(document, 'th', {width:'40%'});
	var theadTHSolution = createElement(document, 'th', {width:'40%'});
	
	/* append the elements */
	thead.appendChild(theadTR);
	theadTR.appendChild(theadTHSeverity);
	theadTR.appendChild(theadTHProblem);
	theadTR.appendChild(theadTHSolution);
	
	/* set the innerHTML for the elements */
	theadTHSeverity.innerHTML = 'Severity:';
	theadTHProblem.innerHTML = 'Problem Identified:';
	theadTHSolution.innerHTML = 'Suggested Solutions:';
};

/**
 * Sets the view in the cleaner object and begins the cleaning process
 */
View.prototype.cleaner.initializeCleaning = function(view){
	this.view = view;
	this.projectFilePath;
	this.projectFileText;
	this.projectFileJSON;
	this.projectPart;
	this.baseCounter = 0;
	this.registeredAsyncRequests = [];
	
	/* if there is no project open do nothing */
	if(!this.view.getProject()){
		this.view.notificationManager.notify('Please open the project you wish to clean before running this tool.');
	} else if(this.view.cleanMode){
		/* save variables necessary for cleaning the project */
		this.projectFilePath = this.view.utils.getContentPath(this.view.authoringBaseUrl,this.view.getProject().getContentBase()) + this.view.getProject().getProjectFilename();

		/* and skip to the analysis */
		this.view.eventManager.fire('cleanClosingProjectComplete');
	} else {
		/* try to save the project before proceeding */
		this.view.eventManager.fire('cleanSavingProjectStart');
	};
};

/**
 * Attempts to save the currently opened project.
 */
View.prototype.cleaner.saveProject = function(restore){
	var data = $.stringify(this.view.getProject().projectJSON(),null,3);
	
	var success = function(t,x,o){
		if(!restore){
			if(t!='success'){
				o.eventManager.fire('cleanSavingProjectComplete', 'false');
			} else {
				o.eventManager.fire('setLastEdited');
				o.eventManager.fire('cleanSavingProjectComplete', 'true');
			};
		} else {
			o.notificationManager.notify('Original project successfully restored!');
			o.eventManager.fire('cleanSavingProjectFileComplete', 'true');
		};
	};
	
	var failure = function(t,o){
		if(!restore){
			o.eventManager.fire('cleanSavingProjectComplete', 'false');
		} else {
			o.notificationManager.notify('Could not restore original project file!', 3);
			o.eventManager.fire('cleanSavingProjectFileComplete', 'false');
		};
	};
	
	this.view.connectionManager.request('POST', 1, this.view.requestUrl, {forward:'filemanager', command: 'updateFile', projectId: this.view.portalProjectId, fileName: this.view.getProject().getProjectFilename(), data: encodeURIComponent(data)}, success, this.view, failure);
};

/**
 * If the opened project saved successfully, continue with the cleaning process,
 * otherwise, confirm proceeding with the user.
 */
View.prototype.cleaner.onSavingProjectComplete = function(success){
	if(success=='true' || confirm('There was a problem trying to save the currently opened project, do you wish to proceed?')){
		this.view.eventManager.fire('cleanClosingProjectStart');
	};
};

/**
 * Saves the path to the project file, then closes the currently opened project
 */
View.prototype.cleaner.closeProject = function(){
	var parent = document.getElementById('dynamicProject');
	
	/* wipe out html elements that comprise the current project's authoring */
	while(parent.firstChild){
		parent.removeChild(parent.firstChild);
	};
	
	/* notify the portal that we are closing the project if in portal mode */
	if(this.view.portalUrl){
		this.view.notifyPortalCloseProject();
	};
		
	/* save variables necessary for cleaning the project */
	this.projectFilePath = this.view.utils.getContentPath(this.view.authoringBaseUrl,this.view.getProject().getContentBase()) + this.view.getProject().getProjectFilename();
	
	/* set view html elements to initial state */
	document.getElementById('stepLevel').checked = false;
	document.getElementById('autoStepCheck1').checked = false;
	document.getElementById('stepTerm').value = '';
	document.getElementById('projectTitleInput').value = '';
	document.getElementById('postLevelSelect').selectedIndex = 0;
	
	/* all done here */
	this.view.eventManager.fire('cleanClosingProjectComplete');
};

/**
 * Launches the project file opening once closing the current project completes
 * successfully.
 */
View.prototype.cleaner.onClosingProjectComplete = function(){
	this.view.eventManager.fire('cleanLoadingProjectFileStart');
};

/**
 * Loads the project file associated with the project
 */
View.prototype.cleaner.loadProjectFile = function(){
	var success = function(t,x,o){
		o.projectFileText = t;
		o.projectFileJSON = $.parseJSON(o.projectFileText);
		o.view.eventManager.fire('cleanLoadingProjectFileComplete', 'true');
	};
	
	var failure = function(t,o){
		o.view.eventManager.fire('cleanLoadingProjectFileComplete', 'false');
	};
	
	this.view.connectionManager.request('GET', 1, this.view.requestUrl, {forward:'filemanager', command:'retrieveFile', projectId:this.view.portalProjectId, fileName: this.projectFilePath}, success, this, failure);
};

/**
 * Starts the analysis if the project file was successfully loaded, otherwise,
 * notifies user and attempts to reload the project.
 */
View.prototype.cleaner.onLoadingProjectFileComplete = function(success){
	if(success=='true'){
		$('#cleanProjectDialog').dialog('open');
		this.view.eventManager.fire('cleanAnalyzingProjectStart');
	} else {
		this.view.notificationManager.notify('Unable to load project file for cleaning. Attempting to reload the project.', 3);
		this.reloadProject();
	};
};

/**
 * Delegates out the various tasks involved in analyzing this project.
 */
View.prototype.cleaner.analyzeProject = function(){
	/* create the project part, which breaks the project into its component parts */
	this.projectPart = new ProjectPart('projectPart', this.projectFileJSON, this);
	
	/* run the analyzers for all of the parts */
	this.projectPart.analyze();
	
	/* check to see if we are waiting for any async requests */
	if(this.registeredAsyncRequests.length==0){
		this.view.eventManager.fire('cleanAnalyzingProjectComplete');
	};
};

/**
 * Displays the results of the analysis
 */
View.prototype.cleaner.displayResults = function(){
	this.view.eventManager.fire('cleanDisplayingResultsStart');
	
	/* if we are in clean mode but the cleaning user is not the owner, send results to portal
	 * without displaying them */
	if(this.view.cleanMode && window.parent.isOwner==='false'){
		this.sendCleaningResultsToPortal();
	} else {
		/* if there are problems, display them and their solutions */
		if(this.projectPart.hasProblem()){
			document.getElementById('cleanCancel').style.display = 'inline';
			document.getElementById('cleanProjectResultsText').innerHTML = 'The following problem(s) were detected with this project.';
			this.setTableHeaders();
			
			var tbody = document.getElementById('cleanProjectTableBody');
			var severe = this.projectPart.getProblemsBySeverity(3);
			var warning = this.projectPart.getProblemsBySeverity(2);
			var notify = this.projectPart.getProblemsBySeverity(1);

			for(var u=0;u<severe.length;u++){
				var tr = createElement(document, 'tr', {rowspan:'2'});
				var td = createElement(document, 'td', {colspan:'3'});
				tbody.appendChild(tr);
				tr.appendChild(td);
				td.innerHTML = '<b>Problem detected for part ' + severe[u].part.part + '</b>';
				
				severe[u].displayProblem(tbody);
			};
			
			for(var v=0;v<warning.length;v++){
				var tr = createElement(document, 'tr', {rowspan:'2'});
				var td = createElement(document, 'td', {colspan:'3'});
				tbody.appendChild(tr);
				tr.appendChild(td);
				td.innerHTML = '<b>Problem detected for part ' + warning[v].part.part + '</b>';
				
				warning[v].displayProblem(tbody);
			};
			
			for(var w=0;w<notify.length;w++){
				var tr = createElement(document, 'tr', {rowspan:'2'});
				var td = createElement(document, 'td', {colspan:'3'});
				tbody.appendChild(tr);
				tr.appendChild(td);
				td.innerHTML = '<b>Problem detected for part ' + notify[w].part.part + '</b>';
				
				notify[w].displayProblem(tbody);
			};
		/* otherwise, let user know that the project is clean */
		} else if(this.view.cleanMode){
			this.sendCleaningResultsToPortal();
			return;
		} else {
			document.getElementById('cleanCancel').style.display = 'none';
			document.getElementById('cleanProjectResultsText').innerHTML = 'There were no problems found with this project!';
			return;
		};
		
		this.view.eventManager.fire('cleanDisplayingResultsComplete');
	};
};

/**
 * Given an identifier, returns true if that identifier exists
 * in the project, false otherwise.
 */
View.prototype.cleaner.idExists = function(id){
	var idObs = this.projectPart.getPartIds();
	
	for(var d=0;d<idObs.length;d++){
		if(idObs[d].id==id){
			return true;
		};
	};
	
	return false;
};

/**
 * Given an identifier, returns true if that identifier is referenced
 * by anything in the project, returns false otherwise.
 */
View.prototype.cleaner.isReferenced = function(id){
	var references = this.projectPart.getReferencedIds();
	
	for(var e=0;e<references.length;e++){
		if(references[e]==id){
			return true;
		};
	};
	
	return false;
};

/**
 * Adds the given name to the registered async requests.
 */
View.prototype.cleaner.registerAsyncRequest = function(name){
	this.registeredAsyncRequests.push(name);
};

/**
 * Removes the name from the registered async requests and fires the
 * analysis complete event if all async requests have completed.
 */
View.prototype.cleaner.unregisterAsyncRequest = function(name){
	this.registeredAsyncRequests.splice(this.registeredAsyncRequests.indexOf(name), 1);
	if(this.registeredAsyncRequests.length==0){
		this.view.eventManager.fire('cleanAnalyzingProjectComplete');
	};
};

/**
 * Returns a unique name for async requests.
 */
View.prototype.cleaner.generateUniqueName = function(){
	this.baseCounter ++;
	return 'request_' + this.baseCounter;
};

/**
 * Saves the fixed project to the project file.
 */
View.prototype.cleaner.saveFixedProject = function(fixedProject){
	var data = $.stringify(fixedProject, null, 3);
	
	var success = function(t,x,o){
		if(o.cleanMode){
			o.notificationManager.notify('Saved the fixed project, notifying the portal', 3);
		} else {
			o.notificationManager.notify('Saved fixed project, attempting to reload the project', 3);
		};
		
		o.eventManager.fire('cleanUpdateProjectMetaFile');
	};
	
	var failure = function(t,o){
		o.notificationManager.notify('Error saving fixed project, restoring original...', 3);
		o.cleaner.saveProject(true);
	};
	
	this.view.connectionManager.request('POST', 1, this.view.requestUrl, {forward:'filemanager', command: 'updateFile', projectId:this.view.portalProjectId, fileName: this.view.getProject().getProjectFilename(), data: encodeURIComponent(data)}, success, this.view, failure);
};

/**
 * Reloads the project from the file.
 */
View.prototype.cleaner.reloadProject = function(success){
	//if this is a portal project, set portalProjectId variable so the authoring tool knows
	if(this.view.portalUrl){
		var ndx = this.view.portalProjectPaths.indexOf(this.projectFilePath);
		if(ndx!=-1){
			this.view.portalProjectId = this.view.portalProjectIds[ndx];
		} else {
			this.view.portalProjectId = undefined;
			this.view.notificationManager.notify('Could not find corresponding portal project id when opening project!', 2);
		};
	};
	
	//if all is set, load project into authoring tool
	if(this.projectFilePath!=null && this.projectFilePath!=""){
		this.view.loadProject(this.view.authoringBaseUrl + this.projectFilePath, this.view.utils.getContentBaseFromFullUrl(this.view.authoringBaseUrl + this.projectFilePath), true);
		this.view.notificationManager.notify('Project successfully reloaded.');
	};
};

/**
 * This displays the results of the cleaning for the portal user. Allows them
 * to continue if no critical problems.
 */
View.prototype.cleaner.sendCleaningResultsToPortal = function(){
	var results = this.getCleaningResults();
	this.view.eventManager.fire('notifyCleaningComplete', results);
};

/**
 * Updates the project meta with a lastCleaned timestamp and pertinent results of
 * the project cleaning.
 */
View.prototype.cleaner.updateProjectMetaFile = function(){
	var success = function(t,x,o){
		o.eventManager.fire('cleanSavingProjectFileComplete', 'true');
	};
	
	var failure = function(t,o){
		o.eventManager.fire('cleanSavingProjectFileComplete', 'true');
	};
	
	var timestampURL = this.view.requestUrl + '?forward=minifier&command=getTimestamp';
	
	var timestampContent = createContent(timestampURL);
	var ts = timestampContent.getContentString();
	
	if(!isNaN(ts)){
		var results = this.getCleaningResults();
		this.view.projectMeta.lastCleaned = {timestamp:parseFloat(ts), results:results};

		//if project meta file exists - update on server
		if(this.view.getProjectMetadata() || this.view.hasProjectMeta){//update file on server
			this.view.connectionManager.request('POST', 1, this.view.requestUrl, {forward:'filemanager', command: 'updateFile', projectId:this.view.portalProjectId, fileName: this.view.utils.getProjectMetaFilename(this.view.getProject().getProjectFilename()), data: $.stringify(this.view.projectMeta)}, success, this.view, failure);
		} else {//create file on server
			//I don't think meta data files are used anymore, all metadata is stored in the portal database
			this.view.connectionManager.request('POST', 1, this.view.requestUrl, {forward:'filemanager', command: 'createFile', projectId:this.view.portalProjectId, fileName: '/' + this.view.utils.getProjectMetaFilename(this.view.getProject().getProjectFilename()), data: $.stringify(this.view.projectMeta)}, success, this.view, failure);
		};
	} else {
		this.view.notificationManager.notify("Did not understand the timestamp response from servlet, cannot update last cleaned field of project meta.");
	};
};

/**
 * Returns an object containing the number and type of each problem severity
 * detected during analysis, along with the number of each resolved.
 */
View.prototype.cleaner.getCleaningResults = function(){
	var severe = this.projectPart.getProblemsBySeverity(3);
	var warning = this.projectPart.getProblemsBySeverity(2);
	var notify = this.projectPart.getProblemsBySeverity(1);
	
	var severeResolved = 0;
	var warningResolved = 0;
	var notificationsResolved = 0;
	
	for(var s=0;s<severe.length;s++){
		if(severe[s].isResolved()){
			severeResolved ++;
		};
	};
	
	for(var t=0;t<warning.length;t++){
		if(warning[t].isResolved()){
			warningResolved ++;
		};
	};
	
	for(var u=0;u<notify.length;u++){
		if(notify[u].isResolved()){
			notificationsResolved ++;
		};
	};
	
	return {severe:{detected:severe.length,resolved:severeResolved},warning:{detected:warning.length,resolved:warningResolved},notification:{detected:notify.length,resolved:notificationsResolved}};
};

/**
 * The project part factory returns the appropriate project part object given
 * the part argument passed in.
 */
View.prototype.cleaner.ProjectPartFactory = {};

/**
 * Returns the project part object based on the given part argument.
 */
View.prototype.cleaner.ProjectPartFactory.getProjectPart = function(part, parent, data, cleaner){
	if(part=='autoStep'){
		return new AutoStep(part, parent, data, cleaner);
	} else if(part=='stepLevelNum'){
		return new StepLevelNum(part, parent, data, cleaner);
	} else if(part=='stepTerm'){
		return new StepTerm(part, parent, data, cleaner);
	} else if(part=='title'){
		return new Title(part, parent, data, cleaner);
	} else if(part=='startPoint'){
		return new StartPoint(part, parent, data, cleaner);
	} else if(part=='nodes'){
		return new ProjectNodes(part, parent, data, cleaner);
	} else if(part=='sequences'){
		return new ProjectSequences(part, parent, data, cleaner);
	} else if(part=='type'){
		return new NodeType(part, parent, data, cleaner);
	} else if(part=='identifier'){
		return new NodeIdentifier(part, parent, data, cleaner);
	} else if(part=='ref'){
		return new NodeRef(part, parent, data, cleaner);
	} else if(part=='previousWorkNodeIds'){
		return new PreviousWork(part, parent, data, cleaner);
	} else if(part=='class'){
		return new NodeClass(part, parent, data, cleaner);
	} else if(part=='view'){
		return new NodeView(part, parent, data, cleaner);
	} else if(part=='refs'){
		return new NodeRefs(part, parent, data, cleaner);
	} else if(part=='links'){
		return new NodeLinks(part, parent, data, cleaner);
	} else if(part=='constraints'){
		return new ProjectConstraints(part, parent, data, cleaner);
	} else {
		return new UnknownPart(part, parent, data, cleaner);
	};
};

/**
 * Gets Array specific project parts.
 */
View.prototype.cleaner.ProjectPartFactory.getProjectArrayPart = function(part, node, cleaner, parent){
	if(part=='sequences'){
		return new SequencePart(node, cleaner, parent);
	} else if(part=='nodes'){
		return new NodePart(node, cleaner, parent);
	} else if(part=='links' || part=='previousWorkNodeIds' || part=='refs'){
		return new StringPart(node, cleaner, parent);
	} else if(part=='constraints'){
		return new ConstraintObjectPart('ConstraintPart', node, cleaner, parent);
	} else {
		return new UnknownPart('UnknownArrayPart', parent, node, cleaner);
	};
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/cleaning/authorview_clean_main.js');
};