/*
 * This is the object that we use to save student data from a sensor step
 */

/**
 * The constructor for the sensor state
 * @constructor
 * @param response the text response the student typed
 * @param sensorDataArray an array containing data from the sensor
 * @param annotationArray an array containing objects that represent annotations
 * for points on the graph 
 * @param predictionArray an array containing the prediction points made by the student
 * @param timestamp the time the sensor state was created
 * @param xMin the min x value
 * @param xMax the max x value
 * @param yMin the min y value
 * @param yMax the max y value
 * @param predictionLocked whether to lock the prediction so the student can't modify it anymore
 */
function SENSORSTATE(response, sensorDataArray, annotationArray, predictionArray, timestamp, xMin, xMax, yMin, yMax, predictionLocked, xlabel, ylabel) {
	this.constructorHelper(response, sensorDataArray, annotationArray, predictionArray, timestamp, xMin, xMax, yMin, yMax, predictionLocked, xlabel, ylabel);
};

/**
 * The constructor for the sensor state
 * @param response the text response the student typed
 * @param sensorDataArray an array containing data from the sensor
 * @param annotationArray an array containing objects that represent annotations
 * for points on the graph 
 * @param predictionArray an array containing the prediction points made by the student
 * @param timestamp the time the sensor state was created
 * @param xMin the min x value
 * @param xMax the max x value
 * @param yMin the min y value
 * @param yMax the max y value
 * @param predictionLocked whether to lock the prediction so the student can't modify it anymore
 * @return this SENSORSTATE object
 */
SENSORSTATE.prototype.constructorHelper = function(response, sensorDataArray, annotationArray, predictionArray, timestamp, xMin, xMax, yMin, yMax, predictionLocked, xlabel, ylabel) {
	//the text response the student wrote
	this.response = "";
	
	//an array of the data points retrieved from the sensor
	this.sensorDataArray = [];
	
	//an array of annotations the student has created
	this.annotationArray = [];
	
	//an array of the data points the student made as a prediction
	this.predictionArray = [];
	
	if(response != null) {
		//set the response if it was provided to the constructor
		this.response = response;
	}
	
	if(sensorDataArray != null) {
		//set the data array if it was provided to the constructor
		this.sensorDataArray = sensorDataArray;
	}
	
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
	
	return this;
};

/**
 * Creates a SENSORSTATE object from the data in the JSON object
 * @param stateJSONObj a JSON object containing data for a SENSORSTATE
 * @param emptyState an optional SENSORSTATE object, if it this is not null
 * we will populate the fields in this object instead of creating a new
 * SENSORSTATE object
 * @return a SENSORSTATE object with the attributes populated
 */
SENSORSTATE.prototype.parseDataJSONObj = function(stateJSONObj, emptyState) {
	//get the student response
	var response = stateJSONObj.response;
	
	//get the sensor data array
	var sensorDataArray = stateJSONObj.sensorDataArray;
	
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

	var sensorState = null;

	if(emptyState == null) {
		//create a SENSORSTATE object
		sensorState = new SENSORSTATE(response, sensorDataArray, annotationArray, predictionArray, timestamp, xMin, xMax, yMin, yMax, predictionLocked, xlabel, ylabel);		
	} else {
		//populate the empty SENSORSTATE object
		sensorState = emptyState.constructorHelper(response, sensorDataArray, annotationArray, predictionArray, timestamp, xMin, xMax, yMin, yMax, predictionLocked, xlabel, ylabel);
	}
	
	return sensorState;
};

/**
 * Adds an element into the sensor data array. This is called when
 * the student is using the sensor to collect data.
 * @param x the x value of the data
 * @param y the y value of the data
 */
SENSORSTATE.prototype.dataReceived = function(x, y) {
	//create an object that contains the x, y points
	var sensorData = {
			x: x,
			y: y
	};
	
	//add the sensor data object to the sensor data array
	this.sensorDataArray.push(sensorData);
};

/**
 * Clears the sensor data array. This is called when the student
 * clicks on the Clear button.
 */
SENSORSTATE.prototype.clearSensorData = function() {
	//clear the sensor data array by setting it to a new empty array
	this.sensorDataArray = [];
};

/**
 * Clears the annotation array. This is called when the student
 * clicks the Clear button or when they re-collect new graph data.
 */
SENSORSTATE.prototype.clearAnnotations = function() {
	//clear the sensor data array by setting it to a new empty array
	this.annotationArray = [];
};

/**
 * Clears all the predictions in the prediction array.
 */
SENSORSTATE.prototype.clearPredictions = function() {
	//clear the sensor data array by setting it to a new empty array
	this.predictionArray = [];
};

/**
 * We will just return this SENSORSTATE object as the student work
 * because it contains the sensor data as well as the student response
 * @return the student work
 */
SENSORSTATE.prototype.getStudentWork = function() {
	var studentWork = this;
	
	return studentWork;
};

/**
 * Get an annotation object given the seriesName and dataIndex
 * @param seriesName the name of the graph line
 * e.g.
 * 'distance'
 * 'velocity'
 * 'acceleration'
 * 'temperature'
 * @param dataIndex the index on the graph line
 * @return an annotation object or null if none was found to match
 */
SENSORSTATE.prototype.getAnnotationBySeriesDataIndex = function(seriesName, dataIndex) {
	var annotation = null;
	
	//loop through all the annotations
	for(var x=0; x<this.annotationArray.length; x++) {
		//get an annotation
		var tempAnnotation = this.annotationArray[x];
		
		//check if the series name and data index match
		if(tempAnnotation.seriesName == seriesName && tempAnnotation.dataIndex == dataIndex) {
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
SENSORSTATE.prototype.getAnnotationBySeriesXValue = function(seriesName, x) {
	var annotation = null;
	
	//loop through all the annotations
	for(var i=0; i<this.annotationArray.length; i++) {
		//get an annotation
		var tempAnnotation = this.annotationArray[i];
		
		//check if the series name and data index match
		if(tempAnnotation.seriesName == seriesName && tempAnnotation.x == x) {
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
SENSORSTATE.prototype.addAnnotation = function(seriesName, dataIndex, x, y, dataText) {
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
SENSORSTATE.prototype.deleteAnnotation = function(seriesName, x) {
	//loop through all the annotations
	for(var i=0; i<this.annotationArray.length; i++) {
		//get an annotation
		var annotation = this.annotationArray[i];

		//check if the series name and data index match
		if(annotation.seriesName == seriesName && annotation.x == x) {
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
SENSORSTATE.prototype.editAnnotation = function(seriesName, x, annotationText) {
	//loop through all the annotations
	for(var i=0; i<this.annotationArray.length; i++) {
		//get an annotation
		var annotation = this.annotationArray[i];
		
		//check if the series name and data index match
		if(annotation.seriesName == seriesName && annotation.x == x) {
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
SENSORSTATE.prototype.getAnnotationsHtml = function() {
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

/**
 * Adds an element into the prediction array
 * @param x the x value of the point
 * @param y the y value of the point
 */
SENSORSTATE.prototype.predictionReceived = function(x, y, doSort) {
	//remove any existing point with the same x value
	for(var i=0; i<this.predictionArray.length; i++) {
		var predictionPoint = this.predictionArray[i];
		
		if(predictionPoint.x == x) {
			this.predictionArray.splice(i, 1);
			break;
		}
	}
	
	//create an object that contains the x, y points
	var predictionData = {
			x: x,
			y: y
	};

	//add the element to the array
	this.predictionArray.push(predictionData);
	
	if (typeof doSort == "undefined" || doSort){
		//sort the array by the x value
		this.predictionArray.sort(this.sortPredictionArray);
	}
};

/**
 * Adds an element into the prediction array
 * @param x the x value of the point
 * @param y the y value of the point
 */
SENSORSTATE.prototype.predictionUpdateByX = function(x, y) {
	var predictionFound = false;
	//remove any existing point with the same x value
	for(var i=0; i<this.predictionArray.length; i++) {
		var predictionPoint = this.predictionArray[i];
		
		if(predictionPoint.x == x) {
			this.predictionArray[i].y = y;
			predictionFound = true;
			break;
		}
	}
	return predictionFound;
};

/**
 * Remove the element with the given index from the prediction array
 * @param index the index to remove
 */
SENSORSTATE.prototype.predictionRemoved = function(index) {
	this.predictionArray.splice(index, 1);
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
SENSORSTATE.prototype.sortPredictionArray = function(point1, point2) {
	return point1.x - point2.x;
};

/**
 * Remove the sensor annotations from the annotation array
 */
SENSORSTATE.prototype.removeSensorAnnotations = function() {
	//loop through all the annotations
	for(var x=0; x<this.annotationArray.length; x++) {
		var annotation = this.annotationArray[x];
		
		if(annotation.seriesName.indexOf("prediction") == -1) {
			//the annotation is not a prediction annotation so we will remove it
			this.annotationArray.splice(x, 1);
			x--;
		}
	}
};

/**
 * Remove the prediction annotations from the annotation array
 * @return
 */
SENSORSTATE.prototype.removePredictionAnnotations = function() {
	//loop through all the annotations
	for(var x=0; x<this.annotationArray.length; x++) {
		var annotation = this.annotationArray[x];
		
		if(annotation.seriesName.indexOf("prediction") != -1) {
			//the annotation is a prediction annotation so we will remove it
			this.annotationArray.splice(x, 1);
			x--;
		}
	}
};

/**
 * Get a copy of this sensor state
 * @return a new sensor state object that is a copy of this sensor state object
 */
SENSORSTATE.prototype.getCopy = function() {
	//make a json object copy
	var sensorStateCopyJSONObj = JSON.parse(JSON.stringify(this));
	
	//parse the json object into a sensor state object
	var sensorStateCopy = this.parseDataJSONObj(sensorStateCopyJSONObj);
	
	return sensorStateCopy;
};

/**
 * Copy the values in the populatedState into the emptyState
 * @param populatedState a SENSORSTATE object with populated fields
 * @param emptyState a SENSORSTATE object with empty fields
 */
SENSORSTATE.prototype.copyState = function(populatedState, emptyState) {
	//make a json object copy
	var sensorStateCopyJSONObj = JSON.parse(JSON.stringify(populatedState));
	
	//copy the fields into the empty sensor state object
	this.parseDataJSONObj(sensorStateCopyJSONObj, emptyState);
};

/**
 * Remove the data point from the prediction array
 * @param seriesName the name of the series/line
 * @param dataIndex the index within the prediction array to remove
 */
SENSORSTATE.prototype.removePredictionPoint = function(seriesName, dataIndex) {
	//remove the element at the given index
	this.predictionArray.splice(dataIndex, 1);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/sensor/sensorstate.js');
}