
/**
 * @constructor
 * @param state
 * @param timestamp
 * @returns
 */
function MYSYSTEMSTATE(state, timestamp) {
	this.type = "mysystem";
	this.data = state;
	
	if(timestamp == null) {
		this.timestamp = new Date().getTime();
	} else {
		this.timestamp = timestamp;
	}
};

/**
 * Takes in a state JSON object and returns an MYSYSTEMSTATE object
 * @param stateJSONObj a state JSON object
 * @return a MYSYSTEMSTATE object
 */
MYSYSTEMSTATE.prototype.parseDataJSONObj = function(stateJSONObj) {
	//create a new MYSYSTEMSTATE object
	var mysystemState = new MYSYSTEMSTATE();
	
	//set the attributes of the MYSYSTEMSTATE object
	mysystemState.data = stateJSONObj.data;
	mysystemState.timestamp = stateJSONObj.timestamp;
	
	//return the MYSYSTEMSTATE object
	return mysystemState;
};

/**
 * Get the student work.
 * @return the student's work
 */
MYSYSTEMSTATE.prototype.getStudentWorkString = function() {
	return this.data;
};

/**
 * Get this node state
 * @return this node state
 */
MYSYSTEMSTATE.prototype.getStudentWork = function() {
	return this;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/mysystem/mysystemstate.js');
};