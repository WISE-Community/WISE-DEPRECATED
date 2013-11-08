



/**
 * This should only be called after getStudentUserInfo() has been called.
 * This just appends all the student workgroup ids together seperated by :
 * e.g.
 * 139:143:152
 * @return a string containing the student workgroup ids delimited by :
 */
function getStudentWorkgoupIds() {
	var ids = "";

	//loop through all the student workgroup ids
	for(var x=0; x<studentWorkgroupIds.length; x++) {
		if(ids != "") {
			/*
			 * if this is not the first workgroup id, we need to seperate
			 * it from the previous id with a :
			 */
			ids += ":";
		}
		ids += studentWorkgroupIds[x];
	}
	return ids;
}

/**
 * Get an array of string workgroup sets
 * @param workgroupsPerIndex the number of workgroups we want per set
 * @return an array that contains a string set of workgroups in each index element
 * e.g.
 * There are 7 workgroups and we want 3 workgroups per index element
 * ["1:2:3"], ["4:5:6"], ["7"]
 */
View.prototype.getStudentWorkgroupIdsArray = function(workgroupsPerIndex) {
	//the array to hold the string workgroup sets
	var idsArray = new Array();

	//the current index to put workgroup ids into
	var idsArrayIndex = 0;

	/*
	 * the number of workgroup ids in the current index element 
	 * so we know when this index has reached the specified number
	 * of workgroupsPerIndex. then we will move on to the next
	 * index.
	 */
	var workgroupsInCurrentIndex = 0;
	
	//loop through all the student workgroup ids
	for(var x=0; x<this.studentWorkgroupIds.length; x++) {
		//get a workgroup
		var workgroupId = this.studentWorkgroupIds[x];

		if(idsArray[idsArrayIndex] == null) {
			/*
			 * if the index element is null, set it to empty string.
			 * this will happen when the first workgroup is
			 * placed into an index
			 */
			idsArray[idsArrayIndex] = "";
		} else {
			/*
			 * seperate the workgroup ids by :
		 	 * this will happen every time after the first workgroup
		 	 * is placed into the index
			 */
			idsArray[idsArrayIndex] += ":";
		}

		//add the workgroup to the array index
		idsArray[idsArrayIndex] += workgroupId;

		//increment the number of workgroups in the index
		workgroupsInCurrentIndex++;

		//check if we have reached the number of workgroups we want per index
		if(workgroupsInCurrentIndex == workgroupsPerIndex) {
			//we have reached the number of workgroups we want per index
			
			/*
			 * increment the idsArrayIndex so we will move on to the next
			 * index for the next workgroup
			 */
			idsArrayIndex += 1;

			/*
			 * set the number of workroups in the current index to 0 since
			 * we have moved on to the next index
			 */
			workgroupsInCurrentIndex = 0;
		}
	}

	//return the array with the workgroup sets
	return idsArray;
};

/**
 * Request the peer review data
 */
View.prototype.getPeerReviewWork = function() {
	
	var peerReviewCallback = function(text, xml, args) {
		var thisView = args[0];
		
		//set the array to a variable in the view so we can access it later
		thisView.peerReviewWorkArray = $.parseJSON(text);
	};
	
	var action = "teacherRequest";
	var runId = this.getConfig().getConfigParam('runId');
	
	var getPeerReviewUrlArgs = {
			action:action,
			runId:runId
	};
	
	var getPeerReviewUrl = this.getConfig().getConfigParam('getPeerReviewUrl');
	
	this.connectionManager.request('GET', 1, getPeerReviewUrl, getPeerReviewUrlArgs, peerReviewCallback, [this]);
};

/**
 * Retrieve the student work from the db
 */
View.prototype.getStudentWork = function() {
	//clear the student work vle states to make sure we don't get duplicate data
	this.setStates(Array());
	
	//get all node ids
	var nodeIds = this.getProject().getNodeIds();
	
	//make a ':' delimited string of nodeIds
	var nodeIdsString = nodeIds.toString().replace(/,/g, ':');

	/*
	 * obtain an array of workgroup ids, each element in the array
	 * contains a string workgroup ids delimited by :
	 * you can specify how many workgroup ids per array element
	 * by changing the number that is passed to the function.
	 * right now we get 25 workgroup ids at a time.
	 */
	var workgroupsArray = this.getStudentWorkgroupIdsArray(10);
	
	var studentWorkCallback = function(text, xml, args) {
			//get the view
			var thisView = args[0];
			
			//get the url we requested for
			var getStudentDataUrl = args[1];

			//parse all the vlestates for all the students
			var alwaysReturnArray = true;

			//parse the json student work into an array of vle states
			var newVLEStates = VLE_STATE.prototype.parseDataJSONString(text, alwaysReturnArray);

			if(thisView.getStates() == null) {
				//set the array of vle states if it hasn't been set before
				thisView.setStates(newVLEStates);
			} else {
				//concatenate the new vle states with the previous vle states
				thisView.setStates(thisView.getStates().concat(newVLEStates));
			}

			/*
			 * loop through all the urls in the array that represents the
			 * requests that have not returned yet
			 */
			for(var x=0; x<thisView.getStudentDataUrlArray.length; x++) {
				//find the url that this request is returning
				if(thisView.getStudentDataUrlArray[x] == getStudentDataUrl) {
					//remove the url from the array since we have received the response
					thisView.getStudentDataUrlArray.splice(x, 1);
				}
			}

			//check if we have received all the student work
			if(thisView.getStudentDataUrlArray.length == 0) {
				//we have received all the student work
				eventManager.fire("retrieveStudentWorkCompleted");
			}
	};
	
	var studentWorkCallbackFail = function(text, args) {
		//get the view
		var thisView = args[0];
		
		//get the request url that failed
		var getStudentDataUrl = args[1];
		
		//try to make the request again
		thisView.connectionManager.request('GET', 1, getStudentDataUrl, null, studentWorkCallback, [thisView, getStudentDataUrl], studentWorkCallbackFail);
	};

	var getStudentDataUrl = null;

	var getRevisions = false;
	
	if(this.getRevisions) {
		getRevisions = this.getRevisions;
	}
	
	//an array to store all the getStudentDataUrls
	this.getStudentDataUrlArray = [];

	//loop through each set of workgroup ids
	for(var x=0; x<workgroupsArray.length; x++) {
		/*
		 * get a set of workgroup ids. the workgroups in the element are
		 * delimited by :
		 */ 
		var workgroupSet = workgroupsArray[x];

		//create the url to get the student data for this set of workgroups
		getStudentDataUrl = this.getConfig().getConfigParam('getStudentDataUrl') + "?userId=" + workgroupSet + "&grading=true" + "&runId=" + this.getConfig().getConfigParam('runId') + "&nodeIds=" + nodeIdsString + "&getRevisions=" + getRevisions;

		//add the url to our array
		this.getStudentDataUrlArray.push(getStudentDataUrl);
	}
	
	//loop through the array of urls
	for(var y=0; y<this.getStudentDataUrlArray.length; y++) {
		//get a url
		getStudentDataUrl = this.getStudentDataUrlArray[y];
		
		//make the request for the url
		this.connectionManager.request('GET', 1, getStudentDataUrl, null, studentWorkCallback, [this, getStudentDataUrl], studentWorkCallbackFail);
	}

	if(this.getStudentDataUrlArray.length == 0) {
		eventManager.fire("retrieveStudentWorkCompleted");
	}
};

View.prototype.getVleStateByWorkgroupId = function(workgroupId) {
	if(this.getStates() != null) {
		for(var x=0; x<this.getStates().length; x++) {
			var vleState = this.getStates()[x];
			
			if(vleState.dataId == workgroupId) {
				return vleState;
			}
		}
	}
	
	return null;
};

/**
 * Get the peer review work data with the specified reviewer workgroup id
 * and node id
 * @param reviewerWorkgroupId the reviewer we want
 * @param nodeId the node id we want
 * @return the peer review work data or null if not found
 */
View.prototype.getPeerReviewWorkByReviewerNodeId = function(reviewerWorkgroupId, nodeId) {
	if(this.peerReviewWorkArray != null) {
		//loop through all the peer review work
		for(var x=0; x<this.peerReviewWorkArray.length; x++) {
			//get a peer review work
			var peerReviewWork = this.peerReviewWorkArray[x];
			
			//check if we found a match
			if(peerReviewWork.reviewerWorkgroupId == reviewerWorkgroupId &&
					peerReviewWork.nodeId == nodeId) {
				//we found a match so we will return it
				return peerReviewWork;
			}
		}
	}
	
	//we did not find a match
	return null;
};

/**
 * Get the peer review work data with the specified worker workgroup id
 * and node id
 * @param workerWorkgroupId the worker we want
 * @param nodeId the node id we want
 * @return the peer review work data or null if not found
 */
View.prototype.getPeerReviewWorkByWorkerNodeId = function(workerWorkgroupId, nodeId) {
	if(this.peerReviewWorkArray != null) {
		//loop through all the peer review work
		for(var x=0; x<this.peerReviewWorkArray.length; x++) {
			//get a peer review work
			var peerReviewWork = this.peerReviewWorkArray[x];
			
			//check if we found a match
			if(peerReviewWork.workgroupId == workerWorkgroupId &&
					peerReviewWork.nodeId == nodeId) {
				//we found a match so we will return it
				return peerReviewWork;
			}
		}
	}

	//we did not find a match
	return null;
};

/**
 * Get all the idea baskets for this run
 */
View.prototype.getIdeaBaskets = function() {
	/*
	 * the function that gets called when we receive the idea baskets from
	 * our request.
	 * @param text the response from the request
	 * @param xml not used
	 * @param args additional args we passed into the request so we can have access
	 * to them in the context of this callback function
	 */
	var getIdeaBasketsCallback = function(text, xml, args) {
		//get the view
		var thisView = args[0];
		
		//parse the idea baskets array
		var ideaBasketsJSON = $.parseJSON(text);
		var ideaBaskets = [];
		
		//loop through all the idea basket JSON objects
		for(var x=0; x<ideaBasketsJSON.length; x++) {
			//create an IdeaBasket for each idea basket JSON object
			var ideaBasketJSON = ideaBasketsJSON[x];
			var ideaBasket = new IdeaBasket(ideaBasketJSON);
			
			//add it to our array if IdeaBasket objects
			ideaBaskets.push(ideaBasket);
		}
		
		//set the array of IdeaBasket objects into the view
		thisView.ideaBaskets = ideaBaskets;
		
		eventManager.fire("retrieveIdeaBasketsCompleted");
	};
	
	var getIdeaBasketParams = {
		action:"getAllIdeaBaskets"	
	};

	//make the request for the idea baskets
	this.connectionManager.request('GET', 1, this.getConfig().getConfigParam('getIdeaBasketUrl'), getIdeaBasketParams, getIdeaBasketsCallback, [this]);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/grading/gradingview_studentwork.js');
};