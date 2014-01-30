EpigameNode.prototype = new Node();
EpigameNode.prototype.constructor = EpigameNode;
EpigameNode.prototype.parent = Node.prototype;
EpigameNode.prototype.i18nEnabled = true;
EpigameNode.prototype.i18nPath = "/vlewrapper/vle/node/epigame/i18n/";
EpigameNode.prototype.supportedLocales = {
	"en_US":"en_US"	
};

/*
 * the name that displays in the authoring tool when the author creates a new step
 */
EpigameNode.authoringToolName = "Epigame"; 

/*
 * will be seen by the author when they add a new step to their project to help
 * them understand what kind of step this is
 */
EpigameNode.authoringToolDescription = "Game step for Surge: The Fuzzy Chronicles";

/*
 * The tag map functions that are available for this step type
 */
EpigameNode.tagMapFunctions = [
	{functionName:"checkCompletedAll", functionArgs:[]},
	{functionName:"checkCompletedAny", functionArgs:[]},
	{functionName:"checkCompletedBronze", functionArgs:[]},
	{functionName:"checkCompletedSilver", functionArgs:[]},	
	{functionName:"checkStepPerformance", functionArgs:["Score to Unlock"]},
	{functionName:"checkStepExplanation", functionArgs:["Score to Unlock"]},
	{functionName:"getTotalPerformance", functionArgs:["Score to Unlock (optional)", "Tag Multipliers (advanced)"]},
	{functionName:"getTotalExplanation", functionArgs:["Score to Unlock (optional)", "Tag Multipliers (advanced)"]},
	{functionName:"getTotalAdaptive", functionArgs:["Score to Unlock (optional)"]}
];

//The statuses that this step can return
EpigameNode.availableStatuses = [
	{statusType:'epigameMedal', possibleStatusValues:['bronze', 'silver', 'gold']}
];

//The special statuses that can be satisfied by any of the statuses in the group
EpigameNode.specialStatusValues = [
	{statusType:'epigameMedal', statusValue:'atLeastBronze', possibleStatusValues:['bronze', 'silver', 'gold']},
	{statusType:'epigameMedal', statusValue:'atLeastSilver', possibleStatusValues:['silver', 'gold']},
	{statusType:'epigameMedal', statusValue:'atLeastGold', possibleStatusValues:['gold']}
];

EpigameNode.prototype.getQuizData = function(customURL) {
	var content = null;
	
//	console.log("gettingQuizData with customURL: " + customURL + "Defaultquiz: " + this.defaultQuizContent);
	
	if (customURL && customURL != "") {
		content = createContent(customURL);
	} else {
		console.log("Looking at default quiz content");
//		if (!this.defaultQuizContent) {
//			this.defaultQuizContent = createContent("node/epigame/adaptiveQuizData.json");

			//move quiz data to the asset location
			this.defaultQuizContent = createContent(this.view.getConfig().getConfigParam('getContentBaseUrl')+"/assets/adaptiveQuizData.json");
//		}
			
		content = this.defaultQuizContent;
	}
	return content.getContentJSON();
};

EpigameNode.prototype.getAdaptiveMissionData = function(customURL) {
	var content = null;
	
	if (customURL && customURL != "") {
		content = createContent(customURL);
	} else {
//		if (!this.defaultAdaptiveMissionContent) {
//			this.defaultAdaptiveMissionContent = createContent("node/epigame/adaptiveMissionData.json");		
//		}

		console.log("Loading:" + this.view.getConfig().getConfigParam('getContentBaseUrl')+"/assets/adaptiveMissionData.json");
		this.defaultAdaptiveMissionContent = createContent(this.view.getConfig().getConfigParam('getContentBaseUrl')+"/assets/adaptiveMissionData.json");
	
		content = this.defaultAdaptiveMissionContent;
	}
	return content.getContentJSON();
};

/**
 * This is the constructor for the Node
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 */
function EpigameNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
	
	this.tagMapFunctions = this.tagMapFunctions.concat(EpigameNode.tagMapFunctions);
	
	EpigameNode.statusConstraintMessages = [
        {statusType:'epigameMedal', statusValue:'bronze', message: this.view.getI18NStringWithParams('constraint_message_mustHaveMedal',[this.view.getI18NString('bronze','EpigameNode')],'EpigameNode')},
        {statusType:'epigameMedal', statusValue:'silver', message: this.view.getI18NStringWithParams('constraint_message_mustHaveMedal',[this.view.getI18NString('silver','EpigameNode')],'EpigameNode')},
        {statusType:'epigameMedal', statusValue:'gold', message: this.view.getI18NStringWithParams('constraint_message_mustHaveMedal',[this.view.getI18NString('gold','EpigameNode')],'EpigameNode')},
        {statusType:'epigameMedal', statusValue:'atLeastBronze', message: this.view.getI18NStringWithParams('constraint_message_mustHaveAtLeastMedal',[this.view.getI18NString('bronze','EpigameNode')],'EpigameNode')},
        {statusType:'epigameMedal', statusValue:'atLeastSilver', message: this.view.getI18NStringWithParams('constraint_message_mustHaveAtLeastMedal',[this.view.getI18NString('silver','EpigameNode')],'EpigameNode')},
        {statusType:'epigameMedal', statusValue:'atLeastGold', message: this.view.getI18NStringWithParams('constraint_message_mustHaveAtLeastMedal',[this.view.getI18NString('gold','EpigameNode')],'EpigameNode')}
    ];
	
	/**
	 * Get the status constraint messages
	 */
	EpigameNode.prototype.getStatusConstraintMessages = function() {
		// TODO: check for duplicates
		return Node.statusConstraintMessages.concat(EpigameNode.statusConstraintMessages);
	};
}

/**
 * This function is called when the vle loads the step and parses
 * the previous student answers, if any, so that it can reload
 * the student's previous answers into the step.
 * 
 * @param stateJSONObj
 * @return a new state object
 */
EpigameNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	return EpigameState.prototype.parseDataJSONObj(stateJSONObj);
};

/**
 * This function is called if there needs to be any special translation
 * of the student work from the way the student work is stored to a
 * human readable form. For example if the student work is stored
 * as an array that contains 3 elements, for example
 * ["apple", "banana", "orange"]
 *  
 * and you wanted to display the student work like this
 * 
 * Answer 1: apple
 * Answer 2: banana
 * Answer 3: orange
 * 
 * you would perform that translation in this function.
 * 
 * Note: In most cases you will not have to change the code in this function
 * 
 * @param studentWork
 * @return translated student work
 */
EpigameNode.prototype.translateStudentWork = function(studentWork) {
	return studentWork;
};

/**
 * Notify the HTML so it can save state on exit if desired.
 */
EpigameNode.prototype.onExit = function () {
  try {
    //check if the content panel has been set
    if (this.contentPanel && this.contentPanel.save) {
      console.log(this.contentPanel);
      console.log(this.contentPanel.save);
      //tell the content panel to save
      this.contentPanel.save();
    }
  } catch (e) {

  }
};

/**
 * Renders the student work into the div. The grading tool will pass in a
 * div id to this function and this function will insert the student data
 * into the div.
 * 
 * @param divId the id of the div we will render the student work into
 * @param nodeVisit the student work
 * @param childDivIdPrefix (optional) a string that will be prepended to all the 
 * div ids use this to prevent DOM conflicts such as when the show all work div
 * uses the same ids as the show flagged work div
 * @param workgroupId the id of the workgroup this work belongs to
 * 
 * Note: you may need to add code to this function if the student
 * data for your step is complex or requires additional processing.
 * look at SensorNode.renderGradingView() as an example of a step that
 * requires additional processing
 */
EpigameNode.prototype.renderGradingView = function(divId, nodeVisit, childDivIdPrefix, workgroupId) {
	var gradingText = "";
	// Get all the trials (ie states) for this nodevisit
	var nodeStates = nodeVisit.nodeStates;
	
	if (nodeStates.length > 0) {
		
		//get the best score
		//gradingText += "<span style='font-weight:bold;'>Best medal earned for this level: "+nodeStates[nodeStates.length-1].getStudentWork().response.topScoreText+"</span><br/><br/>";
		
		//get the number of trials during this node visit.
		//gradingText += "This visit has " + nodeStates.length + " trial(s).<br/><br/>";
		
		//loop through the trials from newest to oldest so that the newest displays at the top
		for (var i = nodeStates.length - 1; i >= 0; --i) {
			//gradingText += "<b>Trial #"+(i+1)+"</b><br/>"
			gradingText += JSON.stringify(nodeStates[i].getStudentWork().response) + "<br/><br/>";
		}

		//put the student work into the div
		$('#' + divId).html(gradingText);
	}
};

/**
 * Get the html file associated with this step that we will use to
 * display to the student.
 * 
 * @return a content object containing the content of the associated
 * html for this step type
 */
EpigameNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/epigame/epigame.html');
};

/**
 * Determine whether the student has completed the step or not
 * @param nodeVisits an array of node visits for the step
 * @return whether the student has completed the step or not
 */
EpigameNode.prototype.isCompleted = function(nodeVisits) {
	var result = false;

	var latestNodeState = this.view.getLatestNodeStateWithWorkFromNodeVisits(nodeVisits);
	
	if(latestNodeState != null) {
		result = true;
	}

	return result;
};

/**
 * Process the student work to see if we need to display a colored
 * star next to the step in the nav menu
 * @param studentWork the student's epigame state
 */
EpigameNode.prototype.processStudentWork = function(nodeVisits) {
	if(nodeVisits != null) {
		if(nodeVisits.length > 0) {
			//the student has visited this step
			this.setStatus('isVisited', true);
		}
	}
	
	if(nodeVisits != null) {
		var content = this.content.getContentJSON();
		
		if(content != null) {
			var mode = content.mode;
			
			if(mode == null) {
				
			} else if(mode == 'adaptiveQuiz') {
				//get the latest node state
				var nodeState = this.view.getLatestNodeStateWithWorkFromNodeVisits(nodeVisits);
				
				if(nodeState != null) {
					if(nodeState.response != null) {
						if(nodeState.response.success == 'finished') {
							//the student has completed this step
							this.setStatus('isCompleted', true);
						}
					}
				}
			} else if(mode == 'tutorial') {
				//the student has completed this step
				this.setStatus('isCompleted', true);
			} else if(mode == 'mission') {
				//get the highest mission score from the node visits
				var score = this.getHighestMissionScore(nodeVisits);
				
				var statusValue = null;
				
				if(score == null) {
					
				} else if(score >= 350) {
					statusValue = 'gold';
				} else if(score >= 300) {
					statusValue = 'silver';
				} else if(score >= 200) {
					statusValue = 'bronze';
				}

				if(statusValue != null) {
					//the student has completed this step
					this.setStatus('isCompleted', true);
					
					//set the status value
					this.setStatus('epigameMedal', statusValue);
				}
			} else if(mode == 'adaptiveMission') {
				//get the latest node state
				var nodeState = this.view.getLatestNodeStateWithWorkFromNodeVisits(nodeVisits);
				
				if(nodeState != null) {
					var response = nodeState.response;
					
					if(response != null && response != "") {
						if(response.finalScore > 0) {
							//the student has completed this step
							this.setStatus('isCompleted', true);
						}
					}
				}
			} else if(mode == 'adaptivePostQuiz') {
				//the student has completed this step
				this.setStatus('isCompleted', true);
			}
		}
	}
};

/**
 * Get the highest mission score from the node visits
 */
EpigameNode.prototype.getHighestMissionScore = function(nodeVisits) {
	var score = null;
	
	if(nodeVisits != null) {
		//loop through all the node visits
		for(var x=0; x<nodeVisits.length; x++) {
			var nodeVisit = nodeVisits[x];
			
			if(nodeVisit != null) {
				var nodeStates = nodeVisit.nodeStates;
				
				if(nodeStates != null) {
					//loop through all the node states
					for(var y=0; y<nodeStates.length; y++) {
						var nodeState = nodeStates[y];
						
						if(nodeState != null) {
							var response = nodeState.response;
							
							if(response != null) {
								//get the score for this node state
								var highScore_performance = response.highScore_performance;
								
								//check if the score for the node state is higher than any we have seen before
								if(highScore_performance > score) {
									//the score for this node state is higher so we will remember it
									score = highScore_performance;
								}
							}
						}
					}
				}
			}
		}
	}
	
	return score;
};

/**
 * Check if the status value satisfies the requirement
 * 
 * @param statusValue the status value of the node
 * @param statusValueToSatisfy the status requirement
 * 
 * @return whether the status value satisfies the requirement
 */
EpigameNode.prototype.isStatusValueSatisfied = function(statusType, statusValue, statusValueToSatisfy) {
	var result = false;
	var specialStatusValues = EpigameNode.specialStatusValues;
	
	if(statusValue + '' == statusValueToSatisfy + '') {
		//the status matches the required value
		result = true;
	} else if(this.matchesSpecialStatusValue(statusType, statusValue, statusValueToSatisfy, specialStatusValues)) {
		result = true;
	}
	
	return result;
};

/**
 * Get a tag map function given the function name
 * @param functionName
 * @return 
 */
EpigameNode.prototype.getTagMapFunctionByName = function(functionName) {
	var fun = null;
	
	//get all the tag map function for this step type
	var tagMapFunctions = this.getTagMapFunctions();
	
	//loop through all the tag map functions
	for(var x=0; x<tagMapFunctions.length; x++) {
		//get a tag map function
		var tagMapFunction = tagMapFunctions[x];
		
		if (tagMapFunction != null) {
			//check if the function name matches
			if (functionName == tagMapFunction.functionName) {
				//the function name matches so we have found what we want
				fun = tagMapFunction;
				break;
			}
		}
	};
	
	return fun;
};

/**
 * Get the available statuses for this step type
 * @param includeSpecialStatusValues (optional) whether to include the special status
 * values
 */
EpigameNode.prototype.getAvailableStatuses = function(includeSpecialStatusValues) {
	var availableStatuses = [];
	
	if(includeSpecialStatusValues) {
		//include the special status values
		availableStatuses = this.getAvailableStatusesIncludingSpecialStatusValues();
	} else {
		//do not include the special status values
		availableStatuses = Node.availableStatuses.concat(EpigameNode.availableStatuses);		
	}
	
	return availableStatuses;
};

/**
 * Get all the available statuses including the special status values
 */
EpigameNode.prototype.getAvailableStatusesIncludingSpecialStatusValues = function() {
	//get all the available statuses
	var availableStatuses = JSON.parse(JSON.stringify(Node.availableStatuses.concat(EpigameNode.availableStatuses)));
	
	//get the special status values
	var specialStatusValues = EpigameNode.specialStatusValues;
	
	if(specialStatusValues != null) {
		//loop through all the special status values
		for(var x=0; x<specialStatusValues.length; x++) {
			//get a special status value
			var specialStatusValue = specialStatusValues[x];
			
			if(specialStatusValue != null) {
				//get the status type and status value
				var specialStatusType = specialStatusValue.statusType;
				var specialStatusValue = specialStatusValue.statusValue;
				
				/*
				 * loop through all the available statuses so we can add the 
				 * special status value
				 */
				for(var y=0; y<availableStatuses.length; y++) {
					//get an available status
					var availableStatus = availableStatuses[y];
					
					if(availableStatus != null) {
						//get the status type
						var availableStatusType = availableStatus.statusType;
						
						/*
						 * check if this status type matches the one we want to add
						 * the special status value to
						 */
						if(specialStatusType == availableStatusType) {
							//we have found the status type to add the special status value to
							availableStatus.possibleStatusValues.push(specialStatusValue);
						}
					}
				}
			}
		}
	}
	
	return availableStatuses;
};

/**
 * Get the explanation high score from the node state
 * @param nodeState the node state to get the score from
 * @return the explanation high score or null if there is no
 * explanation high score
 */
EpigameNode.prototype.getHighScoreExplanation = function(nodeState) {
	var highScoreExplanation = null;
	
	if(nodeState != null &&
			nodeState.response != null && 
			nodeState.response.highScore_explanation != null) {
		highScoreExplanation = nodeState.response.highScore_explanation;
	}
	
	return highScoreExplanation;
};

/**
 * Get the performance high score from the node state
 * @param nodeState the node state to get the score from
 * @return the performance high score or null if there is no
 * performance high score
 */
EpigameNode.prototype.getHighScorePerformance = function(nodeState) {
	var highScorePerformance = null;
	
	if(nodeState != null &&
			nodeState.response != null &&
			nodeState.response.highScore_performance != null) {
		highScorePerformance = nodeState.response.highScore_performance;
	}
	
	return highScorePerformance;
};

/**
 * Get the total high score from the node state
 * @param nodeState the node state to get the score from
 * @return the total high score or null if there is no
 * total high score
 */
EpigameNode.prototype.getTotalScore = function(nodeState) {
	var totalScore = null;
	
	if(nodeState != null && nodeState.response != null) {
		//check if there is an explanation high score or performance high score
		if(nodeState.response.highScore_explanation != null || 
				nodeState.response.highScore_performance != null) {
			
			totalScore = 0;
			
			if(nodeState.response.highScore_explanation != null) {
				//add the explanation high score
				var highScoreExplanation = nodeState.response.highScore_explanation;
				//totalScore += highScoreExplanation;
			}
			
			if(nodeState.response.highScore_performance != null) {
				//add the performance high score
				var highScorePerformance = nodeState.response.highScore_performance;
				totalScore += highScorePerformance;
			}
		}
	}
	
	return totalScore;
};

/**
 * Get the score from the node state
 * @param the node state to get the score from
 */
EpigameNode.prototype.getScore = function(nodeState) {
	var score = this.getTotalScore(nodeState);
	
	return score;
};

EpigameNode.prototype.navHelper = function() {
	var interpretNode = function(node) {
		var result = {
			id: node.id,
			title: node.title,
			type: node.type,
			className: node.className,
			content: null,
			imagePathBase: node.view.nodeIconPaths[node.type],
			tags: node.tags,
			children: []
		};
		
		if (node.children)
			for (var i = 0; i < node.children.length; ++i)
				result.children[i] = interpretNode(node.children[i]);
				
		if (node.content)
			result.content = node.content.getContentJSON();
			
		return result;
	}
	
	return {
		getProjectData: function() {
			var project = env.getProject();
			return {
				root: interpretNode(project.getRootNode()),
				stepTerm: view.getStepTerm(),
				title: project.getTitle()
			};
		},
		toggleNav: function() {
//			eventManager.fire('toggleNavigationVisibility');
			eventManager.fire('navigationPanelToggleVisibilityButtonClicked'); //4.7 switch
		},
		executeNode: function(sequenceIndex, stepIndex) {
			var pos = String(sequenceIndex) + "." + String(stepIndex);			
//			eventManager.fire('renderNode', pos);
			view.goToNodePosition(pos);	//4.7 Switch
		}
	};
}();

//Add this node to the node factory so the vle knows it exists.
NodeFactory.addNode('EpigameNode', EpigameNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/epigame/EpigameNode.js');
};