/**
 * Branch Node
 */
BranchNode.prototype = new MultipleChoiceNode();
BranchNode.prototype.constructor = BranchNode;
BranchNode.prototype.parent = MultipleChoiceNode.prototype;
function BranchNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
}

/**
 * Whether this step type has a grading view. Steps types that do not
 * save any student work will not have a grading view such as HTMLNode
 * and OutsideUrlNode.
 * @returns whether this step type has a grading view
 */
BranchNode.prototype.hasGradingView = function() {
	return false;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/BranchNode.js');
}