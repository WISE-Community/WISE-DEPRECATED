/**
 * @constructor
 * @param node
 * @returns
 */
function DATAGRAPH(node){
	this.node = node;
	this.content = node.getContent().getContentJSON();
	this.graphType;
	this.mode;
	this.table;
	this.organizer;
	this.range = {x:{low:0,high:0},y:{low:0,high:0}};
	
	if(this.state){
		this.table = this.state.table;
	} else {
		this.table = this.copyTable();
	}
	
	this.organizer = new DataOrganizer();
	
	if(this.content.options.display.start=='0'){
		this.mode = '0';
	} else if(this.content.options.display.which=='1' || this.content.options.display.which=='2'){
		this.mode = '1';
	} else {
		this.mode = '2';
	}
};

/**
 * Depending on the mode, renders the appropriate view.
 */
DATAGRAPH.prototype.render = function(){
	if(this.mode == '0'){
		this.renderData();
	} else if(this.mode == '1'){
		this.renderGraph();
	} else {
		this.renderData(true);
		this.renderGraph(true);
	}
	
	this.node.view.eventManager.fire('contentRenderCompleted', this.node.id, this.node);
};

/**
 * Renders the data table view.
 */
DATAGRAPH.prototype.renderData = function(both){
	if(!both){
		$('#graphDiv').hide();
	};
	
	/* set prompt */
	$('#dgPromptDiv').html(this.content.prompt);
	
	/* set title and make sure it is visible */
	$('#displayTitleDiv').html(this.table.title).show();
	
	/* set save and restore buttons visible */
	$('#saveButt,#restoreButt').show();
	
	/* set toggle button with correct text */
	if(this.content.options.display.which=='2'){
		$('#switchButt').val('Display Graph View');
	} else if(this.content.options.display.which=='3') {
		$('#switchButt').val('Display Table with Graph View');
	}
	
	if(!(this.content.options.display.which == '2' || this.content.options.display.which == '3')){
		$('#switchButt').hide();
	} else {
		$('#switchButt').show();
	}
	
	/* set up the editables based on the content */
	this.renderEditables();
	
	/* create data table */
	this.buildDataTable();
	
	/* make sure graph options are not visible if both != true */
	if(!both){
		$('#graphOptions').hide();
	}
};

/**
 * Renders the graph view.
 */
DATAGRAPH.prototype.renderGraph = function(both){
	if(!both){
		$('#tableDiv').hide();
	}
	
	/* show graph div */
	$('#graphDiv').show();
	
	/* set prompt */
	$('#dgPromptDiv').html(this.content.prompt);
	
	/* hide title */
	$('#displayTitleDiv').hide();
	
	/* hide save and restore buttons */
	if(!both){
		$('#saveButt,#restoreButt').hide();
	}
	
	/* set toggle button with correct text */
	$('#switchButt').val('Display Data Table View');
	
	/* make toggle invisible if only one mode specified */
	if(!(this.content.options.display.which == '2' || this.content.options.display.which == '3')){
		$('#switchButt').hide();
	} else {
		$('#switchButt').show();
	}
	
	/* set up the editables based on the content */
	this.renderEditables();
	
	/* set graph options visible, then set individual options based on json settings */
	$('#graphOptions').show();
	
	/* retrieve the range if is at the default value (0 for both low and high) */
	if(this.range.y.low==0 && this.range.y.high==0 && this.range.x.low==0 && this.range.x.high==0){
		this.getRange();
	}
	
	/* set the range options */
	if(this.content.options.graph.range){
		$('#rangeTable').show();
		
		/* set the range elements */
		$('#yFromRange').val(this.range.y.low);
		$('#yToRange').val(this.range.y.high);
		$('#xFromRange').val(this.range.x.low);
		$('#xToRange').val(this.range.x.high);
	} else {
		$('#rangeTable').hide();
	}
	
	/* set the graph options */
	$('#graphTypeSelect').children().remove();
	$('#graphTypeSelect').show();
	
	for(var r in this.content.options.graph){
		if(this.content.options.graph[r] && r != 'axis' && r != 'range'){
			if(!this.graphType){
				this.graphType = r;
			}
			
			$('#graphTypeSelect').append('<option id="' + r + '_Opt" value="' + r + '">' + r + '</option>');
		}
	}
	
	/* set the graph width and height */
	$('#graphContainer,#graphTitleDiv,#graphYLabel,#graphXLabel').css('width', this.table.graphWidth);
	$('#graphContainer').css('height', this.table.graphHeight);
	
	/* set the current selected option to the current type */
	$('#graphTypeSelect').val(this.graphType);

	/* draws actual graph */
	$.plot($('#graphContainer'), this.organizer.getData(this.table), this.getOptions());
	
	/* set the x and y labels and the graph title */
	$('#graphTitleDiv').html(this.table.title);
	$('#graphXLabel').html(this.table.xLabel);
	$('#graphYLabel').html(this.table.yLabel);
};

/**
 * Sets up the editable elements as specified in the content.
 */
DATAGRAPH.prototype.renderEditables = function(){
	/* set the value of the editable elements */
	$('#editTitleInput').val(this.table.title);
	$('#editXLabelInput').val(this.table.xLabel);
	$('#editYLabelInput').val(this.table.yLabel);
	
	/* show/hide title editable based on content */
	if(this.table.titleEditable){
		$('#editableTitleDiv').show();
	} else {
		$('#editableTitleDiv').hide();
	}
	
	/* show/hide xLabel editable based on content */
	if(this.table.xLabelEditable){
		$('#editableXLabelDiv').show();
	} else {
		$('#editableXLabelDiv').hide();
	}
	
	/* show/hide yLabel editable based on content */
	if(this.table.yLabelEditable){
		$('#editableYLabelDiv').show();
	} else {
		$('#editableYLabelDiv').hide();
	}
};

/**
 * Generates the html table from the json table
 */
DATAGRAPH.prototype.buildDataTable = function(){
	/* clear div */
	$('#tableDiv').children().remove();
	$('#tableDiv').show();
	
	/* create basic table structure */
	$('#tableDiv').append('<table id="dataTable"><thead id="dataTableHead"></thead><tbody id="dataTableBody"></tbody></table>');
	
	/* fillin table structure based on content */
	for(var a=0;a<this.table.rows.length;a++){
		$('#dataTableBody').append('<tr id="row_' + a + '"></tr>');
		for(var b=0;b<this.table.rows[a].cols.length;b++){
			var cell = this.table.rows[a].cols[b];
			$('#row_' + a).append('<td><input type="text" id="cell_in_' + a + '_' + b + '" onchange="updateCell(\'' + a + '\',\'' + b + '\')"></input></td>');

			/* set the value of the input if specified */
			if(cell.value){
				$('#cell_in_' + a + '_' + b).val(cell.value);
			}
			
			/* disable input if student is not allowed to edit the field */
			if(!cell.options.editable){
				$('#cell_in_' + a + '_' + b).attr('disabled', true);
			}
		}
	}
};

/**
 * Returns the cell in this table at the given x and y coordinates.
 * 
 * @param x
 * @param y
 * @return object - cell
 */
DATAGRAPH.prototype.getCell = function(x, y){
	return this.table.rows[x].cols[y];
};

/**
 * Given the x and y coordinates, updates the associated value in this
 * table with the user specified value.
 * 
 * @param x
 * @param y
 */
DATAGRAPH.prototype.updateCell = function(x, y){
	var cell = this.getCell(x,y);
	var val = $('#cell_in_' + x + '_' + y).val();
	
	/* validate input before updating, notify user if input invalid */
	if(cell.options.isLabel || !isNaN(val)){
		cell.value = val;
	} else {
		$('#cell_in_' + x + '_' + y).val(cell.value);
		this.node.view.notificationManager.notify('The cell you are entering data into only accepts numbers.',3);
	}
};

/**
 * Saves any entered data to a state. If vle exists, adds to vle.
 */
DATAGRAPH.prototype.save = function(){
	this.state = new DATAGRAPHSTATE([this.table]);
};

/**
 * Restores table and graphs to original teacher supplied table
 */
DATAGRAPH.prototype.restore = function(){
	this.table = this.copyTable();
	this.state = undefined;
	this.render();
};

/**
 * Toggles mode between data table view and graph view and renders the appropriate one.
 */
DATAGRAPH.prototype.switchMode = function(){
	if(this.mode=='0'){//was in data switch to either graph or table w/graph
		if(this.content.options.display.which=='2'){
			this.mode = '1';
			this.renderGraph();
		} else {//this.content.option.display should == 3
			this.mode = '2';
			this.renderData(true);
			this.renderGraph(true);
		}
	} else {//was one of the graph modes, switch back to table
		this.mode = '0';
		this.renderData();
	}
};

/**
 * Copies and returns the table specified in this.content
 */
DATAGRAPH.prototype.copyTable = function(){
	var newTable = window.parent.createContent();
	newTable.setContent($.stringify(this.content));
	
	return newTable.getContentJSON().table;
};

/**
 * Gets the highest and the lowest values of the data that is
 * currently in the table.
 */
DATAGRAPH.prototype.getRange = function(){
	var yLow, yHigh, xLow, xHigh;
	
	for(var h=0;h<this.table.rows.length;h++){
		for(var i=0;i<this.table.rows[h].cols.length;i++){
			var cell = this.table.rows[h].cols[i];
			/* ignore non-numeric values */
			if(!isNaN(cell.value)){
				
				/* if this is not the independent column, then the values will affect
				 * the y range, if it is an indpendent column and is not qualitative, then
				 * the values will affect the x range. If it is independent and qualitative 
				 * or there is no independent variable, then the values of the x range are
				 * set later */
				if(i != this.table.independentIndex){
					/* high value not set, set it now */
					if(!yHigh){
						yHigh = cell.value;
					}
					
					/* low value not set, set it now */
					if(!yLow){
						yLow = cell.value;
					}
					
					/* set the high and low ranges to whichever is higher or lower respectively */
					yHigh = Math.max(yHigh, cell.value);
					yLow = Math.min(yLow, cell.value);
				} else if(!this.table.isQualitative){
					/* high value not set, set it now */
					if(!xHigh){
						xHigh = cell.value;
					}
					
					/* low value not set, set it now */
					if(!xLow){
						xLow = cell.value;
					}
					
					/* set the high and low ranges to whichever is higher or lower respectively */
					xHigh = Math.max(xHigh, cell.value);
					xLow = Math.min(xLow, cell.value);
				}
			}
		}
	}
	
	/* set the high point to 25 percent higher than the total range */
	this.range.y.high = yHigh + ((yHigh - yLow) * 0.25);
	this.range.y.low = yLow;
	
	/* If there is no independent variable or the x-axis is specified as qualitative
	 * in the content, then the range of the x-axis is based on the number of rows in
	 * the table, otherwise, we will use the values we set above */
	if(this.table.independentIndex == -1 || this.table.isQualitative){
		this.range.x.low = 0;
		this.range.x.high = this.table.rows.length - 1;
	} else {
		this.range.x.low = xLow;
		this.range.x.high = xHigh;
	}
};

/**
 * Returns a flot formatted options object based on the current state
 * 
 * @return object - options
 */
DATAGRAPH.prototype.getOptions = function(){
	var options = {
			lines: {show: false},
			points: {show: false},
			bars: {show: false},
			yaxis: {
				min: Math.min(0,this.range.y.low),
				max: this.range.y.high
			},
			xaxis: {
				min: this.range.x.low,
				max: this.range.x.high,
				ticks:[]
			}
	};
	
	/* set which type of graph to display */
	if(this.graphType=='bar'){
		options.bars.show = true;
	} else if(this.graphType=='line'){
		options.lines.show = true;
	} else if(this.graphType=='linePoint'){
		options.points.show = true;
		options.lines.show = true;
	} else if(this.graphType=='point'){
		options.points.show = true;
	}
	
	/* check to see if there is anything in the table */
	if(this.table.rows.length > 0){
		/* set the x-axis labels based on the table state */
		if(this.table.independentIndex < 0){
			/* Create ticks and/or labels based on number of data values for each column.
			 * Subtract one if there is a label. */
			var ticks = this.table.rows.length - ((this.table.rows[0].cols[0].options.isLabel) ? 1 : 0);
			for(var i=0;i<ticks;i++){
				options.xaxis.ticks.push(i);
			}
		} else if(this.table.isQualitative) {
			/* This is a qualitative graph, the ticks are sequential starting from zero for line and
			 * point type graphs, 0.5 for bar chart and the label is the value of each independent col
			 * cell, excluding any label cell. */
			var col = [];
			for(var j=0;j<this.table.rows.length;j++){
				if(j != this.table.titleIndex){
					col.push(this.table.rows[j].cols[this.table.independentIndex].value);
				}
			}
			
			for(var k=0;k<col.length;k++){
				options.xaxis.ticks.push([k + ((this.graphType == 'bar') ? 0.5 : 0),col[k]]);
			}
		} else {
			/* This is a quantitative graph, make the ticks null if it is a so that flot figures
			 * it all out from the data. */
			options.xaxis.ticks = null;
		}
	}
	
	return options;
};

/**
 * The data organizer handles the parsing of a JSON table into
 * a format that is compatible with flot.
 */
function DataOrganizer(){
	this.table;
};

/**
 * Sets the given table in this organizer.
 */
DataOrganizer.prototype.setTable = function(table){
	this.table = table;
};

/**
 * Parses the table and returns a formatted data object compatible
 * with flot.
 * 
 * @param table
 * @return object - data
 */
DataOrganizer.prototype.getData = function(table){
	if(table){
		this.table = table;
	}
	
	if(!this.table){
		throw 'No table set in organizer, unable to parse the table.';
	} else {
		return this.parseTable();
	}
};

/**
 * Walks through the table and pushs the data into column objects, then
 * creates and returns a data object compatible with flot.
 * 
 * @return object - data
 */
DataOrganizer.prototype.parseTable = function(){
	var cols = [];
	
	/* walk through the cells, adding their data and option info to the appropriate columns */
	for(var c=0;c<this.table.rows.length;c++){
		for(var d=0;d<this.table.rows[c].cols.length;d++){
			/* get the cell */
			var cell = this.table.rows[c].cols[d];
			
			/* create a column object if none yet exists for this column */
			if(!cols[d]){
				cols[d] = this.getColumnTemplate();
			}
			
			/* If this is the label row, set the column label to this value. If a value
			 * already exists, throw an error. There should be only one label/column */
			if(c == this.table.titleIndex){
				if(cols[d].label){
					throw 'Invalid table structure, label conflict. Cannot continue!';
				} else {
					cols[d].label = cell.value;
				}
			} else {
				/* If this is not the independent column or if the independent column is not
				 * qualitative, then the cell value must be a number. Validate that this is the
				 * case. If not, set the value to null and notify the user, otherwise, set the
				 * value.
				 */
				if((this.table.independentIndex != d && isNaN(cell.value)) || (this.table.independentIndex == d && !this.table.isQualitative && isNaN(cell.value))){
					cols[d].data.push(null);
					this.node.view.notificationManager.notify('The cell at x:' + c + ' y:' + d + ' with the value: ' + cell.value + ' is not a valid number. Ignoring data.', 3);
				} else {
					cols[d].data.push(cell.value);
				}
			}
		}
	}
	
	/* Create the data object based on the created columns data. */
	var data = [];
	
	/* cycle through the cols and create the series for each */
	for(var f=0;f<cols.length;f++){
		/* the independent values are the x value for each series, so we do not
		 * want to process this as a series if it has been specified */
		if(f != this.table.independentIndex){
			/* get a new series template */
			var series = this.getSeriesTemplate();
			
			/* set the label for this series */
			series.label = cols[f].label;
			
			/* If there is no independent variable, or the independent variable is qualitative, the x-values
			 * for each series should be sequential starting at 0, otherwise, we need to use the quantitative
			 * values specified in the independent series. */
			for(var g=0;g<cols[f].data.length;g++){
				if(this.table.independentIndex < 0 || this.table.isQualitative){
					series.data[g] = [g, cols[f].data[g]];
				} else {
					series.data[g] = [cols[this.table.independentIndex].data[g], cols[f].data[g]];
				}
			}
			
			/* add the series to the data */
			data.push(series);
		}
	}
	
	/* if this is a quantitative graph, flot plots in the order of the data,
	 * so we need to sort it before returning */
	if(!this.table.isQualitative){
		for(var h=0;h<data.length;h++){
			data[h].data.sort(function(arr1,arr2){
				if(parseInt(arr1[0]) < parseInt(arr2[0])){
					return -1;
				} else if(parseInt(arr1[0])==parseInt(arr2[0])){
					return 0;
				} else {
					return 1;
				}
			});
		}
	}
	
	return data;
};

/**
 * Returns an object that represents a column in a table.
 * 
 * @return object - column
 */
DataOrganizer.prototype.getColumnTemplate = function(){
	return {
		data:[],
		label:undefined
	};
};

/**
 * Returns a uninitialized data object.
 * 
 * @return object - data
 */
DataOrganizer.prototype.getSeriesTemplate = function(){
	return {
		color:undefined,
		data:[],
		label:undefined,
		lines:undefined,
		bars:undefined,
		points:undefined,
		xaxis:undefined,
		yaxis:undefined,
		clickable:true,
		hoverable:true,
		shadowSize:undefined
	};
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/datagraph/datagraph.js');
}