/**
 * This is the constructor for the state object that will be used to represent the
 * student work. An instance of this object will be created each time the student
 * submits an answer.
 * 
 * note: you can change the variables in this constructor, the response variable
 * is just used as an example. you can add any variables that will help you 
 * represent the student's work for your step type.
 * @constructor
 */
function FlashState(response) {
	//the response the student generated
	this.response = "";

	if(response != null) {
		//set the response
		this.response = response;
	}
};

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
 * @return a SurgeState object
 */
FlashState.prototype.parseDataJSONObj = function(stateJSONObj) {
	//obtain the student work from the JSONObject
	var response = stateJSONObj.response;
	
	//create a state object with the student work
	var flashState = new FlashState(response);
	
	//return the state object
	return flashState;
};

/**
 * Get the student work for display purposes such as in the grading tool.
 * 
 * @return the student work
 */
FlashState.prototype.getStudentWork = function() {
	var studentWork = this;
	
	return studentWork;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/flash/flashState.js');
}