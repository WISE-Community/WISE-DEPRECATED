/**
 * NOTE: This constraint has been deprecated - WISE now creates an 'XMustHaveStatusYConstraint'
 * with a statusType of 'isVisited' and statusValue of 'true' for all
 * 'MustVisitXBeforeConstraint' instances
 */

MustVisitXBeforeConstraint.prototype = new TagMapConstraint();
MustVisitXBeforeConstraint.prototype.constructor = MustVisitXBeforeConstraint;
MustVisitXBeforeConstraint.prototype.parent = TagMapConstraint.prototype;

/**
 * Constructor to create the MustVisitXBeforeConstraint.
 * This constraint forces the student to visit a previous step
 * before they are allowed to work on this step.
 * @param view the view
 * @param nodeId the node id that this constraint is for. the node id can
 * be for a step or an activity
 * @param tagName (optional) the tag name used to identify which
 * other nodes that are used in this tag map 
 * @param functionName the name of the tag map function
 * @param functionArgs (optional) an array that contains tag map function args set
 * by the author of the project
 * @param additionalFunctionArgs (optional) an object that contains any additional
 * function args set by the vle
 * 
 */
function MustVisitXBeforeConstraint(view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage) {
	TagMapConstraint.prototype.constructor.call(this, view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage);
	
	if(additionalFunctionArgs != null) {
		//the node id the student must visit
		this.mustVisitNodeId = additionalFunctionArgs.mustVisitNodeId;
		
		//the time this constraint was created
		this.createTime = additionalFunctionArgs.createTime;
		
		/*
		 * whether the student must visit the step again after the create time.
		 * this is used in situations like challenge question where we force
		 * the student to visit a previous step again each time they answer
		 * the challenge question incorrectly.
		 */
		this.mustVisitAfterCreateTime = additionalFunctionArgs.mustVisitAfterCreateTime;		
	}
};

MustVisitXBeforeConstraint.prototype.isSatisfied = function() {
	var satisfied = true;
	
	//array to accumulate the nodes that the student has not completed
	var nodesFailed = [];

	//the node ids of the steps that come before the current step and have the given tag
	var previousNodeIds = this.view.getProject().getPreviousNodeIdsByTag(this.tagName, this.nodeId);
	
	if(previousNodeIds != null) {
		//loop through all the node ids that come before the current step and have the given tag
		for(var x=0; x<previousNodeIds.length; x++) {
			//get a node id
			var previousNodeId = previousNodeIds[x];
			
			if(previousNodeId != null) {
				if(this.mustVisitAfterCreateTime) {
					if(!this.isVisitedAfterCreateTime(previousNodeId)) {
						//the student has not visited this step after the create time
						nodesFailed.push(previousNodeId);
					}
				} else {
					if(!this.isVisited(previousNodeId)) {
						//the student has not visited this step
						nodesFailed.push(previousNodeId);
					}
				}
			}
		}
	}
	
	if(this.mustVisitNodeId != null) {
		if(this.mustVisitAfterCreateTime) {
			if(!this.isVisitedAfterCreateTime(this.mustVisitNodeId)) {
				//the student has not visited this step after the create time
				nodesFailed.push(this.mustVisitNodeId);
			}
		} else {
			if(!this.isVisited(this.mustVisitNodeId)) {
				//the student has not visited this step
				nodesFailed.push(this.mustVisitNodeId);
			}
		}
	}
	
	if(nodesFailed.length > 0) {
		//the student has not completed work for all the tagged steps
		satisfied = false;
	}
	
	var stepNumberAndTitle = this.view.getProject().getStepNumberAndTitle(this.nodeId);
	
	if(satisfied) {
		//the constraint is satisfied
		TagMapConstraintManager.debugOutput(stepNumberAndTitle + ':' + this.functionName + ':disabled');		
	} else {
		//the constraint is not satisfied
		TagMapConstraintManager.debugOutput(stepNumberAndTitle + ':' + this.functionName + ':enabled');
	}
	
	return satisfied;
};

/**
 * Check the constraint and determine if the student is allowed to move
 * to the next step they are trying to move to. Also grey out any steps
 * in the navigation menu that are not visitable due to this constraint.
 * @param currentNodeId the id of current step the student is on
 * @param nextNodeId the id of the next step the student is trying to move to
 * @return an object that contains the fields canMove and message
 */
MustVisitXBeforeConstraint.prototype.checkConstraint = function(currentNodeId, nextNodeId) {
	var results = {
		canMove:true,
		message:''
	};
	
	var node = this.view.getProject().getNodeById(this.nodeId);
	
	var isStudentTryingToMoveToConstrainedNode = false;
	
	if(node.type == 'sequence') {
		/*
		 * the constrained node is an activity so we must check
		 * if the step the student is trying to move to is in
		 * the constrained activity
		 */
		if(this.view.getProject().isNodeIdInSequence(nextNodeId, this.nodeId)) {
			isStudentTryingToMoveToConstrainedNode = true;
		}
	} else {
		/*
		 * the constrained node is a step so we must check if
		 * the step the student is trying to move to is the
		 * same step
		 */
		if(nextNodeId == this.nodeId) {
			isStudentTryingToMoveToConstrainedNode = true;
		}
	}
	
	if(isStudentTryingToMoveToConstrainedNode) {
		/*
		 * the student is trying to move to the node that is constrained. 
		 * the student must have visited the must visit nodes in 
		 * order to be able to move to this node.
		 */
		
		//array to accumulate the nodes that the student has not completed
		var nodesFailed = [];

		//the node ids of the steps that come before the current step and have the given tag
		var previousNodeIds = this.view.getProject().getPreviousNodeIdsByTag(this.tagName, this.nodeId);
		
		if(previousNodeIds != null) {
			//loop through all the node ids that come before the current step and have the given tag
			for(var x=0; x<previousNodeIds.length; x++) {
				//get a node id
				var previousNodeId = previousNodeIds[x];
				
				if(previousNodeId != null) {
					if(this.mustVisitAfterCreateTime) {
						if(!this.isVisitedAfterCreateTime(previousNodeId)) {
							//the student has not visited this step after the create time
							nodesFailed.push(previousNodeId);
						}
					} else {
						if(!this.isVisited(previousNodeId)) {
							//the student has not visited this step
							nodesFailed.push(previousNodeId);
						}
					}
				}
			}
		}
		
		if(this.mustVisitNodeId != null) {
			if(this.mustVisitAfterCreateTime) {
				if(!this.isVisitedAfterCreateTime(this.mustVisitNodeId)) {
					//the student has not visited this step after the create time
					nodesFailed.push(this.mustVisitNodeId);
				}
			} else {
				if(!this.isVisited(this.mustVisitNodeId)) {
					//the student has not visited this step
					nodesFailed.push(this.mustVisitNodeId);
				}
			}
		}
		
		if(nodesFailed.length > 0) {
			//the student has not completed work for the step
			results.canMove = false;
			results.message = this.getConstraintMessage(nodesFailed);
			this.constrainNavigation();
		}
	}
	
	return results;
};

/**
 * Get the nodes that this constraint requires the student to visit
 * but the student has not visited yet.
 */
MustVisitXBeforeConstraint.prototype.getNodesFailed = function() {
	//array to accumulate the nodes that the student has not completed
	var nodesFailed = [];

	//the node ids of the steps that come before the current step and have the given tag
	var previousNodeIds = this.view.getProject().getPreviousNodeIdsByTag(this.tagName, this.nodeId);
	
	if(previousNodeIds != null) {
		//loop through all the node ids that come before the current step and have the given tag
		for(var x=0; x<previousNodeIds.length; x++) {
			//get a node id
			var previousNodeId = previousNodeIds[x];
			
			if(previousNodeId != null) {
				if(this.mustVisitAfterCreateTime) {
					if(!this.isVisitedAfterCreateTime(previousNodeId)) {
						//the student has not visited this step after the create time
						nodesFailed.push(previousNodeId);
					}
				} else {
					if(!this.isVisited(previousNodeId)) {
						//the student has not visited this step
						nodesFailed.push(previousNodeId);
					}
				}
			}
		}
	}
	
	if(this.mustVisitNodeId != null) {
		if(this.mustVisitAfterCreateTime) {
			if(!this.isVisitedAfterCreateTime(this.mustVisitNodeId)) {
				//the student has not visited this step after the create time
				nodesFailed.push(this.mustVisitNodeId);
			}
		} else {
			if(!this.isVisited(this.mustVisitNodeId)) {
				//the student has not visited this step
				nodesFailed.push(this.mustVisitNodeId);
			}
		}
	}
	
	return nodesFailed;
};

/**
 * Get the message to display to the student when this constraint
 * prevents them from moving to the next step they are trying to move to.
 * @return a message that we will notify the student of the constraint
 */
MustVisitXBeforeConstraint.prototype.getConstraintMessage = function() {
	var message = '';

	if(this.customMessage != null && this.customMessage != '') {
		message = customMessage;
	} else {
		message = this.view.getI18NString("constraint_message_mustVisitXBeforeVisiting", "main");
	}
	
	return message;
};

/**
 * Disable step or activity in the navigation menu.
 */
MustVisitXBeforeConstraint.prototype.constrainNavigation = function() {
	if(this.view.navigationPanel != null) {
		var node = this.view.getProject().getNodeById(this.nodeId);
		
		if(node.type == 'sequence') {
			//node is an activity
			
			//get all the node ids in the activity
			var nodeIds = this.view.getProject().getNodeIdsInSequence(this.nodeId);
			
			//loop through all the node ids in the activity
			for(var x=0; x<nodeIds.length; x++) {
				//get a node id
				var nodeId = nodeIds[x];
				
				//disable the step
				this.view.navigationLogic.tagMapConstraintManager.disableStepOrActivity(nodeId, this);
			}
		} else {
			//node is a step
			this.view.navigationLogic.tagMapConstraintManager.disableStepOrActivity(this.nodeId, this);			
		}
	}
};

/**
 * Determine if the student has visited the step after the create time of
 * this constraint.
 * @param nodeId the step we are checking
 * @return whether the student has visited the step after the create time of
 * this constraint.
 */
MustVisitXBeforeConstraint.prototype.isVisitedAfterCreateTime = function(nodeId) {
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
			
			var canBeEmpty = true;
			var nodeVisit = this.view.getState().getLatestNodeVisitByNodeId(tempNodeId, canBeEmpty);
			
			if(nodeVisit != null) {
				if(nodeVisit.visitStartTime > this.createTime) {
					//the student visited the step after the create time
				} else {
					//the student did not visit the step after the create time
					visitedAllStepsInActivity = false;
				}
			}
		}
		
		visited = visitedAllStepsInActivity;
	} else {
		//node is a step

		//get the latest visit for the step
		var canBeEmpty = true;
		var nodeVisit = this.view.getState().getLatestNodeVisitByNodeId(nodeId, canBeEmpty);
		
		if(nodeVisit != null) {
			if(nodeVisit.visitStartTime > this.createTime) {
				//the student visited the step after the create time
				visited = true;					
			}
		}
	}
	
	return visited;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/navigation/tagmapconstraints/MustVisitXBeforeConstraint.js');
}