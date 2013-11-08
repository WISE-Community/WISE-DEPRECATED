MustCompleteBeforeAdvancingConstraint.prototype = new TagMapConstraint();
MustCompleteBeforeAdvancingConstraint.prototype.constructor = MustCompleteBeforeAdvancingConstraint;
MustCompleteBeforeAdvancingConstraint.prototype.parent = TagMapConstraint.prototype;

/**
 * Constructor to create the MustCompleteBeforeAdvancingConstraint.
 * This constraint prevents the student from moving beyond the given
 * step until they complete the given step.
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
function MustCompleteBeforeAdvancingConstraint(view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage) {
	//call the parent constructor
	TagMapConstraint.prototype.constructor.call(this, view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage);
};

/**
 * Check if the constraint has been satisfied
 * @return whether the constraint is satisfied or not
 */
MustCompleteBeforeAdvancingConstraint.prototype.isSatisfied = function() {
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
 * to the next step they are trying to move to. Also disable any steps
 * in the navigation menu that are not visitable due to this constraint.
 * @param currentNodeId the id of current step the student is on
 * @param nextNodeId the id of the next step the student is trying to move to
 * @return an object that contains the fields canMove and message
 */
MustCompleteBeforeAdvancingConstraint.prototype.checkConstraint = function(currentNodeId, nextNodeId) {
	var results = {
		canMove:true,
		message:''
	};
	
	//get the position of the step that must be completed
	var nodePosition = this.view.getProject().getPositionById(this.nodeId);
	
	//get the position of the next step the student is trying to move to
	var nextPosition = this.view.getProject().getPositionById(nextNodeId);
	
	if(this.view.getProject().positionAfter(nextPosition, nodePosition)) {
		/*
		 * the next position comes after the node that must be completed
		 * so we will need to check if that node is completed
		 */
		
		if(!this.isCompleted(this.nodeId)) {
			//the student has not completed work for the node

			//the student is not allowed to move to the next step they are trying to move to
			results.canMove = false;
			
			//get the message to display in the popup
			results.message = this.getConstraintMessage();

			/*
			 * disable the steps in the navigation menu that the 
			 * student is not allowed to visit
			 */
			this.constrainNavigation();
		}
	}
	
	return results;
};

/**
 * Get the message to display to the student when this constraint
 * prevents them from moving to the step they are trying to move to.
 * @return a message that we will notify the student of the constraint
 */
MustCompleteBeforeAdvancingConstraint.prototype.getConstraintMessage = function() {
	var message = '';
	
	if(this.customMessage != null && this.customMessage != '') {
		message = this.customMessage;
	} else {
		var node = this.view.getProject().getNodeById(this.nodeId);
		
		if(node.type == 'sequence') {
			var activityTerm = this.view.getActivityTerm();
			message = this.view.getI18NStringWithParams("constraint_message_mustCompleteActivityBeforeAdvancing", [activityTerm], "main");
		} else {
			var stepTerm = this.view.getStepTerm();
			message = this.view.getI18NStringWithParams("constraint_message_mustCompleteStepBeforeAdvancing", [stepTerm], "main");
		}		
	}
	
	return message;
};

/**
 * Disable the steps in the navigation menu that the student is not
 * allowed to visit due to this constraint.
 */
MustCompleteBeforeAdvancingConstraint.prototype.constrainNavigation = function() {
	if(this.view.navigationLogic != null && this.view.navigationLogic.tagMapConstraintManager != null) {
		this.view.navigationLogic.tagMapConstraintManager.disableAllStepsAfter(this.nodeId, this);
	}
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/navigation/tagmapconstraints/MustCompleteBeforeAdvancingConstraint.js');
}