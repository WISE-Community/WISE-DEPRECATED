/**
 * This is the constructor for the object that will perform the logic for
 * the step when the students work on it. An instance of this object will
 * be created in the .html for this step (look at surge.html)
 * @constructor
 */
function Flash(node) {
	this.node = node;
	this.view = node.view;
	this.content = node.getContent().getContentJSON();
	
	if(node.studentWork != null) {
		this.states = node.studentWork; 
	} else {
		this.states = [];  
	};
};

// Call as3 function in identified Flash applet
Flash.prototype.sendStateToFlash = function(value) {
	if (swfobject.getObjectById("flashContent")){
		swfobject.getObjectById("flashContent").importData(value);
	} else {
		if (window.console) console.log("Can't find importData function in Flash activity; no data loaded.");
	}
};

//Call as3 function in identified Flash applet
Flash.prototype.getStateFromFlash = function() {
	if(swfobject.getObjectById("flashContent")){
		return swfobject.getObjectById("flashContent").exportData();
	} else {
		if (window.console) console.log("Can't find exportData function in Flash activity; no data saved.");
	}
};

/**
 * This function renders everything the student sees when they visit the step.
 * This includes setting up the html ui elements as well as reloading any
 * previous work the student has submitted when they previously worked on this
 * step, if any.
 */
Flash.prototype.render = function() {
	var enableStep = true;
	var message = '';
	var workToImport = [];
	
	//process the tag maps if we are not in authoring mode
	if(this.view.authoringMode == null || !this.view.authoringMode) {
		//get the tag map results
		var tagMapResults = this.processTagMaps();
		
		//get the result values
		enableStep = tagMapResults.enableStep;
		message = tagMapResults.message;
		workToImport = tagMapResults.workToImport;
	}
	
	//display any prompts to the student
	$('#promptDiv').html(this.content.prompt);
	
	var width = this.content.width;
	var height = this.content.height;
	var minPlayerVersion = this.content.minPlayerVersion;
	var activity_uri = this.content.activity_uri;
	
	// flashvars can be used by authors to send starting parameters to the swf on load
	var flashvars = this.content.flashvars;
	
	// if data logging is enabled, add latest student work to the flashvars
	if(this.content.enableData){
		var lastState = '';
		// get latest student state
		if (flash.getLatestState()) {
			lastState = JSON.stringify(flash.getLatestState().response.data);
		} else if(workToImport != null && workToImport.length > 0) {
			/*
			 * the student does not have any previous work and there
			 * is work to import so we will use the work to import
			 */
			nodeState = workToImport[workToImport.length - 1];
			lastState = JSON.stringify(nodeState.response.data);
		}
		// add student data to flashvars (needs to be processed by Flash on load)
		flashvars.studentData = lastState;
	}

	var params = {};
	params.quality = "high";
	params.wmode = "opaque";
	params.allowscriptaccess = "sameDomain";
	var attributes = {};
	attributes.id = "flashContent";
	attributes.name = "flashContent";
	attributes.styleclass = "flashContent";
	swfobject.embedSWF(activity_uri, "alternateContent", width, height, minPlayerVersion, "/vlewrapper/vle/swfobject/expressInstall.swf", flashvars, params, attributes);	
};

/**
 * This function retrieves the latest student work in WISE
 *
 * @return the latest state object or null if the student has never submitted
 * work for this step
 */
Flash.prototype.getLatestState = function() {
	var latestState = null;
	
	//check if the states array has any elements
	if(this.states != null && this.states.length > 0) {
		//get the last state
		latestState = this.states[this.states.length - 1];
	}
	
	return latestState;
};

/**
 * This function retrieves the student work from the flash swf, creates a state
 * object to represent the student work, and then saves the student work.
 * 
 * note: you do not have to use 'studentResponseTextArea', they are just 
 * provided as examples. you may create your own html ui elements in
 * the .html file for this step (look at surge.html).
 */
Flash.prototype.save = function() {
	if(this.content.enableData){
		var studentData = flash.getStateFromFlash();
		
		if(studentData && typeof studentData != "undefined"){
			var stateJSON = JSON.parse(studentData);
			
			var latestState = this.getLatestState();
			if(latestState && typeof latestState != "undefined"){
				latestState = JSON.parse(JSON.stringify(latestState.response)); // not sure why, but stringify and re-parse is necessary for _.isEqual comparison to work correctly here
			}
			
			// check to see whether data has changed, if so add new state
			if(!_.isEqual(stateJSON, latestState)){
				/*
				 * create the student state that will store the new work the student
				 * just submitted
				 */
				var flashState = new FlashState(stateJSON);
				
				/*
				 * fire the event to push this state to the global view.states object.
				 * the student work is saved to the server once they move on to the
				 * next step.
				 */
				this.view.pushStudentWork(this.node.id, flashState);
				
				//push the state object into this or object's own copy of states
				this.states.push(flashState);
			 }
		}
	}
};

/**
 * Process the tag maps and obtain the results
 * @return an object containing the results from processing the
 * tag maps. the object contains three fields
 * enableStep
 * message
 * workToImport
 */
Flash.prototype.processTagMaps = function() {
	var enableStep = true;
	var message = '';
	var workToImport = [];
	
	//the tag maps
	var tagMaps = this.node.tagMaps;
	
	//check if there are any tag maps
	if(tagMaps != null) {
		
		//loop through all the tag maps
		for(var x=0; x<tagMaps.length; x++) {
			
			//get a tag map
			var tagMapObject = tagMaps[x];
			
			if(tagMapObject != null) {
				//get the variables for the tag map
				var tagName = tagMapObject.tagName;
				var functionName = tagMapObject.functionName;
				var functionArgs = tagMapObject.functionArgs;
				
				if(functionName == "importWork") {
					//get the work to import
					workToImport = this.node.getWorkToImport(tagName, functionArgs);
				} else if(functionName == "showPreviousWork") {
					//show the previous work in the previousWorkDiv
					this.node.showPreviousWork($('#previousWorkDiv'), tagName, functionArgs);
				} else if(functionName == "checkCompleted") {
					//we will check that all the steps that are tagged have been completed
					
					//get the result of the check
					var result = this.node.checkCompleted(tagName, functionArgs);
					enableStep = enableStep && result.pass;
					
					if(message == '') {
						message += result.message;
					} else {
						//message is not an empty string so we will add a new line for formatting
						message += '<br>' + result.message;
					}
				}
			}
		}
	}
	
	if(message != '') {
		//message is not an empty string so we will add a new line for formatting
		message += '<br>';
	}
	
	//put the variables in an object so we can return multiple variables
	var returnObject = {
		enableStep:enableStep,
		message:message,
		workToImport:workToImport
	};
	
	return returnObject;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/flash/flash.js');
}