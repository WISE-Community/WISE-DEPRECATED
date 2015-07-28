/**
 * BrainstormNode
 *
 * @author: Patrick Lawler
 */

BrainstormNode.prototype = new Node();
BrainstormNode.prototype.constructor = BrainstormNode;
BrainstormNode.prototype.parent = Node.prototype;

BrainstormNode.authoringToolName = "Brainstorm Discussion";
BrainstormNode.authoringToolDescription = "Students post comments for everyone in the class to read and discuss";
BrainstormNode.prototype.i18nEnabled = true;
BrainstormNode.prototype.i18nPath = "vle/node/brainstorm/i18n/";
BrainstormNode.prototype.supportedLocales = {
			"en_US":"en_US",
			"es":"es",
			"iw":"he",
			"ja":"ja",
			"ko":"ko",
			"nl":"nl",
			"nl_GE":"nl",
			"nl_DE":"nl",
			"zh_CN":"zh_CN"
};

BrainstormNode.tagMapFunctions = [
	{functionName:'importWork', functionArgs:[]},
	{functionName:'showPreviousWork', functionArgs:[]}
];

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {BrainstormNode}
 */
function BrainstormNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.serverless = true;
	this.prevWorkNodeIds = [];
	this.importableFileExtensions = new Array(
			"jpg", "jpeg", "png", "gif", "svg");
	
	this.tagMapFunctions = this.tagMapFunctions.concat(BrainstormNode.tagMapFunctions);
};

/**
 * Determines if the this step is using a server back end.
 * @return
 */
BrainstormNode.prototype.isUsingServer = function() {
	if(this.content.getContentJSON().useServer) {
		//we are using a server back end
		this.serverless = false;
		return true;
	} else {
		//we are not using a server back end
		this.serverless = true;
		return false;
	}
};

/**
 * Takes in a state JSON object and returns a BRAINSTORMSTATE object
 * @param nodeStatesJSONObj a state JSON object
 * @return a BRAINSTORMSTATE object
 */
BrainstormNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	return BRAINSTORMSTATE.prototype.parseDataJSONObj(stateJSONObj);
};

NodeFactory.addNode('BrainstormNode', BrainstormNode);

/**
 * Renders the student work into the div. The grading tool will pass in a
 * div id to this function and this function will insert the student data
 * into the div.
 * 
 * @param studentWorkDiv the div we will render the student work into
 * @param nodeVisit the student work
 * @param childDivIdPrefix (optional) a string that will be prepended to all the 
 * div ids use this to prevent DOM conflicts such as when the show all work div
 * uses the same ids as the show flagged work div
 * @param workgroupId the id of the workgroup this work belongs to
 * 
 * TODO: rename TemplateNode
 * Note: you may need to add code to this function if the student
 * data for your step is complex or requires additional processing.
 * look at SensorNode.renderGradingView() as an example of a step that
 * requires additional processing
 */
BrainstormNode.prototype.renderGradingView = function(studentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	/*
	 * Get the latest student state object for this step
	 * TODO: rename templateState to reflect your new step type
	 * 
	 * e.g. if you are creating a quiz step you would change it to quizState
	 */
	var brainstormState = nodeVisit.getLatestWork();
	
	if(brainstormState != null) {
		//get the response
		var brainstormResponse = brainstormState.response;
		
		//replace \n with <br>
		brainstormResponse = this.view.replaceSlashNWithBR(brainstormResponse);
		
		//put the student work into the div
		studentWorkDiv.html(brainstormResponse);
	}
};

BrainstormNode.prototype.getHTMLContentTemplate = function() {
	var content = null;
	if(this.isUsingServer()) {
		//using server
		content = createContent('node/brainstorm/brainfull.html');
	} else {
		//not using server
		content = createContent('node/brainstorm/brainlite.html');
	}
	return content;
};

/**
 * Returns true iff the given file can be imported 
 * into this step's work.
 */
BrainstormNode.prototype.canImportFile = function(filename) {
	if (filename.indexOf(".") != -1) {
		var fileExt = filename.substr(filename.lastIndexOf(".")+1);	
		if (this.importableFileExtensions.indexOf(fileExt.toLowerCase()) != -1) {
			return true;
		}
	}
	return false;
};

/**
 * Imports and inserts the specified file into current drawing.
 * @param file to insert into current canvas
 * @return true if import is successful
 */
BrainstormNode.prototype.importFile = function(filename) {
	if (this.canImportFile(filename) && this.view) {
		// assume it's an image for now.
		
		if(this.view.assetEditorParams != null) {
			//get the tinymce object
			var tinymce = this.view.assetEditorParams.tinymce;
			
			//get the textarea id to insert the image into
			var textAreaId = this.view.assetEditorParams.textAreaId;
			
			if(tinymce != null) {
				//get the tinymce editor for the given textarea
				var editor = tinymce.get(textAreaId);
				
				if(editor != null) {
					//create the img html element to display the image
					var importFileHtml = "<img src='"+filename +"' height='200px'></img>";
					
					//insert the content into the tinymce editor for the given textarea
					editor.execCommand('mceInsertContent', false, importFileHtml);
				}
			}
		}
		
		return true;
	}
	return false;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/brainstorm/BrainstormNode.js');
};