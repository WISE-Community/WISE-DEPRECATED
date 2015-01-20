function GradingModel() {
	this.project;
	this.projectMetadata;
	this.states;
	this.annotations;
	this.workgroupIdToWork = {};
	this.nodeIdToWork = {};
}

/**
 * Get the project object
 * @return the project object
 */
GradingModel.prototype.getProject = function() {
	return this.project;
};

/**
 * Set the project object
 * @param project the project object
 */
GradingModel.prototype.setProject = function(project) {
	this.project = project;
};

/**
 * Get the project metadata object
 * @return the project metadata
 */
GradingModel.prototype.getProjectMetadata = function() {
	return this.projectMetadata;
};

/**
 * Set the project metadata object
 * @param projectMetadata the project metadata object
 */
GradingModel.prototype.setProjectMetadata = function(projectMetadata) {
	this.projectMetadata = projectMetadata;
};

/**
 * Get the vle states
 * @return the vle states
 */
GradingModel.prototype.getStates = function() {
	return this.states;
};

/**
 * Set the vle states
 * @param states the vle states
 */
GradingModel.prototype.setStates = function(states) {
	this.states = states;
};

/**
 * Get the annotations
 * @return the annotations
 */
GradingModel.prototype.getAnnotations = function() {
	return this.annotations;
};

/**
 * Set the annotations
 * @param annotations the annotations
 */
GradingModel.prototype.setAnnotations = function(annotations) {
	this.annotations = annotations;
};

/**
 * Set the work for a workgroup id
 * 
 * @param workgroupId the workgroup id
 * @param work the vle state
 */
GradingModel.prototype.setWorkByWorkgroupId = function(workgroupId, work) {
	this.workgroupIdToWork[workgroupId] = work;
};

/**
 * Get the work for a workgroup id
 * 
 * @param workgroupId the workgroup id
 * 
 * @return the vle state for the workgroup id
 */
GradingModel.prototype.getWorkByWorkgroupId = function(workgroupId) {
	return this.workgroupIdToWork[workgroupId];
};

/**
 * Set the work for a step
 * 
 * @param nodeId the node id
 * @param work an array containing all the work for a step from all students in the class
 */
GradingModel.prototype.setWorkByNodeId = function(nodeId, work) {
	this.nodeIdToWork[nodeId] = work;
};

/**
 * Get the work for a step
 * 
 * @param nodeId the node id
 * 
 * @return an array containing all the work for a step from all the students in the class
 */
GradingModel.prototype.getWorkByNodeId = function(nodeId) {
	return this.nodeIdToWork[nodeId];
};

/**
 * Get the node visits with the given node id and workgroupd id
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 * @return an array of node visits with the given node id and
 * workgroup id
 */
GradingModel.prototype.getNodeVisitsByNodeIdAndWorkgroupId = function(nodeId, workgroupId) {
	var nodeVisits = null;
	
	/*
	 * the student work can be found in the nodeIdToWork or the workgroupIdToWork
	 * or both depending on which pages of the classroom monitor that were accessed.
	 * if a grade by step page was loaded, the nodeIdToWork will be populated for the
	 * step that was loaded.
	 * if a grade by student page was loaded, the workgroupIdToWork will be populated
	 * for the workgroup that was loaded.
	 */
	
	/*
	 * check the nodeIdToWork and get all the vle states for a step.
	 * each vle state contains the work for a student for the specific
	 * step.
	 */ 
	var vleStates = this.nodeIdToWork[nodeId];
	
	if(vleStates != null) {
		//loop through all the vle states
		for(var x=0; x<vleStates.length; x++) {
			//get a vle state
			var tempVleState = vleStates[x];
			
			if(tempVleState != null) {
				//get the workgroup id for the vle state
				var tempWorkgroupId = tempVleState.workgroupId;
				
				if(workgroupId == tempWorkgroupId) {
					/*
					 * the workgroup id matches the one we want so we have found
					 * the vle state that we want
					 */
					nodeVisits = tempVleState.getNodeVisitsByNodeId(nodeId);
					break;
				}
			}
		}
	} else {
		/*
		 * we did not find the work in the nodeIdToWork so we will look in the
		 * workgroupIdToWork. check the workgroupIdToWork and get all the
		 * work for a specific workgroup
		 */
		var tempVleState = this.workgroupIdToWork[workgroupId];
		
		if(tempVleState != null) {
			//get all the node visits for the specific step
			nodeVisits = tempVleState.getNodeVisitsByNodeId(nodeId);			
		}
	}
	
	return nodeVisits;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/grading/gradingview_model.js');
};