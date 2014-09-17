MustCreateXIdeaBasketIdeasOnThisStepBeforeAdvancingConstraint.prototype = new TagMapConstraint();
MustCreateXIdeaBasketIdeasOnThisStepBeforeAdvancingConstraint.prototype.constructor = MustCreateXIdeaBasketIdeasOnThisStepBeforeAdvancingConstraint;
MustCreateXIdeaBasketIdeasOnThisStepBeforeAdvancingConstraint.prototype.parent = TagMapConstraint.prototype;

/**
 * Constructor to create the MustCreateXIdeaBasketIdeasOnThisStepBeforeAdvancingConstraint.
 * This constraint prevents the student from moving beyond the step this constraint
 * was created on until they have created a certain number of ideas in their idea basket
 * while on the constrained step.
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
 * @param customMessage a custom message to be shown to the student when the 
 * constraint prevents the student from moving
 */
function MustCreateXIdeaBasketIdeasOnThisStepBeforeAdvancingConstraint(view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage) {
	//call the parent constructor
	TagMapConstraint.prototype.constructor.call(this, view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage);
};

/**
 * Check if the constraint has been satisfied
 * @return whether the constraint is satisfied or not
 */
MustCreateXIdeaBasketIdeasOnThisStepBeforeAdvancingConstraint.prototype.isSatisfied = function() {
	var satisfied = true;
	
	//get the function args
	var functionArgs = this.functionArgs;
	var requiredNumberOfIdeas = functionArgs[0];
	
	var ideaCount = 0;
	
	if(this.view.ideaBasket != null) {
		//get the number of ideas that were created on the step that is constrained
		ideaCount = this.view.ideaBasket.getNumberOfIdeasByNodeId(this.nodeId);
	}
	
	//check if the student has created the required number of ideas on the step that is constrained
	if(ideaCount < requiredNumberOfIdeas) {
		//the student did not create the required number of ideas on the step that is constrained
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
 * Get the message to display to the student when this constraint
 * prevents them from moving to the step they are trying to move to.
 * @return a message that we will notify the student of the constraint
 */
MustCreateXIdeaBasketIdeasOnThisStepBeforeAdvancingConstraint.prototype.getConstraintMessage = function() {
	var message = '';
	
	//get the number of ideas that are required
	var functionArgs = this.functionArgs;
	var requiredNumberOfIdeas = functionArgs[0];
	
	if(this.customMessage != null && this.customMessage != '') {
		//use the custom message that was provided when this constraint was created
		message = this.customMessage;
	} else {
		var ideaCount = 0;
		
		if(this.view.ideaBasket != null) {
			/*
			 * get the number of ideas that were created on the step that is constrained
			 */
			ideaCount = this.view.ideaBasket.getNumberOfIdeasByNodeId(this.nodeId);
		}
		
		/*
		 * get the step number and title for the step that is constrained, as well as step and idea terms
		 */
		var stepNumberAndTitle = this.view.getProject().getStepNumberAndTitle(this.nodeId),
			stepTerm = view.getStepTerm(),
			ideaTerm = view.getIdeaTerm(),
			ideaTermPlural = view.getIdeaTermPlural();
		
		/*
		 * generate the message that tells the student they need to create more ideas
		 * on the constrained step
		 */
		if(requiredNumberOfIdeas == 1) {
			//the constraint requires 1 idea
			if(ideaCount == 0) {
				//the student has not created any ideas on the constrained step
				message = this.view.getI18NStringWithParams("constraint_message_mustCreateXIdeaBasketIdeasOnThisStepBeforeAdvancingZero", [requiredNumberOfIdeas, ideaTerm, stepTerm, stepNumberAndTitle, ideaTermPlural, stepTerm], "main");
			}
		} else {
			//the constraint requires multiple ideas
			if(ideaCount == 0) {
				//the student has not created any ideas on the constrained step
				message = this.view.getI18NStringWithParams("constraint_message_mustCreateXIdeaBasketIdeasOnThisStepBeforeAdvancingZero", [requiredNumberOfIdeas, ideaTermPlural, stepTerm, stepNumberAndTitle, ideaTermPlural, stepTerm], "main");
			} else if(ideaCount == 1) {
				//the student has only created one idea on the constrained step
				message = this.view.getI18NStringWithParams("constraint_message_mustCreateXIdeaBasketIdeasOnThisStepBeforeAdvancing", [requiredNumberOfIdeas, ideaTermPlural, stepTerm, stepNumberAndTitle, ideaCount, ideaTerm, stepTerm], "main");
			} else {
				//the student has not created enough ideas on the constrained step
				message = this.view.getI18NStringWithParams("constraint_message_mustCreateXIdeaBasketIdeasOnThisStepBeforeAdvancing", [requiredNumberOfIdeas, ideaTermPlural, stepTerm, stepNumberAndTitle, ideaCount, ideaTermPlural, stepTerm], "main");
			}
		}
	}
	
	return message;
};


/**
 * Disable the steps in the navigation menu that the student is not
 * allowed to visit due to this constraint.
 */
MustCreateXIdeaBasketIdeasOnThisStepBeforeAdvancingConstraint.prototype.constrainNavigation = function() {
	if(this.view.navigationLogic != null && this.view.navigationLogic.tagMapConstraintManager != null) {
		this.view.navigationLogic.tagMapConstraintManager.disableAllStepsAfter(this.nodeId, this);
	}
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/navigation/tagmapconstraints/MustCreateXIdeaBasketIdeasOnThisStepBeforeAdvancingConstraint.js');
}