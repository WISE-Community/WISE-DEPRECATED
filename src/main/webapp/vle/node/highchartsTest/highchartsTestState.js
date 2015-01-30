/*
 * This is a highchartsTest state object that developers can use to create new
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
 * TODO: in this file, change all occurrences of the word 'HighchartsTestState' to
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
 * TODO: rename HighchartsTestState
 * 
 * note: you can change the variables in this constructor, the response variable
 * is just used as an example. you can add any variables that will help you 
 * represent the student's work for your step type.
 * 
 * @constructor
 */
function HighchartsTestState(response, data, regressionType) {
	//the text response the student wrote
	this.response = "";

	if(response != null) {
		//set the response
		this.response = response;
	}
	
	if(data != null) {
		this.data = data;
	}
	
	if(regressionType != null) {
		this.regressionType = regressionType;
	}
};

/**
 * This function is used to reload previous work the student submitted for the step.
 * The student work is retrieved and then this function is called to parse the student
 * work so that we can display the previous answer the student submitted.
 * 
 * TODO: rename HighchartsTestState
 * 
 * note: you can change the variables in the stateJSONObj, the response 
 * variable is just used as an example. you can add any variables that will  
 * help you represent the student's work for your type of step.
 * 
 * @param stateJSONObj a JSONObject representing the student work
 * @return a HighchartsTestState object
 */
HighchartsTestState.prototype.parseDataJSONObj = function(stateJSONObj) {
	//create an empty highcharts state object
	var highchartsTestState = new HighchartsTestState();
	
	/*
	 * we will dynamically inject all the values in the state JSON
	 * object into the highcharts state object
	 */
	if(stateJSONObj != null) {
		//get all the fields in the state JSON object
		var fieldNames = Object.keys(stateJSONObj);
		
		if(fieldNames != null) {
			//loop through all the field names
			for(var x=0; x<fieldNames.length; x++) {
				//get a field name
				var fieldName = fieldNames[x];

				if(fieldName != null) {
					//get the field value for the given field name
					var fieldValue = stateJSONObj[fieldName];
					
					//set the field value into the field name in the open response state
					highchartsTestState[fieldName] = fieldValue;
				}
			}
		}
	}

	//return the state object
	return highchartsTestState;
};

/**
 * Get the student work for display purposes such as in the grading tool.
 * 
 * TODO: rename HighchartsTestState
 * 
 * @return the student work
 */
HighchartsTestState.prototype.getStudentWork = function() {
	var studentWork = this;
	
	return studentWork;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	//TODO: rename highchartsTest/highchartsTestState.js
	eventManager.fire('scriptLoaded', 'vle/node/highchartsTest/highchartsTestState.js');
}