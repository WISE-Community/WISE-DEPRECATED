/*
 * This is a webApp state object that developers can use to create new
 * step types.
 *
 * TODO: Copy this file and rename it to
 * 
 * <new step type>State.js
 * e.g. for example if you are creating a quiz step it would look
 * something like quizState.js
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
 * TODO: in this file, change all occurrences of the word 'WebAppState' to
 * 
 * <new step type>State
 * e.g. for example if you are creating a quiz step it would look
 * something like QuizState
 */

/**
 * This is the constructor for the state object that will be used to represent the
 * student work. An instance of this object will be created each time the student
 * submits an answer.
 * 
 * TODO: rename WebAppState
 * 
 * note: you can change the variables in this constructor, the response variable
 * is just used as an example. you can add any variables that will help you 
 * represent the student's work for your step type.
 * 
 * @constructor
 */
function WebAppState(response, statestring, gradingHTML ) {
	console.log("DEBUG: entered constructor in webappstate.js");

	this.response = "";
	this.stateString = "";
	this.gradingViewHTML = "<html>test</html>";

	if(response != null) {
		this.response = response;
	}
	if(statestring != null) {
		this.stateString = statestring;
	}
	if(gradingHTML != null) {
		this.gradingViewHTML = gradingHTML;
	}
};

/**
 * This function is used to reload previous work the student submitted for the step.
 * The student work is retrieved and then this function is called to parse the student
 * work so that we can display the previous answer the student submitted.
 * 
 * TODO: rename WebAppState
 * 
 * note: you can change the variables in the stateJSONObj, the response 
 * variable is just used as an example. you can add any variables that will  
 * help you represent the student's work for your type of step.
 * 
 * @param stateJSONObj a JSONObject representing the student work
 * @return a WebAppState object
 */
WebAppState.prototype.parseDataJSONObj = function(stateJSONObj) {
	//obtain the student work from the JSONObject
	var response = stateJSONObj.response;
	var statestring = stateJSONObj.stateString;
	var gradingHTML = stateJSONObj.gradingViewHTML;
	/*
	 * create a state object with the student work
	 */
	var webAppState = new WebAppState(response, statestring, gradingHTML);
	
	//return the state object
	return webAppState;
};

/**
 * Get the student work for display purposes such as in the grading tool.
 * 
 * TODO: rename WebAppState
 * 
 * @return the student work
 */
WebAppState.prototype.getStudentWork = function() {
	var studentWork = this;
	
	return studentWork;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	//TODO: rename webApp/webAppState.js
	eventManager.fire('scriptLoaded', 'vle/node/webApp/webAppState.js');
}