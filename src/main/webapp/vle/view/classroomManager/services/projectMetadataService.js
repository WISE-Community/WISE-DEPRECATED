angular.module('ProjectMetadataService', [])

.service('ProjectMetadataService', ['$http', '$q', 'ConfigService', function($http, $q, ConfigService) {
	this.projectMetadata = null;
	this.maxScores = null;
	
	this.retrieveProjectMetadata = function() {
		var projectMetaDataUrl = ConfigService.getConfigParam('projectMetaDataUrl');
		var projectId = ConfigService.getConfigParam('projectId');
		
		var requestConfig = {
			params: {
				command: 'getProjectMetaData',
				projectId: projectId
			}
		};
		
		return $http.get(projectMetaDataUrl, requestConfig).then(angular.bind(this, function(result) {
			var projectJSON = result.data;
			this.projectMetadata = projectJSON;
			
			var projectMetadata = this.projectMetadata;
			
			if(projectMetadata != null) {
				var maxScoresString = projectMetadata.maxScores;
				
				if(maxScoresString != null) {
					var maxScores = angular.fromJson(maxScoresString);
					
					if(maxScores != null) {
						this.maxScores = maxScores;
					}				
				}
			}
			
			return projectJSON;
		}));
	};
	
	this.getMaxScore = function(nodeId) {
		var maxScore = null;
		
		var maxScores = this.maxScores;
		
		if(maxScores != null) {
			for(var x=0; x<maxScores.length; x++) {
				var tempMaxScore = maxScores[x];
				
				if(tempMaxScore != null) {
					var tempMaxScoreValue = tempMaxScore.maxScoreValue;
					var tempNodeId = tempMaxScore.nodeId;
					
					if(nodeId == tempNodeId) {
						maxScore = tempMaxScoreValue;
						break;
					}
				}
			}
		}
		
		return maxScore;
	};
}]);