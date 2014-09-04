MustHaveXIdeaBasketIdeasBeforeAdvancingConstraint.prototype = new TagMapConstraint();
MustHaveXIdeaBasketIdeasBeforeAdvancingConstraint.prototype.constructor = MustHaveXIdeaBasketIdeasBeforeAdvancingConstraint;
MustHaveXIdeaBasketIdeasBeforeAdvancingConstraint.prototype.parent = TagMapConstraint.prototype;

/**
 * Constructor to create the MustHaveXIdeaBasketIdeasBeforeAdvancingConstraint.
 * This constraint prevents the student from moving beyond the given
 * step until they have a certain number of ideas in their idea basket.
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
function MustHaveXIdeaBasketIdeasBeforeAdvancingConstraint(view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage) {
	//call the parent constructor
	TagMapConstraint.prototype.constructor.call(this, view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage);
};

/**
 * Check if the constraint has been satisfied
 * @return whether the constraint is satisfied or not
 */
MustHaveXIdeaBasketIdeasBeforeAdvancingConstraint.prototype.isSatisfied = function() {
	var satisfied = true;
	
	//get the function args
	var functionArgs = this.functionArgs;
	var requiredNumberOfIdeas = functionArgs[0];
	
	var ideaCount = 0;
	
	if(this.view.ideaBasket != null) {
		//get the ideas from the idea basket
		var ideas = this.view.ideaBasket.ideas;
		
		if(ideas != null) {
			//get the number of ideas the student has created
			ideaCount = ideas.length;
		}
	}
	
	//check if the student has the required number of ideas
	if(ideaCount < requiredNumberOfIdeas) {
		//the student does not have the required number of ideas
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
MustHaveXIdeaBasketIdeasBeforeAdvancingConstraint.prototype.getConstraintMessage = function() {
	var message = '';
	
	//get the number of ideas that are required
	var functionArgs = this.functionArgs;
	var requiredNumberOfIdeas = functionArgs[0];
	
	if(this.customMessage != null && this.customMessage != '') {
		//use the custom message that was provided when this constraint was created
		message = this.customMessage;
	} else {
		if(requiredNumberOfIdeas == 1) {
			//this constraint requires the student to have one idea basket idea
			message = this.view.getI18NStringWithParams("constraint_message_mustHaveXIdeaBasketIdeasBeforeAdvancingSingular", [requiredNumberOfIdeas], "main");
		} else {
			//this constraint requires the student to have more than one idea basket idea
			message = this.view.getI18NStringWithParams("constraint_message_mustHaveXIdeaBasketIdeasBeforeAdvancingPlural", [requiredNumberOfIdeas], "main");
		}
	}
	
	return message;
};

/**
 * Disable the steps in the navigation menu that the student is not
 * allowed to visit due to this constraint.
 */
MustHaveXIdeaBasketIdeasBeforeAdvancingConstraint.prototype.constrainNavigation = function() {
	if(this.view.navigationLogic != null && this.view.navigationLogic.tagMapConstraintManager != null) {
		this.view.navigationLogic.tagMapConstraintManager.disableAllStepsAfter(this.nodeId, this);
	}
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/navigation/tagmapconstraints/MustHaveXIdeaBasketIdeasBeforeAdvancingConstraint.js');
}