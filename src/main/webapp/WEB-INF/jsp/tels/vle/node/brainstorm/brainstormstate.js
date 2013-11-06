/**
 * Object for storing the student's response to the brainstorm
 * @constructor
 * @param response what student typed in the post or reply
 * @param postType the type of brainstorm post this state contains {new, reply}
 */
function BRAINSTORMSTATE(response, postType, bsReplyToNodeVisitId, bsReplyToNodeStateTimestamp){
	this.type = "bs"
	this.response = response;
	this.timestamp = Date.parse(new Date());;

	if (postType != null) {
		this.postType = postType;
	} else {
		this.postType = "new";
	}
	if(bsReplyToNodeVisitId != null) {
		this.bsReplyToNodeVisitId = bsReplyToNodeVisitId;
	}
	if (bsReplyToNodeStateTimestamp != null) {
		this.bsReplyToNodeStateTimestamp = bsReplyToNodeStateTimestamp;
	}
};

BRAINSTORMSTATE.prototype.getHtml = function() {
	return "Timestamp: " + this.timestamp + "<br/>Post Type: " + this.postType + "<br/>Response: " + this.response;
};

/**
 * Takes in a state JSON object and returns an BRAINSTORMSTATE object
 * @param stateJSONObj a state JSON object
 * @return a BRAINSTORMSTATE object
 */
BRAINSTORMSTATE.prototype.parseDataJSONObj = function(stateJSONObj) {
	//create a new BRAINSTORMSTATE object
	var brainState = new BRAINSTORMSTATE();
	
	//set the attributes of the BRAINSTORMSTATE object
	brainState.response = stateJSONObj.response;
	brainState.timestamp = stateJSONObj.timestamp;
	if (stateJSONObj.postType != null) {
		brainState.postType = stateJSONObj.postType;		
	} else {
		brainState.postType = "new";
	}
	brainState.type = stateJSONObj.type;
	if (stateJSONObj.bsReplyToNodeVisitId != null) {
		brainState.bsReplyToNodeVisitId = stateJSONObj.bsReplyToNodeVisitId;		
	}
	if (stateJSONObj.bsReplyToNodeStateTimestamp != null) {
		brainState.bsReplyToNodeStateTimestamp = stateJSONObj.bsReplyToNodeStateTimestamp;		
	}
	
	//return the BRAINSTORMSTATE object
	return brainState;
};

/**
 * Get the response
 */
BRAINSTORMSTATE.prototype.getStudentWorkString = function() {
	return this.response;
};

/**
 * Get this brainstorm state
 * @returns this brainstorm state
 */
BRAINSTORMSTATE.prototype.getStudentWork = function() {
	return this;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/brainstorm/brainstormstate.js');
};