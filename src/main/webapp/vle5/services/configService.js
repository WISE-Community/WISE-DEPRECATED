define(['angular'], function(angular) {

    angular.module('ConfigService', [])
	
	.service('ConfigService', ['$http', function($http) {
		this.config = null;
		
		this.retrieveConfig = function(configUrl) {
			return $http.get(configUrl).then(angular.bind(this, function(result) {
				var config = result.data;
				// hard-coding these values here for now. They should really come from the server.
				config.getContentUrl = 'http://localhost:8080/wise/curriculum/1/project.json';
				config.textDirection = 'rtl';
				config.nodeApplications = JSON.parse('[{"name":"OpenResponseNode","url":"nodes/openResponse/index.html"},{"name":"EchoNode","url":"http://wise4.org/echo/index.html"},{"name":"PhETNode","url":"nodes/phet/index.html"},{"name":"HTMLNode","url":"nodes/html/index.html"},{"name":"OutsideURLNode","url":"nodes/outsideURL/index.html"},{"name":"DiscussionNode","url":"http://wise5.org/discussion/index.html"}]');
				config.navigationApplications = JSON.parse('[{"name":"wiseMap","url":"navigation/navigationMap/index.html"},{"name":"wiseList","url":"navigation/navigationList/index.html"}]');
				config.getContentBaseUrl = 'http://localhost:8080/wise/curriculum/1/';
				config.getStudentDataUrl = 'http://localhost:8080/wise/vle5/student/studentData.json';
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