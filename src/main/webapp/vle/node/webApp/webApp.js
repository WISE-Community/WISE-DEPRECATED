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
		"version":0.1
	};
	
	this.api.triggerSaveState = function(  ) { save(); };
	this.api.appReady = function() { console.log("app tells us it's ready"); };
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
	
	//load any previous responses the student submitted for this step
	var latestState = this.getLatestState();
	var latestResponse = "";
	if(latestState != null) {
		/*
		 * get the response from the latest state. the response variable is
		 * just provided as an example. you may use whatever variables you
		 * would like from the state object (look at webAppState.js)
		 */
		latestResponse = latestState.response;
	}
	//set the previous student work into the text area
	$('#studentResponseTextArea').val(latestResponse);
	
	console.log("setting up getLatestState API call......");
	this.api.getLatestState = function() { console.log("using api's getLatestState"); return latestState; }
	console.log(".....it is expected to return " + latestState);
	
	//NOTE: I do this last in proof of concept to detect if there were any surprise crashes in the above 
	iframe.src = mypath + this.content.url;
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
	console.log("DEBUG: entered function save() in testType.js");
	//get the answer the student wrote
	var response = document.getElementById('studentResponseTextArea').value;
	
	var stateGetter = document.getElementById("ouriframe").contentWindow.provideStateString;
	var gradingHTMLGetter = document.getElementById("ouriframe").contentWindow.provideGradingViewHTML
	
	if ( stateGetter && gradingHTMLGetter ) {
		var statestring = document.getElementById("ouriframe").contentWindow.provideStateString();
		var gradingHTML = document.getElementById("ouriframe").contentWindow.provideGradingViewHTML();
	
		console.log("DEBUG:  grading view HTML=" + gradingHTML);
		console.log("DEBUG:  State string data=" + statestring);
		console.log("DEBUG:  response data = " + response);
	
	
		var webAppState = new WebAppState(response, statestring, gradingHTML);
		console.log(webAppState);
		/*
		 * fire the event to push this state to the global view.states object.
		 * the student work is saved to the server once they move on to the
		 * next step.
		 */
		this.view.pushStudentWork(this.node.id, webAppState);

		//push the state object into this or object's own copy of states
		this.states.push(webAppState);
		console.log(this.states);
		console.log("there are " + this.states.length + " states");
	}
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