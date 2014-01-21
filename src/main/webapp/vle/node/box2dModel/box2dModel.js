/*
 * This is a box2dModel step object that developers can use to create new
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
 * TODO: in this file, change all occurrences of the word 'Box2dModel' to the
 * name of your new step type
 * 
 * <new step type>
 * e.g. for example if you are creating a quiz step it would look
 * something like Quiz
 */

/**
 * This is the constructor for the object that will perform the logic for
 * the step when the students work on it. An instance of this object will
 * be created in the .html for this step (look at box2dModel.html)
 * 
 * TODO: rename Box2dModel
 * 
 * @constructor
 */
function Box2dModel(node) {
	this.node = node;
	this.view = node.view;
	this.content = node.getContent().getContentJSON();
	if(node.studentWork != null) {
		this.states = node.studentWork; 
	} else {
		this.states = [];  
	};
	var d = new Date();
	this.timestamp = d.getTime();

};

/**
 * Find the previous models for all the steps that have the given tag and occur
 * before the current step in the project
 * @param tagName the tag name
 * @param functionArgs the arguments to this function
 * @returns the results from the check, the result object
 * contains an array of previous saved models
 */
Box2dModel.prototype.checkPreviousModelsForTags = function(tagName, functionArgs) {
	//default values for the result
	var result = {
		"previousModels":[]
	};
	
	if (typeof this.view.getProject != "undefined")
	{
		//the node ids of the steps that come before the current step and have the given tag
		var nodeIds = this.view.getProject().getPreviousNodeIdsByTag(tagName, this.node.id);
		if(nodeIds != null) {
			//loop through all the node ids that come before the current step and have the given tag
			for(var x=0; x<nodeIds.length; x++) {
				//get a node id
				var nodeId = nodeIds[x];
				
				if(nodeId != null) {
					//get the latest work for the node
					var latestWork = this.view.getState().getLatestWorkByNodeId(nodeId);
					//console.log(latestWork, latestWork.response.savedModels, result.previousModels,  result.previousModels.concat(latestWork.response.savedModels))
					if (typeof latestWork.response !== "undefined"){
						result.previousModels = result.previousModels.concat(latestWork.response.savedModels);					
						result.custom_objects_made_count = latestWork.response.custom_objects_made_count;
					}
				}
			}
		}		
	}
	return result;
};

/**
 * Find a value from a table
 * before the current step in the project
 * @param tagName the tag name
 * @param functionArgs the arguments to this function
 * @returns the results from the check, the result object
 * contains an array of previous saved models
 */
Box2dModel.prototype.checkTableForValue = function(tagName, functionArgs) {
	//default values for the result
	var result = -1;
	
	if (typeof this.view.getProject != "undefined")
	{
		//the node ids of the steps that come before the current step and have the given tag
		var nodeIds = this.view.getProject().getPreviousNodeIdsByTag(tagName, this.node.id);
		if(nodeIds != null) {
			//loop through all the node ids that come before the current step and have the given tag
			for(var x=0; x<nodeIds.length; x++) {
				//get a node id
				var nodeId = nodeIds[x];
				
				if(nodeId != null) {
					//get the latest work for the node
					var latestWork = this.view.getState().getLatestWorkByNodeId(nodeId);
					if (latestWork != null && latestWork != "" && typeof functionArgs != "undefined" && !isNaN(Number(functionArgs[0])) && !isNaN(Number(functionArgs[1]))){
						var text = latestWork.tableData[Number(functionArgs[0])][Number(functionArgs[1])].text;
						if (!isNaN(Number(text))) result = Number(text);
					}
				}
			}
		}		
	}
	return result;
};


/**
 * This function renders everything the student sees when they visit the step.
 * This includes setting up the html ui elements as well as reloading any
 * previous work the student has submitted when they previously worked on this
 * step, if any.
 * 
 * TODO: rename Box2dModel
 * 
 * note: you do not have to use 'promptDiv' or 'studentResponseTextArea', they
 * are just provided as examples. you may create your own html ui elements in
 * the .html file for this step (look at box2dModel.html).
 */
Box2dModel.prototype.render = function() {
	//display any prompts to the student
	$('#promptDiv').html(this.content.prompt);
	
	var previousModels = [];
	var custom_objects_made_count = 0;
	var density = -2;
	var tableData = null;
	//process the tag maps if we are not in authoring mode
	if(typeof this.view.authoringMode === "undefined" || this.view.authoringMode == null || !this.view.authoringMode) {
		var tagMapResults = this.processTagMaps();
		//get the result values
		if (typeof tagMapResults.previousModels !== "undefined") previousModels = tagMapResults.previousModels;
		if (typeof tagMapResults.custom_objects_made_count !== "undefined") custom_objects_made_count = tagMapResults.custom_objects_made_count;
		if (typeof tagMapResults.density !== "undefined") density = tagMapResults.density;		
	}

	//load any previous responses the student submitted for this step
	var latestState = this.getLatestState();
	
	if(latestState != null) {
		/*
		 * get the response from the latest state. the response variable is
		 * just provided as an example. you may use whatever variables you
		 * would like from the state object (look at box2dModelState.js)
		 */
		var latestResponse = latestState.response;
		if (typeof latestResponse != "undefined"){
		 	previousModels = latestResponse.savedModels.concat(previousModels);
		 	// remove any models with a repeat id
		 	var model_ids = [];
		 	for (var i = previousModels.length-1; i >= 0; i--){
		 		var match_found = false;
		 		for (var j = 0; j < model_ids.length; j++){
		 			if (model_ids[j] == previousModels[i].id){
		 				previousModels.splice(i, 1);
		 				match_found = true;
		 				break;
		 			}
		 		}
		 		if (!match_found) model_ids.push(previousModels[i].id);
		 	}
		 	tableData = latestResponse.tableData.slice();
		 	custom_objects_made_count = Math.max(custom_objects_made_count, latestResponse.custom_objects_made_count);
		 }
		
		//set the previous student work into the text area
		$('#studentResponseTextArea').val(latestResponse); 
	}

	// setup the event logger and feedbacker
	if (typeof this.content.feedbackEvents != "undefined"){
		this.feedbackManager =  new FeedbackManager(this.node, this.content.feedbackEvents, this.node.customEventTypes) ;
	} else {
		this.feedbackManager =  new FeedbackManager(this.node, [], this.node.customEventTypes) ;
		this.node.setCompleted();
	}

	if (typeof tester == "undefined" || tester == null){ // if we are already in this step, the following is unnecessary
		init(box2dModel.content, previousModels, density >= 0 ? density : undefined, tableData, custom_objects_made_count);
	}
	//eventManager.fire("box2dInit", [{}], this);
	//this.view.pushStudentWork(this.node.id, {});
};

/**
 * Process the tag maps and obtain the results
 * @return an object containing the results from processing the
 * tag maps. the object contains two fields
 * enableStep
 * message
 */
Box2dModel.prototype.processTagMaps = function() {
	
	var previousModels = [];
	var custom_objects_made_count = 0;
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
				
				if(functionName == "getPreviousModels") {
					
					//get the result of the check
					var result = this.checkPreviousModelsForTags(tagName, functionArgs);					
					previousModels = previousModels.concat(result.previousModels);
					custom_objects_made_count += result.custom_objects_made_count;
				} else if (functionName == "getValueFromTableForDensity"){
					var density = this.checkTableForValue(tagName, functionArgs);
				}
			}
		}
	}
	var returnObject = {};
	if (previousModels.length > 0){ 
		//put the variables in an object so we can return multiple variables
		returnObject = {"previousModels":previousModels, "custom_objects_made_count":custom_objects_made_count}; 
	} else if (typeof density != "undefined"){
		returnObject = {"density":density}; 
	}
	
	return returnObject;
};

/**
 * This function retrieves the latest student work
 * 
 * TODO: rename Box2dModel
 * 
 * @return the latest state object or null if the student has never submitted
 * work for this step
 */
Box2dModel.prototype.getLatestState = function() {
	var latestState = null;
	
	//check if the states array has any elements
	if(this.states != null && this.states.length > 0) {
		//get the last state
		latestState = this.states[this.states.length - 1];
	}
	
	return latestState;
};



/**
 * When an event that is exclusive to Box2dModel is fired it is interpreted here.
 * For each row creates a "row" of the following data, which is then structured into a table
 * id 	|	total_mass	|	total_volume	| total_density |	enclosed_mass |	enclosed_volume	| enclosed_density 
 * volume_displaced | sink_or_float | percent_submerged	 | percent_above_ | tested_in_beaker  | tested_on_scale   | tested_on_balance  
 * @param type, args, obj
 * @return 
 */
Box2dModel.prototype.interpretEvent = function(type, args, obj) {
	var evt = {};
	evt.type = type;
	var d = new Date();
	evt.time = d.getTime() - this.timestamp;
	evt.models = []; // models used in this event
	evt.details = {}; // extra details about this event
	// update model table so that when we check this event the corresponding models will be on the table
	// was orignally in save, but put it here instead - still only doing for make/delete/test
	var tableData = GLOBAL_PARAMETERS.tableData;
	
	// loop through args looking for "Obj" models (including premades)
	for (var a = 0; a < args.length; a++){
		if ( (typeof args[a].id !== "undefined" && args[a].id.substr(0,3) == "Obj") || (typeof args[a].premade_name !== "undefined" && args[a].premade_name != null && args[a].premade_name.length > 0)){
			var model = {};
			model.id = args[a].id;
			model.Materials = typeof args[a].unique_materials !== "undefined" ? args[a].unique_materials.slice().sort().toString() : "";
			model.Total_Volume = args[a].total_volume;
			model.Widths = typeof args[a].widths !== "undefined" ? args[a].widths.toString().replace(/,/g,", ") : undefined;
			model.Heights = typeof args[a].heights !== "undefined" ? args[a].heights.toString().replace(/,/g,", ") : undefined;
			model.Depths = typeof args[a].depths !== "undefined" ? args[a].depths.toString().replace(/,/g,", ") : undefined;
			model.Width = args[a].max_width;
			model.Height = args[a].max_height;
			model.Depth = args[a].max_depth;
			model.Total_Mass = args[a].mass;
			model.Total_Density = model.Total_Mass / model.Total_Volume;
			model.Material_Mass = args[a].mass;
			model.Material_Volume = args[a].material_volume;
			model.Material_Density = model.Material_Mass / model.Material_Volume;
			model.Open_Mass = 0;
			model.Open_Volume = args[a].interior_volume;
			model.Open_Density = 0;
			model.Tested_on_Scale = 0;
			model.Tested_on_Balance = 0;
			// cycle through each liquid to gather data
			for (var i = 0; i < GLOBAL_PARAMETERS.liquids_in_world.length; i++){
				var liquid_name = GLOBAL_PARAMETERS.liquids_in_world[i];
				var liquid_density = GLOBAL_PARAMETERS.liquids[liquid_name].density;
				if (model.Total_Density > liquid_density){
					model["Sink_in_"+liquid_name] = "Sink";
				} else {
					model["Sink_in_"+liquid_name] = "Float";
				}
				model["Percent_Submerged_in_"+liquid_name] = Math.min(1, model.Total_Density / liquid_density);
				model["Percent_Above_"+liquid_name] = 1 - model["Percent_Submerged_in_"+liquid_name];
				model["Volume_Displaced_in_"+liquid_name] = model.Total_Volume * model["Percent_Submerged_in_"+liquid_name];
				model["Mass_Displaced_in_"+liquid_name] = liquid_density * model.Total_Volume * model["Percent_Submerged_in_"+liquid_name];
				model["Tested_in_"+liquid_name] = 0;
			}
			if (evt.type == "add-to-beaker" || evt.type == "test-in-beaker" || evt.type == "remove-from-beaker"){
				model["Tested_in_"+args[1].liquid_name] = 1;
			} else if (evt.type == "add-to-scale" || evt.type == "test-on-scale" || evt.type == "remove-from-scale"){
				model["Tested_on_Scale"] = 1;
			} else if (evt.type == "add-to-balance" || evt.type == "test-on-balance" || evt.type == "remove-from-balance"){
				model["Tested_on_Balance"] = 1;
			}

			// create a new model in tableData if id is not found
			if (evt.type == "make-model" || evt.type == "duplicate-model"){
				var id_found = false;
				for (var i = 0; i < tableData.length; i++){
					if (tableData[i][0].text == "id"){
						for (var j=1; j < tableData[i].length; j++){
							if (tableData[i][j].text == model.id){
								id_found = true; break;
							}
						}
						break;
					}
				}
				if (!id_found){
					for (var i = 0; i < tableData.length; i++){
						if (typeof model[tableData[i][0].text] !== "undefined"){
							tableData[i].push({"text":model[tableData[i][0].text], "uneditable":true});
						} else {
							tableData[i].push({"text":"", "uneditable":true});
						}
					}
				}
			}
			// remove a model
			if (evt.type == "delete-model" || evt.type == "revise-model"){
				for (var i = 0; i < tableData.length; i++){
					if (tableData[i][0].text == "id"){
						for (var j=1; j < tableData[i].length; j++){
							if (tableData[i][j].text == model.id){
								for (var k = 0; k < tableData.length; k++){
									tableData[k].splice(j, 1)
								}
							}
						}
					}
				}
			}
			// on test update the "Tested_in" or "Tested_on" column
			if (evt.type.substr(0,4) == "test" || evt.type.substr(0,7) == "add-to-"){
				// run through keys of model looking for positive tests, then update column in tableData
				for (var key in model){
					if (key.substr(0,6) == "Tested" && model[key] == 1){
						// find id on table
						for (var i=0; i < tableData.length; i++){
							if (tableData[i][0].text == "id"){
								for (var j=1; j < tableData[i].length; j++){
									if (tableData[i][j].text == model.id){
										// search for the column matching the test
										for (var k=0; k < tableData.length; k++){
											if (tableData[k][0].text == key){
												tableData[k][j].text = 1;
											}
										}
									}
								}
							}
						}
					}
				}
			}
			evt.models.push(model);
		} else {
			// in cases where the argument is not an "Obj" (object model), just attach all keys to the evt directly
			for (var key in args[a]){
				evt.details[key] = args[a][key];
			}
		}
	}

	var isStepCompleted = true;
	// delete args
	// run event through feedback manager
	if (typeof obj.feedbackManager !== "undefined" && obj.feedbackManager != null && evt.type != "gave-feedback"){
		 var f = obj.feedbackManager.checkEvent(evt, tableData);
		 if (f != null){
		 	eventManager.fire("gave-feedback",[f]);
		 }

		 isStepCompleted = obj.feedbackManager.completed;
		 // trick to get student constraints to end
		 //if (isStepCompleted){this.view.pushStudentWork(this.node.id, {});}
	}

	// save on a make, or delete
	//if (evt.type == "make-model" || evt.type == "delete-model" || evt.type == "revise-model" || evt.type == "duplicate-model"){
	//	obj.save(evt);
	//}	
	eventManager.fire('studentWorkUpdated', [this.node.id, this.view.getState().getNodeVisitsByNodeId(this.node.id)]);
}

/**
 * This function retrieves the student work from the html ui, creates a state
 * object to represent the student work, and then saves the student work.
 * 
 * TODO: rename Box2dModel
 * 
 * note: you do not have to use 'studentResponseTextArea', they are just 
 * provided as examples. you may create your own html ui elements in
 * the .html file for this step (look at box2dModel.html).
 */
Box2dModel.prototype.save = function(evt) {
	//get the answer the student wrote
	//var response = $('#studentResponseTextArea').val();
	if (typeof evt === "undefined") evt = {"type":"server"};

	var response = {};
	//load with objects from library
	response.images = [];
	response.savedModels = GLOBAL_PARAMETERS.objects_made.slice();
	
	// for each savedModel attach an associated image if model is not deleted
	
	for (i = 0; i < response.savedModels.length; i++){
		if (typeof response.savedModels[i] === "undefined" || !response.savedModels[i].is_deleted){
			var id = response.savedModels[i].id;
			// go through all images looking for this id
			for (var j = 0; j < GLOBAL_PARAMETERS.images.length; j++){
				var img = GLOBAL_PARAMETERS.images[j];
				if (img.id == id){
					response.images.push(img);
				}
			}	
		}
	}
	response.custom_objects_made_count = GLOBAL_PARAMETERS.custom_objects_made_count;
	response.tableData = GLOBAL_PARAMETERS.tableData;

	// save event history
	response.history = this.feedbackManager.getHistory(250000);
	var latestState = this.getLatestState();
	// only save if history is different from previous - otherwise we're just adding unnecessary data
	if (((latestState == null || typeof latestState.response.history === "undefined" ) && response.history.length > 0) ||
		(typeof latestState.response.history !== "undefined" && (latestState.response.history.length != response.history.length 
			|| (latestState.response.history[latestState.response.history.length-1].index != response.history[response.history.length-1].index)))) 
		{

		console.log("---------------------- SAVING appx length -----------------------", (JSON.stringify(response.history).length+JSON.stringify(response.images).length+JSON.stringify(response.tableData).length+JSON.stringify(response.savedModels).length)*2);
		//} 
		//go thro
		/*
		 * create the student state that will store the new work the student
		 * just submitted
		 * 
		 * TODO: rename Box2dModelState
		 * 
		 * make sure you rename Box2dModelState to the state object type
		 * that you will use for representing student data for this
		 * type of step. copy and modify the file below
		 * 
		 * vlewrapper/WebContent/vle/node/box2dModel/box2dModelState.js
		 * 
		 * and use the object defined in your new state.js file instead
		 * of Box2dModelState. for example if you are creating a new
		 * quiz step type you would copy the file above to
		 * 
		 * vlewrapper/WebContent/vle/node/quiz/quizState.js
		 * 
		 * and in that file you would define QuizState and therefore
		 * would change the Box2dModelState to QuizState below
		 */
		var box2dModelState = new Box2dModelState(response);
		/*
		 * fire the event to push this state to the global view.states object.
		 * the student work is saved to the server once they move on to the
		 * next step.
		 */
		this.view.pushStudentWork(this.node.id, box2dModelState);

		//push the state object into this or object's own copy of states
		this.states.push(box2dModelState);

		// we are not returning clear GLOBAL_PA
		return box2dModelState;
	} else {
		return null;
	}
};



//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename box2dModel to your new folder name
	 * TODO: rename box2dModel.js
	 * 
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/quiz.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/box2dModel/box2dModel.js');
}