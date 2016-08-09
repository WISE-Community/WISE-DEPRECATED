/*
 * This a grapher Node that developers can use to create new 
 * step types. Copy this file and rename it to 
 *
 * <new step type>Node.js
 * e.g. for example if you are creating a quiz step type it would
 * look something like QuizNode.js
 * 
 * and then in this file change all occurrences of the word 'GrapherNode' to 
 * 
 * <new step type>Node
 * 
 * e.g. for example if you are creating a quiz step type you would
 * change it to be QuizNode
 */

GrapherNode.prototype = new Node(); //TODO: rename GrapherNode
GrapherNode.prototype.constructor = GrapherNode; //TODO: rename both occurrences of GrapherNode
GrapherNode.prototype.parentNode = Node.prototype; //TODO: rename GrapherNode

/*
 * the name that displays in the authoring tool when the author creates a new step
 * 
 * TODO: rename GrapherNode
 * TODO: rename Grapher to whatever you would like this step to be displayed as in
 * the authoring tool when the author creates a new step
 * e.g. if you are making a QuizNode you would set authoringToolName to to "Quiz"
 */
GrapherNode.authoringToolName = "Series Grapher"; 

/*
 * TODO: rename GrapherNode
 * TODO: set the authoringToolDescription to describe the step type, this description
 * will be seen by the author when they add a new step to their project to help
 * them understand what kind of step this is
 */
GrapherNode.authoringToolDescription = "This is a lightweight version of the grapher step that allows graphing of multiple series, and connects to the cargraph step.";

GrapherNode.prototype.i18nEnabled = true;
GrapherNode.prototype.i18nPath = "vle/node/grapher/i18n/";
GrapherNode.prototype.supportedLocales = {
	"en_US":"en_US",
	"es":"es",
	"ko":"ko",
	"iw":"he",
	"nl":"nl",
	"nl_GE":"nl",
	"nl_DE":"nl",
	"tr":"tr",
	"zh_CN":"zh_CN"
};

GrapherNode.tagMapFunctions = [
	{functionName:'importWork', functionArgs:[]},
	{functionName:'showPreviousWork', functionArgs:[]},
	{functionName:'mustNotExceedMaxErrorBeforeAdvancing', functionArgs:['maxError']},
	{functionName:'mustNotExceedAvgErrorBeforeAdvancing', functionArgs:['avgError']},
	{functionName:'importTable', functionArgs:['showTestedMassValuesOnly', 'showTestedLiquidValuesOnly','arrColumnNamesToImport', 'arrColumnNamesToDisplay']}
];

/**
 * This is the constructor for the Node
 * 
 * TODO: rename GrapherNode
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 */
function GrapherNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
	this.tagMapFunctions = this.tagMapFunctions.concat(GrapherNode.tagMapFunctions);
}

/**
 * This function is called when the vle loads the step and parses
 * the previous student answers, if any, so that it can reload
 * the student's previous answers into the step.
 * 
 * TODO: rename GrapherNode
 * 
 * @param stateJSONObj
 * @return a new state object
 */
GrapherNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	/*
	 * TODO: rename GrapherState
	 * 
	 * make sure you rename GrapherState to the state object type
	 * that you will use for representing student data for this
	 * type of step. copy and modify the file below
	 * 
	 * wise/src/main/webapp/vle/node/grapher/grapherState.js
	 * 
	 * and use the object defined in your new state.js file instead
	 * of GrapherState. for example if you are creating a
	 * quiz step type you would copy the file above to
	 * 
	 * wise/src/main/webapp/vle/node/quiz/quizState.js
	 * 
	 * and in that file you would define QuizState and therefore
	 * would change the GrapherState to QuizState below
	 */ 
	return GrapherState.prototype.parseDataJSONObj(stateJSONObj);
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
 * TODO: rename GrapherNode
 * 
 * @param studentWork
 * @return translated student work
 */
GrapherNode.prototype.translateStudentWork = function(studentWork) {
	return studentWork;
};

/**
 * This function is called when the student exits the step. It is mostly
 * used for error checking.
 * 
 * TODO: rename GrapherNode
 * 
 * Note: In most cases you will not have to change anything here.
 */
GrapherNode.prototype.onExit = function() {
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
 * @param divId the id of the div we will render the student work into
 * @param nodeVisit the student work
 * @param childDivIdPrefix (optional) a string that will be prepended to all the 
 * div ids use this to prevent DOM conflicts such as when the show all work div
 * uses the same ids as the show flagged work div
 * @param workgroupId the id of the workgroup this work belongs to
 * 
 * TODO: rename GrapherNode
 * Note: you may need to add code to this function if the student
 * data for your step is complex or requires additional processing.
 * look at GrapherNode.renderGradingView() as an example of a step that
 * requires additional processing
 */
GrapherNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	//create a Grapher object that we will use to perform all the graphing logic for us
	var grapher = new Grapher(this, this.view);
	
	if(childDivIdPrefix == null) {
		//the default child div id prefix will be "" if none is provided
		childDivIdPrefix = "";
	}
	
	//get the step work id from the node visit
	var stepWorkId = nodeVisit.id;
	
	if(stepWorkId == null) {
		stepWorkId = '';
	}
	
	var grapherState = nodeVisit.getLatestWork();
	
	//set the grapher state into our grapher object
	grapher.grapherState = grapherState;
	
	/*
	 * get the data array from the grapher state in the format
	 * that we can send to flot
	 */
	var graphDataArray = grapher.generateGraphDataArray(grapherState);
	
	//get the graph parameters from the content
	var graphParams = grapher.parseGraphParams(this.content.getContentJSON().graphParams);

	//create the grapher graph div that we will use to display the graph
	var grapherGraphDiv = createElement(document, 'div', {id: childDivIdPrefix + 'grapherGraphDiv_' + stepWorkId, style:'width:400px;height:200px;'});
	
	//create the div that will display the check boxes to filter the lines (if this graph has multiple lines, if not, this will be empty)
	var grapherGraphCheckBoxesDiv = createElement(document, 'div', {id: childDivIdPrefix + 'grapherGraphCheckBoxesDiv_' + stepWorkId});
	
	//create the div that will display the student annotations for the graph
	var grapherAnnotationsDiv = createElement(document, 'div', {id: childDivIdPrefix + 'grapherAnnotationsDiv_' + stepWorkId});
	
	//create the response div that we will use to display what the student typed
	var grapherResponseDiv = createElement(document, 'div', {id: childDivIdPrefix + 'grapherResponseDiv_' + stepWorkId});
	
	//add all the divs to the main work div 
	displayStudentWorkDiv.append(grapherGraphDiv);
	displayStudentWorkDiv.append(grapherGraphCheckBoxesDiv);
	displayStudentWorkDiv.append(grapherAnnotationsDiv);
	displayStudentWorkDiv.append(grapherResponseDiv);
	
	//plot the graph in the grapher graph div
	grapher.plotData($(grapherGraphDiv), $(grapherGraphCheckBoxesDiv));
	
	/*
	 * used to hide or show the annotation tool tips. if the teacher has
	 * their mouse in the graph div we will hide the annotation tool tips
	 * so that they don't block them from viewing the plot points.
	 * when the mouse cursor is outside of the graph div we will show the
	 * annotation tool tips for them to view.
	 */
	$(grapherGraphDiv).bind('mouseover', (function(event) {
		$(".activeAnnotationToolTip").hide();
	}));
	$(grapherGraphDiv).bind('mouseleave', (function(event) {
		$(".activeAnnotationToolTip").show();
	}));
	
	//get the annotations as a string
	var annotationsHtml = grapherState.getAnnotationsHtml();
	
	//set the annotations text
	$(grapherAnnotationsDiv).html(annotationsHtml);
	
	//get the student response that was typed
	var response = grapherState.response;
	
	//replace \n with <br> so that the line breaks are displayed for the teacher
	response = this.view.replaceSlashNWithBR(response);
	
	//insert the response the student typed
	$(grapherResponseDiv).html(response);
};

/**
 * Get the tag map functions that are available for this step type
 *
GrapherNode.prototype.getTagMapFunctions = function() {
	//get all the tag map function for this step type
	var tagMapFunctions = GrapherNode.tagMapFunctions;
	
	return tagMapFunctions;
};

**
 * Get a tag map function given the function name
 * @param functionName
 * @return 
 *
GrapherNode.prototype.getTagMapFunctionByName = function(functionName) {
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
*/

/**
 * Override of Node.overridesIsCompleted
 * Specifies whether the node overrides Node.isCompleted
 */
GrapherNode.prototype.overridesIsCompleted = function() {
	return true;
};

/**
 * Override of Node.isCompleted
 * Get whether the step is completed or not
 * @return a boolean value whether the step is completed or not
 */
GrapherNode.prototype.isCompleted = function(nodeVisits) {
	var result = false;

	if(nodeVisits != null) {
		//get the step content
		var content = this.content.getContentJSON();
		
		if(content != null && content.externalScript != null && content.externalScriptSetsIsCompleted == true) {
			/*
			 * the step uses an external script and sets isCompleted in the 
			 * external script so in order for the student to complete
			 * the step there must be a field of isCompleted with value 
			 * true in one of the node states
			 */
			result = this.view.nodeStateInNodeVisitsIsCompleted(nodeVisits);
		} else {
			/*
			 * this is a regular step that does not use an external script
			 * so we will just check if there are any node states
			 */
			
			//loop through all the node visits
			for(var x=0; x<nodeVisits.length; x++) {
				//get a node visit
				var nodeVisit = nodeVisits[x];
				
				if(nodeVisit != null) {
					//get the node states
					var nodeStates = nodeVisit.nodeStates;
					
					if(nodeStates != null) {
						if(nodeStates.length > 0) {
							//there are node states so the student has completed the step
							result = true;
							break;
						}
					}
				}
			}
		}
	}
	
	return result;
};

/**
 * Returns whether this step type can be special exported
 * @return a boolean value
 */
GrapherNode.prototype.canSpecialExport = function() {
	return true;
};


/**
 * Get the html file associated with this step that we will use to
 * display to the student.
 * 
 * TODO: rename GrapherNode
 * 
 * @return a content object containing the content of the associated
 * html for this step type
 */
GrapherNode.prototype.getHTMLContentTemplate = function() {
	/*
	 * TODO: rename both occurrences of grapher
	 * 
	 * e.g. if you are creating a quiz step you would change it to
	 * 
	 * node/quiz/quiz.html
	 */
	return createContent('node/grapher/grapher.html');
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
GrapherNode.prototype.hasGradingView = function() {
	return true;
};

/*
 * Add this node to the node factory so the vle knows it exists.
 * TODO: rename both occurrences of GrapherNode
 * 
 * e.g. if you are creating a quiz step you would change it to
 * 
 * NodeFactory.addNode('QuizNode', QuizNode);
 */
NodeFactory.addNode('GrapherNode', GrapherNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename grapher to your new folder name
	 * TODO: rename GrapherNode
	 * 
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/QuizNode.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/grapher/GrapherNode.js');
};