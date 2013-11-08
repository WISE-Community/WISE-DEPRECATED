/**
 * Sets the DataGraphNode type as an object of this view
 * @constructor
 * @author patrick lawler
 */
View.prototype.DataGraphNode = {};
View.prototype.DataGraphNode.commonComponents = ['Prompt', 'LinkTo'];
	
/**
 * Generates the prompt and table elements for authoring
 * data graph nodes.
 */
View.prototype.DataGraphNode.generatePage = function(view){
	this.view = view;
	this.content = this.view.activeContent.getContentJSON();

	this.GRAPH_OPT_ARRAY = ['range', 'bar', 'line', 'point', 'linePoint'];
	
	this.generateOptions();
	$('#dynamicPage').append("<br>Question Prompt for Student<br><div id='promptContainer'></div>");
	this.generateTable();
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 */
View.prototype.DataGraphNode.getCommonComponents = function() {
	return this.commonComponents;
};

/**
 * Generates the options for this data graph
 */
View.prototype.DataGraphNode.generateOptions = function(){
	var parent = document.getElementById('dynamicPage');
	
	/* remove any old elements */
	while(parent.firstChild){
		parent.removeChild(parent.firstChild);
	}
	
	/* create new elements */
	var editorTitle2 = createElement(document, 'div', {id: 'editorTitle2'});
	var optText = document.createTextNode("Data Grapher:");
	var optTable = createElement(document, 'table', {id: 'optTable', border: '1'});
	var tBod = createElement(document, 'tbody', {id: 'optTBody'});
	var r1 = createElement(document, 'tr');
	var r2 = createElement(document, 'tr');

	parent.appendChild(editorTitle2);
	editorTitle2.appendChild(optText);
	parent.appendChild(optTable);
	optTable.appendChild(tBod);
	tBod.appendChild(r1);
	tBod.appendChild(r2);
	
	/* graph and data options for display */
	var td1 = createElement(document, 'td', {id: 'displayOpts'});
	var td2 = createElement(document, 'td', {id: 'startOpts'});
	var optionsHeader1 = createElement(document, 'div', {id: 'optionsHeader1'});
	var dispText = document.createTextNode('Display Options:');
	var optionsHeader2 = createElement(document, 'div', {id: 'optionsHeader2'});
	var startText = document.createTextNode('Start Mode:');
	var o1 = createElement(document, 'input', {type: 'radio', name: 'displayRadio', id: 'displayDataOnly', onclick: 'eventManager.fire("datagraphDisplayOptionChanged")', value: '0'});
	var o2 = createElement(document, 'input', {type: 'radio', name: 'displayRadio', id: 'displayGraphOnly', onclick: 'eventManager.fire("datagraphDisplayOptionChanged")', value: '1'});
	var o3 = createElement(document, 'input', {type: 'radio', name: 'displayRadio', id: 'displayBoth', onclick: 'eventManager.fire("datagraphDisplayOptionChanged")', value: '2'});
	var o4 = createElement(document, 'input', {type: 'radio', name: 'displayRadio', id: 'displayJoint', onclick: 'eventManager.fire("datagraphDisplayOptionChanged")', value: '3'});
	var o1Text = document.createTextNode('Data table only');
	var o2Text = document.createTextNode('Graph only');
	var o3Text = document.createTextNode('Alternate between Table view and Graph view');
	var o4Text = document.createTextNode('Alternate between Table view and Table+Graph view');
	
	var s1 = createElement(document, 'input', {type: 'radio', name: 'startMode', id: 'startModeData', onclick: 'eventManager.fire("datagraphStartModeChanged")', value: '0'});
	var s2 = createElement(document, 'input', {type: 'radio', name: 'startMode', id: 'startModeGraph', onclick: 'eventManager.fire("datagraphStartModeChanged")', value: '1'});
	var s1Text = document.createTextNode('Start with Data Table');
	var s2Text = document.createTextNode('Start with Graph or Table with Graph');
	
	r1.appendChild(td1);
	r1.appendChild(td2);
	td1.appendChild(optionsHeader1);
	optionsHeader1.appendChild(dispText);
	td1.appendChild(createBreak());
	td1.appendChild(o1);
	td1.appendChild(o1Text);
	td1.appendChild(createBreak());
	td1.appendChild(o2);
	td1.appendChild(o2Text);
	td1.appendChild(createBreak());
	td1.appendChild(o3);
	td1.appendChild(o3Text);
	td1.appendChild(createBreak());
	td1.appendChild(o4);
	td1.appendChild(o4Text);
	td2.appendChild(optionsHeader2);
	optionsHeader2.appendChild(startText);
	td2.appendChild(createBreak());
	td2.appendChild(s1);
	td2.appendChild(s1Text);
	td2.appendChild(createBreak());
	td2.appendChild(s2);
	td2.appendChild(s2Text);
	
	/* set values */
	if(this.content.options.display.which=='0'){
		o1.checked = true;
		this.startOptions(false);
	} else if(this.content.options.display.which=='1'){
		o2.checked = true;
		this.startOptions(false);
	} else if(this.content.options.display.which=='2'){
		o3.checked = true;
		this.startOptions(true);
	} else if(this.content.options.display.which=='3'){
		o4.checked = true;
		this.startOptions(true);
	};
	
	if(this.content.options.display.start=='0'){
		s1.checked = true;
	} else {
		s2.checked = true;
	};
	
	/* graph options editable by student */
	var optionsHeader3 = createElement(document, 'div', {id: 'optionsHeader3'});
	var td3 = createElement(document, 'td', {id: 'editOpts'});
	var optionsHeader4 = createElement(document, 'div', {id: 'optionsHeader4'});
	var td4 = createElement(document, 'td', {id: 'graphOpts'});
	var c1 = createElement(document, 'input', {type: 'checkbox', id: 'rangeCheck', name: 'graphOptions', onclick: 'eventManager.fire("datagraphGraphOptionChanged","range")'});
	var g1 = createElement(document, 'input', {type: 'checkbox', id: 'barCheck', name: 'graphOptions', onclick: 'eventManager.fire("datagraphGraphOptionChanged","bar")'});
	var g2 = createElement(document, 'input', {type: 'checkbox', id: 'lineCheck', name: 'graphOptions', onclick: 'eventManager.fire("datagraphGraphOptionChanged","line")'});
	var g3 = createElement(document, 'input', {type: 'checkbox', id: 'pointCheck', name: 'graphOptions', onclick: 'eventManager.fire("datagraphGraphOptionChanged","point")'});
	var g4 = createElement(document, 'input', {type: 'checkbox', id: 'linePointCheck', name: 'graphOptions', onclick: 'eventManager.fire("datagraphGraphOptionChanged","linePoint")'});
	var editOptsText = document.createTextNode('Students can edit: ');
	var c1Text = document.createTextNode(' Edit Range');
	var graphOptsText = document.createTextNode('Graphs available to student: ');
	var g1Text = document.createTextNode(' Bar Chart');
	var g2Text = document.createTextNode(' Line Graph');
	var g3Text = document.createTextNode(' Point Graph');
	var g4Text = document.createTextNode(' Line Point Graph');
	
	r2.appendChild(td3);
	r2.appendChild(td4);
	td3.appendChild(optionsHeader3);
	optionsHeader3.appendChild(editOptsText);
	td3.appendChild(createBreak());
	td3.appendChild(c1);
	td3.appendChild(c1Text);
	
	td4.appendChild(optionsHeader4);
	optionsHeader4.appendChild(graphOptsText);
	td4.appendChild(createBreak());
	td4.appendChild(g1);
	td4.appendChild(g1Text);
	td4.appendChild(createBreak());
	td4.appendChild(g2);
	td4.appendChild(g2Text);
	td4.appendChild(createBreak());
	td4.appendChild(g3);
	td4.appendChild(g3Text);
	td4.appendChild(createBreak());
	td4.appendChild(g4);
	td4.appendChild(g4Text);
	
	/* set values */
	for(var m=0;m<this.GRAPH_OPT_ARRAY.length;m++){
		document.getElementById(this.GRAPH_OPT_ARRAY[m] + 'Check').checked = this.content.options.graph[this.GRAPH_OPT_ARRAY[m]];
	}
};

/**
 * Generates the html elements needed for editing the prompt.
 */
View.prototype.DataGraphNode.generatePrompt = function(){
	var parent = document.getElementById('dynamicPage');
	
	var promptText = document.createTextNode("Question Prompt for Student:");
	var promptDiv = createElement(document, 'div', {id: 'promptDiv'});
	var promptArea = createElement(document, 'textarea', {id: 'promptInput', rows: '7', cols: '85', onkeyup: 'eventManager.fire("datagraphPromptChanged")'});
	
	parent.appendChild(createBreak());
	parent.appendChild(promptDiv);
	promptDiv.appendChild(promptText);
	promptDiv.appendChild(createBreak());
	promptDiv.appendChild(promptArea);
	parent.appendChild(createBreak());
	
	promptArea.value = this.content.prompt;
};

/**
 * Generates and appends the html elements needed for table editing
 * to the dom.
 */
View.prototype.DataGraphNode.generateTable = function(){
	var tableElementsHTML = '<div id="tableEditingDiv">' + 
			'<div id="titleDiv">' +
				'<table id="tableMetadataTable">' + 
					'<tr id="titleEdtiableDiv">' + 
						'<td>Title for Table & Graph:</td><td><input type="text" id="titleInput" value="' + this.content.table.title + '" onkeyup="eventManager.fire(\'datagraphTableMetadataChanged\')"></input></td>' + 
						'<td><input type="checkbox" id="titleEditable" onclick="eventManager.fire(\'datagraphEditableChanged\',\'title\')"></input> editable by student</td>' +
					'</tr>' +
					'<tr id="xLabelEditableDiv">' +
						'<td>Label for x-axis:</td><td><input type="text" id="xLabelInput" value="' + this.content.table.xLabel + '" onkeyup="eventManager.fire(\'datagraphTableMetadataChanged\')"></input></td>' +
						'<input type="checkbox" id="xLabelEditable" onclick="eventManager.fire(\'datagraphEditableChanged\',\'xLabel\')"></input> editable by student</td>' +
					'</tr>' + 
					'<tr id="yLabelEditableDiv">' +
						'<td>Label for y-axis:</td><td><input type="text" id="yLabelInput" value="' + this.content.table.yLabel + '" onkeyup="eventManager.fire(\'datagraphTableMetadataChanged\')"></input></td>' +
						'<td><input type="checkbox" id="yLabelEditable" onclick="eventManager.fire(\'datagraphEditableChanged\',\'yLabel\')"></input> editable by student</td>' +
					'</tr>' +
					'<tr id="graphWidth">' +
						'<td>Graph Width:</td><td><input type="text" id="graphWidthInput" value="' + this.content.table.graphWidth + '" onkeyup="eventManager.fire(\'datagraphGraphWidthChanged\')"></input></td><td> pixels</td>' +
					'</tr>' +
					'<tr id="graphHeight">' +
						'<td>Graph Height:</td><td><input type="text" id="graphHeightInput" value="' + this.content.table.graphHeight + '" onkeyup="eventManager.fire(\'datagraphGraphHeightChanged\')"></input></td><td> pixels</td>' +
					'</tr>' +
				'</table>' +
			'</div><br/>' + 
			'<div id="optionsDiv">' +
				'<table><thead></thead>' +
					'<tbody id="selectOptionsTable">' +
						'<tr>' +
							'<td>' +
								'<div id="selectHelp">The table building options available will depend on the state of the table and the cells/rows/columns that ' +
									'are currently selected. To select a cell, click on that cell. To deselect a cell, click on it again. To select/deselect ' +
									'multiple cells, hold down the shift key while clicking on cells. To select an entire column or row, click on the \'Toggle Row/Column\' ' +
									'tab. To select/deselect multiple columns, hold down the shift key while clicking on the \'Toggle Row/Column\' tabs.<br/><br/>' +
									'Note: Any cells with a gray background will NOT be editable by students. You can change which cells are editable by selecting them ' +
									'and then clicking on \'Toggle Editable\' in the options.' +
								'</div>' +
							'</td>' +
							'<td>' +
								'<div id="selectOptions">' +
									'<div id="selectOptionsOptions"></div>' +
								'</div>' +
							'</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</div>' +
		'</div>';
	
	$('#tableEditingDiv').remove();
	$('#dynamicPage').append(tableElementsHTML);
	$('#titleEditable').attr('checked', this.content.table.titleEditable);
	$('#xLabelEditable').attr('checked', this.content.table.xLabelEditable);
	$('#yLabelEditable').attr('checked', this.content.table.yLabelEditable);
	
	this.generateTableDiv();
};

/**
 * Generates the actual table based on its representation in the JSON content
 */
View.prototype.DataGraphNode.generateTableDiv = function(){
	/* clean up any existing table elements and generate new table structure */
	$('#datagraphTableDiv').remove();
	$('#tableEditingDiv').append('<div id="datagraphTableDiv"></div>');
	$('#datagraphTableDiv').append('<table id="datagraphDataTable"><thead id="tHead"></thead><tbody id="tBody"></tbody></table>');
	
	/* if table elements have been specified in the content append them to the table,
	 * prepend an additional row to create the column tabs and prepend a column for
	 * the row tabs */
	if(this.content.table.rows.length>0){
		for(var a=-1;a<this.content.table.rows.length;a++){
			$('#tBody').append('<tr id="datagraphRow_' + a + '"></tr>');
			
			if(a==-1){
				/* this is the corner/column tab row, create the table elements
				 * for the corner and column tabs */
				for(var b=-1;b<this.content.table.rows[0].cols.length;b++){
					if(b==-1){
						/* this is the corner tab which selects all the table cells */
						$('#datagraphRow_' + a).append('<td><div id="tab_' + a + '_' + b + '" class="cornerTab tableCell" onclick="eventManager.fire(\'datagraphToggleSelected\',[\'' + a + '\',\'' + b + '\'])">Toggle All</div></td>');
					} else {
						/* this is a column tab which selects all cells in this column */
						$('#datagraphRow_' + a).append('<td><div id="tab_' + a + '_' + b + '" class="columnTab tableCell column_' + b + '" onclick="eventManager.fire(\'datagraphToggleSelected\',[\'' + a + '\',\'' + b + '\'])">Toggle Column</div></td>');
					}
				}				
			} else {
				for(var b=-1;b<this.content.table.rows[a].cols.length;b++){
					/* if this is the first column, this will be a tab td */
					if(b==-1){
						/* this is a row tab which selects all cells in this row */
						$('#datagraphRow_' + a).append('<td><div id="tab_' + a + '_' + b + '" class="rowTab tableCell row_' + a + '" onclick="eventManager.fire(\'datagraphToggleSelected\',[\'' + a + '\',\'' + b + '\'])">Toggle Row</div></td>');
					} else {
						/* this is a table cell */
						$('#datagraphRow_' + a).append('<td id="datagraphCell_' + a + '_' + b + '"><input type="text" id="datagraphCellInput_' + a + '_' + b + '" class="tableCell row_' + a + ' column_' + b + '" value="' + this.content.table.rows[a].cols[b].value + '" onchange="eventManager.fire(\'datagraphCellChanged\',[\'' + a + '\',\'' + b + '\'])" onclick="eventManager.fire(\'datagraphToggleSelected\',[\'' + a + '\',\'' + b + '\'])"></input></td>');
						this.addCellClasses(a,b);
					}
				}
			}
		}
	}
	
	/* generate the options based on this table */
	this.generateSelectionOptions();
};

/**
 * Given the x,y coordinates of a cell, adds the appropriate classes
 * to the associated cell input element.
 */
View.prototype.DataGraphNode.addCellClasses = function(a,b){
	/* all cells get the datagraphCell class */
	$('#datagraphCell_' + a + '_' + b).addClass('datagraphCell');
	
	/* add noneditable class to cells that specify so in the content */
	if(!this.content.table.rows[a].cols[b].options.editable){
		$('#datagraphCellInput_' + a + '_' + b).addClass('noneditable');
	}
	
	/* check for label row */
	if(a==this.content.table.titleIndex){
		$('#datagraphCell_' + a + '_' + b).addClass('label');
	}
	
	/* check for independent variable column */
	if(b==this.content.table.independentIndex){
		$('#datagraphCell_' + a + '_' + b).addClass('independent');
	}
	
	/* check for top left corner */
	if(a==0 && b==0){
		$('#datagraphCell_' + a + '_' + b).addClass('topLeftCorner');
	}
	
	/* check for bottom left corner */
	if(a==this.content.table.rows.length - 1 && b==0){
		$('#datagraphCell_' + a + '_' + b).addClass('bottomLeftCorner');
	}
	
	/* check for top right corner */
	if(a==0 && b==this.content.table.rows[0].cols.length - 1){
		$('#datagraphCell_' + a + '_' + b).addClass('toprightCorner');
	}
	
	/* check for bottom right corner */
	if(a==this.content.table.rows.length - 1 && b==this.content.table.rows[0].cols.length - 1){
		$('#datagraphCell_' + a + '_' + b).addClass('bottomrightCorner');
	}
};

View.prototype.DataGraphNode.populatePrompt = function() {
	$('#promptInput').val(this.content.prompt);
};

/**
 * Updates the value of xmlPage when prompt value changes
 */
View.prototype.DataGraphNode.updatePrompt = function(){
	/* update content */
	var content = '';
	if(typeof tinymce != 'undefined' && $('#promptInput').tinymce()){
		content = $('#promptInput').tinymce().getContent();
	} else {
		content = $('#promptInput').val();
	}
	
	this.content.prompt = content;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the value of the title in xmlPage when value changes
 */
View.prototype.DataGraphNode.tableMetadataChanged = function(){
	this.content.table.title = $('#titleInput').val();
	this.content.table.xLabel = $('#xLabelInput').val();
	this.content.table.yLabel = $('#yLabelInput').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the content with the user specified values when a cell
 * value changes.
 */
View.prototype.DataGraphNode.cellChanged = function(row,col){
	var cell = this.content.table.rows[row].cols[col];
	var val = $('#datagraphCellInput_' + row + '_' + col).val();
	
	/* validate the user entered data before updating the cell */
	if(cell.options.isLabel || !isNaN(val)){
		cell.value = val;
	} else {
		$('#datagraphCellInput_' + row + '_' + col).val(cell.value);
		this.view.notificationManager.notify('The cell you are entering data into only accepts numbers. If you feel you have received this message in error, try setting the x-axis variable to qualitative or the set the row as a label row or set the column as an independent variable column.', 3);
	}
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Toggles selected cells based on cell clicked, current selected items
 * and whether the shift key was held while clicking.
 * 
 * @param x - the row number
 * @param y - the column number
 */
View.prototype.DataGraphNode.toggleSelected = function(x, y){
	/* if shift key is down when clicked, then we do not want to clear any
	 * of the currently selected items, otherwise we do.
	 */
	if(!this.view.keystrokeManager.isShiftkeydown()){
		$('.activeSelect').not('#datagraphCellInput_' + x + '_' + y).not('#tab_' + x + '_' + y).removeClass('activeSelect');
	}
	
	/* determine id based on x and y args, then toggle the activeSelect class, if
	 * this is a tab cell, select/deslect all items in the corresponding row/column */
	var id = ((x < 0 || y < 0) ? '#tab_' : '#datagraphCellInput_') + x + '_' + y;
	if($(id).hasClass('activeSelect')){
		/* remove the class from the clicked element */
		$(id).removeClass('activeSelect');
		
		/* if this is a tab element remove activeSelect for all cells in column/row */
		if(x < 0 && y < 0){
			/* this is the ALL tab */
			$('.tableCell').removeClass('activeSelect');
		} else if(x < 0){
			/* this is a column tab */
			$('.column_' + y).removeClass('activeSelect');
		} else if(y < 0){
			/* this is a row tab */
			$('.row_' + x).removeClass('activeSelect');
		}
	} else {
		/* add the class to the clicked element */
		$(id).addClass('activeSelect');
		
		/* if this is a tab element, add the activeSelect for all cells in column/row */
		if(x < 0 && y < 0){
			/* this is the ALL tab */
			$('.tableCell').addClass('activeSelect');
		} else if(x < 0){
			/* this is a column tab */
			$('.column_' + y).addClass('activeSelect');
		} else if(y < 0){
			/* this is a row tab */
			$('.row_' + x).addClass('activeSelect');
		}
	}
	
	/* regenerate the options based on the table state and selected cells/columns/rows */
	this.generateSelectionOptions();
};

/**
 * Generates and displays option elements based on the state of the 
 * table and the selected elements.
 */
View.prototype.DataGraphNode.generateSelectionOptions = function(){
	var opts = this.getSelectionOptionsObject();
	
	/* remove any existing options */
	$('#selectOptionsOptions').html('');
	
	/* check for no data in the table */
	if(this.content.table.rows.length == 0){
		opts.table.template.use = true;
		opts.independent.addIndependent.use = true;
		opts.label.addLabel.use = true;
		opts.row_column.addRow.use = true;
		opts.row_column.addColumn.use = true;
		
		/* use the options object to create the selection options */
		this.createSelectionOptions(opts);
		
		return;
	}
	
	/* add options that are always available */
	opts.table.startOver.use = true;
	opts.row_column.addRow.use = true;
	opts.row_column.addColumn.use = true;
	
	/* check for title row */
	if(this.content.table.titleIndex==-1){
		/* no title row */
		opts.label.addLabel.use = true;
	}
	
	/* check for independent column */
	if(this.content.table.independentIndex==-1){
		/* no independent column */
		opts.independent.addIndependent.use = true;
	}
	
	/* check for qualitative/quantitative */
	if(this.content.table.isQualitative){
		/* is a qualitative graph */
		opts.independent.setQuantitative.use = true;
	} else {
		/* is a quantative graph */
		opts.independent.setQualitative.use = true;
	}	
	
	/* check to see if nothing is selected, validate selected and set options 
	 * based on what is selected */
	if($('.activeSelect').not('.cornerTab,.columnTab,.rowTab').size() > 0){
		opts.cell.editable.use = true;
		
		/* find the rows and columns based on the currently selected */
		var uniqueRows = [];
		var uniqueCols = [];
		$('.activeSelect').not('.cornerTab,.columnTab,.rowTab').each(function(ndx){
			var idArr = $(this).attr('id').split('_');
			
			/* add this row index to array if it does not already exist there */
			if(uniqueRows.indexOf(idArr[1])==-1){
				uniqueRows.push(idArr[1]);
			}
			
			/* add this column index to array if it does not already exist there */
			if(uniqueCols.indexOf(idArr[2])==-1){
				uniqueCols.push(idArr[2]);
			}
		});
		
		/* set row options if only one row is selected */
		if(uniqueRows.length==1){
			opts.row_column.insertRowBefore.use = true;
			opts.row_column.insertRowAfter.use = true;
			
			if(this.content.table.titleIndex == uniqueRows[0]){
				opts.label.unsetLabel.use = true;
				opts.label.removeLabel.use = true;
			} else {
				opts.label.setLabel.use = true;
				opts.row_column.removeRow.use = true;
			}
		}
		
		/* set column options if only one column is selected */
		if(uniqueCols.length==1){
			opts.row_column.insertColumnBefore.use = true;
			opts.row_column.insertColumnAfter.use = true;
			
			if(this.content.table.independentIndex == uniqueCols[0]){
				opts.independent.unsetIndependent.use = true;
				opts.independent.removeIndependent.use = true;
			} else {
				opts.independent.setIndependent.use = true;
				opts.row_column.removeColumn.use = true;
			}
		}
	}
	
	/* use the options object to create the selection options */
	this.createSelectionOptions(opts);
};

/**
 * Given an object, checks to see if the objects fields are the selection
 * option fields. If it is, adds that option to the selection option, if
 * not, assumes that the fields are objects then recursively parses the
 * object until all options are created.
 */
View.prototype.DataGraphNode.createSelectionOptions = function(obj){
	/* if this is an object group, set html, then parse the children */
	if(obj.isGroup){
		if(this.hasActiveChildren(obj)){
			$('#selectOptionsOptions').append(obj.html);
			
			for(var o in obj){
				if(o != 'isGroup' && o != 'html'){
					this.createSelectionOptions(obj[o]);
				}
			}
		}
	/* if this is an object option, set html if the use flag was set */
	} else if(obj.isOption){
		if(obj.use){
			$('#selectOptionsOptions').append(obj.html);
		}
	/* then this is an object that contains only objects, parse those */
	} else {
		for(var o in obj){
			this.createSelectionOptions(obj[o]);
		}
	}
};

/**
 * Given a group object from a selection options object, returns true if there are
 * any option objects that are active (set to true), returns false otherwise.
 */
View.prototype.DataGraphNode.hasActiveChildren = function(obj){
	/* look at all of the children objects of the given object to see if any are used */
	for(var child in obj){
		if(obj[child].isOption && obj[child].use){
			return true;
		}
	}
	
	/* if we are here, then we didn't find any, return false */
	return false;
};

/**
 * Toggles the editable value of all the currently selected cells.
 */
View.prototype.DataGraphNode.toggleEditable = function(){
	var table = this.content.table;
	
	$('.activeSelect').not('.cornerTab,.columnTab,.rowTab').each(function(ndx){
		var splitId = $(this).attr('id').split('_');
		
		/* toggle the value in the content and update the cell's class */
		if(table.rows[splitId[1]].cols[splitId[2]].options.editable){
			/* is currently editable, make it non-editable */
			table.rows[splitId[1]].cols[splitId[2]].options.editable = false;
		} else {
			/* is current non-editable, make it editable */
			table.rows[splitId[1]].cols[splitId[2]].options.editable = true;
		}
	});
	
	/* regenerate the graph to clear selected and reflect changes */
	this.generateTableDiv();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Adds a new row at the end of the table, then refreshes the table.
 */
View.prototype.DataGraphNode.addRow = function(){
	this.insertRow(this.content.table.rows.length);
	this.generateTableDiv();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Inserts a new row in the table at the given location
 * 
 * @param loc - location
 */
View.prototype.DataGraphNode.insertRow = function(loc){
	/* determine number of columns based on the current table in the content */
	if(this.content.table.rows.length==0){
		var numOfColumns = 1;
	} else {
		var numOfColumns = this.content.table.rows[0].cols.length;
	}
	
	/* if we are inserting at the location of the label row, we want to update
	 * the titleIndex in the table content */
	if(this.content.table.titleIndex==loc){
		this.content.table.titleIndex += 1;
	}
	
	this.content.table.rows.splice(loc,0, this.createRow(numOfColumns));
};

/**
 * Creates and returns a new row object with the given number of columns.
 * 
 * @param num - number of columns to include in the row
 */
View.prototype.DataGraphNode.createRow = function(num){
	var cols = [];
	
	for(var a=0;a<num;a++){
		cols.push(this.createCol());
		
		/* if the current column is the independent variable and the 
		 * table is qualitative, we want to set isLabel = true */
		if(a==this.content.table.independentIndex && this.content.table.isQualitative){
			cols[a].options.isLabel = true;
		}
	}
	
	return {cols:cols};
};

/**
 * Adds a new column to the end of the table, then refreshes the table
 */
View.prototype.DataGraphNode.addCol = function(){
	if(this.content.table.rows.length==0){
		this.insertCol(0);
	} else {
		this.insertCol(this.content.table.rows[0].cols.length);
	}
	
	this.generateTableDiv();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Inserts a new column at the given location.
 */
View.prototype.DataGraphNode.insertCol = function(loc){
	/* if the location of the column we are inserting is the independent
	 * variable, we want to update the indendentIndex in the table content */
	if(this.content.table.independentIndex == loc){
		this.content.table.independentIndex += 1;
	}
	
	if(this.content.table.rows.length==0){
		this.addRow();
	} else {
		for(var b=0;b<this.content.table.rows.length;b++){
			this.content.table.rows[b].cols.splice(loc,0,this.createCol());
			
			/* if the current row is a label row, we want to set the
			 * isLabel = true */
			if(this.content.table.titleIndex==b){
				this.content.table.rows[b].cols[loc].options.isLabel = true;
			}
		}
	}
};

/**
 * Creates and returns a column object.
 */
View.prototype.DataGraphNode.createCol = function(){
	return {options:{editable:true,isLabel:false},value:''};
};

/**
 * Removes the currently selected row and refreshes table
 */
View.prototype.DataGraphNode.removeRow = function(){
	/* get the location of the selected row */
	var loc = $('.activeSelect').not('.cornerTab,.columnTab,.rowTab').attr('id').split('_')[1];
	
	/* remove the row */
	this.internalRemoveRow(loc);
};

/**
 * Removes the row at the given location.
 * 
 * @param loc - location
 * @param silent - boolean whether the confirmation message should appear
 */
View.prototype.DataGraphNode.internalRemoveRow = function(loc, silent){
	if(silent || confirm('You will lose any data in the cells for this row, are you sure you wish to continue?')){
		
		/* if the row we are removing is the label row, we need to change the
		 * titleIndex in the table content */
		if(loc==this.content.table.titleIndex){
			this.content.table.titleIndex = -1;
		}
		
		/* if the row we are removing is before the label row, we need to update
		 * the titleIndex in the table content */
		if(this.content.table.titleIndex>loc){
			this.content.table.titleIndex -= 1;
		}
		
		this.content.table.rows.splice(loc,1);
		this.generateTableDiv();
		
		/* fire source updated event */
		this.view.eventManager.fire('sourceUpdated');
	}
};

/**
 * Removes the currently selected column and refreshes table
 */
View.prototype.DataGraphNode.removeCol = function(){
	/* get the location of the currently selected column */
	var loc = $('.activeSelect').not('.cornerTab,.columnTab,.rowTab').attr('id').split('_')[2];

	/* remove the column */
	this.internalRemoveCol(loc);
};

/**
 * Removes the column at the given location.
 * 
 * @param loc - location
 * @param silent - boolean whether the warning message should be displayed
 */
View.prototype.DataGraphNode.internalRemoveCol = function(loc, silent){
	if(silent || confirm('You will lose any data in the cells for this column, are you sure you wish to continue?')){
		
		/* if the column we are removing is the independent column, we need to change
		 * the independentIndex value in the table content */
		if(loc==this.content.table.independentIndex){
			this.content.table.independentIndex = -1;
		}
		
		/* if the column we are removing is before the independent column, we need
		 * to update the independentIndex in the table content */
		 if(this.content.table.independentIndex>loc){
			 this.content.table.independentIndex -= 1;
		 }
		
		for(var c=0;c<this.content.table.rows.length;c++){
			this.content.table.rows[c].cols.splice(loc,1);
			this.generateTableDiv();
		}
		
		/* fire source updated event */
		this.view.eventManager.fire('sourceUpdated');
	}
};

/**
 * Inserts the a row/column either before or after the currently
 * selected row or column, refreshes the table and updates the preview.
 * 
 * @param type - 1 if row, 2 if column
 * @param where - 0 if before, 1 if after
 */
View.prototype.DataGraphNode.insert = function(type,where){
	var loc = parseInt($('.activeSelect').not('.cornerTab,.columnTab,.rowTab').attr('id').split('_')[type]) + where;
	
	/* call the appropriate insert with the location */
	if(type==1){
		this.insertRow(loc);
	} else if(type==2){
		this.insertCol(loc);
	}
	
	/* refresh the table */
	this.generateTableDiv();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Toggles the editable value in the content for the given type
 */
View.prototype.DataGraphNode.editableChanged = function(type){
	this.content.table[type + 'Editable'] = $('#' + type + 'Editable').is(':checked');

	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Clears the table and any table metadata that has been set.
 */
View.prototype.DataGraphNode.startOver = function(){
	if(confirm('All table information will be lost. Are you sure you wish to continue?')){
		/* clear table content */
		this.content.table.rows = [];
		this.content.table.title = '';
		this.content.table.titleEditable = true;
		this.content.table.independentIndex = -1;
		this.content.table.titleIndex = -1;
		this.content.table.isQualitative = false;
		this.content.table.xLabel = '';
		this.content.table.yLabel = '';
		this.content.table.xLabelEditable = true;
		this.content.table.yLabelEditable = true;
		this.content.table.graphWidth = 800;
		this.content.table.graphHeight = 573;
		
		/* refresh the table */
		this.generateTable();
		
		/* fire source updated event */
		this.view.eventManager.fire('sourceUpdated');
	}
};

/**
 * Sets the table to quantitative.
 */
View.prototype.DataGraphNode.setQuantitative = function(){
	/* check to see if any text will be destroyed by proceeding and confirm with user */
	if(this.content.table.independentIndex != -1){
		/* there is an independent column, so check data in column */
		for(var d=0;d<this.content.table.rows.length;d++){
			var cell = this.content.table.rows[d].cols[this.content.table.independentIndex];
			
			/* ignore labels */
			if(d != this.content.table.titleIndex){
				/*check the cell value to see if it is a number, if not, confirm proceeding with user */
				if(cell.value != '' && isNaN(cell.value)){
					if(confirm('There is/are value(s) in the current independent variable column that will be lost if you continue. Do you wish to proceed?')){
						break;
					} else {
						return;
					}
				}
			}
		}
	}
	
	/* set the table as quantitative and update the cells in the independent variable column */
	this.content.table.isQualitative = false;
	if(this.content.table.independentIndex != -1){
		for(var e=0;e<this.content.table.rows.length;e++){
			var cell = this.content.table.rows[e].cols[this.content.table.independentIndex];
			
			/* check to make sure that this is not a label */
			if(e != this.content.table.titleIndex){
				cell.options.isLabel = false;
				if(cell.value != '' && isNaN(cell.value)){
					cell.value = '';
				}
			}
		}
	}
	
	/* refresh the table */
	this.generateTableDiv();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Sets the table to qualitative
 */
View.prototype.DataGraphNode.setQualitative = function(){
	/* we need to change the value of the cells' options and then set the
	 * table to qualitative */
	if(this.content.table.independentIndex>-1){
		for(var m=0;m<this.content.table.rows.length;m++){
			this.content.table.rows[m].cols[this.content.table.independentIndex].options.isLabel = true;
		}
	}
	
	this.content.table.isQualitative = true;
	
	/* refresh the table */
	this.generateTableDiv();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Adds an independent variable column to the graph.
 */
View.prototype.DataGraphNode.addIndependent = function(){
	/* create the independent column on the far left */
	this.insertCol(0);
	
	/* set that column as independent */
	this.changeIndependent(0);
};

/**
 * Sets the currently selected column as the independent variable.
 */
View.prototype.DataGraphNode.setIndependent = function(){
	/* get the location of the selected column */
	var loc = $('.activeSelect').not('.cornerTab,.columnTab,.rowTab').attr('id').split('_')[2];
	
	/* change the independent column */
	this.changeIndependent(loc);
};

/**
 * Turns the current independent variable column into a regular column. If
 * silent, does not refresh the table or preview upon completion.
 * 
 * @param silent - boolean whether there should be a refresh of preview and table
 */
View.prototype.DataGraphNode.unsetIndependent = function(silent){
	/* check to see if this operation will cause text to be removed and warn
	 * user before proceeding if that is the case */
	if(this.content.table.isQualitative){
		for(var h=0;h<this.content.table.rows.length;h++){
			/* ignore labels */
			if(h != this.content.table.titleIndex){
				var cell = this.content.table.rows[h].cols[this.content.table.independentIndex];
				/* check to see if the value can be a number, warn user if not */
				if(cell.value != '' && isNaN(cell.value)){
					if(confirm('There is/are value(s) in the current independent variable column that will be lost if you continue. Do you wish to proceed?')){
						break;
					} else {
						return;
					}
				}
			}
		}
	}
	
	/* update the cell options and value if needed */
	for(var i=0;i<this.content.table.rows.length;i++){
		/* check to make sure that this is not a label */
		if(i != this.content.table.titleIndex){
			/* update cell */
			var cell = this.content.table.rows[i].cols[this.content.table.independentIndex];
			cell.options.isLabel = false;
			if(cell.value != '' && isNaN(cell.value)){
				cell.value = '';
			}
		}
	}
	
	/* set independentIndex to -1 */
	this.content.table.independentIndex = -1;
	
	/* refresh the table and preview if this is not silent */
	if(!silent){
		/* refresh the table */
		this.generateTableDiv();
		
		/* fire source updated event */
		this.view.eventManager.fire('sourceUpdated');
	}
};

/**
 * Removes the independent column from the table.
 */
View.prototype.DataGraphNode.removeIndependent = function(){
	if(confirm('You are about to remove the independent variable column. This operation cannot be undone, are you sure you wish to continue?')){
		this.internalRemoveCol(this.content.table.independentIndex, true);
	}
};

/**
 * Changes the location of the independent variable to that of the given location. Updates
 * any cells as needed.
 * 
 * @param loc - location
 */
View.prototype.DataGraphNode.changeIndependent = function(loc){
	/* if there is a current independent column, we need to unset it first */
	if(this.content.table.independentIndex !=  -1){
		this.unsetIndependent(true);
	}
	
	/* now set the given location as independent, if the graph is qualitative, we
	 * need to update the cell options for each cell in the column */
	this.content.table.independentIndex = loc;
	if(this.content.table.isQualitative){
		for(var f=0;f<this.content.table.rows.length;f++){
			this.content.table.rows[f].cols[loc].options.isLabel = true;
		}
	}
	
	/* refresh the table */
	this.generateTableDiv();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Adds a label row at the top of the table.
 */
View.prototype.DataGraphNode.addLabel = function(){
	/* create the row for the label at the top */
	this.insertRow(0);
	
	/* set that row as the label row */
	this.changeLabel(0);
};

/**
 * Removes the label row from the table.
 */
View.prototype.DataGraphNode.removeLabel = function(){
	if(confirm('You are about to remove the label row. This operation cannot be undone, are you sure you wish to continue?')){
		this.internalRemoveRow(this.content.table.titleIndex, true);
	}
};

/**
 * Set the currently selected row as the label row.
 */
View.prototype.DataGraphNode.setLabel = function(){
	/* get the location of the selected column */
	var loc = $('.activeSelect').not('.cornerTab,.columnTab,.rowTab').attr('id').split('_')[1];
	
	/* change the independent column */
	this.changeLabel(loc);
};

/**
 * Turns the current label row into a regular row. If silent, does not
 * refresh the table or preview upon completion.
 * 
 * @param silent - boolean whether to refresh table and preview
 */
View.prototype.DataGraphNode.unsetLabel = function(silent){
	/* check to see if this operation will cause text to be removed and warn
	 * user before proceeding if that is the case */
	for(var h=0;h<this.content.table.rows[this.content.table.titleIndex].cols.length;h++){
		/* ignore independent variable column */
		if(h != this.content.table.independentIndex){
			var cell = this.content.table.rows[this.content.table.titleIndex].cols[h];
			/* check to see if the value can be a number, warn user if not */
			if(cell.value != '' && isNaN(cell.value)){
				if(confirm('There is/are value(s) in the current label row that will be lost if you continue. Do you wish to proceed?')){
					break;
				} else {
					return;
				}
			}
		}
	}
	
	/* update the cell options and value if needed */
	for(var i=0;i<this.content.table.rows[this.content.table.titleIndex].cols.length;i++){
		/* check to make sure that this is not a independent var label */
		if(i != this.content.table.independentIndex){
			/* update cell */
			var cell = this.content.table.rows[this.content.table.titleIndex].cols[i];
			cell.options.isLabel = false;
			if(cell.value != '' && isNaN(cell.value)){
				cell.value = '';
			}
		}
	}
	
	/* set independentIndex to -1 */
	this.content.table.titleIndex = -1;
	
	/* refresh the table and preview if this is not silent */
	if(!silent){
		/* refresh the table */
		this.generateTableDiv();
		
		/* fire source updated event */
		this.view.eventManager.fire('sourceUpdated');
	}
};

/**
 * Changes the location of the label row to that of the given location. Updates
 * any cells as needed.
 */
View.prototype.DataGraphNode.changeLabel = function(loc){
	/* if there is a current label row, we need to unset it first */
	if(this.content.table.titleIndex !=  -1){
		this.unsetLabel(true);
	}
	
	/* now set the given location as label */
	this.content.table.titleIndex = loc;
	for(var f=0;f<this.content.table.rows[loc].cols.length;f++){
		this.content.table.rows[loc].cols[f].options.isLabel = true;
	}
	
	/* refresh the table */
	this.generateTableDiv();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Sets up the html element to allow the author to build a table based on pre-set options.
 */
View.prototype.DataGraphNode.buildTable = function(){
	var optionHTML = 'Build a <input type="text" id="buildRowsInput" size="1"></input> rows by <input type="text" id="buildColsInput" size="1"></input> columns ' + 
		'table <select id="buildLabelSelect"><option value="1">with</option><option value="0">without</option></select> a label row and ' +
		'<select id="independentSelect"><option value="1">with</option><option value="0">without</option></select> an independent variable ' +
		'and x-axis is <select id="tableTypeSelect"><option value="0">Quantitative</option><option value="1">Qualitative</option></select><br/>' + 
		'<input type="button" value="Create" onclick="eventManager.fire(\'datagraphSubmitBuildTable\')"></input><input type="button" value="Cancel" ' +
		'onclick="eventManager.fire(\'datagraphCancelBuildTable\')"></input>';
	
	$('#selectOptionsOptions').html(optionHTML);
};

/**
 * Cancels the building of a table from scratch and re-populates the options.
 */
View.prototype.DataGraphNode.cancelBuildTable = function(){
	this.generateSelectionOptions();
};

/**
 * Gets the user input and validates them, builds a table based on the input
 * and refreshes the table and preview.
 */
View.prototype.DataGraphNode.submitBuildTable = function(){
	/* get input values */
	var lab = parseInt($('#buildLabelSelect').val());
	var ind = parseInt($('#independentSelect').val());
	var type = $('#tableTypeSelect').val();
	var rows = parseInt($('#buildRowsInput').val()) + lab;
	var cols = parseInt($('#buildColsInput').val()) + ind;
	
	/* validate that the rows and columns were specified and
	 * that they are numbers */
	if(isNaN(rows) || isNaN(cols)){
		this.view.notificationManager.notify('Both rows and columns must be specified and must be numbers',3);
		return;
	}
	
	/* check to make sure initial cols is 11 or less and initial rows is 31 or less */
	if(rows > 31 || cols > 11){
		this.view.notificationManager.notify('Please start with a table that is 30 rows or less and 10 columns or less, aborting table creation.',3);
		return;
	}
	
	/* set the table with the template */
	this.content.table = this.getTableTemplate();
	
	/* create table rows and columns */
	for(var k=0;k<rows;k++){
		this.content.table.rows[k] = this.createRow(cols);
	}
	
	/* setup label row if needed */
	if(lab==1){
		for(var j=0;j<this.content.table.rows[0].cols.length;j++){
			this.content.table.rows[0].cols[j].options.isLabel = true;
		}
		this.content.table.titleIndex = 0;
	}
	
	/* setup independent column if needed */
	if(ind==1){
		if(type==1){
			for(var l=0;l<this.content.table.rows.length;l++){
				this.content.table.rows[l].cols[0].options.isLabel = true;
			}
		}
		
		this.content.table.independentIndex = 0;
	}
	
	/* set up type */
	if(type==1){
		this.content.table.isQualitative = true;
	} else {
		this.content.table.isQualitative = false;
	}
	
	/* refresh the table */
	this.generateTableDiv();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Sets the html start mode option elements to the boolean @param enabled
 */
View.prototype.DataGraphNode.startOptions = function(enabled){
	var opts = document.getElementsByName('startMode');
	for(var k=0;k<opts.length;k++){
		opts[k].disabled = !(enabled);
	}
};

/**
 * Determines the display option selected by the user and updates the content
 */
View.prototype.DataGraphNode.displayOptionChanged = function(){
	var rads = document.getElementsByName('displayRadio');
	for(var n=0;n<rads.length;n++){
		if(rads[n].checked){
			var val = rads[n].value;
			this.content.options.display.which = val;
			if(val=='0'){
				this.startOptions(false);
				document.getElementById('startModeData').checked = true;
				this.startModeChanged();
			} else if(val=='1'){
				this.startOptions(false);
				document.getElementById('startModeGraph').checked = true;
				this.startModeChanged();
			} else if(val=='2' || val=='3'){
				this.startOptions(true);
				
				/* fire source updated event */
				this.view.eventManager.fire('sourceUpdated');
			}
		}
	}
};

/**
 * Determines the start mode selected by the user and updates the content
 */
View.prototype.DataGraphNode.startModeChanged = function(){
	var mods = document.getElementsByName('startMode');
	for(o=0;o<mods.length;o++){
		if(mods[o].checked){
			this.content.options.display.start = mods[o].value;
		}
	}
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the associated graph option attribute in xmlPage with the given
 * @param name's html element checked attribute value.
 */
View.prototype.DataGraphNode.graphOptionChanged = function(name){
	this.content.options.graph[name] = document.getElementById(name+'Check').checked;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the height or width of the graph in the content with the
 * user specified value.
 */
View.prototype.DataGraphNode.graphSizeChanged = function(which){
	var val = $('#graph' + which + 'Input').val();
	if(isNaN(val)){
		$('#graph' + which + 'Input').val(this.content.table['graph' + which]);
		this.view.notificationManager.notify('The graph dimensions can only be specified in a number of pixels, no text is allowed.', 3);
	} else {
		this.content.table['graph' + which] = parseInt(val);
		
		/* fire source updated event */
		this.view.eventManager.fire('sourceUpdated');
	}
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 */
View.prototype.DataGraphNode.updateContent = function(){
	/* update content object */
	this.view.activeContent.setContent(this.content);
};

/**
 * Returns an unitialized table object.
 */
View.prototype.DataGraphNode.getTableTemplate = function(){
	return {
		rows: [],
		title: '',
		titleEditable: true,
		independentIndex: -1,
		titleIndex: -1,
		isQualitative: false,
		xLabel: '',
		yLabel: '',
		xLabelEditable: true,
		yLabelEditable: true,
		graphWidth: 800,
		graphHeight: 573
	};
};

/**
 * Returns an un-initialized options object.
 */
View.prototype.DataGraphNode.getSelectionOptionsObject = function(){
	return {
		row_column: {
			isGroup: true,
			html: '<div id="row_column_group" class="groupOption">Row/Column Options</div>',
			addRow: {
				isOption: true,
				use: false,
				html: '<div id="addRowOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphAddRow\')">Add Row</div>'
			},
			removeRow: {
				isOption: true,
				use: false,
				html: '<div id="removeRowOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphRemoveRow\')">Remove Row</div>'
			},
			insertRowBefore: {
				isOption: true,
				use: false,
				html: '<div id="insertRowBeforeOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphInsertRowBefore\')">Insert Row Before</div>'
			},
			insertRowAfter:{
				isOption: true,
				use: false,
				html: '<div id="insertRowAfterOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphInsertRowAfter\')">Insert Row After</div>'
			},
			addColumn: {
				isOption: true,
				use: false,
				html: '<div id="addColumnOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphAddCol\')">Add Column</div>'
			},
			removeColumn:{
				isOption: true,
				use: false,
				html: '<div id="removeColumnOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphRemoveCol\')">Remove Column</div>'
			},
			insertColumnBefore: {
				isOption: true,
				use: false,
				html: '<div id="insertColumnBeforeOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphInsertColBefore\')">Insert Column Before</div>'
			},
			insertColumnAfter: {
				isOption: true,
				use: false,
				html: '<div id="insertColumnAfterOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphInsertColAfter\')">Insert Column After</div>'
			}
		},
		table: {
			isGroup: true,
			html: '<div id="table_group" class="groupOption">Table Options</div>',
			template: {
				isOption: true,
				use: false,
				html: '<div id="templateOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphBuildTable\')">Build Table from Template</div>'
			},
			startOver: {
				isOption: true,
				use: false,
				html: '<div id="startOverOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphStartOver\')">Start from Scratch</div>'
			}
		},
		cell: {
			isGroup: true,
			html: '<div id="cell_group" class="groupOption">Cell Options</div>',
			editable: {
				isOption: true,
				use: false,
				html: '<div id="editableOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphToggleEditable\')">Toggle Editable</div>'
			}
		},
		independent: {
			isGroup: true,
			html: '<div id="independent_group" class="groupOption">Independent Variable (x-axis) options</div>',
			addIndependent: {
				isOption: true,
				use: false,
				html: '<div id="addIndependentOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphAddIndependent\')">Add Independent Variable Column</div>'
			},
			removeIndependent: {
				isOption: true,
				use: false,
				html: '<div id="removeIndependentOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphRemoveIndependent\')">Remove Independent Variable Column</div>'
			},
			setIndependent: {
				isOption: true,
				use: false,
				html: '<div id="setIndependentOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphSetIndependent\')">Set Column as Independent Variable</div>'
			},
			unsetIndependent: {
				isOption: true,
				use: false,
				html: '<div id="unsetIndependentOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphUnsetIndependent\')">Un-set Column as Independent Variable</div>'
			},
			setQuantitative: {
				isOption: true,
				use: false,
				html: '<div id="setQuantitativeOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphSetQuantitative\')">Set x-axis as Quantitative</div>'
			},
			setQualitative: {
				isOption: true,
				use: false,
				html: '<div id="setQualitativeOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphSetQualitative\')">Set x-axis as Qualitative</div>'
			}
		},
		label: {
			isGroup: true,
			html: '<div id="label_group" class="groupOption">Label Options</div>',
			addLabel: {
				isOption: true,
				use: false,
				html: '<div id="addLabelOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphAddLabel\')">Add Label Row</div>'
			},
			removeLabel: {
				isOption: true,
				use: false,
				html: '<div id="removeLabelOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphRemoveLabel\')">Remove Label Row</div>'
			},
			setLabel: {
				isOption: true,
				use: false,
				html: '<div id="setLabelOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphSetLabel\')">Set Row as Label Row</div>'
			},
			unsetLabel: {
				isOption: true,
				use: false,
				html: '<div id="unsetLabelOption" class="selectOption" onmouseover="$(this).addClass(\'selected\')" onmouseout="$(this).removeClass(\'selected\')" onclick="eventManager.fire(\'datagraphUnsetLabel\')">Un-set Row as Label Row</div>'
			}
		}
	};	
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/datagraph/authorview_datagraph.js');
}