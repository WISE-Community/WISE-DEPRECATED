
/**
 * Generate the html for the icons view, insert the html into
 * the icons view dialog popup and then open the dialog popup
 */
View.prototype.displayIconsView = function() {
	
	//populate the html for the icons view
	this.populateIconsView();

	//display the dialog
	$('#iconsViewDialog').dialog('open');
};

/**
 * Populate the icons view
 * @return the container div that contains the UI elements to author icons
 */
View.prototype.populateIconsView = function() {
	
	//get the project
	var project = this.getProject();
	
	//get the start node
	var startNode = project.getRootNode();
	
	//get the div that we will populate
	var containerDiv = $('#iconsView');
	
	//clear the existing html in the div
	containerDiv.html('');
	
	//loop through all the nodes and append the UI elements for each node
	this.populateIconsViewHelper(startNode, containerDiv);
	
	return containerDiv;
};

/**
 * A recursive function that navigates through all the nodes in the project
 * and appends UI elements to author icons
 * @param currentNode the current node we are on
 * @param containerDiv the container div to add the UI elements to
 */
View.prototype.populateIconsViewHelper = function(currentNode, containerDiv) {
	
	//get the node id
	var nodeId = currentNode.id;
	
	//get the root node id
	var rootNode = this.getProject().getRootNode();
	var rootNodeId = rootNode.id;
	
	if(rootNodeId != nodeId) {
		//we only need to display the nodes that are not the root node
		
		//get the icons for this node
		var icons = currentNode.icons;
		
		//get the step number and title
		var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId);
		
		//get the step type
		var nodeType = currentNode.type;

		//create a row
		var row = $("<tr><td></td></tr>");
		
		//create a table for the node
		var nodeTable = $('<table></table>');
		nodeTable.attr('id', 'iconsTable_' + nodeId);
		nodeTable.attr('border', 1);
		nodeTable.attr('width', '100%');
		
		//add the table to the container
		containerDiv.append(nodeTable);
		
		//add a black divider to separate the steps
		var hr = $('<hr/>');
		hr.css('height', '5px');
		hr.css('background-color', 'black');
		containerDiv.append(hr);
		
		var stepTableRow = null;
		
		if(currentNode.type == 'sequence') {
			//create the row to display the step number, step title, and step type
			stepTableRow = $("<tr><td width='70%'><b>Activity " + stepNumberAndTitle + "</b></td></tr>");
			
			//add the row to the table for the node
			nodeTable.append(stepTableRow);
		} else {
			stepTableRow = $('<tr></tr>');
			var stepTD = $('<td></td>');
			
			//create the span to display the step title
			var stepTitleSpan = $('<span></span>');
			stepTitleSpan.attr('width', '70%');
			stepTitleSpan.text('Step ' + stepNumberAndTitle + ' (' + nodeType + ')');
			
			//create the button to add an icon
			var addIconButton = $('<input></input>');
			addIconButton.attr('type', 'button');
			addIconButton.val('Add Icon');
			addIconButton.click({view: this, nodeId: nodeId, icons: icons}, this.addIconButtonClicked);
			
			//put the span and add icon button into a row
			stepTD.append(stepTitleSpan);
			stepTD.append(addIconButton);
			stepTableRow.append(stepTD);
			
			//add the row to the table for the node
			nodeTable.append(stepTableRow);
			
			if(icons != null) {
				//loop through all the icons
				for(var x=0; x<icons.length; x++) {
					//get an icon
					var icon = icons[x];
					
					if(icon != null) {
						//create a table for an icon
						var iconTable = this.createIconTable(nodeId, icon);
						
						var iconTR = $('<tr></tr>');
						var iconTD = $('<td></td>');
						
						//put the icon table into a row
						iconTD.append(iconTable);
						iconTR.append(iconTD);
						
						//put the row into the table for the step
						nodeTable.append(iconTR);
					}
				}
			}
		}
	}
	
	if(currentNode.type == 'sequence') {
		//current node is a sequence
		
		//get the child nodes
		var childNodes = currentNode.children;
		
		//loop through all the child nodes
		for(var x=0; x<childNodes.length; x++) {
			//get a child node
			var childNode = childNodes[x];
			
			//recursively call this function with the child node
			this.populateIconsViewHelper(childNode, containerDiv);
		}
	}
};

/**
 * The Add Icon button for a node was clicked
 * @param event the jquery click event
 */
View.prototype.addIconButtonClicked = function(event) {
	
	var thisView = event.data.view;
	
	//get the node id for the node that we will add an icon to
	var nodeId = event.data.nodeId;
	
	//get the icons for the node that was clicked
	var icons = event.data.icons;
	
	//add an icon to the node
	thisView.addIconButtonClickedHelper(nodeId, icons);
};

/**
 * Add an icon to the node
 * @param nodeId the node id that we will add an icon to
 */
View.prototype.addIconButtonClickedHelper = function(nodeId) {
	
	if(nodeId != null) {
		//get the node that we will add an icon to
		var node = this.getProject().getNodeById(nodeId);
		
		if(node != null) {
			var icons = node.icons;
			
			if(icons != null) {
				//create a new icon object
				var newIconObject = {};
				newIconObject.iconPath = '';
				newIconObject.statuses = [];
				
				//create a new status object
				var newStatusObject = {};
				newStatusObject.nodeId = '';
				newStatusObject.statusType = '';
				newStatusObject.statusValue = '';
				
				//put the new status object into the statuses array of the icon object
				newIconObject.statuses.push(newStatusObject);
				
				//add the icon object to the icons for the node
				icons.push(newIconObject);

				//create a table for the icon
				var iconTable = this.createIconTable(nodeId, newIconObject);
				
				var tempTR = $('<tr></tr>');
				var tempTD = $('<td></td>');
				
				//add the icon table to a row
				tempTD.append(iconTable);
				tempTR.append(tempTD);
				
				//add the row to the icons table for the node
				$('#' + this.escapeIdForJquery('iconsTable_' + nodeId)).append(tempTR);
				
				//save the project to the server
				this.saveProject();
			}
		}
	}
};

/**
 * Create an icon table which contains the icon path and all the statuses associated with it
 * @param nodeId the node id for the step that the icon is for
 * @param icon the icon object which contains the icon path and statuses
 * @return the icon table
 */
View.prototype.createIconTable = function(nodeId, icon) {
	
	//get the icon path
	var iconPath = '';
	
	//get the statuses that need to be satisfied in order for the icon to be displayed
	var statuses = [];
	
	if(icon != null) {
		//get the icon path
		iconPath = icon.iconPath;
		
		//get the statuses that need to be satisfied in order for the icon to be displayed
		statuses = icon.statuses;
	}
	
	//create the table
	var iconTable = $('<table></table>');
	iconTable.addClass('iconTable');
	
	//create and append the icon path row
	var iconPathRow = this.createIconPathRow(nodeId, icon);
	iconTable.append(iconPathRow);
	
	//create and append the row that contains the 'Add Status' button
	var addStatusRow = this.createAddStatusRow(statuses);
	iconTable.append(addStatusRow);
	
	//create and append the row that contains the statuses
	var statusesRow = this.createStatusesRow(statuses);
	iconTable.append(statusesRow);
	
	return iconTable;
};

/**
 * Create the row that contains the icon path
 * @param nodeId the node id for the node
 * @param icon the icon object from the project content
 * @return the row that contains the icon path
 */
View.prototype.createIconPathRow = function(nodeId, icon) {
	
	var iconPath = '';
	
	if(icon != null) {
		//get the icon path
		iconPath = icon.iconPath;
	}
	
	var tr = $('<tr></tr>');
	var td = $('<td></td>');

	//create the span to display the label
	var iconPathSpan = $('<span></span>');
	iconPathSpan.text('Icon Path: ');
	
	//create the input for the icon path
	var iconPathInput = $('<input></input>');
	iconPathInput.attr('id', '');
	iconPathInput.attr('type', 'text');
	iconPathInput.attr('size', '90');
	iconPathInput.val(iconPath);
	iconPathInput.change({thisView: this, iconObject: icon}, this.iconPathInputChanged);

	//create the delete button to delete the icon
	var deleteIconButton = $('<input></input>');
	deleteIconButton.attr('id', '');
	deleteIconButton.attr('type', 'button');
	deleteIconButton.val('Delete Icon');
	deleteIconButton.click({thisView: this, nodeId: nodeId, iconObject:icon}, this.deleteIconButtonClicked);
	
	td.append(iconPathSpan);
	td.append(iconPathInput);
	td.append(deleteIconButton);
	tr.append(td);
	
	return tr;
};

/**
 * The value in the icon path input has changed
 */
View.prototype.iconPathInputChanged = function(event) {
	
	var thisView = event.data.thisView;
	
	//get the icon object that is a pointer to the icon object in the project
	var iconObject = event.data.iconObject;
	
	//get the input element
	var iconInput = $(this);
	
	thisView.iconPathInputChangedHandler(iconInput, iconObject);
};

/**
 * Handles the icon path input change event
 * @param iconInput the icon input element from the UI
 * @param iconObject the icon object in the project content
 */
View.prototype.iconPathInputChangedHandler = function(iconInput, iconObject) {
	
	if(iconInput != null && iconObject != null) {
		//get the value from the input element
		var iconPath = iconInput.val();
		
		//save the new icon path value into the object in the project content
		iconObject.iconPath = iconPath;
		
		//save the project to the server
		this.saveProject();
	}
};

/**
 * The delete icon button was clicked
 * @param event the jquery click event
 */
View.prototype.deleteIconButtonClicked = function(event) {
	
	var thisView = event.data.thisView;
	
	//get the node id associated with the delete icon button
	var nodeId = event.data.nodeId;
	
	//get the icon object associated with the delete icon button
	var iconObject = event.data.iconObject;
	
	//get the delete icon button element
	var deleteIconButton = $(this);
	
	thisView.deleteIconButtonClickedHandler(deleteIconButton, nodeId, iconObject);
};

/**
 * Handles the delete icon button click event
 * @param deleteIconButton the delete icon button
 * @param nodeId the node id for the associated step
 * @param iconObject the icon object that is being deleted
 */
View.prototype.deleteIconButtonClickedHandler = function(deleteIconButton, nodeId, iconObject) {
	
	//get the node
	var node = this.getProject().getNodeById(nodeId);
	
	if(node != null) {
		//get the icons in the node
		var icons = node.icons;
		
		//get the index of the icon that we will delete
		var indexOfIcon = icons.indexOf(iconObject);
		
		if(indexOfIcon != -1) {
			//remove the icon from the icons
			icons.splice(indexOfIcon, 1);
			
			//save the project to the server
			this.saveProject();
		}
	}
	
	if(deleteIconButton != null) {
		//get the table that contains this delete icon button
		var iconTable = deleteIconButton.closest('table');
		
		//get the row that contains the table
		var iconTableParentTR = iconTable.closest('tr');
		
		//remove the row
		iconTableParentTR.remove();		
	}
};

/**
 * Create the row that contains the add status button
 * @param statuses the statuses for an icon
 * @return the row that contains the add status button
 */
View.prototype.createAddStatusRow = function(statuses) {
	
	var tr = $('<tr></tr>');
	var td = $('<td></td>');

	//create the add status button
	var addStatusButton = $('<input></input>');
	addStatusButton.attr('type', 'button');
	addStatusButton.val('Add Status');
	addStatusButton.click({thisView: this, statuses: statuses}, this.addStatusButtonClicked);
	
	//add the add status button to the row
	td.append(addStatusButton);
	tr.append(td);
	
	return tr;
};

/**
 * The add status button was clicked
 * @param event the jquery click event
 */
View.prototype.addStatusButtonClicked = function(event) {
	
	var thisView = event.data.thisView;
	
	//get the statuses for the icon
	var statuses = event.data.statuses;
	
	//get the add status button
	var addStatusButton = $(this);
	
	thisView.addStatusButtonClickedHandler(addStatusButton, statuses);
};

/**
 * Handles the add status clicked event
 * @param addStatusButton the add status button
 * @param statuses the statuses for the icon
 */
View.prototype.addStatusButtonClickedHandler = function(addStatusButton, statuses) {
	
	//create a new status
	var newStatus = {};
	newStatus.nodeId = '';
	newStatus.statusType = '';
	newStatus.statusValue = '';

	//add the new status to the statuses
	statuses.push(newStatus);
	
	//create status row
	var statusRow = this.createStatusRow(statuses, newStatus);
	
	//get the statuses table
	var statusesTable = addStatusButton.closest('tr').next('tr').find('table').first();
	
	//add the status row to the statuses table
	statusesTable.append(statusRow);
	
	//save the project to the server
	this.saveProject();
};

/**
 * Create the row that contains the table that contains the statuses
 * @param statuses the statuses for an icon
 * @return the row that contains the statuses table
 */
View.prototype.createStatusesRow = function(statuses) {
	
	var tr = $('<tr></tr>');
	var td = $('<td></td>');
	
	//create the table that contains the statuses
	var iconPathStatusesTable = this.createStatusesTable(statuses);
	
	//add the statuses table to the row
	td.append(iconPathStatusesTable);
	tr.append(td);

	return tr;
};

/**
 * Create the table that contains the statuses for an icon
 * @param statuses the statuses for an icon
 * @return the status table
 */
View.prototype.createStatusesTable = function(statuses) {
	
	//create the table
	var statusesTable = $('<table></table>');
	statusesTable.css('border-collapse', 'collapse');
	
	//loop through all the statuses
	for(var y=0; y<statuses.length; y++) {
		//get a status object
		var status = statuses[y];
		
		if(status != null) {
			//get the status fields
			var statusNodeId = status.nodeId;
			var statusType = status.statusType;
			var statusValue = status.statusValue;
			
			//create a status row
			var iconPathStatusesRow = this.createStatusRow(statuses, status);
			
			//add the status row to the statuses table
			statusesTable.append(iconPathStatusesRow);
		}
	}
	
	return statusesTable;
};

/**
 * Create a status row
 * @param statuses the statuses for an icon
 * @param status the the status we are creating a row for
 * @return the tr that contains the status table
 */
View.prototype.createStatusRow = function(statuses, status) {
	
	var statusRow = $('<tr></tr>');
	var statusTableTD = $('<td></td>');
	var deleteButtonTD = $('<td></td>');
	
	//add a border to the row
	statusRow.css('border', '1px solid');
	
	//create a table that will contain the node title, status type, and status value
	var statusTable = $('<table></table>');
	statusTable.addClass('statusTable');
	statusTable.attr('width', '100%');
	
	//create and append the node drop down row
	var nodeTitleRow = this.createNodeTitleRow(status);
	statusTable.append(nodeTitleRow);
	
	//create and append the status type drop down row
	var statusTypeRow = this.createStatusTypeRow(status);
	statusTable.append(statusTypeRow);
	
	//create and append the status value drop down row
	var statusValueRow = this.createStatusValueRow(status);
	statusTable.append(statusValueRow);
	
	//add the status table to the row
	statusTableTD.append(statusTable);
	statusRow.append(statusTableTD);
	
	//create the delete status button
	var deleteButton = $('<input></input>');
	deleteButton.attr('type', 'button');
	deleteButton.val('Delete Status');
	deleteButton.click({thisView: this, status: status, statuses: statuses}, this.deleteStatusButtonClicked);
	
	//add the delete status button to the row
	deleteButtonTD.append(deleteButton);
	statusRow.append(deleteButtonTD);
	
	return statusRow;
};

/**
 * The delete status button was clicked
 * @param event the jquery click event
 */
View.prototype.deleteStatusButtonClicked = function(event) {
	
	var thisView = event.data.thisView;
	
	//the status that will be deleted
	var status = event.data.status;
	
	//all the statuses for the icon
	var statuses = event.data.statuses;
	
	//the delete status button element
	var deleteStatusButton = $(this);
	
	thisView.deleteStatusButtonClickedHandler(deleteStatusButton, status, statuses);
};

/**
 * Handles the delete status button clicked event
 * @param deletStatusButton the delete status button element
 * @param status the status object that will be deleted
 * @param statuses all the status for the icon
 */
View.prototype.deleteStatusButtonClickedHandler = function(deleteStatusButton, status, statuses) {
	
	if(statuses != null && status != null) {
		//find the index of the status in the statuses array
		var indexOfStatus = statuses.indexOf(status);
		
		if(indexOfStatus != -1) {
			//remove the status from the array
			statuses.splice(indexOfStatus, 1);
			
			//save the project to the server
			this.saveProject();
		}
	}
	
	if(deleteStatusButton != null) {
		//get the status row
		var statusRow = deleteStatusButton.closest('tr');
		
		//remove the status row
		statusRow.remove();
	}
};

/**
 * Create the node title row in a status table
 * @param the status object
 * @return the tr that contains the node title drop down
 */
View.prototype.createNodeTitleRow = function(status) {
	
	var statusNodeId = null;
	
	if(status != null) {
		//get the node id for the status
		statusNodeId = status.nodeId;
	}
	
	//create the select object that will allow the author to select the node
	var nodeSelect = $('<select></select>');
	nodeSelect.addClass('nodeTitleSelect');
	nodeSelect.change({thisView:this, statusObject: status}, this.iconNodeTitleChanged);
	
	//create a blank option
	var emptyOption = $("<option></option>");
	emptyOption.val("");
	emptyOption.text("");
	
	//add the empty option to the node select element
	nodeSelect.append(emptyOption);
	
	//get all the node ids (this includes step and sequence nodes)
	var allNodeIds = this.getProject().getAllNodeIds();
	
	var selectedValue = '';
	
	//loop through all the node ids
	for(var i=0; i<allNodeIds.length; i++) {
		//get a node id
		var tempNodeId = allNodeIds[i];
		
		//skip the master node
		if(tempNodeId != 'master') {
			//get the node, node type, and step number and title
			var node = this.getProject().getNodeById(tempNodeId);
			var nodeType = node.type;
			var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(tempNodeId);
			
			if(nodeType == 'sequence') {
				//display the activity title
				stepNumberAndTitle = "Activity " + stepNumberAndTitle;
			} else {
				//display the step title
				stepNumberAndTitle = "Step " + stepNumberAndTitle;
			}
			
			var selected = '';
			
			if(statusNodeId == tempNodeId) {
				//we have found the node id that should be selected
				selectedValue = tempNodeId;
			}
			
			//create the option for the node
			var option = $("<option></option>");
			
			//set the value for the option
			option.val(tempNodeId);
			
			//set the text for the option
			option.text(stepNumberAndTitle);
			
			//add the option to the select element
			nodeSelect.append(option);
		}
	}
	
	//select the node in the select node element
	nodeSelect.val(selectedValue);

	//create a row to put the select node element in
	var tempRow = $("<tr></tr>");
	var tempData = $("<td></td>");
	var tempP = $("<p>Step Title: </p>");
	tempP.css("display", "inline");
	
	//add the label and select element to the row
	tempData.append(tempP);
	tempData.append(nodeSelect);
	tempRow.append(tempData);
	
	return tempRow;
};

/**
 * The node title for a status was changed
 * @event the jquery change event
 */
View.prototype.iconNodeTitleChanged = function(event) {
	
	var thisView = event.data.thisView;
	
	//get the status object that was changed
	var statusObject = event.data.statusObject;
	
	//get the table for the status
	var statusTable = $(this).closest('table');
	
	thisView.iconNodeTitleChangedHelper(statusTable, statusObject);
};

/**
 * Handles the node title changed event
 * @param parentTable the table for the status
 * @param statusObject the status object
 */
View.prototype.iconNodeTitleChangedHelper = function(statusTable, statusObject) {

	if(statusTable != null) {
		//get the select elements
		var nodeTitleSelect = statusTable.find('.nodeTitleSelect');
		var statusTypeSelect = statusTable.find('.statusTypeSelect');
		var statusValueSelect = statusTable.find('.statusValueSelect');
		
		//get the selected node id
		var nodeId = nodeTitleSelect.val();
		
		//set the node id into the status object
		statusObject.nodeId = nodeId;
		
		/*
		 * populate the status types drop down with the status types
		 * available for the node id
		 */
		this.populateStatusTypes(statusTypeSelect, nodeId);
		
		//get the selected status type
		var selectedStatusType = statusTypeSelect.val();
		
		//populate the status values based on the selected status type
		this.populateStatusValues(statusValueSelect, nodeId, selectedStatusType);
		
		//get the selected status value
		var selectedStatusValue = statusValueSelect.val();
		
		/*
		 * update the status type and status value in the status object
		 * with the values that are now selected
		 */
		statusObject.statusType = selectedStatusType;
		statusObject.statusValue = selectedStatusValue;
		
		//save the project to the server
		this.saveProject();
	}
};

/**
 * The status type has changed for a status
 * @param event the jquery change event
 */
View.prototype.iconStatusTypeChanged = function(event) {
	
	var thisView = event.data.thisView;
	
	//get the status object
	var statusObject = event.data.statusObject;
	
	//get the status table
	var statusTable = $(this).closest('table');
	
	thisView.iconStatusTypeChangedHelper(statusTable, statusObject);
};

/**
 * Handles the icon path changed event
 * @param parentTable the status table
 * @param statusObject the status object
 */
View.prototype.iconStatusTypeChangedHelper = function(statusTable, statusObject) {
	
	if(statusTable != null) {
		//get the select elements
		var nodeTitleSelect = statusTable.find('.nodeTitleSelect');
		var statusTypeSelect = statusTable.find('.statusTypeSelect');
		var statusValueSelect = statusTable.find('.statusValueSelect');
		
		//get the selected node id
		var nodeId = nodeTitleSelect.val();
		
		//get the selected status type
		var statusType = statusTypeSelect.val();
		
		//populate the status values
		this.populateStatusValues(statusValueSelect, nodeId, statusType);
		
		//update the status type to the status object
		statusObject.statusType = statusType;
		
		//get the status value value
		var statusValue = statusValueSelect.val();
		
		//update the status value to the status object
		statusObject.statusValue = statusValue;
		
		//save the project to the server
		this.saveProject();
	}
};

/**
 * Create the row that contains the status type drop down
 * @param status the status object
 * @return the tr that contains the status type drop down
 */
View.prototype.createStatusTypeRow = function(status) {
	
	//get the values from the status object
	var statusNodeId = status.nodeId;
	var statusType = status.statusType;
	var statusValue = status.statusValue;
	
	var selectedStatusType = '';
	
	//create the select element to select the status type
	var statusTypeSelect = $("<select></select>");
	statusTypeSelect.addClass('statusTypeSelect');
	statusTypeSelect.change({thisView: this, statusObject: status}, this.iconStatusTypeChanged);
	
	//create an empty option
	var statusTypeOption = $("<option></option>");
	statusTypeOption.val("");
	statusTypeOption.text("");
	
	//add the empty option to the status type select element
	statusTypeSelect.append(statusTypeOption);
	
	if(statusNodeId != null) {
		//get the node
		var node = this.getProject().getNodeById(statusNodeId);
		
		if(node != null) {
			//get all the available statuses for the node including special status values
			var includeSpecialStatusValues = true;
			var availableStatuses = node.getAvailableStatuses(includeSpecialStatusValues);
			
			//loop through all the available statuses
			for(var j=0; j<availableStatuses.length; j++) {
				//get an available status
				var tempStatus = availableStatuses[j];
				
				//get the status type
				var tempStatusType = tempStatus.statusType;
				
				//get the possible status values
				var possibleStatusValues = tempStatus.possibleStatusValues;
				
				//create the option element for the status type
				var statusTypeOption = $("<option></option>");
				statusTypeOption.val(tempStatusType);
				statusTypeOption.text(tempStatusType);
				
				//add the option to the status type select element
				statusTypeSelect.append(statusTypeOption);
				
				if(statusType == tempStatusType) {
					/* 
					 * we have found the status type that should be selected
					 * in the drop down so we will remember this status type 
					 * so we can make it selected in the select status type 
					 * element
					 */
					selectedStatusType = tempStatusType;					
				}
			}
			
			//select the option the author has previously chosen
			statusTypeSelect.val(selectedStatusType);
		}
	}
	
	var tempRow = $("<tr></tr>");
	var tempData = $("<td></td>");
	
	//create the label for the status type
	var tempP = $("<p>Status Type: </p>");
	tempP.css("display", "inline");
	
	//add the label and select element for the status type
	tempData.append(tempP);
	tempData.append(statusTypeSelect);

	//add the data element to the row
	tempRow.append(tempData);
	
	return tempRow;
};

/**
 * Populate the options into the select element. If the previously selected value
 * exists in the new values, we will select the previously selected value.
 * @param selectElement the select element
 * @param values an array of values to populate into the select element
 */
View.prototype.populateValuesIntoSelectElement = function(selectElement, values) {
	
	if(selectElement != null) {
		//get the previously selected value
		var previousValue = selectElement.val();
		
		//remove all existing values in the select element
		selectElement.empty();
		
		//create an empty option
		var emptyOption = $('<option></option>');
		emptyOption.val('');
		emptyOption.text('');
		
		//add the empty option
		selectElement.append(emptyOption);
		
		if(values != null) {
			var previousValueAvailable = false;
			
			//loop through all the values
			for(var x=0; x<values.length; x++) {
				//get a value
				var value = values[x];
				
				if(value != null) {
					//create an option for the value
					var tempOption = $('<option></option>');
					tempOption.val(value);
					tempOption.text(value);
					
					//add the option to the select element
					selectElement.append(tempOption);
					
					if(value + '' == previousValue) {
						previousValueAvailable = true;
					}
				}
			}
			
			/*
			 * check if the previously selected value is available 
			 * in the new set of values
			 */
			if(previousValueAvailable) {
				/*
				 * the previously selected value is in the new set of values
				 * so we will select it
				 */
				selectElement.val(previousValue);
			}
		}
	}
};

/**
 * Populate the status types into the status types select element
 * @param selectElement the status types select element
 * @param nodeId the the node id that we will retrieve status types for
 */
View.prototype.populateStatusTypes = function(selectElement, nodeId) {
	
	//an array that we will insert status types into as strings
	var statusTypes = [];
	
	//get the node
	var node = this.getProject().getNodeById(nodeId);
	
	if(node != null) {
		//get all the available statuses for the node including special status values
		var includeSpecialStatusValues = true;
		var availableStatuses = node.getAvailableStatuses(includeSpecialStatusValues);
		
		if(availableStatuses != null) {
			//loop through all the available statuses
			for(var x=0; x<availableStatuses.length; x++) {
				//get an available status
				var availableStatus = availableStatuses[x];
				
				if(availableStatus != null) {
					//get a status type
					var statusType = availableStatus.statusType;
					
					if(statusType != null) {
						//add the status type to our array
						statusTypes.push(statusType);
					}
				}
			}
		}
	}
	
	//populate the status types into the select element
	this.populateValuesIntoSelectElement(selectElement, statusTypes);
};

/**
 * Populate the status values into the status values select element
 * @param selectElement the status values select element
 * @param nodeId the node id that we will retrieve status values for
 * @param statusType the status type we will retrieve status values for
 */
View.prototype.populateStatusValues = function(selectElement, nodeId, statusType) {
	
	//an array that we will insert status values into as strings
	var statusValues = [];
	
	//get the node
	var node = this.getProject().getNodeById(nodeId);
	
	if(node != null) {
		//get the status values for the given status type
		statusValues = node.getAvailableStatusValuesForStatusType(statusType);
	}
	
	//populate the status values into the select element
	this.populateValuesIntoSelectElement(selectElement, statusValues);
};

/**
 * Create the status value row
 * @param status the status object
 * @return the tr that contains the status value drop down
 */
View.prototype.createStatusValueRow = function(status) {
	
	//get the values from the status object
	var statusNodeId = status.nodeId;
	var statusType = status.statusType;
	var statusValue = status.statusValue;
	
	//create the status value select element
	var statusValueSelect = $('<select></select>');
	statusValueSelect.addClass('statusValueSelect');
	statusValueSelect.change({thisView: this, statusObject: status}, this.iconStatusValueChanged);
	
	//create an empty option
	var statusValueOption = $('<option></option>');
	statusValueOption.val('');
	statusValueOption.text('');
	
	//add the empty option to the status value select element
	statusValueSelect.append(statusValueOption);
	
	if(statusNodeId != null) {
		//get the node
		var node = this.getProject().getNodeById(statusNodeId);
		
		if(node != null) {
			var includeSpecialStatusValues = true;
			
			//get the possible status values
			var possibleStatusValues = node.getAvailableStatusValuesForStatusType(statusType, includeSpecialStatusValues);
			
			var selectedStatusValue = null;
			
			//loop through all the possible status values
			for(var k=0; k<possibleStatusValues.length; k++) {
				//get a possible status value
				var possibleStatusValue = possibleStatusValues[k];
				
				//make sure the possible status value is a string
				possibleStatusValue += '';
				
				if(statusValue + '' == possibleStatusValue) {
					/*
					 * we have found the status value the author has chosen
					 * so we will remember this status value so we can make
					 * it selected in the select status value element 
					 */ 
					selectedStatusValue = possibleStatusValue;
				}
				
				//create the option element for the status value
				var statusValueOption = $("<option></option>");
				statusValueOption.val(possibleStatusValue);
				statusValueOption.text(possibleStatusValue);
				
				//add the option to the status value select element
				statusValueSelect.append(statusValueOption);
			}
			
			if(selectedStatusValue != null) {
				//select the option the author has previously chosen
				statusValueSelect.val(selectedStatusValue);				
			}
		}
	}
	
	var tempRow = $("<tr></tr>");
	var tempData = $("<td></td>");
	
	//create the label for the status value
	var tempP = $("<p>Status Value: </p>");
	tempP.css("display", "inline");
	
	//add the label and select element for the status value
	tempData.append(tempP);
	tempData.append(statusValueSelect);

	//add the data element to the row
	tempRow.append(tempData);
	
	return tempRow;
};

/**
 * The status value has changed for a status
 * @param event the jquery change event
 */
View.prototype.iconStatusValueChanged = function(event) {
	
	var thisView = event.data.thisView;
	
	//get the status object
	var statusObject = event.data.statusObject;
	
	//get the status table
	var statusTable = $(this).closest('table');
	
	thisView.iconStatusValueChangedHelper(statusTable, statusObject);
};

/**
 * Handles the status value changed event
 * @param statusTable the status table
 * @param statusObject the status object
 */
View.prototype.iconStatusValueChangedHelper = function(statusTable, statusObject) {
	
	if(statusTable != null) {
		//get the status value drop down
		var statusValueSelect = statusTable.find('.statusValueSelect');
		
		//get the selected status value
		var statusValue = statusValueSelect.val();
		
		//save the status value to the status object
		statusObject.statusValue = statusValue;
		
		//save the project to the server
		this.saveProject();
	}
};

/**
 * Wrap the jquery element in td and then tr
 * @param element the jquery element to wrap
 */
View.prototype.wrapInTRTD = function(element) {
	//create the tr
	var tr = $("<tr></tr>");
	
	//create the td
	var td = $("<td></td>");
	
	//wrap the element in the td
	td.append(element);
	
	//wrap the td in the tr
	tr.append(td);
	
	return tr;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/authorview_icons.js');
}