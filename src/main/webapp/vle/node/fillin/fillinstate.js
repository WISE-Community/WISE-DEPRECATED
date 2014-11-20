/**
 * Object for storing state information of FILL-IN item.
 * @author Hiroki Terashima
 */

/**
 * For re-creating the student's vle_state from their xml for
 * researcher/teacher display
 * @constructor
 */
function FILLINSTATE(textEntryInteractionIndex, response, timestamp) {
	this.type = "fi";
	this.textEntryInteractionIndex = textEntryInteractionIndex;  // which blank the student answered.
	this.response = response;   // what the student wrote in the blank.
	
	if(arguments.length == 2) {
		//if the third argument (timestamp) was ommitted just set it to the current time
		this.timestamp = Date.parse(new Date());
	} else {
		this.timestamp = timestamp;
	}
};

/**
 * Takes in a state JSON object and returns an FILLINSTATE object
 * @param stateJSONObj a state JSON object
 * @return a FILLINSTATE object
 */
FILLINSTATE.prototype.parseDataJSONObj = function(stateJSONObj) {
	//create a new FILLINSTATE object
	var fillinState = new FILLINSTATE();
	
	//set the attributes of the FILLINSTATE object
	fillinState.textEntryInteractionIndex = stateJSONObj.textEntryInteractionIndex;
	fillinState.response = stateJSONObj.response;
	fillinState.timestamp = stateJSONObj.timestamp;
	fillinState.isCompleted = stateJSONObj.isCompleted;
	
	//return the FILLINSTATE object
	return fillinState;
};

/**
 * Returns what the student typed
 * @return the answer the student typed
 */
FILLINSTATE.prototype.getStudentWork = function() {
	return this;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/fillin/fillinstate.js');
};