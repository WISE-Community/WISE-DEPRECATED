/*
 * MatchSequenceNode
 */

MatchSequenceNode.prototype = new Node();
MatchSequenceNode.prototype.constructor = MatchSequenceNode;
MatchSequenceNode.prototype.parent = Node.prototype;
MatchSequenceNode.authoringToolName = "Match & Sequence";
MatchSequenceNode.authoringToolDescription = "Students drag and drop choices into boxes";
MatchSequenceNode.prototype.i18nEnabled = true;
MatchSequenceNode.prototype.i18nPath = "vle/node/matchsequence/i18n/";
MatchSequenceNode.prototype.supportedLocales = {
		"en_US":"en_US",
		"es":"es",
		"iw":"he",
		"ja":"ja",
		"ko":"ko",
		"nl":"nl",
		"nl_GE":"nl",
		"nl_DE":"nl",
		"zh_CN":"zh_CN"
};

MatchSequenceNode.tagMapFunctions = [
                                     {functionName:'importWork', functionArgs:[]},
                                     {functionName:'showPreviousWork', functionArgs:[]}
                                     ];

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {MatchSequenceNode}
 */
function MatchSequenceNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];

	this.tagMapFunctions = this.tagMapFunctions.concat(MatchSequenceNode.tagMapFunctions);
};

/**
 * Takes in a state JSON object and converts it into an MSSTATE object
 * @param nodeStatesJSONObj a state JSON object
 * @return an MSSTATE object
 */
MatchSequenceNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	return MSSTATE.prototype.parseDataJSONObj(stateJSONObj);
};


MatchSequenceNode.prototype.onExit = function() {

};

/**
 * Renders the student work into the div. The grading tool will pass in a
 * div id to this function and this function will insert the student data
 * into the div.
 * 
 * @param displayStudentWorkDiv the div we will render the student work into
 * @param nodeVisit the student work
 * @param childDivIdPrefix (optional) a string that will be prepended to all the 
 * div ids use this to prevent DOM conflicts such as when the show all work div
 * uses the same ids as the show flagged work div
 * @param workgroupId the id of the workgroup this work belongs to
 */
MatchSequenceNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	//create the match sequence object so we can reference the content later
	var matchSequence = new MS(this, this.view);

	//get the latest state object
	var state = nodeVisit.getLatestWork();

	var text = "";

	//loop through all the target buckets
	for(var h=0;h<state.buckets.length;h++){
		var bucket = state.buckets[h];
		//get the text for the bucket
		var bucketText = bucket.text;

		/*
		 * each bucket will be represented as following
		 * 
		 * ([bucketText]: choice1Text, choice2Text)
		 */
		text += "([" + bucketText + "]: ";

		var choicesText = "";

		//loop through the choices
		for(var g=0;g<bucket.choices.length;g++){
			//if this is not the first choice, add a comma to separate them
			if(choicesText != "") {
				choicesText += "<br/>";
			}

			//add the bucket text
			choicesText += bucket.choices[g].text;
		};

		text += choicesText;

		//close the bucket and add a new line for easy reading
		text += ")<br>";
	};

	//loop through the source bucket
	if (state.sourceBucket != null) {
		var bucket = state.sourceBucket;
		//get the text for the source bucket
		var bucketText = bucket.text;

		/*
		 * each bucket will be represented as following
		 * 
		 * ([bucketText]: choice1Text, choice2Text)
		 */
		text += "([" + bucketText + "]: ";

		var choicesText = "";

		//loop through the choices
		for(var g=0;g<bucket.choices.length;g++){
			//if this is not the first choice, add a comma to separate them
			if(choicesText != "") {
				choicesText += "<br/>";
			}

			//add the bucket text
			choicesText += bucket.choices[g].text;
		};

		text += choicesText;

		//close the bucket and add a new line for easy reading
		text += ")<br>";
	}


	if(state.score != null) {
		//get the max score
		var maxScore = matchSequence.getMaxPossibleScore();

		text += "<br>";
		text += this.view.getI18NStringWithParams("autograded_score",[state.store + "/" + maxScore],"MatchSequenceNode");
	}

    if (state.isCorrect != null) {
        text += "<br>";
        text += "Is Correct: " + state.isCorrect;
    }

	displayStudentWorkDiv.append(text);
};

/**
 * Determine whether the student has completed the step or not
 * @param nodeState the latest node state for the step
 * @return whether the student has completed the step or not
 */
MatchSequenceNode.prototype.isCompleted = function(nodeVisits) {
	var hasCorrectness = (this.content.getContentJSON().hasCorrectness != null) ? this.content.getContentJSON().hasCorrectness : true;
	
	var isCompleted = false;
	
	var nodeState = this.view.getLatestNodeStateWithWorkFromNodeVisits(nodeVisits);
	
	if (hasCorrectness) {
		if(nodeState != null && nodeState != '') {
			if(nodeState.isCorrect) {
				isCompleted = true;
			}
		}
	} else {
		return nodeState != null; 
	}

	return isCompleted;
};
/**
 * Returns the order in which the branching paths should appear based on student response.
 */
MatchSequenceNode.prototype.getBranchPathOrderValues = function() {
	var branchPathOrder = [];
	var state = view.getLatestStateForNode(this.id);

	//loop through all the target buckets
	for(var h=0;h<state.buckets.length;h++){
		var bucket = state.buckets[h];

		//loop through the choices
		for(var g=0;g<bucket.choices.length;g++){
			var choice = bucket.choices[g];
			branchPathOrder.push(choice.identifier);
		};
	};

	//loop through the source bucket
	if (state.sourceBucket != null) {
		var bucket = state.sourceBucket;

		//loop through the choices
		for(var g=0;g<bucket.choices.length;g++){
			var choice = bucket.choices[g];
			branchPathOrder.push(choice.identifier);
		};
	}
	return branchPathOrder;
};

/**
 * Return the student work in html format so it can be displayed
 * @param work the student node state for this step
 * @return a string containing the html that will display the student
 * work for this step
 */
MatchSequenceNode.prototype.getStudentWorkHtmlView = function(work) {
	var html = '';
	
	if(work != null) {
		//get the buckets from the work
		var buckets = work.buckets;
		
		if(buckets != null) {
			//create the table that will display the buckets and choices
			var table = $('<table></table>');
			table.css('border', '1px solid black');
			table.css('border-collapse', 'collapse');
			
			//loop through all the buckets
			for(var x=0; x<buckets.length; x++) {
				//get a bucket
				var bucket = buckets[x];

				//make a row for the bucket and the choices that were placed in the bucket
				var tr = $('<tr></tr>');
				
				if(bucket != null) {
					//get the bucket name
					var bucketText = bucket.text;
					
					//get the choices the student put in this bucket
					var choices = bucket.choices;
					
					//add the bucket name in a td
					var bucketTextTD = $('<td><p>' + bucketText + '</p></td>');
					bucketTextTD.css('border', '1px solid black');
					bucketTextTD.css('vertical-align', 'top');
					bucketTextTD.css('padding', '10');
					tr.append(bucketTextTD);
					
					if(choices != null) {
						var choiceTextForBucket = '';
						
						/*
						 * loop through all the choices the student put in this bucket
						 * and accumulate them so we can put them all in a single td
						 */
						for(var y=0; y<choices.length; y++) {
							//get a choice
							var choice = choices[y];
							
							if(choice != null) {
								//get the choice text
								var choiceText = choice.text;
								
								//add the choice text in a p
								choiceTextForBucket += '<p>' + choiceText + '</p>';
							}
						}
						
						//put all the choices the student placed in the bucket into a td
						var choiceTextTD = $('<td>' + choiceTextForBucket + '</td>');
						choiceTextTD.css('border', '1px solid black');
						choiceTextTD.css('vertical-align', 'top');
						choiceTextTD.css('padding', '10');
						tr.append(choiceTextTD);
					}
				}
				
				//add the row to the table
				table.append(tr);
			}
			
			//create a temporary div just so we can get the table html including the table tags
			var tempDiv = $('<div></div>');
			
			//add the table to the div
			tempDiv.append(table);
			
			//get the html inside the div which will be the table html
			html += tempDiv.html();
		}
	}
	
	return html;
};

/**
 * Returns whether this step type can be special exported
 * @return a boolean value
 */
MatchSequenceNode.prototype.canSpecialExport = function() {
	return true;
};

MatchSequenceNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/matchsequence/matchsequence.html');
};

/**
 * Get the bucket the given choice is in
 * @param nodeState the student work
 * @param choiceId we want to determine which bucket this choice is in
 * @returns the bucket name the choice is in
 */
MatchSequenceNode.prototype.getBucketChoiceIsIn = function(nodeState, choiceId) {
	
	var bucketName = null;
	
	// get the source bucket
	var sourceBucket = nodeState.sourceBucket;
	
	if (sourceBucket != null) {
		
		if (this.isChoiceInBucket(choiceId, sourceBucket)) {
			// the choice is in the source bucket
			bucketName = sourceBucket.text;
		}
	}
	
	var buckets = nodeState.buckets;
	
	if (buckets != null) {
		
		// loop through all the buckets
		for (var b = 0; b < buckets.length; b++) {
			var tempBucket = buckets[b];
			
			if (this.isChoiceInBucket(choiceId, tempBucket)) {
				// the choice is in the bucket
				bucketName = tempBucket.text;
			}
		}
	}
	
	return bucketName;
};

/**
 * Check if a choice is in a given bucket
 * @param choiceId the choice
 * @param bucket the bucket
 * @returns whether the choice is in the bucket or not
 */
MatchSequenceNode.prototype.isChoiceInBucket = function(choiceId, bucket) {
	
	var result = false;
	
	if (choiceId != null && bucket != null) {
		
		// get all the choices that were put in the bucket
		var bucketChoices = bucket.choices;
		
		if (bucketChoices != null) {
			
			// loop through all the choices that were put in the bucket
			for (var c = 0; c < bucketChoices.length; c++) {
				var tempChoice = bucketChoices[c];
				
				if (tempChoice != null) {
					if (choiceId === tempChoice.identifier) {
						/*
						 * we have found the choice we are looking for which
						 * means it is in the bucket
						 */
						result = true;
					}
				}
			}
		}
	}
	
	return result;
};

/**
 * Get the buckets that the choices are in
 * e.g.
 * choiceIds = ['choice1', 'choice2', 'choice3']
 * and there are buckets named 'Source', 'Bucket1', 'Bucket2'
 * and the student placed
 * 'choice1' in 'Source'
 * 'choice2' in 'Bucket1'
 * 'choice3' in 'Bucket2'
 * the bucketNames array will be
 * bucketNames = ['Source', 'Bucket1', 'Bucket1']
 *
 * @param nodeState the student work
 * @param choiceIds the choice ids
 * @return an array of bucket names. the length of the bucket array will be
 * the same length as the choiceIds array.
 * bucketName[0] is the name of the bucket that choiceIds[0] is in
 * bucketName[1] is the name of the bucket that choiceIds[1] is in
 * etc.
 */
MatchSequenceNode.prototype.getBucketsChoicesAreIn = function(nodeState, choiceIds) {
	
	var bucketNames = [];
	
	if (nodeState != null && choiceIds != null) {
		
		// loop through all the choice ids
		for (var c = 0; c < choiceIds.length; c++) {
			var choiceId = choiceIds[c];
			
			// get the bucket name the choice is in
			var bucketName = this.getBucketChoiceIsIn(nodeState, choiceId);
			
			if (bucketName == null) {
				// it should never enter this case
				bucketNames.push('?');
			} else {
				// add the value into the cell
				bucketNames.push(view.wrapInQuotesForCSVIfNecessary(bucketName));
			}
		}
	}
	
	return bucketNames;
};

/**
 * Get the choice object by choice id
 * @param choiceId the choice id
 * @param choices an array of choice objects
 * @returns the choice object with the given choiceId
 */
MatchSequenceNode.prototype.getChoiceById = function(choiceId, choices) {
	var choice = null;
	
	if (choiceId != null && choices != null) {
		
		// loop through all the choices
		for (var c = 0; c < choices.length; c++) {
			var tempChoice = choices[c];
			
			if (tempChoice != null && choiceId === tempChoice.identifier) {
				// we have found the choice we are looking for
				choice = tempChoice;
				break;
			}
		}
	}
	
	return choice;
};

/**
 * Get the value of the choice
 * @param choiceId the choice id
 * @param choices an array of choice objects
 * @returns get the value of the choice
 */
MatchSequenceNode.prototype.getChoiceValueById = function(choiceId, choices) {
	
	var choiceValue = null;
	
	// get the choice
	var choice = this.getChoiceById(choiceId);
	
	if (choice != null) {
		// get the choice value
		choiceValue = choice.value;
	}
	
	return choiceValue;
};

/**
 * Get the bucket by id
 * @param bucketId the bucket id
 * @param buckets an array of bucket objects
 * @returns the bucket object with the given bucketId
 */
MatchSequenceNode.prototype.getBucketById = function(bucketId, buckets) {
	var bucket = null;
	
	if (bucketId != null && buckets != null) {
		
		// loop througha all the buckets
		for (var b = 0; b < buckets.length; b++) {
			var tempBucket = buckets[b];
			
			if (tempBucket != null && bucketId === tempBucket.identifier) {
				// we have found the bucket we are looking for
				bucket = tempBucket;
				break;
			}
		}
	}
	
	return bucket;
};

/**
 * Get the bucket name
 * @param bucketId the bucket id
 * @param buckets an array of bucket objects
 * @returns the bucket name with the given bucketId
 */
MatchSequenceNode.prototype.getBucketNameById = function(bucketId, buckets) {
	
	var bucketName = null;
	
	// get the bucket
	var bucket = this.getBucketById(bucketId);
	
	if (bucket != null) {
		// get the bucket name
		bucketName = bucket.name;
	}
	
	return bucketName;
};

/**
 * Generate the special export. Each row represents the latest work for a 
 * student. Each student data column represents a choice. The cell value is
 * the name of the bucket that the student placed the choice in.
 * @param nodeId the node id to generate the export for
 * @param revisions whether to output all revisions, latest, or first and latest
 * the acceptable values are 'all', 'latest', 'firstAndLatest'
 */
MatchSequenceNode.prototype.generateMatchSequenceSpecialExportCSV = function(nodeId, revisions) {
	
	var rows = [];
	
	var project = view.getProject();	
	var node = project.getNodeById(nodeId);
	var runId = view.getConfig().getConfigParam('runId');
	var stepNumberAndTitle = project.getStepNumberAndTitle(nodeId);
	var teacherUserName = view.userAndClassInfo.getTeacherUserInfo().userName;
	var projectId = view.config.getConfigParam('projectId');
	var parentProjectId = view.config.getConfigParam('parentProjectId');
	var projectName = project.getTitle();
	var nodeType = project.getNodeById(nodeId).type;

	/*
	 * remove the Node part of the node type for example
	 * TableNode will be changed to Table
	 */
	nodeType = nodeType.replace('Node', '');

	var workgroupIds = view.userAndClassInfo.getWorkgroupIdsInClass();
	
	// add the metadata cells in the header row
	var headerRow = [
		'Workgroup Id',
		'WISE Id 1',
		'WISE Id 2',
		'WISE Id 3',
		'Class Period',
		'Teacher Login',
		'Project Id',
		'Parent Project Id',
		'Project Name',
        'Run Id',
        'Step Work Id',
        'Step Title',
        'Step Type',
		'Revision'
	];
	
	var choiceIds = [];
	var bucketIds = [];
	
	var choices = [];
	var buckets = [];
	
	if (node != null) {
		// get the step content
		var contentJSON = node.content.getContentJSON();
		
		// get the source bucket name
		var sourceBucketName = contentJSON.sourceBucketName;
		
		var assessmentItem = contentJSON.assessmentItem;
		
		if (assessmentItem != null) {
			var interaction = assessmentItem.interaction;
			
			if (interaction != null) {
				// get the choices
				choices = interaction.choices;
				
				// get the buckets
				buckets = interaction.fields;
				
				if (choices != null) {
					
					// loop through all the choices
					for (var c = 0; c < choices.length; c++) {
						var tempChoice = choices[c];
						
						if (tempChoice != null) {
							var tempIdentifier = tempChoice.identifier;
							var tempText = tempChoice.value;
							
							// accumulate the choice ids so we can use them later
							choiceIds.push(tempIdentifier);
							
							// add the value to the row
							headerRow.push(view.wrapInQuotesForCSVIfNecessary(tempText));
						}
					}
				}
			}
		}
	}
	
	// add the header row to our rows
	rows.push(headerRow);
	
	// loop through all the workgroups to obtain the student data
	for (var w = 0; w < workgroupIds.length; w++) {

		var workgroupId = workgroupIds[w];
		var classmate = view.userAndClassInfo.getClassmateByWorkgroupId(workgroupId);

		if (classmate != null) {

			// get all the node visits for view student for the step
			var nodeVisits = view.model.getNodeVisitsByNodeIdAndWorkgroupId(nodeId, workgroupId);

			// flag to check if we added a row for this workgroup yet
			var rowAdded = false;

			if (nodeVisits != null) {
				if (revisions == null || revisions == 'latest') {
					// we will get the latest revision
					
					// get the latest node state and the node visit it was in
					var returnValue = MatchSequenceNode.prototype.getLatestNodeStateFromNodeVisits(nodeVisits);
					
					if (returnValue != null) {
						var nodeVisit = returnValue.nodeVisit;
						var nodeState = returnValue.nodeState;
						
						var revisionValue = 'Latest';
						
						// generate the values for the row
						row = this.generateSpecialExportCSVRow(nodeId, workgroupId, nodeVisit, nodeState, revisionValue, choiceIds);
						
						// add the row to the rows
						rows.push(row);
						
						rowAdded = true;
					}
				} else if (revisions == 'all') {
					// we will get all the revisions
					
					var revisionCount = 1;
					
					// loop through all the node visits
					for (var nv = 0; nv < nodeVisits.length; nv++) {
						var nodeVisit = nodeVisits[nv];
						
						if (nodeVisit != null) {
							
							var nodeStates = nodeVisit.nodeStates;
							
							if (nodeStates != null) {
								
								// loop through all the node states
								for (var ns = 0; ns < nodeStates.length; ns++) {
									var nodeState = nodeStates[ns];
									
									if (nodeState != null) {
										var revisionValue = revisionCount;
										
										// generate the values for the row
										row = this.generateSpecialExportCSVRow(nodeId, workgroupId, nodeVisit, nodeState, revisionValue, choiceIds);
										
										// add the row to the rows
										rows.push(row);
										
										// increment the revision count
										revisionCount++;
										
										rowAdded = true;
									}
								}
							}
						}
					}
				} else if (revisions == 'firstAndLatest') {
					// we will get the first and latest revisions
					
					// get the first node state and the node visit it was in
					var firstReturnValue = MatchSequenceNode.prototype.getFirstNodeStateFromNodeVisits(nodeVisits);
					
					// get the latest node state and the node visit it was in
					var latestReturnValue = MatchSequenceNode.prototype.getLatestNodeStateFromNodeVisits(nodeVisits);
					
					var firstNodeState = null;
					var firstNodeVisit = null;
					var latestNodeState = null;
					var latestNodeVisit = null;
					
					if (firstReturnValue != null) {
						firstNodeVisit = firstReturnValue.nodeVisit;
						firstNodeState = firstReturnValue.nodeState;
					}
					
					if (latestReturnValue != null) {
						latestNodeVisit = latestReturnValue.nodeVisit;
						latestNodeState = latestReturnValue.nodeState;
					}
					
					if (firstNodeState == latestNodeState) {
						// the first and latest node state is the same
						
						var revisionValue = 'Only One Work';
						
						// generate the values for the row
						row = this.generateSpecialExportCSVRow(nodeId, workgroupId, latestNodeVisit, latestNodeState, revisionValue, choiceIds);
						
						// add the row to the rows
						rows.push(row);
						
						rowAdded = true;
					} else {
						// the first and latest node state are not the same node state
						
						if (firstNodeState != null) {
							var revisionValue = 'First';
							
							// generate the values for the row
							row = this.generateSpecialExportCSVRow(nodeId, workgroupId, firstNodeVisit, firstNodeState, revisionValue, choiceIds);
							
							// add the row to the rows
							rows.push(row);
							
							rowAdded = true;
						}
						
						if (latestNodeState != null) {
							var revisionValue = 'Latest';
							
							// generate the values for the row
							row = this.generateSpecialExportCSVRow(nodeId, workgroupId, latestNodeVisit, latestNodeState, revisionValue, choiceIds);
							
							// add the row to the rows
							rows.push(row);
							
							rowAdded = true;
						}
					}
				}
			}

			if (!rowAdded) {
				/*
				 * we have not added a row for this workgroup yet so we will
				 * add it now with blank work cells
				 */
				var nodeVisit = null;
				var nodeState = null;
				var revisionValue = '';
				
				// generate the values for the row
				row = this.generateSpecialExportCSVRow(nodeId, workgroupId, nodeVisit, nodeState, revisionValue, choiceIds);
				
				// add the row to the rows
				rows.push(row);
			}
		}
	}

	// get the csv string
	var csvString = view.convertToCSVString(rows);

	// get the file name
	var fileName = 'Run_' + runId + '_Step_' + stepNumberAndTitle + '.csv';

	// download the csv file
	view.downloadCSV(fileName, csvString);
};

/**
 * Generate the csv row
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 * @param nodeVisit the node visit
 * @param nodeState the node state
 * @param revision the value that will go into the revision column
 * @param choiceIds all the choice ids for the step 
 */
MatchSequenceNode.prototype.generateSpecialExportCSVRow = function(
	nodeId,
	workgroupId,
	nodeVisit,
	nodeState,
	revision,
	choiceIds) {
	
	var project = view.getProject();	
	var node = project.getNodeById(nodeId);
	var runId = view.getConfig().getConfigParam('runId');
	var stepNumberAndTitle = project.getStepNumberAndTitle(nodeId);
	var teacherUserName = view.userAndClassInfo.getTeacherUserInfo().userName;
	var projectId = view.config.getConfigParam('projectId');
	var parentProjectId = view.config.getConfigParam('parentProjectId');
	var projectName = project.getTitle();
	var nodeType = project.getNodeById(nodeId).type;
	var classmate = view.userAndClassInfo.getClassmateByWorkgroupId(workgroupId);
	
	if (classmate != null) {
		var row = [];
		
		var periodName = classmate.periodName;

		// add the workgroup id cell
		row.push(workgroupId);

		// add the wise id cells
		var wiseIds = classmate.userIds;
		for (var wi = 0; wi < wiseIds.length; wi++) {
			var wiseId = wiseIds[wi];

			row.push(wiseId);
		}

		// add any necessary empty cells for wise ids (if the workgroup has less than 3 members)
		var numEmptyWISEIdColumns = 3 - wiseIds.length;
		if (numEmptyWISEIdColumns > 0) {
			for (var e = 0; e < numEmptyWISEIdColumns; e++) {
				row.push("");
			}
		}

		// add the period name
		row.push(view.wrapInQuotesForCSVIfNecessary(periodName));

		// add the teacher name
		row.push(view.wrapInQuotesForCSVIfNecessary(teacherUserName));

		// add the project id
		row.push(projectId);

		// add the parent project id
		row.push(parentProjectId);

		// add the project name
		row.push(view.wrapInQuotesForCSVIfNecessary(projectName));

		// add the run id
		row.push(runId);
		
		if (nodeVisit != null && nodeState != null) {
			// add the step work id
			var stepWorkId = parseInt(nodeVisit.id);
			row.push(stepWorkId);

			// add the step number and title
			row.push(view.wrapInQuotesForCSVIfNecessary(stepNumberAndTitle));

			// add the node type
			row.push(nodeType);
			
			row.push(revision);

			// get the bucket names for this row
			var bucketNames = this.getBucketsChoicesAreIn(nodeState, choiceIds);
			
			// add the bucket names to the row
			row = row.concat(bucketNames);
		}
	}
	
	return row;
};

/**
 * Get the first node state from the node visits
 * @param nodeVisits the node visits to search
 * @returns an object containing the first node state and the node visit the
 * node state was in
 */
MatchSequenceNode.prototype.getFirstNodeStateFromNodeVisits = function(nodeVisits) {
	
	if (nodeVisits != null) {
		
		// loop through all the node visits
		for (var nv = 0; nv < nodeVisits.length; nv++) {
			var nodeVisit = nodeVisits[nv];
			
			if (nodeVisit != null) {
				var nodeStates = nodeVisit.nodeStates;
				
				if (nodeStates != null) {
					// loop through all the node states
					for (var ns = 0; ns < nodeStates.length; ns++) {
						var nodeState = nodeStates[ns];
						
						if (nodeState != null) {
							// we have found the first node state
							
							var returnValue = {
								nodeVisit: nodeVisit,
								nodeState: nodeState
							}
							
							return returnValue;
						}
					}
				}
			}
		}
	}
	
	return null;
};

/**
 * Get the latest node state from the node visits
 * @param nodeVisits the node visits to search
 * @returns an object containing the latest node state and the node visit the
 * the node state was in
 */
MatchSequenceNode.prototype.getLatestNodeStateFromNodeVisits = function(nodeVisits) {
	
	if (nodeVisits != null) {
		
		// loop through the node visits from newest to oldest
		for (var nv = nodeVisits.length - 1; nv >= 0; nv--) {
			var nodeVisit = nodeVisits[nv];
			
			if (nodeVisit != null) {
				var nodeStates = nodeVisit.nodeStates;
				
				if (nodeStates != null) {
					// loop through the node states from newest to oldest
					for (var ns = nodeStates.length - 1; ns >= 0; ns--) {
						var nodeState = nodeStates[ns];
						
						if (nodeState != null) {
							// we have found the latest node state
							
							var returnValue = {
								nodeVisit: nodeVisit,
								nodeState: nodeState
							}
							return returnValue;
						}
					}
				}
			}
		}
	}
	
	return null;
};

NodeFactory.addNode('MatchSequenceNode', MatchSequenceNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/matchsequence/MatchSequenceNode.js');
};