/**
 * Create the tag map constraint manager
 * @param view the view
 */
function TagMapConstraintManager(view) {
	this.view = view;
	this.activeTagMapConstraints = [];
	
	if (view != null && view.navigationLogic != null && view.navigationLogic.tagMapConstraintManager != null && view.navigationLogic.tagMapConstraintManager.activeTagMapConstraints != null) {
		// reset activeTagMapConstraints from previous state
		this.activeTagMapConstraints = view.navigationLogic.tagMapConstraintManager.activeTagMapConstraints;
	}
};

//value to turn on console output for debugging purposes
TagMapConstraintManager.DEBUG = false;

/**
 * Output the message to the console for debugging purposes if
 * TagMapConstraintManager.DEBUG is set to true.
 * @param message the message to display in the console
 */
TagMapConstraintManager.debugOutput = function(message) {
	if(TagMapConstraintManager.DEBUG) {
		console.log(message);
	}
};

/**
 * Add all the global tag map constraints that affect the project navigation.
 * Step tag map constraints will be processed later when the step is rendered.
 */
TagMapConstraintManager.prototype.addGlobalTagMapConstraints = function() {
	
	if(this.activeTagMapConstraints == null) {
		//create the active tag map constraints array if it does not exist
		this.activeTagMapConstraints = [];
	}
	
	//get all the node ids in the project
	var nodeIds = this.view.getProject().getAllNodeIds();
	
	//loop through all the node ids
	for(var x=0; x<nodeIds.length; x++) {
		//get a node id
		var nodeId = nodeIds[x];
		
		//get the position
		var nodePosition = this.view.getProject().getPositionById(nodeId);
		
		//get a node
		var node = this.view.getProject().getNodeById(nodeId);
		
		var tagMaps = null;

		if(node.tagMaps != null) {
			//get the tag maps for this step
			tagMaps = node.tagMaps;
		}
		
		//check if there are any tag maps
		if(tagMaps != null) {
			
			//loop through all the tag maps
			for(var y=0; y<tagMaps.length; y++) {
				
				//get a tag map
				var tagMapObject = tagMaps[y];
				
				if(tagMapObject != null) {
					//get the variables for the tag map
					var tagName = tagMapObject.tagName;
					var functionName = tagMapObject.functionName;
					var functionArgs = tagMapObject.functionArgs;
					var additionalFunctionArgs = {};
					var customMessage = '';
					
					//make the the tag map constraint active if the constraint is not satisfied
					this.addActiveTagMapConstraintIfNecessary(nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage);
				}
			}
		}
	}
};

/**
 * Add tag map constraints for a step
 * @param nodeId the node id of the step
 */
TagMapConstraintManager.prototype.addTagMapConstraints = function(nodeId) {
	//add tag map constraints for the step if any
	this.addTagMapConstraintsForNode(nodeId);
	
	//get the activity node id
	var parentNodeId = this.view.getProject().getParentNodeId(nodeId);
	
	//add tag map constraints for the activity if any
	this.addTagMapConstraintsForNode(parentNodeId);
};

/**
 * Add tag map constraints for a node
 * @param nodeId the id of the node
 */
TagMapConstraintManager.prototype.addTagMapConstraintsForNode = function(nodeId) {
	//get a node
	var node = this.view.getProject().getNodeById(nodeId);
	
	var tagMaps = null;
	
	if(node.tagMaps != null) {
		//get the tag maps for this step
		tagMaps = node.tagMaps;
	}
	
	//check if there are any tag maps
	if(tagMaps != null) {
		
		//loop through all the tag maps
		for(var y=0; y<tagMaps.length; y++) {
			
			//get a tag map
			var tagMapObject = tagMaps[y];
			
			if(tagMapObject != null) {
				//get the variables for the tag map
				var tagName = tagMapObject.tagName;
				var functionName = tagMapObject.functionName;
				var functionArgs = tagMapObject.functionArgs;
				var additionalFunctionArgs = {};
				var customMessage = '';
				
				//make the the tag map constraint active if the constraint is not satisfied
				this.addActiveTagMapConstraintIfNecessary(nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage);
			}
		}
	}
};

/**
 * The student is trying to move to another step so we will
 * process the tag map constraints to make sure they are allowed
 * to move.
 * @param nextNodeId the id of the next step the student is 
 * trying to move to
 * @return an object containing a boolean value of whether the
 * student is allowed to move and a message to display if they
 * are not allowed to move
 */
TagMapConstraintManager.prototype.processTagMapConstraints = function(nextNodeId) {
	//create the results object that we will return
	var results = {
		canMove:true,
		activeConstraints:[]
	};
	
	//get the next node the student is trying to move to
	var node = this.view.getProject().getNodeById(nextNodeId);
	
	//get all the active constraints that are constraining the node the student is trying to move to
	var activeConstraints = node.getActiveConstraints();
	
	//loop through all the active constraints that are on the step the student is trying to move to
	for(var x=0; x<activeConstraints.length; x++) {
		var activeConstraint = activeConstraints[x], // get the current constraint
			nodesFailed = activeConstraint.getNodesFailed(), // get all the nodes that have not satisfied the requirements for this constraint
			message = activeConstraint.getConstraintMessage(); // get the message to display to the student
		
		// construct a constraint details object for this constraint
		var details = {
			"nodesFailed": nodesFailed,
			"message": message
		};
		
		// add the constraint details to the results.activeConstraints array
		results.activeConstraints.push(details);
		
		//the student is not allowed to move to the step they are trying to move to
		results.canMove = false;
	}
	
	return results;
};

/**
 * Update the active tag map constraints by re-evaluating the constraints
 * to make sure they should still be active.
 */
TagMapConstraintManager.prototype.updateActiveTagMapConstraints = function() {
	TagMapConstraintManager.debugOutput('updateActiveTagMapConstraints active constraint count before:' + this.activeTagMapConstraints.length);
	
	var results = {
		canMove:true,
		message:''
	};

	//get the current node the student is on
	var currentNode = this.view.getCurrentNode();

	//get the current node id
	var currentNodeId = currentNode.id;

	//get the current position
	var currentPosition = this.view.getProject().getPositionById(currentNodeId);

	//get all the node ids in the project
	var nodeIds = this.view.getProject().getNodeIds();

	if(this.activeTagMapConstraints == null) {
		//create the active tag map constraints array if it does not exist
		this.activeTagMapConstraints = [];
	}

	//loop through all the active tag map constraints
	for(var x=0; x<this.activeTagMapConstraints.length; x++) {
		//get an active tag map constraint
		var activeTagMapConstraint = this.activeTagMapConstraints[x];

		if(activeTagMapConstraint != null) {
			if(activeTagMapConstraint.isSatisfied()) {
				/*
				 * the student has satisfied the constraint so we will
				 * remove the constraint from the activeTagMapConstraints 
				 * array
				 */
				this.activeTagMapConstraints.splice(x, 1);
				
				//remove this constraint from all nodes
				this.removeConstraintFromNodes(activeTagMapConstraint);
				
				//move the counter back one since we just removed an element in the array
				x--;
			} else {
				/*
				 * the constraint has not been satisfied so we will enforce it.
				 * this will grey out the steps that are not allowed to be
				 * visited
				 */
				activeTagMapConstraint.constrainNavigation();
			}
		}
	}

	TagMapConstraintManager.debugOutput('updateActiveTagMapConstraints active constraint count after:' + this.activeTagMapConstraints.length);
	
	return results;
};

/**
 * Remove the constraint from all the nodes
 * 
 * @param constraint the constraint to remove from all the nodes
 */
TagMapConstraintManager.prototype.removeConstraintFromNodes = function(constraint) {
	var onlyGetNodesWithGradingView = false
	var includeSequenceNodeIds = true;
	
	//get all the node ids including sequence node ids
	var nodeIds = this.view.getProject().getNodeIds(onlyGetNodesWithGradingView, includeSequenceNodeIds);
	
	//loop through all the node ids
	for(var x=0; x<nodeIds.length; x++) {
		//get a node id
		var nodeId = nodeIds[x];
		
		//get a node
		var node = this.view.getProject().getNodeById(nodeId);
		
		//remove the constraint from the node
		node.removeConstraint(constraint);
	}
};

/**
 * Add the active tag map constraint if it is not satisfied and does not already exist
 * @param nodeId the node id that this constraint is for
 * @param tagName (optional) the tag name used to identify which
 * other nodes that are used in this tag map 
 * @param functionName the name of the tag map function
 * @param functionArgs (optional) an array that contains tag map function args set
 * by the author of the project
 * @param additionalFunctionArgs (optional) an object that contains any additional
 * function args set by the vle
 */
TagMapConstraintManager.prototype.addActiveTagMapConstraintIfNecessary = function(nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage) {
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
	
	//create the tag map constraint
	var tagMapConstraint = TagMapConstraintFactory.createTagMapConstraint(this.view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage);
	
	if(tagMapConstraint != null) {
		if(!tagMapConstraint.isSatisfied() && !this.activeTagMapConstraintExists(nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage)) {
			/*
			 * the constraint is not satisfied and does not already exist
			 * so we will add it to the active constraints
			 */
			this.activeTagMapConstraints.push(tagMapConstraint);
		}
	}
};

/**
 * Check if the tag map constraint already exists in the activeTagMapConstraints array
 * @param nodeId the node id that this constraint is for
 * @param tagName (optional) the tag name used to identify which
 * other nodes that are used in this tag map 
 * @param functionName the name of the tag map function
 * @param functionArgs (optional) an array that contains tag map function args set
 * by the author of the project
 * @param additionalFunctionArgs (optional) an object that contains any additional
 * function args set by the vle
 */
TagMapConstraintManager.prototype.activeTagMapConstraintExists = function(nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage) {
	var exists = false;
	
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
	
	if(this.activeTagMapConstraints == null) {
		//create the active tag map constraints array if it does not exist
		this.activeTagMapConstraints = [];
	}
	
	//loop through all the active tag map constraints
	for(var x=0; x<this.activeTagMapConstraints.length; x++) {
		//get an active tag map constraint
		var activeTagMapConstraint = this.activeTagMapConstraints[x];
		
		//get all the parameters for the tag map constraint
		var tempNodeId = activeTagMapConstraint.nodeId;
		var tempTagName = activeTagMapConstraint.tagName;
		var tempFunctionName = activeTagMapConstraint.functionName;
		var tempFunctionArgs = activeTagMapConstraint.functionArgs;
		var tempAdditionalFunctionArgs = activeTagMapConstraint.additionalFunctionArgs;
		var tempCustomMessage = activeTagMapConstraint.customMessage;
		
		//commpare the parameters
		if(nodeId == tempNodeId && 
				tagName == tempTagName && 
				functionName == tempFunctionName &&
				JSON.stringify(functionArgs) == JSON.stringify(tempFunctionArgs) &&
				JSON.stringify(additionalFunctionArgs) == JSON.stringify(tempAdditionalFunctionArgs) &&
				customMessage == tempCustomMessage) {
			//all the parameters match so this tag map constraint already exists
			exists = true;
		}
	}
	
	return exists;
}

/**
 * Remove the active tag map constraint with the given parameters
 * @param nodeId the node id that this constraint is for
 * @param tagName (optional) the tag name used to identify which
 * other nodes that are used in this tag map 
 * @param functionName the name of the tag map function
 * @param functionArgs (optional) an array that contains tag map function args set
 * by the author of the project
 * @param additionalFunctionArgs (optional) an object that contains any additional
 * function args set by the vle
 */
TagMapConstraintManager.prototype.removeActiveTagMapConstraint = function(nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage) {
	if(this.activeTagMapConstraints == null) {
		this.activeTagMapConstraints = [];
	}
	
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
	
	if(this.activeTagMapConstraints == null) {
		//create the active tag map constraints array if it does not exist
		this.activeTagMapConstraints = [];
	}
	
	//loop through the active tag map constraints
	for(var x=0; x<this.activeTagMapConstraints.length; x++) {
		//get an active tag map constraint
		var activeTagMapConstraint = this.activeTagMapConstraints[x];
		
		if(activeTagMapConstraint != null) {
			//get the parameters for the active tag map constraint
			var tempNodeId = activeTagMapConstraint.nodeId;
			var tempTagName = activeTagMapConstraint.tagName;
			var tempFunctionName = activeTagMapConstraint.functionName;
			var tempFunctionArgs = activeTagMapConstraint.functionArgs;
			var tempAdditionalFunctionArgs = activeTagMapConstraint.additionalFunctionArgs;
			var tempCustomMessage = activeTagMapConstraint.customMessage;
			
			//commpare the parameters
			if(nodeId == tempNodeId && 
					tagName == tempTagName && 
					functionName == tempFunctionName &&
					JSON.stringify(functionArgs) == JSON.stringify(tempFunctionArgs) &&
					JSON.stringify(additionalFunctionArgs) == JSON.stringify(tempAdditionalFunctionArgs) &&
					customMessage == tempCustomMessage) {
				//all the parameters match so we will remove this from the array
				this.activeTagMapConstraints.splice(x, 1);
				x--;
			}
		}
	}
};


/**
 * Set the constraint status to disabled for all the steps that come after the given node id.
 * If the node id is for a sequence, we will disable all steps after the sequence.
 * 
 * @param nodeId the node id to disable all steps after
 * @param constraint the constraint to add to all steps after
 */
TagMapConstraintManager.prototype.disableAllStepsAfter = function(nodeId, constraint) {
	//get all the node ids that come after this one
	var nodeIdsAfter = this.view.getProject().getNodeIdsAfter(nodeId);

	//loop through all the node ids that come after the one passed in
	for(var x=0; x<nodeIdsAfter.length; x++) {
		//get a node id
		var nodeIdAfter = nodeIdsAfter[x];

		//get the node
		var node = this.view.getProject().getNodeById(nodeIdAfter);

		//set the constraint status to disabled
		node.addConstraint(constraint);
	}
};

/**
 * Set the constraint status to disabled for all the steps except for the given node id.
 * If the node id is for a sequence, we will disable all steps outside of the sequence.
 * 
 * @param nodeId the node id to not disable
 * @param constraint the constraint to add to all other steps
 */
TagMapConstraintManager.prototype.disableAllOtherSteps = function(nodeId, constraint) {

	//get the node
	var node = this.view.getProject().getNodeById(nodeId);
	var nodeIds = [];

	if(node.type == 'sequence') {
		//the node is a sequence so we will get all the node ids in it
		nodeIds = this.view.getProject().getNodeIdsInSequence(nodeId);
	}

	//get all the step node ids in the project
	var allNodeIds = this.view.getProject().getNodeIds();

	//loop through all the step node ids
	for(var x=0; x<allNodeIds.length; x++) {
		//get a node id
		var tempNodeId = allNodeIds[x];

		//get the node
		var tempNode = this.view.getProject().getNodeById(tempNodeId);

		if(node.type == 'sequence') {
			//the node we want to keep enabled is a sequence
			if(nodeIds.indexOf(tempNodeId) == -1) {
				//the temp node id is not in our sequence so we will disable it

				//set the constraint status to disabled
				tempNode.addConstraint(constraint);
			}
		} else {
			//the node that we want to keep enabled is a step
			if(nodeId != tempNodeId) {
				//set the constraint status to disabled
				tempNode.addConstraint(constraint);
			}
		}
	}
};

/**
 * Set the constraint status to disabled for the given node id
 * 
 * @param nodeId the node id to disable
 * @param constraint the constraint to add to this step or activity
 */
TagMapConstraintManager.prototype.disableStepOrActivity = function(nodeId, constraint) {
	//get the node
	var node = this.view.getProject().getNodeById(nodeId);

	if(node.type == 'sequence') {
		//the node is a sequence

		//get all the node ids in the sequence
		var nodeIds = this.view.getProject().getNodeIdsInSequence(nodeId);

		//loop through all the node ids
		for(var x=0; x<nodeIds.length; x++) {
			//get a node id
			var tempNodeId = nodeIds[x];

			//get the node
			var tempNode = this.view.getProject().getNodeById(tempNodeId);

			//set the constraint status to disabled
			tempNode.addConstraint(constraint);
		}
	} else {
		//the node is a step

		//get the node
		var node = this.view.getProject().getNodeById(nodeId);

		//set the constraint status to disabled
		node.addConstraint(constraint);
	}
};

/**
 * Enable all the steps
 */
TagMapConstraintManager.prototype.enableAllSteps = function() {
	//get all the step node ids in the project
	var nodeIds = this.view.getProject().getNodeIds();

	//loop through all the node ids
	for(var x=0; x<nodeIds.length; x++) {
		//get a node id
		var nodeId = nodeIds[x];

		//get the node
		var node = this.view.getProject().getNodeById(nodeId);

		//set the constraint status to disabled
		node.removeConstraint(constraint);
	}
};


//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/navigation/tagmapconstraints/TagMapConstraintManager.js');
}