/**
 * An analyzer object contains the logic needed for a specific analysis.
 */
function Analyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this Analyzer object.
 */
Analyzer.prototype.analyze = function(){};

/**
 * An analyzer that looks for missing critical project parts.
 */
CriticalProjectPartsAnalyzer.prototype = new Analyzer;
CriticalProjectPartsAnalyzer.prototype.constructor = CriticalProjectPartsAnalyzer;
CriticalProjectPartsAnalyzer.prototype.parent = Analyzer.prototype;
function CriticalProjectPartsAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this Analyzer object.
 */
CriticalProjectPartsAnalyzer.prototype.analyze = function(){
	var hasTitle = false;
	var hasNodes = false;
	var hasSequences = false;
	var hasStartPoint = false;
	
	for(var f=0;f<this.part.projectParts.length;f++){
		var currentPart = this.part.projectParts[f].part;
		if(currentPart=='title'){
			hasTitle = true;
		} else if(currentPart=='nodes'){
			hasNodes = true;
		} else if(currentPart=='sequences'){
			hasSequences = true;
		} else if(currentPart=='startPoint'){
			hasStartPoint = true;
		};
	};
	
	if(!hasTitle){
		this.part.addProblem(new MissingPartSettableValueProblem(new Title('title', this.part, null, this.cleaner), this.part, 3, this.cleaner));
	};
	
	if(!hasNodes){
		this.part.addProblem(new MissingPartDefaultValueProblem(new ProjectNodes('nodes', this.part, null, this.cleaner), this.part, 3, this.cleaner));
	};
	
	if(!hasSequences){
		this.part.addProblem(new MissingPartDefaultValueProblem(new ProjectSequences('sequences', this.part, null, this.cleaner), this.part, 3, this.cleaner));
	};
	
	if(!hasStartPoint){
		this.part.addProblem(new MissingStartPointProblem(new StartPoint('startPoint', this.part, null, this.cleaner), this.part, 3, this.cleaner));
	};
};

/**
 * An analyzer that looks for missing desirable project parts.
 */
DesirableProjectPartsAnalyzer.prototype = new Analyzer;
DesirableProjectPartsAnalyzer.prototype.constructor = DesirableProjectPartsAnalyzer;
DesirableProjectPartsAnalyzer.prototype.parent = Analyzer.prototype;
function DesirableProjectPartsAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this Analyzer object.
 */
DesirableProjectPartsAnalyzer.prototype.analyze = function(){
	var hasAutoStep;
	var hasStepLevelNum;
	var hasStepTerm;
	
	for(var f=0;f<this.part.projectParts.length;f++){
		var currentPart = this.part.projectParts[f].part;
		if(currentPart=='autoStep'){
			hasAutoStep = true;
		} else if(currentPart=='stepLevelNum'){
			hasStepLevelNum = true;
		} else if(currentPart=='stepTerm'){
			hasStepTerm = true;
		};
	};
	
	if(!hasAutoStep){
		this.part.addProblem(new MissingPartDefaultValueProblem(new AutoStep('autoStep', this.part, null, this.cleaner), this.part, 2, this.cleaner));
	};
	
	if(!hasStepLevelNum){
		this.part.addProblem(new MissingPartDefaultValueProblem(new StepLevelNum('stepLevelNum', this.part, null, this.cleaner), this.part, 2, this.cleaner));
	};
	
	if(!hasStepTerm){
		this.part.addProblem(new MissingPartSettableValueProblem(new StepTerm('stepTerm', this.part, null, this.cleaner), this.part, 2, this.cleaner));
	};
};

/**
 * An Analyzer that looks for empty string or undefined fields in the project.
 */
EmptyFieldProjectPartsAnalyzer.prototype = new Analyzer;
EmptyFieldProjectPartsAnalyzer.prototype.constructor = EmptyFieldProjectPartsAnalyzer;
EmptyFieldProjectPartsAnalyzer.prototype.parent = Analyzer.prototype;
function EmptyFieldProjectPartsAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this analyzer.
 */
EmptyFieldProjectPartsAnalyzer.prototype.analyze = function(){
	for(var q=0;q<this.part.projectParts.length;q++){
		var currentPart = this.part.projectParts[q];
		if(currentPart.data===undefined || currentPart.data===''){
			if(currentPart.part=='title'){
				this.part.addProblem(new MissingFieldSettableValueProblem(currentPart, this.part, 3, this.cleaner));
			} else if(currentPart.part=='nodes'){
				this.part.addProblem(new MissingFieldDefaultValueProblem(currentPart, this.part, 2, this.cleaner));
			} else if(currentPart.part=='sequences'){
				this.part.addProblem(new MissingFieldDefaultValueProblem(currentPart, this.part, 2, this.cleaner));
			} else if(currentPart.part=='stepTerm'){
				this.part.addProblem(new MissingFieldSettableValueProblem(currentPart, this.part, 1, this.cleaner));
			} else if(currentPart.part=='stepLevelNum'){
				this.part.addProblem(new MissingFieldDefaultValueProblem(currentPart, this.part, 1, this.cleaner));
			} else if(currentPart.part=='autoStep'){
				this.part.addProblem(new MissingFieldDefaultValueProblem(currentPart, this.part, 1, this.cleaner));
			};
		};
	};
};

/**
 * The UnknownProjectPartAnalyzer looks for any fields that are never
 * used in projects.
 */
UnknownProjectPartAnalyzer.prototype = new Analyzer;
UnknownProjectPartAnalyzer.prototype.constructor = UnknownProjectPartAnalyzer;
UnknownProjectPartAnalyzer.prototype.parent = Analyzer.prototype;
function UnknownProjectPartAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for the Analyzer
 */
UnknownProjectPartAnalyzer.prototype.analyze = function(){
	for(var r=0;r<this.part.projectParts.length;r++){
		var currentPart = this.part.projectParts[r];
		if(currentPart.isUnknownPart){
			this.part.addProblem(new UnknownPartProblem(currentPart, this.part, 1, this.cleaner));
		};
	};
};

/**
 * The ProjectPartDataTypeAnalyzer looks at the project parts' fields to
 * ensure they are the correct type.
 */
ProjectPartDataTypeAnalyzer.prototype = new Analyzer;
ProjectPartDataTypeAnalyzer.prototype.constructor = ProjectPartDataTypeAnalyzer;
ProjectPartDataTypeAnalyzer.prototype.parent = Analyzer.prototype;
function ProjectPartDataTypeAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this analyzer.
 */
ProjectPartDataTypeAnalyzer.prototype.analyze = function(){
	for(var t=0;t<this.part.projectParts.length;t++){
		var currentPart = this.part.projectParts[t];
		if(!currentPart.correctDataType()){
			this.part.addProblem(new WrongDataTypeProblem(currentPart, this.part, 2, this.cleaner));
		};
	};
};

/**
 * Looks at a sequence part parts to make sure they are all there.
 */
MissingSequencePartAnalyzer.prototype = new Analyzer;
MissingSequencePartAnalyzer.prototype.constructor = MissingSequencePartAnalyzer;
MissingSequencePartAnalyzer.prototype.parent = Analyzer.prototype;
function MissingSequencePartAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this analyzer.
 */
MissingSequencePartAnalyzer.prototype.analyze = function(){
	var hasType = false;
	var hasIdentifier = false;
	var hasTitle = false;
	var hasView = false;
	var hasRefs = false;
	
	for(var u=0;u<this.part.sequenceParts.length;u++){
		var currentPart = this.part.sequenceParts[u];
		if(currentPart.part=='type'){
			hasType = true;
		} else if(currentPart.part=='identifier'){
			hasIdentifier = true;
		} else if(currentPart.part=='title'){
			hasTitle = true;
		} else if(currentPart.part=='view'){
			hasView = true;
		} else if(currentPart.part=='refs'){
			hasRefs = true;
		};
	};
	
	if(!hasType){
		this.part.addProblem(new MissingPartSettableValueProblem(new NodeType('type', this.part, null, this.cleaner), this.part, 3, this.cleaner));
	};
	
	if(!hasIdentifier){
		this.part.addProblem(new MissingPartSettableValueProblem(new NodeIdentifier('identifier', this.part, null, this.cleaner), this.part, 3, this.cleaner));
	};
	
	if(!hasTitle){
		this.part.addProblem(new MissingPartSettableValueProblem(new Title('title', this.part, null, this.cleaner), this.part, 3, this.cleaner));
	};
	
	if(!hasView){
		this.part.addProblem(new MissingPartSettableValueProblem(new NodeView('view', this.part, null, this.cleaner), this.part, 3, this.cleaner));
	};
	
	if(!hasRefs){
		this.part.addProblem(new MissingPartDefaultValueProblem(new NodeRefs('refs', this.part, null, this.cleaner), this.part, 3, this.cleaner));
	};
};

/**
 * Finds empty string or null field references in this sequence.
 */
EmptyFieldSequencePartAnalyzer.prototype = new Analyzer;
EmptyFieldSequencePartAnalyzer.prototype.constructor = EmptyFieldSequencePartAnalyzer;
EmptyFieldSequencePartAnalyzer.prototype.parent = Analyzer.prototype;
function EmptyFieldSequencePartAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this analyzer.
 */
EmptyFieldSequencePartAnalyzer.prototype.analyze = function(){
	for(var q=0;q<this.part.sequenceParts.length;q++){
		var currentPart = this.part.sequenceParts[q];
		if(currentPart.data===undefined || currentPart.data===''){
			if(currentPart.part=='title'){
				this.part.addProblem(new MissingFieldSettableValueProblem(currentPart, this.part, 2, this.cleaner));
			} else if(currentPart.part=='identifier'){
				this.part.addProblem(new MissingFieldSettableValueProblem(currentPart, this.part, 3, this.cleaner));
			} else if(currentPart.part=='type'){
				this.part.addProblem(new MissingFieldSettableValueProblem(currentPart, this.part, 3, this.cleaner));
			} else if(currentPart.part=='view'){
				this.part.addProblem(new MissingFieldSettableValueProblem(currentPart, this.part, 2, this.cleaner));
			};
		};
	};
};

/**
 * Analyzer that finds parts of the sequence not used in the project.
 */
UnknownSequencePartAnalyzer.prototype = new Analyzer;
UnknownSequencePartAnalyzer.prototype.constructor = UnknownSequencePartAnalyzer;
UnknownSequencePartAnalyzer.prototype.parent = Analyzer.prototype;
function UnknownSequencePartAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this analyzer.
 */
UnknownSequencePartAnalyzer.prototype.analyze = function(){
	for(var r=0;r<this.part.sequenceParts.length;r++){
		var currentPart = this.part.sequenceParts[r];
		if(currentPart.isUnknownPart){
			this.part.addProblem(new UnknownPartProblem(currentPart, this.part, 1, this.cleaner));
		};
	};
};

/**
 * Looks at a sequence parts field values to ensure that they are of the correct
 * data type.
 */
SequenceDataTypeAnalyzer.prototype = new Analyzer;
SequenceDataTypeAnalyzer.prototype.constructor = SequenceDataTypeAnalyzer;
SequenceDataTypeAnalyzer.prototype.parent = Analyzer.prototype;
function SequenceDataTypeAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this analyzer.
 */
SequenceDataTypeAnalyzer.prototype.analyze = function(){
	for(var t=0;t<this.part.sequenceParts.length;t++){
		var currentPart = this.part.sequenceParts[t];
		if(!currentPart.correctDataType()){
			this.part.addProblem(new WrongDataTypeProblem(currentPart, this.part, 2, this.cleaner));
		};
	};
};

/**
 * An analyzer that looks at a node part parts to see if any are missing.
 */
MissingNodePartAnalyzer.prototype = new Analyzer;
MissingNodePartAnalyzer.prototype.constructor = MissingNodePartAnalyzer;
MissingNodePartAnalyzer.prototype.parent = Analyzer.prototype;
function MissingNodePartAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this analyzer.
 */
MissingNodePartAnalyzer.prototype.analyze = function(){
	var hasType = false;
	var hasIdentifier = false;
	var hasTitle = false;
	var hasPreviousWorkNodeIds = false;
	var hasRef = false;
	
	for(var u=0;u<this.part.nodeParts.length;u++){
		var currentPart = this.part.nodeParts[u];
		if(currentPart.part=='type'){
			hasType = true;
		} else if(currentPart.part=='identifier'){
			hasIdentifier = true;
		} else if(currentPart.part=='title'){
			hasTitle = true;
		} else if(currentPart.part=='previousWorkNodeIds'){
			hasPreviousWorkNodeIds = true;
		} else if(currentPart.part=='ref'){
			hasRef = true;
		};
	};
	
	if(!hasType){
		this.part.addProblem(new MissingPartSettableValueProblem(new NodeType('type', this.part, null, this.cleaner), this.part, 3, this.cleaner));
	};
	
	if(!hasIdentifier){
		this.part.addProblem(new MissingPartSettableValueProblem(new NodeIdentifier('identifier', this.part, null, this.cleaner), this.part, 3, this.cleaner));
	};
	
	if(!hasTitle){
		this.part.addProblem(new MissingPartSettableValueProblem(new Title('title', this.part, null, this.cleaner), this.part, 2, this.cleaner));
	};
	
	if(!hasPreviousWorkNodeIds){
		this.part.addProblem(new MissingPartSettableValueProblem(new PreviousWork('previousWorkNodeIds', this.part, null, this.cleaner), this.part, 2, this.cleaner));
	};
	
	if(!hasRef){
		this.part.addProblem(new MissingPartDefaultValueProblem(new NodeRef('ref', this.part, null, this.cleaner), this.part, 3, this.cleaner));
	};
};

/**
 * An analyzer that checks for empty strings or undefined node parts' field values.
 */
EmptyFieldNodePartAnalyzer.prototype = new Analyzer;
EmptyFieldNodePartAnalyzer.prototype.constructor = EmptyFieldNodePartAnalyzer;
EmptyFieldNodePartAnalyzer.prototype.parent = Analyzer.prototype;
function EmptyFieldNodePartAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this analyzer.
 */
EmptyFieldNodePartAnalyzer.prototype.analyze = function(){
	for(var q=0;q<this.part.nodeParts.length;q++){
		var currentPart = this.part.nodeParts[q];
		if(currentPart.data===undefined || currentPart.data===''){
			if(currentPart.part=='title'){
				this.part.addProblem(new MissingFieldSettableValueProblem(currentPart, this.part, 2, this.cleaner));
			} else if(currentPart.part=='identifier'){
				this.part.addProblem(new MissingFieldSettableValueProblem(currentPart, this.part, 3, this.cleaner));
			} else if(currentPart.part=='type'){
				this.part.addProblem(new MissingFieldSettableValueProblem(currentPart, this.part, 3, this.cleaner));
			} else if(currentPart.part=='previousWorkNodeIds'){
				this.part.addProblem(new MissingFieldSettableValueProblem(currentPart, this.part, 2, this.cleaner));
			} else if(currentPart.part=='ref'){
				this.part.addProblem(new MissingFieldDefaultValueProblem(currentPart, this.part, 3, this.cleaner));
			};
		};
	};
};

/**
 * An analyzer that looks at a node part parts to see if any exist that are not used.
 */
UnknownNodePartAnalyzer.prototype = new Analyzer;
UnknownNodePartAnalyzer.prototype.constructor = UnknownNodePartAnalyzer;
UnknownNodePartAnalyzer.prototype.parent = Analyzer.prototype;
function UnknownNodePartAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this analyzer.
 */
UnknownNodePartAnalyzer.prototype.analyze = function(){
	for(var r=0;r<this.part.nodeParts.length;r++){
		var currentPart = this.part.nodeParts[r];
		if(currentPart.isUnknownPart){
			this.part.addProblem(new UnknownPartProblem(currentPart, this.part, 1, this.cleaner));
		};
	};
};

/**
 * An analyzer that checks the data type for each node part's parts.
 */
NodeDataTypeAnalyzer.prototype = new Analyzer;
NodeDataTypeAnalyzer.prototype.constructor = NodeDataTypeAnalyzer;
NodeDataTypeAnalyzer.prototype.parent = Analyzer.prototype;
function NodeDataTypeAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this analyzer.
 */
NodeDataTypeAnalyzer.prototype.analyze = function(){
	for(var t=0;t<this.part.nodeParts.length;t++){
		var currentPart = this.part.nodeParts[t];
		if(!currentPart.correctDataType()){
			this.part.addProblem(new WrongDataTypeProblem(currentPart, this.part, 2, this.cleaner));
		};
	};
};

/**
 * An analyzer that searches for duplicate identifiers
 */
DuplicateIdentifierAnalyzer.prototype = new Analyzer;
DuplicateIdentifierAnalyzer.prototype.constructor = DuplicateIdentifierAnalyzer;
DuplicateIdentifierAnalyzer.prototype.parent = Analyzer.prototype;
function DuplicateIdentifierAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this analyzer.
 */
DuplicateIdentifierAnalyzer.prototype.analyze = function(){
	var idObs = this.cleaner.projectPart.getPartIds();
	
	while(idObs.length > 0){
		var current = idObs.shift();

		var duplicate = [current];
		for(var z=idObs.length - 1;z>=0;z--){
			if(current.id==idObs[z].id){
				var d = idObs.splice(z,1);
				duplicate.push(d[0]);
			};
		};
		
		if(duplicate.length>1){
			this.part.addProblem(new DuplicateIdentifierProblem(duplicate, this.part, 3, this.cleaner));
		};
	};
};

/**
 * An analyzer that checks this part's ids (in arrayParts) to make sure they
 * exist within the project. The only parts that should run this analyzer are
 * the NodeRefs part and the PreviousWork part.
 */
ReferencedIdDoesNotExistAnalyzer.prototype = new Analyzer;
ReferencedIdDoesNotExistAnalyzer.prototype.constructor = ReferencedIdDoesNotExistAnalyzer;
ReferencedIdDoesNotExistAnalyzer.prototype.parent = Analyzer.prototype;
function ReferencedIdDoesNotExistAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this analyzer.
 */
ReferencedIdDoesNotExistAnalyzer.prototype.analyze = function(){
	/* cycle through the parts and check the ids */
	for(var e=0;e<this.part.arrayParts.length;e++){
		if(!this.cleaner.idExists(this.part.arrayParts[e].data)){
			this.part.addProblem(new ReferencedIdDoesNotExistProblem(this.part.arrayParts[e], this.part, 3, this.cleaner));
		};
	};
};

/**
 * An analyzer that checks to see if this part is used in the project. This
 * analyzer should only be used by the NodeIdentifier part.
 */
UnusedAnalyzer.prototype = new Analyzer;
UnusedAnalyzer.prototype.constructor = UnusedAnalyzer;
UnusedAnalyzer.prototype.parent = Analyzer.protoype;
function UnusedAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this analyzer.
 */
UnusedAnalyzer.prototype.analyze = function(){
	if(this.part.data && this.part.data!=''){
		if(!this.cleaner.isReferenced(this.part.data)){
			this.part.addProblem(new UnusedProblem(this.part, this.part.parent, 2, this.cleaner));
		};
	};
};

/**
 * An analyzer that checks that the startpoint is valid.
 */
StartPointAnalyzer.prototype = new Analyzer;
StartPointAnalyzer.prototype.constructor = StartPointAnalyzer;
StartPointAnalyzer.prototype.parent = Analyzer.prototype;
function StartPointAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this analyzer.
 */
StartPointAnalyzer.prototype.analyze = function(){
	var seqIds = this.cleaner.projectPart.getSequenceIds();
	
	var isValidId = function(id, ids){
		for(var i=0;i<ids.length;i++){
			if(ids[i].id==id){
				return true;
			};
		};
		
		return false;
	};
	
	if(!this.part.data || this.part.data=='' || !isValidId(this.part.data, seqIds)){
		this.part.addProblem(new InvalidStartPointProblem(this.part, this.part.parent, 3, this.cleaner));
	};
};

/**
 * An Analyzer that checks the validity of the node class
 */
NodeClassAnalyzer.prototype = new Analyzer;
NodeClassAnalyzer.prototype.constructor = NodeClassAnalyzer;
NodeClassAnalyzer.prototype.parent = Analyzer.prototype;
function NodeClassAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this analyzer.
 */
NodeClassAnalyzer.prototype.analyze = function(){
	var type = this.part.getType();
	var nodeClassPart = this.part.getNodeClassPart();
	
	if(!nodeClassPart){
		this.part.addProblem(new MissingNodeClassProblem(new NodeClass('class', this.part, null, this.cleaner), this.part, 2, this.cleaner));
	} else if(type){
		var ndx = nodeTypes.indexOf(type);
		
		if(ndx<0 || !nodeClassPart.data || nodeClassPart.data==''){
			this.part.addProblem(new InvalidNodeClassProblem(nodeClassPart, this.part, 2, this.cleaner));
		} else {
			var realClasses = nodeClasses[nodeTypes.indexOf(type)];
			if(realClasses.indexOf(nodeClassPart.data)==-1){
				this.part.addProblem(new InvalidNodeClassProblem(nodeClassPart, this.part, 2, this.cleaner));
			};
		};
	};
};

/**
 * An Analyzer that checks to see if a sequence has any references.
 */
NoSequenceReferencesAnalyzer.prototype = new Analyzer;
NoSequenceReferencesAnalyzer.prototype.constructor = NoSequenceReferencesAnalyzer;
NoSequenceReferencesAnalyzer.prototype.parent = Analyzer.prototype;
function NoSequenceReferencesAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this analyzer.
 */
NoSequenceReferencesAnalyzer.prototype.analyze = function(){
	var refs = this.part.getReferences();
	if(refs && refs.arrayParts.length<1){
		this.part.addProblem(new NoSequenceReferencesProblem(this.part, this.part.parent, 2, this.cleaner));
	};
};

/**
 * An Analyzer that ensures that the file exists and the content
 * is valid JSON.
 */
FileAndContentAnalyzer.prototype = new Analyzer;
FileAndContentAnalyzer.prototype.constructor = FileAndContentAnalyzer;
FileAndContentAnalyzer.prototype.parent = Analyzer.prototype;
function FileAndContentAnalyzer(part, cleaner){
	this.part = part;
	this.cleaner = cleaner;
};

/**
 * Runs the analysis for this analyzer.
 */
FileAndContentAnalyzer.prototype.analyze = function(){
	this.name = this.cleaner.generateUniqueName();
	this.cleaner.registerAsyncRequest(this.name);
	this.basePath = this.cleaner.view.utils.getContentPath(this.cleaner.view.authoringBaseUrl,this.cleaner.view.getProject().getContentBase());
	
	this.cleaner.view.connectionManager.request('GET', 1, this.cleaner.view.requestUrl, {forward:'filemanager', projectId:this.cleaner.view.portalProjectId, command:'retrieveFile', fileName:this.part.data}, this.analyzeResultsSuccess, this, this.analyzeResultsFailure);
};

/**
 * Analyzes the results from the async request when file is successfully retrieved.
 */
FileAndContentAnalyzer.prototype.analyzeResultsSuccess = function(t,x,o){
	try{
		$.parseJSON(t);
	} catch(e){
		o.part.addProblem(new InvalidContentProblem(o.part, o.part.parent, 3, o.cleaner));
	};
	
	o.cleaner.unregisterAsyncRequest(o.name);
};

/**
 * Adds a bad filename problem when the file does not exist.
 */
FileAndContentAnalyzer.prototype.analyzeResultsFailure = function(t,o){
	o.part.addProblem(new FileNotFoundProblem(o.part, o.part.parent, 3, o.cleaner));
	o.cleaner.unregisterAsyncRequest(o.name);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/cleaning/authorview_clean_analyzer.js');
};