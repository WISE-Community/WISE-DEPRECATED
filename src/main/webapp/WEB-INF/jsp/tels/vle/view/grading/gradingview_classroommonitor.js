/**
 * Displays all node visits in stream. called during initiation of classroom monitor
 */
View.prototype.displayNodeVisitsInStream = function() {
	// goes through all the students' nodevisits and displays them in the classroom monitor stream div by calling displayNodeVisitInStream
	var allNodeVisitsArray = [];
	for (var i=0; i < this.getStates().length; i++) {
		var vleState = this.getStates()[i];
		var vleStateWorkgroupId = vleState.workgroupId;
		var vleStateNodeVisits = vleState.visitedNodes;
		for (var j=0; j<vleStateNodeVisits.length; j++) {
			var vleStateNodeVisit = vleStateNodeVisits[j];
			vleStateNodeVisit.workgroupId = vleStateWorkgroupId;  // inject workgroupId so we can retrieve it later after sorting
			allNodeVisitsArray.push(vleStateNodeVisit);
		}
	}
	
	// sort all nodevisits by submitted timestamp
	allNodeVisitsArray.sort(this.sortNodeVisitsByVisitPostTime);
	
	// now go through the sorted nodevisits and call displayNodeVisitInStream
	for (var k=0; k<allNodeVisitsArray.length; k++) {
		var nodeVisit = allNodeVisitsArray[k];
		this.displayNodeVisitInStream(nodeVisit.workgroupId, nodeVisit);
	}
};

/**
 * Array ordering function to order the node visits by post time.
 * @param a
 * @param b
 * @returns {Number}
 */
View.prototype.sortNodeVisitsByVisitPostTime = function(a, b) {
	if (a.visitPostTime < b.visitPostTime) {
		return -1;
	} else if (a.visitPostTime > b.visitPostTime) {
		return 1;
	} else {
		return 0;
	}
};

View.prototype.displayNodeVisitInStream = function(workgroupId, nodeVisit) {
	/*
	 * the teacher has received work from the student so we will
	 * display it in the student work stream
	 */
	var workgroupName = this.userAndClassInfo.getUserNameByUserId(workgroupId);
	var nodeId = nodeVisit.nodeId;
	var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId);
	var node = this.getProject().getNodeById(nodeId);
	var divId = "realTimeStudentWork_" + nodeVisit.id + "_" + workgroupId;
	
	if (!node.hasGradingView()) {
		// return immediately if node does not have a GradingView, like HtmlNode.
		return;
	} 


	/*
	 * add this nodevisit object to local tally so we can access it
	 * later when the teacher wants to share it with the class
	 */
	if (typeof realTimeNodeVisitIdToNodeVisit == "undefined") {
		realTimeNodeVisitIdToNodeVisit = {};
	}
	realTimeNodeVisitIdToNodeVisit[nodeVisit.id] = {
			"workgroupId":workgroupId,
			"workgroupName":workgroupName,
			"stepNumberAndTitle":stepNumberAndTitle,
			"nodeId":nodeId,
			"nodeVisit":nodeVisit
	};

	var selectedWorkgroupIdValue = $('#realTimeMonitorSelectWorkgroupIdDropDown :selected').val();
	var selectedNodeIdValue = $('#realTimeMonitorSelectStepDropDown :selected').val();

	var styleDisplay = 'style="display:none"';

	/*
	 * determine if we need to display or hide this student work based
	 * on the current drop down filters
	 */
	if (selectedWorkgroupIdValue == "all" && selectedNodeIdValue == "all") {
		styleDisplay = '';
	} else if (selectedNodeIdValue != "all" && selectedWorkgroupIdValue != "all") {
		if(workgroupId == selectedWorkgroupIdValue && nodeId == selectedNodeIdValue) {
			styleDisplay = '';
		}
	} else if (selectedWorkgroupIdValue != "all") {
		if(workgroupId == selectedWorkgroupIdValue) {
			styleDisplay = '';
		}
	} else if (selectedNodeIdValue != "all") {
		if(nodeId == selectedNodeIdValue) {
			styleDisplay = '';
		}
	} else {
		//shouldn't reach here
		console.log("shouldn't reach here");
	}
	
	$("#realTimeMonitorStudentWorkDisplayDiv").append('<div id="' + divId + '" class="realTimeStudentWork workgroupId_' + workgroupId + ' nodeId_' + nodeId + '" ' + styleDisplay + '></div>');

	try {
		var studentWorkDiv = $('#' + divId);
		//render the student grading view for the student work
		node.renderGradingView(studentWorkDiv,nodeVisit,null,workgroupId);      
		var nodeVisitPostTime = new Date(nodeVisit.visitPostTime);

		var studentWorkInfoDiv = "<div id='studentWorkInfoDiv_"+workgroupId+"' class='studentWorkInfoDiv nodeVisitId_"+nodeVisit.id+"'>"+workgroupName+" "+
		stepNumberAndTitle+ "(" + nodeVisitPostTime + ")<a class='shareWithClass' onclick='eventManager.fire(\"realTimeMonitorShareWithClassClicked\", [\"NodeVisit\","+nodeVisit.id+"])'>Share with class</a></div>";
		studentWorkDiv.prepend(studentWorkInfoDiv);

		if (node.type == "MultipleChoiceNode") {
			// if the step for this work can be plotted in a histogram, add/update nodeIdToWork
			if (typeof nodeIdToWork == "undefined") {
				/*
				 * an object that maps node id to objects that contain the work
				 * for a specific step
				 */
				nodeIdToWork = {};
			}
			if (nodeIdToWork[nodeId] == null) {
				nodeIdToWork[nodeId] = {};
			}
			if (nodeVisit.getLatestWork() && nodeVisit.getLatestWork().response.length > 0) {
				//add this student work to the mapping
				nodeIdToWork[nodeId][workgroupId] = nodeVisit.getLatestWork().response;        						
			}
			this.displayStepGraph(nodeId,"realTimeMonitorGraphImg");
		} else if (node.type == "OpenResponseNode" || node.type == "NoteNode") {
			// allow teacher to sort incoming student work using drag and drop
			var realTimeStudentWork =  nodeVisit.getLatestWork().response.toString();
			var draggableStudentWorkSpan = $("<span>").html(realTimeStudentWork).css("border","1px solid").css("padding","3px");
			$("#realTimeMonitorDraggableCanvasDiv").append(draggableStudentWorkSpan);
			draggableStudentWorkSpan.draggable({ containment: "#realTimeMonitorDraggableCanvasDiv"});
		}
	} catch(e) {
		console.log('exception thrown in realtime monitor' + e);
	}

	$("#realTimeMonitorStudentWorkDisplayDiv").scrollTop(1000000);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/grading/gradingview_classroommonitor.js');
};