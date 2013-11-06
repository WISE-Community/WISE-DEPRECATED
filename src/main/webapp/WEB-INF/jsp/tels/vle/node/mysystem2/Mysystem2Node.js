Mysystem2Node.prototype = new Node();
Mysystem2Node.prototype.constructor = Mysystem2Node;
Mysystem2Node.prototype.parent = Node.prototype;

/*
 * the name that displays in the authoring tool when the author creates a new step
 */
Mysystem2Node.authoringToolName = "My System 2"; 

/*
 * will be seen by the author when they add a new step to their project to help
 * them understand what kind of step this is
 */
Mysystem2Node.authoringToolDescription = "This is a generic step only used by developers";


Mysystem2Node.tagMapFunctions = [
	{functionName:'importWork', functionArgs:[]},
	{functionName:'showPreviousWork', functionArgs:[]}
];

/**
 * This is the constructor for the Node
 * 
 * @param nodeType
 * @param view
 */
function Mysystem2Node(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
}

/**
 * This function is called when the vle loads the step and parses
 * the previous student answers, if any, so that it can reload
 * the student's previous answers into the step.
 * 
 * @param stateJSONObj
 * @return a new state object
 */
Mysystem2Node.prototype.parseDataJSONObj = function(stateJSONObj) {
	return MYSYSTEM2STATE.prototype.parseDataJSONObj(stateJSONObj);
};

/**
 * This function is called if there needs to be any special translation
 * of the student work from the way the student work is stored to a
 * human readable form. For example if the student work is stored
 * as an array that contains 3 elements, for example
 * ["apple", "banana", "orange"]
 *  
 * and you wanted to display the student work like this
 * 
 * Answer 1: apple
 * Answer 2: banana
 * Answer 3: orange
 * 
 * you would perform that translation in this function.
 * 
 * Note: In most cases you will not have to change the code in this function
 * 
 * @param studentWork
 * @return translated student work
 */
Mysystem2Node.prototype.translateStudentWork = function(studentWork) {
	return studentWork;
};

/**
 * Note: it seems this method isn't needed on the Node anymore
 *   but since this step type is currently needs to work in old versions of Wise4
 *   we have to be careful deleting it.
 *
 * This function is called when the student exits the step. It is mostly
 * used for error checking.
 * 
 * Note: In most cases you will not have to change anything here.
 */
Mysystem2Node.prototype.onExit = function() {
	try {
		//check if the content panel has been set
		if(this.contentPanel) {
			if(this.contentPanel.save) {
				//tell the content panel to save
				this.contentPanel.save();
			}
		}
	} catch(e) {
		
	}
};

/**
 * Renders the student work into the div. The grading tool will pass in a
 * div id to this function and this function will insert the student data
 * into the div.
 * 
 * @param displayStudentWorkDiv the div we will render the student work into
 * @param nodeVisit the student work
 * @param childDivIdPrefix (optional) a string that will be prepended to all the 
 * div ids use this to prevent DOM conflicts such as when the show all work div
 * uses the same ids as the show flagged work div
 * @param workgroupId the id of the workgroup this work belongs to
 * 
 * Note: you may need to add code to this function if the student
 * data for your step is complex or requires additional processing.
 * look at SensorNode.renderGradingView() as an example of a step that
 * requires additional processing
 */
Mysystem2Node.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	/*
	 * get the step work id from the node visit in case we need to use it in
	 * a DOM id. we don't use it in this case but I have retrieved it in case
	 * someone does need it. look at SensorNode.js to view an example of
	 * how one might use it.
	 */
	var stepWorkId = nodeVisit.id;
	var divId = displayStudentWorkDiv.attr('id');

	// get content
    var contentString = this.getContent().getContentString();
    var contentJSON = this.getContent().getContentJSON();

	// get content baseurl (e.g. 'http://localhost:8080/curriculum/897')
	var contentBaseUrl = this.view.config.getConfigParam('getContentBaseUrl');	

    // prepend contentbaseurl in front of "assets" to content
    contentString = this.view.utils.prependContentBaseUrlToAssets(contentBaseUrl,contentString);
    
    var divContent = "";
    
    // given the nodeState, returns the HTML that should be displayed in the div for student work.
    function getDivContentFromNodeState(nodeState, nodeStateIndex, view, contentBaseUrl) {
			var studentWork = nodeState.response;
			var isSubmit = nodeState.isSubmit;
            var svg = null; 
            var png = null;
			var feedback = "";
			var timestamp = "";
			
			//get the response string
			var responseString = nodeState.response;
			
			//remove all the \n
			responseString = responseString.replace(/\n/g, "");
			
			//create a JSON object from the response
			var responseJSON = JSON.parse(responseString);
			
			if(responseJSON["MySystem.RuleFeedback"] != null &&
			   responseJSON["MySystem.RuleFeedback"].LAST_FEEDBACK != null) {
				
				if(responseJSON["MySystem.RuleFeedback"].LAST_FEEDBACK.feedback != null) {
					//get the feedback
					feedback = responseJSON["MySystem.RuleFeedback"].LAST_FEEDBACK.feedback;    					
				}
				
				if(responseJSON["MySystem.RuleFeedback"].LAST_FEEDBACK.timeStampMs != null) {
					//get the timestamp
					var timestampMS = responseJSON["MySystem.RuleFeedback"].LAST_FEEDBACK.timeStampMs;
					timestamp = new Date(timestampMS);
				}
                if(responseJSON["MySystem.GraphicPreview"] != null &&
                   responseJSON["MySystem.GraphicPreview"].LAST_GRAPHIC_PREVIEW != null) {
                    svg = responseJSON["MySystem.GraphicPreview"].LAST_GRAPHIC_PREVIEW.svg;
                    if (svg != null) {
                        svg = unescape(svg);
                        svg = new LZ77().decompress(svg);
                    }
                    png = responseJSON["MySystem.GraphicPreview"].LAST_GRAPHIC_PREVIEW.png;
                    if (png != null) { png = "<img src='" + png + "'' />"; }
                }
			}
			
    	    // prepend contentbaseurl in front of "assets" to student's work
    	    var studentWork = view.utils.prependContentBaseUrlToAssets(contentBaseUrl, studentWork);
    		
    	    divContent += "Diagram: ";
    	    
            // put the student work and content in a hidden element
            // add enlarge link to show student's diagram in a popup window
            divContent += "<a class='msEnlarge' style='text-decoration:underline; color:blue;'" +
                "onclick='var newWindow=window.open(\"/vlewrapper/vle/node/mysystem2/mysystem2.html\"); newWindow.divId=\""+divId+"_"+nodeStateIndex+"\"'>enlarge</a>" +
                "<span id='content_"+divId+"_"+nodeStateIndex+"' style='display:none'>"+contentString+"</span>" +
                "<span id='studentwork_"+divId+"_"+nodeStateIndex+"' style='display:none'>"+studentWork+"</span>";

    		if (svg != null) {
                divContent += "<div class='preview svg image'" + 
                " style='display: block; overflow: auto; width: 100%; height:500px;'> " + 
                svg + "</div>";
            }
            else if (png != null) {
                 divContent += "<span class='preview png image'> " + png + "</span>";
            }
        
            divContent += "<br>";
    		divContent += "Is Submit: " + isSubmit;
    		divContent += "<br>";
    		divContent += "Feedback: " + feedback;
    		divContent += "<br>";
    		divContent += "Timestamp: " + timestamp;
    		divContent += "<br>";
    		return divContent;
    }
    
    if(contentJSON != null) {
    	if(contentJSON.customRuleEvaluator == null || contentJSON.customRuleEvaluator == ""){
    		//only display the latest node state
    		//Get the latest student state object for this step
    		var nodeState = nodeVisit.getLatestWork();
    		divContent = getDivContentFromNodeState(nodeState, 0, this.view, contentBaseUrl);
    	} else {
    		/*
    		 * display all the node states because this step utilizes automated feedback
    		 * when students submit their diagrams.
    		 */
    		
    		//loop through all the node states from newest to oldest
    		for(var x=nodeVisit.nodeStates.length - 1; x>=0; x--) {
    			//get a node state
    			var nodeState = nodeVisit.nodeStates[x];
    			divContent += getDivContentFromNodeState(nodeState, x, this.view, contentBaseUrl);
    			if(x != nodeVisit.nodeStates.length - 1) {
    				//divide each node state with an hr
    				divContent += "<hr style='border:1px solid lightgrey'>";
    			}
    		}
    	}
    }
    
    displayStudentWorkDiv.html(divContent);
};


/**
 * Get the html file associated with this step that we will use to
 * display to the student.
 * 
 * @return a content object containing the content of the associated
 * html for this step type
 */
Mysystem2Node.prototype.getHTMLContentTemplate = function() {
	return createContent('node/mysystem2/mysystem2.html');
};

/**
 * Returns whether this step type can be special exported
 * @return a boolean value
 */
Mysystem2Node.prototype.canSpecialExport = function() {
    return true;
};

/**
 * Get the tag map functions that are available for this step type
 */
Mysystem2Node.prototype.getTagMapFunctions = function() {
	//get all the tag map function for this step type
	var tagMapFunctions = Mysystem2Node.tagMapFunctions;
	
	return tagMapFunctions;
};

//Add this node to the node factory so the vle knows it exists.
NodeFactory.addNode('Mysystem2Node', Mysystem2Node);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/mysystem2/Mysystem2Node.js');
};