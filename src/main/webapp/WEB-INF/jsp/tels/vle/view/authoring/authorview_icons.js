
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
	
	//loop through all the nodes and generate the html for each node
	this.populateIconsViewHelper(startNode, containerDiv);
	
	return containerDiv;
};

/**
 * A recursive function that navigates through all the nodes in the project
 * and generates the html tag UI for the nodes.
 * @param currentNode the current node we are on
 * @param htmlSoFar the html generated so far
 * @return the html tag UI for the nodes
 */
View.prototype.populateIconsViewHelper = function(currentNode, containerDiv) {
	//get the node id
	var nodeId = currentNode.id;
	
	//get the root node id
	var rootNode = this.getProject().getRootNode();
	var rootNodeId = rootNode.id;
	
	if(rootNodeId != nodeId) {
		//we only need to display the nodes that are not the root node
		
		//get the step number and title
		var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId);
		
		//get the step type
		var nodeType = currentNode.type;

		//create a row
		var row = $("<tr><td></td></tr>");
		
		//create a table for the node
		var nodeTable = $('<table></table>');
		nodeTable.attr('id', 'tagTableForStep_' + nodeId);
		nodeTable.attr('border', 1);
		nodeTable.attr('width', '100%');
		
		//add the table to the container
		containerDiv.append(nodeTable);
		containerDiv.append('<br/>');
		
		var stepTableRow = null;
		
		if(currentNode.type == 'sequence') {
			//create the row to display the step number, step title, and step type
			stepTableRow = $("<tr><td width='70%'><b>Activity " + stepNumberAndTitle + "</b></td></tr>");
		} else {
			//create the row to display the step number, step title, and step type
			stepTableRow = $("<tr><td width='70%'>Step " + stepNumberAndTitle + " (" + nodeType + ")</td></tr>");
		}
		
		//add the row to the table for the node
		nodeTable.append(stepTableRow);
		
		//get the icons for this node
		var icons = currentNode.icons;
		
		if(icons != null) {
			//loop through all the icons
			for(var x=0; x<icons.length; x++) {
				//get an icon
				var icon = icons[x];
				
				if(icon != null) {
					//get the icon path
					var iconPath = icon.iconPath;
					
					//get the statuses that need to be satisfied in order for the icon to be displayed
					var statuses = icon.statuses;
					
					//create the row that will display the icon path
					var iconPathRow = $("<tr><td>Icon Path: <input id='" + currentNode.id + "_icons_" + x + "' type='text' value='" + iconPath + "' size='100'></td></tr>");
					
					//add the row to the table for the node
					nodeTable.append(iconPathRow);
					
					//loop through all the statuses
					for(var y=0; y<statuses.length; y++) {
						//get a status object
						var status = statuses[y];
						
						if(status != null) {
							//get the status fields
							var statusNodeId = status.nodeId;
							var statusType = status.statusType;
							var statusValue = status.statusValue;
							
							//create the select object that will allow the author to select the node
							var nodeSelect = $('<select></select>');
							
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
										selectedValue = nodeId + "_" + tempNodeId;
									}
									
									//create the option for the node
									var option = $("<option></option>");
									
									//set the value for the option
									option.val(nodeId + "_" + tempNodeId);
									
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
							var tempP = $("<p>Node Title: </p>");
							tempP.css("display", "inline");
							
							//add the label and select element
							tempData.append(tempP);
							tempData.append(nodeSelect);
							
							//get the node
							var node = this.getProject().getNodeById(statusNodeId);
							
							//get all the available statuses for the node including special status values
							var includeSpecialStatusValues = true;
							var availableStatuses = node.getAvailableStatuses(includeSpecialStatusValues);
							
							var selectedStatusType = '';
							var selectedStatusValue = '';
							
							//create the select element to select the status type
							var statusTypeSelect = $("<select></select>");
							
							//create the select element to select the status value
							var statusValueSelect = $("<select></select>");
							
							//create an empty option
							var statusTypeOption = $("<option></option>");
							statusTypeOption.val("");
							statusTypeOption.text("");
							
							//add the empty option to the status type select element
							statusTypeSelect.append(statusTypeOption);
							
							//loop through all the available statuses
							for(var j=0; j<availableStatuses.length; j++) {
								//get a status object
								var tempStatus = availableStatuses[j];
								
								//get the status type
								var tempStatusType = tempStatus.statusType;
								
								//get the status values
								var possibleStatusValues = tempStatus.possibleStatusValues;
								
								//create the option element for the status type
								var statusTypeOption = $("<option></option>");
								statusTypeOption.val(tempStatusType);
								statusTypeOption.text(tempStatusType);
								
								//add the option to the status type select element
								statusTypeSelect.append(statusTypeOption);
								
								if(statusType == tempStatusType) {
									/*
									 * we are on the status type that the author has chosen
									 * so we will populate the status values for this status
									 * type
									 */
									
									/*
									 * remember this status type so we can make it selected
									 * in the select status type element
									 */
									selectedStatusType = tempStatusType;
									
									//create an empty option
									var statusValueOption = $("<option></option>");
									statusValueOption.val("");
									statusValueOption.text("");
									
									//add the empty option to the status value select element
									statusValueSelect.append(statusValueOption);
									
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
								}
							}
							
							//select the options the author has previously chosen
							statusTypeSelect.val(selectedStatusType);
							statusValueSelect.val(selectedStatusValue);
							
							tempData.append("<br/>");
							
							//create the label for the status type
							var tempP = $("<p>Status Type: </p>");
							tempP.css("display", "inline");
							
							//add the label and select element for the status type
							tempData.append(tempP);
							tempData.append(statusTypeSelect);
							tempData.append("<br/>");
							
							//create the label for the status value
							var tempP = $("<p>Status Value: </p>");
							tempP.css("display", "inline");
							
							//add the label and select element for the status value
							tempData.append(tempP);
							tempData.append(statusValueSelect);

							//add the data element to the row
							tempRow.append(tempData);
							
							//add the row element to the table
							nodeTable.append(tempRow);
						}
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
			htmlSoFar = this.populateIconsViewHelper(childNode, containerDiv);
		}
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