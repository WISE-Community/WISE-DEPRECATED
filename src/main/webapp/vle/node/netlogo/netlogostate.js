
/**
 * @constructor
 * @param state
 * @param timestamp
 * @returns
 */
function NetlogoState(state, timestamp) {
	this.type = "nl";
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
 * @return a NetlogoState object
 */
NetlogoState.prototype.parseDataJSONObj = function(stateJSONObj) {
	//create a new NetlogoState object
	var state = new NetlogoState();
	
	//set the attributes of the NetlogoState object
	state.data = stateJSONObj.data;
	state.timestamp = stateJSONObj.timestamp;
	
	//return the NetlogoState object
	return state;
};

/**
 * Get the student work.
 * @return the student's work
 */
NetlogoState.prototype.getStudentWorkString = function() {
	return this.data;
};

/**
 * Get this node state
 * @return this node state
 */
NetlogoState.prototype.getStudentWork = function() {
	return this;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/netlogo/netlogostate.js');
};