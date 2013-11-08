/*
 * This a carGraph Node that developers can use to create new 
 * step types. Copy this file and rename it to 
 *
 * <new step type>Node.js
 * e.g. for example if you are creating a quiz step type it would
 * look something like QuizNode.js
 * 
 * and then in this file change all occurrences of the word 'CarGraphNode' to 
 * 
 * <new step type>Node
 * 
 * e.g. for example if you are creating a quiz step type you would
 * change it to be QuizNode
 */

CarGraphNode.prototype = new Node(); //TODO: rename CarGraphNode
CarGraphNode.prototype.constructor = CarGraphNode; //TODO: rename both occurrences of CarGraphNode
CarGraphNode.prototype.parentNode = Node.prototype; //TODO: rename CarGraphNode

/*
 * the name that displays in the authoring tool when the author creates a new step
 * 
 * the authoring tool when the author creates a new step
 * e.g. if you are making a QuizNode you would set authoringToolName to to "Quiz"
 */
CarGraphNode.authoringToolName = "Car Graph"; 

/*
 * will be seen by the author when they add a new step to their project to help
 * them understand what kind of step this is
 */
CarGraphNode.authoringToolDescription = "Lets students draw graphs and have cars move according to the graph";

CarGraphNode.tagMapFunctions = [
	{functionName:'importWork', functionArgs:[]},
	{functionName:'showPreviousWork', functionArgs:[]},
	{functionName:'mustNotExceedMaxErrorBeforeAdvancing', functionArgs:['maxError']},
	{functionName:'mustNotExceedAvgErrorBeforeAdvancing', functionArgs:['avgError']},
	{functionName:'mustSpanDomainBeforeAdvancing', functionArgs:[]}
];

/**
 * This is the constructor for the Node
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 */
function CarGraphNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
	
	this.tagMapFunctions = this.tagMapFunctions.concat(CarGraphNode.tagMapFunctions);
}

/**
 * This function is called when the vle loads the step and parses
 * the previous student answers, if any, so that it can reload
 * the student's previous answers into the step.
 * 
 * @param stateJSONObj
 * @return a new state object
 */
CarGraphNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	return CARGRAPHSTATE.prototype.parseDataJSONObj(stateJSONObj);
};

/**
 * This function is called if there needs to be any special translation
 * of the student work from the way the student work is stored to a
 * human readable form. For example if the student work is stored
 * as an array that contains 3 elements, for example
 * ["apple", "banana", "orange"]
 *  
 * and you wanted to display the student work like this
 * 
 * Answer 1: apple
 * Answer 2: banana
 * Answer 3: orange
 * 
 * you would perform that translation in this function.
 * 
 * Note: In most cases you will not have to change the code in this function
 * 
 * @param studentWork
 * @return translated student work
 */
CarGraphNode.prototype.translateStudentWork = function(studentWork) {
	return studentWork;
};


/**
 * Overrides Node.smartFilter
 * 
 * @param stateObj one student's graph points
 * @return true iff this state is something that should appear in the smart filter
 */
CarGraphNode.prototype.smartFilter = function(stateObj) {
	var returnObj = {
			filtered: false,
			maxError: 0.0,
			avgError: 0.0,
			errMargin: 0.0,
			error: false
		};
	
	// no smart filter check if no state.
	if (stateObj == null || stateObj == "") {
		return returnObj;
	}
		
	// get the configuration JSON object
	var objJson = this.content.getContentJSON();
	
	// Go through the dynamic images and check each one
	for (var i=0; i < objJson.dynamicImages.length; i++) {
		var carId = objJson.dynamicImages[i].id;
	
		if (stateObj.getPredictionObjByPredictionId(carId) === null) {
			returnObj.error = true;
			return returnObj;
		}
		// get the points drawn by the student for the current car
		var carPred = stateObj.getPredictionObjByPredictionId(carId).predictions;
			
		// retrieve the preconfigured results object for current car from the config JSON
		var carExpObj = this.getResultObjByResultId(carId);
		
		if (carExpObj === null) {
			returnObj.error = true;
			return returnObj;
		}
		
		// retrieve the allowed error margin
		var errMargin = 0.5;
		if (carExpObj.maxErrorMargin !== null && carExpObj.maxErrorMargin !== undefined) {
			errMargin = carExpObj.maxErrorMargin;
		}		
		// retrieve the expected points for the car
		var carExpPoints = carExpObj.expectedPoints;
			
		/*
		 * We calculate the Y-values for the student graph and the optimal graph
		 * at various X-values that we go through on a interval
		 */
		var carGraphObj = new CARGRAPH(this);
		var maxYError = 0.0;
		var allError = 0.0;
		var filtered = false;
	
		for (var x = (parseInt(objJson.graphParams.xmin) +1); x < parseInt(objJson.graphParams.xmax); x++) {
			var expectedYValue = carGraphObj.getYValueObj(x, carExpPoints);
			var studentYValue = carGraphObj.getYValueObj(x, carPred);
			var delta = Math.abs(expectedYValue - studentYValue) * 1.0;
			
			if (delta > returnObj.maxError) {
				returnObj.maxError = delta;
			}
			
			allError = allError + delta;
			
			if (delta > errMargin) {
				filtered = true;
			}
		}
		
		returnObj.avgError = allError / (parseInt(objJson.graphParams.xmax) - parseInt(objJson.graphParams.xmin));		
		returnObj.filtered = filtered;
		returnObj.errMargin = errMargin;
	}
	
	return returnObj;	
};


CarGraphNode.prototype.getResultObjByResultId = function(resultsId) {
	for (var i=0; i < this.content.getContentJSON().expectedResults.length; i++) {
		if (this.content.getContentJSON().expectedResults[i].id == resultsId) {
			return this.content.getContentJSON().expectedResults[i];
		}
	}
	return null;
};


/**
 * This function is called when the student exits the step. It is mostly
 * used for error checking.
 * 
 * TODO: rename CarGraphNode
 * 
 * Note: In most cases you will not have to change anything here.
 */
CarGraphNode.prototype.onExit = function() {
	try {
		// run a smart filter and if student has done a bad job, save it in the status
		// run smart filter and flag if the smart filter returns true	
		var carGraphState = this.view.getState().getLatestWorkByNodeId(this.id);
		var smartFilterResult = this.smartFilter(carGraphState); // obj
		
		if (this.view.studentStatus == null) {
			this.view.studentStatus = new StudentStatus();
		}
		
		if (smartFilterResult.maxError > 10) {
			//this.view.studentStatus.maxAlertLevel = "alert";
			
			if(this.view.studentStatus.alertables == null) {
				this.view.studentStatus.alertables = [];			
			}
			
			var alertLevel = 5;
			var nodeId = this.id;
			var type = "autoScoreResult";
			var value = smartFilterResult.maxError;
			
			var stepNumberAndTitle = this.view.getProject().getStepNumberAndTitle(this.id);
			var nodeType = this.type;
			var readableText = 'Autoscore returned '+smartFilterResult.maxError+'. This might mean that the student needs help.';
			
			var date = new Date();
			var timestamp = date.getMilliseconds();
			
			var alertable = new StudentAlertable(alertLevel, nodeId, type, value, stepNumberAndTitle, nodeType, readableText, timestamp);
			
			this.view.studentStatus.addAlertable(alertable);
		} else {
			//this.view.studentStatus.type = "ok";
			this.view.studentStatus.removeAlertable(this.id);
		}
		
		//check if the content panel has been set
		if(this.contentPanel) {
			
			if(this.contentPanel.save) {
				//tell the content panel to save
				this.contentPanel.save();
			}
			
			if(this.contentPanel.onExit) {
				//run the on exit cleanup
				this.contentPanel.onExit();
			}
		}
	} catch(e) {
		
	}
};


/**
 * Renders the student work into the div. The grading tool will pass in a
 * div id to this function and this function will insert the student data
 * into the div.
 * 
 * @param displayStudentWorkDiv the div we will render the student work into
 * @param nodeVisit the student work
 * @param childDivIdPrefix (optional) a string that will be prepended to all the 
 * div ids use this to prevent DOM conflicts such as when the show all work div
 * uses the same ids as the show flagged work div
 * @param workgroupId the id of the workgroup this work belongs to
 * 
 * TODO: rename CarGraphNode
 * Note: you may need to add code to this function if the student
 * data for your step is complex or requires additional processing.
 * look at carGraphNode.renderGradingView() as an example of a step that
 * requires additional processing
 */
CarGraphNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	//create a carGraph object that we will use to perform all the graphing logic for us
	var carGraph = new CARGRAPH(this, this.view);
	
	if(childDivIdPrefix == null) {
		//the default child div id prefix will be "" if none is provided
		childDivIdPrefix = "";
	}
	
	//get the step work id from the node visit
	var stepWorkId = nodeVisit.id;
	
	/*
	 * get the student work, in this case the student work is
	 * the carGraph state
	 */
	var carGraphState = nodeVisit.getLatestWork();
	
	//set the carGraph state into our carGraph object
	carGraph.carGraphState = carGraphState;
		
	//get the graph parameters from the content
	var graphParams = carGraph.parseGraphParams(this.content.getContentJSON().graphParams);

	//create the carGraph graph div that we will use to display the graph
	var carGraphGraphDiv = createElement(document, 'div', {id: childDivIdPrefix + 'carGraphGraphDiv_' + stepWorkId, style:'width:400px;height:200px;'});
	
	//create the div that will display the check boxes to filter the lines (if this graph has multiple lines, if not, this will be empty)
	var carGraphGraphCheckBoxesDiv = createElement(document, 'div', {id: childDivIdPrefix + 'carGraphGraphCheckBoxesDiv_' + stepWorkId});
	
	//create the div that will display the student annotations for the graph
	var carGraphAnnotationsDiv = createElement(document, 'div', {id: childDivIdPrefix + 'carGraphAnnotationsDiv_' + stepWorkId});
	
	//create the response div that we will use to display what the student typed
	var carGraphResponseDiv = createElement(document, 'div', {id: childDivIdPrefix + 'carGraphResponseDiv_' + stepWorkId});
	
	//add all the divs to the main work div 
	displayStudentWorkDiv.append(carGraphGraphDiv);
	displayStudentWorkDiv.append(carGraphGraphCheckBoxesDiv);
	displayStudentWorkDiv.append(carGraphAnnotationsDiv);
	displayStudentWorkDiv.append(carGraphResponseDiv);
	
	// run smart filter and flag if the smart filter returns true
	var smartFilterResult = this.smartFilter(carGraphState); // obj
	if (smartFilterResult.error !== true) {
		var carGraphSmartFilterDiv = createElement(document, 'div', {id: "smartFilter_" + stepWorkId, "class":"smartFilter"});
		carGraphSmartFilterDiv.innerHTML += "<span class='maxError' style='color:red; display:none'>" + smartFilterResult.maxError + "</span>";
		carGraphSmartFilterDiv.innerHTML += "<span class='avgError' style='color:green; display:none'>" + smartFilterResult.avgError + "</span>";
		carGraphSmartFilterDiv.innerHTML += "<span class='errMargin' style='color:yellow; display:none'>" + smartFilterResult.errMargin + "</span>";
		
		//get the max error possible
		var maxErrorPossible = 22;
		
		//get the max auto graded score
		var maxAutoGradedScore = 5;
		
		//calculate the auto graded score for the student
		var score = Math.ceil(((maxErrorPossible - smartFilterResult.maxError) / maxErrorPossible) * maxAutoGradedScore);
		
		//display the auto graded score
		carGraphSmartFilterDiv.innerHTML += "Auto-Graded Score: " + score + "/" + maxAutoGradedScore;
	}
	else {
		// some error handling???
	}
		
	displayStudentWorkDiv.append(carGraphSmartFilterDiv);
	
	//tell the car graph to show the correct graph along with the student graph
	carGraph.showCorrectGraph = true;
	
	//plot the graph in the carGraph graph div
	carGraph.plotData($(carGraphGraphDiv), $(carGraphGraphCheckBoxesDiv));
	
	/*
	 * used to hide or show the annotation tool tips. if the teacher has
	 * their mouse in the graph div we will hide the annotation tool tips
	 * so that they don't block them from viewing the plot points.
	 * when the mouse cursor is outside of the graph div we will show the
	 * annotation tool tips for them to view.
	 */
	$(carGraphGraphDiv).bind('mouseover', (function(event) {
		$(".activeAnnotationToolTip").hide();
	}));
	$(carGraphGraphDiv).bind('mouseleave', (function(event) {
		$(".activeAnnotationToolTip").show();
	}));
	
	//get the annotations as a string
	var annotationsHtml = carGraphState.getAnnotationsHtml();
	
	//set the annotations text
	$(carGraphAnnotationsDiv).html(annotationsHtml);
	
	//get the student response that was typed
	var response = carGraphState.response;
	
	//replace \n with <br> so that the line breaks are displayed for the teacher
	response = this.view.replaceSlashNWithBR(response);
	
	//insert the response the student typed
	$(carGraphResponseDiv).html(response);
};

/**
 * Handles Smart Filtering in the gradingtool for CarGraphNode.
 * @return
 */
CarGraphNode.prototype.showSmartFilter = function(doShow) {
	var doFilter = function(sliderValue) {
		$(".maxError").each(function() {
			var maxErrorForOneDrawing = parseFloat($(this).html());
			if (maxErrorForOneDrawing < sliderValue) {
				$(this).parents(".studentWorkRow").hide();
				$(this).parents(".studentWorkRow").removeClass("smartFilterShow");
				$(this).parents(".studentWorkRow").addClass("smartFilterHide");
			} else {
				$(this).parents(".studentWorkRow").show();
				$(this).parents(".studentWorkRow").removeClass("smartFilterHide");
				$(this).parents(".studentWorkRow").addClass("smartFilterShow");
			}
		});
	};	
	
	if (doShow) {
		if ($("#onlyShowSmartFilteredItemsSlider").length == 0) {
			var maxValue = 22;
			var defaultValue = 11;
			doFilter(defaultValue);
			$("#onlyShowSmartFilteredItemsText").append("<div style='width:80%' id='smartFilter'><div style='color:green'><span><- SLIDE LEFT: More errors</span><span style='margin-left:150px'>Showing <span id='currentDisplayedWorkCount'></span> work with highest margin of error more than <span id='currentSliderValue'>"+defaultValue+"</span></span><span style='float:right'>SLIDE RIGHT: Less errors -></span></div><div id='onlyShowSmartFilteredItemsSlider'></div></div>");
			$("#onlyShowSmartFilteredItemsSlider").slider({
				value:defaultValue,
				min:0,
				max:maxValue,
				slide: function(event, ui) {
				var sliderValue = maxValue-ui.value;
				// hide anything that is under the threshold (slider value)
				doFilter(sliderValue);
				
				$("#currentSliderValue").html(sliderValue);
				if(typeof eventManager != 'undefined'){
					// call filterstudentrows again to filter for selected periods
					eventManager.fire('filterStudentRowsRequested');
				}
			}
			});
		};
		$(".studentWorkRow.noWork").hide();  // hide rows with no work
		$("#smartFilter").show();
	} else {
		$(".studentWorkRow.noWork").filter(":visible").show();  // show rows with no work that are visible
		$("#smartFilter").hide();
	}
	return true;
};

/**
 * Get the tag map functions that are available for this step type
 */
CarGraphNode.prototype.getTagMapFunctions = function() {
	//get all the tag map function for this step type
	var tagMapFunctions = CarGraphNode.tagMapFunctions;
	
	return tagMapFunctions;
};

/**
 * Get a tag map function given the function name
 * @param functionName
 * @return 
 */
CarGraphNode.prototype.getTagMapFunctionByName = function(functionName) {
	var fun = null;
	
	//get all the tag map function for this step type
	var tagMapFunctions = this.getTagMapFunctions();
	
	//loop through all the tag map functions
	for(var x=0; x<tagMapFunctions.length; x++) {
		//get a tag map function
		var tagMapFunction = tagMapFunctions[x];
		
		if(tagMapFunction != null) {
			
			//check if the function name matches
			if(functionName == tagMapFunction.functionName) {
				//the function name matches so we have found what we want
				fun = tagMapFunction;
				break;
			}			
		}
	};
	
	return fun;
};

/**
 * Override of Node.overridesIsCompleted
 * Specifies whether the node overrides Node.isCompleted
 */
CarGraphNode.prototype.overridesIsCompleted = function() {
	return true;
};

/**
 * Override of Node.isCompleted
 * Get whether the step is completed or not
 * @return a boolean value whether the step is completed or not
 */
CarGraphNode.prototype.isCompleted = function(nodeVisits) {
	var carGraphState = this.view.getState().getLatestWorkByNodeId(this.id);
	
	if (typeof this.tagMaps == "undefined") return true;
	// cycle through tag maps, if I get a custom tag map check student work to complete
	if (typeof carGraphState === "undefined") carGraphState = this.view.getState().getLatestWorkByNodeId(this.id);
	var isCompleted = true;
	for (var i = 0; i < this.tagMaps.length; i++){
		var functionName = this.tagMaps[i].functionName;
		var functionArgs = this.tagMaps[i].functionArgs;
		if (functionName == "mustNotExceedMaxErrorBeforeAdvancing"){
			var smartFilterResult = this.smartFilter(carGraphState); // obj	
	        if (carGraphState == "" || smartFilterResult.maxError > functionArgs[0]) isCompleted = false;		
		} 
		if (functionName == "mustNotExceedAvgErrorBeforeAdvancing"){
			smartFilterResult = this.smartFilter(carGraphState); // obj
	        if (carGraphState == "" || smartFilterResult.avgError > functionArgs[0]) isCompleted = false;				
		}
		if (functionName == "mustSpanDomainBeforeAdvancing"){
			if (carGraphState != "" && carGraphState.predictionArray.length > 0 && carGraphState.predictionArray[0].predictions){
				var predictions = carGraphState.predictionArray[0].predictions;
				var foundMin = false;
				var foundMax = false;
				for (var i=0; i < predictions.length; i++){
					var p = predictions[i];
					var objJson = this.content.getContentJSON();
					// first check state, if min and max are there use them, else use json values
					if (typeof carGraphState.xMin != "undefined" && carGraphState.xMin != "" && !isNaN(Number(carGraphState.xMin)) && typeof carGraphState.xMax != "undefined" && carGraphState.xMax != "" && !isNaN(Number(carGraphState.xMax))){
						if (p.x <= parseFloat(carGraphState.xMin)) foundMin = true;
						if (p.x >= parseFloat(carGraphState.xMax)) foundMax = true;
					} else {
						if (p.x <= parseFloat(objJson.graphParams.xmin)) foundMin = true;
						if (p.x >= parseFloat(objJson.graphParams.xmax)) foundMax = true;
					}
				}
				if (!foundMin || !foundMax) isCompleted = false;
			} else {
				isCompleted = false;
			}
		}
	}
	return isCompleted;
};

/**
 * Get the html file associated with this step that we will use to
 * display to the student.
 * 
 * TODO: rename CarGraphNode
 * 
 * @return a content object containing the content of the associated
 * html for this step type
 */
CarGraphNode.prototype.getHTMLContentTemplate = function() {
	/*
	 * e.g. if you are creating a quiz step you would change it to
	 * 
	 * node/quiz/quiz.html
	 */
	return createContent('node/cargraph/cargraph.html');
};

/**
 * Returns whether this step type can be special exported
 * @return a boolean value
 */
CarGraphNode.prototype.canSpecialExport = function() {
	return true;
};

/*
 * Add this node to the node factory so the vle knows it exists.
 * e.g. if you are creating a quiz step you would change it to
 * 
 * NodeFactory.addNode('QuizNode', QuizNode);
 */
NodeFactory.addNode('CarGraphNode', CarGraphNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/QuizNode.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/cargraph/CarGraphNode.js');
};
