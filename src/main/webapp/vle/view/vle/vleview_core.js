/**
 * Dispatches events to the appropriate functions for the vle view.
 */
View.prototype.vleDispatcher = function(type,args,obj){
	if (type=='retrieveLocalesCompleted' && args[0]=="main") {
		obj.startVLE();
	} else if (type=='retrieveLocalesCompleted' && args[0]=="theme") {
		obj.onThemeLoad();
	} else if(type=='loadingProjectCompleted'){
		obj.onProjectLoad();
		obj.setProjectPostLevel();
		obj.setDialogEvents();
	} else if(type=='scriptsLoaded' && args[0]=='theme'){
		obj.retrieveThemeLocales();
	} else if(type=='getUserAndClassInfoCompleted'){

	} else if(type=='processLoadViewStateResponseCompleted'){
		eventManager.fire('startVLECompleted');
	} else if(type=='navigationLoadingCompleted'){
		obj.populateNodeDependencies();
		obj.setStatuses();
		obj.updateSequenceStatuses();
		obj.processStudentWork();
		obj.addGlobalTagMapConstraints();
		obj.updateActiveTagMapConstraints();
		obj.loadGlobalTagMaps();
	} else if(type=='renderNodeCompleted'){
		if(args){
			obj.renderNodeCompletedListener(args[0]);
		} else {
			obj.renderNodeCompletedListener(null);
		};
	} else if(type=='retrieveAnnotationsCompleted') {
		if(args != null && args.length != 0) {
			if(args[0] == 'checkForNewTeacherAnnotations') {
				obj.checkForNewTeacherAnnotations();
			}
		}
	} else if(type=='retrieveProjectMetaDataCompleted') {
		obj.setProjectPostLevel();
	} else if(type=='retrieveRunExtrasCompleted') {
	} else if(type=='ifrmLoaded'){
		obj.onFrameLoaded();
	} else if(type=='noteEditorKeyPressed'){
		if(obj.activeNote){
			obj.activeNote.responseEdited();
		}
	} else if(type=='contentRenderCompleted') {
		//get the node
		var nodeId = args[0];
		var node = obj.getProject().getNodeById(nodeId);
		
	} else if (type == 'startVLECompleted') {
		obj.renderStartNode();
		if(obj.isRealTimeEnabled) {
			obj.getRunStatus();
		}
		//Get annotations so we can check if there are any new teacher annotations to notify the student about
		obj.retrieveAnnotations('checkForNewTeacherAnnotations');
	} else if (type == 'assetUploaded') {
		obj.assetUploaded(args[0], args[1], args[2]);
	} else if (type == 'assetCopiedForReference') {
		obj.assetCopiedForReference(args[0], args[1]);
	} else if(type=="chatRoomTextEntrySubmitted") {
		obj.sendChat(args[0]);
	} else if(type=="studentWorkUpdated") {
		obj.studentWorkUpdatedListener();
	} else if(type=="currentNodePositionUpdated") {
		obj.currentNodePositionUpdatedListener();
	} else if(type=="nodeLinkClicked") {
		obj.nodeLinkClickedListener(args[0]);
	}

};

/**
 * Renders the navigationPanel. Creates one if one does not yet exist
 */
View.prototype.renderNavigationPanel = function(){
	if(!this.navigationPanel){
		this.navigationPanel = new NavigationPanel(this);	
	};
	this.navigationPanel.render();
};


/**
 * Starts the VLE with the config object retrieved from the given url
 */
View.prototype.startVLEFromConfig = function(configUrl){
	/* create config by creating content object from given url */
	this.config = this.createConfig(createContent(configUrl));
	
	this.eventManager.fire('loadConfigCompleted');

	/* retrieve i18n files, defined in view_i18n.js */
	this.retrieveLocales("main");
};

/**
 * Creates a config object based on the given object and starts the vle.
 * The given object should consist of name:value pairs that correspond to
 * those of the config obj @see config.js
 */
View.prototype.startVLEFromParams = function(obj){
	/* create the content object from the given obj */
	var contentObj = createContent();
	contentObj.setContent(obj);
	
	/* create the config obj using the content obj */
	this.config = this.createConfig(contentObj);
	
	this.eventManager.fire('loadConfigCompleted');

	/* start the vle */
	this.startVLE();
};

/**
 * Uses the config object to start the VLE. Assumes that the config object has been created
 * and set and that the config object contains AT LEAST a content url and content base url.
 */
View.prototype.startVLE = function(){
	this.model = new StudentModel();
	this.setState(new VLE_STATE());
	this.setAnnotations(new Annotations());
	
	/* load the project based on new config object parameters, lazy load */
	this.loadProject(this.config.getConfigParam('getContentUrl'), this.config.getConfigParam('getContentBaseUrl'), true);
	
	//check if real time is enabled
	this.isRealTimeEnabled = this.checkRealTimeEnabled();
};

/**
 * Loads the Global Tools (core VLE feature links [like show all work, flagged, etc] as well as
 * optional components [idea manager, student file uploader, etc]).
 * Optional components are based on project config and overwritten by run config.
 */
View.prototype.displayGlobalTools = function() {
	// Insert show all work link
	var myWorkLink = "<a id='viewMyWorkLink' onclick='eventManager.fire(\"showAllWork\")' title='"+this.getI18NString("mywork_button_title")+"'>"+this.getI18NString("mywork_button_text")+"</a>";
	$('#viewMyWork').html(myWorkLink);
	
	// Insert show flagged work link
	var flaggedLink = "<a id='viewFlaggedLink' onclick='eventManager.fire(\"showFlaggedWork\")' title='"+this.getI18NString("flagged_button_title")+"'>"+this.getI18NString("flagged_button_text")+"</a>";
	$('#viewFlagged').html(flaggedLink);
	
	// Insert navigation toggle
	var toggleNavLink = "<a id='toggleNavLink' onclick='eventManager.fire(\"navigationPanelToggleVisibilityButtonClicked\")' title='"+this.getI18NString("toggle_nav_button_title")+"'>"+this.getI18NString("toggle_nav_button_text")+"</a>";
	$('#toggleNav').html(toggleNavLink);
	
	// Insert previous and next step links 
	var prevNodeLink = "<a id='previousStepLink' onclick='eventManager.fire(\"navigationPanelPrevButtonClicked\")' title='"+this.getI18NString("previous_step_title")+"'></a>";	
	var nextNodeLink = "<a id='nextStepLink' onclick='eventManager.fire(\"navigationPanelNextButtonClicked\")' title='"+this.getI18NString("next_step_title")+"'></a>";
	$('#prevNode').html(prevNodeLink);
	$('#nextNode').html(nextNodeLink);
	
	//get the context path e.g. /wise
	var contextPath = this.getConfig().getConfigParam('contextPath');
	
	// Insert sign out and exit to home links
	var goHomeHref = contextPath + "/student/index.html";
	var userType = this.config.getConfigParam('userType');
	if (userType && userType == "teacher") {
		goHomeHref = contextPath + "/teacher/index.html";
	}
	var signOutLink = '<a id="signOutLink" title="'+this.getI18NString("signout_button_title")+'" onclick="view.logout()">'+this.getI18NString("signout_button_text")+'</a>';
	var exitLink = '<a id="exitLink" target="_parent" title="'+this.getI18NString("gohome_button_title")+'" onclick="window.parent.location=\'' + goHomeHref + '\'">'+this.getI18NString("gohome_button_text")+'</a>';
	$("#signOut").html(signOutLink);
	$("#exit").html(exitLink);
	
	// Insert default text for userNames
	if($('#userNames').html() == ''){
		$('#userNames').html(this.getI18NString("welcome_users_default"));
	}

	var metadata = null;
	var runInfo = null;
	
	//get the metadata if it exists
	if (this.getProjectMetadata() != null && this.getProjectMetadata().tools != null) {
		metadata = this.getProjectMetadata().tools;
	}

	//get the run info if it exists
	var runInfoStr = this.config.getConfigParam('runInfo');
	if (runInfoStr != null && runInfoStr != "") {
		runInfo = JSON.parse(runInfoStr);
	}
	
	//show/hide the top menu buttons
	this.showToolsBasedOnConfigs(metadata, runInfo);
	
	/* get the mode from the config */
	var mode = this.config.getConfigParam('mode');
};

/**
 * Show the buttons in the top menu based on the metadata and runinfo
 * @param metadata the metadata object
 * @param runInfo the runInfo object
 */
View.prototype.showToolsBasedOnConfigs = function(metadata, runInfo) {
	
	var isStudentAssetUploaderEnabled = false;
	
	if(metadata != null) {
		isStudentAssetUploaderEnabled = metadata.isStudentAssetUploaderEnabled;
	}

	if (isStudentAssetUploaderEnabled) {
		/*
		 * display student assets link if run has student asset uploader enabled
		 */
		var studentAssetsLink=	"<a id='viewMyFilesLink' onclick='eventManager.fire(\"viewStudentAssets\",null)' title='View and Upload Files'>"+this.getI18NString("file_button_text")+"</a>";
		$('#viewMyFiles').html(studentAssetsLink);
		$('#viewMyFiles').show().css('display','inline');
	} else {
		$('#viewMyFiles').hide();
	}
	
	var isIdeaManagerEnabled = false;
	
	if(metadata != null) {
		isIdeaManagerEnabled = metadata.isIdeaManagerEnabled;
	}
	
	if (isIdeaManagerEnabled) {
		// display the idea basket links if the run/project has idea basket enabled
		// if project is using IM version > 1, set custom link text based on IM settings
		var basketLinktext = this.getI18NString("ideas_button_text"), addIdeaLinkText = this.getI18NString("addidea_button_text");
		if (this.getProjectMetadata() != null && this.getProjectMetadata().tools != null){
			if('ideaManagerSettings' in this.getProjectMetadata().tools){
				var imSettings = this.getProjectMetadata().tools.ideaManagerSettings;
				if(imSettings.version > 1){
					if('ideaTermPlural' in imSettings && this.utils.isNonWSString(imSettings.ideaTermPlural)){
						basketLinktext = this.utils.capitalize(imSettings.ideaTermPlural);
					}
					if('addIdeaTerm' in imSettings && this.utils.isNonWSString(imSettings.addIdeaTerm)){
						addIdeaLinkText = imSettings.addIdeaTerm;
					}
				}
			}
		}
		var ideaBasketLink = "<a id='viewIdeaBasketLink' onclick='eventManager.fire(\"displayIdeaBasket\")'>"+basketLinktext+" <span id='ideaCount' class='count'>(0)</span></a>";
		var addIdeaLink = "<a id='addIdeaLink' onclick='eventManager.fire(\"displayAddAnIdeaDialog\")'>"+addIdeaLinkText+"</a>";
		$("#viewIdeaBasket").html(ideaBasketLink);
		$("#addIdea").html(addIdeaLink);
		$("#ideaBasketLinks").show().css('display','inline');
	} else {
		$("#ideaBasketLinks").hide();
	}
	
	//Portfolio
	if (metadata != null && metadata.isPortfolioEnabled) {
		// fetch portfolio and display the portfolio links 
		var getPortfolioUrl = this.getConfig().getConfigParam('getPortfolioUrl');
		var extraParams = null;
		this.connectionManager.request('GET', 2, getPortfolioUrl, extraParams, 
				function(responseText, responseXML, view) {
					if (responseText) {
						view.portfolio = new Portfolio(view,responseText);

						var portfolioLinktext = view.getI18NString("portfolio_button_text");
						if (view.getProjectMetadata() != null && view.getProjectMetadata().tools != null){
							if('portfolioSettings' in view.getProjectMetadata().tools){
								var portfolioSettings = view.getProjectMetadata().tools.portfolioSettings;
							}
						}
						var portfolioLink = "<a id='viewPortfolioLink' onclick='eventManager.fire(\"displayPortfolio\")'>"+portfolioLinktext+" </a>";
						$("#viewPortfolio").html(portfolioLink);
						$("#portfolioLinks").show().css('display','inline');

					};
				}, this);
	} else {
		$("#portfolioLinks").hide();
	}
};

/**
 * Loads the theme given theme in the VLE view. Default is the wise theme.
 * @param themeName the name of the theme to load
 */
View.prototype.loadTheme = function(themeName){
	var view = this;
	// set default step icon directory path
	// TODO: remove when glue icon path is resolved; not used anymore - steps specify their own icons
	this.iconUrl = 'images/stepIcons/';
	
	var themeHtml = 'themes/' + themeName.toLowerCase() + '/vle_body.html'; // TODO: remove toLowerCase()
	var context = this;
	
	// inject theme's body.html into vle.html body
	$('#vle_body').load(themeHtml,function(){
		view.displayGlobalTools();
		
		var currentTheme = [themeName.toLowerCase()]; // TODO: remove toLowerCase()
		
		// get navMode
		var navMode = view.navMode = context.getProjectMetadata().navMode;
		if(navMode && context.themeNavModes[themeName].indexOf(navMode)>-1) {
			// navMode is set and is in active navModes list for specified theme, so add to currentTheme
			currentTheme.push(navMode);
		}
		
		/* load scripts for specified theme and navMode */
		scriptloader.loadScripts(currentTheme, document, 'theme', context.eventManager);
		
		if (themeName && themeName == "UCCP") { // TODO: move this to UCCP theme setup
			/* update the project menu links */
			$("#gotoStudentHomePageLink").attr("href","../../moodle/index.php");
			$("#quitAndLogoutLink").attr("href","../index.php");
			$("#goHomeLink").attr("href","../page/index.php");
			$("#myWorkTD").hide();
			$("#flaggedWorkTD").hide();
		} else {
		}
		
		// create and initialize system dialogs
		var constraintsDialog = $('<div id="constraintsDialog"></div>');
		$('#w4_vle').append(constraintsDialog);
		constraintsDialog.dialog({autoOpen:false, modal:true,
			dialogClass: 'alert locked',
			width: 500,
			height: 300,
			buttons: [{text: view.getI18NString("ok"), click: function(){ $(this).dialog('close'); }}]
		});

	});
};

/**
 * Given a user URL, loads learner data for this view and project
 */
View.prototype.loadLearnerData = function(userUrl){
	if (userUrl && userUrl != null) {
		this.loadUserAndClassInfo(createContent(userUrl));
		
		//set the user names in the vle html
		document.getElementById('userNames').innerHTML = this.getI18NString("welcome") + ' ' + this.getUserAndClassInfo().getUserName() + '!';
		
		//get the date
		/*var currentDate = new Date();
		var month = currentDate.getMonth() + 1;
		var day = currentDate.getDate();
		var year = currentDate.getFullYear();*/

		//set the date in the vle at the upper left in format mm/dd/yyyy
		//document.getElementById('dateTime').innerHTML = month + "/" + day + "/" + year;
				
		this.loadVLEState();
	}
};

/**
 * Loads the student's latest work from the last time they worked on it
 * @param dataId the workgroupId
 * @param vle this vle
 */
View.prototype.loadVLEState = function(){
	/* check to see if we need to retrieve all work or if we can get away with an
	 * abbreviated state */
	var getAllWork = false;
	if(this.getProject().containsConstraintNodes() || this.getProject().containsProjectConstraints()){
		getAllWork = true;
	}
	
	if (this.userAndClassInfo && this.userAndClassInfo.getWorkgroupId()) {  
		this.connectionManager.request('GET', 2, this.config.getConfigParam('getStudentDataUrl'), {userId: this.userAndClassInfo.getWorkgroupId(),runId:this.config.getConfigParam('runId'), getAllWork:getAllWork}, this.processLoadViewStateResponse, this);
	} else {
		this.connectionManager.request('GET', 2, this.config.getConfigParam('getStudentDataUrl'), null, this.processLoadViewStateResponse, this);
	}
};


/**
 * Process the response from connection manager's async call to load the state for this view
 */
View.prototype.processLoadViewStateResponse = function(responseText, responseXML, view){
	if (responseText) {
		var viewStateObj = VLE_STATE.prototype.parseDataJSONString(responseText);
		view.setState(viewStateObj);
	};

	view.viewStateLoaded = true;
	view.eventManager.fire('processLoadViewStateResponseCompleted');
};

/**
 * Initialize the statuses for all steps and sequences
 */
View.prototype.setStatuses = function() {
	//get the project
	var project = this.getProject();
	
	//get all the step nodes
	var leafNodes = project.getLeafNodes();
	
	if(leafNodes != null) {
		//loop through all the step nodes
		for(var x=0; x<leafNodes.length; x++) {
			//get the step node
			var leafNode = leafNodes[x];
			var leafNodeId = leafNode.id;
			
			//check that the step is actually used in the project and not an inactive step
			if(this.getProject().getVLEPositionById(leafNodeId) != "NaN") {
				//the step is an active step so we will populate the statuses for this node
				leafNode.populateStatuses(this.getState());
			}
		}		
	}
	
	//get all the sequence nodes
	var sequenceNodes = project.getSequenceNodes();
	
	if(sequenceNodes != null) {
		//loop through all the sequence nodes 
		for(var y=1; y<sequenceNodes.length; y++) {
			//get a sequence node
			var sequenceNode = sequenceNodes[y];
			var sequenceNodeId = sequenceNode.id;
			
			//check that the sequence is actually used in the project and not an inactive sequence
			if(this.getProject().getVLEPositionById(sequenceNodeId) != "NaN") {
				//the sequence is an active sequence so we will populate the statuses for this sequence
				sequenceNode.populateSequenceStatuses(this.getState());
			}
		}
	}
	
	//set this flag to show that the node statuses have been set
	this.statusesSet = true;
};

/**
 * Populate the node dependencies. Nodes may depend on other node's statuses to determine
 * which icon to display. We need to accumulate all the dependencies for a node so that
 * a node knows which other nodes depend on it.
 */
View.prototype.populateNodeDependencies = function() {
	//get the project
	var project = this.getProject();
	
	//get all the step nodes
	var leafNodes = project.getLeafNodes();
	
	if(leafNodes != null) {
		//loop through all the step nodes
		for(var x=0; x<leafNodes.length; x++) {
			//get the step node
			var leafNode = leafNodes[x];
			var leafNodeId = leafNode.id;
			
			//check that the step is actually used in the project and not an inactive step
			if(this.getProject().getVLEPositionById(leafNodeId) != "NaN") {
				//the step is an active step so we will populate the status dependencies for this node
				leafNode.populateNodeStatusDependencies();
			}
		}		
	}
	
	//get all the sequence nodes
	var sequenceNodes = project.getSequenceNodes();
	
	if(sequenceNodes != null) {
		//loop through all the sequence nodes 
		for(var y=1; y<sequenceNodes.length; y++) {
			//get a sequence node
			var sequenceNode = sequenceNodes[y];
			var sequenceNodeId = sequenceNode.id;
			
			//check that the sequence is actually used in the project and not an inactive sequence
			if(this.getProject().getVLEPositionById(sequenceNodeId) != "NaN") {
				//the sequence is an active sequence so we will populate the status dependencies for this sequence
				sequenceNode.populateNodeStatusDependencies();
			}
		}
	}
};

/**
 * Sets the theme based on project parameters.
 */
View.prototype.onProjectLoad = function(){
	this.notificationManager.notify('vleInitializerListener', 4);
	
	/* Set the VLE's current position as the project start position. This will be
	/* overwritten by the state if/when it loads. This ensures that getCurrentPosition
	 * will always return a position. */
	this.currentPosition = this.getProject().getStartNodePosition();
	
	/* load the theme based on project parameters */
	if(this.getProject()){
		var themeName = this.getProjectMetadata().theme;
		
		if(themeName && this.activeThemes.indexOf(themeName)>-1){
			// theme specified by project matches an active theme, so load specified theme
			this.theme = themeName;
			this.loadTheme(themeName);
		} else {
			// either project paramters don't contain a theme or theme specified by project
			// is not active, so load vle default
			this.theme = this.activeThemes[0];
			this.loadTheme(this.activeThemes[0]);
			//this.loadTheme(this.config.getConfigParam('theme'));
		}
	} else {
		this.notificationManager.notify('VLE and project not ready to load theme', 3);
	}
};

View.prototype.retrieveThemeLocales = function(){
	if('theme' in this){
		this.retrieveLocales("theme","vle/themes/" + this.theme + "/i18n/");
	} else {
		this.onThemeLoad();
	}
};

/**
 * Sets the values of html elements based on the loaded project's attributes
 * and creates the necessary values for fields for components that have
 * been loaded.
 */
View.prototype.onThemeLoad = function(){
	
	/* set html elements' values */
	if(this.getProject()){
		//display the title of the project in the runTitle div
		if(this.getProject().getTitle() != null) {
			$('#runTitle').html(this.getProject().getTitle());
			document.title = this.getProject().getTitle();
			
			if (window.parent) {
				window.parent.document.title = window.parent.document.title + ": " + this.getProject().getTitle();
			}
		}
		
		// insert menu into vle DOM
		var navigationHtml = "<div id='my_menu' class='wmenu'></div>";
		$("#navigation").prepend(navigationHtml);
	} else {
		this.notificationManager.notify('VLE and project not ready to load any nodes', 3);
	}
	
	/* load learner data based on config object parameters */
	if (this.config.getConfigParam('mode') == "run") {
		this.notificationManager.notify('vleConfig.mode is run, getUserInfoUrl:' + this.config.getConfigParam('getUserInfoUrl'), 4);
		this.loadLearnerData(this.config.getConfigParam('getUserInfoUrl'));
	} else if (this.config.getConfigParam('mode') == "portalpreview") {
		//if preview mode, only get the user and class info and not learner data
		this.loadUserAndClassInfo(null);  // in preview mode, user and class info object is an empty object.
		
		//get the context path e.g. /wise
		var contextPath = this.getConfig().getConfigParam('contextPath');
		
		/* if (TODO: check for any constraints in project) {*/
			// we are in preview mode (and the project contains constraints)
			var path = contextPath + '/previewproject.html?projectId=' + this.getProjectMetadata().projectId;
			if(this.getConfig().getConfigParam("isConstraintsDisabled")){
				// constraints are disabled, so show enable constraints link
				//this.notificationManager.notify('Student navigation constraints are currently disabled. To preview project with all constraints, <a href="' + path + '">click here</a>.', 3, 'keepMsg');
				this.notificationManager.notify(this.getI18NString("preview_project_constraint_disabled_message","main") + ' <a href="' + path + '">'+this.getI18NString("common_click_here","main")+'</a>.', 3, 'keepMsg');
			} else {
				// constraints are enabled, so show disable constraints link
				path += '&isConstraintsDisabled=true';
				this.notificationManager.notify(this.getI18NString("preview_project_constraint_enabled_message","main") + ' <a href="' + path + '">'+this.getI18NString("common_click_here","main")+'</a>.', 3, 'keepMsg');
			}
		//}
		this.eventManager.fire('startVLECompleted');
	}
	
	if(this.config.getConfigParam('mode') == "portalpreview") {
		//we are previewing the project so we will create a dummy idea basket
		var imSettings = null;
		if(this.getProjectMetadata().tools && 'ideaManagerSettings' in this.getProjectMetadata().tools){
			imSettings = this.getProjectMetadata().tools.ideaManagerSettings;
		}
		this.ideaBasket = new IdeaBasket('{"ideas":[],"deleted":[],"nextIdeaId":1,"id":-1,"runId":-1,"workgroupId":-1,"projectId":-1}',null,null,imSettings);
	}
};

/**
 * renderStartNode will render the start node when:
 * 
 * case1: authoring tool preview (stand alone mode)
 * 	 - renders the start node as soon as the project is loaded
 * case2: authoring tool preview (portal mode) || portal preview
 *   - renders the start node when project is loaded and retrieves user and class info
 * case3: student run
 * 	 - renders the start node when project is loaded, user and class info is loaded and retrieves learner data
 * 
 * AND if the navigation component is present will only render when it is also loaded.
 */
View.prototype.renderStartNode = function(){
	
	/* get the mode from the config */
	var mode = this.config.getConfigParam('mode');

	var startPos = null;
	
	/* check to see if we can render the start node based on the current state of loading */
	if(this.canRenderStartNode(mode) && this.isAnyNavigationLoadingCompleted()){
		var currentNodeVisit = this.getState().getCurrentNodeVisit();
		
		/* If we are in run mode, and the user has previously run the project we want to get
		 * the position of the last step they visited, otherwise, just render the first node
		 * in the project. */
		if(mode == 'run' && (typeof this.getState() != 'undefined') && currentNodeVisit){
			
			/* check to see if the currentNodeVisit has a duplicateId - meaning that
			 * it was last rendered by a DuplicateNode so we would want to render at
			 * the position of the duplicate node instead */
			if(currentNodeVisit.duplicateId){
				var node = this.getProject().getNodeById(currentNodeVisit.duplicateId);
			} else {
				var node = this.getProject().getNodeById(currentNodeVisit.nodeId);
			}
			
			startPos = this.getProject().getPositionById(node.id);
			
			/*
			 * if we could not find the startPos we will just render
			 * the first step in the project. this can occur when an
			 * author deletes a step during a run in which case the
			 * step the student was last on, no longer exists.
			 */
			if(startPos == null) {
				startPos = this.getProject().getStartNodePosition();
			}
		} else if(mode == 'portalpreview') {
			//we are previewing a project
			
			//try obtain a step to load for the preview if any
			var step = this.config.getConfigParam('step');
			
			if(step != null) {
				//the step was specified in the url as a param so we will try to load that step
				
				/*
				 * get the step position from the step number. step numbers
				 * start at 1 but step positions start at 0. so a step number
				 * of 1.1 would have a step position of 0.0
				 */
				var stepPosition = this.getStepPositionFromStepNumber(step);
				
				startPos = stepPosition;
				
				//try to get the node at the position
				var node = this.getProject().getNodeByPosition(stepPosition);
				
				if(node == null) {
					//the node does not exist which means there is no step at the given step number
					alert('Error: Step ' + step + ' does not exist');
					
					//just load the first step in the project
					startPos = this.getProject().getStartNodePosition();
				}
			} else {
				//step was not specified so we will just load the first step in the project
				startPos = this.getProject().getStartNodePosition();
			}
		} else {
			startPos = this.getProject().getStartNodePosition();
		}
		
		/* render if start position has been set */
		if(startPos != null){
			/* since this is the first node rendered, we want to set the VLE's current
			 * position to be the same as the startPos so that getStartPosition will always
			 * return a value.*/
			this.currentPosition = startPos;
			
			/* render start node */
			this.goToNodePosition(startPos);
		}		
	};
};

/**
 * Given the mode, returns true if the necessary components for that mode
 * are loaded, returns false otherwise.
 * 
 * @param mode
 * @return boolean
 */
View.prototype.canRenderStartNode = function(mode){
	switch (mode){
	case 'run':
		return this.getProject() != null && this.userAndClassInfoLoaded && this.viewStateLoaded;
	case 'portalpreview':
		return this.getProject() != null && this.userAndClassInfoLoaded;
	case 'standaloneauthorpreview':
		return this.getProject() != null;
	case 'developerpreview':
		return this.getProject() != null;
	default:
		throw 'Provided MODE is not supported. Unable to continue.';
	}
};

/**
 * Returns false if the navigation component is present and IS NOT loaded, returns
 * true otherwise.
 */
View.prototype.isAnyNavigationLoadingCompleted = function(){
	if(this.isNavigationComponentPresent && !this.isNavigationComponentLoaded){
		return false;
	}
	
	return true;
};

/**
 * Handles cleanup of previously rendered node, specified by position argument.
 * Save nodevisit state for current position, close popups, remove highlighted steps, etc.
 */
View.prototype.endCurrentNode = function(){
	/* ensures that only one popup (any notes) is open at any given time */
	this.utils.closeDialogs();
	
	var currentNode = null;
	
	//get the current node we are on
	var currentNodeVisit = this.getState().getCurrentNodeVisit();
	if(currentNodeVisit != null) {
		currentNode = this.getProject().getNodeById(currentNodeVisit.nodeId);		
	}
	
	/* tell previous step (if exists) to clean up */ 
	if(currentNode) {
		//get the node id
		var nodeId = currentNode.id;
		
		//remove the bubble and remove the highlight for the step the student is now visiting
		eventManager.fire('removeMenuBubble', [nodeId]);
		eventManager.fire('unhighlightStepInMenu', [nodeId]);

		if(this.getState()) {
			this.getState().endCurrentNodeVisit();  // set endtime, etc.	
		}
		
		currentNode.onExit();
	};
	
	//close the show all work popup
	$('#showallwork').dialog('close');
	
	var sync = false;

	// save all unsaved nodes asynchronously
	this.postAllUnsavedNodeVisits(sync);
};

/**
 * Handles setting/adjusting of html elements after a node has rendered
 */
View.prototype.renderNodeCompletedListener = function(position){
	this.currentNode = this.getProject().getNodeByPosition(position);
	
	/* Set icon in nav bar */
	if(this.currentNode.getNodeClass() && this.currentNode.getNodeClass()!='null' && this.currentNode.getNodeClass()!=''){
		//get the node type
		var nodeType = this.currentNode.type;
		
		//get the node class
		var nodeClass = this.currentNode.getNodeClass();
		
		//get the step icon
		var iconPath = this.getIconPathFromNodeTypeNodeClass(nodeType, nodeClass);
		
		$('#stepIcon').html('<img src="' + iconPath + '" alt="step icon" />');
	}
	
	/* set title in nav bar */
    $('#stepTitle').html(this.currentNode.getTitle());
    
	this.displayHint();  // display hint for the current step, if any
	
	this.displayNodeAnnotation(this.currentNode.id);  // display annotation for the current step, if any
	
	// remove any content overlays (if previous node was a note)
	if(this.currentNode.getType() && this.currentNode.getType() != 'NoteNode'){
		$('#contentOverlay',$('#ifrm')[0].contentWindow.document).remove();
		
		// reset note dialog title
		var title = this.getI18NString("note_title");
		$('#notePanel').dialog({
			title: title
		});
	}
	
	this.currentNode.setStatus('isVisited', true);
	
	this.eventManager.fire("navNodeRendered",this.currentNode);
};

/**
 * Renders the node at the given position in the vle view
 * RenderNode lifecycle:
 * 1. Check (e.g. constraints) to see if user can move to the specified position
 * 2. Prepare to move to the specified position. save nodevisit state for current position, close popups, remove highlighted steps, etc.
 * 3. Do the actual rendering of the new node
 * 4. Render Node Complete.
 */
View.prototype.renderNode = function(position){
	this.notificationManager.notify('rendering node, pos: ' + position,4);
	
    var nodeToVisit = null;
    if (position == null) {
		if (this.getState().visitedNodes.length > 0) {
			nodeToVisit = this.getState().visitedNodes[this.getState().visitedNodes.length - 1];
			this.currentPosition = this.getProject().getPositionById(nodeToVisit.id);
		};
    } else {
        nodeToVisit = this.getProject().getNodeByPosition(position);
        this.currentPosition = position;
    }
	
	if (nodeToVisit == null) {
		this.notificationManager.notify("VLE: nodeToVisit is null Exception. Exiting", 3);
		alert('Error: Step does not exist');
		return;
	}
	
	var studentWork = this.getStudentWorkForNodeId(nodeToVisit.id);
	
	/* set this node as current node visit */
	this.getState().setCurrentNodeVisit(nodeToVisit);
	nodeToVisit.render(null, studentWork, status.value);
	
	this.eventManager.fire('renderNodeCompleted', this.currentPosition);
	
	//update the active tag map constraints to see if any have been satisfied and we need to remove any
	this.updateActiveTagMapConstraints();
};

/**
 * Returns the node that the user is currently viewing.
 */
View.prototype.getCurrentNode = function(){
	return this.getProject().getNodeByPosition(this.currentPosition);
};

/**
 * Returns the current node position
 */
View.prototype.getCurrentPosition = function(){
	return this.currentPosition;
};

/**
 * Sets the projects post level based on the current state of the vle view
 */
View.prototype.setProjectPostLevel = function(){
	var project = this.getProject();
	if(project && this.config && this.config.getConfigParam('postLevel')){
		project.setPostLevel(this.config.getConfigParam('postLevel'));
	} else if(project && this.getProjectMetadata() && this.getProjectMetadata().postLevel){
		project.setPostLevel(this.getProjectMetadata().postLevel);
	}
};

/**
 * Calls the create keystroke manager for the node that just rendered in a frame
 */
View.prototype.createKeystrokeManagerForFrame = function(){
	var node = this.getProject().getNodeById(window.frames['ifrm'].nodeId);
	
	if(node){
		node.createKeystrokeManager();
	}
};

View.prototype.onFrameLoaded = function(){
	//get the position in the project
	var position = this.getCurrentPosition();
	
	if(position == null) {
		/*
		 * the position is set to the first step in the project or the last step
		 * the student was on, so if the position is null, it means there are no 
		 * steps in the project.
		 * 
		 */
		alert(this.getI18NString("project_error_has_no_steps","main"));
		
		//close the loading learning environment popup message
		$('#loading').dialog('close');
	} else {
		//we have a position
		var node = this.getProject().getNodeByPosition(position);
		
		if(node != null) {
			//check if this node is a mirror/duplicate node
			if(node.type == 'DuplicateNode') {
				//get the real node this duplicate node points to 
				node = node.realNode;
			}
			
			//set the event manager into the content panel so the html has access to it
			if(node.contentPanel){
				node.contentPanel.eventManager = this.eventManager;
				node.contentPanel.nodeId = node.id;
				node.contentPanel.node = node;
				node.contentPanel.scriptloader = this.scriptloader;
			}
			
			this.eventManager.fire('pageRenderCompleted', node.id);	
		}
	}
};

/**
 * Imports (copy and paste) work from specified node to specified node
 */
View.prototype.importWork = function(fromNodeId,toNodeId) {
	var fromNode = this.getProject().getNodeById(fromNodeId);
	var toNode = this.getProject().getNodeById(toNodeId);

	toNode.importWork(fromNode);
};

/**
 * Sets default actions for jQuery UI dialog events:
 * 1: Solves dialog drag/resize problems caused by iframes in the vle
 * 2: Ensures that dialogs appear above any embedded applets in node content (not functional yet, so disabling - no effect in Firefox 3.6/Chrome Mac)
 */
View.prototype.setDialogEvents = function() {
	// create iframe shim under dialog when opened
	// Inspired by Dave Willkomm's Shim jQuery plug-in: http://sourceforge.net/projects/jqueryshim/ (copyright 2010, MIT License: http://www.opensource.org/licenses/mit-license.php)
	/*$('.ui-dialog').on("dialogopen", function(event, ui) {
		var element = $(this),
			offset = element.offset(),
			zIndex = element.css('z-index') - 2;
			html = '<iframe class="shim" frameborder="0" style="' +
				'display: block;'+
				'position: absolute;' +
				'top:' + offset.top + 'px;' +
				'left:' + offset.left + 'px;' +
				'width:' + element.outerWidth() + 'px;' +
				'height:' + element.outerHeight() + 'px;' +
				'z-index:' + zIndex + ';' +
				'"/>';
	
		element.before(html);
		
		var applet = $("#ifrm").contents().find("applet");
		applet.after(html);
		
	});
	
	// remove iframe shim under dialog when closed
	$('.ui-dialog').on("dialogclose", function(event, ui) {
		$(this).prev("iframe.shim").remove();
	});*/
	
	// show transparent overlay div under dialog when drag/resize is initiated
	$('.ui-dialog').on("dialogresizestart dialogdragstart", function(event, ui) {
		$('body').append('<div id="vleOverlay></div>');
		var zIndex = $(this).css('z-index') - 1;
		$('#vleOverlay').css('z-index',zIndex);
	});
	
	// adjust iframe shim dimensions and position when dragging/resizing dialog
	/*$('.ui-dialog').on("dialogresize dialogdrag", function(event, ui) {
		
	});*/
	
	// hide transparent overlay div under dialog when drag/resize is initiated
	$('.ui-dialog').on("dialogresizestop dialogdragstop", function(event, ui) {
		$('#vleOverlay').remove();
	});
};

/**
 * Process all the work for each step and perform any
 * special processing if necessary. For example, show a gold
 * star for the steps that the student successfully completed.
 */
View.prototype.processStudentWork = function() {
	//make sure the student work has been loaded
	if(this.viewStateLoaded) {
		//get all the node ids in the project
		var nodeIds = this.getProject().getNodeIds();

		//loop through all the node ids
		for(var x=0; x<nodeIds.length; x++) {
			//get a node id
			var nodeId = nodeIds[x];
			
			//get a node
			var node = this.getProject().getNodeById(nodeId);
			
			//get the node visits for the node
			var nodeVisits = this.getState().getNodeVisitsByNodeId(nodeId);
			
			if(nodeVisits != null) {
				//process the student work for the node
				node.processStudentWork(nodeVisits);
			}
		}
	}
};

/**
 * Set the step icon in that navigation
 * @param nodeId (optional) the node id to set the step icon for
 * @param stepIconPath (optional) the path to the new icon
 */
View.prototype.setStepIcon = function(nodeId, stepIconPath) {
	this.navigationPanel.setStepIcon(nodeId, stepIconPath);
};

/**
 * Go to the new node position if possible. The new node position may
 * be disabled due to a constraint in which case we will not be able
 * to go to the new node position.
 * @param nodePosition the new node position to go to
 */
View.prototype.goToNodePosition = function(nodePosition) {
	//get the next node id
	var project = this.getProject(),
		nextNode = project.getNodeByPosition(nodePosition),
		nextNodeId = nextNode.id;
	
	//perform any tag map processing
	var processTagMapConstraintResults = this.processTagMapConstraints(nextNodeId);
	
	if(processTagMapConstraintResults != null) {
		if(processTagMapConstraintResults.canMove == false) {
			/*
			 * the student is not allowed to move to the next node
			 * so we will display a message telling them so and also
			 * prevent the next node from being rendered so that they
			 * stay on the current node they are already on
			 */
			var messages = {},
				constraintHtml = '',
				title = this.getI18NString('constraint_dialog_title'),
				constraints = processTagMapConstraintResults.activeConstraints;
			
			for(var i=0; i<constraints.length; i++){
				var constraint = constraints[i],
					message = constraint.message,
					nodesFailed = constraint.nodesFailed;
				if(!messages.hasOwnProperty(constraint.message)){
					messages[message] = nodesFailed;
				} else {
					messages[message] = messages[message].concat(nodesFailed);
				}
			}
			
			for(var key in messages){
				var nodes = messages[key];
				constraintHtml += '<div class="constraintMessage"><h3>' + key + '</h3>';
				if(nodes.length > 0){
					constraintHtml += '<ul>';
					for(var x=0; x<nodes.length; x++){
						// TODO: add "(all items)" to activities; put in order of project sequence
						var isSequence = project.getNodeById(nodes[x]).isSequence(),
							nodeText = this.getFullNodeName(nodes[x]) + (isSequence ? ' ' + this.getI18NString('constraint_allItems') : '');
						constraintHtml += '<li>' + nodeText + '</li>';
					}
					constraintHtml += '</ul></div>';
				}
			}
			//alert(message);
			$('#constraintsDialog').html(constraintHtml).dialog('option', 'title', title).dialog('open');
			this.eventManager.fire('renderNodeBlocked', nextNode);
			return;
		}
	}
	
	//get the next node id
	var nextNode = this.getProject().getNodeByPosition(nodePosition);
	var nextNodeId = nextNode.id;
	
	//add any tag map constraints for the next node we are about to visit
	this.addTagMapConstraints(nextNodeId);
	
	//get the node
	var node = this.getProject().getNodeByPosition(nodePosition);
	
	//get the previous node
	var prevNode = this.getProject().getNodeByPosition(this.model.getCurrentNodePosition());
	
	// if the previous node has exit restrictions set, return without rendering new node
	if(prevNode != null && !prevNode.canExit()){
		return;
	}
	
	// Prepare to move to the specified position. 
	// Save nodevisit state for current position, close popups, remove highlighted steps, etc.
	this.endCurrentNode();
	
	//we are able to go to the new node position so we will set it as the current node position
	this.setCurrentNodePosition(nodePosition);
};

/**
 * Set the current node position into the model
 */
View.prototype.setCurrentNodePosition = function(nodePosition) {
	this.model.setCurrentNodePosition(nodePosition);
};

/**
 * Listens for the currentNodePositionUpdated event
 */
View.prototype.currentNodePositionUpdatedListener = function() {
	//render the node at the current node position
	this.renderNode(this.model.getCurrentNodePosition());
};

/**
 * Listens for the nodeLinkClicked event
 * @param nodePosition the node position to go to
 */
View.prototype.nodeLinkClickedListener = function(nodePosition) {
	this.goToNodePosition(nodePosition)
};

/**
 * Listens for the navigationLoadingCompleted event
 * 
 * @param type the name of the event
 * @param args the arguments provided when the event was fired
 * @param obj the view object
 */
View.prototype.navigationLoadingCompletedListener = function(type, args, obj) {
	
};

/**
 * Update the sequence statuses based on the status of the steps
 * within the sequences
 */
View.prototype.updateSequenceStatuses = function() {
	//get all the sequence nodes
	var sequenceNodes = this.getProject().getSequenceNodes();
	
	//loop through all the sequence nodes except the master sequence
	for(var x=1; x<sequenceNodes.length; x++) {
		var isCompleted = false;
		var isVisited = false;
		var isVisitable = false;
		
		//whether we have initialized the values above
		var valuesInitialized = false;
		
		//get a sequence node
		var sequenceNode = sequenceNodes[x];
		
		//get all the steps in the sequence
		var nodeIdsInSequence = this.getProject().getNodeIdsInSequence(sequenceNode.id);
		
		//loop through all the steps in the sequence
		for(var y=0; y<nodeIdsInSequence.length; y++) {
			//get a step
			var nodeId = nodeIdsInSequence[y];
			var node = this.getProject().getNodeById(nodeId);

			//get the status values
			var nodeIsCompleted = node.getStatus('isCompleted');
			var nodeIsVisited = node.getStatus('isVisited');
			var nodeIsVisitable = node.getStatus('isVisitable');
			
			if(valuesInitialized) {
				/*
				 * we have initialized the values for this sequence so we will accumulate
				 * the values
				 */
				isCompleted = isCompleted && nodeIsCompleted;
				isVisited = isVisited || nodeIsVisited;
				isVisitable = isVisitable || nodeIsVisitable;
			} else {
				/*
				 * we have not initialized the values for this sequence so we will use
				 * these values
				 */
				isCompleted = nodeIsCompleted;
				isVisited = nodeIsVisited;
				isVisitable = nodeIsVisitable;
				valuesInitialized = true;
			}
		}
		
		//set the status values
		sequenceNode.setStatus('isCompleted', isCompleted);
		sequenceNode.setStatus('isVisited', isVisited);
		sequenceNode.setStatus('isVisitable', isVisitable);
	}
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/vle/vleview_core.js');
}