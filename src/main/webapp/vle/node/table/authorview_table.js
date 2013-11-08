/**
 * Sets the TemplateNode type as an object of this view
 * 
 * TODO: rename TemplateNode
 * @constructor
 */
View.prototype.TableNode = {};

/*
 * Add the name of the common component that this step will use. The
 * common components will be handled by the authoring tool. You will
 * need to create div elements with the appropriate id for the
 * authoring tool to insert the component into. Any additional custom
 * authoring components specific to your step type will be written 
 * by you in the generatePage() function. You may leave the array
 * empty if you are not using any common components.
 * 
 * Here are the available common components
 * 'Prompt'
 * 'LinkTo'
 * 'StudentResponseBoxSize'
 * 'RichTextEditorToggle'
 * 'StarterSentenceAuthoring'
 * 
 * If you use a common components, you must create a div with the
 * appropriate id, here are the respective ids
 * 'promptContainer'
 * (LinkTo does not require a div)
 * 'studentResponseBoxSizeContainer'
 * 'richTextEditorToggleContainer'
 * 'starterSentenceAuthoringContainer'
 * 
 * 
 * TODO: rename TemplateNode
 */
View.prototype.TableNode.commonComponents = [];

/**
 * Generates the authoring page. This function will create the authoring
 * components such as textareas, radio buttons, check boxes, etc. that
 * authors will use to author the step. For example if the step has a
 * text prompt that the student will read, this function will create
 * a textarea that will allow the author to type the text that the
 * student will see. You will also need to populate the textarea with
 * the pre-existing prompt if the step has been authored before.
 * 
 * TODO: rename TemplateNode
 */
View.prototype.TableNode.generatePage = function(view){
	this.view = view;
	
	//get the content of the step
	this.content = this.view.activeContent.getContentJSON();
	
	//get the html element that all the authoring components will be located
	var parent = document.getElementById('dynamicParent');
	
	/*
	 * wipe out the div that contains the authoring components because it
	 * may still be populated with the authoring components from a previous
	 * step the author has been authoring since we re-use the div id
	 */
	parent.removeChild(document.getElementById('dynamicPage'));

	//create a new div that will contain the authoring components
	var pageDiv = createElement(document, 'div', {id:'dynamicPage', style:'width:100%;height:100%'});
	
	//create the label for the textarea that the author will write the prompt in
	var promptText = document.createTextNode("Prompt for Student:");
	
	/*
	 * create the textarea that the author will write the prompt in
	 * 
	 * onkeyup will fire the 'templateUpdatePrompt' event which will
	 * be handled in the <new step type name>Events.js file
	 * 
	 * For example if you are creating a quiz step you would look in
	 * your quizEvents.js file.
	 * 
	 * when you add new authoring components you will need to create
	 * new events in the <new step type name>Events.js file and then
	 * create new functions to handle the event
	 */
	var promptTextArea = createElement(document, 'textarea', {id: 'promptTextArea', rows:'5', cols:'85', onkeyup:"eventManager.fire('tableUpdatePrompt')"});
	
	//add the authoring components to the page
	pageDiv.appendChild(promptText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(promptTextArea);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	
	//get the number of columns and rows
	var numColumns = this.content.numColumns;
	var numRows = this.content.numRows;
	var globalCellSize = this.content.globalCellSize;
	
	if(globalCellSize == null) {
		//the step does not have a global cell size set so we will use empty string
		globalCellSize = "";
	}
	
	//create the input boxes for columns and rows
	var numColumnsText = document.createTextNode('Columns: ');
	var numColumnsInput = createElement(document, 'input', {type: 'text', id: 'numColumnsInput', name: 'numColumnsInput', value: numColumns, size: 10, onkeyup: 'eventManager.fire("tableUpdateNumColumns")'});
	var numRowsText = document.createTextNode(' Rows: ');
	var numRowsInput = createElement(document, 'input', {type: 'text', id: 'numRowsInput', name: 'numRowsInput', value: numRows, size: 10, onkeyup: 'eventManager.fire("tableUpdateNumRows")'});
	
	//create the input box for the global cell size
	var globalCellSizeText = document.createTextNode(' Global Cell Size: ');
	var globalCellSizeInput = createElement(document, 'input', {type: 'text', id: 'globalCellSizeInput', name: 'numRowsInput', value: globalCellSize, size: 10, onkeyup: 'eventManager.fire("tableUpdateGlobalCellSize")'});
	
	//add the input boxes for columns and rows
	pageDiv.appendChild(numColumnsText);
	pageDiv.appendChild(numColumnsInput);
	pageDiv.appendChild(numRowsText);
	pageDiv.appendChild(numRowsInput);
	pageDiv.appendChild(globalCellSizeText);
	pageDiv.appendChild(globalCellSizeInput);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	
	//create the checkbox to enable drop down title
	var enableDropDownTitleCheckBox = createElement(document, 'input', {type: 'checkbox', id: 'enableDropDownTitleCheckBox', name: 'enableDropDownTitleCheckBox', onchange: 'eventManager.fire("tableUpdateEnableDropDownTitleCheckBoxClicked")'});
	
	//create the label for the enable drop down title
	var enableDropDownTitleCheckBoxText = document.createTextNode("Enable Drop Down Title");

	//create the div that will hold the title drop down authoring
	var titleDropDownDiv = createElement(document, 'div', {id: 'titleDropDownDiv'});
	
	//create the button to add more drop down title options
	var addDropDownTitleButton = createElement(document, 'input', {type: 'button', id: 'addDropDownTitleButton', name: 'addDropDownTitleButton', value: 'Add Drop Down Title', onclick: 'eventManager.fire("tableUpdateAddDropDownTitleButtonClicked")'});
	
	//create the div that contains the add drop down title button and the drop down options
	var titleDropDownListDiv = createElement(document, 'div', {id: 'titleDropDownListDiv'});
	
	//add the add drop down title button and the drop down list div
	titleDropDownDiv.appendChild(addDropDownTitleButton);
	titleDropDownDiv.appendChild(titleDropDownListDiv);
	titleDropDownDiv.appendChild(createBreak());
	
	//add the drop down title elements
	pageDiv.appendChild(enableDropDownTitleCheckBox);
	pageDiv.appendChild(enableDropDownTitleCheckBoxText);
	pageDiv.appendChild(titleDropDownDiv);
	pageDiv.appendChild(createBreak());
	
	var allowStudentToAddRowsCheckBox = createElement(document, 'input', {type: 'checkbox', id: 'allowStudentToAddRowsCheckBox', name: 'allowStudentToAddRowsCheckBox', onchange: 'eventManager.fire("tableUpdateAllowStudentToAddRowsCheckBoxClicked")'});
	var allowStudentToAddRowsCheckBoxText = document.createTextNode("Allow Student To Add Rows");
	var allowStudentToAddColumnsCheckBox = createElement(document, 'input', {type: 'checkbox', id: 'allowStudentToAddColumnsCheckBox', name: 'allowStudentToAddColumnsCheckBox', onchange: 'eventManager.fire("tableUpdateAllowStudentToAddColumnsCheckBoxClicked")'});
	var allowStudentToAddColumnsCheckBoxText = document.createTextNode("Allow Student To Add Columns");
	
	pageDiv.appendChild(allowStudentToAddRowsCheckBox);
	pageDiv.appendChild(allowStudentToAddRowsCheckBoxText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(allowStudentToAddColumnsCheckBox);
	pageDiv.appendChild(allowStudentToAddColumnsCheckBoxText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	
	//instructions on what the letters mean in the table UI
	var iText = document.createTextNode('I = Insert Column/Row');
	var dText = document.createTextNode('D = Delete Column/Row');
	var uText = document.createTextNode('U = Uneditable for student');
	var sText = document.createTextNode('S = Size of Cell (width in number of characters, overrides Global Cell Size)');
	
	//add the instructions
	pageDiv.appendChild(iText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(dText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(uText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(sText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	
	//create the div that will hold the table
	var tableDiv = createElement(document, 'div', {id: 'authoringTableDiv'});
	
	//add the table
	pageDiv.appendChild(tableDiv);
	pageDiv.appendChild(createBreak());
	
	//generate the authorable table
	var authoringTable = this.generateAuthoringTable();
	
	//add the table
	tableDiv.appendChild(authoringTable);

	//create the checkbox to enable graphing
	var enableGraphingCheckBox = createElement(document, 'input', {type: 'checkbox', id: 'enableGraphingCheckBox', name: 'enableGraphingCheckBox', onchange: 'eventManager.fire("tableEnableGraphingClicked")'});
	
	//create the label for the enable graphing checkbox
	var enableGraphingCheckBoxText = document.createTextNode("Enable Graphing");
	
	//add the enable graphing elements
	pageDiv.appendChild(enableGraphingCheckBox);
	pageDiv.appendChild(enableGraphingCheckBoxText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	
	//create the div that will hold the graphing options
	var graphingOptionsDiv = createElement(document, 'div', {id: 'graphingOptionsDiv'});
	var graphTypeDiv = createElement(document, 'div', {id: 'graphTypeDiv'});
	
	//create the radio buttons to choose the graph type
	var graphTypeRadioButtons = this.generateGraphTypeRadioButtons();
	graphTypeDiv.appendChild(graphTypeRadioButtons);
	graphingOptionsDiv.appendChild(graphTypeDiv);
	graphingOptionsDiv.appendChild(createBreak());
	
	//create the radio buttons to choose who will select the axes to graph
	var graphSelectAxesRadioButtons = this.generateGraphSelectAxesRadioButtons();
	graphingOptionsDiv.appendChild(graphSelectAxesRadioButtons);
	graphingOptionsDiv.appendChild(createBreak());
	
	//create the radio buttons to choose who will select the axes limits
	var graphWhoSetAxesLimitsRadioButtons = this.generateGraphWhoSetAxesLimitsRadioButtons();
	graphingOptionsDiv.appendChild(graphWhoSetAxesLimitsRadioButtons);
	graphingOptionsDiv.appendChild(createBreak());
	
	//create the input fields for entering the axes limits
	var generateGraphAxesLimitsInputs = this.generateGraphAxesLimitsInputs();
	graphingOptionsDiv.appendChild(generateGraphAxesLimitsInputs);
	graphingOptionsDiv.appendChild(createBreak());
	
	//add the graphing options div
	pageDiv.appendChild(graphingOptionsDiv);
	pageDiv.appendChild(createBreak());
	
	//create the checkbox to hide everything below the table
	var hideEverythingBelowTableCheckBox = createElement(document, 'input', {type: 'checkbox', id: 'hideEverythingBelowTableCheckBox', name: 'hideEverythingBelowTableCheckBox', onchange: 'eventManager.fire("tableUpdateHideEverythingBelowTable")'});
	
	//create the label for hide everything below the table
	var hideEverythingBelowTableText = document.createTextNode("Hide Everything Below the Table");
	
	//add the hide everything below the table elements
	pageDiv.appendChild(hideEverythingBelowTableCheckBox);
	pageDiv.appendChild(hideEverythingBelowTableText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	
	//create the label for prompt2
	var promptText = document.createTextNode("Prompt2 for Student (shows up between the table and the student response textarea):");
	
	//create the prompt2 textarea
	var promptTextArea = createElement(document, 'textarea', {id: 'prompt2TextArea', rows:'5', cols:'85', onkeyup:"eventManager.fire('tableUpdatePrompt2')"});
	
	//add the prompt2
	pageDiv.appendChild(promptText);
	pageDiv.appendChild(promptTextArea);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	
	//create the label for the starter sentence
	var starterSentenceText = document.createTextNode("Starter Sentence:");
	
	//create the starter sentence textarea
	var starterSentenceTextArea = createElement(document, 'textarea', {id: 'starterSentenceTextArea', rows:'5', cols:'85', onkeyup:"eventManager.fire('tableUpdateStarterSentence')"});
	
	//add the starter sentence
	pageDiv.appendChild(starterSentenceText);
	pageDiv.appendChild(starterSentenceTextArea);
	
	//add the page to the parent
	parent.appendChild(pageDiv);
	
	//populate the prompt if this step has been authored before
	this.populatePrompts();
	
	//populate the starter sentence
	this.populateStarterSentence();
	
	//populate the graph options
	this.populateGraphOptions();
	
	//populate the drop down title content
	this.populateTitleDropDownContent();
	
	//populate the student options
	this.populateStudentOptions();
	
	//set the checkbox
	if(this.content.hideEverythingBelowTable) {
		hideEverythingBelowTableCheckBox.checked = true;
	}
};

/**
 * Generate the radio buttons to let the author choose what type of
 * graph to make
 */
View.prototype.TableNode.generateGraphTypeRadioButtons = function() {
	//create the div to contain the radio buttons
	var graphTypeRadioButtonsDiv = createElement(document, 'div', {id: 'graphTypeRadioButtonsDiv'});
	
	//display the text 'Graph Type'
	var graphTypeText = document.createTextNode('Graph Type');
	graphTypeRadioButtonsDiv.appendChild(graphTypeText);
	graphTypeRadioButtonsDiv.appendChild(createBreak());
	
	//a list of all the graph types we support
	var graphTypes = [
	                  'Scatter Plot',
	                  'Scatter Plot by Series',
	                  'Line Graph',
	                  'Bar Graph',
	                  'Pie Graph'
	                  ];
	
	//loop through all the graph types
	for(var x=0; x<graphTypes.length; x++) {
		//get a graph type
		var graphType = graphTypes[x];
		
		/*
		 * get the camel case version of the graph type
		 * e.g.
		 * 'Scatter Plot' will change to 'scatterPlot'
		 */
		var graphTypeCamelCased = graphType.charAt(0).toLocaleLowerCase() + graphType.substring(1);
		
		//remove all spaces
		graphTypeCamelCased = graphTypeCamelCased.replace(/ /g, '');
		
		//create the radio button
		var graphTypeRadioButton = createElement(document, 'input', {type: 'radio', id: 'graphType_' + x, name: 'graphType', value: graphTypeCamelCased, onclick: "eventManager.fire('tableGraphTypeClicked')"});
		
		//create the text for the radio button
		var graphTypeText = document.createTextNode(graphType);
		
		//add the radio button to the div
		graphTypeRadioButtonsDiv.appendChild(graphTypeRadioButton);
		graphTypeRadioButtonsDiv.appendChild(graphTypeText);
		graphTypeRadioButtonsDiv.appendChild(createBreak());
	}
	
	return graphTypeRadioButtonsDiv;
};

View.prototype.TableNode.generateSeriesPropertiesInputs = function() {
	// create a button to allow for new label color pair
	var generateSeriesInputButton = createElement(document, 'input', {type: 'button', id: 'newSeriesProperties', name: 'newSeriesProperties', value: 'New Series', onclick: 'eventManager.fire("tableNewSeriesPropertiesClicked")'});
	$('#graphTypeDiv').append(generateSeriesInputButton);
	$('#graphTypeDiv').append(createBreak());

	// create any pairs that already exist
	if (typeof this.content.graphOptions.seriesLabels === "undefined"){
		this.content.graphOptions.seriesLabels = [];
		this.content.graphOptions.seriesColors = [];
		this.content.graphOptions.seriesPointSizes = [];
	}
	for (var index = 0; index < this.content.graphOptions.seriesLabels.length; index++){
		$('#graphTypeDiv').append(document.createTextNode('Value:'));
		$('#graphTypeDiv').append(createElement(document, 'input', {type: 'input', id: 'seriesLabelInput-'+index, name: 'seriesLabelInput-'+index, value: this.content.graphOptions.seriesLabels[index], size:20, onchange: 'eventManager.fire("tableUpdateSeriesLabel", '+index+')'}));
		$('#graphTypeDiv').append(document.createTextNode('Color:'));
		$('#graphTypeDiv').append(createElement(document, 'input', {type: 'input', id: 'seriesColorInput-'+index, name: 'seriesColorInput-'+index, value: this.content.graphOptions.seriesColors[index], size:6, onchange: 'eventManager.fire("tableUpdateSeriesColor", '+index+')'}));
		$('#graphTypeDiv').append(document.createTextNode('Point Size:'));
		$('#graphTypeDiv').append(createElement(document, 'input', {type: 'input', id: 'seriesPointSizeInput-'+index, name: 'seriesPointSizeInput-'+index, value: this.content.graphOptions.seriesPointSizes[index], size:2, onchange: 'eventManager.fire("tableUpdateSeriesPointSize", '+index+')'}));
		$('#graphTypeDiv').append(createBreak());
	}
}

View.prototype.TableNode.tableNewSeriesProperties = function() {
	var index = 0;
	if (this.content.graphOptions.seriesLabels == null){
		this.content.graphOptions.seriesLabels = [];
	} else {
		index = this.content.graphOptions.seriesLabels.length;
	} 

	var seriesLabelText = document.createTextNode('Value:');
	var seriesLabel = createElement(document, 'input', {type: 'input', id: 'seriesLabelInput-'+index, name: 'seriesLabelInput-'+index, value: "", size:20, onchange: 'eventManager.fire("tableUpdateSeriesLabel", '+index+')'});
	this.content.graphOptions.seriesLabels.push("");

	var seriesColorText = document.createTextNode('Color:');
	var seriesColor = createElement(document, 'input', {type: 'input', id: 'seriesColorInput-'+index, name: 'seriesColorInput-'+index, value: "", size:10, onchange: 'eventManager.fire("tableUpdateSeriesColor", '+index+')'});
	this.content.graphOptions.seriesColors.push("");

	var seriesPointSizeText = document.createTextNode('Point Size:');
	var seriesPointSize = createElement(document, 'input', {type: 'input', id: 'seriesPointSizeInput-'+index, name: 'seriesPointSizeInput-'+index, value: "", size:10, onchange: 'eventManager.fire("tableUpdateSeriesPointSize", '+index+')'});
	this.content.graphOptions.seriesPointSizes.push("");

	$('#graphTypeDiv').append(seriesLabelText);
	$('#graphTypeDiv').append(seriesLabel);
	$('#graphTypeDiv').append(seriesColorText);
	$('#graphTypeDiv').append(seriesColor);
	$('#graphTypeDiv').append(seriesPointSizeText);
	$('#graphTypeDiv').append(seriesPointSize);
	$('#graphTypeDiv').append(createBreak());
	//fire source updated event
	this.view.eventManager.fire('sourceUpdated');
}

/**
 * Update the custom series label
 */
View.prototype.TableNode.tableUpdateSeriesLabel = function(index) {
	
	this.content.graphOptions.seriesLabels[index] = $('#seriesLabelInput-'+index).attr('value');
	//fire source updated event
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the custom series label color
 */
View.prototype.TableNode.tableUpdateSeriesColor = function(index) {
	
	this.content.graphOptions.seriesColors[index] = $('#seriesColorInput-'+index).attr('value');
	//fire source updated event
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the custom series label point size
 */
View.prototype.TableNode.tableUpdateSeriesPointSize = function(index) {
	
	this.content.graphOptions.seriesPointSizes[index] = $('#seriesPointSizeInput-'+index).attr('value');
	//fire source updated event
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Generate the radio buttons to allow the author to decide who will
 * select the axes
 */
View.prototype.TableNode.generateGraphSelectAxesRadioButtons = function() {
	//create the div to contain the radio buttons
	var graphSelectAxesRadioButtonsDiv = createElement(document, 'div', {id: 'graphSelectAxesRadioButtonsDiv'});
	
	//display the text 'Who will select Axes'
	var graphSelectAxesText = document.createTextNode('Who will select axes?');
	graphSelectAxesRadioButtonsDiv.appendChild(graphSelectAxesText);
	graphSelectAxesRadioButtonsDiv.appendChild(createBreak());
	
	//the options for selecting the axes
	var graphSelectAxesTypes = [
	                  'Author Select',
	                  'Student Select'
	                  ];
	
	//loop through the select axes types
	for(var x=0; x<graphSelectAxesTypes.length; x++) {
		//get a select axes type
		var graphSelectAxesType = graphSelectAxesTypes[x];
		
		/*
		 * get the camel case version of the select axes type
		 * e.g.
		 * 'Author Select' will change to 'authorSelect'
		 */
		var graphSelectAxesTypeCamelCased = graphSelectAxesType.charAt(0).toLocaleLowerCase() + graphSelectAxesType.substring(1);
		
		//remove all spaces
		graphSelectAxesTypeCamelCased = graphSelectAxesTypeCamelCased.replace(/ /g, '');
		
		//create the radio button
		var graphSelectAxesTypeRadioButton = createElement(document, 'input', {type: 'radio', id: 'graphSelectAxesType_' + x, name: 'graphSelectAxesType', value: graphSelectAxesTypeCamelCased, onclick: "eventManager.fire('tableGraphSelectAxesTypeClicked')"});
		
		//create the text for the radio button
		var graphSelectAxesTypeText = document.createTextNode(graphSelectAxesType);
		
		//add the radio button to the div
		graphSelectAxesRadioButtonsDiv.appendChild(graphSelectAxesTypeRadioButton);
		graphSelectAxesRadioButtonsDiv.appendChild(graphSelectAxesTypeText);
		graphSelectAxesRadioButtonsDiv.appendChild(createBreak());
	}
	
	return graphSelectAxesRadioButtonsDiv;
};

/**
 * Generate the radio buttons to allow the author to decide who will
 * set the axes limits
 */
View.prototype.TableNode.generateGraphWhoSetAxesLimitsRadioButtons = function() {
	//create the div to contain the radio buttons
	var graphWhoSetAxesLimitsRadioButtonsDiv = createElement(document, 'div', {id: 'graphWhoSetAxesLimitsRadioButtonsDiv'});
	
	//display the text 'Who will select Axes'
	var graphWhoSetAxesLimitsText = document.createTextNode('Who will set axes limits?');
	graphWhoSetAxesLimitsRadioButtonsDiv.appendChild(graphWhoSetAxesLimitsText);
	graphWhoSetAxesLimitsRadioButtonsDiv.appendChild(createBreak());
	
	//the options for selecting the axes
	var graphWhoSetAxesLimitsTypes = [
	                  'Auto',
	                  'Author Select',
	                  'Student Select'
	                  ];
	
	//loop through the select axes types
	for(var x=0; x<graphWhoSetAxesLimitsTypes.length; x++) {
		//get a select axes type
		var graphWhoSetAxesLimitsType = graphWhoSetAxesLimitsTypes[x];
		
		/*
		 * get the camel case version of the select axes type
		 * e.g.
		 * 'Author Select' will change to 'authorSelect'
		 */
		var graphWhoSetAxesLimitsTypeCamelCased = graphWhoSetAxesLimitsType.charAt(0).toLocaleLowerCase() + graphWhoSetAxesLimitsType.substring(1);
		
		//remove all spaces
		graphWhoSetAxesLimitsTypeCamelCased = graphWhoSetAxesLimitsTypeCamelCased.replace(/ /g, '');
		
		//create the radio button
		var graphWhoSetAxesLimitsTypeRadioButton = createElement(document, 'input', {type: 'radio', id: 'graphWhoSetAxesLimitsType_' + x, name: 'graphWhoSetAxesLimitsType', value: graphWhoSetAxesLimitsTypeCamelCased, onclick: "eventManager.fire('tableGraphWhoSetAxesLimitsTypeClicked')"});
		
		//create the text for the radio button
		var graphWhoSetAxesLimitsTypeText = document.createTextNode(graphWhoSetAxesLimitsType);
		
		//add the radio button to the div
		graphWhoSetAxesLimitsRadioButtonsDiv.appendChild(graphWhoSetAxesLimitsTypeRadioButton);
		graphWhoSetAxesLimitsRadioButtonsDiv.appendChild(graphWhoSetAxesLimitsTypeText);
		graphWhoSetAxesLimitsRadioButtonsDiv.appendChild(createBreak());
	}
	
	return graphWhoSetAxesLimitsRadioButtonsDiv;
};

/**
 * Generate the input elements for the axes limits
 */
View.prototype.TableNode.generateGraphAxesLimitsInputs = function() {
	
	//create the div to contain the graph axes limits inputs
	var graphAxesLimitsInputsDiv = createElement(document, 'div', {id: 'graphAxesLimitsInputsDiv'});
	
	var xMin = '';
	var xMax = '';
	
	//create the X Min input
	var xMinText = document.createTextNode('X Min: ');
	var xMinInput = createElement(document, 'input', {type: 'text', id: 'graphXMinInput', name: 'graphXMinInput', value: xMin, size: 10, onkeyup: 'eventManager.fire("tableUpdateGraphXMin")'});
	
	//create the X Max input
	var xMaxText = document.createTextNode('X Max: ');
	var xMaxInput = createElement(document, 'input', {type: 'text', id: 'graphXMaxInput', name: 'graphXMaxInput', value: xMax, size: 10, onkeyup: 'eventManager.fire("tableUpdateGraphXMax")'});
	
	var yMin = '';
	var yMax = '';
	
	//create the Y Min input
	var yMinText = document.createTextNode('Y Min: ');
	var yMinInput = createElement(document, 'input', {type: 'text', id: 'graphYMinInput', name: 'graphYMinInput', value: yMin, size: 10, onkeyup: 'eventManager.fire("tableUpdateGraphYMin")'});
	
	//create the Y Max input
	var yMaxText = document.createTextNode('Y Max: ');
	var yMaxInput = createElement(document, 'input', {type: 'text', id: 'graphYMaxInput', name: 'graphYMaxInput', value: yMax, size: 10, onkeyup: 'eventManager.fire("tableUpdateGraphYMax")'});
	
	//add the elements to the div
	graphAxesLimitsInputsDiv.appendChild(xMinText);
	graphAxesLimitsInputsDiv.appendChild(xMinInput);
	graphAxesLimitsInputsDiv.appendChild(createBreak());
	graphAxesLimitsInputsDiv.appendChild(xMaxText);
	graphAxesLimitsInputsDiv.appendChild(xMaxInput);
	graphAxesLimitsInputsDiv.appendChild(createBreak());
	graphAxesLimitsInputsDiv.appendChild(yMinText);
	graphAxesLimitsInputsDiv.appendChild(yMinInput);
	graphAxesLimitsInputsDiv.appendChild(createBreak());
	graphAxesLimitsInputsDiv.appendChild(yMaxText);
	graphAxesLimitsInputsDiv.appendChild(yMaxInput);
	
	return graphAxesLimitsInputsDiv;
};

/**
 * Generate the authorable table
 */
View.prototype.TableNode.generateAuthoringTable = function() {
	//create the table
	var authoringTable = createElement(document, 'table', {id: 'authoringTable', border:'1'});
	
	//create a header row to display the I (insert) and D (delete) buttons
	var headerTR = createElement(document, 'tr');
	authoringTable.appendChild(headerTR);
	
	//add the upper left cell (0,0) that will be empty
	var headerTD = createElement(document, 'td');
	headerTR.appendChild(headerTD);
	
	//add a td for each column
	for(var x=0; x<this.content.numColumns; x++) {
		headerTD = createElement(document, 'td');
		
		var selectColumnToAxisMappingDropDownStyle = '';

		if(this.content.graphOptions != null && this.content.graphOptions.enableGraphing && this.content.graphOptions.graphSelectAxesType == 'authorSelect') {
			//the author will select the axes so we will show the drop downs to select the axis for the columns
			selectColumnToAxisMappingDropDownStyle = 'display:inline';
		} else {
			//the author will not select the axes so we will not show the drop downs to select the axis for the columns
			selectColumnToAxisMappingDropDownStyle = 'display:none';
		}
		
		//create the insert and delete buttons
		var insertColumnButton = createElement(document, 'input', {type: 'button', id: 'insertColumnButton_' + x, name: 'insertColumnButton_' + x, value: 'I', onclick: 'eventManager.fire("tableInsertColumn", {x:' + x + '})'});
		var deleteColumnButton = createElement(document, 'input', {type: 'button', id: 'deleteColumnButton_' + x, name: 'deleteColumnButton_' + x, value: 'D', onclick: 'eventManager.fire("tableDeleteColumn", {x:' + x + '})'});
		
		//create the drop down to select the axis for the columns
		var selectAxisDropDown = createElement(document, 'select', {id: 'selectColumnToAxisMappingDropDown_' + x, name: 'selectColumnToAxisMappingDropDown_' + x, class:'selectColumnToAxisMappingDropDown', style: selectColumnToAxisMappingDropDownStyle, onchange: 'eventManager.fire("tableSelectColumnToAxisMappingDropDownChanged")'});
		
		//create the Axis text label
		var axisTextLabel = createElement(document, 'p', {id: 'axisText_' + x, class: 'selectColumnToAxisMappingTextLabel', style:selectColumnToAxisMappingDropDownStyle});
		axisTextLabel.innerHTML = 'Axis: ';
		
		//create the 'None' option for the drop down
		var noneOption = createElement(document, 'option', {value:''});
		noneOption.text = 'None';
		selectAxisDropDown.appendChild(noneOption);
		
		//create the 'X' option for the drop down
		var xOption = createElement(document, 'option', {value:'x'});
		xOption.text = 'X';
		selectAxisDropDown.appendChild(xOption);
		
		//create the 'Y' option for the drop down
		var yOption = createElement(document, 'option', {value:'y'});
		yOption.text = 'Y';
		selectAxisDropDown.appendChild(yOption);
		
		// if this is a series graph add the "Color" option
		if (typeof this.content.graphOptions !== "undefined" && typeof this.content.graphOptions.graphType !== "undefined" && this.content.graphOptions.graphType == "scatterPlotbySeries"){
			var cOption = createElement(document, 'option', {value:'c'});
			cOption.text = 'Color';
			selectAxisDropDown.appendChild(cOption);
			var pOption = createElement(document, 'option', {value:'p'});
			pOption.text = 'Point Size';
			selectAxisDropDown.appendChild(pOption);
		}

		//get the axis for this column if it has been set
		var columnAxis = this.getColumnAxisByColumnIndex(x);
		
		if(columnAxis != null) {
			if(columnAxis == 'x') {
				//this column is set to x
				xOption.selected = true;
			} else if(columnAxis == 'y') {
				//this column is set to y
				yOption.selected = true;
			} else if (columnAxis == 'c'){
				//this column is set to c
				cOption.selected = true;
			} else if (columnAxis == 'p'){
				//this column is set to c
				pOption.selected = true;
			}
		}
		
		headerTD.appendChild(insertColumnButton);
		headerTD.appendChild(deleteColumnButton);
		headerTD.appendChild(createBreak());
		headerTD.appendChild(axisTextLabel);
		headerTD.appendChild(selectAxisDropDown);
		
		headerTR.appendChild(headerTD);
	}
	
	//loop through all the rows
	for(var y=0; y<this.content.numRows; y++) {
		
		var tr = createElement(document, 'tr');
		headerTD = createElement(document, 'td');
		
		//create the insert and delete buttons
		var insertRowButton = createElement(document, 'input', {type: 'button', id: 'insertRowButton_' + y, name: 'insertRowButton_' + y, value: 'I', onclick: 'eventManager.fire("tableInsertRow", {y:' + y + '})'});
		var deleteRowButton = createElement(document, 'input', {type: 'button', id: 'deleteRowButton_' + y, name: 'deleteRowButton_' + y, value: 'D', onclick: 'eventManager.fire("tableDeleteRow", {y:' + y + '})'});
		
		headerTD.appendChild(insertRowButton);
		headerTD.appendChild(deleteRowButton);
		
		tr.appendChild(headerTD);
		
		//loop through all the columns
		for(var x=0; x<this.content.numColumns; x++) {
			
			var td = createElement(document, 'td');
			
			var cellText = "";
			var cellUneditable = false;
			var cellSize = "";
			
			//get the data for the cell
			var cellData = this.getCellData(this.content.tableData, x, y);
			
			if(cellData != null) {
				if(cellData.text != null) {
					cellText = cellData.text;					
				}
				
				if(cellData.uneditable != null) {
					cellUneditable = cellData.uneditable;					
				}
				
				if(cellData.cellSize != null) {
					cellSize = cellData.cellSize;
				}
			}
			
			//create the input box for the cell
			var cellTextInput = createElement(document, 'input', {type: 'text', id: 'cellTextInput_' + x + '-' + y, name: 'cellTextInput_' + x + '-' + y, value: cellText, size: 10, onkeyup: 'eventManager.fire("tableUpdateCellText", {x:' + x + ', y:' + y + '})'});
			
			var cellNewline = createElement(document, 'br');
						
			//label for the 'uneditable' checkbox
			var cellCheckBoxText = document.createTextNode('U');
			
			//create the checkbox for the cell that determines whether the student can edit the cell or not
			var cellCheckBox = createElement(document, 'input', {type: 'checkbox', id: 'cellUneditableCheckBox_' + x + '-' + y, name: 'cellUneditableCheckBox_' + x + '-' + y, onchange: 'eventManager.fire("tableUpdateCellUneditable", {x:' + x + ', y:' + y + '})'});
			
			if(cellUneditable) {
				cellCheckBox.checked = true;
			}
			
			//label for the cell size input
			var cellSizeText = document.createTextNode(' S ');
			
			//create the input for the cell size
			var cellSizeInput = createElement(document, 'input', {type: 'text', id: 'cellSizeInput_' + x + '-' + y, name: 'cellSizeInput_' + x + '-' + y, value: cellSize, size: 1, onkeyup: 'eventManager.fire("tableUpdateCellSize", {x:' + x + ', y:' + y + '})'});
			
			//add the elements to the td
			td.appendChild(cellTextInput);
			td.appendChild(cellNewline);
			
			//add the checkbox for uneditable
			td.appendChild(cellCheckBoxText);
			td.appendChild(cellCheckBox);
			
			//add the input for the cell size
			td.appendChild(cellSizeText);
			td.appendChild(cellSizeInput);
			
			tr.appendChild(td);
		}
		
		authoringTable.appendChild(tr);
	}
	
	return authoringTable;
};

/**
 * Get the column axis given the column index
 * @param columnIndex the column index to get the axis value for
 * @return the axis value for the column or null if not set. axis
 * values are either 'x', 'y', or null
 */
View.prototype.TableNode.getColumnAxisByColumnIndex = function(columnIndex) {
	var result = null;
	
	if(this.content.graphOptions != null) {
		if(this.content.graphOptions.columnToAxisMappings != null) {
			//populate the column axis drop downs
			
			//loop through all the column graph axis objects
			for(var x=0; x<this.content.graphOptions.columnToAxisMappings.length; x++) {
				//get an object
				var columnToAxisMapping = this.content.graphOptions.columnToAxisMappings[x];
				
				if(columnToAxisMapping != null) {
					//get the column index and column axis
					var tempColumnIndex = columnToAxisMapping.columnIndex;
					var tempColumnAxis = columnToAxisMapping.columnAxis;
					
					if(columnIndex == tempColumnIndex) {
						//get the axis value
						result = tempColumnAxis;
						
						//break out of the for loop
						break;
					}
				}
			}
		}
	}
	
	return result;
};

/**
 * Refreshes the authoring table by generating it again using
 * the values in the content
 */
View.prototype.TableNode.updateAuthoringTable = function() {
	//generate the authoring table
	var authoringTable = this.generateAuthoringTable();
	
	//clear out the existing table
	$('#authoringTableDiv').html('');
	
	//add the newly generated table
	$('#authoringTableDiv').append(authoringTable);
};

/**
 * Get the cell data for the given x, y cell
 * @param tableData the table data
 * @param x the x coordinate of the cell
 * @param y the y coordinate of the cell
 * @return the cell data or null if not found
 */
View.prototype.TableNode.getCellData = function(tableData, x, y) {
	var cellData = null;
	
	//get the column the cell is in
	var tableColumn = tableData[x];
	
	if(tableColumn != null) {
		
		//get the cell
		var tableCell = tableColumn[y];
		
		if(tableCell != null) {
			cellData = tableCell;
		}
	}
	
	return cellData;
};

/**
 * Update the value of a field for a given cell
 * @param tableData the table data
 * @param x the x coordinate of the cell
 * @param y the y coordinate of the cell
 * @param fieldName the field name
 * @param fieldValue the value to set into the field
 */
View.prototype.TableNode.updateCellDataValue = function(tableData, x, y, fieldName, fieldValue) {
	//get the column
	var tableColumn = tableData[x];
	
	if(tableColumn == null) {
		//column does not exist so we will make it
		tableData[x] = [];
		
		//create a new cell
		tableData[x][y] = this.getCellWithDefaultValues();
		
		//set the value
		tableData[x][y][fieldName] = fieldValue;
	} else {
		var tableCell = tableColumn[y];
		
		if(tableCell == null) {
			//cell does not exist so we will make it
			tableColumn[y] = this.getCellWithDefaultValues();
			
			//set the value
			tableColumn[y][fieldName] = fieldValue;
		} else {
			//set the value
			tableCell[fieldName] = fieldValue;
		}
	}
};

/**
 * Called when the author changes the number of rows
 * @param the new number of rows
 */
View.prototype.TableNode.truncateRows = function(numRows) {
	//get the previous number of rows
	var tableDataNumRows = this.content.numRows;
	
	//get the dif in the number of rows
	var dif = tableDataNumRows - numRows;
	
	if(dif > 0) {
		//we need to remove some rows
		
		//loop through all the columns
		for(var x=0; x<this.content.tableData.length; x++) {
			//get a column
			var tableColumn = this.content.tableData[x];
			
			if(tableColumn != null) {
				//truncate the column down to the new number of rows
				tableColumn.splice(numRows, dif);
			}
		}		
	}
};

/**
 * Called when the author changes the number of columns
 * @param numColumns the new number of columns
 */
View.prototype.TableNode.truncateColumns = function(numColumns) {
	//get the previous number of columns
	var tableDataNumColumns = this.content.numColumns;
	
	//get the dif in the number of columns
	var dif = tableDataNumColumns - numColumns;
	
	if(dif > 0) {
		//we need to remove some columns
		this.content.tableData.splice(numColumns, dif);		
	}
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 * 
 * TODO: rename TemplateNode
 */
View.prototype.TableNode.getCommonComponents = function() {
	return this.commonComponents;
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 * 
 * TODO: rename TemplateNode
 */
View.prototype.TableNode.updateContent = function() {
	/* update content object */
	this.view.activeContent.setContent(this.content);
};

/**
 * Populate the authoring textareas where the user types the prompts that
 * the student will read
 * 
 * TODO: rename TemplateNode
 */
View.prototype.TableNode.populatePrompts = function() {
	//get the prompts from the content and set it into the authoring textareas
	$('#promptTextArea').val(this.content.prompt);
	$('#prompt2TextArea').val(this.content.prompt2);
};

/**
 * Populate the starter sentence textarea
 */
View.prototype.TableNode.populateStarterSentence = function() {
	//get the prompts from the content and set it into the authoring textareas
	$('#starterSentenceTextArea').val(this.content.starterSentence);
};

/**
 * Updates the content's prompt to match that of what the user input
 * 
 * TODO: rename TemplateNode
 */
View.prototype.TableNode.updatePrompt = function() {
	/* update content */
	this.content.prompt = document.getElementById('promptTextArea').value;
	
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the prompt2 in the content
 */
View.prototype.TableNode.updatePrompt2 = function() {
	//update content
	this.content.prompt2 = $('#prompt2TextArea').val();
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the starter sentence in the content
 */
View.prototype.TableNode.updateStarterSentence = function() {
	//update the content
	this.content.starterSentence = $('#starterSentenceTextArea').val();
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the number of columns since the author has changed the value
 */
View.prototype.TableNode.updateNumColumns = function() {
	//get the new number of columns
	var numColumns = $('#numColumnsInput').val();
	
	if(numColumns == '') {
		/*
		 * do nothing, this is assuming the author is deleting the value to type in a new value after.
		 * this function will be called again when the author types in a value
		 */
	} else {
		if(isNaN(numColumns)) {
			//message the author that the value is not valid
			alert('Error: Invalid Columns value');
			
			//revert the number of rows value in the text input
			$('#numColumnsInput').val(this.content.numColumns);
		} else {
			numColumns = parseInt(numColumns);
			
			if(numColumns < this.content.numColumns) {
				
				var performUpdate = confirm('Are you sure you want to decrease the number of columns? You will lose the data in the columns that will be truncated.');
				
				if(performUpdate) {
					/*
					 * the number of columns is less than the previous number
					 * of columns so we need to remove some columns
					 */
					this.truncateColumns(numColumns);
				} else {
					//do not update
					
					//revert the number of rows value in the text input
					$('#numColumnsInput').val(this.content.numColumns);
					
					return;
				}
			}
			
			//update the number of columns in the content
			this.content.numColumns = numColumns;
			
			//fill in any new cells in the new columns
			this.populateNullCells();
			
			//re-generate the authoring table to reflect the new number of columns
			this.updateAuthoringTable();
			
			//fire source updated event, this will update the preview
			this.view.eventManager.fire('sourceUpdated');			
		}
	}
};

/**
 * Update the number of rows since the author has changed the value
 */
View.prototype.TableNode.updateNumRows = function() {
	//get the new number of rows
	var numRows = $('#numRowsInput').val();
	
	if(numRows == '') {
		/*
		 * do nothing, this is assuming the author is deleting the value to type in a new value after.
		 * this function will be called again when the author types in a value
		 */
	} else {
		if(isNaN(numRows)) {
			//message the author that the value is not valid
			alert('Error: Invalid Rows value');
			
			//revert the number of rows value in the text input
			$('#numRowsInput').val(this.content.numRows);
		} else {
			numRows = parseInt(numRows);
			
			if(numRows < this.content.numRows) {
				
				var performUpdate = confirm('Are you sure you want to decrease the number of rows? You will lose the data in the rows that will be truncated.');
				
				if(performUpdate) {
					/*
					 * the number of rows is less than the previous number
					 * of rows so we need to remove some rows
					 */
					this.truncateRows(numRows);			
				} else {
					//do not update
					
					//revert the number of rows value in the text input
					$('#numRowsInput').val(this.content.numRows);
					
					return;
				}
			}
			
			//update the number of rows in the content
			this.content.numRows = numRows;
			
			//fill in any new cells in the new rows
			this.populateNullCells();
			
			//re-generate the authoring table to reflect the new number of rows
			this.updateAuthoringTable();
			
			//fire source updated event, this will update the preview
			this.view.eventManager.fire('sourceUpdated');			
		}
	}
};

/**
 * Update the global cell size in the content
 */
View.prototype.TableNode.updateGlobalCellSize = function() {
	//get the global cell size the user has input
	var globalCellSize = $('#globalCellSizeInput').val();
	
	if(globalCellSize == '') {
		//the user has input an empty string
		
		//set the global cell size into the content
		this.content.globalCellSize = globalCellSize;
		
		//save the content
		this.view.eventManager.fire('sourceUpdated');
	} else if(!isNaN(globalCellSize)) {
		//the user has input a number
		
		//parse the string into a number
		globalCellSize = parseInt(globalCellSize);
		
		//set the global cell size in the content
		this.content.globalCellSize = globalCellSize;
		
		//save the content
		this.view.eventManager.fire('sourceUpdated');
	} else {
		//the user has input a value that is not a number
		alert('Error: Invalid Global Cell Size value');
		
		//revert the global cell size value in the text input
		$('#globalCellSizeInput').val(this.content.globalCellSize);
	}
};

/**
 * Update the text in the cell
 * @param args an object containing the x and y values of the cell
 * to update
 */
View.prototype.TableNode.updateCellText = function(args) {
	//get the x and y values of the cell to update
	var x = args.x;
	var y = args.y;
	
	//get the text in the cell from the authoring table
	var cellTextValue = $('#cellTextInput_' + x + '-' + y).val();
	
	//get the table data
	var tableData = this.content.tableData;
	
	//update the text value in the cell in the content
	this.updateCellDataValue(tableData, x, y, 'text', cellTextValue);
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the uneditable value of the cell
 * @param args an object containing the x and y values of the cell
 * to update
 */
View.prototype.TableNode.updateCellUneditable = function(args) {
	//get the x and y values of the cell to update
	var x = args.x;
	var y = args.y;
	
	//get the value of the checkbox from the authoring table
	var cellUneditableValue = $('#cellUneditableCheckBox_' + x + '-' + y).attr('checked');
	
	//change the value to a boolean
	if(cellUneditableValue == 'checked') {
		cellUneditableValue = true;
	} else {
		cellUneditableValue = false;
	}
	
	//get the table data
	var tableData = this.content.tableData;
	
	//update the uneditable value in the cell in the content
	this.updateCellDataValue(tableData, x, y, 'uneditable', cellUneditableValue);
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the cell size for a specific cell in the content
 */
View.prototype.TableNode.updateCellSize = function(args) {
	//get the x and y values of the cell to update
	var x = args.x;
	var y = args.y;
	
	//get the value of the checkbox from the authoring table
	var cellSizeValue = $('#cellSizeInput_' + x + '-' + y).val();
	
	//get the table data
	var tableData = this.content.tableData;
	
	if(cellSizeValue == '' || !isNaN(cellSizeValue)) {
		//update the cell size value for the cell in the content
		this.updateCellDataValue(tableData, x, y, 'cellSize', cellSizeValue);
		
		//fire source updated event, this will update the preview
		this.view.eventManager.fire('sourceUpdated');
	} else {
		//message the author that the value is not valid
		alert('Error: Invalid Cell Size value');
		
		var cellSize = null;
		
		if(tableData != null && tableData[x] != null && tableData[x][y] != null) {
			//get the previous cell size
			cellSize = tableData[x][y].cellSize;
		}
		
		if(cellSize == null) {
			cellSize = "";
		}
		
		//revert the cell size in the authoring text input
		$('#cellSizeInput_' + x + '-' + y).val(cellSize);
	}
};

/**
 * Insert a column into the table
 * @param args an object containing the x position to insert
 * the column into
 */
View.prototype.TableNode.tableInsertColumn = function(args) {
	//get the x position to insert the column into
	var x = args.x;
	
	/*
	 * insert null into the table data as a place holder for the
	 * column we have just inserted
	 */
	this.content.tableData.splice(x, 0, null);
	
	//update the number of columns
	this.content.numColumns++;
	
	//update the number of columns in the authoring columns text input
	$('#numColumnsInput').val(this.content.numColumns);
	
	//fill in the cells of the new column we just inserted
	this.populateNullCells();
	
	//re-generate the authoring table
	this.updateAuthoringTable();
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Delete a column from the table
 * @param args an object containing the x position to delete
 */
View.prototype.TableNode.tableDeleteColumn = function(args) {
	//ask the author if they are sure
	var performDelete = confirm('Are you sure you want to delete this column?');
	
	if(performDelete) {
		//get the x position to delete the column from
		var x = args.x;
		
		//remove the column
		this.content.tableData.splice(x, 1);
		
		//update the number of columns
		this.content.numColumns--;
		
		//update the number of columns in the authoring columns text input
		$('#numColumnsInput').val(this.content.numColumns);
		
		//delete the column axis object used for graphing if it exists for this column
		this.deleteColumnAxisObject(x);
		
		//re-generate the authoring table
		this.updateAuthoringTable();
		
		//fire source updated event, this will update the preview
		this.view.eventManager.fire('sourceUpdated');
	}
};

/**
 * Insert a row into the table
 * @param args an object containing the y position to insert
 */
View.prototype.TableNode.tableInsertRow = function(args) {
	//get the y position to insert the row into
	var y = args.y;
	
	//get the table data
	var tableData = this.content.tableData;
	
	//loop through all the columns
	for(var x=0; x<this.content.numColumns; x++) {
		//add a cell at x, y
		tableData[x].splice(y, 0, this.getCellWithDefaultValues());
	}
	
	//update the number of rows
	this.content.numRows++;
	
	//update the number of rows in the authoring rows text input
	$('#numRowsInput').val(this.content.numRows);
	
	//fill in the cells of the new row we just inserted
	this.populateNullCells();
	
	//re-generate the authoring table
	this.updateAuthoringTable();
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Delete a row into the table
 * @param args an object containing the y position to delete
 */
View.prototype.TableNode.tableDeleteRow = function(args) {
	//ask the author if they are sure
	var performDelete = confirm('Are you sure you want to delete this row?');
	
	if(performDelete) {
		//get the y position to delete the row from
		var y = args.y;
		
		//get the table data
		var tableData = this.content.tableData;
		
		//loop through all the columns
		for(var x=0; x<this.content.numColumns; x++) {
			//remove the cell at x, y
			tableData[x].splice(y, 1);
		}
		
		//update the number of rows
		this.content.numRows--;
		
		//update the number of rows in the authoring rows text input
		$('#numRowsInput').val(this.content.numRows);
		
		//re-generate the authoring table
		this.updateAuthoringTable();
		
		//fire source updated event, this will update the preview
		this.view.eventManager.fire('sourceUpdated');		
	}
};

/**
 * Populate any cells with the default cell values if the
 * cell is null
 */
View.prototype.TableNode.populateNullCells = function() {
	//get the table data
	var tableData = this.content.tableData;
	
	//loop through the columns
	for(var x=0; x<this.content.numColumns; x++) {
		
		//try to get the column
		if(tableData[x] == null) {
			//column does not exist so we will make it
			tableData[x] = [];
		}
		
		//loop through all the rows for this column
		for(var y=0; y<this.content.numRows; y++) {
			//try to get the cell
			if(tableData[x][y] == null) {
				//the cell does not exist so we will populate it
				tableData[x][y] = this.getCellWithDefaultValues();				
			}
		}
	}
};

/**
 * Get the default cell object that we will put into the table data
 */
View.prototype.TableNode.getCellWithDefaultValues = function() {
	//create a new cell object
	var newCell = {
			text:"",
			uneditable:false
	};
	
	return newCell;
};

/**
 * Update the hideEverythingBelowTable value
 */
View.prototype.TableNode.updateHideEverythingBelowTable = function() {
	//get whether it is checked or not
	var hideEverythingBelowTableCheckBoxChecked = $('#hideEverythingBelowTableCheckBox').attr('checked');
	
	//change the value into a boolean
	if(hideEverythingBelowTableCheckBoxChecked == 'checked') {
		hideEverythingBelowTableCheckBoxChecked = true;		
	} else {
		hideEverythingBelowTableCheckBoxChecked = false;
	}
	
	//set this value to true or false
	this.content.hideEverythingBelowTable = hideEverythingBelowTableCheckBoxChecked;
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');	
};

/**
 * Populate the graph options from the existing step content if it already exists
 */
View.prototype.TableNode.populateGraphOptions = function() {
	if(this.content.graphOptions != null) {
		
		if(this.content.graphOptions.enableGraphing) {
			//graphing is enabled so we will show the div
			$('#enableGraphingCheckBox').attr('checked', true);
			
			$('#graphingOptionsDiv').show();
		} else {
			//graphing is not enabled so we will hide the div
			$('#graphingOptionsDiv').hide();
		}
		
		if(this.content.graphOptions.graphType != null && this.content.graphOptions.graphType != '') {
			//check the radio button for the graph type
			$('input[name=graphType][value=' + this.content.graphOptions.graphType + ']').attr('checked', true);
			if (this.content.graphOptions.graphType == "scatterPlotbySeries") this.generateSeriesPropertiesInputs();
		}
		
		if(this.content.graphOptions.graphSelectAxesType != null && this.content.graphOptions.graphSelectAxesType != '') {
			//check the radio button for the select axes type
			$('input[name=graphSelectAxesType][value=' + this.content.graphOptions.graphSelectAxesType + ']').attr('checked', true);

			if(this.content.graphOptions.enableGraphing && this.content.graphOptions.graphSelectAxesType == 'authorSelect') {
				/*
				 * show the drop downs in the columns to allow the author to select
				 * which column will be used for which axis
				 */
				$('.selectColumnToAxisMappingDropDown').css('display', 'inline');
				$('.selectColumnToAxisMappingTextLabel').css('display', 'inline');
			}
		}
		
		if(this.content.graphOptions.graphWhoSetAxesLimitsType != null && this.content.graphOptions.graphWhoSetAxesLimitsType != '') {
			//check the radio button for the select axes type
			$('input[name=graphWhoSetAxesLimitsType][value=' + this.content.graphOptions.graphWhoSetAxesLimitsType + ']').attr('checked', true);
			
			if(this.content.graphOptions.graphWhoSetAxesLimitsType == 'authorSelect') {
				//enable the axes limits inputs so the author can edit
				this.enableGraphAxesLimitsInputs();
			} else {
				//disable the axes limits inputs since graphWhoSetAxesLimitsType is set to 'auto' or 'studentSelect'
				this.disableGraphAxesLimitsInputs();
			}
		}
		
		if(this.content.graphOptions.axesLimits != null) {
			if(this.content.graphOptions.axesLimits.xMin != null) {
				//populate the graph x min value
				$('#graphXMinInput').val(this.content.graphOptions.axesLimits.xMin);
			}
			
			if(this.content.graphOptions.axesLimits.xMax != null) {
				//populate the graph x max value
				$('#graphXMaxInput').val(this.content.graphOptions.axesLimits.xMax);
			}
			
			if(this.content.graphOptions.axesLimits.yMin != null) {
				//populate the graph y min value
				$('#graphYMinInput').val(this.content.graphOptions.axesLimits.yMin);
			}
			
			if(this.content.graphOptions.axesLimits.yMax != null) {
				//populate the graph y max value
				$('#graphYMaxInput').val(this.content.graphOptions.axesLimits.yMax);
			}
		}
		
		//populate the drop downs for the column axis
		this.populateColumnToAxisMappings();
	} else {
		//there are no graph options so we will not show the graph options div
		$('#graphingOptionsDiv').hide();
	}
};

/**
 * Populate the column graph axis drop downs
 */
View.prototype.TableNode.populateColumnToAxisMappings = function() {
	if(this.content.graphOptions != null) {
		if(this.content.graphOptions.columnToAxisMappings != null) {
			//populate the column axis drop downs
			
			//loop through all the column graph axis objects
			for(var x=0; x<this.content.graphOptions.columnToAxisMappings.length; x++) {
				//get an object
				var columnAxisObject = this.content.graphOptions.columnToAxisMappings[x];
				
				if(columnAxisObject != null) {
					//get the column index and column axis
					var columnIndex = columnAxisObject.columnIndex;
					var columnAxis = columnAxisObject.columnAxis;
					
					//populate the corresponding drop down with the axis value
					$('#selectColumnToAxisMappingDropDown_' + columnIndex).val(columnAxis);
				}
			}
		}
	}
};

/**
 * The 'Enable Graphing' checkbox was clicked
 */
View.prototype.TableNode.tableEnableGraphingClicked = function() {
	//create the graph options in the step content if it does not exist
	this.createGraphOptionsIfNotExist();
	
	//get whether the checkbox is checked or not
	var checked = $('#enableGraphingCheckBox').attr('checked');
	
	if(checked == 'checked') {
		//checkbox is checked
		this.content.graphOptions.enableGraphing = true;
		
		//populate the graph options values in the authoring
		this.populateGraphOptions();
		
		$('#graphingOptionsDiv').show();
	} else {
		//checkbox is not checked
		this.content.graphOptions.enableGraphing = false;
		$('#graphingOptionsDiv').hide();
		$('.selectColumnToAxisMappingDropDown').hide();
		$('.selectColumnToAxisMappingTextLabel').hide();
	}		
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');	
};

/**
 * The drop down for a column to select its axis has changed
 * @param
 */
View.prototype.TableNode.tableSelectColumnToAxisMappingDropDownChanged = function() {
	/*
	 * clear out the column graph axis values because we will
	 * obtain all the values again
	 */
	this.content.graphOptions.columnToAxisMappings = [];

	//get the number of columns
	var numColumns = this.content.numColumns;
	
	//loop through all the column numbers
	for(var x=0; x<numColumns; x++) {
		//get the value of the axis drop down for this column
		var axis = $('#selectColumnToAxisMappingDropDown_' + x).val();
		
		if(axis != null && axis != '') {
			//create an object to hold the column index and column axis
			var columnAxisObject = {
				columnIndex:x,
				columnAxis:axis
			};
			
			//put this object into the array
			this.content.graphOptions.columnToAxisMappings.push(columnAxisObject);
		}
	}

	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');	
};

/**
 * Delete the column axis object from the array
 * @param columnIndex the column index to delete
 */
View.prototype.TableNode.deleteColumnAxisObject = function(columnIndex) {
	if(this.content.graphOptions != null) {
		/*
		 * get the column graph axis array that contains the mappings
		 * of column index to column axis
		 */ 
		var columnToAxisMappings = this.content.graphOptions.columnToAxisMappings;
		
		if(columnToAxisMappings != null) {
			//loop through all the column graph axis objects
			for(var y=0; y<columnToAxisMappings.length; y++) {
				//get a column axis object
				var columnAxisObject = columnToAxisMappings[y];
				
				if(columnAxisObject != null) {
					//get the column index from the object
					var tempColumnIndex = columnAxisObject.columnIndex;
					
					if(columnIndex == tempColumnIndex) {
						//the column index is the one we want to delete
						
						//remove it from the array
						columnToAxisMappings.splice(y, 1);
						
						/*
						 * move our index counter back one since we just 
						 * removed an element from the array
						 */
						y--;
					} else if(columnIndex < tempColumnIndex) {
						/*
						 * we need to shift the index of all indexes that are
						 * greater than the index we are deleting
						 */
						columnAxisObject.columnIndex = tempColumnIndex - 1;
					}
				}
			}		
		}
	}
};

/**
 * A radio button to select the graph type was clicked
 */
View.prototype.TableNode.tableGraphTypeClicked = function() {
	//get the radio button value that is checked
	var graphType = $('input[name=graphType]:checked').val();
	
	//update the step content
	this.content.graphOptions.graphType = graphType;

	if (graphType == "scatterPlotbySeries"){
		// when a scatter plot by series is selected additional options are available
		this.generateSeriesPropertiesInputs();
	}

	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * The radio button to select who will select the axes,
 * author or student.
 */
View.prototype.TableNode.tableGraphSelectAxesTypeClicked = function() {
	//get the radio button that is checked
	var graphSelectAxesType = $('input[name=graphSelectAxesType]:checked').val();
	
	if(graphSelectAxesType == 'authorSelect') {
		/*
		 * show the drop downs on each of the columns to let the author
		 * select the axis for columns
		 */
		$('.selectColumnToAxisMappingDropDown').css('display', 'inline');
		$('.selectColumnToAxisMappingTextLabel').css('display', 'inline');
	} else {
		//hide the drop downs on each of the columns
		$('.selectColumnToAxisMappingDropDown').hide();
		$('.selectColumnToAxisMappingTextLabel').hide();
	}
	
	//update the value in the content
	this.content.graphOptions.graphSelectAxesType = graphSelectAxesType;
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');	
};

/**
 * One of the radio buttons to select who will set the axes limits
 * was clicked.
 */
View.prototype.TableNode.tableGraphWhoSetAxesLimitsTypeClicked = function() {
	//get the radio button that is checked
	var graphWhoSetAxesLimitsType = $('input[name=graphWhoSetAxesLimitsType]:checked').val();
	
	if(graphWhoSetAxesLimitsType == 'auto') {
		//the Auto radio button was clicked
		
		if(!this.isAxesLimitsEmpty()) {
			/*
			 * the axes limits are not empty so we will ask the 
			 * author if they are sure they want to set it to
			 * auto because we will clear out all the axes limits
			 */
			var result = confirm('This will clear the X Min, X Max, Y Min, and Y Max values. Are you sure you want to do this?');
			
			if(result) {
				//they answered ok so we will clear the axes limit values
				this.clearGraphAxesLimits();
				
				//disable the axes limits input elements
				this.disableGraphAxesLimitsInputs();
			} else {
				/*
				 * they answered cancel so we will revert the radio button
				 * to the last item that was checked
				 */
				graphWhoSetAxesLimitsType = this.content.graphOptions.graphWhoSetAxesLimitsType;
				$('input[name=graphWhoSetAxesLimitsType][value=' + graphWhoSetAxesLimitsType + ']').attr('checked', true);
			}
		} else {
			//disable the axes limits input elements
			this.disableGraphAxesLimitsInputs();
		}
	} else if(graphWhoSetAxesLimitsType == 'authorSelect') {
		//the Author Select radio button was clicked
		
		//enable the axes limits input elements
		this.enableGraphAxesLimitsInputs();
	} else if(graphWhoSetAxesLimitsType == 'studentSelect') {
		//the Student Select radio button was clicked
		
		if(!this.isAxesLimitsEmpty()) {
			/*
			 * the axes limits are not empty so we will ask the 
			 * author if they are sure they want to set it to
			 * auto because we will clear out all the axes limits
			 */
			var result = confirm('This will clear the X Min, X Max, Y Min, and Y Max values. Are you sure you want to do this?');
			
			if(result) {
				//they answered ok so we will clear the axes limit values
				this.clearGraphAxesLimits();
				
				//disable the axes limits input elements
				this.disableGraphAxesLimitsInputs();
			} else {
				/*
				 * they answered cancel so we will revert the radio button
				 * to the last item that was checked
				 */
				graphWhoSetAxesLimitsType = this.content.graphOptions.graphWhoSetAxesLimitsType;
				$('input[name=graphWhoSetAxesLimitsType][value=' + graphWhoSetAxesLimitsType + ']').attr('checked', true);
			}
		} else {
			//disable the axes limits input elements
			this.disableGraphAxesLimitsInputs();
		}
	}
	
	//update the value in the content
	this.content.graphOptions.graphWhoSetAxesLimitsType = graphWhoSetAxesLimitsType;
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Check if the axes limits inputs are empty
 * @return true if all the axes limits inputs are empty
 */
View.prototype.TableNode.isAxesLimitsEmpty = function() {
	var result = true;

	//check all the inputs to see they are empty
	if($('#graphXMinInput').val() != '' || $('#graphXMaxInput').val() != '' || 
			$('#graphYMinInput').val() != '' || $('#graphYMaxInput').val() != '') {
		//at least one of the inputs is not empty
		result = false;
	}
	
	return result;
};

/**
 * Create the graph options in the step content if it does not exist
 */
View.prototype.TableNode.createGraphOptionsIfNotExist = function() {
	if(this.content.graphOptions == null) {
		//graph options does not exist so we will create it
		this.content.graphOptions = {};
	}
	
	if(this.content.graphOptions.enableGraphing == null) {
		//set the default enableGraphing value
		this.content.graphOptions.enableGraphing = false;
	}
	
	if(this.content.graphOptions.graphType == null) {
		//set the default graphType value
		this.content.graphOptions.graphType = 'scatterPlot';
	}
	
	if(this.content.graphOptions.graphSelectAxesType == null) {
		//set the default graphSelectAxesType value
		this.content.graphOptions.graphSelectAxesType = 'authorSelect';
	}
	
	if(this.content.graphOptions.columnToAxisMappings == null) {
		//set the default columnToAxisMappings value
		this.content.graphOptions.columnToAxisMappings = [];
	}

	if(this.content.graphOptions.graphWhoSetAxesLimitsType == null) {
		//set the default graphWhoSetAxesLimitsType
		this.content.graphOptions.graphWhoSetAxesLimitsType = 'auto';
	}
	
	if(this.content.graphOptions.axesLimits == null) {
		//set the default axesLimits value
		this.content.graphOptions.axesLimits = {};
	}
};

/**
 * Clear the axes limits inputs
 */
View.prototype.TableNode.clearGraphAxesLimits = function() {
	//clear the axes limits inputs
	$('#graphXMinInput').val('');
	$('#graphXMaxInput').val('');
	$('#graphYMinInput').val('');
	$('#graphYMaxInput').val('');
	
	if(this.content.graphOptions != null && this.content.graphOptions.axesLimits != null) {
		//clear the axes limits in the content
		this.content.graphOptions.axesLimits.xMin = '';
		this.content.graphOptions.axesLimits.xMax = '';
		this.content.graphOptions.axesLimits.yMin = '';
		this.content.graphOptions.axesLimits.yMax = '';
	}
};

/**
 * Disable the axes limits inputs
 */
View.prototype.TableNode.disableGraphAxesLimitsInputs = function() {
	$('#graphXMinInput').attr('disabled', true);
	$('#graphXMaxInput').attr('disabled', true);
	$('#graphYMinInput').attr('disabled', true);
	$('#graphYMaxInput').attr('disabled', true);
};

/**
 * Enable the axes limits inputs
 */
View.prototype.TableNode.enableGraphAxesLimitsInputs = function() {
	$('#graphXMinInput').removeAttr('disabled');
	$('#graphXMaxInput').removeAttr('disabled');
	$('#graphYMinInput').removeAttr('disabled');
	$('#graphYMaxInput').removeAttr('disabled');
};

/**
 * Update the x min value since it has changed
 */
View.prototype.TableNode.tableUpdateGraphXMin = function() {
	this.createGraphOptionsIfNotExist();
	
	//get the x min the author has entered
	var xMin = $('#graphXMinInput').val();
	
	//update the content
	this.content.graphOptions.axesLimits.xMin = xMin;
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the x max value since it has changed
 */
View.prototype.TableNode.tableUpdateGraphXMax = function() {
	this.createGraphOptionsIfNotExist();
	
	//get the x max the author has entered
	var xMax = $('#graphXMaxInput').val();
	
	//update the content
	this.content.graphOptions.axesLimits.xMax = xMax;
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the y min value since it has changed
 */
View.prototype.TableNode.tableUpdateGraphYMin = function() {
	this.createGraphOptionsIfNotExist();
	
	//get the y min the author has entered
	var yMin = $('#graphYMinInput').val();
	
	//update the content
	this.content.graphOptions.axesLimits.yMin = yMin;
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the y max value since it has changed
 */
View.prototype.TableNode.tableUpdateGraphYMax = function() {
	this.createGraphOptionsIfNotExist();
	
	//get the y max the author has entered
	var yMax = $('#graphYMaxInput').val();
	
	//update the content
	this.content.graphOptions.axesLimits.yMax = yMax;
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * The enable drop down title checkbox was clicked 
 */
View.prototype.TableNode.tableUpdateEnableDropDownTitleCheckBoxClicked = function() {
	//create the drop down title in the step content if it does not already exist
	this.populateDropDownTitleOptionsIfNotExist();
	
	//get the checked value
	var checked = $('#enableDropDownTitleCheckBox').attr('checked');
	
	if(checked == 'checked') {
		//checkbox is checked
		
		//update the content
		this.content.dropDownTitleOptions.enableDropDownTitle = true;
		
		//populate the drop down title options if there are any
		this.populateTitleDropDownContent();
		
		//show the div that will display the drop down title options
		$('#titleDropDownDiv').show();
	} else {
		//checkbox is not checked
		
		//update the content
		this.content.dropDownTitleOptions.enableDropDownTitle = false;
		
		//hide the div that will display the drop down title options
		$('#titleDropDownDiv').hide();
	}
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * The add drop down title button was clicked
 */
View.prototype.TableNode.tableUpdateAddDropDownTitleButtonClicked = function() {
	//create the drop down title in the step content if it does not already exist
	this.populateDropDownTitleOptionsIfNotExist();
	
	//get the existing drop down titles
	var dropDownTitles = this.content.dropDownTitleOptions.dropDownTitles;
	
	var dropDownTitle = '';
	
	//add a new blank title
	dropDownTitles.push(dropDownTitle);
	
	//get the x index of the new title
	var x = dropDownTitles.length - 1;
	
	//create an input and delete button for the new title
	var dropDownTitleInput = createElement(document, 'input', {type: 'text', id: 'dropDownTitle_' + x, name: 'dropDownTitle_' + x, value: dropDownTitle, size: 30, onkeyup: 'eventManager.fire("tableUpdateDropDownTitle", ' + x + ')'});
	var deleteDropDownTitle = createElement(document, 'input', {type: 'button', id: 'deleteDropDownTitle_' + x, name: 'deleteDropDownTitle_' + x, value: 'Delete', onclick: 'eventManager.fire("tableDeleteDropDownTitle", ' + x + ')'});
	
	//add the input and delete button
	$('#titleDropDownListDiv').append(dropDownTitleInput);
	$('#titleDropDownListDiv').append(deleteDropDownTitle);
	$('#titleDropDownListDiv').append('<br>');
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Populate the drop down title options from the step content if this
 * was previously authored
 */
View.prototype.TableNode.populateTitleDropDownContent = function() {
	//create the drop down title in the step content if it does not already exist
	this.populateDropDownTitleOptionsIfNotExist();
	
	//get whether drop down title is enabled
	var enableDropDownTitle = this.content.dropDownTitleOptions.enableDropDownTitle;
	
	if(enableDropDownTitle) {
		//check the checkbox
		$('#enableDropDownTitleCheckBox').attr('checked', true);
		
		//clear the list div so we can re-populate it
		$('#titleDropDownListDiv').html('');
		
		//get the drop down titles from the content
		var dropDownTitles = this.content.dropDownTitleOptions.dropDownTitles;
		
		//loop through all the drop down titles
		for(var x=0; x<dropDownTitles.length; x++) {
			//get a drop down title
			var dropDownTitle = dropDownTitles[x];
			
			//create the text input for the title
			var dropDownTitleInput = createElement(document, 'input', {type: 'text', id: 'dropDownTitle_' + x, name: 'dropDownTitle_' + x, value: dropDownTitle, size: 30, onkeyup: 'eventManager.fire("tableUpdateDropDownTitle", ' + x + ')'});
			
			//create the delete button for the title
			var deleteDropDownTitle = createElement(document, 'input', {type: 'button', id: 'deleteDropDownTitle_' + x, name: 'deleteDropDownTitle_' + x, value: 'Delete', onclick: 'eventManager.fire("tableDeleteDropDownTitle", ' + x + ')'});
			
			//add the text input and delete button
			$('#titleDropDownListDiv').append(dropDownTitleInput);
			$('#titleDropDownListDiv').append(deleteDropDownTitle);
			$('#titleDropDownListDiv').append('<br>');
		}
		
		//show the drop down div
		$('#titleDropDownDiv').show();
	} else {
		//uncheck the checkbox
		$('#enableDropDownTitleCheckBox').attr('checked', false);
		
		//hide the drop down div
		$('#titleDropDownDiv').hide();
	}
	
};

/**
 * One of the drop down titles has changed so we will update it
 * in the content
 * @param index the index of the title
 */
View.prototype.TableNode.tableUpdateDropDownTitle = function(index) {
	//create the drop down title in the step content if it does not already exist
	this.populateDropDownTitleOptionsIfNotExist();
	
	//get the text of the title
	var dropDownTitle = $('#dropDownTitle_' + index).val();
	
	//get all the drop down titles
	var dropDownTitles = this.content.dropDownTitleOptions.dropDownTitles;
	
	if(dropDownTitles[index] != null) {
		//update the title at the given index
		dropDownTitles[index] = dropDownTitle;
	}
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Delete the drop down title at the given index
 * @param index the index of the title to delete
 */
View.prototype.TableNode.tableDeleteDropDownTitle = function(index) {
	//create the drop down title in the step content if it does not already exist
	this.populateDropDownTitleOptionsIfNotExist();
	
	//get all the drop down titles
	var dropDownTitles = this.content.dropDownTitleOptions.dropDownTitles;
	
	//remove the drop down title at the given index
	dropDownTitles.splice(index, 1);
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
	
	//refresh the content displayed in the authoring UI
	this.populateTitleDropDownContent();
};

/**
 * Create the drop down title options in the step content if it does
 * not already exist
 */
View.prototype.TableNode.populateDropDownTitleOptionsIfNotExist = function() {
	
	if(this.content.dropDownTitleOptions == null) {
		/*
		 * the drop down title options does not already exist so
		 * we will create it
		 */
		this.content.dropDownTitleOptions = {
			enableDropDownTitle:false,
			dropDownTitles:[]
		};
	}
};

View.prototype.TableNode.tableUpdateAllowStudentToAddRowsCheckBoxClicked = function() {
	this.populateStudentOptionsIfNotExist();
	
	//get the checked value
	var checked = $('#allowStudentToAddRowsCheckBox').attr('checked');
	
	if(checked == 'checked') {
		//checkbox is checked
		this.content.studentOptions.allowStudentToAddRows = true;
	} else {
		//checkbox is not checked
		this.content.studentOptions.allowStudentToAddRows = false;
	}
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

View.prototype.TableNode.tableUpdateAllowStudentToAddColumnsCheckBoxClicked = function() {
	this.populateStudentOptionsIfNotExist();
	
	//get the checked value
	var checked = $('#allowStudentToAddColumnsCheckBox').attr('checked');
	
	if(checked == 'checked') {
		//checkbox is checked
		this.content.studentOptions.allowStudentToAddColumns = true;
	} else {
		//checkbox is not checked
		this.content.studentOptions.allowStudentToAddColumns = false;
	}
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

View.prototype.TableNode.populateStudentOptionsIfNotExist = function() {
	
	if(this.content.studentOptions == null) {
		/*
		 * the student options does not already exist so
		 * we will create it
		 */
		this.content.studentOptions = {
			allowStudentToAddColumns:false,
			allowStudentToAddRows:false
		};
	}
};

View.prototype.TableNode.populateStudentOptions = function() {
	
	if(this.content.studentOptions != null) {
		
		if(this.content.studentOptions.allowStudentToAddRows) {
			$('#allowStudentToAddRowsCheckBox').attr('checked', true);
		} else {
			$('#allowStudentToAddRowsCheckBox').attr('checked', false);
		}

		if(this.content.studentOptions.allowStudentToAddColumns) {
			$('#allowStudentToAddColumnsCheckBox').attr('checked', true);
		} else {
			$('#allowStudentToAddColumnsCheckBox').attr('checked', false);
		}
	}
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename template to your new folder name
	 * TODO: rename authorview_template
	 * 
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/authorview_quiz.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/table/authorview_table.js');
};