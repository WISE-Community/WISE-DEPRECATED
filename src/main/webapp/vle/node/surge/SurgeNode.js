SurgeNode.prototype = new Node();
SurgeNode.prototype.constructor = SurgeNode;
SurgeNode.prototype.parent = Node.prototype;

/*
 * the name that displays in the authoring tool when the author creates a new step
 */
SurgeNode.authoringToolName = "Surge"; 

/*
 * will be seen by the author when they add a new step to their project to help
 * them understand what kind of step this is
 */
SurgeNode.authoringToolDescription = "This is a generic step only used by developers";

/*
 * The tag map functions that are available for this step type
 */
SurgeNode.tagMapFunctions = [
	{functionName:'importWork', functionArgs:[]},
	{functionName:'showPreviousWork', functionArgs:[]},
	{functionName:'checkScore', functionArgs:['Min Score']},
	{functionName:'getAccumulatedScore', functionArgs:[]}
];

//The statuses that this step can return
SurgeNode.availableStatuses = [
	{statusType:'surgeMedal', possibleStatusValues:['bronze', 'silver', 'gold']}
];

//The special statuses that can be satisfied by any of the statuses in the group
SurgeNode.specialStatusValues = [
	{statusType:'surgeMedal', statusValue:'atLeastBronze', possibleStatusValues:['bronze', 'silver', 'gold']},
	{statusType:'surgeMedal', statusValue:'atLeastSilver', possibleStatusValues:['silver', 'gold']},
	{statusType:'surgeMedal', statusValue:'atLeastGold', possibleStatusValues:['gold']}
];


/**
 * This is the constructor for the Node
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 */
function SurgeNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
	
	this.tagMapFunctions = this.tagMapFunctions.concat(SurgeNode.tagMapFunctions);
}

/**
 * This function is called when the vle loads the step and parses
 * the previous student answers, if any, so that it can reload
 * the student's previous answers into the step.
 * 
 * @param stateJSONObj
 * @return a new state object
 */
SurgeNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	return SurgeState.prototype.parseDataJSONObj(stateJSONObj);
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
SurgeNode.prototype.translateStudentWork = function(studentWork) {
	return studentWork;
};

/**
 * We do not need to do anything onExit for SURGE since 
 * we are saving state intermediately.
 */
SurgeNode.prototype.onExit = function() {
	//check if the content panel has been set
	/*
	if(this.contentPanel) {
		if(this.contentPanel.save) {
			//tell the content panel to save
			this.contentPanel.save();
		}
	}
	*/
};

/**
 * Renders the student work into the div. The grading tool will pass in a
 * div id to this function and this function will insert the student data
 * into the div.
 * 
 * @param displayStudentWorkDiv the div we will render the student work into
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
SurgeNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	var gradingText = "";
	// Get all the trials (ie states) for this nodevisit
	var nodeStates = nodeVisit.nodeStates;
	
	if (nodeStates.length > 0) {
		
		// get the best score
		gradingText += "<span style='font-weight:bold;'>Best medal earned for this level: "+nodeStates[nodeStates.length-1].getStudentWork().response.topScoreText+"</span><br/><br/>";
		
		// get the number of trials during this node visit.
		gradingText += "This visit has " + nodeStates.length + " trial(s).<br/><br/>";
		
		/*
		 * loop through the trials from newest to oldest so that
		 * the newest displays at the top
		 */
		for (var i=nodeStates.length - 1; i>=0; i--) {
			gradingText += "<b>Trial #"+(i+1)+"</b><br/>"
			gradingText += JSON.stringify(nodeStates[i].getStudentWork().response) + "<br/><br/>";
		}

		//put the student work into the div
		displayStudentWorkDiv.html(gradingText);
	}
};

/**
 * Get the html file associated with this step that we will use to
 * display to the student.
 * 
 * @return a content object containing the content of the associated
 * html for this step type
 */
SurgeNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/surge/surge.html');
};

/**
 * Process the student work and change the node status if necessary
 * 
 * @param nodeVisits the student's node visits for this step
 */
SurgeNode.prototype.processStudentWork = function(nodeVisits) {
	if(nodeVisits != null) {
		if(nodeVisits.length > 0) {
			//the student has visited this step
			this.setStatus('isVisited', true);
		}
	}
	
	if(nodeVisits != null) {
		//get the latest node state
		var nodeState = this.view.getLatestNodeStateWithWorkFromNodeVisits(nodeVisits);
		
		if(nodeState != null) {
			//the student has completed this step
			this.setStatus('isCompleted', true);
			
			var response = nodeState.response;
			
			if(response != null && response != "") {
				var imgPath = '';
				var tooltip = '';
				
				//get the top score
				var topScore = response.topScore;
				var scoreAbsolute = response.scoreAbsolute;
				
				var best = null;
				
				//get the best score
				if(topScore > scoreAbsolute || topScore == scoreAbsolute) {
					best = topScore;
				} else {
					best = scoreAbsolute;
				}
				
				var statusValue = null;
				
				//get the status value based on the score
				if(best == 10) {
					statusValue = 'bronze';
				} else if(best == 20) {
					statusValue = 'silver';
				} else if(best == 30) {
					statusValue = 'gold';
				}
				
				//set the status value
				this.setStatus('surgeMedal', statusValue);
			}
		}
	}
};

/**
 * Get all the statuses that this step can return
 */
SurgeNode.prototype.getAvailableStatuses = function() {
	var availableStatuses = [];
	
	/*
	 * get the statuses from the parent and combine it 
	 * with the statuses from this step
	 */
	availableStatuses = Node.availableStatuses.concat(SurgeNode.availableStatuses);
	
	return availableStatuses;
};

/**
 * Determine whether the student has completed the step or not
 * @param nodeVisits an array of node visits for the step
 * @return whether the student has completed the step or not
 */
SurgeNode.prototype.isCompleted = function(nodeVisits) {
	var result = false;

	var latestNodeState = this.view.getLatestNodeStateWithWorkFromNodeVisits(nodeVisits);
	
	if(latestNodeState != null) {
		result = true;
	}

	return result;
};

/**
 * Check if the status value satisfies the requirement
 * 
 * @param statusValue the status value of the node
 * @param statusValueToSatisfy the status requirement
 * 
 * @return whether the status value satisfies the requirement
 */
SurgeNode.prototype.isStatusValueSatisfied = function(statusType, statusValue, statusValueToSatisfy) {
	var result = false;
	var specialStatusValues = SurgeNode.specialStatusValues;
	
	if(statusValue + '' == statusValueToSatisfy + '') {
		//the status matches the required value
		result = true;
	} else if(this.matchesSpecialStatusValue(statusType, statusValue, statusValueToSatisfy, specialStatusValues)) {
		result = true;
	}
	
	return result;
};

//Add this node to the node factory so the vle knows it exists.
NodeFactory.addNode('SurgeNode', SurgeNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/surge/SurgeNode.js');
};