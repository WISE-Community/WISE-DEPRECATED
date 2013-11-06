/*
 * This is a template state object that developers can use to create new
 * step types.
 *
 * xTODO: Copy this file and rename it to
 * 
 * <new step type>state.js
 * e.g. for example if you are creating a quiz step it would look
 * something like quizstate.js
 *
 * and then put the new file into the new folder
 * you created for your new step type
 *
 * your new folder will look something like
 * vlewrapper/WebContent/vle/node/<new step type>/
 *
 * e.g. if you are creating a quiz step it would look something like
 * vlewrapper/WebContent/vle/node/quiz/
 * 
 * xTODO: in this file, change all occurrences of the word 'TEMPLATESTATE' to
 * 
 * <new step type>STATE
 * e.g. for example if you are creating a quiz step it would look
 * something like QUIZSTATE
 */

/**
 * This is the constructor for the state object that will be used to represent the
 * student work. An instance of this object will be created each time the student
 * submits an answer.
 * 
 * xTODO: rename TEMPLATESTATE
 * 
 * note: you can change the variables in this constructor, the response variable
 * is just used as an example. you can add any variables that will help you 
 * represent the student's work for your step type.
 * @constructor
 */
function ExplanationBuilderState(explanationIdeas, answer, timestamp) {
	this.explanationIdeas = [];
	this.answer = '';
	this.timestamp;
	var selected = [];
	
	if(explanationIdeas != null) {
		this.explanationIdeas = explanationIdeas;
	}
	
	if(answer != null) {
		this.answer = answer;
	}
	
	if(timestamp != null) {
		this.timestamp = timestamp;
	}
};

/**
 * @constructor
 */
function ExplanationIdea(id,xpos,ypos,color,lastAcceptedText){
	this.id = id;
	this.xpos = xpos;
	this.ypos = ypos;
	if(color){
		this.color = color; 
	} else {
		this.color = 'rgb(38, 84, 207)';
	}
	if(lastAcceptedText){
		this.lastAcceptedText = lastAcceptedText;
	}
};

/**
 * This function is used to reload previous work the student submitted for the step.
 * The student work is retrieved and then this function is called to parse the student
 * work so that we can display the previous answer the student submitted.
 * 
 * xTODO: rename TEMPLATESTATE
 * 
 * note: you can change the variables in the stateJSONObj, the response 
 * variable is just used as an example. you can add any variables that will  
 * help you represent the student's work for your type of step.
 * 
 * @param stateJSONObj a JSONObject representing the student work
 * @return a TEMPLATESTATE object
 */
ExplanationBuilderState.prototype.parseDataJSONObj = function(stateJSONObj) {
	//obtain the student work from the JSONObject
	//var response = stateJSONObj.response;

	var explanationIdeas = stateJSONObj.explanationIdeas;
	var answer = stateJSONObj.answer;
	var timestamp = stateJSONObj.timestamp;
	
	/*
	 * create a state object with the student work
	 * xTODO: rename TEMPLATESTATE
	 */
	var explanationBuilderState = new ExplanationBuilderState(explanationIdeas, answer, timestamp);
	
	//return the state object
	return explanationBuilderState;
};

/**
 * Get the student work for display purposes such as in the grading tool.
 * 
 * xTODO: rename TEMPLATESTATE
 * 
 * @return the student work
 */
ExplanationBuilderState.prototype.getStudentWork = function() {
	return this;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	//xTODO: rename template/templatestate.js
	eventManager.fire('scriptLoaded', 'vle/node/explanationbuilder/explanationbuilderstate.js');
}