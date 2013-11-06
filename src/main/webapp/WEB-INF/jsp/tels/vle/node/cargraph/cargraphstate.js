/**
 * The constructor for the cargraph state
 * @constructor
 * @param response the text response the student typed
 * @param annotationArray an array containing objects that represent annotations
 * for points on the graph 
 * @param timestamp the time the cargraph state was created
 * @param xMin the min x value
 * @param xMax the max x value
 * @param yMin the min y value
 * @param yMax the max y value
 * 
 * example of what a state looks like: 
 * {
 *   "response":"",
 *   "annotationArray":[
 *     {"seriesName":"greenCar","dataIndex":3,"dataText":"0.18 min, 14.94 km","annotationText":"green .18 min.","x":0.18,"y":14.94},
 *     {"seriesName":"yellowCar","dataIndex":8,"dataText":"0.4 min, 7.04 km","annotationText":"yellow .4 min","x":0.4,"y":7.04}
 *   ]
 *   "predictionArray":[
 *     {"id":"greenCar","predictions":[{"x":0,"y":11.03},{"x":0.01,"y":12.35},{"x":0.02,"y":14.72},{"x":0.03,"y":15.82},{"y":16.27,"x":0.04},{"x":0.06,"y":8.15},{"x":0.12,"y":12.94},{"y":10.73,"x":0.13},{"x":0.17,"y":15.82},{"x":0.18,"y":16.41},{"x":0.45,"y":1.65},{"x":0.47,"y":2.98},{"x":0.48,"y":4.01},{"x":0.5,"y":5.34}]},
 *     {"id":"yellowCar","predictions":[{"x":0.07,"y":17.3},{"x":0.1,"y":14.57},{"x":0.25,"y":6.89},{"x":0.26,"y":6.15}
 *   ],
 *   "timestamp":1303406004861
 * }
 */
function CARGRAPHSTATE(response, annotationArray, predictionArray, timestamp, xMin, xMax, yMin, yMax, predictionLocked, xlabel, ylabel, observationArray) {
	//the text response the student wrote
	this.response = "";
	
	//an array of annotations the student has created
	this.annotationArray = [];
	
	//an array of prediction objects
	// [
	//	{id:"car1",predictions:[[0,1],[1,3],[2,5]]}, 
	//	{id:"car2",predictions:[[0,0],[1,5],[5,3]]}
	// ]
	this.predictionArray = [];
	
	if(response != null) {
		//set the response if it was provided to the constructor
		this.response = response;
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

	if (observationArray == null){
		this.observationArray = [];
	} else {
		this.observationArray = observationArray;
	}
};

/**
 * Creates a CARGRAPHSTATE object from the data in the JSON object
 * @param stateJSONObj a JSON object containing data for a CARGRAPHSTATE
 * @return a CARGRAPHSTATE object with the attributes populated
 */
CARGRAPHSTATE.prototype.parseDataJSONObj = function(stateJSONObj) {
	//get the student response
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

	var observationArray = typeof stateJSONObj.observationArray !== "undefined" ? stateJSONObj.observationArray : [];

	//create a CARGRAPHSTATE object
	var cargraphState = new CARGRAPHSTATE(response, annotationArray, predictionArray, timestamp, xMin, xMax, yMin, yMax, predictionLocked, xlabel, ylabel, observationArray);
	
	return cargraphState;
};

/**
 * Clears the annotation array. This is called when the student
 * clicks the Clear button or when they re-collect new graph data.
 */
CARGRAPHSTATE.prototype.clearAnnotations = function() {
	//clear the cargraph data array by setting it to a new empty array
	this.annotationArray = [];
};

/**
 * Clears all the predictions in the prediction array.
 */
CARGRAPHSTATE.prototype.clearPredictions = function() {
	//clear the cargraph data array by setting it to a new empty array
	this.predictionArray = [];
};

/**
 * We will just return this CARGRAPHSTATE object as the student work
 * because it contains the cargraph data as well as the student response
 * @return the student work
 */
CARGRAPHSTATE.prototype.getStudentWork = function() {
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
CARGRAPHSTATE.prototype.getAnnotationBySeriesDataIndex = function(seriesName, dataIndex) {
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
CARGRAPHSTATE.prototype.getAnnotationBySeriesXValue = function(seriesName, x) {
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
CARGRAPHSTATE.prototype.addAnnotation = function(seriesName, dataIndex, x, y, dataText) {
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
CARGRAPHSTATE.prototype.deleteAnnotation = function(seriesName, x) {
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
CARGRAPHSTATE.prototype.editAnnotation = function(seriesName, x, annotationText) {
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
CARGRAPHSTATE.prototype.getAnnotationsHtml = function() {
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

CARGRAPHSTATE.prototype.getPredictionObjByPredictionId = function(predictionId) {
	for (var i=0; i < this.predictionArray.length; i++) {
		if (this.predictionArray[i].id == predictionId) {
			return this.predictionArray[i];
		}
	}
	return null;
};

CARGRAPHSTATE.prototype.setPredictionsForPredictionId = function(predictionId, predictionArray) {
	for (var i=0; i < this.predictionArray.length; i++) {
		if (this.predictionArray[i].id == predictionId) {
			this.predictionArray[i].predictions = predictionArray;
		}
	}
};

/**
 * Adds an element into the prediction array
 * @param x the x value of the point
 * @param y the y value of the point
 * @param doSort whether array should be sorted, or kept in order given
 */
CARGRAPHSTATE.prototype.predictionReceived = function(predictionId, x, y, doSort) {
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
CARGRAPHSTATE.prototype.predictionUpdateByX = function(predictionId, x, y) {
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
 * Remove the element with the given index from the prediction array
 * @param index the index to remove
 */
CARGRAPHSTATE.prototype.predictionRemoved = function(predictionId,index) {	
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
CARGRAPHSTATE.prototype.sortPredictionArray = function(point1, point2) {
	return point1.x - point2.x;
};

/**
 * Remove the prediction annotations from the annotation array
 * @return
 */
CARGRAPHSTATE.prototype.removePredictionAnnotations = function() {
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
 * Remove the data point from the prediction array
 * @param seriesName the name of the series/line
 * @param dataIndex the index within the prediction array to remove
 */
CARGRAPHSTATE.prototype.removePredictionPoint = function(seriesName, dataIndex) {
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

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/cargraph/cargraphstate.js');
};