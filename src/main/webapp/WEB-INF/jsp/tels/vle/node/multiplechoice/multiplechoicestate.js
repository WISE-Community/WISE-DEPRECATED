/**
 * Object for storing state information of MultipleChoice item.
 * @constructor
 */
function MCSTATE(args) {
	this.type = "mc";
	this.isCorrect = null;
	
	//stores the human readable value of the choice chosen
	this.response = new Array();

	//use the current time or the argument timestamp passed in
	if(args){
		if(args[0]){
			this.timestamp = args[0];
		};
		
		if(args[1]){
			this.choices = args[1];
		};
		
		if(args[2]){
			this.score = args[2];
		}
	};
	
	if(!this.timestamp){
		this.timestamp = new Date().getTime();
	};
	
	if(!this.choices){
		this.choices = new Array();
	};
};

/*
 * Add a choice that the student chose
 */
MCSTATE.prototype.addChoice = function(choice) {
	this.choices.push(choice);
};

/*
 * Add the human readable value of the choice chosen
 */
MCSTATE.prototype.addResponse = function(response) {
	this.response.push(response);
};

MCSTATE.prototype.print = function() {
};

/**
 * Takes in a state JSON object and returns an MCSTATE object
 * @param stateJSONObj a state JSON object
 * @return an MCSTATE object
 */
MCSTATE.prototype.parseDataJSONObj = function(stateJSONObj) {
	//create a new MCSTATE object
	var mcState = new MCSTATE();
	
	//set the attributes of the MCSTATE object
	mcState.isCorrect = stateJSONObj.isCorrect;
	mcState.timestamp = stateJSONObj.timestamp;
	mcState.choices = stateJSONObj.choices;
	mcState.score = stateJSONObj.score;
	
	/*
	 * an array containing the human readable value of the choice(s)
	 * chosen by the student
	 */
	mcState.response = stateJSONObj.response;

	//return the MCSTATE object
	return mcState;
};

/**
 * Returns human readable form of the choices the student chose
 */
MCSTATE.prototype.getHumanReadableForm = function() {
	var humanReadableText = "isCorrect: " + this.isCorrect;
	humanReadableText += "choices: " + this.choices;
	humanReadableText += "score: " + this.score;
	return humanReadableText;
};

/**
 * Get the student work
 * @returns this object
 */
MCSTATE.prototype.getStudentWork = function() {
	return this;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/multiplechoice/multiplechoicestate.js');
}