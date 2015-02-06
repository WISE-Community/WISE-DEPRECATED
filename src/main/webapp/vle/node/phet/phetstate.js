/**
 * Object for storing state information of OpenResponse item.
 * @constructor
 * @author Hiroki Terashima
 */
function PHETSTATE(response) {
	this.type = "ph";
	this.timestamp = Date.parse(new Date());
	this.response = response;   // which choice the student chose.
}

PHETSTATE.prototype.print = function() {
};

PHETSTATE.prototype.getHtml = function() {
	return "timestamp: " + this.timestamp + "<br/>response: " + this.response;
};