
/**
 * @constructor
 * @param state
 * @param timestamp
 * @returns
 */
function MWSTATE(state, timestamp) {
	this.type = "mw";
	this.data = state;
	
	if(timestamp == null) {
		this.timestamp = new Date().getTime();
	} else {
		this.timestamp = timestamp;
	}
};

/**
 * Takes in a state JSON object and returns an MWSTATE object
 * @param stateJSONObj a state JSON object
 * @return an MWSTATE object
 */
MWSTATE.prototype.parseDataJSONObj = function(stateJSONObj) {
	//create a new MWSTATE object
	var state = new MWSTATE();
	
	//set the attributes of the MWSTATE object
	state.data = stateJSONObj.data;
	state.timestamp = stateJSONObj.timestamp;
	
	//return the MWSTATE object
	return state;
};

/**
 * Get the student work.
 * @return the student's work
 */
MWSTATE.prototype.getStudentWorkString = function() {
	return this.data;
};

/**
 * Get this node state
 * @return this node state
 */
MWSTATE.prototype.getStudentWork = function() {
	return this;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/mw/mwstate.js');
};