/**
 * A DuplicateNode acts as a proxy for any node type.
 * 
 * @author patrick lawler
 */
DuplicateNode.prototype = new Node;
DuplicateNode.prototype.constructor = DuplicateNode;
DuplicateNode.prototype.parent = Node.prototype;
function DuplicateNode(nodeType, view){
	this.type = nodeType;
	this.view = view;
	this.prevWorkNodeIds = [];
	this.realNode;
};

/**
 * Returns the title of the node that this node represents.
 */
DuplicateNode.prototype.getTitle = function(){
	return this.realNode.getTitle();
};

/**
 * Sets the given title of the node that this node represents.
 * 
 * @param title
 */
DuplicateNode.prototype.setTitle = function(title){
	this.realNode.setTitle(title);
};

/**
 * Returns the prompt of the node that this node represents.
 */
DuplicateNode.prototype.getPrompt = function(){
	return this.realNode.getPrompt();
};

/**
 * Returns the content of the node that this node represents.
 */
DuplicateNode.prototype.getContent = function(){
	return this.realNode.getContent();
};

/**
 * Sets the content of the node that this node represents.
 * 
 * @param content
 */
DuplicateNode.prototype.setContent = function(content){
	this.realNode.setContent(content);
};

/**
 * Returns the type of the node that this node represents.
 * 
 * @param humanReadable
 */
DuplicateNode.prototype.getType = function(humanReadable){
	return this.realNode.getType(humanReadable);
};

/**
 * Adds the given child to the node that this node represents.
 * 
 * @param child
 */
DuplicateNode.prototype.addChildNode = function(child){
	this.realNode.addChildNode(child);
};

/**
 * Pre-loads the content of the node that this node represents.
 */
DuplicateNode.prototype.preloadContent = function(){
	this.realNode.preloadContent();
};

/**
 * Renders the node that this node represents.
 * 
 * @param contentPanel
 * @param studentWork
 */
DuplicateNode.prototype.render = function(contentPanel, studentWork){
	this.realNode.render(contentPanel, studentWork);
};

/**
 * Calls the onExit function of the node that this node represents.
 */
DuplicateNode.prototype.onExit = function(){
	try {
		this.realNode.onExit();		
	} catch(e) {
		
	}
};

/**
 * Returns the view of the node that this node represents.
 */
DuplicateNode.prototype.getView = function(){
	return this.realNode.getView();
};

/**
 * Returns true if the node that this node represents is a sequence, false otherwise.
 */
DuplicateNode.prototype.isSequence = function(){
	return this.realNode.isSequence();
};

/**
 * Returns a JSON Object representation of this node.
 */
DuplicateNode.prototype.nodeJSON = function(){
	/* create and return node object */
	var node = {
		type:this.type,
		identifier:this.id,
		title:'',
		ref:'',
		previousWorkNodeIds:[],
		links:[],
		realNodeId:this.realNode.id
	};
	
	/* set class */
	node['class'] = '';
	
	return node;
};

/**
 * Returns the latest work of the node that this node represents.
 */
DuplicateNode.prototype.getLatestWork = function(){
	return this.realNode.getLatestWork();
};

/**
 * Returns the translated student work from the node that this node represents.
 * 
 * @param studentWork
 */
DuplicateNode.prototype.translateStudentWork = function(studentWork) {
	return this.realNode.translateStudentWork(studentWork);
};

/**
 * Returns whether the node that this node represents is a leaf node.
 */
DuplicateNode.prototype.isLeafNode = function(){
	return this.realNode.isLeafNode();
};

/**
 * Returns the result of the node that this node represents handling a previous outside link.
 * 
 * @param thisObj
 * @param thisContentPanel
 * @return boolean
 */
DuplicateNode.prototype.handlePreviousOutsideLink = function(thisObj, thisContentPanel) {
	return this.realNode.handlePreviousOutsideLink(thisObj,thisContentPanel);
};

/**
 * Inserts the previous work of the node that this node represents into the given document.
 * 
 * @param doc
 */
DuplicateNode.prototype.insertPreviousWorkIntoPage = function(doc){
	this.realNode.insertPreviousWorkIntoPage(doc);
};

/**
 * Returns the showallwork html of the node that this noe represents.
 * 
 * @param vle
 */
DuplicateNode.prototype.getShowAllWorkHtml = function(vle){
	return this.realNode.getShowAllWorkHtml(vle);
};

/**
 * Calls the createKeystrokManager of the node that this node represents.
 */
DuplicateNode.prototype.createKeystrokeManager = function(){
	this.realNode.createKeystrokeManager();
};

/**
 * Adds the given link to the node that this node represents.
 * 
 * @param link
 */
DuplicateNode.prototype.addLink = function(link){
	this.realNode.addLink(link);
};

/**
 * Returns the class of the node that this node represents.
 */
DuplicateNode.prototype.getNodeClass = function(){
	return this.realNode.getNodeClass();
};

/**
 * Sets the class of the node that this node represents.
 * 
 * @param className
 */
DuplicateNode.prototype.setNodeClass = function(className){
	this.realNode.setNodeClass(className);
};

/**
 * Returns the node that this node represents.
 */
DuplicateNode.prototype.getNode = function(){
	return this.realNode;
};

/**
 * Copies the node that this node represents.
 * 
 * @param eventName
 * @param project
 */
DuplicateNode.prototype.copy = function(eventName, project){
	this.realNode.copy(eventName, project);
};

NodeFactory.addNode('DuplicateNode', DuplicateNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/DuplicateNode.js');
}