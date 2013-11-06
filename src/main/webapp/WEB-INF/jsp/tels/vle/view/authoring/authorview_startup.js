/**
 * @author patrick lawler
 * @author jonathan breitbart
 */

/**
 * Sets variables so that the authoring tool is running in portal mode
 * and starts authoring tool in appropriate state.
 */
View.prototype.startPortalMode = function(url, command, relativeProjectUrl, projectId, projectTitle, editPremadeComments){
	this.portalUrl = url;
	/*
	 * this editingPollInterval is used to check who is also currently editing the
	 * project. this was never actually used because stopEditingInterval() used
	 * to be called at the beginning of loading the authoring tool because of
	 * a bug. if this editingPollInterval is actually used, it throws server
	 * side errors so I have commented it out. the authoring tool still checks
	 * and displays who is also currently authoring the project when the project 
	 * is initially loaded just like before.
	 */
	//this.editingPollInterval = setInterval('eventManager.fire("whoIsEditing")', this.EDITING_POLL_TIME);
	this.authoringBaseUrl = this.portalUrl + '?forward=filemanager&command=retrieveFile&fileName=';
	this.requestUrl = this.portalUrl;
	this.assetRequestUrl = this.portalUrl;
	this.minifierUrl = this.portalUrl;
	this.mode = "portal";
	this.authoringMode = true;
	
	this.model = new AuthoringModel();

	//create the config url
	var configUrl = this.portalUrl + "?command=getConfig";
	
	//create the config
	this.config = this.createConfig(createContent(configUrl));
	this.eventManager.fire('loadConfigCompleted');
	
	/* retrieve i18n files, defined in view_i18n.js */
	this.retrieveLocales("main");


	if(this.config != null) {
		//set some variables from values in the config
		this.portalUsername = this.config.getConfigParam("username");
		this.vlewrapperBaseUrl = this.config.getConfigParam("vlewrapperBaseUrl");
	}
	
	if(command && command!=''){
		if(command=='cleanProject'){
			this.cleanMode = true;
		}
		
		if(command=='createProject'){
			this.createMode = true;
		} else if(command=='editProject' || command=='cleanProject'){
			this.portalProjectId = parseInt(projectId);
			this.authoringBaseUrl = this.portalUrl + '?forward=filemanager&projectId=' + this.portalProjectId + '&command=retrieveFile&fileName=';
			
			//get the project file name
			var projectFileName = relativeProjectUrl.substring(relativeProjectUrl.lastIndexOf("/"));
			
			//get the url for the project file
			var projectFileUrl = this.authoringBaseUrl + projectFileName;
			
			//get the url for the project folder
			var projectFolderUrl = this.authoringBaseUrl;
			
			this.loadProject(projectFileUrl, projectFolderUrl, true);
		}
	}
	
	if(editPremadeComments == "true") {
		//we are only loading the authoring tool so that we can open the premade comments
		view.openPremadeComments();
		
		if(window.parent != null && window.parent.parent != null && window.parent.parent.closeLoadingPremadeCommentsDialog != null) {
			//close the loading premade comments message
			window.parent.parent.closeLoadingPremadeCommentsDialog();			
		}
		
		//we will exit this function since we don't need to really load the rest of the authoring tool
		return;
	}
	
	//load the template files for all the step types
	this.loadNodeTemplateFiles();
	
	this.onAuthoringToolReady();
	
	/* launch create project dialog if create mode has been set */
	if(this.createMode){
		this.createNewProject();
	}
	
	/* enable the edit project tags  (only available in portal mode) */
	//$('#editProjectTagsMenu').show();
};

/**
 * Load the template files for all the step types
 */
View.prototype.loadNodeTemplateFiles = function() {
	//get all the node types
	var nodeTypes = NodeFactory.getNodeTypes();
	
	//loop through all the node types
	for(var x=0; x<nodeTypes.length; x++) {
		//get a node type
		var nodeType = nodeTypes[x];
		
		//get the node template params
		var nodeTemplateParams = this.nodeTemplateParams[nodeType];
		
		if(nodeTemplateParams != null) {
			
			for(var y=0; y<nodeTemplateParams.length; y++) {
				var nodeTemplateParam = nodeTemplateParams[y];
				
				//get the path to the template file for this node type
				var nodeTemplateFilePath = nodeTemplateParam.nodeTemplateFilePath;
				
				//get the file extension for this node type
				var nodeExtension = nodeTemplateParam.nodeExtension;
				
				if(nodeTemplateFilePath != null) {
					//create a content object for the template file
					var templateContent = createContent(nodeTemplateFilePath);
					
					//set the content into the nodeTemplateParam object
					nodeTemplateParam.nodeTemplateContent = templateContent.getContentString();
				}		
			}
		}
	}
};

/**
 * Creates a project of the given name with the given path in the portal. The
 * folder and files have already been created, we are just registering the project
 * with the portal here.
 * @path path to the newly created project, this path should contain the project folder
 * e.g.
 * /523/wise4.project.json
 */
View.prototype.createPortalProject = function(path, name, parentProjectId){
	/*
	 * get the project file name
	 * e.g.
	 * /wise4.project.json 
	 */
	var projectFileName = path.substring(path.lastIndexOf("/"));
	
	var handler = function(responseText, responseXML, o){
		if(responseText){
			o.portalProjectId = responseText;
			o.authoringBaseUrl = o.portalUrl + '?forward=filemanager&projectId=' + o.portalProjectId + '&command=retrieveFile&fileName=';
				
			/* load the newly created project */
			o.loadProject(o.authoringBaseUrl + projectFileName, o.authoringBaseUrl, false);
		} else {
			o.notificationManager.notify('failed to create project in portal', 3);
		};
	};
	
	this.connectionManager.request('POST', 3, this.portalUrl, {command: 'createProject', projectName: name, projectPath:path, parentProjectId: parentProjectId}, handler, this);
};

/**
 * Retrieves and parses settings.xml file for project paths, primaryPath locations.
 * NOTE: I don't think this function is used anymore
 */
View.prototype.getProjectPaths = function(){
	var callback = function(text, xml, o){
		var settingsJSON = $.parseJSON(text);
		if(settingsJSON){
			/* get the mode that the authoring tool is to run in (portal/standalone) */
			if(settingsJSON.mode && settingsJSON.mode.portal && settingsJSON.mode.portalUrl) {
				var rawLoc = window.location.toString();
				var loginUrl = rawLoc.substring(0,rawLoc.indexOf('/vlewrapper/vle/author.html')) + settingsJSON.mode.portalUrl + '?redirect=/author/authorproject.html';
				window.location = loginUrl;
			}
			
			if(settingsJSON.projectPaths) {
				for(var u=0;u<settingsJSON.projectPaths.length;u++){
					if(settingsJSON.projectPaths[u]){
						o.projectPaths += settingsJSON.projectPaths[u];
						if(u!=settingsJSON.projectPaths.length-1){
							o.projectPaths += '~';
						}
					}
				}
			}
			
			if(settingsJSON.primaryPath) {
				o.primaryPath = settingsJSON.primaryPath;
				o.projectPaths += '~' + settingsJSON.primaryPath;
			} else {
				o.notificationManager.notify("Error: Primary Path not specified in settings.json");
			}
			
		} else {
			o.notificationManager.notify("Error retrieving settings", 3);
		}
		
		o.onAuthoringToolReady();
	};

	this.connectionManager.request('GET', 1, 'settings.json', null, callback, this);
};

/**
 * Attempts to retrieve the current user's username from the portal
 */
View.prototype.getPortalUsername = function(){
	if(this.portalUrl){
		this.connectionManager.request('POST', 1, this.portalUrl, {command: 'getUsername'}, this.getUsernameSuccess, this);
	};
};

/**
 * Sets this view's username if successfully retrieved from the portal
 */
View.prototype.getUsernameSuccess = function(t,x,o){
	if(t && t!=''){
		o.portalUsername = t;
	};
};

/**
 * Request the curriculum base url
 */
View.prototype.getCurriculumBaseUrl = function(){
	if(this.portalUrl){
		this.connectionManager.request('POST', 1, this.portalUrl, {command: 'getCurriculumBaseUrl'}, this.getCurriculumBaseUrlSuccess, this);
	};
};

/**
 * Called when we receive the response from the curriculum base url request
 * @param t
 * @param x
 * @param o
 * @return
 */
View.prototype.getCurriculumBaseUrlSuccess = function(t,x,o){
	if(t && t!=''){
		//set the vlewrapper base url into the view
		o.vlewrapperBaseUrl = t;
		
		//set the authoring mode to true in the view
		o.authoringMode = true;
	};
};

/**
 * Removes the splash screen and shows the authoring tool when all
 * necessary parts have loaded.  Inserts i18n translations.
 */
View.prototype.onAuthoringToolReady = function(){
	var view = this;
	notificationManager.setMode('authoring');
	$('#centeredDiv').show();
	$('#coverDiv').hide();
	$('#overlay').hide();
	
	// insert i18n text and tooltips/help items into DOM
	this.insertTranslations("main", function(){ view.insertTooltips(); });
	//clearInterval(window.loadingInterval);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/authorview_startup.js');
};