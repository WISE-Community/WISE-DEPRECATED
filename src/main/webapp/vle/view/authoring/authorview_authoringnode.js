/**
 * The parent node for authoring nodes. This will contain common functions that are
 * shared among all the authoring nodes.
 */
function AuthoringNode() {
	
}

/**
 * Add the authoring for filtering ideas
 * @param pageDiv the authoring page div
 */
AuthoringNode.prototype.addFilterIdeasAuthoring = function(pageDiv) {
	//create the label for the filter ideas checkbox
	var filterIdeasLabel = $(document.createTextNode("Filter Ideas: "));
	
	//create the filter ideas checkbox
	var filterIdeasCheckBox = $('<input>');
	filterIdeasCheckBox.attr('id', 'filterIdeasCheckBox');
	filterIdeasCheckBox.attr('type', 'checkbox');
	filterIdeasCheckBox.click({thisContext:this}, this.filterIdeasCheckBoxClicked);
	
	//create the div that will contain the select option boxes to choose which steps to filter
	var filterIdeasDiv = $('<div>');
	filterIdeasDiv.attr('id','filterIdeasDiv');
	filterIdeasDiv.attr('display', 'none');
	
	//create a table to hold the select option boxes and buttons for filtering steps
	var filterIdeasTable = $('<table>');
	var filterIdeasTR = $('<tr>');
	
	//get all the step node ids in the project
	var nodeIdsInProject = this.view.getProject().getNodeIds();
	
	if(this.content.nodeIdsToFilter == null) {
		this.content.nodeIdsToFilter = [];
	}
	
	//get all the node ids to filter on
	var nodeIdsToFilter = this.content.nodeIdsToFilter;

	//get all the node ids that are not in the nodeIdsToFilter on
	var projectSteps = this.removeElementsFromArray(nodeIdsInProject, nodeIdsToFilter);
	
	//create the TD that will contain the project steps
	var filterIdeasProjectStepsTD = $('<td>');
	filterIdeasProjectStepsTD.css('width', '200px');
	
	//create the project steps select box
	var filterIdeasProjectSteps = $('<select>');
	filterIdeasProjectSteps.attr('id', 'filteredIdeasProjectStepsSelect');
	filterIdeasProjectSteps.attr('size', 15);
	filterIdeasProjectSteps.attr('multiple', true);
	filterIdeasProjectSteps.css('width', '200px');
	
	//fill the project steps select box
	for(var x=0; x<projectSteps.length; x++) {
		//get the node id
		var projectStepNodeId = projectSteps[x];
		
		//get the step number and title
		var projectStepNodeTitle = this.view.getProject().getStepNumberAndTitle(projectStepNodeId);
		
		//create the option
		var tempOption = $('<option>');
		tempOption.attr('value', projectStepNodeId);
		tempOption.text(projectStepNodeTitle)
		
		//add the option to the project steps select box
		filterIdeasProjectSteps.append(tempOption);
	}
	
	//add the project steps label and select box
	filterIdeasProjectStepsTD.append('Project Steps');
	filterIdeasProjectStepsTD.append(filterIdeasProjectSteps);
	
	//create the TD that will contain the add step and remove step button
	var filterIdeasButtonsTD = $('<td>');
	filterIdeasButtonsTD.css('text-align', 'center');
	filterIdeasButtonsTD.css('vertical-align', 'middle');
	
	//create the add step button
	var addFilteredStepButton = $('<input>');
	addFilteredStepButton.attr('type', 'button');
	addFilteredStepButton.val('Add Step =>');
	addFilteredStepButton.click({thisContext:this}, this.addFilteredStepButtonClicked);
	
	//create the remove step button
	var removeFilteredStepButton = $('<input>');
	removeFilteredStepButton.attr('type', 'button');
	removeFilteredStepButton.val('<= Remove Step');
	removeFilteredStepButton.click({thisContext:this}, this.removeFilteredStepButtonClicked);
	
	//add the buttons to the TD
	filterIdeasButtonsTD.append(addFilteredStepButton);
	filterIdeasButtonsTD.append('<br>');
	filterIdeasButtonsTD.append('<br>');
	filterIdeasButtonsTD.append('<br>');
	filterIdeasButtonsTD.append(removeFilteredStepButton);
	
	//create the TD that will contain the filtered steps select box
	var filterIdeasFilteredStepsTD = $('<td>');
	filterIdeasFilteredStepsTD.css('width', '200px');
	
	//create the filtered steps select box
	var filterIdeasFilteredSteps = $('<select>');
	filterIdeasFilteredSteps.attr('size', 15);
	filterIdeasFilteredSteps.attr('id', 'filteredIdeasFilteredStepsSelect');
	filterIdeasFilteredSteps.attr('multiple', true);
	filterIdeasFilteredSteps.css('width', '200px');
	
	//fill the filtered steps select box
	for(var y=0; y<nodeIdsToFilter.length; y++) {
		//get the node id
		var filteredStepNodeId = nodeIdsToFilter[y];
		
		//get the step number and title
		var filteredStepNodeTitle = this.view.getProject().getStepNumberAndTitle(filteredStepNodeId);
		
		//create the option
		var tempOption = $('<option>');
		tempOption.attr('value', filteredStepNodeId);
		tempOption.text(filteredStepNodeTitle)
		
		//add the option to the filtered steps select box
		filterIdeasFilteredSteps.append(tempOption);
	}
	
	//add the filtered steps label and select box
	filterIdeasFilteredStepsTD.append('Filtered Steps');
	filterIdeasFilteredStepsTD.append(filterIdeasFilteredSteps);
	
	//add the TDs to the div
	filterIdeasDiv.append(filterIdeasProjectStepsTD);
	filterIdeasDiv.append(filterIdeasButtonsTD);
	filterIdeasDiv.append(filterIdeasFilteredStepsTD);
	
	//add line breaks for spacing
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	
	//add the label, checkbox, and div
	$(pageDiv).append(filterIdeasLabel);
	$(pageDiv).append(filterIdeasCheckBox);
	$(pageDiv).append(filterIdeasDiv);
	
	if(this.content.filterIdeasByNodeIds == null) {
		this.content.filterIdeasByNodeIds = false;
	}
	
	//populate the values from the content
	if(this.content.filterIdeasByNodeIds) {
		//we are filtering ideas so we will check the box and display the div
		filterIdeasCheckBox.attr('checked', true);
		filterIdeasDiv.show();
	} else {
		//we are not filtering ideas so we will hide the div
		filterIdeasDiv.hide();
	}
};

/**
 * Called when the Add Step button is clicked
 * @param event the fired event jquery object
 */
AuthoringNode.prototype.addFilteredStepButtonClicked = function(event) {
	var thisContext = event.data.thisContext;
	thisContext.addFilteredStepButtonClickedHandler();
};

/**
 * Handles the logic for when the Add Step button is clicked
 */
AuthoringNode.prototype.addFilteredStepButtonClickedHandler = function() {
	//get all the selected options in the project steps select box
	var selectedOptions = $('#filteredIdeasProjectStepsSelect option:selected');
	
	var selectedNodeIds = [];

	//accumulate all the node ids that were selected
	for(var x=0; x<selectedOptions.length; x++) {
		//get an option
		var selectedOption = selectedOptions[x];
		
		//get the value which will be the node id
		var selectedOptionValue = $(selectedOption).val();
		
		//add the node id to the array
		selectedNodeIds.push(selectedOptionValue);
	}
	
	//add the filtered steps to the content and update the select boxes
	this.addFilteredSteps(selectedNodeIds);
};

/**
 * Add the filtered steps to the content and update the select boxes
 * @param nodeIds the node ids to add to the nodeIdsToFilter array
 */
AuthoringNode.prototype.addFilteredSteps = function(nodeIds) {
	if(nodeIds != null) {
		if(this.content.nodeIdsToFilter == null) {
			this.content.nodeIdsToFilter = [];
		}
		
		//get the existing nodeIdsToFilter array
		var nodeIdsToFilter = this.content.nodeIdsToFilter;
		
		//loop through all the node ids that we will be adding
		for(var x=0; x<nodeIds.length; x++) {
			//get a node id
			var nodeId = nodeIds[x];
			
			//check if the node id is already in the nodeIdsToFilter array
			if(nodeIdsToFilter.indexOf(nodeId) == -1) {
				//the node id is not in the array so we will add it
				nodeIdsToFilter.push(nodeId);
			}
		}
		
		//update the select boxes
		this.updateFilterStepsSelectBoxes();
		
		/*
		 * fire source updated event, this will update the preview
		 */
		this.view.eventManager.fire('sourceUpdated');
	}
};

/**
 * Called when the Remove Step button is clicked
 * @param event the fired event jquery object
 */
AuthoringNode.prototype.removeFilteredStepButtonClicked = function(event) {
	var thisContext = event.data.thisContext;
	thisContext.removeFilteredStepButtonClickedHandler();
};

/**
 * Handles the logic for when the Remove Step button is clicked
 */
AuthoringNode.prototype.removeFilteredStepButtonClickedHandler = function() {
	//get the selected options in the filtered steps select box
	var selectedOptions = $('#filteredIdeasFilteredStepsSelect option:selected');
	
	var selectedNodeIds = [];

	//accumulate all the node ids that were selected
	for(var x=0; x<selectedOptions.length; x++) {
		//get an option
		var selectedOption = selectedOptions[x];
		
		//get the value which will be the node id
		var selectedOptionValue = $(selectedOption).val();

		//add the node id to the array
		selectedNodeIds.push(selectedOptionValue);
	}
	
	//remove the filtered steps from the content and update the select boxes
	this.removeFilteredSteps(selectedNodeIds);
};

/**
 * Remove the filtered steps from the content and update the select boxes
 * @param nodeIds the node ids to remove from the nodeIdsToFilter array
 */
AuthoringNode.prototype.removeFilteredSteps = function(nodeIds) {
	if(nodeIds != null) {
		if(this.content.nodeIdsToFilter == null) {
			this.content.nodeIdsToFilter = [];
		}
		
		//get the nodeIdsToFilter array from the content
		var nodeIdsToFilter = this.content.nodeIdsToFilter;
		
		//loop through all the values in the array in the content
		for(var x=0; x<nodeIdsToFilter.length; x++) {
			//get a node id from the array in the content
			var tempNodeId = nodeIdsToFilter[x];
			
			//check if the node id is in the array of node ids to remove
			if(nodeIds.indexOf(tempNodeId) != -1) {
				/*
				 * the node is in the array of node ids to remove so we will
				 * remove it from the array in the content
				 */
				nodeIdsToFilter.splice(x, 1);
				
				/*
				 * move the counter back one since we have just removed an element
				 * and we don't want to skip over the new element that was just
				 * moved into the current x position
				 */
				x--;
			}
		}
		
		//update the select boxes
		this.updateFilterStepsSelectBoxes();
		
		/*
		 * fire source updated event, this will update the preview
		 */
		this.view.eventManager.fire('sourceUpdated');
	}
};

/**
 * Update the project steps and filtered steps select boxes
 */
AuthoringNode.prototype.updateFilterStepsSelectBoxes = function() {
	this.updateProjectStepsSelect();
	this.updateFilteredStepsSelect();
};

/**
 * Update the project steps select box
 */
AuthoringNode.prototype.updateProjectStepsSelect = function() {
	if(this.content.nodeIdsToFilter == null) {
		this.content.nodeIdsToFilter = [];
	}
	
	//get all the step node ids in the project
	var nodeIdsInProject = this.view.getProject().getNodeIds();
	
	//get all the filtered steps
	var nodeIdsToFilter = this.content.nodeIdsToFilter;
	
	//get all the project steps with the filtered steps removed
	var projectSteps = this.removeElementsFromArray(nodeIdsInProject, nodeIdsToFilter);
	
	//clear the project steps select box because we will re-populate it now
	$('#filteredIdeasProjectStepsSelect').html('');
	
	//loop through all the project steps that are not filtered
	for(var x=0; x<projectSteps.length; x++) {
		//get the node id
		var projectStepNodeId = projectSteps[x];
		
		//get the step number and title
		var projectStepNodeTitle = this.view.getProject().getStepNumberAndTitle(projectStepNodeId);
		
		//create the option
		var tempOption = $('<option>');
		tempOption.attr('value', projectStepNodeId);
		tempOption.text(projectStepNodeTitle)
		
		//add the option to the project steps select box
		$('#filteredIdeasProjectStepsSelect').append(tempOption);
	}
	
};

/**
 * Update the filtered steps select box
 */
AuthoringNode.prototype.updateFilteredStepsSelect = function() {
	if(this.content.nodeIdsToFilter == null) {
		this.content.nodeIdsToFilter = [];
	}
	
	//get the filtered steps
	var nodeIdsToFilter = this.content.nodeIdsToFilter;
	
	//clear the filtered steps select box because we will re-populte it now
	$('#filteredIdeasFilteredStepsSelect').html('');
	
	//loop through all the filtered steps
	for(var x=0; x<nodeIdsToFilter.length; x++) {
		//get the node id
		var filteredStepNodeId = nodeIdsToFilter[x];
		
		//get the step number and title
		var filteredStepNodeTitle = this.view.getProject().getStepNumberAndTitle(filteredStepNodeId);
		
		//create the option
		var tempOption = $('<option>');
		tempOption.attr('value', filteredStepNodeId);
		tempOption.text(filteredStepNodeTitle)
		
		//add the option to the filtered steps select box
		$('#filteredIdeasFilteredStepsSelect').append(tempOption);
	}
};

/**
 * Remove elements from an array
 * @param arrayToRemoveFrom an array containing elements that we will remove elements from
 * @param elementsToRemove an array containing the elements we want to remove
 * @return an array with all the elements in elementsToRemove removed
 */
AuthoringNode.prototype.removeElementsFromArray = function(arrayToRemoveFrom, elementsToRemove) {
	var resultArray = [];
	
	if(arrayToRemoveFrom != null && elementsToRemove != null) {
		
		//loop through all the elements in the array to remove from
		for(var x=0; x<arrayToRemoveFrom.length; x++) {
			//get an element
			var tempElement = arrayToRemoveFrom[x];
			
			/*
			 * check if the element is an element we want to remove
			 * by seeing if the element is in the elementsToRemove array
			 */
			if(elementsToRemove.indexOf(tempElement) == -1) {
				/*
				 * the element is not in the elementsToRemove array so
				 * we will keep it
				 */ 
				resultArray.push(tempElement);
			}
		}
	}
	
	return resultArray;
};


/**
 * Called when the filter ideas checkbox is clicked
 */
AuthoringNode.prototype.filterIdeasCheckBoxClicked = function(event) {
	var thisContext = event.data.thisContext;
	thisContext.filterIdeasCheckBoxClickedHandler();
};

/**
 * Handles the logic for when the filter ideas checkbox is clicked
 */
AuthoringNode.prototype.filterIdeasCheckBoxClickedHandler = function() {
	//get whether the checkbox is clicked or not
	var isChecked = this.isChecked($('#filterIdeasCheckBox').attr('checked'));
	
	//set the value into the content
	this.content.filterIdeasByNodeIds = isChecked;
	
	if(isChecked) {
		//the checkbox is checked so we will show the filter ideas div
		$('#filterIdeasDiv').show();
	} else {
		//the checkbox is not checked so we will not show the filter ideas div
		$('#filterIdeasDiv').hide();
	}
	
	/*
	 * fire source updated event, this will update the preview
	 */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Determine if the value is checked or not
 * @param the string 'checked' or the value null
 * @return true if the value is 'checked'
 */
AuthoringNode.prototype.isChecked = function(value) {
	var checked = false;
	
	//check if the value is the string 'checked' or boolean value true
	if(value == 'checked' || value == true) {
		checked = true;
	} else {
		checked = false;
	}
	
	return checked;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/authorview_authoringnode.js');
}