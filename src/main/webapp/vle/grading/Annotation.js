/**
 * An object that represents one annotation. A comment by itself is considered
 * one annotation. The grade is also considered one annotation by itself. This
 * means if the teacher writes a comment and a grade, the teacher will be
 * creating two annotations.
 */

/**
 * Constructor
 */
function Annotation(runId, nodeId, toWorkgroup, fromWorkgroup, type, value, postTime, stepWorkId) {
	this.runId = runId;
	this.nodeId = nodeId; //the node/step related to this annotation
	this.toWorkgroup = toWorkgroup; //the id for the entity that wrote the work
	this.fromWorkgroup = fromWorkgroup; //the id for the entity that is writing feedback/grading
	this.type = type; //specifies the type of annotation
	this.value = value; //the feedback/grading
	this.postTime = postTime;
	this.stepWorkId = stepWorkId;
	
	try {
		this.value = JSON.parse(value);
	} catch(err) {
		
	}
}


/**
 * Converts an annotation JSON String into an Annotation object
 * @param annotationJSONString an annotation JSON string
 * @return a populated Annotation object
 */
Annotation.prototype.parseDataJSONString = function(annotationJSONString) {
	//convert the JSON string into a JSON object
	var annotationJSONObj = $.parseJSON(annotationJSONString);
	
	//convert the annotation JSON object into an Annotation object
	return Annotation.prototype.parseDataJSONObj(annotationJSONObj);
}


/**
 * Creates an Annotation object from an annotation JSON object
 * @param annotationJSONObj an annotation JSON object
 * @return an Annotation object
 */
Annotation.prototype.parseDataJSONObj = function(annotationJSONObj) {
	//create a new Annotation
	var annotation = new Annotation();
	
	//populate the fields of the Annotation object from the JSON object
	annotation.runId = annotationJSONObj.runId;
	annotation.nodeId = annotationJSONObj.nodeId;
	annotation.toWorkgroup = annotationJSONObj.toWorkgroup;
	annotation.fromWorkgroup = annotationJSONObj.fromWorkgroup;
	annotation.type = annotationJSONObj.type;
	annotation.value = annotationJSONObj.value;
	annotation.postTime = annotationJSONObj.postTime;
	annotation.stepWorkId = annotationJSONObj.stepWorkId;
	
	//only used when student retrieves flagged work
	if(annotationJSONObj.data) {
		annotation.data = NODE_VISIT.prototype.parseDataJSONObj(annotationJSONObj.data);	
	}
	
	//only used when student retrieves flagged work
	if(annotationJSONObj.annotationComment) {
		annotation.annotationComment = Annotation.prototype.parseDataJSONObj(annotationJSONObj.annotationComment);
	}
	
	try {
		annotation.value = JSON.parse(annotationJSONObj.value);
	} catch(err) {
		
	}
	
	//return the Annotation
	return annotation;
}


//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/grading/Annotation.js');
};