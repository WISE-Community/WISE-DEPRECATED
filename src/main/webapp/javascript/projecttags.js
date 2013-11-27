var tagNameMap = {};

/**
 * Writes the given message to the tag message div and sets a timeout
 * to clear the message after so many seconds.
 * 
 * @param string - msg
 */
function tagMessage(msg, projectId){
	$('#createTagMsgDiv_' + projectId).html(msg);
	setTimeout(function(){clearTagMessage();},8000);
};

/**
 * Clears the tag message div html
 */
function clearTagMessage(){
	$('.tagMessage').html('');
};

/**
 * Validates the user's input and creates that tag for the project
 */
function createTag(projectId){
	/* get the value entered by the user */
	var val = $('#createTagInput_' + projectId).val();
	
	/* validate the entered value */
	if(!val || val==''){
		tagMessage('You must enter a tag name before creating a tag.', projectId);
		return;
	}
	
	/* validate that there are no spaces in the tag name */
	if(val.indexOf(' ') != -1){
		tagMessage('A tag is not allowed to contain spaces!', projectId);
		return;
	}
	
	/* make a request to the server to add a tag */
	$.ajax({type:'POST', url:'tagger.html', dataType:'text', data:'command=createTag&projectId=' + projectId + '&tag=' + val, error:tagPostFailure, success:createTagSuccess, context:{projectId:projectId}});
};

/**
 * Cleans up and notifies user upon a successful post request to the server to
 * create a tag.
 * 
 * @param data
 */
function createTagSuccess(data, textStatus, request){
	/* if the request is not successful, notify user with given status if
	 * not 200 and with server error message if it is in the response */
	if(request.status != 200){
		tagMessage(textStatus, this.projectId);
		return;
	}
	
	if(data.indexOf('The server has encountered an error.') != -1){
		tagMessage('The server has encountered an error while attempting to create the tag.', this.projectId);
		return;
	}
	
	/* check to see if this is a duplicate and notify user */
	if(data==('duplicate')){
		tagMessage('A tag with that name already exists for this project, aborting operation', this.projectId);
		return;
	}
	
	/* check to see if the user was authorized to create that tag and notify user */
	if(data==('not-authorized')){
		tagMessage('You are not authorized to create a tag with that name, aborting operation', this.projectId);
		return;
	}
	
	/* get the value entered by the user */
	var val = $('#createTagInput_' + this.projectId).val();
	var id = data;
	
	/* add this to the existing tags list */
	$('#existingTagsDiv_' + this.projectId).append('<table id="tagTable_' + this.projectId + '_' + id + '"><tbody><tr><td><input id="tagEdit_' + 
			this.projectId + '_' + id + '" type="text" value="' + val + '"/></td><td><input id="updateTag_' + this.projectId + '_' + id + 
			'" type="button" value="update" onclick="tagChanged($(this).attr(\'id\'))"/></br><input id="removeTag_' + this.projectId + '_' + 
			id + '" type="button" value="remove" onclick="removeTag($(this).attr(\'id\'))"/></td></tr></tbody></table>');
	
	/* add the newly created tag to the tag name map */
	tagNameMap[id] = val;
	
	/* clear the tags input so user can create another */
	$('#createTagInput_' + this.projectId).val('');
	
	/* notify user that request was successful */
	tagMessage('The tag <span class="tag">' + val + '</span> was successfully added to the project!', this.projectId);
};

/**
 * Displays message to user on unsuccessful request to server
 */
function tagPostFailure(){
	tagMessage('Error contacting server, unable to fulfill request.', this.projectId);
};

/**
 * Given an html element id, removes the tag from the project.
 * 
 * @param string - element id
 */
function removeTag(elId){
	/* split the element id, the index at 1 should be the project id
	 * and the index at 2 should be the tag id */
	var splitz = elId.split('_');
	var projectId = splitz[1];
	var tagId = splitz[2];
	
	/* make the ajax request to remove that tag */
	$.ajax({type:'POST', url:'tagger.html', data:'command=removeTag&projectId=' + projectId + '&tagId=' + tagId, error:removeTagFailure, success:removeTagSuccess, context:{projectId:projectId,tagId:tagId}});
};

/**
 * Success callback for the request to remove a tag.
 * 
 * @param data
 * @param textStatus
 * @param request
 */
function removeTagSuccess(data,textStatus,request){
	/* if the request is not successful, notify user with given status if
	 * not 200 and with server error message if it is in the response */
	if(request.status != 200){
		tagMessage(textStatus, this.projectId);
		return;
	}
	
	if(data != "success"){
		tagMessage('The server has encountered an error when attempting to remove the tag.', this.projectId);
		return;
	}
	
	/* remove the html that is related to the tag from the page */
	$('#tagTable_' + this.projectId + '_' + this.tagId).remove();
	
	/* notify the user */
	tagMessage('The tag has been successfully removed!', this.projectId);
};

/**
 * Failure callback for the request to remove a tag.
 */
function removeTagFailure(){
	tagMessage('The attempt to remove this tag failed!', this.projectId);
};

/**
 * Given an html element id, updates the tag in the project and html.
 * 
 * @param string - element id
 */
function tagChanged(elId){
	/* split the element id, the projectId should be at index 1 and
	 * the tag id should be at index 2 */
	var splitz = elId.split('_');
	var projectId = splitz[1];
	var tagId = splitz[2];
	
	/* get the value entered by the user */
	var val = $('#tagEdit_' + projectId + '_' + tagId).val();
	
	/* validate the entered value */
	if(!val || val==''){
		tagMessage('The tag name cannot be empty.', projectId);
		return;
	}
	
	/* validate that there are no spaces in the tag name */
	if(val.indexOf(' ') != -1){
		tagMessage('A tag is not allowed to contain spaces!', projectId);
		return;
	}
	
	/* make ajax request to server */
	$.ajax({type:'POST', url:'tagger.html', data:'command=updateTag&projectId=' + projectId + '&tagId=' + tagId + '&name=' + val, error:tagChangedFailure, success:tagChangedSuccess, context:{projectId:projectId, tagId:tagId, tagName:val}});
};

/**
 * Success callback for the request to update the tag on the server.
 * 
 * @param data
 * @param textStatus
 * @param request
 */
function tagChangedSuccess(data, textStatus, request){
	/* if the request is not successful, notify user with given status if
	 * not 200 and with server error message if it is in the response */
	if(request.status != 200){
		tagMessage(textStatus, this.projectId);
		return;
	}
	
	if(data.indexOf('The server has encountered an error.') != -1){
		tagMessage('The server has encountered an error when attempting to update the tag.', this.projectId);
		return;
	}
	
	/* check to see if this is a duplicate and notify user */
	if(data==('duplicate')){
		tagMessage('A tag with the name <span class="tag">' + this.tagName + '</span> already exists for this project, aborting operation', this.projectId);
		$('#tagEdit_' + this.projectId + '_' + this.tagId).val(tagNameMap[this.tagId]);
		return;
	}
	
	/* check to see if the user was authorized to create that tag and notify user */
	if(data==('not-authorized')){
		tagMessage('You are not authorized to create a tag with the name <span class="tag">' + this.tagName + '</span>, aborting operation', this.projectId);
		return;
	}
	
	/* add the newly created tag to the tag name map  */
	tagNameMap[data] = this.tagName;
	
	/* update the html elements' ids and event functions */
	$('#tagTable_' + this.projectId + '_' + this.tagId).attr('id', 'tagTable_' + this.projectId + '_' + data);
	$('#tagEdit_' + this.projectId + '_' + this.tagId).attr('id', 'tagEdit_' + this.projectId + '_' + data);
	$('#updateTag_' + this.projectId + '_' + this.tagId).attr('id', 'updateTag_' + this.projectId + '_' + data);
	$('#removeTag_' + this.projectId + '_' + this.tagId).attr('id', 'removeTag_' + this.projectId + '_' + data);
	
	/* notify the user */
	tagMessage('Update of tag successful!', this.projectId);
};

/**
 * The failure callback for the request to updata a tag.
 */
function tagChangedFailure(){
	tagMessage('The attempt to update this tag failed!', this.projectId);
};