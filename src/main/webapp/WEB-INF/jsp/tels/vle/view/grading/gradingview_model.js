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

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/grading/gradingview_model.js');
};