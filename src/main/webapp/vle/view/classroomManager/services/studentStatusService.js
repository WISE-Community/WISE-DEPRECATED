define(['angular'], function(angular) {

	angular.module('StudentStatusService', [])
	
	.service('StudentStatusService', ['$http', 'ConfigService', 'ProjectService', 'UserAndClassInfoService', function($http, ConfigService, ProjectService, UserAndClassInfoService) {
		this.studentStatuses = null;
	
		this.retrieveStudentStatuses = function(config) {
			var studentStatusURL = ConfigService.getConfigParam('studentStatusURL');
			var runId = ConfigService.getConfigParam('runId');
	
			var requestConfig = {
				params: {
					runId: runId
				}
			};
			
			return $http.get(studentStatusURL, requestConfig).then(angular.bind(this, function(result) {
				var studentStatuses = result.data;
		
				this.studentStatuses = studentStatuses;
				
				return studentStatuses;
			}));
		};
		
		this.getStudentStatuses = function() {
			return this.studentStatuses;
		};
		
		this.getStudentStatusForWorkgroupId = function(workgroupId) {
			var studentStatus = null;
			
			var studentStatuses = this.studentStatuses;
			
			for(var x=0; x<studentStatuses.length; x++) {
				var tempStudentStatus = studentStatuses[x];
				
				if(tempStudentStatus != null) {
					var tempWorkgroupId = tempStudentStatus.workgroupId;
					
					if(workgroupId == tempWorkgroupId) {
						studentStatus = tempStudentStatus;
						break;
					}
				}
			}
			
			return studentStatus;
		};
		
		this.getCurrentStepTitleForWorkgroupId = function(workgroupId) {
			var stepTitle = null;
			
			var studentStatus = this.getStudentStatusForWorkgroupId(workgroupId);
			
			if(studentStatus != null) {
				var currentNodeId = studentStatus.currentNodeId;
				stepTitle = ProjectService.getNodeNumberAndTitle(currentNodeId);
			}
			
			return stepTitle;
		};
		
		this.getStudentProjectCompletion = function(workgroupId) {
			var studentProjectCompletion = null;
			var numberOfStepsCompleted = 0;
			
			var studentStatus = this.getStudentStatusForWorkgroupId(workgroupId);
			
			if(studentStatus != null) {
				var nodeStatuses = studentStatus.nodeStatuses;
				var stepNodes = ProjectService.getStepNodesInTraversalOrder();
				
				if(stepNodes != null) {
					for(var x=0; x<stepNodes.length; x++) {
						var stepNode = stepNodes[x];
						
						if(stepNode != null) {
							var nodeId = stepNode.identifier;
							
							var nodeStatus = this.getNodeStatusForNodeId(nodeStatuses, nodeId);
							
							var isStepCompleted = this.isStepCompleted(nodeStatus);
							
							if(isStepCompleted) {
								numberOfStepsCompleted++;
							}
						}
					}
				}
				
				if(stepNodes.length != 0) {
					studentProjectCompletion = parseInt(100 * numberOfStepsCompleted / stepNodes.length);
				}
			}
			
			return studentProjectCompletion;
		};
		
		this.isNodeStatusTypeSetToValue = function(nodeStatus, statusType, statusValue) {
			var result = false;
			
			if(nodeStatus != null) {
				var statuses = nodeStatus.statuses;
				
				if(statuses != null) {
					for(var x=0; x<statuses.length; x++) {
						var tempStatus = statuses[x];
						
						if(tempStatus != null) {
							var tempStatusType = tempStatus.statusType;
							var tempStatusValue = tempStatus.statusValue;
							
							if(statusType == tempStatusType && statusValue == tempStatusValue) {
								result = true;
								break;
							}
						}
					}
				}
			}
			
			return result;
		};
		
		this.isStepCompleted = function(nodeStatus) {
			return this.isNodeStatusTypeSetToValue(nodeStatus, 'isCompleted', true);
		};
		
		this.getNodeStatusForNodeId = function(nodeStatuses, nodeId) {
			var nodeStatus = null;
			
			if(nodeStatuses != null && nodeId != null) {
				for(var x=0; x<nodeStatuses.length; x++) {
					var tempNodeStatus = nodeStatuses[x];
					
					if(tempNodeStatus != null) {
						var tempNodeId = tempNodeStatus.nodeId;
						
						if(nodeId == tempNodeId) {
							return tempNodeStatus;
						}
					}
				}
			}
			
			return nodeStatus;
		}
		
		this.getNumberOfStudentsOnStep = function(nodeId) {
			var numberOfStudentsOnStep = 0;
			
			var studentStatuses = this.studentStatuses;
			
			if(studentStatuses != null) {
				for(var x=0; x<studentStatuses.length; x++) {
					var studentStatus = studentStatuses[x];
					
					if(studentStatus != null) {
						var currentNodeId = studentStatus.currentNodeId;
						
						if(nodeId == currentNodeId) {
							numberOfStudentsOnStep++;
						}
					}
				}
			}
			
			return numberOfStudentsOnStep;
		};
		
		this.getStepCompletion = function(nodeId) {
			var stepCompletion = null;
			var numberOfStudentsCompleted = 0;
			
			var studentStatuses = this.studentStatuses;
			
			if(studentStatuses != null) {
				for(var x=0; x<studentStatuses.length; x++) {
					var studentStatus = studentStatuses[x];
					
					if(studentStatus != null) {
						var nodeStatuses = studentStatus.nodeStatuses;
						
						var nodeStatus = this.getNodeStatusForNodeId(nodeStatuses, nodeId);
						
						var isStepCompleted = this.isStepCompleted(nodeStatus);
						
						if(isStepCompleted) {
							numberOfStudentsCompleted++;
						}
					}
				}
			}
			
			var numberOfStudentsInRun = UserAndClassInfoService.getNumberOfStudentsInRun();
			
			if(numberOfStudentsInRun != null) {
				stepCompletion = parseInt(100 * numberOfStudentsCompleted / numberOfStudentsInRun);
			}
			
			return stepCompletion;
		};
		
	}]);
	
});