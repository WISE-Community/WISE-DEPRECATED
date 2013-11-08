function AuthoringModel() {
	this.project;
	this.projectMetadata;
}

/**
 * Get the project object
 * @return the project object
 */
AuthoringModel.prototype.getProject = function() {
	return this.project;
};

/**
 * Set the project object
 * @param project the project object
 */
AuthoringModel.prototype.setProject = function(project) {
	this.project = project;
};

/**
 * Get the project metadata object
 * @return the project metadata
 */
AuthoringModel.prototype.getProjectMetadata = function() {
	return this.projectMetadata;
};
/**
 * Set the project metadata object
 * @param projectMetadata the project metadata object
 */
AuthoringModel.prototype.setProjectMetadata = function(projectMetadata) {
	this.projectMetadata = projectMetadata;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/authorview_model.js');
};