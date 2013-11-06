
/**
 * @constructor
 */
function NodeFactory(){
};

/*
 * an array that contains the accepted node type names. additional
 * values in the array will be dynamically added when we load the
 * step/node types.
 */
NodeFactory.acceptedTagNames = ['node', 'sequence'];

/*
 * an array that contains the constructors for creating new nodes.
 * this array will be dynamically populated when we load the
 * step/node types. 
 */
NodeFactory.nodeConstructors = {};

/**
 * Create a node object
 * @param jsonNode the JSON representation of the node
 * @param view
 * @return a new node object
 */
NodeFactory.createNode = function(jsonNode, view){
	var nodeType = null;
	
	//get the node type
	if(jsonNode.type){
		nodeType = jsonNode.type;
	}
	
	//check if the node type is acceptable
	if (NodeFactory.acceptedTagNames.indexOf(nodeType) > -1) {
		if (nodeType == "sequence") {
			//node is a sequence node
			
			//create a new sequence
			var sequenceNode = new Node("sequence", view);
			
			//set the attributes of the sequence
			sequenceNode.id = jsonNode.identifier;
			sequenceNode.title = jsonNode.title;
			sequenceNode.tags = jsonNode.tags;
			sequenceNode.tagMaps = jsonNode.tagMaps;
			sequenceNode.icons = jsonNode.icons;
			
			//return the sequence
			return sequenceNode;
		} else {
			//node is a step node
			
			//get the constructor for the node type
			var nodeConstructor = NodeFactory.nodeConstructors[nodeType];
			
			if(nodeConstructor != null) {
				//create a new node object with the constructor
				return new nodeConstructor(nodeType, view);
			} else {
				return new Node(null, view);
			};
		};
	};
};

/**
 * Adds a tag name to the acceptedTagNames array
 * @param tagName a node type
 * e.g. 'HtmlNode'
 */
NodeFactory.addAcceptedTagName = function(tagName) {
	//check if the tag name has already been added
	if(NodeFactory.acceptedTagNames.indexOf(tagName) == -1) {
		//tag name has not been added so we will add it now
		NodeFactory.acceptedTagNames.push(tagName);		
	}
};

/**
 * Adds a constructor to the nodeConstructors array
 * @param nodeType the node type
 * @param nodeConstructor the constructor for the node type
 */
NodeFactory.addConstructor = function(nodeType, nodeConstructor) {
	//check if we have already added a constructor for the node type
	if(NodeFactory.nodeConstructors[nodeType] == null) {
		//we have not added a constructor for the node type yet so we will now
		NodeFactory.nodeConstructors[nodeType] = nodeConstructor;
	}
};

/**
 * Adds the node type to the acceptedTagNames array and the
 * constructor to the nodeConstructors array.
 * @param nodeType the node type
 * @param nodeConstructor the constructor for the node type
 */
NodeFactory.addNode = function(nodeType, nodeConstructor) {
	//add the node type to the acceptedTagNames array
	NodeFactory.addAcceptedTagName(nodeType);
	
	//add the constructor to the nodeConstructors array
	NodeFactory.addConstructor(nodeType, nodeConstructor);
};

/**
 * Get an array of the available node types
 * @return an array containing the node types as strings
 */
NodeFactory.getNodeTypes = function() {
	var nodeTypes = [];
	
	//loop through the array of acceptedTagNames
	for(var x=0; x<this.acceptedTagNames.length; x++) {
		var tagName = this.acceptedTagNames[x];
		
		//check that the tagName is not 'node' or 'sequence'
		if(tagName != 'node' && tagName != 'sequence') {
			nodeTypes.push(tagName);
		}
	}
	
	return nodeTypes;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/nodefactory.js');
};