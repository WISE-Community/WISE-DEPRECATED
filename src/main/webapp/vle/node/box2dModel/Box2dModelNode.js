/*
 * This a box2dModel Node that developers can use to create new 
 * step types. Copy this file and rename it to 
 *
 * <new step type>Node.js
 * e.g. for example if you are creating a quiz step type it would
 * look something like QuizNode.js
 * 
 * and then in this file change all occurrences of the word 'Box2dModelNode' to 
 * 
 * <new step type>Node
 * 
 * e.g. for example if you are creating a quiz step type you would
 * change it to be QuizNode
 */

Box2dModelNode.prototype = new Node(); //TODO: rename Box2dModelNode
Box2dModelNode.prototype.constructor = Box2dModelNode; //TODO: rename both occurrences of Box2dModelNode
Box2dModelNode.prototype.parentNode = Node.prototype; //TODO: rename Box2dModelNode

/*
 * the name that displays in the authoring tool when the author creates a new step
 * 
 * TODO: rename Box2dModelNode
 * TODO: rename Box2dModel to whatever you would like this step to be displayed as in
 * the authoring tool when the author creates a new step
 * e.g. if you are making a QuizNode you would set authoringToolName to to "Quiz"
 */
Box2dModelNode.authoringToolName = "Box2dModel"; 

/*
 * TODO: rename Box2dModelNode
 * TODO: set the authoringToolDescription to describe the step type, this description
 * will be seen by the author when they add a new step to their project to help
 * them understand what kind of step this is
 */
Box2dModelNode.authoringToolDescription = "This project allows students to create virtual objects and observe them in virtual worlds controlled by box2d - a physics engine.  Talk to Jonathan Vitale about how to use this step appropriately.";

Box2dModelNode.tagMapFunctions = [
	{functionName:'getPreviousModels', functionArgs:[]},
	{functionName:'getValueFromTableForDensity', functionArgs:['column', 'row']}
];
/**
 * This is the constructor for the Node
 * 
 * TODO: rename Box2dModelNode
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 */
function Box2dModelNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
	
	/////
	////	THESE NEED TO BE PLACED IN box2dModelEvents as well;

	this.customEventTypes = [
		'make-model', 
		'revise-model',
		'duplicate-model', 
		'delete-model', 
		'make-beaker', 
		'delete-beaker', 
		'make-scale', 
		'delete-scale', 
		'add-to-beaker', 
		'add-to-scale', 
		'add-to-balance', 
		'remove-from-beaker', 
		'remove-from-scale', 
		'remove-from-balance', 
		'test-in-beaker', 
		'test-on-scale', 
		'test-on-balance',
		'release-from-beaker',
		'gave-feedback',
		'save-pressed',
		'graph-clicked',
		'table-changed'
	];	
}

/**
 * This function is called when the vle loads the step and parses
 * the previous student answers, if any, so that it can reload
 * the student's previous answers into the step.
 * 
 * TODO: rename Box2dModelNode
 * 
 * @param stateJSONObj
 * @return a new state object
 */
Box2dModelNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	/*
	 * TODO: rename Box2dModelState
	 * 
	 * make sure you rename Box2dModelState to the state object type
	 * that you will use for representing student data for this
	 * type of step. copy and modify the file below
	 * 
	 * vlewrapper/WebContent/vle/node/box2dModel/box2dModelState.js
	 * 
	 * and use the object defined in your new state.js file instead
	 * of Box2dModelState. for example if you are creating a
	 * quiz step type you would copy the file above to
	 * 
	 * vlewrapper/WebContent/vle/node/quiz/quizState.js
	 * 
	 * and in that file you would define QuizState and therefore
	 * would change the Box2dModelState to QuizState below
	 */ 
	return Box2dModelState.prototype.parseDataJSONObj(stateJSONObj);
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
 * TODO: rename Box2dModelNode
 * 
 * @param studentWork
 * @return translated student work
 */
Box2dModelNode.prototype.translateStudentWork = function(studentWork) {
	return studentWork;
};

/**
 * Sets up a WorkOnXConstraint before rendering so that students will
 * not be able to navigate to any other step before completing work on
 * this step if that was specified in the content.
 * 
 * @param contentPanel
 * @param studentWork
 */
Box2dModelNode.prototype.render = function(contentPanel,studentWork, disable) {
	// add constraints
	this.addConstraints();
	
	/* call super */
	Node.prototype.render.call(this, contentPanel, studentWork, disable);
};


/**
 * Adds a new constraint for this open response if the content specifies that
 * student must complete work before exiting to another step
 */
Box2dModelNode.prototype.addConstraints = function() {
	if (!this.isCompleted() && (typeof this.view.authoringMode === "undefined" || this.view.authoringMode == null || !this.view.authoringMode)){
		this.view.addActiveTagMapConstraint(this.id, null, 'mustCompleteBeforeAdvancing', null, null);
	}
		
};


/**
 * Override of Node.overridesIsCompleted
 * Specifies whether the node overrides Node.isCompleted
 */
Box2dModelNode.prototype.overridesIsCompleted = function() {
	return true;
};

/**
 * Override of Node.isCompleted
 * Get whether the step is completed or not
 * @return a boolean value whether the step is completed or not
 */
Box2dModelNode.prototype.isCompleted = function(nodeVisits) {
	return this.isStepCompleted;
};


/**
 * This function is called when the student exits the step. It is mostly
 * used for error checking.
 * 
 * TODO: rename Box2dModelNode
 * 
 * Note: In most cases you will not have to change anything here.
 */
Box2dModelNode.prototype.onExit = function() {
	try {
		//check if the content panel has been set
		if(this.contentPanel) {
			if (typeof this.contentPanel.tester !== "undefined") this.contentPanel.tester = null
			if (typeof this.contentPanel.builder !== "undefined") this.contentPanel.builder = null;
			if (typeof this.contentPanel.stage !== "undefined" && this.contentPanel.stage != null){
				this.contentPanel.stage.removeAllChildren();
				this.contentPanel.stage = null;
			}
			if(this.contentPanel.save) {
				//tell the content panel to save
				this.contentPanel.save("exit");
			}
		}
	} catch(e) {
		
	}

    // get the next position
    var nextPosition = this.view.nextPosition;

    // get the current position
    var currentPosition = view.getCurrentPosition();

    // check if the next position comes after the current position
    if (nextPosition != null &&
        currentPosition != null &&
        this.view.getProject().positionAfter(nextPosition, currentPosition)) {
        // the next position comes after the current position

        // get the latest node visit
        var nodeVisit = this.view.getState().getCurrentNodeVisit();
        var nodeState = null;

        if (nodeVisit != null && nodeVisit.nodeStates.length > 0) {
            // get the latest node state
            nodeState = nodeVisit.nodeStates[nodeVisit.nodeStates.length - 1];
        }

        if (nodeVisit != null && nodeState != null) {
            // process teacher notifications if there are any
            this.contentPanel.box2dModel.processTeacherNotifications(nodeVisit, nodeState);
        }
    }
};

/**
 * Renders the student work into the div. The grading tool will pass in a
 * div id to this function and this function will insert the student data
 * into the div.
 * 
 * @param divId the id of the div we will render the student work into
 * @param nodeVisit the student work
 * @param childDivIdPrefix (optional) a string that will be prepended to all the 
 * div ids use this to prevent DOM conflicts such as when the show all work div
 * uses the same ids as the show flagged work div
 * @param workgroupId the id of the workgroup this work belongs to
 * 
 * TODO: rename Box2dModelNode
 * Note: you may need to add code to this function if the student
 * data for your step is complex or requires additional processing.
 * look at SensorNode.renderGradingView() as an example of a step that
 * requires additional processing
 */
Box2dModelNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	/*
	 * Get the latest student state object for this step
	 * TODO: rename box2dModelState to reflect your new step type
	 * 
	 * e.g. if you are creating a quiz step you would change it to quizState
	 */
	var box2dModelState = nodeVisit.getLatestWork();
	
	/*
	 * get the step work id from the node visit in case we need to use it in
	 * a DOM id. we don't use it in this case but I have retrieved it in case
	 * someone does need it. look at SensorNode.js to view an example of
	 * how one might use it.
	 */
	var stepWorkId = nodeVisit.id;
	
	/*
	 * TODO: rename box2dModelState to match the variable name you
	 * changed in the previous line above
	 */
	var studentWork = box2dModelState.getStudentWork();
	
	//put the student work into the div
	$(displayStudentWorkDiv).html(this.getStudentWorkHtmlView(studentWork));
};

/**
 * Get the html file associated with this step that we will use to
 * display to the student.
 * 
 * TODO: rename Box2dModelNode
 * 
 * @return a content object containing the content of the associated
 * html for this step type
 */
Box2dModelNode.prototype.getHTMLContentTemplate = function() {
	/*
	 * TODO: rename both occurrences of box2dModel
	 * 
	 * e.g. if you are creating a quiz step you would change it to
	 * 
	 * node/quiz/quiz.html
	 */
	return createContent('node/box2dModel/box2dModel.html');
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
Box2dModelNode.prototype.hasGradingView = function() {
	return true;
};


/**
 * Get the html string representation of the student work
 * @param work the student node state that we want to display
 * @return an html string that will display the student work
 */
Box2dModelNode.prototype.getStudentWorkHtmlView = function(work) {
	
	var html = '<div id="response-holder">' + work.response + '</div>';

	html = html +'<div id="image-holder">';
	if (work.modelData != null && work.modelData.images != null && work.modelData.images.length > 0) {
		for (var i = 0; i < work.modelData.images.length; i++) {
			var img = work.modelData.images[i];
			html = html + '<img id="' + img.id + '" src="' + img.src + '" width=' + img.width + ' height=' + img.height + '/>';
			html = html + '<span style="position:relative; top:' + (15) + 'px; left:' + (-img.width) + 'px">' + img.id + '</span>';
		}
	}
	html = html + '</div>';
	//console.log(html);
	return html;
};

/**
 * Get the tag map functions that are available for this step type
 */
Box2dModelNode.prototype.getTagMapFunctions = function() {
	//get all the tag map function for this step type
	var tagMapFunctions = Box2dModelNode.tagMapFunctions;
	
	return tagMapFunctions;
};

/**
 * Get a tag map function given the function name
 * @param functionName
 * @return 
 */
Box2dModelNode.prototype.getTagMapFunctionByName = function(functionName) {
	var fun = null;
	
	//get all the tag map function for this step type
	var tagMapFunctions = this.getTagMapFunctions();
	
	//loop through all the tag map functions
	for(var x=0; x<tagMapFunctions.length; x++) {
		//get a tag map function
		var tagMapFunction = tagMapFunctions[x];
		
		if(tagMapFunction != null) {
			
			//check if the function name matches
			if(functionName == tagMapFunction.functionName) {
				//the function name matches so we have found what we want
				fun = tagMapFunction;
				break;
			}			
		}
	};
	
	return fun;
};

/**
 * Returns whether this step type can be special exported
 * @return a boolean value
 */
Box2dModelNode.prototype.canSpecialExport = function() {
	return true;
};

/*
 * Add this node to the node factory so the vle knows it exists.
 * TODO: rename both occurrences of Box2dModelNode
 * 
 * e.g. if you are creating a quiz step you would change it to
 * 
 * NodeFactory.addNode('QuizNode', QuizNode);
 */
NodeFactory.addNode('Box2dModelNode', Box2dModelNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename box2dModel to your new folder name
	 * TODO: rename Box2dModelNode
	 * 
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/QuizNode.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/box2dModel/Box2dModelNode.js');
};