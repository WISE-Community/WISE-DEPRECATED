define([], function() {

    var service = ['$http', function($http) {
        var serviceObject = {};
        
        serviceObject.config = null;
        
        serviceObject.retrieveConfig = function(configUrl) {
            return $http.get(configUrl).then(angular.bind(this, function(result) {
                var config = result.data;
                
                // hard-coding these values here for now. They should really come from the server.
                /*
                config.textDirection = 'rtl';
                config.projectURL = 'http://localhost:8080/wise/curriculumWISE5/4/project.json';
                config.projectBaseURL = config.projectURL.replace('project.json','');
                config.getStudentDataUrl = 'http://localhost:8080/wise/vle5/student/studentData.json';
                config.projectId = 1;
                config.authorURL = 'http://localhost:8080/wise/authorWISE5.html';
                config.layoutLogic = function(vle) {
                    
                };
                */
                this.config = config;
                return config;
            }));
        };
        
        serviceObject.getConfig = function() {
            return this.config;
        };
    
        serviceObject.getConfigParam = function(paramName) {
            if (this.config !== null) {
                return this.config[paramName];
            } else {
                return null;
            }
        }; 
        
        serviceObject.getSessionLogOutURL = function() {
            return this.getConfigParam('sessionLogOutURL');
        };

        serviceObject.getMainHomePageURL = function() {
            return this.getConfigParam('mainHomePageURL');
        };

        serviceObject.getWorkgroupId = function() {
            var workgroupId = null;
            var userInfo = this.getConfigParam('userInfo');
            if (userInfo != null) {
                var myUserInfo = userInfo.myUserInfo;
                if (myUserInfo != null) {
                    workgroupId = myUserInfo.workgroupId;
                }
            }
            return workgroupId;
        };
        
        serviceObject.getPeriodId = function() {
            var periodId = null;
            var userInfo = this.getConfigParam('userInfo');
            if (userInfo != null) {
                var myUserInfo = userInfo.myUserInfo;
                if (myUserInfo != null) {
                    periodId = myUserInfo.periodId;
                }
            }
            return periodId;
        };
        
        serviceObject.getWebSocketURL = function() {
          return this.getConfigParam('webSocketURL');  
        };
        
        serviceObject.getRunId = function() { 
            return this.getConfigParam('runId');
        };
        
        return serviceObject;
    }];
    
    return service;
});