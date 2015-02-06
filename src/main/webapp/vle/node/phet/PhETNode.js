/*
 * PhETNode
 */

PhETNode.prototype = new Node();
PhETNode.prototype.constructor = PhETNode;
PhETNode.prototype.parent = Node.prototype;
PhETNode.authoringToolName = "PhET Simulation";
PhETNode.authoringToolDescription = "Students interact with simulations for science and math. Simulations are created by University of Colorado Boulder. https://phet.colorado.edu";

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {PhETNode}
 */
function PhETNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
};

PhETNode.prototype.getUrl = function(){
	return this.content.getContentJSON().url;
};

PhETNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/phet/phet.html');
};

/**
 * Whether this step type has a grading view. Steps types that do not
 * save any student work will not have a grading view such as HTMLNode
 * and PhETNode.
 * @returns whether this step type has a grading view
 */
PhETNode.prototype.hasGradingView = function() {
	return false;
};

NodeFactory.addNode('PhETNode', PhETNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/phet/PhETNode.js');
};