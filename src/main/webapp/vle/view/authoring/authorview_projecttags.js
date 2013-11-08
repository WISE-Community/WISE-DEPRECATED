/* methods in the view used to add and edit project tags */


/**
 * Requests retrieval of the current project tags from the portal
 * and opens the editProjectTags dialog.
 */
View.prototype.openProjectTags = function(){
	if(this.getProject()){
		$('#loadingEditProjectTagsDiv').show();
		$('#existingTagsUL').hide().children().remove();
		this.connectionManager.request('POST', 1, this.portalUrl, {command:'retrieveProjectTags', projectId:this.portalProjectId}, this.retrieveTagsSuccess, this, this.retrieveTagsFailure);
		$('#editProjectTagsDialog').dialog('open');
	} else {
		this.notificationManager.notify('You must open a project through the portal before using this tool.');
	}
};

/**
 * Handles the success case when attempting to retrieve tags from the portal.
 */
View.prototype.retrieveTagsSuccess = function(t,x,o){
	o.tagNameMap = {};
	var tags = t.split(',');
	$('#existingTagsHeadDiv').html('Existing Tags');
	$('#loadingEditProjectTagsDiv').hide();
	
	for(var a=0;a<tags.length;a++){
		var idName = tags[a].split('~');
		o.tagNameMap[idName[0]] = idName[1];
		$('#existingTagsUL').append('<li id="editTagLI_' + idName[0] + '"><table id="editTagTable_' + idName[0] + '"><tr><td>' +
				'<input type="text" id="editTagInput_' + idName[0] + '" value="' + idName[1] + '"/></td><td><input type="button" id="updateTagButt_' +
				idName[0] + '" onclick="eventManager.fire(\'projectTagTagChanged\',$(this).attr(\'id\'))" value="update"/><input type="button" id="tagRemove_' +
				idName[0] + '" onclick="eventManager.fire(\'projectTagRemoveTag\',$(this).attr(\'id\'))" value="remove"/></td></tr><tbody></tbody></table></li>');
	}
	
	$('#existingTagsUL').show();
};

/**
 * Handles the failure case when attempting to retrieve tags from the portal.
 */
View.prototype.retrieveTagsFailure = function(t,o){
	o.notificationManager.notify('Unable to retrieve project tags from the portal.', 3);
	$('#existingTagsHeadDiv').html('Error retrieving project tags.', 3);
};

/**
 * Validates the user input and if nothing is wrong, requests a list of
 * project tags from the portal, otherwise, notifies user of the problem
 * and exits.
 */
View.prototype.createProjectTag = function(){
	/* get the value entered by the user */
	var val = $('#createTagInput').val();
	
	/* validate the entered value */
	if(!val || val==''){
		this.notificationManager.notify('You must enter a tag name before creating a tag.', 3);
		return;
	}
	
	/* validate that there are no spaces in the tag name */
	if(val.indexOf(' ') != -1){
		this.notificationManager.notify('A tag is not allowed to contain spaces!',3);
		return;
	}
	
	/* make the request */
	this.connectionManager.request('POST', 1, this.portalUrl, {command:'createTag',projectId:this.portalProjectId,tag:val}, this.createTagSuccess, this, this.createTagFailure);
};

/**
 * Handles the success case for creating a new project tag.
 */
View.prototype.createTagSuccess = function(t,x,o){
	/* check the response for errors */
	if(t.indexOf('The server has encountered an error.') != -1){
		o.notificationManager.notify('The server has encountered an error while attempting to create the tag.', 3);
		return;
	}
	
	if(t.indexOf('Invalid project parameter, cannot retrieve tags.') != -1){
		o.notificationManager.notify('Invalid project parameter, cannot retrieve tags.', 3);
	}
	
	/* check to see if this is a duplicate and notify user */
	if(t==('duplicate')){
		o.notificationManager.notify('A tag with that name already exists for this project, aborting operation', 3);
		return;
	}
	
	/* check to see if the user was authorized to create that tag and notify user */
	if(t==('not-authorized')){
		o.notificationManager.notify('You are not authorized to create a tag with that name, aborting operation', 3);
		return;
	}
	
	/* get the value entered by the user */
	var val = $('#createTagInput').val();
	var id = t;
	
	/* add this to the existing tags list */
	$('#existingTagsUL').append('<li id="editTagLI_' + id + '"><table id="editTagTable_' + id + '"><tr><td>' +
			'<input type="text" id="editTagInput_' + id + '" value="' + val + '"/></td><td><input type="button" id="updateTagButt_' +
			id + '" onclick="eventManager.fire(\'projectTagTagChanged\',$(this).attr(\'id\'))" value="update"/><input type="button" id="tagRemove_' +
			id + '" onclick="eventManager.fire(\'projectTagRemoveTag\',$(this).attr(\'id\'))" value="remove"/></td></tr><tbody></tbody></table></li>');
	
	/* add the newly created tag to the tag name map */
	o.tagNameMap[id] = val;
	
	/* clear the tags input so user can create another */
	$('#createTagInput').val('');
	
	/* notify user that request was successful */
	o.notificationManager.notify('The tag ' + val + ' was successfully added to the project!', 3);
};

/**
 * Handles the failure case for creating a new project tag.
 */
View.prototype.createTagFailure = function(t,o){
	o.notificationManager.notify('Portal error while attempting to create the project tag', 3);
};

/**
 * Validates the user input and launches a request to change a project tag.
 * 
 * @param string - elId
 */
View.prototype.projectTagChanged = function(elId){
	/* extract the tagId from the element id argument */
	var id = elId.split('_')[1];
	
	/* get the value entered by the user */
	var val = $('#editTagInput_' + id).val();
	
	/* validate the entered value */
	if(!val || val==''){
		this.notificationManager.notify('The tag name cannot be empty.', 3);
		return;
	}
	
	/* validate that there are no spaces in the tag name */
	if(val.indexOf(' ') != -1){
		this.notificationManager.notify('A tag is not allowed to contain spaces!', 3);
		return;
	}
	
	/* set variables in the view so that they are available for the response handlers */
	this.tagIdForRequest = id;
	
	/* make the request */
	this.connectionManager.request('POST',1,this.portalUrl,{command:'updateTag',projectId:this.portalProjectId,tagId:id,name:val}, this.updateTagSuccess,this, this.updateTagFailure);
};

/**
 * Handles the success case when attempting to update a tag
 */
View.prototype.updateTagSuccess = function(t,x,o){
	/* check for server error */
	if(t.indexOf('The server has encountered an error.') != -1){
		o.notificationManager.notify('The server has encountered an error when attempting to update the tag.', 3);
		return;
	}
	
	if(t.indexOf('Invalid project parameter, cannot retrieve tags.') != -1){
		o.notificationManager.notify('Invalid project parameter, cannot retrieve tags.', 3);
	}
	
	/* check to see if this is a duplicate and notify user */
	if(t==('duplicate')){
		o.notificationManager.notify('A tag with this name already exists for this project, aborting operation', 3);
		$('#editTagInput_' + o.tagIdForRequest).val(o.tagNameMap[o.tagIdForRequest]);
		return;
	}
	
	/* check to see if the user was authorized to create that tag and notify user */
	if(t==('not-authorized')){
		o.notificationManager.notify('You are not authorized to create a tag with the name ' + o.tagNameMap[o.tagIdForRequest] + ', aborting operation', 3);
		return;
	}
	
	/* add the newly created tag to the tag name map  */
	o.tagNameMap[t] = $('#editTagInput_' + o.tagIdForRequest).val();;
	
	/* update the html elements' ids and event functions */
	$('#editTagTable_' + o.tagIdForRequest).attr('id', 'editTagTable_' + t);
	$('#editTagInput_' + o.tagIdForRequest).attr('id', 'editTagInput_' + t);
	$('#updateTagButt_' + o.tagIdForRequest).attr('id', 'updateTagButt_' + t);
	$('#tagRemove_' + o.tagIdForRequest).attr('id', 'tagRemove_' + t);
	
	/* notify the user */
	o.notificationManager.notify('Update of tag successful!', 3);
};

/**
 * Handles the failure case when attempting to update a tag.
 */
View.prototype.updateTagFailure = function(t,o){
	o.notificationManager.notify('Error when attempting to update this tag',3);
};

/**
 * Removes the given tag from the project.
 */
View.prototype.removeProjectTag = function(elId){
	/* set variables in the view so that they are available for the response handlers */
	this.tagIdForRequest = elId.split('_')[1];
	
	/* make the request */
	this.connectionManager.request('POST', 1, this.portalUrl, {command:'removeTag',projectId:this.portalProjectId,tagId:this.tagIdForRequest}, this.removeProjectTagSuccess,this,this.removeProjectTagFailure);
};

/**
 * Handles the success case when attempting to remove a tag from a project.
 */
View.prototype.removeProjectTagSuccess = function(t,x,o){
	if(t != "success"){
		o.notificationManager.notify('The server has encountered an error when attempting to remove the tag.', 3);
		return;
	}
	
	/* remove the html that is related to the tag from the page */
	$('#editTagTable_' + o.tagIdForRequest).remove();
	
	/* notify the user */
	o.notificationManager.notify('The tag has been successfully removed!', 3);
};

/**
 * Handles the failure case when attempting to remove a tag from a project.
 */
View.prototype.removeProjectTagFailure = function(t,o){
	o.notificationManager.notify('The attempt to remove this tag failed!',3);
};

/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/authorview_projecttags.js');
}