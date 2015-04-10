/*
 * MultipleChoiceNode
 */

MultipleChoiceNode.prototype = new Node();
MultipleChoiceNode.prototype.constructor = MultipleChoiceNode;
MultipleChoiceNode.prototype.parent = Node.prototype;
MultipleChoiceNode.authoringToolName = "Multiple Choice";
MultipleChoiceNode.authoringToolDescription = "Students answer a multiple choice question";
MultipleChoiceNode.prototype.i18nType = "MultipleChoiceNode";
MultipleChoiceNode.prototype.i18nEnabled = true;
MultipleChoiceNode.prototype.i18nPath = "vle/node/multiplechoice/i18n/";
MultipleChoiceNode.prototype.supportedLocales = {
	"en_US":"en_US",
	"es":"es",
	"iw":"he",
	"ko":"ko",
	"nl":"nl",
	"nl_GE":"nl",
	"nl_DE":"nl",
	"zh_CN":"zh_CN"
};

MultipleChoiceNode.tagMapFunctions = [
	{functionName:'importWork', functionArgs:[]},
	{functionName:'showPreviousWork', functionArgs:[]}
];

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {MultipleChoiceNode}
 */
function MultipleChoiceNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	
	//mainly used for the ticker
	this.mc = null;
	this.contentBase;
	this.contentPanel;
	this.prevWorkNodeIds = [];
	
	this.tagMapFunctions = this.tagMapFunctions.concat(MultipleChoiceNode.tagMapFunctions);
};

/**
 * Takes in a state JSON object and converts it into an MCSTATE object
 * @param stateJSONObj a state JSON object
 * @return an MCSTATE object
 */
MultipleChoiceNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	return MCSTATE.prototype.parseDataJSONObj(stateJSONObj);
};

/**
 * Retrieves the latest student work for this node and returns it in
 * a query entry object
 * @param vle the vle that this node has been loaded into, this vle
 * 		is related to a specific student, so all the work in this vle
 * 		is for just one student
 * @return a MultipleChoiceQueryEntry that contains the latest student
 * 		work for this node. return null if this student has not accessed
 * 		this step yet.
 */
MultipleChoiceNode.prototype.getLatestWork = function(vle) {
	var latestState = null;
	
	//setup the mc object by loading in the content of the step
	this.mc = new MC(loadXMLString(this.element.getElementsByTagName("jaxbXML")[0].firstChild.nodeValue));
	
	//load the states from the vle into the mc object
	this.mc.loadForTicker(this, vle);
	
	//get the most recent student work for this step
	latestState = this.mc.getLatestState(this.id);
	
	if(latestState == null) {
		//the student has not accessed or completed this step yet
		return null;
	}
	
	//create and return a query entry object
	return new MultipleChoiceQueryEntry(vle.getWorkgroupId(), vle.getUserName(), this.id, this.mc.promptText, latestState.getIdentifier(), this.mc.getCHOICEByIdentifier(latestState.getIdentifier()).text);
};

/**
 * Get the html string representation of the student work
 * @param work the student node state that we want to display
 * @return an html string that will display the student work
 */
MultipleChoiceNode.prototype.getStudentWorkHtmlView = function(work) {
	var latestState = work;
	var html = '';
	
	if(latestState != null && typeof latestState == 'object') {
		//get the student response as a string
		html = latestState.response + '';
	}
	
	return html;
};
/**
 * Returns the prompt for this node by loading the MC content and then
 * obtaining it from the MC
 * @return the prompt for this node
 */
MultipleChoiceNode.prototype.getPrompt = function() {
	var prompt = "";
	
	if(this.content != null) {
		//get the content for the node
		var contentJSON = this.content.getContentJSON();

		//see if the node content has an assessmentItem
		if(contentJSON != null && contentJSON.assessmentItem != null) {
			//obtain the prompt
			var assessmentItem = contentJSON.assessmentItem;
			var interaction = assessmentItem.interaction;
			prompt = interaction.prompt;	
		}
	}
				
	//return the prompt
	return prompt;
};

/**
 * Create a query container that will contain all the query entries
 * @param vle the vle that this node has been loaded into, this vle
 * 		is related to a specific student, so all the work in this vle
 * 		is for just one student
 * @return a MultipleChoiceQueryContainer that will contain all the
 * 		query entries for a specific nodeId as well as accumulated 
 * 		metadata about all those entries such as count totals, etc.
 */
MultipleChoiceNode.prototype.makeQueryContainer = function(vle) {
	//setup the mc object by loading in the content of the step
	this.mc = new MC(loadXMLString(this.element.getElementsByTagName("jaxbXML")[0].firstChild.nodeValue));
	
	//load the states from the vle into the mc object
	this.mc.loadForTicker(this, vle);
	
	//create and return a query container object
	return new MultipleChoiceQueryContainer(this.id, this.mc.promptText, this.mc.choiceToValueArray);
};

/**
 * Returns the human readable value of the work
 * @param studentWork the human readable answer
 * @return the human readable value of the choice the student chose
 */
MultipleChoiceNode.prototype.translateStudentWork = function(studentWork) {
	return studentWork;
};

MultipleChoiceNode.prototype.onExit = function() {
	
};

MultipleChoiceNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/multiplechoice/multiplechoice.html');
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
 */
MultipleChoiceNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	//create the multiple choice object so we can reference the content later
	var multipleChoice = new MC(this, this.view);
	
	//get the latest state
	var state = nodeVisit.getLatestWork();
	
	var studentWork = "";
	
	//check if there were any choices chosen
	if(state.response) {
		//loop through the array of choices
		for(var x=0; x<state.response.length; x++) {
			if(studentWork != "") {
				//separate each choice with a comma
				studentWork += ", ";
			}
			
			//add the choice to the student work
			studentWork += state.response[x];
		}
		
		if(state.score != null){
			//get the max score
			var maxScore = multipleChoice.getMaxPossibleScore();
			
			var auto_graded_score = this.view.getI18NString('auto_graded_score', 'MultipleChoiceNode');
			
			studentWork += "<br><br>";
			studentWork += auto_graded_score + ": " + state.score + "/" + maxScore;
		}
	}
	
	displayStudentWorkDiv.html(studentWork);
};

/**
 * Renders the summary of all students' work into the div. The grading tool will pass in a
 * div id to this function and this function will insert the student data
 * into the div.
 * 
 * @param divId the id of the div we will render the student work into
 * @param nodeVisit the student work
 * @param childDivIdPrefix (optional) a string that will be prepended to all the 
 * div ids use this to prevent DOM conflicts such as when the show all work div
 * uses the same ids as the show flagged work div
 * @param workgroupIdToWork the id of the workgroup to work mapping
 * @param dom dom to render the summary into
 * @param graphType bar|pie|barpie
 * @param showAllPeriods whether we are showing student work from all periods or just
 * a single period
 */
MultipleChoiceNode.prototype.renderSummaryView = function(workgroupIdToWork, dom, graphType, showAllPeriods) {
	var view = this.view;
	var nodeId = this.id;
	if (dom == null) {
		dom=$("#summaryContent");
	}
	this.displayStepGraph(nodeId, dom, workgroupIdToWork, graphType, showAllPeriods);
};

/**
 * Determine whether the student has completed the step or not
 * @param nodeState the latest node state for the step
 * @return whether the student has completed the step or not
 */
MultipleChoiceNode.prototype.isCompleted = function(nodeVisits) {
	var result = false;
	
	var nodeState = this.view.getLatestNodeStateWithWorkFromNodeVisits(nodeVisits);
	
	if(nodeState != null && nodeState != '') {
		var content = this.content.getContentJSON();
		
		if(content!= null &&
				content.assessmentItem != null &&
				content.assessmentItem.responseDeclaration != null &&
				content.assessmentItem.responseDeclaration.correctResponse != null &&
				content.assessmentItem.responseDeclaration.correctResponse.length > 0) {
			/*
			 * this step has a correct answer so we will check if the
			 * student answered correctly
			 */
			if(nodeState.isCorrect) {
				result = true;
			}
		} else {
			result = true;
		}
	}
	
	return result;
};

/**
 * Display graph for a particular step in step filter mode, like bar graph in MC node filter
 * 
 * @param nodeId ID of step that is filtered and should show the bar graph.
 * @param dom dom to render the summary into
 * @param workgroupIdToWork the id of the workgroup to work mapping
 * @param graphType bar|pie|barpie
 * @param showAllPeriods whether we are showing student work from all periods or just
 * a single period
 */
MultipleChoiceNode.prototype.displayStepGraph = function(nodeId, dom, workgroupIdToWork, graphType, showAllPeriods) {
	if(showAllPeriods) {
		//we will show all the periods
		
		//get all the users in the class as objects
		var studentsInClass = this.view.getUserAndClassInfo().getUsersInClass();
		
		//create the label for all periods
		var allPeriodsLabel = "All Periods";
		
		//create the aggregrate graph for the whole class
		this.createAggregateGraphForStudents(dom, studentsInClass, workgroupIdToWork, graphType, allPeriodsLabel);

		/*
		//get the periods
		var periods = this.view.getUserAndClassInfo().getPeriods();
		
		//loop through all the periods
		for(var periodIndex=0; periodIndex<periods.length; periodIndex++) {
			//get a period
			var period = periods[periodIndex];
			
			if(period != null) {
				//get the period id, period name and period label
				var periodId = period.periodId;
				var periodName = period.periodName;
				var periodLabel = "Period " + periodName;
				
				//get all the students in the period
				var studentsInPeriod = this.view.getUserAndClassInfo().getAllStudentsInPeriodId(periodId);
				
				//create the aggregate graph for the period
				this.createAggregateGraphForStudents(dom, studentsInPeriod, workgroupIdToWork, graphType, periodLabel);
			}
		}
		*/
	} else {
		//we will show a single period
		
		//get the period id
		var periodId = this.view.getUserAndClassInfo().getPeriodId();
		
		//get the classmates in the period
		var classmatesInPeriod = this.view.getUserAndClassInfo().getAllStudentsInPeriodId(periodId);
		
		//create the aggregate graph for the period
		this.createAggregateGraphForStudents(dom, classmatesInPeriod, workgroupIdToWork, graphType);
	}
};

/**
 * Create the aggregate graph for a period
 * @param dom dom to render the summary into
 * @param students an array of students to include in the aggregate
 * @param workgroupIdToWork the id of the workgroup to work mapping
 * @param graphType the graph type to render (bar or pie)
 * @param periodLabel (optional) the period label to display above the graph
 */
MultipleChoiceNode.prototype.createAggregateGraphForStudents = function(dom, students, workgroupIdToWork, graphType, periodLabel) {
	//the array to accumulate the work for the period
	var workForPeriod = [];
	
	if(students != null && workgroupIdToWork != null) {
		//loop through all the students in the period
		for(var c=0; c<students.length; c++) {
			//get a student
			var student = students[c];
			
			//get the student workgroup id and user name
			var workgroupId = student.workgroupId;

			//get the work for the student for this step
			var work = workgroupIdToWork[workgroupId];
			
			if(work != null) {
				//add the work to the array
				workForPeriod.push(work);						
			}
		}
	}
	
	//create the aggregate graph for the period
	this.createAggregateGraph(dom, workForPeriod, graphType, periodLabel);
};

/**
 * Create the aggregate graph by accumulating the data and then displaying it
 * @param dom the dom element to display the graph in
 * @param workArray the array of student work to display in the graph
 * @param graphType the graph type (bar or pie)
 * @param periodLabel (optional) the period label to display above the graph
 */
MultipleChoiceNode.prototype.createAggregateGraph = function(dom, workArray, graphType, periodLabel) {
	//the object to store choice to count mappings
	var choiceToCount = {};
	
	for(var x=0; x<workArray.length; x++) {
		var work = workArray[x];
		
		if(work != null) {
			//get the response
			var response = work.response;
			
			if(response != null) {
				if(response instanceof Array) {
					/*
					 * the response is stored in an array so we will extract
					 * it from the array
					 */
					response = response[0];
				}
				
				if(choiceToCount[response] == null) {
					//initialize this choice to count mapping
					choiceToCount[response] = 0;
				}
				
				//increment the count for the choice
				choiceToCount[response] += 1;
			}
		}
	}
	
	//array used to hold the available choices
	var mcChoices = [];
	
	//get the step content so we can gather the choices
	var node = this.view.getProject().getNodeById(this.id);
	var stepContent = node.content.getContentJSON();

	//loop through all the choices
	for(var y=0; y<stepContent.assessmentItem.interaction.choices.length; y++){
		//get the choice text
		var mcChoiceText = stepContent.assessmentItem.interaction.choices[y].text;
		
		//add the choice text to our array of choices
		mcChoices.push(mcChoiceText);
	}
	
	//the array to contain the data rows
	var dataRows = [];
	
	//loop through all the possible choices
	for(var z=0; z<mcChoices.length; z++) {
		//get the choice text
		var choiceText = mcChoices[z];
		
		//get the count for the choice
		var count = choiceToCount[choiceText];
		
		if(count == null) {
			count = 0;
		}
		
		//parse int in case count is a string
		count = parseInt(count);

		/*
		 * create an array that contains the choice and the count
		 * because google expects it in this format
		 */
		var row = [choiceText, count];
		
		//add the row to the array of rows
		dataRows.push(row);
	}
	
	//create the google data object that will be used to graph the data
	var data = new google.visualization.DataTable();
	
	//add the two columns
	data.addColumn('string', 'Choice');
    data.addColumn('number', 'Count');
    
    //add the rows
    data.addRows(dataRows);
    
    //create a div to contain the period label and graph
    var aggregateContainerDiv = $("<div id='aggregateContainerDiv_" + x + "'></div>");
    
    //surround the container div with a border
	aggregateContainerDiv.css('border-style', 'solid');
	aggregateContainerDiv.css('border-width', '1px');
    
	if(periodLabel != null) {
		//append the period label
		aggregateContainerDiv.append("<p>" + periodLabel + "</p>");
	}
	
	//add the container div to the dom
	dom.append(aggregateContainerDiv);
	
    //create the chart div where we will render the graph
    var chartDivId = 'chartDiv';
    var chartDiv = $("<div id='" + chartDivId + "'></div>");
    
    //add the chart div to the container div
    aggregateContainerDiv.append(chartDiv);
    
    //get the chart div as an element
    var chartDivElement = chartDiv.get(0);
    
    var chart = null;
    
    //create the chart
    if(graphType == null) {
    	//default to a vertical bar graph
    	chart = new google.visualization.ColumnChart(chartDivElement);
    } else if(graphType == 'bar') {
    	//create a vertical bar graph
    	chart = new google.visualization.ColumnChart(chartDivElement);
    } else if(graphType == 'pie') {
    	//create a pie chart
    	chart = new google.visualization.PieChart(chartDivElement);
    }
    
    if(chart != null) {
        //draw the chart
        chart.draw(data);		        	
    }
    
    //make the dom element visible
    $(dom).show();
};

/**
 * Returns the criteria value for this node based on student response.
 */
MultipleChoiceNode.prototype.getCriteriaValue = function() {
	var result = null;
	var latestState = view.getLatestStateForNode(this.id);
	if(latestState != null && latestState != '' && latestState.choices != null) {
		return latestState.choices;
	}
	return result;
};

NodeFactory.addNode('MultipleChoiceNode', MultipleChoiceNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/multiplechoice/MultipleChoiceNode.js');
}