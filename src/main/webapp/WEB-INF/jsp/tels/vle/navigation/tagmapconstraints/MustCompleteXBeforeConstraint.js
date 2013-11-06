/**
 * NOTE: This constraint has been deprecated - WISE now creates an 'XMustHaveStatusYConstraint'
 * with a statusType of 'isCompleted' and statusValue of 'true' for all
 * 'MustCompleteXBeforeConstraint' instances
 */

MustCompleteXBeforeConstraint.prototype = new TagMapConstraint();
MustCompleteXBeforeConstraint.prototype.constructor = MustCompleteXBeforeConstraint;
MustCompleteXBeforeConstraint.prototype.parent = TagMapConstraint.prototype;

/**
 * Constructor to create the MustCompleteXBeforeConstraint.
 * This constraint forces the student to complete a previous step
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
 */
function MustCompleteXBeforeConstraint(view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage) {
	TagMapConstraint.prototype.constructor.call(this, view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage);
};

/**
 * Check if the constraint has been satisfied
 * @return whether the constraint is satisfied or not
 */
MustCompleteXBeforeConstraint.prototype.isSatisfied = function() {
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
				if(!this.isCompleted(previousNodeId)) {
					//the student has not completed this step
					nodesFailed.push(previousNodeId);
				}
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
 * to the next step they are trying to move to. Also disable any steps
 * in the navigation menu that are not visitable due to this constraint.
 * @param currentNodeId the id of current step the student is on
 * @param nextNodeId the id of the next step the student is trying to move to
 * @return an object that contains the fields canMove and message
 */
MustCompleteXBeforeConstraint.prototype.checkConstraint = function(currentNodeId, nextNodeId) {
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
		 * the student must have completed work for the tagged steps in 
		 * order to be able to move to this node.
		 */
		
		//array to accumulate the nodes that the student has not completed
		var nodesFailed = [];

		//the node ids of the steps that come before the next step and have the given tag
		var previousNodeIds = this.view.getProject().getPreviousNodeIdsByTag(this.tagName, this.nodeId);
		
		if(previousNodeIds != null) {
			//loop through all the node ids that come before the current step and have the given tag
			for(var x=0; x<previousNodeIds.length; x++) {
				//get a node id
				var previousNodeId = previousNodeIds[x];
				
				if(previousNodeId != null) {
					
					if(!this.isCompleted(previousNodeId)) {
						nodesFailed.push(previousNodeId);
					}
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
 * Get the nodes that this constraint requires the student to complete
 * but the student has not completed yet.
 */
MustCompleteXBeforeConstraint.prototype.getNodesFailed = function() {
	//array to accumulate the nodes that the student has not completed
	var nodesFailed = [];

	//the node ids of the steps that come before the next step and have the given tag
	var previousNodeIds = this.view.getProject().getPreviousNodeIdsByTag(this.tagName, this.nodeId);
	
	if(previousNodeIds != null) {
		//loop through all the node ids that come before the current step and have the given tag
		for(var x=0; x<previousNodeIds.length; x++) {
			//get a node id
			var previousNodeId = previousNodeIds[x];
			
			if(previousNodeId != null) {
				
				if(!this.isCompleted(previousNodeId)) {
					nodesFailed.push(previousNodeId);
				}
			}
		}
	}
	
	return nodesFailed;
};

/**
 * Get the message to display to the student when this constraint
 * prevents them from moving to the step they are trying to move to.
 * @return a message that we will notify the student of the constraint
 */
MustCompleteXBeforeConstraint.prototype.getConstraintMessage = function() {
	var message = '',
		stepTerm = this.view.getStepTerm(),
		activityTerm = this.view.getActivityTerm();

	if(this.customMessage != null && this.customMessage != '') {
		message = customMessage;
	} else {
		message = this.view.getI18NString("constraint_must_complete_x_before_visiting", "main");
	}
	
	return message;
};

/**
 * Disable constrained step or activity in the navigation menu.
 */
MustCompleteXBeforeConstraint.prototype.constrainNavigation = function() {
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


//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/navigation/tagmapconstraints/MustCompleteXBeforeConstraint.js');
}