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
	var nodeStates = nodeVisit.nodeStates;
	
	//loop through all the node states from newest to oldest
	for(var x=nodeStates.length - 1; x>=0; x--) {
		//get a node state
		var nodeState = nodeStates[x];
		
		var studentWork = nodeState.data;
		var stepWorkId = nodeVisit.id;
		var timestamp = nodeState.timestamp;
		var autoScore = nodeState.autoScore;
		var autoFeedback = nodeState.autoFeedback;
		var autoFeedbackKey = nodeState.autoFeedbackKey;
		var checkWork = nodeState.checkWork;
		
		// if the work is for a SVGDrawNode, embed the svg
		var innerDivId = "svgDraw_"+stepWorkId+"_"+timestamp;
		var contentBaseUrl = this.view.config.getConfigParam('getContentBaseUrl');
		// if studentData has been compressed, decompress it and parse (for legacy compatibility)
		if (typeof studentWork == "string") {
			if (studentWork.match(/^--lz77--/)) {
				var lz77 = new LZ77();
				studentWork = studentWork.replace(/^--lz77--/, "");
				studentWork = lz77.decompress(studentWork);
				studentWork = $.parseJSON(studentWork);
			}
		} 
		var svgString = studentWork.svgString;
		var description = studentWork.description;
		var snaps = studentWork.snapshots;
		var contentUrl = this.getContent().getContentUrl();
		studentWork = "<div id='"+innerDivId+"_contentUrl' style='display:none;'>"+contentUrl+"</div>"+
			"<a class='drawEnlarge' onclick='enlargeDraw(\""+innerDivId+"\");'>enlarge</a>";
		// if the svg has been compressed, decompress it
		if (svgString != null){
			if (svgString.match(/^--lz77--/)) {
				var lz77 = new LZ77();
				svgString = svgString.replace(/^--lz77--/, "");
				svgString = lz77.decompress(svgString);
			}
			
			//svgString = svgString.replace(/(<image.*xlink:href=)"(.*)"(.*\/>)/gmi, '$1'+'"'+contentBaseUrl+'$2'+'"'+'$3');
			// only replace local hrefs. leave absolute hrefs alone!
			svgString = svgString.replace(/(<image.*xlink:href=)"(.*)"(.*\/>)/gmi, function(m,key,value) {
				  if (value.indexOf("http://") == -1) {
				    return m.replace(/(<image.*xlink:href=)"(.*)"(.*\/>)/gmi, '$1'+'"'+contentBaseUrl+'$2'+'"'+'$3');
				  }
				  return m;
				});
			svgString = svgString.replace(/(marker.*=)"(url\()(.*)(#se_arrow_bk)(\)")/gmi, '$1'+'"'+'$2'+'$4'+'$5');
			svgString = svgString.replace(/(marker.*=)"(url\()(.*)(#se_arrow_fw)(\)")/gmi, '$1'+'"'+'$2'+'$4'+'$5');
			//svgString = svgString.replace('<svg width="600" height="450"', '<svg width="360" height="270"');
			svgString = svgString.replace(/<g>/gmi,'<g transform="scale(0.6)">');
			svgString = Utils.encode64(svgString);
		}
		if(snaps != null && snaps.length>0){
			var snapTxt = "<div id='"+innerDivId+"_snaps' class='snaps'>";
			for(var i=0;i<snaps.length;i++){
				var snapId = innerDivId+"_snap_"+i;
				var currSnap = snaps[i].svg;
				if (currSnap.match(/^--lz77--/)) {
					var lz77 = new LZ77();
					currSnap = currSnap.replace(/^--lz77--/, "");
					currSnap = lz77.decompress(currSnap);
				}
				//currSnap = currSnap.replace(/(<image.*xlink:href=)"(.*)"(.*\/>)/gmi, '$1'+'"'+contentBaseUrl+'$2'+'"'+'$3');
				// only replace local hrefs. leave absolute hrefs alone!
				currSnap = currSnap.replace(/(<image.*xlink:href=)"(.*)"(.*\/>)/gmi, function(m,key,value) {
					  if (value.indexOf("http://") == -1) {
					    return m.replace(/(<image.*xlink:href=)"(.*)"(.*\/>)/gmi, '$1'+'"'+contentBaseUrl+'$2'+'"'+'$3');
					  }
					  return m;
					});
				
				currSnap = currSnap.replace(/(marker.*=)"(url\()(.*)(#se_arrow_bk)(\)")/gmi, '$1'+'"'+'$2'+'$4'+'$5');
				currSnap = currSnap.replace(/(marker.*=)"(url\()(.*)(#se_arrow_fw)(\)")/gmi, '$1'+'"'+'$2'+'$4'+'$5');
				//currSnap = currSnap.replace('<svg width="600" height="450"', '<svg width="120" height="90"');
				currSnap = currSnap.replace(/<g>/gmi,'<g transform="scale(0.6)">');
				currSnap = Utils.encode64(currSnap);
				snapTxt += "<div id="+snapId+" class='snapCell' onclick='enlargeDraw(\""+innerDivId+"\");'>"+currSnap+"</div>";
				var currDescription = snaps[i].description;
				snapTxt += "<div id='"+snapId+"_description' class='snapDescription' style='display:none;'>"+currDescription+"</div>";
			}
			
			snapTxt += "</div>";
			studentWork += snapTxt;
			
			if(description != null){
				studentWork += "<span>Description: </span><div id='"+innerDivId+"_description' class='drawDescription'>"+description+"</div>";
			}
		} else {
			studentWork += "<div id='"+innerDivId+"' class='svgdrawCell'>"+svgString+"</div>";
			if(description != null){
				studentWork += "<span>Description: </span><div id='"+innerDivId+"_description' class='drawDescription'>"+description+"</div>";
			}
		}
		
		if(displayStudentWorkDiv.html() != '') {
			//separate node states with an hr
			displayStudentWorkDiv.append('<hr style="border:1px solid">');
		}
		
		//insert the html into the div
		displayStudentWorkDiv.append(studentWork);
		
		//perform post processing of the svg data so that the drawing is displayed
		displayStudentWorkDiv.find(".svgdrawCell").each(this.showDrawNode);
		displayStudentWorkDiv.find(".snapCell").each(this.showSnaps);
		
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
 * Shows the draw node that is in the element
 * @param currNode the svgdrawCell element
 */
AnnotatorNode.prototype.showDrawNode = function(currNode) {
	var svgString = String($(this).html());
	svgString = Utils.decode64(svgString);
	var svgXml = Utils.text2xml(svgString);
	$(this).html('');
	$(this).append(document.importNode(svgXml.documentElement, true)); // add svg to cell
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
	
	//check if this is an auto graded draw step
	if(this.content.getContentJSON() != null &&
			this.content.getContentJSON().autoScoring != null &&
			this.content.getContentJSON().autoScoring.autoScoringCriteria != null &&
			this.content.getContentJSON().autoScoring.autoScoringCriteria != "") {
		//this step is an auto graded draw step
		
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
					 * get the autoFeedback and display it
					 */
					var autoFeedback = nodeState.autoFeedback;
					
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
					previousFeedback = autoFeedback;
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