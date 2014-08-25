/**
 * Object for storing state information of OpenResponse item.
 * @constructor
 * @author Hiroki Terashima
 */
function OPENRESPONSESTATE(response, timestamp) {
	this.type = "or";
	
	//this is a single element array that contains the response the student wrote
	this.response = response;
	
	if(!timestamp) {
		//if the second argument (timestamp) was ommitted just set it to the current time
		this.timestamp = Date.parse(new Date());
	} else {
		this.timestamp = timestamp;
	}
};

OPENRESPONSESTATE.prototype.print = function() {
};

OPENRESPONSESTATE.prototype.getHtml = function() {
	return "timestamp: " + this.timestamp + "<br/>response: " + this.response;
};


/**
 * Takes in a state JSON object and returns an OPENRESPONSESTATE object
 * @param stateJSONObj a state JSON object
 * @return a OPENRESPONSESTATE object
 */
OPENRESPONSESTATE.prototype.parseDataJSONObj = function(stateJSONObj) {
	//create an empty open response state object
	var orState = new OPENRESPONSESTATE();
	
	/*
	 * we will dynamically inject all the values in the state JSON
	 * object into the open response state object
	 */
	if(stateJSONObj != null) {
		//get all the fields in the state JSON object
		var fieldNames = Object.keys(stateJSONObj);
		
		if(fieldNames != null) {
			//loop through all the field names
			for(var x=0; x<fieldNames.length; x++) {
				//get a field name
				var fieldName = fieldNames[x];

				if(fieldName != null) {
					//get the field value for the given field name
					var fieldValue = stateJSONObj[fieldName];
					
					//set the field value into the field name in the open response state
					orState[fieldName] = fieldValue;
				}
			}
		}
	}
	
	return orState;
};

/**
 * Returns what the student typed
 * @return the answer the student typed
 */
OPENRESPONSESTATE.prototype.getStudentWork = function() {
	/*
	var studentWork = this.response;
	
	//check if the response is an array
	if(this.response != null && this.response.constructor.toString().indexOf("Array") != -1) {
		/*
		 * response is an array so we will use the toString() of the array
		 * which should give us just the text within it
		 *
		studentWork = this.response.toString();
	}
	return studentWork;
		*/
	return this;
};

OPENRESPONSESTATE.prototype.isLocked = function() {
	return this.locked;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/openresponse/openresponsestate.js');
}