/**
 * Node specific helpers
 */

function removeClassFromElement(identifier, classString) {
	$('#' + identifier).removeClass(classString);
};

function addClassToElement(identifier, classString) {
	$('#' + identifier).addClass(classString);
};

/**
 * returns true iff element with specified identifier has 
 * a class classString
 * @param identifier
 * @param classString
 * @return
 */
function hasClass(identifier, classString) {
	return $('#' + identifier).hasClass(classString);
};

/**
 * Get the table that will display the possible scores and highlight 
 * the current possible score
 * @param numAttempts the current attempt number
 */
function getCurrentPossibleScoreTable(numAttempts, scores) {
	if(numAttempts == 0) {
		/*
		 * if this is the first attempt, the number of attempts will
		 * be 0 so we will just set this to 1 so that the table highlights
		 * the first possible score
		 */
		numAttempts = 1;
	}
	
	var currentPossibleScoreHtml = "";
	
	//create the table that will hold the "Current Possible Score:" text and another table
	currentPossibleScoreHtml += "<table align='center'>";
	currentPossibleScoreHtml += "<tr>";
	
	//display the current possible score text
	currentPossibleScoreHtml += "<td data-i18n='current_possible_score'>Current Possible Score:</td>";
	
	currentPossibleScoreHtml += "<td>";
	//create the table that will hold the possible scores
	currentPossibleScoreHtml += "<table border='1' style='border-collapse:collapse;border-color:black'>";
	currentPossibleScoreHtml += "<tr>";
	
	var hasMoreScores = true;
	var attemptCounter = 1;
	
	//loop through all the possible scores
	while(hasMoreScores) {
		//get the possible score for the current attempt counter
		var scoreForAttempt = scores[attemptCounter];
		
		if(scoreForAttempt != null) {
			
			currentPossibleScoreHtml += "<td width='25' align='center'";
			
			if(attemptCounter == numAttempts) {
				/*
				 * if this is the current attempt the student is on
				 * make the background light green
				 */
				currentPossibleScoreHtml += " style='background-color:lightgreen'";
			} else if(attemptCounter < numAttempts) {
				/*
				 * if the student has incorrectly answered on this
				 * attempt number, make the background grey
				 */
				currentPossibleScoreHtml += " style='background-color:grey'";
			}
			
			currentPossibleScoreHtml += ">";
			
			//display the current possible score for the current attempt counter
			currentPossibleScoreHtml += scoreForAttempt;			
			currentPossibleScoreHtml += "</td>";
			
			attemptCounter++;
		} else {
			hasMoreScores = false;
		}
	}
	
	currentPossibleScoreHtml += "</tr>";
	currentPossibleScoreHtml += "</table>";
	currentPossibleScoreHtml += "</td>";
	
	currentPossibleScoreHtml += "</tr>";
	currentPossibleScoreHtml += "</table>";
	
	return currentPossibleScoreHtml;
};

/**
 * Check if scores have been set
 * @param content the content for the step, we need this
 * because we need to check 
 * @returns whether scores have been set
 */
function challengeScoringEnabled(scores) {
	var enabled = false;
	
	if(scores != null) {
		//get the JSON string for the scores object
		var scoresJSONString = JSON.stringify(scores);
		
		//check if the scores object is empty
		if(scoresJSONString != "{}") {
			//scores object is not empty
			enabled = true;
		}
	}
	
	return enabled;
};

/**
 * Get the score given the number attempts the students has made
 * @param numAttempts
 * @param content
 * @return the score for the student depending on the number attempts
 * they have made
 */
function getCurrentScore(numAttempts, scores) {
	var score = 0;
	
	if(scores != null) {
		//check if there is a score set for the given number of attempts
		if(scores[numAttempts] != null) {
			//get the score
			score = scores[numAttempts];
		}
	}
	
	return score;
};

/**
 * Get the max score
 * @param scores an object of scores with attempt number
 * being the key and score being the value
 * e.g.
 * {
 *    1:10,
 *    2:5,
 *    3:1
 * }
 * @returns the highest score
 */
function getMaxScore(scores) {
	var maxScore = null;
	
	if(scores != null) {
		/*
		 * loop through all the attributes in the scores object
		 * each attribute is the attempt number and the value is
		 * the score. theoretically the max score will always be
		 * attempNum 1.
		 * {
		 *    1:10,
		 *    2:5,
		 *    3:1
		 * }
		 */
		for(var attemptNum in scores) {
			//get a score
			var score = scores[attemptNum];
			
			//make sure the score is a number
			var scoreValue = parseFloat(score);
			
			if(!isNaN(score)) {
				//score is a number
				
				//compare the score with the maxScore so far
				if(score > maxScore) {
					//set the new max score
					maxScore = score;
				}
			}
		}
	}
	
	return maxScore;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/common/nodehelpers.js');
}