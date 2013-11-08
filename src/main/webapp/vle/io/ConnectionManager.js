/**
 * ConnectionManager manages and prioritizes GET and POST requests
 */
function ConnectionManager(em) {
	this.em = em;
	this.MAX = 5;
	this.queue = [];
	this.running = 0;
	this.counter = 0;
};

/**
 * Creates a connection object based on type, queues and starts a request depending
 * on how many are in queue.
 * 
 * @param type - POST or GET
 * @param priority - the lower the number the sooner the request gets started
 * @param url - the url
 * @param cArgs - the connection arguments, generally, the parameters and values in a url request
 * @param handler - success handler function which takes 3 params: Text, xmlDoc and args (the hArgs gets passed in)
 * 		run when connectionManager receives a successful response from server.
 * @param hArgs - args that are needed by the success and/or failure handler
 * @param fHandler - failure handler function with takes 2 params: o (the response object), and args (the
 * 		hArgs that gets passed in
 * @param timeout timeout limit, in millseconds
 * @return
 */
ConnectionManager.prototype.request = function(type, priority, url, cArgs, handler, hArgs, fHandler, sync,timeout){
	
	var connection;
	if(type=='GET'){
		connection = new GetConnection(priority, url, cArgs, handler, hArgs, this.em, fHandler, sync,timeout);
	} else if(type=='POST'){
		connection = new PostConnection(priority, url, cArgs, handler, hArgs, this.em, fHandler, sync,timeout);
	} else {
		alert('unknown connection type: ' + type + '\nExiting...');
		return;
	};
	
	this.queue.push(connection);
	this.launchNext();
};

/**
 * Sorts the queue according to priority and if the number of
 * requests does not exceed this.MAX, launches the next request
 */
ConnectionManager.prototype.launchNext = function(){
	if(this.queue.length>0){
		if(this.running<this.MAX){
			this.queue.sort(this.orderByPriority);
			var connection = this.queue.shift();
			
			var endName = this.generateEventName();
			var launchNextRequest = function(type, args, obj){obj.running --; obj.launchNext();};
			this.em.addEvent(endName);
			this.em.subscribe(endName, launchNextRequest, this);
			
			this.running ++;
			connection.startRequest(endName);
		};
	};
};

/**
 * Function used by array.sort to order by priority
 */
ConnectionManager.prototype.orderByPriority = function(a, b){
	if(a.priority < b.priority){ return -1};
	if(a.priority > b.priority){ return 1};
	if(a.priority == b.priority) { return 0};
};

/**
 * Generates a unique event name
 */
ConnectionManager.prototype.generateEventName = function(){
	while(true){
		var name = 'connectionEnded' + this.counter;
		if(!this.em.isEvent(name)){
			return name;
		};
		this.counter ++;
	};
};

/**
 * A Connection object encapsulates all of the necessary variables
 * to make an async request to an url
 */
function Connection(priority, url, cArgs, handler, hArgs, em, sync, timeout){
	this.em = em;
};

/**
 * Launches the request that this connection represents
 */
Connection.prototype.startRequest = function(eventName){
	this.en = eventName;

	$.ajax({type:this.type, url:this.url, error:this.failure, success:this.success, dataType:'text', data:this.params, context:this, timeout:(this.timeout ? this.timeout : null), async:(this.sync ? false : true)});
};

/**
 * parses and sets the necessary parameters for a POST request
 */
Connection.prototype.parseConnectionArgs = function(){
	var first = true;
	if(this.cArgs){
		this.params = '';
		for(var p in this.cArgs){
			if(first){
				first = false;
			} else {
				this.params += '&';
			}
			this.params += p + '=' + this.cArgs[p];
		}
	}
};

Connection.prototype.success = function(data, status, request) {
	/*
	 * check if the request status is 0 which means there was an error.
	 * this may occur because there is a bug in jquery where a request
	 * returns success even when there is no access to the internet, but
	 * the request status will be set to 0 which specifies an error
	 * as opposed to 200 for OK
	 */
	if(request.status == 0) {
		//call the failure function
		this.failure(request, status);
		return;
	}
	
	this.em.fire(this.en);
	if (request.responseText !='undefined' && request.responseText.match("login for portal") != null) {
		// this means that student has been idling too long and has been logged out of the session
		// so we should take them back to the homepage.
		var mode = "";
		
		try {
			//try to obtain the mode
			if(this.hArgs != null) {
				if(this.hArgs.length > 0) {
					if(this.hArgs[0].getConfig() != null) {
						mode = this.hArgs[0].getConfig().getConfigParam("mode");	
					}
				}
			}
		} catch(error) {
			//do nothing
		}
		
		if(mode == "grading") {
			//we are in grading mode
			alert("You have been inactive for too long and have been logged out. Please sign in to continue.");
			
			//redirect the teacher to the login page
			window.top.location = "/webapp/j_spring_security_logout";
		} else {
			if(notificationManager){
				notificationManager.notify("You have been inactive for too long and have been logged out. Please sign in to continue.",3);
			} else {
				alert("You have been inactive for too long and have been logged out. Please sign in to continue.");
			}
			
			//redirect the user to the login page
			window.top.location = "/webapp/j_spring_security_logout";			
		}
	} else if (this.handler) {
		this.handler(data, data, this.hArgs);
	}
	view.sessionManager.maintainConnection();  // update last connection time to maintain connection
};

Connection.prototype.failure = function(request, status, exception) {
	this.em.fire(this.en);
	if(this.fHandler){
		this.fHandler(status, this.hArgs);
	} else {
		var msg = 'Connection request failed: TEXT=' + status;
		if(notificationManager){
			notificationManager.notify(msg, 2);
		} else {
			alert(msg);
		}
	}
};

/**
 * a Child of Connection, a GetConnection Object represents a GET
 * async request
 */
GetConnection.prototype = new Connection();
GetConnection.prototype.constructor = GetConnection;
GetConnection.prototype.parent = Connection.prototype;
function GetConnection(priority, url, cArgs, handler, hArgs, em, fHandler, sync,timeout){
	this.type = 'GET';
	this.priority = priority;
	this.em = em;
	this.url = url;
	this.cArgs = cArgs,
	this.handler = handler;
	this.hArgs = hArgs;
	this.fHandler = fHandler;
	this.params = null;
	this.sync = sync;
	this.timeout = timeout;
	this.parseConnectionArgs();
};

/**
 * A child of Connection, a PostConnection object represents
 * an async POST request
 */
PostConnection.prototype = new Connection();
PostConnection.prototype.constructor = PostConnection;
PostConnection.prototype.parent = Connection.prototype;
function PostConnection(priority, url, cArgs, handler, hArgs, em, fHandler, sync, timeout){
	this.type = 'POST';
	this.priority = priority;
	this.em = em;
	this.url = url;
	this.cArgs = cArgs,
	this.handler = handler;
	this.hArgs = hArgs;
	this.fHandler = fHandler;
	this.params = null;
	this.sync = sync;
	this.timeout = timeout;
	this.parseConnectionArgs();
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/io/ConnectionManager.js');
};