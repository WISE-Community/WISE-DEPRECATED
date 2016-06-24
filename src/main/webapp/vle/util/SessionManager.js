/**
 * SessionManager manages sessions
 * The SessionManager will warn the user when the session is about to expire. 
 * The user can choose to ignore the warning or renew the session. 
 * If the user ignores the warning and session times out, 
 * the SessionManager will
 * 1) save the student's current work,
 * 2) close the VLE and 
 * 3) take the user back to the homepage.
 */
function SessionManager(em, view) {
	this.em = em;
	this.view = view;
	this.alert;

	// the amount of time the user can be inactive before we automatically log them out
	this.sessionTimeoutInterval = this.convertMinutesToMilliseconds(30);
	
	// get the timestamp for when the current session was started
	this.sessionStartTimestamp = this.getCurrentTimestamp();
	
	/*
	 * flag for determining if we should renew the session. this is used when 
	 * we call checkSession().
	 */
	this.performRenewOnNextCheckSession = false;
	
	// how often we check to renew the session
	this.sessionTimeoutCheckInterval = this.convertMinutesToMilliseconds(1);

	// register loop to check session status every once in a while
	setInterval("view.sessionManager.checkSession()", this.sessionTimeoutCheckInterval);
	
	// listen for the mousemove event so we can renew the session
	$(document).on('mousemove', (event) => {
		this.mouseMoved();
	});
	
	// listen for the keypress event so we can renew the session
	$(document).on("keypress", (event) => {
		this.keyPressed();
	});
};

/**
 * The user has moved the mouse
 */
SessionManager.prototype.mouseMoved = function() {
	// set the flag to renew the session the next time we check
	this.performRenewOnNextCheckSession = true;
};

/**
 * The user has pressed a key
 */
SessionManager.prototype.keyPressed = function() {
	// set the flag to renew the session the next time we check
	this.performRenewOnNextCheckSession = true;
};

/**
 * Keeps session alive
 */
SessionManager.prototype.renewSession = function() {
	//get the context path e.g. /wise
	var contextPath = this.view.getConfig().getConfigParam('contextPath');
	
	// make a request to renew the session
	var renewSessionUrl = this.view.config.getConfigParam('indexURL');
	if (renewSessionUrl == null || renewSessionUrl == 'undefined') {
		renewSessionUrl = contextPath;
	}
	this.view.connectionManager.request('GET', 2, renewSessionUrl, {}, null, this.view);
	
	// set the session start timestamp
	this.sessionStartTimestamp = this.getCurrentTimestamp();
	
	/*
	 * set the flag that specifies that they are inactive until they move the
	 * mouse or press a key on the keyboard
	 */
	this.performRenewOnNextCheckSession = false;
};

/**
 * Checks if the session is still valid, invoked periodically via setInterval.
 * There are three main cases:
 * 1) User was inactive for too long and ignored the renew session dialog.
 * Need to save work and close VLE
 * 2) User was inactive for longer than this.sessionTimeoutWarning milliseconds.
 * Need to warn them and let them renew the session.
 * 3) this.sessionTimeoutWarning milliseconds has not elapsed yet since the last
 * time the session was renewed. Do nothing.
 */
SessionManager.prototype.checkSession = function() {
	var view = this.view;
	if (view.config.getConfigParam("mode") === "preview") {
		// no session for preview
		return;
	}
	
	// get the current timestamp
	var currentTimestamp = this.getCurrentTimestamp();
	
	if (this.performRenewOnNextCheckSession) {
		// renew the session
		this.renewSession();
		
		// close the warning message dialog if it is open
		if (typeof bootbox != 'undefined' && bootbox != null && this.alert != null) {
			this.alert = null;
			bootbox.hideAll();
		} else if ($('#sessionMessageDiv').length > 0 && 
					$('#sessionMessageDiv').hasClass('ui-dialog-content') && 
					$('#sessionMessageDiv').dialog('isOpen')) {
			$('#sessionMessageDiv').dialog('close');
		}
	} else {
		// don't renew the session for now
		
		/*
		 * get the amount of time that has passed since the last time we renewed
		 * the session
		 */
		var millisecondsInactive = currentTimestamp - this.sessionStartTimestamp;
		
		if (millisecondsInactive > this.sessionTimeoutInterval) {
			/*
			 * the user has not interacted with the authoring tool for over
			 * 30 minutes so we will log the user out
			 */
			
			var msg = view.getI18NString("session_timeout_message");
			if(notificationManager){
				notificationManager.notify(msg,3);
			} else {
				alert(msg);
			}
			this.view.onWindowUnload(true);
		} else if (millisecondsInactive > this.sessionTimeoutInterval * 0.9) {
			/*
			 * the user has not interacted with the authoring tool for over
			 * 27 minutes so we will display a warning message that asks if
			 * they want to stay logged in
			 */
			
			var renewSessionSubmit = function(){
				// renewSession was requested
				view.sessionManager.renewSession();
				
				// close the warning message dialog if it is open
				if ($('#sessionMessageDiv').dialog('isOpen')) {
					$('#sessionMessageDiv').dialog('close');
				}
			};
			var renewSessionClose = function(){
				// renewSession was requested
				view.sessionManager.renewSession();
			};
			var title = view.getI18NString("session_timeout_title"),
				msg = view.getI18NString("session_timeout_warning"),
				btn = view.getI18NString("session_timeout_confirm");
			// TODO: switch to Bootbox modals permanently when we're using Bootstrap globally across views
			if(typeof bootbox != 'undefined' && bootbox != null) {
				// we are using bootbox
				
				// check if we are already showing the bootbox dialog
				if (!this.alert) {
					// we are not already showing the bootbox dialog
					
					// create and show the bootbox dialog
					this.alert = bootbox.dialog({
						message: msg,
						title: title,
						onEscape: renewSessionClose,
						buttons: {
							main: {
								label: btn,
								className: "btn-primary",
								callback: function(){
									view.alert = null;
									renewSessionClose();
								}
							}
						}
					});
				}
			} else {
				// we are not using bootbox so we will use a jquery dialog
				$('#sessionMessageDiv').html(msg);
				$('#sessionMessageDiv').dialog(
						{autoOpen:true, draggable:true, modal:true, title:title, width:400, position:['center','center'], zIndex:10000, buttons: {Renew:renewSessionSubmit}, close:renewSessionClose}
				);
			}
		}
	}
};

/**
 * Get the current timestamp in milliseconds
 * @returns the current timestamp in milliseconds
 */
SessionManager.prototype.getCurrentTimestamp = function() {
	// get the current timestamp
	var date = new Date();
	var timestamp = date.getTime();
	return timestamp;
}

/**
 * Convert minutes to milliseconds
 * @param minutes the minutes
 * @returns the minutes converted to milliseconds
 */
SessionManager.prototype.convertMinutesToMilliseconds = function(minutes) {
	
	var milliseconds = null;

	if (minutes != null) {
		// get the number of seconds
		var seconds = minutes * 60;

		// get the number of milliseconds
		milliseconds = seconds * 1000;
	}

	return milliseconds;
}

/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/util/SessionManager.js');
};