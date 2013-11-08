MustCompleteBeforeExitingConstraint.prototype = new TagMapConstraint();
MustCompleteBeforeExitingConstraint.prototype.constructor = MustCompleteBeforeExitingConstraint;
MustCompleteBeforeExitingConstraint.prototype.parent = TagMapConstraint.prototype;

/**
 * Constructor to create the MustCompleteBeforeExitingConstraint.
 * This constraint makes the student complete the step before they can
 * exit it.
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
function MustCompleteBeforeExitingConstraint(view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage) {
	TagMapConstraint.prototype.constructor.call(this, view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage);
};

/**
 * Check if the constraint has been satisfied
 * @return whether the constraint is satisfied or not
 */
MustCompleteBeforeExitingConstraint.prototype.isSatisfied = function() {
	var satisfied = true;
	
	if(!this.isCompleted(this.nodeId)) {
		//the student has not completed work for the node
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
 * to another step. Also disable all other steps if they are not allowed
 * to move to other steps due to this constraint.
 * @param currentNodeId the id of current step the student is on
 * @param nextNodeId the id of the next step the student is trying to move to
 * @return an object that contains the fields canMove and message
 */
MustCompleteBeforeExitingConstraint.prototype.checkConstraint = function(currentNodeId, nextNodeId) {
	var results = {
		canMove:true,
		message:''
	};
	
	var node = this.view.getProject().getNodeById(this.nodeId);
	
	var isStudentOnConstrainedNode = false;
	
	if(node.type == 'sequence') {
		/*
		 * the constrained node is an activity so we must check if 
		 * the step the student is on is in the constrained activity
		 */
		if(this.view.getProject().isNodeIdInSequence(currentNodeId, this.nodeId)) {
			isStudentOnConstrainedNode = true;
		}
	} else {
		/*
		 * the constrained node is a step so we must check if
		 * the student is on that step
		 */
		if(currentNodeId == this.nodeId) {
			isStudentOnConstrainedNode = true;
		}
	}
	
	if(isStudentOnConstrainedNode) {
		//the student is on the step that is constrained
		
		if(!this.isCompleted(this.nodeId)) {
			//the student has not completed the work for this node
			
			if(node.type == 'sequence') {
				//the constrained node is an activity
				
				/*
				 * check if the step the student is trying to move to is in the
				 * same activity
				 */
				if(this.view.getProject().isNodeIdInSequence(nextNodeId, this.nodeId)) {
					/*
					 * the student is trying to move to another step in the
					 * same activity so we will allow them to move
					 */
					results.canMove = true;
					results.message = '';
					this.constrainNavigation();
				} else {
					/*
					 * the student is trying to move to another step outside of
					 * the activity but they have not completed the work for
					 * the activity so we will not allow them to move
					 */
					results.canMove = false;
					results.message = this.getConstraintMessage();
					this.constrainNavigation();
				}
			} else {
				//the constrained node is a step
				
				if(nextNodeId != this.nodeId) {
					/*
					 * the student is trying to move to another step but they
					 * have not completed the work for the current step so
					 * we will not allow them to move
					 */
					results.canMove = false;
					results.message = this.getConstraintMessage();
					this.constrainNavigation();
				}
			}
		}
	}
	
	return results;
};

/**
 * Get the message to display to the student when this constraint
 * prevents them from moving to the step they are trying to move to.
 * @return a message that we will notify the student of the constraint
 */
MustCompleteBeforeExitingConstraint.prototype.getConstraintMessage = function() {
	var message = '',
		stepTerm = this.view.getStepTerm(),
		stepTermPlural = this.view.getStepTermPlural();
	
	if(this.customMessage != null && this.customMessage != '') {
		message = customMessage;
	} else {
		var node = this.view.getProject().getNodeById(this.nodeId);
		
		if(node.type == 'sequence') {
			var activityTerm = this.view.getActivityTerm();
			message = this.view.getI18NStringWithParams("constraint_message_mustCompleteActivityBeforeExiting", [activityTerm], "main");
		} else {
			var stepTerm = this.view.getStepTerm();
			message = this.view.getI18NStringWithParams("constraint_message_mustCompleteStepBeforeExiting", [stepTerm], "main");
		}	
	}
	
	return message;
};

/**
 * Disable the steps in the navigation menu that the student is not
 * allowed to visit due to this constraint.
 */
MustCompleteBeforeExitingConstraint.prototype.constrainNavigation = function() {
	if(this.view.navigationPanel != null) {
		var currentNodeId = this.view.getCurrentNode().id;
		var node = this.view.getProject().getNodeById(this.nodeId);
		
		if(node.type == 'sequence') {
			//the constrained node is an activity
			
			if(this.view.getProject().isNodeIdInSequence(currentNodeId, this.nodeId)) {
				/*
				 * the student is currently in the constrained activity so we will
				 * disable all steps outside of this activity
				 */
				this.view.navigationLogic.tagMapConstraintManager.disableAllOtherSteps(this.nodeId, this);
			}
		} else {
			//the constrained node is a step
			if(currentNodeId == this.nodeId) {
				/*
				 * the student is currently on the constrained step so we will
				 * disable all other steps
				 */ 
				this.view.navigationLogic.tagMapConstraintManager.disableAllOtherSteps(this.nodeId, this);			
			}		
		}
	}
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/navigation/tagmapconstraints/MustCompleteBeforeExitingConstraint.js');
}