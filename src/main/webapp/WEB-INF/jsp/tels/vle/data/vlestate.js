/* 
 * TODO: COMMENT ME
 * 
 */
function VLE_STATE() {
	this.visitedNodes = [];  // array of NODE_VISIT objects
	this.userName = null; //lets put this here for now, sssssh
	this.workgroupId = null;  // sneak this in there too, ssssssh
	this.dataId = null;
}

VLE_STATE.prototype.setUserName = function(userName) {
	this.userName = userName;
};

VLE_STATE.prototype.setDataId = function(dataId) {
	this.dataId = dataId;
};

VLE_STATE.prototype.getCurrentNodeVisit = function() {
	if (this.visitedNodes.length == 0) {
		return null;
	} else {
		return this.visitedNodes[this.visitedNodes.length - 1];
	}
};

VLE_STATE.prototype.endCurrentNodeVisit = function() {
	// set endtime
	var currentNodeVisit = this.getCurrentNodeVisit();
	if(currentNodeVisit){
		currentNodeVisit.visitEndTime = Date.parse(new Date());
	};
};

/**
 * Save the provided state at the end of the provided nodeVisit
 * @param node
 * @param state
 * @return
 */
VLE_STATE.prototype.saveState = function(nodeVisit, state) {
	
};

/**
 * Returns an array of NODE_VISITS for the specified nodeId
 * @param {Object} nodeId
 */
VLE_STATE.prototype.getNodeVisitsByNodeId = function(nodeId) {
	var nodeVisitsForThisNodeId = [];
	for (var i=0; i<this.visitedNodes.length;i++) {
		if (this.visitedNodes[i].nodeId==nodeId) {
			nodeVisitsForThisNodeId.push(this.visitedNodes[i]);
		}		
	}
	//alert("nodeId: " + nodeId + "<br>nodeVisitsForThisNodeId: " + nodeVisitsForThisNodeId.length);
	return nodeVisitsForThisNodeId;
};

/**
 * Returns an array of NODE_VISITS that contain non-empty work
 * for the specified nodeId
 * @param {Object} nodeId
 */
VLE_STATE.prototype.getNodeVisitsWithWorkByNodeId = function(nodeId) {
	var nodeVisitsForThisNodeId = [];
	for (var i=0; i<this.visitedNodes.length;i++) {
		if (this.visitedNodes[i].nodeId==nodeId) {
			if (this.visitedNodes[i].getLatestWork() != "") {
				nodeVisitsForThisNodeId.push(this.visitedNodes[i]);
			}
		}		
	}
	return nodeVisitsForThisNodeId;
};

/**
 * Get the latest node visit object for the nodeId with work
 * @param nodeId the nodeId we want the latest node visit for
 * @return the latest node visit for the nodeId
 */
VLE_STATE.prototype.getLatestNodeVisitByNodeId = function(nodeId, canBeEmpty) {
	//loop through all the node visits starting from the most recent
	for (var i=this.visitedNodes.length - 1; i>=0; i--) {
		
		//check if the current node visit has the nodeId we are looking for
		if (this.visitedNodes[i].nodeId==nodeId) {
			if (!canBeEmpty) {
				//return the most recent node visit that contains work
				// if html or outside url, student has done work if they just visited it.
				// otherwise, check to see if there is any saved work.
				if (this.visitedNodes[i].nodeType == "HtmlNode" || this.visitedNodes[i].nodeType == "OutsideUrlNode" || 
						this.visitedNodes[i].nodeType == "IdeaBasketNode") {
					return this.visitedNodes[i];					
				} else {
					if (this.visitedNodes[i].getLatestWork() != "") {
						return this.visitedNodes[i];
					}
				}
			} else {
				return this.visitedNodes[i];
			}
		}		
	}
	return null;
};

/**
 * Get the latest non blank work for the given nodeId step
 * @param nodeId the step to retrieve work for
 * @return the latest non blank work or "" if none exists
 */
VLE_STATE.prototype.getLatestWorkByNodeId = function(nodeId) {
	//loop through the node visits from latest to earliest
	for(var x=this.visitedNodes.length - 1; x >= 0; x--) {
		//get a node visit
		var nodeVisit = this.visitedNodes[x];
		
		//check if the nodeId matches
		if(nodeVisit.nodeId == nodeId) {
			//obtain the latest non blank work for the node visit
			var latestWorkForNodeVisit = nodeVisit.getLatestWork();
			
			//check if there was any non blank work
			if(latestWorkForNodeVisit != "") {
				//return the non blank work
				return latestWorkForNodeVisit;
			}
		}
	}
	
	return "";
};

/**
 * Get the last CRater feedback for the given nodeId step
 * @param nodeId the step to retrieve work for
 * @return the latest non blank work or "" if none exists
 */
VLE_STATE.prototype.getLatestCRaterFeedbackByNodeId = function(nodeId) {
        //loop through the node visits from latest to earliest
	for(var x=this.visitedNodes.length - 1; x >= 0; x--) {
                //get a node visit
                var nodeVisit = this.visitedNodes[x];

                //check if the nodeId matches
		if(nodeVisit.nodeId == nodeId) {
                        //obtain the latest non blank work for the node visit
                        // go thru all the nodeStates and look for cRaterFeedbackText
                        var nodeStates = nodeVisit.nodeStates;
                        for (var i=nodeStates.length; i >= 0; i--) {
                                var nodeState = nodeStates[i];
                                //check if there was any non blank work
                                if(nodeState != null && nodeState.cRaterFeedbackText && nodeState.cRaterFeedbackText != "") {
                                        //return the non blank work
					return nodeState.cRaterFeedbackText;
                                }

			}
                }
        }

        return "";
};

/**
 * Given a JSON string of the user's vle state, parses it and returns
 * a populated VLE_STATE object.
 * @param jsonString a JSON string representing a vle state
 * @param alwaysReturnArray always return an array of vle_state, even if there is only one vle_state. Used by grdingtool
 * @return a VLE_STATE object
 */
VLE_STATE.prototype.parseDataJSONString = function(vleStateJSONString, alwaysReturnArray) {
	//parse the JSON string to create a JSON object
	var vleStatesJSONObj = $.parseJSON(vleStateJSONString);

	var vleStatesArray = new Array();
	for (var i=0; i < vleStatesJSONObj.vle_states.length; i++) {
		var vleStateJSONObj = vleStatesJSONObj.vle_states[i];
		vleStatesArray.push(VLE_STATE.prototype.parseDataJSONObj(vleStateJSONObj));
	}

	if (vleStatesArray.length == 1 && !alwaysReturnArray) {
		return vleStatesArray[0];
	} else {
		return vleStatesArray;
	}
};

/**
 * Takes in a JSON object representing a vle state and converts it
 * into a populated VLE_STATE object
 * @param vleStateJSONObj a JSON object representing a vle state
 * @return a VLE_STATE object
 */
VLE_STATE.prototype.parseDataJSONObj = function(vleStateJSONObj) {
	//create a new VLE_STATE
	var vleState = new VLE_STATE();
	
	//populate the attributes
	vleState.userName = vleStateJSONObj.userName;
	vleState.workgroupId =  vleStateJSONObj.userId;
	vleState.dataId = vleStateJSONObj.userId;
	
	//loop through the node visits and populate them in the VLE_STATE
	if (vleStateJSONObj.visitedNodes != null) {
		for(var x=0; x<vleStateJSONObj.visitedNodes.length; x++) {
			//obtain a node visit JSON object
			var nodeVisitJSONObj = vleStateJSONObj.visitedNodes[x];

			//create a NODE_VISIT object
			var nodeVisitObj = NODE_VISIT.prototype.parseDataJSONObj(nodeVisitJSONObj);

			//add the NODE_VISIT object to the visitedNodes array
			if (nodeVisitObj != null) {  // null-check. if null, it probably means that student has done work for a node that no longer exists for this project, like the author changed the project during the run.
				vleState.visitedNodes.push(nodeVisitObj);
			}
		}
	}

	//return the VLE_STATE object
	return vleState;
};

/**
 * Sets a new NODE_VISIT, containing info on where the student 
 * is current on.
 */
VLE_STATE.prototype.setCurrentNodeVisit = function(node) {
	var currentNodeVisit = this.getCurrentNodeVisit();   // currentNode becomes lastnode
	
	/* if this is a duplicate node, we need to swap the duplicate with the node that it represents */
	if(node.type=='DuplicateNode'){
		var realNode = node.getNode();
		var newNodeVisit = new NODE_VISIT(realNode.id, realNode.type);
		newNodeVisit.duplicateId = node.id;
	} else {
		var newNodeVisit = new NODE_VISIT(node.id, node.type);
		newNodeVisit.duplicateId = undefined;
	}

	this.visitedNodes.push(newNodeVisit);
};

/**
 * Returns an map to array of nodeVisits for all nodeVisits of the givent type.
 * Returns an empty object if there are no nodeVisits for the given type.
 * 
 * @param String - type
 * @return Array - nodeVisits
 */
VLE_STATE.prototype.getNodeVisitsByNodeType = function(type){
	var visitsOfType = {};
	
	for(var a=0;a<this.visitedNodes.length;a++){
		if(this.visitedNodes[a].nodeType==type){
			if(!visitsOfType[this.visitedNodes[a].nodeId]){
				visitsOfType[this.visitedNodes[a].nodeId] = [];
			}
			
			visitsOfType[this.visitedNodes[a].nodeId].push(this.visitedNodes[a]);
		}
	}
	
	return visitsOfType;
};

/**
 * Get the latest visit (the last visit in the visitedNodes array)
 * @return the latest NODE_VISIT
 */
VLE_STATE.prototype.getLatestVisit = function() {
	var latestVisit = null;
	
	//make sure there is at least one node visit
	if(this.visitedNodes.length > 0) {
		//get the last node visit
		latestVisit = this.visitedNodes[this.visitedNodes.length - 1];	
	}
	
	return latestVisit;
};

/**
 * Get the latest node visit that has non-null visitStartTime and
 * non-null visitEndTime
 * @return the latest NODE_VISIT that has a visitStartTime and visitEndTime
 */
VLE_STATE.prototype.getLatestCompletedVisit = function() {
	var latestCompletedVisit = null;
	
	//loop through the node visits backwards
	for(var x=this.visitedNodes.length - 1; x>=0; x--) {
		//get a node visit
		var visit = this.visitedNodes[x];
		
		//check that visitStartTime and visitEndTime are not null
		if(visit.visitStartTime != null && visit.visitEndTime != null) {
			//we found a node visit with visitStartTime and visitEndTime
			latestCompletedVisit = visit;
			
			//break out of the for loop since we found what a node visit
			break;
		}
	}
	
	return latestCompletedVisit;
};

/**
 * Get the last time the student has visited. We will use the second
 * to last node visit because the last node visit is created
 * when the student logs back into the vle. Here's an example
 * 
 * e.g.
 * Student logs in the first time and completes work for a step
 * this becomes node visit 1.
 * Student then logs out.
 * The 2nd day the student logs in for the second time and at
 * that moment we have node visit 1 which he completed last time
 * and node visit 2 which is created when he has just logged
 * in on the 2nd day.
 * 
 * Therefore we need to look at the 2nd to last node visit and not
 * the last.
 * 
 * @return the last time the student has visited
 */
VLE_STATE.prototype.getLastTimeVisited = function() {
	var lastTimeVisited = 0;
	
	/*
	 * make sure there is more than one node visit. if there is only one node
	 * visit it means the student has logged in for the very first time and
	 * the one node visit was just created.
	 */
	if(this.visitedNodes.length > 1) {
		//get the 2nd to last node visit
		var previousVisit = this.visitedNodes[this.visitedNodes.length - 2];
		
		/*
		 * get the start time. we need to get the start time because the end time
		 * is overwritten with the current time when the student logs in since
		 * it "ends" the previous node visit again when it "starts" the new node
		 * visit that becomes the last node visit at the moment.
		 */
		lastTimeVisited = previousVisit.visitStartTime;
	}
	
	return lastTimeVisited;
};

/**
 * Get a node visit given by the id
 * @param id the student work id which is the same as the node visit id
 * @return a node visit object or null if we did not find a node visit
 * with the given id
 */
VLE_STATE.prototype.getNodeVisitById = function(id) {
	//loop through all the node visits in this vle state
	for(var x=0; x<this.visitedNodes.length; x++) {
		//get a node visit
		var nodeVisit = this.visitedNodes[x];
		
		//compare the id
		if(nodeVisit.id == id) {
			//we found the node visit that we want so we will return it
			return nodeVisit;
		}
	}
	
	//we did not find a node visit with the given id
	return null;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/data/vlestate.js');
};