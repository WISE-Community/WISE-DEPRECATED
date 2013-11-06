/**
 * Object for storing state information of OpenResponse item.
 * @constructor
 * @author Hiroki Terashima
 */
function OUTSIDEURLSTATE(response) {
	this.type = "ou";
	this.timestamp = Date.parse(new Date());
	this.response = response;   // which choice the student chose.
}

OUTSIDEURLSTATE.prototype.print = function() {
};

OUTSIDEURLSTATE.prototype.getHtml = function() {
	return "timestamp: " + this.timestamp + "<br/>response: " + this.response;
};