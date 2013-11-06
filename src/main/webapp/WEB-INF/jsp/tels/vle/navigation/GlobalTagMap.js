
/**
 * Constructor for global tag map objects. This is just provided to give a
 * starting point for implementing a child global tag map.
 * @param view the view
 * @param parameters the parameters for the global tag map
 */
function GlobalTagMap(view, parameters) {
	this.view = view;
	this.parameters = null;
	this.tagName = null;
	this.nodeIds = [];

	//uncomment these if you want to use them in your child global tag map
	//view.eventManager.subscribe('studentWorkUpdated', this.studentWorkUpdatedListener, this);
	//view.eventManager.subscribe('nodeStatusUpdated', this.nodeStatusUpdatedListener, this);
};

/**
 * Set the tag name
 * @param tagName the tag name
 */
GlobalTagMap.prototype.setTagName = function(tagName) {
	this.tagName = tagName;
};

/**
 * Get the tag name
 * @return the tag name
 */
GlobalTagMap.prototype.getTagName = function() {
	return this.tagName;
};

/**
 * Set the node ids that are tagged
 * @param nodeIds the node ids that are tagged
 */
GlobalTagMap.prototype.setNodeIds = function(nodeIds) {
	this.nodeIds = nodeIds;
};

/**
 * Get the node ids
 * @return the node ids that are tagged
 */
GlobalTagMap.prototype.getNodeIds = function() {
	return this.nodeIds;
};

/**
 * The function that listens for the studentWorkUpdated event
 * @param type the type of event
 * @param args any arguments when the event is fired
 * @param obj this global tag map object
 */
GlobalTagMap.prototype.studentWorkUpdatedListener = function(type, args, obj) {
	var thisGlobalTagMap = obj;
	thisGlobalTagMap.studentWorkUpdatedHandler();
};

/**
 * The function that will actually handle the studentWorkUpdated event
 */
GlobalTagMap.prototype.studentWorkUpdatedHandler = function() {
	
};

/**
 * The function that listens for the nodeStatusUpdated event
 * @param type the type of event
 * @param args any arguments when the event is fired
 * @param obj this global tag map object
 */
GlobalTagMap.prototype.nodeStatusUpdatedListener = function(type, args, obj) {
	var thisGlobalTagMap = obj;
	thisGlobalTagMap.nodeStatusUpdatedHandler();
};

/**
 * The function that will actually handle the nodeStatusUpdated event
 */
GlobalTagMap.prototype.nodeStatusUpdatedHandler = function() {
	
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/navigation/GlobalTagMap.js');
}