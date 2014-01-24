/*
 * This a webApp Node that developers can use to create new 
 * step types. Copy this file and rename it to 
 *
 * <new step type>Node.js
 * e.g. for example if you are creating a quiz step type it would
 * look something like QuizNode.js
 * 
 * and then in this file change all occurrences of the word 'WebAppNode' to 
 * 
 * <new step type>Node
 * 
 * e.g. for example if you are creating a quiz step type you would
 * change it to be QuizNode
 */

WebAppNode.prototype = new Node(); //TODO: rename WebAppNode
WebAppNode.prototype.constructor = WebAppNode; //TODO: rename both occurrences of WebAppNode
WebAppNode.prototype.parentNode = Node.prototype; //TODO: rename WebAppNode

/*
 * the name that displays in the authoring tool when the author creates a new step
 * 
 * TODO: rename WebAppNode
 * TODO: rename WebApp to whatever you would like this step to be displayed as in
 * the authoring tool when the author creates a new step
 * e.g. if you are making a QuizNode you would set authoringToolName to to "Quiz"
 */
WebAppNode.authoringToolName = "WebApp"; 

/*
 * TODO: rename WebAppNode
 * TODO: set the authoringToolDescription to describe the step type, this description
 * will be seen by the author when they add a new step to their project to help
 * them understand what kind of step this is
 */
WebAppNode.authoringToolDescription = "Single-Page Web App";

/**
 * This is the constructor for the Node
 * 
 * TODO: rename WebAppNode
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 */
function WebAppNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
}

/**
 * This function is called when the vle loads the step and parses
 * the previous student answers, if any, so that it can reload
 * the student's previous answers into the step.
 * 
 * TODO: rename WebAppNode
 * 
 * @param stateJSONObj
 * @return a new state object
 */
WebAppNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	/*
	 * TODO: rename WebAppState
	 * 
	 * make sure you rename WebAppState to the state object type
	 * that you will use for representing student data for this
	 * type of step. copy and modify the file below
	 * 
	 * vlewrapper/WebContent/vle/node/webApp/webAppState.js
	 * 
	 * and use the object defined in your new state.js file instead
	 * of WebAppState. for example if you are creating a
	 * quiz step type you would copy the file above to
	 * 
	 * vlewrapper/WebContent/vle/node/quiz/quizState.js
	 * 
	 * and in that file you would define QuizState and therefore
	 * would change the WebAppState to QuizState below
	 */ 
	return WebAppState.prototype.parseDataJSONObj(stateJSONObj);
};

/**
 * This function is called if there needs to be any special translation
 * of the student work from the way the student work is stored to a
 * human readable form. For example if the student work is stored
 * as an array that contains 3 elements, for example
 * ["apple", "banana", "orange"]
 *  
 * and you wanted to display the student work like this
 * 
 * Answer 1: apple
 * Answer 2: banana
 * Answer 3: orange
 * 
 * you would perform that translation in this function.
 * 
 * Note: In most cases you will not have to change the code in this function
 * 
 * TODO: rename WebAppNode
 * 
 * @param studentWork
 * @return translated student work
 */
WebAppNode.prototype.translateStudentWork = function(studentWork) {
	return studentWork;
};

/**
 * This function is called when the student exits the step. It is mostly
 * used for error checking.
 * 
 * TODO: rename WebAppNode
 * 
 * Note: In most cases you will not have to change anything here.
 */
WebAppNode.prototype.onExit = function() {
	//check if the content panel has been set
	if(this.contentPanel) {
		if(this.contentPanel.save) {
			//tell the content panel to save
			this.contentPanel.save();
		}
	}
};

/**
 * Renders the student work into the div. The grading tool will pass in a
 * div id to this function and this function will insert the student data
 * into the div.
 * 
 * @param div the div we will render the student work into
 * @param nodeVisit the student work
 * @param childDivIdPrefix (optional) a string that will be prepended to all the 
 * div ids use this to prevent DOM conflicts such as when the show all work div
 * uses the same ids as the show flagged work div
 * @param workgroupId the id of the workgroup this work belongs to
 * 
 * TODO: rename WebAppNode
 * Note: you may need to add code to this function if the student
 * data for your step is complex or requires additional processing.
 * look at SensorNode.renderGradingView() as an example of a step that
 * requires additional processing
 */
WebAppNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	/*
	 * Get the latest student state object for this step
	 * 
	 * e.g. if you are creating a quiz step you would change it to quizState
	 */
	//TODO: possible API EXTENSION HERE --> HOW TO GIVE THE WEBAPP THE ABILITY TO produce a REPORT, if, as with SURGE, it's not document-like
	console.log("do some instance-specific analysis on the whole set of prior work for this step.");
	console.log(nodeVisit);
	var webAppState = nodeVisit.getLatestWork();
	
	/*
	 * get the step work id from the node visit in case we need to use it in
	 * a DOM id. we don't use it in this case but I have retrieved it in case
	 * someone does need it. look at SensorNode.js to view an example of
	 * how one might use it.
	 */
	var stepWorkId = nodeVisit.id;
	
	var studentWork = webAppState.getStudentWork();
	console.log(studentWork);
	//put the HTML representation of the student work into the div provided -- proof of concept here...
	var thehtml = "response object: " + studentWork.response + "<br>";
	thehtml += "There were " + (nodeVisit.nodeStates.length - 1) + " intermediate-save states...<br>";
	thehtml += "...and here is a representation of the latest state: <br>"+studentWork.gradingViewHTML;
	
	//put the HTML representation of student work into the div
	displayStudentWorkDiv.html(thehtml);
};

/**
 * Get the html file associated with this step that we will use to
 * display to the student.
 * 
 * TODO: rename WebAppNode
 * 
 * @return a content object containing the content of the associated
 * html for this step type
 */
WebAppNode.prototype.getHTMLContentTemplate = function() {
	/*
	 * TODO: rename both occurrences of webApp
	 * 
	 * e.g. if you are creating a quiz step you would change it to
	 * 
	 * node/quiz/quiz.html
	 */
	return createContent('node/webApp/webApp.html');
};

/**
 * Whether this step type has a grading view. Steps types that do not
 * save any student work will not have a grading view such as HTMLNode
 * and OutsideUrlNode. For those step types, this function should
 * return false. If you return false, the step will be grayed out
 * in the grading tool and will not be shown in the student vle
 * show all work section.
 * @returns whether this step type has a grading view
 */
WebAppNode.prototype.hasGradingView = function() {
	return true;
};

/*
 * Add this node to the node factory so the vle knows it exists.
 * TODO: rename both occurrences of WebAppNode
 * 
 * e.g. if you are creating a quiz step you would change it to
 * 
 * NodeFactory.addNode('QuizNode', QuizNode);
 */
NodeFactory.addNode('WebAppNode', WebAppNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename webApp to your new folder name
	 * TODO: rename WebAppNode
	 * 
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/QuizNode.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/webApp/WebAppNode.js');
};