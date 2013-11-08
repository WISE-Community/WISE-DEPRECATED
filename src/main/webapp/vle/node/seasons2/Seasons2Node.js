/*
 * This a seasons2 Node that developers can use to create new
 * step types. Copy this file and rename it to
 *
 * <new step type>Node.js
 * e.g. for example if you are creating a quiz step type it would
 * look something like QuizNode.js
 *
 * and then in this file change all occurrences of the word 'Seasons2Node' to
 *
 * <new step type>Node
 *
 * e.g. for example if you are creating a quiz step type you would
 * change it to be QuizNode
 */

Seasons2Node.prototype = new Node(); //TODO: rename Seasons2Node
Seasons2Node.prototype.constructor = Seasons2Node; //TODO: rename both occurrences of Seasons2Node
Seasons2Node.prototype.parentNode = Node.prototype; //TODO: rename Seasons2Node

/*
 * the name that displays in the authoring tool when the author creates a new step
 *
 * TODO: rename Seasons2Node
 * TODO: rename Template to whatever you would like this step to be displayed as in
 * the authoring tool when the author creates a new step
 * e.g. if you are making a QuizNode you would set authoringToolName to to "Quiz"
 */
Seasons2Node.authoringToolName = "Seasons2";

/*
 * TODO: rename Seasons2Node
 * TODO: set the authoringToolDescription to describe the step type, this description
 * will be seen by the author when they add a new step to their project to help
 * them understand what kind of step this is
 */
Seasons2Node.authoringToolDescription = "This is a generic step only used by developers";

Seasons2Node.tagMapFunctions = [
	{functionName:'importWork', functionArgs:[]},
	{functionName:'showPreviousWork', functionArgs:[]}
];

/**
 * This is the constructor for the Node
 *
 * TODO: rename Seasons2Node
 *
 * @param nodeType
 * @param view
 */
function Seasons2Node(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
	
	this.tagMapFunctions = this.tagMapFunctions.concat(Seasons2Node.tagMapFunctions);
}

/**
 * This function is called when the vle loads the step and parses
 * the previous student answers, if any, so that it can reload
 * the student's previous answers into the step.
 *
 * TODO: rename Seasons2Node
 *
 * @param stateJSONObj
 * @return a new state object
 */
Seasons2Node.prototype.parseDataJSONObj = function(stateJSONObj) {
	/*
   * TODO: rename TEMPLATESTATE
   *
   * make sure you rename TEMPLATESTATE to the state object type
   * that you will use for representing student data for this
   * type of step. copy and modify the file below
   *
   * vlewrapper/WebContent/vle/node/seasons2/seasons2state.js
   *
   * and use the object defined in your new state.js file instead
   * of TEMPLATESTATE. for example if you are creating a
   * quiz step type you would copy the file above to
   *
   * vlewrapper/WebContent/vle/node/quiz/quizstate.js
   *
   * and in that file you would define QUIZSTATE and therefore
   * would change the TEMPLATESTATE to QUIZSTATE below
   */
	return SEASONS2STATE.prototype.parseDataJSONObj(stateJSONObj);
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
 * TODO: rename Seasons2Node
 *
 * @param studentWork
 * @return translated student work
 */
Seasons2Node.prototype.translateStudentWork = function(studentWork) {
	return studentWork;
};

/**
 * This function is called when the student exits the step. It is mostly
 * used for error checking.
 *
 * TODO: rename Seasons2Node
 *
 * Note: In most cases you will not have to change anything here.
 */
Seasons2Node.prototype.onExit = function() {
	try {
		//check if the content panel has been set
		if(this.contentPanel) {

			if(this.contentPanel.save) {
				//tell the content panel to save
				this.contentPanel.save();
			}

			if(this.contentPanel.onExit) {
				//run the on exit cleanup
				this.contentPanel.onExit();
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
 * TODO: rename Seasons2Node
 * Note: you may need to add code to this function if the student
 * data for your step is complex or requires additional processing.
 * look at SensorNode.renderGradingView() as an example of a step that
 * requires additional processing
 */
Seasons2Node.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	/*
   * Get the latest student state object for this step
   * TODO: rename seasons2State to reflect your new step type
   *
   * e.g. if you are creating a quiz step you would change it to quizState
   */
	var seasons2State = nodeVisit.getLatestWork();

	/*
   * get the step work id from the node visit in case we need to use it in
   * a DOM id. we don't use it in this case but I have retrieved it in case
   * someone does need it. look at SensorNode.js to view an example of
   * how one might use it.
   */
	var stepWorkId = nodeVisit.id;

	/*
   * TODO: rename seasons2State to match the variable name you
   * changed in the previous line above
   */
	var studentWork = seasons2State.getStudentWork();

	//put the student work into the div
	displayStudentWorkDiv.html(studentWork);
};

/**
 * Get the html file associated with this step that we will use to
 * display to the student.
 *
 * TODO: rename Seasons2Node
 *
 * @return a content object containing the content of the associated
 * html for this step type
 */
Seasons2Node.prototype.getHTMLContentTemplate = function() {
	/*
   * TODO: rename both occurrences of seasons2
   *
   * e.g. if you are creating a quiz step you would change it to
   *
   * node/quiz/quiz.html
   */
	return createContent('node/seasons2/seasons2.html');
};

/**
 * Callback when the iFrame has completed loading the model.
 * @return
 */
Seasons2Node.prototype.modelIFrameLoaded = function() {
	this.contentPanel.seasons2.modelIFrameLoaded();
};

/*
 * Add this node to the node factory so the vle knows it exists.
 * TODO: rename both occurrences of Seasons2Node
 *
 * e.g. if you are creating a quiz step you would change it to
 *
 * NodeFactory.addNode('QuizNode', QuizNode);
 */
NodeFactory.addNode('Seasons2Node', Seasons2Node);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
   * TODO: rename seasons2 to your new folder name
   * TODO: rename Seasons2Node
   *
   * e.g. if you were creating a quiz step it would look like
   *
   * eventManager.fire('scriptLoaded', 'vle/node/quiz/QuizNode.js');
   */
	eventManager.fire('scriptLoaded', 'vle/node/seasons2/Seasons2Node.js');
};