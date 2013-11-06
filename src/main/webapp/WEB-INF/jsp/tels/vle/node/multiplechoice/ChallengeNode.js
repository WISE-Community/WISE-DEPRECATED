/**
 * Challenge Node
 */
ChallengeNode.prototype = new MultipleChoiceNode();
ChallengeNode.prototype.constructor = ChallengeNode;
ChallengeNode.prototype.parent = MultipleChoiceNode.prototype;
ChallengeNode.authoringToolName = "Challenge Question";
ChallengeNode.authoringToolDescription = "Students answer a multiple choice question. If they get the answer wrong, they will need to revisit a previous step before trying again.";

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {ChallengeNode}
 */
function ChallengeNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
}

/**
 * Override of Node.processStateConstraints
 */
ChallengeNode.prototype.processStateConstraints = function() {
	/* check to see if a constraint is needed for this challenge node */
	if(this.isConstraintNeededForChallenge(challengeVisits[this.id])){
		/* set up vars for creating constraint */
		var toNodeId = this.content.getContentJSON().assessmentItem.interaction.attempts.navigateTo;
	}
};

/**
 * Walks through a Challenge Node's nodeVisits and determines if a constraint is needed
 * for this Challenge Node. This is only necessary when the states are first loaded.
 * 
 * @param nodeVisits
 * @return
 */
ChallengeNode.prototype.isConstraintNeededForChallenge = function(nodeVisits){
	/* keep track of the state of the challenge node as we step through the given
	 * nodeVisits: 0=no work, 1=work completed and correct, 2=work completed, incorrect
	 * and visited navigateTo node, 3=work completed, incorrect and did not visit 
	 * navigateTo node. */
	var currentChallengeState = 0;
	
	/* cycle (walk through) the nodeVisits for this challenge node */
	for(var f=0;f<nodeVisits.length;f++){
		if(nodeVisits[f].getLatestState()){
			if(nodeVisits[f].getLatestState().isCorrect){
				/* work completed and is correct */
				currentChallengeState = 1;
			} else {
				/* not correct, the student should have navigated to the navigateTo node */
				if(this.visitedNavigateToNode(this.view.getProject().getNodeById(nodeVisits[f].nodeId), nodeVisits[f].visitStartTime + 1)){
					currentChallengeState = 2;
				} else {
					currentChallengeState = 3;
				}
			}
		}
	}
	
	/* if the currentChallengeState is 3 at this point, then we need a constraint,
	 * for all other states, we do not */
	return (currentChallengeState==3) ? true : false;
};

/**
 * Returns true if the navigateTo node specified in the given node's content 
 * has been visited after the given start time, returns false otherwise.
 * 
 * @param object - node
 * @param timestampe - startTime
 * @return boolean
 */
ChallengeNode.prototype.visitedNavigateToNode = function(node, startTime){
	var toVisitId = node.getContent().getContentJSON().assessmentItem.interaction.attempts.navigateTo;
	var nodeVisits = this.view.getState().getNodeVisitsByNodeId(toVisitId);
	var nodeVisits = Constraint.prototype.getEffectiveNodeVisits(nodeVisits.slice(), startTime);
	for(var a=0;a<nodeVisits.length;a++){
		if(nodeVisits[a].nodeId == toVisitId){
			return true;
		}
	}
	
	return false;
};

/**
 * Display the feedback in a popup dialog
 * @param feedback the text to display in the popup dialog
 * @param isCorrect whether the student answered correctly
 */
ChallengeNode.prototype.showFeedbackDialog = function(feedback, isCorrect){
	var toVisitId = this.getContent().getContentJSON().assessmentItem.interaction.attempts.navigateTo;
	var toVisitPosition = this.view.getProject().getPositionById(toVisitId);
	var challengePosition = this.view.getProject().getPositionById(this.id);
	
	$('#feedbackDialog').html(feedback);
	
	var visited = false;
	var buttonText = "";
	
	if(isCorrect) {
		//the student answered correctly so the button will close the dialog
		buttonText = "Close";
	} else {
		//the student answered incorrectly so the button will take them to the evidence step
		buttonText = "Take me there!";
	}
	
	var dialogButtons = [
		{
            text: buttonText,
            click: function() {
            	if(isCorrect) {
            		//the student answered correctly so the button will close the feedback dialog
            		$('#feedbackDialog').dialog('close')
            	} else {
            		/*
            		 * the student answered incorrectly so the button will move the student between
            		 * the evidence step and the challenge question step
            		 */
            		if (!visited) {
            			view.goToNodePosition(toVisitPosition);
            			$('.challenge-button > .ui-button-text').text('Back to Challenge Question');
            			visited = true;
            		} else {
            			view.goToNodePosition(challengePosition);
            			$('.challenge-button > .ui-button-text').text('Take me there!');
            			visited = false;
            		}            		
            	}
            },
            'class': 'challenge-button'
        }
	];

	if(toVisitId != null && toVisitId != "") {
		//only display the popup dialog if a navigateTo step has been set
		$('#feedbackDialog').dialog({buttons: dialogButtons});
		$('#feedbackDialog').dialog('open');
		
		$(".ui-draggable").draggable( "option", "iframeFix", true );
		$( ".ui-draggable" ).resizable( "option", "ghost", true );
	}
};

NodeFactory.addNode('ChallengeNode', ChallengeNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/multiplechoice/ChallengeNode.js');
}