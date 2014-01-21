/*
 * This a template Node that developers can use to create new 
 * step types. Copy this file and rename it to 
 *
 * <new step type>Node.js
 * e.g. for example if you are creating a quiz step type it would
 * look something like QuizNode.js
 * 
 * and then in this file change all occurrences of the word 'TemplateNode' to 
 * 
 * <new step type>Node
 * 
 * e.g. for example if you are creating a quiz step type you would
 * change it to be QuizNode
 */

TableNode.prototype = new Node(); //TODO: rename TemplateNode
TableNode.prototype.constructor = TableNode; //TODO: rename both occurrences of TableNode
TableNode.prototype.parentNode = Node.prototype; //TODO: rename TemplateNode
TableNode.prototype.i18nEnabled = true;
TableNode.prototype.i18nPath = "vle/node/table/i18n/";
TableNode.prototype.supportedLocales = {
	"en_US":"en_US",
	"es":"es",
	"nl":"nl",
	"nl_GE":"nl",
	"nl_DE":"nl"		
};

/*
 * the name that displays in the authoring tool when the author creates a new step
 * 
 * TODO: rename TemplateNode
 * TODO: rename Template to whatever you would like this step to be displayed as in
 * the authoring tool when the author creates a new step
 */
TableNode.authoringToolName = "Table"; 

TableNode.authoringToolDescription = "Students fill out a table"; //TODO: rename TemplateNode

TableNode.tagMapFunctions = [
	{functionName:'importWork', functionArgs:[]},
	{functionName:'showPreviousWork', functionArgs:[]},
	{functionName:'importWorkFromBox2d', functionArgs:['showTestedMassValuesOnly', 'showTestedLiquidValuesOnly','arrColumnNamesToImport','arrColumnNamesToDisplay']},
	{functionName:'importWorkFromNetLogo', functionArgs:['arrColumnNamesToImport', 'arrColumnNamesToDisplay']}
];

/**
 * This is the constructor for the Node
 * 
 * TODO: rename TemplateNode
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 */
function TableNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
	
	this.tagMapFunctions = this.tagMapFunctions.concat(TableNode.tagMapFunctions);
}

/**
 * This function is called when the vle loads the step and parses
 * the previous student answers, if any, so that it can reload
 * the student's previous answers into the step.
 * 
 * TODO: rename TemplateNode
 * 
 * @param stateJSONObj
 * @return a new state object
 */
TableNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	/*
	 * TODO: rename TEMPLATESTATE
	 * 
	 * make sure you rename TEMPLATESTATE to the state object type
	 * that you will use for representing student data for this
	 * type of step. copy and modify the file below
	 * 
	 * wise/src/main/webapp/vle/node/template/templatestate.js
	 * 
	 * and use the object defined in your new state.js file instead
	 * of TEMPLATESTATE. for example if you are creating a
	 * quiz step type you would copy the file above to
	 * 
	 * wise/src/main/webapp/vle/node/quiz/quizstate.js
	 * 
	 * and in that file you would define QUIZSTATE and therefore
	 * would change the TEMPLATESTATE to QUIZSTATE below
	 */ 
	return TableState.prototype.parseDataJSONObj(stateJSONObj);
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
 * TODO: rename TemplateNode
 * 
 * @param studentWork
 * @return translated student work
 */
TableNode.prototype.translateStudentWork = function(studentWork) {
	return studentWork;
};

/**
 * This function is called when the student exits the step. It is mostly
 * used for error checking.
 * 
 * TODO: rename TemplateNode
 * 
 * Note: In most cases you will not have to change anything here.
 */
TableNode.prototype.onExit = function() {
	try {
		//check if the content panel has been set
		if(this.contentPanel) {
			
			if(this.contentPanel.save) {
				//tell the content panel to save
				this.contentPanel.save();
			}
			
			/*
			 * check if the onExit function has been implemented or if we
			 * can access attributes of this.contentPanel. if the user
			 * is currently at an outside link, this.contentPanel.onExit
			 * will throw an exception because we aren't permitted
			 * to access attributes of pages outside the context of our
			 * server.
			 */
			if(this.contentPanel.onExit) {
				//run the on exit cleanup
				this.contentPanel.onExit();	
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
 * TODO: rename TemplateNode
 * Note: you may need to add code to this function if the student
 * data for your step is complex or requires additional processing.
 * look at SensorNode.renderGradingView() as an example of a step that
 * requires additional processing
 */
TableNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	//create the table object so we can reference the content later
	var table = new Table(this, this.view);
	
	//get the div id
	var divId = displayStudentWorkDiv.attr('id');
	
	/*
	 * Get the latest student state object for this step
	 * TODO: rename templateState to reflect your new step type
	 * 
	 * e.g. if you are creating a quiz step you would change it to quizState
	 */
	var tableState = nodeVisit.getLatestWork();
	
	//get the step work id from the node visit
	var stepWorkId = nodeVisit.id;
	
	//get the student response
	var response = tableState.response;
	response = this.view.replaceSlashNWithBR(response);
	
	if(childDivIdPrefix == null) {
		childDivIdPrefix = '';
	} else if(childDivIdPrefix != null && childDivIdPrefix != '') {
		//add an _ after the child prefix if the child prefix is not empty string
		childDivIdPrefix += '_';
	}
	
	//div to display the title
	var tableTitleDiv = createElement(document, 'div', {id: divId + '_' + childDivIdPrefix + 'tableTitleDiv_' + stepWorkId});
	
	//div to display the table
	var tableTableDataDiv = createElement(document, 'div', {id: divId + '_' + childDivIdPrefix + 'tableTableDataDiv_' + stepWorkId});
	
	//div to display a new line
	var newLineDiv = createElement(document, 'div', {id: divId + '_' + childDivIdPrefix + 'newLineDiv_' + stepWorkId});
	
	//div to display the graph options if the student was required to select them
	var tableGraphOptionsDiv = createElement(document, 'div', {id: divId + '_' + childDivIdPrefix + 'tableGraphOptionsDiv_' + stepWorkId});
	
	//div to display a new line
	var newLine2Div = createElement(document, 'div', {id: divId + '_' + childDivIdPrefix + 'newLineDiv_' + stepWorkId});
	
	var graphDiv = null;
	var newLine3Div = null;
	
	if(table.isGraphingEnabled() && tableState.graphRendered) {
		//div to display the graph
		graphDiv = createElement(document, 'div', {id: divId + '_' + childDivIdPrefix + 'graphDiv_' + stepWorkId, style: 'width:450px; height:250px'});
		
		//div to display a new line
		newLine3Div = createElement(document, 'div', {id: divId + '_' + childDivIdPrefix + 'newLine2Div_' + stepWorkId});
	}
	
	//div to display the student response
	var tableResponseDiv = createElement(document, 'div', {id: divId + '_' + childDivIdPrefix + 'tableResponseDiv_' + stepWorkId});
	
	displayStudentWorkDiv.append(tableTitleDiv);
	displayStudentWorkDiv.append(tableTableDataDiv);
	displayStudentWorkDiv.append(newLineDiv);
	
	if(table.isGraphingEnabled() && tableState.graphRendered) {
		var graphOptions = tableState.graphOptions;
		var graphSelectAxesType = graphOptions.graphSelectAxesType;
		var graphWhoSetAxesLimitsType = graphOptions.graphWhoSetAxesLimitsType;
		
		if(graphSelectAxesType == 'studentSelect' || graphWhoSetAxesLimitsType == 'studentSelect') {
			/*
			 * the step has the student select the axes or the axes limits
			 * so we will add the div that we will insert that data into
			 */
			
			//add the graph options div
			displayStudentWorkDiv.append(tableGraphOptionsDiv);
			
			//display a new line
			displayStudentWorkDiv.append(newLine2Div);
		}
		
		//add the graph div
		displayStudentWorkDiv.append(graphDiv);
		
		var loading = this.view.getI18NString('loading', 'TableNode');
		
		//display a loading message in the div, this will be overwritten by the graph
		$(graphDiv).html(loading);
		
		//display a new line
		displayStudentWorkDiv.append(newLine3Div);
	}

	displayStudentWorkDiv.append(tableResponseDiv);

	if(tableState.tableOptions != null && tableState.tableOptions.title != null) {
		//set the title
		$(tableTitleDiv).html(tableState.tableOptions.title);		
	}
	
	//add the table
	$(tableTableDataDiv).html(tableState.getTableHtml());
	
	//newline to separate the graph from the response
	$(newLineDiv).append('<br>');
	
	if(table.isGraphingEnabled() && tableState.graphRendered) {
		//get the graph options
		var graphOptions = tableState.graphOptions;
		var graphSelectAxesType = graphOptions.graphSelectAxesType;
		var columnToAxisMappings = graphOptions.columnToAxisMappings;
		var graphWhoSetAxesLimitsType = graphOptions.graphWhoSetAxesLimitsType;
		var axesLimits = graphOptions.axesLimits;
		
		if(graphSelectAxesType != null) {
			if(graphSelectAxesType == 'studentSelect') {
				//the student selected the axes
				if(columnToAxisMappings != null) {
					
					//loop through all the column to axis mappings
					for(var x=0; x<columnToAxisMappings.length; x++) {
						var columnToAxisMapping = columnToAxisMappings[x];
						
						if(columnToAxisMapping != null) {
							//get the column axis e.g. x or y
							var columnAxis = columnToAxisMapping.columnAxis;
							
							//get the column index
							var columnIndex = columnToAxisMapping.columnIndex;
							
							//get the column header
							var columnHeader = table.getColumnHeaderByIndex(columnIndex, tableState.tableData);
							
							//display the axis and the column header for that axis
							$(tableGraphOptionsDiv).append(columnAxis + ': ' + columnHeader + '<br>');
						}
					}
				}
			}
		}
		
		if(graphWhoSetAxesLimitsType != null) {
			if(graphWhoSetAxesLimitsType == 'studentSelect') {
				//the student selected the axes limits
				if(axesLimits != null) {
					var xMin = axesLimits.xMin;
					var xMax = axesLimits.xMax;
					var yMin = axesLimits.yMin;
					var yMax = axesLimits.yMax;
					
					var x_min = this.view.getI18NString('x_min', 'TableNode');
					var x_max = this.view.getI18NString('x_max', 'TableNode');
					var y_min = this.view.getI18NString('y_min', 'TableNode');
					var y_max = this.view.getI18NString('y_max', 'TableNode');
					
					//display the min/max values
					$(tableGraphOptionsDiv).append(x_min + ': ' + xMin + '<br>');
					$(tableGraphOptionsDiv).append(x_max + ': ' + xMax + '<br>');
					$(tableGraphOptionsDiv).append(y_min + ': ' + yMin + '<br>');
					$(tableGraphOptionsDiv).append(y_max + ': ' + yMax + '<br>');
				}
			}
		}
		
		var isRenderGradingView = true;
		
		//display the graph in the div
		table.makeGraph($(graphDiv), tableState.tableData, tableState.graphOptions, isRenderGradingView);
	}
	
	//add the response
	$(tableResponseDiv).html(response);
};

/**
 * Get the html file associated with this step that we will use to
 * display to the student.
 * 
 * TODO: rename TemplateNode
 * 
 * @return a content object containing the content of the associated
 * html for this step type
 */
TableNode.prototype.getHTMLContentTemplate = function() {
	/*
	 * TODO: rename both occurrences of template
	 * 
	 * e.g. if you are creating a quiz step you would change it to
	 * 
	 * node/quiz/quiz.html
	 */
	return createContent('node/table/table.html');
};

/**
 * Get the html string representation of the student work
 * @param work the student node state that we want to display
 * @return an html string that will display the student work
 */
TableNode.prototype.getStudentWorkHtmlView = function(work) {
	//make an instance of the Table
	var table = new Table(this, this.view);
	
	//get the html representation of the student work
	var html = table.getStudentWorkHtmlView(work);
	
	return html;
};

/**
 * Render the summary view into the dom element
 * @param workgroupIdToWork mapping of workgroup id to student work for the step
 * @param dom the dom element to render the summary view into
 * @param graphType the type of graph bar or pie
 * @param showAllPeriods whether we are showing student work from all periods or just
 * a single period
 */
TableNode.prototype.renderSummaryView = function(workgroupIdToWork, dom, graphType, showAllPeriods) {
	var view = this.view;
	var nodeId = this.id;
	if (dom == null) {
		dom=$("#summaryContent");
	}
	this.displayStepGraph(nodeId, dom, workgroupIdToWork, graphType, showAllPeriods);
};

/**
 * Display graph (bar graph) for a particular step in step filter mode, like bar graph in MC node filter
 * 
 * @param nodeId ID of step that is filtered and should show the bar graph.
 * @param dom dom to render the summary into
 * @param workgroupIdToWork the id of the workgroup to work mapping
 * @param graphType the type of graph (bar or pie)
 * @param showAllPeriods whether we are showing student work from all periods or just
 * a single period
 */
TableNode.prototype.displayStepGraph = function(nodeId, dom, workgroupIdToWork, graphType, showAllPeriods) {
	if(showAllPeriods) {
		//we will show all the periods
		
		//get all the users in the class as objects
		var studentsInClass = this.view.getUserAndClassInfo().getUsersInClass();
		
		//create the label for all periods
		var allPeriodsLabel = "All Periods";
		
		//create the aggregrate graph for the whole class
		this.createAggregateGraphForStudents(dom, studentsInClass, workgroupIdToWork, graphType, allPeriodsLabel);

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
TableNode.prototype.createAggregateGraphForStudents = function(dom, students, workgroupIdToWork, graphType, periodLabel) {
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
TableNode.prototype.createAggregateGraph = function(dom, workArray, graphType, periodLabel) {
	/*
	 * an array that will contain the aggregate data objects.
	 * if the student is allowed to choose a title for the table using the
	 * drop down, this array will contain an aggregate data object
	 * for each title.
	 * if the student is not allowed to choose a title for the table using
	 * the drop down, this array will only contain one aggregate data object.
	 */
	var aggregateDataArray = [];
	
	/*
	 * loop through all the workgroup ids in the class and accumulate
	 * the data
	 */
	for(var z=0; z<workArray.length; z++) {
		
		//get the work
		var work = workArray[z];
		
		if(work != null) {
			//get the table data and table and graph options from the student work
			var tableData = work.tableData;
			var tableOptions = work.tableOptions;
			var graphOptions = work.graphOptions;
			
			//get the title, if any. this may be null
			var title = tableOptions.title;
			
			//get the aggregate data object with the given title
			var aggregateDataObject = this.getAggregateDataObjectByTitle(aggregateDataArray, title);

			//get the column indexes for the x and y columns that are graphed
			var columnToAxisMappings = graphOptions.columnToAxisMappings;
			var xColumn = this.getColumnIndexByColumnAxis(columnToAxisMappings, 'x');
			var yColumn = this.getColumnIndexByColumnAxis(columnToAxisMappings, 'y');
			
			aggregateDataObject.xHeader = tableData[xColumn][0];
			aggregateDataObject.yHeader = tableData[yColumn][0];
			
			//get the number of columns and rows in the table
			var numColumns = tableData.length;
			var numRows = tableData[0].length;
			
			//get the label to count array for this aggregate data object
			var labelToCountArray = aggregateDataObject.labelToCount;
			
			/*
			 * loop through the rows. we will skip the first row because
			 * that is the header row.
			 */
			for(var y=1; y<numRows; y++) {
				//get the cell in the x column and the cell in the y column
				var xCell = tableData[xColumn][y];
				var yCell = tableData[yColumn][y];
				
				//get the text in the cells
				var xText = xCell.text + '';
				var yText = yCell.text;
				
				if(xText != null && xText != '' && yText != null && yText != '') {
					if(graphType.indexOf('bar') != -1 || graphType.indexOf('pie') != -1) {
						var firstChar = xText.charAt(0);
						
						if(!isNaN(firstChar)) {
							//first char is a number
							xText = 'Error: ' + xText;
						}
					}
					
					//get the label to count object
					var labelToCountObject = this.getLabelToCountObjectByLabel(labelToCountArray, xText);
					
					//make sure the yText is a valid number
					if(!isNaN(yText)) {
						//accumulate the count
						labelToCountObject.count += parseFloat(yText);						
					}
				}
			}
		}
	}
	
	if(graphType.indexOf('Graph') == -1) {
		graphType += 'Graph';
	}
	
	//display the aggregate graph in the div
	this.displayAggregateGraph(dom, aggregateDataArray, graphType, periodLabel);
};

/**
 * Get the aggregate data object by the title. Create the aggregate data
 * object if it does not exist.
 * @param aggregateDataArray the array of aggregate data objects
 * @param title the title of the aggregate data object
 * @return the aggregate data object with the given title
 */
TableNode.prototype.getAggregateDataObjectByTitle = function(aggregateDataArray, title) {
	var aggregateDataObject = null;
	
	//loop through all the aggregate data objects
	for(var x=0; x<aggregateDataArray.length; x++) {
		//get an aggregate data object
		var tempAggregateDataObject = aggregateDataArray[x];
		
		if(tempAggregateDataObject.title == title) {
			//we found the one with the title we want
			aggregateDataObject = tempAggregateDataObject;
			break;
		}
	}
	
	if(aggregateDataObject == null) {
		//create the aggregate data object since it does not exist
		aggregateDataObject = {
			title:title,
			labelToCount:[],
			xHeader:'',
			yHeader:''
		};
		
		//add the new aggregate data object to the array
		aggregateDataArray.push(aggregateDataObject);
	}
	
	return aggregateDataObject;
};

/**
 * Get the column index given the column axis
 * @param columnToAxisMappings an array that contains the mappings between
 * the column axis to column index
 * @param columnAxis the column axis e.g. 'x' or 'y'
 * @return the column index for the given column axis or null if not found
 */
TableNode.prototype.getColumnIndexByColumnAxis = function(columnToAxisMappings, columnAxis) {
	var columnIndex = null;
	
	//loop through all the mappings
	for(var x=0; x<columnToAxisMappings.length; x++) {
		//get a mapping
		var columnToAxisObject = columnToAxisMappings[x];
		
		//get the column axis
		var tempColumnAxis = columnToAxisObject.columnAxis;
		
		//get the column index
		var tempColumnIndex = columnToAxisObject.columnIndex;
		
		if(columnAxis == tempColumnAxis) {
			/*
			 * we have found the column axis we want so we will
			 * get the column index
			 */
			columnIndex = tempColumnIndex;
		}
	}
	
	return columnIndex;
};

/**
 * Get the label to count object by the label
 * @param labelToCountArray the array that contains all the label to count objects
 * @param label the label to retrieve the label to count object for
 * @return the label to count object or null if not found
 */
TableNode.prototype.getLabelToCountObjectByLabel = function(labelToCountArray, label) {
	var labelToCountObject = null;
	
	//loop through the label to count array
	for(var x=0; x<labelToCountArray.length; x++) {
		//get a label to count object
		var tempLabelToCount = labelToCountArray[x];
		
		if(label != null && tempLabelToCount != null && tempLabelToCount.label != null) {
			if(label.toLowerCase() == tempLabelToCount.label.toLowerCase()) {
				//we found the object with the label we want
				labelToCountObject = tempLabelToCount;
				break;
			}
		}
	}
	
	if(labelToCountObject == null) {
		/*
		 * we did not find a label to count object with the label we want
		 * so we will create it
		 */
		labelToCountObject = {
			label:label,
			count:0
		}
		
		//add the new label to count object to the array
		labelToCountArray.push(labelToCountObject);
	}
	
	return labelToCountObject;
};

/**
 * Display the aggregate graph in the given dom element
 * @param dom the dom element to render the graph in
 * @param aggregateDataArray the aggregate data array. each element in
 * this array contains the data for a single aggregate graph.
 * @param graphType the graph type to display the aggregate data
 * @param periodLabel (optional) the period label to display above the graph
 */
TableNode.prototype.displayAggregateGraph = function(dom, aggregateDataArray, graphType, periodLabel) {
	//create a Table object so we can call the makeGraph() function
	var table = new Table(this);
	
	//create the graph options to create the parameters for displaying the graph
	var graphOptions = {
		columnToAxisMappings:[
			{columnIndex:0, columnAxis:'x'},
			{columnIndex:1, columnAxis:'y'}
		],
		enableGraphing:true,
		graphSelectAxesType:'authorSelect',
		graphType:graphType,
		graphWhoSetAxesLimitsType:'auto'
	};
	
	/*
	 * loop through all the aggregate data objects. if the student is allowed
	 * to choose the table title using the drop down, there will be multiple
	 * graphs to display. if the student is not allowed to choose the table
	 * title using the drop down, there will only be on graph to display.
	 */
	for(var x=0; x<aggregateDataArray.length; x++) {
		//get an aggregate data object
		var tempAggregateData = aggregateDataArray[x];
		
		//get the data values from the aggregate data object
		var title = tempAggregateData.title;
		var labelToCount = tempAggregateData.labelToCount;
		var xHeader = tempAggregateData.xHeader;
		var yHeader = tempAggregateData.yHeader;
		
		var aggregateTableData = [];
		
		//create two columns in the table data
		aggregateTableData[0] = [];
		aggregateTableData[1] = [];
		
		//set the xHeader in the top cell in the x column
		aggregateTableData[0][0] = xHeader;
		
		//set the yHeader in the top cell in the y column
		aggregateTableData[1][0] = yHeader;
		
		//loop through all the label to count objects
		for(var i=0; i<labelToCount.length; i++) {
			//get a label to count object
			var tempLabelToCount = labelToCount[i];
			
			//get the label
			var label = tempLabelToCount.label;
			
			//get the count
			var count = tempLabelToCount.count;
			
			/*
			 * set the label and count in the row. in the example below
			 * color and count are the header cells for the x and y column
			 * and red and 1 are the label and count we are setting. we need
			 * to use i + 1 because we do not want to overwrite the header
			 * row values so we need to start inserting data into row 1 and
			 * not row 0.
			 * 
			 * e.g.
			 * 
			 * color|count
			 * -----------
			 * red  |  1
			 * 
			 */
			aggregateTableData[0][i + 1] = {text:label};
			aggregateTableData[1][i + 1] = {text:count + ""};
		}
		
		//create the container that will contain the period label div and graph div
		var aggregateContainerDiv = $("<div id='aggregateContainer_" + x + "'></div>");
		
		//surround the container div with a border
		aggregateContainerDiv.css('border-style', 'solid');
		aggregateContainerDiv.css('border-width', '1px');

		if(periodLabel != null) {
			//append the period label
			aggregateContainerDiv.append("<p>" + periodLabel + "</p>");
		}
		
		//create a new div to display the graph in
		var tempAggregateDiv = $("<div id='aggregate_" + x + "'></div>");
		
		//add the div to the container
		aggregateContainerDiv.append(tempAggregateDiv);
		
		//append this new div into the aggregateWorkDiv div 
		dom.append(aggregateContainerDiv);
		
		//set the title of the graph
		graphOptions.title = title;
		
		//render the graph in the div
		table.makeGraph(tempAggregateDiv, aggregateTableData, graphOptions, true);
	}
	
	//make the aggregateWorkDiv visible
	dom.show();
};

/**
 * Returns whether this step type can be special exported
 * @return a boolean value
 */
TableNode.prototype.canSpecialExport = function() {
	return true;
};

/**
 * Check if the student has completed the step. We will just check
 * if there are any node states and if there are, the student
 * has completed the step.
 * 
 * @param nodeVisits the student node visits for the step
 * 
 * @return whether the student has completed the step or not
 */
TableNode.prototype.isCompleted = function(nodeVisits) {
	var result = false;

	if(nodeVisits != null) {
		//loop through all the node visits
		for(var x=0; x<nodeVisits.length; x++) {
			//get a node visit
			var nodeVisit = nodeVisits[x];
			
			if(nodeVisit != null) {
				//get the node states
				var nodeStates = nodeVisit.nodeStates;
				
				if(nodeStates != null) {
					if(nodeStates.length > 0) {
						//there are node states so the student has completed the step
						result = true;
					}
				}
			}
		}
	}

	return result;
};

/*
 * Add this node to the node factory so the vle knows it exists.
 * TODO: rename both occurrences of TemplateNode
 * 
 * e.g. if you are creating a quiz step you would change it to
 * 
 * NodeFactory.addNode('QuizNode', QuizNode);
 */
NodeFactory.addNode('TableNode', TableNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename template to your new folder name
	 * TODO: rename TemplateNode
	 * 
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/QuizNode.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/table/TableNode.js');
};