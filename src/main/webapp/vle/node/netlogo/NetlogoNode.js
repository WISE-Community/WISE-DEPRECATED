
NetlogoNode.prototype = new Node();
NetlogoNode.prototype.constructor = NetlogoNode;
NetlogoNode.prototype.parent = Node.prototype;
NetlogoNode.authoringToolName = "Netlogo";
NetlogoNode.authoringToolDescription = "Students work on a NetLogo activity";
NetlogoNode.prototype.i18nEnabled = true;
NetlogoNode.prototype.i18nPath = "vle/node/netlogo/i18n/";
NetlogoNode.prototype.supportedLocales = {
			"en_US":"en_US",
			"ja":"ja",
			"es":"es"
};

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {NetLogoNode}
 */
function NetlogoNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.content = null;
	this.contentBase;
}

NetlogoNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	return NetlogoState.prototype.parseDataJSONObj(stateJSONObj);
};

NetlogoNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/netlogo/netlogo.html');
};

/**
 * Called when the step is exited. This is used for auto-saving.
 */
NetlogoNode.prototype.onExit = function() {
	try {
		//check if the content panel exists
		if(this.contentPanel && this.contentPanel.save) {
			//tell the content panel to save
			this.contentPanel.save();
		};
	} catch(e) {
		
	}
};

/**
 * Returns whether this step type can be special exported
 * @return a boolean value
 */
NetlogoNode.prototype.canSpecialExport = function() {
	return true;
};

NodeFactory.addNode('NetlogoNode', NetlogoNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/netlogo/NetlogoNode.js');
};