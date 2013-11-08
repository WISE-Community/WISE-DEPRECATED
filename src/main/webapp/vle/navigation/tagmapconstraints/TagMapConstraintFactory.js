/**
 * The tag map constraint factory
 */
function TagMapConstraintFactory() {
	
};

/**
 * Creates a tag map constraint
 * @param view the view
 * @param nodeId the node id that this constraint is for
 * @param tagName (optional) the tag name used to identify which
 * other nodes that are used in this tag map 
 * @param functionName the name of the tag map function
 * @param functionArgs an array that contains tag map function args set
 * by the author of the project
 * @param additionalFunctionArgs an object that contains any additional
 * function args set by the vle
 */
TagMapConstraintFactory.createTagMapConstraint = function(view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage) {
	if(functionName == 'mustCompleteBeforeAdvancing') {
		return new MustCompleteBeforeAdvancingConstraint(view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage);
	} else if(functionName == 'mustCompleteBeforeExiting') {
		return new MustCompleteBeforeExitingConstraint(view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage);
	} else if(functionName == 'mustCompleteXBefore') {
		return new XMustHaveStatusYConstraint(view, nodeId, tagName, functionName, ['isCompleted','true'], additionalFunctionArgs, customMessage);
	} else if(functionName == 'mustVisitXBefore') {
		return new XMustHaveStatusYConstraint(view, nodeId, tagName, functionName, ['isVisited','true'], additionalFunctionArgs, customMessage);
	} else if(functionName == 'xMustHaveStatusY') {
		return new XMustHaveStatusYConstraint(view, nodeId, tagName, functionName, functionArgs, additionalFunctionArgs, customMessage);
	}
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/navigation/tagmapconstraints/TagMapConstraintFactory.js');
}