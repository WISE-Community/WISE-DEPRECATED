
MySystemNode.prototype = new Node();
MySystemNode.prototype.constructor = MySystemNode;
MySystemNode.prototype.parent = Node.prototype;
MySystemNode.authoringToolName = "My System";
MySystemNode.authoringToolDescription = "Students work on a diagram where they can add images and connect them with lines";

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {MySystemNode}
 */
function MySystemNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.content = null;
	this.filename = null;
	this.audios = [];
	this.contentBase;
	this.audioSupported = true;	
};


/**
 * Overrides Node.getPrompt() function
 * Retrieves the question/prompt the student reads for this step.
 * @return a string containing the prompt. (the string may be an
 * html string)
 */
MySystemNode.prototype.getPrompt = function() {
	var prompt = "";
	
	if(this.content != null) {
		//get the content for the node
		var contentJSON = this.content.getContentJSON();

		//see if the node content has an assessmentItem
		if(contentJSON != null && contentJSON.prompt != null) {
			prompt = contentJSON.prompt;	
		}
	}
	
	//return the prompt
	return prompt;
};

MySystemNode.prototype.updateJSONContentPath = function(base, contentString){
	var rExp = new RegExp(this.filename);
	this.content.replace(rExp, base + '/' + this.filename);
};

MySystemNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	return MYSYSTEMSTATE.prototype.parseDataJSONObj(stateJSONObj);
};

/**
 * This is called when the node is exited
 * @return
 */
MySystemNode.prototype.onExit = function() {
	try {
		//check if the content panel has been set
		if(this.contentPanel) {
			if(this.contentPanel.onExit) {
				//run the on exit cleanup
				this.contentPanel.onExit();
			}
		}
	} catch(e) {
		
	}
};

/**
 * MySystem does not actually use this function to render the grading view.
 * The grading view for MySystem steps is handled a special way in the vle code.
 * 
 * @param displayStudentWorkDiv the div we will render the student work into
 * @param nodeVisit the student work
 * @param childDivIdPrefix (optional) a string that will be prepended to all the 
 * div ids use this to prevent DOM conflicts such as when the show all work div
 * uses the same ids as the show flagged work div
 * @param workgroupId the id of the workgroup this work belongs to
 * 
 */
MySystemNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	//do nothing
};

MySystemNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/mysystem/mysystem.html');
};

NodeFactory.addNode('MySystemNode', MySystemNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/mysystem/MySystemNode.js');
};