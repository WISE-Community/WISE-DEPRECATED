function NavigationLogic(algorithm, view) {
	this.algorithm = algorithm;
	this.view = view;
	this.tagMapConstraintManager = new TagMapConstraintManager(view);
};


/**
 * populates this.visitingOrder array
 * @param {Object} node
 */
NavigationLogic.prototype.findVisitingOrder = function(node) {
	this.visitingOrder.push(node);
	for (var i=0; i < node.children.length; i++) {
		this.findVisitingOrder(node.children[i]);
	}
};

/**
 * Returns the next node in sequence, after the specified currentNode.
 * If currentNode is the last node in the sequence, return null;
 * @param location = path to node in project (i.e. 0.3.7.2)
 */
NavigationLogic.prototype.getNextNode = function(location) {
	if (this.algorithm != null) {
		return this.algorithm.getNextNode(location);
	} else {
		return null;
	}
};

/**
 * Returns the previous node in sequence, before the specified currentNode.
 * If currentNode is the first node in the sequence, return null;
 * @param location = path to node in project (i.e. 0.3.7.2)
 */
NavigationLogic.prototype.getPrevNode = function(location) {
	if (this.algorithm != null) {
		return this.algorithm.getPrevNode(location);
	} else {
		return null;
	}
};

/**
 * Returns the position of the next visitable node in the project. Returns
 * null if there are no visitable nodes after the given location.
 * 
 * @param location
 * @return location
 */
NavigationLogic.prototype.getNextVisitableNode = function(location){
	var nextNodeLoc = this.getNextNode(location);
	while (nextNodeLoc != null && 
			(this.view.getProject().getNodeByPosition(nextNodeLoc).isSequence() ||
			 this.view.getProject().getNodeByPosition(nextNodeLoc).isHiddenFromNavigation())) {
		nextNodeLoc = this.getNextNode(nextNodeLoc);
	}
	
	return nextNodeLoc;
};

/**
 * Returns the position of the next node in the project regardless of
 * whether it is visitable or not. Returns null if there are no nodes 
 * after the given location.
 * @param location the node location e.g. 1.5
 * @return the next node location in the project or null if there
 * is none
 */
NavigationLogic.prototype.getNextStepNodeInProject = function(location){
	//get the next node location
	var nextNodeLoc = this.getNextNode(location);
	
	//loop until we find a node that is not a sequence
	while (nextNodeLoc != null && 
			this.view.getProject().getNodeByPosition(nextNodeLoc).isSequence()) {
		nextNodeLoc = this.getNextNode(nextNodeLoc);
	}
	
	return nextNodeLoc;
};

/**
 * Returns the position of the previous visitable node in the project. Returns
 * null if there are no visitable nodes before the given location.
 * 
 * @param location
 * @return location
 */
NavigationLogic.prototype.getPrevVisitableNode = function(location){
	var prevNodeLoc = this.getPrevNode(location);
	while (prevNodeLoc != null && 
			(this.view.getProject().getNodeByPosition(prevNodeLoc).isSequence() || 
			 this.view.getProject().getNodeByPosition(prevNodeLoc).isHiddenFromNavigation())) {
		prevNodeLoc = this.getPrevNode(prevNodeLoc);
	}
	
	return prevNodeLoc;
};

/**
 * Returns the position of the prev node in the project regardless of
 * whether it is visitable or not. Returns null if there are no nodes 
 * before the given location.
 * @param location the node location e.g. 1.5
 * @return the prev node location in the project or null if there
 * is none
 */
NavigationLogic.prototype.getPrevStepNodeInProject = function(location){
	//get the next node location
	var prevNodeLoc = this.getPrevNode(location);
	
	//loop until we find a node that is not a sequence
	while (prevNodeLoc != null && this.view.getProject().getNodeByPosition(prevNodeLoc).isSequence()) {
		prevNodeLoc = this.getPrevNode(prevNodeLoc);
	}
	
	return prevNodeLoc;
};

/**
 * Add all the global tag map constraints that are not satisfied.
 * This should be called when the vle loads.
 */
NavigationLogic.prototype.addGlobalTagMapConstraints = function() {
	if(this.tagMapConstraintManager != null && !this.view.getConfig().getConfigParam("isConstraintsDisabled")) {
		this.tagMapConstraintManager.addGlobalTagMapConstraints();		
	}
};

/**
 * Add tag map constraints for a node.
 */
NavigationLogic.prototype.addTagMapConstraints = function(nodeId) {
	if(this.tagMapConstraintManager != null && !this.view.getConfig().getConfigParam("isConstraintsDisabled")) {
		this.tagMapConstraintManager.addTagMapConstraints(nodeId);		
	}
};

/**
 * Update the tag map constraints to look for constraints that
 * have been satisfied and therefore removed.
 */
NavigationLogic.prototype.updateActiveTagMapConstraints = function() {
	if(this.tagMapConstraintManager != null && !this.view.getConfig().getConfigParam("isConstraintsDisabled")) {
		this.tagMapConstraintManager.updateActiveTagMapConstraints();		
	}
};

/**
 * Add a tag map constraint.
 */
NavigationLogic.prototype.addActiveTagMapConstraint = function(nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage) {
	if(this.tagMapConstraintManager != null && !this.view.getConfig().getConfigParam("isConstraintsDisabled")) {
		this.tagMapConstraintManager.addActiveTagMapConstraintIfNecessary(nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage);		
	}
};

/**
 * Remove a tag map constraint.
 */
NavigationLogic.prototype.removeActiveTagMapConstraint = function(nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage) {
	if(this.tagMapConstraintManager != null && !this.view.getConfig().getConfigParam("isConstraintsDisabled")) {
		this.tagMapConstraintManager.removeActiveTagMapConstraint(nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage);		
	}
};

/**
 * Process the tag map constraints for the given node
 * @param nodeId the node id
 * @return the results object which contains the fields
 * canMove and message
 */
NavigationLogic.prototype.processTagMapConstraints = function(nodeId) {
	var processTagMapConstraintResults = null;
	
	if(this.tagMapConstraintManager != null && !this.view.getConfig().getConfigParam("isConstraintsDisabled")) {
		processTagMapConstraintResults = this.tagMapConstraintManager.processTagMapConstraints(nodeId);		
	}

	return processTagMapConstraintResults;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/navigation/NavigationLogic.js');
}