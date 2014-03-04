
var regions = [];
var labels = [];
var mappings = [];
var scoringCriteria = [];

var studentLabels = [];

function start() {
	initializeData();
	runScoring();
}

function initializeData() {
	var region1 = {
		id:1,
		name:'hat',
		shape:{
			type:'rectangle',
			x:0,
			y:0,
			width:100,
			height:100
		}
	};
	
	var region2 = {
		id:2,
		name:'bowl',
		shape:{
			type:'circle',
			x:150,
			y:50,
			radius:50
		}
	};
	
	regions.push(region1);
	regions.push(region2);
	
	var label1 = {
		id:1,
		type:'string',
		value:'cat'
	}
	
	var label2 = {
		id:2,
		type:'string',
		value:'cereal'
	}

	var label3 = {
		id:3,
		type:'string',
		value:'z'
	}
	
	labels.push(label1);
	labels.push(label2);
	labels.push(label3);
	
	var mapping1 = {
		id:1,
		regionId:1,
		labelId:1
	}
	
	var mapping2 = {
		id:2,
		regionId:2,
		labelId:2
	}
	
	var mapping3 = {
		id:3,
		regionId:1,
		labelId:3
	}
	
	mappings.push(mapping1);
	mappings.push(mapping2);
	mappings.push(mapping3);
	
	var score1 = {
		id:1,
		logic:'1',
		score:10,
		successFeedback:'You got the cat in the hat!',
		failureFeedback:'You did not get the cat in the hat'
	}
	
	var score2 = {
		id:2,
		logic:'2',
		score:10,
		successFeedback:'You got the cereal in the bowl!',
		failureFeedback:'You did not get the cereal in the bowl'
	}
	
	var score3 = {
		id:3,
		logic:'(1&&2)||3',
		score:20,
		successFeedback:'You got both!!',
		failureFeedback:'You did not get both'
	}
	
	scoringCriteria.push(score1);
	scoringCriteria.push(score2);
	scoringCriteria.push(score3);
	
	var studentLabel1 = {
		id:1,
		x:50,
		y:50,
		value:'cat'
	}
	
	var studentLabel2 = {
		id:2,
		x:110,
		y:90,
		value:'cereal'
	}
	
	studentLabels.push(studentLabel1);
	studentLabels.push(studentLabel2);
}

/**
 * Run the automated scoring and obtain the score and feedback
 */
function runScoring() {
	//add the regions to the svg display
	addRegionsToDisplay(regions);
	
	//add the student labels to the svg display
	addStudentLabelsToDisplay(studentLabels);
	
	printToOutput('<hr/>');
	
	printToOutput('Student Labels');
	printJSONToOutput(studentLabels);
	printToOutput('<hr/>');
	
	//determine which authored labels the student labels match
	matchStudentLabelsToAuthoredLabels(studentLabels, labels);
	
	//determine which regions the student labels are in
	matchStudentLabelsToRegions(studentLabels, regions);
	
	//generate the label to region mappings from the student work
	var studentMappings = generateLabelToRegionMappings(studentLabels);
	
	//calculate which mappings were satisfied
	var mappingResults = calculateSatisfiedMappings(mappings, studentMappings);
	
	//calculate the score and feedback from the mapping results
	var scoreResults = calculateScore(scoringCriteria, mappingResults);
	
	printToOutput('Regions');
	printJSONToOutput(regions);
	printToOutput('<hr/>');
	
	printToOutput('Labels');
	printJSONToOutput(labels);
	printToOutput('<hr/>');
	
	printToOutput('Mappings');
	printJSONToOutput(mappings);
	printToOutput('<hr/>');
	
	printToOutput('Scoring Criteria');
	printJSONToOutput(scoringCriteria);
	printToOutput('<hr/>');
	
	printToOutput('Student Labels Analyzed');
	printJSONToOutput(studentLabels);
	printToOutput('<hr/>');
	
	printToOutput('Student Mappings')
	printJSONToOutput(studentMappings);
	printToOutput('<hr/>');
	
	printToOutput('Mapping Results');
	printJSONToOutput(mappingResults);
	printToOutput('<hr/>');
	
	//get the max score
	var maxScore = getMaxScore(scoringCriteria);
	
	//display the score and feedback
	$('#feedbackDiv').append('Score: ' + scoreResults.score + '/' + maxScore + '<br/>');
	$('#feedbackDiv').append('Feedback:<br/>' + scoreResults.feedback);
}

/**
 * Append the string to the output div
 * @param str a string
 */
function printToOutput(str) {
	$('#output').append(str);
	$('#output').append('<br/>');
}

/**
 * Append the stringified JSON to the output div
 * @param json a JSON object
 */
function printJSONToOutput(json) {
	$('#output').append(JSON.stringify(json, undefined, 3));
	$('#output').append('<br/>');
}

/*
 * Add the regions to the display
 * @param regions an array of region objects
 */
function addRegionsToDisplay(regions) {
	if(regions != null) {
		//loop through all the regions
		for(var x=0; x<regions.length; x++) {
			//get a region
			var region = regions[x];
			
			if(region != null) {
				//get the shape object
				var shape = region.shape;
				
				//get the region name
				var regionName = region.name;
				
				var regionColor = 'orange';
				
				if(shape != null) {
					//get the shape type e.g. 'rectangle' or 'circle'
					var shapeType = shape.type;
					
					if(shapeType == null) {
						
					} else if(shapeType == 'rectangle') {
						//get the x, y, width, and height of the rectangle
						var rx = shape.x;
						var ry = shape.y;
						var rwidth = shape.width;
						var rheight = shape.height;
						
						//create an svg rectangle element
						var svgRectangle = createSVGRectangle(rx, ry, rwidth, rheight, 'none', 1, regionColor);
						
						//add the rectangle to the svg display
						$('#svgDisplay').append(svgRectangle);
						
						//create an svg text element
						var svgText = createSVGText(rx, ry + 10, regionColor, regionName);
						
						//add the text to the svg display
						$('#svgDisplay').append(svgText);
					} else if(shapeType == 'circle') {
						//get the x, y, and radius of the circle
						var cx = shape.x;
						var cy = shape.y;
						var cradius = shape.radius;
						
						//create an svg circle element
						var svgCircle = createSVGCircle(cx, cy, cradius, 'none', 1, regionColor);
						
						//add the circle to the svg display
						$('#svgDisplay').append(svgCircle);
						
						//create an svg text element
						var svgText = createSVGText(cx - cradius, cy - cradius + 10, regionColor, regionName);
						
						//add the text to the svg display
						$('#svgDisplay').append(svgText);
					}
				}
			}
		}
	}
}

/**
 * Create an svg rectangle element
 * @param rx the x position of the top left of the rectangle
 * @param ry the y position of the top left of the rectangle
 * @param rwidth the width
 * @param rheight the height
 * @param fill the color filling the rectangle
 * @param strokeWidth the outline width
 * @param stroke the color of the outline
 * @returns an svg rectangle element
 */
function createSVGRectangle(rx, ry, rwidth, rheight, fill, strokeWidth, stroke) {
	//create an svg rectangle element
	var svgRectangle = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'))
	
	//set the rectangle parameters
	svgRectangle.attr('x', rx);
	svgRectangle.attr('y', ry);
	svgRectangle.attr('width', rwidth);
	svgRectangle.attr('height', rheight);
	svgRectangle.css('fill', fill);
	svgRectangle.css('stroke-width', strokeWidth);
	svgRectangle.css('stroke', stroke);
	
	return svgRectangle;
}

/**
 * Create an svg circle element
 * @param cx the x position of the center of the circle
 * @param cy the y position of the center of the circle
 * @param cradius the radius of the circle
 * @param fill the color filling the circle
 * @param strokeWidth the outline width
 * @param stroke the color of the outline
 * @returns an svg circle element
 */
function createSVGCircle(cx, cy, cradius, fill, strokeWidth, stroke) {
	//create an svg circle element
	var svgCircle = $(document.createElementNS('http://www.w3.org/2000/svg', 'circle'))
	
	//set the circle parameters
	svgCircle.attr('cx', cx);
	svgCircle.attr('cy', cy);
	svgCircle.attr('r', cradius);
	svgCircle.css('fill', fill);
	svgCircle.css('stroke-width', strokeWidth);
	svgCircle.css('stroke', stroke);
	
	return svgCircle;
}

/**
 * Create an svg text element
 * @param x the x position of the top left of the text
 * @param y the y positin of the top left of the text
 * @param fill the the text color
 * @param text the text that will be displayed
 * @returns an svg text element
 */
function createSVGText(x, y, fill, text) {
	//create an svg text element
	var svgText = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'))
	
	//set the text parameters
	svgText.attr('x', x);
	svgText.attr('y', y);
	svgText.css('fill', fill);
	svgText.html(text);
	
	return svgText;
}

/**
 * Add the student labels to the svg display
 * @param studentLabels an array of student label objects
 */
function addStudentLabelsToDisplay(studentLabels) {
	if(studentLabels != null) {
		//loop through all the student labels
		for(var x=0; x<studentLabels.length; x++) {
			//get a student label
			var studentLabel = studentLabels[x];
			
			if(studentLabel != null) {
				//get the x and y coordinates of the student label
				var studentLabelX = studentLabel.x;
				var studentLabelY = studentLabel.y;
				
				//get the text for the student label
				var studentLabelValue = studentLabel.value;
				
				//create an svg text element
				var svgText = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'))
				
				//set the text parameters
				svgText.attr('x', studentLabelX);
				svgText.attr('y', studentLabelY + 10);
				svgText.css('fill', 'blue');
				svgText.html(studentLabelValue);
				
				//add the text to the svg display
				$('#svgDisplay').append(svgText);
				
				//create an svg circle element so we can display the position of the student label as a dot
				var svgTextDot = $(document.createElementNS('http://www.w3.org/2000/svg', 'circle'))
				
				//set the circle parameters
				svgTextDot.attr('cx', studentLabelX);
				svgTextDot.attr('cy', studentLabelY);
				svgTextDot.attr('r', 1);
				svgTextDot.css('fill', 'none');
				svgTextDot.css('stroke-width', 1);
				svgTextDot.css('stroke', 'blue');
				
				//add the circle to the svg display
				$('#svgDisplay').append(svgTextDot);
			}
		}
	}
}

/**
 * Compares the student labels with the authored labels and determines
 * which student labels match the authored labels. For each student label,
 * an array will be created in that student label object that will contain
 * the authored label ids that match that student label.
 * @param studentLabels the array of student label objects
 * @param authoredLabels the array of authored label objects
 */
function matchStudentLabelsToAuthoredLabels(studentLabels, authoredLabels) {
	if(studentLabels != null && authoredLabels != null) {
		//loop through all the student labels
		for(var x=0; x<studentLabels.length; x++) {
			//get a student label
			var studentLabel = studentLabels[x];
			
			/*
			 * create an array to hold all the authored label ids that this
			 * student label matches
			 */
			studentLabel.matchingLabels = [];
			
			//loop through all the authored labels
			for(var y=0; y<authoredLabels.length; y++) {
				//get an authored label
				var authoredLabel = authoredLabels[y];
				
				//check if the student label matches the authored label
				if(doesStudentLabelMatchAuthoredLabel(studentLabel, authoredLabel)) {
					/*
					 * the student label matches the authored label so we will put
					 * the authored label id into the matching labels array for
					 * the student label
					 */
					var authoredLabelId = authoredLabel.id;
					studentLabel.matchingLabels.push(authoredLabelId);
				}
			}
		}
	}
}

/**
 * Check if the student label matches the authored label
 * @param studentLabel the student label object
 * @param authoredLabel the authored label object
 * @returns whether the student label matches the authored label
 */
function doesStudentLabelMatchAuthoredLabel(studentLabel, authoredLabel) {
	var result = false;
	
	if(studentLabel != null && authoredLabel != null) {
		//get the text from the student label
		var studentLabelValue = studentLabel.value;
		
		//get the regex string for the authored label
		var authoredLabelValue = authoredLabel.value;
		
		//create the regex object
		var regex = new RegExp(authoredLabelValue, 'i');
		
		//check if the student label value matches the authored label regex
		if(regex.test(studentLabelValue)) {
			result = true;
		}
	}
	
	return result;
}

/**
 * Check if an x, y point is in a region
 * @param x the x coordinate
 * @param y the y coordinate
 * @param region the region object
 * @returns whether the point is in the region
 */
function isPointInRegion(x, y, region) {
	var result = false;
	
	if(x != null && y != null && region != null) {
		//get the shape object
		var shape = region.shape;
		
		if(shape != null) {
			//get the shape type e.g. 'rectangle' or 'circle'
			var shapeType = shape.type;
			
			if(shapeType == null) {
				
			} else if(shapeType == 'rectangle') {
				//get the x, y, width, and height of the rectangle
				var rx = shape.x;
				var ry = shape.y;
				var rwidth = shape.width;
				var rheight = shape.height;
				
				//check if the point is in the rectangle
				result = isPointInRectangle(x, y, rx, ry, rwidth, rheight);
			} else if(shapeType == 'circle') {
				//get the x, y, and radius of the circle
				var cx = shape.x;
				var cy = shape.y;
				var cradius = shape.radius;
				
				//check if the point is in the circle
				result = isPointInCircle(x, y, cx, cy, cradius);
			}
		}
	}
	
	return result;
}

/**
 * Check if the point is in the rectangle
 * @param x the x coordinate of the point
 * @param y the y coordinate of the point
 * @param rx the x coordinate of the upper left corner of the rectangle
 * @param ry the y coordinate of the upper left corner of the rectangle
 * @param rwidth the width of the rectangle
 * @param rheight the height of the rectangle
 * @returns whether the point is in the rectangle
 */
function isPointInRectangle(x, y, rx, ry, rwidth, rheight) {
	var result = false;
	
	/*
	 * check if the x coordinate of the point is within the x bounds of the rectangle
	 * check if the y coordinate of the point is within the y bounds of the rectangle
	 */
	if(rx <= x && x <= (rx + rwidth) && ry <= y && y <= (ry + rheight)) {
		result = true;
	}
	
	return result;
}

/**
 * Check if the point is in the circle
 * @param x the x coordinate of the point
 * @param y the y coordinate of the point
 * @param cx the x coordinate of the circle
 * @param cy the y coordinate of the circle
 * @param cradius the radius of the circle
 * @returns whether the point is in the circle
 */
function isPointInCircle(x, y, cx, cy, cradius) {
	var result = false;
	
	//get the x distance from the point to the center of the circle
	var xDiff = cx - x;
	
	//get the y distance from the point to the center of the circle
	var yDiff = cy - y;
	
	//square the x difference, y difference, and radius
	var xDiffSquared = Math.pow(xDiff, 2);
	var yDiffSquared = Math.pow(yDiff, 2);
	var radiusSquared = Math.pow(cradius, 2);
	
	/*
	 * Use the circle radius equation to determine if the point is
	 * within the circle or not
	 * 
	 * r = sqrt(x^2 + y^2)
	 * r^2 = x^2 + y^2
	 * 
	 * if (x^2 + y^2) is less than r^2, that means the point is within
	 * the circle
	 */
	if((xDiffSquared + yDiffSquared) <= radiusSquared) {
		result = true;
	}
	
	return result;
}

/**
 * Compares the student labels with the regions and determines
 * which student labels are in which regions. For each student label,
 * an array will be created in that student label object that will contain
 * the region ids that the student label is in.
 * 
 * @param studentLabels the array of student label objects
 * @param regions the regions
 */
function matchStudentLabelsToRegions(studentLabels, regions) {
	
	if(studentLabels != null && regions != null) {
		//loop through all the student labels
		for(var x=0; x<studentLabels.length; x++) {
			//get a student label
			var studentLabel = studentLabels[x];
			
			//get the x and y coordinates of the student label
			var studentLabelX = studentLabel.x;
			var studentLabelY = studentLabel.y;
			
			/*
			 * create the array that will contain the region ids that this
			 * student label is in
			 */
			studentLabel.occupiedRegions = [];
			
			//loop through all the regions
			for(var y=0; y<regions.length; y++) {
				//get a region
				var region = regions[y];
				var regionId = region.id;
				
				//check if the point is in the region
				var isInRegion = isPointInRegion(studentLabelX, studentLabelY, region);
				
				if(isInRegion) {
					//the point is in the region so we will add the region id to the array
					studentLabel.occupiedRegions.push(regionId);
				}
			}
		}
	}
}

/**
 * Create an array of objects that contain the pairings of label ids
 * and the region ids that they are in. The student labels must already
 * contain matchingLabels and occupiedRegions. 
 * matchStudentLabelsToAuthoredLabels() can be called to generate the matchingLabels
 * matchStudentLabelsToRegions() can be called to generate the occupiedRegions.
 * @param studentLabels the student labels
 * @returns an array containing objects that contain all the region id and
 * label id pairings based on the student labels. for example if 
 * label1 is in region1 and region2
 * label2 is in region2
 * the array would look like
 * [
 *    {
 *       "labelId":1,
 *       "regionId":1
 *    },
 *    {
 *       "labelId":1,
 *       "regionId":2
 *    },
 *    {
 *       "labelId":2,
 *       "regionId":2
 *    },
 * ]
 */
function generateLabelToRegionMappings(studentLabels) {
	var studentMappings = [];
	
	if(studentLabels != null) {
		//loop through all the student labels
		for(var x=0; x<studentLabels.length; x++) {
			//get a student label
			var studentLabel = studentLabels[x];
			
			if(studentLabel != null) {
				//get the occupied regions for this student label
				var occupiedRegions = studentLabel.occupiedRegions;
				
				//get the matching labels for this student label
				var matchingLabels = studentLabel.matchingLabels;
				
				//loop through all the occupied regions
				for(var r=0; r<occupiedRegions.length; r++) {
					//get an occupied region
					var regionId = occupiedRegions[r];
					
					//loop through all the matching labels
					for(var l=0; l<matchingLabels.length; l++) {
						//get a label
						var labelId = matchingLabels[l];
						
						//create the mapping object with the label id and region id
						var studentMapping = {
							labelId: labelId,
							regionId: regionId,
							
						}
						
						//add the object to our mappings array
						studentMappings.push(studentMapping);
					}
				}
			}
		}
	}
	
	return studentMappings;
}

/**
 * Compare the authored mappings with the student mappings and determine
 * which mappings have been satisfied
 * @param mappings the authored mappings
 * @param studentMappings the student mappings
 * @returns an array containing objects that contain a mapping id and whether
 * that mapping was satisifed
 */
function calculateSatisfiedMappings(mappings, studentMappings) {
	var mappingResults = [];
	
	if(mappings != null && studentMappings != null) {
		//loop through all the authored mappings
		for(var x=0; x<mappings.length; x++) {
			//get the mapping id
			var mapping = mappings[x];
			var mappingId = mapping.id;
			
			//check if the student has satisfied this mapping
			var isMappingSatisfied = isMappingInStudentMappings(mapping, studentMappings);
			
			//create the object that will contain the mapping id and whether it was satisifed
			var mappingResult = {
				id:mappingId,
				isSatisfied:isMappingSatisfied
			}
			
			//add the object to the mapping results array
			mappingResults.push(mappingResult);
		}
	}
	
	return mappingResults;
}

/**
 * Check if the mapping has been satisfied by the student
 * @param mapping the authored mapping
 * @param studentMappings the student mappings
 * @returns whether the mapping is in the student mappings
 */
function isMappingInStudentMappings(mapping, studentMappings) {
	var result = false;
	
	if(mapping != null && studentMappings != null) {
		//get the mapping id, region id, and label id
		var mappingId = mapping.id;
		var mappingRegionId = mapping.regionId;
		var mappingLabelId = mapping.labelId;
		
		//loop through all the student mappings
		for(var x=0; x<studentMappings.length; x++) {
			//get a student mapping
			var studentMapping = studentMappings[x];
			
			//get the region id and label id from the student mapping
			var studentMappingRegionId = studentMapping.regionId;
			var studentMappingLabelId = studentMapping.labelId;
			
			//check if the region id and label id match
			if(mappingRegionId == studentMappingRegionId && mappingLabelId == studentMappingLabelId) {
				//the region id and label id match so the student has satisfied this mapping
				result = true;
				break;
			}
		}
		
	}
	
	return result;
}

/**
 * Calculate the score and feedback for the student work
 * @param scoringCriteria an array containing all the scoring criterias
 * @param mappingResults an array containing all region to label mappings
 * and whether the student has satisfied each
 * @returns an object containing the score and the feedback
 */
function calculateScore(scoringCriteria, mappingResults) {
	var score = 0;
	var feedback = '';
	
	if(scoringCriteria != null && mappingResults != null) {
		//loop through all the scoring criteria objects
		for(var x=0; x<scoringCriteria.length; x++) {
			//get a scoring criteria object
			var scoringCriteriaObject = scoringCriteria[x];
			
			//check if the scoring criteria was satisfied
			var scoringCriteriaResult = checkScoringCriteria(scoringCriteriaObject, mappingResults);
			
			if(scoringCriteriaResult != null) {
				//get the score and feedback
				var tempScore = scoringCriteriaResult.score;
				var tempFeedback = scoringCriteriaResult.feedback;
				
				if(tempScore != null) {
					//check if the score is a valid number
					if(!isNaN(tempScore)) {
						//accumulate the score
						score += tempScore;						
					}
				}
				
				if(tempFeedback != null) {
					if(feedback != '') {
						//separate the feedback from the existing feedback with new lines
						feedback += '<br/>';
					}
					
					//add the feedback
					feedback += tempFeedback;
				}
			}
		}
	}
	
	//create the object to hold the score and feedback
	var results = {
		score:score,
		feedback:feedback
	}
	
	return results;
}

/**
 * Check if the scoring criteria was satisfied
 * @param scoringCriteriaObject a scoring criteria
 * @param mappingResults the mapping results from the student work
 * @returns an object containing the score and feedback for the scoring
 */
function checkScoringCriteria(scoringCriteriaObject, mappingResults) {
	var results = {
		score:null,
		feedback:null
	}
	
	if(scoringCriteriaObject != null && mappingResults != null) {
		//get the scoring logic e.g. 1&&2
		var logic = scoringCriteriaObject.logic;
		
		/*
		 * replace the mapping ids with the mapping boolean results
		 * e.g.
		 * 1&&2 will be turned into something like true&&false
		 */
		var logicReplaced = replaceMappingIdsWithValues(logic, mappingResults);
		
		//evaluate the expression
		var logicEvaluated = eval(logicReplaced);
		
		if(logicEvaluated) {
			//the scoring criteria was satisfied
			results.score = scoringCriteriaObject.score;
			results.feedback = '<font color="green">' + scoringCriteriaObject.successFeedback + '</font>';
		} else {
			//the scoring criteria was not satisfied
			results.score = 0;
			results.feedback = '<font color="red">' + scoringCriteriaObject.failureFeedback + '</font>';
		}
	}
	
	return results;
}

/**
 * In the logic string, replace the mapping ids with the boolean
 * values from the mapping results e.g.
 * 1&&2 would be turned into something like true&&false
 * @param logic the logic string that contains mapping ids e.g. 1&&2
 * @param mappingResults an array of mapping result objects
 * @returns a string containing the logic string with the mapping ids
 * replaced with boolean values
 */
function replaceMappingIdsWithValues(logic, mappingResults) {
	var result = logic;
	
	if(logic != null) {
		
		var mappingIdsUsed = logic.match(/\d+/g);
		
		
		if(mappingIdsUsed != null) {
			/*
			 * sort the mapping ids from largest to smallest because we will
			 * be replacing the mapping ids with boolean values and we want to
			 * replace the larger numbers first. we must replace the larger numbers
			 * first because if there are mappings with ids 11 and 1, we need to 
			 * make sure "11" gets replaced with "true" and not "truetrue".
			 */
			mappingIdsUsed = mappingIdsUsed.sort(sortNumericallyDescending);
			
			//loop through all the mapping ids
			for(var x=0; x<mappingIdsUsed.length; x++) {
				//get a mapping id e.g. "5"
				var mappingIdUsed = mappingIdsUsed[x];
				
				//check the mapping results to see if this mapping id was satisfied
				var isSatisfied = isMappingSatisfied(mappingResults, mappingIdUsed);
				
				//create the regex that will match the mapping id
				var regex = new RegExp(mappingIdUsed, 'g');
				
				//replace all instances of the mapping id with the boolean value
				result = result.replace(regex, isSatisfied);
			}
		}
	}
	
	return result;
}

/**
 * A sorting function to sort an array containing numbers. This will sort
 * the numbers from largest to smallest.
 * @param a number
 * @param a number
 * @returns 
 * a negative number which means a should come before b in the sorted array
 * a positive number which means b should come before a in the sorted array
 * zero which means a and b are the same number
 */
function sortNumericallyDescending(a, b) {
	return (b - a);
}

/**
 * Check if a mapping is satisfied
 * @param mappingResults the mapping results calculated from the student work
 * @param mappingId the mapping id
 * @returns whether the mapping is satisfied
 */
function isMappingSatisfied(mappingResults, mappingId) {
	var result = false;
	
	if(mappingResults != null && mappingId != null) {
		//loop through all the mapping results
		for(var x=0; x<mappingResults.length; x++) {
			//get a mapping result
			var mappingResult = mappingResults[x];
			
			//get the mapping id and whether it was satisfied
			var mappingResultId = mappingResult.id;
			var isSatisfied = mappingResult.isSatisfied;
			
			//check if the mapping id matches the one we are looking for
			if(mappingId == mappingResultId) {
				/*
				 * the mapping id is the one we want so we will return
				 * whether it was satisfied
				 */ 
				result = isSatisfied;
				break;
			}
		}
	}
	
	return result;
}

/**
 * Get the max possible score the student can obtain
 * @param scoringCriteria an array of scoring criteria objects
 * @returns the max score for the step
 */
function getMaxScore(scoringCriteria) {
	var maxScore = 0;
	
	if(scoringCriteria != null) {
		//loop through all the scoring criteria objects
		for(var x=0; x<scoringCriteria.length; x++) {
			//get a scoring criteria object
			var tempScoringCriteria = scoringCriteria[x];
			
			if(tempScoringCriteria != null) {
				//get the score for this criteria
				var score = tempScoringCriteria.score;
				
				if(score != null && !isNaN(score)) {
					//accumulate the score
					maxScore += score;
				}
			}
		}
	}
	
	return maxScore;
}
