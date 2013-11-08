/*
 * This is a seasons2 step object that developers can use to create new
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
 * TODO: in this file, change all occurrences of the word 'SEASONS2' to the
 * name of your new step type
 *
 * <new step type>
 * e.g. for example if you are creating a quiz step it would look
 * something like QUIZ
 */

/**
 * This is the constructor for the object that will perform the logic for
 * the step when the students work on it. An instance of this object will
 * be created in the .html for this step (look at seasons2.html)
 *
 * TODO: rename SEASONS2
 */
function SEASONS2(node, view) {
	this.node = node;
	this.view = node.view;
	this.content = node.getContent().getContentJSON();

	if(node.studentWork != null) {
		this.states = node.studentWork;
	} else {
		this.states = [];
	};
	
	this.workToImport = [];
};

/**
 * This function renders everything the student sees when they visit the step.
 * This includes setting up the html ui elements as well as reloading any
 * previous work the student has submitted when they previously worked on this
 * step, if any.
 *
 * TODO: rename SEASONS2
 *
 * note: you do not have to use 'promptDiv' or 'studentResponseTextArea', they
 * are just provided as examples. you may create your own html ui elements in
 * the .html file for this step (look at seasons2.html).
 */
SEASONS2.prototype.render = function() {
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
	
	if(workToImport != null) {
		this.workToImport = workToImport;
	}
	
	// get type of model
	var modelType = this.content.modelType;

	if (modelType == "whatIstheShapeofEarthsOrbit") {
		$("#modelIFrame").attr("src","/vlewrapper/vle/node/seasons2/earth/seasons1-1.html");
	} else if (modelType == "whatTemperaturePatternsDoYouSee") {
		$("#modelIFrame").attr("src","/vlewrapper/vle/node/seasons2/earth/seasons1-2.html");
	} else if (modelType == "whatTemperaturePatternsDoYouSeeLite") {
		$("#modelIFrame").attr("src","/vlewrapper/vle/node/seasons2/earth/seasons1-2-lite.html");
	} else if (modelType == "howDoesEarthsTiltAffectTemperature") {
		$("#modelIFrame").attr("src","/vlewrapper/vle/node/seasons2/earth/seasons1-3.html");
	} else if (modelType == "howDoesEarthsTiltAffectTemperatureLite") {
		$("#modelIFrame").attr("src","/vlewrapper/vle/node/seasons2/earth/seasons1-3-lite.html");
	} else if (modelType == "howDoesEarthsTiltAffectHoursOfDaylight") {
		$("#modelIFrame").attr("src","/vlewrapper/vle/node/seasons2/earth/seasons1-4.html");
	} else if (modelType == "howDoesEarthsTiltAffectHoursOfDaylightLite") {
		$("#modelIFrame").attr("src","/vlewrapper/vle/node/seasons2/earth/seasons1-4-lite.html");
	}
};



/**
 * This function retrieves the latest student work
 *
 * TODO: rename SEASONS2
 *
 * @return the latest state object or null if the student has never submitted
 * work for this step
 */
SEASONS2.prototype.getLatestState = function() {
	var latestState = null;

	//check if the states array has any elements
	if(this.states != null && this.states.length > 0) {
		//get the last state
		latestState = this.states[this.states.length - 1];
	}

	return latestState;
};

/**
 * This function retrieves the student work from the html ui, creates a state
 * object to represent the student work, and then saves the student work.
 *
 * TODO: rename SEASONS2
 *
 * note: you do not have to use 'studentResponseTextArea', they are just
 * provided as examples. you may create your own html ui elements in
 * the .html file for this step (look at seasons2.html).
 */
SEASONS2.prototype.save = function() {
	//get the answer the student wrote
	var seasons_activity = window.document.getElementById("modelIFrame").contentWindow.seasons_activity;
	var json_str = JSON.stringify(seasons_activity);
	console.log("save, json_str:" + json_str);

	/*
   * create the student state that will store the new work the student
   * just submitted
   *
   * TODO: rename SEASONS2STATE
   *
   * make sure you rename SEASONS2STATE to the state object type
   * that you will use for representing student data for this
   * type of step. copy and modify the file below
   *
   * vlewrapper/WebContent/vle/node/seasons2/seasons2state.js
   *
   * and use the object defined in your new state.js file instead
   * of SEASONS2STATE. for example if you are creating a new
   * quiz step type you would copy the file above to
   *
   * vlewrapper/WebContent/vle/node/quiz/quizstate.js
   *
   * and in that file you would define QUIZSTATE and therefore
   * would change the SEASONS2STATE to QUIZSTATE below
   */
	var seasons2State = new SEASONS2STATE(json_str);

	/*
   * fire the event to push this state to the global view.states object.
   * the student work is saved to the server once they move on to the
   * next step.
   */
	this.view.pushStudentWork(this.node.id, seasons2State);

	//push the state object into this or object's own copy of states
	this.states.push(seasons2State);
};

/**
 * Updates the content's prompt to match that of what the user input
 *
 * TODO: rename TemplateNode
 */
SEASONS2.prototype.modelIFrameLoaded = function(){
	var seasons_activity = window.document.getElementById("modelIFrame").contentWindow.seasons_activity;

	console.log("modelIFrameLoaded, seasons_activity:" + seasons_activity);
	//load any previous responses the student submitted for this step
	var latestState = this.getLatestState();

	if(latestState == null && this.workToImport != null && this.workToImport.length > 0) {
		latestState = workToImport[workToImport.length - 1];
	}
	 
	if(latestState != null) {
		/*
     * get the response from the latest state. the response variable is
     * just provided as an example. you may use whatever variables you
     * would like from the state object (look at seasons2state.js)
     */
		var json_str = latestState.response;
		console.log("modelIFrameLoaded, json_str:" + json_str);

		var state = JSON.parse(json_str);

		// TODO: UNCOMMENT WHEN setState is implemented.
		seasons_activity.fromJSON(state);
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
SEASONS2.prototype.processTagMaps = function() {
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
	/*
   * TODO: rename seasons2 to your new folder name
   * TODO: rename seasons2.js
   *
   * e.g. if you were creating a quiz step it would look like
   *
   * eventManager.fire('scriptLoaded', 'vle/node/quiz/quiz.js');
   */
	eventManager.fire('scriptLoaded', 'vle/node/seasons2/seasons2.js');
}