/*
 * This is a webApp step object that developers can use to create new
 * step types.
 * 
 * TODO: Copy this file and rename it to
 * 
 * <new step type>.js
 * e.g. for example if you are creating a quiz step it would look
 * something like quiz.js
 *
 * and then put the new file into the new folder
 * you created for your new step type
 *
 * your new folder will look something like
 * vlewrapper/WebContent/vle/node/<new step type>/
 *
 * e.g. for example if you are creating a quiz step it would look something like
 * vlewrapper/WebContent/vle/node/quiz/
 * 
 * 
 * TODO: in this file, change all occurrences of the word 'WebApp' to the
 * name of your new step type
 * 
 * <new step type>
 * e.g. for example if you are creating a quiz step it would look
 * something like Quiz
 */

/**
 * This is the constructor for the object that will perform the logic for
 * the step when the students work on it. An instance of this object will
 * be created in the .html for this step (look at webApp.html)
 * 
 * TODO: rename WebApp
 * 
 * @constructor
 */
function WebApp(node) {
	this.node = node;
	this.view = node.view;
	this.content = node.getContent().getContentJSON();
	
	if(node.studentWork != null) {
		this.states = node.studentWork; 
	} else {
		this.states = [];  
	};
	
	this.api = {
		thisWebApp:this,
		version:0.1,
		content:this.content,
		states:this.states
	};
	
	this.api.triggerSaveState = function(  ) { save(); };
	
	//function that saves a new node state to the local array of node states and also to the database
	this.api.save = function(response, successCallback, failureCallback, callbackData) { 
		//create the new node state
		var nodeState = new WebAppState(response);
		
		//add the new node state to this step's local copy of the node states
		this.states.push(nodeState);
		
		//save the node state to the database
		node.save(nodeState, successCallback, failureCallback, callbackData); 
	};
	
	this.api.getContentJSON = function() { 
		return this.content;
	};
	this.api.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
		// override by children
	};
	this.api.appReady = function() { console.log("app tells us it's ready"); };

	//function that gets the latest node state from this step's local copy of the node states
	this.api.getLatestState = function() {
		var latestState = null;
		
		if(this.thisWebApp != null) {
			//this calls WebApp.prototype.getLatestState() 
			latestState = this.thisWebApp.getLatestState();
		}
		
		return latestState;
	}
};

/**
 * This function renders everything the student sees when they visit the step.
 * This includes setting up the html ui elements as well as reloading any
 * previous work the student has submitted when they previously worked on this
 * step, if any.
 * 
 * TODO: rename WebApp
 * 
 * note: you do not have to use 'promptDiv' or 'studentResponseTextArea', they
 * are just provided as examples. you may create your own html ui elements in
 * the .html file for this step (look at webApp.html).
 */
WebApp.prototype.render = function() {
	
	
	var iframe = document.getElementById("ouriframe");
	console.log("SETTING THE HEIGHT TO " + this.content.height + " and the WIDTH to " + this.content.width);
	iframe.width = this.content.width;
	iframe.height = this.content.height;
	var mypath = this.view.config.getConfigParam("getContentBaseUrl") + "assets/";
	
	//display any prompts to the student
	$('#promptDiv').html(this.content.prompt);
	
	//NOTE: I do this last in proof of concept to detect if there were any surprise crashes in the above 
	if (this.content.url != null && this.content.url != "") {
		iframe.src = mypath + this.content.url;
	}
};

/**
 * This function retrieves the latest student work
 * 
 * TODO: rename WebApp
 * 
 * @return the latest state object or null if the student has never submitted
 * work for this step
 */
WebApp.prototype.getLatestState = function() {
	var latestState = null;
	
	//check if the states array has any elements
	if(this.states != null && this.states.length > 0) {
		//get the last state
		latestState = this.states[this.states.length - 1];
	} else {
		console.log("******There are NO prior states; loading initialState from the authored JSON, if it exists");
		var statestr = this.content.initialState;

		if ( statestr ) {  
			//it might be a JSON object itself... (that or a string)
			if ((typeof statestr) == 'object') {
				statestr = JSON.stringify(statestr);
			}
			console.log("going to load ... " + statestr);
			latestState = new WebAppState("",statestr,"");
		}
	}
	
	return latestState;
};

/**
 * This function retrieves the student work from the html ui, creates a state
 * object to represent the student work, and then saves the student work.
 * 
 * TODO: rename WebApp
 * 
 * note: you do not have to use 'studentResponseTextArea', they are just 
 * provided as examples. you may create your own html ui elements in
 * the .html file for this step (look at webApp.html).
 */
WebApp.prototype.save = function() {
	return;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename webApp to your new folder name
	 * TODO: rename webApp.js
	 * 
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/quiz.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/webApp/webApp.js');
}