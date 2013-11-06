/*
 * This is a seasons step object that developers can use to create new
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
 * TODO: in this file, change all occurrences of the word 'SEASONS' to the
 * name of your new step type
 * 
 * <new step type>
 * e.g. for example if you are creating a quiz step it would look
 * something like QUIZ
 */

/**
 * This is the constructor for the object that will perform the logic for
 * the step when the students work on it. An instance of this object will
 * be created in the .html for this step (look at seasons.html)
 * 
 * TODO: rename SEASONS
 */
function SEASONS(node, view) {
	this.node = node;
	this.view = view;
	this.content = node.getContent().getContentJSON();
	
	if(node.studentWork != null) {
		this.states = node.studentWork; 
	} else {
		this.states = [];  
	};
};

/**
 * This function renders everything the student sees when they visit the step.
 * This includes setting up the html ui elements as well as reloading any
 * previous work the student has submitted when they previously worked on this
 * step, if any.
 * 
 * TODO: rename SEASONS
 * 
 * note: you do not have to use 'promptDiv' or 'studentResponseTextArea', they
 * are just provided as examples. you may create your own html ui elements in
 * the .html file for this step (look at seasons.html).
 */
SEASONS.prototype.render = function() {
	// get type of model
	var modelType = this.content.modelType;
	
	if (modelType == "distanceAndShape") {		
		$("#modelIFrame").attr("src","/vlewrapper/vle/node/seasons/earth/seasons1-1.html");
	} else if (modelType == "distanceAndTemperature") {		
		$("#modelIFrame").attr("src","/vlewrapper/vle/node/seasons/earth/seasons1-2a.html");
	} else if (modelType == "tiltAndTemperature") {		
		$("#modelIFrame").attr("src","/vlewrapper/vle/node/seasons/earth/seasons1-3.html");
	} else if (modelType == "tiltAndHoursOfDaylight") {		
		$("#modelIFrame").attr("src","/vlewrapper/vle/node/seasons/earth/seasons4.html");
	} 	
};



/**
 * This function retrieves the latest student work
 * 
 * TODO: rename SEASONS
 * 
 * @return the latest state object or null if the student has never submitted
 * work for this step
 */
SEASONS.prototype.getLatestState = function() {
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
 * TODO: rename SEASONS
 * 
 * note: you do not have to use 'studentResponseTextArea', they are just 
 * provided as examples. you may create your own html ui elements in
 * the .html file for this step (look at seasons.html).
 */
SEASONS.prototype.save = function() {
	//get the answer the student wrote
	var seasons_activity = window.document.getElementById("modelIFrame").contentWindow.seasons_activity;
	var json_str = JSON.stringify(seasons_activity);
	console.log("save, json_str:" + json_str);
			
	/*
	 * create the student state that will store the new work the student
	 * just submitted
	 * 
	 * TODO: rename SEASONSSTATE
	 * 
	 * make sure you rename SEASONSSTATE to the state object type
	 * that you will use for representing student data for this
	 * type of step. copy and modify the file below
	 * 
	 * vlewrapper/WebContent/vle/node/seasons/seasonsstate.js
	 * 
	 * and use the object defined in your new state.js file instead
	 * of SEASONSSTATE. for example if you are creating a new
	 * quiz step type you would copy the file above to
	 * 
	 * vlewrapper/WebContent/vle/node/quiz/quizstate.js
	 * 
	 * and in that file you would define QUIZSTATE and therefore
	 * would change the SEASONSSTATE to QUIZSTATE below
	 */
	var seasonsState = new SEASONSSTATE(json_str);
	
	/*
	 * fire the event to push this state to the global view.states object.
	 * the student work is saved to the server once they move on to the
	 * next step.
	 */
	eventManager.fire('pushStudentWork', seasonsState);

	//push the state object into this or object's own copy of states
	this.states.push(seasonsState);
};

/**
 * Updates the content's prompt to match that of what the user input
 * 
 * TODO: rename TemplateNode
 */
SEASONS.prototype.modelIFrameLoaded = function(){
	var seasons_activity = window.document.getElementById("modelIFrame").contentWindow.seasons_activity;
	
	console.log("modelIFrameLoaded, seasons_activity:" + seasons_activity);
	//load any previous responses the student submitted for this step
	var latestState = this.getLatestState();
	
	if(latestState != null) {
		/*
		 * get the response from the latest state. the response variable is
		 * just provided as an example. you may use whatever variables you
		 * would like from the state object (look at seasonsstate.js)
		 */
		var json_str = latestState.response;
		console.log("modelIFrameLoaded, json_str:" + json_str);

		var state = JSON.parse(json_str);
		
		// TODO: UNCOMMENT WHEN setState is implemented.
		seasons_activity.fromJSON(state);
	}
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename seasons to your new folder name
	 * TODO: rename seasons.js
	 * 
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/quiz.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/seasons/seasons.js');
}