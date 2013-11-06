/**
 * Dispatches events specific to the navigation
 */
View.prototype.navigationDispatcher = function(type,args,obj){
	if(type=='loadingProjectCompleted'){
		obj.createNavigationLogicOnProjectLoad();
	} else if(type=='renderNodeCompleted'){
		obj.preloadNextNode(args[0]);
	} else if(type=='processLoadViewStateResponseCompleted'){

	}
};

/**
 * Preloads the next node's content when a node is rendered.
 */
View.prototype.preloadNextNode = function(){
	 /* look ahead and tell the next node to retrieve its content if it exists */
	if(this.navigationLogic){
		var nextNodeLoc = this.navigationLogic.getNextVisitableNode(this.getCurrentPosition());
		
		if(nextNodeLoc){
			this.getProject().getNodeByPosition(nextNodeLoc).preloadContent();
		}
	}
};

/**
 * Creates the navigation logic using the dfs algorithm
 */
View.prototype.updateNavigationLogic = function(){
	this.navigationLogic = new NavigationLogic(new DFS(this.getProject().getRootNode()), this);
};

/**
 * Creates the navigation logic using the dfs algorithm
 */
View.prototype.createNavigationLogicOnProjectLoad = function(){
	this.isNavigationComponentLoaded = true;
	this.updateNavigationLogic();
};

/**
 * Renders the previous node in the sequence if it exists.
 */
View.prototype.renderPrevNode = function() {
	var currentNode = this.getProject().getNodeByPosition(this.currentPosition);
	if(!currentNode){
		currentNode = this.getProject().getRootNode();
	}
	
	if (this.navigationLogic == null) {
		this.notificationManager.notify("nav logic not defined.", 1);
	}
	
	//if current node is note, we are leaving and should 'close' note panel
	if(currentNode.type=='NoteNode'){
		this.utils.closeDialog('notePanel_' + currentNode.id);
	}
	
	//get the current location
	var location = this.getCurrentPosition();
	
	var prevNodeLoc = this.navigationLogic.getPrevVisitableNode(location);
	if (prevNodeLoc == null) {
		/*
		 * there is no prev node or the student is not allowed to visit
		 * any past nodes (perhaps because of navigation constraints)
		 */ 
		this.notificationManager.notify("prevNode does not exist", 1);
		
		/*
		 * try to obtain the prev node in the project and try to render
		 * it so that if the prev node is actually being blocked by a
		 * constraint, we will display the constraint message
		 */
		var prevNode = this.navigationLogic.getPrevStepNodeInProject(location);
		
		//check if there is a prev node in the project
		if(prevNode != null) {
			/*
			 * we will try to render the prev node in the project, this
			 * is just to trigger the constraint message, the node will
			 * not actually be rendered because it is not visitable.
			 * we may run into issues with trying to trigger the constraint
			 * message from nodes that the student isn't ever supposed
			 * to visit if in the future we utilize branching.
			 */
			this.goToNodePosition(prevNode);
		}
	} else {
		this.goToNodePosition(prevNodeLoc);
	}
};

/**
 * Renders the next node visitable node in the project if it exists.
 */
View.prototype.renderNextNode = function() {
	var currentNode = this.getProject().getNodeByPosition(this.getCurrentPosition());
	if(!currentNode){
		currentNode = this.getProject().getRootNode();
	}
	
	if (this.navigationLogic == null) {
		this.notificationManager.notify("No Navigation Logic.", 1);
	}
	
	//if current node is note, we are leaving and should 'close' note panel
	if(currentNode.type=='NoteNode'){
		this.utils.closeDialog('notePanel_' + currentNode.id);
	}
	
	//get the current location
	var location = this.getCurrentPosition();
	
	var nextNodeLoc = this.navigationLogic.getNextVisitableNode(location);
	if (nextNodeLoc == null) {
		/*
		 * there is no next node or the student is not allowed to visit
		 * any future nodes (perhaps because of navigation constraints)
		 */ 
		this.notificationManager.notify("nextNode does not exist", 1);
		
		/*
		 * try to obtain the next node in the project and try to render
		 * it so that if the next node is actually being blocked by a
		 * constraint, we will display the constraint message
		 */
		var nextNode = this.navigationLogic.getNextStepNodeInProject(location);
		
		//get the next node object
		var nextNodeObject = this.getProject().getNodeByPosition(nextNode);
		
		//check if there is a next node in the project that is not hidden
		if(nextNode != null && nextNodeObject != null && !nextNodeObject.isHidden) {
			/*
			 * we will try to render the next node in the project, this
			 * is just to trigger the constraint message, the node will
			 * not actually be rendered because it is not visitable.
			 * we may run into issues with trying to trigger the constraint
			 * message from nodes that the student isn't ever supposed
			 * to visit if in the future we utilize branching.
			 */
			this.goToNodePosition(nextNode);
		}
	} else {
		this.goToNodePosition(nextNodeLoc);
	}
};


/**
 * Add all the global tag map constraints that are not satisfied.
 * This should be called when the vle loads.
 */
View.prototype.addGlobalTagMapConstraints = function() {
	if(this.navigationLogic != null) {
		this.navigationLogic.addGlobalTagMapConstraints();		
	}
};

/**
 * Add tag map constraints for a node.
 */
View.prototype.addTagMapConstraints = function(nodeId) {
	if(this.navigationLogic != null) {
		this.navigationLogic.addTagMapConstraints(nodeId);		
	}
};

/**
 * Update the tag map constraints to look for constraints that
 * have been satisfied and therefore removed.
 */
View.prototype.updateActiveTagMapConstraints = function() {
	if(this.navigationLogic != null) {
		this.navigationLogic.updateActiveTagMapConstraints();		
	}
};

/**
 * Add a tag map constraint.
 */
View.prototype.addActiveTagMapConstraint = function(nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage) {
	if(this.navigationLogic != null) {
		this.navigationLogic.addActiveTagMapConstraint(nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage);
		this.navigationLogic.updateActiveTagMapConstraints();
	}
};

/**
 * Remove a tag map constraint.
 */
View.prototype.removeActiveTagMapConstraint = function(nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage) {
	if(this.navigationLogic != null) {
		this.navigationLogic.removeActiveTagMapConstraint(nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage);		
	}
};

/**
 * Process the tag map constraints for the given node
 * @param nodeId the node id
 * @return the results object which contains the fields
 * canMove and message
 */
View.prototype.processTagMapConstraints = function(nodeId) {
	var processTagMapConstraintResults = null;
	
	if(this.navigationLogic != null) {
		processTagMapConstraintResults = this.navigationLogic.processTagMapConstraints(nodeId);
	}

	return processTagMapConstraintResults;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/vle/vleview_navigation.js');
}