define(['angular'], function(angular) {

    angular.module('ConfigService', [])
	
	.service('ConfigService', ['$http', function($http) {
		this.config = null;
		
		this.retrieveConfig = function(configUrl) {
			return $http.get(configUrl).then(angular.bind(this, function(result) {
				var config = {};
				
				// hard-coding these values here for now. They should really come from the server.
				config.textDirection = 'rtl';
				config.nodeApplications = JSON.parse('[{"name":"OpenResponse","url":"nodes/openResponse/index.html"},{"name":"PhET","url":"nodes/phet/index.html"},{"name":"HTML","url":"nodes/html/index.html"},{"name":"OutsideURL","url":"nodes/outsideURL/index.html"},{"name":"AudioRecorder","url":"nodes/audioRecorder/index.html"},{"name":"MultipleChoice","url":"nodes/multipleChoice/index.html"}]');
				config.navigationApplications = JSON.parse('[{"name":"wiseMap","url":"navigation/navigationMap/index.html"},{"name":"wiseList","url":"navigation/navigationList/index.html"}]');
				config.projectURL = 'http://localhost:8080/wise/curriculumWISE5/3/project.json';
				config.projectBaseURL = config.projectURL.replace('project.json','');
                config.getStudentDataUrl = 'http://localhost:8080/wise/vle5/student/studentData.json';
                config.projectId = 1;
                config.authorURL = 'http://localhost:8080/wise/authorWISE5.html';
                config.layoutLogic = function(vle) {
                    
                };
                
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