function MaxScore(nodeId, maxScoreValue) {
	this.nodeId = nodeId;
	this.maxScoreValue = maxScoreValue;
}


//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/grading/MaxScore.js');
};