
SensorNode.prototype = new Node();
SensorNode.prototype.constructor = SensorNode;
SensorNode.prototype.parentNode = Node.prototype;
SensorNode.authoringToolName = "Graph/Sensor";
SensorNode.authoringToolDescription = "Students plot points on a graph and can use a USB probe to collect data";
SensorNode.prototype.i18nEnabled = true;
SensorNode.prototype.i18nPath = "vle/node/sensor/i18n/";
SensorNode.prototype.supportedLocales = {
	"en":"en",
    "el":"el",
	"es":"es",
	"iw":"he",
	"nl":"nl",
	"nl_GE":"nl",
	"nl_DE":"nl",
	"tr":"tr",
	"zh_CN":"zh_CN",
    "zh_TW":"zh_TW"
};

SensorNode.tagMapFunctions = [
	{functionName:'importWork', functionArgs:[]},
	{functionName:'showPreviousWork', functionArgs:[]},
	{functionName:'mustSpanDomainBeforeAdvancing', functionArgs:[]}
];

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {SensorNode}
 */
function SensorNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
	
	this.tagMapFunctions = this.tagMapFunctions.concat(SensorNode.tagMapFunctions);
}

SensorNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	return SENSORSTATE.prototype.parseDataJSONObj(stateJSONObj);
};

SensorNode.prototype.translateStudentWork = function(studentWork) {
	return studentWork;
};

SensorNode.prototype.onExit = function() {
	try {
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
 * Renders the student work into the div
 * @param displayStudentWorkDiv the div we will render the student work into
 * @param nodeVisit the student work
 * @param childDivIdPrefix (optional) a string that will be prepended to all the 
 * div ids use this to prevent DOM conflicts such as when the show all work div
 * uses the same ids as the show flagged work div
 * @param workgroupId the id of the workgroup this work belongs to
 */
SensorNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	//create a SENSOR object that we will use to perform all the graphing logic for us
	var sensor = new SENSOR(this, this.view);
	
	if(childDivIdPrefix == null) {
		//the default child div id prefix will be "" if none is provided
		childDivIdPrefix = "";
	}
	
	//get the step work id from the node visit
	var stepWorkId = nodeVisit.id;
	
	if(stepWorkId == null) {
		stepWorkId = '';
	}
	
	/*
	 * get the student work, in this case the student work is
	 * the sensor state
	 */
	var sensorState = nodeVisit.getLatestWork();
	
	//set the sensor state into our sensor object
	sensor.sensorState = sensorState;
	
	/*
	 * get the data array from the sensor state in the format
	 * that we can send to flot
	 */
	var graphDataArray = sensor.generateGraphDataArray(sensorState);
	
	//get the graph parameters from the content
	var graphParams = sensor.parseGraphParams(this.content.getContentJSON().graphParams);

	//create the sensor graph div that we will use to display the graph
	var sensorGraphDiv = createElement(document, 'div', {id: childDivIdPrefix + 'sensorGraphDiv_' + stepWorkId, style:'width:400px;height:200px;'});
	
	//create the div that will display the check boxes to filter the lines (if this graph has multiple lines, if not, this will be empty)
	var sensorGraphCheckBoxesDiv = createElement(document, 'div', {id: childDivIdPrefix + 'sensorGraphCheckBoxesDiv_' + stepWorkId});
	
	//create the div that will display the student annotations for the graph
	var sensorAnnotationsDiv = createElement(document, 'div', {id: childDivIdPrefix + 'sensorAnnotationsDiv_' + stepWorkId});
	
	//create the response div that we will use to display what the student typed
	var sensorResponseDiv = createElement(document, 'div', {id: childDivIdPrefix + 'sensorResponseDiv_' + stepWorkId});
	
	//add all the divs to the main work div 
	displayStudentWorkDiv.append(sensorGraphDiv);
	displayStudentWorkDiv.append(sensorGraphCheckBoxesDiv);
	displayStudentWorkDiv.append(sensorAnnotationsDiv);
	displayStudentWorkDiv.append(sensorResponseDiv);
	
	//plot the graph in the sensor graph div
	sensor.plotData($(sensorGraphDiv), $(sensorGraphCheckBoxesDiv));
	
	/*
	 * used to hide or show the annotation tool tips. if the teacher has
	 * their mouse in the graph div we will hide the annotation tool tips
	 * so that they don't block them from viewing the plot points.
	 * when the mouse cursor is outside of the graph div we will show the
	 * annotation tool tips for them to view.
	 */
	$(sensorGraphDiv).bind('mouseover', (function(event) {
		$(".activeAnnotationToolTip").hide();
	}));
	$(sensorGraphDiv).bind('mouseleave', (function(event) {
		$(".activeAnnotationToolTip").show();
	}));
	
	//get the annotations as a string
	var annotationsHtml = sensorState.getAnnotationsHtml();
	
	//set the annotations text
	$(sensorAnnotationsDiv).html(annotationsHtml);
	
	//get the student response that was typed
	var response = sensorState.response;
	
	//replace \n with <br> so that the line breaks are displayed for the teacher
	response = this.view.replaceSlashNWithBR(response);
	
	//insert the response the student typed
	$(sensorResponseDiv).html(response);
};

/**
 * Get the tag map functions that are available for this step type
 */
SensorNode.prototype.getTagMapFunctions = function() {
	//get all the tag map function for this step type
	var tagMapFunctions = SensorNode.tagMapFunctions;
	
	return tagMapFunctions;
};

/**
 * Get a tag map function given the function name
 * @param functionName
 * @return 
 */
SensorNode.prototype.getTagMapFunctionByName = function(functionName) {
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
SensorNode.prototype.overridesIsCompleted = function() {
	return true;
};

/**
 * Override of Node.isCompleted
 * Get whether the step is completed or not
 * @return a boolean value whether the step is completed or not
 */
SensorNode.prototype.isCompleted = function(nodeVisits) {
	var sensorState = this.view.getLatestNodeStateWithWorkFromNodeVisits(nodeVisits);
	
	if (typeof this.tagMaps == "undefined") return true;
	if (typeof sensorState === "undefined") sensorState = this.view.getState().getLatestWorkByNodeId(this.id);
	// cycle through tag maps, if I get a custom tag map check student work to complete
	var isCompleted = true;
	for (var i = 0; i < this.tagMaps.length; i++){
		var functionName = this.tagMaps[i].functionName;
		var functionArgs = this.tagMaps[i].functionArgs;
		if (functionName == "mustSpanDomainBeforeAdvancing"){
			if (sensorState != "" && sensorState.predictionArray.length > 0 ){
				var predictions = sensorState.predictionArray;
				var foundMin = false;
				var foundMax = false;
				for (var i=0; i < predictions.length; i++){
					var p = predictions[i];
					var objJson = this.content.getContentJSON();
					if (typeof sensorState.xMin != "undefined" && sensorState.xMin != "" && !isNaN(Number(sensorState.xMin)) && typeof sensorState.xMax != "undefined" && sensorState.xMax != "" && !isNaN(Number(sensorState.xMax))){
						if (p.x <= parseFloat(sensorState.xMin)) foundMin = true;
						if (p.x >= parseFloat(sensorState.xMax)) foundMax = true;
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

SensorNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/sensor/sensor.html');
};

/**
 * Returns whether this step type can be special exported
 * @return a boolean value
 */
SensorNode.prototype.canSpecialExport = function() {
	return true;
};

NodeFactory.addNode('SensorNode', SensorNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/sensor/SensorNode.js');
};