/**
 * A Problem Object represents a type of problem, the severity of the problem and
 * possible solutions to the problem.
 * 
 * @param part
 * @param parent
 * @param severity
 * @return
 */
function Problem(part, parent, severity, cleaner){
	this.part;
	this.parent;
	this.severity;
	this.cleaner;
	this.id;
	this.eventName;
	this.resolved = false;
};

/**
 * Returns the appropriate Severity String based on the value of this.severity.
 * 
 * @return
 */
Problem.prototype.getSeverityHTML = function(){
	if(this.severity==1){
		return 'Notification';
	} else if(this.severity==2){
		return '<font color="yellow">Warning!</font>';
	} else if(this.severity==3){
		return '<font color="red">Critical!!</font>';
	};
};

/**
 * Returns the string describing this problem.
 * 
 * @return
 */
Problem.prototype.getProblemHTML = function(){
	return this.msg;
};

/**
 * Returns true if this problem has been resolved, false otherwise.
 * @return
 */
Problem.prototype.isResolved = function(){
	return this.resolved;
};

/**
 * Compiles and returns the HTML for all the suggested solutions for this problem.
 * 
 * @return
 */
Problem.prototype.getSolutionsHTML = function(){
	var allHTML;
	for(var k=0;k<this.solutions.length;k++){
		if(k==0){
			allHTML = this.solutions[k].getSolutionHTML() + ' <font color="green">(recommended)</font>';
		} else {
			allHTML += this.solutions[k].getSolutionHTML();
		}
		
		if(k != this.solutions.length - 1){
			allHTML += '<br/>';
		};
	};
	
	return allHTML;
};

/**
 * Given a table body, displays the severity, the nature of the problem
 * and the solutions that this problem object represents as a row in the table.
 * 
 * @param tbody
 * @return
 */
Problem.prototype.displayProblem = function(tbody){
	/* create elements */
	var tr = createElement(document, 'tr', {id:'problemRow_' + this.id});
	var sTD = createElement(document, 'td', {id:'problemSeverity_' + this.id});
	var pTD = createElement(document, 'td', {id:'problemText_' + this.id});
	var soTD = createElement(document, 'td', {id:'problemSolution_' + this.id});
	
	/* append elements */
	tbody.appendChild(tr);
	tr.appendChild(sTD);
	tr.appendChild(pTD);
	tr.appendChild(soTD);
	
	/* set the appropriate html in the TDs */
	sTD.innerHTML = this.getSeverityHTML();
	pTD.innerHTML = this.getProblemHTML();
	soTD.innerHTML = this.getSolutionsHTML();
};

/**
 * Called by solutions when they are completed. Changes the solutions
 * TD html to fixed and sets boolean flag 'resolved' to true.
 * 
 * @return
 */
Problem.prototype.resolveProblem = function(){
	/* get solutions td element for this problem */
	var td = document.getElementById('problemSolution_' + this.id);
	
	td.innerHTML = '<font color="red">RESOLVED</font>';
	
	/* set problem as resolved */
	this.resolved = true;
};

/**
 * Generates, creates and subscribes to a unique event for fixing the problem
 * that this represents.
 * 
 * @return
 */
Problem.prototype.generateProblemEvent = function(){
	this.eventName = this.cleaner.view.eventManager.generateUniqueEventName('cleanProblem_' + this.id);
	this.cleaner.view.eventManager.addEvent(this.eventName, [this.id]);
	this.cleaner.view.eventManager.subscribe(this.eventName, this.fixListener, this);
};

/**
 * Listens for the event that is unique to this problem. Finds the
 * correct solution and calls that solution's fix method.
 * 
 * @param type
 * @param args
 * @param obj
 */
Problem.prototype.fixListener = function(type,args,obj){
	if(args[0]==obj.id){
		for(var l=0;l<obj.solutions.length;l++){
			if(args[1]==obj.solutions[l].id){
				obj.solutions[l].fix(args);
			};
		};
	};
};

/**
 * A problem indicating a missing part of the parent object whose value could be set.
 */
MissingPartSettableValueProblem.prototype = new Problem;
MissingPartSettableValueProblem.prototype.constructor = MissingPartSettableValueProblem;
MissingPartSettableValueProblem.prototype.parent = Problem.prototype;
function MissingPartSettableValueProblem(part, parent, severity, cleaner){
	this.part = part;
	this.parent = parent;
	this.severity = severity;
	this.cleaner = cleaner;
	this.id = ++ this.cleaner.problemIdCounter;
	this.eventName;

	/* generate the event for this problem */
	this.generateProblemEvent();
	
	this.msg = 'Missing the ' + part.part;
	this.solutions = [new AddPartWithValueSolution(this, 0), new AddPartWithEmptyValueSolution(this, 1)];
};

MissingPartDefaultValueProblem.prototype = new Problem;
MissingPartDefaultValueProblem.prototype.constructor = MissingPartDefaultValueProblem;
MissingPartDefaultValueProblem.prototype.parent = Problem.prototype;
function MissingPartDefaultValueProblem(part, parent, severity, cleaner){
	this.part = part;
	this.parent = parent;
	this.severity = severity;
	this.cleaner = cleaner;
	this.id = ++ this.cleaner.problemIdCounter;
	this.eventName;

	/* generate the event for this problem */
	this.generateProblemEvent();
	
	this.msg = 'Missing the ' + part.part;
	this.solutions = [new AddPartWithEmptyValueSolution(this, 0)];
};

MissingFieldDefaultValueProblem.prototype = new Problem;
MissingFieldDefaultValueProblem.prototype.constructor = MissingFieldDefaultValueProblem;
MissingFieldDefaultValueProblem.prototype.parent = Problem.prototype;
function MissingFieldDefaultValueProblem(part, parent, severity, cleaner){
	this.part = part;
	this.parent = parent;
	this.severity = severity;
	this.cleaner = cleaner;
	this.id = ++ this.cleaner.problemIdCounter;
	this.eventName;

	/* generate the event for this problem */
	this.generateProblemEvent();
	
	this.msg = 'Missing the value for ' + part.part;
	this.solutions = [new SetDefaultFieldValueSolution(this, 0)];
};

MissingFieldSettableValueProblem.prototype = new Problem;
MissingFieldSettableValueProblem.prototype.constructor = MissingFieldSettableValueProblem;
MissingFieldSettableValueProblem.prototype.parent = Problem.prototype;
function MissingFieldSettableValueProblem(part, parent, severity, cleaner){
	this.part = part;
	this.parent = parent;
	this.severity = severity;
	this.cleaner = cleaner;
	this.id = ++ this.cleaner.problemIdCounter;
	this.eventName;

	/* generate the event for this problem */
	this.generateProblemEvent();
	
	this.msg = 'Missing the value for ' + part.part;
	this.solutions = [new SetFieldValueSolution(this, 0), new SetDefaultFieldValueSolution(this, 1)];
};

UnknownPartProblem.prototype = new Problem;
UnknownPartProblem.prototype.constructor = UnknownPartProblem;
UnknownPartProblem.prototype.parent = Problem.prototype;
function UnknownPartProblem(part, parent, severity, cleaner){
	this.part = part;
	this.parent = parent;
	this.severity = severity;
	this.cleaner = cleaner;
	this.id = ++ this.cleaner.problemIdCounter;
	this.eventName;

	/* generate the event for this problem */
	this.generateProblemEvent();
	
	this.msg = 'Unknown field found \'' + this.part.part + '\' with the value \'' + this.part.data + '\'';
	this.solutions = [new RemovePartSolution(this, 0), new DoNothingSolution(this, 1)];
};

WrongDataTypeProblem.prototype = new Problem;
WrongDataTypeProblem.prototype.constructor = WrongDataTypeProblem;
WrongDataTypeProblem.prototype.parent = Problem.prototype;
function WrongDataTypeProblem(part, parent, severity, cleaner){
	this.part = part;
	this.parent = parent;
	this.severity = severity;
	this.cleaner = cleaner;
	this.id = ++ this.cleaner.problemIdCounter;
	this.eventName;

	/* generate the event for this problem */
	this.generateProblemEvent();
	
	this.msg = 'The data type (Text,Number,Array) of the data for ' + this.part.part + ' is incorrect.';
	this.solutions = [new FixDataTypeSolution(this, 0), new DoNothingSolution(this, 1)];
};

/**
 * A problem object indicating duplicate identifiers in the project.
 */
DuplicateIdentifierProblem.prototype = new Problem;
DuplicateIdentifierProblem.prototype.constructor = DuplicateIdentifierProblem;
DuplicateIdentifierProblem.prototype.parent = Problem.prototype;
function DuplicateIdentifierProblem(part, parent, severity, cleaner){
	this.part = part; //in this case, it is an array of objects, containing the id and the owner (node or sequence) part
	this.parent = parent;
	this.severity = severity;
	this.cleaner = cleaner;
	this.id = ++ this.cleaner.problemIdCounter;
	this.eventName;

	/* generate the event for this problem */
	this.generateProblemEvent();
	
	this.msg = 'Duplicate IDs detected for id: ' + this.part[0].id;
	this.solutions = [new ResolveDuplicateIdentifierByDeletionSolution(this, 0), new ResolveDuplicateIdentifierByChangingSolution(this, 1)];
};

/**
 * A problem when an id that is referenced does not exist.
 */
ReferencedIdDoesNotExistProblem.prototype = new Problem;
ReferencedIdDoesNotExistProblem.prototype.constructor = ReferencedIdDoesNotExistProblem;
ReferencedIdDoesNotExistProblem.prototype.parent = Problem.prototype;
function ReferencedIdDoesNotExistProblem(part, parent, severity, cleaner){
	this.part = part;
	this.parent = parent;
	this.severity = severity;
	this.cleaner = cleaner;
	this.id = ++ this.cleaner.problemIdCounter;
	this.eventName;
	
	/* generate the event for this problem */
	this.generateProblemEvent();
	
	this.msg = 'The id \'' + this.part.data + '\' is referenced by ' + this.parent.part + ' but no object with that id exists in the project.';
	this.solutions = [new RemoveReferencedIdSolution(this, 0), new DoNothingSolution(this, 1)];
};

/**
 * A problem when a given identifier is not referenced by any object
 * in the project, indicating that it is unused (possibly unneeded).
 */
UnusedProblem.prototype = new Problem;
UnusedProblem.prototype.constructor = UnusedProblem;
UnusedProblem.prototype.parent = Problem.prototype;
function UnusedProblem(part, parent, severity, cleaner){
	this.part = part;
	this.parent = parent;
	this.severity = severity;
	this.cleaner = cleaner;
	this.id = ++ this.cleaner.problemIdCounter;
	this.eventName;
	
	/* generate the event for this problem */
	this.generateProblemEvent();
	
	this.msg = 'The object with id ' + this.part.data + ' is not referenced by anything in the project, indicating that it is not used.';
	this.solutions = [new RemoveUnusedSolution(this, 0), new DoNothingSolution(this, 1)];	
};

/**
 * A problem when the start point is invalid.
 */
InvalidStartPointProblem.prototype = new Problem;
InvalidStartPointProblem.prototype.constructor = InvalidStartPointProblem;
InvalidStartPointProblem.prototype.parent = Problem.prototype;
function InvalidStartPointProblem(part, parent, severity, cleaner){
	this.part = part;
	this.parent = parent;
	this.severity = severity;
	this.cleaner = cleaner;
	this.id = ++ this.cleaner.problemIdCounter;
	this.eventName;
	
	/* generate the event for this problem */
	this.generateProblemEvent();
	
	this.msg = 'The start point \'' + this.part.data + '\' is not valid.';
	this.solutions = [new AddValidStartPointSolution(this,0)];		
};

/**
 * A problem indicating a missing start point.
 */
MissingStartPointProblem.prototype = new Problem;
MissingStartPointProblem.prototype.constructor = MissingStartPointProblem;
MissingStartPointProblem.prototype.parent = Problem.prototype;
function MissingStartPointProblem(part, parent, severity, cleaner){
	this.part = part;
	this.parent = parent;
	this.severity = severity;
	this.cleaner = cleaner;
	this.id = ++ this.cleaner.problemIdCounter;
	this.eventName;
	
	/* generate the event for this problem */
	this.generateProblemEvent();
	
	this.msg = 'The start point is missing from the project';
	this.solutions = [new AddStartPointSolution(this,0)];		
};

/**
 * A problem representing a missing node class.
 */
MissingNodeClassProblem.prototype = new Problem;
MissingNodeClassProblem.prototype.constructor = MissingNodeClassProblem;
MissingNodeClassProblem.prototype.parent = Problem.prototype;
function MissingNodeClassProblem(part, parent, severity, cleaner){
	this.part = part;
	this.parent = parent;
	this.severity = severity;
	this.cleaner = cleaner;
	this.id = ++ this.cleaner.problemIdCounter;
	this.eventName;
	
	/* generate the event for this problem */
	this.generateProblemEvent();
	
	this.msg = 'The node class is missing from the node of type ' + this.parent.getType();
	this.solutions = [new AddNodeClassSolution(this,0), new DoNothingSolution(this,1)];		
};

/**
 * A problem indicating an invalid node class.
 */
InvalidNodeClassProblem.prototype = new Problem;
InvalidNodeClassProblem.prototype.constructor = InvalidNodeClassProblem;
InvalidNodeClassProblem.prototype.parent = Problem.prototype;
function InvalidNodeClassProblem(part, parent, severity, cleaner){
	this.part = part;
	this.parent = parent;
	this.severity = severity;
	this.cleaner = cleaner;
	this.id = ++ this.cleaner.problemIdCounter;
	this.eventName;
	
	/* generate the event for this problem */
	this.generateProblemEvent();
	
	this.msg = 'The node class is missing from the node of type ' + this.parent.getType();
	this.solutions = [new SetValidNodeClassSolution(this,0), new DoNothingSolution(this,1)];	
};

/**
 * A problem indicating a sequence with no references
 */
NoSequenceReferencesProblem.prototype = new Problem;
NoSequenceReferencesProblem.prototype.constructor = NoSequenceReferencesProblem;
NoSequenceReferencesProblem.prototype.parent = Problem.prototype;
function NoSequenceReferencesProblem(part, parent, severity, cleaner){
	this.part = part;
	this.parent = parent;
	this.severity = severity;
	this.cleaner = cleaner;
	this.id = ++ this.cleaner.problemIdCounter;
	this.eventName;

	/* generate the event for this problem */
	this.generateProblemEvent();
	
	this.msg = 'The sequence ' + this.part.getTitle() + ' does not have any steps so is not currently needed.';
	this.solutions = [new RemovePartSolution(this, 0), new DoNothingSolution(this, 1)];
};

/**
 * A problem when the file does not exist.
 */
FileNotFoundProblem.prototype = new Problem;
FileNotFoundProblem.prototype.constructor = FileNotFoundProblem;
FileNotFoundProblem.prototype.parent = Problem.prototype;
function FileNotFoundProblem(part, parent, severity, cleaner){
	this.part = part;
	this.parent = parent;
	this.severity = severity;
	this.cleaner = cleaner;
	this.id = ++ this.cleaner.problemIdCounter;
	this.eventName;
	
	/* generate the event for this problem */
	this.generateProblemEvent();
	
	this.msg = 'The file \'' + this.part.data + '\' for the node with id \'' + this.parent.getId() + '\' and title \'' + this.parent.getTitle() + '\' could not be found!';
	this.solutions = [new RemoveNodeSolution(this, 0), new SetNewFilenameSolution(this, 1), new DoNothingSolution(this, 2)];
};

InvalidContentProblem.prototype = new Problem;
InvalidContentProblem.prototype.constructor = InvalidContentProblem;
InvalidContentProblem.prototype.parent = Problem.prototype;
function InvalidContentProblem(part, parent, severity, cleaner){
	this.part = part;
	this.parent = parent;
	this.severity = severity;
	this.cleaner = cleaner;
	this.id = ++ this.cleaner.problemIdCounter;
	this.eventName;
	
	/* generate the event for this problem */
	this.generateProblemEvent();
	
	this.msg = 'The content for the node with id \'' + this.parent.getId() + '\' and title \'' + this.parent.getTitle() + '\' in the file \'' + this.part.data + '\' is not in valid JSON format (and it needs to be)!';
	this.solutions = [new RemoveNodeSolution(this, 0), new DoNothingSolution(this, 2)];
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/cleaning/authorview_clean_problem.js');
};