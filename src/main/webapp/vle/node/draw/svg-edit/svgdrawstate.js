
/**
 * @constructor
 * @param state
 * @param timestamp
 * @param autoScore the auto graded score
 * @param autoFeedback the auto graded feedback
 * @returns
 */
function SVGDRAWSTATE(data, timestamp, autoScore, autoFeedback, autoFeedbackKey, checkWork) {
	this.type = "html";
	this.data = data;
	
	if(timestamp == null) {
		this.timestamp = new Date().getTime();
	} else {
		this.timestamp = timestamp;
	}
	
	if(autoScore != null) {
		//set the auto graded score if provided
		this.autoScore = autoScore;
	}
	
	if(autoFeedback != null) {
		//set the auto graded feedback if provided
		this.autoFeedback = autoFeedback;
	}
	
	if(autoFeedbackKey != null) {
		//set the auto feedback key if provided
		this.autoFeedbackKey = autoFeedbackKey;
	}
	
	if(checkWork != null) {
		//set the auto graded check work value if provided
		this.checkWork = checkWork;
	}
};

/**
 * Takes in a state JSON object and returns an SVGDRAWSTATE object
 * @param stateJSONObj a state JSON object
 * @return a SVGDRAWSTATE object
 */
SVGDRAWSTATE.prototype.parseDataJSONObj = function(stateJSONObj) {
	//create a new SVGDRAWSTATE object
	var state = new SVGDRAWSTATE();
	
	//set the attributes of the SVGDRAWSTATE object
	state.data = stateJSONObj.data;
	state.timestamp = stateJSONObj.timestamp;
	state.autoScore = stateJSONObj.autoScore;
	state.autoFeedback = stateJSONObj.autoFeedback;
	state.autoFeedbackKey = stateJSONObj.autoFeedbackKey;
	state.checkWork = stateJSONObj.checkWork;
	
	//return the SVGDRAWSTATE object
	return state;
};

/**
 * Get the student work.
 * @return the student's work
 */
SVGDRAWSTATE.prototype.getStudentWorkString = function() {
	return this.data;
};

/**
 * Get this node state
 * @return this node state
 */
SVGDRAWSTATE.prototype.getStudentWork = function() {
	return this;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/draw/svg-edit/svgdrawstate.js');
};