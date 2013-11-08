/**
 * A Solution object is a representation of a possible solution to a problem,
 * with a corresponding fix method to resolve the problem.
 * 
 * @param part
 * @param parent
 * @param cleaner
 */
function Solution(problem, id){
	this.problem = problem;
	this.id = id;
};

/**
 * Returns this solution's HTML
 */
Solution.prototype.getSolutionHTML = function(){
	return this.msg;
};

/**
 * Runs the fix for this solution.
 */
Solution.prototype.fix = function(args){};

/**
 * A solution that adds a part and a value to the parent of the problem.
 */
AddPartWithValueSolution.prototype = new Solution;
AddPartWithValueSolution.prototype.constructor = AddPartWithValueSolution;
AddPartWithValueSolution.prototype.parent = Solution.prototype;
function AddPartWithValueSolution(problem, id){
	this.problem = problem;
	this.id = id;
	
	this.msg = '<a onclick="eventManager.fire(\'' + this.problem.eventName + '\',\'' + this.id + '\')">Add the ' + this.problem.part.part + ' and set its value.</a>';
};

/**
 * Runs the fix for this solution
 */
AddPartWithValueSolution.prototype.fix = function(args){
	/* check to see if user has entered a value and set the part with this value */
	if(args[2] && args[2]=='complete'){
		var val = document.getElementById('problemTextInput_' + this.problem.id).value;
		this.problem.part.data = val;
		this.problem.parent.addPart(this.problem.part, val);
		this.problem.resolveProblem();
	/* we need to set the input element for the user to enter a value */
	} else {
		var p = document.getElementById('problemSolution_' + this.problem.id);
		
		/* wipe out text */
		p.innerHTML = '';
		
		/* create input and save button */
		p.innerHTML = 'Enter value for ' + this.problem.part.part + ': <input type="text" id="problemTextInput_' + this.problem.id + '"/>' +
			'<input type="button" value="save" onclick="eventManager.fire(\'' + this.problem.eventName + '\',[\'' + this.id + '\',\'complete\'])"/>';
	};
};

/**
 * A solution object that resolves a problem by inserting the part into
 * the parent and setting that parts value to the default value for that part.
 */
AddPartWithEmptyValueSolution.prototype = new Solution;
AddPartWithEmptyValueSolution.prototype.constructor = AddPartWithEmptyValueSolution;
AddPartWithEmptyValueSolution.prototype.parent = Solution.prototype;
function AddPartWithEmptyValueSolution(problem, id){
	this.problem = problem;
	this.id = id;
	
	if(this.problem.part.defaultValue==''){
		var dVal = '""';
	} else {
		var dVal = this.problem.part.defaultValue;
	};
	
	this.msg = '<a onclick="eventManager.fire(\'' + this.problem.eventName + '\',\'' + this.id + '\')">Add the ' + this.problem.part.part + ' with the default value: ' + dVal + '</a>';
};

/**
 * Runs the fix for this solution.
 */
AddPartWithEmptyValueSolution.prototype.fix = function(args){
	this.problem.part.data = this.problem.part.defaultValue;
	this.problem.parent.addPart(this.problem.part);
	this.problem.resolveProblem();
};

/**
 * A solution object that resolves a problem by inserting the setting the parts default value. 
 */
SetDefaultFieldValueSolution.prototype = new Solution;
SetDefaultFieldValueSolution.prototype.constructor = SetDefaultFieldValueSolution;
SetDefaultFieldValueSolution.prototype.parent = Solution.prototype;
function SetDefaultFieldValueSolution(problem, id){
	this.problem = problem;
	this.id = id;
	
	if(this.problem.part.defaultValue==''){
		var dVal = '""';
	} else {
		var dVal = this.problem.part.defaultValue;
	};
	
	this.msg = '<a onclick="eventManager.fire(\'' + this.problem.eventName + '\',\'' + this.id + '\')">Set the ' + this.problem.part.part + ' field with default value: ' + dVal + '</a>';;
};

/**
 * Runs the fix for this solution.
 */
SetDefaultFieldValueSolution.prototype.fix = function(){
	this.problem.part.data = this.problem.part.defaultValue;
	this.problem.resolveProblem();
};

/**
 * A solution object that resolves a problem by inserting the setting the
 * user specified value as the value for the field. 
 */
SetFieldValueSolution.prototype = new Solution;
SetFieldValueSolution.prototype.constructor = SetDefaultFieldValueSolution;
SetFieldValueSolution.prototype.parent = Solution.prototype;
function SetFieldValueSolution(problem, id){
	this.problem = problem;
	this.id = id;
	
	this.msg = '<a onclick="eventManager.fire(\'' + this.problem.eventName + '\',\'' + this.id + '\')">Set the ' + this.problem.part.part + ' field with entered value.</a>';
};

/**
 * Runs the fix for this solution.
 */
SetFieldValueSolution.prototype.fix = function(args){
	/* check to see if user has entered a value and set the part with this value */
	if(args[2] && args[2]=='complete'){
		var val = document.getElementById('problemTextInput_' + this.problem.id).value;
		this.problem.part.data = val;
		this.problem.resolveProblem();
	/* we need to set the input element for the user to enter a value */
	} else {
		var p = document.getElementById('problemSolution_' + this.problem.id);
		
		/* wipe out text */
		p.innerHTML = '';
		
		/* create input and save button */
		p.innerHTML = 'Enter value for ' + this.problem.part.part + ': <input type="text" id="problemTextInput_' + this.problem.id + '"/>' +
			'<input type="button" value="save" onclick="eventManager.fire(\'' + this.problem.eventName + '\',[\'' + this.id + '\',\'complete\'])"/>';
	};
};

/**
 * A solution that removes the part from the project
 */
RemovePartSolution.prototype = new Solution;
RemovePartSolution.prototype.constructor = RemovePartSolution;
RemovePartSolution.prototype.parent = Solution.prototype;
function RemovePartSolution(problem, id){
	this.problem = problem;
	this.id = id;
	
	this.msg = '<a onclick="eventManager.fire(\'' + this.problem.eventName + '\',\'' + this.id + '\')">Remove this part from the project.</a>';;;
};

/**
 * Runs the fix for this solution
 */
RemovePartSolution.prototype.fix = function(){
	this.problem.parent.removePart(this.problem.part);
	this.problem.resolveProblem();
};

/**
 * A solution that does nothing.
 */
DoNothingSolution.prototype = new Solution;
DoNothingSolution.prototype.constructor = DoNothingSolution;
DoNothingSolution.prototype.parent = Solution.prototype;
function DoNothingSolution(problem, id){
	this.problem = problem;
	this.id = id;
	
	this.msg = '<a onclick="eventManager.fire(\'' + this.problem.eventName + '\',\'' + this.id + '\')">Do nothing, it does not seem to be causing any problems.</a>';
};

/**
 * Runs the fix for this solution.
 */
DoNothingSolution.prototype.fix = function(){
	this.problem.resolveProblem();
};

/**
 * A solution that attempts to fix the data type.
 */
FixDataTypeSolution.prototype = new Solution;
FixDataTypeSolution.prototype.constructor = FixDataTypeSolution;
FixDataTypeSolution.prototype.parent = Solution.prototype;
function FixDataTypeSolution(problem, id){
	this.problem = problem;
	this.id = id;
	
	this.msg = '<a onclick="eventManager.fire(\'' + this.problem.eventName + '\',\'' + this.id + '\')">Attempt to convert the data to ' + this.problem.part.defaultDataType + '</a>';
};

/**
 * Runs the fix for this solution.
 */
FixDataTypeSolution.prototype.fix = function(){
	this.problem.part.convertDataToDefaultType();
	this.problem.resolveProblem();
};

/**
 * A solution that attempts to resolve the duplicate identifier problem by
 * removing other duplicates.
 */
ResolveDuplicateIdentifierByDeletionSolution.prototype = new Solution;
ResolveDuplicateIdentifierByDeletionSolution.prototype.constructor = ResolveDuplicateIdentifierByDeletionSolution;
ResolveDuplicateIdentifierByDeletionSolution.prototype.parent = Solution.prototype;
function ResolveDuplicateIdentifierByDeletionSolution(problem, id){
	this.problem = problem;
	this.id = id;
	
	this.msg = '<a onclick="eventManager.fire(\'' + this.problem.eventName + '\',\'' + this.id + '\')">Given more information about the conflicting objects, select which objects to delete.</a>';
};

/**
 * Runs the fix for this solution
 */
ResolveDuplicateIdentifierByDeletionSolution.prototype.fix = function(args){
	/* check to see if user has entered a value and set the part with this value */
	if(args[2] && args[2]=='complete'){
		var checks = document.getElementsByName('dSolutionChecks_' + this.problem.id);
		var noneChecked = true;
		
		for(var b=0;b<checks.length;b++){
			if(checks[b].checked){
				noneChecked = false;
				this.problem.part[b].parent.parent.removePart(this.problem.part[b].parent);
			};
		};
		
		if(!noneChecked){
			this.problem.resolveProblem();
		};
	} else if(args[2] && args[2]=='cancel'){
		var p = document.getElementById('problemSolution_' + this.problem.id);
		p.innerHTML = '';
		p.innerHTML = this.problem.getSolutionsHTML();
	} else {
		var p = document.getElementById('problemSolution_' + this.problem.id);
		
		/* wipe out text */
		p.innerHTML = '';
		
		/* create new html */
		var html = 'Check each of the following you wish to remove from the project. Then click remove.<br/>';
		
		for(var a=0;a<this.problem.part.length;a++){
			html += '<input type="checkbox" id="dSolutionCheck_' + a + '" name="dSolutionChecks_' + this.problem.id + '"/> Info: ' + this.problem.part[a].parent.getInfo() + '<br/>';
		};
		
		html += '<input type="button" value="remove" onclick="eventManager.fire(\'' + this.problem.eventName + '\',[\'' + this.id + '\',\'complete\'])"/> ';
		html += '<input type="button" value="cancel" onclick="eventManager.fire(\'' + this.problem.eventName + '\',[\'' + this.id + '\',\'cancel\'])"/>';
		
		/* set the html */
		p.innerHTML = html;
	};
};

/**
 * A solution that attempts to resolve the duplicate identifier problem by
 * having user rename the identifiers.
 */
ResolveDuplicateIdentifierByChangingSolution.prototype = new Solution;
ResolveDuplicateIdentifierByChangingSolution.prototype.constructor = ResolveDuplicateIdentifierByChangingSolution;
ResolveDuplicateIdentifierByChangingSolution.prototype.parent = Solution.prototype;
function ResolveDuplicateIdentifierByChangingSolution(problem, id){
	this.problem = problem;
	this.id = id;
	
	this.msg = '<a onclick="eventManager.fire(\'' + this.problem.eventName + '\',\'' + this.id + '\')">Change the identifiers of one or more objects. Warning: since multiple objects have the same identifier, no updates to objects that may reference these objects can be carried out.</a>';
};

/**
 * Runs the fix for this solution
 */
ResolveDuplicateIdentifierByChangingSolution.prototype.fix = function(args){
	/* check to see if user has entered a value and set the part with this value */
	if(args[2] && args[2]=='complete'){
		var inputs = document.getElementsByName('dSolutionInputs_' + this.problem.id);
		var noneEntered = true;
		
		for(var b=0;b<inputs.length;b++){
			if(inputs[b].value && inputs[b].value!=''){
				noneEntered = false;
				this.problem.part[b].part.data = inputs[b].value;
			};
		};
		
		if(!noneEntered){
			this.problem.resolveProblem();
		};
	} else if(args[2] && args[2]=='cancel'){
		var p = document.getElementById('problemSolution_' + this.problem.id);
		p.innerHTML = this.problem.getSolutionsHTML();
	} else {
		var p = document.getElementById('problemSolution_' + this.problem.id);
		
		/* wipe out text */
		p.innerHTML = '';
		
		var html = "Enter the value of the identifier for each of those listed below that you wish to change. If you do not want one or more to change, do not enter anything.";
		
		for(var b=0;b<this.problem.part.length;b++){
			html += "<input type='text' name='dSolutionInputs_" + this.problem.id + "'/> Info: " + this.problem.part[b].parent.getInfo() + '<br/>';
		};
		
		/* create input and save button */
		html += '<input type="button" value="save" onclick="eventManager.fire(\'' + this.problem.eventName + '\',[\'' + this.id + '\',\'complete\'])"/> ';
		html += '<input type="button" value="cancel" onclick="eventManager.fire(\'' + this.problem.eventName + '\',[\'' + this.id + '\',\'cancel\'])"/>';
		
		p.innerHTML = html;
	};
};

/**
 * A solution that solves the problem by removing the reference.
 */
RemoveReferencedIdSolution.prototype = new Solution;
RemoveReferencedIdSolution.prototype.constructor = RemoveReferencedIdSolution;
RemoveReferencedIdSolution.prototype.parent = Solution.prototype;
function RemoveReferencedIdSolution(problem, id){
	this.problem = problem;
	this.id = id;
	
	this.msg = '<a onclick="eventManager.fire(\'' + this.problem.eventName + '\',\'' + this.id + '\')">Remove the invalid reference.</a>';
};

/**
 * Runs the fix for this solution
 */
RemoveReferencedIdSolution.prototype.fix = function(args){
	this.problem.parent.removePart(this.problem.part);
	this.problem.resolveProblem();
};

/**
 * A solution that solves the unused problem by removing the object.
 */
RemoveUnusedSolution.prototype = new Solution;
RemoveUnusedSolution.prototype.constructor = RemoveUnusedSolution;
RemoveUnusedSolution.prototype.parent = Solution.prototype;
function RemoveUnusedSolution(problem, id){
	this.problem = problem;
	this.id = id;
	
	this.msg = '<a onclick="eventManager.fire(\'' + this.problem.eventName + '\',\'' + this.id + '\')">Remove the unused object.</a>';
};

/**
 * Runs the fix for this solution
 */
RemoveUnusedSolution.prototype.fix = function(args){
	this.problem.parent.parent.removePart(this.problem.parent);
	this.problem.resolveProblem();
};

/**
 * A solution that solves the invalid start point by having the user
 * select a valid one from a list.
 */
AddValidStartPointSolution.prototype = new Solution;
AddValidStartPointSolution.prototype.constructor = AddValidStartPointSolution;
AddValidStartPointSolution.prototype.parent = Solution.prototype;
function AddValidStartPointSolution(problem, id){
	this.problem = problem;
	this.id = id;
	
	this.msg = '<a onclick="eventManager.fire(\'' + this.problem.eventName + '\',\'' + this.id + '\')">Select a valid start point from a list.</a>';
};

/**
 * Runs the fix for this solution.
 */
AddValidStartPointSolution.prototype.fix = function(args){
	if(args[2] && args[2]=='complete'){
		var s = document.getElementById('startPointSelect_' + this.problem.id);
		this.problem.part.data = s.options[s.selectedIndex].value;
		this.problem.resolveProblem();
	} else {
		var p = document.getElementById('problemSolution_' + this.problem.id);
		var seqIds = this.problem.cleaner.projectPart.getSequenceIds();
		
		/* wipe out text */
		p.innerHTML = '';
		
		/* create new html */
		var html = 'Select a start point from one of the following sequences:<br/>';
		html += '<select id="startPointSelect_' + this.problem.id + '">';
		for(var h=0;h<seqIds.length;h++){
			html += '<option value="' + seqIds[h].id + '">' + seqIds[h].title + '</option>';
		};
		html += '</select><br/><input type="button" value="save" onclick="eventManager.fire(\'' + this.problem.eventName + '\',[\'' + this.id + '\',\'complete\'])"/>';
		
		p.innerHTML = html;
	};
};


/**
 * A solution that fixes a missing start point by having the user
 * select a valid one from a list.
 */
AddStartPointSolution.prototype = new Solution;
AddStartPointSolution.prototype.constructor = AddStartPointSolution;
AddStartPointSolution.prototype.parent = Solution.prototype;
function AddStartPointSolution(problem, id){
	this.problem = problem;
	this.id = id;
	
	this.msg = '<a onclick="eventManager.fire(\'' + this.problem.eventName + '\',\'' + this.id + '\')">Select a valid start point from a list.</a>';
};

/**
 * Runs the fix for this solution.
 */
AddStartPointSolution.prototype.fix = function(args){
	if(args[2] && args[2]=='complete'){
		var s = document.getElementById('startPointSelect_' + this.problem.id);
		this.problem.part.data = s.options[s.selectedIndex].value;
		this.problem.parent.addPart(this.problem.part);
		this.problem.resolveProblem();
	} else {
		var p = document.getElementById('problemSolution_' + this.problem.id);
		var seqIds = this.problem.cleaner.projectPart.getSequenceIds();
		
		/* wipe out text */
		p.innerHTML = '';
		
		/* create new html */
		var html = 'Select a start point from one of the following sequences:<br/>';
		html += '<select id="startPointSelect_' + this.problem.id + '">';
		for(var h=0;h<seqIds.length;h++){
			html += '<option value="' + seqIds[h].id + '">' + seqIds[h].title + '</option>';
		};
		html += '</select><br/><input type="button" value="save" onclick="eventManager.fire(\'' + this.problem.eventName + '\',[\'' + this.id + '\',\'complete\'])"/>';
		
		p.innerHTML = html;
	};
};

/**
 * A solution that fixes the missing node class problem.
 */
AddNodeClassSolution.prototype = new Solution;
AddNodeClassSolution.prototype.constructor = AddNodeClassSolution;
AddNodeClassSolution.prototype.parent = Solution.prototype;
function AddNodeClassSolution(problem, id){
	this.problem = problem;
	this.id = id;
	
	this.msg = '<a onclick="eventManager.fire(\'' + this.problem.eventName + '\',\'' + this.id + '\')">Select a valid node class from a list.</a>';
};

/**
 * Runs the fix for this solution.
 */
AddNodeClassSolution.prototype.fix = function(args){
	if(args[2] && args[2]=='complete'){
		var s = document.getElementById('nodeClassSelect_' + this.problem.id);
		this.problem.part.data = s.options[s.selectedIndex].value;
		this.problem.parent.addPart(this.problem.part);
		this.problem.resolveProblem();
	} else {
		var p = document.getElementById('problemSolution_' + this.problem.id);
		var type = this.problem.parent.getType();

		/* wipe out text */
		p.innerHTML = '';
		
		if(!type || nodeTypes.indexOf(type)==-1){
			var html = '<font color="red">This problem cannot be resolved until a valid node type is chosen</font>';
		} else {
			var classes = nodeClasses[nodeTypes.indexOf(type)];
			var text = nodeClassText[nodeTypes.indexOf(type)];
			
			/* create new html */
			var html = 'Select a node class from one of the following valid node classes:<br/>';
			html += '<select id="nodeClassSelect_' + this.problem.id + '">';
			for(var h=0;h<classes.length;h++){
				html += '<option value="' + classes[h] + '">' + text[h] + '</option>';
			};
			html += '</select><br/><input type="button" value="save" onclick="eventManager.fire(\'' + this.problem.eventName + '\',[\'' + this.id + '\',\'complete\'])"/>';
		};
		
		p.innerHTML = html;
	};
};


/**
 * A solution that fixes the invalid node class problem.
 */
SetValidNodeClassSolution.prototype = new Solution;
SetValidNodeClassSolution.prototype.constructor = SetValidNodeClassSolution;
SetValidNodeClassSolution.prototype.parent = Solution.prototype;
function SetValidNodeClassSolution(problem, id){
	this.problem = problem;
	this.id = id;
	
	this.msg = '<a onclick="eventManager.fire(\'' + this.problem.eventName + '\',\'' + this.id + '\')">Select a valid node class from a list.</a>';
};

/**
 * Runs the fix for this solution.
 */
SetValidNodeClassSolution.prototype.fix = function(args){
	if(args[2] && args[2]=='complete'){
		var s = document.getElementById('nodeClassSelect_' + this.problem.id);
		this.problem.part.data = s.options[s.selectedIndex].value;
		this.problem.resolveProblem();
	} else {
		var p = document.getElementById('problemSolution_' + this.problem.id);
		var type = this.problem.parent.getType();

		/* wipe out text */
		p.innerHTML = '';
		
		if(!type || nodeTypes.indexOf(type)==-1){
			var html = '<font color="red">This problem cannot be resolved until a valid node type is chosen.</font>';
		} else {
			var classes = nodeClasses[nodeTypes.indexOf(type)];
			var text = nodeClassText[nodeTypes.indexOf(type)];
			
			/* create new html */
			var html = 'Select a node class from one of the following valid node classes:<br/>';
			html += '<select id="nodeClassSelect_' + this.problem.id + '">';
			for(var h=0;h<classes.length;h++){
				html += '<option value="' + classes[h] + '">' + text[h] + '</option>';
			};
			html += '</select><br/><input type="button" value="save" onclick="eventManager.fire(\'' + this.problem.eventName + '\',[\'' + this.id + '\',\'complete\'])"/>';
		};
		
		p.innerHTML = html;
	};	
};

/**
 * A solution that removes the node from the project.
 */
RemoveNodeSolution.prototype = new Solution;
RemoveNodeSolution.prototype.constructor = RemoveNodeSolution;
RemoveNodeSolution.prototype.parent = Solution.prototype;
function RemoveNodeSolution(problem, id){
	this.problem = problem;
	this.id = id;
	
	this.msg = '<a onclick="eventManager.fire(\'' + this.problem.eventName + '\',\'' + this.id + '\')">Remove the node from the project.</a>';
};

/**
 * Runs the fix for this solution.
 */
RemoveNodeSolution.prototype.fix = function(args){
	this.problem.parent.parent.removePart(this.problem.parent);
	this.problem.resolveProblem();
};

/**
 * A solution that allows the user to set a new filename for the node
 */
SetNewFilenameSolution.prototype = new Solution;
SetNewFilenameSolution.prototype.constructor = SetNewFilenameSolution;
SetNewFilenameSolution.prototype.parent = Solution.protoype;
function SetNewFilenameSolution(problem, id){
	this.problem = problem;
	this.id = id;
	
	this.msg = '<a onclick="eventManager.fire(\'' + this.problem.eventName + '\',\'' + this.id + '\')">Change the filename to the correct one (you must know what it is).</a>';
};

/**
 * Runs the fix for this solution.
 */
SetNewFilenameSolution.prototype.fix = function(args){
	if(args[2] && args[2]=='complete'){
		var val = document.getElementById('problemTextInput_' + this.problem.id).value;
		this.problem.part.data = val;
		this.problem.resolveProblem();
	} else {
		var p = document.getElementById('problemSolution_' + this.problem.id);
		
		/* wipe out text */
		p.innerHTML = '';
		
		/* create input and save button */
		p.innerHTML = 'Enter filename: <input type="text" id="problemTextInput_' + this.problem.id + '"/>' +
			'<input type="button" value="save" onclick="eventManager.fire(\'' + this.problem.eventName + '\',[\'' + this.id + '\',\'complete\'])"/>';
	};
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/cleaning/authorview_clean_solution.js');
};