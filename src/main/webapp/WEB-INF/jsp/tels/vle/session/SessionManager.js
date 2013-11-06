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

	// session timeout limit, in milliseconds.
	// (20 min = 20*60*1000 = 1200000 milliseconds)  (15 min = 15*60*1000 = 900000 milliseconds) (10 min = 10*60*1000 = 600000 milliseconds)	
	this.sessionTimeoutInterval = 1200000;   
	
	// override sessionTimeoutInterval, if specified in the config.
	if (view.config && view.config.getConfigParam("sessionTimeoutInterval")) {
		this.sessionTimeoutInterval = view.config.getConfigParam("sessionTimeoutInterval");
	}
	
	// how often session should be checked, in milliseconds
	this.sessionTimeoutCheckInterval = 60000; 
	
	// override sessionTimeoutCheckInterval, if specified in the config.
	if (view.config && view.config.getConfigParam("sessionTimeoutCheckInterval")) {
		this.sessionTimeoutCheckInterval = view.config.getConfigParam("sessionTimeoutCheckInterval");
	}
	
	// how many milliseconds to wait before warning the user about a session timeout.
	this.sessionTimeoutWarning = this.sessionTimeoutInterval*.75;  
	
	// timestamp of last successful request to renew the session.
	this.lastSuccessfulRequest = Date.parse(new Date());  

	// register loop to check session status every once in a while
	setInterval("view.sessionManager.checkSession()", this.sessionTimeoutCheckInterval);
};

/**
 * Updates lastSuccessfulRequest timestamp after the session was successfully renewed.
 */
SessionManager.prototype.maintainConnection = function(){
	this.lastSuccessfulRequest = Date.parse(new Date());
};

/**
 * Keeps session alive
 */
SessionManager.prototype.renewSession = function() {
	// make a request to renew the session
	var renewSessionUrl = this.view.config.getConfigParam('indexUrl');
	if (renewSessionUrl == null || renewSessionUrl == 'undefined') {
		renewSessionUrl = "/webapp/index.html";
	}
	this.view.connectionManager.request('GET', 2, renewSessionUrl, {}, null, this.view);
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
	if(this.view.config.getConfigParam("mode") == "portalpreview") {
		// no session for preview
		return;
	}
	
	if(this.view.gradingType != null && this.view.gradingType == "monitor") {
		// classroom monitor should not log out indefinitely
		this.renewSession();
		return;
	}
	
	if (this.lastSuccessfulRequest != null) {
		if ((Date.parse(new Date()) - this.lastSuccessfulRequest) +this.sessionTimeoutCheckInterval*1.5 >= this.sessionTimeoutInterval) {
			// "+this.sessionTimeoutCheckInterval*1.5" => force logout sooner than actual sessionTimeoutInterval to avoid data loss.
			// this means that student has been idling too long and has been logged out of the session
			// so we should take them back to the homepage.
			if(notificationManager){
				notificationManager.notify("You have been inactive for too long and have been logged out. Please log back in to continue.",3);
			} else {
				alert("You have been inactive for too long and have been logged out. Please log back in to continue.");
			}
			this.view.onWindowUnload(true);
		} else if ((Date.parse(new Date()) - this.lastSuccessfulRequest) > this.sessionTimeoutWarning) {
			// if 75% of the timeout has been elapsed, warn them
			var renewSessionSubmit = function(){
				// renewSession was requested
				view.sessionManager.renewSession();
				$('#sessionMessageDiv').dialog('close');
			};
			var renewSessionClose = function(){
				// renewSession was requested
				view.sessionManager.renewSession();
			};
			$('#sessionMessageDiv').html("You have been inactive for a long time. If you do not renew your session now, you will be logged out of WISE.");
			$('#sessionMessageDiv').dialog(
					{autoOpen:true, draggable:true, modal:true, title:'Session Timeout', width:400, position:['center','center'], zIndex:10000, buttons: {'STAY LOGGED IN!':renewSessionSubmit}, close:renewSessionClose}
			);
		} else {
			// they're fine, within the timeout interval. no need to renew session or logout.
		}
	};
	
};

/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/session/SessionManager.js');
};