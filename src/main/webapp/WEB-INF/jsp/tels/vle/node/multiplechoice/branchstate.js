/**
 * Object for storing state information of MultipleChoice item.
 * @constructor
 */
function BRANCHSTATE(args) {
	this.type = "branch";
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
BRANCHSTATE.prototype.addChoice = function(choice) {
	this.choices.push(choice);
};

/*
 * Add the human readable value of the choice chosen
 */
BRANCHSTATE.prototype.addResponse = function(response) {
	this.response.push(response);
};

BRANCHSTATE.prototype.print = function() {
};

/**
 * Takes in a state JSON object and returns an BRANCHSTATE object
 * @param stateJSONObj a state JSON object
 * @return an BRANCHSTATE object
 */
BRANCHSTATE.prototype.parseDataJSONObj = function(stateJSONObj) {
	//create a new BRANCHSTATE object
	var branchState = new BRANCHSTATE();
	
	//set the attributes of the BRANCHSTATE object
	branchState.isCorrect = stateJSONObj.isCorrect;
	branchState.timestamp = stateJSONObj.timestamp;
	branchState.choices = stateJSONObj.choices;
	branchState.score = stateJSONObj.score;
	
	/*
	 * an array containing the human readable value of the choice(s)
	 * chosen by the student
	 */
	branchState.response = stateJSONObj.response;

	//return the BRANCHSTATE object
	return branchState;
};

/**
 * Returns human readable form of the choices the student chose
 */
BRANCHSTATE.prototype.getHumanReadableForm = function() {
	var humanReadableText = "isCorrect: " + this.isCorrect;
	humanReadableText += "choices: " + this.choices;
	humanReadableText += "score: " + this.score;
	return humanReadableText;
};

/**
 * Returns the human readable choices the student chose
 * @return a string containing the human readable choices
 * 		the student chose. if the step is check box type
 * 		the choices chosen will be separated by a comma
 */
BRANCHSTATE.prototype.getStudentWork = function() {
	var studentWork = "";
	
	//check if there were any choices chosen
	if(this.response) {
		//loop through the array of choices
		for(var x=0; x<this.response.length; x++) {
			if(studentWork != "") {
				//separate each choice with a comma
				studentWork += ", ";
			}
			
			//add the choice to the student work
			studentWork += this.response[x];
		}
		
		if(this.score){
			studentWork += " score: " + this.score;
		}
	}
	
	return studentWork;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/multiplechoice/branchstate.js');
}