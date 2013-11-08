
MWNode.prototype = new Node();
MWNode.prototype.constructor = MWNode;
MWNode.prototype.parent = Node.prototype;
MWNode.authoringToolName = "Molecular Workbench";
MWNode.authoringToolDescription = "Students work on a Molecular Workbench applet";
MWNode.prototype.i18nEnabled = true;
MWNode.prototype.i18nPath = "vle/node/mw/i18n/";
MWNode.prototype.supportedLocales = {
			"en_US":"en_US",
			"ja":"ja",
			"es":"es",
			"nl":"nl",
			"nl_GE":"nl",
			"nl_DE":"nl"			
};

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {MWNode}
 */
function MWNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.content = null;
	this.audios = [];
	this.contentBase;
	this.audioSupported = true;	
}

MWNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/mw/mw.html');
};

/**
 * Whether this step type has a grading view. Steps types that do not
 * save any student work will not have a grading view such as HTMLNode
 * and OutsideUrlNode.
 * @returns whether this step type has a grading view
 */
MWNode.prototype.hasGradingView = function() {
	return false;
};

NodeFactory.addNode('MWNode', MWNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/mw/MWNode.js');
};