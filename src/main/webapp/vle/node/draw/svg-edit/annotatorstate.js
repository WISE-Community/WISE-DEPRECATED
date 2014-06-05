/**
 * @constructor
 * @param state
 * @param timestamp
 * @param autoScore the auto graded score
 * @param autoFeedback the auto graded feedback
 * @returns
 */
function ANNOTATORSTATE(data, timestamp, autoScore, autoFeedback, autoFeedbackKey, checkWork, maxAutoScore, scoringCriteriaResults) {
	this.type = "an";
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
	
	if(maxAutoScore != null) {
		//set the max auto graded score
		this.maxAutoScore = maxAutoScore;
	}
	
	if(scoringCriteriaResults != null) {
		//set the scoring criteria results
		this.scoringCriteriaResults = scoringCriteriaResults;
	}
};

/**
 * Takes in a state JSON object and returns an ANNOTATORSTATE object
 * @param stateJSONObj a state JSON object
 * @return a ANNOTATORSTATE object
 */
ANNOTATORSTATE.prototype.parseDataJSONObj = function(stateJSONObj) {
	//create a new ANNOTATORSTATE object
	var state = new ANNOTATORSTATE();
	
	//set the attributes of the ANNOTATORSTATE object
	state.data = stateJSONObj.data;
	state.timestamp = stateJSONObj.timestamp;
	state.autoScore = stateJSONObj.autoScore;
	state.autoFeedback = stateJSONObj.autoFeedback;
	state.autoFeedbackKey = stateJSONObj.autoFeedbackKey;
	state.checkWork = stateJSONObj.checkWork;
	state.maxAutoScore = stateJSONObj.maxAutoScore;
	state.scoringCriteriaResults = stateJSONObj.scoringCriteriaResults;
	
	//return the ANNOTATORSTATE object
	return state;
};

/**
 * Get the student work.
 * @return the student's work
 */
ANNOTATORSTATE.prototype.getStudentWorkString = function() {
	return this.data;
};

/**
 * Get this node state
 * @return this node state
 */
ANNOTATORSTATE.prototype.getStudentWork = function() {
	return this;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/draw/svg-edit/annotatorstate.js');
};