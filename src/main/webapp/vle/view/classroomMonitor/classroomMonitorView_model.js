function ClassroomMonitorModel() {
	this.project = null;
	this.projectMetadata = null;
	this.states = [];
	this.annotations = [];
	this.workgroupIdToWork = {};
	this.nodeIdToWork = {};
	this.workgroupIdToIdeaBasket = {};
}

/**
 * Get the project object
 * @return the project object
 */
ClassroomMonitorModel.prototype.getProject = function() {
	return this.project;
};

/**
 * Set the project object
 * @param project the project object
 */
ClassroomMonitorModel.prototype.setProject = function(project) {
	this.project = project;
};

/**
 * Get the project metadata object
 * @return the project metadata
 */
ClassroomMonitorModel.prototype.getProjectMetadata = function() {
	return this.projectMetadata;
};

/**
 * Set the project metadata object
 * @param projectMetadata the project metadata object
 */
ClassroomMonitorModel.prototype.setProjectMetadata = function(projectMetadata) {
	this.projectMetadata = projectMetadata;
};

/**
 * Get the vle states
 * @return the vle states
 */
ClassroomMonitorModel.prototype.getStates = function() {
	return this.states;
};

/**
 * Set the vle states
 * @param states the vle states
 */
ClassroomMonitorModel.prototype.setStates = function(states) {
	this.states = states;
};

/**
 * Add a student vle state to our array of vle states
 * @param state a student vle state
 */
ClassroomMonitorModel.prototype.addState = function(state) {
	if(state != null) {
		var workgroupId = state.workgroupId;
		
		var states = this.states;
		
		//loop through all the vle states
		for(var x=0; x<states.length; x++) {
			var state = states[x];
			
			//get the workgroup id
			var tempWorkgroupId = state.workgroupId;
			
			if(workgroupId == tempWorkgroupId) {
				//the workgroup id matches the one we are adding so we will remove it
				states.splice(x);
			}
		}
		
		//add the new vle state
		states.push(state);
	}
};

/**
 * Add a vle state for a workgroup id
 * 
 * @param workgroupId the workgroup id
 * @param the vle state for the workgroup id
 */
ClassroomMonitorModel.prototype.addWorkByStudent = function(workgroupId, work) {
	//remember the work for the workgroup id
	this.workgroupIdToWork[workgroupId] = work;
};

/**
 * Get a vle state for a workgroup id
 * @param workgroupId the workgroup id
 * @return the vle state for the workgroup id or null
 */
ClassroomMonitorModel.prototype.getWorkByStudent = function(workgroupId) {
	var vleState = this.workgroupIdToWork[workgroupId];
	
	return vleState;
};

/**
 * Add an array of student work for a step
 * 
 * @param nodeId the node id
 * @param work an array of node visits for the step
 */
ClassroomMonitorModel.prototype.addWorkByStep = function(nodeId, work) {
	//remember the work for the node id
	this.nodeIdToWork[nodeId] = work;
};

/**
 * Get an array of student work for a step
 * 
 * @param nodeId the node id
 * @return work an array of node visits for the step
 */
ClassroomMonitorModel.prototype.getWorkByStep = function(nodeId) {
	var workForStep = this.nodeIdToWork[nodeId];
	
	return workForStep;
};

/**
 * Get all the work for a specific step for a specific student
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 * @return a vle state object that only contains work for a specific
 * step for a specific student
 */
ClassroomMonitorModel.prototype.getWorkByStepAndWorkgroupId = function(nodeId, workgroupId) {
	var vleState = null;
	
	/*
	 * get all the work for a specific step. the vle states is an array
	 * of vle states. each vle state only contains the work for the specific 
	 * step for a specific student.
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
					vleState = tempVleState;
					break;
				}
			}
		}		
	}
	
	return vleState;
};

/**
 * Get the annotations
 * @return the annotations
 */
ClassroomMonitorModel.prototype.getAnnotations = function() {
	return this.annotations;
};

/**
 * Set the annotations
 * @param annotations the annotations
 */
ClassroomMonitorModel.prototype.setAnnotations = function(annotations) {
	this.annotations = annotations;
};

/**
 * Set the idea basket for a workgroup id
 * @param workgroupId the student workgroup id
 * @param ideaBasket the student idea basket
 */
ClassroomMonitorModel.prototype.setIdeaBasket = function(workgroupId, ideaBasket) {
	if(workgroupId != null) {
		this.workgroupIdToIdeaBasket[workgroupId] = ideaBasket;
	}
}

/**
 * Get the idea basket for a workgroup id
 * @param workgroupId the student workgroup id
 */
ClassroomMonitorModel.prototype.getIdeaBasket = function(workgroupId) {
	var ideaBasket = null;
	
	if(workgroupId != null) {
		ideaBasket = this.workgroupIdToIdeaBasket[workgroupId];
	}
	
	return ideaBasket;
}

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/classroomMonitor/classroomMonitorView_model.js');
};