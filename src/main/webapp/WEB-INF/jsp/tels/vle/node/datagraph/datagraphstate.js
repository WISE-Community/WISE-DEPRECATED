/**
 * Datagraph state object
 * @constructor
 * @author patrick lawler
 */
function DATAGRAPHSTATE(args){
	this.timestamp = args[1];
	this.table = args[0];
	this.tableString;
	
	//set timestamp if not provided
	if(!this.timestamp){
		this.timestamp = Date.parse(new Date());
	};
	
	//convert json table to string
	if(this.table){
		this.tableString = $.stringify(this.table);
	};
};

/**
 * Given a @param stateJSONObj, creates, populates and returns a DATAGRAPHSTATE obj
 */
DATAGRAPHSTATE.prototype.parseDataJSONObj = function(stateJSONObj) {
	return new DATAGRAPHSTATE([stateJSONObj.table, stateJSONObj.timestamp]);
};

/**
 * Returns the student edited table as a string
 */
DATAGRAPHSTATE.prototype.getDataXML = function() {
	return this.tableString + "<timestamp>" + this.timestamp + "</timestamp>";
};

/**
 * Returns the student edited table as a string
 */
DATAGRAPHSTATE.prototype.getStudentWorkString = function() {
	return this.tableString;
};

/**
 * Returns this datagraph state
 * @return this datagraph state
 */
DATAGRAPHSTATE.prototype.getStudentWork = function() {
	return this;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/datagraph/datagraphstate.js');
};