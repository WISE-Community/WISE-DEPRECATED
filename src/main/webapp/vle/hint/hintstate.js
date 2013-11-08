function HINTSTATE(state, timestamp) {
	this.type = "hint";
	this.data = state;
	
	if(timestamp == null) {
		this.timestamp = new Date().getTime();
	} else {
		this.timestamp = timestamp;
	}
};

/**
 * Takes in a state JSON object and returns an HINTSTATE object
 * @param stateJSONObj a state JSON object
 * @return a HINTSTATE object
 */
HINTSTATE.prototype.parseDataJSONObj = function(stateJSONObj) {
	//create a new HINTSTATE object
	var state = new HINTSTATE();
	
	//set the attributes of the HINTSTATE object
	state.data = stateJSONObj.data;
	state.timestamp = stateJSONObj.timestamp;
	
	//return the HINTSTATE object
	return state;
};

/**
 * Get the student work.
 * @return the student's work
 */
HINTSTATE.prototype.getStudentWorkString = function() {
	return this.data;
};

/**
 * Get this state
 * @return this state
 */
HINTSTATE.prototype.getStudentWork = function() {
	return this;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/hint/hintstate.js');
};