
/**
 * Start the web socket connection for the teacher
 */
View.prototype.startWebSocketConnection = function() {
	//get the run id
	var runId = this.getConfig().getConfigParam('runId');
	
	//get the web socket url
	var webSocketUrl = this.getConfig().getConfigParam('webSocketUrl');
	
	//add the parameter to the websocket url
	var host = webSocketUrl + '?runId=' + runId;
	
	this.socket = null;
	
	//create the websocket connection
	if('WebSocket' in window) {
		this.socket = new WebSocket(host);
	} else if('MozWebSocket' in window) {
		this.socket = new MozWebSocket(host);
	} else {
		
	}
	
	if(this.socket != null) {
		/*
		 * add the view to the socket so that we have access to the view
		 * in the event functions such as onmessage()
		 */
		this.socket.view = this;
		
		//the function to call when we receive a web socket message
		this.socket.onmessage = function(message) {
			if(message != null) {
				//get the data from the message
				var dataString = message.data;
				
				if(dataString != null) {
					//create a JSONObject from the data
					var data = JSON.parse(dataString);
					
					if(data != null) {
						//get the message type
						var messageType = data.messageType;
						
						if(messageType == null || messageType == '') {
							
						} else if(messageType == 'studentsOnlineList') {
							//the message is the list of online students
							view.studentsOnlineListReceived(data);
						} else if(messageType == 'studentConnected') {
							//the message is notifying us that a student has connected
							view.studentConnected(data);
						} else if(messageType == 'studentDisconnected') {
							//the message is notifying us that a student has disconnected
							view.studentDisconnected(data);
						} else if(messageType == 'teacherConnected') {
							
						} else if(messageType == 'teacherDisconnected') {
							
						} else if(messageType == 'studentStatus') {
							//the message is a student updating their status
							view.studentStatusReceived(data);
						} else if(messageType == 'pauseScreen') {
							//another teacher has paused the screen
							view.pauseScreenReceived(data);
						} else if(messageType == 'unPauseScreen') {
							//another teacher has unpaused the screen
							view.pauseScreenReceived(data);
						}
					}
				}
			}
		}
	}
};

/**
 * Send the web socket message
 * @param messageJSON the message JSONObject
 */
View.prototype.sendTeacherWebSocketMessage = function(messageJSON) {
	if(this.socket != null) {
		if(messageJSON != null) {
			//send the message
			this.socket.send(JSON.stringify(messageJSON));			
		}
	}
};

/**
 * Send the web socket message to pause all the student screens
 */
View.prototype.pauseScreens = function(periodId) {
	if(this.socket != null) {
		//create the message object with the necessary parameters
		var messageJSON = {};
		messageJSON.runId = parseInt(this.getConfig().getConfigParam('runId'));
		
		messageJSON.messageType = 'pauseScreen';
		
		if(periodId == null || periodId == 'all') {
			//we are going to pause all the students in a run
			messageJSON.messageParticipants = 'teacherToStudentsInRun';
		} else if(periodId != null) {
			//we are going to pause the students in a period
			messageJSON.periodId = periodId;
			messageJSON.messageParticipants = 'teacherToStudentsInPeriod';
		}
		
		//send the message to pause the screens
		this.sendTeacherWebSocketMessage(messageJSON);
		
		//update our run status to reflect that the period is now paused
		this.updatePausedRunStatusValue(periodId, true);
		
		//send the run status to the server to be saved in the db
		this.sendRunStatus();
	}
};

/**
 * Send the web socket message to un-pause all the student screens
 */
View.prototype.unPauseScreens = function(periodId) {
	if(this.socket != null) {
		//create the message object with the necessary parameters
		var messageJSON = {};
		messageJSON.runId = parseInt(this.getConfig().getConfigParam('runId'));
		messageJSON.messageType = 'unPauseScreen';
		
		if(periodId == null || periodId == 'all') {
			//we are going to pause all the students in a run
			messageJSON.messageParticipants = 'teacherToStudentsInRun';
		} else if(periodId != null) {
			//we are going to pause the students in a period
			messageJSON.periodId = periodId;
			messageJSON.messageParticipants = 'teacherToStudentsInPeriod';
		}
		
		//send the message
		this.sendTeacherWebSocketMessage(messageJSON);
		
		//update our run status to reflect that the period is now not paused
		this.updatePausedRunStatusValue(periodId, false);
		
		//send the run status to the server to be saved in the db
		this.sendRunStatus();
	}
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/webSocket/teacherWebSocket.js');
}