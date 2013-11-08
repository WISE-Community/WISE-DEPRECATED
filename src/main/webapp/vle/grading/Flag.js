/**
 * Represents a teacher flagging a specific revision of student work for
 * a specific step
 */

/**
 * Constructor 
 * @param runId
 * @param nodeId
 * @param toWorkgroup
 * @param fromWorkgroup
 * @param studentWork
 * @param postTime
 * @return
 */
function Flag(runId, nodeId, toWorkgroup, fromWorkgroup, studentWork, postTime) {
	this.runId = runId;
	this.nodeId = nodeId; //the node/step related to this annotation
	this.toWorkgroup = toWorkgroup; //the id for the entity that wrote the work
	this.fromWorkgroup = fromWorkgroup; //the id for the entity that is writing feedback/grading
	this.studentWork = studentWork; //the feedback/grading
	this.postTime = postTime;
}


/**
 * Takes an xml object and creates a Flag object
 * @param flagXML an xml object
 * @return a Flag object
 */
Flag.prototype.parseDataXML = function(flagXML) {
	var flag = new Flag();
	
	//populate the fields from the xml object
	try {
		flag.runId = flagXML.getElementsByTagName("runId")[0].firstChild.nodeValue;
	} catch(err) {
		flag.runId = "";
	}
	
	try {
		flag.nodeId = flagXML.getElementsByTagName("nodeId")[0].firstChild.nodeValue;
	} catch(err) {
		flag.nodeId = "";
	}
	
	try {
		flag.toWorkgroup = flagXML.getElementsByTagName("toWorkgroup")[0].firstChild.nodeValue;
	} catch(err) {
		flag.toWorkgroup = "";
	}
	
	try {
		flag.fromWorkgroup = flagXML.getElementsByTagName("fromWorkgroup")[0].firstChild.nodeValue;
	} catch(err) {
		flag.fromWorkgroup = "";
	}
	
	try {
		flag.studentWork = flagXML.getElementsByTagName("studentWork")[0].firstChild.nodeValue;
	} catch(err) {
		flag.studentWork = "";
	}
	
	//annotation.postTime = annotationXML.getElementsByTagName("postTime")[0].firstChild.nodeValue;
	
	return flag;
}

/**
 * Converts a flag JSON string to a Flag object
 * @param flagJSONString a flag JSON string
 * @return a populated Flag object
 */
Flag.prototype.parseDataJSONString = function(flagJSONString) {
	//convert the JSON string to a JSON object
	var flagJSONObj = $.parseJSON(flagJSONString);
	
	//convert the flag JSON object to a Flag object
	return Flag.prototype.parseDataJSONObject(flagJSONObj);
}

/**
 * Converts a flag JSON object into a Flag object
 * @param flagJSONObj a flag JSON object
 * @return a populated Flag object
 */
Flag.prototype.parseDataJSONObject = function(flagJSONObj) {
	//create a new Flag object
	var flag = new Flag();
	
	//populate the fields from the JSON object
	flag.runId = flagJSONObj.runId;
	flag.nodeId = flagJSONObj.nodeId;
	flag.toWorkgroup = flagJSONObj.toWorkgroup;
	flag.fromWorkgroup = flagJSONObj.fromWorkgroup;
	flag.studentWork = flagJSONObj.studentWork;
	flag.postTime = flagJSONObj.postTime;
	
	//return the Flag
	return flag;
}

/**
 * Creates the xml string version of the Flag object
 * @return an xml string representing the Flag object
 */
Flag.prototype.getDataXML = function() {
	var dataXML = "";
	
	dataXML += "<annotationEntry>";
	dataXML += "<runId>" + this.runId + "</runId>";
	dataXML += "<nodeId>" + this.nodeId + "</nodeId>";
	dataXML += "<toWorkgroup>" + this.toWorkgroup + "</toWorkgroup>";
	dataXML += "<fromWorkgroup>" + this.fromWorkgroup + "</fromWorkgroup>";
	dataXML += "<value>" + this.studentWork + "</value>";
	dataXML += "<type>flag</type>";
	dataXML += "</annotationEntry>";
	
	return dataXML;
}

//used to notify scriptloader that this script has finished loading
scriptloader.scriptAvailable(scriptloader.baseUrl + "vle/grading/Flag.js");