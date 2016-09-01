/**
 * The util object for this view
 * 
 * @author Patrick Lawler
 */
View.prototype.utils = {};

View.prototype.utilDispatcher = function(type, args, obj) {
	if (type == 'loadConfigCompleted') {
		obj.initializeSession();
	}
};

/**
 * Update the max score for the given nodeId. Create a MaxScores
 * object if one does not exist.
 * @param nodeIds the ids of the nodes in the project
 * @param maxScoreValue the new max score value
 */
View.prototype.getMaxScoresSum = function(nodeIds) {
	//check if maxScores has been set
	if(this.maxScores == null) {
		//it has not been set so we will make a new MaxScores object
		return 0;
	} else {
		return this.maxScores.getMaxScoresSum(nodeIds);
	}
};

/**
 * Get the project meta data such as max score values
 */
View.prototype.retrieveProjectMetaData = function() {
	//get the url to retrieve the project meta data
	var projectMetadataURL = this.getConfig().getConfigParam('projectMetadataURL');
	
	if(projectMetadataURL && projectMetadataURL != ""){
		var projectMetaDataCallbackSuccess = function(text, xml, args) {
			var thisView = args[0];
			
			if(text != null && text != "") {
				thisView.setProjectMetadata(thisView.$.parseJSON(text));
				
				var maxScores = thisView.getProjectMetadata().maxScores;
				if(maxScores == null || maxScores == "") {
					maxScores = "[]";
				}
				thisView.processMaxScoresJSON(maxScores);
			}
	
			thisView.projectMetaDataRetrieved = true;
			eventManager.fire("retrieveProjectMetaDataCompleted");
		};
		
		var projectMetaDataCallbackFailure = function(text, args) {
			var thisView = args[0];
			thisView.projectMetaDataRetrieved = true;
			eventManager.fire("retrieveProjectMetaDataCompleted");
		};
		
		var projectMetadataURLParams = {
				command:"getProjectMetaData",
				projectId:this.getConfig().getConfigParam("projectId")
		};
		this.connectionManager.request('GET', 1, projectMetadataURL, projectMetadataURLParams, projectMetaDataCallbackSuccess, [this], projectMetaDataCallbackFailure);
	};
};

/**
 * Parses and sets or merges the new max scores
 * @param maxScoresJSON
 */
View.prototype.processMaxScoresJSON = function(maxScoresJSON) {
	//parse the max scores JSON
	var newMaxScores = MaxScores.prototype.parseMaxScoresJSONString(maxScoresJSON);
	
	//see if the max scores has already been set
	if(this.maxScores == null) {
		//it has not been set so we will set it
		this.maxScores = newMaxScores;
	} else {
		//it has been set so we will merge the new max scores
		this.maxScores.mergeMaxScores(newMaxScores);
	}
};


/**
 * Returns whether the content string contains an applet by searching for
 * an open and close applet tag in the content string.
 */
View.prototype.utils.containsApplet = function(content){
	/* check for open and close applet tags */
	var str = content.getContentString();
	if(str.indexOf("<applet") != -1 && str.indexOf("</applet>") != -1) {
		return true;
	} else {
		return false;
	};
};

/**
 * Given a string of a number of bytes, returns a string of the size
 * in either: bytes, kilobytes or megabytes depending on the size.
 */
View.prototype.utils.appropriateSizeText = function(bytes){
	if(bytes>1048576){
		return this.roundToDecimal(((bytes/1024)/1024), 1) + ' mb';
	} else if(bytes>1024){
		return this.roundToDecimal((bytes/1024), 1) + ' kb';
	} else {
		return bytes + ' b';
	};
};


/**
 * Returns the given number @param num to the nearest
 * given decimal place @param decimal. (e.g if called 
 * roundToDecimal(4.556, 1) it will return 4.6.
 */
View.prototype.utils.roundToDecimal = function(num, decimal){
	var rounder = 1;
	if(decimal){
		rounder = Math.pow(10, decimal);
	};

	return Math.round(num*rounder)/rounder;
};

/**
 * Extracts the file servlet information from the given url and returns the result.
 */
View.prototype.utils.getContentPath = function(baseUrl, url){
	return url.substring(url.indexOf(baseUrl) + baseUrl.length, url.length);
};

/**
 * Get all elements with the given class name
 * @param node
 * @param searchClass
 * @param tag
 * @return
 */
View.prototype.getElementsByClassName = function(node,searchClass,tag) {  
	var classElements = new Array();  
	if ( node == null )  
		node = document;  
	if ( tag == null )  
		tag = '*';  
	var els = node.getElementsByTagName(tag); // use "*" for all elements  
	var elsLen = els.length;  
	var pattern = new RegExp("\\b"+searchClass+"\\b");  
	for (i = 0, j = 0; i < elsLen; i++) {  
		if ( pattern.test(els[i].className) ) {  
			classElements[j] = els[i];  
			j++;  
		}  
	}  
	return classElements;  
};

/**
 * Checks if the latest node state for the given node is locked
 * @param nodeId
 * @return whether the latest node state for the given node is locked
 */
View.prototype.isLatestNodeStateLocked = function(nodeId) {
	//get the latest node state for the given node
	var nodeState = this.getLatestStateForNode(nodeId);

	if(nodeState != null && nodeState.locked != null) {
		//return the locked value
		return nodeState.locked;
	} else {
		return false;
	}
};

/**
 * Returns the state for the current step
 * If the current step is not {HTML step || MySystem step || Draw step || MW step}, do nothing.
 */
View.prototype.getLatestStateForCurrentNode = function() {
	var currentNode = this.getCurrentNode();
	if (currentNode.type != "HtmlNode" 
			&& currentNode.type != "MySystemNode" 
			&& currentNode.type != "SVGDrawNode"
			&& currentNode.type != "AnnotatorNode"
			&& currentNode.type != "MWNode") {
		return;
	} 
	var stringSoFar = "";   // build the data
	
	if(this.getState() != null) {
		var allNodeVisitsForCurrentNode = this.getState().getNodeVisitsByNodeId(currentNode.id);
		for (var i=0; i<allNodeVisitsForCurrentNode.length; i++) {
			var nodeStates = allNodeVisitsForCurrentNode[i].nodeStates;
			if (nodeStates != null) {
				for (var j=0; j < nodeStates.length; j++) {
					if (nodeStates[j].data != "") {
						stringSoFar = nodeStates[j].data;
					}
				}
			}
		}
	}

	return stringSoFar;
};

/**
 * Save the max score the teacher has specified
 * @param runId
 * @param nodeId
 */
View.prototype.saveMaxScore = function(nodeId, maxScoreValue) {
	/*
	 * updates the local copy of the max scores after the server
	 * has successfully updated it on the server
	 */
	var postMaxScoreCallback = function(text, xml, args) {
		var thisView = args[0];
		var maxScoreObj = null;
		
		try {
			//parse the json that is returned
			maxScoreObj = $.parseJSON(text);
		} catch(error) {
			//do nothing
		}
		
		if(maxScoreObj == null) {
			if(text == 'ERROR:LoginRequired') {
				//the user is not logged in because their session has timed out
				alert("Your latest grade has not been saved.\n\nYou have been inactive for too long and have been logged out. Please sign in to continue.");
				
				//get the context path e.g. /wise
				var contextPath = thisView.getConfig().getConfigParam('contextPath');
				
				//redirect the user to the login page
				window.top.location = contextPath + "/logout";
			} else {
				//there was a server error
				
				var nodeId = args[1];

				//revert the max score value to its previous value
				thisView.revertMaxScore(nodeId);
			}
		} else {
			//get the node id the max score is for
			var nodeId = maxScoreObj.nodeId;
			
			//get the value for the max score
			var maxScoreValue = maxScoreObj.maxScoreValue;
			
			//update the max score in the maxScores object
			thisView.updateMaxScore(nodeId, maxScoreValue);
		}
	};
	
	var postMaxScoreCallbackFail = function(text, args) {
		var thisView = args[0];
		var nodeId = args[1];
		
		//revert the max score value to its previous value
		thisView.revertMaxScore(nodeId);
	};
	
	//parse the value from the text box to see if it is a valid integer
	var maxScoreValueInt = parseInt(maxScoreValue);
	
	//check that the value entered is a number greater than or equal to 0
	if(isNaN(maxScoreValueInt) || maxScoreValueInt < 0) {
		//the value is invalid so we will notify the teacher
		alert("Error: invalid Max Score value, please enter a value 0 or greater");
		
		//get the previous max score
		var previousMaxScore = this.getMaxScoreValueByNodeId(nodeId);
		
		//set the value back to the previous value
		$('#' + this.escapeIdForJquery('maxScore_' + nodeId)).val(previousMaxScore);
		
		return;
	}
	
	//create the args used to update the max score on the server
	var postMaxScoreParams = {command: "postMaxScore", projectId: this.getProjectId(), nodeId: nodeId, maxScoreValue: maxScoreValue};
	
	//send the new max score data back to the server
	this.connectionManager.request('POST', 1, this.getConfig().getConfigParam('projectMetadataURL'), postMaxScoreParams, postMaxScoreCallback, [this, nodeId], postMaxScoreCallbackFail);
};

/**
 * Revert the max score value for a specific step
 * @param nodeId the id of the node that we are reverting the max score value for
 */
View.prototype.revertMaxScore = function(nodeId) {
	//display a message telling the teacher the max score value will be reverted back
	alert("Failed to save max score, the max score will be reverted back to its previous value.");
	
	//get the previous max score
	var previousMaxScore = this.getMaxScoreValueByNodeId(nodeId);
	
	//set the value back to the previous value
	$('#' + this.escapeIdForJquery('maxScore_' + nodeId)).val(previousMaxScore);
};

/**
 * Get the max score for the specified step/nodeId
 * If there are no max scores or there is no max score
 * for the step/nodeId we will just return ""
 * @param nodeId the step/nodeId
 * @return the max score for the step/nodeId or ""
 */
View.prototype.getMaxScoreValueByNodeId = function(nodeId) {
	var maxScore = "0";
	
	//check if the max scores object has been set
	if(this.maxScores != null) {
		//get the max score for this step
		maxScore = this.maxScores.getMaxScoreValueByNodeId(nodeId) + "";	
	}
	
	return maxScore;
};

View.prototype.updateMaxScore = function(nodeId, maxScoreValue) {
	//check if maxScores has been set
	if(this.maxScores == null) {
		//it has not been set so we will make a new MaxScores object
		this.maxScores = new MaxScores();
	}
	
	//update the score for the given nodeId
	this.maxScores.updateMaxScore(nodeId, maxScoreValue);
};

View.prototype.getProjectId = function() {
	var projectId = "";
	
	if(this.portalProjectId != null) {
		//for when we are in authoring tool
		projectId = this.portalProjectId;
	} else {
		//for when we are in grading or student vle mode
		projectId = this.getConfig().getConfigParam("projectId");
	}
	
	if(projectId != null && projectId != "") {
		//parse the project to an int
		projectId = parseInt(projectId);
	}
	
	return projectId;
};

/**
 * Replaces each \n with a <div>
 * @param studentWork the student work, this may be a string or
 * an array with one element that is a string
 * @return a string with \n replaced with <div>
 * TODO: filter out extraneous tags and stylings
 */
View.prototype.replaceSlashNWithDiv = function(studentWork) {
	
	if(studentWork == null) {
		//do nothing
	} else if (studentWork.constructor.toString().indexOf("Array") == -1) {
		//studentWork is not an array
		//studentWork = studentWork.replace(/\n/g, "<br>");
		studentWork = studentWork.replace(/\n/g, "</div><div>");
		studentWork = '<div>' + studentWork;
		studentWork = studentWork.replace(/<div>$/,'');
	} else {
		//studentWork is an array
		//studentWork = studentWork[0].replace(/\n/g, "<br>");
		studentWork = studentWork[0].replace(/\n/g, "</div><div>");
		studentWork = '<div>' + studentWork;
		studentWork = studentWork.replace(/<div>$/,'');
	}
	
	return studentWork;
};

/**
 * Replaces the \n with a <br>
 * @param studentWork the student work, this may be a string or
 * an array with one element that is a string
 * @return a string with \n replaced with <br>
 */
View.prototype.replaceSlashNWithBR = function(studentWork) {
	
	if(studentWork == null) {
		//do nothing
	} else if (studentWork.constructor.toString().indexOf("Array") == -1) {
		//studentWork is not an array
		studentWork = studentWork.replace(/\n/g, "<br>");
	} else {
		//studentWork is an array
		studentWork = studentWork[0].replace(/\n/g, "<br>");
	}
	
	return studentWork;
};

/**
 * Logs the user out of the vle. We use this when their session has timed
 * out so that they don't continue working since their work won't save
 * after their session has timed out.
 */
View.prototype.forceLogout = function() {
	//get the context path e.g. /wise
	var contextPath = this.getConfig().getConfigParam('contextPath');
	
	alert("You have been inactive for too long and have been logged out. Please log back in to continue.");
	parent.window.location = contextPath + "/logout";
};

/**
 * Get the idea basket for the given workgroup id
 * @param workgroupId the id of the workgroup we want the idea basket from
 * @return the idea basket from the given workgroup or null if not found
 */
View.prototype.getIdeaBasketByWorkgroupId = function(workgroupId) {
	var ideaBasket = null;
	
	if(this.getUserAndClassInfo().getWorkgroupId() == workgroupId) {
		//the user wants their own basket
		ideaBasket = this.ideaBasket;
	} else {
		//check if we have retrieved the idea baskets
		if(this.ideaBaskets != null) {
		
			//loop through all the idea baskets
			for(var x=0; x<this.ideaBaskets.length; x++) {
				var tempIdeaBasket = this.ideaBaskets[x];
				
				//compare the workgroup id of the idea basket
				if(tempIdeaBasket.workgroupId == workgroupId) {
					//we have found a match so we will break out of the for loop
					ideaBasket = tempIdeaBasket;
					break;
				}
			}
		}
	}
	
	return ideaBasket;
};

/**
 * Get the max possible score for the project
 * @return the max possible score for the project
 */
View.prototype.getMaxScoreForProject = function() {
	var maxScoreForProject = 0;
	
	//get all the node ids in the project
	var nodeIdsInProject = this.getProject().getNodeIds();
	
    if(this.maxScores != null) {
        
        var annotations = null;
        
        // try to get the annotations from the model
        if (this.model != null && this.model.annotations != null) {
            annotations = this.model.annotations;
        }
        
		//get the max scores sum for all the node ids 
		maxScoreForProject = this.maxScores.getMaxScoresSum(nodeIdsInProject, annotations);
	}
	
	return maxScoreForProject;
};

/**
 * Given a filename, returns the extension of that filename
 * if it exists, null otherwise.
 */
View.prototype.utils.getExtension = function(text){
	var ndx = text.lastIndexOf('.');
	if(-1 < ndx){
		return text.substring(ndx + 1, text.length);
	};

	return null;
};

/**
 * Callback function for when the dynamically created frame for uploading assets has recieved
 * a response from the request. Notifies the response and removes the frame.
 * @param target
 * @param view
 * @param filename the name of the file that was just uploaded
 */
View.prototype.assetUploaded = function(target, view, filename){
	var htmlFrame = target;
	var frame = window.frames[target.id];
	
	var assetEditorParams = null;
	
	if(view.assetEditorParams == null) {
		//initialize the asset editor params if it doesn't already exist
		view.assetEditorParams = {};
	}
	
	assetEditorParams = view.assetEditorParams;
	
	/*
	 * add the filename of the file that was just uploaded into the asset editor params so we
	 * know which file was just uploaded
	 */
	assetEditorParams.filename = filename;
	
	if(frame.document && frame.document.body && frame.document.body.innerHTML != ''){
		var message = "";
		
		if(frame.document.body.innerHTML != null && frame.document.body.innerHTML.indexOf("server has encountered an error") != -1) {
			//the server returned a generic error page
			message = "Error: an error occurred while trying to upload your file, please make sure you do not try to upload files larger than 10 mb";
		} else {
			//there was no error so we will display the message that we received
			message = frame.document.body.innerHTML;
		}
		
		//display the message in the upload manager
		notificationManager.notify(message, 3, 'uploadMessage', 'notificationDiv');
		
		//clear out the frame
		$(htmlFrame).remove();
		
		/* cancel fired to clean up and hide the dialog */
		//eventManager.fire('assetUploadCancel');
		
		// refresh edit asset dialog
		if (target.getAttribute('type')=="student") {
			eventManager.fire('viewStudentAssets',view.assetEditorParams);			
		} else {
			eventManager.fire('viewAssets',view.assetEditorParams);
		}
		$('#assetProcessing').hide();
		
		/* change cursor back to default */
		document.body.style.cursor = 'default';
		
		document.getElementById('uploadAssetFile').setAttribute("name", 'uploadAssetFile');
	} else {
		document.body.removeChild(htmlFrame);
	}
	
	if(assetEditorParams != null) {
		//get the callback function to call after the student uploads a file
		var callback = assetEditorParams.callback;
		
		if(callback != null) {
			//call the callback function
			callback(assetEditorParams);
		}
	}
};

/**
 * Initializes Session for currently logged in user.
 */
View.prototype.initializeSession = function(){
	this.sessionManager = new SessionManager(eventManager, this);
};

/**
 * Returns true if the given name is an allowed file type
 * to upload as asset, false otherwise.
 */
View.prototype.utils.fileFilter = function(extensions,name){
	try {
	return extensions.indexOf(this.getExtension(name).toLowerCase()) != -1;
	}
	catch(err) {
		return false;
	}
};

View.prototype.checkRealTimeEnabled = function() {
	var isRealTimeEnabled = false;

	if (this.config.getConfigParam("isRealTimeEnabled") != null && this.config.getConfigParam("isRealTimeEnabled")) {
		var runInfo = this.config.getConfigParam("runInfo");
		
		if(runInfo != null && runInfo != "") {
			var runInfoJSON = JSON.parse(runInfo);
			
			if(runInfoJSON != null) {
				if(runInfoJSON.isRealTimeEnabled != null) {
					isRealTimeEnabled = runInfoJSON.isRealTimeEnabled;
				}
			}
		}
	}
	
	return isRealTimeEnabled;
};

/**
 * Function used by Array.sort() to sort an array of strings
 * alphabetically
 * @param a
 * @param b
 * @return -1 if a comes before b
 * 1 if a comes after b
 * 0 if a and b are equal
 */
View.prototype.sortAlphabetically = function(a, b) {
	var aLowerCase = a.toLowerCase();
	var bLowerCase = b.toLowerCase();
	
	if(aLowerCase < bLowerCase) {
		return -1;
	} else if(aLowerCase > bLowerCase) {
		return 1;
	} else {
		return 0;
	}
};


/**
 * Prepends contentBaseUrl string to each occurrence of 
 * "./assets"
 * "/assets"
 * "assets"
 * './assets'
 * '/assets'
 * 'assets'
 * in the string passed in.
 * They must occur as the first character of a word., i.e., "./assets" must be preceded by a space.
 */
View.prototype.utils.prependContentBaseUrlToAssets = function(contentBaseUrl, stringIn) {
	stringIn = stringIn.replace(new RegExp('\"./assets', 'g'), '\"'+contentBaseUrl + 'assets');
	stringIn = stringIn.replace(new RegExp('\"/assets', 'g'), '\"'+contentBaseUrl + 'assets');
	stringIn = stringIn.replace(new RegExp('\"assets', 'g'), '\"'+contentBaseUrl + 'assets');
	stringIn = stringIn.replace(new RegExp('\'./assets', 'g'), '\"'+contentBaseUrl + 'assets');
	stringIn = stringIn.replace(new RegExp('\'/assets', 'g'), '\"'+contentBaseUrl + 'assets');
	stringIn = stringIn.replace(new RegExp('\'assets', 'g'), '\"'+contentBaseUrl + 'assets');	
	
	return stringIn;
};

/**
 * Escape the DOM id so that it can be used in a jquery id selector.
 * e.g.
 * node_1.or will be converted to node_1\.or
 * If we do not do this, the jquery selector will treat the . as a
 * class selector and will not find the element.
 * @param id the DOM id
 * @returns the id with . escaped
 */
View.prototype.escapeIdForJquery = function(id) {
	//make sure the id is a string
	id = id + "";
	
	//replace all . with \.
	id = id.replace(/\./g, '\\.');
	
	return id;
};

/**
 * Returns the string of concepts converted into an array
 * @param conceptsString, can be "1,2,3" or "1-4" or "1-4,7" or ""
 * @return array [1,2,3], [1,2,3,4], [1,2,3,4,7], []
 */
View.prototype.convertCRaterConceptsToArray = function(conceptsString) {
	var allConcepts = [];
	if (conceptsString && conceptsString != "") {
		var conceptsArr = conceptsString.split(",");
		for (var i=0; i<conceptsArr.length; i++) {
			var conceptsElement = conceptsArr[i];
			if (conceptsElement.indexOf("-") >= 0) {
				var conceptsElementArr = conceptsElement.split("-");		
				for (var k=conceptsElementArr[0]; k <= conceptsElementArr[1]; k++) {
					allConcepts.push(parseInt(k));							
				}
			} else {
				allConcepts.push(parseInt(conceptsElement));			
			}
		}
	}
	return allConcepts;
};

/**
 * Return true iff the specified studentConcepts exactly matches the specified ruleConcepts
 * @param studentConcepts string of concepts the student got. like "1,2"
 * @param ruleConcepts string of concepts in the rule. looks like "1", "1,2", "1-4"
 */
View.prototype.satisfiesCRaterRulePerfectly = function(studentConcepts, ruleConcepts) {
	var studentConceptsArr = this.convertCRaterConceptsToArray(studentConcepts);
	var ruleConceptsArr = this.convertCRaterConceptsToArray(ruleConcepts);
	return (studentConceptsArr.length == ruleConceptsArr.length && studentConceptsArr.compare(ruleConceptsArr));
};

/**
 * Return true iff the specified studentConcepts matches the specified ruleConcepts numMatches or more times
 * @param studentConcepts string of concepts the student got
 * @param ruleConcepts string of concepts in the rule
 * @param numMatches number of concepts that need to match to be true.
 */
View.prototype.satisfiesCRaterRule = function(studentConcepts, ruleConcepts, numMatches) {
	var studentConceptsArr = this.convertCRaterConceptsToArray(studentConcepts);
	var ruleConceptsArr = this.convertCRaterConceptsToArray(ruleConcepts);
	var countMatchSoFar = 0;  // keep track of matched concepts
	for (var i=0; i < studentConceptsArr.length; i++) {
		var studentConcept = studentConceptsArr[i];
		if (ruleConceptsArr.indexOf(studentConcept) >= 0) {
			countMatchSoFar++;
		}
	}
	return countMatchSoFar >= numMatches;
};

/**
 * Get the feedback for the given concepts
 * @param scoringRules an array of scoring rules
 * @param concepts a string containing the concepts
 * @param score the score
 * @param cRaterItemType the crater item type e.g. 'CRATER' or 'HENRY'
 * @returns the feedback
 */
View.prototype.getCRaterFeedback = function(scoringRules, concepts, score, cRaterItemType) {
	var feedbackSoFar = "No Feedback";
	var maxScoreSoFar = 0;
	
	if (scoringRules) {
		//loop through all the scoring rules
		for (var i=0; i < scoringRules.length; i++) {
			//get a scoring rule
			var scoringRule = scoringRules[i];
			
			if(cRaterItemType == null || cRaterItemType == 'CRATER') {
				if (this.satisfiesCRaterRulePerfectly(concepts, scoringRule.concepts)) {
					//the concepts perfectly match this scoring rule
					
					//if this scoring rule has more than one feedback, choose one randomly
					feedbackSoFar = this.chooseFeedbackRandomly(scoringRule.feedback);
					
					//no longer need to check other rules if we have a pefect match
					break;
				} else if (scoringRule.score > maxScoreSoFar && this.satisfiesCRaterRule(concepts, scoringRule.concepts, parseInt(scoringRule.numMatches))) {
					/*
					 * the concepts match this scoring rule but we still need to
					 * look at the other scoring rules to make sure there aren't
					 * any better matches that will give the student a better score
					 */
					
					//if this scoring rule has more than one feedback, choose one randomly
					feedbackSoFar = this.chooseFeedbackRandomly(scoringRule.feedback);
					maxScoreSoFar = scoringRule.score;
				}
			} else if(cRaterItemType == 'HENRY') {
				//get the score for this scoring rule
				var scoringRuleScore = scoringRule.score;
				
				if(score == scoringRuleScore) {
					//if this scoring rule has more than one feedback, choose one randomly
					feedbackSoFar = this.chooseFeedbackRandomly(scoringRule.feedback);
				}
			}
		}
	}
	
	return feedbackSoFar;
};

/**
 * If the feedback is an array we will choose one of the elements at random.
 * If the feedback is a string we will just return the string.
 * @param feedback a string or an array of strings
 * @return a feedback string
 */
View.prototype.chooseFeedbackRandomly = function(feedback) {
	var chosenFeedback = "";
	
	if(feedback == null) {
		//feedback is null
	} else if(feedback.constructor.toString().indexOf("String") != -1) {
		//feedback is a string
		chosenFeedback = feedback;
	} else if(feedback.constructor.toString().indexOf("Array") != -1) {
		//feedback is an array
		
		if(feedback.length > 0) {
			/*
			 * randomly choose one of the elements in the array
			 * Math.random() returns a value between 0 and 1
			 * Math.random() * feedback.length returns a value between 0 and feedback.length (not inclusive)
			 * Math.floor(Math.random() * feedback.length) returns an integer between 0 and feedback.length (not inclusive)
			 */
			var index = Math.floor(Math.random() * feedback.length);
			chosenFeedback = feedback[index];
		}
	}
	
	return chosenFeedback;
};

/*
 * Returns Annotations by specified annotationType
 * @param annotationType annotation type
 */
View.prototype.getAnnotationsByType = function(annotationType) {
	this.runAnnotations = {};  // looks like {"groups":["A","D","Branch1-A","Branch2-X"] }
	var processGetAnnotationResponse = function(responseText, responseXML, args) {
		var thisView = args[0];
		
		//parse the xml annotations object that contains all the annotations
		thisView.runAnnotations = Annotations.prototype.parseDataJSONString(responseText);
	};

	var annotationsUrlParams = {
				runId: this.getConfig().getConfigParam('runId'),
				toWorkgroup: this.getUserAndClassInfo().getWorkgroupId(),
				fromWorkgroups: this.getUserAndClassInfo().getAllTeacherWorkgroupIds(),
				periodId:this.getUserAndClassInfo().getPeriodId(),
				annotationType:annotationType
			};
	var fHArgs = null;
	var synchronous = true;	
	this.connectionManager.request('GET', 3, this.getConfig().getConfigParam('annotationsURL'),
					annotationsUrlParams, processGetAnnotationResponse, [this], fHArgs, synchronous);

	// lookup the annotationKey in the runAnnotations obj. runAnnotationsObj should be set by this point.
	return this.runAnnotations;
};

/*
 * TODO: REMOVE and replace with bsTooltip (see below) when we're using Bootstrap across the vle
 * 
 * Finds any DOM elements with the 'tooltip' class and initializes the miniTip plugin on each.
 * 
 * @param options An object to specify default miniTip settings for all tooltips (Optional; 
 * see http://goldfirestudios.com/blog/81/miniTip-jQuery-Plugin for allowable options)
 * 
 * Individual tooltip options can be customized by adding additional attributes to the target DOM 
 * element (Optional; will override default settings):
 * - tooltip-event:'click' sets the tooltip to render on mouse click (vs. hover, which is the default)
 * - tooltip-anchor:'bottom', 'left', and 'right' set the positions of the tooltip to bottom, left, 
 * and right respectively (default is top)
 * - tooltip-maxW:'XXXpx' sets the max-width of the tooltip element to XXX pixels (default is '250px');
 * - tooltip-content: String (or HTML String) to set as the tooltip's content (default is the element's 
 * title attribute)
 * - tooltip-title: String to set as the tooltip's title (default is no title)
 * - tooltip-class: String to add to the tooltip element's css class (default is none)
 */
View.prototype.insertTooltips = function(options){
	// for all DOM elements with the 'tooltip' class, initialize miniTip
	$('.tooltip').each(function(){
		// set miniTip default options
		var settings = {};
		if(options != null && typeof options == 'object'){
			// options have been sent in as a parameter
			settings = options;
		} else {
			// options have not been sent in as a paremeter, so set them 
			settings = {
				anchor:'n',
				event:'hover',
				aHide:false,
				maxW:'250px',
				fadeIn:10,
				fadOut:10,
				delay:100,
				show: function(){},
				hide: function(){}
			};
		}
		
		// set options based on target element attributes
		if($(this).attr('tooltip-event') == 'click'){
			settings.event = 'click';
		}
		if($(this).attr('tooltip-anchor') == 'right'){
			settings.anchor = 'e';
		} else if ($(this).attr('tooltip-anchor') == 'bottom'){
			settings.anchor = 's';
		} else if ($(this).attr('tooltip-anchor') == 'left'){
			settings.anchor = 'w';
		}
		if($(this).attr('tooltip-maxW') && $(this).attr('tooltip-maxW').match(/^[0-9]+px$/)){
			settings.maxW = $(this).attr('tooltip-maxW');
		}
		if(typeof $(this).attr('tooltip-content') == 'string'){
			settings['content'] = $(this).attr('tooltip-content');
		}
		if(typeof $(this).attr('tooltip-title') == 'string'){
			settings['title'] = $(this).attr('tooltip-title');
		}
		if(typeof $(this).attr('tooltip-class') == 'string'){
			var doShow = settings.show, doHide = settings.hide;
			settings.show = function(){
				$('#miniTip').addClass($(this).attr('tooltip-class'));
				doShow();
			};
			settings.hide = function(){
				setTimeout(function(){$('#miniTip').removeClass($(this).attr('tooltip-class'));},200);
				doHide();
			};
		} else {
			var doShow = settings.show;
			settings.show = function(){
				$('#miniTip').attr('class','');
				doShow();
			};
		}
		
		// initialize miniTip on element
		$(this).miniTip(settings);
		
		// remove all tooltip attributes and class from DOM element (to clean up html and so item are not re-processed if insertTooltips is called again on same page)
		$(this).removeAttr('tooltip-event').removeAttr('tooltip-anchor').removeAttr('tooltip-maxW').removeAttr('tooltip-content').removeAttr('tooltip-title').removeClass('tooltip');
	});
};

/*
 * Initializes Bootstrap tooltips on target DOM element(s).
 * 
 * @param target A jQuery DOM element on which to process (Optional; if null, will search page and initialize
 * on any element with 'bs-tooltip' class)
 * @param options An object to specify default tooltip settings (Optional; see 
 * http://getbootstrap.com/javascript/#tooltips for allowable options)
 * 
 * Individual tooltip options also can be customized by adding jQuery data fields or HTML5 data-* attributes 
 * to the DOM element, as specified in the Bootstrap documentation above
 */
View.prototype.bsTooltip = function(target,options){
	function processElement(item,options){
		var dtAttr = item.attr('data-toggle') + ' tooltip';
		item.css('cursor','pointer').attr(dtAttr);

		// WISE defaults
		var settings = {
			container: 'body',
			trigger: 'hover click focus',
			placement: 'top auto',
			delay: { show: 200, hide: 100 }
		};
		
		if(options !== null && typeof options === 'object'){
			// tooltip options have been sent in as a parameter, so merge with defaults
			$.extend(settings,options);
		}
		
		// initialize tooltip on target and set click to toggle tooltip on/off
		item.tooltip(settings);
	}
	
	if(target){
		processElement(target,options);
	} else {
		processElement($('.bs-tooltip'),options);
	}
};

/*
 * Initializes Bootstrap popovers on target DOM element(s).
 * 
 * @param target A jQuery DOM element on which to process (Optional; if null, will search page and initialize
 * on any element with 'bs-popover' class)
 * @param options An object to specify default popover settings (Optional; see 
 * http://getbootstrap.com/javascript/#popovers for allowable options)
 * 
 * Individual popover options also can be customized by adding jQuery data fields or HTML5 data-* attributes 
 * to the DOM element, as specified in the Bootstrap documentation above
 */
View.prototype.bsPopover = function(target,options){
	function processElement(item,options){
		var dtAttr = item.attr('data-toggle') + ' popover';
		item.css('cursor','pointer').attr(dtAttr);

		// WISE defaults
		var settings = {
			container: 'body',
			placement: 'top auto',
			viewport: {
				selector: 'body',
				padding: 5
			}
		};
		
		if(options !== null && typeof options === 'object'){
			// popover options have been sent in as a parameter, so merge with defaults
			$.extend(settings,options);
		}
		
		// initialize popover on target
		item.popover(settings);
	}
	
	if(target){
		processElement(target,options);
	} else {
		processElement($('.bs-popover'),options);
	}
};

/**
 * Get the step position given the step number
 * @param stepNumber a step number which is a string with numbers
 * separated by .'s. step numbers start count at 1. step positions
 * start count at 0 so a step number that is 1.1 would have a step
 * position of 0.0
 * e.g.
 * the step number for the first step in the project is 1.1
 * the step number for activity 3 step 10 would be 3.10
 * @returns the step position
 */
View.prototype.getStepPositionFromStepNumber = function(stepNumber) {
	var stepPosition = '';
	
	//split the step number by the .'s
	var stepSplits = stepNumber.split('.');
	
	//loop through each number that has been split
	for(var x=0; x<stepSplits.length; x++) {
		var stepSplit = stepSplits[x];
		
		//create an int from the number string
		var intStepSplit = parseInt(stepSplit);
		
		if(stepPosition != '') {
			//put a . between each number split
			stepPosition += '.';
		}
		
		/*
		 * decrement the value to convert it from a step number to a step position
		 * then append it to our ongoing step position string
		 */
		stepPosition += (intStepSplit - 1);
	}
	
	return stepPosition;
};

/**
 * Get the step number given the step position
 * @param stepPosition a step position which is a string with numbers
 * separated by .'s. step positions start count at 0. step numbers
 * start count at 1 so a step position that is 0.0 would have a step
 * number of 1.1
 * e.g.
 * the step position for the first step in the project is 0.0
 * the step position for activity 3 step 10 would be 2.9
 * @returns the step number
 */
View.prototype.getStepNumberFromStepPosition = function(stepPosition) {
	var stepNumber = '';
	
	//split the step position by the .'s
	var stepSplits = stepPosition.split('.');
	
	//loop through each number that has been split
	for(var x=0; x<stepSplits.length; x++) {
		var stepSplit = stepSplits[x];
		
		//create an int from the number string
		var intStepSplit = parseInt(stepSplit);
		
		if(stepNumber != '') {
			//put a . between each number split
			stepNumber += '.';
		}
		
		/*
		 * increment the value to convert it from a step position to a step number
		 * then append it to our ongoing step number string
		 */
		stepNumber += (intStepSplit + 1);
	}
	
	return stepNumber;
};

/**
 * If the given item is a non-whitespace only string, return true.
 */
View.prototype.utils.isNonWSString = function(item){
	if(typeof item == 'string' && /\S/.test(item)){
		return true;
	};
	
	return false;
};

/**
 * Capitalizes the first letter of the given string.
 * @returns string The new string
 */
View.prototype.utils.capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Generates and returns a random key of the given length if
 * specified. If length is not specified, returns a key 10
 * characters in length.
 */
View.prototype.utils.generateKey = function(length){
	this.CHARS = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r", "s","t",
	              "u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O",
	              "P","Q","R","S","T", "U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9"];
	
	/* set default length if not specified */
	if(!length){
		length = 10;
	}
	
	/* generate the key */
	var key = '';
	for(var a=0;a<length;a++){
		key += this.CHARS[Math.floor(Math.random() * (this.CHARS.length - 1))];
	};
	
	/* return the generated key */
	return key;
};

/**
 * Given an image url, calculates and returns the height and width of the image in pixels.
 * Modified from: http://stackoverflow.com/questions/106828/javascript-get-image-height/952185#952185
 * @param url String identifying the url of an image file
 * @returns dimensions Object specifying height and width of the image file (defaults to 0, 0)
 */
View.prototype.utils.getImageDimensions = function(url,callback){
	var dimensions = {
		"height": 0,
		"width": 0
	};
	
	function findHHandWW() {
		if(this.height){
			dimensions.height = this.height;
		}
		if(this.width){
			dimensions.width = this.width;
		}
		callback(dimensions);
	}
	
	function notFound(){
	    callback(null);
	}
	
	if(this.isNonWSString(url)){
	    var myImage = new Image();
	    myImage.name = url;
	    myImage.onload = findHHandWW;
	    myImage.onerror = notFound;
	    myImage.src = url;
	} else {
	    callback(null);
	}
};

/**
 * Used in Show My Work for draw steps
 */
function enlargeDraw(divId){
	//get the context path e.g. /wise
	var contextPath = view.getConfig().getConfigParam('contextPath');
	
	var newwindow = window.open(contextPath + "/vle/node/draw/svg-edit/svg-editor-grading.html?noDefaultExtensions=true");
	newwindow.divId = divId;
};

/**
 * Used in Show My Work for annotator steps
 */
function enlargeAnnotator(divId){
	//get the context path e.g. /wise
	var contextPath = view.getConfig().getConfigParam('contextPath');
	
	var newwindow = window.open(contextPath + "/vle/node/draw/svg-edit/annotator-grading.html?noDefaultExtensions=true");
	newwindow.divId = divId;
};

/**
 * Render all the student work for a given node. This is used
 * by gradeByStep.
 * @param node the node for the step we are displaying in the grade by step
 * @param dom where to display the summary view
 */
View.prototype.renderSummaryViewForNode = function(node, dom) {
	/*
	 * this new way of displaying student work in grading is only implemented
	 * for new node types at the moment. we will convert all the other steps to
	 * this way later.
	 */
	if(node.hasSummaryView()) {
		
		//get all the vleStates
		var vleStates = this.getVleStatesSortedByUserName();

		//get the node id
		var nodeId = node.id;
		
		
		var workgroupIdToWork = {};

		//loop through all the vleStates, each vleState is for a workgroup
		for(var x=0; x<vleStates.length; x++) {
			//get a vleState
			var vleState = vleStates[x];

			//get the workgroup id
			var workgroupId = vleState.dataId;

			//get the revisions
			var nodeVisitRevisions = vleState.getNodeVisitsWithWorkByNodeId(nodeId);

			var latestNodeVisit = null;

			if(nodeVisitRevisions.length > 0) {
				//get the latest work for the current workgroup
				latestNodeVisit = nodeVisitRevisions[nodeVisitRevisions.length - 1];
			}

			//check if the student submitted any work
			if(latestNodeVisit != null) {
				workgroupIdToWork[workgroupId] = latestNodeVisit.getLatestWork().response;
			}
		}
		node.renderSummaryView(workgroupIdToWork,dom);
	}
};

/**
 * Display graph (bar graph) for a particular step in step filter mode, like bar graph in MC node filter
 * 
 * @param nodeId ID of step that is filtered and should show the bar graph.
 * @param dom dom to render the summary into
 * @param workgroupIdToWork the id of the workgroup to work mapping
 * @param graphType bar|pie|barpie
 */
View.prototype.displayStepGraph = function(nodeId,dom,workgroupIdToWork,graphType) {

	function translateChoiceTextToColorHex(choiceText, choiceIndex) {
		if (choiceText == "red") {
			return "FF0000";
		} else if (choiceText == "green") {
			return "00FF00";
		} else if (choiceText == "blue") {
			return "0000FF";
		} else if (choiceText == "yellow") {
			return "FFFF00";
		} else if (choiceText == "black") {
			return "FFFFFF";
		} else if (choiceText == "purple") {
			return "7D26CD";
		} else if (choiceText == "orange") {
			return "FFA500";
		}
		return ["b01717","0323cb","896161","ecb0b0","fbd685","b4bec3","cf33e1","37c855","7D26CD","FFFFFF"][choiceIndex];  // return default colors based on choice index to avoid collision
	};
	
	var choiceToCount = {};
	if (workgroupIdToWork === null) {
		workgroupIdToWork = nodeIdToWork[nodeId];
	}
	var workgroupIdsInClass = this.userAndClassInfo.getWorkgroupIdsInClass();
	var mcChoices = [];
	var mcChoiceColors = [];  // display color for each choice.
	var node = this.getProject().getNodeById(nodeId);
	var mcContent = node.content.getContentJSON();
	/* add each choice object from the content to the choices array */
	for(var a=0;a<mcContent.assessmentItem.interaction.choices.length;a++){
		var mcChoiceText = mcContent.assessmentItem.interaction.choices[a].text;
		mcChoices.push(mcChoiceText);
		mcChoiceColors.push(translateChoiceTextToColorHex(mcChoiceText, a));
	}

	//loop through all the students in the class
	for (var i=0; i<workgroupIdsInClass.length; i++) {
		var workgroupIdInClass = workgroupIdsInClass[i];

		//get the choice the student answered
		var workByWorkgroup = null

		if(workgroupIdToWork[workgroupIdInClass] != null) {
			workByWorkgroup = workgroupIdToWork[workgroupIdInClass].response;
			
			if(workByWorkgroup != null) {
				if (choiceToCount[workByWorkgroup] == null) {
					choiceToCount[workByWorkgroup] = 0;
				}

				//increment the choice
				choiceToCount[workByWorkgroup] += 1;
			}
		}
	}
	var choicesCountArray = [];
	var maxChoiceCountSoFar = 0;  // keep track of maximum count here
	// now loop thru mcChoices and tally up 
	for (var k=0; k<mcChoices.length; k++) {
		var mcChoiceText = mcChoices[k];

		//get the total count for this choice
		var finalCount = choiceToCount[mcChoiceText];
		if (typeof finalCount == "undefined") {
			finalCount = 0;
		}

		/*
		 * add the count for this choice so that the graphing utility
		 * knows how many students chose this choice
		 */
		choicesCountArray.push(finalCount);

		if (finalCount > maxChoiceCountSoFar) {
			/*
			 * update the highest count for any choice to determine the
			 * max y value
			 */
			maxChoiceCountSoFar = finalCount;
		}
	}

	var xLabelStr = "|"+mcChoices.join("|");
	var xLabelStr2 = mcChoices.join("|");
	var colorStr = mcChoiceColors.join("|");
	var tallyStr = choicesCountArray.join(",");

	/*
	 * construct googlecharts url and set realTimeMonitorGraphImg src.
	 * e.g.
	 * http://chart.apis.google.com/chart?chxl=0:|Oscar|Monkey|Oski|Dodo&chxr=1,0,5&chxt=x,y&chbh=a&chs=300x225&cht=bvg&chco=A2C180&chd=t:1,5,0,0&chds=0,5&chp=0&chma=|2&chtt=Student+Responses
	 */

	var realTimeMonitorGraphImgSrc = "http://chart.apis.google.com/chart?chxl=0:"+xLabelStr+"&chxr=1,0,"+(maxChoiceCountSoFar+1)+"&chxt=x,y&chbh=a&chs=300x225&cht=bvg&chco=A2C180&chd=t:"+tallyStr+"&chds=0,"+(maxChoiceCountSoFar+1)+"&chco="+colorStr+"&chp=0&chma=|2&chtt=Student+Responses";
	var realTimeMonitorGraphImgSrc2 = "http://chart.apis.google.com/chart?cht=p&chs=250x100&chd=t:"+tallyStr+"&chl="+xLabelStr2+"&chco="+colorStr;
	//display the appropriated graph type(s) in the dom
	if (graphType == "bar") {
		$(dom).append('<img id="realTimeMonitorGraphImg" src="'+realTimeMonitorGraphImgSrc+'" width="300" height="225" alt="Student Responses"></img>');
	} else if (graphType == "pie") {
		$(dom).append('<img id="realTimeMonitorGraphImg2" src="'+realTimeMonitorGraphImgSrc2+'" width="500" height="200" alt="Student Responses"></img>');
	} else if (graphType == "barpie") {
		$(dom).append('<img id="realTimeMonitorGraphImg" src="'+realTimeMonitorGraphImgSrc+'" width="300" height="225" alt="Student Responses"></img>');
		$(dom).append('<img id="realTimeMonitorGraphImg2" src="'+realTimeMonitorGraphImgSrc2+'" width="500" height="200" alt="Student Responses"></img>');
	} else {
		$(dom).append('<img id="realTimeMonitorGraphImg" src="'+realTimeMonitorGraphImgSrc+'" width="300" height="225" alt="Student Responses"></img>');
		$(dom).append('<img id="realTimeMonitorGraphImg2" src="'+realTimeMonitorGraphImgSrc2+'" width="500" height="200" alt="Student Responses"></img>');
	}

	$(dom).show();
};


/**
 * Get all the node ids the student can visit. This is necessary in order
 * to properly calculate the project percentage completion while taking into
 * consideration branching. If the student has not reached a branch point,
 * we will accumulate all node ids from all the paths in that branch point
 * because at the moment they can potentially visit any of those steps
 * depending on what happens when they reach the branch point. If the student
 * has reached a branch point and has been assigned a path, we will only
 * accumulate the node ids for the path that they have been assigned to.
 * @param vleState all the work for a student
 * @return an array of node ids that the student can potentially visit
 */
View.prototype.getStepNodeIdsStudentCanVisit = function(vleState) {
	//get the project content
	var project = this.getProject();
	
	//get the project JSON object
	var projectJSON = project.projectJSON();
	
	//get the starting point of the project
	var startPoint = projectJSON.startPoint;
	
	//create the array that we will store the nodeIds in
	var nodeIds = [];
	
	//get the start node
	var startNode = project.getNodeById(startPoint);
	
	//get the leaf nodeIds
	nodeIds = this.getStepNodeIdsStudentCanVisitHelper(nodeIds, startNode, vleState);
	
	//return the populated array containing nodeIds
	return nodeIds;
};

/**
 * The recursive function that accumulates the node ids that
 * the student can potentially visit at the moment.
 * @param nodeIds the array of accumulated node ids that the student
 * can potentially visit
 * @param currentNode the current node we are on as we traverse the project
 * @param vleState all of the work for a student
 * @return the accumulated array of node ids that the student can 
 * potentially visit
 */
View.prototype.getStepNodeIdsStudentCanVisitHelper = function(nodeIds, currentNode, vleState) {
	if(currentNode.type == 'sequence') {
		//current node is a sequence
		
		//get the child nodes
		var childNodes = currentNode.children;
		
		if(childNodes.length > 0) {
			var firstChild = childNodes[0];
			if(firstChild != null && firstChild.type == 'BranchingNode') {
				/*
				 * the first step in the sequence is a branch node so we will check
				 * if the student has been assigned a path yet. If they have been 
				 * assigned to a path, we will only get the node ids in that path.
				 * If they have not been assigned to a path we will get all the
				 * node ids in all the paths.
				 */
				
				//get the work from the branch node
				var branchingNodeWork = vleState.getLatestNodeVisitByNodeId(firstChild.id);
				
				if(branchingNodeWork != null) {
					//the student has branched
					
					//get the latest node state for the branch node 
					var latestWork = branchingNodeWork.getLatestWork();
					
					if(latestWork != null) {
						//get the response
						var response = latestWork.response;
						
						if(response != null) {
							//get the chosen path id e.g. 'path1'
							var chosenPathId = response.chosenPathId;
							
							//get the step content for the branch node
							var branchingNodeContent = firstChild.getContent().getContentJSON();
							
							//get all the possible paths for this branch node
							var paths = branchingNodeContent.paths;
							
							var chosenPathSequenceId = '';
							
							if(paths != null) {
								//loop through all the paths
								for(var x=0; x<paths.length; x++) {
									//get a path
									var path = paths[x];
									
									if(path != null && path.identifier == chosenPathId) {
										//we have found the path that the student has been assigned to
										chosenPathSequenceId = path.sequenceRef;
									}
								}								
							}
							
							if(chosenPathSequenceId != '') {
								//get the sequence node for the path that the student has been assigned to
								var chosenPathSequenceNode = this.getProject().getNodeById(chosenPathSequenceId);
								
								//traverse the sequence for the child node ids
								this.getStepNodeIdsStudentCanVisitHelper(nodeIds, chosenPathSequenceNode, vleState);								
							}
						}
					}
				} else {
					/*
					 * the student has not been assigned to a path yet so we will just accumulate
					 * all the node ids in all the paths.
					 */ 
					
					//loop through all the child nodes
					for(var x=0; x<childNodes.length; x++) {
						//get a child node
						var childNode = childNodes[x];
						
						//recursively call this function with the child node
						nodeIds = this.getStepNodeIdsStudentCanVisitHelper(nodeIds, childNode, vleState);
					}
				}
				
			} else {
				/*
				 * the first step in the sequence is not a branch node so we will
				 * loop through the child nodes like normal
				 */ 
				
				//loop through all the child nodes
				for(var x=0; x<childNodes.length; x++) {
					//get a child node
					var childNode = childNodes[x];
					
					//recursively call this function with the child node
					nodeIds = this.getStepNodeIdsStudentCanVisitHelper(nodeIds, childNode, vleState);
				}
			}
		}
	} else {
		//current node is a leaf node
		
		//get the node type
		var nodeType = currentNode.type;
		
		/*
		 * if there are no node types to exclude or if the current node type
		 * is not in the : delimited string of node types to exclude or if
		 * the node type is FlashNode and grading is enabled, we will
		 * add the node id to the array
		 */
		if(currentNode.hasGradingView()) {
			nodeIds.push(currentNode.id);					
		}
	}
	
	//return the updated array of nodeIds
	return nodeIds;
};

/**
 * Check if the student has completed the node
 * @param nodeId the node id that needs to be checked for completion.
 * the node id may be an id of a step or activity. if it is an activity,
 * the student must have completed all the steps in the activity.
 * @return whether the student has completed the node
 */
View.prototype.isCompleted = function(nodeId) {
	var completed = false;
	
	//get the node
	var node = this.getProject().getNodeById(nodeId);
	
	if(node.type == 'sequence') {
		//node is an activity
		
		//get all the node ids in this activity
		var nodeIds = this.getProject().getNodeIdsInSequence(nodeId);
		
		//loop through all the node ids in the activity
		for(var x=0; x<nodeIds.length; x++) {
			//get a node id
			var tempNodeId = nodeIds[x];
			
			//get the node
			var node = this.getProject().getNodeById(tempNodeId);
			
			//get the latest work for the step
			var nodeVisits = this.getState().getNodeVisitsByNodeId(tempNodeId);
			
			//check if the work is completed
			if(nodeVisits == null || nodeVisits.length == 0 || !node.isCompleted(nodeVisits)) {
				return false;
			}
		}
		
		completed = true;
	} else {
		//node is a step

		//get the latest work for the step
		var nodeVisits = this.getState().getNodeVisitsByNodeId(nodeId);
		
		if(nodeVisits != null && nodeVisits.length != 0) {
			//there are node visits
			
			//check if the work is completed
			if(node.isCompleted(nodeVisits)) {
				completed = true;
			}
		}
	}
	
	return completed;
};

/**
 * Get the latest node state that has work from the node visits that
 * are provided
 * 
 * @param nodeVisits the node visits to look in
 * 
 * @return a node state with work or null if there are no node states
 */
View.prototype.getLatestNodeStateWithWorkFromNodeVisits = function(nodeVisits) {
	
	if(nodeVisits != null) {
		//loop through all the node visits
		for(var x=nodeVisits.length - 1; x>=0; x--) {
			//get a node visit
			var nodeVisit = nodeVisits[x];
			
			if(nodeVisit != null) {
				//get the latest work from the node visit
				var latestWork = nodeVisit.getLatestWork();
				
				if(latestWork != null && latestWork != "") {
					//return the latest node state
					return latestWork;					
				}
			}
		}	
	}
	
	return null;
};

/**
 * Get all the node states from the node visits
 * @param nodeVisits the node visits to get the node states from
 * @return a flat array containing all the node states
 */
View.prototype.getNodeStatesFromNodeVisits = function(nodeVisits) {
	var nodeStates = [];
	
	if(nodeVisits != null) {
		//loop through all the node visits
		for(var x=0; x<nodeVisits.length; x++) {
			//get a node visit
			var nodeVisit = nodeVisits[x];
			
			if(nodeVisit != null) {
				//get the node states
				var tempNodeStates = nodeVisit.nodeStates;
				
				//add the node states to our array of node states
				nodeStates = nodeStates.concat(tempNodeStates);
			}
		}
	}
	
	return nodeStates;
};

/**
 * Get the icon path given the node type and node class
 * 
 * @param nodeType the node type
 * @param nodeClass the node class
 * 
 * @return the icon path for the node type and node class or null
 * if none was found
 */
View.prototype.getIconPathFromNodeTypeNodeClass = function(nodeType, nodeClass) {
	var iconPath = null;
	
	//get all the node classes for this node type
	var nodeClassArray = this.nodeClasses[nodeType];
	
	if(nodeClassArray != null) {
		//loop through all the node classes for this node type
		for(var x=0; x<nodeClassArray.length; x++) {
			//get a node class object
			var tempNodeClassObj = nodeClassArray[x];
			
			//get the node class
			var tempNodeClass = tempNodeClassObj.nodeClass;
			
			if(nodeClass == tempNodeClass) {
				/*
				 * the node class matches the one we want so we will get the
				 * icon from it
				 */
				iconPath = tempNodeClassObj.icon;
				break;
			}
		}
	}
	
	return iconPath;
};

/**
 * Get the full node name
 * @param node id
 * @return the full node name depending on the navigation used
 * classic will return something like 'Step 1.1: Introduction'
 * starmap will return something like '#1: First Galaxy: Bronze'
 */
View.prototype.getFullNodeName = function(nodeId) {
	//get the full node name
	var fullNodeName = this.navigationPanel.getFullNodeName(nodeId);

	return fullNodeName;
};

/**
 * Get the sequence number of the highest sequence in the hierarchy
 * not counting the master sequence. This is a recursive function that
 * calls itself with the parent id.
 * @param nodeId the node id
 * @return the sequence number of the highest sequence in the hierarchy
 * not counting the master sequence.
 */
View.prototype.getHighestSequenceNumberInHierarchy = function(nodeId) {
	var sequenceNumber = '';
	
	//check if the 
	if(nodeId != 'master') {
		//get the node
		var node = this.getProject().getNodeById(nodeId);
		
		if(node != null) {
			var parent = node.parent;
			
			if(parent != null) {
				var parentId = parent.id;
				
				if(parentId == 'master') {
					/*
					 * the parent is the master so we have found the highest sequence
					 * in the hierarchy
					 */
					sequenceNumber = this.getProject().getVLEPositionById(nodeId);
				} else {
					/*
					 * the parent is not the master so we will recursively call this
					 * function with the parent id
					 */
					sequenceNumber = this.getHighestSequenceNumberInHierarchy(parentId);
				}
			}
		}		
	}
	
	return sequenceNumber;
};

/**
 * Checks whether a valid step term has been set for current project. If it has,
 * returns it; if not, returns the default term.
 * 
 */
View.prototype.getStepTerm = function(){
	var project = this.getProject(),
		stepTerm = project.getStepTerm();
	if(stepTerm && this.utils.isNonWSString(stepTerm)){
		return stepTerm;
	} else {
		return this.getI18NString('stepTerm');
	}
};

/**
 * Checks whether a valid plural step term has been set for current project. If it has,
 * returns it; if not, returns the default term.
 * 
 */
View.prototype.getStepTermPlural = function(){
	var project = this.getProject(),
		stepTerm = project.getStepTermPlural();
	if(stepTerm && this.utils.isNonWSString(stepTerm)){
		return stepTerm;
	} else {
		return this.getI18NString('stepTermPlural');
	}
};

/**
 * Checks whether a valid idea term has been set for current project. If it has,
 * returns it; if not, returns the default term.
 * 
 */
View.prototype.getIdeaTerm = function(){
	var project = this.getProject(),
		ideaTerm = view.getI18NString('idea');
	if(this.getProjectMetadata() && this.getProjectMetadata().tools && this.getProjectMetadata().tools.hasOwnProperty('ideaManagerSettings')){
		var imSettings = this.getProjectMetadata().tools.ideaManagerSettings;
		if(imSettings.version > 1){
			if(imSettings.hasOwnProperty('ideaTerm') && imSettings.ideaTerm.trim()){
				ideaTerm = imSettings.ideaTerm;
			}
		}
	}
	return ideaTerm;
};

/**
 * Checks whether a valid plural idea term has been set for current project. If it has,
 * returns it; if not, returns the default term.
 * 
 */
View.prototype.getIdeaTermPlural = function(){
	var project = this.getProject(),
		ideaTermPlural = view.getI18NString('idea_plural');
	if(this.getProjectMetadata() && this.getProjectMetadata().tools && this.getProjectMetadata().tools.hasOwnProperty('ideaManagerSettings')){
		var imSettings = this.getProjectMetadata().tools.ideaManagerSettings;
		if(imSettings.version > 1){
			if(imSettings.hasOwnProperty('ideaTermPlural') && imSettings.ideaTermPlural.trim()){
				ideaTermPlural = imSettings.ideaTermPlural;
			}
		}
	}
	return ideaTermPlural;
};

/**
 * Checks whether a valid activity term has been set for current project. If it has,
 * returns it; if not, returns the default term.
 * 
 */
View.prototype.getActivityTerm = function(){
	var project = this.getProject(),
		activityTerm = project.getActivityTerm();
	if(activityTerm && this.utils.isNonWSString(activityTerm)){
		return activityTerm;
	} else {
		return this.getI18NString('activityTerm');
	}
};

/**
 * Checks whether a valid plural activity term has been set for current project. If it has,
 * returns it; if not, returns the default term.
 * 
 */
View.prototype.getActivityTermPlural = function(){
	var project = this.getProject(),
		activityTerm = project.getActivityTermPlural();
	if(activityTerm && this.utils.isNonWSString(activityTerm)){
		return activityTerm;
	} else {
		return this.getI18NString('activityTermPlural');
	}
};

/**
 * Get the number of ideas in the student idea basket
 * @return the number of ideas in the student idea basket
 */
View.prototype.getIdeaBasketIdeaCount = function() {
	var ideaBasketIdeaCount = null;

	if(this.ideaBasket != null) {
		//get the ideas
		var ideas = this.ideaBasket.ideas;
		
		if(ideas != null) {
			//get the number of ideas in the student basket
			ideaBasketIdeaCount = ideas.length;
		}
	}
	
	return ideaBasketIdeaCount;
};

/**
 * Format the timestamp into a user friendly string
 * @param milliseconds the timestamp in milliseconds
 * @return a user friendly time string e.g.
 * Wed, Apr 9, 2014 3:34 PM
 */
View.prototype.formatTimestamp = function(milliseconds) {
	var formattedTimestamp = '';
	
	if(milliseconds != null) {
		//get the date object
		var date = new Date(milliseconds);
		
		//get the date values
		var dayNumber = date.getDay();
		var monthNumber = date.getMonth();
		var dayOfMonth = date.getDate();
		var year = date.getFullYear();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		
		//get the day of the week e.g. 'Sun'
		var dayOfWeek = this.getDayOfWeekFromInteger(dayNumber);
		
		//get the month e.g. 'April'
		var month = this.getMonthFromInteger(monthNumber);
		
		var suffix = '';
		
		//get am or pm
		if(hours < 12) {
			suffix = 'AM';
		} else {
			suffix = 'PM';
		}
		
		//remove the 24 hour if necessary
		if(hours > 12) {
			hours = hours - 12;
		}
		
		//add a leading 0 if necessary
		if(minutes < 10) {
			minutes = '0' + minutes;
		}
		
		//create the formatted string
		formattedTimestamp = dayOfWeek + ', ' + month + ' ' + dayOfMonth + ', ' + year + ' ' + hours + ':' + minutes + ' ' + suffix;
	}
	
	return formattedTimestamp;
}

/**
 * Get the day of the week name from the integer
 * @param dayNumber the day of the week as an integer with 0 being Sunday
 * and 6 being Saturday
 * @return the 3 letter abbreviation for the day of the week
 */
View.prototype.getDayOfWeekFromInteger = function(dayNumber) {
	var day = '';
	
	if(dayNumber == 0) {
		day = 'Sun';
	} else if(dayNumber == 1) {
		day = 'Mon';
	} else if(dayNumber == 2) {
		day = 'Tue';
	} else if(dayNumber == 3) {
		day = 'Wed';
	} else if(dayNumber == 4) {
		day = 'Thu';
	} else if(dayNumber == 5) {
		day = 'Fri';
	} else if(dayNumber == 6) {
		day = 'Sat';
	}
	
	return day;
};

/**
 * Get the month name from the integer
 * @param monthNumber the month as an integer with 0 being January
 * and 11 being December
 * @return the 3 letter abbreviation for the month
 */
View.prototype.getMonthFromInteger = function(monthNumber) {
	var month = '';
	
	if(monthNumber == 0) {
		month = 'Jan';
	} else if(monthNumber == 1) {
		month = 'Feb';
	} else if(monthNumber == 2) {
		month = 'Mar';
	} else if(monthNumber == 3) {
		month = 'Apr';
	} else if(monthNumber == 4) {
		month = 'May';
	} else if(monthNumber == 5) {
		month = 'Jun';
	} else if(monthNumber == 6) {
		month = 'Jul';
	} else if(monthNumber == 7) {
		month = 'Aug';
	} else if(monthNumber == 8) {
		month = 'Sep';
	} else if(monthNumber == 9) {
		month = 'Oct';
	} else if(monthNumber == 10) {
		month = 'Nov';
	} else if(monthNumber == 11) {
		month = 'Dec';
	}
	
	return month;
};

/**
 * Gets rich text content from tinymce rich text editor area for specified element ID
 * 
 * Checks if tinymce editor exists on element and uses it to get content or gets value
 * from input/textarea normally.
 * 
 * @param elemId String DOM element id
 */
View.prototype.getRichTextContent = function(elemId) {
	var content = '',
		editor = tinymce.get(elemId);
	if(editor){
		content = editor.getContent();
		// strip out project folder path from asset/ src urls
		var projectFolderPath = this.getProjectFolderPath().replace(window.location.origin, '');
		projectFolderPath = projectFolderPath.replace(/\//g, '\/');
		var re = new RegExp("(src|href|xlink:href|data\-.+)=(\"|\')" + projectFolderPath + "(assets\/)","gi");
		content = content.replace(re, "$1=$2$3");
	} else {
		content = $('#' + elemId).val();
	}
	
	return content;
};


/**
 * Load the external script for the given step object if it has one
 * @param stepObject the step object that performs the
 * processing for a step. these are usually created in the
 * html file of a step type.
 * e.g.
 * for an open response step we would be passing in
 * or = new OPENRESPONSE();
 */
View.prototype.loadExternalScript = function(stepObject) {
	if(stepObject != null) {
		//get the step content
		var content = stepObject.content;
		
		if(content != null) {
			//get the external script path from the content if it exists
			var externalScript = content.externalScript;

			if(externalScript != null) {
				/*
				 * save a reference to this step object so we can access it in the
				 * getExternalScriptSuccess() function
				 */ 
				this.stepObject = stepObject;
				
				//this step has an external script so we will load it
				$.getScript(externalScript, this.getExternalScriptSuccess);
			}
		}
	}
};


/**
 * Called when we successfully load the external script
 * @param script the text of the script
 * @param textStatus the text 'success'
 * @param jqXHR the jquery xhr object
 */
View.prototype.getExternalScriptSuccess = function(script, textStatus, jqXHR) {
	/*
	 * get the step object that was temporarily stored in the view
	 * just so we could access it in this function
	 */
	var stepObject = view.stepObject;
	
	/*
	 * check if we have registered this external script before
	 * because we want to make sure we only register it once
	 */
	if(!stepObject.node.registeredListener) {
		/*
		 * we have not registered this external script before so we will 
		 * register it now by calling the registerListener() function in 
		 * the external script. the functions in the external script are 
		 * accessible globally.
		 */
		registerListener(stepObject);
		stepObject.node.registeredListener = true;
	}
	
	/*
	 * clear the step object from the view because we set it
	 * so we could access it in this function. after this it's no
	 * longer needed and shouldn't be left hanging around since
	 * this field may be re-used when another step loads an
	 * external script.
	 */ 
	view.stepObject = null;
};

/**
 * Check if any of the node states in the node node visits is completed
 * @param nodeVisits an array of node visits
 * @return whether any of the node states in the node visits is completed
 */
View.prototype.nodeStateInNodeVisitsIsCompleted = function(nodeVisits) {
	
	if(nodeVisits != null) {
		//loop through all the node visits
		for(var x=0; x<nodeVisits.length; x++) {
			//get a node visit
			var nodeVisit = nodeVisits[x];
			
			if(nodeVisit != null) {
				//get the node states
				var nodeStates = nodeVisit.nodeStates;
				
				if(nodeStates != null) {
					//loop through all the node states
					for(var y=0; y<nodeStates.length; y++) {
						//get a node state
						var nodeState = nodeStates[y];
						
						if(nodeState != null) {
							//check if the node state is completed by looking at the value of the isCompleted field
							if(nodeState.isCompleted) {
								return true;
							}
						}
					}
				}
			}
		}
	}
	
	return false;
}

// preserve carriage return values when retrieving value from textareas in jQuery (see http://api.jquery.com/val/)
$.valHooks.textarea = {
	get: function( elem ) {
		return elem.value.replace( /\r?\n/g, "\r\n" );
	}
};


/**
 * Replaces WISE variables in the string with WISE values.
 * 
 * Ex: "Hello {{studentNames}}! You got a {{autoGradedScore}}" => "Hello Hiroki & Geoff! You got a 3!"
 * Ex: "Now {{link|1.2|go to the finger bowl activity}} and try again! => "Now <a onclick="view.goToStep('1.2')">go to the finger bowl activity</a> and try again!"
 */
View.prototype.replaceWISEVariables = function(text) {
	if (text != null) {
		if (text.indexOf("{{studentFirstNames}}") >= 0) {
			if (this.getUserAndClassInfo && this.getUserAndClassInfo() != null) {
				var workgroupId = this.getUserAndClassInfo().getWorkgroupId();
				var studentFirstNamesArray = this.getUserAndClassInfo().getStudentFirstNamesByWorkgroupId(workgroupId);
				var studentFirstNames = studentFirstNamesArray.join(' & ');
				text = text.replace(/{{studentFirstNames}}/g, studentFirstNames);
			}
		}
		if (text.indexOf("{{firstNameOfFirstStudent}}")) {
			// display the first name of the first student
			if (this.getUserAndClassInfo && this.getUserAndClassInfo() != null) {
				var workgroupId = this.getUserAndClassInfo().getWorkgroupId();
				var firstName = this.getUserAndClassInfo().getFirstNameOfFirstStudentByWorkgroupId(workgroupId);
				text = text.replace(/{{firstNameOfFirstStudent}}/g, firstName);
			}
		}
		if (text.indexOf("{{firstNameOfSecondStudent}}")) {
			// display the first name of the second student
			if (this.getUserAndClassInfo && this.getUserAndClassInfo() != null) {
				var workgroupId = this.getUserAndClassInfo().getWorkgroupId();
				var firstName = this.getUserAndClassInfo().getFirstNameOfSecondStudentByWorkgroupId(workgroupId);
				text = text.replace(/{{firstNameOfSecondStudent}}/g, firstName);
			}
		}
		if (text.indexOf("{{firstNameOfThirdStudent}}")) {
			// display the first name of the third student
			if (this.getUserAndClassInfo && this.getUserAndClassInfo() != null) {
				var workgroupId = this.getUserAndClassInfo().getWorkgroupId();
				var firstName = this.getUserAndClassInfo().getFirstNameOfThirdStudentByWorkgroupId(workgroupId);
				text = text.replace(/{{firstNameOfThirdStudent}}/g, firstName);
			}
		}
		if (text.indexOf("{{link") >= 0) {
			text = text.replace(/{{link\|([^}}]*)\|([^}}]*)}}/g, "<a onclick=\\\"view.goToStep('$1')\\\">$2</a>")
		}
	}
	return text;
};

/**
 * Get the latest object in the annotation value array that contains a specific field
 * 
 * The value field of the annotation should be an array that looks something
 * like this
 * "value": [
 *    {
 *       "maxAutoScore": 4,
 *       "concepts": "",
 *       "autoScore": 0,
 *       "nodeStateId": 1412029344000,
 *       "autoFeedback": "bad 0"
 *    },
 *    {
 *       "maxAutoScore": 4,
 *       "concepts": "1,2,3,4",
 *       "autoScore": 4,
 *       "nodeStateId": 1412029354000,
 *       "autoFeedback": "good 4"
 *    }
 * ]
 * we will return the latest object in the array that contains the field we want like this
 *    {
 *       "maxAutoScore": 4,
 *       "concepts": "1,2,3,4",
 *       "autoScore": 4,
 *       "nodeStateId": 1412029354000,
 *       "autoFeedback": "good 4"
 *    }
 * 
 * @param annotation the annotation
 * @param field a field in the annotation value object
 * @return the latest object in the annotation value array that has the field
 */
View.prototype.getLatestAnnotationValueFromValueArray = function(annotation, field) {
	var result = null;
	
	if(annotation != null && field != null) {
		//get the value
		var value = annotation.value;
		
		if(value != null) {
			//check that the value is an array
			if(Array.isArray(value)) {
				//loop through the values from newest to oldest
				for(var x=value.length - 1; x>=0; x--) {
					//get a value object
					var tempValue = value[x];
					
					if(tempValue != null) {
						//check if the value object contains a non-null value for the field
						if(tempValue[field] != null) {
							/*
							 * we have found a value object that has a non-null value for 
							 * the field so we will return that value object
							 */
							result = tempValue;
							break;
						}
					}
				}
			}		
		}
	}
	
	return result;
};

View.prototype.getLatestMySystem2Score = function(nodeVisit) {
    var score = null;
    
    if (nodeVisit != null) {
        var nodeStates = nodeVisit.nodeStates;
        
        if (nodeStates != null) {
            for (var ns = nodeStates.length - 1; ns >= 0; ns--) {
                var nodeState = nodeStates[ns];
                
                if (nodeState != null) {
                    var response = nodeState.response;
                    
                    if (response != null) {
                        var responseJSON = JSON.parse(response);
                        
                        if (responseJSON != null) {
                            var rubricScore = responseJSON['MySystem.RubricScore'];
                            
                            if (rubricScore != null) {
                                var lastScoreId = rubricScore['LAST_SCORE_ID'];
                                
                                if (lastScoreId != null) {
                                    score = lastScoreId.score;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    return score;
};

/**
 * Check if the logged in user is a shared teacher with read privilege
 */
View.prototype.isSignedInUserSharedTeacherWithReadPrivilege = function() {
    return this.isSignedInUserSharedTeacherWithRole('read');
};

/**
 * Check if the logged in user is a shared teacher with grading privilege
 */
View.prototype.isSignedInUserSharedTeacherWithGradingPrivilege = function() {
    return this.isSignedInUserSharedTeacherWithRole('grade');
};

/**
 * Check if the logged in user is a shared teacher with a specific role
 * @param role the permission role ('read' or 'grade')
 */
View.prototype.isSignedInUserSharedTeacherWithRole = function(role) {
    var result = false;

    //get the user and class info
    var userAndClassInfo = this.getUserAndClassInfo();

    if(userAndClassInfo != null) {
        //get the logged in user name and workgroup id
        var userLoginName = userAndClassInfo.getUserLoginName();
        var workgroupId = userAndClassInfo.getWorkgroupId();

        //get all the shared teacher infos
        var sharedTeacherUserInfos = userAndClassInfo.getSharedTeacherUserInfos();

        if(sharedTeacherUserInfos != null) {
            /*
             * loop through all the shared teacher infos to see if the logged
             * in user is a shared teacher
             */
            for(var x=0; x<sharedTeacherUserInfos.length; x++) {
                //get a shared teacher info
                var sharedTeacherUserInfo = sharedTeacherUserInfos[x];

                if(sharedTeacherUserInfo != null) {
                    //get the workgroup id for the shared teacher
                    var tempWorkgroupId = sharedTeacherUserInfo.workgroupId;

                    if(tempWorkgroupId == workgroupId) {
                        //the logged in user is a shared teacher

                        if(sharedTeacherUserInfo.role == role) {
                            //the shared teacher has the specified role
                            result = true;
                        }
                    }
                }
            }
        }
    }

    return result;
};

/**
 * If the string contains a comma, we will escape double quotes and 
 * wrap the string in quotes for CSV
 * @param str the string that will be a cell in the CSV
 * @returns a string that represents a cell in the CSV
 */
View.prototype.wrapInQuotesForCSVIfNecessary = function(str) {
	
	var fixedStr = str;
	
	if (typeof str == 'string' && str.indexOf(',') != -1) {
		// the string contains a comma so we need to wrap the string in qoutes
		
		// regex to match double quotes
		var doubleQuoteRegEx = new RegExp(/"/, 'g');
			
		// escape all double quotes with a double quote
		str = str.replace(doubleQuoteRegEx, '""');
		
		// wrap the value in quotes
		fixedStr = '"' + str + '"';
	}
	
	return fixedStr;
};

/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/view_utils.js');
};