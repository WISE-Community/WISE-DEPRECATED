define(['angular'], function(angular) {

	angular.module('StudentWorkService', [])
	
	.service('StudentWorkService', ['$http', 'ConfigService', 'ProjectService', 'UserAndClassInfoService', function($http, ConfigService, ProjectService, UserAndClassInfoService) {
		this.workgroupIdToWork = {};
		this.nodeIdToWork = {};
		
		this.retrieveStudentWorkForWorkgroupId = function(workgroupId) {
			var studentDataURL = ConfigService.getConfigParam('studentDataURL');
			var runId = ConfigService.getConfigParam('runId');
			var nodeIds = ProjectService.getStepNodeIdsInTraversalOrder();
			
			var requestConfig = {
				params: {
					userId: workgroupId,
					grading: true,
					runId: runId,
					nodeIds: nodeIds
				}
			};
			
			return $http.get(studentDataURL, requestConfig).then(angular.bind(this, function(result) {
				var studentWork = result.data;
				
				if(studentWork != null) {
					var vleStates = studentWork.vleStates;
					
					if(vleStates != null) {
						for(var x=0; x<vleStates.length; x++) {
							var vleState = vleStates[x];
							
							if(vleState != null) {
								var workgroupId = vleState.userId;
								this.workgroupIdToWork[workgroupId] = vleState;
							}
						}
					}
				}
				
				return studentWork;
			}));
		};
		
		this.retrieveStudentWorkForNodeId = function(nodeId) {
			var studentDataURL = ConfigService.getConfigParam('studentDataURL');
			var runId = ConfigService.getConfigParam('runId');
			var workgroupIds = UserAndClassInfoService.getStudentWorkgroupIds();
			var workgroupIdsJoin = workgroupIds.join(':');
			
			var requestConfig = {
				params: {
					userId: workgroupIdsJoin,
					grading: true,
					runId: runId,
					nodeIds: nodeId
				}
			};
			
			return $http.get(studentDataURL, requestConfig).then(angular.bind(this, function(result, status, headers, config) {
				var studentWork = result.data;
				
				if(studentWork != null) {
					var vleStates = studentWork.vleStates;
					
					if(vleStates != null) {
						if(nodeId != null) {
							this.nodeIdToWork[nodeId] = vleStates;
						}
					}
				}
				
				return studentWork;
			}));
		};
		
		this.getStudentWorkForWorkgroupId = function(workgroupId) {
			var workgroupIdToWork = this.workgroupIdToWork;
			
			var studentWorkForWorkgroupId = workgroupIdToWork[workgroupId];
			
			return studentWorkForWorkgroupId;
		};
		
		this.getStudentWorkForNodeId = function(nodeId) {
			var nodeIdToWork = this.nodeIdToWork;
			
			var studentWorkForNodeId = nodeIdToWork[nodeId];
			
			return studentWorkForNodeId;
		}
		
		this.getNodeVisitsForWorkgroupIdAndNodeId = function(workgroupId, nodeId) {
			var nodeVisits = [];
			
			var studentWorkForWorkgroupId = this.getStudentWorkForWorkgroupId(workgroupId);
			
			if(studentWorkForWorkgroupId != null) {
				var visitedNodes = studentWorkForWorkgroupId.visitedNodes;
				
				if(visitedNodes != null) {
					for(var x=0; x<visitedNodes.length; x++) {
						var tempNodeVisit = visitedNodes[x];
						
						if(tempNodeVisit != null) {
							var tempNodeId = tempNodeVisit.nodeId;
							
							if(nodeId == tempNodeId) {
								nodeVisits.push(tempNodeVisit);
							}
						}
					}				
				}
			}
			
			return nodeVisits;
		};
		
		this.getNodeVisitsForNodeIdAndWorkgroupId = function(nodeId, workgroupId) {
			var nodeVisits = [];
			
			var studentWorkForNodeId = this.getStudentWorkForNodeId(nodeId);
			
			if(studentWorkForNodeId != null) {
				for(var x=0; x<studentWorkForNodeId.length; x++) {
					var vleState = studentWorkForNodeId[x];
					
					if(vleState != null) {
						var userId = vleState.userId;
						
						if(workgroupId == userId) {
							nodeVisits = vleState.visitedNodes;
							break;
						}
					}
				}
			}
			
			return nodeVisits;
		};
	}]);
	
});