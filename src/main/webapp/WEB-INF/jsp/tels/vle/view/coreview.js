/**
 * The core that is common to all views
 */

/**
 * Loads a project into the view by creating a content object using the
 * given url and passing in the given contentBase and lazyLoading as
 * parameters to the project.
 * 
 * @param url
 * @param contentBase
 * @param lazyLoading
 */
View.prototype.loadProject = function(url, contentBase, lazyLoading){
	/* success called when project metadata exists, create project meta content and load project according
	 * to lastEdited and lastMinified times if specified in metadata file */
	var success = function(t,x,view){
		/* parse the text response and set the projectMetadata as JSON */
		var metaContent = createContent();
		metaContent.setContent(t);
		view.setProjectMetadata(metaContent.getContentJSON());
		
		// if o.projectMetadata is undefined, it means project metadata doesn't exist. Load project normally.
		if (!view.getProjectMetadata()) {
			failure(t,view);
			return;
		}
		
		//set the max scores
		var maxScores = view.getProjectMetadata().maxScores;
		
		if(maxScores == null || maxScores == "") {
			//there are no max scores so we will just use an empty JSON array
			maxScores = "[]";
		}
		
		//parse and set the max scores to the this.maxScores variable
		view.processMaxScoresJSON(maxScores);
		
		/* get the lastEdited and lastMinified times */
		var lastEdited = view.getProjectMetadata().lastEdited;
		var lastMinified = view.getProjectMetadata().lastMinified;
		
		/* if both lastEdited and lastMinified exist and it was minified more recently
		 * than edited, then load minified project file, otherwise load project file normally */
		if(lastEdited && lastMinified && (lastEdited < lastMinified) && !(view.name=='authoring' || view.name=='vle')){
			eventManager.fire('loadingProjectStarted');
			
			try {
				//try to load the minified project
				var project = createProject(createContent(url), contentBase, lazyLoading, view, createContent(url.replace(/\.project(.*)\.json/,'.project-min$1.json')));
				view.setProject(project);
			} catch(err) {
				/*
				 * we failed to load the minified project so we will fall back to
				 * the regular project
				 */
				var project = createProject(createContent(url), contentBase, lazyLoading, view);
				view.setProject(project);
			}
			
			view.isLoadedProjectMinified = true;
			eventManager.fire('loadingProjectCompleted');
		} else {
			eventManager.fire('loadingProjectStarted');
			var project = createProject(createContent(url), contentBase, lazyLoading, view);
			view.setProject(project);
			view.isLoadedProjectMinified = false;
			$('#currentProjectContainer').show();
			$('#authoringContainer').show();
			eventManager.fire('loadingProjectCompleted');
		};
	};
	
	/* failure will be called if the project meta data file does not exist, so load project normally */
	var failure = function(t,o){
		o.eventManager.fire('loadingProjectStarted');
		o.project = createProject(createContent(url), contentBase, lazyLoading, o);
		o.isLoadedProjectMinified = false;
		o.eventManager.fire('loadingProjectCompleted');
	};
	
	//get the url that we will use to retrieve the metadata
	var projectMetaDataUrl = this.getConfig().getConfigParam('projectMetaDataUrl');
	
	if (projectMetaDataUrl) {
		//get the project id
		var projectId = this.getProjectId();

		//set the params for the request
		var projectMetaDataUrlParams = {
				command:"getProjectMetaData",
				projectId:projectId
		};
		
		//make the request for the project meta data
		this.connectionManager.request('GET',1,projectMetaDataUrl,projectMetaDataUrlParams,success, this, failure);					
	} else {
		// project metadata does not exist and metadataurl is unspecified so start project normally
		this.eventManager.fire('loadingProjectStarted');
		var project = createProject(createContent(url), contentBase, lazyLoading, this);
		view.setProject(project);
		var projectMetadata = {};
		view.setProjectMetadata(projectMetadata);
		this.isLoadedProjectMinified = false;
		this.eventManager.fire('loadingProjectCompleted');
	}
};

/**
 * Injects the vle url into the given content and returns it.
 */
View.prototype.injectVleUrl = function(content){
	var loc = window.location.toString();
	var vleLoc = loc.substring(0, loc.indexOf('/vle/')) + '/vle/';

	content = content.replace(/(src='|src="|href='|href=")(?!http|\/)/gi, '$1' + vleLoc);
	return content;
};

/**
 * Given a node id, retrieves the appropriate html content object and returns it.
 */
View.prototype.getHTMLContentTemplate = function(node){
	//get the content template for this node
	var content = node.getHTMLContentTemplate();
	
	return content;
};

/**
 * @return the currently loaded project for this view if one exists
 */
View.prototype.getProject = function(){
	var project = null;
	
	if(this.model != null && this.model.getProject) {
		project = this.model.getProject();
	}
	
	return project;
};

/**
 * Set the project
 * @param project the project object
 */
View.prototype.setProject = function(project){
	if(this.model != null && this.model.setProject) {
		this.model.setProject(project);		
	}
};

/**
 * @return the metadata for the project for this view if one exists
 */
View.prototype.getProjectMetadata = function(){
	var projectMetadata = null;
	
	if(this.model != null && this.model.getProjectMetadata) {
		projectMetadata = this.model.getProjectMetadata();
	}
	
	return projectMetadata;
};

/**
 * Set the metadata for the project
 * @param projectMetadata the metadata for the project
 */
View.prototype.setProjectMetadata = function(projectMetadata){
	if(this.model != null && this.model.setProjectMetadata) {
		this.model.setProjectMetadata(projectMetadata);		
	}
};

/**
 * Get the vle state object
 * @return the vle state object
 */
View.prototype.getState = function() {
	var state = null;
	
	if(this.model != null && this.model.getState) {
		state = this.model.getState();
	}
	
	return state;
};

/**
 * Set the student work
 * @param state the student work
 */
View.prototype.setState = function(state) {
	if(this.model != null && this.model.setState) {
		this.model.setState(state);
	}
};

/**
 * Get the vle state objects
 * @return the vle state objects
 */
View.prototype.getStates = function() {
	var states = null;
	
	if(this.model != null && this.model.getStates) {
		states = this.model.getStates();
	}
	
	return states;
};

/**
 * Set the vle states
 * @param states the vle states
 */
View.prototype.setStates = function(states) {
	if(this.model != null && this.model.setStates) {
		this.model.setStates(states);
	}
};

/**
 * Get the annotations
 * @return the annotations
 */
View.prototype.getAnnotations = function() {
	var annotations = null;
	
	if(this.model != null && this.model.getAnnotations) {
		annotations = this.model.getAnnotations();
	}
	
	return annotations;
};

/**
 * Set the annotations
 * @param annotations the annotations
 */
View.prototype.setAnnotations = function(annotations) {
	if(this.model != null && this.model.setAnnotations) {
		this.model.setAnnotations(annotations);
	}
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/coreview.js');
};