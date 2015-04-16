define([], function() {

    var service = ['$http', function($http) {
        var serviceObject = {};
        
        serviceObject.config = null;
        
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
        
        serviceObject.getMainHomePageURL = function() {
            return this.getConfigParam('mainHomePageURL');
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

        serviceObject.getRunId = function() { 
            return this.getConfigParam('runId');
        };

        serviceObject.getSessionLogOutURL = function() {
            return this.getConfigParam('sessionLogOutURL');
        };

        serviceObject.getStudentAssetManagerURL = function() {
            return this.getConfigParam('studentAssetManagerURL');
        };

        serviceObject.getStudentStatusURL = function() {
            return this.getConfigParam('studentStatusURL');
        };
        
        serviceObject.getStudentUploadsBaseURL = function() {
            return this.getConfigParam('studentUploadsBaseURL');
        };
        
        serviceObject.getWebSocketURL = function() {
            return this.getConfigParam('webSocketURL');
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
        
        serviceObject.getClassmateUserInfos = function() {
            var classmateUserInfos = null;
            var userInfo = this.getConfigParam('userInfo');
            if (userInfo != null) {
                var myUserInfo = userInfo.myUserInfo;
                if (myUserInfo != null) {
                    var myClassInfo = myUserInfo.myClassInfo;
                    if (myClassInfo != null) {
                        classmateUserInfos = myClassInfo.classmateUserInfos;
                    }
                }
            }
            return classmateUserInfos;
        };
        
        serviceObject.retrieveConfig = function(configUrl) {
            return $http.get(configUrl).then(angular.bind(this, function(result) {
                var config = result.data;
                
                this.config = config;
                return config;
            }));
        };
        
        return serviceObject;
    }];
    
    return service;
});