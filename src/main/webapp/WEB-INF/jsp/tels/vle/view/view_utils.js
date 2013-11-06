/**
 * The util object for this view
 * 
 * @author patrick lawler
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
	var projectMetaDataUrl = this.getConfig().getConfigParam('projectMetaDataUrl');
	
	if(projectMetaDataUrl && projectMetaDataUrl != ""){
		var projectMetaDataCallbackSuccess = function(text, xml, args) {
			var thisView = args[0];
			
			if(text != null && text != "") {
				//thisView.processMaxScoresJSON(text);
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
		
		var projectMetaDataUrlParams = {
				command:"getProjectMetaData",
				projectId:this.getConfig().getConfigParam("projectId")
		};
		this.connectionManager.request('GET', 1, projectMetaDataUrl, projectMetaDataUrlParams, projectMetaDataCallbackSuccess, [this], projectMetaDataCallbackFailure);
	};
};

/**
 * Get the run extras such as the max scores
 * @return
 */
View.prototype.retrieveRunExtras = function() {
	//get the url to retrieve the run extras
	var retrieveRunExtrasUrl = this.getConfig().getConfigParam('getRunExtrasUrl');
	
	var runExtrasCallbackSuccess = function(text, xml, args) {
		var thisView = args[0];
		
		if(text != null && text != "") {
			thisView.processMaxScoresJSON(text);
		}

		thisView.runExtrasRetrieved = true;
		eventManager.fire("retrieveRunExtrasCompleted");
	};
	
	var runExtrasCallbackFailure = function(text, args) {
		var thisView = args[0];
		thisView.runExtrasRetrieved = true;
		eventManager.fire("retrieveRunExtrasCompleted");
	};
	
	this.connectionManager.request('GET', 1, retrieveRunExtrasUrl, null, runExtrasCallbackSuccess, [this], runExtrasCallbackFailure);
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
 * Inserts the applet param into the the given content
 * @param content the content in which to insert the param
 * @param name the name of the param
 * @param value the value of the param
 */
View.prototype.utils.insertAppletParam = function(content, name, value){
	/* get the content string */
	var str = content.getContentString();
	
	/* create the param string */
	var paramTag = '<param name="' + name + '" value="' + value + '">';
	
	/* check if the param already exists in the content */
	if(str.indexOf(paramTag) == -1) {
		/* add the param right before the closing applet tag */
		content.setContent(str.replace("</applet>", paramTag + "\n</applet>"));
	};
};


/**
 * Extracts the file servlet information from the given url and returns the result.
 */
View.prototype.utils.getContentPath = function(baseUrl, url){
	return url.substring(url.indexOf(baseUrl) + baseUrl.length, url.length);
};

/**
 * Returns the value of the currently selected option in a select element
 * with the given id.
 */
View.prototype.utils.getSelectedValueById = function(id){
	var select = document.getElementById(id);
	if(select){
		var opt = select.options[select.selectedIndex];
		if(opt){
			return opt.value;
		};
	};
	
	return '';
};

/**
 * Attempts to set the correct selected option in a select element
 * with the given id that has the given value.
 */
View.prototype.utils.setSelectedValueById = function(id, value){
	var select = document.getElementById(id);
	if(select && value){
		for(var a=0;a<select.options.length;a++){
			if(select.options[a].value == value){
				select.selectedIndex = a;
			};
		};
	};
};

/**
 * If the given string is undefined, null or false, returns an empty
 * string, otherwise, returns the given string.
 */
View.prototype.utils.resolveNullToEmptyString = function(str){
	if(str == null || str == 'null'){
		return '';
	};
	
	return str;
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
 * Get the latest node state for the given node
 * @param nodeId
 * @return a node state
 */
View.prototype.getLatestStateForNode = function(nodeId) {
	var nodeState = null;
	
	if(this.getState() != null) {
		for (var i=this.getState().visitedNodes.length - 1; i>=0 ; i--) {
			var nodeVisit = this.getState().visitedNodes[i];
			if (nodeVisit.getNodeId() == nodeId) {
				for (var j=nodeVisit.nodeStates.length - 1; j>=0; j--) {
					nodeState = nodeVisit.nodeStates[j];
					return nodeState;
				}
			}
		}	
	}
	
	return nodeState;
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
View.prototype.saveMaxScore = function(runId, nodeId) {
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
				
				//redirect the user to the login page
				window.top.location = "/webapp/j_spring_security_logout";
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
	
	//get the new max score the teacher has entered for this nodeId
	var maxScoreValue = document.getElementById("maxScore_" + nodeId).value;
	
	//parse the value from the text box to see if it is a valid integer
	var maxScoreValueInt = parseInt(maxScoreValue);
	
	//check that the value entered is a number greater than or equal to 0
	if(isNaN(maxScoreValueInt) || maxScoreValueInt < 0) {
		//the value is invalid so we will notify the teacher
		alert("Error: invalid Max Score value, please enter a value 0 or greater");
		
		//set the value back to the previous value
		document.getElementById("maxScore_" + nodeId).value = this.getMaxScoreValueByNodeId(nodeId);
		
		return;
	}
	
	//create the args used to update the max score on the server
	var postMaxScoreParams = {command: "postMaxScore", projectId: this.getProjectId(), nodeId: nodeId, maxScoreValue: maxScoreValue};
	
	//send the new max score data back to the server
	this.connectionManager.request('POST', 1, this.getConfig().getConfigParam('projectMetaDataUrl'), postMaxScoreParams, postMaxScoreCallback, [this, nodeId], postMaxScoreCallbackFail);
};

/**
 * Revert the max score value for a specific step
 * @param nodeId the id of the node that we are reverting the max score value for
 */
View.prototype.revertMaxScore = function(nodeId) {
	//display a message telling the teacher the max score value will be reverted back
	alert("Failed to save max score, the max score will be reverted back to its previous value.");
	
	//set the value back to the previous value
	document.getElementById("maxScore_" + nodeId).value = this.getMaxScoreValueByNodeId(nodeId);
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
	alert("You have been inactive for too long and have been logged out. Please log back in to continue.");
	parent.window.location = "/webapp/j_spring_security_logout";
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
 * Determines whether a nodeType knows how to render its grading view
 * @param nodeType the type of the node
 * @return whether this node type implements renderGradingView()
 */
/*
View.prototype.isSelfRenderingGradingViewNodeType = function(nodeType) {
	var isSelfRenderingGradingView = false;
	
	if(nodeType != 'HtmlNode' && 
			nodeType != 'BrainstormNode' && 
			nodeType != 'FillinNode' && 
			nodeType != 'NoteNode' && 
			nodeType != 'JournalEntryNode' && 
			nodeType != 'OutsideUrlNode' && 
			nodeType != 'OpenResponseNode' && 
			nodeType != 'BlueJNode' && 
			nodeType != 'DrawNode' && 
			nodeType != 'DataGraphNode' && 
			nodeType != 'MySystemNode' && 
			nodeType != 'SVGDrawNode' && 
			nodeType != 'MWNode' &&  
			nodeType != 'BranchNode') {
		isSelfRenderingGradingView = true;
	}
	
	return isSelfRenderingGradingView;
};
*/

/**
 * Get the max possible score for the project
 * @return the max possible score for the project
 */
View.prototype.getMaxScoreForProject = function() {
	var maxScoreForProject = 0;
	
	//get all the node ids in the project
	var nodeIdsInProject = this.getProject().getNodeIds();
	
	if(this.maxScores != null) {
		//get the max scores sum for all the node ids 
		maxScoreForProject = this.maxScores.getMaxScoresSum(nodeIdsInProject);
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
 */
View.prototype.assetUploaded = function(target,view){
	var htmlFrame = target;
	var frame = window.frames[target.id];
	
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
		
		/* set source to blank in case of page reload */
		htmlFrame.src = 'about:blank';
		
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
	return extensions.indexOf(this.getExtension(name).toLowerCase()) != -1;
};

/**
 * Initialize XMPP service
 * @return
 */
View.prototype.startXMPP = function() {
	this.xmpp = WISE.init(this);
};


View.prototype.checkXMPPEnabled = function() {
	
	this.isXMPPEnabled = false;
	if (this.config.getConfigParam("isXMPPEnabled") != null && this.config.getConfigParam("isXMPPEnabled")) {
		var runInfo = this.config.getConfigParam("runInfo");
		
		if(runInfo != null && runInfo != "") {
			var runInfoJSON = JSON.parse(runInfo);
			
			if(runInfoJSON != null) {
				if(runInfoJSON.isXMPPEnabled != null) {
					this.isXMPPEnabled = runInfoJSON.isXMPPEnabled;
				}
			}
		}
	}
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
 * Make a CRater verify request for the given item id
 * @param itemId the item id to verify
 * @param cRaterItemType the type of CRater {CRATER,HENRY} to verify
 */
View.prototype.makeCRaterVerifyRequest = function(itemId,cRaterItemType) {
	//get the url to our servlet that will make the request to the CRater server for us
	var cRaterRequestUrl = this.config.getConfigParam('cRaterRequestUrl');
	
	var requestArgs = {
		cRaterRequestType:'verify',
		itemId:itemId,
		cRaterItemType:cRaterItemType
	};
	
	var responseText = this.connectionManager.request('GET', 1, cRaterRequestUrl, requestArgs, this.makeCRaterVerifyRequestCallback, {vle:this}, this.makeCRaterVerifyRequestCallbackFail, true);
};

/**
 * The success callback function when making a CRater verify request
 * @param responseText
 * @param responseXML
 * @param args
 * @returns
 */
View.prototype.makeCRaterVerifyRequestCallback = function(responseText, responseXML, args) {
	var vle = args.vle;
	
	//remember the response text in a variable in the vle so we can access it later
	vle.cRaterResponseText = responseText;
};

/**
 * The fail callback function when making a CRater verify request
 * @param responseText
 * @param args
 */
View.prototype.makeCRaterVerifyRequestCallbackFail = function(responseText, args) {
	alert('Error: CRater verify request failed');
};

/**
 * Check the xml response text to see if the item id is valid
 * @param responseText the xml response text
 * @returns whether the crater item is valid or not
 */
View.prototype.checkCRaterVerifyResponse = function(responseText) {
	var isValid = false;
	
	/*
	 * find the text that contains the avail field
	 * e.g. 
	 * <item id="Photo_Sun" avail="Y">
	 */
	var availMatch = responseText.match(/avail="(\w*)"/);
	
	
	if(availMatch != null && availMatch.length > 1) {
		/*
		 * check the match
		 * e.g.
		 * availMatch[0] = avail="Y"
		 * availMatch[1] = Y
		 */
		var availValue = availMatch[1];
		
		if(availValue != null && availValue == 'Y') {
			//item id is valid
			isValid = true;
		}
	}
	
	return isValid;
};


/**
 * Get the scoring rules from the crater item verification response xml
 * @param xml the string with the xml response text from the verify request 
 */
View.prototype.getCRaterScoringRulesFromXML = function(xml) {
	var cRaterScoringRules = [];
	var zeroScoreScoringRule = false;
	
	/*
	 * find all the scoring rule values
	 * e.g.
	 * <scoring_rules>
	 * <scoring_rule concepts="1-4" nummatches="4" rank="1" score="4"/>
	 * <scoring_rule concepts="1" nummatches="1" rank="2" score="3"/>
	 * <scoring_rule concepts="2-4" nummatches="3" rank="3" score="3"/>
	 * <scoring_rule concepts="2-4" nummatches="1" rank="4" score="2"/>
	 * <scoring_rule concepts="5" nummatches="1" rank="5" score="1"/>
	 * </scoring_rules>
	 */
	var scoringRules = xml.match(/scoring_rule.*"/g);
	
	if(scoringRules != null) {
		//loop through all the scoring rules
		for(var x=0; x<scoringRules.length; x++) {
			
			var currScoreRule = {};
			
			//get a concepts rule e.g. concepts="1-4"
			var scoringRule = scoringRules[x];
						
			//create a match to extract the concept value
			var conceptsMatch = scoringRule.match(/concepts="(.*?)"/);
			
			if(conceptsMatch != null && conceptsMatch.length > 1) {
				/*
				 * get the concepts
				 * conceptsMatch[0] = concepts="1-4"
				 * conceptsMatch[1] = 1-4
				 */
				var concepts = conceptsMatch[1];
				
				currScoreRule.concepts = concepts;
			}

			// create a match to extract the nummatches value
			var nummatchesMatch = scoringRule.match(/nummatches="(\d*)"/);
			
			if(nummatchesMatch != null && nummatchesMatch.length > 1) {
				/*
				 * get the nummatches
				 * nummatchesMatch[0] = nummatches="1"
				 * nummatchesMatch[1] = 1
				 */
				var nummatches = nummatchesMatch[1];
				
				currScoreRule.numMatches = nummatches;
			}
			
			
			//create a match to extract the rank value
			var rankMatch = scoringRule.match(/rank="(\d*)"/);
			
			if(rankMatch != null && rankMatch.length > 1) {
				/*
				 * get the rank
				 * rankMatch[0] = rank="1"
				 * rankMatch[1] = 1
				 */
				var rank = rankMatch[1];
				
				currScoreRule.rank = rank;
			}

			//create a match to extract the score value
			var scoreMatch = scoringRule.match(/score="(\d*)"/);
			
			if(scoreMatch != null && scoreMatch.length > 1) {
				/*
				 * get the score
				 * scoreMatch[0] = score="1"
				 * scoreMatch[1] = 1
				 */
				var score = scoreMatch[1];
				
				currScoreRule.score = score;
				
				if(score == 0) {
					//we have found a zero score scoring rule
					zeroScoreScoringRule = true;
				}
			}
			
			//set an array as the feedback. put an empty string into the array for the feedback. 
			currScoreRule.feedback = [this.createCRaterFeedbackTextObject()];
			
			//set the student action
			currScoreRule.studentAction = 'revise';
			
			cRaterScoringRules.push(currScoreRule);
		}
		
		if(!zeroScoreScoringRule) {
			//we did not find a zero score scoring rule so we will add one
			
			//create the scoring rule
			var zeroScoreRule = {};
			zeroScoreRule.concepts = "";
			zeroScoreRule.numMatches = "";
			zeroScoreRule.rank = "";
			zeroScoreRule.score = "0";
			zeroScoreRule.feedback = [this.createCRaterFeedbackTextObject()];
			zeroScoreRule.studentAction = "revise";
			
			//add the scoring rule to the array of scoring rules
			cRaterScoringRules.push(zeroScoreRule);
		}
	}
	
	return cRaterScoringRules;
};

/**
 * Create an object that we will put into the feedback array.
 * This object will contain the fields feedbackText and feedbackId.
 * @param feedbackText an optional argument that we will set the
 * feedback text to
 * @returns an object containing the fields feedbackText and feedbackid
 */
View.prototype.createCRaterFeedbackTextObject = function(feedbackText) {
	//generate a random alphanumeric value e.g. 7fEEeHE73R
	var feedbackId = this.utils.generateKey();
	
	if(feedbackText == null) {
		//set the default feedbackText value
		feedbackText = "";
	}
	
	//create the feedback object
	var feedbackObject = {
		feedbackText:feedbackText,
		feedbackId:feedbackId
	};
	
	return feedbackObject;
};

/**
 * Get the max score from the xml
 * @param xml the string with the xml response text from the verify request 
 */
View.prototype.getCRaterMaxScoreFromXML = function(xml) {
	var maxScore = null;
	
	/*
	 * find all the scoring rule values
	 * e.g.
	 * <scoring_rules>
	 * <scoring_rule concepts="1-4" nummatches="4" rank="1" score="4"/>
	 * <scoring_rule concepts="1" nummatches="1" rank="2" score="3"/>
	 * <scoring_rule concepts="2-4" nummatches="3" rank="3" score="3"/>
	 * <scoring_rule concepts="2-4" nummatches="1" rank="4" score="2"/>
	 * <scoring_rule concepts="5" nummatches="1" rank="5" score="1"/>
	 * </scoring_rules>
	 */
	var scoringRules = xml.match(/score="\d*"/g);
	
	if(scoringRules != null) {
		//loop through all the scoring rules
		for(var x=0; x<scoringRules.length; x++) {
			//get a scoring rule e.g. score="4"
			var scoreRule = scoringRules[x];
			
			//create a match to extract the score value
			var scoreMatch = scoreRule.match(/score="(\d*)"/);
			
			if(scoreMatch != null && scoreMatch.length > 1) {
				/*
				 * get the score
				 * scoreMatch[0] = score="4"
				 * scoreMatch[1] = 4
				 */
				var score = parseInt(scoreMatch[1]);
				
				//check if we need to update the max score value
				if(score > maxScore) {
					maxScore = score;
				}
			}
		}		
	}
	
	return maxScore;
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
	this.connectionManager.request('GET', 3, this.getConfig().getConfigParam('getAnnotationsUrl'), 
					annotationsUrlParams, processGetAnnotationResponse, [this], fHArgs, synchronous);

	// lookup the annotationKey in the runAnnotations obj. runAnnotationsObj should be set by this point.
	return this.runAnnotations;
};

/*
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
	
	var myImage = new Image();
	myImage.name = url;
	myImage.onload = findHHandWW;
	myImage.src = url;
	
	//return dimensions;
};

/**
 * Blocks out the UI and displays a message
 * @param message the message to display 
 */
View.prototype.blockUI = function(message) {
	$.blockUI({ message: message, css: {padding:15}, overlayCSS: {opacity:1.0} });
};

/**
 * Used in Show My Work for draw steps
 */
function enlargeDraw(divId){
	var newwindow = window.open("/vlewrapper/vle/node/draw/svg-edit/svg-editor-grading.html");
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

/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/view_utils.js');
};
