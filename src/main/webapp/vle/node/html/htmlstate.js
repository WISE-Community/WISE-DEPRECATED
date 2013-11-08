
/**
 * @constructor
 * @extends Node
 * @param state
 * @param timestamp
 * @returns
 */
function HTMLSTATE(state, timestamp) {
	this.type = "html";
	this.data = state;
	
	if(timestamp == null) {
		this.timestamp = new Date().getTime();
	} else {
		this.timestamp = timestamp;
	}
};

/**
 * Takes in a state JSON object and returns an HTMLSTATE object
 * @param stateJSONObj a state JSON object
 * @return a HTMLSTATE object
 */
HTMLSTATE.prototype.parseDataJSONObj = function(stateJSONObj) {
	//create a new HTMLSTATE object
	var htmlState = new HTMLSTATE();
	
	//set the attributes of the HTMLSTATE object
	htmlState.data = stateJSONObj.data;
	htmlState.timestamp = stateJSONObj.timestamp;
	
	//return the HTMLSTATE object
	return htmlState;
}

/**
 * Get the student work.
 * @return the student's work
 */
HTMLSTATE.prototype.getStudentWorkString = function() {
	return this.data;
};

/**
 * Get this node state
 * @return this node state
 */
HTMLSTATE.prototype.getStudentWork = function() {
	return this;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/html/htmlstate.js');
};