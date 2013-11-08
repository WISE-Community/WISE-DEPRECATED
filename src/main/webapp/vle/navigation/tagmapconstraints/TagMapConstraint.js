/**
 * Creates a tag map constraint
 * @param view the view
 * @param nodeId the node id that this constraint is for
 * @param tagName (optional) the tag name used to identify which
 * other nodes that are used in this tag map 
 * @param functionName the name of the tag map function
 * @param functionArgs (optional) an array that contains tag map function args set
 * by the author of the project
 * @param additionalFunctionArgs (optional) an object that contains any additional
 * function args set by the vle
 */
function TagMapConstraint(view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage) {
	//set the default values if the argument was not provided
	
	if(nodeId == null) {
		nodeId == '';
	}

	if(tagName == null) {
		tagName = '';
	}

	if(functionName == null) {
		functionName = '';
	}

	if(functionArgs == null) {
		functionArgs = [];
	}
	
	if(additionalFunctionArgs == null) {
		additionalFunctionArgs = {};
	}
	
	if(customMessage == null) {
		customMessage = '';
	}
	
	this.view = view;
	this.nodeId = nodeId;
	this.tagName = tagName;
	this.functionName = functionName;
	this.functionArgs = functionArgs;
	this.additionalFunctionArgs = additionalFunctionArgs;
	this.customMessage = customMessage;
};

/**
 * Check if the student has completed the node
 * @param nodeId the node id that needs to be checked for completion.
 * the node id may be an id of a step or activity. if it is an activity,
 * the student must have completed all the steps in the activity.
 * @return whether the student has completed the node
 */
TagMapConstraint.prototype.isCompleted = function(nodeId) {
	var completed = true;
	
	//get the node
	var node = this.view.getProject().getNodeById(nodeId);
	
	if(node.type == 'sequence') {
		//node is an activity
		
		//get all the node ids in this activity
		var nodeIds = this.view.getProject().getNodeIdsInSequence(nodeId);
		
		//loop through all the node ids in the activity
		for(var x=0; x<nodeIds.length; x++) {
			//get a node id
			var tempNodeId = nodeIds[x];
			
			//get the node
			var node = this.view.getProject().getNodeById(tempNodeId);
			
			//get the latest work for the step
			var nodeVisits = this.view.getState().getNodeVisitsByNodeId(tempNodeId);
			
			//check if the work is completed
			if(nodeVisits == null || nodeVisits.length == 0 || !node.isCompleted(nodeVisits)) {
				completed = false;
			}
		}
	} else {
		//node is a step

		//get the latest work for the step
		var nodeVisits = this.view.getState().getNodeVisitsByNodeId(nodeId);
		
		//check if the work is completed
		if(nodeVisits == null || nodeVisits.length == 0 || !node.isCompleted(nodeVisits)) {
			completed = false;
		}
	}
	
	return completed;
};

/**
 * Check if the student has visited the node
 * @param nodeId the node id that needs to be checked if visited.
 * the node id may be an id of a step or activity. if it is an activity,
 * the student must have visited all the steps in the activity.
 * @return whether the student has visited the node
 */
TagMapConstraint.prototype.isVisited = function(nodeId) {
	var visited = false;
	
	//get the node
	var node = this.view.getProject().getNodeById(nodeId);
	
	if(node.type == 'sequence') {
		//node is an activity
		
		var visitedAllStepsInActivity = true;
		
		//get all the node ids in this activity
		var nodeIds = this.view.getProject().getNodeIdsInSequence(nodeId);
		
		//loop through all the node ids in the activity
		for(var x=0; x<nodeIds.length; x++) {
			//get a node id
			var tempNodeId = nodeIds[x];
			
			//get the latest node visit for the step
			var canBeEmpty = true;
			var nodeVisit = this.view.getState().getLatestNodeVisitByNodeId(tempNodeId, canBeEmpty);
			
			if(nodeVisit == null) {
				//the student has not visited this step
				visitedAllStepsInActivity = false;
			}
		}
		
		visited = visitedAllStepsInActivity;
	} else {
		//node is a step

		//get the latest node visit for the step
		var canBeEmpty = true;
		var nodeVisit = this.view.getState().getLatestNodeVisitByNodeId(nodeId, canBeEmpty);
		
		if(nodeVisit != null) {
			//the student has visited the step
			visited = true;
		}
	}
	
	return visited;
};

/**
 * Check if the constraint is satisfied.
 * This function should be overridden by child classes.
 * @return whether the constraint is satisfied or not
 */
TagMapConstraint.prototype.isSatisfied = function() {
	var satisfied = true;
	
	return satisfied;
};

/**
 * Check the constraint taking into consideration the current step the
 * student is on and the next step they are trying to go to.
 * This function should be overridden by child classes.
 * @param currentNodeId the current node id
 * @param nextNodeId the next node id
 * @return an object containing whether the student is allowed to move
 * to the next step they are trying to move to and a message to display
 * to them if they are not allowed to move
 */
TagMapConstraint.prototype.checkConstraint = function(currentNodeId, nextNodeId) {
	var results = {};
	
	results.canMove = true;
	results.message = this.getConstraintMessage();
	
	return results;
};

/**
 * Get the message to display to the student if the constraint is not satisfied.
 * This function should be overridden by child classes.
 * @return a message that we will notify the student of the constraint
 */
TagMapConstraint.prototype.getConstraintMessage = function() {
	var message = '';
	return message;
};

/**
 * Grey out steps the student is not allowed to visit due to the constraint.
 * This function should be overridden by child classes.
 */
TagMapConstraint.prototype.constrainNavigation = function() {
	
};

/**
 * Get the nodes that this constraint requires the student to complete
 * but the student has not completed yet. Child constraint classes
 * may need to override this function. 
 */
TagMapConstraint.prototype.getNodesFailed = function() {
	return [];
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/navigation/tagmapconstraints/TagMapConstraint.js');
}