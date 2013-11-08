
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
 * Gets the xml format for the student data
 * @return an xml string with the student data
 */
MYSYSTEMSTATE.prototype.getDataXML = function() {
	var dataXML = "<data>" + this.data + "</data>";
	dataXML += "<timestamp>" + this.timestamp + "</timestamp>";
	return dataXML;
}

/**
 * Creates a state object from an xml object
 * @param stateXML an xml object
 * @return an MYSYSTEMSTATE object
 */
MYSYSTEMSTATE.prototype.parseDataXML = function(stateXML) {
	//obtain the data element
	var dataElement = stateXML.getElementsByTagName("data")[0];
	
	//obtain the timestamp element
	var timestampElement = stateXML.getElementsByTagName("timestamp")[0];
	
	//check if both elements exist
	if(dataElement != null && timestampElement != null) {
		//obtain the values for the data and timestamp
		var data = dataElement.textContent;
		var timestamp = timestampElement.textContent;
		
		//create an MYSYSTEMSTATE
		var state = new MYSYSTEMSTATE(data, timestamp);
		return state;
	} else {
		return null;
	}
}

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
}

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