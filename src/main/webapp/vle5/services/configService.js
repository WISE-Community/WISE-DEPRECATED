define(['angular'], function(angular) {

    angular.module('ConfigService', [])
	
	.service('ConfigService', ['$http', function($http) {
		this.config = null;
		
		this.retrieveConfig = function(configUrl) {
			return $http.get(configUrl).then(angular.bind(this, function(result) {
				var config = result.data;
				// hard-coding these values here for now
				config.getContentUrl = "http://10.0.1.4:8080/curriculum/wise5project/project.json";
				config.dir = "rtl";
				config.nodeApplications = JSON.parse('[{"name":"OpenResponseNode","url":"nodes/openResponse/index.html"},{"name":"EchoNode","url":"http://wise4.org/echo/index.html"},{"name":"HTMLNode","url":"nodes/html/index.html"},{"name":"OutsideURLNode","url":"http://wise4.org/nodes/OutsideURLNode/index.html"},{"name":"DiscussionNode","url":"http://wise5.org/discussion/index.html"}]');
				config.navigationApplications = JSON.parse('[{"name":"starMap","url":"http://wise4.org/navigationMap/index.html"}]');
				this.config = config;
				return config;
			}));
		};
		
		this.getConfig = function() {
			return this.config;
		};
	
		this.getConfigParam = function(urlName) {
			if (this.config !== null) {
				return this.config[urlName];
			} else {
	            return null;
			}
		}; 
		
		this.getRunId = function() { 
			return this.getConfigParam('runId');
		};
	}]);
});