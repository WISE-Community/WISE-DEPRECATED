
/**
 * Get the run status so we can check if our period is paused or not
 */
View.prototype.getRunStatus = function() {
	//get the run status url we will use to make the request
	var runStatusUrl = this.getConfig().getConfigParam('runStatusUrl');
	
	//get the run id
	var runId = this.getConfig().getConfigParam('runId');
	
	//create the params for the request
	var runStatusParams = {
		runId:runId
	}
	
	if(runStatusUrl != null) {
		//make the request to the server for the student statuses
		this.connectionManager.request('GET', 3, runStatusUrl, runStatusParams, this.getRunStatusCallback, this, this.getRunStatusFail, false, null);
	}	
};

/**
 * Callback for getting the run status
 * @param responseText
 * @param responseXML
 * @param view
 */
View.prototype.getRunStatusCallback = function(responseText, responseXML, view) {
	//create the run status object
	var runStatus = JSON.parse(responseText);
	
	if(runStatus != null) {
		//get the period id this student is in
		var periodId = view.userAndClassInfo.getPeriodId();
		
		//check if all periods are paused
		var allPeriodsPaused = runStatus.allPeriodsPaused;
		
		if(allPeriodsPaused) {
			//all periods are paused so we will lock the screen
			view.lockScreen();
		} else {
			/*
			 * all periods are not paused so we now need to check if our
			 * period is paused
			 */
			
			//get all the periods in the run status
			var periods = runStatus.periods;
			
			if(periods != null) {
				//loop through all the periods in the run status
				for(var x=0; x<periods.length; x++) {
					//get a period
					var tempPeriod = periods[x];
					
					//get the period id
					var tempPeriodId = tempPeriod.periodId;
					
					//get whether the period is paused or not
					var isPaused = tempPeriod.paused;
					
					//check if this is the period we are in
					if(periodId == tempPeriodId) {
						//this is the period we are in
						
						//check if the period is paused
						if(isPaused) {
							//the period is paused so we will lock the screen
							view.lockScreen();
						}
					}
				}
			}
		}
	}
	
	//start the web socket connection
	view.startWebSocketConnection();
};

/**
 * The failure callback for getting the student statuses
 */
View.prototype.getRunStatusFail = function(responseText, responseXML, view) {
	
};

/**
 * Start the web socket connection for the student
 */
View.prototype.startWebSocketConnection = function() {
	//get the run id
	var runId = this.getConfig().getConfigParam('runId');
	
	//get the period id
	var periodId = this.userAndClassInfo.getPeriodId();
	
	//get the student workgroup id
	var workgroupId = this.userAndClassInfo.getWorkgroupId();
	
	/*
	 * an array to store web socket messages that we try to send
	 * before the web socket connection is open. this is only used
	 * if the vle manages to try to send the first student status 
	 * message before the web socket connection is open. this race
	 * condition issue seems to only happen in Chrome. all subsequent
	 * web socket messages will not need to be placed in this queue
	 * since the connection will be open and messages can be sent
	 * immediately.
	 */
	this.webSocketMessageQueue = [];
	
	//get the web socket url
	var webSocketUrl = this.getConfig().getConfigParam('webSocketUrl');
	
	//add the parameters to the web socket url
	var host = webSocketUrl + '?runId=' + runId + '&periodId=' + periodId + '&workgroupId=' + workgroupId;

	this.socket = null;
	
	//create the web socket connection
	if('WebSocket' in window) {
		this.socket = new WebSocket(host);
	} else if('MozWebSocket' in window) {
		this.socket = new MozWebSocket(host);
	} else {
		
	}
	
	if(this.socket != null) {
		/*
		 * add the view to the socket so that we have access to the view
		 * in the event functions such as onmessage() and onopen()
		 */
		this.socket.view = this;
		
		//the function to call when the connection becomes open
		this.socket.onopen = function() {
			if(view.webSocketMessageQueue != null) {
				/*
				 * loop through all the web socket messages in the queue
				 * that we tried to send before the connection opened
				 */
				while(view.webSocketMessageQueue.length > 0) {
					//get a web socket message and send it
					var webSocketMessage = view.webSocketMessageQueue.pop();
					view.sendStudentWebSocketMessage(webSocketMessage);
				}
			}
		}
		
		//the function to call when we receive a web socket message
		this.socket.onmessage = function(message) {
			
			if(message != null) {
				//get the data from the message
				var dataString = message.data;
				
				if(dataString != null) {
					//convert the data into a JSONObject
					var data = JSON.parse(dataString);
					
					if(data != null) {
						//get the message type
						var messageType = data.messageType;
						console.log('messageType=' + messageType);
						if(messageType == null || messageType == '') {
							
						} else if(messageType == 'pauseScreen') {
							//lock the student screen
							view.lockScreen();
						} else if(messageType == 'unPauseScreen') {
							//unlock the student screen
							view.unlockscreen();
						}
					}
				}
			}
		}
	}
};

/**
 * Send the web socket message
 * @param messageJSON the message to send. this is a JSONObject that we
 * will convert to a string
 */
View.prototype.sendStudentWebSocketMessage = function(messageJSON) {
	if(this.socket != null) {
		//get the state of the web socket connection
		var readyState = this.socket.readyState;

		if(readyState == 1) {
			//the web socket connection is open
			if(messageJSON != null) {
				//send the message
				this.socket.send(JSON.stringify(messageJSON));			
			}
		} else {
			/*
			 * the web socket connection is not open so we will save
			 * this message in a queue to send later once the connection
			 * opens
			 */
			this.webSocketMessageQueue.push(messageJSON);
		}
	}
};

/**
 * Send the student status message to the server. This will send two
 * requests to the server. One will send the student status to the 
 * web socket server which will then be sent to the teacher. 
 * The other will send the student status to the StudentStatusController 
 * to save the student status to the database.
 */
View.prototype.sendStudentStatusWebSocketMessage = function() {
	//get the current node id
	var currentNodeId = this.currentNode.id;
	
	//get the previous node visit
	var previousNodeVisit = this.getState().getLatestCompletedVisit();
	
	//get the node statuses for all the steps
	var nodeStatuses = this.getStudentNodeStatuses();
	
	var messageJSON = {};
	
	//create the JSON that will be sent to the web socket
	messageJSON.messageParticipants = 'studentToTeachers';
	messageJSON.messageType = 'studentStatus';
	messageJSON.currentNodeId = currentNodeId;
	messageJSON.previousNodeVisit = previousNodeVisit;
	messageJSON.nodeStatuses = nodeStatuses;
	
	//send the message to the web socket server to be forwarded to the teacher
	this.sendStudentWebSocketMessage(messageJSON);
};

/**
 * Send the student status to the server to be saved to the database
 */
View.prototype.sendStudentStatusToServer = function() {
	//get the run id, period id, workgroup id
	var runId = this.getConfig().getConfigParam('runId');
	var periodId = this.userAndClassInfo.getPeriodId();
	var workgroupId = this.userAndClassInfo.getWorkgroupId();
	
	var currentNodeId = this.getCurrentNode().id;
	var previousNodeVisit = this.getState().visitedNodes[this.getState().visitedNodes.length - 2];
	
	//get the node statuses for all the steps
	var nodeStatuses = this.getStudentNodeStatuses();
	
	//create the JSON that will be saved to the database
	var studentStatusJSON = {};
	studentStatusJSON.runId = runId;
	studentStatusJSON.periodId = periodId;
	studentStatusJSON.workgroupId = workgroupId;
	studentStatusJSON.currentNodeId = currentNodeId;
	studentStatusJSON.previousNodeVisit = previousNodeVisit;
	studentStatusJSON.nodeStatuses = nodeStatuses;
	
	//get the student status as a string
	var status = JSON.stringify(studentStatusJSON);
	
	//encode the student status data
	status = encodeURIComponent(status);
	
	/*
	 * create the params for the message that will be sent 
	 * to the StudentStatusController and saved in the
	 * database
	 */
	var studentStatusParams = {};
	studentStatusParams.runId = runId;
	studentStatusParams.periodId = periodId;
	studentStatusParams.workgroupId = workgroupId;
	studentStatusParams.status = status;
	
	//send the student status to the server
	this.sendStudentStatusToServerHelper(studentStatusParams);
};

/**
 * Send the student status to the server to be saved to the database
 */
View.prototype.sendStudentStatusToServerHelper = function(studentStatusParams) {
	//get the url for the StudentStatusController
	var studentStatusUrl = this.getConfig().getConfigParam('studentStatusUrl');
	
	if(studentStatusUrl != null) {
		//make the request to save the student status to the database
		this.connectionManager.request('POST', 3, studentStatusUrl, studentStatusParams, this.sendStudentStatusToServerCallback, this);
	}
};

/**
 * The callback for sending the student status to be saved to the database
 */
View.prototype.sendStudentStatusToServerCallback = function(responseText, responseXML, view) {

};

/**
 * Get all the node statuses for all the nodes for this student
 */
View.prototype.getStudentNodeStatuses = function() {
	var studentNodeStatuses = [];
	
	//get all the node ids for the steps
	var nodeIds = this.getProject().getNodeIds();
	
	//loop through all the node ids
	for(var x=0; x<nodeIds.length; x++) {
		//get a node id
		var nodeId = nodeIds[x];
		
		//get a node
		var node = this.getProject().getNodeById(nodeId);
		
		//create an object to hold the node id and the statuses for that node
		var nodeStatus = {};
		nodeStatus.nodeId = nodeId;
		nodeStatus.statuses = [];
		
		//get all the available status types for the node
		var availableStatuses = node.getAvailableStatuses();
		
		if(availableStatuses != null) {
			//loop through all the available statuses
			for(var y=0; y<availableStatuses.length; y++) {
				//get an available status
				var availableStatus = availableStatuses[y];
				
				//get the status type
				var statusType = availableStatus.statusType;
				
				//get the status value for the status type
				var statusValue = node.getStatus(statusType);
				
				//create an object to hold the status type and status value
				var statusObject = {};
				statusObject.statusType = statusType;
				statusObject.statusValue = statusValue;
				
				//add the object to the array of statuses for this node
				nodeStatus.statuses.push(statusObject);
			}
		}
		
		//get the lastest node visit with work
		var latestNodeVisitWithWork = this.model.getState().getLatestNodeVisitByNodeId(nodeId);
		
		if(latestNodeVisitWithWork != null) {
			//get the step work id
			var stepWorkId = latestNodeVisitWithWork.id;
			
			stepWorkId = parseInt(stepWorkId);
			
			//add the step work id as the lastest step work id with work
			nodeStatus.latestStepWorkIdWithWork = stepWorkId;
		}
		
		//add the node status object to our array of node statuses
		studentNodeStatuses.push(nodeStatus);
	}
	
	return studentNodeStatuses;
};

/**
 * Lock the student screen
 */
View.prototype.lockScreen = function() {
	//create the lock screen dialog if it does not exist
	if($('#lockscreen').size()==0){
		this.renderLockDialog();
	}
	
	//the message to display in the modal dialog that will lock the student screen
	var message = "<table><tr align='center'>Your teacher has paused your screen.</tr><tr align='center'></tr><table><br/>";

	$('#lockscreen').html(message);
	$('#lockscreen').dialog('option', 'width', 800);
    $('#lockscreen').dialog('option', 'height', 600);
    $('#lockscreen').dialog('open');
};

/**
 * Unlock the student screen
 */
View.prototype.unlockscreen = function() {
	//create the lock screen dialog if it does not exist
	if($('#lockscreen').size()==0){
		this.renderLockDialog();
	}
	
	$('#lockscreen').html('');
    $('#lockscreen').dialog('close');
};


//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/webSocket/studentWebSocket.js');
}