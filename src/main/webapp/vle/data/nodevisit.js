/*
 * TODO: COMMENT ME
 */
function NODE_VISIT(nodeId, nodeType, nodeStates, visitStartTime, visitEndTime) {
	this.id;   // id of this nodevisit. Unique across all nodevisits. For ex, auto_increment number assigned by database when it was saved.
	//this.node = node;
	this.nodeId = nodeId;
	this.nodeType = nodeType;
	this.visitPostTime = null;
	this.duplicateId;
	this.hintStates = [];  // hint actions {hintsopened,hintpartselected,hintsclosed}
	
	if (arguments.length == 2) {
		//set default values if they aren't provided
		this.nodeStates = [];
		this.visitStartTime = Date.parse(new Date());
		this.visitEndTime = null;
	} else {
		this.nodeStates = nodeStates;
		this.visitStartTime = visitStartTime;
		this.visitEndTime = visitEndTime;
	};
};

/**
 * Returns this node visit's nodeId.
 * @return
 */
NODE_VISIT.prototype.getNodeId = function() {
	return this.nodeId;
};


/**
 * Takes in a JSON object representing a NODE_VISIT and creates and
 * populates a NODE_VISIT object.
 * @param nodeVisitJSONObj a JSON object representing a NODE_VISIT
 * @param view this is an optional argument, if this function is
 * being used in the view, it will not be needed, but if this function
 * is being used in a node (such as open response) the view should be
 * passed in because env is not accessible in the context of the node
 * @return a NODE_VISIT object
 */
NODE_VISIT.prototype.parseDataJSONObj = function(nodeVisitJSONObj, view, nodeObj) {
	//create a new NODE_VISIT object
	var nodeVisit = new NODE_VISIT();
	
	//populate the attributes of the NODE_VISIT object
	nodeVisit.id = nodeVisitJSONObj.stepWorkId;
	nodeVisit.nodeId = nodeVisitJSONObj.nodeId;
	nodeVisit.nodeType = nodeVisitJSONObj.nodeType;
	nodeVisit.visitStartTime = nodeVisitJSONObj.visitStartTime;
	nodeVisit.visitEndTime = nodeVisitJSONObj.visitEndTime;
	nodeVisit.visitPostTime = nodeVisitJSONObj.visitPostTime;
	nodeVisit.duplicateId = nodeVisitJSONObj.duplicateId;
	
	if(nodeObj == null) {
		//var nodeObj = null;
		
		if(typeof env == 'undefined') {
			//use the view if env is not available
			nodeObj = view.getProject().getNodeById(nodeVisit.nodeId);
		} else {
			//obtain the node object that this visit refers to
			nodeObj = env.getProject().getNodeById(nodeVisit.nodeId);
		}
		
		//return null if the node object was not found
		if (!nodeObj || nodeObj == null) {
			return null;
		}
	}
	
	//create an array of nodeStates from the nodeStates in the JSON object
	var nodeStatesArrayObj = new Array();
	
	if(nodeVisitJSONObj.nodeStates != null) {
		//loop through all the elements in the nodeVisitJSONObj.nodeStates array
		for(var x=0; x<nodeVisitJSONObj.nodeStates.length; x++) {
			//obtain a node state JSON object
			var stateJSONObj = nodeVisitJSONObj.nodeStates[x];
			
			if(stateJSONObj != null) {
				if(nodeObj.parseDataJSONObj != null) {
					//tell the nodeObj to create a state object
					var stateObj = nodeObj.parseDataJSONObj(stateJSONObj);
					
					if(stateObj != null) {
						//add the state object to the array
						nodeStatesArrayObj.push(stateObj);						
					}
				}
			}
		}
	}
	
	//set the nodeStates into the NODE_VISIT object
	nodeVisit.nodeStates = nodeStatesArrayObj;
	
	//return the NODE_VISIT object
	return nodeVisit;
};

/*
 * Get the last node state that was placed in the nodeStates array
 */
NODE_VISIT.prototype.getLatestState = function() {
	//retrieve the last nodeState in the array of nodeStates
	return this.nodeStates[this.nodeStates.length - 1];
};

/**
 * Get the latest work for this visit that isn't null or
 * empty string
 * @return the latest work that is not null or blank
 */
NODE_VISIT.prototype.getLatestWork = function() {
	//loop through all the states from latest to earliest
	for(var x=this.nodeStates.length - 1; x >= 0; x--) {
		if(this.nodeStates[x] != null) {
			//return the student work
			return this.nodeStates[x];
		}
	}
	
	return "";
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/data/nodevisit.js');
};