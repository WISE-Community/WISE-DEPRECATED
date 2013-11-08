/**
 * Core NavigationLogic: Depth-First-Search (http://en.wikipedia.org/wiki/Depth-first_search)
 * Need: rootnode, 
 * def dfs(v):
 *   mark v as visited
 *   preorder-process(v)
 *   for all vertices i adjacent to v such that i not visited
 *       dfs(i)
 *   postorder-process(v)
 */
function DFS(rootNode) {
	this.rootNode = rootNode;
	this.visitingOrder = [];  // sequence-ordering of nodes.
	
	for(var a=0;a<this.rootNode.children.length;a++){
		this.findVisitingOrder(this.rootNode.children[a], a);
	};
};

/**
 * populates this.visitingOrder array
 * @param {Object} node
 */
DFS.prototype.findVisitingOrder = function(node, loc) {
	if(node){
		this.visitingOrder.push(String(loc));
		for (var i=0; i < node.children.length; i++) {
			this.findVisitingOrder(node.children[i], loc + '.' + i);
		};
	};
};

/**
 * Returns the deepest/furthest node that the user has visited
 * in the DFS-sequence.
 * @param {Object} currentIndex index within the DFS.visitedNodes array
 * @param {Object} deepestSoFar index of the deepest Node so far within 
 *     the DFS.visitedNodes array
 */
DFS.prototype.findDeepestSoFar = function(currentIndex, deepestSoFarIndex, visitedNodes) {
	if (currentIndex == visitedNodes.length) {
		return visitedNodes[deepestSoFarIndex];
	};
	if (this.isBefore(visitedNodes[deepestSoFarIndex].node,
	                  visitedNodes[currentIndex].node)) {
		return this.findDeepestSoFar(currentIndex+1,currentIndex, visitedNodes);
	} else {
		return this.findDeepestSoFar(currentIndex+1,deepestSoFarIndex, visitedNodes);
	};
};
/**
 * Returns true iff node1 should be visited before node2
 * in the DFS sequence. If node1 == node2, returns false.
 * @param {Object} node1
 * @param {Object} node2
 * 
 */
DFS.prototype.isBefore = function(node1, node2) {
	var indexOfNode1 = this.visitingOrder.indexOf(node1);
	var indexOfNode2 = this.visitingOrder.indexOf(node2);	
	if (indexOfNode1 == -1 || indexOfNode2 == -1) {
		alert("node visiting error");
		alert("1:" + indexOfNode1);
		alert("2:" + indexOfNode2);
		return;
	};
	return indexOfNode1 <= indexOfNode2;
};

/**
 * Returns the next node location to visit in the DFS sequence after specified node. 
 * If the node is the last node, return null.
 * 
 * @param loc - path to node (i.e. 1.0.12.1)
 */
DFS.prototype.getNextNode = function(loc) {
	var indexOfNode = this.visitingOrder.indexOf(loc);
	if (indexOfNode == this.visitingOrder.length) {
		return null;
	};
	return this.visitingOrder[indexOfNode+1];
};

/**
 * Returns the previous node location to visit in the DFS sequence before specified node. 
 * If the node is the last node, return null. 
 *
 * @param loc - path to node (i.e. 1.0.12.1)
 */
DFS.prototype.getPrevNode = function(loc) {
	var indexOfNode = this.visitingOrder.indexOf(loc);
	if (indexOfNode == 0) {
		return null;
	}
	return this.visitingOrder[indexOfNode-1];
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/navigation/DFS.js');
};