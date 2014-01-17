
View.prototype.scoreUpdatedEventListener = function(nodeId, toWorkgroupId, fromWorkgroupId, runId, stepWorkId) {
	if (stepWorkId == "null") {
		/**
		 * If stepWorkId is null, it means that the teacher is commenting on a work that has
		 * not been submitted. currently, we do not support this.
		 */
		alert("You are trying to grade a work that has not yet been submitted.  We currently do not support this feature.");
		return;
	}
	var	score = document.getElementById("annotationScoreTextArea_" + toWorkgroupId + "_" + nodeId).value;

	//get all the teacher workgroup ids
	var fromWorkgroupIds = this.getUserAndClassInfo().getAllTeacherWorkgroupIds();
	
	// validate that score is an integer.
	if (isNaN(score)) {
		//alert the teacher that they need to enter a number
		alert('Please enter a number');
		
		//get the last score so we can revert back to it
		var annotationScore = this.getAnnotations().getLatestAnnotation(runId, nodeId, toWorkgroupId, fromWorkgroupIds, "score");
		
		if(annotationScore != null) {
			//revert back to the previous score
			document.getElementById("annotationScoreTextArea_" + toWorkgroupId + "_" + nodeId).value = annotationScore.value;		
		} else {
			//there was no previous score so we will just set it to ""
			document.getElementById("annotationScoreTextArea_" + toWorkgroupId + "_" + nodeId).value = "";
		}
		return;
	}
	
	//get the latest annotation data for this work
	var annotationData = this.getAnnotationData(runId, nodeId, toWorkgroupId, fromWorkgroupIds);
	
	//get the score from the annotation
	var annotationScoreValue = annotationData.annotationScoreValue;
	
	//check if there was an annotation score
	if(!annotationScoreValue) {
		//there was no annotation score so we will just set the value to ""
		annotationScoreValue = "";
	}
	
	//check if the score was changed
	if(annotationScoreValue != score) {
		//the score was changed so we will save the annotation
		this.saveAnnotation(nodeId, toWorkgroupId, fromWorkgroupId, 'score', score , runId, stepWorkId);		
	}
};

View.prototype.commentUpdatedEventListener = function(nodeId, toWorkgroupId, fromWorkgroupId, runId, stepWorkId, textArea) {
	//resize the text area so that all the text is displayed without a vertical scrollbar
	this.resizeTextArea(textArea);
	
	if (stepWorkId == "null") {
		/**
		 * If stepWorkId is null, it means that the teacher is commenting on a work that has
		 * not been submitted. currently, we do not support this.
		 */
		alert("You are trying to grade a work that has not yet been submitted.  We currently do not support this feature.");
		return;
	}
	var	comment = document.getElementById("annotationCommentTextArea_" + toWorkgroupId + "_" + nodeId).value;
	
	//get all the teacher workgroup ids
	var fromWorkgroupIds = this.getUserAndClassInfo().getAllTeacherWorkgroupIds();
	
	//get the latest annotation data for this work
	var annotationData = this.getAnnotationData(runId, nodeId, toWorkgroupId, fromWorkgroupIds);
	
	//get the comment from the annotation
	var annotationCommentValue = annotationData.annotationCommentValue;
	
	//check if there was an annotation score
	if(!annotationCommentValue) {
		//there was no annotation comment so we will just set the value to ""
		annotationCommentValue = "";
	}
	
	//check if the comment was changed
	if(annotationCommentValue != comment) {
		//the comment was changed so we will save the annotation
		this.saveAnnotation(nodeId, toWorkgroupId, fromWorkgroupId, 'comment', comment , runId, stepWorkId);
	}
};

/**
 * Save the run annotation to the server
 * @param nodeId
 * @param toWorkgroupId
 * @param fromWorkgroupId
 * @param runId
 * @param stepWorkId
 * @param runAnnotation
 * @param sync whether to make a sync request
 */
View.prototype.saveRunAnnotation = function(nodeId, toWorkgroupId, fromWorkgroupId, runId, stepWorkId, runAnnotation, sync) {
	var value = JSON.stringify(runAnnotation.value);
	this.saveAnnotation(nodeId, toWorkgroupId, fromWorkgroupId, 'run', value, runId, stepWorkId, sync);
};

/**
 * Posts the new or updated annotation back to the server and if that was 
 * successful, it will create a local Annotation object and place it in
 * our array of Annotations so our local copy is up to date
 * @param nodeId
 * @param toWorkgroup
 * @param fromWorkgroup
 * @param type
 * @param value
 * @param runId
 * @param stepWorkId
 * @param sync whether to make a sync request
 */
View.prototype.saveAnnotation = function(nodeId, toWorkgroup, fromWorkgroup, type, value, runId, stepWorkId, sync) {
	//alert("nodeId: " + nodeId + "\ntoWorkgroup: " + toWorkgroup + "\nfromWorkgroup: " + fromWorkgroup + "\ntype: " + type + "\nvalue: " + value);

	//build the post annotation url with get arguments
	var postAnnotationsURL = this.getConfig().getConfigParam('postAnnotationsUrl');
	
	var postAnnotationCallback = function(text, xml, args) {
			var thisView = args[0];
			var nodeId = args[1];
			var toWorkgroup = args[2];
			var fromWorkgroup = args[3];
			var type = args[4];
			var value = unescape(args[5]);
			var runId = args[6];
			var stepWorkId = args[7];
			var postTime = text;
			
			if(isNaN(parseInt(text))) {
				if(text == 'ERROR:LoginRequired') {
					//the user is no longer logged in because their session has timed out
					alert("Your latest grade has not been saved.\n\nYou have been inactive for too long and have been logged out. Please sign in to continue.");
					
					//get the context path e.g. /wise
					var contextPath = thisView.getConfig().getConfigParam('contextPath');
					
					//redirect the user to the login page
					window.top.location = contextPath + "/j_spring_security_logout";					
				} else {
					//there was a server error so we will revert the annotation back to its previous value
					var fromWorkgroupIds = thisView.getUserAndClassInfo().getAllTeacherWorkgroupIds();
					
					//revert the annotation value back to its previous value
					thisView.revertAnnotation(nodeId, toWorkgroup, fromWorkgroup, fromWorkgroupIds, type, value, runId, stepWorkId);
				}
			} else {
				/*
				 * if the post was successful it will be returned back to us
				 * and we will then create a local Annotation object so that
				 * our local array is up to date
				 */
				var annotation = new Annotation(runId, nodeId, toWorkgroup, fromWorkgroup, type, value, postTime, stepWorkId);
				thisView.getAnnotations().updateOrAddAnnotation(annotation);
				
				if(type != 'run') {
					/*
					 * remove the highlighting from the student row
					 */
					var studentWorkRow = document.getElementById("studentWorkRow_" + toWorkgroup + "_" + nodeId + "_" + stepWorkId);
					var className = studentWorkRow.className;
					studentWorkRow.className = className.replace("newWork", "");
					
					//update the Last Annotation time
					document.getElementById("lastAnnotationPostTime_" + toWorkgroup + "_" + nodeId).innerHTML = "Last Annotation: " + new Date(parseInt(postTime));
				}
				
				if(type == 'score') {
					/*
					 * the teacher has updated a score so we will update the
					 * teacher graded score in the studentWorkRowOrderObjects
					 */
					thisView.updateStudentWorkRowOrderObjectTeacherGradedScore(stepWorkId, value);					
				}
			}
	};
	
	var postAnnotationCallbackFail = function(text, args) {
		var thisView = args[0];
		var nodeId = args[1];
		var toWorkgroupId = args[2];
		var fromWorkgroupId = args[3];
		var fromWorkgroupIds = thisView.getUserAndClassInfo().getAllTeacherWorkgroupIds();
		var type = args[4];
		var value = args[5];
		var runId = args[6];
		var stepWorkId = args[7];
		
		//revert the annotation value back to its previous value
		thisView.revertAnnotation(nodeId, toWorkgroupId, fromWorkgroupId, fromWorkgroupIds, type, value, runId, stepWorkId);
	};

	//escape the annotation value
	value = encodeURIComponent(value);
	
	var postAnnotationParams = {
		runId:runId,
		toWorkgroup:toWorkgroup,
		fromWorkgroup:fromWorkgroup,
		annotationType:type,
		value:value
	};
	
	if(nodeId != null) {
		postAnnotationParams.nodeId = nodeId;
	}
	
	if(stepWorkId != null) {
		postAnnotationParams.stepWorkId = stepWorkId;
	}
	
	//make the call to post the annotation
	this.connectionManager.request('POST', 1, postAnnotationsURL, postAnnotationParams, postAnnotationCallback, [this, nodeId, toWorkgroup, fromWorkgroup, type, value, runId, stepWorkId], postAnnotationCallbackFail, sync);
};

/**
 * Revert the annotation value back to its previous value
 * @param nodeId
 * @param toWorkgroupId
 * @param fromWorkgroupId
 * @param fromWorkgroupIds
 * @param type
 * @param value
 * @param runId
 * @param stepWorkId
 */
View.prototype.revertAnnotation = function(nodeId, toWorkgroupId, fromWorkgroupId, fromWorkgroupIds, type, value, runId, stepWorkId) {
	//display a message telling the teacher the score/comment value will be reverted back
	alert("Failed to save " + type + ", the " + type + " will be reverted back to its previous value.");
	
	//try to obtain the annotation so we can revert the value back
	var annotation = this.getAnnotations().getLatestAnnotation(runId, nodeId, toWorkgroupId, fromWorkgroupIds, type);
	
	//get the prefix for the element id depending on whether it is a score or comment
	var elementIdPrefix = "";
	if(type == 'score') {
		elementIdPrefix = "annotationScoreTextArea_";
	} else if(type == 'comment') {
		elementIdPrefix = "annotationCommentTextArea_";
	}
	
	//revert the annotation value in the UI
	if(annotation != null) {
		//revert back to the previous value
		document.getElementById(elementIdPrefix + toWorkgroupId + "_" + nodeId).value = annotation.value;		
	} else {
		//there was no previous value so we will just set it to ""
		document.getElementById(elementIdPrefix + toWorkgroupId + "_" + nodeId).value = "";
	}
};

/**
 * Posts the flag to the server and if it was successful, we will update our
 * local copy of the flags
 * @param nodeId the id of the node
 * @param toWorkgroup id of the student
 * @param fromWorkgroup id of the teacher
 * @param runId the id of the run
 * @param deleteFlag boolean whether to delete the flag or not
 * @param itemNumber the index of the item in the flaggedItemTable
 * @param stepWorkId the id of the node_visit of the work that is being flagged
 */
View.prototype.inappropriateFlagCheckboxClickedEventListener = function(nodeId, toWorkgroup, fromWorkgroup, runId, itemNumber, stepWorkId) {
	if (stepWorkId == "null") {
		/**
		 * If stepWorkId is null, it means that the teacher is commenting on a work that has
		 * not been submitted. currently, we do not support this.
		 */
		alert("You are trying to flag a work that has not yet been submitted.  We currently do not support this feature.");
		document.getElementById("inappropriateFlagButton"+toWorkgroup).checked = false;
		return;
	}

	 // override deleteFlag with whether Flag Work checkbox is checked or not
	deleteFlag = !document.getElementById("inappropriateFlagButton_" + stepWorkId).checked;
		 
	var postFlagsUrl = this.getConfig().getConfigParam('postInappropriateFlagsUrl');
	
	var value = '';
	
	//check if we are flagging or unflagging the flag
	if(deleteFlag) {
		//we are deleting/unflagging the flag
		value = 'unflagged';
	} else {
		//we are flagging the flag
		value = 'flagged';
	}
	
	//build the post flag url with get arguments
	var postFlagArgs = {runId:runId, nodeId:nodeId, toWorkgroup:toWorkgroup, fromWorkgroup:fromWorkgroup, stepWorkId:stepWorkId, value:value, annotationType:'inappropriateFlag'};


	var postFlagCallback = function(text, xml, args) {
			var thisView = args[0];

			//create the flag annotation and update or add it to our local copy of annotations
			var flagAnnotation = new Annotation(runId, nodeId, toWorkgroup, fromWorkgroup, 'inappropriateFlag', value, text, stepWorkId);
			thisView.getAnnotations().updateOrAddAnnotation(flagAnnotation);
			
			// update isflagged attribute on the studentWorkRow. Also update what gets shown, based on if "only show flagged items" is checked.
			if (deleteFlag) {
				//set the isflagged attribute to false
				document.getElementById('studentWorkRow_'+toWorkgroup+'_'+nodeId+'_'+stepWorkId).setAttribute('isflagged', false);
				
				/*
				 * call the filter again because if the "show flagged" check box is
				 * checked, and we unflag an item, we want it to immediately become
				 * hidden
				 */
				thisView.filterStudentRows();
			} else {
				//set the isflagged attribute to true
				document.getElementById('studentWorkRow_'+toWorkgroup+'_'+nodeId+'_'+stepWorkId).setAttribute('isflagged', true);
			}
	};
	
	var postFlagCallbackFail = function(text, args) {
		var thisView = args[0];
		var nodeId = args[1];
		var toWorkgroup = args[2];
		var fromWorkgroup = args[3];
		var fromWorkgroups = thisView.getUserAndClassInfo().getAllTeacherWorkgroupIds();
		var runId = args[4];
		var stepWorkId = args[5];
		
		//try to obtain the flag
		var flag = thisView.flags.getLatestAnnotation(runId, nodeId, toWorkgroup, fromWorkgroups, 'inappropriateFlag');
		
		//display a message telling the teacher the flag value will be reverted back
		alert("Failed to save flag, the flag will be reverted back to its previous value.");
		
		//revert the check box back to the previous value
		if(flag) {
			//the flag previously exists so we will check it
			document.getElementById("inappropriateFlagButton_" + stepWorkId).checked =  true;
		} else {
			//the flag did not previously exist so we will uncheck it
			document.getElementById("inappropriateFlagButton_" + stepWorkId).checked = false;
		}
	};

	//make the call to post the annotation
	this.connectionManager.request('POST', 1, postFlagsUrl, postFlagArgs, postFlagCallback, [this, nodeId, toWorkgroup, fromWorkgroup, runId, stepWorkId], postFlagCallbackFail);
};


/**
 * Posts the flag to the server and if it was successful, we will update our
 * local copy of the flags
 * @param nodeId the id of the node
 * @param toWorkgroup id of the student
 * @param fromWorkgroup id of the teacher
 * @param runId the id of the run
 * @param deleteFlag boolean whether to delete the flag or not
 * @param itemNumber the index of the item in the flaggedItemTable
 * @param stepWorkId the id of the node_visit of the work that is being flagged
 */
View.prototype.flagCheckboxClickedEventListener = function(nodeId, toWorkgroup, fromWorkgroup, runId, itemNumber, stepWorkId) {
	if (stepWorkId == "null") {
		/**
		 * If stepWorkId is null, it means that the teacher is commenting on a work that has
		 * not been submitted. currently, we do not support this.
		 */
		alert("You are trying to flag a work that has not yet been submitted.  We currently do not support this feature.");
		document.getElementById("flagButton"+toWorkgroup).checked = false;
		return;
	}

	 // override deleteFlag with whether Flag Work checkbox is checked or not
	deleteFlag = !document.getElementById("flagButton_" + stepWorkId).checked;
		 
	var postFlagsUrl = this.getConfig().getConfigParam('postFlagsUrl');
	
	var value = '';
	
	//check if we are flagging or unflagging the flag
	if(deleteFlag) {
		//we are deleting/unflagging the flag
		value = 'unflagged';
	} else {
		//we are flagging the flag
		value = 'flagged';
	}
	
	//build the post flag url with get arguments
	var postFlagArgs = {runId:runId, nodeId:nodeId, toWorkgroup:toWorkgroup, fromWorkgroup:fromWorkgroup, stepWorkId:stepWorkId, value:value, annotationType:'flag'};


	var postFlagCallback = function(text, xml, args) {
			var thisView = args[0];

			//create the flag annotation and update or add it to our local copy of annotations
			var flagAnnotation = new Annotation(runId, nodeId, toWorkgroup, fromWorkgroup, 'flag', value, text, stepWorkId);
			thisView.getAnnotations().updateOrAddAnnotation(flagAnnotation);
			
			// update isflagged attribute on the studentWorkRow. Also update what gets shown, based on if "only show flagged items" is checked.
			if (deleteFlag) {
				//set the isflagged attribute to false
				document.getElementById('studentWorkRow_'+toWorkgroup+'_'+nodeId+'_'+stepWorkId).setAttribute('isflagged', false);
				
				/*
				 * call the filter again because if the "show flagged" check box is
				 * checked, and we unflag an item, we want it to immediately become
				 * hidden
				 */
				thisView.filterStudentRows();
			} else {
				//set the isflagged attribute to true
				document.getElementById('studentWorkRow_'+toWorkgroup+'_'+nodeId+'_'+stepWorkId).setAttribute('isflagged', true);
			}
	};
	
	var postFlagCallbackFail = function(text, args) {
		var thisView = args[0];
		var nodeId = args[1];
		var toWorkgroup = args[2];
		var fromWorkgroup = args[3];
		var fromWorkgroups = thisView.getUserAndClassInfo().getAllTeacherWorkgroupIds();
		var runId = args[4];
		var stepWorkId = args[5];
		
		//try to obtain the flag
		var flag = thisView.flags.getLatestAnnotation(runId, nodeId, toWorkgroup, fromWorkgroups, 'flag');
		
		//display a message telling the teacher the flag value will be reverted back
		alert("Failed to save flag, the flag will be reverted back to its previous value.");
		
		//revert the check box back to the previous value
		if(flag) {
			//the flag previously exists so we will check it
			document.getElementById("flagButton_" + stepWorkId).checked =  true;
		} else {
			//the flag did not previously exist so we will uncheck it
			document.getElementById("flagButton_" + stepWorkId).checked = false;
		}
	};

	//make the call to post the annotation
	this.connectionManager.request('POST', 1, postFlagsUrl, postFlagArgs, postFlagCallback, [this, nodeId, toWorkgroup, fromWorkgroup, runId, stepWorkId], postFlagCallbackFail);
};


/**
 * Retrieve all the annotations for this run
 */
View.prototype.retrieveAnnotations = function() {
	var getAnnotationsCallback = function(text, xml, args) {
		var thisView = args[0];
		thisView.setAnnotations(Annotations.prototype.parseDataJSONString(text));
		eventManager.fire("retrieveAnnotationsCompleted");
	};
	
	this.connectionManager.request('GET', 1, this.getConfig().getConfigParam('getAnnotationsUrl'), null, getAnnotationsCallback, [this]);
};


/**
 * Retrieve all the flags for this run
 */
View.prototype.getFlags = function() {
	var getFlagsCallback = function(text, xml, args) {
		var thisView = args[0];
		thisView.flags = Annotations.prototype.parseDataJSONString(text);
		eventManager.fire("getFlagsCompleted");
	};
	this.connectionManager.request('GET', 1, this.getConfig().getConfigParam('getFlagsUrl'), null, getFlagsCallback, [this]);
};

/**
 * Remove the flagged item from the flaggedItemsTable
 */
function removeFlaggedItemFromDisplay(itemNumber) {
	//get the flaggedItemsTable
	var flaggedItemTable = document.getElementById('flaggedItemsTable');

	//get the flagged item
	var flaggedItemToRemove = document.getElementById('flaggedItem' + itemNumber);

	/*
	 * remove the flagged item from the table. flaggedItemTable.childNodes[0] 
	 * is the tbody which contains the tr elements.
	 */
	flaggedItemTable.childNodes[0].removeChild(flaggedItemToRemove);

	//check if there are no more flagged items for this step
	if(flaggedItemsTableEmpty()) {
		//display the message that says there are no flagged responses
		addNoFlaggedResponsesMsg();
	}
}

/**
 * Display the "No flagged responses" message to the flaggedItemsTable
 */
function addNoFlaggedResponsesMsg() {
	//get the flaggedItemsTable
	var flaggedItemTable = document.getElementById('flaggedItemsTable');

	//create the row to display the message
	var noFlaggedResponsesRow = document.createElement("tr");

	//set the id
	noFlaggedResponsesRow.id = 'noFlaggedResponses';

	//set the text in the row
	noFlaggedResponsesRow.innerHTML = "<td>No flagged responses</td>";

	//add the row to the table if the table is empty
	if(flaggedItemsTableEmpty()) {
		/*
		 * add the message to the table. flaggedItemTable.childNodes[0] 
		 * is the tbody which contains the tr elements.
		 */
		flaggedItemTable.childNodes[0].appendChild(noFlaggedResponsesRow);
	}
}

/**
 * Remove the "No flagged responses" message from the flaggedItemsTable
 */
function removeNoFlaggedResponsesMsg() {
	//get the flaggedItemsTable
	var flaggedItemTable = document.getElementById('flaggedItemsTable');

	//get the row that displays the message
	var noFlaggedResponsesRow = document.getElementById('noFlaggedResponses');

	//check if the row exists
	if(noFlaggedResponsesRow != null) {
		/*
		 * remove the message from the table. flaggedItemTable.childNodes[0] 
		 * is the tbody which contains the tr elements.
		 */
		flaggedItemTable.childNodes[0].removeChild(noFlaggedResponsesRow);
	}
}

/**
 * Check if the flaggedItemsTable contains any flagged items
 */
function flaggedItemsTableEmpty() {
	var flaggedItemTable = document.getElementById('flaggedItemsTable');
	
	//check how many items are in the table
	if(flaggedItemTable.childNodes[0].childNodes.length == 1) {
		
		var noFlaggedResponsesRow = document.getElementById('noFlaggedResponses');
		
		/*
		 * check if the one item in the table is the "no flagged responses"
		 * row
		 */
		if(noFlaggedResponsesRow != null) {
			/*
			 * the one item is the "no flagged responses" row so the table has
			 * no flagged items and is empty
			 */
			return true;
		} else {
			/*
			 * the one item is not the "no flagged responses" row and is a
			 * flagged item, so the table is not empty
			 */
			return false;
		}
	} else {
		//there is more than one item so the table is not empty
		return false;
	}
}

/**
 * Show the total scores of all students
 * Go thru all of the classmates and get their score
 */
function showScores() {
	var classmates = vle.myClassInfo.classmates;
	var htmlSoFar = "score\tname\n";
	for (var i=0; i < classmates.length; i++) {
		var classmate = classmates[i];
		var classmateScore = annotations.getTotalScoreByToWorkgroup(classmate.workgroupId);
		htmlSoFar += classmateScore + "\t" + classmate.userName +"\n";
	}
	alert(htmlSoFar);
}



//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/grading/gradingview_annotations.js');
};