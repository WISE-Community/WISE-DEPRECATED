/**
 * An object for handling custom events. Allows adding,
 * removing, subscribing, and firing of events. Optionally,
 * a built in loading manager can be used but that requires jquery
 * scripts be loaded and a predefined div element.
 * 
 * @author patrick lawler
 */
function EventManager(enableAlerts){
	this.events = [];
	this.enableAlerts = enableAlerts;
	this.loadingManager;
};

/**
 * Alerts the given msg if enableAlerts = true
 */
EventManager.prototype.eventAlert = function(msg){
	if(this.enableAlerts){
		alert(msg);
	};
};

/**
 * Returns whether the given type is already an event.
 */
EventManager.prototype.isEvent = function(type){
	for(var b=0;b<this.events.length;b++){
		if(this.events[b].type==type){
			return true;
		};
	};
	return false;
};

/**
 * Initializes the loading manager with the given args.
 */
EventManager.prototype.initializeLoading = function(args, fixedCenter){
	this.loadingManager = new LoadingManager(this, fixedCenter);
	this.loadingManager.initialize(args);
};

/**
 * Adds a new event.
 * 
 * @param type - type or name of event (required)
 * @param args - list of arguments or custom object (optional)
 * 
 * @return Event - the newly created event
 */
EventManager.prototype.addEvent = function(type, args, obj){
	if(!type || type==''){
		this.eventAlert('Cannot create an event without a type!');
	} else if(this.isEvent(type)){
		this.eventAlert('An event of this type already exists.');
	} else {
		var ev = new Event(type, args);
		this.events.push(ev);
		return ev;
	};
};

/**
 * Subscribes the given handler to the given event with the given args
 * and returns that event.
 */
EventManager.prototype.subscribe = function(type, handler, obj){
	for(var a=0;a<this.events.length;a++){
		var ev = this.events[a];
		if(ev.type==type){
			ev.subscribe(handler,obj);
			return ev;
		};
	};
	
	this.eventAlert('Could not find event of type: ' + type + ' to subscribe to!');
};

/**
 * Fires the event of the given type, passing in the given args
 */
EventManager.prototype.fire = function(type, args){
	for(var d=0;d<this.events.length;d++){
		var ev = this.events[d];
		if(ev.type==type){
			ev.fire(args);
			return;
		};
	};
	
	this.eventAlert('Could not find event of type: ' + type + ' to fire!');
};

/**
 * Removes the given event if it exists
 */
EventManager.prototype.removeEvent = function(type){
	for(var e=0;e<this.events.length;e++){
		var ev = this.events[e];
		if(ev.type==type){
			this.events.splice(e, 1);
			return;
		};
	};
	
	eventAlert('Could not find event of type: ' + type + ' to remove!');
};

/**
 * Generates and returns a unique event name. If a base is provided, the return
 * event name will begin with the given base.
 */
EventManager.prototype.generateUniqueEventName = function(base){
	var base = base;
	var count = 0;
	
	if(!base){
		base = '';
	};
	
	while(true){
		var newEventName = base + count;
		if(!this.isEvent(newEventName)){
			return newEventName;
		};
		count ++;
	};
};

/**
 * An Event object represents a custom event.
 */
function Event(type, args){
	this.type = type;
	this.args = args;
	this.handlers = [];
	this.objs = [];
	
	//set to empty array if not specified for easy concatenation later
	if(!this.args){
		this.args = [];
	};
};

/**
 * Subscribes the given handler to this event and will pass the given
 * args and obj to the handler when the event is fired.
 * 
 * @param handler
 * @param args
 * @param obj
 */
Event.prototype.subscribe = function(handler, obj){
	this.handlers.push(handler);
	this.objs.push(obj);
};

/**
 * Fires this event (calls all handler functions) passing in the
 * event args, subscriber args and passed in args along with the
 * subscriber obj to eache of the handlers.
 * 
 * @param args
 */
Event.prototype.fire = function(args){
	if(typeof args == "undefined"){//set to empty array for easy concatenation later
		args = [];
	};
	
	var finalArgs = this.args.concat(args);
	for(var c=0;c<this.handlers.length;c++){
		if(finalArgs.length>0){
			this.handlers[c](this.type, finalArgs, this.objs[c]);
		} else {
			this.handlers[c](this.type, null, this.objs[c]);
		};
	};
};


/**
 * Loading Manager registers the specified events and
 * displays a loading screen when the start event is fired
 * and removes the screen when the end event is fired. It
 * displays which events are currently being loaded
 * while the loading screen is up
 * @param fixedCenter whether the loading message should
 * be placed in the middle of the window, if nothing is
 * passed in, the default will be true. in the case
 * of grading, we want it to be false because the grading
 * window is very tall and the user would not see the
 * loading message if it was placed in the middle of
 * the window which would be off the bottom of the page
 */
function LoadingManager(em, fixedCenter){
	this.loading;
	this.loads = [];
	this.eventManager = em;
	
	this.initializeOverlay(fixedCenter);
};

/**
 * Initializes the overlay that is to be used for the
 * loading messages. The html page must have a div element
 * with id=loading as well as 3 child div elements with ids = 
 * hd, bd, ft respectively
 * @param fixedCenter whether or not to display the loading
 * message in the middle of the window
 */
LoadingManager.prototype.initializeOverlay = function(fixedCenter){
	$('#loading div.bd').html("<br /><img src='images/loading.gif'/>");;
	$('#loading').dialog({
		autoOpen:false,
		width:300,
		height:110,
		modal:true,
		draggable:false,
		resizable:false,
		closeText:'',
		dialogClass:'no-title'
	});
};

/**
 * Takes in args, which must be a list of lists. Each of the
 * internal lists must contain 3 arguments: the load event,
 * the unload event, and the message to display while the event
 * is loading.
 */
LoadingManager.prototype.initialize = function(args){
	var doLoad = function(type, args, obj){
		for(var a=0;a<obj.loads.length;a++){
			if(obj.loads[a].loadEvent == type){
				obj.loads[a].active = true;
				obj.changeLoading();
			}
		}
	};
	
	var doUnload = function(type, args, obj){
		for(var b=0;b<obj.loads.length;b++){
			if(obj.loads[b].unloadEvent == type){
				obj.loads[b].active = false;
				obj.changeLoading();
			}
		}
	};
	
	for(var i=0;i<args.length;i++){
		var loadingObj = {
				loadEvent: args[i][0],
				unloadEvent: args[i][1],
				message: args[i][2],
				active:false
		};
		
		this.loads.push(loadingObj);
		this.eventManager.subscribe(args[i][0], doLoad, this);
		this.eventManager.subscribe(args[i][1], doUnload, this);
	}
};

/**
 * changeLoading is called when either a start or end event
 * that it initialized has been fired. It determines which
 * event and whether it is beginning or ending and displays
 * or removes the loading screen and displays the appropriate
 * message
 */ 
LoadingManager.prototype.changeLoading = function(){
	var hasLoads = false;
	var text = 'Loading: ';
	
	/* check to see if any loads are active and add their messages to the text */
	for(var c=0;c<this.loads.length;c++){
		if(this.loads[c].active){
			hasLoads = true;
			text += this.loads[c].message + ' & ';
		}
	}
	
	if(hasLoads){
		/* remove trailing ' & ' from text before setting header */
		$('#loading div.hd').html(text.substring(0, text.length - 3));
		$('#loading').dialog('open');
	} else {
		$('#loading div.hd').html('');
		$('#loading').dialog('close');
	}
};