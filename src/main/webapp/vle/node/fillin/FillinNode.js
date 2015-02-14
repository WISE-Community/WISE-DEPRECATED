FillinNode.prototype = new Node();
FillinNode.prototype.constructor = FillinNode;
FillinNode.prototype.parent = Node.prototype;
FillinNode.authoringToolName = "Fill In";
FillinNode.authoringToolDescription = "Students fill in the missing text blanks in a body of text";
FillinNode.prototype.i18nEnabled = true;
FillinNode.prototype.i18nPath = "vle/node/fillin/i18n/";
FillinNode.prototype.supportedLocales = {
			"en_US":"en_US",
			"es":"es",
			"iw":"he",
			"ja":"ja",
			"ko":"ko",
			"nl":"nl",
			"nl_GE":"nl",
			"nl_DE":"nl",
			"zh_CN":"zh_CN"
};

FillinNode.tagMapFunctions = [
	{functionName:'importWork', functionArgs:[]},
	{functionName:'showPreviousWork', functionArgs:[]}
];

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {FillinNode}
 */
function FillinNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
	
	this.tagMapFunctions = this.tagMapFunctions.concat(FillinNode.tagMapFunctions);
};

/**
 * Takes in a state JSON object and returns a FILLINSTATE object
 * @param nodeStatesJSONObj a state JSON object
 * @return a FILLINSTATE object
 */
FillinNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	return FILLINSTATE.prototype.parseDataJSONObj(stateJSONObj);
};

FillinNode.prototype.translateStudentWork = function(studentWork) {
	return studentWork;
};

FillinNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/fillin/fillin.html');
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
 * TODO: rename TemplateNode
 * Note: you may need to add code to this function if the student
 * data for your step is complex or requires additional processing.
 * look at SensorNode.renderGradingView() as an example of a step that
 * requires additional processing
 */
FillinNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	//create a FILLIN object so we can check the student answers
	var fillin = new FILLIN(this);
	
	/*
	 * get the step work id from the node visit in case we need to use it in
	 * a DOM id. we don't use it in this case but I have retrieved it in case
	 * someone does need it. look at SensorNode.js to view an example of
	 * how one might use it.
	 */
	var stepWorkId = nodeVisit.id;

	var studentWork = "";
	
	if(nodeVisit != null) {
		//get the node states for the node visit
		var nodeStates = nodeVisit.nodeStates;
		
		if(nodeStates != null) {
			
			//loop through all the node states
			for(var x=0; x<nodeStates.length; x++) {
				//get a node state
				var nodeState = nodeStates[x];
				
				if(nodeState != null) {
					var textEntryInteractionIndex = nodeState.textEntryInteractionIndex;
					
					//get the fillin index. the textEntryInteractionIndex is 0 indexed so we will increment it by 1.
					var fillinIndex = nodeState.textEntryInteractionIndex + 1;
					
					//get the text the student typed for that index
					var studentAnswerText = nodeState.response;

					//check if the student answer is correct;
					var isCorrect = fillin.checkSingleAnswer(textEntryInteractionIndex, studentAnswerText);
					
					if(studentWork != "") {
						//add a new line between the responses
						studentWork += "<br>";
					}
					
					var isCorrectText = '';
					
					if(isCorrect) {
						isCorrectText = this.view.getI18NString("correct","FillinNode");
					} else {
						isCorrectText = this.view.getI18NString("incorrect","FillinNode");
					}
					
					//display the index, student work, and whether the student answer was correct
					studentWork += "#" + fillinIndex + ": " + studentAnswerText + " [" + isCorrectText + "]";
				}
			}
		}
	}
	
	//put the student work into the div
	displayStudentWorkDiv.html(studentWork);
};

/**
 * Override of Node.overridesIsCompleted
 * Specifies whether the node overrides Node.isCompleted
 */
FillinNode.prototype.overridesIsCompleted = function() {
	return true;
};

/**
 * Override of Node.isCompleted
 * Get whether the step is completed or not
 * @return a boolean value whether the step is completed or not
 */
FillinNode.prototype.isCompleted = function(nodeVisits) {
	if (nodeVisits != null) {
		for (var i=0; i < nodeVisits.length; i++) {
			var nodeVisitForThisNode = nodeVisits[i];
			if (nodeVisitForThisNode.nodeStates != null) {
				for (var k=0;k<nodeVisitForThisNode.nodeStates.length;k++) {
					var nodeState = nodeVisitForThisNode.nodeStates[k];
					if (nodeState.isCompleted) {
						return true;
					}
				}
			}
		}
	}
	return false;
};

/**
 * Get the prompt for this step
 */
FillinNode.prototype.getPrompt = function() {
	var prompt = "";
	
	//get the content
	var content = this.content.getContentJSON();
	
	if(content != null && content.assessmentItem != null && content.assessmentItem.interaction != null) {
		var interaction = content.assessmentItem.interaction;
		
		//counter for the fillin blanks
		var fillinBlankCount = 1;
		
		//loop through all the interactions
		for(var x=0; x<interaction.length; x++) {
			var interactionObject = interaction[x];
			
			if(interactionObject != null) {
				//get whether the interaction is text or a fillin blank
				var type = interactionObject.type;
				
				if(type == 'htmltext') {
					//the interaction is text
					var text = interactionObject.text;

					prompt += text;
				} else if(type == 'textEntryInteraction') {
					//the interaction is a fillin blank
					
					//get the identifier
					var responseIdentifier = interactionObject.responseIdentifier;
					
					//get the correct answer
					var correctAnswer = this.getCorrectAnswer(responseIdentifier);
					
					//display the fillin blank number and correct answer
					prompt += '[#' + fillinBlankCount + ':' + this.getCorrectAnswer(responseIdentifier) + ']';
					
					fillinBlankCount++;
				}
			}
		}
	}
	
	return prompt;
};

/**
 * Get the correct answer for the identifier
 * 
 * @param identifier the identifier to get the correct answer for
 * 
 * @return the correct answer text
 */
FillinNode.prototype.getCorrectAnswer = function(identifier) {
	var correctAnswer = null;
	
	//get the step content
	var content = this.content.getContentJSON();
	
	if(content != null && content.assessmentItem != null && content.assessmentItem.responseDeclarations != null) {
		//get all the response declarations
		var responseDeclarations = content.assessmentItem.responseDeclarations;
		
		if(responseDeclarations != null) {
			
			//loop through all the response declarations
			for(var x=0; x<responseDeclarations.length; x++) {
				var responseDeclaration = responseDeclarations[x];
				
				if(responseDeclaration != null) {
					//get the identifier for the response declaration
					var tempIdentifier = responseDeclaration.identifier;
					
					if(identifier == tempIdentifier) {
						//we have found the response declaration we want
						
						//get all the correct responses for this response declaration
						var correctResponses = responseDeclaration.correctResponses;
						
						//loop through all the correct responses
						for(var y=0; y<correctResponses.length; y++) {
							//get a correct response
							var tempCorrectResponse = correctResponses[y];
							
							//get the correct response text
							var tempCorrectResponseText = tempCorrectResponse.response;
							
							if(correctAnswer == null) {
								correctAnswer = '';
							} 
							
							if(correctAnswer != "") {
								//separate multiple correct responses with a /
								correctAnswer += "/";
							}
							
							//append the correct response text
							correctAnswer += tempCorrectResponseText;
						}
						
						break;
					}
				}
			}
		}
	}
	
	return correctAnswer;
};

NodeFactory.addNode('FillinNode', FillinNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/fillin/FillinNode.js');
};