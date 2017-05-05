/*
 * This a branching Node that developers can use to create new 
 * step types. Copy this file and rename it to 
 *
 * <new step type>Node.js
 * e.g. for example if you are creating a quiz step type it would
 * look something like QuizNode.js
 * 
 * and then in this file change all occurrences of the word 'BranchingNode' to 
 * 
 * <new step type>Node
 * 
 * e.g. for example if you are creating a quiz step type you would
 * change it to be QuizNode
 */

BranchingNode.prototype = new Node(); //TODO: rename BranchingNode
BranchingNode.prototype.constructor = BranchingNode; //TODO: rename both occurrences of BranchingNode
BranchingNode.prototype.parentNode = Node.prototype; //TODO: rename BranchingNode
BranchingNode.prototype.i18nEnabled = true;
BranchingNode.prototype.i18nPath = "vle/node/branching/i18n/";
BranchingNode.prototype.supportedLocales = {
	"en":"en",
	"es":"es",
	"iw":"he",
	"ko":"ko",
	"nl":"nl",
	"nl_GE":"nl",
	"nl_DE":"nl",
	"tr":"tr",
	"zh_CN":"zh_CN",
    "zh_TW":"zh_TW"
};

/*
 * the name that displays in the authoring tool when the author creates a new step
 * 
 * TODO: rename BranchingNode
 * TODO: rename Branching to whatever you would like this step to be displayed as in
 * the authoring tool when the author creates a new step
 * e.g. if you are making a QuizNode you would set authoringToolName to to "Quiz"
 */
BranchingNode.authoringToolName = "Branching"; 

/*
 * TODO: rename BranchingNode
 * TODO: set the authoringToolDescription to describe the step type, this description
 * will be seen by the author when they add a new step to their project to help
 * them understand what kind of step this is
 */
BranchingNode.authoringToolDescription = "This is a generic step only used by developers";

/**
 * This is the constructor for the Node
 * 
 * TODO: rename BranchingNode
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 */
function BranchingNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
}

/**
 * This function is called when the vle loads the step and parses
 * the previous student answers, if any, so that it can reload
 * the student's previous answers into the step.
 * 
 * TODO: rename BranchingNode
 * 
 * @param stateJSONObj
 * @return a new state object
 */
BranchingNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	/*
	 * TODO: rename BranchingState
	 * 
	 * make sure you rename BranchingState to the state object type
	 * that you will use for representing student data for this
	 * type of step. copy and modify the file below
	 * 
	 * wise/src/main/webapp/vle/node/branching/branchingState.js
	 * 
	 * and use the object defined in your new state.js file instead
	 * of BranchingState. for example if you are creating a
	 * quiz step type you would copy the file above to
	 * 
	 * wise/src/main/webapp/vle/node/quiz/quizState.js
	 * 
	 * and in that file you would define QuizState and therefore
	 * would change the BranchingState to QuizState below
	 */ 
	return BranchingState.prototype.parseDataJSONObj(stateJSONObj);
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
 * TODO: rename BranchingNode
 * 
 * @param studentWork
 * @return translated student work
 */
BranchingNode.prototype.translateStudentWork = function(studentWork) {
	return studentWork;
};

/**
 * This function is called when the student exits the step. It is mostly
 * used for error checking.
 * 
 * TODO: rename BranchingNode
 * 
 * Note: In most cases you will not have to change anything here.
 */
BranchingNode.prototype.onExit = function() {
	try {
		//check if the content panel has been set
		if(this.contentPanel) {
			if(this.contentPanel.save) {
				//tell the content panel to save
				this.contentPanel.save();
			}
		}
	} catch(e) {
		
	}
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
 * TODO: rename BranchingNode
 * Note: you may need to add code to this function if the student
 * data for your step is complex or requires additional processing.
 * look at SensorNode.renderGradingView() as an example of a step that
 * requires additional processing
 */
BranchingNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	/*
	 * Get the latest student state object for this step
	 * TODO: rename branchingState to reflect your new step type
	 * 
	 * e.g. if you are creating a quiz step you would change it to quizState
	 */
	var branchingState = nodeVisit.getLatestWork();
	
	/*
	 * get the step work id from the node visit in case we need to use it in
	 * a DOM id. we don't use it in this case but I have retrieved it in case
	 * someone does need it. look at SensorNode.js to view an example of
	 * how one might use it.
	 */
	var stepWorkId = nodeVisit.id;
	
	/*
	 * TODO: rename branchingState to match the variable name you
	 * changed in the previous line above
	 */
	var studentWork = branchingState.getStudentWork();
	
	var studentWorkHtml = "";
	
	if(studentWork != null) {
		if(studentWork.response != null) {
			if(studentWork.response.chosenPathName != null) {
				//get the branching path name that was chosen
				studentWorkHtml = studentWork.response.chosenPathName;
			}
		}
	}
	
	//put the student work into the div
	displayStudentWorkDiv.html(studentWorkHtml);
};

/**
 * Get the html file associated with this step that we will use to
 * display to the student.
 * 
 * TODO: rename BranchingNode
 * 
 * @return a content object containing the content of the associated
 * html for this step type
 */
BranchingNode.prototype.getHTMLContentTemplate = function() {
	/*
	 * TODO: rename both occurrences of branching
	 * 
	 * e.g. if you are creating a quiz step you would change it to
	 * 
	 * node/quiz/quiz.html
	 */
	return createContent('node/branching/branching.html');
};

/**
 * Returns the JSON of the path specified by the path ID.
 * @param pathId
 */
BranchingNode.prototype.getPathsJSON = function() {
	return this.content.getContentJSON().paths;
};

/**
 * Returns the JSON of the path specified by the path ID.
 * @param pathId
 */
BranchingNode.prototype.getPathJSON = function(pathId) {
	var paths = this.getPathsJSON();
	for (var i=0; i < paths.length; i++) {
		var path = paths[i];
		if (path.identifier == pathId) {
			return path;
		}
	}
	return null;
};

/**
 * Handle any processing before creating the node navigation html.
 * For the branch node, check if student has already visited the branch path
 * If yes, show only the path that they went under and hide the other paths.
 * If no, hide all paths.
 */
BranchingNode.prototype.onBeforeCreateNavigationHtml = function() {
	var latestState = this.view.getState().getLatestWorkByNodeId(this.id);
	if (latestState != null && latestState.response != null && latestState.response.chosenPathId != null) {
		// student has already been to this branch and has been "branched"
		if (!this.content.getContentJSON().showBranchNodeAfterBranching) {
			// hide this branchnode if needed
			this.isHidden = true;
		}
		var chosenPathId = latestState.response.chosenPathId;
		var paths = this.getPathsJSON();
		for (var i=0; i < paths.length; i++) {
			var path = paths[i];
			var pathSequence = this.view.getProject().getNodeById(path.sequenceRef);
			var nodesInPath = pathSequence.children;
			for (var j=0; j < nodesInPath.length; j++) {
				var nodeInPath = this.view.getProject().getNodeById(nodesInPath[j].id);
				if (chosenPathId==path.identifier) {
					//make this node visible because it is in the path the student has entered
					this.setNodeHidden(nodeInPath, false);
				} else {
					//make this node hidden because it is not in the path the student has entered
					this.setNodeHidden(nodeInPath, true);
				}
			}
		}
	} else {
		// student has not been to this branch, so we hide the branch paths
		var paths = this.getPathsJSON();
		for (var i=0; i < paths.length; i++) {
			var path = paths[i];
			var pathSequence = this.view.getProject().getNodeById(path.sequenceRef);
			var nodesInPath = pathSequence.children;
			for (var j=0; j < nodesInPath.length; j++) {
				var nodeInPath = this.view.getProject().getNodeById(nodesInPath[j].id);

				//make this node hidden because the student has not reached this branch yet
				this.setNodeHidden(nodeInPath, true);
			}
		}
	}
};

/**
 * Process the paths and show or hide them depending on whether the student
 * has visited the branch node and whether a branch path has been assigned
 */
BranchingNode.prototype.processPathVisibility = function() {
    
    // get the latest node visit for this branch node
    var canBeEmpty = true;
    var latestNodeVisit = this.view.getState().getLatestNodeVisitByNodeId(this.id, canBeEmpty);
    
    if (latestNodeVisit == null) {
        // student has not visited this branch node
        
        // get all the paths for this branch node
        var paths = this.getPathsJSON();
        
        // loop through all the branch paths
        for (var p = 0; p < paths.length; p++) {
            var path = paths[p];
            
            var pathSequence = this.view.getProject().getNodeById(path.sequenceRef);
            
            // hide the nodes in the branch path
            this.setPathVisibility(pathSequence.id, false);
        }
    } else {
        // student has visited this branch node
        
        // get the latest state for the branch node
        var latestState = this.view.getState().getLatestWorkByNodeId(this.id);
        
        if (latestState != null && latestState.response != null && latestState.response.chosenPathId != null) {
            // the student has been to this branch and has been assigned a path
            
            // get the assigned path id
            var chosenPathId = latestState.response.chosenPathId;
            
            // get all the paths for this branch node
            var paths = this.getPathsJSON();
            
            // loop through all the branch paths
            for (var p = 0; p < paths.length; p++) {
                var path = paths[p];
                
                var pathSequence = this.view.getProject().getNodeById(path.sequenceRef);
                
                if (chosenPathId === path.identifier) {
                    /*
                     * show the nodes in the branch path since this is the
                     * path the student was assigned to
                     */
                    this.setPathVisibility(pathSequence.id, true);
                } else {
                    // hide the nodes in the branch path
                    this.setPathVisibility(pathSequence.id, false);
                }
            }
            
            if (!this.content.getContentJSON().showBranchNodeAfterBranching) {
                /*
                 * do not show this branch node after the student has been
                 * assigned to a path
                 */
                this.setPathVisibility(this.id, false);
            }
        } else {
            // the student has visited the branch node but has not been assigned a path
            
            // get all the paths for this branch node
            var paths = this.getPathsJSON();
            
            // loop through all the branch paths
            for (var p = 0; p < paths.length; p++) {
                var path = paths[p];
                
                var pathSequence = this.view.getProject().getNodeById(path.sequenceRef);
                
                // hide the nodes in the branch path
                this.setPathVisibility(pathSequence.id, true);
            }
        }
    }
};

/**
 * Show or hide the step nodes in a path
 * Note: this only affects step node visibility and does not affect
 * sequence node visibility
 * @param nodeId the node id for a sequence or node
 * @param isVisible whether to show or hide the node
 */
BranchingNode.prototype.setPathVisibility = function(nodeId, isVisible) {
    
    var node = this.view.getProject().getNodeById(nodeId);
    
    if (node != null) {
        var nodeType = node.type;
        
        if (nodeType === 'sequence') {
            // the node is an activity
            
            var children = node.children;
            
            // loop through all the children
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                
                // set the visibility for the child
                this.setPathVisibility(child.id, isVisible);
            }
        } else {
            // the node is a step
            
            var position = view.getProject().getPositionById(nodeId);
            var positionEscaped = view.escapeIdForJquery(position);
            
            if (isVisible) {
                // show the node in the navigation
                $('#node_' + positionEscaped).removeClass('hidden');
            } else {
                // hide the node in the navigation
                $('#node_' + positionEscaped).addClass('hidden');
            }
        }
    }
};

/**
 * Make this node hidden. If this node is a sequence, also make the children
 * hidden.
 * @param node the node
 * @param isHidden whether we will set the node to be hidden
 */
BranchingNode.prototype.setNodeHidden = function(node, isHidden) {
	if(node == null) {
		
	} else if(node.type == 'sequence') {
		//the node is a sequence
		
		//set the sequence visibility
		node.isHidden = isHidden;
		
		//get the children of this sequence
		var children = node.children;
		
		//loop through all the children
		for(var x=0; x<children.length; x++) {
			//get a child
			var child = children[x];
			
			//set the child visibility
			this.setNodeHidden(child, isHidden);
		}
	} else {
		//the node is a step
		node.isHidden = isHidden;
	}
};


/**
 * Override of Node.overridesIsCompleted
 * Specifies whether the node overrides Node.isCompleted
 */
BranchingNode.prototype.overridesIsCompleted = function() {
	return true;
};

/**
 * Override of Node.isCompleted
 * Get whether the step is completed or not
 * @return a boolean value whether the step is completed or not
 */
BranchingNode.prototype.isCompleted = function() {
	var minPathCompleteRequiredForStepCompletion = this.content.getContentJSON().minPathCompleteRequiredForStepCompletion;
	if (minPathCompleteRequiredForStepCompletion == null) {
		return true;
	}
	// check that the student has completed the minimum number of paths required to move on.
	numBranchPathsCompletedSoFar = 0;
	var allPathsJSONArray = this.getAllPaths(); // an array of path JSON objects. [ {"identifier": "A","sequenceRef": "seq_3"},{ "identifier": "B","sequenceRef": "seq_4"},...]
	for (var i=0; i<allPathsJSONArray.length; i++) {
		if (this.isBranchPathCompleted(allPathsJSONArray[i])) {
			numBranchPathsCompletedSoFar++;
		}
	}
	return numBranchPathsCompletedSoFar >= minPathCompleteRequiredForStepCompletion;
};

/**
 * Returns true iff all of the nodes in the specified branch path are completed for the specified path.
 */
BranchingNode.prototype.isBranchPathCompleted = function(branchPath) {
	var branchPathCompleted = true;
	
	//get all the node ids in this activity
	var nodeIds = this.view.getProject().getNodeIdsInSequence(branchPath.sequenceRef);
	
	//loop through all the node ids in the activity
	for(var x=0; x<nodeIds.length; x++) {
		//get a node id
		var tempNodeId = nodeIds[x];
		
		//get the node
		var node = this.view.getProject().getNodeById(tempNodeId);
		
		//get the nodevisits for the step
		var nodeVisits = this.view.getState().getNodeVisitsByNodeId(tempNodeId);
		
		//check if the work is completed
		if(!node.isCompleted(nodeVisits)) {
			branchPathCompleted = false;
		}
	}	
	return branchPathCompleted;
};

/**
 * Return the path JSON object that has the specified id.
 */
BranchingNode.prototype.getPathJSONByPathId = function(pathId) {
	var allPathsJSONArray = this.getAllPaths(); // an array of path JSON objects. [ {"identifier": "A","sequenceRef": "seq_3"},{ "identifier": "B","sequenceRef": "seq_4"},...]
	for (var i=0; i<allPathsJSONArray.length; i++) {
		if (allPathsJSONArray[i].identifier == pathId) {
			return allPathsJSONArray[i];
		}
	}
	return null;
};


/**
 * Determine which path to visit
 */
BranchingNode.prototype.getAllPaths = function() {
	return this.content.getContentJSON().paths;
};


/*
 * Add this node to the node factory so the vle knows it exists.
 * TODO: rename both occurrences of BranchingNode
 * 
 * e.g. if you are creating a quiz step you would change it to
 * 
 * NodeFactory.addNode('QuizNode', QuizNode);
 */
NodeFactory.addNode('BranchingNode', BranchingNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename branching to your new folder name
	 * TODO: rename BranchingNode
	 * 
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/QuizNode.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/branching/BranchingNode.js');
};