/*
 * This a template Node that developers can use to create new 
 * step types. Copy this file and rename it to 
 *
 * <new step type>Node.js
 * e.g. for example if you are creating a quiz step type it would
 * look something like QuizNode.js
 * 
 * and then in this file change all occurrences of the word 'TemplateNode' to 
 * 
 * <new step type>Node
 * 
 * e.g. for example if you are creating a quiz step type you would
 * change it to be QuizNode
 */

TemplateNode.prototype = new Node(); //TODO: rename TemplateNode
TemplateNode.prototype.constructor = TemplateNode; //TODO: rename both occurrences of TemplateNode
TemplateNode.prototype.parentNode = Node.prototype; //TODO: rename TemplateNode

/*
 * the name that displays in the authoring tool when the author creates a new step
 * 
 * TODO: rename TemplateNode
 * TODO: rename Template to whatever you would like this step to be displayed as in
 * the authoring tool when the author creates a new step
 * e.g. if you are making a QuizNode you would set authoringToolName to to "Quiz"
 */
TemplateNode.authoringToolName = "Template"; 

/*
 * TODO: rename TemplateNode
 * TODO: set the authoringToolDescription to describe the step type, this description
 * will be seen by the author when they add a new step to their project to help
 * them understand what kind of step this is
 */
TemplateNode.authoringToolDescription = "This is a generic step only used by developers";

TemplateNode.tagMapFunctions = [
	{functionName:'importWork', functionArgs:[]},
	{functionName:'showPreviousWork', functionArgs:[]}
];

/**
 * This is the constructor for the Node
 * 
 * TODO: rename TemplateNode
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 */
function TemplateNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
	
	this.tagMapFunctions = this.tagMapFunctions.concat(TemplateNode.tagMapFunctions);
}

/**
 * This function is called when the vle loads the step and parses
 * the previous student answers, if any, so that it can reload
 * the student's previous answers into the step.
 * 
 * TODO: rename TemplateNode
 * 
 * @param stateJSONObj
 * @return a new state object
 */
TemplateNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	/*
	 * TODO: rename TemplateState
	 * 
	 * make sure you rename TemplateState to the state object type
	 * that you will use for representing student data for this
	 * type of step. copy and modify the file below
	 * 
	 * vlewrapper/WebContent/vle/node/template/templateState.js
	 * 
	 * and use the object defined in your new state.js file instead
	 * of TemplateState. for example if you are creating a
	 * quiz step type you would copy the file above to
	 * 
	 * vlewrapper/WebContent/vle/node/quiz/quizState.js
	 * 
	 * and in that file you would define QuizState and therefore
	 * would change the TemplateState to QuizState below
	 */ 
	return TemplateState.prototype.parseDataJSONObj(stateJSONObj);
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
 * TODO: rename TemplateNode
 * 
 * @param studentWork
 * @return translated student work
 */
TemplateNode.prototype.translateStudentWork = function(studentWork) {
	return studentWork;
};

/**
 * This function is called when the student exits the step. It is mostly
 * used for error checking.
 * 
 * TODO: rename TemplateNode
 * 
 * Note: In most cases you will not have to change anything here.
 */
TemplateNode.prototype.onExit = function() {
	try {
		//check if the content panel has been set
		if(this.contentPanel) {
			if(this.contentPanel.save) {
				//tell the content panel to save
				this.contentPanel.save();
			}
		}
	} catch(e) {
		
	}
};

/**
 * Renders the student work into the div. The grading tool will pass in a
 * div id to this function and this function will insert the student data
 * into the div.
 * 
 * @param displayStudentWorkDiv the div we will render the student work into
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
TemplateNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	/*
	 * Get the latest student state object for this step
	 * TODO: rename templateState to reflect your new step type
	 * 
	 * e.g. if you are creating a quiz step you would change it to quizState
	 */
	var templateState = nodeVisit.getLatestWork();
	
	/*
	 * get the step work id from the node visit in case we need to use it in
	 * a DOM id. we don't use it in this case but I have retrieved it in case
	 * someone does need it. look at SensorNode.js to view an example of
	 * how one might use it.
	 */
	var stepWorkId = nodeVisit.id;
	
	/*
	 * TODO: rename templateState to match the variable name you
	 * changed in the previous line above
	 */
	var studentWork = templateState.getStudentWork();
	
	//put the student work into the div
	displayStudentWorkDiv.html(studentWork.response);
};

/**
 * Get the html file associated with this step that we will use to
 * display to the student.
 * 
 * TODO: rename TemplateNode
 * 
 * @return a content object containing the content of the associated
 * html for this step type
 */
TemplateNode.prototype.getHTMLContentTemplate = function() {
	/*
	 * TODO: rename both occurrences of template
	 * 
	 * e.g. if you are creating a quiz step you would change it to
	 * 
	 * node/quiz/quiz.html
	 */
	return createContent('node/template/template.html');
};

/**
 * Whether this step type has a grading view. Steps types that do not
 * save any student work will not have a grading view such as HTMLNode
 * and OutsideUrlNode. For those step types, this function should
 * return false. If you return false, the step will be grayed out
 * in the grading tool and will not be shown in the student vle
 * show all work section.
 * 
 * TODO: rename TemplateNode
 * 
 * @returns whether this step type has a grading view
 */
TemplateNode.prototype.hasGradingView = function() {
	return true;
};

/*
 * Add this node to the node factory so the vle knows it exists.
 * TODO: rename both occurrences of TemplateNode
 * 
 * e.g. if you are creating a quiz step you would change it to
 * 
 * NodeFactory.addNode('QuizNode', QuizNode);
 */
NodeFactory.addNode('TemplateNode', TemplateNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename template to your new folder name
	 * TODO: rename TemplateNode
	 * 
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/QuizNode.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/template/TemplateNode.js');
};