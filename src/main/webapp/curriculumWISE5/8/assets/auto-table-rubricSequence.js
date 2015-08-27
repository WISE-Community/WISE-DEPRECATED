
/**
 * Register event listeners so that we can perform processing
 * when certain events are fired
 */
function registerListener(stepObject) {
	/*
	 * the 'beforeSaveNodeState' event is fired right before a node
	 * state is saved. this allows you to access the student work
	 * that the student submitted. it also allows you to modify the 
	 * node state before it's saved to the server.
	 */
	eventManager.subscribe('beforeNodeStateSaved', beforeSaveNodeStateListener, stepObject);
}


/**
 * Called when the 'beforeSaveNodeState' event is fired
 * @param type the event name
 * @param args the arguments that are provided when the event is fired
 * @param obj the object that is provided when this function is subscribed to the event
 */
function beforeSaveNodeStateListener(type, args, obj) {
	//get the step object
	var stepObject = obj;
	
	//get the node id
	var nodeId = args[0];
	
	//get the node state
	var nodeState = args[1];
	
	//get the node id of the step object
	var stepObjectNodeId = stepObject.node.id;

	/*
	 * make sure the event was fired for the same step this listener was created for.
	 * we need to perform this check because 'beforeSaveNodeState' will be fired
	 * for all steps.
	 */
	if(stepObjectNodeId == nodeId) {
		// for previous work
		var nodeStates = getStudentWorkForStep(stepObject);
		
		var feedbackMessage = processStudentWork(stepObject, nodeId, nodeState, nodeStates);
	}
}

function processStudentWork(stepObject, nodeId, nodeState, nodeStates){
	// get indices of all non-empty nodeStates
	var nnindices = [];
	for (var n = 0; n < nodeStates.length; n++){
		if (nodeStates[n] == null || nodeStates[n].tableData.length == 0){
			// do nothing
		} else {
			nnindices.push(n);
		}
	}
	var nodeStatesCount = nnindices.length;

	// last non-empty state is last
	if (nnindices.length > 0){
		var prevNodeState = nodeStates[nnindices[nnindices.length-1]];
	} else {
		var prevNodeState = null;
	}
	
	// get previous work if table
	
	var T = nodeState.tableData;
	
	console.log(stepObject, T, prevNodeState, nodeState, nodeStatesCount);
	
	// determines which of the array of rubrics to use.
	var rubricIndex = 0;
	if (prevNodeState !== null && typeof prevNodeState.rubricIndex !== "undefined" && typeof prevNodeState.score !== "undefined"){
		rubricIndex = prevNodeState.rubricIndex;
		if (prevNodeState.score != 0){
			// move on to the next rubric (unless at end of the array)
			if (rubricIndex < stepObject.content.rubrics.length-1) rubricIndex = prevNodeState.rubricIndex + 1;
		}
	}
	
	var rubric = cloneRubric(stepObject.content.rubrics[rubricIndex]);
	rubric = replaceScoreKeysWithIndex(rubric);
	rubric = replaceFeedbackKeysWithIndex(rubric);
	var score = scoreGraph_ruleRubric (T, rubric);
	var feedback = getGraphFeedback_ruleRubric (T, rubric);
	/*
	 * create the message that tells the student they need to type more words
	 * in order for their work to be scored.
	 */
	var feedbackMessage = feedback;
	
	// add relevant information to state	
	nodeState.score = score;
	nodeState.feedbackMessage = feedbackMessage;
	nodeState.rubricIndex = rubricIndex;

	if (eventManager!=null){
		eventManager.fire('unlockScreenEvent');
	
		//display the feedback message in the vle feedback popup
		eventManager.fire("showNodeAnnotations",[nodeId, feedbackMessage]);
	}		
	//create the annotation value which will contain the auto score and auto feedback
	var autoGradedAnnotation = {
		autoFeedback:feedbackMessage,
		autoScore:score
	};
	
	//add the auto graded annotation
	stepObject.view.addAutoGradedAnnotation(autoGradedAnnotation);
	
	//in cases where there is an external animation script let that script know that we have processed the data
	if (typeof stepObject.animator !== "undefined" && stepObject.animator !== null){
		stepObject.animator.processEvent("getScore", [score, feedbackMessage], stepObject);
	}
}


/**
 * Get all the node states for a step
 * @param stepObject the step object
 * @return an array of node states for the step
 */
function getStudentWorkForStep(stepObject) {
	//get the node id for the step
	var nodeId = stepObject.node.id;
	
	//get all the node states for the step
	var nodeStates = stepObject.view.getStudentWorkForNodeId(stepObject.node.id);
	
	return nodeStates;
}


/***************  SCORING FUNCTIONS *********************/

function scoreGraph_ruleRubric (T, rubric){
	var R = getRuleCompletion_ruleRubric(T, rubric);
	for (var s = 0; s < rubric.scores.length; s++){
		var patternResult = eval(rubric.scores[s].pattern);
		// if is logical and true return a given score, if numerical just return value 
		if (patternResult != null && typeof patternResult === "boolean" && patternResult){
			return rubric.scores[s].score;
		} else if (typeof patternResult === "number") {
			return patternResult;
		}
	}
	// No rule found 
	return 0;
}
function getGraphFeedback_ruleRubric (T, rubric){
	var R = getRuleCompletion_ruleRubric(T, rubric);
	for (var s = 0; s < rubric.feedbacks.length; s++){
		var patternResult = eval(rubric.feedbacks[s].pattern);
		// if is logical and true return a given feedback, if numerical just return value 
		if (patternResult != null && typeof patternResult === "boolean" && patternResult){
			return rubric.feedbacks[s].feedback;
		} 
	}
	// No rule found 
	return "Keep going.";
}

/*
 * Main scoring function using rubric. 
 * @ T is the set of all predictions in the state 
 * 
 */
function getRuleCompletion_ruleRubric (T, rubric){
	
	
	var non_critical_labels = ["label", "row_index", "column_index", "relation"];
	
	var R = [];
	var RVALS = [];
	var cp = 0; // we start looking from the first point in xy, but once that is found we don't search it again, we don't go backwards
	//var RVALS = {label:[], x1:[], y1:[], x2:[], y2:[], width:[], height:[], rotation:[], angle:[], npoints:[]}
	for (var r = 0; r < rubric.rules.length; r++){
		var rule = rubric.rules[r];
		
		matchedValues = scoreTable_cell(rule, T);
		var matchFound = matchedValues !== null ? true : false;
		
		if (matchFound){
			var rval = {label:rule.label, text:null, value:null};
			// go through each key of the matchedValues and put in this  obj
			for (key in matchedValues){
				if (typeof rval[key] !== "undefined") rval[key] = matchedValues[key];
			}
		} else {
			rval = {label:rule.label, text:null, value:null};	
		}
		RVALS.push(rval);
		//RVALS = rbind(RVALS, rval)
		R.push(matchFound);
		
	}
	// pass through rules again to see if there are any relational type rules
	for (r = 0; r < rubric.rules.length; r++){
		rule = rubric.rules[r];
		if (typeof rule.relation !== "undefined" && rule.relation.length > 0){
			var pattern = rule.relation;
			// replace R[  with RVALS[
			// Replace labels in pattern with row index
			var ids = [];
			var repls = [];
			var val = true;
			var greg = pattern.match(/\[[a-zA-Z]+.*?\]/g);
			if (greg !== null && greg.length > 0){
				for (var g = 0; g < greg.length; g++){
					var id = greg[g].replace("[","").replace("]","");
					var repl = null;
					for (var r2 = 0; r2 < rubric.rules.length; r2++){
						if (rubric.rules[r2].label == id){
							repl = r2; 
							break;
						}
					}
					if (repl !== null){
						// make sure that this rule evaluated as true
						val = Boolean(eval("R["+repl+"]"));
						if (!val) break;
						ids.push(id);
						repls.push(repl);
					}
				}
				for (var i=0; i < ids.length; i++){
					pattern = pattern.replace("["+ids[i]+"]", "["+repls[i]+"]");
				}
			}
			
			// since we are looking for specific values, not booleans associated with rules, replace R[] with RVALS[]			
			if (val){
				pattern = pattern.replace(/R\[/g,"RVALS[");
				val = Boolean(eval(pattern));		
			}
			
			R[r] = val;
			//if (debug) print(paste(R[r]))
		}
	}	
	for (r = 0; r < R.length; r++){
		console.log(RVALS[r]["label"], R[r], RVALS[r]);
	}
	
	return R;
}

/**
 * Check text in a cell for a match
 * Options:
 * 	value_min : is value in text greater than or equal to this value
 *  value_max : is value in text less than or equal to this value
 *  text : does text match this regular expression pattern?
 */
function scoreTable_cell(rule, T){
	if (typeof rule.row_index === "number" && typeof rule.column_index === "number") {var text = T[rule.column_index][rule.row_index].text} else {return null;}
	
	var df = {};
	
	if (typeof rule.text === "undefined" || text.match(RegExp(rule.text,"i")) !== null){
		df['text'] = text;
	} else {return null;}
	
	if ((typeof rule.value_min === "undefined" || (parseFloat(text) !== NaN && parseFloat(text) >= rule.value_min)) && (typeof rule.value_max === "undefined" || (parseFloat(text) !== NaN && parseFloat(text) <= rule.value_max))) {
		df['value'] = parseFloat(text);
	} else {return null;}
	
	
	return df;
}

/* When the author specifies what rule to evaluate he or she will use the label to identify the
 * rule. Need to replace this label with the index of that rule in the rubric.
 */
function replaceScoreKeysWithIndex(rubric){
	for (var s = 0; s < rubric.scores.length; s++){
		var pattern = rubric.scores[s].pattern;
		var greg = pattern.match(/\[.*?[a-z]+.*?\]/g);
		if (greg != null){
			var ids = [];
			var repls = [];
			for (var g = 0; g < greg.length; g++){
				id = greg[g].replace("[","").replace("]","");
				repl = null;
				for (var r = 0; r < rubric.rules.length; r++){
					if (typeof rubric.rules[r].label !== "undefined" && rubric.rules[r].label == id){
						repl = r;
						break;
					}
				}
				if (repl != null){
					ids.push(id);
					repls.push(repl);
				} else {
					console.log("No Match for "+ id);
				}
			}
			for (var i = 0; i < ids.length; i++){
				pattern = pattern.replace("["+ids[i]+"]", "["+repls[i]+"]");
			}
			rubric.scores[s].pattern = pattern;
		}
	}
	return rubric;
}

/*
 * Same as above, but replace keys for feedback
 */
function replaceFeedbackKeysWithIndex(rubric){
	for (var s = 0; s < rubric.feedbacks.length; s++){
		var pattern = rubric.feedbacks[s].pattern;
		var ids = [];
		var repls = [];
		var greg = pattern.match(/\[.*?[a-z]+.*?\]/g);
		if (greg != null){
			for (var g = 0; g < greg.length; g++){
				id = greg[g].replace("[","").replace("]","");
				repl = null;
				for (var r = 0; r < rubric.rules.length; r++){
					if (typeof rubric.rules[r].label !== "undefined" && rubric.rules[r].label == id){
						repl = r;
						break;
					}
				}
				if (repl != null){
					ids.push(id);
					repls.push(repl);
				} else {
					console.log("No Match for "+ id);
				}
			}
			for (var i = 0; i < ids.length; i++){
				pattern = pattern.replace("["+ids[i]+"]", "["+repls[i]+"]");
			}
			rubric.feedbacks[s].pattern = pattern;
		}
	}
	return rubric;
}

function cloneRubric(obj) {
	if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    if (typeof obj.rules === "object") {
    	copy.rules = [];
    	for (var i = 0; i < obj.rules.length; i++){
    		var cell = {};
    		for (var attr in obj.rules[i]){
    			cell[attr] = obj.rules[i][attr];
    		}
    		copy.rules.push(cell);
    	}
    }
    if (typeof obj.scores === "object") {
    	copy.scores = [];
    	for (var i = 0; i < obj.scores.length; i++){
    		var cell = {};
    		for (var attr in obj.scores[i]){
    			cell[attr] = obj.scores[i][attr];
    		}
    		copy.scores.push(cell);
    	}
    }
    if (typeof obj.feedbacks === "object") {
    	copy.feedbacks = [];
    	for (var i = 0; i < obj.feedbacks.length; i++){
    		var cell = {};
    		for (var attr in obj.feedbacks[i]){
    			cell[attr] = obj.feedbacks[i][attr];
    		}
    		copy.feedbacks.push(cell);
    	}
    }
    
    return copy;
}
