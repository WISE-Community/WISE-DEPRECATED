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
	
	this.getNodeFromNodeId = function(nodeId) {
		var project = this.project;
		
		if(project != null) {
			//loop through step nodes
			var nodes = project.nodes;
			
			if(nodes != null) {
				for(var x=0; x<nodes.length; x++) {
					var tempNode = nodes[x];
					
					if(node != null) {
						var tempNodeId = node.identifier;
						
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
	
	this.getActivityFromNodeId = function(nodeId) {
		
	};
	
	this.getStepNodeIds = function() {
		var project = this.project;
		
		if(project != null) {
			var startPoint = project.startPoint;
		}
	};
	
	
}]);