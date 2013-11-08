

function StudentQueryContainer(dataId, userName) {
	this.dataId = dataId;
	this.userName = userName;
	
	//array of query entries, (key, value) = (nodeId, queryEntry);
	this.queryEntryArray = new Array();
}

/**
 * Adds a query entry into the query container
 * @param queryEntry a query entry
 */
StudentQueryContainer.prototype.addQueryEntry = function(queryEntry) {
	this.queryEntryArray.push(queryEntry);
}


/**
 * 
 * @param parentNodeId
 * @return
 */
StudentQueryContainer.prototype.retrieveEntriesFromActivity = function(parentNodeId) {
	var entriesInActivity = new Array();
	
	for(var x=0; x<this.queryEntry.length; x++) {
		var queryEntry = this.queryEntryArray[x]; 
		var nodeId = queryEntry.nodeId;
		
		var isChildOf = this.isNodeChildOf(nodeId, parentNodeId);
		
		if(isChildOf) {
			entriesInActivity.push(queryEntry);
		}
	}
	
	return entriesInActivity;
}

/**
 * Determines whether a node is a child of another node.
 * @param nodeId a node Id e.g. '0:0:1'
 * @param parentId a node Id, most likely a project or activity node e.g. '0:0'
 * @return whether the nodeId is a child of the parentId
 */
StudentQueryContainer.prototype.isNodeChildOf = function(nodeId, parentId) {
	if(nodeId == parentId) {
		return false;
	}
	
	var nodeIdArray = nodeId.split(':');
	var parentNodeIdArray = parentId.split(':');
	
	for(var x=0; x<parentNodeIdArray.length; x++) {
		var parentValue = parentNodeIdArray[x];
		var nodeValue = nodeIdArray[x];
		if(parentValue != nodeValue) {
			return false;
		}
	}
	
	return true;
}


StudentQueryContainer.prototype.printEntriesFromActivity = function(activityNodeId) {
	var print = "";
	var entriesFromActivity = this.retrieveEntriesFromActivity(activityNodeId);
	
	for(var x=0; x<entriesFromActivity.length; x++) {
		var queryEntry = entriesFromActivity[x];
		print += queryEntry.printEntry();
	}
}

/**
 * Prints out all of a user's work
 * @return an html string that contains the userName and all the user's work
 */
StudentQueryContainer.prototype.printContainer = function() {
	var print = "";
	print += "<br>[" + this.userName + "]<br><br><hr>";
	
	for(var x=0; x<this.queryEntryArray.length; x++) {
		print += this.queryEntryArray[x].printStudentEntry();
		print += "<br><br><hr>";
	}
	return print;
}