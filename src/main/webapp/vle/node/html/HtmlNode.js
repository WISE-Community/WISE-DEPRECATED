/*
 * HtmlNode for rendering display pages (instructions, informations, images, etc)
 */
HtmlNode.prototype = new Node();
HtmlNode.prototype.constructor = HtmlNode;
HtmlNode.prototype.parent = Node.prototype;
HtmlNode.authoringToolName = "Display Page";
HtmlNode.authoringToolDescription = "Students review information (text, multimedia artifacts) on an HTML page";

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {HtmlNode}
 */
function HtmlNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.contentBase;
	
	this.selfRendering = true;
}

/**
 * Takes in a state JSON object and returns an HTMLSTATE object
 * @param nodeStatesJSONObj a state JSON object
 * @return an HTMLSTATE object
 */
HtmlNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	return HTMLSTATE.prototype.parseDataJSONObj(stateJSONObj);
};


/**
 * Not used
 */
HtmlNode.prototype.getHTMLContentTemplate = function() {
	return createContent('');
};

/**
 * Whether this step type has a grading view. Steps types that do not
 * save any student work will not have a grading view such as HTMLNode
 * and OutsideUrlNode.
 * @returns whether this step type has a grading view
 */
HtmlNode.prototype.hasGradingView = function() {
	return false;
};

/**
 * Determine if the student has completed this step. To complete
 * an html step the student just needs to visit it.
 * 
 * @param nodeVisits the node visits for this step
 * 
 * @return whether the student has completed this step
 */
HtmlNode.prototype.isCompleted = function(nodeVisits) {
	var result = false;
	
	if(nodeVisits != null && nodeVisits.length > 0) {
		result = true;
	}
	
	return result;
};

/**
 * This is called when a node is exited
 */
HtmlNode.prototype.onExit = function() {
	//set this node as completed
	this.setStatus('isCompleted', true);
};

NodeFactory.addNode('HtmlNode', HtmlNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/html/HtmlNode.js');
};