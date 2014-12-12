angular.module('StudentStatusService', [])

.service('StudentStatusService', ['$http', '$q', 'ConfigService', 'ProjectService', function($http, $q, ConfigService, ProjectService) {
	this.studentStatuses = null;

	this.retrieveStudentStatuses = function(config) {
		var studentStatusUrl = ConfigService.getConfigParam('studentStatusUrl');
		var runId = ConfigService.getConfigParam('runId');

		var requestConfig = {
			params: {
				runId: runId
			}
		};
		
		return $http.get(studentStatusUrl, requestConfig).then(angular.bind(this, function(result) {
			var studentStatuses = result.data;
	
			this.studentStatuses = studentStatuses;
			
			return studentStatuses;
		}));
	};

	this.retrieveStudentStatuses0 = function() {
		var all = $q.all([ConfigService.getConfigParam('studentStatusUrl'), ConfigService.getConfigParam('runId')])
		.then(angular.bind(this, function(result) {
			var studentStatusUrl = result[0];
			var runId = result[1];
			
			var requestConfig = {
				params: {
					runId: runId
				}
			};
			
			return $http.get(studentStatusUrl, requestConfig).then(angular.bind(this, function(result) {
				var studentStatuses = result.data;
		
				this.studentStatuses = studentStatuses;
				
				return studentStatuses;
			}));
		}));
		
		return all;
	};
	
	this.getStudentStatuses = function() {
		return this.studentStatuses;
	};
	
	this.getCurrentStepTitleForWorkgroupId = function(workgroupId) {
		var stepTitle = null;
		
		var studentStatuses = this.studentStatuses;
		
		for(var x=0; x<studentStatuses.length; x++) {
			var studentStatus = studentStatuses[x];
			
			if(studentStatus != null) {
				var tempWorkgroupId = studentStatus.workgroupId;
				
				if(workgroupId == tempWorkgroupId) {
					var currentNodeId = studentStatus.currentNodeId;
					stepTitle = ProjectService.getStepTitleFromNodeId(currentNodeId);
					break;
				}
			}
		}
		
		return stepTitle;
	};
}]);