
SVGDrawNode.prototype = new Node();
SVGDrawNode.prototype.constructor = SVGDrawNode;
SVGDrawNode.prototype.parent = Node.prototype;
SVGDrawNode.authoringToolName = "Draw";
SVGDrawNode.authoringToolDescription = "Students draw using basic drawing tools, take snapshots and create flipbook animations";
SVGDrawNode.prototype.i18nEnabled = true;
SVGDrawNode.prototype.i18nType = "SVGDrawNode";
SVGDrawNode.prototype.i18nPath = "vle/node/draw/i18n/";
SVGDrawNode.prototype.supportedLocales = {
	"en":"en",
	"es":"es",
	"iw":"he",
	"ko":"ko",
	"nl":"nl",
	"nl_GE":"nl",
	"nl_DE":"nl",
	"tr":"tr",
	"zh_CN":"zh_CN"
};

SVGDrawNode.tagMapFunctions = [
	{functionName:'importWork', functionArgs:[]},
	{functionName:'showPreviousWork', functionArgs:[]}
];

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {SVGDrawNode}
 */
function SVGDrawNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.content = null;
	this.filename = null;
	this.contentBase;
	this.importableFromNodes = new Array("SVGDrawNode","OpenResponseNode","NoteNode");	
	this.importableFileExtensions = new Array(
			"jpg", "jpeg", "png", "gif", "svg");
	
	this.tagMapFunctions = this.tagMapFunctions.concat(SVGDrawNode.tagMapFunctions);
};

SVGDrawNode.prototype.updateJSONContentPath = function(base){
	var rExp = new RegExp(this.filename);
	this.content.replace(rExp, base + '/' + this.filename);
};

SVGDrawNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	return SVGDRAWSTATE.prototype.parseDataJSONObj(stateJSONObj);
};

/**
 * Returns the base64 encoded svgstring of the latest work
 * @param studentWork json
 * @return base64 encoded svgstring
 */
SVGDrawNode.prototype.translateStudentWork = function(svgState) {
	//get the svg string
	studentWork = svgState.data;
	
	// if the student data has been compressed, decompress it
	if(typeof studentWork == "string"){
		if (studentWork.match(/^--lz77--/)) {
			var lz77 = new LZ77();
			studentWork = studentWork.replace(/^--lz77--/, "");
			studentWork = $.parseJSON(lz77.decompress(studentWork));
		}
	}
	
	var svgString = studentWork.svgString;
	// if the svg has been compressed, decompress it
	if (svgString.match(/^--lz77--/)) {
		var lz77 = new LZ77();
		svgString = svgString.replace(/^--lz77--/, "");
		svgString = lz77.decompress(svgString);
	}
	svgString = Utils.encode64(svgString);
	return svgString;
	
};

/**
 * Imports and inserts the work from the specified importFromNode
 * @param importFromNode node that has the data for this node to import
 */
SVGDrawNode.prototype.importWork = function(importFromNode) {
	if (this.canImportWork(importFromNode)) {
		if (importFromNode.type == "SVGDrawNode") {
			var studentWork = this.view.getState().getLatestWorkByNodeId(importFromNode.id);
			if (studentWork != null) {
		        var studentWorkSVG = Utils.decode64(this.translateStudentWork(studentWork));
		        
		        // only get the studentlayer. remove newlines and regex for what's inside <title>student</title>...</g>
		        studentWorkSVG = studentWorkSVG.replace(/[\n\r\t]/g,"").match("<title>student</title>(.*)</g>")[1];

				var svgStringBefore = this.contentPanel.svgCanvas.getSvgString();
				var svgStringAfter = svgStringBefore.replace("<title>student</title>", "<title>student</title>" + studentWorkSVG);
				this.contentPanel.svgCanvas.setSvgString(svgStringAfter);
			}		
		}
	}
};

/**
 * Returns true iff the given file can be imported 
 * into this step's work.
 */
SVGDrawNode.prototype.canImportFile = function(filename) {
	if (filename.indexOf(".") != -1) {
		var fileExt = filename.substr(filename.lastIndexOf(".")+1);	
		if (this.importableFileExtensions.indexOf(fileExt.toLowerCase()) != -1) {
			return true;
		}
	}
	return false;
};

/**
 * Imports and inserts the specified file into current drawing.
 * @param file to insert into current canvas
 * @return true if import is successful
 */
SVGDrawNode.prototype.importFile = function(filename) {
	if (this.canImportFile(filename)) {
		var importFileSVG = '<image x="250" y="150" height="150" width="150" xlink:href="'+filename+'" />';
		var svgStringBefore = this.contentPanel.svgCanvas.getSvgString();
		// use regex to put newly-imported file at the very top layer
		var svgStringAfter = svgStringBefore.replace(/<title>student<\/title>((.*\n\s)*)<\/g>/g, "<title>student</title>$1"+importFileSVG+"</g>");
	    
		// xmlns:xlink="http://www.w3.org/1999/xlink" <- make sure this is in xml namespace.
		if (svgStringAfter.indexOf('xmlns:xlink="http://www.w3.org/1999/xlink"') == -1) {
			svgStringAfter = svgStringAfter.replace("<svg ", "<svg " + 'xmlns:xlink="http://www.w3.org/1999/xlink" ');
		}

		this.contentPanel.svgCanvas.setSvgString(svgStringAfter);
		return true;
	}
	return false;
};

/**
 * This is called when the node is exited
 * @return
 */
SVGDrawNode.prototype.onExit = function() {
	try {
		//check if the content panel has been set
		if(this.contentPanel) {
			if(this.contentPanel.onExit) {
				//run the on exit cleanup
				this.contentPanel.onExit();
			}
		}
	} catch(e) {
		
	}
};

/**
 * SVGDraw does not actually use this function to render the grading view.
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
SVGDrawNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	//get the step work id
	var stepWorkId = nodeVisit.id;
	
	//get the node states
	var nodeStates = nodeVisit.nodeStates;
	
	/*
	 * Get the number of submits up until this step work id. this is used
	 * so that we can display the Check Answer #X on node states that
	 * were CRater submits where the X value is a counter that accumulates
	 * over all node visits for the step. For example this node visit
	 * might include Check Answer #3 and #4 where as a previous node
	 * visit will include Check Answer #1 and #2.
	 */
	var checkAnswerCount = this.getNumberOfCheckWorks(stepWorkId, workgroupId);
	
	//loop through all the node states from newest to oldest
	for(var x=nodeStates.length - 1; x>=0; x--) {
		//get a node state
		var nodeState = nodeStates[x];
		
		var studentData = nodeState.data;
		var stepWorkId = nodeVisit.id;
		var timestamp = nodeState.timestamp;
		var checkWork = nodeState.checkWork;
		
		//get the node state timestamp
		var nodeStateTimestamp = nodeState.timestamp;
		
		// if the work is for a SVGDrawNode, embed the svg
		var innerDivId = "svgDraw_"+stepWorkId+"_"+timestamp;
		var contentBaseUrl = this.view.config.getConfigParam('projectBaseURL');
		// if studentData has been compressed, decompress it and parse (for legacy compatibility)
		if (typeof studentData == "string") {
			if (studentData.match(/^--lz77--/)) {
				var lz77 = new LZ77();
				studentData = studentData.replace(/^--lz77--/, "");
				studentData = lz77.decompress(studentData);
				studentData = $.parseJSON(studentData);
			}
		} 
		var svgString = studentData.svgString;
		var description = studentData.description;
		var snaps = studentData.snapshots;
		var contentUrl = this.getContent().getContentUrl();
		var studentWork = '';
		
		if(checkWork) {
			/*
			 * this node state was a check work so we will increment the counter
			 * and display the check work counter above the student work
			 */
			checkAnswerCount++;
			
			studentWork += 'Check Answer #' + checkAnswerCount;
			studentWork += '<br>';
		}
		
		//get the auto graded annotation text if any
		var autoGradedAnnotationText = this.getAutoGradedAnnotationText(stepWorkId, nodeStateTimestamp);
		
		if(autoGradedAnnotationText != null && autoGradedAnnotationText != '') {
			//add the auto graded annotation text
			studentWork += autoGradedAnnotationText;
		}
		
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
				  if (value.startsWith("./assets") || value.startsWith("assets")) {
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
			if(description != null){
				studentWork += "<span>Description: </span><div id='"+innerDivId+"_description' class='drawDescription'>"+description+"</div>";
			}
			
			studentWork += "<div id='"+innerDivId+"_contentUrl' style='display:none;'>"+contentUrl+"</div>"+
			"<a class='drawEnlarge' onclick='enlargeDraw(\""+innerDivId+"\");'>enlarge</a>";
			
			var snapTxt = "<div id='"+innerDivId+"_snaps' class='snaps'>";
			for(var i=0;i<snaps.length;i++){
				var snapId = innerDivId+"_snap_"+i;
				var currSnap = snaps[i].svg;
				if (currSnap.match(/^--lz77--/)) {
					var lz77 = new LZ77();
					currSnap = currSnap.replace(/^--lz77--/, "");
					currSnap = lz77.decompress(currSnap);
				}
				
				var currDescription = snaps[i].description;
				snapTxt += "<div id='"+snapId+"_description' class='snapDescription' style='display:none;'>"+currDescription+"</div>";
				
				//currSnap = currSnap.replace(/(<image.*xlink:href=)"(.*)"(.*\/>)/gmi, '$1'+'"'+contentBaseUrl+'$2'+'"'+'$3');
				// only replace local hrefs. leave absolute hrefs alone!
				currSnap = currSnap.replace(/(<image.*xlink:href=)"(.*)"(.*\/>)/gmi, function(m,key,value) {
					  if (value.startsWith("./assets") || value.startsWith("assets")) {
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
			}
			
			snapTxt += "</div>";
			studentWork += snapTxt;
		} else {
			if(description != null){
				studentWork += "<span>Description: </span><div id='"+innerDivId+"_description' class='drawDescription'>"+description+"</div>";
			}
			
			studentWork += "<div id='"+innerDivId+"_contentUrl' style='display:none;'>"+contentUrl+"</div>"+
			"<a class='drawEnlarge' onclick='enlargeDraw(\""+innerDivId+"\");'>enlarge</a>";
			
			studentWork += "<div id='"+innerDivId+"' class='svgdrawCell'>"+svgString+"</div>";
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
	}
};

SVGDrawNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/draw/svg-edit/svg-editor.html');
};

/**
 * Whether this step type has a grading view. Steps types that do not
 * save any student work will not have a grading view such as HTMLNode
 * and OutsideUrlNode.
 * @returns whether this step type has a grading view
 */
SVGDrawNode.prototype.hasGradingView = function() {
	return true;
};

/**
 * Shows the draw node that is in the element
 * @param currNode the svgdrawCell element
 */
SVGDrawNode.prototype.showDrawNode = function(currNode) {
	var svgString = String($(this).html());
	svgString = Utils.decode64(svgString);
	var svgXml = Utils.text2xml(svgString);
	$(this).html('');
	$(this).append(document.importNode(svgXml.documentElement, true)); // add svg to cell
};

/**
 * Shows the snap elements
 * @param currNode the snapCell element
 */
SVGDrawNode.prototype.showSnaps = function(currNode) {
	//get the string in the snaps div
	var svgString = String($(this).html());
	
	/*
	 * check if the string starts with "<svg", if it does
	 * then it has already been decoded and we do not need
	 * to do anything. if it does not start with "<svg", then
	 * we will decode it.
	 */
	if(svgString.toLowerCase().indexOf("<svg") == -1) {
		//string does not contain "<svg"
		
		svgString = Utils.decode64(svgString);
		var svgXml = Utils.text2xml(svgString);
		$(this).html('');
		$(this).append(document.importNode(svgXml.documentElement, true)); // add svg to cell
	}
};

/**
 * Returns whether this step type can be special exported
 * @return a boolean value
 */
SVGDrawNode.prototype.canSpecialExport = function() {
	return true;
};

SVGDrawNode.prototype.getFeedback = function() {
	return null;
};

/**
 * Get the feedback that will be displayed when the student clicks
 * on the Feedback button at the upper right of the vle. This feedback
 * will take precedence over feedback from the teacher.
 * @return the feedback html or null if there is no feedback
 */
SVGDrawNode.prototype.getFeedback0 = function() {
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
SVGDrawNode.prototype.getCriteriaValue = function() {
	var topScoreSoFar = -1;
	
	//get all the annotations for this step
	var annotations = this.view.getAnnotations().getAnnotationsByNodeId(this.id);
	
	if(annotations != null) {
		//loop through all the annotations
		for(var x=0; x<annotations.length; x++) {
			//get an annotation
			var annotation = annotations[x];
			
			//look for autoGraded annotations
			if(annotation != null && annotation.type == 'autoGraded') {
				/*
				 * the annotation is an autoGraded annotation so we will
				 * get the annotation value
				 */
				var annotationValue = annotation.value;
				
				if(annotationValue != null) {
					//loop through all the values
					for(var y=0; y<annotationValue.length; y++) {
						var tempValue = annotationValue[y];
						
						if(tempValue != null) {
							//get the autoScore
							var autoScore = tempValue.autoScore;
							
							//update the topScoreSoFar if necessary
							if(autoScore != null && autoScore > topScoreSoFar) {
								topScoreSoFar = autoScore;
							}
						}
					}
				}
			}
		}
	}
	
	if (topScoreSoFar != -1) {
		return topScoreSoFar;
	} else {
		return null;
	}
};

/**
 * Get the Base64 image string from the student work
 * @param nodeState the student work
 * @return the Base64 image string of the student work
 */
SVGDrawNode.prototype.getBase64Image = function(nodeState) {
	//get the data from the student work
	studentWork = nodeState.data;
	
	// if the student data has been compressed, decompress it
	if(typeof studentWork == "string"){
		if (studentWork.match(/^--lz77--/)) {
			var lz77 = new LZ77();
			studentWork = studentWork.replace(/^--lz77--/, "");
			studentWork = $.parseJSON(lz77.decompress(studentWork));
		}
	}
	
	//get the svg string from the student work
	var svgString = studentWork.svgString;
	
	// if the svg has been compressed, decompress it
	if (svgString.match(/^--lz77--/)) {
		var lz77 = new LZ77();
		svgString = svgString.replace(/^--lz77--/, "");
		svgString = lz77.decompress(svgString);
	}
	
	//encode the svg string to Base64
	var base64Image = 'data:image/svg+xml;base64,' + Utils.encode64(svgString);
	
	return base64Image;
}

/**
 * Get the svg string from the student work
 * @param nodeState the student work
 * @return the svg string from the student work
 */
SVGDrawNode.prototype.getStudentWorkSVGString = function(nodeState) {
	//get the data from the student work
	studentWork = nodeState.data;
	
	// if the student data has been compressed, decompress it
	if(typeof studentWork == "string"){
		if (studentWork.match(/^--lz77--/)) {
			var lz77 = new LZ77();
			studentWork = studentWork.replace(/^--lz77--/, "");
			studentWork = $.parseJSON(lz77.decompress(studentWork));
		}
	}
	
	//get the svg string from the student work
	var svgString = studentWork.svgString;
	
	// if the svg has been compressed, decompress it
	if (svgString.match(/^--lz77--/)) {
		var lz77 = new LZ77();
		svgString = svgString.replace(/^--lz77--/, "");
		svgString = lz77.decompress(svgString);
	}
	
	return svgString;
}

/**
 * Function that checks if this step should show the autoScore to the student
 * when the showNodeAnnotations() function is called.
 */
SVGDrawNode.prototype.showAutoScore = function() {
	var result = true;
	
	//get the step content
	var contentJSON = this.content.getContentJSON();
	
	if(contentJSON != null) {
		//get the autoScoring object if it exists
		var autoScoring = contentJSON.autoScoring;
		
		if(autoScoring != null) {
			//get whether we should display the auto score to the student
			var autoScoringDisplayScoreToStudent = autoScoring.autoScoringDisplayScoreToStudent;
			
			if(autoScoringDisplayScoreToStudent != null) {
				result = autoScoringDisplayScoreToStudent;
			}
		}
	}
	
	return result;
};

/**
 * Function that checks if this step should show the autoFeedback to the student
 * when the showNodeAnnotations() function is called.
 */
SVGDrawNode.prototype.showAutoFeedback = function() {
	var result = true;
	
	//get the step content
	var contentJSON = this.content.getContentJSON();
	
	if(contentJSON != null) {
		//get the autoScoring object if it exists
		var autoScoring = contentJSON.autoScoring;
		
		if(autoScoring != null) {
			//get whether we should display the auto feedback to the student
			var autoScoringDisplayFeedbackToStudent = autoScoring.autoScoringDisplayFeedbackToStudent;
			
			if(autoScoringDisplayFeedbackToStudent != null) {
				result = autoScoringDisplayFeedbackToStudent;
			}
		}
	}
	
	return result;
};

NodeFactory.addNode('SVGDrawNode', SVGDrawNode);
	
//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/draw/SVGDrawNode.js');
};