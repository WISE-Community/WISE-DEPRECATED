/*
 * This is a template state object that developers can use to create new
 * step types.
 *
 * TODO: Copy this file and rename it to
 * 
 * <new step type>state.js
 * e.g. for example if you are creating a quiz step it would look
 * something like quizstate.js
 *
 * and then put the new file into the new folder
 * you created for your new step type
 *
 * your new folder will look something like
 * vlewrapper/WebContent/vle/node/<new step type>/
 *
 * e.g. if you are creating a quiz step it would look something like
 * vlewrapper/WebContent/vle/node/quiz/
 * 
 * TODO: in this file, change all occurrences of the word 'TEMPLATESTATE' to
 * 
 * <new step type>STATE
 * e.g. for example if you are creating a quiz step it would look
 * something like QUIZSTATE
 */

/**
 * This is the constructor for the state object that will be used to represent the
 * student work. An instance of this object will be created each time the student
 * submits an answer.
 * 
 * TODO: rename TEMPLATESTATE
 * 
 * note: you can change the variables in this constructor, the response variable
 * is just used as an example. you can add any variables that will help you 
 * represent the student's work for your step type.
 * 
 * @constructor
 */
function TableState(response, tableData, graphRendered, graphOptions, tableOptions, timestamp) {
	//the text response the student wrote
	this.response = "";
	
	//the table data that contains the values in the table as well as settings
	this.tableData = [];
	
	this.graphRendered = false;
	
	this.graphOptions = null;

	if(response != null) {
		//set the response
		this.response = response;
	}
	
	if(tableData != null) {
		//set the table data
		this.tableData = tableData;
	}
	
	if(graphRendered) {
		//set whether the student has rendered the graph
		this.graphRendered = graphRendered;
	}
	
	if(graphOptions != null) {
		//set the graph options used to render the graph
		this.graphOptions = graphOptions;
	}
	
	if(tableOptions != null) {
		//set the tableOptions
		this.tableOptions = tableOptions;
	}

	if(timestamp != null) {
		//use the timestamp that was provided
		this.timestamp = timestamp;
	} else {
		//set the timestamp to the current time
		this.timestamp = (new Date()).getTime();		
	}
};

/**
 * This function is used to reload previous work the student submitted for the step.
 * The student work is retrieved and then this function is called to parse the student
 * work so that we can display the previous answer the student submitted.
 * 
 * TODO: rename TEMPLATESTATE
 * 
 * note: you can change the variables in the stateJSONObj, the response 
 * variable is just used as an example. you can add any variables that will  
 * help you represent the student's work for your type of step.
 * 
 * @param stateJSONObj a JSONObject representing the student work
 * @return a TEMPLATESTATE object
 */
TableState.prototype.parseDataJSONObj = function(stateJSONObj) {
	//obtain the student response from the JSONObject
	var response = stateJSONObj.response;
	
	//obtain the student table data
	var tableData = stateJSONObj.tableData;
	
	//obtain whether the student rendered the graph or not
	var graphRendered = stateJSONObj.graphRendered;
	
	//obtain the graph options used to render the graph
	var graphOptions = stateJSONObj.graphOptions;
	
	//obtain the drop down title
	var tableOptions = stateJSONObj.tableOptions;
	
	//obtain the timestamp
	var timestamp = stateJSONObj.timestamp;
	
	/*
	 * create a state object with the student work
	 * TODO: rename TEMPLATESTATE
	 */
	var tableState = new TableState(response, tableData, graphRendered, graphOptions, tableOptions, timestamp);
	
	//return the state object
	return tableState;
};

/**
 * Get the student work for display purposes such as in the grading tool.
 * 
 * TODO: rename TEMPLATESTATE
 * 
 * @return the student work
 */
TableState.prototype.getStudentWork = function() {
	var studentWork = this;
	
	return studentWork;
};

/**
 * Get the html for the table. This table is only for display purposes
 * and will be completely static. The grading tool utilizes this function.
 * @return the html for the table
 */
TableState.prototype.getTableHtml = function() {
	var numRows = 0;
	var numColumns = 0;
	
	/*
	 * get the first column of the table data so we can find out
	 * how many rows are in the table
	 */
	var firstColumn = this.tableData[0];
	
	if(firstColumn != null) {
		//get the number of rows
		numRows = firstColumn.length;		
	}
	
	//get the number of columns
	numColumns = this.tableData.length;
	
	var tableHtml = "";
	
	//make the table
	tableHtml += "<table style='border-width:1px; border-style:outset'>"
	
	//loop through all the rows
	for(var y=0; y<numRows; y++) {
	
		tableHtml += "<tr>";
		
		//loop through all the columns
		for(var x=0; x<numColumns; x++) {
			tableHtml += "<td style='border-width:1px; border-style:inset; width:20px; height:20px'>";
			
			if(this.tableData != null && this.tableData[x] != null &&
					this.tableData[x][y] != null && this.tableData[x][y].text != null) {
				
				//get the text that we will display in the cell
				var cellText = this.tableData[x][y].text;
				
				if(cellText == null || cellText == '') {
					//set the text to &nbsp if it is null or empty string
					cellText = '&nbsp';
				}
				
				//add the cell text
				tableHtml += cellText;
			}
			
			tableHtml += "</td>";
		}
		
		tableHtml += "</tr>";
	}
	
	tableHtml += "</table>";
	
	return tableHtml;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	//TODO: rename template/templatestate.js
	eventManager.fire('scriptLoaded', 'vle/node/table/tablestate.js');
}