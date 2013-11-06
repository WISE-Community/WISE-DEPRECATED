/*
 * MatchSequenceNode
 */

MatchSequenceNode.prototype = new Node();
MatchSequenceNode.prototype.constructor = MatchSequenceNode;
MatchSequenceNode.prototype.parent = Node.prototype;
MatchSequenceNode.authoringToolName = "Match & Sequence";
MatchSequenceNode.authoringToolDescription = "Students drag and drop choices into boxes";
MatchSequenceNode.prototype.i18nEnabled = true;
MatchSequenceNode.prototype.i18nPath = "vle/node/matchsequence/i18n/";
MatchSequenceNode.prototype.supportedLocales = {
		"en_US":"en_US",
		"ja":"ja",
		"es":"es",
		"nl":"nl",
		"nl_GE":"nl",
		"nl_DE":"nl"		
};

MatchSequenceNode.tagMapFunctions = [
                                     {functionName:'importWork', functionArgs:[]},
                                     {functionName:'showPreviousWork', functionArgs:[]}
                                     ];

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {MatchSequenceNode}
 */
function MatchSequenceNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];

	this.tagMapFunctions = this.tagMapFunctions.concat(MatchSequenceNode.tagMapFunctions);
};

/**
 * Takes in a state JSON object and converts it into an MSSTATE object
 * @param nodeStatesJSONObj a state JSON object
 * @return an MSSTATE object
 */
MatchSequenceNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	return MSSTATE.prototype.parseDataJSONObj(stateJSONObj);
};


MatchSequenceNode.prototype.onExit = function() {

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
 */
MatchSequenceNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	//create the match sequence object so we can reference the content later
	var matchSequence = new MS(this, this.view);

	//get the latest state object
	var state = nodeVisit.getLatestWork();

	var text = "";

	//loop through all the target buckets
	for(var h=0;h<state.buckets.length;h++){
		var bucket = state.buckets[h];
		//get the text for the bucket
		var bucketText = bucket.text;

		/*
		 * each bucket will be represented as following
		 * 
		 * ([bucketText]: choice1Text, choice2Text)
		 */
		text += "([" + bucketText + "]: ";

		var choicesText = "";

		//loop through the choices
		for(var g=0;g<bucket.choices.length;g++){
			//if this is not the first choice, add a comma to separate them
			if(choicesText != "") {
				choicesText += ", ";
			}

			//add the bucket text
			choicesText += bucket.choices[g].text;
		};

		text += choicesText;

		//close the bucket and add a new line for easy reading
		text += ")<br>";
	};

	//loop through the source bucket
	if (state.sourceBucket != null) {
		var bucket = state.sourceBucket;
		//get the text for the source bucket
		var bucketText = bucket.text;

		/*
		 * each bucket will be represented as following
		 * 
		 * ([bucketText]: choice1Text, choice2Text)
		 */
		text += "([" + bucketText + "]: ";

		var choicesText = "";

		//loop through the choices
		for(var g=0;g<bucket.choices.length;g++){
			//if this is not the first choice, add a comma to separate them
			if(choicesText != "") {
				choicesText += ", ";
			}

			//add the bucket text
			choicesText += bucket.choices[g].text;
		};

		text += choicesText;

		//close the bucket and add a new line for easy reading
		text += ")<br>";
	}


	if(state.score != null) {
		//get the max score
		var maxScore = matchSequence.getMaxPossibleScore();

		text += "<br>";
		text += this.view.getI18NStringWithParams("autograded_score",[state.store + "/" + maxScore],"MatchSequenceNode");
	}

	displayStudentWorkDiv.append(text);
};

/**
 * Determine whether the student has completed the step or not
 * @param nodeState the latest node state for the step
 * @return whether the student has completed the step or not
 */
MatchSequenceNode.prototype.isCompleted = function(nodeVisits) {
	var hasCorrectness = (this.content.getContentJSON().hasCorrectness != null) ? this.content.getContentJSON().hasCorrectness : true;
	
	var isCompleted = false;
	
	var nodeState = this.view.getLatestNodeStateWithWorkFromNodeVisits(nodeVisits);
	
	if (hasCorrectness) {
		if(nodeState != null && nodeState != '') {
			if(nodeState.isCorrect) {
				isCompleted = true;
			}
		}
	} else {
		return nodeState != null; 
	}

	return isCompleted;
};
/**
 * Returns the order in which the branching paths should appear based on student response.
 */
MatchSequenceNode.prototype.getBranchPathOrderValues = function() {
	var branchPathOrder = [];
	var state = view.getLatestStateForNode(this.id);

	//loop through all the target buckets
	for(var h=0;h<state.buckets.length;h++){
		var bucket = state.buckets[h];

		//loop through the choices
		for(var g=0;g<bucket.choices.length;g++){
			var choice = bucket.choices[g];
			branchPathOrder.push(choice.identifier);
		};
	};

	//loop through the source bucket
	if (state.sourceBucket != null) {
		var bucket = state.sourceBucket;

		//loop through the choices
		for(var g=0;g<bucket.choices.length;g++){
			var choice = bucket.choices[g];
			branchPathOrder.push(choice.identifier);
		};
	}
	return branchPathOrder;
};

MatchSequenceNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/matchsequence/matchsequence.html');
};


NodeFactory.addNode('MatchSequenceNode', MatchSequenceNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/matchsequence/MatchSequenceNode.js');
};