/*
 * This is a grapher state object that developers can use to create new
 * step types.
 *
 * TODO: Copy this file and rename it to
 * 
 * <new step type>State.js
 * e.g. for example if you are creating a quiz step it would look
 * something like quizState.js
 *
 * and then put the new file into the new folder
 * you created for your new step type
 *
 * your new folder will look something like
 * vlewrapper/WebContent/vle/node/<new step type>/
 *
 * e.g. if you are creating a quiz step it would look something like
 * vlewrapper/WebContent/vle/node/quiz/
 * 
 * TODO: in this file, change all occurrences of the word 'GrapherState' to
 * 
 * <new step type>State
 * e.g. for example if you are creating a quiz step it would look
 * something like QuizState
 */

/**
 * This is the constructor for the state object that will be used to represent the
 * student work. An instance of this object will be created each time the student
 * submits an answer.
 * 
 * TODO: rename GrapherState
 * 
 * note: you can change the variables in this constructor, the response variable
 * is just used as an example. you can add any variables that will help you 
 * represent the student's work for your step type.
 * 
 * @constructor
 */
function GrapherState(response, annotationArray, predictionArray, timestamp, xMin, xMax, yMin, yMax, predictionLocked, xlabel, ylabel) {
	this.constructorHelper(response, annotationArray, predictionArray, timestamp, xMin, xMax, yMin, yMax, predictionLocked, xlabel, ylabel);
};

GrapherState.prototype.constructorHelper = function(response, annotationArray, predictionArray, timestamp, xMin, xMax, yMin, yMax, predictionLocked, xlabel, ylabel) {
	//the text response the student wrote
	this.response = "";

	if(response != null) {
		//set the response
		this.response = response;
	}

	//an array of annotations the student has created
	this.annotationArray = [];
	
	//an array of prediction objects
	// [
	//	{id:"car1",predictions:[[0,1],[1,3],[2,5]]}, 
	//	{id:"car2",predictions:[[0,0],[1,5],[5,3]]}
	// ]
	this.predictionArray = [];

	if(annotationArray != null) {
		//set the data array if it was provided to the constructor
		this.annotationArray = annotationArray;
	}
	
	if(predictionArray != null) {
		//set the data array if it was provided to the constructor
		this.predictionArray = predictionArray;
	}
	
	if(timestamp == null) {
		//set the timestamp to the current time if timestamp is not provided
		this.timestamp = new Date().getTime();
	} else {
		this.timestamp = timestamp;
	}
	
	//set the axis range values
	this.xMin = xMin;
	this.xMax = xMax;
	this.yMin = yMin;
	this.yMax = yMax;

	//set the axis labels
	this.xlabel = typeof xlabel !== "undefined" ? xlabel : "";
	this.ylabel = typeof ylabel !== "undefined" ? ylabel : "";
	
	//set whether the prediction is locked
	this.predictionLocked = predictionLocked;
};

/**
 * This function is used to reload previous work the student submitted for the step.
 * The student work is retrieved and then this function is called to parse the student
 * work so that we can display the previous answer the student submitted.
 * 
 * TODO: rename GrapherState
 * 
 * note: you can change the variables in the stateJSONObj, the response 
 * variable is just used as an example. you can add any variables that will  
 * help you represent the student's work for your type of step.
 * 
 * @param stateJSONObj a JSONObject representing the student work
 * @return a GrapherState object
 */
GrapherState.prototype.parseDataJSONObj = function(stateJSONObj, emptyState) {
	//obtain the student work from the JSONObject
	var response = stateJSONObj.response;
	
	//get the annotation array
	var annotationArray = stateJSONObj.annotationArray;
	
	//get the prediction array
	var predictionArray = stateJSONObj.predictionArray;
	
	//get the timestamp
	var timestamp = stateJSONObj.timestamp;
	
	//get the axis range values
	var xMin = stateJSONObj.xMin;
	var xMax = stateJSONObj.xMax;
	var yMin = stateJSONObj.yMin;
	var yMax = stateJSONObj.yMax;

	//set the axis labels
	var xlabel = typeof stateJSONObj.xlabel !== "undefined" ? stateJSONObj.xlabel : "";
	var ylabel = typeof stateJSONObj.ylabel !== "undefined" ? stateJSONObj.ylabel : "";
	
	//get whether the prediction has been locked
	var predictionLocked = stateJSONObj.predictionLocked;

	//create a GrapherState object
	var grapherState = null;
	if(emptyState == null) {
		//create a SENSORSTATE object
		grapherState = new GrapherState(response, annotationArray, predictionArray, timestamp, xMin, xMax, yMin, yMax, predictionLocked, xlabel, ylabel);		
	} else {
		//populate the empty SENSORSTATE object
		grapherState = emptyState.constructorHelper(response, annotationArray, predictionArray, timestamp, xMin, xMax, yMin, yMax, predictionLocked, xlabel, ylabel);
	}

	//return the state object
	return grapherState;
};

/**
 * Clears the annotation array. This is called when the student
 * clicks the Clear button or when they re-collect new graph data.
 */
GrapherState.prototype.clearAnnotations = function() {
	//clear the cargraph data array by setting it to a new empty array
	this.annotationArray = [];
};

/**
 * Clears all the predictions in the prediction array.
 */
GrapherState.prototype.clearPredictions = function() {
	//clear the cargraph data array by setting it to a new empty array
	this.predictionArray = [];
};

/**
 * Get the student work for display purposes such as in the grading tool.
 * 
 * TODO: rename GrapherState
 * 
 * @return the student work
 */
GrapherState.prototype.getStudentWork = function() {
	var studentWork = this;
	
	return studentWork;
};

/**
 * Get an annotation object given the seriesName and dataIndex
 * @param seriesName the name of the graph line
 * e.g.
 * 'Sam's hike
 * 'rita's hike
 * 
 * @param dataIndex the index on the graph line
 * @return an annotation object or null if none was found to match
 */
GrapherState.prototype.getAnnotationBySeriesDataIndex = function(seriesName, dataIndex) {
	var annotation = null;
	
	//loop through all the annotations
	for(var x=0; x<this.annotationArray.length; x++) {
		//get an annotation
		var tempAnnotation = this.annotationArray[x];
		
		//check if the series name and data index match
		if((tempAnnotation.seriesName == seriesName || this.getDOMSeriesName(tempAnnotation.seriesName) == seriesName) && tempAnnotation.dataIndex == dataIndex) {
			//values match so we have found the annotation we want
			annotation = tempAnnotation;
			
			//jump out of the for loop
			break;
		}
	}
	
	return annotation;
};

/**
 * Get the annotation by series name and x value
 * @param seriesName the name of the series
 * @param x the x value of the point
 * @return the annotation on the series with the given x value
 * or null if it does not exist
 */
GrapherState.prototype.getAnnotationBySeriesXValue = function(seriesName, x) {
	var annotation = null;
	
	//loop through all the annotations
	for(var i=0; i<this.annotationArray.length; i++) {
		//get an annotation
		var tempAnnotation = this.annotationArray[i];
		
		//check if the series name and data index match
		if((tempAnnotation.seriesName == seriesName || this.getDOMSeriesName(tempAnnotation.seriesName) == seriesName) && tempAnnotation.x == x) {
			//values match so we have found the annotation we want
			annotation = tempAnnotation;
			
			//jump out of the for loop
			break;
		}
	}
	
	return annotation;
};

/**
 * Add a new annotation to the annotation array
 * @param seriesName the name of the graph line
 * e.g.
 * 'distance'
 * 'velocity'
 * 'acceleration'
 * 'temperature'
 * @param dataIndex the index on the graph line
 * @param dataText the text representation of the data point
 * e.g.
 * 'distance [8.445 s, 0.1 m]'
 */
GrapherState.prototype.addAnnotation = function(seriesName, dataIndex, x, y, dataText) {
	var annotation = {
		seriesName:seriesName,
		dataIndex:dataIndex,
		dataText:dataText,
		annotationText:"",
		x:x,
		y:y
	};
	
	this.annotationArray.push(annotation);
};

/**
 * Delete the annotation from the annotation array
 * @param seriesName the name of the graph line
 * e.g.
 * 'distance'
 * 'velocity'
 * 'acceleration'
 * 'temperature'
 * @param x the x value for the point
 */
GrapherState.prototype.deleteAnnotation = function(seriesName, x) {
	//loop through all the annotations
	for(var i=0; i<this.annotationArray.length; i++) {
		//get an annotation
		var annotation = this.annotationArray[i];

		//check if the series name and data index match
		if((annotation.seriesName == seriesName || this.getDOMSeriesName(annotation.seriesName) == seriesName) && annotation.x == x) {
			//remove the annotation from the array
			this.annotationArray.splice(i, 1);
		}
	}
};

/**
 * Save the text the student has written for the annotation
 * @param seriesName the name of the graph line
 * e.g.
 * 'distance'
 * 'velocity'
 * 'acceleration'
 * 'temperature'
 * @param dataIndex the index on the graph line
 * @param annotationText the text the student has written for the annotation
 */
GrapherState.prototype.editAnnotation = function(seriesName, x, annotationText) {
	//loop through all the annotations
	for(var i=0; i<this.annotationArray.length; i++) {
		//get an annotation
		var annotation = this.annotationArray[i];
		
		//check if the series name and data index match
		if((annotation.seriesName == seriesName || this.getDOMSeriesName(annotation.seriesName) == seriesName) && annotation.x == x) {
			//set the text the student wrote
			annotation.annotationText = annotationText;
		}
	}
};

/**
 * Get the human readable form of the annotations as a string
 * @return a string containing the human readable form of the annotations
 * e.g.
 * distance [11.61 s, 0.72 m]: this is where it was the highest
 * velocity [13.87 s, -0.09 m/s]: this is where it was the fastest
 */
GrapherState.prototype.getAnnotationsHtml = function() {
	var annotationsHtml = "<br>";
	
	//loop through all the annotations
	for(var x=0; x<this.annotationArray.length; x++) {
		//get an annotation
		var annotation = this.annotationArray[x];
		var dataText = annotation.dataText;
		var annotationText = annotation.annotationText;
		var seriesName = annotation.seriesName;
		
		/*
		 * get the human readable form of the annotation
		 * e.g.
		 * distance [11.61 s, 0.72 m]: this is where it was the highest
		 */
		annotationsHtml += seriesName + " [" + dataText + "]: " + annotationText;
		annotationsHtml += "<br>";
	}
	
	return annotationsHtml;
};

GrapherState.prototype.getPredictionObjByPredictionId = function(predictionId) {
	for (var i=0; i < this.predictionArray.length; i++) {
		if (this.predictionArray[i].id == predictionId) {
			return this.predictionArray[i];
		}
	}
	return null;
};

GrapherState.prototype.setPredictionsForPredictionId = function(predictionId, predictionArray) {
	for (var i=0; i < this.predictionArray.length; i++) {
		if (this.predictionArray[i].id == predictionId) {
			this.predictionArray[i].predictions = predictionArray;
		}
	}
};

/**
 * Adds an empty element into the prediction array
 */
GrapherState.prototype.initializePrediction = function(predictionId) {
	if (this.getPredictionObjByPredictionId(predictionId) == null) {
		this.predictionArray.push({id:predictionId, predictions:[]});
	}
}

/**
 * Adds an element into the prediction array
 * @param x the x value of the point
 * @param y the y value of the point
 * @param doSort whether array should be sorted, or kept in order given
 */
GrapherState.prototype.predictionReceived = function(predictionId, x, y, doSort) {
	if (this.getPredictionObjByPredictionId(predictionId) == null) {
		this.predictionArray.push({id:predictionId, predictions:[]});
	}
	var predictionArray = this.getPredictionObjByPredictionId(predictionId).predictions;
	//remove any existing point with the same x value
	for(var i=0; i<predictionArray.length; i++) {
		var predictionPoint = predictionArray[i];
		
		if(predictionPoint.x == x) {
			predictionArray.splice(i, 1);
			break;
		}
	}
	
	//create an object that contains the x, y points
	var predictionData = {
			x: x,
			y: y
	};

	//add the element to the array
	predictionArray.push(predictionData);
	
	if (typeof doSort == "undefined" || doSort){
		//sort the array by the x value
		predictionArray.sort(this.sortPredictionArray);
	}

	// save 
	this.setPredictionsForPredictionId(predictionId, predictionArray);	
};

/**
 * Update a prediction based on the inputed x value to new y value
 * @param x the x value of the point
 * @param y the new y value
 */
GrapherState.prototype.predictionUpdateByX = function(predictionId, x, y) {
	if (this.getPredictionObjByPredictionId(predictionId) == null) {
		return false;
	}
	var predictionArray = this.getPredictionObjByPredictionId(predictionId).predictions;
	//remove any existing point with the same x value
	var predictionFound = false;
	for(var i=0; i<predictionArray.length; i++) {
		var predictionPoint = predictionArray[i];
		
		if(predictionPoint.x == x) {
			predictionArray[i].y = y;
			predictionFound = true;
			break;
		}
	}

	// save 
	if (predictionFound){
		this.setPredictionsForPredictionId(predictionId, predictionArray);	
		return true;
	} else {
		return false;
	}
}

/**
 * Update a prediction based on the inputed x value to new y value
 * @param x the x value of the point
 * @param y the new y value
 */
GrapherState.prototype.predictionUpdateBySeriesDataIndex = function(predictionId, x, y, index) {
	if (this.getPredictionObjByPredictionId(predictionId) == null) {
		return false;
	}
	var predictionArray = this.getPredictionObjByPredictionId(predictionId).predictions;
	
	// save 
	if (index < predictionArray.length){
		predictionArray[index].x = x;
		predictionArray[index].y = y;
		this.setPredictionsForPredictionId(predictionId, predictionArray);	
		return true;
	} else {
		return false;
	}
}

/**
 * Remove the element with the given index from the prediction array
 * @param index the index to remove
 */
GrapherState.prototype.predictionRemoved = function(predictionId,index) {	
	var predictions = this.getPredictionObjByPredictionId(predictionId).predictions;
	this.setPredictionsForPredictionId(predictionId, predictions.splice(index,1));
	//this.predictions.predictionArrayId.splice(index, 1);
};

/**
 * A function used to sort arrays in ascending x values. The elements 
 * in the array contain x and y fields.
 * e.g.
 * {
 * 		x:1.4,
 * 		y:8.45
 * }
 * @param point1 an element in the array
 * @param point2 an element in the array
 * @return negative value if point1.x is smaller than point2.x
 * or
 * positive value if point1.x is larger than point2.x
 * or
 * 0 if the values are the same
 */
GrapherState.prototype.sortPredictionArray = function(point1, point2) {
	return point1.x - point2.x;
};

/**
 * Remove the prediction annotations from the annotation array
 * @return
 */
GrapherState.prototype.removePredictionAnnotations = function(seriesName) {
	if (typeof seriesName === "undefined") seriesName = 'prediction';
	//loop through all the annotations
	for(var x=0; x<this.annotationArray.length; x++) {
		var annotation = this.annotationArray[x];
		
		if(annotation.seriesName.indexOf(seriesName) != -1) {
			//the annotation is a prediction annotation so we will remove it
			this.annotationArray.splice(x, 1);
			x--;
		}
	}
};

/**
 * Get a copy of this grapher state
 * @return a new grapher state object that is a copy of this grapher state object
 */
GrapherState.prototype.getCopy = function() {
	//make a json object copy
	var grapherStateCopyJSONObj = JSON.parse(JSON.stringify(this));
	
	//parse the json object into a grapher state object
	var grapherStateCopy = this.parseDataJSONObj(grapherStateCopyJSONObj);
	
	return grapherStateCopy;
};

/**
 * Copy the values in the populatedState into the emptyState
 * @param populatedState a GrapherState object with populated fields
 * @param emptyState a GrapherState object with empty fields
 */
GrapherState.prototype.copyState = function(populatedState, emptyState) {
	//make a json object copy
	var grapherStateCopyJSONObj = JSON.parse(JSON.stringify(populatedState));
	
	//copy the fields into the empty grapher state object
	this.parseDataJSONObj(grapherStateCopyJSONObj, emptyState);
};

/**
 * Remove the data point from the prediction array
 * @param seriesName the name of the series/line
 * @param dataIndex the index within the prediction array to remove
 */
GrapherState.prototype.removePredictionPoint = function(seriesName, dataIndex) {
	//loop through all the prediction objects
	for(var x=0; x<this.predictionArray.length; x++) {
		//get a prediction object
		var prediction = this.predictionArray[x];
		
		if(prediction != null) {
			//make sure the prediction object is for the series we want
			if(seriesName == prediction.id) {
				//remove the element at the given index
				prediction.predictions.splice(dataIndex, 1);
			}
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
GrapherState.prototype.getDOMSeriesName = function(seriesName) {
	var domSeriesName = "";
	
	if(seriesName != null) {
		//replace the spaces with underscores
		domSeriesName = seriesName.replace(/ /g, "_");
		domSeriesName = domSeriesName.replace(/'/g, "");
		domSeriesName = domSeriesName.replace(/"/g, "");
	}
	
	return domSeriesName;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	//TODO: rename grapher/grapherState.js
	eventManager.fire('scriptLoaded', 'vle/node/grapher/grapherState.js');
}