angular.module('ProjectService', [])

.service('ProjectService', ['$http', '$q', 'ConfigService', function($http, $q, ConfigService) {
	this.project = null;
	
	this.retrieveProject = function() {
		var projectFileUrl = ConfigService.getConfigParam('getContentUrl');
		
		return $http.get(projectFileUrl).then(angular.bind(this, function(result) {
			var projectJSON = result.data;
			this.project = projectJSON;
			return projectJSON;
		}));
	};
	
	this.getNodeTitleFromNodeId = function(nodeId) {
		var title = null;
		
		//see if the node id is for a step and get the title if it is
		title = this.getStepTitleFromNodeId(nodeId);
		
		if(title == null) {
			/*
			 * we couldn't find a step with the node id so we will now
			 * search the sequences
			 */
			title = this.getSequenceTitleFromNodeId(nodeId);
		}
		
		return title;
	};
	
	this.getStepTitleFromNodeId = function(nodeId) {
		var title = null;
		var project = this.project;
		
		if(project != null) {
			var nodes = project.nodes;
			
			if(nodes != null) {
				for(var x=0; x<nodes.length; x++) {
					var node = nodes[x];
					
					if(node != null) {
						var tempNodeId = node.identifier;
						
						if(nodeId == tempNodeId) {
							title = node.title;
							break;
						}
					}
				}
			}
		}
		
		return title;
	};
	
	this.getSequenceTitleFromNodeId = function(nodeId) {
		var title = null;
		
		var project = this.project;
		
		if(project != null) {
			var sequences = project.sequences;
			
			if(sequences != null) {
				for(var x=0; x<sequences.length; x++) {
					var sequence = sequences[x];
					
					if(sequence != null) {
						var tempNodeId = sequence.identifier;
						
						if(nodeId == tempNodeId) {
							title = sequence.title;
							break;
						}
					}
				}
			}
		}
		
		return title;
	};
	
	this.getNodeFromNodeId = function(nodeId) {
		var project = this.project;
		
		if(project != null) {
			//loop through step nodes
			var nodes = project.nodes;
			
			if(nodes != null) {
				for(var x=0; x<nodes.length; x++) {
					var tempNode = nodes[x];
					
					if(tempNode != null) {
						var tempNodeId = tempNode.identifier;
						
						if(nodeId == tempNodeId) {
							return tempNode;
						}
					}
				}				
			}
			
			//loop through activity nodes
			var sequences = project.sequences;
			
			if(sequences != null) {
				for(var y=0; y<sequences.length; y++) {
					var tempSequence = sequences[y];
					
					if(tempSequence != null) {
						var tempNodeId = tempSequence.identifier;
						
						if(nodeId == tempNodeId) {
							return tempSequence;
						}
					}
				}				
			}
		}
		
		return null;
	}
	
	this.getStepFromNodeId = function(nodeId) {
		
	};
	
	this.getSequenceFromNodeId = function(nodeId) {
		
	};
	
	this.getStepNodesInTraversalOrder = function() {
		var includeSteps = true;
		var includeSequences = false;
		return this.getProjectNodesInTraversalOrder(includeSequences, includeSteps);
	};
	
	this.getSequenceNodesInTraversalOrder = function() {
		var includeSteps = false;
		var includeSequences = true;
		return this.getProjectNodesInTraversalOrder(includeSequences, includeSteps);
	};
	
	this.getSequenceAndStepNodesInTraversalOrder = function() {
		var includeSteps = true;
		var includeSequences = true;
		return this.getProjectNodesInTraversalOrder(includeSequences, includeSteps);
	};
	
	this.getProjectNodesInTraversalOrder = function(includeSequences, includeSteps) {
		var nodes = [];
		
		var project = this.project;
		
		if(project != null) {
			var startPointNodeId = project.startPoint;
			
			nodes = this.getProjectNodesInTraversalOrderHelper(startPointNodeId, includeSequences, includeSteps);
		}
		
		return nodes;
	};
	
	this.getProjectNodesInTraversalOrderHelper = function(nodeId, includeSequences, includeSteps) {
		var nodes = [];
		
		var node = this.getNodeFromNodeId(nodeId);
		
		if(node != null) {
			var type = node.type;
			
			if(type == null || type == '') {
				
			} else if(type == 'sequence') {
				//node is a sequence
				
				//do not add the master sequence node
				if(nodeId != 'master') {
					if(includeSequences) {
						//add the sequence node
						nodes.push(node);						
					}
				}

				//get the node ids of the children
				var refs = node.refs;

				//loop through all the children in the sequence
				for(var x=0; x<refs.length; x++) {
					var childeNodeId = refs[x];
					
					var childNodes = this.getProjectNodesInTraversalOrderHelper(childeNodeId, includeSequences, includeSteps);
					
					nodes = nodes.concat(childNodes);
				}
			} else {
				//node is a step
				
				if(includeSteps) {
					nodes.push(node);					
				}
			}
		}
		
		return nodes;
	};
	
	this.getNodeNumberAndTitle = function(nodeId) {
		var nodeNumberAndTitle = null;
		
		var project = this.project;
		
		if(project != null) {
			var startPointNodeId = project.startPoint;
			
			nodeNumberAndTitle = this.getNodeNumberAndTitleHelper(startPointNodeId, nodeId);
		}
		
		var node = this.getNodeFromNodeId(nodeId);
		
		if(node != null) {
			var type = node.type;
			
			if(type == null || type == '') {
				
			} else if(type == 'sequence') {
				nodeNumberAndTitle = 'Activity ' + nodeNumberAndTitle;
			} else {
				nodeNumberAndTitle = 'Step ' + nodeNumberAndTitle;
			}
			
			var title = this.getNodeTitleFromNodeId(nodeId);
			
			if(title != null) {
				nodeNumberAndTitle += ': ' + title;
			}
		}
		
		return nodeNumberAndTitle;
	};
	
	this.getNodeNumberAndTitleHelper = function(nodeIdToSearch, nodeIdSearchingFor) {
		var nodeNumberAndTitle = null;
		
		var nodeToSearch = this.getNodeFromNodeId(nodeIdToSearch);
		
		if(nodeToSearch != null) {
			var type = nodeToSearch.type;
			
			if(type == null || type == '') {
				
			} else if(type == 'sequence') {
				//node to search is a sequence
				
				//look for nodeId in current sequence
				
				//we did not find the node Id in this sequence so we will look at the children
				
				var refs = nodeToSearch.refs;
				
				if(refs != null) {
					//loop through all the children
					for(var x=0; x<refs.length; x++) {
						//get the node id of the child
						var ref = refs[x];
						
						//get the current node number
						var currentNodeNumber = x + 1;
						
						if(ref != null) {
							
							if(nodeIdSearchingFor == ref) {
								/*
								 * the current child has the node id we are searching for
								 * so we will return the node number within the sequence 
								 */ 
								var tempNodeNumber = currentNodeNumber;

								return tempNodeNumber;
							} else {
								/*
								 * the current child is a sequence so we will search its children
								 */
								var childNodeNumber = this.getNodeNumberAndTitleHelper(ref, nodeIdSearchingFor);
								
								/*
								 * if we have found the node id in this child sequence, the childNodeNumber
								 * will not be null
								 */
								if(childNodeNumber != null) {
									/*
									 * we have found the node id within the child so we will concatenate
									 * the current node number with the child node number
									 */
									return currentNodeNumber + '.' + childNodeNumber;
								}
							}
						}
					}
				}
			}
		}
		
		return nodeNumberAndTitle;
	};
	
}]);