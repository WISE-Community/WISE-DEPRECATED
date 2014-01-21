/**
 * This is the constructor for the object that will perform the logic for
 * the step when the students work on it. An instance of this object will
 * be created in the .html for this step (look at epigame.html)
 * @constructor
 */
function Epigame(node) {
	this.node = node;
	this.view = node.view;
	this.content = node.getContent().getContentJSON();
	
	if(node.studentWork != null) {
		this.states = node.studentWork; 
	} else {
		this.states = [];  
	};
};

Epigame.prototype.getGameElement = function() {
	return $("#epigame").get(0);
	//return this.embeddedObject;
};

Epigame.prototype.parseMinScore = function(sourceStr) {
	var result = parseInt(sourceStr);
	if (isNaN(result))
		return 0;
		
	return result;
}

Epigame.prototype.parseTagMultipliers = function(sourceStr) {
	var result = {};
	
	//If the source string exists and is formatted correctly, parse it into the result
	if (sourceStr != null && sourceStr != "" && sourceStr.indexOf(":") != -1) {
		var tagMultStrs = sourceStr.split(";");
		
		for (var i = 0; i < tagMultStrs.length; ++i) {
			var keyValPair = tagMultStrs[i].split(":");
			
			if (keyValPair.length == 2) {
				var value = parseFloat(keyValPair[1]);
				result[keyValPair[0]] = isNaN(value) ? 0 : value;
			}
		}
	}
	
	return result;
};

/**
 * Get the most recent student work entry from any Epigame node by timestamp.
 * @param nodeFilterFunc a function to filter the acceptable results, sig: function(node) { return boolean; }
 * @return the most recent student work object, or null if there is no valid student work
 */
Epigame.prototype.getLatestEpigameWork = function(nodeFilterFunc) {
	var nodeIDs = this.view.getProject().getNodeIdsByNodeType("EpigameNode");
	if (!nodeFilterFunc)
		nodeFilterFunc = function(node) { return true; }
	
	var latestWork = null;
	if (nodeIDs) {
		for (var i = 0; i < nodeIDs.length; ++i) {
			var nodeID = nodeIDs[i];
			var node = this.view.getProject().getNodeById(nodeID);
			if (node && nodeFilterFunc(node)) {
				var nodeWork = this.view.getStudentWorkForNodeId(nodeID);
				if (nodeWork && nodeWork.length) {
					var work = nodeWork[nodeWork.length - 1];
					//If timestamped later than the latest (or no latest exists), this is the new latest
					if (work && work.response && work.response.timestamp != null
							&& (!latestWork || latestWork.response.timestamp < work.response.timestamp)) {
						latestWork = work;
					}
				}
			}
		}
	}
	return latestWork;
};

/**
 * Check the scores for all the steps that have the given tag and occur
 * before the current step in the project
 * @param tagName the tag name
 * @param scoreProp the property name of the checked score in studentWork
 * @param functionArgs the arguments to this function (minScore, tagMultipliers)
 * @returns the results from the check, the result object
 * contains a pass field and a message field
 */
Epigame.prototype.getTotalScore = function(tagName, functionArgs, scoreProp, readableScoreName, nullifierProp) {
	var tagMultipliers = this.parseTagMultipliers(functionArgs[1]);
	var totalScore = 0;
	var minScore = 0;
	
	//Check for a global override before applying minScore
	if (!(nullifierProp && this.campaignSettings && this.campaignSettings.globalizeReqs && !this.campaignSettings[nullifierProp]))
		minScore = this.parseMinScore(functionArgs[0]);
		
	var nodeIds = this.view.getProject().getNodeIdsByTag(tagName);
	if (nodeIds) {
		for (var i = 0; i < nodeIds.length; ++i) {
			var nodeId = nodeIds[i];
			if (nodeId != null) {
//				var latestWork = this.view.state.getLatestWorkByNodeId(nodeId);
				var latestWork = this.view.getState().getLatestWorkByNodeId(nodeId);  //4.7 Switch
				
				var nodeScore = latestWork.response ? parseFloat(latestWork.response[scoreProp]) : NaN;
				if (!isNaN(nodeScore)) {
					var multiplier = 1;
					if (node.tags) {
						for (var j = 0; j < node.tags.length; ++j) {
							var tagMult = tagMultipliers[node.tags[j]];
							if (!isNaN(tagMult))
								multiplier *= tagMult;
						}
					}
					totalScore += nodeScore * multiplier;
				}
			}
		}
	}
	
	var result = {
		pass: totalScore >= minScore,
		message: totalScore >= minScore ? "" : "Your overall " + readableScoreName + " is " + totalScore + ". This mission requires " + minScore + " or higher."
	};
	result[scoreProp] = totalScore;
	result.minScore = minScore;
	return result;
}

Epigame.prototype.checkStepScore = function(tagName, scoreProp, readableScoreName, functionArgs) {
	//get the minimum required score
	var minScore = this.parseMinScore(functionArgs[0]);
	
	//array to accumulate the nodes that the student has not completed with a high enough score
	var nodesFailed = [];
	
	//the node ids of the steps that have the given tag
	var nodeIds = this.view.getProject().getNodeIdsByTag(tagName);
	if (nodeIds != null) {
		for(var i = 0; i < nodeIds.length; ++i) {
			var nodeId = nodeIds[i];
			if (nodeId != null) {
				//get the latest work for the node
//				var latestWork = this.view.state.getLatestWorkByNodeId(nodeId);
				var latestWork = this.view.getState().getLatestWorkByNodeId(nodeId); //4.7 Switch
				
				if (latestWork && latestWork.response) {
					//get the top score for the step
					var topScore = parseFloat(latestWork.response[scoreProp]);
					if (isNaN(topScore) || topScore < minScore) {
						//Score doesn't exist or is too low
						nodesFailed.push({id:nodeId, score:topScore});
					}
				} else {
					//If no work, consider it an incompletion failure
					nodesFailed.push({id:nodeId, score:NaN});
				}
			}
		}
	}
	
	if (nodesFailed.length) {
		//the student has failed at least one of the steps
		
		//create the message to display to the student
		var message = "This mission requires a " + readableScoreName + " of " + minScore + " or higher "
			+ (nodesFailed.length == 1 ? "on the following mission:<br>" : "on each of the following missions:<br>");
		
		//loop through all the failed steps
		for(var i = 0; i < nodesFailed.length; ++i) {
			var failData = nodesFailed[i];
			
			//get the step number and title for the failed step
			var failNode = this.view.getProject().getNodeById(failData.id);
			var stepNumberAndTitle = failNode.parent.title + " - " + failNode.title;
			
			//make a note explaining the player's progress toward the goal
			var scoreText = isNaN(failData.score) ? "Not yet completed" : "Your score: " + failData.score;
			
			//add the step number and title to the message
			message += stepNumberAndTitle + " (" + scoreText + ")<br>";
		}
		
		return {
			pass: false,
			message: message
		};
	}
	  
	return {
		pass: true,
		message: ""
	};
};

Epigame.prototype.getLatestCompletionByNodeId = function(nodeID) {
	var nodeWork = this.view.getStudentWorkForNodeId(nodeID)
	if (nodeWork) {
		//Reverse iterate until we hit one with success
		var i = nodeWork.length;
		while (i--) {
			var work = nodeWork[i];
			if (work && work.response && work.response.success) {
				return work;
			}
		}
	}
	
	//None found
	return null;
};

Epigame.prototype.isNodeCompleted = function(nodeId) {
	return this.getLatestCompletionByNodeId(nodeId) != null;
};

Epigame.prototype.checkCompletedAll = function(tagName, functionArgs) {
	//array to accumulate the nodes that the student has not completed with a high enough score
	var nodesFailed = [];
	
	//the node ids of the steps that have the given tag
	var nodeIds = this.view.getProject().getNodeIdsByTag(tagName);
	if (nodeIds != null) {
		for(var i = 0; i < nodeIds.length; ++i) {
			var nodeId = nodeIds[i];
			if (nodeId && !this.isNodeCompleted(nodeId)) {
				nodesFailed.push(nodeId); 
			}
		}
	}
	
	if (nodesFailed.length) {
		//the student has failed at least one of the steps
		
		//create the message to display to the student
		var message = "You must complete the following mission(s) before playing this one:<br>";
		
		//loop through all the failed steps
		for(var i = 0; i < nodesFailed.length; ++i) {
			var nodeId = nodesFailed[i];
			
			//get the step number and title for the failed step
			var failNode = this.view.getProject().getNodeById(nodeId);
			var stepNumberAndTitle = failNode.parent.title + " - " + failNode.title;
			
			//add the step number and title to the message
			message += stepNumberAndTitle + "<br>";
		}
		
		return {
			pass: false,
			message: message
		};
	}
	
	return {
		pass: true,
		message: ""
	};
};

Epigame.prototype.checkCompletedAny = function(tagName, functionArgs) {
	//the node ids of the steps that have the given tag
	var nodeIds = this.view.getProject().getNodeIdsByTag(tagName);
	if (nodeIds && nodeIds.length) {
		for(var i = 0; i < nodeIds.length; ++i) {
			var nodeId = nodeIds[i];
			if (nodeId && this.isNodeCompleted(nodeId)) {
				return { pass: true, message: "" };
			}
		}
	} else {
		return { pass: true, message: "" };
	}
	
	//Failed all steps
	//create the message to display to the student
	var message = "To play this mission, complete at least one of the following missions first:<br>";
	
	//loop through all the failed steps
	for(var i = 0; i < nodeIds.length; ++i) {
		var nodeId = nodeIds[i];
		
		//get the step number and title for the failed step
		var failNode = this.view.getProject().getNodeById(nodeId);
		var stepNumberAndTitle = failNode.parent.title + " - " + failNode.title;
		
		//add the step number and title to the message
		message += stepNumberAndTitle + "<br>";
	}
	
	return {
		pass: false,
		message: message
	};
};

Epigame.prototype.checkCompletedBronze = function(tagName, functionArgs) {
	//the node ids of the steps that have the given tag
	var nodeIds = this.view.getProject().getNodeIdsByTag(tagName);
	if (nodeIds && nodeIds.length) {
		var nodeId = nodeIds[0];
		if (nodeId && this.isNodeCompleted(nodeId)) {
			return { pass: true, message: "" };
		}
	} else {
		return { pass: true, message: "" };
	}
	
	//Failed all steps
	//create the message to display to the student
	var message = "To play this mission, complete the following mission first:<br>";
	
	//loop through all the failed steps
	var nodeId = nodeIds[0];
		
	//get the step number and title for the failed step
	var failNode = this.view.getProject().getNodeById(nodeId);
	var stepNumberAndTitle = failNode.parent.title + " - " + failNode.title;
		
	//add the step number and title to the message
	message += stepNumberAndTitle + "<br>";
	
	return {
		pass: false,
		message: message
	};
};


Epigame.prototype.checkCompletedSilver = function(tagName, functionArgs) {
	//the node ids of the steps that have the given tag
	var nodeIds = this.view.getProject().getNodeIdsByTag(tagName);
	if (nodeIds && nodeIds.length) {
		var nodeId = nodeIds[1];
		if (nodeId && this.isNodeCompleted(nodeId)) {
			return { pass: true, message: "" };
		}
	} else {
		return { pass: true, message: "" };
	}
	
	//Failed all steps
	//create the message to display to the student
	var message = "To play this mission, complete the following mission first:<br>";
	
	//loop through all the failed steps
	var nodeId = nodeIds[1];
		
	//get the step number and title for the failed step
	var failNode = this.view.getProject().getNodeById(nodeId);
	var stepNumberAndTitle = failNode.parent.title + " - " + failNode.title;
		
	//add the step number and title to the message
	message += stepNumberAndTitle + "<br>";
	
	return {
		pass: false,
		message: message
	};
};

Epigame.prototype.getTotalPerformance = function(tagName, functionArgs) {
	return this.getTotalScore(tagName, functionArgs, "highScore_performance", "Performance Score", "showPerfScore");
};

Epigame.prototype.getTotalExplanation = function(tagName, functionArgs) {
	return this.getTotalScore(tagName, functionArgs, "highScore_explanation", "Explanation Score", "showExplScore");
};

Epigame.prototype.getTotalAdaptive = function(tagName, functionArgs) {
	return this.getTotalScore(tagName, functionArgs, "finalScore", "Warp Score", "showWarpScore");
};

Epigame.prototype.checkStepPerformance = function(tagName, functionArgs) {
	if (this.campaignSettings && this.campaignSettings.globalizeReqs && !this.campaignSettings.showPerfScore)
		return {pass:true, message:""};
	return this.checkStepScore(tagName, "highScore_performance", "Performance Score", functionArgs);
};

Epigame.prototype.checkStepExplanation = function(tagName, functionArgs) {
	if (this.campaignSettings && this.campaignSettings.globalizeReqs && !this.campaignSettings.showExplScore)
		return {pass:true, message:""};
		
	return this.checkStepScore(tagName, "highScore_explanation", "Explanation Score", functionArgs);
};

Epigame.prototype.checkStepAdaptive = function(tagName, functionArgs) {
	if (this.campaignSettings && this.campaignSettings.globalizeReqs && !this.campaignSettings.showWarpScore)
		return {pass:true, message:""};
		
	return this.checkStepScore(tagName, "finalScore", "Warp Score", functionArgs);
};

Epigame.prototype.getCampaignSettings = function() {
	//If this node has settings, use those
	if (this.content.settings)
		return this.content.settings;
		
	//Otherwise find the first node in the project with settings and return those
	var nodes = this.node.view.getProject().getLeafNodes();
	if (nodes && nodes.length) {
		for (var i = 0; i < nodes.length; ++i) {
			if (nodes[i] && nodes[i].type == this.node.type && nodes[i].content) {
				var nodeSettings = nodes[i].content.getContentJSON().settings;
				if (nodeSettings)
					return nodeSettings;
			}
		}
	}
	
	//Defaults
	return null;
};

Epigame.prototype.getUserSettings = function(totalPerfScore, totalExplScore, totalWarpScore, minScore) {
	var result = {
		perfScore: totalPerfScore,
		explScore: totalExplScore,
		warpScore: totalWarpScore,
		minScore: minScore
	};
	
	var work = this.getLatestEpigameWork();
	if (work && work.response.userPrefs) {
		for (var prop in work.response.userPrefs) {
			result[prop] = work.response.userPrefs[prop];
		}
	}
	
	return result;
};

Epigame.prototype.getNodeCompletionCount = function() {
	var count = 0;
	
	if (this.states && this.states.length)
		for (var i = 0; i < this.states.length; ++i)
			if (this.states[i].response && this.states[i].response.success)
				++count;
				
	return count;
};

Epigame.prototype.getCurrentValue = function(prop) {
	var work = this.getLatestState();
	if (work && work.response) {
		return work.response[prop];
	}
	return null;
};

Epigame.prototype.getCurrentScore = function(scoreProp) {
	var score = parseInt(this.getCurrentValue(scoreProp));
	if (!isNaN(score))
		return score;
	return 0;
};

//Retrieve the high score of each type for the current mission/step (May be used by the game SWF)
Epigame.prototype.getCurrentPerfScore = function() { return this.getCurrentScore("highScore_performance"); };
Epigame.prototype.getCurrentExplScore = function() { return this.getCurrentScore("highScore_explanation"); };
Epigame.prototype.getCurrentWarpScore = function() { return this.getCurrentScore("finalScore"); };

//Retrieve the most recent action plan for the current mission/step (May be used by the game SWF)
Epigame.prototype.getCurrentPerfScore = function() { return getCurrentScore("highScore_performance"); };

Epigame.prototype.getCurrentAdaptiveIndex = function(listLength) {
	var catIndex = parseInt(this.node.view.userAndClassInfo.getWorkgroupId());
	if (!listLength || isNaN(catIndex))
		return 0;
		
	while (catIndex >= listLength)
		catIndex -= listLength;
		
	return catIndex;
};

Epigame.prototype.getCurrentGroupIndex = function() {
	var catIndex = parseInt(this.node.view.userAndClassInfo.getWorkgroupId());
	if(isNaN(catIndex))
		return 0;
		
	return catIndex%10;
};

Epigame.prototype.getCurrentBucketIndex = function() {
	var catIndex = this.getCurrentGroupIndex();	
	
	if(catIndex >= 0 && catIndex <= 1) {
		return 0;
	}
	else if(catIndex >= 2 && catIndex <= 3) {
		return 1;
	}
	else if(catIndex >= 4 && catIndex <= 5) {
		return 2;
	}
	else if(catIndex >= 6 && catIndex <= 7) {
		return 3;
	}
	else if(catIndex >= 8 && catIndex <= 9) {
		return 4;
	}
}

Epigame.prototype.getQuizInfo = function() {
	var allQuizData = this.node.getQuizData();
	return allQuizData.pretestQuestions.length;
}

//returns the pregame quiz data
Epigame.prototype.getCurrentQuizData = function() {
	var data = {};
	
	var work = this.getLatestState();
	if (work && work.response) {
		data.quizTimeRemaining = work.response.quizTimeRemaining;
		data.quizQuestionsCompleted = work.response.quizQuestionsCompleted;
		data.quizQuestionsCorrect = work.response.quizQuestionsCorrect;
		data.quizStarted = 1;
	}
	
	var allQuizData = this.node.getQuizData().pretestQuestionLists[this.getCurrentBucketIndex()];
	var quizQuestions = this.node.getQuizData().questionPool;
	var maxQuestionsToAsk = this.node.getQuizData().maxQuestionsToAsk;
	
	console.log("maxQuestionsToAsk : " + maxQuestionsToAsk);
	
	data.quiz = [];	
	data.maxQuestionsToAsk = maxQuestionsToAsk;
	
	for(i=0;i<allQuizData.length;i++) {
		data.quiz.push(quizQuestions[allQuizData[i]-1]);
	}	
			
	//Return in string form (Flash seems to handle it better)
	return JSON.stringify(data);
};

//returns the postgame quiz data
Epigame.prototype.getCurrentPostQuizData = function() {
	var data = {};
	
	var work = this.getLatestState();
	if (work && work.response) {
		data.quizTimeRemaining = work.response.quizTimeRemaining;
		data.quizQuestionsCompleted = work.response.quizQuestionsCompleted;
		data.quizQuestionsCorrect = work.response.quizQuestionsCorrect;
		data.quizStarted = 1;
	}
	
	var allQuizData = this.node.getQuizData().posttestQuestionLists[this.getCurrentBucketIndex()];
	var quizQuestions = this.node.getQuizData().questionPool;
	var maxQuestionsToAsk = this.node.getQuizData().maxQuestionsToAsk;
	
	data.quiz = [];
	data.maxQuestionsToAsk = maxQuestionsToAsk;	
	
	for(i=0;i<allQuizData.length;i++) {
		data.quiz.push(quizQuestions[allQuizData[i]-1]);
	}	
	
	//Return in string form (Flash seems to handle it better)
	return JSON.stringify(data);
};

//a function to search through the missions list and find the next mission
//@playerRating: the current player rating
//@missionList: the mission list for this group
//@missionCompletedValue: an array detailing if each mission is completed or not
//@comparisonCode: either -1,0, or 1 detailing what kind of algorithm shuold be used to get to the next mission
//-1 means find the uncompleted mission that is easier than the players rating but closest to it
//0 means find the next uncompleted mission
//1 means find the next uncompleted mission that is more difficult than the players rating
//@missionDifficulty: array of numbers representing missionList difficulty 
//@return: an index into the mission list [0 to missionList.length-1]
Epigame.prototype.findNextAvailableMission = function(playerRating,missionList,missionCompletedValue,missionDifficulty,comparisonCode) {

	if(comparisonCode >=0 ) {	
		for(i=0;i<missionList.length;i++) {
			if(!missionCompletedValue[i] && (comparisonCode == 0 || (comparisonCode > 0 && playerRating < missionDifficulty[i]) ) ) {
				return i;
			}
		}
	}
	else {
		var leastEasierMission = -1;
		
		for(i=0;i<missionList.length;i++) {
			if(!missionCompletedValue[i] && playerRating > missionDifficulty[i] && (leastEasierMission < 0 || missionDifficulty[i] > missionDifficulty[leastEasierMission]) ) {
				leastEasierMission = i;
			}
		}
		return leastEasierMission;
	}

	return -1;
};

//return a random index into the warp mission list
//only choose a mission that hasn't already been played
Epigame.prototype.randomMissionSelector = function(missionList,missionCompletedValue) {
	var randomIndex = 0; 
	var numMissionsCompleted = 0;
		
	for(i =0;i<missionList.length;i++) {
		if(missionCompletedValue) {
			numMissionsCompleted++;		
		}
	}
	
	if(numMissionsCompleted < missionList.length){
		do {
			randomIndex = Math.floor(Math.random()*missionList.length);	
		}
		while(missionCompletedValue[randomIndex])	
	}
	else {
		randomIndex = Math.floor(Math.random()*missionList.length);	
	}
	
	return randomIndex;
};

//Determine the next Warp mission to be selected
//@numMissionsCompleted: the number of warp missions the player has succesfully completed
//@playerRating: the current player rating
//@previousPlayerRating: the last recorded player rating
//@missionList: the entire set of missions available to this player (already selected from groupID
//@missionCompletedValue: an array of booleans representing whether or not the mission in list has been completed or not 
//@missionDifficulty: array of numbers representing missionList difficulty 
//@return: an index into the mission list [0 to missionList.length-1]
Epigame.prototype.adaptiveMissionSelector = function(numMissionsCompleted,playerRating,previousPlayerRating,missionList,missionCompletedValue,missionDifficulty) {
	if(numMissionsCompleted < 5) {
		//less that 5 missions completed, select the first available warp mission
		if(this.findNextAvailableMission(playerRating,missionList,missionCompletedValue,missionDifficulty, 0) > -1) {
			return this.findNextAvailableMission(playerRating,missionList,missionCompletedValue,missionDifficulty, 0);
		}
	}
	else {
		if(playerRating >= previousPlayerRating) {
			//rating increased, choose next harder mission			
			if(this.findNextAvailableMission(playerRating,missionList,missionCompletedValue,missionDifficulty, 1) > -1) {
				return this.findNextAvailableMission(playerRating,missionList,missionCompletedValue,missionDifficulty, 1);
			} 
			else if (this.findNextAvailableMission(playerRating,missionList,missionCompletedValue,missionDifficulty, 0) > -1) {
				return this.findNextAvailableMission(playerRating,missionList,missionCompletedValue,missionDifficulty, 0);
			}
		}
		else {
			//rating decreased, choose closest easier mission
			if(this.findNextAvailableMission(playerRating,missionList,missionCompletedValue,missionDifficulty, -1) > -1) {
				return this.findNextAvailableMission(playerRating,missionList,missionCompletedValue,missionDifficulty, -1);
			}
			else if (this.findNextAvailableMission(playerRating,missionList,missionCompletedValue,missionDifficulty, 0) > -1) {
				return this.findNextAvailableMission(playerRating,missionList,missionCompletedValue,missionDifficulty, 0);
			}			
		}
	}
		
	//if no other option was found, return the number of missions completed
	return numMissionsCompleted;	
};

Epigame.prototype.getCurrentAdaptiveMissionPlayed = function() {
	if(this.states)
		return this.states.length;
		
	return 0;
}

Epigame.prototype.getMissionScorePercentage = function() {
	return this.getTotalMissionScores()/this.getPossibleMissionScores();
}

//search through all the states and get the highest scores for each
Epigame.prototype.getTotalMissionScores = function() {
	var totalPerformanceScore = 0;
	var totalExplanationScore = 0;

	//get all of the epigame node ids
	var nodeIDs = this.view.getProject().getNodeIdsByNodeType("EpigameNode");
	
	if (nodeIDs) {
		//go through each of the epigame nodes
		for (var i = 0; i < nodeIDs.length; ++i) {
			var nodeID = nodeIDs[i];
			
			var node = this.view.getProject().getNodeById(nodeID);
			if (node) {
				//go through each of the studen work states
				var nodeWork = this.view.getStudentWorkForNodeId(nodeID);
				if (nodeWork && nodeWork.length) {
					var maxExplanation = 0;
					var maxPerformance = 0;
					
					for (var j = 0; j < nodeWork.length; ++j) {
					
						var work = nodeWork[j];
						//look for a final score per node
						if(work && work.response && work.response.success) {
							if(work.response.success.score_performance) {
								maxPerformance = Math.max(maxPerformance, work.response.success.score_performance);
							}
							if(work.response.success.score_explanation) {
								maxExplanation = Math.max(maxExplanation, work.response.success.score_explanation);
							}
						}						
					}
					
					totalPerformanceScore += maxPerformance;
					totalExplanationScore += maxExplanation;
				}
			}
		}
	}
	return Math.max(totalPerformanceScore,totalExplanationScore);
}

//search through all the states and get the highest scores for each
Epigame.prototype.getPossibleMissionScores = function() {
	var totalPossible = 0;

	//get all of the epigame node ids
	var nodeIDs = this.view.getProject().getNodeIdsByNodeType("EpigameNode");
	
	if (nodeIDs) {
		//go through each of the epigame nodes
		for (var i = 0; i < nodeIDs.length; ++i) {
			var nodeID = nodeIDs[i];
			
			var node = this.view.getProject().getNodeById(nodeID);
			if (node) {
				//go through each of the studen work states
				var nodeWork = this.view.getStudentWorkForNodeId(nodeID);
				if (nodeWork && nodeWork.length) {					
					var successFound = false;
					for (var j = 0; j < nodeWork.length; ++j) {
					
						var work = nodeWork[j];
						//look for a final score per node
						if(work && work.response && work.response.success) {
							successFound = true;
						}						
					}

					if(successFound)
						totalPossible += 550;
				}
			}
		}
	}
	return totalPossible;
}

Epigame.prototype.getCurrentAdaptiveMissionData = function(levelString) {
	var warpData = this.node.getAdaptiveMissionData();
	var missionTable = warpData.missions;
	var missionLists = warpData.missionLists;
	
	console.log("missionScorePercent: " + this.getMissionScorePercentage());
	
	if(levelString.length > 0)
		var missionList = missionLists[parseInt(levelString)][this.getCurrentBucketIndex()]; //in this case missionTable.length is 3, getCurrentAdaptiveIndex returns missionTable.length%3 basically	
	else
		var missionList = missionLists[0][this.getCurrentBucketIndex()]; //in this case missionTable.length is 3, getCurrentAdaptiveIndex returns missionTable.length%3 basically
	
	console.log("missionList: " + missionList);

	var index = this.getNodeCompletionCount();

	//array to store whether each mission has been completed or not
	var missionCompleted = [];
	var missionCompleteCount = [];
	var missionDifficulty = [];
	var maxCompleteCount = 0;

	for(i = 0;i<missionList.length;i++) {
		missionCompleted.push(false);
		missionCompleteCount.push(0);
		missionDifficulty.push(0);
	}

	if(this.states != null) {
		for(i=0; i < this.states.length; i++) {
			if(this.states[i].response && this.states[i].response.success) {
				if(!isNaN(this.states[i].response.warpIndex)) {
					missionCompleteCount[this.states[i].response.warpIndex]++;
					maxCompleteCount = Math.max(maxCompleteCount,missionCompleteCount[this.states[i].response.warpIndex]);
				}
			}
		}
	}
	
	//what we're going to do here is count the number of each onek
	//if the number is less than the maximum, then it hasn't been played yet
	var numMissionsCompleted = 0; //store the number of unique succesful mission completions	
	if(this.states != null) {
		for(i=0; i < this.states.length; i++) {
			if(this.states[i].response && this.states[i].response.success) {
//				console.log("num states: " + this.states.length + " " + !isNaN(this.states[i].response.warpIndex) + " " + !isNaN(missionCompleteCount[this.states[i].response.warpIndex]));
//				if(!isNaN(this.states[i].response.warpIndex) && !isNaN(missionCompleteCount[this.states[i].response.warpIndex]))
//					console.log("missionCompleteCount[i]: " + missionCompleteCount[this.states[i].response.warpIndex]);

				if(!isNaN(this.states[i].response.warpIndex) && !isNaN(missionCompleteCount[this.states[i].response.warpIndex]) && missionCompleteCount[this.states[i].response.warpIndex] >= maxCompleteCount) {					
					missionCompleted[this.states[i].response.warpIndex] = true;
				}
			}
		}
	}

	for(i=0;i<missionCompleted.length;i++) {
		if(missionCompleted[i])
			numMissionsCompleted++;
		var i1 = missionList[i].split("-")[0]-1;
		var i2 = missionList[i].split("-")[1]-1;
		console.log("i1: " + i1 + " i2: "+ i2);
		missionDifficulty[i] = missionTable[i1][i2].difficulty;
	}

	console.log("maxCompleteCount: " + maxCompleteCount);	

	
//	console.log("numMissionsCompleted: " + numMissionsCompleted);
//	console.log("this.getCurrentWarpScore(): " + this.getCurrentWarpScore());
//	console.log("this.getPreviousWarpScore(): " + this.getPreviousWarpScore());
	console.log("missionCompleted: " + missionCompleted);	
//	console.log("missionDifficulty: " + missionDifficulty);	

	var bucket = this.getCurrentBucketIndex();
	switch(bucket) {
		case 0:
//		index = this.adaptiveMissionSelector(numMissionsCompleted,this.getCurrentWarpScore(),this.getPreviousWarpScore(),missionList,missionCompleted,missionDifficulty);
		index = this.randomMissionSelector(missionList,missionCompleted);
		break;	
		case 1:
		index = this.randomMissionSelector(missionList,missionCompleted);
		break;
		case 2:
		index = this.randomMissionSelector(missionList,missionCompleted);
		break;
		case 3:
		index = this.randomMissionSelector(missionList,missionCompleted);
		break;
		case 4:
		index = this.randomMissionSelector(missionList,missionCompleted);
		break;
		default:
		index = this.randomMissionSelector(missionList,missionCompleted); //example of calling a random index
	}
			
	//if we didn't finish the last warp attempt, go back
	if(this.states != null && this.states.length > 0) {
		console.log("looking for last mission: ");			
		if(this.states[this.states.length - 1].response) {
			var lastWarpIndex = this.states[this.states.length - 1].response.warpIndex;
			var successInWarpFound = false;
			var successIndex = -1;
			
			for(var i=this.states.length - 1;i>=0;i--) {
				if(this.states[i].response.warpIndex != lastWarpIndex) {
					break;
				}
				
				if(!this.states[i].response.success) {
					successIndex = this.states[i].response.warpIndex;
					console.log("mission found with index: " + index);
				}
				else {
					successInWarpFound = true;
					break;
				}
			}
			
			if(!successInWarpFound && successIndex >= -1) {
				index = successIndex;
			}			
		}
	}

	//check to make sure that the index
	while (index >= missionList.length)
		index -= missionList.length;

	this.lastWarpIndex = index;
	this.lastMissionDifficulty = missionDifficulty[index];

	var missionIndex1 = missionList[index].split("-")[0];
	var missionIndex2 = missionList[index].split("-")[1];
	
	return missionTable[missionIndex1-1][missionIndex2-1].string;
};

Epigame.prototype.getLastWarpIndex = function() {
	return this.lastWarpIndex;
};

function embedGameResultCallback(success, id, ref) {
	if (success) {
		epigame.embeddedObject = ref;
		epigame.embeddedID = id;
	}
};

Epigame.prototype.embedGame = function(flashVars) {
	//Defaults
	var url = "app/Main.swf";
	var elementID = "epigame";
	
	//Pull in optional node data
	if (this.content.customUri && this.content.customUri != "")
		url = this.content.customUri;
	if (this.campaignSettings)
		flashVars.campaign = this.serializeCampaignSettings(this.campaignSettings);
	if (this.userSettings)
		flashVars.user = this.serializeUserSettings(this.userSettings);
		
	var encodedFlashVars = {};
	if (flashVars) {
		for (var paramName in flashVars) {
			encodedFlashVars[paramName] = encodeURIComponent(flashVars[paramName]);
		}
	}
	swfobject.embedSWF(url, elementID, "100%", "100%", "10.2.0", "../../swfobject/expressInstall.swf",
						encodedFlashVars, null, null, embedGameResultCallback);
}

Epigame.prototype.loadMission = 		function(missionStr) { this.embedGame({mode:"playmission", mission:missionStr}); }
Epigame.prototype.loadMissionEditor = 	function(missionStr) { this.embedGame({mode:"editmission", mission:missionStr}); }
Epigame.prototype.loadBlankEditor = 	function() { this.embedGame({mode:"editmission"}); }
Epigame.prototype.loadMap = 			function() { this.embedGame({mode:"playcampaign"}); }
Epigame.prototype.loadTutorial = 		function() { this.embedGame({mode:"playtutorial"}); }
Epigame.prototype.loadAdaptiveMission = function(missionStr) { this.embedGame({mode:"playcat", mission:missionStr}); }
Epigame.prototype.loadAdaptiveQuiz = 	function() { this.embedGame({mode:"playquiz"}); }
Epigame.prototype.loadAdaptivePostQuiz = 	function() { this.embedGame({mode:"playpostquiz"}); }

Epigame.prototype.serializeCampaignSettings = function(settings) {
	if (!settings)
		return null;		
		
	return "C|@|@"
		+ (settings.showPerfScore ? "|@1" : "|@0")
		+ (settings.showExplScore ? "|@1" : "|@0")
		+ (settings.showWarpScore ? "|@1" : "|@0")
		+ (settings.showQuestions ? "|@1" : "|@0")
		+ (settings.showNoQuestions ? "|@1" : "|@0")
		+ (settings.spatialInterface ? "|@1" : "|@0")
		+ (settings.hideScoreScreen ? "|@1" : "|@0")
		+ (settings.noTime ? "|@1" : "|@0")
		+ (settings.testTime ? "|@1" : "|@0")
		+ (settings.questionTime ? "|@1" : "|@0")
		+ "|@" + (settings.testTimeVal)
		+ "|@" + (settings.questionTimeVal)
		+ "|@" + (settings.rank1Val)
		+ "|@" + (settings.rank2Val)
		+ "|@" + (settings.rank3Val)
		+ "|@" + (settings.rank4Val)
		+ "|@" + (settings.rank5Val)
		+ (settings.forceRestriction ? "|@1" : "|@0")
		+ (settings.hideQuizScore ? "|@1" : "|@0")
		+ (settings.disableEncyclopedia ? "|@1" : "|@0")
};

Epigame.prototype.serializeUserSettings = function(settings) {
	if (!settings)
		return null;
		
	var result = "UD|$";
	var parsed;
	
	result += settings.needsTutorial == "false" ? "0" : "1";
	
	parsed = parseFloat(settings.soundVolume);
	result += "|$" + (isNaN(parsed) ? "" : parsed);
	parsed = parseFloat(settings.musicVolume);
	result += "|#" + (isNaN(parsed) ? "" : parsed);
	result += settings.velocimeterToggle == "false" ? "|#0" : "|#1";
		
	//Some game data is unused for this implementation, so this lets the game control the defaults
	result += "|$|#|#|$CP";
	
	parsed = parseInt(settings.perfScore);
	result += "|@" + (isNaN(parsed) ? "" : parsed);
	parsed = parseInt(settings.explScore);
	result += "|@" + (isNaN(parsed) ? "" : parsed);
	parsed = parseInt(settings.warpScore);
	result += "|@" + (isNaN(parsed) ? "" : parsed);
	parsed = parseInt(settings.minScore);
	result += "|@" + (isNaN(parsed) ? "" : parsed);
	result += "|@";
	
	return result;
};

/**
 * This function renders everything the student sees when they visit the step.
 * This includes setting up the html ui elements as well as reloading any
 * previous work the student has submitted when they previously worked on this
 * step, if any.
 */
Epigame.prototype.render = function() {
	//whether we want to allow the student to work on this step
	var enableStep = true;
	
	/*
	 * a message to display to the student at the top of the step
	 * usually used to display error messages when they need to
	 * complete a previous step before being able to work on the
	 * current step
	 */
	var message = "";
	
	//Whether this is running normally in the VLE (outside authoring mode)
	var runMode = this.view.authoringMode == null || !this.view.authoringMode;
	
	//Coalesce required parameters
	if (!this.content.mode)
		this.content.mode = "mission";
	if (!this.content.levelString)
		this.content.levelString = "";
		
	//Default settings
	this.campaignSettings = this.getCampaignSettings();
	this.userSettings = null;
	
	//If not in authoring mode...
	if (runMode) {
		//Run the tag map functions to get pass/fail, message, and the three types of scores
		var tagMapResults = this.processTagMaps();
		
		//Build a user settings object for the game
		this.userSettings = this.getUserSettings(tagMapResults.perfScore, tagMapResults.explScore, tagMapResults.warpScore, tagMapResults.minScore);
		
		//Grab the req-check results
		enableStep = tagMapResults.enableStep;
		message = tagMapResults.message;
	}
	
	if (enableStep) {
		if (this.content.mode == "mission") {
			this.loadMission(this.content.levelString);
		} else if (this.content.mode == "editor") {
			this.loadMissionEditor(this.content.levelString);
		} else if (this.content.mode == "adaptiveMission") {
			this.loadAdaptiveMission(this.getCurrentAdaptiveMissionData(this.content.levelString));
		} else if (this.content.mode == "adaptiveQuiz") {
			this.loadAdaptiveQuiz();
		} else if (this.content.mode == "adaptivePostQuiz") {
			this.loadAdaptivePostQuiz();
		} else if (this.content.mode == "map") {
			this.loadMap();
		} else if (this.content.mode == "tutorial") {
			this.loadTutorial();
		}
	}
	
	//If there is a message, display it to the student.
	//Message and enableStep should be mutually exclusive; if both happen at once, something is wrong
	$('#messageDiv').html(message);
};

/**
 * Process the tag maps and obtain the results
 * @return an object containing the results from processing the
 * tag maps. the object contains two fields
 * enableStep
 * message
 */
Epigame.prototype.processTagMaps = function() {
	var enableStep = true;
	var messages = [];
	var perfScore = 0;
	var explScore = 0;
	var warpScore = 0;
	var minScore = 0;
	var result;
	
	var tagMaps = this.node.tagMaps;
	if (tagMaps) {
		for (var i = 0; i < tagMaps.length; ++i) {
			var tagMap = tagMaps[i];
			
			if (tagMap != null) {
				var tagName = tagMap.tagName;
				var funcName = tagMap.functionName;
				var funcArgs = tagMap.functionArgs;
				
				if (funcName == "checkCompletedAll") {
					result = this.checkCompletedAll(tagName, funcArgs);
				} else if (funcName == "checkCompletedAny") {
					result = this.checkCompletedAny(tagName, funcArgs);
				} else if (funcName == "checkCompletedBronze") {
					result = this.checkCompletedBronze(tagName, funcArgs);
				} else if (funcName == "checkCompletedSilver") {
					result = this.checkCompletedSilver(tagName, funcArgs);					
				} else if (funcName == "checkStepPerformance") {
					result = this.checkStepPerformance(tagName, funcArgs);
				} else if (funcName == "checkStepExplanation") {
					result = this.checkStepExplanation(tagName, funcArgs);
				} else if (funcName == "getTotalPerformance") {
					result = this.getTotalPerformance(tagName, funcArgs);
				} else if (funcName == "getTotalExplanation") {
					result = this.getTotalExplanation(tagName, funcArgs);
				} else if (funcName == "getTotalAdaptive") {
					result = this.getTotalAdaptive(tagName, funcArgs);
				}

				if(result != null) {
					if(this.isConstraintsEnabled()) {
						if (result.pass == false) {
							enableStep = false;
						}
						if (result.message != "") {
							messages.push(result.message);
						}
					}
					if (result.highScore_performance) {
						perfScore = result.highScore_performance;
					}
					if (result.highScore_explanation) {
						explScore = result.highScore_explanation;
					}
					if (result.finalScore) {
						warpScore = result.finalScore;
					}
					if (result.minScore) {
						minScore = result.minScore;
					}
				}
			}
		}
	}
	
	//We don't want a drop in Warp Score to re-lock a visited mission.
	//If this step already has work registered, it should remain unlocked forever.
	enableStep = enableStep || this.getLatestState() != null;
	
	return {
		enableStep: enableStep,
		message: messages.length ? messages.join("<br>") + "<br>" : "",
		perfScore: perfScore,
		explScore: explScore,
		warpScore: warpScore,
		minScore: minScore
	};
};

/**
 * Retrieves the latest student work for this step.
 * @return the latest state object, or null if none has been submitted
 */
Epigame.prototype.getLatestState = function() {
	var latestState = null;
	
	//Get the latest state, if any states exist
	if (this.states != null && this.states.length > 0) {
		latestState = this.states[this.states.length - 1];
	}
	
	return latestState;
};

Epigame.prototype.getPreviousWarpScore = function() {
	var previousSuccesfulState = null;
	var previousSuccesfulScore = 0;	
	var numSuccessesSeen = 0;
		
	if(this.states != null) {
		for(i = this.states.length - 1; i >= 0; i--) {
			if(this.states[i].response.success) {
				numSuccessesSeen++;
				
				if(numSuccessesSeen > 1) {
					previousSuccesfulState = this.states[i];
					i = -1; //stop the loop previousSuccesfulState found
				}
			}
		}	
	}	
	
	if(previousSuccesfulState) {
		previousSuccesfulScore = previousSuccesfulState.response["finalScore"];
	}
	
	if(isNaN(previousSuccesfulScore))
		previousSuccesfulScore = 0;

	return previousSuccesfulScore;
}

/**
 * Returns the number of failed attempts since the last success.
 * @return the number of failed attempts since the last success
 */
Epigame.prototype.getCurrentAttemptCount = function() {
	var count = 0;
	
	//Search states in reverse until we hit a success or run out of states
	var i = this.states.length;
	while (i--) {
		var state = this.states[i];
		if (state.response) {
			if (state.response.success)
				break;

			if (state.response.failures) //Standard mission
				count += state.response.failures.length;
			if (state.response.attempts) //Warp mission
				count += state.response.attempts.length;
		}
	}
	return count;
};

/**
 * Returns the latest state response string (may be called by the game SWF).
 * @return the stringified response JSON
 */
Epigame.prototype.getLatestReportString = function() {
	var latestState = this.getLatestState();
	return latestState && latestState.response ? JSON.stringify(latestState.response) : null;
};

Epigame.prototype.saveGameState = function(reportString) {
	//console.log("saving game state: " + reportString);
	return this.save(reportString);
};

Epigame.prototype.saveExitState = function() {
	var elem = this.getGameElement();
	if (elem && elem.getExitReport) {
		this.save(elem.getExitReport(),true);
	}
};

Epigame.prototype.getMissionData = function () {
  var dataLog = {};

  dataLog.projectID = this.node.view.model.projectMetadata.id;
  dataLog.workgroupID = this.node.view.userAndClassInfo.getWorkgroupId();
  dataLog.studentIDs = this.node.view.userAndClassInfo.getUserIds();
  dataLog.studentName = this.node.view.userAndClassInfo.getUserName();
  dataLog.step=this.node.view.model.currentNodePosition;
  dataLog.stepVisit = 1;

  var numAttempts = 0;
  var numTrials = 0;
  var unsuccessfulTrialNum = 1;
  var successfulTrialNum = 0;
  var numSuccesses = 0;

  for (var i = 0; i < this.states.length; i++) {
    if (this.states[i].response.success) {
      if (this.states[i].response.missionData && this.states[i].response.missionData.timePostFlightScreens) {
        successfulTrialNum = numTrials;
      }
      numAttempts++;
      numSuccesses++;
      unsuccessfulTrialNum = 1;
    }

    //Player has started a trial (not a question)
    else if (this.states[i].response.missionData.timeIntroScreen > 0) {
      numTrials++;
      unsuccessfulTrialNum++;
    }

    if (this.states[i].response.isExit && !this.states[i].response.missionData.isNodeExit) {
      dataLog.stepVisit++;
    }


    if (this.states[i].response.missionData && this.states[i].response.missionData.totalTrials) {
      numTrials = this.states[i].response.missionData.totalTrials;
    }
    //console.log(Object.keys(this.states[i].response).length);
  }
  //account for the fact that an exit report is saved when entering 
  dataLog.stepVisit = Math.round(dataLog.stepVisit);

  dataLog.attempts = 1 + numAttempts;
  dataLog.attemptTrials = unsuccessfulTrialNum;
  dataLog.totalTrials = numTrials;
  dataLog.numSuccesses = numSuccesses;
  dataLog.missionDifficulty = this.lastMissionDifficulty;

  return JSON.stringify(dataLog);
};

/**
 * Creates a state object to represent the student work (if any), then saves it.
 */
Epigame.prototype.save = function (st, isNodeExit) {
  //Work may be null or undefined if the game isn't loaded.
  //The game will send an empty string if it's not in a meaningful save state.
  //If the work is null or blank, we don't want it saved, so ignore the request.
  if (!st)
    return;

  var stateJSON = JSON.parse(decodeURIComponent(st));

  //Create the state that will store the new work the student just submitted
  var epigameState = new EpigameState(stateJSON);

  //save warp index used if it exists
  if (!isNaN(this.lastWarpIndex)) {
    epigameState.response.warpIndex = this.lastWarpIndex;
  }

  if(epigameState.response.missionData!=undefined){
    epigameState.response.missionData.isNodeExit = isNodeExit;
  }
  

  //Push this state to the global view.states object.
  //eventManager.fire('pushStudentWork', epigameState);
  this.node.view.pushStudentWork(this.node.id, epigameState);  //4.7 switch

  //Push the state object into this or object's own copy of states
  this.states.push(epigameState);

  if (epigameState.response) {
    console.log("pushing state: ");
    console.log(epigameState.response);
  }

  //get all the node visits for this step
  var nodeVisits = this.view.getState().getNodeVisitsByNodeId(this.node.id);

  // Process the student work for nav display
  this.node.processStudentWork(nodeVisits);

  //Post the current node visit to the DB immediately without waiting for exit.
  this.node.view.postCurrentNodeVisit();

  //Process the tag maps again if we are not in authoring mode (currently no reason to) //testing to remove
  /*
  if (this.view.authoringMode == null || !this.view.authoringMode) {
  this.processTagMaps();
  }
  */
};

/**
 * Get whether constraints are enabled
 */
Epigame.prototype.isConstraintsEnabled = function() {
	var result = true;
	
	if(this.view != null && this.view.getConfig() != null) {
		//get the config param if it is availabled
		var isConstraintsDisabled = this.view.getConfig().getConfigParam("isConstraintsDisabled");
		
		if(isConstraintsDisabled != null) {
			//the config param is available so we will set our result based its value
			result = !isConstraintsDisabled;
		}
	}
	
	return result;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/epigame/epigame.js');
}