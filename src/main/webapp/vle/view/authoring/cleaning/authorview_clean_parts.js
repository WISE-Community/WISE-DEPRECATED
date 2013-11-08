/**
 * A part object represents a specific part of a project. At its most
 * basic, this is the part (field name) and data (value).
 * 
 * @param part
 * @param parent
 * @param data
 * @param cleaner
 */
function Part(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.analyzers = [];
	this.problems = [];
	this.defaultValue;
	this.isUnknownPart = false;
	this.defaultDataType = 'unknown';
};

/**
 * Returns true if this part has any problems, false otherwise.
 * 
 */
Part.prototype.hasProblem = function(){
	if(this.problems.length==0){
		return false;
	} else {
		for(var m=0;m<this.problems.length;m++){
			if(!this.problems[m].resolved){
				return true;
			};
		};
		return false;
	};
};

/**
 * Adds a new problem to this part. 
 * 
 * @param problem
 * @return
 */
Part.prototype.addProblem = function(problem){
	this.problems.push(problem);
};

/**
 * Runs the analyzers that are defined for this project part.
 * 
 * @return
 */
Part.prototype.analyze = function(){
	for(var g=0;g<this.analyzers.length;g++){
		this.analyzers[g].analyze();
	};
};

/**
 * Displays any of the problems identified for this project part.
 * 
 * @param tbody
 * @return
 */
Part.prototype.displayProblems = function(tbody){
	if(this.hasProblem()){
		var tr = createElement(document, 'tr', {rowspan:'2'});
		var td = createElement(document, 'td', {colspan:'3'});
		tbody.appendChild(tr);
		tr.appendChild(td);
		td.innerHTML = '<b>Problems detected for part ' + this.part + '</b>';
			
		for(var i=0;i<this.problems.length;i++){
			this.problems[i].displayProblem(tbody);
		};
	};
};

/**
 * Saves the part that this part represents to the given object.
 * 
 * @return
 */
Part.prototype.save = function(obj){
	obj[this.part] = this.data;
};

/**
 * Returns true if the data in the field is the correct type
 * for this type of part, returns false otherwise.
 */
Part.prototype.correctDataType = function(){
	return true;
};

/**
 * Attempts to convert the data represented by this part to the
 * default type for this part.
 */
Part.prototype.convertDataToDefaultType = function(){};

/**
 * Adds the part identifiers, along with their parents of any part that
 * represents an id to the given array.
 */
Part.prototype.getPartIds = function(idsArr){
	if(this.part=='identifier' && this.data && this.data!=''){
		idsArr.push({id:this.data, parent: this.parent, part: this});
	};
};

/**
 * Returns information about this part. At its most basic, returns the
 * string name/value pair that this part represents.
 * 
 * @return
 */
Part.prototype.getInfo = function(){
	return 'Name: ' + this.part + ' -- Value: ' + this.data;
};

/**
 * If this identifier belongs to sequence, adds it to the given
 * array.
 * 
 * @param idsArr
 */
Part.prototype.getSequenceIds = function(idsArr){
	if(this.part=='identifier' && this.data && this.data!=''){
		if(this.parent.part=='sequence'){
			idsArr.push({id: this.data, title: this.parent.getTitle()});
		};
	};
};

/**
 * Adds the referenced id of any part that is a string part into
 * the given array.
 * 
 * @param arr
 */
Part.prototype.getReferencedIds = function(arr){
	if((this.part=='stringPart' || this.part=='startPoint') && this.data && this.data!=''){
		arr.push(this.data);
	};
};

/**
 * Adds the problems of this part to the array.
 * 
 * @param arr
 * @return
 */
Part.prototype.getAllProblems = function(arr){
	for(var p=0;p<this.problems.length;p++){
		arr.push(this.problems[p]);
	};
};

/**
 * The project part is an object representation of the entire project
 */
ProjectPart.prototype = new Part;
ProjectPart.prototype.constructor = ProjectPart;
ProjectPart.prototype.parent = Part.prototype;
function ProjectPart(part, originalProject, cleaner){
	this.part = part;
	this.fixedProject;
	this.originalProject = originalProject;
	this.cleaner = cleaner;
	this.projectParts = [];
	this.analyzers = [new CriticalProjectPartsAnalyzer(this,this.cleaner), new DesirableProjectPartsAnalyzer(this,this.cleaner),
	                  new EmptyFieldProjectPartsAnalyzer(this,this.cleaner), new UnknownProjectPartAnalyzer(this,this.cleaner),
	                  new ProjectPartDataTypeAnalyzer(this, this.cleaner), new DuplicateIdentifierAnalyzer(this, this.cleaner)];
	this.problems = [];
	
	/* break the project and associated data into its component parts */
	for(var p in this.originalProject){
		this.projectParts.push(this.cleaner.ProjectPartFactory.getProjectPart(p, this, this.originalProject[p], this.cleaner));
	};
};

/**
 * Runs the analyzers that are defined for this project part.
 * 
 * @return
 */
ProjectPart.prototype.analyze = function(){
	/* call super analyze, which runs all of the analyzers for this */
	Part.prototype.analyze.call(this);
	
	/* call analayze on all of the project parts */
	for(var s=0;s<this.projectParts.length;s++){
		this.projectParts[s].analyze();
	};
};

/**
 * Displays any of the problems identified for this project part.
 * 
 * @param tbody
 * @return
 */
ProjectPart.prototype.displayProblems = function(tbody){
	/* display problems for the project */
	Part.prototype.displayProblems.call(this, tbody);
	
	/*display problems for the individual project parts */
	for(var j=0;j<this.projectParts.length;j++){
		this.projectParts[j].displayProblems(tbody);
	};
};

/**
 * Returns true if this or any of the component parts of the
 * project has a problem, returns false otherwise.
 */
ProjectPart.prototype.hasProblem = function(){
	/* return true if any of the project parts has a problem */
	for(var h=0;h<this.projectParts.length;h++){
		if(this.projectParts[h].hasProblem()){
			return true;
		};
	};
	
	/* call the super to return whether this has a problem */
	return Part.prototype.hasProblem.call(this);
};

/**
 * Saves the changes made during cleaning to a new project object
 * and returns that object.
 * 
 * @return
 */
ProjectPart.prototype.save = function(){
	this.fixedProject = {};
	
	for(var n=0;n<this.projectParts.length;n++){
		this.projectParts[n].save(this.fixedProject);
	};
	
	return this.fixedProject;
};

/**
 * Adds the given part to this part.
 * 
 * @param part
 * @return
 */
ProjectPart.prototype.addPart = function(part){
	/* add the part to the project parts */
	this.projectParts.push(part);
};

/**
 * Removes the given part from this part
 * 
 * @param part
 * @return
 */
ProjectPart.prototype.removePart = function(part){
	/* removes the part from project parts */
	this.projectParts.splice(this.projectParts.indexOf(part), 1);
};

/**
 * Returns an array of ids along with the parents of any parts in
 * the project that has an identifier field.
 */
ProjectPart.prototype.getPartIds = function(){
	var idsArr = [];
	
	for(var w=0;w<this.projectParts.length;w++){
		this.projectParts[w].getPartIds(idsArr);
	};
	
	return idsArr;
};

/**
 * Returns information about this part. At its most basic, returns the
 * string name/value pair that this part represents.
 * 
 * @return
 */
ProjectPart.prototype.getInfo = function(){
	var str = 'Name: Project -- contains the following Parts: ';
	
	for(var c=0;c<this.projectParts.length;c++){
		str += this.projectParts[c].getInfo() + ' ';
	};
	
	return str;
};

/**
 * Returns an array of Ids that are referenced by parts in this project.
 * 
 * @return
 */
ProjectPart.prototype.getReferencedIds = function(){
	var ids = [];
	
	for(var f=0;f<this.projectParts.length;f++){
		this.projectParts[f].getReferencedIds(ids);
	};
	
	return ids;
};

/**
 * If this identifier belongs to sequence, adds it to the given
 * array.
 * 
 * @param idsArr
 */
ProjectPart.prototype.getSequenceIds = function(){
	var ids = [];
	
	for(var g=0;g<this.projectParts.length;g++){
		this.projectParts[g].getSequenceIds(ids);
	};
	
	return ids;
};

/**
 * Returns an array of all the problems for all the parts in this project.
 * 
 * @return
 */
ProjectPart.prototype.getAllProblems = function(){
	var arr = [];
	
	for(var q=0;q<this.projectParts.length;q++){
		this.projectParts[q].getAllProblems(arr);
	};
	
	return arr;
};

/**
 * Returns an array of any problems that are of the given severity. Returns
 * an empty array if none exist.
 * 
 * @return
 */
ProjectPart.prototype.getProblemsBySeverity = function(severity){
	var retArr = [];
	var allProblems = this.getAllProblems();
	
	for(var r=0;r<allProblems.length;r++){
		if(allProblems[r].severity==severity){
			retArr.push(allProblems[r]);
		};
	};
	
	return retArr;
};

/**
 * An unknown project part object
 */
UnknownPart.prototype = new Part;
UnknownPart.prototype.constructor = UnknownPart;
UnknownPart.prototype.parent = Part.prototype;
function UnknownPart(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.defaultValue = null;
	this.isUnknownPart = true;
	this.problems = [];
};

/**
 * A Project Part Object whose value is a boolean
 */
BooleanFieldPart.prototype = new Part;
BooleanFieldPart.prototype.constructor = BooleanFieldPart;
BooleanFieldPart.prototype.parent = Part.prototype;
function BooleanFieldPart(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.defaultValue = false;
	this.defaultDataType = 'boolean';
	this.problems = [];
};

/**
 * Returns true if the data in the field is the correct type
 * for this type of part, returns false otherwise.
 */
BooleanFieldPart.prototype.correctDataType = function(){
	if(typeof this.data=='boolean'){
		return true;
	} else {
		return false;
	};
};

/**
 * Attempts to convert the data represented by this part to the
 * default type for this part.
 */
BooleanFieldPart.prototype.convertDataToDefaultType = function(){
	try{
		var converted = Boolean(this.data);
		this.data = converted;
	} catch(e){
		//do nothing
	};
};

/**
 * A Project Part Object whose value is a string
 */
TextFieldPart.prototype = new Part;
TextFieldPart.prototype.constructor = TextFieldPart;
TextFieldPart.prototype.parent = Part.prototype;
function TextFieldPart(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.defaultDataType = 'string';
	this.problems = [];
};

/**
 * Returns true if the data in the field is the correct type
 * for this type of part, returns false otherwise.
 */
TextFieldPart.prototype.correctDataType = function(){
	if(typeof this.data=='string'){
		return true;
	} else {
		return false;
	};
};

/**
 * Attempts to convert the data represented by this part to the
 * default type for this part.
 */
TextFieldPart.prototype.convertDataToDefaultType = function(){
	try{
		var converted = new String(this.data).toString();
		this.data = converted;
	} catch(e){
		//do nothing
	};
};

/**
 * A Project Part Object whose value is an array
 */
ArrayFieldPart.prototype = new Part;
ArrayFieldPart.prototype.constructor = ArrayFieldPart;
ArrayFieldPart.prototype.parent = Part.prototype;
function ArrayFieldPart(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.arrayParts = [];
	this.defaultDataType = 'Array';
	this.problems = [];
};

/**
 * Returns true if the data in the field is the correct type
 * for this type of part, returns false otherwise.
 */
ArrayFieldPart.prototype.correctDataType = function(){
	if(this.data instanceof Array){
		return true;
	} else {
		return false;
	};
};

/**
 * Parses this ArrayFieldPart's array, populating its arrayParts field
 */
ArrayFieldPart.prototype.parseArray = function(){
	if(this.data){
		for(var a=0;a<this.data.length;a++){
			this.arrayParts.push(this.cleaner.ProjectPartFactory.getProjectArrayPart(this.part, this.data[a], this.cleaner, this));
		};
	} else {
		//TODO = this is an error - catch it and report
	};
};

ArrayFieldPart.prototype.save = function(obj){
	var arr = [];
	/* call save for all array parts in this array */
	for(var d=0;d<this.arrayParts.length;d++){
		this.arrayParts[d].save(arr);
	};
	
	/* save arrayParts array as value of this part */
	obj[this.part] = arr;
};

/**
 * Runs the analyze method for all parts in this array.
 */
ArrayFieldPart.prototype.analyze = function(){
	/* call super analyze, which runs all of the analyzers for this */
	Part.prototype.analyze.call(this);
	
	/* call the analyze method for all of the parts */
	for(var v=0;v<this.arrayParts.length;v++){
		this.arrayParts[v].analyze();
	};
};

/**
 * Attempts to convert the data represented by this part to the
 * default type for this part.
 */
ArrayFieldPart.prototype.convertDataToDefaultType = function(){
	this.data = [this.data];
};

/**
 * Calls the display problems method for all its array parts.
 */
ArrayFieldPart.prototype.displayProblems = function(tbody){
	/* display problems for the project */
	Part.prototype.displayProblems.call(this, tbody);
	
	/* display the problems for all of the array parts */
	for(var w=0;w<this.arrayParts.length;w++){
		this.arrayParts[w].displayProblems(tbody);
	};
};

/**
 * Calls the get Part ids method for each part in the array that 
 * this part represents.
 */
ArrayFieldPart.prototype.getPartIds = function(idsArr){
	for(var x=0;x<this.arrayParts.length;x++){
		this.arrayParts[x].getPartIds(idsArr);
	};
};

/**
 * Calls the getReferencedIds method for each part in the array that
 * this part represents.
 */
ArrayFieldPart.prototype.getReferencedIds = function(arr){
	for(var f=0;f<this.arrayParts.length;f++){
		this.arrayParts[f].getReferencedIds(arr);
	};
};

/**
 * Removes the given part from this array parts.
 * @param part
 */
ArrayFieldPart.prototype.removePart = function(part){
	this.arrayParts.splice(this.arrayParts.indexOf(part),1);
};

/**
 * Returns true if this or any of the component parts of the
 * array has a problem, returns false otherwise.
 */
ArrayFieldPart.prototype.hasProblem = function(){
	/* return true if any of the project parts has a problem */
	for(var h=0;h<this.arrayParts.length;h++){
		if(this.arrayParts[h].hasProblem()){
			return true;
		};
	};
	
	/* call the super to return whether this has a problem */
	return Part.prototype.hasProblem.call(this);
};

/**
 * If this identifier belongs to sequence, adds it to the given
 * array.
 * 
 * @param idsArr
 */
ArrayFieldPart.prototype.getSequenceIds = function(arr){
	for(var g=0;g<this.arrayParts.length;g++){
		this.arrayParts[g].getSequenceIds(arr);
	};
	
	Part.prototype.getSequenceIds.call(this, arr)
};

/**
 * Adds all the problems for all the parts of this part into the given array.
 */
ArrayFieldPart.prototype.getAllProblems = function(arr){
	for(var q=0;q<this.arrayParts.length;q++){
		this.arrayParts[q].getAllProblems(arr);
	};
	
	Part.prototype.getAllProblems.call(this, arr);
};

/**
 * An AutoStep project part object.
 */
AutoStep.prototype = new BooleanFieldPart;
AutoStep.prototype.constructor = AutoStep;
AutoStep.prototype.parent = BooleanFieldPart.prototype;
function AutoStep(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.defaultValue = true;
	this.problems = [];
};

/**
 * A StepLevelNumbering project part object.
 */
StepLevelNum.prototype = new BooleanFieldPart;
StepLevelNum.prototype.constructor = StepLevelNum;
StepLevelNum.prototype.parent = BooleanFieldPart.prototype;
function StepLevelNum(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.defaultValue = false;
	this.problems = [];
};

/**
 * A StepLevelNumbering project part object.
 */
StepTerm.prototype = new TextFieldPart;
StepTerm.prototype.constructor = StepTerm;
StepTerm.prototype.parent = TextFieldPart.prototype;
function StepTerm(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.defaultValue = '';
	this.problems = [];
};

/**
 * A title project part object.
 */
Title.prototype = new TextFieldPart;
Title.prototype.constructor = Title;
Title.prototype.parent = TextFieldPart.prototype;
function Title(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.defaultValue = '';
	this.problems = [];
};

/**
 * A title project part object.
 */
StartPoint.prototype = new TextFieldPart;
StartPoint.prototype.constructor = StartPoint;
StartPoint.prototype.parent = TextFieldPart.prototype;
function StartPoint(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.defaultValue = '';
	this.problems = [];
	this.analyzers = [new StartPointAnalyzer(this, this.cleaner)];
};

/**
 * A ProjectNodes project part object.
 */
ProjectNodes.prototype = new ArrayFieldPart;
ProjectNodes.prototype.constructor = ProjectNodes;
ProjectNodes.prototype.parent = ArrayFieldPart.prototype;
function ProjectNodes(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.arrayParts = [];
	this.defaultValue = [];
	this.problems = [];
	
	this.parseArray();
};

/**
 * A sequences project part object.
 */
ProjectSequences.prototype = new ArrayFieldPart;
ProjectSequences.prototype.constructor = ProjectSequences;
ProjectSequences.prototype.parent = ArrayFieldPart.prototype;
function ProjectSequences(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.arrayParts = [];
	this.defaultValue = [];
	this.problems = [];
	
	this.parseArray();
};

/**
 * A node project part object.
 */
NodePart.prototype = new Part;
NodePart.prototype.constructor = NodePart;
NodePart.prototype.parent = Part.prototype;
function NodePart(data, cleaner, parent){
	this.part = 'node';
	this.data = data;
	this.cleaner = cleaner;
	this.parent = parent;
	this.nodeParts = [];
	this.defaultValue = {};
	this.problems = [];
	
	for(var p in this.data){
		this.nodeParts.push(this.cleaner.ProjectPartFactory.getProjectPart(p, this, this.data[p], this.cleaner));
	};
	
	this.analyzers = [new MissingNodePartAnalyzer(this, this.cleaner), new EmptyFieldNodePartAnalyzer(this, this.cleaner),
	                  new UnknownNodePartAnalyzer(this, this.cleaner), new NodeDataTypeAnalyzer(this, this.cleaner),
	                  new NodeClassAnalyzer(this, this.cleaner)];
};

/**
 * Node parts should save their individual fields, then add
 * themselves to the array on save.
 */
NodePart.prototype.save = function(arr){
	var node = {};
	for(var o=0;o<this.nodeParts.length;o++){
		this.nodeParts[o].save(node);
	};
	
	arr.push(node);
};

/**
 * Removes the given part from this part
 * 
 * @param part
 */
NodePart.prototype.removePart = function(part){
	/* removes the given part from node parts */
	this.nodeParts.splice(this.nodeParts.indexOf(part), 1);
};

/**
 * Adds the given part to this part.
 * 
 * @param part
 */
NodePart.prototype.addPart = function(part){
	this.nodeParts.push(part);
};

/**
 * Calls all the node part's node parts getPartid method.
 * 
 * @param idsArr
 */
NodePart.prototype.getPartIds = function(idsArr){
	for(var y=0;y<this.nodeParts.length;y++){
		this.nodeParts[y].getPartIds(idsArr);
	};
};

/**
 * Calls the getReferencedIds method for each part in the array that
 * this part represents.
 */
NodePart.prototype.getReferencedIds = function(arr){
	for(var f=0;f<this.nodeParts.length;f++){
		this.nodeParts[f].getReferencedIds(arr);
	};
};

/**
 * Returns information about this part. At its most basic, returns the
 * string name/value pair that this part represents.
 * 
 * @return
 */
NodePart.prototype.getInfo = function(){
	var str = 'Node - contains the following parts: ';
	
	for(var d=0;d<this.nodeParts.length;d++){
		str += this.nodeParts[d].getInfo() + ' ';
	};
	
	return str;
};

/**
 * Runs the analyze method for all parts in this array.
 */
NodePart.prototype.analyze = function(){
	/* call super analyze, which runs all of the analyzers for this */
	Part.prototype.analyze.call(this);
	
	/* call the analyze method for all of the parts */
	for(var v=0;v<this.nodeParts.length;v++){
		this.nodeParts[v].analyze();
	};
};

/**
 * Calls the display problems method for all its array parts.
 */
NodePart.prototype.displayProblems = function(tbody){
	/* display problems for the project */
	Part.prototype.displayProblems.call(this, tbody);
	
	/* display the problems for all of the array parts */
	for(var w=0;w<this.nodeParts.length;w++){
		this.nodeParts[w].displayProblems(tbody);
	};
};

/**
 * Returns true if this or any of the component parts of the
 * node has a problem, returns false otherwise.
 */
NodePart.prototype.hasProblem = function(){
	/* return true if any of the project parts has a problem */
	for(var h=0;h<this.nodeParts.length;h++){
		if(this.nodeParts[h].hasProblem()){
			return true;
		};
	};
	
	/* call the super to return whether this has a problem */
	return Part.prototype.hasProblem.call(this);
};

/**
 * If this identifier belongs to sequence, adds it to the given
 * array.
 * 
 * @param idsArr
 */
NodePart.prototype.getSequenceIds = function(arr){
	for(var g=0;g<this.nodeParts.length;g++){
		this.nodeParts[g].getSequenceIds(arr);
	};
	
	Part.prototype.getSequenceIds.call(this, arr)
};

/**
 * Returns the type for this node part if one exists and its
 * data is valid, returns null otherwise.
 * 
 * @return
 */
NodePart.prototype.getType = function(){
	for(var j=0;j<this.nodeParts.length;j++){
		if(this.nodeParts[j].part=='type'){
			return this.nodeParts[j].data;
		};
	};
};

/**
 * Returns the class for this node part if one exists and its
 * data is valid, returns null otherwise.
 * 
 * @return
 */
NodePart.prototype.getNodeClassPart = function(){
	for(var k=0;k<this.nodeParts.length;k++){
		if(this.nodeParts[k].part=='class'){
			return this.nodeParts[k];
		};
	};
};

/**
 * Returns the title data value that is part of this node part.
 * 
 * @return
 */
NodePart.prototype.getTitle = function(){
	for(var m=0;m<this.nodeParts.length;m++){
		if(this.nodeParts[m].part=='title'){
			return this.nodeParts[m].data;
		};
	};
};

/**
 * Returns the identifier data value that is part of this node part.
 * 
 * @return
 */
NodePart.prototype.getId = function(){
	for(var n=0;n<this.nodeParts.length;n++){
		if(this.nodeParts[n].part=='identifier'){
			return this.nodeParts[n].data;
		};
	};
};

/**
 * Adds all the problems for all the parts of this part into the given array.
 */
NodePart.prototype.getAllProblems = function(arr){
	for(var q=0;q<this.nodeParts.length;q++){
		this.nodeParts[q].getAllProblems(arr);
	};
	
	Part.prototype.getAllProblems.call(this, arr);
};

/**
 * A sequence project part object.
 */
SequencePart.prototype = new Part;
SequencePart.prototype.constructor = SequencePart;
SequencePart.prototype.parent = Part.prototype;
function SequencePart(data, cleaner, parent){
	this.part = 'sequence';
	this.data = data;
	this.cleaner = cleaner;
	this.parent = parent;
	this.sequenceParts = [];
	this.defaultValue = {};
	this.problems = [];
	
	for(var p in this.data){
		this.sequenceParts.push(this.cleaner.ProjectPartFactory.getProjectPart(p, this, this.data[p], this.cleaner));
	};
	
	this.analyzers = [new MissingSequencePartAnalyzer(this, this.cleaner), new EmptyFieldSequencePartAnalyzer(this, this.cleaner),
	                  new UnknownSequencePartAnalyzer(this, this.cleaner), new SequenceDataTypeAnalyzer(this, this.cleaner),
	                  new NoSequenceReferencesAnalyzer(this, this.cleaner)];
};

/**
 * Sequence parts should save their individual fields, then add
 * themselves to the array on save.
 */
SequencePart.prototype.save = function(arr){
	var sequence = {};
	for(var p=0;p<this.sequenceParts.length;p++){
		this.sequenceParts[p].save(sequence);
	};
	
	arr.push(sequence);
};

/**
 * Adds the given part to this part.
 * 
 * @param part
 * @return
 */
SequencePart.prototype.addPart = function(part){
	this.sequenceParts.push(part);
};

/**
 * Removes the given part from this part
 * 
 * @param part
 * @return
 */
SequencePart.prototype.removePart = function(part){
	/* removes the given part from sequence parts */
	this.sequenceParts.splice(this.sequenceParts.indexOf(part), 1);
};

/**
 * Calls all the node part's node parts getPartid method.
 * 
 * @param idsArr
 */
SequencePart.prototype.getPartIds = function(idsArr){
	for(var y=0;y<this.sequenceParts.length;y++){
		this.sequenceParts[y].getPartIds(idsArr);
	};
};

/**
 * Returns information about this part. At its most basic, returns the
 * string name/value pair that this part represents.
 * 
 * @return
 */
SequencePart.prototype.getInfo = function(){
	var str = 'Sequence - contains the following parts: ';
	
	for(var d=0;d<this.sequenceParts.length;d++){
		str += this.sequenceParts[d].getInfo() + ' ';
	};
	
	return str;
};

/**
 * Runs the analyze method for all parts in this array.
 */
SequencePart.prototype.analyze = function(){
	/* call super analyze, which runs all of the analyzers for this */
	Part.prototype.analyze.call(this);
	
	/* call the analyze method for all of the parts */
	for(var v=0;v<this.sequenceParts.length;v++){
		this.sequenceParts[v].analyze();
	};
};

/**
 * Calls the display problems method for all its array parts.
 */
SequencePart.prototype.displayProblems = function(tbody){
	/* display problems for the project */
	Part.prototype.displayProblems.call(this, tbody);
	
	/* display the problems for all of the array parts */
	for(var w=0;w<this.sequenceParts.length;w++){
		this.sequenceParts[w].displayProblems(tbody);
	};
};

/**
 * Returns true if this or any of the component parts of the
 * sequence has a problem, returns false otherwise.
 */
SequencePart.prototype.hasProblem = function(){
	/* return true if any of the project parts has a problem */
	for(var h=0;h<this.sequenceParts.length;h++){
		if(this.sequenceParts[h].hasProblem()){
			return true;
		};
	};
	
	/* call the super to return whether this has a problem */
	return Part.prototype.hasProblem.call(this);
};

/**
 * Calls the getReferencedIds method for each part in the array that
 * this part represents.
 */
SequencePart.prototype.getReferencedIds = function(arr){
	for(var f=0;f<this.sequenceParts.length;f++){
		this.sequenceParts[f].getReferencedIds(arr);
	};
};

/**
 * If this identifier belongs to sequence, adds it to the given
 * array.
 * 
 * @param idsArr
 */
SequencePart.prototype.getSequenceIds = function(arr){
	for(var g=0;g<this.sequenceParts.length;g++){
		this.sequenceParts[g].getSequenceIds(arr);
	};
	
	Part.prototype.getSequenceIds.call(this, arr)
};

/**
 * Returns the title if it exists as a part of this sequence.
 */
SequencePart.prototype.getTitle = function(){
	for(var j=0;j<this.sequenceParts.length;j++){
		if(this.sequenceParts[j].part=='title'){
			return this.sequenceParts[j].data;
		};
	};
};

/**
 * Returns the references part of this sequence part.
 * 
 * @return
 */
SequencePart.prototype.getReferences = function(){
	for(var l=0;l<this.sequenceParts.length;l++){
		if(this.sequenceParts[l].part=='refs'){
			return this.sequenceParts[l];
		};
	};
};

/**
 * Adds all the problems for all the parts of this part into the given array.
 */
SequencePart.prototype.getAllProblems = function(arr){
	for(var q=0;q<this.sequenceParts.length;q++){
		this.sequenceParts[q].getAllProblems(arr);
	};
	
	Part.prototype.getAllProblems.call(this, arr);
};

/**
 * A node type project parts object.
 */
NodeType.prototype = new TextFieldPart;
NodeType.prototype.constructor = NodeType;
NodeType.prototype.parent = TextFieldPart.prototype;
function NodeType(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.defaultValue = '';
	this.problems = [];
};

/**
 * A node identifier project parts object.
 */
NodeIdentifier.prototype = new TextFieldPart;
NodeIdentifier.prototype.constructor = NodeIdentifier;
NodeIdentifier.prototype.parent = TextFieldPart.prototype;
function NodeIdentifier(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.defaultValue = '';
	this.problems = [];
	this.analyzers = [new UnusedAnalyzer(this, this.cleaner)];
};

/**
 * A node ref project parts object.
 */
NodeRef.prototype = new TextFieldPart;
NodeRef.prototype.constructor = NodeRef;
NodeRef.prototype.parent = TextFieldPart.prototype;
function NodeRef(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.defaultValue = '';
	this.problems = [];
	
	this.analyzers = [new FileAndContentAnalyzer(this, this.cleaner)];
};

/**
 * A previous work project parts object.
 */
PreviousWork.prototype = new ArrayFieldPart;
PreviousWork.prototype.constructor = PreviousWork;
PreviousWork.prototype.parent = ArrayFieldPart.prototype;
function PreviousWork(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.arrayParts = [];
	this.defaultValue = [];
	this.analyzers = [new ReferencedIdDoesNotExistAnalyzer(this, this.cleaner)];
	this.problems = [];
	
	this.parseArray();
};

/**
 * A node links parts object.
 */
NodeLinks.prototype = new ArrayFieldPart;
NodeLinks.prototype.constructor = NodeLinks;
NodeLinks.prototype.parent = ArrayFieldPart.prototype;
function NodeLinks(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.arrayParts = [];
	this.defaultValue = [];
	this.analyzers = [];
	this.problems = [];
	
	this.parseArray();
}

/**
 * A project constraints parts object.
 */
ProjectConstraints.prototype = new ArrayFieldPart;
ProjectConstraints.prototype.constructor = ProjectConstraints;
ProjectConstraints.prototype.parent = ArrayFieldPart.prototype;
function ProjectConstraints(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.arrayParts = [];
	this.defaultValue = [];
	this.analyzers = [];
	this.problems = [];
	
	this.parseArray();
}

/**
 * A node class project parts object.
 */
NodeClass.prototype = new TextFieldPart;
NodeClass.prototype.constructor = NodeClass;
NodeClass.prototype.parent = TextFieldPart.prototype;
function NodeClass(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.defaultValue = '';
	this.problems = [];
};

/**
 * A node view project parts object.
 */
NodeView.prototype = new TextFieldPart;
NodeView.prototype.constructor = NodeView;
NodeView.prototype.parent = TextFieldPart.prototype;
function NodeView(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.defaultValue = '';
	this.problems = [];
};

/**
 * A node refs project parts object.
 */
NodeRefs.prototype = new ArrayFieldPart;
NodeRefs.prototype.constructor = NodeRefs;
NodeRefs.prototype.parent = ArrayFieldPart.prototype;
function NodeRefs(part, parent, data, cleaner){
	this.part = part;
	this.parent = parent;
	this.data = data;
	this.cleaner = cleaner;
	this.arrayParts = [];
	this.defaultValue = [];
	this.analyzers = [new ReferencedIdDoesNotExistAnalyzer(this, this.cleaner)];
	this.problems = [];
	
	this.parseArray();
};

/**
 * A string project part object
 */
StringPart.prototype = new Part;
StringPart.prototype.constructor = StringPart;
StringPart.prototype.parent = Part.prototype;
function StringPart(data, cleaner, parent){
	this.part = 'stringPart';
	this.data = data;
	this.cleaner = cleaner;
	this.parent = parent;
	this.defaultValue = '';
	this.problems = [];
};

/* StringParts add their data to the given array on save */
StringPart.prototype.save = function(arr){
	arr.push(this.data);
};

/**
 * A constraint object project part object
 * This is at its most simple form now.
 * Eventually needs to look at all the fields and make sure they are the right types.
 * TODO: Jon flush this out at some point in the future
 */
ConstraintObjectPart.prototype = new Part;
ConstraintObjectPart.prototype.constructor = ConstraintObjectPart;
ConstraintObjectPart.prototype.parent = Part.prototype;
function ConstraintObjectPart(data, cleaner, parent){
	this.part = 'constraintPart';
	this.data = data;
	this.cleaner = cleaner;
	this.parent = parent;
	this.defaultValue = '';
	this.problems = [];
};

/* ConstraintObjectParts add their data to the given array on save */
ConstraintObjectPart.prototype.save = function(arr){
	arr.push(this.data);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/cleaning/authorview_clean_parts.js');
};