/**
 * @constructor
 * @param args
 * @returns
 */
function ASSESSMENTLISTSTATE(args) {
	this.type = "assessmentlist";
	this.submit = false;
	this.assessments = new Array();

	//use the current time or the argument timestamp passed in
	if(args){
		if(args[0]){
			this.timestamp = args[0];
		};
		
		if(args[1]){
			this.choices = args[1];
		};
	};
	
	if(!this.timestamp){
		this.timestamp = new Date().getTime();
	};
	
};

/**
 * Takes in a state JSON object and returns an ASSESSMENTLISTSTATE object
 * @param stateJSONObj a state JSON object
 * @return an ASSESSMENTLISTSTATE object
 */
ASSESSMENTLISTSTATE.prototype.parseDataJSONObj = function(stateJSONObj) {
	//create a new ASSESSMENTLISTSTATE object
	var alState = new ASSESSMENTLISTSTATE();
	
	//set the attributes of the ASSESSMENTLISTSTATE object
	alState.assessments = stateJSONObj.assessments;
	alState.timestamp = stateJSONObj.timestamp;
	alState.submit = stateJSONObj.submit;
	alState.isSubmit = stateJSONObj.isSubmit;
	alState.locked = stateJSONObj.locked;
	
	//return the MCSTATE object
	return alState;
};

/**
 * Returns the human readable student's answer
 * @param showAutoScoreResult whether to show the auto score result
 * @param isLockAfterSubmit whether the step locks after submit
 * @return a string containing the human readable answer
 */
ASSESSMENTLISTSTATE.prototype.getStudentWorkString = function(showAutoScoreResult, isLockAfterSubmit) {
	var studentWorkSoFar = "";
	var autoScoreTotalScore = 0;   // total auto scored points the student earned
	var autoScoreTotalMaxScore = 0;   // total auto scored points possible
	
	//check if there were any responses
	if(this.assessments) {
		//loop through the array of assessments
		for(var x=0; x<this.assessments.length; x++) {
			if(studentWorkSoFar != "") {
				//separate each response
				studentWorkSoFar += "<br/><br/>";
			}
			
			//add the response to the student work
			studentWorkSoFar += "Part " + (x+1) + ": <br/>";
			var assessment = this.assessments[x];

			if (assessment.type && assessment.response) {
				if (assessment.type == "radio") {
					studentWorkSoFar += assessment.response.text;
					if (assessment.response.autoScoreResult && showAutoScoreResult) {
						// append results from auto score
						var autoScoreResult = assessment.response.autoScoreResult;
						studentWorkSoFar += "<br/>Auto Score Results:<br/>";
						if (autoScoreResult.isCorrect) {
							studentWorkSoFar += "Student got this question CORRECT";
						} else {
							studentWorkSoFar += "Student got this question INCORRECT";							
						}
						var studentScore = autoScoreResult.choiceScore ? autoScoreResult.choiceScore : 0;
						var maxScore = autoScoreResult.maxScore ? autoScoreResult.maxScore : 0;
						studentWorkSoFar += " and received ";
						studentWorkSoFar += studentScore;
						studentWorkSoFar += " points out of ";
						studentWorkSoFar += maxScore;
						
						// update total scores
						autoScoreTotalScore += studentScore;
						autoScoreTotalMaxScore += maxScore;
					}
				} else if (assessment.type == "text") {
					studentWorkSoFar += assessment.response.text;
				}
			}
		}
	}
	
	// append autoScore result summary at the end, if request
	if (showAutoScoreResult && autoScoreTotalMaxScore > 0) {
		studentWorkSoFar += "<br/><br/>";
		studentWorkSoFar += "Auto Score Results Summary: ";
		studentWorkSoFar += "Student got " + autoScoreTotalScore + " points out of " + autoScoreTotalMaxScore;
	}
	
	var isSubmit = this.isSubmit;
	
	if(isLockAfterSubmit) {
		/*
		 * this is a lock after submit step so we will display whether
		 * this node state was a submit
		 */
		studentWorkSoFar += "<br/><br/>";
		studentWorkSoFar += "Is Submit: " + isSubmit;
	}
	
	return studentWorkSoFar;
};

/**
 * Get this assessmentlist state
 * @returns this assessmentlist state
 */
ASSESSMENTLISTSTATE.prototype.getStudentWork = function() {
	return this;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/assessmentlist/assessmentliststate.js');
};