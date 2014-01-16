/*
 * This is the object that we use to perform rendering and logic in a
 * sensor step
 */

/**
 * The constructor for the sensor object that we use to peform rendering
 * and logic in a sensor step
 * @param constructor
 * @param node the step we are on
 * @param view the vle view
 */
function SENSOR(node) {
	//the step we are on
	this.node = node;
	
	//get the view from the node
	this.view = this.node.view;
	
	//the content for the step
	this.content = node.getContent().getContentJSON();
	
	/*
	 * a timestamp used for calculating the amount of time the sensor has
	 * been collecting data. this is only updated in startCollecting() and
	 * dataReceived()
	 */
	this.timeCheck = null;
	
	/*
	 * the amount of time that the sensor has been collecting data. this
	 * will be used as the x value (time) for the sensor data.
	 */
	this.elapsedTime = 0;
	
	//the default time limit for the student to collect data in seconds
	this.dataCollectionTimeLimit = 30;
	
	//the default 
	this.lockPredictionOnCollectionStart = false;
	
	if(node.studentWork != null) {
		//the student has work from previous visits to this step
		this.states = node.studentWork; 
	} else {
		//the student does not have any previous work for this step
		this.states = [];  
	};
	
	//the sensor state that will contain the student work
	this.sensorState = this.getLatestStateCopy();
	
	//flag to keep track of whether the student has change any axis range value this visit
	this.axisRangeChanged = false;

	//flag to keep track of whether the student has change any axis labels
	this.axisLabelChanged = false;
	

	if(this.content != null) {
		//get the graph parameters for displaying the data to the student
		this.graphParams = this.parseGraphParams(this.content.graphParams);
		
		//get the sensor type e.g. 'motion' or 'temperature'
		this.sensorType = this.content.sensorType;
		
		if(this.content.dataCollectionTimeLimit != null) {
			//get the data collection time limit
			var timeLimit = this.content.dataCollectionTimeLimit;
			
			if(!isNaN(parseInt(timeLimit))) {
				//the time limit number is a valid number
				this.dataCollectionTimeLimit = timeLimit;				
			}
		}
		
		if(this.content.lockPredictionOnCollectionStart != null) {
			//get whether to lock the prediction when the student starts collecting data
			this.lockPredictionOnCollectionStart = this.content.lockPredictionOnCollectionStart;			
		}
	}
	
	/*
	 * flag to keep track of whether the student has modified the graph
	 * by retrieving data from the sensor
	 */
	this.graphChanged = false;
	
	//the labels for the graph legends
	var distance = this.view.getI18NString('distance', 'SensorNode');
	var velocity = this.view.getI18NString('velocity', 'SensorNode');
	var acceleration = this.view.getI18NString('acceleration', 'SensorNode');
	var temperature = this.view.getI18NString('temperature', 'SensorNode');
	
	//the names for the different types of graphs
	this.graphNames = {
			distance:distance,
			velocity:velocity,
			acceleration:acceleration,
			temperature:temperature
	};
	
	//the units for the different types of graphs
	this.graphUnits = {
		distance:"m",
		velocity:"m/s",
		acceleration:"m/s^2",
		temperature:"C",
		time:"s",
		customY:typeof this.content.graphParams.yUnits != "undefined" ? this.content.graphParams.yUnits : "",
		customX:typeof this.content.graphParams.xUnits != "undefined" ? this.content.graphParams.xUnits : "", 
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
	this.graphColors = {
			distance:2,
			velocity:6,
			acceleration:4,
			temperature:2,
			prediction:3
	};
	
	//insert the prediction name and unit values into the graphNames and graphUnits arrays
	if(this.sensorType == "motion") {
		//the text for the distance prediction graph
		var distance_prediction = this.view.getI18NString('distance_prediction', 'SensorNode');
		var graphName = distance_prediction;
		this.graphNames.prediction = graphName;
		this.graphUnits[graphName] = "m";
	} else if(this.sensorType == "temperature") {
		//the text for the temperature prediction graph
		var temperature_prediction = this.view.getI18NString('temperature_prediction', 'SensorNode');
		var graphName = temperature_prediction;
		this.graphNames.prediction = graphName;
		this.graphUnits[graphName] = "C";
	} else {
		if (typeof this.content.useCustomUnitsAndGraphLabel != "undefined" && this.content.useCustomUnitsAndGraphLabel){
			//the text for the prediction graph
			var prediction = this.view.getI18NString('prediction', 'SensorNode');
			
    		var graphName = typeof this.content.graphLabel != "undefined" ? this.content.graphLabel : prediction;
			this.graphNames.prediction = graphName + " " + prediction;
			this.graphUnits[graphName + " " + prediction] = typeof this.content.graphParams.yUnits != "undefined" ? this.content.graphParams.yUnits : "";
    	} else {
			var graphName = "";
			this.graphNames.prediction = graphName;
			this.graphUnits[graphName] = "";
		}
	}
	
	/*
	 * used to store the plot variable returned from $.plot() so that we can access
	 * it from other functions
	 */
	this.globalPlot = null;
	
	/*
	 * flag to determine whether we need to clear the graph data when the student
	 * clicks the Start button. we want to clear the graph when they click the
	 * Start button the first time for each new visit of the step. subsequent
	 * clicks of the Start button during the same visit will cause the graph 
	 * data to append to the existing graph data.
	 */
	this.clearDataOnStart = true;
	
	//get the prediction from the previous step if there is a prevWorkNodeIds
	this.getPreviousPrediction();
	
	//default ids for our graph and graph checkboxes divs
	this.graphDivId = "graphDiv";
	this.graphCheckBoxesDivId = "graphCheckBoxesDiv";
	
	this.predictionLocked = false;
	
	if(!this.content.createPrediction || this.sensorState.predictionLocked) {
		//the prediction should be locked
		this.predictionLocked = true;
	}
	
	//whether the sensor has been loaded or not
	this.sensorLoaded = false;
	
	//the last point the student has clicked on
	this.lastPointClicked = null;

	// a point being dragged
	this.dragPoint = null;
};

/**
 * Render the sensor step
 */
SENSOR.prototype.render = function() {
	var enableStep = true;
	var message = '';
	var workToImport = [];
	
	//check if this step imports work from another sensor step
	var importsWorkFromSensorStep = this.importsWorkFromSensorStep();
	
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
		nodeState = workToImport[workToImport.length - 1];
		
		if(nodeState.constructor.name == 'SENSORSTATE') {
			/*
			 * the node state is a sensor state so we will create a copy
			 * of the node state. we need to create a copy so that we don't
			 * modify the work from the other step that this node state is from.
			 */
			this.sensorState = SENSORSTATE.prototype.parseDataJSONObj(nodeState);
		}
	}
	
	if(this.content.requirePredictionBeforeEnter && (importsWorkFromSensorStep || this.node.prevWorkNodeIds.length != 0) && this.sensorState.predictionArray.length == 0) {
		/*
		 * this step requires a prediction before opening, there is a step that this step imports
		 * work from and there is no prediction so we will lock the student out of this step until they
		 * create the prediction in the previously associated step
		 */
		
		if(importsWorkFromSensorStep) {
			//this step imports work from another sensor step
			
			//get the node ids of the steps that this step imports work from
			var sensorNodeIdsImportingFrom = this.getSensorNodeIdsImportingFrom();
			
			if(sensorNodeIdsImportingFrom != null && sensorNodeIdsImportingFrom.length > 0) {
				
				if(sensorNodeIdsImportingFrom.length == 1) {
					//there is one step that this step imports from
					
					//get the node id of the step that this step imports work from
					var nodeId = sensorNodeIdsImportingFrom[0];
					
					//get the node id and title
					var importWorkNodeId = nodeId;
					var importWorkNodeTitle = this.view.getProject().getStepNumberAndTitle(importWorkNodeId);
					
					//the text that says you must make a prediction on a previous step before they can work on this step
					var you_must_make_a_prediction = this.view.getI18NString('you_must_make_a_prediction', 'SensorNode');
					var before_you_can_work = this.view.getI18NString('before_you_can_work', 'SensorNode');
					
					//display the message to tell the student to create a prediction in the previously associated step
					$('#promptDiv').html(you_must_make_a_prediction + " <a style=\"color:blue;text-decoration:underline;cursor:pointer\" onclick=\"eventManager.fire(\'nodeLinkClicked\', [\'" + this.view.getProject().getPositionById(importWorkNodeId) + "\'])\">" + importWorkNodeTitle + "</a> " + before_you_can_work);
				} else if(sensorNodeIdsImportingFrom.length > 1) {
					//there are multiple steps that this step imports from
					
					//clear the prompt div
					$('#promptDiv').html('');
					
					//the text that says you must make a prediction on a previous step before they can work on this step
					var you_must_make_a_prediction_in_steps = this.view.getI18NString('you_must_make_a_prediction_in_steps', 'SensorNode');
					var before_you_can_work = this.view.getI18NString('before_you_can_work', 'SensorNode');
					
					//display the message
					$('#promptDiv').append(you_must_make_a_prediction_in_steps + ' ' + before_you_can_work + '<br><br>');
					
					//loop through all the node ids
					for(var x=0; x<sensorNodeIdsImportingFrom.length; x++) {
						//get a node id
						var sensorNodeIdImportingFrom = sensorNodeIdsImportingFrom[x];
						
						//get the nod id and title
						var importWorkNodeId = sensorNodeIdImportingFrom;
						var importWorkNodeTitle = this.view.getProject().getStepNumberAndTitle(importWorkNodeId);
						
						//display a link to the step
						$('#promptDiv').append("<a style=\"color:blue;text-decoration:underline;cursor:pointer\" onclick=\"eventManager.fire(\'nodeLinkClicked\', [\'" + this.view.getProject().getPositionById(importWorkNodeId) + "\'])\">" + importWorkNodeTitle + "</a><br>");
					}
				}
			}
		} else if(this.node.prevWorkNodeIds.length != 0) {
			//this step shows previous work from another step
			
			//get the node id and title
			var prevWorkNodeId = this.node.prevWorkNodeIds[0];
			var prevWorkNodeTitle = this.view.getProject().getStepNumberAndTitle(prevWorkNodeId);
			
			//the text that says you must make a prediction on a previous step before they can work on this step
			var you_must_make_a_prediction = this.view.getI18NString('you_must_make_a_prediction', 'SensorNode');
			var before_you_can_work = this.view.getI18NString('before_you_can_work', 'SensorNode');
			
			//display the message to tell the student to create a prediction in the previously associated step
			$('#promptDiv').html(you_must_make_a_prediction + " <a style=\"color:blue;text-decoration:underline;cursor:pointer\" onclick=\"eventManager.fire(\'nodeLinkClicked\', [\'" + this.view.getProject().getPositionById(prevWorkNodeId) + "\'])\">" + prevWorkNodeTitle + "</a> " + before_you_can_work);
		}
		
		this.hideAllInputFields();
	} else {
		//set the prompt into the step
		$('#promptDiv').html(this.content.prompt);

		//set the graph title
		$('#graphTitle').html(this.content.graphTitle);
		
		//plot the sensor data from the student's previous visit, if any
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
		var response = this.getResponseFromSensorState();
		$("#responseTextArea").val(response);
		
		//set the size of the text area
		if (parseInt(this.content.expectedLines) > 0){
			$("#responseTextArea").attr('rows', this.content.expectedLines);
			$("#responseTextArea").attr('cols', 80);
		} else {
			$("#responseTextArea").hide();
		}

		if(this.content.enableSensor != null && this.content.enableSensor == false) {
			//hide the sensor buttons
			this.hideSensorButtons();
		} else {
			/*
			 * insert the applet into the html. we need to insert it dynamically
			 * because the we need to dynamically determine what type of sensor
			 * we expect by looking at the content for this step
			 */
			this.insertApplet();		
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
		$("#" + this.graphDivId).bind('mousedown', {thisSensor:this}, (function(event) {
			event.data.thisSensor.mouseDown = true;
		}));
		$("#" + this.graphDivId).bind('mouseup', {thisSensor:this}, (function(event) {
			event.data.thisSensor.mouseDown = false;
		}));

		//listen for the keydown event
		$(window).bind("keydown", {thisSensor:this}, function(event) {
		    event.data.thisSensor.handleKeyDown(event);
		});
		
		//listen for the click event
		$(window).bind("click", {thisSensor:this}, function(event) {
			//check if the mouse is inside the graph div
		    if(!event.data.thisSensor.mouseInsideGraphDiv) {
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
		    	event.data.thisSensor.lastPointClicked = null;
		    }
		});
		
		//listen for the mouse enter event on the graphDiv
		$("#" + this.graphDivId).bind("mouseenter", {thisSensor:this}, function(event) {
			event.data.thisSensor.mouseInsideGraphDiv = true;
			if (typeof event.data.thisSensor.content.graphParams.coordsFollowMouse != "undefined" && event.data.thisSensor.content.graphParams.coordsFollowMouse && $("#plotHoverPosition").length > 0) $("#plotHoverPosition").show();
		});
		
		//listen for the mouse leave event on the graphDiv
		$("#" + this.graphDivId).bind("mouseleave", {thisSensor:this}, function(event) {
			event.data.thisSensor.mouseInsideGraphDiv = false;
			if (typeof event.data.thisSensor.content.graphParams.coordsFollowMouse != "undefined" && event.data.thisSensor.content.graphParams.coordsFollowMouse && $("#plotHoverPosition").length > 0) $("#plotHoverPosition").hide();
			event.data.thisSensor.dragPoint = null;
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
SENSOR.prototype.getYValue = function(xValue,predictionArray) {
    var xSoFar = 0;
    var ySoFar = 0;
    if (predictionArray.length > 0) {
    	// check if the array contains a value for x less than the specified xValue. If not, return -100.
    	var firstPrediction = predictionArray[0];
    	if (firstPrediction[0] > xValue) {
    		return -100;
    	}
    }
    for (var i=0; i< predictionArray.length; i++) {
	    var prediction = predictionArray[i];  // prediction[0] = x, prediction[1] = y
	    if (prediction[0] < xValue) {
		    // x value not yet found, set ySoFar in case we'll need it for later
		    xSoFar = prediction[0];
		    ySoFar = prediction[1];				    
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
 * Get the latest student work for this step
 * @return the latest student work state object
 */
SENSOR.prototype.getLatestState = function() {
	//a new sensor state will be returned if there are no states
	var latestState = new SENSORSTATE();
	
	if(this.states != null && this.states.length > 0) {
		//get the last state in the states array
		latestState = this.states[this.states.length - 1];
	}
	
	return latestState;
};

/**
 * Get a copy of the latest student work for this step
 * @return a copy of the latest student work state object
 */
SENSOR.prototype.getLatestStateCopy = function() {
	//a new sensor state will be returned if there are no states
	var latestStateCopy = new SENSORSTATE();
	
	if(this.states != null && this.states.length > 0) {
		//get the last state in the states array
		latestState = this.states[this.states.length - 1];
		
		//copy the values in the latest state into the latest state copy
		SENSORSTATE.prototype.copyState(latestState, latestStateCopy);
	}
	
	return latestStateCopy;
};

/**
 * This is called when the student has started to collect data
 */
SENSOR.prototype.startCollecting = function() {
	//hide the graph message
	this.hideGraphMessage();
	
	if(this.lockPredictionOnCollectionStart && !this.predictionLocked) {
		/*
		 * this step is set to lock the prediction when the student starts collecting
		 * data and it has not been locked yet. we will ask the student if they are
		 * sure they want to start collecting data.
		 */
		var are_you_sure = this.view.getI18NString('are_you_sure', 'SensorNode');
		
		var startCollection = confirm(are_you_sure);
		
		if(startCollection) {
			//they want to start collecting data
			this.sensorState.predictionLocked = true;
			this.predictionLocked = true;
		} else {
			//they do not want to start collecting data yet
			return;
		}
	}
	
	
	if(this.clearDataOnStart) {
		/*
		 * clear the graph data and annotations because the student
		 * is re-collecting the graph data from scratch
		 */
		this.clearData();
		
		/*
		 * set this to false so that the next time they click the Start button
		 * their data won't be cleared. instead the data will be appended
		 * and the graph will start back up from where they stopped
		 */
		this.clearDataOnStart = false;
	}
	
	//get the current date
	var currentDate = new Date();
	
	//get the current time in milliseconds
	this.timeCheck = currentDate.getTime();
	
	if(this.lockPredictionOnCollectionStart) {
		//disable the prediction buttons and annotation fields
		this.disablePredictionButtons();
		this.disablePredictionTextInputAndDeleteButton();
	}
	
	/*
	 * get the sensor applet from the html, you won't find it in the html
	 * because we dynamically insert it into the sensorAppletDiv since it
	 * requires dynamic params such as whether we are using a motion or
	 * temperature sensor
	 */
	var sensorApplet = document.getElementById('sensorApplet');
	
	//tell the sensor applet to start collecting data
	sensorApplet.startCollecting();
};

/**
 * This is called when the student has stopped collecting data
 */
SENSOR.prototype.stopCollecting = function() {
	/*
     * get the sensor applet from the html, you won't find it in the html
	 * because we dynamically insert it into the sensorAppletDiv since it
	 * requires dynamic params such as whether we are using a motion or
	 * temperature sensor
	 */
	var sensorApplet = document.getElementById('sensorApplet');
	
	//tell the sensor applet to stop collecting data
	sensorApplet.stopCollecting();
	
	//get the current date
	var currentDate = new Date();
	
	//get the current time in milliseconds
	var stopTime = currentDate.getTime();

	//update the timeCheck
	this.timeCheck = stopTime;
};

/**
 * This is called when the student clears the data they have collected
 */
SENSOR.prototype.clearData = function() {
	//clear the data from the graph and annotations
	this.sensorState.clearSensorData();
	
	//delete the annotations for the sensor data
	this.sensorState.removeSensorAnnotations();
	
	//remove the sensor annotations text boxes and delete buttons from the UI
	this.deleteSensorAnnotationsFromUI();
	
	//remove the annotation tool tips for the sensor data line from the UI
	this.removeAnnotationToolTipData();
	
	/*
	 * plot the graph again, there will be no sensor data so the 
	 * graph will essentially be blank
	 */
	this.plotData();
	
	//reset the elapsed time
	this.elapsedTime = 0;
	
	//update the flag since the graph has been cleared
	this.graphChanged = true;
};

/**
 * This is called when the sensor sends data to the applet
 * @param type the type of data (not used)
 * @param count some count value from the sensor (not used)
 * @param data the data from the sensor
 */
SENSOR.prototype.dataReceived = function(type, count, data) {
	//get the current date
	var currentDate = new Date();
	
	//get the current time in milliseconds
	var currentTime = currentDate.getTime();
	
	if(this.sensorState.sensorDataArray.length == 0) {
		//this is the first data point so we will set the elapsedTime value to 0
		this.elapsedTime = 0;
	} else {
		//update the amount of time that the sensor has been collecting data
		this.elapsedTime += currentTime - this.timeCheck;		
	}

	if(this.elapsedTime > this.dataCollectionTimeLimit * 1000) {
		//we have passed the data collection time limit so we will stop the collection
		this.stopCollecting();

		return;
	}
	
	//update the time check
	this.timeCheck = currentTime;
	
	if(data != null) {
		if(data.constructor.toString().indexOf('Array') != -1) {
			/*
			 * data is an array so we just want the first element
			 * of the array since there is usually only one element.
			 * sometimes there are multiple elements but they are very
			 * close together in value so we aren't really losing
			 * much data. I'm not sure why data sometimes contains
			 * more than one element.
			 */
			data = data[0];
		} else {
			//data is not an array
		}
	}
	
	/*
	 * round the x vale to the nearest hundredth. elapsedTime is in milliseconds
	 * so we need to divide by 1000 to get seconds
	 */
	var x = parseFloat((this.elapsedTime / 1000).toFixed(2));
	
	//round the y value to the nearest hundredth
	var y = parseFloat(data.toFixed(2));
	
	//save the data point into the sensor state.
	this.sensorState.dataReceived(x, y);
	
	//update the graph
	this.plotData();
	
	//update the flag since the graph has changed
	this.graphChanged = true;
};

/**
 * Generate the data array that we will send to the graph to plot
 * @param state a SENSORSTATE object
 * @return an array containing data that will be used to plot
 * the data onto a graph
 */
SENSOR.prototype.generateGraphDataArray = function(state) {
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

/**
 * Get the previous response the student typed into the textarea
 * @return
 */
SENSOR.prototype.getPreviousResponse = function() {
	var previousResponse = "";
	
	//get the latest state
	var previousState = this.getLatestState();
	
	if(previousState != null) {
		//get the previous response
		previousResponse = previousState.response;
	}
	
	return previousResponse;
};

/**
 * Get the data array from the current sensor state
 * @return an array containing the sensor points that will
 * be used to plot on the graph
 */
SENSOR.prototype.getDataArray = function() {
	//get the graph data array from the current state 
	var graphDataArray = this.generateGraphDataArray(this.sensorState);
	
	return graphDataArray;
};

/**
 * Parse the graph parameters from the step content
 * @return an object we can use to pass to the flot graph to
 * specify how the graph should look
 */
SENSOR.prototype.parseGraphParams = function(contentGraphParams) {
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
	 * if the sensor state contains axis values it will override
	 * the axis values from the content
	 */
	if(this.sensorState != null) {
		if(this.sensorState.xMin != null) {
			//set the xmin value from the sensor state
			graphParams.xaxis.min = this.sensorState.xMin;
		}
		
		if(this.sensorState.xMax != null) {
			//set the xmax value from the sensor state
			graphParams.xaxis.max = this.sensorState.xMax;
		}
		
		if(this.sensorState.yMin != null) {
			//set the ymin value from the sensor state
			graphParams.yaxis.min = this.sensorState.yMin;
		}
		
		if(this.sensorState.yMax != null) {
			//set the ymax value from the sensor state
			graphParams.yaxis.max = this.sensorState.yMax;
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

	return graphParams;
};

/**
 * Get the graphParams object that we will pass to the flot
 * graph to specify how the graph should look
 * @return
 */
SENSOR.prototype.getGraphParams = function() {
	//parse the graph params
	this.graphParams = this.parseGraphParams(this.content.graphParams);
	
	return this.graphParams;
};

/**
 * Save the student work for this step. This includes the sensor
 * data and the response the student typed. The this.sensorState
 * has the sensorDataArray already populated. The sensorDataArray
 * is updated whenever dataReceived() is called.
 */
SENSOR.prototype.save = function() {
	//get the response the student typed
	var response = this.getResponseFromTextArea();
	
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
		this.sensorState.response = response;
		
		if(!this.graphChanged) {
			//graph has not changed so we will need to use the graph data from the latest state
			this.sensorState.sensorDataArray = latestState.sensorDataArray;
		}
		
		//fire the event to push this state to the global view.states object
		this.view.pushStudentWork(this.node.id, this.sensorState);

		//push the state object into the local copy of states
		this.states.push(this.sensorState);		
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
 * Get the response the student wrote
 * @return the text in the textarea
 */
SENSOR.prototype.getResponseFromTextArea = function() {
	//get the textarea
	var responseTextArea = document.getElementById('responseTextArea');
	
	//get the text in the textarea
	return responseTextArea.value;
};

/**
 * Get the response from the sensor state
 * @return the response text from the current sensor state
 */
SENSOR.prototype.getResponseFromSensorState = function() {
	var response = "";
	
	//get the latest state
	var state = this.sensorState;
	
	if(state != null) {
		//get the response
		response = state.response;
	}
	
	return response;
};

/**
 * Plot the data onto the graph so the student can see it.
 * @param graphDivId the id of the div we will use to plot the graph
 * @param graphCheckBoxesDivId the id of the div we will put the filter check boxes in
 */
SENSOR.prototype.plotData = function(graphDiv, graphCheckBoxesDiv) {
	if(graphDiv == null) {
		//this will be the default graphDiv if none is provided as an argument
		graphDiv = $('#' + this.graphDivId);
	}
	
	//set the graph div id so it can be accessed later by other functions
	this.graphDivId = graphDiv.attr('id');
	
	if(graphCheckBoxesDiv == null) {
		//this will be the default graphCheckBoxesDivId if none is provided as an argument
		graphCheckBoxesDiv = $("#graphCheckBoxesDiv");
	}
	
	//get the id for the checkboxes div
	var graphCheckBoxesDivId = graphCheckBoxesDiv.attr('id');
	
	//set the graph check boxes div id so it can be accessed later by other functions
	this.graphCheckBoxesDivId = graphCheckBoxesDivId;
	
	//get the data array that contains the points that we will plot on the graph
	var dataArray = this.getDataArray();

	//get the graph params
	var graphParams = this.getGraphParams();
	
	//get the prediction array
	var predictionArray = this.getPredictionArray();
	
	if(this.sensorType == 'motion') {
		//this is a motion sensor step
		
		var dataSets = [];
		                
		if(this.content.enableSensor != null && this.content.enableSensor == false) {
			//sensor is disabled so we only need to show the prediction line
			
			dataSets.push({data:predictionArray, label:this.getGraphLabel("prediction"), color:this.getGraphColor("prediction"), name:this.getGraphName("prediction"), checked:true});
		} else {
			//sensor is enabled
			
			//put the data array into the data sets
			dataSets.push({data:dataArray, label:this.getGraphLabel("distance"), color:this.getGraphColor("distance"), name:"distance", checked:true});
			
			if(this.content.showVelocity) {
				//calculate the velocity data array from the distance array
				var velocityArray = this.calculateVelocityArray(dataArray);
				dataSets.push({data:velocityArray, label:this.getGraphLabel("velocity"), color:this.getGraphColor("velocity"), name:"velocity", checked:false});
			}
			
			if(this.content.showAcceleration) {
				//calculate the acceleration data array from the velocity array
				var accelerationArray = this.calculateAccelerationArray(velocityArray);
			    dataSets.push({data:accelerationArray, label:this.getGraphLabel("acceleration"), color:this.getGraphColor("acceleration"), name:"acceleration", checked:false});				
			}
			
		    if(this.content.createPrediction || this.sensorState.predictionArray.length != 0) {
		    	//display the prediction if create prediction is enabled or if there is data in the prediction array
		    	dataSets.push({data:predictionArray, label:this.getGraphLabel("prediction"), color:this.getGraphColor("prediction"), name:this.getGraphName("prediction"), checked:true});		    	
		    }
		}
	    
	    //set the data set to a global variable so we can access it in other places
	    this.globalDataSets = dataSets;
	    
		//plot the data onto the graph and create the filter check box options
	    this.setupPlotFilter(graphDiv, graphCheckBoxesDiv);
	} else if(this.sensorType == 'temperature') {
		//this is a temperature sensor step
		
		var dataSets = [];
		                
		if(this.content.enableSensor != null && this.content.enableSensor == false) {
			//sensor is disabled so we only need to show the prediction
			dataSets.push({data:predictionArray, label:this.getGraphLabel("prediction"), color:this.getGraphColor("prediction"), name:this.getGraphName("prediction"), checked:true});
		} else {
			//sensor is enabled
			
			//put the data array into the data sets
			dataSets.push({data:dataArray, label:this.getGraphLabel("temperature"), color:this.getGraphColor("temperature"), name:"temperature", checked:true});
			
		    if(this.content.createPrediction || this.sensorState.predictionArray.length != 0) {
		    	//display the prediction if create prediction is enabled or if there is data in the prediction array
		    	dataSets.push({data:predictionArray, label:this.getGraphLabel("prediction"), color:this.getGraphColor("prediction"), name:this.getGraphName("prediction"), checked:true});		    	
		    }
		}
		
		//set the data set to a global variable so we can access it in other places
		this.globalDataSets = dataSets;
		
		//plot the data onto the graph and create the filter check box options
	    this.setupPlotFilter(graphDiv, graphCheckBoxesDiv);
	} else {
		//this is a generic sensor step without any specific type
		
		//create the data sets array
		var dataSets = [];
		
		dataSets.push({data:dataArray});
		
	    if(this.content.createPrediction || this.sensorState.predictionArray.length != 0) {
	    	//display the prediction if create prediction is enabled or if there is data in the prediction array
	    	dataSets.push({data:predictionArray, label:this.getGraphLabel("prediction"), color:this.getGraphColor("prediction"), name:this.getGraphName("prediction"), checked:true});		    	
	    }
		
		//set the data set to a global variable so we can access it in other places
		this.globalDataSets = dataSets;
		
		//plot the data onto the graph
		this.globalPlot = $.plot(graphDiv, dataSets, graphParams);
		
		//delete all the annotation tool tips from the UI
		this.removeAllAnnotationToolTips();
		
		//highlight the points on the graph that the student has create annotations for
		this.highlightAnnotationPoints(null, null, dataSets);
	}
	
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
SENSOR.prototype.calculateVelocityArray = function(distanceArray) {
	return this.calculateDerivativeArray(distanceArray);
};

/**
 * Calculate the acceleration array given the velocity array
 * @param velocityArray an array of velocity points. each element in the
 * velocity array is also an array that looks like this [<time>,<velocity>]
 * @return an array of acceleration points. each element in the acceleration
 * array is also an array that looks like this [<time>,<acceleration>]
 */
SENSOR.prototype.calculateAccelerationArray = function(velocityArray) {
	return this.calculateDerivativeArray(velocityArray);
};

/**
 * Calculate the derivative array by calculating the rate of change
 * of the points in the given data array
 * @param dataArray an array containing data points. each element in the
 * array is also an array and looks like this [<x>,<y>]
 * @return an array containing the derivative values
 */
SENSOR.prototype.calculateDerivativeArray = function(dataArray) {
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
SENSOR.prototype.setupPlotHover = function() {
	$("#" + this.graphDivId).unbind("plothover");
	
    var previousPoint = null;
    
    /*
     * bind this function to the plothover event. the thisSensor object
     * will be passed into the function and accessed through event.data.thisSensor
     */
    $("#" + this.graphDivId).bind("plothover", {thisSensor:this}, function (event, pos, item) {
    	var contentGraphParams = event.data.thisSensor.content.graphParams;
        
        var x = pos.x;
    	var y = pos.y;
    	var xmin = typeof event.data.thisSensor.sensorState.xMin != "undefined" ? parseFloat(event.data.thisSensor.sensorState.xMin) : parseFloat(contentGraphParams.xmin);
		var xmax = typeof event.data.thisSensor.sensorState.xMax != "undefined" ? parseFloat(event.data.thisSensor.sensorState.xMax) : parseFloat(contentGraphParams.xmax);
		var ymin = typeof event.data.thisSensor.sensorState.yMin != "undefined" ? parseFloat(event.data.thisSensor.sensorState.yMin) : parseFloat(contentGraphParams.ymin);
		var ymax = typeof event.data.thisSensor.sensorState.yMax != "undefined" ? parseFloat(event.data.thisSensor.sensorState.yMax) : parseFloat(contentGraphParams.ymax);
			
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
    	if (typeof contentGraphParams.coordsFollowMouse != "undefined" && contentGraphParams.coordsFollowMouse){
    		var plotHoverPositionX = x.toFixed(Math.min(0,3-Math.floor(Math.log(Math.abs(xmax))/Math.LN10)));
    		var plotHoverPositionY = y.toFixed(Math.min(0,3-Math.floor(Math.log(Math.abs(ymax))/Math.LN10)));
    	} else {
    		//get the position of the mouse in the graph
    		plotHoverPositionX = x.toFixed(2);
    		plotHoverPositionY = y.toFixed(2);
    	}	

    	var xLabel = "";
    	
    	//get the sensor type and x label
    	var seriesType = "";
    	if(event.data.thisSensor.sensorType == "motion") {
    		seriesType = "distance";
    		xLabel = "time";
    	} else if(event.data.thisSensor.sensorType == "temperature") {
    		seriesType = "temperature";
    		xLabel = "time";
    	} else {
    		if ( typeof event.data.thisSensor.content.useCustomUnitsAndGraphLabel != "undefined" && event.data.thisSensor.content.useCustomUnitsAndGraphLabel) {
	    		seriesType = "customY";
	    		xLabel = "customX";
	    	}
    	}
    	
    	//get the x units
    	var graphXUnits = event.data.thisSensor.getGraphUnits(xLabel);
    	
    	//get the y units
    	var graphYUnits = event.data.thisSensor.getGraphUnits(seriesType);
    	
    	//display the position e.g. (10.52 s, 4.34 m)
    	var plotHoverPositionText = "(" + plotHoverPositionX + " " + graphXUnits + ", " + plotHoverPositionY + " " + graphYUnits + ")";
    	
    	$('#plotHoverPosition').html(plotHoverPositionText);
    	if (typeof event.data.thisSensor.content.graphParams.coordsFollowMouse != "undefined" && event.data.thisSensor.content.graphParams.coordsFollowMouse){
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
						y = parseFloat(event.data.thisSensor.getYValue(x,item.series.data));
					} else if (x > xmax && item.series.data.length > 1){
						x = xmax;
						y = parseFloat(event.data.thisSensor.getYValue(x,item.series.data));
					} 
    			} 

        		//get the x and y values
        		var dataPointObject = {
        				x:item.datapoint[0],
        				y:item.datapoint[1]
        		};
        		
        		//get the offset of the points relative to the plot div
                var offsetObject = event.data.thisSensor.globalPlot.pointOffset(dataPointObject);
        		var plotOffsetX = offsetObject.left;
        		var plotOffsetY = offsetObject.top;
                
                //get the x label
            	var xLabel = "";
            	if(event.data.thisSensor.sensorType == "motion") {
            		xLabel = "time";
            	} else if(event.data.thisSensor.sensorType == "temperature") {
            		xLabel = "time";
            	} else{
            		if ( typeof event.data.thisSensor.content.useCustomUnitsAndGraphLabel != "undefined" && event.data.thisSensor.content.useCustomUnitsAndGraphLabel) {
	    		   		xLabel = "customX";
	    		   	}
    			}
        		
                //get the units for the x and y values
                var xUnits = event.data.thisSensor.getGraphUnits(xLabel);
                var yUnits = typeof event.data.thisSensor.content.useCustomUnitsAndGraphLabel != "undefined" && event.data.thisSensor.content.useCustomUnitsAndGraphLabel ? event.data.thisSensor.getGraphUnits("customY") : event.data.thisSensor.getGraphUnits(item.series.name);
                
                // in hoverable coords clean up the tooltip text a bit
                if (typeof event.data.thisSensor.content.graphParams.coordsFollowMouse != "undefined" && event.data.thisSensor.content.graphParams.coordsFollowMouse){
		    		x = x.toFixed(Math.min(0,3-Math.floor(Math.log(Math.abs(xmax))/Math.LN10)));
		    		y = y.toFixed(Math.min(0,3-Math.floor(Math.log(Math.abs(ymax))/Math.LN10)));
		    	} else {
		    		x = x.toFixed(2);
		    		y = y.toFixed(2);
		    	}

                //create the text that we will display in the tool tip
                var toolTipText = item.series.label + ": " + x + " " + xUnits + ", " + y + " " + yUnits;
                
                //display the tool tip
                event.data.thisSensor.showTooltip(plotOffsetX, plotOffsetY, toolTipText);
            }
        } else {
        	//remove the tool tip
            $("#tooltip").remove();
            previousPoint = null;            
        }
        
        //check if the student is click dragging to create prediction points
        if(event.data.thisSensor.mouseDown) {
        	if(!event.data.thisSensor.predictionLocked) {
        		// allow author to enable or disable draw while dragging
        		if (typeof event.data.thisSensor.content.allowDragDraw == "undefined" && !event.data.thisSensor.content.allowDragDraw) {
	        		//add prediction point
	            	event.data.thisSensor.predictionReceived(pos.x, pos.y);
	            	
	            	//plot the graph again so the new point is displayed
	            	event.data.thisSensor.plotData(); 
	            }   // allow points to be dragged up or down along their x value
				 else if (typeof event.data.thisSensor.content.allowDragPoint != "undefined" && event.data.thisSensor.content.allowDragPoint) {
					if (item && event.data.thisSensor.dragPoint == null){
						// if there is a point we are hovering over and there is no drag point, set it
						 event.data.thisSensor.dragPoint = item;
					} else if (event.data.thisSensor.dragPoint != null) {
						// move the point
						var y = pos.y;
						// if we are using the easy click option, only show points within domain
		                if (typeof contentGraphParams.easyClickExtremes != "undefined" && contentGraphParams.easyClickExtremes){
							if (y < ymin){
								y = ymin;
							} else if (y > ymax){
								y = ymax;
							} 
   						} 
    					// round
		                if (typeof event.data.thisSensor.content.graphParams.coordsFollowMouse != "undefined" && event.data.thisSensor.content.graphParams.coordsFollowMouse){
				    		y = y.toFixed(Math.min(0,3-Math.floor(Math.log(Math.abs(ymax))/Math.LN10)));
				    	} else {
			    			y = y.toFixed(2);
				    	}

						event.data.thisSensor.predictionUpdateByX(parseFloat(event.data.thisSensor.dragPoint.datapoint[0]), parseFloat(y));
						//plot the graph again so the point is displayed
						event.data.thisSensor.plotData();
					}
     			}
        	}
        } else {
        	event.data.thisSensor.dragPoint = null;
        }
    });
};

/**
 * Display the tool tip for the point on the graph the student has their mouse over.
 * @param x the x position to display the tool tip at
 * @param y the y position to display the tool tip at
 * @param toolTipText the text to display in the tool tip
 */
SENSOR.prototype.showTooltip = function(x, y, toolTipText) {
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
SENSOR.prototype.setupPlotClick = function() {
	$("#" + this.graphDivId).unbind("plotclick");
	
	/*
	 * bind the plotclick event to this function. the thisSensor object
	 * will be passed into the function and accessed through event.data.thisSensor
	 */
    $("#" + this.graphDivId).bind("plotclick", {thisSensor:this}, function (event, pos, item) {
        if (item) {
        	//student has clicked on a point
        	
            //get the name of the graph line
            var seriesName = item.series.name;
            
        	if(seriesName.indexOf("prediction") == -1 || !event.data.thisSensor.predictionLocked) {
        		/*
        		 * the plot line that was clicked was not a prediction line
        		 * or create prediction is enabled. this is just to prevent
        		 * modification of the prediction if create prediction is 
        		 * disabled
        		 */
        		
            	//highlight the data point that was clicked
                event.data.thisSensor.globalPlot.highlight(item.series, item.datapoint);
                
                //get the index of the point for the graph line
                var dataIndex = item.dataIndex;
                
                //get the data point x,y values
                var dataPoint = item.datapoint;
                
                //create an annotation
                event.data.thisSensor.createAnnotation(seriesName, dataIndex, dataPoint);
                
                //get the x value
                var x = dataPoint[0];
                
            	//remember the data for the point that was clicked
                event.data.thisSensor.lastPointClicked = {
            		seriesName:seriesName,
            		dataIndex:dataIndex,
            		x:x
            	};
        	}
        } else {
        	//student has clicked on an empty spot on the graph
        	
        	//check if this step allows the student to create a prediction
        	if(!event.data.thisSensor.predictionLocked) {
        		var isCompleted = event.data.thisSensor.node.isCompleted();
        		//create the prediction point
        		event.data.thisSensor.predictionReceived(pos.x, pos.y);
        		
        		//plot the graph again so the point is displayed
            	event.data.thisSensor.plotData();

            	// if this node is constrained and we are using easyClickExtremes, save data to release constraints (possibly)
        		if (typeof event.data.thisSensor.content.graphParams.easyClickExtremes != "undefined" && event.data.thisSensor.content.graphParams.easyClickExtremes && isCompleted != event.data.thisSensor.node.isCompleted(event.data.thisSensor.sensorState)){
        			event.data.thisSensor.save();
        		}
        	}
        }
    });
};

/**
 * Setup the plot filter so students can turn on/off the different
 * lines in the graph when there is more than one line displayed
 */
SENSOR.prototype.setupPlotFilter = function(graphDiv, graphCheckBoxesDiv) {
	if(graphCheckBoxesDiv == null) {
	    //get the div where we display the checkboxes
	    var graphCheckBoxesDiv = $("#" + this.graphCheckBoxesDivId);
	}
    
    //get the graph params
    var graphParams = this.getGraphParams();
    
    /*
     * save this into thisSensor so that the filterDataSets can access it
     * since the context within filterDataSets will be different when
     * it gets called
     */
    var thisSensor = this;
    
    /*
     * Filters the graph lines depending on which ones are checked in the options
     */
    function filterDataSets() {
    	//the array that will contain the graph lines we want to display
    	var dataToDisplay = [];

    	//get all the data sets
    	var dataSets = thisSensor.globalDataSets;

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
    	thisSensor.globalPlot = $.plot(graphDiv, dataToDisplay, graphParams);
    	
    	//delete all the annotation tool tips form the UI
    	thisSensor.removeAllAnnotationToolTips();
    	
    	//highlight the points that have annotations
    	thisSensor.highlightAnnotationPoints(null, null, dataToDisplay);
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
SENSOR.prototype.setupAnnotations = function() {
	/*
	 * clear any existing annotations, this is needed when the student
	 * clicks on the current step again in the left nav menu because
	 * the html does not get cleared but render() gets called again
	 */
	$("#graphAnnotationsDiv").html("");

	//get the annotations
	var annotationArray = this.sensorState.annotationArray;
	
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
 * @param sensorState
 * @param plot
 * @param dataSets the data sets currently displayed on the graph
 */
SENSOR.prototype.highlightAnnotationPoints = function(sensorState, plot, dataSets) {
	if(sensorState == null) {
		//use this.sensorState as the default sensor state if sensorState was not provided
		sensorState = this.sensorState;
	}
	
	if(plot == null) {
		//use this.globalPlot as the default if plot was not provided
		plot = this.globalPlot;
	}
	
	//get the annotations
	var annotationArray = sensorState.annotationArray;
	
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
			//add the annotation tool tip to the UI
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
SENSOR.prototype.getSeriesByName = function(plot, seriesName) {
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
SENSOR.prototype.getGraphUnits = function(graphType) {
	return this.graphUnits[graphType];
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
SENSOR.prototype.getGraphLabel = function(graphType) {
	//get the name of the graph
	var graphName = this.graphNames[graphType];
	
	//get the units
	var graphUnits = this.graphUnits[graphName];
	
	return graphName + " (" + graphUnits + ")";
};

/**
 * Get the graph name given the graph type
 * @param graphType the type of the graph
 * e.g.
 * "prediction"
 * @return the graph name
 */
SENSOR.prototype.getGraphName = function(graphType) {
	var graphName = this.graphNames[graphType];
	
	return graphName;
};

/**
 * Add the annotation to the UI
 * @param seriesName the name of the graph line
 * @param dataIndex the index on the graph line for the data point
 * @param dataText the text containing the x,y values of the data point
 * @param annotationText the text the student wrote for the annotation
 */
SENSOR.prototype.addAnnotationToUI = function(seriesName, dataIndex, x, y, dataText, annotationText) {
	//create the html that will represent the annotation
	var annotationHtml = "";
	
	//the class we will give to the annotation div
	var annotationClass = "";
	
	//whether we will allow the student to edit the annotation
	var enableEditing = "";
	
	if(seriesName.indexOf("prediction") != -1 && this.predictionLocked) {
		/*
		 * the annotation is for the prediction line and create prediction
		 * is disabled so we will not allow them to edit this annotation
		 */
		enableEditing = "disabled";
	}
	
	//get the series name we will use in the DOM
	var domSeriesName = this.getDOMSeriesName(seriesName);
	
	//set the class determined by whether this annotation is for sensor data or prediction
	if(seriesName.indexOf("prediction") != -1) {
		annotationClass = "predictionAnnotation";
	} else {
		annotationClass = "sensorAnnotation";
	}
	
	//get the x value we will use in the DOM id
	var domXValue = this.getDOMXValue(x);
	
	annotationHtml += "<div id='" + domSeriesName + domXValue + "AnnotationDiv' class='" + annotationClass + "'>";
	
	//add the annotation text label that displays the x,y values for the point
	annotationHtml += "<p id='" + domSeriesName + domXValue + "AnnotationDataText' style='display:inline'>" + seriesName + " [" + dataText + "]: </p>";
	
	//add the text input where the student can type
	annotationHtml += "<input id='" + domSeriesName + domXValue + "AnnotationInputText' type='text' class='predictionTextInput' value='" + annotationText + "' onchange='editAnnotation(\"" + seriesName + "\", " + x + ")' size='50' " + enableEditing + "/>";
	
	//the label for the delete button
	var deleteText = this.view.getI18NString('delete', 'SensorNode');
	
	//add the delete button to delete the annotation
	annotationHtml += "<input id='" + domSeriesName + domXValue + "AnnotationDeleteButton' type='button' class='predictionDeleteButton' value='" + deleteText + "' onclick='deleteAnnotation(\"" + seriesName + "\", " + dataIndex + ", " + x + ")' data-i18n='delete' " + enableEditing + "/>";
	annotationHtml += "</div>";
	
	//add the annotation html to the div where we put all the annotations
	$("#graphAnnotationsDiv").append(annotationHtml);
};

/**
 * Delete the annotation html for the given annotation
 * @param seriesName the name of the graph line
 * @param x the x value for the data point
 */
SENSOR.prototype.deleteAnnotationFromUI = function(seriesName, x) {
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
SENSOR.prototype.deleteAllAnnotationsFromUI = function() {
	$("#graphAnnotationsDiv").html("");
};

/**
 * Delete the sensor annotations from the UI
 */
SENSOR.prototype.deleteSensorAnnotationsFromUI = function() {
	$(".sensorAnnotation").remove();
};

/**
 * Delete the prediction annotations from the UI
 */
SENSOR.prototype.deletePredictionAnnotationsFromUI = function() {
	$(".predictionAnnotation").remove();
};

/**
 * Create a new annotation in the sensor state and also in the html UI
 * @param seriesName the name of the graph line
 * @param dataIndex the index on the graph line for the data point
 * @param dataPoint the x, y data point in an array [x,y]
 */
SENSOR.prototype.createAnnotation = function(seriesName, dataIndex, dataPoint) {
	//get the y units
	var graphYUnits = this.getGraphUnits(seriesName);
	
	//get the x label
	var xLabel = "";
	var seriesType = "";
	if(this.sensorType == "motion") {
		xLabel = "time";
	} else if(this.sensorType == "temperature") {
		xLabel = "time";
	} else if(this.content.useCustomUnitsAndGraphLabel != null) {
		xLabel = "customX";
	}
	
	//get the x units
	var graphXUnits = this.getGraphUnits(xLabel);
	
	//get the x and y values
	var x = dataPoint[0];
	var y = dataPoint[1];
	
	//get the text representation of the data point
	var dataText = x + " " + graphXUnits + ", " + y + " " + graphYUnits;
	
	//check if there is already an annotation for the given point
	var annotation = this.sensorState.getAnnotationBySeriesXValue(seriesName, x);
	
	if(annotation == null) {
		/*
		 * if this sensor state contains old data it will not have 
		 * an x value so we will have to search using the data index
		 */
		annotation = this.sensorState.getAnnotationBySeriesDataIndex(seriesName, dataIndex);
	}
	
	if(annotation == null) {
		//annotation does not exist for this point so we will make it
		
		//add the annotation to the UI
		this.addAnnotationToUI(seriesName, dataIndex, x, y, dataText, "");
		
		//add the annotation to the sensor state
		this.sensorState.addAnnotation(seriesName, dataIndex, x, y, dataText);
		
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
 * Delete the annotation from the UI and the sensor state
 * @param seriesName the name of the graph line
 * @param dataIndex the index of the point in the line
 * @param x the index on the graph line for the data point
 */
SENSOR.prototype.deleteAnnotation = function(seriesName, dataIndex, x) {
	//delete the annotation from the UI
	this.deleteAnnotationFromUI(seriesName, x);
	
	//delete the annotation from the sensor state
	this.sensorState.deleteAnnotation(seriesName, x);
	
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
 * we will update it in the sensor state annotation
 * @param seriesName the name of the graph line
 * @param x the x value for the data point
 * @param annotationText the text the student has written
 */
SENSOR.prototype.editAnnotation = function(seriesName, x, annotationText) {
	//update the annotation in the sensor state
	this.sensorState.editAnnotation(seriesName, x, annotationText);
	
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
 * Insert the applet into the html
 * @return
 */
SENSOR.prototype.insertApplet = function() {
	//the loading message that tells the student to click allow, run, or trust, when prompted
	var loading = this.view.getI18NString('loading', 'SensorNode');
	var click_allow_run_trust = this.view.getI18NString('click_allow_run_trust', 'SensorNode');
	
	//display the loading message on the graph
	this.showGraphMessage(loading + '<br>' + click_allow_run_trust, 'red');
	
	//the otml file determines what type of sensor the applet expects
	var otmlFileName = "";
	
	if(this.sensorType == 'motion') {
		//this is a motion sensor step
		//otmlFileName = "motion.otml";
		otmlFileName = "/distance.otml";
	} else if(this.sensorType == 'temperature') {
		//this is a temperature sensor step
		//otmlFileName = "temperature.otml";
		otmlFileName = "/temperature.otml";
	}
	
	/*
	 * get the document url, it will look something like
	 * http://wise.berkeley.edu/wise/vle/vle.html
	 */ 
	var documentURL = document.URL;
	
	//get the index of wise
	var wisePos = documentURL.indexOf("wise");
	
	/*
	 * get everything up to after wise so codebase will look something like
	 * http://wise.berkeley.edu/wise/
	 */
	var codebase = documentURL.substring(0, wisePos + "wise".length + 1);
	
	/*
	 * create the html applet tag that we will insert into the sensor.html
	 * we insert the otmlFileName as the "resource" param
	 */
	
	var host = "http://" + location.host;
	
	/*
	var appletHtml = '<applet id="sensorApplet" codebase="' + codebase + 'vle/node/sensor" ' + 
	'code="org.concord.sensor.applet.OTSensorApplet" ' + 
	'width="1" height="1" ' + 
	'archive="sensorJars/response-cache-0.1.0-SNAPSHOT.jar,' + 
	'sensorJars/framework-0.1.0-SNAPSHOT.jar,' + 
	'sensorJars/swing-0.1.0-SNAPSHOT.jar,' + 
	'sensorJars/frameworkview-0.1.0-SNAPSHOT.jar,' +
	'sensorJars/data-0.2.0-SNAPSHOT.jar,' +
	'sensorJars/jug-1.1.2.jar,' +
	'sensorJars/sensor-native-0.1.0-SNAPSHOT.jar,' +
	'sensorJars/apple-support-0.1.0-SNAPSHOT.jar,' +
	'sensorJars/sensor-0.2.0-SNAPSHOT.jar,' +
	'sensorJars/jdom-1.0.jar,' +
	'sensorJars/rxtx-comm-2.1.7-r2.jar,' +
	'sensorJars/otrunk-0.2.0-SNAPSHOT.jar,' +
	'sensorJars/sensor-applets-0.1.0-SNAPSHOT.jar ' +
	'"MAYSCRIPT="true"> ' + 
	'<param name="resource" value="' + otmlFileName + '"/> ' + 
	'<param name="name" value="sensor"/> ' +
	'<param name="listenerPath" value="jsListener"/> ' +
	'<param name="MAYSCRIPT" value="true"/>Your browser is completely ignoring the applet tag!' +
	'</applet>';
	*/

	/*
	//var appletHtml = '<applet id="sensorApplet" codebase="' + codebase + 'vle/node/sensor" ' + 
	var appletHtml = '<applet id="sensorApplet" codebase="http://localhost:8080/jnlp/jnlp" ' +
	'code="org.concord.sensor.applet.OTSensorApplet" ' + 
	'width="1" height="1" ' + 
	'archive="org/concord/sensor-native/sensor-native__V0.1.0-20101013.205003-476,' + 
	'org/concord/otrunk/otrunk__V0.2.0-20101008.002809-256,' + 
	'org/concord/framework/framework__V0.1.0-20101008.002809-556,' + 
	'org/concord/frameworkview/frameworkview__V0.1.0-20101008.002809-399,' +
	'jug/jug/jug__V1.1.2,' +
	'jdom/jdom/jdom__V1.0,' +
	'org/concord/sensor/sensor__V0.2.0-20100907.180413-275,' +
	'org/concord/data/data__V0.2.0-20101008.002809-280,' +
	'org/concord/sensor/sensor-applets/sensor-applets__V0.1.0-20101018.134018-59.jar" ' +
	'MAYSCRIPT="true"> ' + 
	'<param name="resource" value="' + otmlFileName + '"/> ' + 
	'<param name="name" value="sensor"/> ' +
	'<param name="listenerPath" value="jsListener"/> ' +
	'<param name="MAYSCRIPT" value="true"/>Your browser is completely ignoring the applet tag!' +
	'</applet>';
	*/
	
	//the message to display when applets are disabled
	var error_applets_are_disabled = this.view.getI18NString('error_applets_are_disabled', 'SensorNode');
	var here = this.view.getI18NString('here', 'SensorNode');
	var to_enable_applets = this.view.getI18NString('to_enable_applets', 'SensorNode');
	
	//var appletHtml = '<applet id="sensorApplet" codebase="http://localhost:8080/jnlp" ' +
	var appletHtml = '<applet id="sensorApplet" codebase="' + host + '/jnlp" ' +
	'code="org.concord.sensor.applet.OTSensorApplet" ' + 
	'width="1" height="1" ' + 
	'archive="org/concord/sensor-native/sensor-native.jar,' + 
	'org/concord/otrunk/otrunk.jar,' + 
	'org/concord/framework/framework.jar,' + 
	'org/concord/frameworkview/frameworkview.jar,' +
	'jug/jug/jug.jar,' +
	'jdom/jdom/jdom.jar,' +
	'org/concord/sensor/sensor.jar,' +
	'org/concord/data/data.jar,' +
	'org/concord/sensor/sensor-applets/sensor-applets.jar" ' +
	'MAYSCRIPT="true"> ' + 
	'<param name="resource" value="' + otmlFileName + '"/> ' + 
	'<param name="name" value="sensor"/> ' +
	'<param name="listenerPath" value="jsListener"/> ' +
	'<param name="permissions" value="all-permissions"/> ' +
	'<param name="MAYSCRIPT" value="true"/><font color="red" style="font-family:arial">' + error_applets_are_disabled + ' <a href="http://java.com/en/download/help/enable_browser.xml" target="_blank">' + here + '</a> ' + to_enable_applets + '</font>' +
	'</applet>';
	
	
	//insert the applet into the sensor.html
	document.getElementById('sensorAppletDiv').innerHTML = appletHtml;
};

/**
 * Set the labels for the graph
 */
SENSOR.prototype.setupGraphLabels = function() {
	if(this.content.graphParams != null) {
		//get the x and y labels
		this.xlabel = "";
		if(this.content.graphParams.xlabel) {
			this.xlabel = this.content.graphParams.xlabel;	
		}
		
		this.yLabel = "";
		if(this.content.graphParams.ylabel) {
			this.ylabel = this.content.graphParams.ylabel;
		}

		/*
		 * if the sensor state contains axis values it will override
		 * the axis values from the content
		 */
		if(this.sensorState != null) {
			if(this.sensorState.xlabel != null && this.sensorState.xlabel != "")  {
				this.xlabel = this.sensorState.xlabel;
			}
			if(this.sensorState.ylabel != null && this.sensorState.ylabel != "")  {
				this.ylabel = this.sensorState.ylabel;
			}
		}
		
		//set the y label
		$('#yLabelDiv').html(this.ylabel);
		//set the x label
		$('#xLabelDiv').html(this.xlabel);
		if (typeof this.content.graphParams.allowUpdateAxisLabel != "undefined" && this.content.graphParams.allowUpdateAxisLabel){
			$('#yLabelDiv').attr('contentEditable', true); 
			$("#yLabelDiv").bind('blur', {thisSensor:this}, (function(event) {
				event.data.thisSensor.updateAxisLabel();
			}));
			$('#xLabelDiv').attr('contentEditable', true); 
			$("#xLabelDiv").bind('blur', {thisSensor:this}, (function(event) {
				event.data.thisSensor.updateAxisLabel();
			}));
		}
	}
};

/**
 * Display the starter sentence button if the author has specified to
 * do so
 */
SENSOR.prototype.displayStarterSentenceButton = function() {
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
SENSOR.prototype.showStarterSentence = function() {
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
SENSOR.prototype.showGraphOptions = function() {
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
SENSOR.prototype.updateAxisRange = function() {
	if (this.content.graphParams.allowUpdateAxisRange) {
		//set this flag so we know the sensor state has changed
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
		
		//set the value into the sensor state
		this.sensorState.xMin = xMin;
		this.sensorState.xMax = xMax;
		this.sensorState.yMin = yMin;
		this.sensorState.yMax = yMax;

		//parse the graph params again to obtain the new values in the graph params
		this.graphParams = this.parseGraphParams(this.content.graphParams);

		//plot the graph again
		this.plotData();
	}
};

/**
 * The student has changed the axis label so we will obtain those
 * values and update state
 */
SENSOR.prototype.updateAxisLabel = function() {
	if (typeof this.content.graphParams.allowUpdateAxisLabel != "undefined" && this.content.graphParams.allowUpdateAxisLabel && (this.xlabel != $('#xLabelDiv').text() || this.ylabel != $('#yLabelDiv').text())) {
		//set this flag so we know the sensor state has changed
		this.axisLabelChanged = true;

		//get all the values from the text box inputs
		this.xlabel = $('#xLabelDiv').text();
		this.ylabel = $('#yLabelDiv').text();
		
		//set the value into the sensor state
		this.sensorState.xlabel = this.xlabel;
		this.sensorState.ylabel = this.ylabel;

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
SENSOR.prototype.areLimitsValid = function(xMin, xMax, yMin, yMax, resetInvalidValues, enableAlert) {
	var result = true;
	
	if(isNaN(Number(xMin))) {
		if(enableAlert) {
			var error_x_min_is_not_a_number = this.view.getI18NString('error_x_min_is_not_a_number', 'SensorNode');
			
			//x min is not a number
			alert(error_x_min_is_not_a_number);			
		}
		
		if(resetInvalidValues) {
			//reset the x min value
			this.resetXMin();			
		}
		
		result = false;
	} else if(isNaN(Number(xMax))) {
		if(enableAlert) {
			var error_x_max_is_not_a_number = this.view.getI18NString('error_x_max_is_not_a_number', 'SensorNode');
			
			//x max is not a number
			alert(error_x_max_is_not_a_number);			
		}

		if(resetInvalidValues) {
			//reset the x max value
			this.resetXMax();			
		}
		
		result = false;
	} else if(isNaN(Number(yMin))) {
		if(enableAlert) {
			var error_y_min_is_not_a_number = this.view.getI18NString('error_y_min_is_not_a_number', 'SensorNode');
			//y min is not a number
			alert(error_y_min_is_not_a_number);			
		}
		
		if(resetInvalidValues) {
			//reset the y min value
			this.resetYMin();			
		}
		
		result = false;
	} else if(isNaN(Number(yMax))) {
		if(enableAlert) {
			var error_y_max_is_not_a_number = this.view.getI18NString('error_y_max_is_not_a_number', 'SensorNode');
			
			//y max is not a number
			alert(error_y_max_is_not_a_number);			
		}
		
		if(resetInvalidValues) {
			//reset the y max value
			this.resetYMax();			
		}
		
		result = false;
	} else if(xMin != '' && xMax != '' && Number(xMin) >= Number(xMax)) {
		if(enableAlert) {
			var error_x_min_greater_than_x_max = this.view.getI18NString('error_x_min_greater_than_x_max', 'SensorNode');
			
			//x min is greater than x max
			alert(error_x_min_greater_than_x_max);			
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
			var error_y_min_greater_than_y_max = this.view.getI18NString('error_y_min_greater_than_y_max', 'SensorNode');
			
			//y min is greater than y max
			alert(error_y_min_greater_than_y_max);			
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
SENSOR.prototype.resetXMin = function() {
	var previousXMin = null;
	
	if(this.sensorState.xMin != null) {
		//reset the x min value from the state
		previousXMin = this.sensorState.xMin;
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
SENSOR.prototype.resetXMax = function() {
	var previousXMax = null;
	
	if(this.sensorState.xMax != null) {
		//reset the x max value from the state
		previousXMax = this.sensorState.xMax;
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
SENSOR.prototype.resetYMin = function() {
	var previousYMin = null;
	
	if(this.sensorState.yMin != null) {
		//reset the y min value from the state
		previousYMin = this.sensorState.yMin;
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
SENSOR.prototype.resetYMax = function() {
	var previousYMax = null;
	
	if(this.sensorState.yMax != null) {
		//reset the y max value from the state
		previousYMax = this.sensorState.yMax;
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
SENSOR.prototype.resetDefaultAxisRange = function() {
	//set this flag so we know the sensor state has changed
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
	
	//reset the values in the sensor state
	this.sensorState.xMin = this.content.graphParams.xmin;
	this.sensorState.xMax = this.content.graphParams.xmax;
	this.sensorState.yMin = this.content.graphParams.ymin;
	this.sensorState.yMax = this.content.graphParams.ymax;
	
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
SENSOR.prototype.getPredictionArray = function() {
	//get the graph data array from the current state 
	var predictionArray = this.generatePredictionArray(this.sensorState);
	
	return predictionArray;
};

/**
 * Generate the prediction array in a format that we can give to flot to plot
 * @param state the sensor state
 * @return an array containing arrays with two values [x, y] that represent
 * the prediction points
 */
SENSOR.prototype.generatePredictionArray = function(state) {
	var predictionArray = [];
	
	if(state != null) {
		//get the data array from the state
		var statePredictionArray = state.predictionArray;
		
		if(statePredictionArray != null) {
			//loop through all the elements in the data array
			for(var i=0; i<statePredictionArray.length; i++) {
				//get the data array element
				var sensorData = statePredictionArray[i];

				//get the time
				var x = sensorData.x;
				
				//get the y value. this may be distance or temp or etc.
				var y = sensorData.y;
				
				/*
				 * add the x, y data point into the array. flot expects
				 * the each element in the array to be an array.
				 */
				predictionArray.push([x, y]);
			}
		}		
	}
	return predictionArray;
};

/**
 * The student has created a prediction point
 * @param x the x value for the point
 * @param y the y value for the point
 */
SENSOR.prototype.predictionReceived = function(x, y) {
	
	if(x != null && y != null) {
		//round x down to the nearest 0.2
		x = Math.round(x * 5) / 5;
		
		y = parseFloat(y.toFixed(2));

		var xmin = typeof this.sensorState.xMin != "undefined" ? parseFloat(this.sensorState.xMin) : parseFloat(this.content.graphParams.xmin);
		var xmax = typeof this.sensorState.xMax != "undefined" ? parseFloat(this.sensorState.xMax) : parseFloat(this.content.graphParams.xmax);
		var ymin = typeof this.sensorState.yMin != "undefined" ? parseFloat(this.sensorState.yMin) : parseFloat(this.content.graphParams.ymin);
		var ymax = typeof this.sensorState.yMax != "undefined" ? parseFloat(this.sensorState.yMax) : parseFloat(this.content.graphParams.ymax);
		
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
		
		//insert the point into the sensor state
		this.sensorState.predictionReceived(x, y, typeof this.content.graphParams.allowNonFunctionalData != "undefined" ? !this.content.graphParams.allowNonFunctionalData : true);
		
		this.graphChanged = true;
		
		var seriesName = this.getGraphName("prediction");
		
		var annotation = this.sensorState.getAnnotationBySeriesXValue(seriesName, x);
		
		if(annotation != null) {
			//annotation exists for this x value so we will update that annotation
			
			//get the y units
			var graphYUnits = this.getGraphUnits(seriesName);
			
			//get the x label
	    	var xLabel = "";
	    	if(this.sensorType == "motion") {
	    		xLabel = "time";
	    	} else if(this.sensorType == "temperature") {
	    		xLabel = "time";
	    	} else if(this.content.useCustomUnitsAndGraphLabel != null) {
	    		xLabel = "customX";
	    	}
	    	
			//get the x units
			var graphXUnits = this.getGraphUnits(xLabel);
			
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
 * The student has created a prediction point
 * @param x the x value for the point
 * @param y the y value for the point
 */
SENSOR.prototype.predictionUpdateByX = function(x, y) {
	
	if(x != null && y != null) {
		//round x down to the nearest 0.2
		x = Math.round(x * 5) / 5;
		y = parseFloat(y.toFixed(2));
		var xmin = typeof this.sensorState.xMin != "undefined" ? parseFloat(this.sensorState.xMin) : parseFloat(this.content.graphParams.xmin);
		var xmax = typeof this.sensorState.xMax != "undefined" ? parseFloat(this.sensorState.xMax) : parseFloat(this.content.graphParams.xmax);
		var ymin = typeof this.sensorState.yMin != "undefined" ? parseFloat(this.sensorState.yMin) : parseFloat(this.content.graphParams.ymin);
		var ymax = typeof this.sensorState.yMax != "undefined" ? parseFloat(this.sensorState.yMax) : parseFloat(this.content.graphParams.ymax);
		
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
		
		//insert the point into the sensor state
		this.graphChanged = this.sensorState.predictionUpdateByX(x, y);
		
		if (this.graphChanged){
		
			var seriesName = this.getGraphName("prediction");
			
			var annotation = this.sensorState.getAnnotationBySeriesXValue(seriesName, x);
			
			if(annotation != null) {
				//annotation exists for this x value so we will update that annotation
				
				//get the y units
				var graphYUnits = this.getGraphUnits(seriesName);
				
				//get the x label
		    	var xLabel = "";
		    	if(this.sensorType == "motion") {
		    		xLabel = "time";
		    	} else if(this.sensorType == "temperature") {
		    		xLabel = "time";
		    	} else if(this.content.useCustomUnitsAndGraphLabel != null) {
		    		xLabel = "customX";
		    	}
		    	
				//get the x units
				var graphXUnits = this.getGraphUnits(xLabel);
				
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
 * Hide the sensor buttons
 */
SENSOR.prototype.hideSensorButtons = function() {
	$('#startButton').hide();
	$('#stopButton').hide();
	$('#clearButton').hide();
};

/**
 * Hide the prediction buttons
 */
SENSOR.prototype.hidePredictionButtons = function() {
	$('#clearPredictionButton').hide();
};

/**
 * Disable the clear prediction button
 */
SENSOR.prototype.disablePredictionButtons = function() {
	$('#clearPredictionButton').attr('disabled', true);
};

/**
 * Setup the axis limit values on the graph
 */
SENSOR.prototype.setupAxisValues = function() {
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
	 * if the sensor state contains axis values it will override
	 * the axis values from the content
	 */
	if(this.sensorState != null) {
		if(this.sensorState.xMin != null) {
			xMin = this.sensorState.xMin;
		}
		
		if(this.sensorState.xMax != null) {
			xMax = this.sensorState.xMax;
		}
		
		if(this.sensorState.yMin != null) {
			yMin = this.sensorState.yMin;
		}
		
		if(this.sensorState.yMax != null) {
			yMax = this.sensorState.yMax;
		}
	}
	
	//set the axis range values into the input text boxes
	$('#xMinInput').val(xMin);
	$('#xMaxInput').val(xMax);
	$('#yMinInput').val(yMin);
	$('#yMaxInput').val(yMax);
	
	// disable input boxes if updating axis range is not permitted.
	if (!this.content.graphParams.allowUpdateAxisRange) {
		//disable the axis range text inputs so the student can't change the limits
		$('#xMinInput').attr("disabled","disabled");		
		$('#xMaxInput').attr("disabled","disabled");		
		$('#yMinInput').attr("disabled","disabled");		
		$('#yMaxInput').attr("disabled","disabled");		
	} else {
		//enable the student to change the axis limits
		$('#xMinInput').attr("disabled", null);		
		$('#xMaxInput').attr("disabled", null);		
		$('#yMinInput').attr("disabled", null);		
		$('#yMaxInput').attr("disabled", null);
	}
};

/**
 * Get the prediction from the prevWorkNodeIds
 * @return
 */
SENSOR.prototype.getPreviousPrediction = function() {
	if(this.node.prevWorkNodeIds.length > 0) {
		if(this.view.getState() != null) {
			
			//make sure the previous work node is also a graph/sensor step
			if(this.view.getProject().getNodeById(this.node.prevWorkNodeIds[0]).type == 'SensorNode') {
				//get the state from the previous step that this step is linked to
				var predictionState = this.view.getState().getLatestWorkByNodeId(this.node.prevWorkNodeIds[0]);
				
				/*
				 * make sure this step doesn't already have a prediction set 
				 * and that there was a prediction state from the previous
				 * associated step before we try to retrieve that prediction and
				 * set it into our prediction array
				 */
				if(this.sensorState.predictionArray.length == 0 && predictionState != null && predictionState != "") {
					/*
					 * make a copy of the prediction array and set it into our sensor state
					 * so we don't accidentally modify the data from the other state
					 */
					this.sensorState.predictionArray = JSON.parse(JSON.stringify(predictionState.predictionArray));
					
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
						this.sensorState.annotationArray.push(predictionAnnotations[y]);
					}
				}				
			}
		}
	}
};

/**
 * Delete the prediction points and annotations
 */
SENSOR.prototype.clearPrediction = function() {
	//clear the prediction array
	this.sensorState.predictionArray = [];
	
	//delete the prediction annotations
	this.sensorState.removePredictionAnnotations();
	
	//delete the prediction annotations from the UI
	this.deletePredictionAnnotationsFromUI();
	
	//delete the prediction annotation tool tips on the graph
	this.removeAnnotationToolTipPrediction();
	
	//plot the graph again
	this.plotData();
	
	this.graphChanged = true;
};

/**
 * Delete the prediction annotation tool tips
 */
SENSOR.prototype.removeAnnotationToolTipPrediction = function() {
	this.removeAnnotationToolTip("annotationToolTipPrediction");
};

/**
 * Delete the data annotation tool tips
 */
SENSOR.prototype.removeAnnotationToolTipData = function() {
	this.removeAnnotationToolTip("annotationToolTipData");
};

/**
 * Delete the annotation tool tips for the given class
 * @param annotationToolTipClass the class for the annotation tool tips we want to delete
 */
SENSOR.prototype.removeAnnotationToolTip = function(annotationToolTipClass) {
	$("." + annotationToolTipClass).remove();
};

/**
 * Determine if one data sets has the given name
 * @param dataSets an array of data sets
 * @param name the name of a data set (aka series name)
 * @return whether a data set has the given name
 */
SENSOR.prototype.dataSetContainsName = function(dataSets, name) {
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
SENSOR.prototype.removeAllAnnotationToolTips = function() {
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
SENSOR.prototype.addAnnotationToolTipToUI = function(seriesName, dataIndex, x, y, annotationText) {
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
		
		if(dataPointArray != null) {
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
	}
};

/**
 * Get the series name that we will use in the DOM. This just means
 * replacing any spaces " " with underscores "_"
 * @param seriesName the name of the series
 * @return the seriesName with spaces replaced with underscores
 */
SENSOR.prototype.getDOMSeriesName = function(seriesName) {
	var domSeriesName = "";
	
	if(seriesName != null) {
		//replace the spaces with underscores
		domSeriesName = seriesName.replace(/ /g, "_");
	}
	
	return domSeriesName;
};

/**
 * Get the x value that we will use in the DOM id. This just means
 * replacing any "." with underscores "_"
 * @param x the x value
 * @return the x value with "." replaced with "_"
 */
SENSOR.prototype.getDOMXValue = function(x) {
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
SENSOR.prototype.hideAllInputFields = function() {
	$('#startButton').hide();
	$('#stopButton').hide();
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
SENSOR.prototype.setGraphDivId = function(graphDivId) {
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
SENSOR.prototype.getGraphColor = function(graphType) {
	return this.graphColors[graphType];
};

/**
 * Get the data index of the point with the given x value
 * @param series the series object for a line plot
 * @param x the x value we want
 * @return the data index of the point with the given x value
 * or null if there is none
 */
SENSOR.prototype.getDataIndexAtX = function(series, x) {
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
SENSOR.prototype.disablePredictionTextInputAndDeleteButton = function() {
	$('.predictionTextInput').attr('disabled', true);
	$('.predictionDeleteButton').attr('disabled', true);
};

/**
 * Called when the sensor is ready
 */
SENSOR.prototype.sensorReady = function() {
	//remember that the sensor is ready
	this.sensorLoaded = true;
	
	if(this.content.createPrediction) {
		/*
		 * if the this step requires the student to create a prediction
		 * and also retrieve sensor probe data, we will just hide the 
		 * graphMessageDiv so it does not get in their way when 
		 * they create their prediction. usually we will hide the
		 * graphMessageDiv when they click the "Start" button but
		 * in this case we want them to create the prediction first
		 * before actually retrieving data from the sensor probe by
		 * clicking "Start"
		 */
		this.hideGraphMessage();
	} else {
		//we are done loading the applet so we will tell the student to click start to begin
		var done_loading = this.view.getI18NString('done_loading', 'SensorNode');
		var click_start_to_begin = this.view.getI18NString('click_start_to_begin', 'SensorNode');
		
		//display the done loading message on the graph
		this.showGraphMessage(done_loading + '<br>' + click_start_to_begin, 'yellow');
		
		//remove the done loading message after 5 seconds
		setTimeout("$('#graphMessageDiv').hide();", 5000);
	}
};

/**
 * Show the graph message
 * @param message the message the student will see
 * @param backgroundColor the background color of the message
 */
SENSOR.prototype.showGraphMessage = function(message, backgroundColor) {
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
SENSOR.prototype.hideGraphMessage = function() {
	$('#graphMessageDiv').hide();
};

/**
 * Called when the student clicks
 * @param event the click event
 */
SENSOR.prototype.handleKeyDown = function(event) {
	if(event.keyCode == 8 || event.keyCode == 46) {
		//student pressed the delete or backspace key
		
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
 * the sensorState
 */
SENSOR.prototype.removePredictionPoint = function(seriesName, dataIndex, x) {
	//check that this is a prediction line
	if(this.seriesIsPrediction(seriesName)) {
		//remove any annotations associated with the point
		this.deleteAnnotation(seriesName, dataIndex, x);
		
		//remove the data point from the sensorState
		this.sensorState.removePredictionPoint(seriesName, dataIndex);		
	}
};

/**
 * Determine if the series is a prediction line
 * @param seriesName the name of the series. usually
 * the name of a prediction line will contain the
 * word prediction e.g.
 * "temperature prediction"
 * "distance prediction"
 * @returns whether the line is a prediction line
 */
SENSOR.prototype.seriesIsPrediction = function(seriesName) {
	var result = false;
	
	//check if the series name contains the word prediction
	if(seriesName.indexOf("prediction") != -1) {
		result = true;
	}
	
	return result;
};

/**
 * Process the tag maps and obtain the results
 * @return an object containing the results from processing the
 * tag maps. the object contains three fields
 * enableStep
 * message
 * workToImport
 */
SENSOR.prototype.processTagMaps = function() {
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
				} else if (functionName == "mustSpanDomainBeforeAdvancing"){
					var your_graph_doesnt_cover_entire_x_axis = this.view.getI18NString('your_graph_doesnt_cover_entire_x_axis', 'SensorNode');
					
					this.view.eventManager.fire('addActiveTagMapConstraint', [this.node.id, null, 'mustCompleteBeforeAdvancing', null, null,your_graph_doesnt_cover_entire_x_axis]);
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
 * Check if this step imports work from another sensor step
 */
SENSOR.prototype.importsWorkFromSensorStep = function() {
	var thisStepImportsWorkFromSensorStep = false;
	
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
					//this is an importWork function
					
					//get all the tagged steps
					var nodeIds = this.view.getProject().getPreviousNodeIdsByTag(tagName, this.id);
					
					//loop through all the tagged steps
					for(var y=0; y<nodeIds.length; y++) {
						//get a node id
						var nodeId = nodeIds[y];
						
						if(nodeId != null) {
							//get the node
							var node = this.view.getProject().getNodeById(nodeId);
							
							if(node.type == 'SensorNode') {
								//the step is a sensor node
								
								thisStepImportsWorkFromSensorStep = true;
								break;
							}
						}
					}
				}
			}
		}
	}
	
	return thisStepImportsWorkFromSensorStep;
};

/**
 * Get the node ids of the sensor steps that this step imports work from
 */
SENSOR.prototype.getSensorNodeIdsImportingFrom = function() {
	var nodeIds = [];
	
	//get the node ids this step imports work from
	var nodeIdsImportingFrom = this.node.getNodeIdsImportingFrom();
	
	if(nodeIdsImportingFrom != null) {
		
		//loop through all the node ids
		for(var x=0; x<nodeIdsImportingFrom.length; x++) {
			//get a node id
			var nodeId = nodeIdsImportingFrom[x];
			
			//get a node
			var node = this.view.getProject().getNodeById(nodeId);
			
			if(node != null) {
				//check if it is a SensorNode
				if(node.type == 'SensorNode') {
					//add the node id
					nodeIds.push(nodeId);
				}
			}
		}
	}
	
	return nodeIds;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/sensor/sensor.js');
}