/**
 * Sets the SVGDrawNode type as an object of this view
 * @constructor
 * @author patrick lawler
 */
View.prototype.SVGDrawNode = {};
View.prototype.SVGDrawNode.commonComponents = ['Prompt', 'LinkTo'];

/**
 * Generates the authoring page for svg draw node types
 */
View.prototype.SVGDrawNode.generatePage = function(view){
	this.view = view;
	this.content = this.view.activeContent.getContentJSON();
	
	this.maxSnaps = 10; // default max allowed snapshots
	
	var parent = document.getElementById('dynamicParent');
	
	/* wipe out old */
	parent.removeChild(document.getElementById('dynamicPage'));
	
	/* create new */
	var pageDiv = createElement(document, 'div', {id:'dynamicPage', style:'width:100%;height:100%'});
	var optDiv = createElement(document, 'div', {id: 'optionsDiv'});
	var toolbarOptionsDiv = createElement(document, 'div', {id: 'toolbarOptionsDiv'});
	var snapshotOptionDiv = createElement(document, 'div', {id: 'snapshotOptionDiv'});
	var snapMaxDiv = createElement(document, 'div', {id: 'snapMaxDiv'});
	var descriptionOptionDiv = createElement(document, 'div', {id: 'descriptionOptionDiv'});
	var backgroundLabel = document.createTextNode('Specify a background for the drawing canvas: ');
	var backgroundDiv = createElement(document, 'div', {id: 'backgroundDiv'});
	$(backgroundDiv).addClass('promptContainer');
	var stampsDiv = createElement(document, 'div', {id:'stampsDiv'});
	var autoScoringOptionsDiv = createElement(document, 'div', {id:'autoScoringOptionsDiv'});
	var autoScoringFeedbackAuthoringDiv = createElement(document, 'div', {id:'autoScoringFeedbackAuthoringDiv'});
	
	parent.appendChild(pageDiv);
	pageDiv.appendChild(toolbarOptionsDiv);
	pageDiv.appendChild(snapshotOptionDiv);
	pageDiv.appendChild(snapMaxDiv);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(descriptionOptionDiv);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(document.createTextNode('Enter instructions for students (optional):'));
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createElement(document, 'div', {id: 'promptContainer'}));
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(backgroundLabel);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(backgroundDiv);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(stampsDiv);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(autoScoringOptionsDiv);
	pageDiv.appendChild(autoScoringFeedbackAuthoringDiv);
	pageDiv.appendChild(createBreak());
	
	this.generateToolbarOptions();
	this.generateSnapshotOption();
	this.generateDescriptionOption();
	this.generateBackground();
	this.generateStamps();
	this.generateAutoScoringOptions();
	this.generateAutoScoringFeedbackAuthoringDiv();
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 */
View.prototype.SVGDrawNode.getCommonComponents = function() {
	return this.commonComponents;
};

/**
 * Generates the toolbar options for this svg draw
 */
View.prototype.SVGDrawNode.generateToolbarOptions = function(){
	var parent = document.getElementById('toolbarOptionsDiv');
	
	var toolbarHtml = 'Select which drawing tools to enable:<br />';
	toolbarHtml += '<form>';
	toolbarHtml += '<input type="checkbox" name="toolbarCbx" id="pencilCbx" checked="checked" onclick="eventManager.fire(\'svgdrawToolbarOptionsChanged\')"/> <img alt="pencil" src="node/draw/svg-edit/images/fhpath.png" /> Pencil (freehand)*<br />';
	toolbarHtml += '<input type="checkbox" name="toolbarCbx" id="lineCbx" checked="checked" onclick="eventManager.fire(\'svgdrawToolbarOptionsChanged\')"/> <img alt="line" src="node/draw/svg-edit/images/line.png" /> Line<br />';
	toolbarHtml += '<input type="checkbox" name="toolbarCbx" id="connectorCbx" checked="checked" onclick="eventManager.fire(\'svgdrawToolbarOptionsChanged\')"/> <object data="node/draw/svg-edit/images/conn.svg" type="image/svg+xml" style="width:24px; height:24px;"></object> Connector<br />';
	toolbarHtml += '<input type="checkbox" name="toolbarCbx" id="rectangleCbx" checked="checked" onclick="eventManager.fire(\'svgdrawToolbarOptionsChanged\')"/> <img alt="rectangle" src="node/draw/svg-edit/images/rect.png" /> Rectangle/Square<br />';
	toolbarHtml += '<input type="checkbox" name="toolbarCbx" id="ellipseCbx" checked="checked" onclick="eventManager.fire(\'svgdrawToolbarOptionsChanged\')"/> <img alt="ellipse" src="node/draw/svg-edit/images/ellipse.png" /> Ellipse/Circle<br />';
	toolbarHtml += '<input type="checkbox" name="toolbarCbx" id="polygonCbx" checked="checked" onclick="eventManager.fire(\'svgdrawToolbarOptionsChanged\')"/> <img alt="polygon" src="node/draw/svg-edit/images/path.png" /> Polygon<br />';
	toolbarHtml += '<input type="checkbox" name="toolbarCbx" id="textCbx" checked="checked" onclick="eventManager.fire(\'svgdrawToolbarOptionsChanged\')"/> <img alt="text" src="node/draw/svg-edit/images/text.png" /> Text<br />';
	toolbarHtml += '<input type="checkbox" name="toolbarCbx" id="importStudentAssetCbx" checked="checked" onclick="eventManager.fire(\'svgdrawToolbarOptionsChanged\')"/> <img src="node/draw/svg-edit/images/folder.png" /> Import Uploaded Files<br />';
	toolbarHtml += '</form>';
	
	parent.innerHTML = toolbarHtml;
	
	if(this.content.toolbar_options){
		if (this.content.toolbar_options.pencil){
			document.getElementById('pencilCbx').checked = true;
		} else {
			document.getElementById('pencilCbx').checked = false;
		}
		if (this.content.toolbar_options.line){
			document.getElementById('lineCbx').checked = true;
		} else {
			document.getElementById('lineCbx').checked = false;
		}
		if (this.content.toolbar_options.connector){
			document.getElementById('connectorCbx').checked = true;
		} else {
			document.getElementById('connectorCbx').checked = false;
		}
		if (this.content.toolbar_options.rectangle){
			document.getElementById('rectangleCbx').checked = true;
		} else {
			document.getElementById('rectangleCbx').checked = false;
		}
		if (this.content.toolbar_options.ellipse){
			document.getElementById('ellipseCbx').checked = true;
		} else {
			document.getElementById('ellipseCbx').checked = false;
		}
		if (this.content.toolbar_options.polygon){
			document.getElementById('polygonCbx').checked = true;
		} else {
			document.getElementById('polygonCbx').checked = false;
		}
		if (this.content.toolbar_options.text){
			document.getElementById('textCbx').checked = true;
		} else {
			document.getElementById('textCbx').checked = false;
		}
		if (this.content.toolbar_options.importStudentAsset){
			document.getElementById('importStudentAssetCbx').checked = true;
		} else {
			document.getElementById('importStudentAssetCbx').checked = false;
		}

	}
	this.generateSnapshotMaxOption();
};

/**
 * Generates the snapshot option for this svg draw
 */
View.prototype.SVGDrawNode.generateSnapshotOption = function(){
	var parent = document.getElementById('snapshotOptionDiv');
	
	var snapshotHtml = 'Enable Flipbook Animator (frames)?<br/>';
	if(this.content.snapshots_active){
		snapshotHtml += '<input type="radio" name="snapshotRadio" id="sRadioTrue" value="true" CHECKED onclick="eventManager.fire(\'svgdrawSnapshotOptionChanged\')"/> Yes<br/>';
		snapshotHtml += '<input type="radio" name="snapshotRadio" id="sRadioFalse" value="false" onclick="eventManager.fire(\'svgdrawSnapshotOptionChanged\')"/> No<br/>';
	} else {
		snapshotHtml += '<input type="radio" name="snapshotRadio" id="sRadioTrue" value="true" onclick="eventManager.fire(\'svgdrawSnapshotOptionChanged\')"/> Yes<br/>';
		snapshotHtml += '<input type="radio" name="snapshotRadio" id="sRadioFalse" value="false" CHECKED onclick="eventManager.fire(\'svgdrawSnapshotOptionChanged\')"/> No<br/>';
	};
	
	parent.innerHTML = snapshotHtml;
};

/**
 * Generates the snapshot number option for this svg draw
 */
View.prototype.SVGDrawNode.generateSnapshotMaxOption = function(){
	var parent = document.getElementById('snapMaxDiv');
	
	var snapshotMaxHtml = 'What is the maximum number of frames (snapshots) students can create?<br/>';
	snapshotMaxHtml += '<select id="snapMaxInput" disabled="disabled" onchange="eventManager.fire(\'svgdrawSnapshotMaxOptionChanged\')">';
	for(var i=2;i<21;i++){
		if(i<11){
			snapshotMaxHtml += '<option value="'+i+'">'+i+'</option>';
		} else {
			snapshotMaxHtml += '<option class="noPencil" value="'+i+'">'+i+'</option>';
		}
	}
	snapshotMaxHtml += '</select>';
	
	parent.innerHTML = snapshotMaxHtml;
	
	if(this.content.snapshots_max > 0){
		$("#snapMaxInput").val(this.content.snapshots_max);
	} else {
		this.content.snapshots_max = this.maxSnaps; // set default max snapshots
		$("#snapMaxInput").val(this.maxSnaps.toString());
	}
	
	if ($('#pencilCbx').prop('checked')){
		if(this.content.snapshots_max > 10){
			$("#snapMaxInput").val('10');
			this.content.snapshots_max = '10';
		}
		$('#snapMaxInput option.noPencil').prop('disabled',true);
	}
	
	if(this.content.snapshots_active){
		$('#snapMaxInput').prop('disabled',false);
	}
	
	//this.toolbarOptionsChanged();
};

/**
 * Generates the description option for this svg draw
 */
View.prototype.SVGDrawNode.generateDescriptionOption = function(){
	var parent = document.getElementById('descriptionOptionDiv');
	
	/* wipe out old */
	parent.innerHTML = '';
	
	/* create new */
	var	descriptionHtml = 'Allow students to write descriptions of their drawings?<br/>';
	descriptionHtml += '<input type="radio" name="descriptionRadio" id="dRadioTrue" value="true" onclick="eventManager.fire(\'svgdrawDescriptionOptionChanged\')"/> Yes<br/>';
	descriptionHtml += '<input type="radio" name="descriptionRadio" id="dRadioFalse" value="false" CHECKED onclick="eventManager.fire(\'svgdrawDescriptionOptionChanged\')"/> No<br/>';
	descriptionHtml += 'Default description (optional): <input type="text" size="45" id="defaultDescriptionInput" disabled="disabled" onkeyup="eventManager.fire(\'svgdrawDefaultDescriptionChanged\')" onclick="eventManager.fire(\'svgdrawDescriptionClicked\')"/>';
	
	parent.innerHTML = descriptionHtml;
	
	/* set values based on current content */
	if(this.content.description_active){
		document.getElementById('dRadioTrue').checked = true;
		document.getElementById('defaultDescriptionInput').disabled = false;
	} else {
		document.getElementById('dRadioFalse').checked = true;
		document.getElementById('defaultDescriptionInput').disabled = true;
	};
	
	document.getElementById('defaultDescriptionInput').value = this.content.description_default;
};

/**
 * Generates the background prompt for this svg draw node
 */
View.prototype.SVGDrawNode.generateBackground = function(){
	var parent = document.getElementById('backgroundDiv');
	
	/* wipe out old */
	while(parent.firstChild){
		parent.removeChild(parent.firstChild);
	};
	
	/* create new */
	var introText = document.createTextNode('To create a background, you can either input an svg-edit xml string or choose an image file to use.  (If no background is desired, leave both fields blank.)');
	var text = document.createTextNode('Svg xml string: ');
	var backgroundPathInput = createElement(document, 'input', {type:'text', size:'30', id:'backgroundPathInput', onchange:'eventManager.fire("svgdrawBackgroundChanged")'});
	
	if(this.content.svg_background){
		backgroundPathInput.value = this.content.svg_background;
	} else {
		this.content.svg_background = "";
	};
	
	var imgBg = '';
	if("img_background" in this.content){
		imgBg = this.content.img_background;
	}
	
	//the label for the background url input
	var backgroundImageUrlLabel = $(document.createTextNode("Image file (this will override any svg xml string specified above): "));
	var maxImageSizeLabel = $(document.createTextNode(" - drawing dimensions are 600x450 pixels"));
	//the text input for the background image url input
	var backgroundImageUrl = $(createElement(document, 'input', {type: 'text', id: 'backgroundImageUrl', name: 'backgroundImageUrl', value: imgBg, size:50, onchange: 'eventManager.fire("svgdrawUpdateBackgroundImageUrl")'}));
	//create the browse button that allows author to choose swf from project assets
	var backgroundBrowseButton = $(createElement(document, 'button', {id: 'backgroundBrowseButton', onclick:'eventManager.fire("svgdrawBrowseClicked")'})).text('Browse');
	
	//the label for the background align drop-down select
	var backgroundAlignLabel = $(document.createTextNode("Background Image Alignment: "));
	//create the background align drop-down select
	var backgroundAlignSelect = $(createElement(document, 'select', {id: 'backgroundAlignSelect', onchange:'eventManager.fire("svgdrawUpdateBgAlign")'}));
	//create the options for background align drop-down select
	var leftTopOption = $(createElement(document, 'option', {value: 'left-top'})).append($(document.createTextNode('Left-Top')));
	var leftMiddleOption = $(createElement(document, 'option', {value: 'left-middle'})).append($(document.createTextNode('Left-Middle')));
	var leftBottomOption = $(createElement(document, 'option', {value: 'left-bottom'})).append($(document.createTextNode('Left-Bottom')));
	var centerTopOption = $(createElement(document, 'option', {value: 'center-top'})).append($(document.createTextNode('Center-Top')));
	var centerMiddleOption = $(createElement(document, 'option', {value: 'center-middle'})).append($(document.createTextNode('Center-Middle')));
	var centerBottomOption = $(createElement(document, 'option', {value: 'center-bottom'})).append($(document.createTextNode('Center-Bottom')));
	var rightTopOption = $(createElement(document, 'option', {value: 'right-top'})).append($(document.createTextNode('Right-Top')));
	var rightMiddleOption = $(createElement(document, 'option', {value: 'right-middle'})).append($(document.createTextNode('Right-Middle')));
	var rightBottomOption = $(createElement(document, 'option', {value: 'right-bottom'})).append($(document.createTextNode('Right-Bottom')));
	
	$(backgroundAlignSelect).append(leftTopOption).append(leftMiddleOption).append(leftBottomOption).append(centerTopOption).append(centerMiddleOption).append(centerBottomOption).append(rightTopOption).append(rightMiddleOption).append(rightBottomOption);
	
	parent.appendChild(introText);
	parent.appendChild(createBreak());
	parent.appendChild(createBreak());
	parent.appendChild(text);
	parent.appendChild(backgroundPathInput);
	parent.appendChild(createBreak());
	parent.appendChild(createBreak());
	$(parent).append(backgroundImageUrlLabel);
	parent.appendChild(createBreak());
	$(parent).append(maxImageSizeLabel);
	parent.appendChild(createBreak());
	$(parent).append(backgroundImageUrl).append(backgroundBrowseButton);
	parent.appendChild(createBreak());
	$(parent).append(backgroundAlignLabel);
	parent.appendChild(createBreak());
	$(parent).append(backgroundAlignSelect);
	
	//populate the background align select
	if("bg_position" in this.content) {
		$('#backgroundAlignSelect').val(this.content.bg_position);
	}
};

/**
 * Generates the stamps element for this svg draw node
 */
View.prototype.SVGDrawNode.generateStamps = function(){
	var parent = document.getElementById('stampsDiv');
	
	/* wipe out old */
	while(parent.firstChild){
		parent.removeChild(parent.firstChild);
	};
	
	/* create new */
	var addStampButt = createElement(document, 'input', {type:'button', id:'addStampButton', value:'Add New Stamp', onclick:'eventManager.fire("svgdrawAddNewStamp")'});
	parent.appendChild(addStampButt);
	parent.appendChild(createBreak());
	
	/* generate stamp elements for each stamp that is specified in the content */
	for(var o=0;o<this.content.stamps.length;o++){
		var sText = document.createTextNode('# ' + (o + 1) + ' ');
		var sLabelText = document.createTextNode('Title: ');
		var sValueText = document.createTextNode('URI: ');
		var sWidthText = document.createTextNode('Width: ');
		var sHeightText = document.createTextNode('Height: ');
		var sLabelInput = createElement(document, 'input', {type:'text', size:'10', id:'stampLabelInput_' + o, value:this.content.stamps[o].title, onchange:'eventManager.fire("svgdrawStampLabelChanged","' + o + '")', onclick:'eventManager.fire("svgdrawStampTitleClicked","' + o + '")'});
		var sInput = createElement(document, 'input', {type:'text', size:'15', id:'stampInput_' + o, value:this.content.stamps[o].uri, onchange:'eventManager.fire("svgdrawStampValueChanged","' + o + '")'});
		var sWidthInput = createElement(document, 'input', {type:'text', size:'5', id:'stampWidthInput_' + o, value:this.content.stamps[o].width, onchange:'eventManager.fire("svgdrawStampWidthChanged","' + o + '")', onclick:'eventManager.fire("svgdrawStampWidthClicked","' + o + '")'});
		var sHeightInput = createElement(document, 'input', {type:'text', size:'5', id:'stampHeightInput_' + o, value:this.content.stamps[o].height, onchange:'eventManager.fire("svgdrawStampHeightChanged","' + o + '")', onclick:'eventManager.fire("svgdrawStampHeightClicked","' + o + '")'});
		var removeButt = createElement(document, 'input', {type:'button', id:'removeButt_' + o, value:'remove stamp', onclick:'eventManager.fire("svgdrawRemoveStamp","' + o + '")'});
		parent.appendChild(sText);
		parent.appendChild(sLabelText);
		parent.appendChild(sLabelInput);
		parent.appendChild(createSpace());
		parent.appendChild(sValueText);
		parent.appendChild(sInput);
		parent.appendChild(createSpace());
		parent.appendChild(sWidthText);
		parent.appendChild(sWidthInput);
		parent.appendChild(createSpace());
		parent.appendChild(sHeightText);
		parent.appendChild(sHeightInput);
		parent.appendChild(createSpace());
		parent.appendChild(removeButt);
		parent.appendChild(createBreak());
	};
};

/**
 * Generate the drop down to select the auto scoring criteria
 */
View.prototype.SVGDrawNode.generateAutoScoringOptions = function() {
	//get the div that we will put everything in
	var generateAutoScoringOptions = document.getElementById('autoScoringOptionsDiv');
	
	//make the text and drop down box
	var selectAutoScoringCriteriaText = document.createTextNode('Auto Scoring: ');
	var selectAutoScoringCriteriaDropDown = createElement(document, 'select', {id: 'selectAutoScoringCriteriaDropDown', name: 'selectAutoScoringCriteriaDropDown', onchange: 'eventManager.fire("svgdrawUpdateAutoScoringCriteria")'});
	
	//add the none option
	var noneOption = createElement(document, 'option', {value:'none'});
	noneOption.text = 'None';
	selectAutoScoringCriteriaDropDown.appendChild(noneOption);
	
	//add the methan option
	var methaneOption = createElement(document, 'option', {value:'methane'});
	methaneOption.text = 'Methane';
	selectAutoScoringCriteriaDropDown.appendChild(methaneOption);
	
	//add the ethane option
	var ethaneOption = createElement(document, 'option', {value:'ethane'});
	ethaneOption.text = 'Ethane';
	selectAutoScoringCriteriaDropDown.appendChild(ethaneOption);
	
	//add the text and drop down box to the div
	generateAutoScoringOptions.appendChild(selectAutoScoringCriteriaText);
	generateAutoScoringOptions.appendChild(selectAutoScoringCriteriaDropDown);
	
	//get the auto scoring criteria value from the content
	var autoScoringCriteria = this.getAutoScoringField('autoScoringCriteria');
	
	if(autoScoringCriteria != null && autoScoringCriteria != '') {
		//populate the drop down box
		$('#selectAutoScoringCriteriaDropDown').val(autoScoringCriteria);		
	}
};

/**
 * Generate the auto scoring feedback elements such as the textareas to
 * input the feedback for the different scores
 */
View.prototype.SVGDrawNode.generateAutoScoringFeedbackAuthoringDiv = function() {
	//get the div that we will put everything in
	var autoScoringFeedbackAuthoringDiv = document.getElementById('autoScoringFeedbackAuthoringDiv');
	
	//clear out the div in case it contained existing content
	autoScoringFeedbackAuthoringDiv.innerHTML = '';
	
	//get the auto scoring criteria
	var autoScoringCriteria = this.getAutoScoringField('autoScoringCriteria');
	
	if(autoScoringCriteria == '') {
		//there is no auto scoring criteria so we will hide the div
		this.hideAutoScoringFeedbackAuthoring();
	} else if(autoScoringCriteria == 'methane' || autoScoringCriteria == 'ethane') {
		//the auto scoring criteria is set so we will show the div
		this.showAutoScoringFeedbackAuthoring();
	}
	
	//create the text box to set whether we want to display the score to the student
	var displayScoreToStudentCheckbox = createElement(document, 'input', {id: 'autoScoringDisplayScoreToStudentCheckbox', type: 'checkbox', onclick: 'eventManager.fire("svgdrawUpdateAutoScoringDisplayScoreToStudentClicked")'});
	var displayScoreToStudentText = document.createTextNode('Display Score to Student');
	
	//populate the checkbox if necessary
	if(this.getAutoScoringField('autoScoringDisplayScoreToStudent')) {
		displayScoreToStudentCheckbox.checked = true;
	}

	//create the text box to set whether we want to display the feedback to the student
	var displayFeedbackToStudentCheckbox = createElement(document, 'input', {id: 'autoScoringDisplayFeedbackToStudentCheckbox', type: 'checkbox', onclick: 'eventManager.fire("svgdrawUpdateAutoScoringDisplayFeedbackToStudentClicked")'});
	var displayFeedbackToStudentText = document.createTextNode('Display Feedback Text to Student');
	
	//populate the checkbox if necessary
	if(this.getAutoScoringField('autoScoringDisplayFeedbackToStudent')) {
		displayFeedbackToStudentCheckbox.checked = true;
	}

	//create the text box to set whether we want to display the feedback to the student on the last chance
	var doNotDisplayFeedbackToStudentOnLastChanceCheckbox = createElement(document, 'input', {id: 'autoScoringDoNotDisplayFeedbackToStudentOnLastChanceCheckbox', type: 'checkbox', onclick: 'eventManager.fire("svgdrawUpdateDoNotDisplayFeedbackToStudentOnLastChanceClicked")'});
	var doNotDisplayFeedbackToStudentOnLastChanceText = document.createTextNode('Do Not Display Feedback to Student on Last Chance');
	
	//populate the checkbox if necessary
	if(this.getAutoScoringField('autoScoringDoNotDisplayFeedbackToStudentOnLastChance')) {
		doNotDisplayFeedbackToStudentOnLastChanceCheckbox.checked = true;
	}
	
	//create the text and input field for the check work chances
	var checkWorkChancesText = document.createTextNode('Check Work Chances (leave blank for unlimited tries)');
	var checkWorkChancesInput = createElement(document, 'input', {id: 'autoScoringCheckWorkChancesInput', type: 'text', size: '4', onchange: 'eventManager.fire("svgdrawUpdateAutoScoringCheckWorkChancesChanged")'});

	//populate the check work chances if necessary
	var checkWorkChances = this.getAutoScoringField('autoScoringCheckWorkChances');
	if(checkWorkChances != null) {
		checkWorkChancesInput.value = checkWorkChances;		
	}
	
	//create the text for the submit confirmation message text area
	var submitConfirmationMessageText = document.createTextNode('Submit Confirmation Message (leave this blank to use the default message. # will be replaced with the number of chances left.)');
	
	//create the textarea for the submit confirmation message
	var submitConfirmationMessageTextArea = createElement(document, 'textarea', {id: 'submitConfirmationMessageTextArea', cols: '60', rows: '4', wrap: 'soft', onchange: 'eventManager.fire("svgdrawUpdateAutoScoringSubmitConfirmationMessageChanged")'});
	
	//add all the elements into the div
	autoScoringFeedbackAuthoringDiv.appendChild(displayScoreToStudentCheckbox);
	autoScoringFeedbackAuthoringDiv.appendChild(displayScoreToStudentText);
	autoScoringFeedbackAuthoringDiv.appendChild(createBreak());
	autoScoringFeedbackAuthoringDiv.appendChild(displayFeedbackToStudentCheckbox);
	autoScoringFeedbackAuthoringDiv.appendChild(displayFeedbackToStudentText);
	autoScoringFeedbackAuthoringDiv.appendChild(createBreak());
	autoScoringFeedbackAuthoringDiv.appendChild(doNotDisplayFeedbackToStudentOnLastChanceCheckbox);
	autoScoringFeedbackAuthoringDiv.appendChild(doNotDisplayFeedbackToStudentOnLastChanceText);
	autoScoringFeedbackAuthoringDiv.appendChild(createBreak());
	autoScoringFeedbackAuthoringDiv.appendChild(checkWorkChancesText);
	autoScoringFeedbackAuthoringDiv.appendChild(checkWorkChancesInput);
	autoScoringFeedbackAuthoringDiv.appendChild(createBreak());
	autoScoringFeedbackAuthoringDiv.appendChild(submitConfirmationMessageText);
	autoScoringFeedbackAuthoringDiv.appendChild(submitConfirmationMessageTextArea);
	autoScoringFeedbackAuthoringDiv.appendChild(createBreak());
	
	//get the feedback array
	var autoScoringFeedback = this.getAutoScoringField('autoScoringFeedback');
	
	var possibleScores = [];
	
	var drawScorer = new DrawScorer();
	
	if(autoScoringCriteria == 'methane') {
		//get the possible scores for methane
		possibleScores = drawScorer.getPossibleMethaneScoreKeys();
	} else if(autoScoringCriteria == 'ethane') {
		//get the possible scores for ethane
		possibleScores = drawScorer.getPossibleEthaneScoreKeys();
	}
	
	if(possibleScores != null) {
		//loop through all the possible scores
		for(var x=0; x<possibleScores.length; x++) {
			var feedback = '';
			var score = null;
			
			//get the possible score object
			var possibleScore = possibleScores[x];
			
			//get the key value
			var keyValue = possibleScore.key;
			
			if(autoScoringFeedback != null) {
				//get the feedback object
				var autoScoringFeedbackObject = autoScoringFeedback[x];
				
				if(autoScoringFeedbackObject != null) {
					//get the existing feedback that was previously authored for this key
					feedback = autoScoringFeedbackObject.feedback;
				}
			}
			
			//display the key value e.g. "0", "1", "2 Case 1", etc.
			var scoreText = document.createTextNode('Score: ' + keyValue);
			
			//create a textarea for the author to enter the feedback text
			var feedbackTextArea = createElement(document, 'textarea', {id: 'autoScoringFeedback_' + x, cols: '60', rows: '4', wrap: 'soft', onchange: 'eventManager.fire("svgdrawUpdateAutoScoringFeedback", ' + x + ')'});
			feedbackTextArea.value = feedback;
			
			//add the elements to the div
			autoScoringFeedbackAuthoringDiv.appendChild(createElement(document, 'hr', null));
			autoScoringFeedbackAuthoringDiv.appendChild(scoreText);
			autoScoringFeedbackAuthoringDiv.appendChild(createBreak());
			autoScoringFeedbackAuthoringDiv.appendChild(feedbackTextArea);
			autoScoringFeedbackAuthoringDiv.appendChild(createBreak());
		}
	}
	
	//get the submit confirmation message if it was authored before
	var submitConfirmationMessage = this.getAutoScoringField('submitConfirmationMessage');

	if(submitConfirmationMessage != null) {
		//repopulate the submit confirmation message text area
		$('#submitConfirmationMessageTextArea').val(submitConfirmationMessage);
	}
};

/**
 * Updates the toolbar_options value of the content to the user specified value
 * and refreshes the preview.
 */
View.prototype.SVGDrawNode.toolbarOptionsChanged = function(){
	var options = document.getElementsByName('toolbarCbx');
	
	// set initial toolbar_options variable if not yet defined
	if(this.content.toolbar_options == null || typeof this.content.toolbar_options == 'undefined'){
		this.content.toolbar_options = {};
	}
	
	for(var i=0;i<options.length;i++){
		var current = $(options[i]).attr('id').replace('Cbx','');
		var isActive = false;
		if(options[i].checked){
			isActive = true;
		}
		
		if(current == 'pencil'){
			this.content.toolbar_options.pencil = isActive;
			if(isActive){
				if(this.content.snapshots_max > 10){
					this.content.snapshots_max = 10;
					document.getElementById('snapMaxInput').options[8].selected = true;
					alert('Note: If the pencil tool is enabled, a maximum of 10 frames is allowed per step. This is because use of the pencil tool results in larger data files.\n\nAs a result, WISE has automatically set the maximum number of allowed frames for this step to 10.');
				}
				$('#snapMaxInput option.noPencil').prop('disabled',true);
			} else {
				$('#snapMaxInput option.noPencil').prop('disabled',false);
			}
		} else if (current == 'line'){
			this.content.toolbar_options.line = isActive;
		} else if (current == 'connector'){
			this.content.toolbar_options.connector = isActive;
		} else if (current == 'rectangle'){
			this.content.toolbar_options.rectangle = isActive;
		} else if (current == 'ellipse'){
			this.content.toolbar_options.ellipse = isActive;
		} else if (current == 'polygon'){
			this.content.toolbar_options.polygon = isActive;
		} else if (current == 'text'){
			this.content.toolbar_options.text = isActive;
		} else if (current == 'importStudentAsset'){
			this.content.toolbar_options.importStudentAsset = isActive;
		}
	}
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the snapshots_active value of the content to the user specified value
 * and refreshes the preview.
 */
View.prototype.SVGDrawNode.snapshotOptionChanged = function(){
	var rads = document.getElementsByName('snapshotRadio');
	
	for(var a=0;a<rads.length;a++){
		if(rads[a].checked){
			if(rads[a].value=='true'){
				this.content.snapshots_active = true;
				document.getElementById('snapMaxInput').disabled = false;
			} else {
				this.content.snapshots_active = false;
				document.getElementById('snapMaxInput').disabled = true;
			};
		};
	};
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the snapshots_max value of the content to the user specified value
 * and refreshes the preview.
 */
View.prototype.SVGDrawNode.snapshotMaxChanged = function(){
	var snapMax = document.getElementById('snapMaxInput').value;
	this.content.snapshots_max = parseInt(snapMax);
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the description_active value of the content to the user specified value
 * and refreshes the preview.
 */
View.prototype.SVGDrawNode.descriptionOptionChanged = function(){
	var rads = document.getElementsByName('descriptionRadio');
	var descriptionInput = document.getElementById('defaultDescriptionInput');
	
	for(var b=0;b<rads.length;b++){
		if(rads[b].checked){
			if(rads[b].value=='true'){
				this.content.description_active = true;
				descriptionInput.disabled = false;
			} else {
				this.content.description_active = false;
				descriptionInput.disabled = true;
			};
		};
	};
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the default description value of the content to the user specified value
 * and refreshes the preview.
 */
View.prototype.SVGDrawNode.defaultDescriptionChanged = function(){
	this.content.description_default = document.getElementById('defaultDescriptionInput').value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

View.prototype.SVGDrawNode.populatePrompt = function() {
	$('#promptInput').val(this.content.prompt);
};

/**
 * Updates the prompt value of the content to the user specified value and 
 * refreshes the preview.
 */
View.prototype.SVGDrawNode.updatePrompt = function(){
	var content = '';
	/* update content object */
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
 * Updates the path of the background image that the user specified in the content
 * and refreshes the preview.
 */
View.prototype.SVGDrawNode.backgroundChanged = function(){
	this.content.svg_background = document.getElementById('backgroundPathInput').value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Adds a new stamp to the content then refreshes the stamps and updates the preview
 */
View.prototype.SVGDrawNode.addNewStamp = function(){
	this.content.stamps.push({title:'enter title', uri:'', width:0, height:0});
	
	this.generateStamps();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the value of the stamp uri in the content for the given index and
 * refreshes the preview.
 */
View.prototype.SVGDrawNode.stampValueChanged = function(ndx){
	this.content.stamps[ndx].uri = document.getElementById('stampInput_' + ndx).value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the value of the stamp title in the content for the given index and
 * refreshes the preview.
 */
View.prototype.SVGDrawNode.stampLabelChanged = function(ndx){
	this.content.stamps[ndx].title = document.getElementById('stampLabelInput_' + ndx).value;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the value of the stamp width in the content for the given index and
 * refreshes the preview.
 */
View.prototype.SVGDrawNode.stampWidthChanged = function(ndx){
	var val = document.getElementById('stampWidthInput_' + ndx).value;
	
	if(this.isValidNumber(val)){
		this.content.stamps[ndx].width = parseInt(val);
		
		/* fire source updated event */
		this.view.eventManager.fire('sourceUpdated');
	} else {
		this.view.notificationManager.notify('The value entered for the stamp width ' + val + ' is not valid. You must enter a whole number greater or equal to 0.', 3);
		document.getElementById('stampWidthInput_' + ndx).value = this.content.stamps[ndx].width;
	};
};

/**
 * Updates the value of the stamp height in the content for the given index and
 * refreshes the preview.
 */
View.prototype.SVGDrawNode.stampHeightChanged = function(ndx){
	var val = document.getElementById('stampHeightInput_' + ndx).value;
	
	if(this.isValidNumber(val)){
		this.content.stamps[ndx].height = parseInt(val);
		
		/* fire source updated event */
		this.view.eventManager.fire('sourceUpdated');
	} else {
		this.view.notificationManager.notify('The value entered for the stamp height ' + val + ' is not valid. You must enter a whole number greater or equal to 0.', 3);
		document.getElementById('stampHeightInput_' + ndx).value = this.content.stamps[ndx].height;
	};
};

/**
 * Returns true if the given num is a not undefined or null, is a whole number and
 * is greater or equal to 0, returns false otherwise.
 */
View.prototype.SVGDrawNode.isValidNumber = function(num){
	if(num && !isNaN(num) && num>=0 && num.indexOf('.')==-1){
		return true;
	} else {
		return false;
	};
};

/**
 * Removes the stamp of the given index from the content, then refreshes
 * the stamp html elements and the preview.
 */
View.prototype.SVGDrawNode.removeStamp = function(ndx){
	this.content.stamps.splice(ndx, 1);
	
	this.generateStamps();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Clears the title value of the stamp with the given index if it
 * is the default prompt.
 */
View.prototype.SVGDrawNode.stampTitleClicked = function(ndx){
	var title = document.getElementById('stampLabelInput_' + ndx);
	if(title.value=='enter title'){
		title.value = '';
	};
};

/**
 * Clears the default description value of the stamp with the given index if it
 * is default default description.
 */
View.prototype.SVGDrawNode.descriptionClicked = function(){
	var desc = document.getElementById('defaultDescriptionInput');
	if(desc.value=='Enter description here.'){
		desc.value = '';
	};
};

/**
 * Clears the default width value of the stamp with the given index if it
 * is default width.
 */
View.prototype.SVGDrawNode.stampWidthClicked = function(ndx){
	var width = document.getElementById('stampWidthInput_' + ndx);
	if(width.value==0){
		width.value = '';
	};
};

/**
 * Clears the default height value of the stamp with the given index if it
 * is default height.
 */
View.prototype.SVGDrawNode.stampHeightClicked = function(ndx){
	var height = document.getElementById('stampHeightInput_' + ndx);
	if(height.value==0){
		height.value = '';
	};
};

/**
 * Updates the background image url to match that of what the user input
 */
View.prototype.SVGDrawNode.updateBackgroundImageUrl = function(){
	/* update content */
	this.content.img_background = document.getElementById('backgroundImageUrl').value;
	
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Open asset editor dialog and allows user to choose the image to use for the background
 */
View.prototype.SVGDrawNode.browseImageAssets = function() {
	var callback = function(field_name, url, type, win){
		url = 'assets/' + url;
		document.getElementById(field_name).value = url;
		
		//fire background url changed event
		this.eventManager.fire('svgdrawUpdateBackgroundImageUrl');
	};
	var params = {};
	params.field_name = 'backgroundImageUrl';
	params.type = 'image';
	params.win = null;
	params.callback = callback;
	eventManager.fire('viewAssets',params);
};

/**
 * Update background image position
 */
View.prototype.SVGDrawNode.updateBgAlign = function() {
	//update the content
	this.content.bg_position = $('#backgroundAlignSelect').val();
	
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * The author has changed the auto scoring criteria so we will save it
 * in the content
 */
View.prototype.SVGDrawNode.updateAutoScoringCriteria = function() {
	//get the auto scoring criteria
	var autoScoringCriteria = $('#selectAutoScoringCriteriaDropDown').val();
	
	if(autoScoringCriteria == 'none') {
		//set the value in the content
		this.setAutoScoringField('autoScoringCriteria', '');
		
		//hide the auto scoring feedback div
		this.hideAutoScoringFeedbackAuthoring();
		
		//set the export columns
		this.setRegularExportColumns();
	} else if(autoScoringCriteria == 'methane') {
		//set the value into the content
		this.setAutoScoringField('autoScoringCriteria', 'methane');
		
		//show the auto scoring feedback div
		this.generateAutoScoringFeedbackAuthoringDiv();
		this.showAutoScoringFeedbackAuthoring();
		
		//set the export columns
		this.setAutoGradedExportColumns();
	} else if(autoScoringCriteria == 'ethane') {
		//set the value into the content
		this.setAutoScoringField('autoScoringCriteria', 'ethane');
		
		//show the auto scoring feedback div
		this.generateAutoScoringFeedbackAuthoringDiv();
		this.showAutoScoringFeedbackAuthoring();
		
		//set the export columns
		this.setAutoGradedExportColumns();
	}
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Show the auto scoring feedback div
 */
View.prototype.SVGDrawNode.showAutoScoringFeedbackAuthoring = function() {
	$('#autoScoringFeedbackAuthoringDiv').show();
};

/**
 * Hide the auto scoring feedback div
 */
View.prototype.SVGDrawNode.hideAutoScoringFeedbackAuthoring = function() {
	$('#autoScoringFeedbackAuthoringDiv').hide();
};

/**
 * The author has changed the text for one of the feedback textareas
 * @param index this score has had its feedback changed
 */
View.prototype.SVGDrawNode.updateAutoScoringFeedback = function(index) {
	//get the feedback array
	var autoScoringFeedback = this.getAutoScoringFeedback();
	
	var possibleScores = [];
	
	//get the draw scorer object
	var drawScorer = new DrawScorer();
	
	//get the auto scoring criteria
	var autoScoringCriteria = this.getAutoScoringField('autoScoringCriteria');
	
	if(autoScoringCriteria == 'methane') {
		//get the possible scores for methane
		possibleScores = drawScorer.getPossibleMethaneScoreKeys();
	} else if(autoScoringCriteria == 'ethane') {
		//get the possible scores for ethane
		possibleScores = drawScorer.getPossibleEthaneScoreKeys();
	}
	
	if(autoScoringFeedback.length == 0) {
		if(possibleScores != null) {
			//loop through all the possible score objects
			for(var x=0; x<possibleScores.length; x++) {
				//get a possible score object
				var possibleScore = possibleScores[x];
				
				/*
				 * create the auto scoring feedback object and insert the
				 * score and key
				 */
				autoScoringFeedback[x] = {
					score:possibleScore.score,
					key:possibleScore.key,
					feedback:''
				};
			}
		}
	}
	
	//get the feedback text the author has written and set it in the content
	var feedback = $('#autoScoringFeedback_' + index).val();
	autoScoringFeedback[index].feedback = feedback;
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the value that determines whether the student will see the
 * auto score
 */
View.prototype.SVGDrawNode.updateAutoScoringDisplayScoreToStudent = function() {
	//get whether the checkbox was checked or not
	var checked = $('#autoScoringDisplayScoreToStudentCheckbox').attr('checked');
	
	if(checked == 'checked') {
		this.setAutoScoringField('autoScoringDisplayScoreToStudent', true);
	} else {
		this.setAutoScoringField('autoScoringDisplayScoreToStudent', false);
	}
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the value that determines whether the student will see the
 * auto feedback
 */
View.prototype.SVGDrawNode.updateAutoScoringDisplayFeedbackToStudent = function() {
	//get whether the checkbox was checked or not
	var checked = $('#autoScoringDisplayFeedbackToStudentCheckbox').attr('checked');
	
	if(checked == 'checked') {
		this.setAutoScoringField('autoScoringDisplayFeedbackToStudent', true);
	} else {
		this.setAutoScoringField('autoScoringDisplayFeedbackToStudent', false);
	}
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Update the value that determines how many times the student can click the
 * 'Check Work' button
 */
View.prototype.SVGDrawNode.updateAutoScoringCheckWorkChances = function() {
	if($('#autoScoringCheckWorkChancesInput').length > 0) {
		//get the check work chances value
		var checkWorkChances = $('#autoScoringCheckWorkChancesInput').val();
		
		if(checkWorkChances == '' || !isNaN(parseInt(checkWorkChances))) {
			//the user has entered '' or a number
			
			//set the value into the step content
			this.setAutoScoringField('autoScoringCheckWorkChances', checkWorkChances);
			
			//fire source updated event, this will update the preview
			this.view.eventManager.fire('sourceUpdated');
		} else {
			alert("Error: invalid 'Check Work Chances' value");
			
			//get the previous check work chances value
			checkWorkChances = this.getAutoScoringField('autoScoringCheckWorkChances');
			
			//set the old value back into the input
			$('#autoScoringCheckWorkChancesInput').val(checkWorkChances);
		}
	}
};

/**
 * Update the value that determines if the student will see the feedback
 * when they submit their last chance
 */
View.prototype.SVGDrawNode.updateDoNotDisplayFeedbackToStudentOnLastChance = function() {
	//get whether the checkbox was checked or not
	var checked = $('#autoScoringDoNotDisplayFeedbackToStudentOnLastChanceCheckbox').attr('checked');
	
	if(checked == 'checked') {
		this.setAutoScoringField('autoScoringDoNotDisplayFeedbackToStudentOnLastChance', true);
	} else {
		this.setAutoScoringField('autoScoringDoNotDisplayFeedbackToStudentOnLastChance', false);
	}
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Get the auto scoring feedback array
 */
View.prototype.SVGDrawNode.getAutoScoringFeedback = function() {
	//populate the autoScoring object in the content if it does not exist
	this.createAutoScoringObjectIfDoesNotExist();
	
	return this.content.autoScoring.autoScoringFeedback;
};

/**
 * Set the auto scoring field in the autoScoring object in the content
 * @param key the field
 * @param value the value
 */
View.prototype.SVGDrawNode.setAutoScoringField = function(key, value) {
	//populate the autoScoring object in the content if it does not exist
	this.createAutoScoringObjectIfDoesNotExist();
	
	//set the value
	this.content.autoScoring[key] = value;
	
	//fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Get the auto scoring field in the autoScoring object in the content
 * @param key the field
 */
View.prototype.SVGDrawNode.getAutoScoringField = function(key) {
	//populate the autoScoring object in the content if it does not exist
	this.createAutoScoringObjectIfDoesNotExist();
	
	//get the value
	var value = this.content.autoScoring[key];
	
	return value;
};

/**
 * Populate the autoScoring object in the content if it does not exist
 */
View.prototype.SVGDrawNode.createAutoScoringObjectIfDoesNotExist = function() {
	if(this.content.autoScoring == null) {
		this.content.autoScoring = {
			autoScoringCheckWorkChances:'',
			autoScoringCriteria:'',
			autoScoringDisplayScoreToStudent:true,
			autoScoringDisplayFeedbackToStudent:true,
			autoScoringDoNotDisplayFeedbackToStudentOnLastChance:false,
			autoScoringFeedback:[]
		};
	}
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 */
View.prototype.SVGDrawNode.updateContent = function(){
	/* update content object */
	this.view.activeContent.setContent(this.content);
};

/**
 * Update the submit confirmation message field in the step content
 */
View.prototype.SVGDrawNode.updateAutoScoringSubmitConfirmationMessageChanged = function(){
	//get the message text
	var submitConfirmationMessage = $('#submitConfirmationMessageTextArea').val();
	
	//set the message text into the content
	this.setAutoScoringField('submitConfirmationMessage', submitConfirmationMessage);
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Clear the export columns
 */
View.prototype.SVGDrawNode.clearExportColumns = function() {
	this.content.exportColumns = null;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Set the export column for regular draw steps
 */
View.prototype.SVGDrawNode.setRegularExportColumns = function() {
	this.content.exportColumns = [
          {
        	  "columnName": "Data",
        	  "field": "data"
          }
  	];
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Set the export columns for auto graded draw steps
 */
View.prototype.SVGDrawNode.setAutoGradedExportColumns = function() {
	this.content.exportColumns = [
          {
        	  "columnName": "Submit",
        	  "field": "checkWork"
          },
          {
        	  "columnName": "Auto-Feedback Key",
        	  "field": "autoFeedbackKey"
          },
          {
        	  "columnName": "Auto-Score",
        	  "field": "autoScore"
          },
          {
        	  "columnName": "Auto-Feedback",
        	  "field": "autoFeedback"
          },
          {
        	  "columnName": "Data",
        	  "field": "data"
          }
  	];
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/draw/authorview_svgdraw.js');
};