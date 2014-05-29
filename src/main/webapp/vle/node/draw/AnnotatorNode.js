/**
 * Annotator Node
 */
AnnotatorNode.prototype = new SVGDrawNode();
AnnotatorNode.prototype.constructor = AnnotatorNode;
AnnotatorNode.prototype.parent = SVGDrawNode.prototype;
AnnotatorNode.authoringToolName = "Image Annotator";
AnnotatorNode.authoringToolDescription = "Students add labels to a background image or photo.";

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {AnnotatorNode}
 */
function AnnotatorNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
}

/**
 * Annotator does not actually use this function to render the grading view.
 * The grading view for SVGDraw steps is handled a special way in the vle code.
 * 
 * @param displayStudentWorkDiv the div we will render the student work into
 * @param nodeVisit the student work
 * @param childDivIdPrefix (optional) a string that will be prepended to all the 
 * div ids use this to prevent DOM conflicts such as when the show all work div
 * uses the same ids as the show flagged work div
 * @param workgroupId the id of the workgroup this work belongs to
 * 
 */
AnnotatorNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {

	//get the node states
	var nodeStates = nodeVisit.nodeStates,
		x = nodeStates.length;
	
	//loop through all the node states from newest to oldest
	while(x--) {
		//get a node state
		var nodeState = nodeStates[x],
			studentWork = nodeState.data,
			stepWorkId = nodeVisit.id,
			timestamp = nodeState.timestamp,
			autoScore = nodeState.autoScore,
			autoFeedback = nodeState.autoFeedback,
			autoFeedbackKey = nodeState.autoFeedbackKey,
			checkWork = nodeState.checkWork;
		
		// if the work is for a AnnotaotrNode, embed the svg
		var innerDivId = "annotator_"+stepWorkId+"_"+timestamp,
			contentBaseUrl = this.view.config.getConfigParam('getContentBaseUrl');
		// if studentData has been compressed, decompress it and parse (for legacy compatibility)
		/*if (typeof studentWork == "string") {
			if (studentWork.match(/^--lz77--/)) {
				var lz77 = new LZ77();
				studentWork = studentWork.replace(/^--lz77--/, "");
				studentWork = lz77.decompress(studentWork);
				studentWork = $.parseJSON(studentWork);
			}
		}*/
		var svgString = studentWork.svgString,
			explanation = studentWork.explanation.replace(/\r?\n/g, '<br />'),
			contentUrl = this.getContent().getContentUrl();
		studentWork.svgString = "";
		var studentDisplay = //"<div id='"+innerDivId+"_contentUrl' style='display:none;'>"+contentUrl+"</div>"+
			//"<div id='"+innerDivId+"_contentBaseUrl' style='display:none;'>"+contentBaseUrl+"</div>"+
			"<a id='"+innerDivId+"_enlarge' class='annotatorEnlarge'>enlarge</a>"+
			"<div id='"+innerDivId+"_studentWork' style='display: none;'>" + JSON.stringify(studentWork) + "</div>";
		
		if (svgString != null){
			/*if (svgString.match(/^--lz77--/)) {
				var lz77 = new LZ77();
				svgString = svgString.replace(/^--lz77--/, "");
				svgString = lz77.decompress(svgString);
			}*/
			
			// only replace local hrefs. leave absolute hrefs alone!
			svgString = svgString.replace(/(<image.*xlink:href=)"(.*)"(.*\/>)/gmi, function(m,key,value) {
				if (value.indexOf("http://") == -1) {
					return m.replace(/(<image.*xlink:href=)"(.*)"(.*\/>)/gmi, '$1'+'"'+contentBaseUrl+'$2'+'"'+'$3');
				}
				return m;
			});
			//svgString = svgString.replace(/(marker.*=)"(url\()(.*)(#se_arrow_bk)(\)")/gmi, '$1'+'"'+'$2'+'$4'+'$5');
			//svgString = svgString.replace(/(marker.*=)"(url\()(.*)(#se_arrow_fw)(\)")/gmi, '$1'+'"'+'$2'+'$4'+'$5');
			svgString = svgString.replace(/<g>/gmi,'<g transform="scale(0.5)">');
			svgString = Utils.encode64(svgString);
		}
		
		studentDisplay += "<div id='"+innerDivId+"' class='annotatorCell'></div>";
		if(explanation != null){
			studentDisplay += "<p>Explanation: </p><p id='"+innerDivId+"_explanation' class='annotatorExplanation'>"+explanation+"</p>";
		}
		
		if(displayStudentWorkDiv.html() != '') {
			//separate node states with an hr
			displayStudentWorkDiv.append('<hr style="border:1px solid">');
		}
		
		//insert the html into the div
		displayStudentWorkDiv.append(studentDisplay);
		
		var promptText = view.getI18NString('prompt_link','SVGDrawNode'); 
		
		$('#' + innerDivId).data('node', this).data('contentUrl', contentUrl)
			.data('contentBaseUrl', contentBaseUrl).data('promptText', promptText)
			.data('headerText', view.getI18NStringWithParams('annotator_grading_header',[view.currentGradingDisplayParam[0]],'SVGDrawNode'));
		
		$('#' + innerDivId + '_enlarge').off('click').on('click', function(){
			enlargeAnnotator(innerDivId);
		});
		
		//perform post processing of the svg data so that the drawing is displayed
		displayStudentWorkDiv.find(".annotatorCell").data('svg', svgString).each(this.showAnnotatorNode);
		
		var autoScoreText = '';
		
		if(autoFeedbackKey != null) {
			//get the auto feedback key if available
			autoScoreText += 'Auto-Feedback Key: ' + autoFeedbackKey;
		}
		
		if(autoScore != null) {
			//get the auto score if available
			
			if(autoScoreText != '') {
				autoScoreText += '<br>';
			}
			
			autoScoreText += 'Auto-Score: ' + autoScore;
		}
		
		if(autoFeedback != null) {
			//get the auto feedback if available
			
			if(autoScoreText != '') {
				autoScoreText += '<br>';
			}
			
			autoFeedback = autoFeedback.replace(/\n/g, '<br>');
			autoScoreText += 'Auto-Feedback: ' + autoFeedback;
		}
		
		if(autoScoreText != '') {
			//insert the auto score text
			displayStudentWorkDiv.append(autoScoreText);		
		}
	}
};

AnnotatorNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/draw/svg-edit/annotator.html');
};

/**
 * Whether this step type has a grading view. Steps types that do not
 * save any student work will not have a grading view such as HTMLNode
 * and OutsideUrlNode.
 * @returns whether this step type has a grading view
 */
AnnotatorNode.prototype.hasGradingView = function() {
	return true;
};

/**
 * Shows the annotator node that is in the element
 * @param currNode the annotatorCell element
 */
AnnotatorNode.prototype.showAnnotatorNode = function(currNode) {
	var svgString = String($(this).html());
	var svgString = $(this).data('svg');
	svgString = Utils.decode64(svgString);
	var svgXml = Utils.text2xml(svgString);
	$(this).html('');
	$(this).append(document.importNode(svgXml.documentElement, true)); // add svg to cell
	$(this).height($(this).find('svg').height()/2);
	$(this).width($(this).find('svg').width()/2);
};

/**
 * Returns whether this step type can be special exported
 * @return a boolean value
 */
AnnotatorNode.prototype.canSpecialExport = function() {
	return true;
};

/**
 * Get the feedback that will be displayed when the student clicks
 * on the Feedback button at the upper right of the vle. This feedback
 * will take precedence over feedback from the teacher.
 * @return the feedback html or null if there is no feedback
 */
AnnotatorNode.prototype.getFeedback = function() {
	var feedback = null;
	
	//get the step content
	var contentJSON = this.content.getContentJSON();
	
	if(contentJSON != null && 
			contentJSON.enableAutoScoring &&
			contentJSON.autoScoring != null &&
			(contentJSON.autoScoring.autoScoringDisplayScoreToStudent || contentJSON.autoScoring.autoScoringDisplayFeedbackToStudent)) {
		//this step is an auto graded annotator step
		
		//get all the node states
		var nodeStates = this.view.getStudentWorkForNodeId(this.id);
		
		if(nodeStates != null) {
			/*
			 * keep track of how many of the node states were submits
			 * to the draw auto grader
			 */
			var checkWorkCount = 0;
			var previousFeedback = '';
			
			/*
			 * loop through all the node states and get the autoFeedback
			 * from the node states. each time we find a node state that
			 * was auto graded we will remember that autoFeedback. then
			 * the next time we find a node state that was auto graded
			 * we will label the remembered autoFeedback as PREVIOUS
			 * FEEDBACK and then add it to the overall feedback. this
			 * way when we get to the last autoFeedback, we can label it
			 * as NEW FEEDBACK.
			 */
			for(var x=0; x<nodeStates.length; x++) {
				//get a node state
				var nodeState = nodeStates[x];
				
				if(nodeState.checkWork) {
					checkWorkCount++;
					
					/*
					 * this node state was work that was auto graded so we will
					 * get the autoFeedback and autoScore and display it
					 */
					var autoFeedback = nodeState.autoFeedback;
					var autoScore = nodeState.autoScore;
					var maxScore = nodeState.maxAutoScore;
					
					//create the text that will display the score, max score, and feedback
					var tempFeedback = '';
					
					if(contentJSON.autoScoring.autoScoringDisplayScoreToStudent) {
						//display the score
						tempFeedback += 'Score: ' + autoScore + '/' + maxScore + '<br/>';
					}
					
					if(contentJSON.autoScoring.autoScoringDisplayFeedbackToStudent) {
						//display the feedback
						tempFeedback += 'Feedback:<br/>' + autoFeedback;
					}
					
					if(feedback == null) {
						//initialize the feedback to empty string
						feedback = '';
					} else if(feedback != '') {
						//separate the existing feedback with a horizontal line
						feedback = '<hr>' + feedback;
					}
					
					if(previousFeedback != '') {
						/*
						 * there is previous feedback from a previous student work
						 * so we will add the previous feedback to the feedback
						 */
						feedback = 'PREVIOUS FEEDBACK<br>' + previousFeedback + feedback;	
					}

					/*
					 * remember the auto feedback from this student work so we can add
					 * it to the overall feedback later
					 */
					previousFeedback = tempFeedback;
				}
			}
			
			if(previousFeedback != '') {
				if(this.content.getContentJSON().autoScoring.autoScoringDoNotDisplayFeedbackToStudentOnLastChance &&
						this.content.getContentJSON().autoScoring.autoScoringCheckWorkChances == checkWorkCount) {
					/*
					 * we do not want to show the feedback on the last submit
					 * chance if the student has used all their submit chances.
					 * for example if the student has 3 submit chances and they
					 * have submitted 3 times, we will not show that last 3rd 
					 * feedback.
					 */
				} else {
					//this is the newest feedback the student has received
					
					if(feedback != '') {
						//separate the existing feedback with a horizontal line
						feedback = '<hr>' + feedback;
					}
					
					//this is the newest feedback
					feedback = '<b>NEW FEEDBACK<br>' + previousFeedback + '</b>' + feedback;					
				}
			}
		}
	}
	
	return feedback;
};

/**
 * Returns the criteria value for this node based on student response.
 * For the SVGDrawNode for now, it's the top score that the student has gotten.
 */
AnnotatorNode.prototype.getCriteriaValue = function() {
	var studentStates = view.getStudentWorkForNodeId(this.id);
	var topScoreSoFar = -1;
	if(studentStates != null && studentStates != '') {
		for (var i=0; i<studentStates.length; i++) {
			var studentState = studentStates[i];
			if (studentState.autoScore != null && studentState.autoScore > topScoreSoFar) {
				topScoreSoFar = studentState.autoScore;
			}
		}
	}
	if (topScoreSoFar != -1) {
		return topScoreSoFar;
	} else {
		return null;
	}

};

NodeFactory.addNode('AnnotatorNode', AnnotatorNode);
	
//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/draw/AnnotatorNode.js');
};