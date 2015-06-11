/**
 * Util functions for the authoring view
 * 
 * @author patrick lawler
 */
/**
 * Returns the content base from the given full url to a file.
 */
View.prototype.utils.getContentBaseFromFullUrl = function(url){
	if(url.indexOf('\\')!=-1){
		return url.substring(0, url.lastIndexOf('\\'));
	} else {
		return url.substring(0, url.lastIndexOf('/'));
	};
};

/**
 * Attempts to set the correct selected option in a select element
 * with the given id that has the given value.
 */
View.prototype.utils.setSelectedValueById = function(id, value){
	var select = document.getElementById(id);
	if(select && value){
		for(var a=0;a<select.options.length;a++){
			if(select.options[a].value == value){
				select.selectedIndex = a;
			};
		};
	};
};


/**
 * If the given string is undefined, null or false, returns an empty
 * string, otherwise, returns the given string.
 */
View.prototype.utils.resolveNullToEmptyString = function(str){
	if(str == null || str == 'null'){
		return '';
	};
	
	return str;
};

/**
 * Returns the path separator used by the given url.
 */
View.prototype.utils.getSeparator = function(url){
	if(url.indexOf('\\')!=-1){
		return '\\';
	} else {
		return '/';
	};
};

/**
 * Given a nodeId, removes associated node content file from server.
 */
View.prototype.utils.removeNodeFileFromServer = function(view, nodeId){
	var filename = view.getProject().getNodeFilename(nodeId);
	
	var callback = function(text, xml, o){
		if(text!='success'){
			o.notificationManager.notify('failed request to remove file: ' + filename + '  from the server', 3);
		};
	};

	if(filename){
		view.connectionManager.request('POST', 1, view.requestUrl, {forward:'filemanager', projectId:view.portalProjectId, command: 'removeFile', projectPath: this.getContentPath(view.authoringBaseUrl,view.getProject().getContentBase()), fileName: filename}, callback, view);
	};
};

/**
 * Returns the corresponding todo filename for the currently opened project.
 */
View.prototype.utils.getTODOFilename = function(projectFilename){
	if(projectFilename.indexOf('.project.json')!=-1){
		/* this is a raw project file */
		return projectFilename.replace('.project.json','.todo.text');
	} else {
		/* this is a versioned project file */
		return projectFilename.replace(/\.project\.(.*)\.json/,'.todo.$1.text');
	};
};

/**
 * Returns the corresponding project meta filename for the currently opened project.
 */
View.prototype.utils.getProjectMetaFilename = function(projectFilename){
	if(projectFilename.indexOf('.project.json')!=-1){
		/* this is raw project file */
		return projectFilename.replace('.project.json','.project-meta.json');
	} else {
		/* this is a versioned project file */
		return projectFilename.replace(/\.project\.(.*)\.json/, '.project-meta.$1.json');
	};
};

/**
 * Hides all nodes in the project
 */
View.prototype.utils.hideNodes = function(){
	//$('.projectNode.node').parent().parent().addClass('hidden');
	$('#hideNodesBtn').addClass('hidden');
	$('#showNodesBtn').removeClass('hidden');
	$('#showNodesBtn').removeAttr('disabled');
	$('.projectNode.node').parent().parent().fadeOut();
};

/**
 * Shows all nodes in the project
 */
View.prototype.utils.unhideNodes = function(){
	//$('.projectNode.node').parent().parent().removeClass('hidden');
	$('#showNodesBtn').addClass('hidden');
	$('#hideNodesBtn').removeClass('hidden');
	$('#hideNodesBtn').removeAttr('disabled');
	$('.projectNode.node').parent().parent().fadeIn();
};

/**
 * On browser resize, sets the authoringContainer to fit the remaining height of the browser window
 */
View.prototype.utils.resize = function(){
	var height = $(window).height()-($('#authorHeader').height()+$('#currentProjectContainer').height()+$('#projectTools').height()+46);
	$('#authoringContainer').height(height);
};

/*
 * Returns the current view mode (student, grading, authoring, etc.)
 */
View.prototype.getMode = function() {
	var mode = this.config.getConfigParam('mode');
	return mode;
};


// add indexOf functionality to js in ie6 and ie7
if (!Array.prototype.indexOf)  
{  
  Array.prototype.indexOf = function(elt /*, from*/)  
  {  
    var len = this.length >>> 0;  
  
    var from = Number(arguments[1]) || 0;  
    from = (from < 0)  
         ? Math.ceil(from)  
         : Math.floor(from);  
    if (from < 0)  
      from += len;  
  
    for (; from < len; from++)  
    {  
      if (from in this &&  
          this[from] === elt)  
        return from;  
    }  
    return -1;  
  };  
};

/**
 * returns a <br> element
 */
function createBreak(){
	return createElement(document, 'br', null);
};



/**
 * Make a CRater verify request for the given item id
 * @param itemId the item id to verify
 * @param cRaterItemType the type of CRater {CRATER,HENRY} to verify
 */
View.prototype.makeCRaterVerifyRequest = function(itemId,cRaterItemType) {
	//get the url to our servlet that will make the request to the CRater server for us
	var cRaterRequestURL = this.config.getConfigParam('cRaterRequestURL');
	
	var requestArgs = {
		cRaterRequestType:'verify',
		itemId:itemId,
		cRaterItemType:cRaterItemType
	};
	
	var responseText = this.connectionManager.request('GET', 1, cRaterRequestURL, requestArgs, this.makeCRaterVerifyRequestCallback, {vle:this}, this.makeCRaterVerifyRequestCallbackFail, true);
};

/**
 * The success callback function when making a CRater verify request
 * @param responseText
 * @param responseXML
 * @param args
 * @returns
 */
View.prototype.makeCRaterVerifyRequestCallback = function(responseText, responseXML, args) {
	var vle = args.vle;
	
	//remember the response text in a variable in the vle so we can access it later
	vle.cRaterResponseText = responseText;
};

/**
 * The fail callback function when making a CRater verify request
 * @param responseText
 * @param args
 */
View.prototype.makeCRaterVerifyRequestCallbackFail = function(responseText, args) {
	alert('Error: CRater verify request failed');
};

/**
 * Check the xml response text to see if the item id is valid
 * @param responseText the xml response text
 * @returns whether the crater item is valid or not
 */
View.prototype.checkCRaterVerifyResponse = function(responseText) {
	var isValid = false;
	
	/*
	 * find the text that contains the avail field
	 * e.g. 
	 * <item id="Photo_Sun" avail="Y">
	 */
	var availMatch = responseText.match(/avail="(\w*)"/);
	
	
	if(availMatch != null && availMatch.length > 1) {
		/*
		 * check the match
		 * e.g.
		 * availMatch[0] = avail="Y"
		 * availMatch[1] = Y
		 */
		var availValue = availMatch[1];
		
		if(availValue != null && availValue == 'Y') {
			//item id is valid
			isValid = true;
		}
	}
	
	return isValid;
};

/**
 * Get the scoring rules from the crater item verification response xml
 * @param xml the string with the xml response text from the verify request 
 */
View.prototype.getCRaterScoringRulesFromXML = function(xml) {
	var cRaterScoringRules = [];
	var zeroScoreScoringRule = false;
	
	/*
	 * find all the scoring rule values
	 * e.g.
	 * <scoring_rules>
	 * <scoring_rule concepts="1-4" nummatches="4" rank="1" score="4"/>
	 * <scoring_rule concepts="1" nummatches="1" rank="2" score="3"/>
	 * <scoring_rule concepts="2-4" nummatches="3" rank="3" score="3"/>
	 * <scoring_rule concepts="2-4" nummatches="1" rank="4" score="2"/>
	 * <scoring_rule concepts="5" nummatches="1" rank="5" score="1"/>
	 * </scoring_rules>
	 */
	var scoringRules = xml.match(/scoring_rule.*"/g);
	
	if(scoringRules != null) {
		//loop through all the scoring rules
		for(var x=0; x<scoringRules.length; x++) {
			
			var currScoreRule = {};
			
			//get a concepts rule e.g. concepts="1-4"
			var scoringRule = scoringRules[x];
						
			//create a match to extract the concept value
			var conceptsMatch = scoringRule.match(/concepts="(.*?)"/);
			
			if(conceptsMatch != null && conceptsMatch.length > 1) {
				/*
				 * get the concepts
				 * conceptsMatch[0] = concepts="1-4"
				 * conceptsMatch[1] = 1-4
				 */
				var concepts = conceptsMatch[1];
				
				currScoreRule.concepts = concepts;
			}

			// create a match to extract the nummatches value
			var nummatchesMatch = scoringRule.match(/nummatches="(\d*)"/);
			
			if(nummatchesMatch != null && nummatchesMatch.length > 1) {
				/*
				 * get the nummatches
				 * nummatchesMatch[0] = nummatches="1"
				 * nummatchesMatch[1] = 1
				 */
				var nummatches = nummatchesMatch[1];
				
				currScoreRule.numMatches = nummatches;
			}
			
			
			//create a match to extract the rank value
			var rankMatch = scoringRule.match(/rank="(\d*)"/);
			
			if(rankMatch != null && rankMatch.length > 1) {
				/*
				 * get the rank
				 * rankMatch[0] = rank="1"
				 * rankMatch[1] = 1
				 */
				var rank = rankMatch[1];
				
				currScoreRule.rank = rank;
			}

			//create a match to extract the score value
			var scoreMatch = scoringRule.match(/score="(\d*)"/);
			
			if(scoreMatch != null && scoreMatch.length > 1) {
				/*
				 * get the score
				 * scoreMatch[0] = score="1"
				 * scoreMatch[1] = 1
				 */
				var score = scoreMatch[1];
				
				currScoreRule.score = score;
				
				if(score == 0) {
					//we have found a zero score scoring rule
					zeroScoreScoringRule = true;
				}
			}
			
			//set an array as the feedback. put an empty string into the array for the feedback. 
			currScoreRule.feedback = [this.createCRaterFeedbackTextObject()];
			
			//set the student action
			currScoreRule.studentAction = 'revise';
			
			cRaterScoringRules.push(currScoreRule);
		}
		
		if(!zeroScoreScoringRule) {
			//we did not find a zero score scoring rule so we will add one
			
			//create the scoring rule
			var zeroScoreRule = {};
			zeroScoreRule.concepts = "";
			zeroScoreRule.numMatches = "";
			zeroScoreRule.rank = "";
			zeroScoreRule.score = "0";
			zeroScoreRule.feedback = [this.createCRaterFeedbackTextObject()];
			zeroScoreRule.studentAction = "revise";
			
			//add the scoring rule to the array of scoring rules
			cRaterScoringRules.push(zeroScoreRule);
		}
	}
	
	return cRaterScoringRules;
};


/**
 * Create an object that we will put into the feedback array.
 * This object will contain the fields feedbackText and feedbackId.
 * @param feedbackText an optional argument that we will set the
 * feedback text to
 * @returns an object containing the fields feedbackText and feedbackid
 */
View.prototype.createCRaterFeedbackTextObject = function(feedbackText) {
	//generate a random alphanumeric value e.g. 7fEEeHE73R
	var feedbackId = this.utils.generateKey();
	
	if(feedbackText == null) {
		//set the default feedbackText value
		feedbackText = "";
	}
	
	//create the feedback object
	var feedbackObject = {
		feedbackText:feedbackText,
		feedbackId:feedbackId
	};
	
	return feedbackObject;
};

/**
 * Get the max score from the xml
 * @param xml the string with the xml response text from the verify request 
 */
View.prototype.getCRaterMaxScoreFromXML = function(xml) {
	var maxScore = null;
	
	/*
	 * find all the scoring rule values
	 * e.g.
	 * <scoring_rules>
	 * <scoring_rule concepts="1-4" nummatches="4" rank="1" score="4"/>
	 * <scoring_rule concepts="1" nummatches="1" rank="2" score="3"/>
	 * <scoring_rule concepts="2-4" nummatches="3" rank="3" score="3"/>
	 * <scoring_rule concepts="2-4" nummatches="1" rank="4" score="2"/>
	 * <scoring_rule concepts="5" nummatches="1" rank="5" score="1"/>
	 * </scoring_rules>
	 */
	var scoringRules = xml.match(/score="\d*"/g);
	
	if(scoringRules != null) {
		//loop through all the scoring rules
		for(var x=0; x<scoringRules.length; x++) {
			//get a scoring rule e.g. score="4"
			var scoreRule = scoringRules[x];
			
			//create a match to extract the score value
			var scoreMatch = scoreRule.match(/score="(\d*)"/);
			
			if(scoreMatch != null && scoreMatch.length > 1) {
				/*
				 * get the score
				 * scoreMatch[0] = score="4"
				 * scoreMatch[1] = 4
				 */
				var score = parseInt(scoreMatch[1]);
				
				//check if we need to update the max score value
				if(score > maxScore) {
					maxScore = score;
				}
			}
		}		
	}
	
	return maxScore;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/authorview_utils.js');
};