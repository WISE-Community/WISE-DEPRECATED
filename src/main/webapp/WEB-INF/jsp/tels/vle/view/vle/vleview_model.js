function StudentModel() {
	this.project;
	this.projectMetadata;
	this.state;
	this.annotations;
	this.currentNodePosition;
}

/**
 * Get the project object
 * @return the project object
 */
StudentModel.prototype.getProject = function() {
	return this.project;
};

/**
 * Set the project object
 * @param project the project object
 */
StudentModel.prototype.setProject = function(project) {
	this.project = project;
};

/**
 * Get the project metadata object
 * @return the project metadata
 */
StudentModel.prototype.getProjectMetadata = function() {
	return this.projectMetadata;
};

/**
 * Set the project metadata object
 * @param projectMetadata the project metadata object
 */
StudentModel.prototype.setProjectMetadata = function(projectMetadata) {
	this.projectMetadata = projectMetadata;
};

/**
 * Get the vle state
 * @return the vle state
 */
StudentModel.prototype.getState = function() {
	return this.state;
};

/**
 * Set the vle state
 * @param state the vle state
 */
StudentModel.prototype.setState = function(state) {
	this.state = state;
};

/**
 * Get the annotations
 * @return the annotations
 */
StudentModel.prototype.getAnnotations = function() {
	return this.annotations;
};

/**
 * Set the annotations
 * @param annotations the annotations
 */
StudentModel.prototype.setAnnotations = function(annotations) {
	this.annotations = annotations;
};

/**
 * Push the student work to the latest node visit if the node id matches
 * the node id in the node visit
 * @param nodeId the node id of the step that is pushing the student work
 * @param nodeState the student work
 */
StudentModel.prototype.pushStudentWorkToLatestNodeVisit = function(nodeId, nodeState) {
	var nodeVisit = this.getState().getCurrentNodeVisit();
	
	if(nodeVisit != null) {
		var nodeVisitNodeId = nodeVisit.nodeId;
		
		if(nodeId == nodeVisitNodeId) {
			if(nodeState != null) {
				//check that the nodeState is an object
				if(typeof nodeState == 'object') {
					//the nodeState is an object
					nodeVisit.nodeStates.push(nodeState);
					
					//get the node
					var node = this.getProject().getNodeById(nodeId);
					
					//get all the node visits for the node
					var nodeVisits = this.getState().getNodeVisitsByNodeId(nodeId);
					
					//process the student work in case we need to change the node's status
					node.processStudentWork(nodeVisits);
					
					/*
					 * fire the studentWorkUpdated event and pass in the node id and node visit
					 * so listeners will know which step the student work was updated for
					 */
					eventManager.fire('studentWorkUpdated', [nodeId, nodeVisit]);
				} else {
					//the nodeState is not an object so we will not save the nodeState
					if(notificationManager != null) {
						//display the error message that we failed to save the student work
						notificationManager.notify("Error: Failed to save student work, student work is not an object", 3);						
					}
				}
			}
		} else {
			//node state node id does not match the node visit node id
			if(notificationManager != null) {
				notificationManager.notify("Error: Failed to save student work, student work node id does not match node visit node id", 3);				
			}
		}
	}
};

/**
 * Get the currentNodePosition
 * @return the currentNodePosition
 */
StudentModel.prototype.getCurrentNodePosition = function() {
	return this.currentNodePosition;
};

/**
 * Set the currentNodePosition
 * @param project the currentNodePosition
 */
StudentModel.prototype.setCurrentNodePosition = function(currentNodePosition) {
	this.currentNodePosition = currentNodePosition;
	eventManager.fire('currentNodePositionUpdated');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/vle/vleview_model.js');
}