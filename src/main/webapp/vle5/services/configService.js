define(['angular'], function(angular) {

	angular.module('ConfigService', [])
	
	.service('ConfigService', ['$http', function($http) {
		this.config = null;
		
		this.retrieveConfig = function(configUrl) {
			return $http.get(configUrl).then(angular.bind(this, function(result) {
				var config = result.data;
				this.config = config;
				return config;
			}));
		};
		
		this.getConfig = function() {
			return this.config;
		};
	
		this.getConfigParam = function(urlName) {
			var value = null;
			
			if(this.config !== null) {
				value = this.config[urlName];
			}
			
			return value;
		}; 
		
		this.getRunId = function() { 
			return this.getConfigParam('runId');
		};
	}]);

});