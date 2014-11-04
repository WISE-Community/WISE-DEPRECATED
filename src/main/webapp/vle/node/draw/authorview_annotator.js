/**
 * Sets the AnnotatorNode type as an object of this view
 * @constructor
 * @author geoffrey kwan
 * @author jonathan lim-breitbart
 */
View.prototype.AnnotatorNode = {};
View.prototype.AnnotatorNode.commonComponents = ['Prompt', 'LinkTo'];

/**
 * Generates the authoring page for annotator node types
 */
View.prototype.AnnotatorNode.generatePage = function(view){
	this.view = view;
	this.content = this.view.activeContent.getContentJSON();
	
	//retrieve the translation files for this step type
	this.view.activeNode.fetchI18NFiles();
	
	var parent = document.getElementById('dynamicParent');
	
	/* wipe out old */
	parent.removeChild(document.getElementById('dynamicPage'));
	
	/* create new */
	var pageDiv = createElement(document, 'div', {id:'dynamicPage', style:'width:100%;height:100%'});
	
	//create the label for the require work checkbox
	var requireWorkText = document.createTextNode(view.getI18NString('annotator_authoring_require','SVGDrawNode'));
	//create the checkbox for requiring students to complete work on the step before moving on in the project
	var requireWorkToggle = createElement(document, 'input', {id: 'requireWorkToggle', type: 'checkbox', onclick: 'eventManager.fire("annotatorUpdateWorkRequired")'});
	requireWorkToggle.checked = this.content.isMustComplete ? true : false;
	
	//get the existing background url
	var backgroundImg = this.content.backgroundImg ? this.content.backgroundImg : '';
	//the label for the background url input
	var backgroundImageUrlLabel = document.createTextNode(view.getI18NString('annotator_authoring_imageLabel','SVGDrawNode'));
	//the text input for the background url
	var backgroundImageUrl = createElement(document, 'input', {type: 'text', id: 'backgroundImageUrl', name: 'backgroundImageUrl', value: backgroundImg, size:50, onchange: 'eventManager.fire("annotatorUpdateBackgroundImageUrl")'});
	//create the browse button that allows author to choose swf from project assets
	var backgroundBrowseButton = $(createElement(document, 'button', {id: 'backgroundBrowseButton', onclick:'eventManager.fire("annotatorBrowseClicked")'})).text(view.getI18NString('annotator_authoring_imageBrowse','SVGDrawNode'));
	
	var colorDiv = createElement(document, 'div', {id: 'colorDiv'});
	
	//get the existing max labels value
	var maxLabels = this.content.labels_max > -1 ? this.content.labels_max : 0;
	//the label for the maximum number of lables input
	var maxLabelsLabel = document.createTextNode(view.getI18NString('annotator_authoring_maxLabel','SVGDrawNode'));
	//the text input for the maximum number of labels allowed
	var maxLabelsInput = createElement(document, 'input', {type: 'number', id: 'maxLabels', name: 'maxLabels', value: maxLabels, size:2, onchange: 'eventManager.fire("annotatorUpdateMaxLabels")'});
	
	//get the existing min labels value
	var minLabels = this.content.labels_min > -1 ? this.content.labels_min : 1;
	//the label for the minimum number of lables input
	var minLabelsLabel = document.createTextNode(view.getI18NString('annotator_authoring_minLabel','SVGDrawNode'));
	//the text input for the minimum number of labels required
	var minLabelsInput = createElement(document, 'input', {type: 'number', id: 'minLabels', name: 'minLabels', value: minLabels, size:2, onchange: 'eventManager.fire("annotatorUpdateMinLabels")'});
	
	// create the text for the prompt input
	var promptText = document.createTextNode(view.getI18NString('annotator_authoring_promptLabel','SVGDrawNode'));
	
	//create the text for the enable student text area checkbox
	var enableStudentTextAreaLabel = document.createTextNode(view.getI18NString('annotator_authoring_responseLabel','SVGDrawNode'));
	//create the checkbox for enabling the student response area
	var enableStudentTextAreaCheckBox = createElement(document, 'input', {id: 'enableStudentTextArea', type: 'checkbox', onclick: 'eventManager.fire("annotatorUpdateEnableStudentTextArea")'});
	var enableTextBox = this.content.enableStudentTextArea ? true : false;
	enableStudentTextAreaCheckBox.checked = enableTextBox;
	
	// create the section for student response area
	var instructionsTextAreaDiv = document.createElement('div');
	$(instructionsTextAreaDiv).attr('id','textAreaInstructionsDiv');
	if(!enableTextBox){ $(instructionsTextAreaDiv).hide(); };
	//create the label for the textarea that the author will write the student response instructions in
	var instructionsLabel = document.createTextNode(view.getI18NString('annotator_authoring_responseInstructionsLabel','SVGDrawNode'));
	//get and set the instructions
	var instructionsValue = this.content.textAreaInstructions ? this.content.textAreaInstructions : view.getI18NString('annotator_authoring_responseInstructions','SVGDrawNode');
	//create the textarea that the author will write the instructions in
	var instructionsTextArea = createElement(document, 'textarea', {id: 'textAreaInstructions', rows:'3', cols:'85', onkeyup:"eventManager.fire('annotatorUpdateTextAreaInstructions')"});
	instructionsTextArea.value = instructionsValue;
	
	//create the label for the input that the author will write the text for the button that opens the student response box
	var textAreaButtonLabel = document.createTextNode(view.getI18NString('annotator_authoring_responseButtonLabel','SVGDrawNode'));
	//get and set the button label text
	var textAreaButtonValue = this.content.textAreaButtonText ? this.content.textAreaButtonText : view.getI18NString('annotator_explain','SVGDrawNode');
	//create the textarea that the author will write the button label text in
	var textAreaButtonInput = createElement(document, 'input', {id: 'textAreaButtonText', type: 'text', size: '50', onkeyup:"eventManager.fire('annotatorUpdateStudentResponseButton')"});
	//populate the instructions text area
	textAreaButtonInput.value = textAreaButtonValue;
	
	//var autoScoringOptionsDiv = createElement(document, 'div', {id:'autoScoringOptionsDiv'});
	//var autoScoringFeedbackAuthoringDiv = createElement(document, 'div', {id:'autoScoringFeedbackAuthoringDiv'});
	
	parent.appendChild(pageDiv);
	
	// TODO: enable require before exit option
	//pageDiv.appendChild(requireWorkText);
	//pageDiv.appendChild(requireWorkToggle);
	//pageDiv.appendChild(createBreak());
	
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(backgroundImageUrlLabel);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(backgroundImageUrl);
	$(pageDiv).append(backgroundBrowseButton);
	pageDiv.appendChild(createBreak());
	
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(colorDiv);
	
	pageDiv.appendChild(maxLabelsLabel);
	pageDiv.appendChild(maxLabelsInput);
	pageDiv.appendChild(createBreak());
	
	pageDiv.appendChild(minLabelsLabel);
	pageDiv.appendChild(minLabelsInput);
	pageDiv.appendChild(createBreak());
	
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(promptText);
	pageDiv.appendChild(createElement(document, 'div', {id: 'promptContainer'}));
	pageDiv.appendChild(createBreak());
	
	pageDiv.appendChild(enableStudentTextAreaLabel);
	pageDiv.appendChild(enableStudentTextAreaCheckBox);
	pageDiv.appendChild(createBreak());
	
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(instructionsTextAreaDiv);
	instructionsTextAreaDiv.appendChild(instructionsLabel)
	instructionsTextAreaDiv.appendChild(instructionsTextArea);
	instructionsTextAreaDiv.appendChild(createBreak());
	instructionsTextAreaDiv.appendChild(createBreak());
	instructionsTextAreaDiv.appendChild(textAreaButtonLabel);
	instructionsTextAreaDiv.appendChild(textAreaButtonInput);
	pageDiv.appendChild(createBreak());
	
	//create the label for enabling auto scoring
	var enableAutoScoringLabel = $('<p>');
	enableAutoScoringLabel.css('display', 'inline');
	enableAutoScoringLabel.css('font-family', 'Gill Sans,Arial,Verdana,sans-serif');
	enableAutoScoringLabel.css('font-size', '1em');
	enableAutoScoringLabel.text('Enable Auto Scoring: ');
	
	//create the checkbox for enabling auto scoring
	var enableAutoScoringCheckbox = $('<input>');
	enableAutoScoringCheckbox.attr('id', 'enableAutoScoringCheckbox')
	enableAutoScoringCheckbox.attr('type', 'checkbox');
	enableAutoScoringCheckbox.click({thisAnnotatorNode:this}, function(event) {
		var thisAnnotatorNode = event.data.thisAnnotatorNode;
		thisAnnotatorNode.enableAutoScoringCheckboxClicked();
	});
	
	//create the auto scoring div that contains the auto scoring authoring
	var autoScoringDiv = this.createAutoScoringDiv();
	
	//add the auto scoring authoring elements
	$(pageDiv).append(enableAutoScoringLabel);
	$(pageDiv).append(enableAutoScoringCheckbox);
	$(pageDiv).append(autoScoringDiv);
	
	if(this.content.enableAutoScoring) {
		//auto scoring is enabled so we will check the box and display the div
		enableAutoScoringCheckbox.prop('checked', true);
		autoScoringDiv.show();
	}
	
	//populate the auto scoring div values
	this.populateAutoScoringDiv();
	
	this.generateColorOptions();
	//this.generateLabelMinOptions();
	//this.generateLabelMaxOptions();
	//this.generateAutoScoringOptions();
	//this.generateAutoScoringFeedbackAuthoringDiv();
};

/**
 * Get the auto scoring value
 * @param fieldName the name of the auto scoring field
 * @return the field value or null if the field name does not exist
 */
View.prototype.AnnotatorNode.getAutoScoringFieldValue = function(fieldName) {
	var fieldValue = null;
	
	if(fieldName != null && fieldName != '') {
		//get the step content
		var content = this.content;
		
		if(content != null) {
			//get the auto scoring object in the content
			var autoScoring = content.autoScoring;
			
			if(autoScoring != null) {
				//get the value
				fieldValue = autoScoring[fieldName];
			}
		}		
	}
	
	return fieldValue;
};

/**
 * Set the auto scoring value
 * @param fieldName the name of the auto scoring field
 * @param fieldValue the value of the auto scoring field
 */
View.prototype.AnnotatorNode.setAutoScoringFieldValue = function(fieldName, fieldValue) {
	if(fieldName != null && fieldName != '' && fieldValue != null) {
		//get the step content
		var content = this.content;
		
		if(content != null) {
			//get the auto scoring object in the content
			var autoScoring = content.autoScoring;
			
			if(autoScoring != null) {
				//set the field
				autoScoring[fieldName] = fieldValue;
				
				//fire source updated event, which will update the preview
				this.view.eventManager.fire('sourceUpdated');
			}
		}
	}
};

/**
 * Populate the auto scoring div elements
 */
View.prototype.AnnotatorNode.populateAutoScoringDiv = function() {
	//get the step content
	var content = this.content;
	
	if(content != null) {
		//get the value for whether to display the score to the student
		var autoScoringDisplayScoreToStudent = this.getAutoScoringFieldValue('autoScoringDisplayScoreToStudent');
		if(autoScoringDisplayScoreToStudent) {
			//check the box
			$('#displayScoreToStudentCheckbox').prop('checked', true);
		}
		
		//get the value for whether to display the feedback to the student
		var autoScoringDisplayFeedbackToStudent = this.getAutoScoringFieldValue('autoScoringDisplayFeedbackToStudent');
		if(autoScoringDisplayFeedbackToStudent) {
			//check the box
			$('#displayFeedbackToStudentCheckbox').prop('checked', true);
		}
		
		//get the value for whether to display feedback on the last check work chance
		var autoScoringDoNotDisplayFeedbackToStudentOnLastChance = this.getAutoScoringFieldValue('autoScoringDoNotDisplayFeedbackToStudentOnLastChance');
		if(autoScoringDoNotDisplayFeedbackToStudentOnLastChance) {
			//check the box
			$('#displayNoFeedbackOnLastChanceCheckbox').prop('checked', true);
		}
		
		//get the max number of check work chances
		var autoScoringCheckWorkChances = this.getAutoScoringFieldValue('autoScoringCheckWorkChances');
		if(autoScoringCheckWorkChances != null) {
			//set the value
			$('#checkWorkChancesInput').val(autoScoringCheckWorkChances);
		}
		
		//get the regions
		var regions = this.getAutoScoringFieldValue('regions');
		if(regions != null) {
			/*
			 * loop through all the regions from last to first so that
			 * the regions with the higher ids show up at the top
			 */
			for(var r=regions.length - 1; r>=0; r--) {
				//get a region
				var region = regions[r];
				
				if(region != null) {
					//create the region list item
					var regionLI = this.createRegionLI(region);
					
					if(regionLI != null) {
						//add the region list item to the list of regions
						$('#regionsUL').append(regionLI);
					}
				}
			}
		}
		
		//get the labels
		var labels = this.getAutoScoringFieldValue('labels');
		if(labels != null) {
			/*
			 * loop through all the labels from last to first so that
			 * the labels with the higher ids show up at the top
			 */
			for(var l=labels.length - 1; l>=0; l--) {
				//get a label
				var label = labels[l];
				
				if(label != null) {
					//create the label list item
					var labelLI = this.createLabelLI(label);
					
					if(labelLI != null) {
						//add the label list item to the list of labels
						$('#labelsUL').append(labelLI);
					}
				}
			}
		}
		
		//get the mappings
		var mappings = this.getAutoScoringFieldValue('mappings');
		if(mappings != null) {
			/*
			 * loop through all the mappings from last to first so that
			 * the mappings with the higher ids show up at the top
			 */
			for(var m=mappings.length - 1; m>=0; m--) {
				//get a mapping
				var mapping = mappings[m];
				
				if(mapping != null) {
					//create a mapping list item
					var mappingLI = this.createMappingLI(mapping);
					
					if(mappingLI != null) {
						//add the mapping list item to the list of mappings
						$('#mappingsUL').append(mappingLI);
					}
				}
			}
		}
		
		//get the scoring criteria
		var scoringCriteria = this.getAutoScoringFieldValue('scoringCriteria');
		if(scoringCriteria != null) {
			/*
			 * loop through all the scoring criteria from last to first so that
			 * the scoring criteria with the higher ids show up at the top
			 */
			for(var s=scoringCriteria.length - 1; s>=0; s--) {
				//get a scoring criteria
				var scoringCriterion = scoringCriteria[s];
				
				if(scoringCriterion != null) {
					//create a scoring criteria list item
					var mappingLI = this.createScoringCriteriaLI(scoringCriterion);
					
					if(mappingLI != null) {
						//add the scoring criteria list item to the list of scoring criteria
						$('#scoringCriteriaUL').append(mappingLI);
					}
				}
			}
		}
		
	}
	
};

/**
 * Create a list item for a region
 * @param region the region object from the step content
 * @return the list item for the region
 */
View.prototype.AnnotatorNode.createRegionLI = function(region) {
	var regionLI = null;
	
	if(region != null) {
		//get the fields in the region
		var id = region.id;
		var name = region.name;
		var shape = region.shape;

		//create the list item
		regionLI = $('<li>');
		regionLI.attr('id', 'regionLI_' + id);
		
		//create the div that will contain the UI elements for this region
		var div = $('<div>');
		div.css('border', '1px solid');
		div.css('padding', '5px 5px');
		regionLI.append(div);
		
		//create the p that will display the region id
		var idP = $('<p>');
		idP.text('Id: ' + id + ' ');
		idP.css('display', 'inline');
		div.append(idP);
		
		//create the delete button to delete this region
		var deleteButton = $('<input>');
		deleteButton.attr('type', 'button');
		deleteButton.val('Delete');
		deleteButton.click({thisAnnotatorNode:this, id:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var id = event.data.id;
			thisAnnotatorNode.deleteRegionClicked(id);
		});
		div.append(deleteButton);
		
		div.append('<br>');
		
		//create the p that will display the name label
		var nameLabel = $('<p>');
		nameLabel.text('Name: ');
		nameLabel.css('display', 'inline');
		div.append(nameLabel);
		
		//create the input for the region name
		var nameInput = $('<input>');
		nameInput.attr('id', 'regionNameInput_' + id);
		nameInput.attr('type', 'text');
		nameInput.val(name);
		nameInput.on('input', {thisAnnotatorNode:this, regionId:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var regionId = event.data.regionId;
			thisAnnotatorNode.regionNameChanged(regionId);
		});
		div.append(nameInput);
		
		div.append('<br>');
		
		//get the parameters of the shape
		var shapeType = shape.type;
		var shapeX = shape.x;
		var shapeY = shape.y;
		
		//create the p that will display the shape label
		var shapeLabel = $('<p>');
		shapeLabel.text('Shape');
		shapeLabel.css('display', 'inline');
		div.append(shapeLabel);
		
		div.append('<br>');
		
		//create the p that will display the shape type label
		var shapeTypeLabel = $('<p>');
		shapeTypeLabel.text('Type: ');
		shapeTypeLabel.css('display', 'inline');
		div.append(shapeTypeLabel);
		
		//create the rectangle radio button
		var rectangleRadioButton = $('<input>');
		rectangleRadioButton.val('rectangle');
		rectangleRadioButton.attr('type', 'radio');
		rectangleRadioButton.attr('name', 'shapeTypeRadioButton_' + id);
		rectangleRadioButton.click({thisAnnotatorNode:this, regionId:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var regionId = event.data.regionId;
			thisAnnotatorNode.regionShapeTypeChanged(regionId);
		});
		div.append(rectangleRadioButton);
		
		//create the rectangle label
		var rectangleLabel = $('<p>');
		rectangleLabel.text('Rectangle');
		rectangleLabel.css('display', 'inline');
		div.append(rectangleLabel);
		
		//create the circle radio button
		var circleRadioButton = $('<input>');
		circleRadioButton.val('circle');
		circleRadioButton.attr('type', 'radio');
		circleRadioButton.attr('name', 'shapeTypeRadioButton_' + id);
		circleRadioButton.click({thisAnnotatorNode:this, regionId:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var regionId = event.data.regionId;
			thisAnnotatorNode.regionShapeTypeChanged(regionId);
		});
		div.append(circleRadioButton);
		
		//create the circle label
		var circleLabel = $('<p>');
		circleLabel.text('Circle');
		circleLabel.css('display', 'inline');
		div.append(circleLabel);
		
		div.append('<br>');
		
		//create the x label
		var xLabel = $('<p>');
		xLabel.text('X: ');
		xLabel.css('display', 'inline');
		div.append(xLabel);
		
		//create the input for the x location
		var xInput = $('<input>');
		xInput.attr('id', 'regionXInput_' + id);
		xInput.attr('type', 'text');
		xInput.css('width', '40px');
		xInput.val(shapeX);
		xInput.on('input', {thisAnnotatorNode:this, regionId:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var regionId = event.data.regionId;
			thisAnnotatorNode.regionXInputChanged(regionId);
		});
		div.append(xInput);
		
		div.append('<br>');
		
		//create the y label
		var yLabel = $('<p>');
		yLabel.text('Y: ');
		yLabel.css('display', 'inline');
		div.append(yLabel);
		
		//create the input for the y location
		var yInput = $('<input>');
		yInput.attr('id', 'regionYInput_' + id);
		yInput.attr('type', 'text');
		yInput.css('width', '40px');
		yInput.val(shapeY);
		yInput.on('input', {thisAnnotatorNode:this, regionId:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var regionId = event.data.regionId;
			thisAnnotatorNode.regionYInputChanged(regionId);
		});
		div.append(yInput);
		
		div.append('<br>');
		
		//create the div that will display the rectangle parameters
		var rectangleParametersDiv = $('<div>');
		rectangleParametersDiv.attr('id', 'regionRectangleParametersDiv_' + id);
		
		var shapeWidth = shape.width;
		var shapeHeight = shape.height;
		
		//create the width label
		var widthLabel = $('<p>');
		widthLabel.text('Width: ');
		widthLabel.css('display', 'inline');
		rectangleParametersDiv.append(widthLabel);
		
		//create the width input
		var widthInput = $('<input>');
		widthInput.attr('id', 'regionWidthInput_' + id);
		widthInput.attr('type', 'text');
		widthInput.css('width', '40px');
		widthInput.on('input', {thisAnnotatorNode:this, regionId:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var regionId = event.data.regionId;
			thisAnnotatorNode.regionWidthInputChanged(regionId);
		});
		rectangleParametersDiv.append(widthInput);
		if(shapeWidth != null) {
			widthInput.val(shapeWidth);
		}
		
		rectangleParametersDiv.append('<br>');
		
		//create the height label
		var heightLabel = $('<p>');
		heightLabel.text('Height: ');
		heightLabel.css('display', 'inline');
		rectangleParametersDiv.append(heightLabel);
		
		//create the height input
		var heightInput = $('<input>');
		heightInput.attr('id', 'regionHeightInput_' + id);
		heightInput.attr('type', 'text');
		heightInput.css('width', '40px');
		heightInput.on('input', {thisAnnotatorNode:this, regionId:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var regionId = event.data.regionId;
			thisAnnotatorNode.regionHeightInputChanged(regionId);
		});
		rectangleParametersDiv.append(heightInput);
		if(shapeHeight != null) {
			heightInput.val(shapeHeight);
		}
		
		div.append(rectangleParametersDiv);
		
		//create the div that will display the circle parameters
		var circleParametersDiv = $('<div>');
		circleParametersDiv.attr('id', 'regionCircleParametersDiv_' + id);
		
		var shapeRadius = shape.radius;
		
		//create the radius label
		var radiusLabel = $('<p>');
		radiusLabel.text('Radius: ');
		radiusLabel.css('display', 'inline');
		circleParametersDiv.append(radiusLabel);
		
		//create the radius input
		var radiusInput = $('<input>');
		radiusInput.attr('id', 'regionRadiusInput_' + id);
		radiusInput.attr('type', 'text');
		radiusInput.css('width', '40px');
		radiusInput.on('input', {thisAnnotatorNode:this, regionId:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var regionId = event.data.regionId;
			thisAnnotatorNode.regionRadiusInputChanged(regionId);
		});
		circleParametersDiv.append(radiusInput);
		if(shapeRadius != null) {
			radiusInput.val(shapeRadius);
		}
		
		div.append(circleParametersDiv);
		
		if(shapeType == 'rectangle') {
			//the shape is a rectangle
			rectangleRadioButton.prop('checked', true);
			
			//hide the circle parameters div
			circleParametersDiv.hide();
		} else if(shapeType == 'circle') {
			//the shape is a circle
			circleRadioButton.prop('checked', true);
			
			//hide the rectangle parameters div
			rectangleParametersDiv.hide();
		}
	}
	
	return regionLI;
};

/**
 * Get the shape field value from a region
 * @param regionId the region id
 * @param fieldName the field name
 * @return the field value
 */
View.prototype.AnnotatorNode.getRegionShapeFieldValue = function(regionId, fieldName) {
	var fieldValue = null;
	
	if(regionId != null && fieldName != null) {
		//get the region
		var region = this.getAutoScoringChildObject('regions', regionId);
		
		if(region != null) {
			//get the shape
			var shape = region.shape;
			
			if(shape != null) {
				//get the field value
				fieldValue = shape[fieldName];
			}
		}
	}
	
	return fieldValue;
};

/**
 * Update the region shape
 * @param regionId the region id
 * @param fieldName the name of the field we are going to update
 * @param fieldValue the value that we will set to the field name
 */
View.prototype.AnnotatorNode.updateRegionShape = function(regionId, fieldName, fieldValue) {
	if(regionId != null && fieldName != null) {
		//get the region
		var region = this.getAutoScoringChildObject('regions', regionId);
		
		if(region != null) {
			//get the shape
			var shape = region.shape;
			
			if(shape != null) {
				//set the value
				shape[fieldName] = fieldValue;
			}
		}
	}
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * The region name has been changed so we will update the step content
 * @param regionId the region id
 */
View.prototype.AnnotatorNode.regionNameChanged = function(regionId) {
	//get the name value
	var name = $('#regionNameInput_' + regionId).val();
	
	//update the step content
	this.updateAutoScoringChildObject('regions', regionId, 'name', name);
};

/**
 * The region shape type has changed so we will update the step content
 * @param regionId the region id
 */
View.prototype.AnnotatorNode.regionShapeTypeChanged = function(regionId) {
	//get the shape type that is checked
	var shapeType = $('input:radio[name="shapeTypeRadioButton_' + regionId + '"]:checked').val();
	
	if(shapeType == 'rectangle') {
		//rectangle is checked
		$('#regionCircleParametersDiv_' + regionId).hide();
		$('#regionRectangleParametersDiv_' + regionId).show();
	} else if(shapeType == 'circle') {
		//circle is checked
		$('#regionRectangleParametersDiv_' + regionId).hide();
		$('#regionCircleParametersDiv_' + regionId).show();
	}
	
	//update the step content
	this.updateRegionShape(regionId, 'type', shapeType);
};

/**
 * A region shape field has changed
 * @param inputDOMId the dom id of the input element
 * @param childId the id of the region object
 * @param childField the field inside the region shape object to update
 */
View.prototype.AnnotatorNode.regionShapeInputChanged = function(inputDOMId, childId, childField) {
	//get the value
	var value = $('#' + inputDOMId).val();
	
	if(isNaN(value)) {
		//the user has not entered a valid number
		alert('Only integers are allowed');
		
		//revert the value back to the previous value from the step content
		var previousValue = this.getRegionShapeFieldValue(childId, childField);
		$('#' + inputDOMId).val(previousValue);
	} else {
		//convert the string to a number
		value = +value;
		
		//check if the value is an integer
		if(value !== parseInt(value)) {
			//value is not an integer
			alert('Only integers are allowed');
			
			//change the value to an integer
			value = parseInt(value);
			
			//update the input value
			$('#' + inputDOMId).val(value);
		}
		
		//update the step content
		this.updateRegionShape(childId, childField, value);
	}
};

/**
 * The region x location has changed
 * @param regionId the region id
 */
View.prototype.AnnotatorNode.regionXInputChanged = function(regionId) {
	var inputDOMId = 'regionXInput_' + regionId;
	var childId = regionId;
	var childField = 'x';
	
	//update the x value in the step content
	this.regionShapeInputChanged(inputDOMId, childId, childField);
};

/**
 * The region y location has changed
 * @param regionId the region id
 */
View.prototype.AnnotatorNode.regionYInputChanged = function(regionId) {
	var inputDOMId = 'regionYInput_' + regionId;
	var childId = regionId;
	var childField = 'y';
	
	//update the y value in the step content
	this.regionShapeInputChanged(inputDOMId, childId, childField);
};

/**
 * The region width has changed
 * @param regionId the region id
 */
View.prototype.AnnotatorNode.regionWidthInputChanged = function(regionId) {
	var inputDOMId = 'regionWidthInput_' + regionId;
	var childId = regionId;
	var childField = 'width';
	
	//update the width value in the step content
	this.regionShapeInputChanged(inputDOMId, childId, childField);
};

/**
 * The region height has changed
 * @param regionId the region id
 */
View.prototype.AnnotatorNode.regionHeightInputChanged = function(regionId) {
	var inputDOMId = 'regionHeightInput_' + regionId;
	var childId = regionId;
	var childField = 'height';
	
	//update the height value in the step content
	this.regionShapeInputChanged(inputDOMId, childId, childField);
};

/**
 * The radius has changed
 * @param regionId the region id
 */
View.prototype.AnnotatorNode.regionRadiusInputChanged = function(regionId) {
	var inputDOMId = 'regionRadiusInput_' + regionId;
	var childId = regionId;
	var childField = 'radius';
	
	//update the radius value in the step content
	this.regionShapeInputChanged(inputDOMId, childId, childField);
};

/**
 * Create the list item for a label
 * @param label the label object from the step content
 */
View.prototype.AnnotatorNode.createLabelLI = function(label) {
	var labelLI = null;
	
	if(label != null) {
		//get the fields in the label
		var id = label.id;
		var type = label.type;
		var value = label.value;
		
		//create the list item
		labelLI = $('<li>');
		labelLI.attr('id', 'labelLI_' + id);
		
		//create the div that will contain the UI elements for this label
		var div = $('<div>');
		div.css('border', '1px solid');
		div.css('padding', '5px 5px');
		labelLI.append(div);
		
		//the p that will display the id
		var idP = $('<p>');
		idP.text('Id: ' + id + ' ');
		idP.css('display', 'inline');
		div.append(idP);
		
		//the delete button to delete this label
		var deleteButton = $('<input>');
		deleteButton.attr('type', 'button');
		deleteButton.val('Delete');
		deleteButton.click({thisAnnotatorNode:this, id:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var id = event.data.id;
			thisAnnotatorNode.deleteLabelClicked(id);
		});
		div.append(deleteButton);
		
		div.append('<br>');
		
		//the value label
		var valueLabel = $('<p>');
		valueLabel.text('Value: ');
		valueLabel.css('display', 'inline');
		div.append(valueLabel);
		
		//the value input
		var valueInput = $('<input>');
		valueInput.attr('id', 'labelValueInput_' + id);
		valueInput.attr('type', 'text');
		valueInput.css('width', '400px');
		valueInput.val(value);
		valueInput.on('input', {thisAnnotatorNode:this, labelId:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var labelId = event.data.labelId;
			thisAnnotatorNode.labelValueChanged(labelId);
		});
		div.append(valueInput);
	}
	
	return labelLI;
};

/**
 * The label value has changed
 * @param labelId the label id
 */
View.prototype.AnnotatorNode.labelValueChanged = function(labelId) {
	//get the label value
	var labelValue = $('#labelValueInput_' + labelId).val();
	
	if(labelValue != null) {
		//update the step content
		this.updateAutoScoringChildObject('labels', labelId, 'value', labelValue);
	}
};

/**
 * Create the list item for a mapping
 * @param mapping the mapping object from the step content
 */
View.prototype.AnnotatorNode.createMappingLI = function(mapping) {
	var mappingLI = null;
	
	if(mapping != null) {
		//get the fields in the mapping
		var id = mapping.id;
		var regionId = mapping.regionId;
		var labelId = mapping.labelId;
		
		//create the list item
		mappingLI = $('<li>');
		mappingLI.attr('id', 'mappingLI_' + id);
		
		//create the div that will contain the UI elements for this mapping
		var div = $('<div>');
		div.css('border', '1px solid');
		div.css('padding', '5px 5px');
		mappingLI.append(div);
		
		//the p that will display the id
		var idP = $('<p>');
		idP.text('Id: ' + id + ' ');
		idP.css('display', 'inline');
		div.append(idP);
		
		//the delete button that will delete this mapping
		var deleteButton = $('<input>');
		deleteButton.attr('type', 'button');
		deleteButton.val('Delete');
		deleteButton.click({thisAnnotatorNode:this, id:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var id = event.data.id;
			thisAnnotatorNode.deleteMappingClicked(id);
		});
		div.append(deleteButton);
		
		div.append('<br>');
		
		//the region id label
		var regionIdLabel = $('<p>');
		regionIdLabel.text('Region Id: ');
		regionIdLabel.css('display', 'inline');
		div.append(regionIdLabel);
		
		//the region id input
		var regionIdInput = $('<input>');
		regionIdInput.attr('id', 'mappingRegionIdInput_' + id);
		regionIdInput.attr('type', 'text');
		regionIdInput.css('width', '30px');
		regionIdInput.val(regionId);
		regionIdInput.on('input', {thisAnnotatorNode:this, mappingId:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var mappingId = event.data.mappingId;
			thisAnnotatorNode.mappingRegionIdInputChanged(mappingId);
		});
		
		div.append(regionIdInput);
		
		div.append('<br>');
		
		//the label id label
		var labelIdLabel = $('<p>');
		labelIdLabel.text('Label Id: ');
		labelIdLabel.css('display', 'inline');
		div.append(labelIdLabel);
		
		//the label id input
		var labelIdInput = $('<input>');
		labelIdInput.attr('id', 'mappingLabelIdInput_' + id);
		labelIdInput.attr('type', 'text');
		labelIdInput.css('width', '30px');
		labelIdInput.val(labelId);
		labelIdInput.on('input', {thisAnnotatorNode:this, mappingId:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var mappingId = event.data.mappingId;
			thisAnnotatorNode.mappingLabelIdInputChanged(mappingId);
		});
		div.append(labelIdInput);
		
		mappingLI.append(div);
	}
	
	return mappingLI;
};

/**
 * The mapping region id has changed
 * @param mappingId the mapping id
 */
View.prototype.AnnotatorNode.mappingRegionIdInputChanged = function(mappingId) {
	var inputDOMId = 'mappingRegionIdInput_' + mappingId;
	var autoScoringFieldName = 'mappings';
	var childId = mappingId;
	var childField = 'regionId';
	
	//update the scoring criteria score in the step content and the UI
	this.autoScoringIntegerInputChanged(inputDOMId, autoScoringFieldName, childId, childField);
};

/**
 * The mapping label id has changed
 * @param mappingId the mapping id
 */
View.prototype.AnnotatorNode.mappingLabelIdInputChanged = function(mappingId) {
	var inputDOMId = 'mappingLabelIdInput_' + mappingId;
	var autoScoringFieldName = 'mappings';
	var childId = mappingId;
	var childField = 'labelId';
	
	//update the scoring criteria score in the step content and the UI
	this.autoScoringIntegerInputChanged(inputDOMId, autoScoringFieldName, childId, childField);
};

/**
 * Create the list item for the scoring criteria
 * @param scoringCriteria a scoringCriteria object from the step content
 */
View.prototype.AnnotatorNode.createScoringCriteriaLI = function(scoringCriteria) {
	var scoringCriteriaLI = null;
	
	if(scoringCriteria != null) {
		//get the fields in the scoringCriteria
		var id = scoringCriteria.id;
		var logic = scoringCriteria.logic;
		var score = scoringCriteria.score;
		var successFeedback = scoringCriteria.successFeedback;
		var failureFeedback = scoringCriteria.failureFeedback;

		//create the list item
		scoringCriteriaLI = $('<li>');
		scoringCriteriaLI.attr('id', 'scoringCriteriaLI_' + id);
		
		//create the div that will contain the UI elements for this scoringCriteria 
		var div = $('<div>');
		div.css('border', '1px solid');
		div.css('padding', '5px 5px');
		scoringCriteriaLI.append(div);
		
		//the p that will display the id
		var idP = $('<p>');
		idP.text('Id: ' + id + ' ');
		idP.css('display', 'inline');
		div.append(idP);

		//the delete button that will delete this scoringCriteria
		var deleteButton = $('<input>');
		deleteButton.attr('type', 'button');
		deleteButton.val('Delete');
		deleteButton.click({thisAnnotatorNode:this, id:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var id = event.data.id;
			thisAnnotatorNode.deleteScoringCriteriaClicked(id);
		});
		div.append(deleteButton);
		
		div.append('<br>');
		
		//the logic label
		var logicLabel = $('<p>');
		logicLabel.text('Logic: ');
		logicLabel.css('display', 'inline');
		div.append(logicLabel);
		
		//the logic input
		var logicInput = $('<input>');
		logicInput.attr('id', 'scoringCriteriaLogicInput_' + id);
		logicInput.attr('type', 'text');
		logicInput.css('width', '300px');
		logicInput.val(logic);
		logicInput.on('input', {thisAnnotatorNode:this, scoringCriteriaId:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var scoringCriteriaId = event.data.scoringCriteriaId;
			thisAnnotatorNode.scoringCriteriaLogicInputChanged(scoringCriteriaId);
		});
		div.append(logicInput);
		
		scoringCriteriaLI.append(div);
		
		div.append('<br>');
		
		//the score label
		var scoreLabel = $('<p>');
		scoreLabel.text('Score: ');
		scoreLabel.css('display', 'inline');
		div.append(scoreLabel);
		
		//the score input
		var scoreInput = $('<input>');
		scoreInput.attr('id', 'scoringCriteriaScoreInput_' + id);
		scoreInput.attr('type', 'text');
		scoreInput.css('width', '35px');
		scoreInput.val(score);
		scoreInput.on('input', {thisAnnotatorNode:this, scoringCriteriaId:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var scoringCriteriaId = event.data.scoringCriteriaId;
			thisAnnotatorNode.scoringCriteriaScoreInputChanged(scoringCriteriaId);
		});
		div.append(scoreInput);
		
		scoringCriteriaLI.append(div);
		
		div.append('<br>');
		
		//the success feedback label
		var successFeedbackLabel = $('<p>');
		successFeedbackLabel.text('Success Feedback: ');
		successFeedbackLabel.css('display', 'inline');
		div.append(successFeedbackLabel);
		
		//the success feedback input
		var successFeedbackInput = $('<input>');
		successFeedbackInput.attr('id', 'scoringCriteriaSuccessFeedbackInput_' + id);
		successFeedbackInput.attr('type', 'text');
		successFeedbackInput.css('width', '500px');
		successFeedbackInput.val(successFeedback);
		successFeedbackInput.on('input', {thisAnnotatorNode:this, scoringCriteriaId:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var scoringCriteriaId = event.data.scoringCriteriaId;
			thisAnnotatorNode.scoringCriteriaSuccessFeedbackInputChanged(scoringCriteriaId);
		});
		div.append(successFeedbackInput);
		
		scoringCriteriaLI.append(div);
		
		div.append('<br>');
		
		//the failure feedback label
		var failureFeedbackLabel = $('<p>');
		failureFeedbackLabel.text('Failure Feedback: ');
		failureFeedbackLabel.css('display', 'inline');
		div.append(failureFeedbackLabel);
		
		//the failure feedback input
		var failureFeedbackInput = $('<input>');
		failureFeedbackInput.attr('id', 'scoringCriteriaFailureFeedbackInput_' + id);
		failureFeedbackInput.attr('type', 'text');
		failureFeedbackInput.css('width', '500px');
		failureFeedbackInput.val(failureFeedback);
		failureFeedbackInput.on('input', {thisAnnotatorNode:this, scoringCriteriaId:id}, function(event) {
			var thisAnnotatorNode = event.data.thisAnnotatorNode;
			var scoringCriteriaId = event.data.scoringCriteriaId;
			thisAnnotatorNode.scoringCriteriaFailureFeedbackInputChanged(scoringCriteriaId);
		});
		div.append(failureFeedbackInput);
		
		scoringCriteriaLI.append(div);
	}
	
	return scoringCriteriaLI;
};

/**
 * The scoring criteria logic has changed
 * @param scoringCriteriaId the scoring criteria id
 */
View.prototype.AnnotatorNode.scoringCriteriaLogicInputChanged = function(scoringCriteriaId) {
	if(scoringCriteriaId != null) {
		//get the logic value
		var logic = $('#scoringCriteriaLogicInput_' + scoringCriteriaId).val();
		
		//update the step content
		this.updateAutoScoringChildObject('scoringCriteria', scoringCriteriaId, 'logic', logic);
	}
};

/**
 * The scoring criteria score has changed
 * @param scoringCriteriaId the scoring criteria id
 */
View.prototype.AnnotatorNode.scoringCriteriaScoreInputChanged = function(scoringCriteriaId) {
	var inputDOMId = 'scoringCriteriaScoreInput_' + scoringCriteriaId;
	var autoScoringFieldName = 'scoringCriteria';
	var childId = scoringCriteriaId;
	var childField = 'score';
	
	//update the scoring criteria score in the step content and the UI
	this.autoScoringIntegerInputChanged(inputDOMId, autoScoringFieldName, childId, childField);
};

/**
 * The scoring criteria success feedback has changed
 * @param scoringCriteriaId the scoring criteria id
 */
View.prototype.AnnotatorNode.scoringCriteriaSuccessFeedbackInputChanged = function(scoringCriteriaId) {
	if(scoringCriteriaId != null) {
		//get the success feedback value
		var successFeedback = $('#scoringCriteriaSuccessFeedbackInput_' + scoringCriteriaId).val();
		
		//update the step content
		this.updateAutoScoringChildObject('scoringCriteria', scoringCriteriaId, 'successFeedback', successFeedback);
	}
};

/**
 * The scoring criteria failure feedback has changed
 * @param scoringCriteriaId the scoring criteria id
 */
View.prototype.AnnotatorNode.scoringCriteriaFailureFeedbackInputChanged = function(scoringCriteriaId) {
	if(scoringCriteriaId != null) {
		//get the failure feedback value
		var failureFeedback = $('#scoringCriteriaFailureFeedbackInput_' + scoringCriteriaId).val();
		
		//update the step content
		this.updateAutoScoringChildObject('scoringCriteria', scoringCriteriaId, 'failureFeedback', failureFeedback);
	}
};

/**
 * The integer input has changed so we will make sure the value is an integer and update the step content
 * @param inputDOMId the dom id of the input element
 * @param autoScoringFieldName the auto scoring field name e.g. 'regions', 'labels', 'mappings', 'scoringCriteria'
 * @param childId the id of the object
 * @param childField the field inside the region, label, mapping, or scoringCriteria object to update
 */
View.prototype.AnnotatorNode.autoScoringIntegerInputChanged = function(inputDOMId, autoScoringFieldName, childId, childField) {
	if(childId != null) {
		//get the input value
		var value = $('#' + inputDOMId).val();
		
		if(isNaN(value)) {
			//the user has not entered a valid number
			alert('Only integers are allowed');
			
			//revert the value back to the previous value from the step content
			var oldValue = this.getAutoScoringChildObjectFieldValue(autoScoringFieldName, childId, childField);
			$('#' + inputDOMId).val(oldValue);
		} else {
			//convert the string to a number
			value = +value;
			
			if(value !== parseInt(value)) {
				//the value is not an integer
				alert('Only integers are allowed');
				
				//change the value to an integer
				value = parseInt(value);
				
				//update the input value
				$('#' + inputDOMId).val(value);
			}
			
			//update the step content
			this.updateAutoScoringChildObject(autoScoringFieldName, childId, childField, value);
		}
	}
};

/**
 * Get the auto scoring child object. This will get the array with the given
 * autoScoringFieldName and then get the element in the array with the given childId.
 * 
 * For example, if we had this as our autoScoring object
 * 
 * "autoScoring":{
 *    "regions":{
 *       {
 *          "id":1,
 *          "name":"house"
 *       },
 *       {
 *          "id":2,
 *          "name":"sky"
 *       }
 *    },
 *    "labels":{
 *       {
 *          "id":1,
 *          "name":"cat"
 *       },
 *       {
 *          "id":2,
 *          "name":"bird"
 *       }
 *    }
 * }
 * 
 * and we wanted to get the region with id 2, we would call
 * getAutoScoringChildObject('regions', 2);
 * which would return
 * 
 * {
 *    "id":2,
 *    "name":"sky"
 * }
 * 
 * @param autoScoringFieldName the auto scoring field name e.g. 'regions', 'labels', 'mappings', 'scoringCriteria'
 * @param childId the id of the object
 * @return the object from the auto scoring array with the given field name and with the given id
 */
View.prototype.AnnotatorNode.getAutoScoringChildObject = function(autoScoringFieldName, childId) {
	var childObject = null;
	
	if(autoScoringFieldName != null && childId != null) {
		//get the autoScoring field value. this will be an array.
		var fieldValue = this.getAutoScoringFieldValue(autoScoringFieldName);
		
		//loop through all the elements
		for(var x=0; x<fieldValue.length; x++) {
			//get an element
			var tempChildObject = fieldValue[x];
			
			if(tempChildObject != null) {
				//get the id of the child object
				var tempChildObjectId = tempChildObject.id;
				
				if(childId == tempChildObjectId) {
					//the id matches the one we want
					childObject = tempChildObject;
					break;
				}
			}
		}
	}
	
	return childObject;
};

/**
 * Update a field in the auto scoring child object
 * @param autoScoringFieldName the auto scoring field name e.g. 'regions', 'labels', 'mappings', 'scoringCriteria'
 * @param childId the id of the object
 * @param fieldName the field name to set the field value into
 * @param fieldValue the field value to save
 */
View.prototype.AnnotatorNode.updateAutoScoringChildObject = function(autoScoringFieldName, childId, fieldName, fieldValue) {
	if(autoScoringFieldName != null && childId != null && fieldName != null) {
		//get the object we want
		var childObject = this.getAutoScoringChildObject(autoScoringFieldName, childId);
		
		if(childObject != null) {
			//update the field name with the field value
			childObject[fieldName] = fieldValue;
		}
	}
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Get the field value of the given auto scoring child object
 * @param autoScoringFieldName the auto scoring field name e.g. 'regions', 'labels', 'mappings', 'scoringCriteria'
 * @param childId the id of the object
 * @param fieldName the field name we want to get the value from
 * @return the field value
 */
View.prototype.AnnotatorNode.getAutoScoringChildObjectFieldValue = function(autoScoringFieldName, childId, fieldName) {
	var fieldValue = null;
	
	if(autoScoringFieldName != null && childId != null && fieldName != null) {
		//get the object we want
		var childObject = this.getAutoScoringChildObject(autoScoringFieldName, childId);
		
		if(childObject != null) {
			//get the field value
			fieldValue = childObject[fieldName];
		}
	}
	
	return fieldValue;
};

/**
 * Create the auto scoring div
 * @return the auto scoring div
 */
View.prototype.AnnotatorNode.createAutoScoringDiv = function() {
	//create the div
	var autoScoringDiv = $('<div>');
	autoScoringDiv.attr('id', 'autoScoringDiv');
	
	//create the check box for displaying the score to the student
	var displayScoreToStudentCheckbox = $('<input>');
	displayScoreToStudentCheckbox.attr('id', 'displayScoreToStudentCheckbox');
	displayScoreToStudentCheckbox.attr('type', 'checkbox');
	displayScoreToStudentCheckbox.click({thisAnnotatorNode:this}, function(event) {
		var thisAnnotatorNode = event.data.thisAnnotatorNode;
		thisAnnotatorNode.displayScoreToStudentCheckboxClicked();
	});
	
	//create the label for displaying the score to the student 
	var displayScoreToStudentLabel = $('<p>');
	displayScoreToStudentLabel.css('display', 'inline');
	displayScoreToStudentLabel.css('font-family', 'Gill Sans,Arial,Verdana,sans-serif');
	displayScoreToStudentLabel.css('font-size', '1em');
	displayScoreToStudentLabel.text('Display Score to Student');
	
	//create the check box for displaying the feedback to the student
	var displayFeedbackToStudentCheckbox = $('<input>');
	displayFeedbackToStudentCheckbox.attr('id', 'displayFeedbackToStudentCheckbox');
	displayFeedbackToStudentCheckbox.attr('type', 'checkbox');
	displayFeedbackToStudentCheckbox.click({thisAnnotatorNode:this}, function(event) {
		var thisAnnotatorNode = event.data.thisAnnotatorNode;
		thisAnnotatorNode.displayFeedbackToStudentCheckboxClicked();
	});
	
	//create the label for displaying the feedback to the student
	var displayFeedbackToStudentLabel = $('<p>');
	displayFeedbackToStudentLabel.css('display', 'inline');
	displayFeedbackToStudentLabel.css('font-family', 'Gill Sans,Arial,Verdana,sans-serif');
	displayFeedbackToStudentLabel.css('font-size', '1em');
	displayFeedbackToStudentLabel.text('Display Feedback Text to Student');
	
	//create the check box for not displaying the feedback on the last check work chance
	var displayNoFeedbackOnLastChanceCheckbox = $('<input>');
	displayNoFeedbackOnLastChanceCheckbox.attr('id', 'displayNoFeedbackOnLastChanceCheckbox');
	displayNoFeedbackOnLastChanceCheckbox.attr('type', 'checkbox');
	displayNoFeedbackOnLastChanceCheckbox.click({thisAnnotatorNode:this}, function(event) {
		var thisAnnotatorNode = event.data.thisAnnotatorNode;
		thisAnnotatorNode.displayNoFeedbackOnLastChanceCheckboxClicked();
	});
	
	//create the label for not displaying the feedback on the last check work chance
	var displayNoFeedbackOnLastChanceLabel = $('<p>');
	displayNoFeedbackOnLastChanceLabel.css('display', 'inline');
	displayNoFeedbackOnLastChanceLabel.css('font-family', 'Gill Sans,Arial,Verdana,sans-serif');
	displayNoFeedbackOnLastChanceLabel.css('font-size', '1em');
	displayNoFeedbackOnLastChanceLabel.text('Do Not Display Feedback to Student on Last Chance');

	//create the label for the check work chances
	var checkWorkChancesLabel = $('<p>');
	checkWorkChancesLabel.css('display', 'inline');
	checkWorkChancesLabel.css('font-family', 'Gill Sans,Arial,Verdana,sans-serif');
	checkWorkChancesLabel.css('font-size', '1em');
	checkWorkChancesLabel.text('Check Work Chances (leave blank for unlimited tries)');
	
	//create the input for the check work chances
	var checkWorkChancesInput = $('<input>');
	checkWorkChancesInput.attr('id', 'checkWorkChancesInput');
	checkWorkChancesInput.attr('type', 'text');
	checkWorkChancesInput.attr('size', 3);
	checkWorkChancesInput.on('input', {thisAnnotatorNode:this}, function(event) {
		var thisAnnotatorNode = event.data.thisAnnotatorNode;
		thisAnnotatorNode.checkWorkChancesInputChanged();
	});
	
	//create the label for the regions
	var regionsLabel = $('<p>');
	regionsLabel.css('display', 'inline');
	regionsLabel.css('font-family', 'Gill Sans,Arial,Verdana,sans-serif');
	regionsLabel.css('font-size', '1em');
	regionsLabel.text('Regions ');
	
	//create the button to add a region
	var addRegionButton = $('<input>');
	addRegionButton.attr('type', 'button');
	addRegionButton.val('Add');
	addRegionButton.click({thisAnnotatorNode:this}, function(event) {
		var thisAnnotatorNode = event.data.thisAnnotatorNode;
		thisAnnotatorNode.addRegionClicked();
	});
	
	//create a list for the regions
	var regionsUL = $('<ul>');
	regionsUL.attr('id', 'regionsUL');
	regionsUL.css('list-style', 'none');
	regionsUL.css('padding', 0);
	regionsUL.css('margin', 0);
	
	//create the label for the labels
	var labelsLabel = $('<p>');
	labelsLabel.css('display', 'inline');
	labelsLabel.css('font-family', 'Gill Sans,Arial,Verdana,sans-serif');
	labelsLabel.css('font-size', '1em');
	labelsLabel.text('Labels ');
	
	//create the button to add a label
	var addLabelButton = $('<input>');
	addLabelButton.attr('type', 'button');
	addLabelButton.val('Add');
	addLabelButton.click({thisAnnotatorNode:this}, function(event) {
		var thisAnnotatorNode = event.data.thisAnnotatorNode;
		thisAnnotatorNode.addLabelClicked();
	});
	
	//create a list for the labels
	var labelsUL = $('<ul>');
	labelsUL.attr('id', 'labelsUL');
	labelsUL.css('list-style', 'none');
	labelsUL.css('padding', 0);
	labelsUL.css('margin', 0);
	
	//create the label for the mappings
	var mappingsLabel = $('<p>');
	mappingsLabel.css('display', 'inline');
	mappingsLabel.css('font-family', 'Gill Sans,Arial,Verdana,sans-serif');
	mappingsLabel.css('font-size', '1em');
	mappingsLabel.text('Mappings ');
	
	//create the button for creating a mapping
	var addMappingButton = $('<input>');
	addMappingButton.attr('type', 'button');
	addMappingButton.val('Add');
	addMappingButton.click({thisAnnotatorNode:this}, function(event) {
		var thisAnnotatorNode = event.data.thisAnnotatorNode;
		thisAnnotatorNode.addMappingClicked();
	});
	
	//create a list for the mappings
	var mappingsUL = $('<ul>');
	mappingsUL.attr('id', 'mappingsUL');
	mappingsUL.css('list-style', 'none');
	mappingsUL.css('padding', 0);
	mappingsUL.css('margin', 0);
	
	//create the label for the scoring criteria
	var scoringCriteriaLabel = $('<p>');
	scoringCriteriaLabel.css('display', 'inline');
	scoringCriteriaLabel.css('font-family', 'Gill Sans,Arial,Verdana,sans-serif');
	scoringCriteriaLabel.css('font-size', '1em');
	scoringCriteriaLabel.text('Scoring Criteria ');
	
	//create the button to create a scoring criteria
	var addScoringCriteriaButton = $('<input>');
	addScoringCriteriaButton.attr('type', 'button');
	addScoringCriteriaButton.val('Add');
	addScoringCriteriaButton.click({thisAnnotatorNode:this}, function(event) {
		var thisAnnotatorNode = event.data.thisAnnotatorNode;
		thisAnnotatorNode.addScoringCriteriaClicked();
	});
	
	//create a list for the scoring criteria
	var scoringCriteriaUL = $('<ul>');
	scoringCriteriaUL.attr('id', 'scoringCriteriaUL');
	scoringCriteriaUL.css('list-style', 'none');
	scoringCriteriaUL.css('padding', 0);
	scoringCriteriaUL.css('margin', 0);
	
	//add all the elements to the auto scoring div
	autoScoringDiv.append(displayScoreToStudentCheckbox);
	autoScoringDiv.append(displayScoreToStudentLabel);
	autoScoringDiv.append('<br>');
	autoScoringDiv.append(displayFeedbackToStudentCheckbox);
	autoScoringDiv.append(displayFeedbackToStudentLabel);
	autoScoringDiv.append('<br>');
	autoScoringDiv.append(displayNoFeedbackOnLastChanceCheckbox);
	autoScoringDiv.append(displayNoFeedbackOnLastChanceLabel);
	autoScoringDiv.append('<br>');
	autoScoringDiv.append(checkWorkChancesLabel);
	autoScoringDiv.append(checkWorkChancesInput);
	autoScoringDiv.append('<br>');
	autoScoringDiv.append(regionsLabel);
	autoScoringDiv.append(addRegionButton);
	autoScoringDiv.append(regionsUL);
	autoScoringDiv.append('<br>');
	autoScoringDiv.append(labelsLabel);
	autoScoringDiv.append(addLabelButton);
	autoScoringDiv.append(labelsUL);
	autoScoringDiv.append('<br>');
	autoScoringDiv.append(mappingsLabel);
	autoScoringDiv.append(addMappingButton);
	autoScoringDiv.append(mappingsUL);
	autoScoringDiv.append('<br>');
	autoScoringDiv.append(scoringCriteriaLabel);
	autoScoringDiv.append(addScoringCriteriaButton);
	autoScoringDiv.append(scoringCriteriaUL);
	
	//hide the div for now, it will be shown later when necessary
	autoScoringDiv.hide();
	
	return autoScoringDiv;
};

/**
 * The add region button was clicked
 */
View.prototype.AnnotatorNode.addRegionClicked = function() {
	//get the next available region id
	var nextId = this.getNextId('regions');
	
	//create a new region
	var newRegion = {
		id:nextId,
		name:'',
		shape:{
			type:'rectangle',
			x:0,
			y:0,
			width:100,
			height:100
		}
	}
	
	//get the regions from the step content
	var regions = this.getAutoScoringField('regions');
	
	//add the new region to the array
	regions.push(newRegion);
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
	
	//create a list item for the new region and add it to the list of regions in the UI
	var newRegionLI = this.createRegionLI(newRegion);
	$('#regionsUL').prepend(newRegionLI);
};

/**
 * The delete region button was clicked
 * @param regionId the region id
 */
View.prototype.AnnotatorNode.deleteRegionClicked = function(regionId) {
	//get the list item dom id
	var listItemDOMId = 'regionLI_' + regionId;
	
	//remove the mapping from the step content and the UI
	this.deleteAutoScoringChildObject('regions', regionId, listItemDOMId);
};

/**
 * The add label button was clicked
 */
View.prototype.AnnotatorNode.addLabelClicked = function() {
	//get the next available label id
	var nextId = this.getNextId('labels');
	
	//create a new label
	var newLabel = {
		id:nextId,
		type:'string',
		value:''
	}
	
	//get the labels from the step content
	var labels = this.getAutoScoringField('labels');
	
	//add the new label to the array
	labels.push(newLabel);
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
	
	//create a list item for the label and add it to the list of labels in the UI
	var newLabelLI = this.createLabelLI(newLabel);
	$('#labelsUL').prepend(newLabelLI);
};

/**
 * The delete label button was clicked
 * @param labelId the label id
 */
View.prototype.AnnotatorNode.deleteLabelClicked = function(labelId) {
	//get the list item dom id
	var listItemDOMId = 'labelLI_' + labelId;
	
	//remove the mapping from the step content and the UI
	this.deleteAutoScoringChildObject('labels', labelId, listItemDOMId);
};

/**
 * The add mapping button was clicked
 */
View.prototype.AnnotatorNode.addMappingClicked = function() {
	//get the next available mapping id
	var nextId = this.getNextId('mappings');
	
	//create a new mapping
	var newMapping = {
		id:nextId,
		regionId:'',
		labelId:''
	}
	
	//get the mappings from the step content
	var mappings = this.getAutoScoringField('mappings');
	
	//add the new mapping to the array
	mappings.push(newMapping);
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
	
	//create a list item for the mapping and add it to the list of mappings in the UI
	var newMappingLI = this.createMappingLI(newMapping);
	$('#mappingsUL').prepend(newMappingLI);
};

/**
 * The delete mapping button was clicked
 */
View.prototype.AnnotatorNode.deleteMappingClicked = function(mappingId) {
	//get the list item dom id
	var listItemDOMId = 'mappingLI_' + mappingId;
	
	//remove the mapping from the step content and the UI
	this.deleteAutoScoringChildObject('mappings', mappingId, listItemDOMId);
};

/**
 * The add scoring criteria button was clicked
 */
View.prototype.AnnotatorNode.addScoringCriteriaClicked = function() {
	//get the next available scoring criteria id
	var nextId = this.getNextId('scoringCriteria');
	
	//create a new scoring criteria
	var newScoringCriteria = {
		id:nextId,
		logic:'',
		score:'',
		successFeedback:'',
		failureFeedback:''
	}
	
	//get the scoring criteria from the step content
	var scoringCriteria = this.getAutoScoringField('scoringCriteria');
	
	//add the new scoring critera to the array
	scoringCriteria.push(newScoringCriteria);
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
	
	//create a list item for the scoring criteria and add it to the list of scoring criteria in the UI
	var newScoringCriteriaLI = this.createScoringCriteriaLI(newScoringCriteria);
	$('#scoringCriteriaUL').prepend(newScoringCriteriaLI);
};

/**
 * The delete scoring criteria button was clicked
 * @param scoringCritieriaId the scoring criteria id
 */
View.prototype.AnnotatorNode.deleteScoringCriteriaClicked = function(scoringCriteriaId) {
	//get the list item dom id
	var listItemDOMId = 'scoringCriteriaLI_' + scoringCriteriaId;
	
	//remove the scoring criteria from the step content and the UI
	this.deleteAutoScoringChildObject('scoringCriteria', scoringCriteriaId, listItemDOMId);
};

/**
 * Delete a child object from one of the auto scoring arrays
 * @param autoScoringFieldName the name of auto scoring array
 * e.g. 'regions', 'labels', 'mappings', 'scoringCriteria'
 * @param childId the id of the element in the array
 * @param listItemDOMId the id of the list item in the DOM
 */
View.prototype.AnnotatorNode.deleteAutoScoringChildObject = function(autoScoringFieldName, childId, listItemDOMId) {
	//get the field from the step content
	var field = this.getAutoScoringField(autoScoringFieldName);
	
	//loop through all the elements in the field
	for(var x=0; x<field.length; x++) {
		//get an element
		var tempElement = field[x];
		
		if(tempElement != null) {
			//get the element id
			var tempElementId = tempElement.id;
			
			if(childId == tempElementId) {
				//the element id matches the one we want so we will remove it
				field.splice(x, 1);
				
				/*
				 * set the counter back one so that we check every element in the array.
				 * theoretically this is unnecessary since only one label can have
				 * the given id.
				 */
				x--;
			}
		}
	}
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
	
	//remove the scoring criteria from the list of scoring criteria in the UI 
	$('#' + listItemDOMId).remove();
};

/**
 * Get the next available id. This will find the current max id and then
 * increment it by one to give us the next available id.
 * 
 * For example if we have
 * 
 * "autoScoring":{
 *    "regions":{
 *       {
 *          "id":1,
 *          "name":"house"
 *       },
 *       {
 *          "id":3,
 *          "name":"sky"
 *       }
 *    },
 *    "labels":{
 *       {
 *          "id":1,
 *          "name":"cat"
 *       },
 *       {
 *          "id":2,
 *          "name":"bird"
 *       }
 *    }
 * }
 * 
 * and we want the next available "regions" id, we would call
 * getNextId("regions")
 * and it would return
 * 4
 * 
 * @param fieldName the name of the object in the autoScoring object
 * e.g. 'regions', 'labels', 'mappings', 'scoringCriteria'
 * @return the next available id for the given field name
 */
View.prototype.AnnotatorNode.getNextId = function(fieldName) {
	var nextId = null;
	var maxId = 0;
	var fieldValue = this.getAutoScoringFieldValue(fieldName);
	
	if(fieldValue != null) {
		//check that the value is an array
		if($.isArray(fieldValue)) {
			//loop through all the elements in the array
			for(var x=0; x<fieldValue.length; x++) {
				//get an element
				var arrayElement = fieldValue[x];
				
				if(arrayElement != null) {
					//get the id of the element
					var tempId = arrayElement.id;
					
					if(tempId > maxId) {
						//remember the largest id we have found
						maxId = tempId;
					}
				}
			}
		}
	}
	
	if(maxId != null) {
		//the next id will be the next number after the current max
		nextId = maxId + 1;
	}
	
	return nextId;
};

/**
 * Called when the display score to student checkbox is clicked
 */
View.prototype.AnnotatorNode.displayScoreToStudentCheckboxClicked = function() {
	//get the value and update the step content
	var value = $('#displayScoreToStudentCheckbox').is(':checked');
	this.setAutoScoringFieldValue('autoScoringDisplayScoreToStudent', value);
};

/**
 * Called when the display feedback to student checkbox is clicked
 */
View.prototype.AnnotatorNode.displayFeedbackToStudentCheckboxClicked = function() {
	//get the value and update the step content
	var value = $('#displayFeedbackToStudentCheckbox').is(':checked');
	this.setAutoScoringFieldValue('autoScoringDisplayFeedbackToStudent', value);
};

/**
 * Called when the no feedback on last check work chance checkbox is clicked
 */
View.prototype.AnnotatorNode.displayNoFeedbackOnLastChanceCheckboxClicked = function() {
	//get the value and update the step content
	var value = $('#displayNoFeedbackOnLastChanceCheckbox').is(':checked');
	this.setAutoScoringFieldValue('autoScoringDoNotDisplayFeedbackToStudentOnLastChance', value);
};

/**
 * Called when the check work chances input is changed
 */
View.prototype.AnnotatorNode.checkWorkChancesInputChanged = function() {
	//get the value and update the step content
	var value = $('#checkWorkChancesInput').val();
	this.setAutoScoringFieldValue('autoScoringCheckWorkChances', value);
};

/**
 * Called when the enable auto scoring checkbox is clicked
 */
View.prototype.AnnotatorNode.enableAutoScoringCheckboxClicked = function() {
	//get the value
	var isChecked = $('#enableAutoScoringCheckbox').is(':checked');
	
	if(isChecked) {
		//update the step content and show the auto scoring div
		this.enableAutoScoring(true);
		$('#autoScoringDiv').show();
	} else {
		//update the step content and hide the auto scoring div
		this.enableAutoScoring(false);
		$('#autoScoringDiv').hide();
	}
};

/**
 * Update the enableAutoScoring value in the step content
 * @param enable whether to enable auto scoring
 */
View.prototype.AnnotatorNode.enableAutoScoring = function(enable) {
	var content = this.content;
	
	if(content != null) {
		if(enable) {
			//auto scoring is enabled
			
			//update the step content
			content.enableAutoScoring = true;
			
			//create the autoScoring object in the content if necessary
			this.initializeAutoScoringContentIfNecessary();
			
			//set the auto graded export columns into the step content
			this.setAutoGradedExportColumns();
		} else {
			//auto scoring is disabled
			
			//update the step content
			content.enableAutoScoring = false;
			
			//set the regular export columns into the step content
			this.setExportColumns();
		}		
	}
	
	//fire source updated event, which will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Create the autoScoring object in the step content if it does not exist
 */
View.prototype.AnnotatorNode.initializeAutoScoringContentIfNecessary = function() {
	//get the step content
	var content = this.content;
	
	if(content != null) {
		//get the autoScoring object
		var autoScoring = content.autoScoring;
		
		if(autoScoring == null) {
			//the autoScoring object does not exist so we will create it
			autoScoring = {
				autoScoringCheckWorkChances:'',
				autoScoringDisplayScoreToStudent:true,
				autoScoringDisplayFeedbackToStudent:true,
				autoScoringDoNotDisplayFeedbackToStudentOnLastChance:false,
				regions:[],
				labels:[],
				mappings:[],
				scoringCriteria:[]
			};
			content.autoScoring = autoScoring;
		}
	}
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 */
View.prototype.AnnotatorNode.getCommonComponents = function() {
	return this.commonComponents;
};

/**
 * Update whether to require student work on step before moving on
 */
View.prototype.AnnotatorNode.updateWorkRequired = function() {
	// update the content
	this.content.isMustComplete = $('#requireWorkToggle').prop('checked');
	
	// fire source updated event, which will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the background image url to match that of what the user input
 */
View.prototype.AnnotatorNode.updateBackgroundImageUrl = function(){
	// update the content
	this.content.backgroundImg = document.getElementById('backgroundImageUrl').value;
	
	// fire source updated event, which will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Open asset editor dialog and allows user to choose the image to use for the background
 */
View.prototype.AnnotatorNode.browseImageAssets = function() {
	var callback = function(field_name, url, type, win){
		url = 'assets/' + url;
		document.getElementById(field_name).value = url;
		
		//fire background url changed event
		this.eventManager.fire('annotatorUpdateBackgroundImageUrl');
	};
	var params = {};
	params.field_name = 'backgroundImageUrl';
	params.type = 'image';
	params.win = null;
	params.callback = callback;
	eventManager.fire('viewAssets',params);
};

/**
 * Generates the color selector options
 */
View.prototype.AnnotatorNode.generateColorOptions = function(){
	view = this.view;
	
	// create the label for the default color drop-down select
	var colorLabel = document.createTextNode(view.getI18NString('annotator_authoring_defaultColor_label','SVGDrawNode'));
	// create the default color drop-down select
	var colorSelect = createElement(document, 'select', {id: 'colorDefault', onchange:'eventManager.fire("annotatorUpdateDefaultColor")'});
	// create the options for default color drop-down select
	var options = '<option value="000000">' + view.getI18NString('annotator_colors_black','SVGDrawNode') + ' </option>\
			<option value="0000FF">' + view.getI18NString('annotator_colors_blue','SVGDrawNode') + ' </option>\
			<option value="008000">' + view.getI18NString('annotator_colors_green','SVGDrawNode') + ' </option>\
			<option value="800000">' + view.getI18NString('annotator_colors_maroon','SVGDrawNode') + ' </option>\
			<option value="000080">' + view.getI18NString('annotator_colors_navy','SVGDrawNode') + ' </option>\
			<option value="FF8C00">' + view.getI18NString('annotator_colors_orange','SVGDrawNode') + ' </option>\
			<option value="800080">' + view.getI18NString('annotator_colors_purple','SVGDrawNode') + ' </option>\
			<option value="FF0000">' + view.getI18NString('annotator_colors_red','SVGDrawNode') + ' </option>\
			<option value="008080">' + view.getI18NString('annotator_colors_teal','SVGDrawNode') + ' </option>\
			<option value="FFFF00">' + view.getI18NString('annotator_colors_yellow','SVGDrawNode') + ' </option>';
	
	$(colorSelect).append(options).val(this.content.colorDefault ? this.content.colorDefault : 'FF0000');
	$(colorDiv).append(colorLabel).append(colorSelect);
};

/**
 * Updates the default label color in the content to the user specified value and
 * refreshes the preview.
 */
View.prototype.AnnotatorNode.updateDefaultColor = function(){
	this.content.colorDefault = $('#colorDefault').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

View.prototype.AnnotatorNode.populatePrompt = function() {
	$('#promptInput').val(this.content.prompt);
};

/**
 * Updates the prompt value of the content to the user specified value and 
 * refreshes the preview.
 */
View.prototype.AnnotatorNode.updatePrompt = function(){
	/* update content */
	var content = this.view.getRichTextContent('promptInput');
	
	this.content.prompt = content;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the maximum labels value of the content to the user specified value and 
 * refreshes the preview.
 */
View.prototype.AnnotatorNode.updateMaxLabels = function(){
	this.content.labels_max = $('#maxLabels').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the minimum labels value of the content to the user specified value and 
 * refreshes the preview.
 */
View.prototype.AnnotatorNode.updateMinLabels = function(){
	this.content.labels_min = $('#minLabels').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the enable student text area value of the content to the user specified value and 
 * refreshes the preview.
 */
View.prototype.AnnotatorNode.updateEnableStudentTextArea = function(){
	var enabled = $('#enableStudentTextArea').prop('checked');
	this.content.enableStudentTextArea = enabled;
	
	if(enabled){
		$('#textAreaInstructionsDiv').show();
	} else {
		$('#textAreaInstructionsDiv').hide();
	}
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the student text area instructions value of the content to the user specified value and 
 * refreshes the preview.
 */
View.prototype.AnnotatorNode.updateTextAreaInstructions = function(){
	this.content.textAreaInstructions = $('#textAreaInstructions').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the student response button text in the content to the user specified value and
 * refreshes the preview.
 */
View.prototype.AnnotatorNode.updateStudentResponseButton = function(){
	this.content.textAreaButtonText = $('#textAreaButtonText').val();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Generate the drop down to select the auto scoring criteria
 */
View.prototype.AnnotatorNode.generateAutoScoringOptions = function() {
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
View.prototype.AnnotatorNode.generateAutoScoringFeedbackAuthoringDiv = function() {
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
	
	var annotatorScorer = new AnnotatorAutoScore();
	
	/*if(autoScoringCriteria == 'methane') {
		//get the possible scores for methane
		possibleScores = annotatorScorer.getPossibleMethaneScoreKeys();
	} else if(autoScoringCriteria == 'ethane') {
		//get the possible scores for ethane
		possibleScores = annotatorScorer.getPossibleEthaneScoreKeys();
	}*/
	
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
			var feedbackTextArea = createElement(document, 'textarea', {id: 'autoScoringFeedback_' + x, cols: '60', rows: '4', wrap: 'soft', onchange: 'eventManager.fire("annotatorUpdateAutoScoringFeedback", ' + x + ')'});
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
 * The author has changed the auto scoring criteria so we will save it
 * in the content
 */
View.prototype.AnnotatorNode.updateAutoScoringCriteria = function() {
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
View.prototype.AnnotatorNode.showAutoScoringFeedbackAuthoring = function() {
	$('#autoScoringFeedbackAuthoringDiv').show();
};

/**
 * Hide the auto scoring feedback div
 */
View.prototype.AnnotatorNode.hideAutoScoringFeedbackAuthoring = function() {
	$('#autoScoringFeedbackAuthoringDiv').hide();
};

/**
 * The author has changed the text for one of the feedback textareas
 * @param index this score has had its feedback changed
 */
View.prototype.AnnotatorNode.updateAutoScoringFeedback = function(index) {
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
View.prototype.AnnotatorNode.updateAutoScoringDisplayScoreToStudent = function() {
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
View.prototype.AnnotatorNode.updateAutoScoringDisplayFeedbackToStudent = function() {
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
View.prototype.AnnotatorNode.updateAutoScoringCheckWorkChances = function() {
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
View.prototype.AnnotatorNode.updateDoNotDisplayFeedbackToStudentOnLastChance = function() {
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
View.prototype.AnnotatorNode.getAutoScoringFeedback = function() {
	//populate the autoScoring object in the content if it does not exist
	this.createAutoScoringObjectIfDoesNotExist();
	
	return this.content.autoScoring.autoScoringFeedback;
};

/**
 * Set the auto scoring field in the autoScoring object in the content
 * @param key the field
 * @param value the value
 */
View.prototype.AnnotatorNode.setAutoScoringField = function(key, value) {
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
View.prototype.AnnotatorNode.getAutoScoringField = function(key) {
	//populate the autoScoring object in the content if it does not exist
	this.createAutoScoringObjectIfDoesNotExist();
	
	//get the value
	var value = this.content.autoScoring[key];
	
	return value;
};

/**
 * Populate the autoScoring object in the content if it does not exist
 */
View.prototype.AnnotatorNode.createAutoScoringObjectIfDoesNotExist = function() {
	if(this.content.autoScoring == null) {
		this.content.autoScoring = {
			autoScoringCheckWorkChances:'',
			autoScoringDisplayScoreToStudent:true,
			autoScoringDisplayFeedbackToStudent:true,
			autoScoringDoNotDisplayFeedbackToStudentOnLastChance:false,
			regions:[],
			labels:[],
			mappings:[],
			scoringCriteria:[]
		};
	}
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 */
View.prototype.AnnotatorNode.updateContent = function(){
	/* update content object */
	this.view.activeContent.setContent(this.content);
};

/**
 * Update the submit confirmation message field in the step content
 */
View.prototype.AnnotatorNode.updateAutoScoringSubmitConfirmationMessageChanged = function(){
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
View.prototype.AnnotatorNode.clearExportColumns = function() {
	this.content.exportColumns = null;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Set the export column for regular draw steps
 */
View.prototype.AnnotatorNode.setRegularExportColumns = function() {
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
 * Set the export columns
 */
View.prototype.AnnotatorNode.setExportColumns = function() {
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
View.prototype.AnnotatorNode.setAutoGradedExportColumns = function() {
	this.content.exportColumns = [
          {
        	  "columnName": "Data",
        	  "field": "data"
          },
          {
        	  "columnName": "Score",
        	  "field": "autoScore"
          },
          {
        	  "columnName": "Max Score",
        	  "field": "maxAutoScore"
          },
          {
        	  "columnName": "Feedback",
        	  "field": "autoFeedback"
          },
          {
        	  "columnName": "Submit",
        	  "field": "checkWork"
          },
          {
              "columnName": "Scoring Criteria Results",
              "field": "scoringCriteriaResults"
          }
  	];
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/draw/authorview_annotator.js');
};