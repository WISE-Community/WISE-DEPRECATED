//functions that you have access to
//console.print() - print to the console (disabled in the release version)
//getQuestionIndex():int - return the current question index
//setQuestionIndex(int):void - set the question index to ask next
//getQuestionAsked():Array - return an array of booleans saying whether or not the question at that index has been asked or not
//getQuestionDifficulty():Array - return an array of ints with the difficulty of the question at that index
//getPlayerRating():int - current player rating
//getPreviousPlayerRating():int - previous player rating
//getBucketIndex():int - 0-4 the bucket index players fall in

var questionIndex:int = getQuestionIndex();
var questionAsked:Array = getQuestionAsked();
var questionDifficulty:Array = getQuestionDifficulty();
var playerRating:int = getPlayerRating();
var previousPlayerRating:int = getPreviousPlayerRating();
var bucketIndex:int = getBucketIndex();
var numQuestionsAsked:int = getNumQuestionsAsked();
var maxQuestionsToAsk:int = getMaxQuestionsToAsk();
var nextQuestionIndex:int = 0;

switch(bucketIndex) {
	case 0:
	nextQuestionIndex = randomQuestionSelector(questionAsked,numQuestionsAsked,maxQuestionsToAsk);
	break;
	case 1:
	nextQuestionIndex = randomQuestionSelector(questionAsked,numQuestionsAsked,maxQuestionsToAsk);
	break;
	case 2:
	nextQuestionIndex = randomQuestionSelector(questionAsked,numQuestionsAsked,maxQuestionsToAsk);
	break;
	case 3:
	nextQuestionIndex = randomQuestionSelector(questionAsked,numQuestionsAsked,maxQuestionsToAsk);
	break;
	case 4:
	nextQuestionIndex = randomQuestionSelector(questionAsked,numQuestionsAsked,maxQuestionsToAsk);
	break;
	default:
	break;
}

setQuestionIndex(nextQuestionIndex);


//a function to search through the question list and find the next question
//@playerRating: the current player rating
//@questionAsked: an array detailing if each question is asked or not
//@comparisonCode: either -1,0, or 1 detailing what kind of algorithm shuold be used to get to the next question
//-1 means find the uncompleted question that is easier than the players rating but closest to it
//0 means find the next uncompleted question
//1 means find the next uncompleted question that is more difficult than the players rating
//@questionDifficulty: array of numbers representing question difficulty 
//@return: an index into the question list [0 to questionAsked.length-1]
function findNextAvailableQuestion(playerRating:int,questionAsked:Array,questionDifficulty:Array,comparisonCode):int {
	if(comparisonCode >= 0) {
		for(var i=0;i<questionAsked.length;i++) {
			if(!questionAsked[i] && (comparisonCode == 0 || (comparisonCode > 0 && playerRating < questionDifficulty[i]) ) ) {
				return i;
			}
		}
	}
	else {
		var leastEasierQuestion = -1;
		
		for(i=0;i<questionAsked.length;i++) {
			if(!questionAsked[i] && playerRating > questionDifficulty[i] && (leastEasierQuestion < 0 || questionDifficulty[i] > questionDifficulty[leastEasierQuestion]) ) {
				leastEasierQuestion = i;
			}			
		}
		
		return leastEasierQuestion = i;
	}
	return -1;
}

//return a random index into the question list
//only choose a question that hasn't already been played
function randomQuestionSelector(questionAsked,numQuestionsAsked,maxQuestionsToAsk) {
	var randomIndex:int;
	
	var numQuestionsLeft:int = 0;
	
	//first check that not all questions have been asked
	for(var i:int =0;i<questionAsked.length;i++) {
		if(!questionAsked[i])
			numQuestionsLeft++;
	}
	
	if(numQuestionsLeft <= 0 || numQuestionsAsked >= maxQuestionsToAsk - 1)
		return questionAsked.length;
	
	do {
		randomIndex = Math.floor(Math.random()*questionAsked.length);	
	} while(questionAsked[randomIndex])
	
	return randomIndex;
}

//Determine the next question to be selected
//@numQuestionsAsked: the number of questions the player has recieved
//@playerRating: the current player rating
//@previousPlayerRating: the last recorded player rating
//@questionAsked: an array of booleans representing whether or not the question in list has been asked or not 
//@questionDifficulty: array of numbers representing question difficulty 
//@return: an index into the question list [0 to question.length-1]
function adaptiveQuestionSelector(numQuestionsAsked:int,playerRating:int,previousPlayerRating:int,questionAked:Array,questionDifficulty:Array):int {
	var nextAvailableNormal:int = findNextAvailableQuestion(playerRating,questionAsked,questionDifficulty,0);
	var nextAvailableHard:int = findNextAvailableQuestion(playerRating,questionAsked,questionDifficulty,1);
	var nextAvailableEasy:int = findNextAvailableQuestion(playerRating,questionAsked,questionDifficulty,-1);	

	if(numQuestionsAsked < 5) {
		if(nextAvailableNormal > -1)
			return nextAvailableNormal;
	}
	else {
		if(playerRating >= previousPlayerRating) {
			if(nextAvailableHard > -1)
				return nextAvailableHard;
			if(nextAvailableNormal > -1)
				return nextAvailableNormal;
		}
		else {
			if(nextAvailableEasy > -1)
				return nextAvailableEasy;
			if(nextAvailableNormal > -1)
				return nextAvailableNormal;
		}
	}
	return -1;
}
