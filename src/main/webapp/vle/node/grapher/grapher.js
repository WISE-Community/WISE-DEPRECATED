/*
 * This is a grapher step object that developers can use to create new
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
 * TODO: in this file, change all occurrences of the word 'Grapher' to the
 * name of your new step type
 * 
 * <new step type>
 * e.g. for example if you are creating a quiz step it would look
 * something like Quiz
 */

/**
 * This is the constructor for the object that will perform the logic for
 * the step when the students work on it. An instance of this object will
 * be created in the .html for this step (look at grapher.html)
 * 
 * TODO: rename Grapher
 * 
 * @constructor
 */
function Grapher(node) {
	this.node = node;
	this.view = node.view;
	this.content = node.getContent().getContentJSON();
	
	if(node.studentWork != null) {
		this.states = node.studentWork; 
	} else {
		this.states = [];  
	};

	//the grapher state that will contain the student work
	this.grapherState = this.getLatestStateCopy();
	
	//flag to keep track of whether the student has change any axis range value this visit
	this.axisRangeChanged = false;

	//flag to keep track of whether the student has change any axis labels
	this.axisLabelChanged = false;
	

	if(this.content != null) {
		//get the graph parameters for displaying the data to the student
		this.graphParams = this.parseGraphParams(this.content.graphParams);
		this.createPrediction = typeof this.content.createPrediction !== "undefined" ? this.content.createPrediction : true;
	}
	
	/*
	 * flag to keep track of whether the student has modified the graph
	 * by retrieving data from the grapher
	 */
	this.graphChanged = false;
	
	//the labels for the graph legends
	var distance = this.view.getI18NString('distance', 'GrapherNode');
	var velocity = this.view.getI18NString('velocity', 'GrapherNode');
	var acceleration = this.view.getI18NString('acceleration', 'GrapherNode');
	var temperature = this.view.getI18NString('temperature', 'GrapherNode');
	
	//the names for the different types of graphs
	this.graphNames = {};
	
	//the units for the different types of graphs
	this.graphUnits = {
		x:typeof this.content.graphParams.xUnits !== "undefined" ? this.content.graphParams.xUnits : "", 
		y:typeof this.content.graphParams.yUnits !== "undefined" ? this.content.graphParams.yUnits : ""
	};
	

	/*
	 * the color for the graph lines
	 * 0 yellow
	 * 1 light blue
	 * 2 red
	 * 3 green
	 * 4 purple
	 * 5 dark yellow
	 * 6 teal blue
	 * 7 brown
	 * 8 dark green
	 * 9 dark purple
	 */
	this.graphColors = [];
	
	if (typeof this.content.seriesLabels.length !== "undefined" && this.content.seriesLabels.length > 0){
		// cycle through each custom series label
		var seriesLabels = this.content.seriesLabels;
		for (var s = 0; s < seriesLabels.length; s++){
			this.graphNames[s] = seriesLabels[s];
			//this.graphUnits[s] = typeof this.content.graphParams.yUnits !== "undefined" ? this.content.graphParams.yUnits : "";
			this.graphColors[s] = (s + 1) % 10;
		}
	} else {
		this.graphNames[0] = 'prediction';
		//this.graphUnits[0] = "";
		this.graphColors[0] = 1;
	}
	this.currentGraphName = this.graphNames[0];
	
	/*
	 * used to store the plot variable returned from $.plot() so that we can access
	 * it from other functions
	 */
	this.globalPlot = null;
	
	//get the prediction from the previous step if there is a prevWorkNodeIds
	this.getPreviousPrediction();
	
	//default ids for our graph and graph checkboxes divs
	this.graphDivId = "graphDiv";
	this.graphCheckBoxesDivId = "graphCheckBoxesDiv";
	
	this.predictionLocked = false;
	
	if(!this.content.createPrediction || this.grapherState.predictionLocked) {
		//the prediction should be locked
		this.predictionLocked = true;
	}
	
	//whether the grapher has been loaded or not
	this.grapherLoaded = false;
	
	//the last point the student has clicked on
	this.lastPointClicked = null;

	// a point being dragged
	this.dragPoint = null;
};

/**
 * This function renders everything the student sees when they visit the step.
 * This includes setting up the html ui elements as well as reloading any
 * previous work the student has submitted when they previously worked on this
 * step, if any.
 * 
 * TODO: rename Grapher
 * 
 * note: you do not have to use 'promptDiv' or 'studentResponseTextArea', they
 * are just provided as examples. you may create your own html ui elements in
 * the .html file for this step (look at grapher.html).
 */
Grapher.prototype.render = function() {
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

	if(this.states != null && this.states.length == 0 && workToImport != null && workToImport.length > 0) {
		/*
		 * the student has not done any work for this step and
		 * there is work to import so we will use the work to import
		 */
		this.grapherState = workToImport[workToImport.length - 1];
	}
	
	if(this.content.requirePredictionBeforeEnter && this.node.prevWorkNodeIds.length != 0 && this.grapherState.predictionArray.length == 0) {
		/*
		 * this step requires a prediction before opening, there is an associated prevWorkNodeId
		 * and there is no prediction so we will lock the student out of this step until they
		 * create the prediction in the previously associated step
		 */
		
		var prevWorkNodeId = this.node.prevWorkNodeIds[0];
		var prevWorkNodeTitle = this.view.getProject().getStepNumberAndTitle(prevWorkNodeId);
		
		//the text that says you must make a prediction on a previous step before they can work on this step
		var you_must_make_a_prediction = this.view.getI18NString('you_must_make_a_prediction', 'GrapherNode');
		var before_you_can_work = this.view.getI18NString('before_you_can_work', 'GrapherNode');
		
		//display the message to tell the student to create a prediction in the previously associated step
		$('#promptDiv').html(you_must_make_a_prediction + " <a style=\"color:blue;text-decoration:underline;cursor:pointer\" onclick=\"eventManager.fire(\'nodeLinkClicked\', [\'" + this.view.getProject().getPositionById(prevWorkNodeId) + "\'])\">" + prevWorkNodeTitle + "</a> " + before_you_can_work);
		this.hideAllInputFields();
	} else {
		//set the prompt into the step
		$('#promptDiv').html(this.content.prompt);

		//set the graph title
		$('#graphTitle').html(this.content.graphTitle);

		// add radio buttons for series
		if (this.content.seriesLabels.length == 0) this.content.seriesLabels.push('prediction');
		var seriesLabels = this.content.seriesLabels;
		if (seriesLabels.length > 1){
			for (var s = 0; s < seriesLabels.length; s++){
				// add radio input so students can choose which series they're drawing the graph for
				var checked = "";
				if (s==0) checked = "checked";
				
				if($("#seriesRadioDiv").children().length < seriesLabels.length) 
					$("#seriesRadioDiv").append("<input class='seriesRadio' name='dynamic' type='radio' "+checked+" onclick='seriesChanged("+s+")'>"+seriesLabels[s]+"</input>");
				
				// initialize this series in the state
				this.grapherState.initializePrediction(seriesLabels[s]);
			}
		}

		//plot the grapher data from the student's previous visit, if any
		this.plotData();
		
		//add the graph labels
		this.setupGraphLabels();
		
		//set the axis values
		this.setupAxisValues();
		
		//show the graph options if necessary
		this.showGraphOptions();
		
		//display the annotations, if any
		this.setupAnnotations();
		
		/*
		 * get the student's previous response, if any, and re-populate
		 * the response textarea with it
		 */
		var response = this.getResponseFromGrapherState();
		$("#responseTextArea").val(response);
		
		//set the size of the text area
		if (parseInt(this.content.expectedLines) > 0){
			$("#responseTextArea").attr('rows', this.content.expectedLines);
			$("#responseTextArea").attr('cols', 80);
		} else {
			$("#responseTextArea").hide();
		}
		
		if(!this.content.createPrediction) {
			//hide the prediction buttons
			this.hidePredictionButtons();
		}
		
		if(this.predictionLocked) {
			//disable the prediction buttons
			this.disablePredictionButtons();
		}
		
		//display the starter sentence button if necessary
		this.displayStarterSentenceButton();
		
		/*
		 * used to determine if the student is click dragging on the graph
		 * for use when they are creating a prediction
		 */
		this.mouseDown = false;
		$("#" + this.graphDivId).bind('mousedown', {thisGrapher:this}, (function(event) {
			event.data.thisGrapher.mouseDown = true;
		}));
		$("#" + this.graphDivId).bind('mouseup', {thisGrapher:this}, (function(event) {
			event.data.thisGrapher.mouseDown = false;
		}));

		//listen for the keydown event
		$(window).bind("keydown", {thisGrapher:this}, function(event) {
		    event.data.thisGrapher.handleKeyDown(event);
		});
		
		//listen for the click event
		$(window).bind("click", {thisGrapher:this}, function(event) {
			//check if the mouse is inside the graph div
		    if(!event.data.thisGrapher.mouseInsideGraphDiv) {
		    	/*
		    	 * the mouse is outside the graph div so we will
		    	 * set the lastPointClicked to null. we need to do
		    	 * this because if the student clicked on a point
		    	 * on the graph and then decided to start typing
		    	 * their response and typed backspace while typing
		    	 * their response, it would delete the 
		    	 * lastPointClicked point. so now whenever the
		    	 * student clicks outside of the graph div we
		    	 * just clear the lastPointClicked so they won't
		    	 * accidentally delete a point on the graph.
		    	 */
		    	event.data.thisGrapher.lastPointClicked = null;
		    }
		});
		
		//listen for the mouse enter event on the graphDiv
		$("#" + this.graphDivId).bind("mouseenter", {thisGrapher:this}, function(event) {
			event.data.thisGrapher.mouseInsideGraphDiv = true;
			if (typeof event.data.thisGrapher.content.graphParams.coordsFollowMouse != "undefined" && event.data.thisGrapher.content.graphParams.coordsFollowMouse && $("#plotHoverPosition").length > 0) $("#plotHoverPosition").show();
		});
		
		//listen for the mouse leave event on the graphDiv
		$("#" + this.graphDivId).bind("mouseleave", {thisGrapher:this}, function(event) {
			event.data.thisGrapher.mouseInsideGraphDiv = false;
			if (typeof event.data.thisGrapher.content.graphParams.coordsFollowMouse != "undefined" && event.data.thisGrapher.content.graphParams.coordsFollowMouse && $("#plotHoverPosition").length > 0) $("#plotHoverPosition").hide();
			event.data.thisGrapher.dragPoint = null;
		});
		
		/*
		 * used to hide or show the annotation tool tips. if the student has
		 * their mouse in the graph div we will hide the annotation tool tips
		 * so that they don't block them from clicking on the plot points.
		 * when the mouse cursor is outside of the graph div we will show the
		 * annotation tool tips for them to view.
		 */
		$("#" + this.graphDivId).bind('mouseover', (function(event) {
			$(".activeAnnotationToolTip").hide();
		}));
		$("#" + this.graphDivId).bind('mouseleave', (function(event) {
			$(".activeAnnotationToolTip").show();
		}));
	}

	this.node.view.eventManager.fire('contentRenderCompleted', this.node.id, this.node);
};

/**
 * Given xValue, returns yValue of a prediction graph whose points are stored in
 * the given predictionArray.
 * 
 * Note that the predictionArray may not contain the given xValue.  For example, trying to find
 * the yValue in (3,?) when your predictionArray only contains 
 * [(1,2),(2,4),(7,3)]. In this case, algebra is used to calculate the y value.
 * 
 *  * If the array does not contain a value for x less than the specified xValue, return -100.
 * e.g. xValue=4, predictionArray=[(5,6),(10,10),(7,3)]
 * 
 * @param xValue: x Value in the prediction graph
 * @param predictionArray: array of points for one prediction graph
 * @return: corresponding y-Value within the prediction graph.
 */ 
Grapher.prototype.getYValue = function(xValue,predictionArray) {
     if (predictionArray.length > 0) {
    	// check if the array contains a value for x less than the specified xValue. If not, return -100.
    	var firstPrediction = predictionArray[0];
    	if (firstPrediction[0] > xValue) {
    		return -100;
    	}
    }
    var xSoFar = 0;
    var ySoFar = 0;
    if (predictionArray.length > 0){
    	xSoFar = Math.min(0,predictionArray[0][0]);
    	ySoFar = Math.min(0,predictionArray[0][1]);
    }
    for (var i=0; i< predictionArray.length; i++) {
	    var prediction = predictionArray[i];  // prediction[0] = x, prediction[1] = y
	    if (prediction[0] < xValue && xSoFar <= prediction[0]) {
		    // x value not yet found, set ySoFar in case we'll need it for later
		    xSoFar = prediction[0];
		    ySoFar = prediction[1];				 
		} else if (prediction[0] < xValue && xSoFar > prediction[0]){
			// back in time - jv - return an error code
			return -200;   
	    } else if (prediction[0] == xValue) {
		    // x match found, return it
		    return prediction[1];
	    } else {
		    // there was no xValue in the prediction. we've reached a xValue in the prediction array
		    // that is greater than xValue. 
		    // calculate using the power of Algebra
		    // magic formula: y2 = y1 + m(x2-x1)
		    // m = (y2-y1) / (x2-x1)
		    var slope = (prediction[1] - ySoFar) / (prediction[0] - xSoFar);
		    var yValue = ySoFar + slope * (xValue-xSoFar);
		    return yValue;
	    }
    }
    return -1;
};

/**
 * Given xValue, returns yValue of a prediction graph whose points are stored in
 * the given predictionArray.
 * 
 * Note that the predictionArray may not contain the given xValue.  For example, trying to find
 * the yValue in (3,?) when your predictionArray only contains 
 * [(1,2),(2,4),(7,3)]. In this case, algebra is used to calculate the y value.
 * 
 * If the array does not contain a value for x less than the specified xValue, return -100.
 * e.g. xValue=4, predictionArray=[(5,6),(10,10),(7,3)]
 * 
 * @param xValue: x Value in the prediction graph
 * @param predictionArray: array of points for one prediction graph
 * @return: corresponding y-Value within the prediction graph.
 */ 
Grapher.prototype.getYValueObj = function(xValue,predictionArray) {
    var xSoFar = 0;
    var ySoFar = 0;
    if (predictionArray.length > 0) {
    	// check if the array contains a value for x less than the specified xValue. If not, return -100.
    	var firstPrediction = predictionArray[0];
    	if (firstPrediction.x > xValue) {
    		return -100;
    	}
    }
    for (var i=0; i< predictionArray.length; i++) {
	    var prediction = predictionArray[i];  // prediction[0] = x, prediction[1] = y
	    if (prediction.x < xValue) {
		    // x value not yet found, set ySoFar in case we'll need it for later
		    xSoFar = prediction.x;
		    ySoFar = prediction.y;				    
	    } else if (prediction.x == xValue) {
		    // x match found, return it
		    return prediction.y;
	    } else {
		    // there was no xValue in the prediction. we've reached a xValue in the prediction array
		    // that is greater than xValue. 
		    // calculate using the power of Algebra
		    // magic formula: y2 = y1 + m(x2-x1)
		    // m = (y2-y1) / (x2-x1)
		    var slope = (prediction.y - ySoFar) / (prediction.x - xSoFar);
		    var yValue = ySoFar + slope * (xValue-xSoFar);
		    return yValue;
	    }
    }
    return -1;
};

/**
 * This function retrieves the latest student work
 * 
 * TODO: rename Grapher
 * 
 * @return the latest state object or null if the student has never submitted
 * work for this step
 */
Grapher.prototype.getLatestState = function() {
	var latestState = null;
	
	//check if the states array has any elements
	if(this.states != null && this.states.length > 0) {
		//get the last state
		latestState = this.states[this.states.length - 1];
	}
	
	return latestState;
};

/**
 * Get a copy of the latest student work for this step
 * @return a copy of the latest student work state object
 */
Grapher.prototype.getLatestStateCopy = function() {
	//a new sensor state will be returned if there are no states
	var latestStateCopy = new GrapherState();

	if(this.states != null && this.states.length > 0) {
		//get the last state in the states array
		var latestState = this.states[this.states.length - 1];
		
		//copy the values in the latest state into the latest state copy
		GrapherState.prototype.copyState(latestState, latestStateCopy);
	}
	
	return latestStateCopy;
};

Grapher.prototype.setCurrentSeriesByIndex = function(seriesIndex) {
	this.currentGraphName = this.content.seriesLabels[seriesIndex];
};

/**
 * This is called when the student clears the data they have collected
 */
Grapher.prototype.clearData = function() {
	//clear the data from the graph and annotations
	this.grapherState.clearGrapherData();
	
	//delete the annotations for the grapher data
	this.grapherState.removeGrapherAnnotations();
	
	//remove the grapher annotations text boxes and delete buttons from the UI
	this.deleteGrapherAnnotationsFromUI();
	
	//remove the annotation tool tips for the grapher data line from the UI
	this.removeAnnotationToolTipData();
	
	/*
	 * plot the graph again, there will be no grapher data so the 
	 * graph will essentially be blank
	 */
	this.plotData();
	
	//update the flag since the graph has been cleared
	this.graphChanged = true;
};

/**
 * Parse the graph parameters from the step content
 * @return an object we can use to pass to the flot graph to
 * specify how the graph should look
 */
Grapher.prototype.parseGraphParams = function(contentGraphParams) {
	//create the object that will contain the graph params
	var graphParams = {};
	
	//create an xaxis object
	graphParams.xaxis = {};
	
	//create a yaxis object
	graphParams.yaxis = {};
	
	if(contentGraphParams != null) {
		if(contentGraphParams.xmin != null && contentGraphParams.xmin != "") {
			//set the xmin value
			graphParams.xaxis.min = contentGraphParams.xmin;
		}

		if(contentGraphParams.xmax != null && contentGraphParams.xmax != "") {
			//set the xmax value
			graphParams.xaxis.max = contentGraphParams.xmax;
		}

		if(contentGraphParams.ymin != null && contentGraphParams.ymin != "") {
			//set the ymin value
			graphParams.yaxis.min = contentGraphParams.ymin;
		}

		if(contentGraphParams.ymax != null && contentGraphParams.ymax != "") {
			//set the ymax value
			graphParams.yaxis.max = contentGraphParams.ymax;
		}
		
	}
	
	/*
	 * if the grapher state contains axis values it will override
	 * the axis values from the content
	 */
	if(this.grapherState != null) {
		if(this.grapherState.xMin != null) {
			//set the xmin value from the grapher state
			graphParams.xaxis.min = this.grapherState.xMin;
		}
		
		if(this.grapherState.xMax != null) {
			//set the xmax value from the grapher state
			graphParams.xaxis.max = this.grapherState.xMax;
		}
		
		if(this.grapherState.yMin != null) {
			//set the ymin value from the grapher state
			graphParams.yaxis.min = this.grapherState.yMin;
		}
		
		if(this.grapherState.yMax != null) {
			//set the ymax value from the grapher state
			graphParams.yaxis.max = this.grapherState.yMax;
		}
	}
	
	//turn lines and points on
	graphParams.series = {lines:{show:true}, points:{show:true}};
	
	//allow points to be hoverable and clickable
	graphParams.grid = {hoverable:true, clickable:true};
	// if an easyClickExtremes variable exists and is true in params set up grid to have wide left and right margins to allow clicking of extremes
	if (typeof contentGraphParams.easyClickExtremes != "undefined" && contentGraphParams.easyClickExtremes){
		//graphParams.grid.borderWidth = 10;
		// when we have the 0.8 version of flot use this:
		graphParams.grid.borderWidth = {"left":10, "right":10, "top":10, "bottom":10};
		graphParams.grid.labelMargin = 12;
	}

	graphParams.crosshair = { mode: "x" };
	return graphParams;
};

/**
 * Get the graphParams object that we will pass to the flot
 * graph to specify how the graph should look
 * @return
 */
Grapher.prototype.getGraphParams = function() {
	//parse the graph params
	this.graphParams = this.parseGraphParams(this.content.graphParams);
	
	return this.graphParams;
};

/**
 * This function retrieves the student work from the html ui, creates a state
 * object to represent the student work, and then saves the student work.
 * 
 * TODO: rename Grapher
 * 
 * note: you do not have to use 'studentResponseTextArea', they are just 
 * provided as examples. you may create your own html ui elements in
 * the .html file for this step (look at grapher.html).
 */
Grapher.prototype.save = function() {
	//get the answer the student wrote
	var response = document.getElementById('responseTextArea').value;
	
	//get the previous student work
	var latestState = this.getLatestState();
	var previousResponse = '';
	
	if(latestState != null) {
		//get the previous response
		var previousResponse = latestState.response;
	}

	/*
	 * check that the student has changed the response or the graph or any annotations
	 */
	if(response != previousResponse || this.graphChanged || this.annotationsChanged || this.axisRangeChanged || this.axisLabelChanged) {
		//set the student response into the state
		this.grapherState.response = response;
		
		//fire the event to push this state to the global view.states object
		this.view.pushStudentWork(this.node.id, this.grapherState);

		//push the state object into the local copy of states
		this.states.push(this.grapherState);		
	}
	
	/*
	 * changes have been saved or there were no changes so we will reset
	 * the flag back to false
	 */
	this.graphChanged = false;
	this.annotationsChanged = false;
	this.axisRangeChanged = false;
	this.axisLabelChanged = false;
};

/**
 * Get the response from the grapher state
 * @return the response text from the current grapher state
 */
Grapher.prototype.getResponseFromGrapherState = function() {
	var response = "";
	
	//get the latest state
	var state = this.grapherState;
	
	if(state != null) {
		//get the response
		response = state.response;
	}
	
	return response;
};

Grapher.prototype.plotData = function(graphDiv, graphCheckBoxesDiv) {
	if(graphDiv == null) {
		//this will be the default graphDivId if none is provided as an argument
		graphDiv = $('#' + this.graphDivId);
	}
	
	//set the graph div id so it can be accessed later by other functions
	this.graphDivId = graphDiv.attr('id');
	
	if(graphCheckBoxesDiv == null) {
		//this will be the default graphCheckBoxesDivId if none is provided as an argument
		graphCheckBoxesDiv = $("#graphCheckBoxesDiv");
	}
	
	var graphCheckBoxesDivId = graphCheckBoxesDiv.attr('id');
	
	//set the graph check boxes div id so it can be accessed later by other functions
	this.graphCheckBoxesDivId = graphCheckBoxesDivId;
	
	//get the graph params
	var graphParams = this.getGraphParams();
	
	//create the data sets array
	var dataSets = [];

	var seriesLabels = this.content.seriesLabels;
	/*
	 * check if we want to show the correct graph. this will be used
	 * in the grading tool
	 */
	if(typeof this.showCorrectGraph !== "undefined" && this.showCorrectGraph) {
		//get the expected results
		var expectedResults = this.content.expectedResults;
		
		//loop through all the series that are used in this step
		for(var s=0; s<seriesLabels.length; s++) {
			var seriesLabel = seriesLabels[s];
			
			//loop through all the expected results
			for(var y=0; y<expectedResults.length; y++) {
				//get an expected result
				var expectedResult = expectedResults[y];
				
				if(seriesLabel != null && expectedResult != null) {
					//check if we have found an expected result for the series that is used in this step
					if(seriesLabel == expectedResult.id) {
						//get the array of correct points so we can plot them
						var expectedPoints = this.convertToPlottableArray(expectedResult.expectedPoints);
						
						//get the graph line label
						var graphLabel = "Correct " + seriesLabel;
						
						/*
						 * get the graph line name. we will just convert the graphLabel to
						 * have no white space and change the first character to lower case
						 * e.g.
						 * Correct Green Car
						 * to
						 * correctGreenCar
						 */
						var graphName = graphLabel.replace(/\s/g, '');
						graphName = graphName.charAt(0).toLowerCase() + graphName.substring(1, graphName.length);

						if(expectedPoints != null) {
							//add the line that will show the correct points
							dataSets.push({data:expectedPoints, label:graphLabel, color:"blue", name:graphName});			
						}
					}
				}
			}
		}
	}
	
	// get the prediction arrays for each dynamic image
	for(var s=0; s<seriesLabels.length; s++) {
		var seriesLabel = seriesLabels[s];
			
		var predictionsForThisSeries = [];

		// get the corresponding predictions array
		var predictionArray = this.getPredictionArrayByPredictionIndex(s);
		
		var checked=false;
		if (this.currentGraphName == seriesLabel) {
			checked=true;
		}
		var color = typeof this.content.seriesColors !== "undefined" && s < this.content.seriesColors.length && this.content.seriesColors[s].length > 0 ? this.content.seriesColors[s] : 'blue';
		dataSets.push({data:predictionArray, label:seriesLabel, color: color , name:seriesLabel, checked:checked});
	}

	//set the data set to a global variable so we can access it in other places
	this.globalDataSets = dataSets;

	//plot the data onto the graph
	this.globalPlot = $.plot($(graphDiv), dataSets, graphParams);

	//delete all the annotation tool tips from the UI
	this.removeAllAnnotationToolTips();

	//highlight the points on the graph that the student has create annotations for
	this.highlightAnnotationPoints(null, null, dataSets);

	//setup the graph so that when the student hovers over a point it displays the values in a tooltip
	this.setupPlotHover();
	
	//setup the graph so that when the student clicks on a point, it creates an annotation
	this.setupPlotClick();
};

/**
 * Calculate the velocity array given the distance array
 * @param distanceArray an array of distance points. each element in the
 * distance array is also an array that looks like this [<time>,<distance>]
 * @return an array of velocity points. each element in the velocity
 * array is also an array that looks like this [<time>,<velocity>]
 */
Grapher.prototype.calculateVelocityArray = function(distanceArray) {
	return this.calculateDerivativeArray(distanceArray);
};

/**
 * Calculate the acceleration array given the velocity array
 * @param velocityArray an array of velocity points. each element in the
 * velocity array is also an array that looks like this [<time>,<velocity>]
 * @return an array of acceleration points. each element in the acceleration
 * array is also an array that looks like this [<time>,<acceleration>]
 */
Grapher.prototype.calculateAccelerationArray = function(velocityArray) {
	return this.calculateDerivativeArray(velocityArray);
};

/**
 * Calculate the derivative array by calculating the rate of change
 * of the points in the given data array
 * @param dataArray an array containing data points. each element in the
 * array is also an array and looks like this [<x>,<y>]
 * @return an array containing the derivative values
 */
Grapher.prototype.calculateDerivativeArray = function(dataArray) {
	//the array we will store the derivative values in
	var derivativeArray = [];
	
	//loop through all the points in the data array
	for(var x=0; x<dataArray.length; x++) {
		//get the index of the previous point
		var previousPointIndex = x - 1;
		
		//make sure the previous point exists
		if(previousPointIndex >= 0) {
			//get the previous point
			var point1 = dataArray[previousPointIndex];
			
			//get the current point
			var point2 = dataArray[x];
			
			//get the x and y values of the previous point
			var point1x = point1[0];
			var point1y = point1[1];
			
			//get the x and y values of the current point
			var point2x = point2[0];
			var point2y = point2[1];
			
			var derivativePoint = [];
			
			//get the difference between the y values of the points
			var derivativeY = point2y - point1y;
			
			//get the difference between the x values of the points
			var derivativeX = point2x - point1x;
			
			//calculate the rate of change to get the derivative value
			var derivativeValue = derivativeY / derivativeX;
			
			//use the x value of the current point as the x value for the derivative point
			derivativePoint[0] = point2x;
			
			//round the derivative value to the nearest hundredth and set it as the y value for the derivative point
			derivativePoint[1] = parseFloat(derivativeValue.toFixed(2));
			
			//add the derivative point to our array
			derivativeArray.push(derivativePoint);
		}
	}
	
	return derivativeArray;
};

/**
 * Setup the graph so that when the student mouseovers a point it displays
 * the x,y values for that point.
 */
Grapher.prototype.setupPlotHover = function() {
	$("#" + this.graphDivId).unbind("plothover");
	
    var previousPoint = null;
    
    /*
     * bind this function to the plothover event. the thisGrapher object
     * will be passed into the function and accessed through event.data.thisGrapher
     */
    $("#" + this.graphDivId).bind("plothover", {thisGrapher:this}, function (event, pos, item) {
    	
    	var contentGraphParams = event.data.thisGrapher.content.graphParams;
        //get the position of the mouse in the graph	
    	var x = pos.x;
    	var y = pos.y;
    	var xmax = typeof event.data.thisGrapher.grapherState.xMax != "undefined" ? parseFloat(event.data.thisGrapher.grapherState.xMax) : parseFloat(event.data.thisGrapher.content.graphParams.xmax);
		var xmin = typeof event.data.thisGrapher.grapherState.xMin != "undefined" ? parseFloat(event.data.thisGrapher.grapherState.xMin) : parseFloat(event.data.thisGrapher.content.graphParams.xmin);
		var ymax = typeof event.data.thisGrapher.grapherState.yMax != "undefined" ? parseFloat(event.data.thisGrapher.grapherState.yMax) : parseFloat(event.data.thisGrapher.content.graphParams.ymax);
		var ymin = typeof event.data.thisGrapher.grapherState.yMin != "undefined" ? parseFloat(event.data.thisGrapher.grapherState.yMin) : parseFloat(event.data.thisGrapher.content.graphParams.ymin);
	
    	if (typeof contentGraphParams.easyClickExtremes != "undefined" && contentGraphParams.easyClickExtremes){
			if (x < xmin){
				x = xmin;
			} else if (x > xmax){
				x = xmax;
			} 
			if (y < ymin ){
				y = ymin;
			} else if (y > ymax){
				y = ymax;
			} 
    	} 

    	// jv test with significant figures
    	if (typeof event.data.thisGrapher.content.graphParams.coordsFollowMouse != "undefined" && event.data.thisGrapher.content.graphParams.coordsFollowMouse){
    		var sigdiginx = 2-Math.floor(Math.log(Math.abs(xmax))/Math.LN10);
    		plotHoverPositionX = sigdiginx >= 0 ? x.toFixed(sigdiginx) : Math.floor(x / Math.pow(10, -sigdiginx)) * Math.pow(10, -sigdiginx); 
    		var sigdiginy = 2-Math.floor(Math.log(Math.abs(ymax))/Math.LN10);
    		plotHoverPositionY = sigdiginy >= 0 ? y.toFixed(sigdiginy) : Math.floor(y / Math.pow(10, -sigdiginy)) * Math.pow(10, -sigdiginy); 
	  	} else {
    		//get the position of the mouse in the graph
    		plotHoverPositionX = x.toFixed(2);
    		plotHoverPositionY = y.toFixed(2);
    	}

    	//get the x units
    	var graphXUnits = event.data.thisGrapher.content.graphParams.xUnits;
    	
    	//get the y units
    	var graphYUnits = event.data.thisGrapher.content.graphParams.yUnits;
    	
    	//display the position e.g. (10.52 min, 4.34 km)
    	var plotHoverPositionText = "(" + plotHoverPositionX + " " + graphXUnits + ", " + plotHoverPositionY + " " + graphYUnits + ")";
    	
    	$('#plotHoverPosition').html(plotHoverPositionText);
    	if (typeof event.data.thisGrapher.content.graphParams.coordsFollowMouse != "undefined" && event.data.thisGrapher.content.graphParams.coordsFollowMouse){
    		$('#plotHoverPosition').html(plotHoverPositionText).css({position: 'absolute', float: 'left', left: pos.pageX + 20, top: pos.pageY}); 
   		 }

        if (item) {
            if (previousPoint != item.datapoint) {
                previousPoint = item.datapoint;
                
                //remove the existing tooltip
                $("#tooltip").remove();
                
                //get the x and y values from the point the mouse is over
                var x = parseFloat(item.datapoint[0]);
                var y = parseFloat(item.datapoint[1]);
                
                // if we are using the easy click option, only show points within domain
                if (typeof contentGraphParams.easyClickExtremes != "undefined" && contentGraphParams.easyClickExtremes){
					if (x < xmin && item.series.data.length > 1){
						x = xmin;
						y = event.data.thisGrapher.getYValue(x,item.series.data);
					} else if (x > xmax && item.series.data.length > 1){
						x = xmax;
						y = event.data.thisGrapher.getYValue(x,item.series.data);
					} 
    			} 
        
        		//get the x and y values
        		var dataPointObject = {
        				x:item.datapoint[0],
        				y:item.datapoint[1]
        		};
        		//get the offset of the points relative to the plot div
                var offsetObject = event.data.thisGrapher.globalPlot.pointOffset(dataPointObject);
        		var plotOffsetX = offsetObject.left;
        		var plotOffsetY = offsetObject.top;
                
                //get the units for the x and y values
                var xUnits = event.data.thisGrapher.content.graphParams.xUnits;
                var yUnits = event.data.thisGrapher.content.graphParams.yUnits;
                
                // in hoverable coords clean up the tooltip text a bit
                if (typeof event.data.thisGrapher.content.graphParams.coordsFollowMouse !== "undefined" && event.data.thisGrapher.content.graphParams.coordsFollowMouse){
		    		var sigdiginx = 2-Math.floor(Math.log(Math.abs(xmax))/Math.LN10);
		    		x = sigdiginx >= 0 ? x.toFixed(sigdiginx) : Math.floor(x / Math.pow(10, -sigdiginx)) * Math.pow(10, -sigdiginx); 
		    		var sigdiginy = 2-Math.floor(Math.log(Math.abs(ymax))/Math.LN10);
		    		y = sigdiginy >= 0 ? y.toFixed(sigdiginy) : Math.floor(y / Math.pow(10, -sigdiginy)) * Math.pow(10, -sigdiginy); 
		    	} else {
		    		x = x.toFixed(2);
		    		y = y.toFixed(2);
		    	}

                //create the text that we will display in the tool tip
                var toolTipText = item.series.label + ": " + x + " " + xUnits + ", " + y + " " + yUnits;
                
                //display the tool tip
                event.data.thisGrapher.showTooltip(plotOffsetX, plotOffsetY, toolTipText);
            }
        } else {
        	//remove the tool tip
            $("#tooltip").remove();
            previousPoint = null;            
        }
        
        //check if the student is click dragging to create prediction points
        if(event.data.thisGrapher.mouseDown) {
        	if(!event.data.thisGrapher.predictionLocked && event.data.thisGrapher.createPrediction) {
        		// allow author to enable or disable draw while dragging
        		if (event.data.thisGrapher.content.allowDragDraw) {
					//add prediction point
					event.data.thisGrapher.predictionReceived(pos.x, pos.y);
					
					//plot the graph again so the new point is displayed
					event.data.thisGrapher.plotData();        		
				} // allow points to be dragged up or down around screen
				 else if (typeof event.data.thisGrapher.content.allowDragPoint != "undefined" && event.data.thisGrapher.content.allowDragPoint) {
					if (item && event.data.thisGrapher.dragPoint == null){
						// if there is a point we are hovering over and there is no drag point, set it
						 event.data.thisGrapher.dragPoint = item;
					} else if (event.data.thisGrapher.dragPoint != null) {
						// move the point
						var x = pos.x;
						var y = pos.y;
						var oldx = event.data.thisGrapher.dragPoint.datapoint[0];
						// if we are using the easy click option, only show points within domain
		                if (typeof contentGraphParams.easyClickExtremes != "undefined" && contentGraphParams.easyClickExtremes){
							if (x < xmin){
								x = xmin;
							} else if (x > xmax){
								x = xmax;
							} 

							if (y < ymin){
								y = ymin;
							} else if (y > ymax){
								y = ymax;
							} 
    					} 
    					// in hoverable coords clean up the tooltip text a bit
		                if (typeof event.data.thisGrapher.content.graphParams.coordsFollowMouse != "undefined" && event.data.thisGrapher.content.graphParams.coordsFollowMouse){
				    		var sigdiginx = 2-Math.floor(Math.log(Math.abs(xmax))/Math.LN10);
				    		x = sigdiginx >= 0 ? x.toFixed(sigdiginx) : Math.floor(x / Math.pow(10, -sigdiginx)) * Math.pow(10, -sigdiginx); 
				    		var sigdiginy = 2-Math.floor(Math.log(Math.abs(ymax))/Math.LN10);
				    		y = sigdiginy >= 0 ? y.toFixed(sigdiginy) : Math.floor(y / Math.pow(10, -sigdiginy)) * Math.pow(10, -sigdiginy); 
				    	} else {
				    		x = x.toFixed(2);
				    		y = y.toFixed(2);
				    	}
				    	event.data.thisGrapher.predictionUpdateBySeriesDataIndex(parseFloat(x), parseFloat(y), event.data.thisGrapher.dragPoint.dataIndex);
						//plot the graph again so the point is displayed
						event.data.thisGrapher.plotData();
					}
				}
        	}
        } else {
        	event.data.thisGrapher.dragPoint = null;
        }
    });
};

/**
 * Display the tool tip for the point on the graph the student has their mouse over.
 * @param x the x position to display the tool tip at
 * @param y the y position to display the tool tip at
 * @param toolTipText the text to display in the tool tip
 */
Grapher.prototype.showTooltip = function(x, y, toolTipText) {
    $('<div id="tooltip">' + toolTipText + '</div>').css( {
        position: 'absolute',
        //display: 'none',
        top: y + 20,
        left: x + 20,
        border: '1px solid #fdd',
        padding: '2px',
        'background-color': '#fee',
        opacity: 0.8
    }).appendTo("#" + this.graphDivId).fadeIn(200);
};

/**
 * Setup the graph so that when the student clicks on a data point it creates
 * an annotation.
 */
Grapher.prototype.setupPlotClick = function() {
	$("#" + this.graphDivId).unbind("plotclick");
	
	/*
	 * bind the plotclick event to this function. the thisGrapher object
	 * will be passed into the function and accessed through event.data.thisGrapher
	 */
    $("#" + this.graphDivId).bind("plotclick", {thisGrapher:this}, function (event, pos, item) {
        if (item && item.series.name == event.data.thisGrapher.currentGraphName) {
        	//student has clicked on a point in this series
        	
        	// if the point is not on a series that is currently selected, do nothing
        	if (item.series.name != event.data.thisGrapher.currentGraphName) {
        		return;
        	}
        	
            //get the name of the graph line
            var seriesName = item.series.name;
            
        	if(seriesName.indexOf("prediction") == -1 || !event.data.thisGrapher.predictionLocked) {
        		/*
        		 * the plot line that was clicked was not a prediction line
        		 * or create prediction is enabled. this is just to prevent
        		 * modification of the prediction if create prediction is 
        		 * disabled
        		 */
        		
            	//highlight the data point that was clicked
                event.data.thisGrapher.globalPlot.highlight(item.series, item.datapoint);
                
                //get the index of the point for the graph line
                var dataIndex = item.dataIndex;
                
                //get the data point x,y values
                var dataPoint = item.datapoint;
                
                //create an annotation
                event.data.thisGrapher.createAnnotation(seriesName, dataIndex, dataPoint);
                
                //get the x value
                var x = dataPoint[0];
                
            	//remember the data for the point that was clicked
                event.data.thisGrapher.lastPointClicked = {
            		seriesName:seriesName,
            		dataIndex:dataIndex,
            		x:x
            	};
        	}
        } else {
        	//student has clicked on an empty spot on the graph
        	
        	//check if this step allows the student to create a prediction
        	if(!event.data.thisGrapher.predictionLocked && event.data.thisGrapher.createPrediction && event.data.thisGrapher.dragPoint == null) {
        		var isCompleted = event.data.thisGrapher.node.isCompleted();
        		//create the prediction point
        		event.data.thisGrapher.predictionReceived(pos.x, pos.y);
        		//plot the graph again so the point is displayed
            	event.data.thisGrapher.plotData();

            	// if this node is constrained and we are using easyClickExtremes, save data to release constraints (possibly)
        		if (typeof event.data.thisGrapher.content.graphParams.easyClickExtremes != "undefined" && event.data.thisGrapher.content.graphParams.easyClickExtremes && isCompleted != event.data.thisGrapher.node.isCompleted(event.data.thisGrapher.grapherState)){
        			event.data.thisGrapher.save();
        		}
        	}
        }
        this.dragPoint = null;
    });
};

/**
 * Setup the plot filter so students can turn on/off the different
 * lines in the graph when there is more than one line displayed
 */
Grapher.prototype.setupPlotFilter = function() {
    //get the div where we display the checkboxes
    var graphCheckBoxesDiv = $("#" + this.graphCheckBoxesDivId);
    
    //get the graph params
    var graphParams = this.getGraphParams();
    
    /*
     * save this into thisGrapher so that the filterDataSets can access it
     * since the context within filterDataSets will be different when
     * it gets called
     */
    var thisGrapher = this;
    
    /*
     * Filters the graph lines depending on which ones are checked in the options
     */
    function filterDataSets() {
    	//the array that will contain the graph lines we want to display
    	var dataToDisplay = [];

    	//get all the data sets
    	var dataSets = thisGrapher.globalDataSets;

    	if(graphCheckBoxesDiv.length == 0) {
    		//we could not find the checkboxes div so we will just display all the graph lines
    		dataToDisplay = dataSets;
    	} else {
    		//we found the checkboxes div so we will filter graph lines
    		
    		//get all the check boxes that were checked
        	graphCheckBoxesDiv.find("input:checked").each(function() {
        		//get the name of the graph line
        		var index = $(this).attr("name");
        		
        		//make sure that graph line exists
        		if(index && dataSets[index]) {
        			//put the graph line into the array to display
        			dataToDisplay.push(dataSets[index]);
        		}
        	});	
    	}

    	//display the graph lines that we want to display
    	thisGrapher.globalPlot = $.plot($("#" + thisGrapher.graphDivId), dataToDisplay, graphParams);
    	
    	//delete all the annotation tool tips form the UI
    	thisGrapher.removeAllAnnotationToolTips();
    	
    	//highlight the points that have annotations
    	thisGrapher.highlightAnnotationPoints(null, null, dataToDisplay);
    }
    
    //check if we have created the check boxes
    if(graphCheckBoxesDiv.html() == "") {
    	//we have not created the check boxes
    	
    	//loop through all the data sets and create a check box for each
    	$.each(this.globalDataSets, function(index, val) {
    		var checked = "";
    		
    		//check if we should the check box for this data set should be initially checked
    		if(val.checked) {
    			checked = "checked='checked'";
    		}
    		
    		//add the check box
	    	graphCheckBoxesDiv.append("<br><input type='checkbox' name='" + index + "' " + checked + " id='graphOption" + index + "' />");
	    	
	    	//add the name of the data set next to the check box
	    	graphCheckBoxesDiv.append("<label for='graphOption" + index + "'>" + val.label + "</label>");
	    });
    	
    	//have the filterDataSets be called when any of the check boxes are clicked
    	graphCheckBoxesDiv.find("input").click(filterDataSets);
    }
    
    //filter the data sets
    filterDataSets();
};

/**
 * Add the annotations to the UI
 */
Grapher.prototype.setupAnnotations = function() {
	/*
	 * clear any existing annotations, this is needed when the student
	 * clicks on the current step again in the left nav menu because
	 * the html does not get cleared but render() gets called again
	 */
	$("#graphAnnotationsDiv").html("");

	//get the annotations
	var annotationArray = this.grapherState.annotationArray;
	
	//loop through all the annotations
	for(var i=0; i<annotationArray.length; i++) {
		//get an annotation
		var annotation = annotationArray[i];
		
		//get the x and y values of the annotation
		var x = annotation.x;
		var y = annotation.y;
		
		//get the name of the graph line
		var seriesName = annotation.seriesName;
		
		//get the series
		var series = this.getSeriesByName(this.globalPlot, seriesName);
		
		//get the index of the point on the graph line
		var dataIndex = annotation.dataIndex;
		
		if(series != null) {
			//get the data index with the given x value
			var dataIndexAtX = this.getDataIndexAtX(series, x);
			
			if(dataIndexAtX != null) {
				/*
				 * use the data index at x if it is not null, this will be null for old data
				 * since old data does not store x values in the annotation
				 */
				dataIndex = dataIndexAtX;
			}
		}
		
		//get the data text which contains the x,y values
		var dataText = annotation.dataText;
		
		//get the text the student wrote for the annotation
		var annotationText = annotation.annotationText;
		
		//add the annotation to the UI
		this.addAnnotationToUI(seriesName, dataIndex, x, y, dataText, annotationText);
	}
};

/**
 * Highlight the points that have annotations
 * @param grapherState
 * @param plot
 * @param dataSets the data sets currently displayed on the graph
 */
Grapher.prototype.highlightAnnotationPoints = function(grapherState, plot, dataSets) {
	if(grapherState == null) {
		//use this.grapherState as the default grapher state if grapherState was note provided
		grapherState = this.grapherState;
	}
	
	if(plot == null) {
		//use this.globalPlot as the default if plot was not provided
		plot = this.globalPlot;
	}
	
	//get the annotations
	var annotationArray = grapherState.annotationArray;
	
	//loop through all the annotations
	for(var i=0; i<annotationArray.length; i++) {
		//get an annotation
		var annotation = annotationArray[i];
		
		//get the name of the graph line
		var seriesName = annotation.seriesName;
		
		if(dataSets != null) {
			//check if the annotation is on one of the data sets that are currently displayed
			if(!this.dataSetContainsName(dataSets, seriesName)) {
				/*
				 * it is not from one of the currently displayed data sets
				 * so we do not need to display this annotation
				 */
				continue;
			}
		}
		
		//get the index of the point on the graph line
		var dataIndex = annotation.dataIndex;
		
		//get the x and y values
		var x = annotation.x;
		var y = annotation.y;
		
		//get the graph line
		var series = this.getSeriesByName(plot, seriesName);
		
		if(series != null) {
			//add the annotation tool to tip the UI
			this.addAnnotationToolTipToUI(seriesName, dataIndex, x, y, annotation.annotationText);
		}
	}
};

/**
 * Get the graph line object given the plot object and the name
 * of the graph line
 * @param plot the plot object returned from $.plot()
 * @param seriesName the name of the graph line
 * @return the grapha line object (aka series)
 */
Grapher.prototype.getSeriesByName = function(plot, seriesName) {
	//get the array that contains all the graph line objects
	var seriesArray = plot.getData();
	
	//loop through all the graph lines
	for(var x=0; x<seriesArray.length; x++) {
		//get a graph line
		var series = seriesArray[x];
		
		//compare the graph line name
		if(series.name == seriesName) {
			//the name matches so we have found the graph line we want
			return series;
		}
	}
	
	return null;
};

/**
 * Get the units for the graph given the graph type
 * @param graphType
 * e.g.
 * 'distance'
 * 'velocity'
 * 'acceleration'
 * 'temperature'
 * @return the units for the graph type
 * e.g.
 * 'm'
 * 'm/s'
 * 'm/s^2'
 * 'C'
 * 's'
 */
Grapher.prototype.getGraphUnits = function(xORy) {
	return this.graphUnits[xORy];
};

/**
 * Get the graph label for the given graph type
 * @param graphType
 * e.g.
 * 'distance'
 * 'velocity'
 * 'acceleration'
 * 'temperature'
 * @return the label that we will display in the legend
 * e.g.
 * 'distance (m)'
 * 'velocity (m/s)'
 * 'acceleration (m/s^2)'
 * 'temperature (C)'
 */
Grapher.prototype.getGraphLabel = function(graphName) {
	//get the name of the graph
	var graphLabel = this.graphNames[graphName];
	
	//get the units
	var graphUnits = this.graphUnits[graphLabel];
	
	return graphName + " (" + graphUnits + ")";
};

/**
 * Get the graph name given the graph type
 * @param graphType the type of the graph
 * e.g.
 * "prediction"
 * UPDATE - 8/15/2013 - now also uses a series index for those cases where there are multiple series
 * @return the graph name
 */
Grapher.prototype.getGraphName = function(seriesIndex) {
	return 'prediction'-seriesIndex;
};

/**
 * Add the annotation to the UI
 * @param seriesName the name of the graph line
 * @param dataIndex the index on the graph line for the data point
 * @param dataText the text containing the x,y values of the data point
 * @param annotationText the text the student wrote for the annotation
 */
Grapher.prototype.addAnnotationToUI = function(seriesName, dataIndex, x, y, dataText, annotationText) {
	//create the html that will represent the annotation
	var annotationHtml = "";
	
	//the class we will give to the annotation div
	var annotationClass = "";
	
	//whether we will allow the student to edit the annotation
	var enableEditing = "";
	
	//get the series name we will use in the DOM
	var domSeriesName = this.getDOMSeriesName(seriesName);
	
	//set the class determined by whether this annotation is for grapher data or prediction
	annotationClass = "predictionAnnotation";
	
	//get the x value we will use in the DOM id
	var domXValue = this.getDOMXValue(x);
	
	annotationHtml += "<div id='" + domSeriesName + domXValue + "AnnotationDiv' class='" + annotationClass + "'>";
	
	//add the annotation text label that displays the x,y values for the point
	annotationHtml += "<p id='" + domSeriesName + domXValue + "AnnotationDataText' style='display:inline'>" + seriesName + " [" + dataText + "]: </p>";
	
	//add the text input where the student can type
	annotationHtml += "<input id='" + domSeriesName + domXValue + "AnnotationInputText' type='text' class='predictionTextInput' value='" + annotationText + "' onchange='editAnnotation(\"" + domSeriesName + "\", " + x + ")' size='50' " + enableEditing + "/>";
	
	//add the delete button to delete the annotation
	annotationHtml += "<input id='" + domSeriesName + domXValue + "AnnotationDeleteButton' type='button' class='predictionDeleteButton' value='Delete' onclick='deleteAnnotation(\"" + domSeriesName + "\", " + dataIndex + ", " + x + ")' " + enableEditing + "/>";
	annotationHtml += "</div>";
	
	//add the annotation html to the div where we put all the annotations
	$("#graphAnnotationsDiv").append(annotationHtml);
};

/**
 * Delete the annotation html for the given annotation
 * @param seriesName the name of the graph line
 * @param x the x value for the data point
 */
Grapher.prototype.deleteAnnotationFromUI = function(seriesName, x) {
	//get the series name with spaces replaced with underscores
	var domSeriesName = this.getDOMSeriesName(seriesName);
	
	//get the x value we will use in the DOM id
	var domXValue = this.getDOMXValue(x);
	
	//remove the annotation from the UI
	$("#" + domSeriesName + domXValue + "AnnotationDiv").remove();
};

/**
 * Delete all the annotations from the annotation div
 */
Grapher.prototype.deleteAllAnnotationsFromUI = function() {
	$("#graphAnnotationsDiv").html("");
};

/**
 * Delete the grapher annotations from the UI
 */
Grapher.prototype.deleteGrapherAnnotationsFromUI = function() {
	$(".grapherAnnotation").remove();
};

/**
 * Delete the prediction annotations from the UI
 */
Grapher.prototype.deletePredictionAnnotationsFromUI = function() {
	$(".predictionAnnotation").remove();
};

/**
 * Create a new annotation in the grapher state and also in the html UI
 * @param seriesName the name of the graph line
 * @param dataIndex the index on the graph line for the data point
 * @param dataPoint the x, y data point in an array [x,y]
 */
Grapher.prototype.createAnnotation = function(seriesName, dataIndex, dataPoint) {
	if (typeof this.content.allowAnnotations !== "undefined" && !this.content.allowAnnotations) return;
	//get the y units
	var graphYUnits = this.content.graphParams.yUnits;
	
	//get the x units
	var graphXUnits = this.content.graphParams.xUnits;
	
	//get the x and y values
	var x = dataPoint[0];
	var y = dataPoint[1];
	
	//get the text representation of the data point
	var dataText = x + " " + graphXUnits + ", " + y + " " + graphYUnits;
	
	//check if there is already an annotation for the given point
	var annotation = this.grapherState.getAnnotationBySeriesXValue(seriesName, x);
	
	if(annotation == null) {
		/*
		 * if this grapher state contains old data it will not have 
		 * an x value so we will have to search using the data index
		 */
		annotation = this.grapherState.getAnnotationBySeriesDataIndex(seriesName, dataIndex);
	}
	
	if(annotation == null) {
		//annotation does not exist for this point so we will make it
		
		//add the annotation to the UI
		this.addAnnotationToUI(seriesName, dataIndex, x, y, dataText, "");
		
		//add the annotation to the grapher state
		this.grapherState.addAnnotation(seriesName, dataIndex, x, y, dataText);
		
		//set this flag so we know that we will need to save student data since it has changed
		this.annotationsChanged = true;
		
		//add the annotation tool tip to the UI
		this.addAnnotationToolTipToUI(seriesName, dataIndex, x, y, "");
	} else {
		//annotation already exists for this point
		//TODO: highlight the annotation row in the #graphAnnotationsDiv
	}
};

/**
 * Delete the annotation from the UI and the grapher state
 * @param seriesName the name of the graph line
 * @param dataIndex the index of the point in the line
 * @param x the index on the graph line for the data point
 */
Grapher.prototype.deleteAnnotation = function(seriesName, dataIndex, x) {
	//delete the annotation from the UI
	this.deleteAnnotationFromUI(seriesName, x);
	
	//delete the annotation from the grapher state
	this.grapherState.deleteAnnotation(seriesName, x);
	
	//get the graph line
	var series = this.getSeriesByName(this.globalPlot, seriesName);
	
	if(series != null) {
		//remove the highlight on the point on the graph that this annotation was for
		this.globalPlot.unhighlight(series, dataIndex);		
	}
	
	//get the x value we will use in the DOM id
	var domXValue = this.getDOMXValue(x);
	
	//delete the annotation tool tip from the UI
	var domSeriesName = this.getDOMSeriesName(seriesName);
	$("#" + this.graphDivId + "_annotationToolTip_" + domSeriesName + domXValue).remove();
	
	//set this flag so we know that we will need to save student data since it has changed
	this.annotationsChanged = true;
};

/**
 * The student has edited the annotation text for the annotation so
 * we will update it in the grapher state annotation
 * @param seriesName the name of the graph line
 * @param x the x value for the data point
 * @param annotationText the text the student has written
 */
Grapher.prototype.editAnnotation = function(seriesName, x, annotationText) {
	//update the annotation in the grapher state
	this.grapherState.editAnnotation(seriesName, x, annotationText);
	
	var domSeriesName = this.getDOMSeriesName(seriesName);
	
	var domXValue = this.getDOMXValue(x);
	
	var annotationToolTipDivId = this.graphDivId + '_annotationToolTip_' + domSeriesName + domXValue;
	
	//update the annotation tool tip on the graph
	$("#" + annotationToolTipDivId).html(annotationText);
	
	if(annotationText != null && annotationText != "") {
		//show the annotation tool tip on the graph
		$('#' + annotationToolTipDivId).show();
		$('#' + annotationToolTipDivId).addClass("activeAnnotationToolTip").removeClass("hiddenAnnotationToolTip");
	} else {
		//hide the annotation tool tip on the graph if the annotation text is ""
		$('#' + annotationToolTipDivId).hide();
		$('#' + annotationToolTipDivId).addClass("hiddenAnnotationToolTip").removeClass("activeAnnotationToolTip");
	}
	
	//set this flag so we know that we will need to save student data since it has changed
	this.annotationsChanged = true;
};

/**
 * Set the labels for the graph
 */
Grapher.prototype.setupGraphLabels = function() {
	if(this.content.graphParams != null) {
		//get the x and y labels
		var xLabel = "";
		if(this.content.graphParams.xlabel) {
			xLabel = this.content.graphParams.xlabel;	
		}
		
		var yLabel = "";
		if(this.content.graphParams.ylabel) {
			yLabel = this.content.graphParams.ylabel;
		}
		
		/*
		 * if the grapher state contains axis values it will override
		 * the axis values from the content
		 */
		if(this.grapherState != null) {
			if(this.grapherState.xlabel != null && this.grapherState.xlabel != "")  {
				xLabel = this.grapherState.xlabel;
			}
			if(this.grapherState.ylabel != null && this.grapherState.ylabel != "")  {
				yLabel = this.grapherState.ylabel;
			}
		}

		//set the y label
		$('#yLabelDiv').html(yLabel);
		
		//set the x label
		$('#xLabelDiv').html(xLabel);

	}
};

/**
 * Display the starter sentence button if the author has specified to
 * do so
 */
Grapher.prototype.displayStarterSentenceButton = function() {
	if(this.content.starterSentence) {
		if(this.content.starterSentence.display == "0") {
			//do not show the starter sentence button
			$('#showStarterSentenceButtonDiv').hide();
		} else if(this.content.starterSentence.display == "1" || this.content.starterSentence.display == "2") {
			//show the starter sentence button
			$('#showStarterSentenceButtonDiv').show();

			if(this.content.starterSentence.display == "2") {
				//automatically populate the response box with the starter sentence
				
				//check if the student has submitted a response before
				if(this.states == null || this.states.length == 0) {
					/*
					 * the student has not submitted a response before so this
					 * is the first time they are visiting the step. we will
					 * populate the response textarea with the starter sentence
					 */
					var starterSentence = this.content.starterSentence.sentence;
					
					/*
					 * there should be nothing in the textarea but we will just
					 * append the starter sentence just in case so that we don't
					 * risk overwriting the text that is already in there
					 */
					var response = $("#responseTextArea").val();
					response += starterSentence;
					$("#responseTextArea").val(response);
				}
			}
			
		}
	}
};

/**
 * Append the starter sentence to the response textarea
 */
Grapher.prototype.showStarterSentence = function() {
	if(this.content.starterSentence) {
		//get the starter sentence
		var starterSentence = this.content.starterSentence.sentence;
		
		//append the starter sentence to the text in the textarea
		var response = $("#responseTextArea").val();
		response += starterSentence;
		$("#responseTextArea").val(response);
	}
};

/**
 * Show the graph check box options if the author has specified to
 */
Grapher.prototype.showGraphOptions = function() {
	if(this.content.showGraphOptions) {
		//show the graph options
		$('#graphCheckBoxesDiv').show();
	} else {
		//do not show the graph options
		$('#graphCheckBoxesDiv').hide();
	}
};

/**
 * The student has changed the axis range so we will obtain those
 * values and plot the graph again
 */
Grapher.prototype.updateAxisRange = function() {
	if (this.content.graphParams.allowUpdateAxisRange) {
		//set this flag so we know the grapher state has changed
		this.axisRangeChanged = true;

		//get all the values from the text box inputs
		var xMin = $('#xMinInput').val();
		var xMax = $('#xMaxInput').val();
		var yMin = $('#yMinInput').val();
		var yMax = $('#yMaxInput').val();
		
		//check if the limit values are valid
		if(!this.areLimitsValid(xMin, xMax, yMin, yMax, true, true)) {
			/*
			 * at least one of the values is not valid so we will
			 * return without saving any of the values.
			 */
			return;
		}
		
		//set the value into the grapher state
		this.grapherState.xMin = xMin;
		this.grapherState.xMax = xMax;
		this.grapherState.yMin = yMin;
		this.grapherState.yMax = yMax;

		//parse the graph params again to obtain the new values in the graph params
		this.graphParams = this.parseGraphParams(this.content.graphParams);

		//plot the graph again
		this.plotData();
	}
};


/**
 * Check if the axis limits are valid. Makes sure the values are numbers
 * and also that the min values are less than the max values
 * @param xMin the x min value
 * @param xMax the x max value
 * @param yMin the y min value
 * @param yMax the y max value
 * @param resetInvalidValues whether to reset the values that are invalid
 * @param enableAlert whether to display the alert message with feedback
 */
Grapher.prototype.areLimitsValid = function(xMin, xMax, yMin, yMax, resetInvalidValues, enableAlert) {
	var result = true;
	
	if(isNaN(Number(xMin))) {
		if(enableAlert) {
			//x min is not a number
			alert("Error: x min is not a number");			
		}
		
		if(resetInvalidValues) {
			//reset the x min value
			this.resetXMin();			
		}
		
		result = false;
	} else if(isNaN(Number(xMax))) {
		if(enableAlert) {
			//x max is not a number
			alert("Error: x max is not a number");			
		}

		if(resetInvalidValues) {
			//reset the x max value
			this.resetXMax();			
		}
		
		result = false;
	} else if(isNaN(Number(yMin))) {
		if(enableAlert) {
			//y min is not a number
			alert("Error: y min is not a number");			
		}
		
		if(resetInvalidValues) {
			//reset the y min value
			this.resetYMin();			
		}
		
		result = false;
	} else if(isNaN(Number(yMax))) {
		if(enableAlert) {
			//y max is not a number
			alert("Error: y max is not a number");			
		}
		
		if(resetInvalidValues) {
			//reset the y max value
			this.resetYMax();			
		}
		
		result = false;
	} else if(xMin != '' && xMax != '' && Number(xMin) >= Number(xMax)) {
		if(enableAlert) {
			//x min is greater than x max
			alert("Error: x min is greater than x max");			
		}
		
		if(resetInvalidValues) {
			//reset the x min value
			this.resetXMin();
			
			//reset the x max value
			this.resetXMax();			
		}
		
		result = false;
	} else if(yMin != '' && yMax != '' && Number(yMin) >= Number(yMax)) {
		if(enableAlert) {
			//y min is greater than y max
			alert("Error: y min is greater than y max");			
		}
		
		if(resetInvalidValues) {
			//reset the y min value
			this.resetYMin();
			
			//reset the y max value
			this.resetYMax();			
		}
		
		result = false;
	}
	
	return result;
};

/**
 * Reset the x min value. First check for an x min value in
 * the state, and if it is not found there, check the content
 */
Grapher.prototype.resetXMin = function() {
	var previousXMin = null;
	
	if(this.grapherState.xMin != null) {
		//reset the x min value from the state
		previousXMin = this.grapherState.xMin;
	} else if(this.content.graphParams.xmin != null) {
		//reset the x min value from the content
		previousXMin = this.content.graphParams.xmin;
	}
	
	//reset the x min value
	$('#xMinInput').val(previousXMin);
};

/**
 * Reset the x max value. First check for an x max value in
 * the state, and if it is not found there, check the content
 */
Grapher.prototype.resetXMax = function() {
	var previousXMax = null;
	
	if(this.grapherState.xMax != null) {
		//reset the x max value from the state
		previousXMax = this.grapherState.xMax;
	} else if(this.content.graphParams.xmax != null) {
		//reset the x max value from the content
		previousXMax = this.content.graphParams.xmax;
	}
	
	//reset the x max value
	$('#xMaxInput').val(previousXMax);
};

/**
 * Reset the y min value. First check for an y min value in
 * the state, and if it is not found there, check the content
 */
Grapher.prototype.resetYMin = function() {
	var previousYMin = null;
	
	if(this.grapherState.yMin != null) {
		//reset the y min value from the state
		previousYMin = this.grapherState.yMin;
	} else if(this.content.graphParams.ymin != null) {
		//reset the y min value from the content
		previousYMin = this.content.graphParams.ymin;
	}
	
	//reset the x min value
	$('#yMinInput').val(previousYMin);
};

/**
 * Reset the x max value. First check for an x max value in
 * the state, and if it is not found there, check the content
 */
Grapher.prototype.resetYMax = function() {
	var previousYMax = null;
	
	if(this.grapherState.yMax != null) {
		//reset the y max value from the state
		previousYMax = this.grapherState.yMax;
	} else if(this.content.graphParams.ymax != null) {
		//reset the y max value from the content
		previousYMax = this.content.graphParams.ymax;
	}
	
	//reset the x max value
	$('#yMaxInput').val(previousYMax);
};

/**
 * The student wants to reset the axis range values back to the
 * default values
 */
Grapher.prototype.resetDefaultAxisRange = function() {
	//set this flag so we know the grapher state has changed
	this.axisRangeChanged = true;
	
	var xMin = "";
	var xMax = "";
	var yMin = "";
	var yMax = "";
	
	if(this.content.graphParams != null) {
		if(this.content.graphParams.xmin != null && this.content.graphParams.xmin != "") {
			//set the xmin value
			xMin = this.content.graphParams.xmin;
		}

		if(this.content.graphParams.xmax != null && this.content.graphParams.xmax != "") {
			//set the xmax value
			xMax = this.content.graphParams.xmax;
		}

		if(this.content.graphParams.ymin != null && this.content.graphParams.ymin != "") {
			//set the ymin value
			yMin = this.content.graphParams.ymin;
		}

		if(this.content.graphParams.ymax != null && this.content.graphParams.ymax != "") {
			//set the ymax value
			yMax = this.content.graphParams.ymax;
		}
	}
	
	//reset the values in the text box inputs
	$('#xMinInput').val(xMin);
	$('#xMaxInput').val(xMax);
	$('#yMinInput').val(yMin);
	$('#yMaxInput').val(yMax);
	
	//reset the values in the grapher state
	this.grapherState.xMin = this.content.graphParams.xmin;
	this.grapherState.xMax = this.content.graphParams.xmax;
	this.grapherState.yMin = this.content.graphParams.ymin;
	this.grapherState.yMax = this.content.graphParams.ymax;
	
	//parse the graph params again to obtain the new values in the graph params
	this.graphParams = this.parseGraphParams(this.content.graphParams);
	
	//plot the graph again
	this.plotData();
};

/**
 * Get the prediction array in a format that we can give to flot to plot
 * @return an array containing arrays with two values [x, y] that represent
 * the prediction points
 */
Grapher.prototype.getPredictionArrayByPredictionIndex = function(predictionIndex) {
	//get the graph data array from the current state 
	var predictionArray = this.generatePredictionArray(this.grapherState, this.content.seriesLabels[predictionIndex]);
	
	return predictionArray;
};

/**
 * Generate the prediction array in a format that we can give to flot to plot
 * @param state the grapher state
 * @return an array containing arrays with two values [x, y] that represent
 * the prediction points
 */
Grapher.prototype.generatePredictionArray = function(state,predictionId) {
	var predictionArray = [];
	
	if(state != null) {
		//get the data array from the state
		var statePredictionArray = state.predictionArray;
		
		if(statePredictionArray != null) {
			//loop through all the elements in the data array
			for(var i=0; i<statePredictionArray.length; i++) {
				
				var predictionObj = statePredictionArray[i];
				
				if (predictionObj.id == predictionId) {
					predictions = predictionObj.predictions;
					
					for (var k=0; k<predictions.length; k++) {
						//get the data array element
						var predictionData = predictions[k];

						//get the time
						var x = predictionData.x;
				
						//get the y value. this may be distance or temp or etc.
						var y = predictionData.y;
				
						/*
						 * add the x, y data point into the array. flot expects
						 * the each element in the array to be an array.
						 */
						predictionArray.push([x, y]);
					}
				}
			}
		}		
	}
	return predictionArray;
};

/**
 * Convert the array of object positions to an array of array positions
 * e.g.
 * convert
 * [{x:1,y:2}, {x:2,y:4}]
 * to
 * [[1,2], [2,4]]
 * @param arrayToConvert an array of object positions with x and y fields
 * @returns an array of arrays
 */
Grapher.prototype.convertToPlottableArray = function(arrayToConvert) {
	var plottableArray = [];
	
	//loop through all the elements in the object array
	for(var i=0; i<arrayToConvert.length; i++) {
		//get an object
		var positionObject = arrayToConvert[i];
		
		if(positionObject != null) {
			//get the x and y fields from the object
			var x = positionObject.x;
			var y = positionObject.y;
			
			/*
			 * create an array to hold the x and y values.
			 * the first element will be x, the second element
			 * will be y.
			 */
			var positionArray = [];
			positionArray.push(x);
			positionArray.push(y);
			
			//put the array into our parent array
			plottableArray.push(positionArray);
		}
	}
	
	return plottableArray;
};

/**
 * The student has created a prediction point
 * @param x the x value for the point
 * @param y the y value for the point
 */
Grapher.prototype.predictionReceived = function(x, y) {
	
	if(x != null && y != null) {
		//round x down to the nearest 0.01
		//var xFactor = 1 / this.content.gatherXIncrement;
		x = parseFloat(x.toFixed(2));		
		y = parseFloat(y.toFixed(2));
		var xmax = typeof this.grapherState.xMax != "undefined" ? parseFloat(this.grapherState.xMax) : parseFloat(this.content.graphParams.xmax);
		var xmin = typeof this.grapherState.xMin != "undefined" ? parseFloat(this.grapherState.xMin) : parseFloat(this.content.graphParams.xmin);
		var ymax = typeof this.grapherState.yMax != "undefined" ? parseFloat(this.grapherState.yMax) : parseFloat(this.content.graphParams.ymax);
		var ymin = typeof this.grapherState.yMin != "undefined" ? parseFloat(this.grapherState.yMin) : parseFloat(this.content.graphParams.ymin);
	
		if (typeof this.content.graphParams.easyClickExtremes != "undefined" && this.content.graphParams.easyClickExtremes ){
			if (x < xmin){
				x = xmin;
			} else if (x > xmax){
				x = xmax;
			}
			if (y < ymin){
				y = ymin;
			} else if (y > ymax){
				y = ymax;
			}
		}
		
		//insert the point into the grapher state
		this.grapherState.predictionReceived(this.currentGraphName, x, y, typeof this.content.graphParams.allowNonFunctionalData != "undefined" ? !this.content.graphParams.allowNonFunctionalData : true);
		
		this.graphChanged = true;
		
		var seriesName = this.currentGraphName;
		
		var annotation = this.grapherState.getAnnotationBySeriesXValue(seriesName, x);
		
		if(annotation != null) {
			//annotation exists for this x value so we will update that annotation
			
			//get the y units
			var graphYUnits = this.content.graphParams.yUnits;
			
			//get the x units
			var graphXUnits = this.content.graphParams.xUnits;
			
			//get the text representation of the data point
			var dataText = x + " " + graphXUnits + ", " + y + " " + graphYUnits;

			//get the series name used in the dom
			var domSeriesName = this.getDOMSeriesName(seriesName);

			//get the series
			var series = this.getSeriesByName(this.globalPlot, seriesName);
			
			//get the data index of the point with the given x value
			var dataIndex = this.getDataIndexAtX(series, x);
			
			//set the new values into the annotation
			annotation.x = x;
			annotation.y = y;
			annotation.dataText = dataText;
			annotation.dataIndex = dataIndex;
			
			//get the x value we will use in the DOM id
			var domXValue = this.getDOMXValue(x);
			
			//update the data text in the annotation in the UI
			$("#" + domSeriesName + domXValue + "AnnotationDataText").html(seriesName + " [" + dataText + "]: ");
		}
	}
};

/**
 * The student is updating a prediction point
 * @param x the old x value for the point
 * @param y the new y value for the point
 */
Grapher.prototype.predictionUpdateByX = function(x, y) {
	
	if(x != null && y != null) {
		//round x down to the nearest 0.01
		var xFactor = 1 / this.content.gatherXIncrement;
		//x = Math.round(x * xFactor) / xFactor;	
		x = parseFloat(x.toFixed(2));	
		y = parseFloat(y.toFixed(2));
		var xmax = typeof this.grapherState.xMax != "undefined" ? parseFloat(this.grapherState.xMax) : parseFloat(this.content.graphParams.xmax);
		var xmin = typeof this.grapherState.xMin != "undefined" ? parseFloat(this.grapherState.xMin) : parseFloat(this.content.graphParams.xmin);
		var ymax = typeof this.grapherState.yMax != "undefined" ? parseFloat(this.grapherState.yMax) : parseFloat(this.content.graphParams.ymax);
		var ymin = typeof this.grapherState.yMin != "undefined" ? parseFloat(this.grapherState.yMin) : parseFloat(this.content.graphParams.ymin);
	
		if (typeof this.content.graphParams.easyClickExtremes != "undefined" && this.content.graphParams.easyClickExtremes ){
			if (x < xmin){
				x = xmin;
			} else if (x > xmax){
				x = xmax;
			}
			if (y < ymin){
				y = ymin;
			} else if (y > ymax){
				y = ymax;
			}
		}
		
		//insert the point into the grapher state
		this.graphChanged = this.grapherState.predictionUpdateByX(this.currentGraphName, x, y);
		if (this.graphChanged){
			var seriesName = this.currentGraphName;
			
			var annotation = this.grapherState.getAnnotationBySeriesXValue(seriesName, x);
			
			if(annotation != null) {
				//annotation exists for this x value so we will update that annotation
				
				//get the y units
				var graphYUnits = this.content.graphParams.yUnits;
				
				//get the x units
				var graphXUnits = this.content.graphParams.xUnits;
				
				//get the text representation of the data point
				var dataText = x + " " + graphXUnits + ", " + y + " " + graphYUnits;

				//get the series name used in the dom
				var domSeriesName = this.getDOMSeriesName(seriesName);

				//get the series
				var series = this.getSeriesByName(this.globalPlot, seriesName);
				
				//get the data index of the point with the given x value
				var dataIndex = this.getDataIndexAtX(series, x);
				
				//set the new values into the annotation
				annotation.x = x;
				annotation.y = y;
				annotation.dataText = dataText;
				annotation.dataIndex = dataIndex;
				
				//get the x value we will use in the DOM id
				var domXValue = this.getDOMXValue(x);
				
				//update the data text in the annotation in the UI
				$("#" + domSeriesName + domXValue + "AnnotationDataText").html(seriesName + " [" + dataText + "]: ");
			}
		}
	}
};

/**
 * The student is updating a prediction point (both x and y), lookup by old x value
 * @param x the old x value for the point
 * @param y the new y value for the point
 */
Grapher.prototype.predictionUpdateBySeriesDataIndex = function(x, y, dataIndex) {
	
	if(x != null && y != null) {
		//round x down to the nearest 0.01
		var xFactor = 1 / this.content.gatherXIncrement;
		//x = Math.round(x * xFactor) / xFactor;	
		x = parseFloat(x.toFixed(2));	
		y = parseFloat(y.toFixed(2));
		
		var xmax = typeof this.grapherState.xMax != "undefined" ? parseFloat(this.grapherState.xMax) : parseFloat(this.content.graphParams.xmax);
		var xmin = typeof this.grapherState.xMin != "undefined" ? parseFloat(this.grapherState.xMin) : parseFloat(this.content.graphParams.xmin);
		var ymax = typeof this.grapherState.yMax != "undefined" ? parseFloat(this.grapherState.yMax) : parseFloat(this.content.graphParams.ymax);
		var ymin = typeof this.grapherState.yMin != "undefined" ? parseFloat(this.grapherState.yMin) : parseFloat(this.content.graphParams.ymin);
	
		if (typeof this.content.graphParams.easyClickExtremes != "undefined" && this.content.graphParams.easyClickExtremes ){
			if (x < xmin){
				x = xmin;
			} else if (x > xmax){
				x = xmax;
			}
			if (y < ymin){
				y = ymin;
			} else if (y > ymax){
				y = ymax;
			}
		}
		
		//insert the point into the grapher state
		this.graphChanged = this.grapherState.predictionUpdateBySeriesDataIndex(this.currentGraphName, x, y, dataIndex);
		if (this.graphChanged){
			var seriesName = this.currentGraphName;
			
			var annotation = this.grapherState.getAnnotationBySeriesDataIndex(seriesName, dataIndex);
			
			if(annotation != null) {
				//annotation exists for this x value so we will update that annotation
				
				//get the y units
				var graphYUnits = this.content.graphParams.yUnits;
				
				//get the x units
				var graphXUnits = this.content.graphParams.xUnits;
				
				//get the text representation of the data point
				var dataText = x + " " + graphXUnits + ", " + y + " " + graphYUnits;

				//get the series name used in the dom
				var domSeriesName = this.getDOMSeriesName(seriesName);

				//get the series
				var series = this.getSeriesByName(this.globalPlot, seriesName);
								
				//set the new values into the annotation
				annotation.x = x;
				annotation.y = y;
				annotation.dataText = dataText;
				annotation.dataIndex = dataIndex;
				
				//get the x value we will use in the DOM id
				var domXValue = this.getDOMXValue(x);
				
				//update the data text in the annotation in the UI
				$("#" + domSeriesName + domXValue + "AnnotationDataText").html(seriesName + " [" + dataText + "]: ");
			}
		}
	}
};

/**
 * Hide the prediction buttons
 */
Grapher.prototype.hidePredictionButtons = function() {
	$('#clearPredictionButton').hide();
};

/**
 * Disable the clear prediction button
 */
Grapher.prototype.disablePredictionButtons = function() {
	$('#clearPredictionButton').attr('disabled', true);
};

/**
 * Setup the axis limit values on the graph
 */
Grapher.prototype.setupAxisValues = function() {
	var xMin = "";
	var xMax = "";
	var yMin = "";
	var yMax = "";
	
	if(this.content.graphParams != null) {
		if(this.content.graphParams.xmin != null && this.content.graphParams.xmin != "") {
			//set the xmin value
			xMin = this.content.graphParams.xmin;
		}

		if(this.content.graphParams.xmax != null && this.content.graphParams.xmax != "") {
			//set the xmax value
			xMax = this.content.graphParams.xmax;
		}

		if(this.content.graphParams.ymin != null && this.content.graphParams.ymin != "") {
			//set the ymin value
			yMin = this.content.graphParams.ymin;
		}

		if(this.content.graphParams.ymax != null && this.content.graphParams.ymax != "") {
			//set the ymax value
			yMax = this.content.graphParams.ymax;
		}
	}
	
	/*
	 * if the grapher state contains axis values it will override
	 * the axis values from the content
	 */
	if(this.grapherState != null) {
		if(this.grapherState.xMin != null) {
			xMin = this.grapherState.xMin;
		}
		
		if(this.grapherState.xMax != null) {
			xMax = this.grapherState.xMax;
		}
		
		if(this.grapherState.yMin != null) {
			yMin = this.grapherState.yMin;
		}
		
		if(this.grapherState.yMax != null) {
			yMax = this.grapherState.yMax;
		}
	}
	
	//set the axis range values into the input text boxes
	$('#xMinInput').val(xMin);
	$('#xMaxInput').val(xMax);
	$('#yMinInput').val(yMin);
	$('#yMaxInput').val(yMax);
	
	// disable input boxes if updating axis rang is not permitted.
	if (!this.content.graphParams.allowUpdateAxisRange) {
		$('#xMinInput').attr("disabled","disabled");		
		$('#xMaxInput').attr("disabled","disabled");		
		$('#yMinInput').attr("disabled","disabled");		
		$('#yMaxInput').attr("disabled","disabled");	
		$('#resetDefaultAxisLimitsButton').hide();
	}
};

/**
 * Get the prediction from the prevWorkNodeIds
 * @return
 */
Grapher.prototype.getPreviousPrediction = function() {
	if(this.node.prevWorkNodeIds.length > 0) {
		if(this.view.getState() != null) {
			//get the node type for the previous work
			var prevWorkNodeType = this.view.getProject().getNodeById(this.node.prevWorkNodeIds[0]).type;
			//we can only pre populate the work from a previous node if it is a graph step like this one
			if(prevWorkNodeType == 'GrapherNode' || prevWorkNodeType == 'GrapherNode') {
				//get the state from the previous step that this step is linked to
				var predictionState = this.view.getState().getLatestWorkByNodeId(this.node.prevWorkNodeIds[0]);
				
				/*
				 * make sure this step doesn't already have a prediction set 
				 * and that there was a prediction state from the previous
				 * associated step before we try to retrieve that prediction and
				 * set it into our prediction array
				 * OR if cannot create prediction then always use previous prediction - jonathan vitale
				 */
				if(predictionState != null && predictionState != "" && (this.grapherState.predictionArray.length == 0 || !this.createPrediction)) {

					var predictionId = "";
					
					//get the labels that are used in this step
					var seriesLabels = this.content.seriesLabels;
					
					/*
					 * find the id of the series that is used in this step, we will assume
					 * only one series is used
					 */
					for(var x=0; x<seriesLabels.length; x++) {
						var seriesLabel = seriesLabels[x];
						
						if(seriesLabel != null) {
							//get the id of the series e.g. "greenCar"
							predictionId = seriesLabel;
						}
					}
					
					/*
					 * make a copy of the prediction array and set it into our grapher state
					 * so we don't accidentally modify the data from the other state
					 */
					var predictions = JSON.parse(JSON.stringify(predictionState.predictionArray));
					
					//create a prediction object from the previous work from the previous work node
					var predictionObject = {
						id:predictionId,
						predictions:predictions
					};
					
					// if we cannot create a new prediction, set predictionArray to previous - jonathan vitale
					if (this.createPrediction){
						//put the previous work into our state
						this.grapherState.predictionArray.push(predictionObject);
					} else {
						this.grapherState.predictionArray = [predictionObject]
					}
					
					var predictionAnnotations = [];
					
					//get all the prediction annotations
					for(var x=0; x<predictionState.annotationArray.length; x++) {
						var annotation = predictionState.annotationArray[x];
						
						if(annotation.seriesName.indexOf("prediction") != -1) {
							predictionAnnotations.push(annotation);
						}
					}
					
					/*
					 * make a copy of the prediction annotations so we don't accidentally modify
					 * the data in the other state 
					 */ 
					predictionAnnotations = JSON.parse(JSON.stringify(predictionAnnotations));
					
					//add the prediction annotations to our annotation array
					for(var y=0; y<predictionAnnotations.length; y++) {
						this.grapherState.annotationArray.push(predictionAnnotations[y]);
					}
					
					this.graphChanged = true;
				}
				// update axis and labels
				if(predictionState != null && predictionState != "" && (typeof this.grapherState.xUnits == "undefined" || this.grapherState.xUnits == "" || !this.createPrediction) && typeof predictionState.xUnits != "undefined" && predictionState.xUnits != "") {
					this.grapherState.xUnits = predictionState.xUnits;
					this.axisLabelChanged = true;
				}
				if(predictionState != null && predictionState != "" && (typeof this.grapherState.yUnits == "undefined" || this.grapherState.yUnits == "" || !this.createPrediction) && typeof predictionState.yUnits != "undefined" && predictionState.yUnits != "") {
					this.grapherState.yUnits = predictionState.yUnits;
					this.axisLabelChanged = true;
				}
				// update axis and labels
				if(predictionState != null && predictionState != "" && (typeof this.grapherState.xlabel == "undefined" || this.grapherState.xlabel == "" || !this.createPrediction) && typeof predictionState.xlabel != "undefined" && predictionState.xlabel != "") {
					this.grapherState.xlabel = predictionState.xlabel;
					this.axisLabelChanged = true;
				}
				if(predictionState != null && predictionState != "" && (typeof this.grapherState.ylabel == "undefined" || this.grapherState.ylabel == "" || !this.createPrediction) && typeof predictionState.ylabel != "undefined" && predictionState.ylabel != "") {
					this.grapherState.ylabel = predictionState.ylabel;
					this.axisLabelChanged = true;
				}
				if(predictionState != null && predictionState != "" && (typeof this.grapherState.xMin == "undefined" || this.grapherState.xMin == "" || !this.createPrediction) && typeof predictionState.xMin != "undefined" && predictionState.xMin != "") {
					this.grapherState.xMin = predictionState.xMin;
					this.axisRangeChanged = true;
				}
				if(predictionState != null && predictionState != "" && (typeof this.grapherState.yMin == "undefined" || this.grapherState.yMin == "" || !this.createPrediction) && typeof predictionState.yMin != "undefined" && predictionState.yMin != "") {
					this.grapherState.yMin = predictionState.yMin;
					this.axisRangeChanged = true;
				}
				if(predictionState != null && predictionState != "" && (typeof this.grapherState.xMax == "undefined" || this.grapherState.xMax == "" || !this.createPrediction) && typeof predictionState.xMax != "undefined" && predictionState.xMax != "") {
					this.grapherState.xMax = predictionState.xMax;
					this.axisRangeChanged = true;
				}
				if(predictionState != null && predictionState != "" && (typeof this.grapherState.yMax == "undefined" || this.grapherState.yMax == "" || !this.createPrediction) && typeof predictionState.yMax != "undefined" && predictionState.yMax != "") {
					this.grapherState.yMax = predictionState.yMax;
					this.axisRangeChanged = true;
				}
			}
		}
	}
};

/**
 * Delete the prediction points and annotations
 */
Grapher.prototype.clearPrediction = function() {
	//clear the prediction array for the current series
	var found_series = false;
	for (var i = 0; i < this.grapherState.predictionArray.length; i++){
		if (this.grapherState.predictionArray[i]['id'] == this.currentGraphName){
			this.grapherState.predictionArray[i].predictions = [];
			found_series = true;
			break;
		}
	}
	//if (!found_series) this.grapherState.predictionArray = [];

	//delete the prediction annotations from the UI
	for (var i = 0; i < this.grapherState.annotationArray.length; i++){
		if (this.grapherState.annotationArray[i]['seriesName'] == this.currentGraphName){
			this.deleteAnnotationFromUI(this.currentGraphName, this.grapherState.annotationArray[i]['x']);
		}
	}
	
	//delete the prediction annotations
	this.grapherState.removePredictionAnnotations(this.currentGraphName);
		
	//delete the prediction annotation tool tips on the graph
	this.removeAnnotationToolTipPrediction();
	
	//plot the graph again
	this.plotData();
	
	this.graphChanged = true;
};

/**
 * Callback when predictionArray is updated
 */
Grapher.prototype.predictionArrayUpdated = function() {

};

/**
 * Delete the prediction annotation tool tips
 */
Grapher.prototype.removeAnnotationToolTipPrediction = function() {
	this.removeAnnotationToolTip("annotationToolTipPrediction");
};

/**
 * Delete the data annotation tool tips
 */
Grapher.prototype.removeAnnotationToolTipData = function() {
	this.removeAnnotationToolTip("annotationToolTipData");
};

/**
 * Delete the annotation tool tips for the given class
 * @param annotationToolTipClass the class for the annotation tool tips we want to delete
 */
Grapher.prototype.removeAnnotationToolTip = function(annotationToolTipClass) {
	$("." + annotationToolTipClass).remove();
};

/**
 * Determine if one data sets has the given name
 * @param dataSets an array of data sets
 * @param name the name of a data set (aka series name)
 * @return whether a data set has the given name
 */
Grapher.prototype.dataSetContainsName = function(dataSets, name) {
	if(dataSets != null) {
		//loop through all the data sets
		for(var x=0; x<dataSets.length; x++) {
			var dataSet = dataSets[x];
			
			if(dataSet != null && dataSet.name == name) {
				//the name matches
				return true;
			}
		}
	}
	
	//we did not find a match
	return false;
};

/**
 * Delete all the annotation tool tips from the graph
 */
Grapher.prototype.removeAllAnnotationToolTips = function() {
	$("." + this.graphDivId + "AnnotationToolTip").remove();
};

/**
 * Add an annotation tool tip to the graph
 * @param seriesName the name of the series
 * @param dataIndex the index within the series
 * @param x the x value of the point
 * @param y the y value of the point
 * @param annotationText the text the student wrote for the annotation
 */
Grapher.prototype.addAnnotationToolTipToUI = function(seriesName, dataIndex, x, y, annotationText) {
	//use this.globalPlot as the default if plot was not provided
	var plot = this.globalPlot;
	
	//get the graph line
	var series = this.getSeriesByName(plot, seriesName);
	
	if(series != null) {
		var dataIndexAtX = this.getDataIndexAtX(series, x);
		
		if(dataIndexAtX != null) {
			/*
			 * use the data index with the given x value, this will be null for old annotations
			 * because old annotations did not store x values
			 */
			dataIndex = dataIndexAtX;
		}
		
		//highlight the point
		plot.highlight(series, dataIndex);
		
		//get the point in the series
		var dataPointArray = series.data[dataIndex];
		
		if (!dataPointArray) {
			return;
		}
		//get the x and y values
		var dataPointObject = {
				x:dataPointArray[0],
				y:dataPointArray[1]
		};
		
		//find the pixel position of the point
		var offsetObject = plot.pointOffset(dataPointObject);
		var xOffset = offsetObject.left;
		var yOffset = offsetObject.top;
		
		//get the class that we will give to the div
		var annotationToolTipClass = "activeAnnotationToolTip " + this.graphDivId + "AnnotationToolTip";
		
		if(seriesName.indexOf("prediction") != -1) {
			annotationToolTipClass += " annotationToolTipPrediction";
		} else {
			annotationToolTipClass += " annotationToolTipData";
		}
		
		var domSeriesName = this.getDOMSeriesName(seriesName);
		
		//get the x value that we will use in the DOM id
		var domXValue = this.getDOMXValue(x);
		
		//get the div id for the annotation tool tip
		var annotationToolTipDivId = this.graphDivId + '_annotationToolTip_' + domSeriesName + domXValue;

		//check if the tool tip div for this annotation already exists
		if($('#' + annotationToolTipDivId).length == 0) {
			//it does not exist so we will make it
		    $('<div id="' + annotationToolTipDivId + '" class="' + annotationToolTipClass + '">' + annotationText + '</div>').css( {
		        position: 'absolute',
		        //display: 'none',
		        top: yOffset - 35,
		        left: xOffset + 10,
		        border: '1px solid #fdd',
		        padding: '2px',
		        'background-color': '#fee',
		        opacity: 0.8
		    }).appendTo("#" + this.graphDivId).fadeIn(200);
		}
		
	    if(annotationText == null || annotationText == "") {
	    	//hide the annotation tool tip if the annotation text is ""
	    	$('#' + annotationToolTipDivId).hide();
	    	$('#' + annotationToolTipDivId).addClass("hiddenAnnotationToolTip").removeClass("activeAnnotationToolTip");
	    }
	}
};

/**
 * Get the series name that we will use in the DOM. This just means
 * replacing any spaces " " with underscores "_"
 * also quotes with no space.
 * @param seriesName the name of the series
 * @return the seriesName with spaces replaced with underscores
 */
Grapher.prototype.getDOMSeriesName = function(seriesName) {
	var domSeriesName = "";
	
	if(seriesName != null) {
		//replace the spaces with underscores
		domSeriesName = seriesName.replace(/ /g, "_");
		domSeriesName = domSeriesName.replace(/'/g, "");
		domSeriesName = domSeriesName.replace(/"/g, "");
	}
	
	return domSeriesName;
};

/**
 * Get the x value that we will use in the DOM id. This just means
 * replacing any "." with underscores "_"
 * @param x the x value
 * @return the x value with "." replaced with "_"
 */
Grapher.prototype.getDOMXValue = function(x) {
	var domXValue = "";
	
	if(x != null) {
		//turn x into a string so we can call replace()
		x += "";
		
		//replace the spaces with underscores
		domXValue = x.replace(/\./g, "-");
	}
	
	return domXValue;
};

/**
 * Hide all the input fields for when we want to prevent the student from
 * working on this step because they have not yet created a prediction in
 * the previous associated step
 */
Grapher.prototype.hideAllInputFields = function() {
	$('#clearButton').hide();
	$('#clearPredictionButton').hide();
	$('#resetDefaultAxisLimitsButton').hide();
	$('#graphTitle').hide();
	$('#yMaxInput').hide();
	$('#yMinInput').hide();
	$('#xMinInput').hide();
	$('#xMaxInput').hide();
	$('#showStarterSentenceButton').hide();
	$('#responseTextArea').hide();
	$('#saveButton').hide();
};

/**
 * Set the div id that we will plot the graph in
 * @param plotDivId the id of the plot div
 */
Grapher.prototype.setGraphDivId = function(graphDivId) {
	this.graphDivId = graphDivId;
};

/**
 * Get the color for the graph line
 * @param graphType the type of graph line
 * e.g.
 * "distance"
 * "temperature"
 * "prediction"
 * @return the color for the graph line
 */
Grapher.prototype.getGraphColor = function(graphType) {
	return this.graphColors[graphType];
};

/**
 * Get the data index of the point with the given x value
 * @param series the series object for a line plot
 * @param x the x value we want
 * @return the data index of the point with the given x value
 * or null if there is none
 */
Grapher.prototype.getDataIndexAtX = function(series, x) {
	var data = series.data;
	
	//loop through all the data points
	for(var i=0; i<data.length; i++) {
		var dataPoint = data[i];
		
		//get the x value
		var dataPointX = dataPoint[0];
		
		if(x == dataPointX) {
			//the x values match so we have found the data index we want
			return i;
		}
	}
	
	//we did not find a matching x value
	return null;
};

/**
 * Disable the prediction annotation inputs so the student can't edit the
 * prediction annotations anymore
 */
Grapher.prototype.disablePredictionTextInputAndDeleteButton = function() {
	$('.predictionTextInput').attr('disabled', true);
	$('.predictionDeleteButton').attr('disabled', true);
};

/**
 * Show the graph message
 * @param message the message the student will see
 * @param backgroundColor the background color of the message
 */
Grapher.prototype.showGraphMessage = function(message, backgroundColor) {
	//find the position of the graph div so we can display the message in the center of it
	var position = $('#graphDiv').position();
	
	//get the position that will show the message in the center of the graph div
	var top = position.top + 115;
	var left = position.left + 55;
	
	//set the position
	$('#graphMessageDiv').css('top', top);
	$('#graphMessageDiv').css('left', left);
	
	//show the message
	$('#graphMessageDiv').show();
	$('#graphMessageTable').css('background-color', backgroundColor);
	$('#graphMessage').css('font-family', 'arial');
	$('#graphMessage').html(message);
};

/**
 * Hide the graph message
 */
Grapher.prototype.hideGraphMessage = function() {
	$('#graphMessageDiv').hide();
};

/**
 * Called when the student clicks
 * @param event the click event
 */
Grapher.prototype.handleKeyDown = function(event) {
	if(event.keyCode == 46) {
		//student pressed the backspace or delete key
		
		/*
		 * check if the student clicked on a prediction point
		 * just before pressing the backspace key
		 */
		if(this.lastPointClicked != null && (typeof this.content.createPrediction == "undefined" || this.content.createPrediction)) {
			//get the data of the point
			var seriesName = this.lastPointClicked.seriesName;
			var dataIndex = this.lastPointClicked.dataIndex;
			var x = this.lastPointClicked.x;
			
			//remove the prediction point
			this.removePredictionPoint(seriesName, dataIndex, x);
			
			//update the graph
			this.plotData();
			
			//update the flag since the graph has changed
			this.graphChanged = true;
			
			this.lastPointClicked = null;
		}
	}
};

/**
 * Remove the prediction point from the graph. First remove any
 * annotations for the point and then remove the point from
 * the grapherState
 */
Grapher.prototype.removePredictionPoint = function(seriesName, dataIndex, x) {
	//check that this is a prediction line
	if(true) {
		//remove any annotations associated with the point
		this.deleteAnnotation(seriesName, dataIndex, x);
		
		//remove the data point from the grapherState
		this.grapherState.removePredictionPoint(seriesName, dataIndex);		
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
Grapher.prototype.processTagMaps = function() {
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
				} else if (functionName == "mustNotExceedMaxErrorBeforeAdvancing"){
					this.view.eventManager.fire('addActiveTagMapConstraint', [this.node.id, null, 'mustCompleteBeforeAdvancing', null, null,"Your graph needs some work before advancing."]);
				} else if (functionName == "mustNotExceedAvgErrorBeforeAdvancing"){
					this.view.eventManager.fire('addActiveTagMapConstraint', [this.node.id, null, 'mustCompleteBeforeAdvancing', null, null,"Your graph needs some work before advancing."]);
				} else if (functionName == "mustSpanDomainBeforeAdvancing"){
					this.view.eventManager.fire('addActiveTagMapConstraint', [this.node.id, null, 'mustCompleteBeforeAdvancing', null, null,"Your graph doesn't cover the entire x-axis."]);
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

/**
 * Generate the data array that we will send to the graph to plot
 * @param state a GrapherState object
 * @return an array containing data that will be used to plot
 * the data onto a graph
 */
Grapher.prototype.generateGraphDataArray = function(state) {
	var dataArray = [];
	
	if(state != null) {
		//get the data array from the state
		var sensorDataArray = state.sensorDataArray;
		
		if(sensorDataArray != null) {

			/*
			 * the interval that we want to display data points. this is used
			 * to smooth out the graphs for the student and to spread out the
			 * data points so they aren't all clustered together.
			 * e.g. if the sampleInterval is set to 5, we will only show every
			 * 5th data point in the graph to the student
			 */
			var sampleInterval = 3;
			
			//loop through all the elements in the data array
			for(var i=0; i<sensorDataArray.length; i++) {
				
				/*
				 * check if we want to display this data point in regards
				 * to the sample interval
				 */
				if(i % sampleInterval == 0) {
					//get the data array element
					var sensorData = sensorDataArray[i];
					
					//get the time
					var x = sensorData.x;
					
					//get the y value. this may be distance or temp or etc.
					var y = sensorData.y;
					
					/*
					 * add the x, y data point into the array. flot expects
					 * the each element in the array to be an array.
					 */
					dataArray.push([x, y]);					
				}
			}
		}		
	}
	
	return dataArray;
};


//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename grapher to your new folder name
	 * TODO: rename grapher.js
	 * 
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/quiz.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/grapher/grapher.js');
}