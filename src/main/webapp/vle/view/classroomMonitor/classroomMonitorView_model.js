function ClassroomMonitorModel() {
	this.project = null;
	this.projectMetadata = null;
	this.states = [];
	this.annotations = [];
	this.workgroupIdToWork = {};
	this.nodeIdToWork = {};
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

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/classroomMonitor/classroomMonitorView_model.js');
};