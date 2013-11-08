/*globals eventManager */

/**
 * This is the constructor for the state object that will be used to represent the
 * student work. An instance of this object will be created each time the student
 * submits an answer.
 * 
 * note: you can change the variables in this constructor, the response variable
 * is just used as an example. you can add any variables that will help you 
 * represent the student's work for your step type.
 */
function MYSYSTEM2STATE(response, isSubmit) {
  //remember the type to avoid corruption (i.e., loading a state saved by an openresponse WISE4 step)
  this.type = "mysystem2";
  
	//the text response the student wrote
	this.response = "";

	if(response !== null) {
		//set the response
		this.response = response;
	}
	
	this.isSubmit = isSubmit;
}

/**
 * This function is used to reload previous work the student submitted for the step.
 * The student work is retrieved and then this function is called to parse the student
 * work so that we can display the previous answer the student submitted.
 * 
 * note: you can change the variables in the stateJSONObj, the response 
 * variable is just used as an example. you can add any variables that will  
 * help you represent the student's work for your type of step.
 * 
 * @param stateJSONObj a JSONObject representing the student work
 * @return a MYSYSTEM2STATE object
 */
MYSYSTEM2STATE.prototype.parseDataJSONObj = function(stateJSONObj) {
	//obtain the student work from the JSONObject
	var response = stateJSONObj.response;
	
	//create a state object with the student work
	var mysystemState = new MYSYSTEM2STATE(response);
	
	//populate the isSubmit field if it exists
	if(stateJSONObj.isSubmit != null) {
		mysystemState.isSubmit = stateJSONObj.isSubmit;
	}
	
	//return the state object
	return mysystemState;
};

/**
 * Get the student work for display purposes such as in the grading tool.
 * 
 * @return the student work
 */
MYSYSTEM2STATE.prototype.getStudentWork = function() {
	var studentWork = this;
	
	return studentWork;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/mysystem2/mysystem2State.js');
}
