
function StudentStatus() {
	this.maxAlertLevel = 0;
	this.alertables = [];
};

StudentStatus.prototype.addAlertable = function(statusObject) {
	this.removeAlertable(statusObject.nodeId);
	this.alertables.push(statusObject);
	
	this.updateMaxAlertLevel();
};

StudentStatus.prototype.updateMaxAlertLevel = function() {
	var maxSoFar = 0;
	
	for(var x=0; x<this.alertables.length; x++) {
		var alertable = this.alertables[x];
		
		var alertLevel = alertable.alertLevel;
		
		if(alertLevel > maxSoFar) {
			maxSoFar = alertLevel;
		}
	}
	
	this.maxAlertLevel = maxSoFar;
};

StudentStatus.prototype.removeAlertable = function(nodeId) {
	
	for(var x=0; x<this.alertables.length; x++) {
		var alertable = this.alertables[x];
		
		if(alertable.nodeId == nodeId) {
			this.alertables.splice(x, 1);
			x -= 1;
		}
	}
};

function StudentAlertable(alertLevel, nodeId, type, value, stepNumberAndTitle, nodeType, readableText, timestamp) {
	this.alertLevel = alertLevel;
	this.nodeId = nodeId;
	this.type = type;
	this.value = value;
	this.stepNumberAndTitle = stepNumberAndTitle;
	this.nodeType = nodeType;
	this.readableText = readableText;
	this.timestamp = timestamp;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/data/StudentStatus.js');
};