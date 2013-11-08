

/**
 * Generate the html for the tag view, insert the html into
 * the tag view dialog popup and then open the dialog popup
 */
View.prototype.displayTagView = function() {
	//generate the html for the tag view
	var html = this.getProjectTagView();
	
	//insert the html into the dialog
	$('#projectTagView').html(html);
	
	//display the dialog
	$('#tagViewDialog').dialog('open');
};

/**
 * Generate the tag view
 * @returns the html that will display the tag UI
 */
View.prototype.getProjectTagView = function() {
	//get the project
	var project = this.getProject();
	
	//get the start node
	var startNode = project.getRootNode();
	
	var html = "";
	
	html += "<table border='0' width='100%'>";
	
	//Generate the tag view for all the nodes in the project
	html += this.getProjectTagViewHelper(startNode);
	
	html += "</table>";
	
	return html;
};

/**
 * A recursive function that navigates through all the nodes in the project
 * and generates the html tag UI for the nodes.
 * @param currentNode the current node we are on
 * @param htmlSoFar the html generated so far
 * @return the html tag UI for the nodes
 */
View.prototype.getProjectTagViewHelper = function(currentNode, htmlSoFar) {
	
	/*
	 * set the htmlSoFar to empty string. this only happens
	 * for the root node of the project
	 */
	if(htmlSoFar == null) {
		htmlSoFar = "";
	}
	
	//get the node id
	var nodeId = currentNode.id;
	
	var rootNode = this.getProject().getRootNode();
	var rootNodeId = rootNode.id;
	
	if(rootNodeId != nodeId) {
		//we only need to display the nodes that are not the root node
		
		//get the step number and title
		var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId);
		
		//get the step type
		var nodeType = currentNode.type;

		//create the html for this step
		htmlSoFar += "<tr><td>";
		
		//create the table to contain everything for this step
		htmlSoFar += "<table id='tagTableForStep_" + nodeId + "' border='1' width='100%'>";
		
		if(currentNode.type == 'sequence') {
			//create the row to display the step number, step title, and step type
			htmlSoFar += "<tr><td width='70%'><b>Activity " + stepNumberAndTitle + "</b></td></tr>";		
		} else {
			//create the row to display the step number, step title, and step type
			htmlSoFar += "<tr><td width='70%'>Step " + stepNumberAndTitle + " (" + nodeType + ")</td></tr>";
		}
		
		//create the row to display the tags
		htmlSoFar += "<tr><td id='tagsForStep_" + nodeId + "'>";
		
		if(navigator.userAgent.indexOf('Chrome') == -1) {
			//browser is not chrome
			
			//create the select element for the user to add a tag
			htmlSoFar += "<select id='addTagSelect_" + nodeId + "' style='display:inline' onClick='eventManager.fire(\"populateAddTagSelect\", [\"" + nodeId + "\"])' onChange='eventManager.fire(\"addTag\", [\"" + nodeId + "\"])'>";
			htmlSoFar += "<option>&lt;Add Tag&gt;</option>";
			htmlSoFar += "</select>";
		} else {
			/*
			 * browser is chrome so we will create a simple button
			 * instead of a select because the onclick event for
			 * select elements does not work in chrome
			 */
			
			//create a button for the user to create a tag
			htmlSoFar += "<input type='button' value='Create New Tag' onclick='eventManager.fire(\"addTag\", [\"" + nodeId + "\"])' />";
		}
		
		//get any existing tags for the step
		var tags = currentNode.tags;
		
		if(tags != null) {
			//loop through all the tags
			for(var x=0; x<tags.length; x++) {
				//get a tag
				var tagName = tags[x];

				//add the tag to the display
				var tagDiv = this.getTagHtml(nodeId, tagName, x);
				
				//add the tag div to the html
				htmlSoFar += tagDiv;
			}			
		}
		
		htmlSoFar += "</td></tr>";
		
		//create the row to display the tag maps
		htmlSoFar += "<tr id='tagMapTr_" + nodeId + "'><td id='tagMapTd_" + nodeId + "'>";
		
		if(navigator.userAgent.indexOf('Chrome') == -1) {
			//browser is not chrome
			
			//create the select element for the user to add a tag map
			htmlSoFar += "<select id='addTagMapSelect_" + nodeId + "' style='display:inline' onclick='eventManager.fire(\"populateAddTagMapSelect\", [\"" + nodeId + "\"])' onchange='eventManager.fire(\"addTagMap\", [\"" + nodeId + "\"])'>";
			htmlSoFar += "<option>&lt;Add Tag Map&gt;</option>";
			htmlSoFar += "</select>";			
		} else {
			/*
			 * browser is chrome so we will create a simple button
			 * instead of a select because the onclick event for
			 * select elements does not work in chrome
			 */
			
			//create a button for the user to create a new tag map
			htmlSoFar += "<input type='button' value='Create New Tag Map' onclick='eventManager.fire(\"addTagMap\", [\"" + nodeId + "\"])' />";
		}

		//get all the existing tag maps
		var tagMaps = currentNode.tagMaps;
		
		if(tagMaps != null) {
			//loop through all the tag maps
			for(var x=0; x<tagMaps.length; x++) {
				//get a tag map
				var tagMap = tagMaps[x];

				//get the attributes for the tag map
				var tagName = tagMap.tagName;
				var functionName = tagMap.functionName;
				var functionArgs = tagMap.functionArgs;
				
				//generate the html for the tag map
				htmlSoFar += this.getTagMapHtml(nodeId, tagName, functionName, functionArgs, x);
			}
		}
		htmlSoFar += "</td></tr>";
		
		//close the table for the step
		htmlSoFar += "</table></td></tr>";
		
		//create a line break after each step
		htmlSoFar += "<tr><td>&nbsp</td></tr>";
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
			htmlSoFar = this.getProjectTagViewHelper(childNode, htmlSoFar);
		}
	}
	
	return htmlSoFar;
};

/**
 * Populate the tags in the select drop down for the given nodeId
 * @param nodeId the id of the node
 */
View.prototype.populateAddTagSelect = function(nodeId) {
	/*
	 * replace all the '.' with '\\.' so that the jquery id selector works
	 * if we didn't do this, it would treat the '.' as a class selector and
	 * would not be able to find the element by its id because almost all
	 * of our ids contain a '.'
	 * e.g. node_1.ht
	 */
	var nodeIdEscaped = this.escapeIdForJquery(nodeId);
	
	var html = "";
	
	//create the option that shows the author what this drop down is for
	html += "<option>&lt;Add Tag&gt;</option>";
	
	//create the option to allow the author to create a new tag 
	html += "<option>(Create New Tag)</option>";
	
	//get all the unique existing tags
	var tags = this.getProject().getAllUniqueTagsInProject();
	
	//sort the tags alphabetically
	tags.sort(this.sortAlphabetically);
	
	//loop through all the tags
	for(var x=0; x<tags.length; x++) {
		//get a tag
		var tag = tags[x];
		
		//add the tag to the drop down
		html += "<option>" + tag + "</option>";
	}
	
	//insert the options into the drop down for the given step
	$('#addTagSelect_' + nodeIdEscaped).html(html);
};

/**
 * Populate the tag maps in the select drop down for the given nodeId
 * @param nodeId
 */
View.prototype.populateAddTagMapSelect = function(nodeId) {
	//get the node
	var node = this.getProject().getNodeById(nodeId);
	
	//get the tag map functions for this step type
	var tagMapFunctions = node.getTagMapFunctions();
	
	/*
	 * replace all the '.' with '\\.' so that the jquery id selector works
	 * if we didn't do this, it would treat the '.' as a class selector and
	 * would not be able to find the element by its id because almost all
	 * of our ids contain a '.'
	 * e.g. node_1.ht
	 */
	nodeId = this.escapeIdForJquery(nodeId);
	
	//get all the unique tag maps in the project
	var tagMaps = this.getProject().getAllUniqueTagMapsInProject();
	
	var html = "";
	
	//create the option that shows the author what this drop down is for
	html += "<option>&lt;Add Tag Map&gt;</option>";
	
	//create the option to allow the author to create a new tag map
	html += "<option>(Create New Tag Map)</option>";
	
	//loop through all the tag maps
	for(var x=0; x<tagMaps.length; x++) {
		//get a tag map
		var tagMap = tagMaps[x];
		
		//get the function name
		var functionName = tagMap.functionName;
		
		/*
		 * see if the step implements this function. if this
		 * returns null, it means the step does not implement
		 * the function.
		 */
		var fun = node.getTagMapFunctionByName(functionName);
		
		if(fun != null) {
			//the step implements this function
			
			//get the tag map in string form
			var tagMapString = this.tagMapToString(tagMap);
			
			//add the tag map into the drop down
			html += "<option>";
			html += tagMapString;
			html += "</option>";			
		}
	}

	//insert the options into the select drop down for the given step
	$('#addTagMapSelect_' + nodeId).html(html);
};

/**
 * Convert the tag map into string format
 * e.g.
 * 
 * {
 * 		"tagName":"myTag1",
 * 		"functionName":"checkScore",
 * 		"functionArgs":["30"]
 * }
 * 
 * will be converted to
 * 
 * Tag: myTag1, Function: checkScore, Arguments: 30
 * 
 * @param tagMap the tag map object
 * @return the string format of the tag map
 */
View.prototype.tagMapToString = function(tagMap) {
	var tagMapString = '';
	
	if(tagMap != null) {
		//get the attributes of the tag map
		var tagName = tagMap.tagName;
		var functionName = tagMap.functionName;
		var functionArgs = tagMap.functionArgs;
		var functionArgsString = '';
		
		//loop through all the function args
		for(var x=0; x<functionArgs.length; x++) {
			//get a function arg
			var functionArg = functionArgs[x];
			
			if(functionArgsString != '') {
				//add a comma if necessary
				functionArgsString += ', ';
			}
			
			//add the function arg value to the string
			functionArgsString += functionArg;
		}
		
		//create the tag map string
		tagMapString = 'Tag: ' + tagName + ', Function: ' + functionName + ', Arguments: ' + functionArgsString;
	}
	
	return tagMapString;
};

/**
 * Add a tag to the step
 * @param nodeId the id of the node
 */
View.prototype.addTag = function(nodeId) {
	//get the node
	var node = this.getProject().getNodeById(nodeId);
	
	//get the escaped nod id
	nodeIdEscaped = this.escapeIdForJquery(nodeId);
	
	//get the tag name that the author has selected in the drop down
	var tagName = $('#addTagSelect_' + nodeIdEscaped + ' option:selected').val();
	
	//create an array for the tags if this step does not have tags
	if(node.tags == null) {
		node.tags = [];
	}
	
	//get the existing tags
	var existingTags = node.tags;
	
	if(tagName == '(Create New Tag)' || tagName == null) {
		//the user wants to create a brand new tag
		tagName = '';
	}

	//check if this step already has the tag the author wants to add
	if(existingTags.indexOf(tagName) == -1) {
		//this step does not have the tag
		
		//create the text input element for the tag
		var tagDiv = this.getTagHtml(nodeId, tagName);
		
		//add the tag to the display
		$('#tagsForStep_' + nodeIdEscaped).append(tagDiv);
		
		//add the tag to the array of tags for this step
		existingTags.push(tagName);
		
		//save the project back to the server
		this.saveProject();
	} else {
		//tag is already exists for this step
		alert('Error: this step already has this tag');
	}
};

/**
 * Get the html for the tag
 * @param nodeId the id of the node
 * @param tagName the tag name
 * @param tagIndex the index of the tag in the tag array for the step
 * @returns the html to display the tag for the step
 */
View.prototype.getTagHtml = function(nodeId, tagName, tagIndex) {
	
	if(tagIndex == null) {
		//get the tag index if is not provided
		
		//get the escaped node id
		var nodeIdEscaped = this.escapeIdForJquery(nodeId);
		
		//get the number of elements with the given class
		var numberOfTags = $('.tagForStep_' + nodeIdEscaped).size();
		
		/*
		 * the index will be the number of elements with the given class.
		 * we start the index at 0 so using the number of elements as the
		 * index works appropriately.
		 * e.g.
		 * if there are 3 elements, their indexes will be 0, 1, 2
		 * and if we add a new index, it will be index 3
		 */
		tagIndex = numberOfTags;
	}
	
	//create the div that contains the text input to display the tag for the step
	var tagDiv = "<div id='tagDiv_" + nodeId + "_" + tagIndex + "' class='tagForStep_" + nodeId + "' style='display:inline'><input id='tagInput_" + nodeId + "_" + tagIndex + "' class='tagInputForStep_" + nodeId + "' type='text' style='display:inline' value='" + tagName + "' size='12' onchange='eventManager.fire(\"tagNameChanged\", [\"" + nodeId + "\", \"" + tagIndex + "\"])' /><div id='tagDelete_" + nodeId + "_" + tagIndex + "' style='display:inline;cursor:pointer' onclick='eventManager.fire(\"removeTag\", [\"" + nodeId + "\", \"" + tagIndex + "\"])'>[x]</div></div>";
	
	return tagDiv;
};

/**
 * The author has changed the tag map so we need to retrieve the changes
 * and save it to the project
 * @param nodeId the id of the node
 * @param tagMapIndex the index of the tag map
 */
View.prototype.tagMapChanged = function(nodeId, tagMapIndex) {
	//get the escaped node id
	var nodeIdEscaped = this.escapeIdForJquery(nodeId);
	
	//get the node
	var node = this.getProject().getNodeById(nodeId);
	
	//get the tag maps for this step
	var tagMaps = node.tagMaps;
	
	//get the tag map with the given index
	var tagMap = tagMaps[tagMapIndex];
	
	if(tagMap != null) {
		//get the selected tag name
		var tagName = $('#tagMapTagInput_' + nodeIdEscaped + '_' + tagMapIndex).val();
		
		//check that the tag name only contains letters or numbers
		if(tagName != null && tagName.match(/^\w*$/)) {
			//get the selected function name
			var functionName = $('#tagMapFunctionSelect_' + nodeIdEscaped + '_' + tagMapIndex).val();
			
			if(functionName == null) {
				functionName = '';
			}
			
			var functionArgs = [];
			
			//get the tag map function
			var tagMapFunction = node.getTagMapFunctionByName(functionName);
			
			if(tagMapFunction != null) {
				//loop through all the function args for the given function
				for(var argCounter=0; argCounter<tagMapFunction.functionArgs.length; argCounter++) {
					var argValue = '';
					
					if($('#tagMapFunctionArgs_' + nodeIdEscaped + '_' + tagMapIndex + '_' + argCounter).length != 0) {
						//get the value of the function arg that the user has input into the text input
						argValue = $('#tagMapFunctionArgs_' + nodeIdEscaped + '_' + tagMapIndex + '_' + argCounter).val();
					}
					
					//check if the arg value is a number string
					if(!isNaN(argValue)) {
						//the value is a number string so we will convert the string to a number
						argValue = Number(argValue);
					}
					
					//put the function arg value into the array
					functionArgs[argCounter] = argValue;
				}			
			}

			//update the tag map attributes
			tagMap.tagName = tagName;
			tagMap.functionName = functionName;
			tagMap.functionArgs = functionArgs;

			//generate the tag map html
			var tagMapHtml = '';
			tagMapHtml += this.getTagMapInnerHtml(nodeId, tagName, functionName, functionArgs, tagMapIndex);
			
			/*
			 * insert the tag map html into the tag map div.
			 * this will overwrite the previous version of the
			 * tag map. overwriting is much easier to perform
			 * in the case when the user changes the functionName
			 * and we need to generate additional text input elements
			 * for the function args.
			 */
			$('#tagMapDiv_' + nodeIdEscaped + '_' + tagMapIndex).html(tagMapHtml);
			
			//save the project to the server
			this.saveProject();
		} else {
			//tag contains invalid characters
			alert('Error: tag can only contain letters and numbers');
			
			//get the old tag
			var oldTag = tagMap.tagName;
			
			//set the tag back to the previous value
			$('#tagMapTagInput_' + nodeIdEscaped + '_' + tagMapIndex).val(oldTag);
		}
	}
};

/**
 * Get the html for the tag map
 * @param nodeId the id of the node
 * @param tagName the tag name
 * @param functionName the function name
 * @param functionArgs an array of the function arg values
 * @param tagMapIndex (optional) the index of the tag map within 
 * the tag map array for the step
 * @returns the tag map html to display in the UI
 */
View.prototype.getTagMapHtml = function(nodeId, tagName, functionName, functionArgs, tagMapIndex) {
	//get the node
	var node = this.getProject().getNodeById(nodeId);
	
	//check if tag map index was passed in
	if(tagMapIndex == null) {
		/*
		 * get the number of tag maps which we will use
		 * as the index for the new tag map
		 */
		tagMapIndex = node.tagMaps.length;
	}
	
	var tagMapDiv = "";
	
	//create the div to contain the tag map elements
	tagMapDiv += "<div id='tagMapDiv_" + nodeId + "_" + tagMapIndex + "' class='tagMapForStep_" + nodeId + "'>";
	
	//create the inner html for the tag map
	tagMapDiv += this.getTagMapInnerHtml(nodeId, tagName, functionName, functionArgs, tagMapIndex);
	
	tagMapDiv += "</div>";
	
	return tagMapDiv;
};

/**
 * Get the inner html for the tag map
 * @param nodeId the id of the node
 * @param tagName the tag name
 * @param functionName the function name
 * @param functionArgs the function args
 * @param tagMapIndex (optional) the index of the tag map within 
 * the tag map array for the step
 * @return the tag map inner html which contains the tags and
 * tag map UI for the given step
 */
View.prototype.getTagMapInnerHtml = function(nodeId, tagName, functionName, functionArgs, tagMapIndex) {
	//get the node
	var node = this.getProject().getNodeById(nodeId);
	
	//get the tag map functions for this step type
	var tagMapFunctions = node.getTagMapFunctions();
	
	//get the tags in the project
	var tags = this.getProject().getAllUniqueTagsInProject();
	
	//sort the tags alphabetically
	tags.sort(this.sortAlphabetically);
	
	//get the escaped node id
	var nodeIdEscaped = this.escapeIdForJquery(nodeId);
	
	//check if tag map index was passed in
	if(tagMapIndex == null) {
		/*
		 * get the number of tag maps which we will use
		 * as the index for the new tag map
		 */
		tagMapIndex = node.tagMaps.length;
	}
	
	var tagMapInnerHtml = "";
	
	//create the div to contain the tag
	tagMapInnerHtml += "<div id='tagMapTagNameDiv_" + nodeId + "_" + tagMapIndex + "' style='display:inline'>";
	tagMapInnerHtml += "Tag: ";
	tagMapInnerHtml += "<input id='tagMapTagInput_" + nodeId + "_" + tagMapIndex + "' type='text' style='display:inline' size='12' value='" + tagName + "' onchange='eventManager.fire(\"tagMapChanged\", [\"" + nodeId + "\", " + tagMapIndex + "])'/>";
	tagMapInnerHtml += "</div>";
	
	//create the div to contain the function name
	tagMapInnerHtml += "<div id='tagMapFunctionNameDiv_" + nodeId + "_" + tagMapIndex + "' style='display:inline'>";
	tagMapInnerHtml += "Function: ";
	
	var tagMapFunctionNameHtml = "";
	
	//create an empty string function name option
	tagMapFunctionNameHtml = "<option></option>";
	
	var tagMapFunctionArgsHtml = "";
	
	//loop through all the available tag map functions for this step type
	for(var x=0; x<tagMapFunctions.length; x++) {
		//get a function
		var tagMapFunction = tagMapFunctions[x];
		
		if(tagMapFunction != null) {
			//get the function name and args
			var tagMapFunctionName = tagMapFunction.functionName;
			var tagMapFunctionArgs = tagMapFunction.functionArgs;
			
			if(tagMapFunctionName == functionName) {
				/*
				 * the function name matches so this will be the one that
				 * is selected in the drop down
				 */
				tagMapFunctionNameHtml += "<option selected>";
				
				//loop through all the tag map function args
				for(var y=0; y<tagMapFunctionArgs.length; y++) {
					//get a function arg name e.g. 'Min Score'
					var functionArg = tagMapFunctionArgs[y];
					var argValue = '';
					
					if(functionArgs[y] != null) {
						//get the arg value e.g. 30
						argValue = functionArgs[y];
					}
					
					//create the text input for the function arg
					tagMapFunctionArgsHtml += functionArg + ": ";
					tagMapFunctionArgsHtml += "<input id='tagMapFunctionArgs_" + nodeId + "_" + tagMapIndex + "_" + y + "' type='text' style='display:inline' size='10' value='" + argValue + "' onchange='eventManager.fire(\"tagMapChanged\", [\"" + nodeId + "\", " + tagMapIndex + "])' />";
				}
			} else {
				//this function name is not the one that is selected for this tag map
				tagMapFunctionNameHtml += "<option>";
			}
			
			//add the function name to the drop down
			tagMapFunctionNameHtml += tagMapFunctionName;
			tagMapFunctionNameHtml += "</option>";
		}
	}
	
	//create the select drop down for the tag map function names
	tagMapInnerHtml += "<select id='tagMapFunctionSelect_" + nodeId + "_" + tagMapIndex + "' style='display:inline' onchange='eventManager.fire(\"tagMapChanged\", [\"" + nodeId + "\", " + tagMapIndex + "])'>";
	tagMapInnerHtml += tagMapFunctionNameHtml;
	tagMapInnerHtml += "</select>";
	
	tagMapInnerHtml += "</div>";
	
	//create the div to contain the function args
	tagMapInnerHtml += "<div id='tagMapFunctionArgsDiv_" + nodeId + "_" + tagMapIndex + "' style='display:inline'>";
	tagMapInnerHtml += tagMapFunctionArgsHtml;
	tagMapInnerHtml += "</div>";
	
	//create the div to delete the tag map
	tagMapInnerHtml += "<div id='tagMapDelete_" + nodeId + "_" + tagMapIndex + "' style='display:inline;cursor:pointer' onclick='eventManager.fire(\"removeTagMap\", [\"" + nodeId + "\", \"" + tagMapIndex + "\"])'>";
	tagMapInnerHtml += "[x]";
	tagMapInnerHtml += "</div>";
	
	return tagMapInnerHtml;
};

/**
 * Remove a tag map function from the step. This function regenerates
 * the html for the tag maps so that the index of the tag map in the
 * array in the step is consistent with the index of the tag map div
 * index. Here's an example
 * 
 * tagMaps = [tagmapA, tagMapB, tagMapC]
 * 
 * DOM contains
 * 'tagMapDiv_node_1.su_0' div which displays tagMapA 
 * 'tagMapDiv_node_1.su_1' div which displays tagMapB
 * 'tagMapDiv_node_1.su_2' div which displays tagMapC
 * 
 * now if we delete tagMapA, the tagMaps will look like this
 * 
 * tagMaps = [tagMapB, tagMapC]
 * 
 * so now we need to display tagMapB in 'tagMapDiv_node_1.su_0'
 * and tagMapC in 'tagMapDiv_node_1.su_1'
 * 
 * DOM contains
 * 'tagMapDiv_node_1.su_0' div which displays tagMapB 
 * 'tagMapDiv_node_1.su_1' div which displays tagMapC
 * 
 * @param nodeId the id of the node
 * @param tagMapIndex the index of the tag map
 */
View.prototype.removeTagMap = function(nodeId, tagMapIndex) {
	//get the node
	var node = this.getProject().getNodeById(nodeId);
	
	//get the escaped node id
	var nodeIdEscaped = this.escapeIdForJquery(nodeId);
	
	//get the tag maps for the step
	var tagMaps = node.tagMaps;
	
	if(tagMaps != null) {
		//remove the tag map from the tag map array in the step
		tagMaps.splice(tagMapIndex, 1);
	}

	//loop through the tag maps and regenerate the html for all of them
	for(var x=0; x<tagMaps.length; x++) {
		//get a tag map
		var tagMap = tagMaps[x];
		
		//get the tag map attributes
		var tagName = tagMap.tagName;
		var functionName = tagMap.functionName;
		var functionArgs = tagMap.functionArgs;
		
		//get the html for the tag map
		var tagMapHtml = '';
		tagMapHtml += this.getTagMapInnerHtml(nodeId, tagName, functionName, functionArgs, x);
		
		//insert the html into the div
		$('#tagMapDiv_' + nodeIdEscaped + '_' + x).html(tagMapHtml);
	}
	
	//remove the last tag map element in the DOM
	$('#tagMapDiv_' + nodeIdEscaped + '_' + tagMaps.length).remove();
	
	//save the project to the server
	this.saveProject();
};

/**
 * The author has changed the tag name
 * @param nodeId the id of the node
 * @param tagIndex the index of the tag in the tag array for the step
 */
View.prototype.tagNameChanged = function(nodeId, tagIndex) {
	//get the node
	var node = this.getProject().getNodeById(nodeId);
	
	//get the escaped node id
	var nodeIdEscaped = this.escapeIdForJquery(nodeId);
	
	//check if the step has tags
	if(node.tags == null) {
		//the step does not have tags so we will create an array for it
		node.tags = [];
	}
	
	//get the existing tags
	var existingTags = node.tags;
	
	//get the new tag name
	var newTagName = $('#tagInput_' + nodeIdEscaped + '_' + tagIndex).val();
	
	//check that the tag name only contains letters or numbers
	if(newTagName != null && newTagName.match(/^\w*$/)) {
		//update the tag in the project
		existingTags[tagIndex] = newTagName;

		//save the project back to the server
		this.saveProject();		
	} else {
		//tag contains invalid characters
		alert('Error: tag can only contain letters and numbers');
		
		//get the old tag
		var oldTag = existingTags[tagIndex];
		
		//set the tag back to the previous value
		$('#tagInput_' + nodeIdEscaped + '_' + tagIndex).val(oldTag);
	}
};

/**
 * Remove the tag from the step
 * @param nodeId the id of the node
 * @param tagIndex the index of the tag in the tag array for the step
 */
View.prototype.removeTag = function(nodeId, tagIndex) {
	//get the node
	var node = this.getProject().getNodeById(nodeId);
	
	//get the escaped node id
	var nodeIdEscaped = this.escapeIdForJquery(nodeId);
	
	if(node != null) {
		//get the tags for the step
		var tags = node.tags;
		
		if(tags != null) {
			//remove the tag from the step
			tags.splice(tagIndex, 1);
			
			/*
			 * update the tag displays in the UI. basically what
			 * we are doing is shifting all the tags in the UI
			 * and then deleting the last tag element in the UI.
			 */
			for(var x=0; x<tags.length; x++) {
				//get the tag
				var tag = tags[x];

				//update the tag in the UI
				$('#tagInput_' + nodeIdEscaped + "_" + x).val(tag);
			}
			
			//remove the last tag div
			$('#tagDiv_' + nodeIdEscaped + "_" + tags.length).remove();
			
			//save the project to the server
			this.saveProject();
		}
	}
};

/**
 * Add a tag map to the step
 * @param nodeId the id of the node
 */
View.prototype.addTagMap = function(nodeId) {
	//get the node
	var node = this.getProject().getNodeById(nodeId);
	
	//get the escaped node id
	var nodeIdEscaped = this.escapeIdForJquery(nodeId);

	//check if the step has any tag maps
	if(node.tagMaps == null) {
		//the step does not have any tag maps so we will create an array for it
		node.tagMaps = [];
	}
	
	//get the tag maps for the step
	var tagMaps = node.tagMaps;
	
	/*
	 * get the number of tag maps which we will use as the tag map index
	 * for the new tag map we are adding
	 */
	var tagMapIndex = tagMaps.length;
	
	//get the value of the tag map that the author has selected
	var tagMapSelected = $('#addTagMapSelect_' + nodeIdEscaped + ' option:selected').val();
	
	var tagName = "";
	var functionName = "";
	var functionArgs = [];
	
	if(tagMapSelected == null || tagMapSelected == "(Create New Tag Map)") {
		//author is creating a new tag map
	} else {
		/*
		 * the author has selected an existing tag map and not
		 * the option to create a brand new tag map
		 */
		
		//create the regex string so we can extract the tag map attributes
		var regExString = /Tag:\s*(\w*),\s*Function:\s*(\w*),\s*Arguments:\s*([\w\s]*)/;
		var regEx = new RegExp(regExString);
		
		//run the regex on the selected tag map string
		var matches = regEx.exec(tagMapSelected);

		for(var x=0; x<matches.length; x++) {
			if(x == 1) {
				//first capture is the tag name
				tagName = matches[x];
			} else if(x == 2) {
				//second capture is the function name
				functionName = matches[x];
			} else if(x == 3) {
				//third capture is the function args which
				arguments = matches[x];
				
				if(arguments != null && arguments != "") {
					//split the arguments into an array
					functionArgs = arguments.split(', ');
				}
			}
		}
	}
	
	if(functionArgs != null && functionArgs != "") {
		//loop through all the function args
		for(var a=0; a<functionArgs.length; a++) {
			var functionArg = functionArgs[a];
			
			//check if the arg is a number string
			if(functionArg != "" && !isNaN(functionArg)) {
				//the arg is a number string so we will convert it to a number
				functionArgs[a] = Number(functionArg);
			}
		}		
	}

	//create the html for the tag map
	var html = "";
	html += this.getTagMapHtml(nodeId, tagName, functionName, functionArgs);
	
	//append the tag map html
	$('#tagMapTd_' + nodeIdEscaped).append(html);
	
	//create the tag map object
	var newTagMap = {
		tagName:tagName,
		functionName:functionName,
		functionArgs:functionArgs
	};
	
	//add the tag map object to the step
	tagMaps.push(newTagMap);
	
	//save the project back to the server
	this.saveProject();
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/authorview_tags.js');
}