function MaxScores() {
	this.maxScoresArray = new Array();
}

/**
 * Parse a JSONArray string that contains the max scores
 * @param maxScoresJSONArrayString a JSONArray string
 * @return a MaxScores object populated with max score entries
 */
MaxScores.prototype.parseMaxScoresJSONString = function(maxScoresJSONArrayString) {
	var maxScoresJSONArrayObj = $.parseJSON(maxScoresJSONArrayString);
	
	return MaxScores.prototype.parseMaxScoresJSONObj(maxScoresJSONArrayObj);
};

/**
 * Parse a JSONArray object that contains the max scores
 * @param maxScoresJSONArrayObj a JSONArray object
 * @return a MaxScores object populated with max score entries
 */
MaxScores.prototype.parseMaxScoresJSONObj = function(maxScoresJSONArrayObj) {
	//create a new MaxScores object
	var maxScoresObj = new MaxScores();
	
	if(maxScoresJSONArrayObj != null) {
		//set the max scores array
		maxScoresObj.maxScoresArray = maxScoresJSONArrayObj;	
	}
	
	return maxScoresObj;
};

/**
 * Adds the max score to the array of max scores. If there
 * is an existing entry for the nodeId, we will just update
 * its max score
 * @param nodeId
 * @param maxScoreValue
 */
MaxScores.prototype.addMaxScore = function(nodeId, maxScoreValue) {
	this.updateMaxScore(nodeId, maxScoreValue);
};

/**
 * Removes the whole max score entry for the nodeId
 * @param nodeId
 */
MaxScores.prototype.removeMaxScore = function(nodeId) {
	for(var x=0; x<this.maxScoresArray.length; x++) {
		if(nodeId == this.maxScoresArray[x].nodeId) {
			this.maxScoresArray.splice(x, 1);
		}
	}
};

/**
 * Updates a max score entry with a new max score value. If
 * there is no max score entry with the given nodeId we will
 * create a new entry and add it.
 * @param nodeId
 * @param maxScoreValue
 */
MaxScores.prototype.updateMaxScore = function(nodeId, maxScoreValue) {
	var nodeIdFound = false;
	
	/*
	 * first try to find and update the max score object that 
	 * has the corresponding nodeId, but if it doesn't exist 
	 * we will need to add it
	 */
	for(var x=0; x<this.maxScoresArray.length; x++) {
		if(nodeId == this.maxScoresArray[x].nodeId) {
			this.maxScoresArray[x].maxScoreValue = maxScoreValue;
			nodeIdFound = true;
		}
	}
	
	//check if we found the nodeId
	if(!nodeIdFound) {
		/*
		 * we did not find a max score object with the nodeId so we
		 * will have to add it
		 */
		var maxScoreObj = new MaxScore(nodeId, maxScoreValue);
		this.maxScoresArray.push(maxScoreObj);		
	}
};

/**
 * Gets the max score value for a given nodeId or 0 as the default
 * value if there is no entry for that nodeId
 * @param nodeId
 */
MaxScores.prototype.getMaxScoreValueByNodeId = function(nodeId) {
	for(var x=0; x<this.maxScoresArray.length; x++) {
		if(nodeId == this.maxScoresArray[x].nodeId) {
			return this.maxScoresArray[x].maxScoreValue;
		}
	}
	
	//return 0 as the default value if there is no max score entry for the nodeId
	return 0;
};

/**
 * Merge two MaxScores objects. If there are conflicting nodeId
 * entries, we will use the newMaxScores' maxScoreValue for
 * that nodeId
 * @param newMaxScores
 */
MaxScores.prototype.mergeMaxScores = function(newMaxScores) {
	//loop through all the other MaxScores' entries
	for(var x=0; x<newMaxScores.maxScoresArray.length; x++) {
		//get a MaxScore object
		var newMaxScore = newMaxScores.maxScoresArray[x];
		
		//get the nodeId
		var nodeId = newMaxScore.nodeId;
		
		//get the max score value
		var maxScoreValue = newMaxScore.maxScoreValue;
		
		/*
		 * update the max score for the nodeId, if there is
		 * no entry with the given nodeId, a new entry will
		 * automatically be created
		 */
		this.updateMaxScore(nodeId, maxScoreValue);
	}
};

/**
 * Get the sum of all the max scores specified by the teacher
 * for the project
 * 
 * @param nodeIds an array of nodeId strings. this is optional but usually
 * should be passed in. this is to resolve the problem of dangling max scores.
 * for example if a teacher sets a max score for node_1.or and then
 * the author deletes the step or moves it to the inactive step section,
 * the max score for the step will still persist and show up in the
 * maxScoresArray. to make sure we don't use this max score value, 
 * we will pass in an array of node ids that are currently active in 
 * the project and only use the max score values from those steps.
 * 
 * @return an integer containing the sum of all the max
 * scores specified by the teacher for the project
 */
MaxScores.prototype.getMaxScoresSum = function(nodeIds) {
	var maxScoresSum = 0;
	
	//check if nodeIds were passed in
	if(nodeIds == null) {
		//nodeIds were not passed in so we will just get all the max scores
		
		//loop through all the max scores
		for(var x=0; x<this.maxScoresArray.length; x++) {
			//get a max score
			var maxScoreValue = this.maxScoresArray[x].maxScoreValue;
			
			//add it to the cumulative sum
			maxScoresSum += maxScoreValue;
		}
	} else {
		//nodeIds were passed in so we will only get the max scores in that array
		
		//loop through all the node ids
		for(var x=0; x<nodeIds.length; x++) {
			//get a node id
			var nodeId = nodeIds[x];
			
			//get the max score for the node id
			var maxScoreValue = this.getMaxScoreValueByNodeId(nodeId);
			
			//add it to the cumulative sum
			maxScoresSum += maxScoreValue;
		}
	}
	
	return maxScoresSum;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/grading/MaxScores.js');
};