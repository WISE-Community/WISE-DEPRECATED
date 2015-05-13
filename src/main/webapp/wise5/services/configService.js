define([], function() {

    var service = ['$http', function($http) {
        var serviceObject = {};
        
        serviceObject.config = null;
        
        serviceObject.getConfig = function() {
            return this.config;
        };
        
        serviceObject.retrieveConfig = function(configUrl) {
            return $http.get(configUrl).then(angular.bind(this, function(result) {
                var config = result.data;
                
                this.config = config;
                
                this.sortClassmateUserInfosAlphabeticallyByName();
                
                return config;
            }));
        };
        
        serviceObject.getConfigParam = function(paramName) {
            if (this.config !== null) {
                return this.config[paramName];
            } else {
                return null;
            }
        }; 
        
        serviceObject.getCRaterRequestURL = function() {
            return this.getConfigParam('cRaterRequestURL');    
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
        
        serviceObject.getStudentMaxTotalAssetsSize = function() {
            return this.getConfigParam('studentMaxTotalAssetsSize');
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
        
        serviceObject.getMyUserInfo = function() {
            var myUserInfo = null;
            
            var userInfo = this.getConfigParam('userInfo');
            if (userInfo != null) {
                myUserInfo = userInfo.myUserInfo;
            }
            
            return myUserInfo;
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
        
        serviceObject.getTeacherWorkgroupId = function() {
            var teacherWorkgroupId = null;
            var teacherUserInfo = this.getTeacherUserInfo();
            if (teacherUserInfo != null) {
                teacherWorkgroupId = teacherUserInfo.workgroupId;
            }
            return teacherWorkgroupId;
        };
        
        serviceObject.getTeacherUserInfo = function() {
            var teacherUserInfo = null;
            var myUserInfo = this.getMyUserInfo();
            if (myUserInfo != null) {
                var myClassInfo = myUserInfo.myClassInfo;
                if (myClassInfo != null) {
                    teacherUserInfo = myClassInfo.teacherUserInfo;
                }
            }
            return teacherUserInfo;
        };
        
        serviceObject.getClassmateWorkgroupIds = function() {
            var workgroupIds = [];
            
            var classmateUserInfos = this.getClassmateUserInfos();
            
            if (classmateUserInfos != null) {
                for (var c = 0; c < classmateUserInfos.length; c++) {
                    var classmateUserInfo = classmateUserInfos[c];
                    
                    if (classmateUserInfo != null) {
                        var workgroupId = classmateUserInfo.workgroupId;
                        
                        if (workgroupId != null) {
                            workgroupIds.push(workgroupId);
                        }
                    }
                }
            }
            
            return workgroupIds;
        };
        
        serviceObject.sortClassmateUserInfosAlphabeticallyByName = function() {
            var classmateUserInfos = this.getClassmateUserInfos();
            
            if (classmateUserInfos != null) {
                classmateUserInfos.sort(this.sortClassmateUserInfosAlphabeticallyByNameHelper);
            }
            
            return classmateUserInfos;
        };
        
        serviceObject.sortClassmateUserInfosAlphabeticallyByNameHelper = function(a, b) {
            var aUserName = a.userName;
            var bUserName = b.userName;
            var result = 0;
            
            if (aUserName < bUserName) {
                result = -1;
            } else if (aUserName > bUserName) {
                result = 1;
            }
            
            return result;
        };
        
        serviceObject.getUserInfoByWorkgroupId = function(workgroupId) {
            var userInfo = null;
            
            if (workgroupId != null) {
                
                var myUserInfo = this.getMyUserInfo();
                
                if (myUserInfo != null) {
                    var tempWorkgroupId = myUserInfo.workgroupId;
                    
                    if (workgroupId === tempWorkgroupId) {
                        userInfo = myUserInfo;
                    }
                };
                
                if (userInfo == null) {
                    var classmateUserInfos = this.getClassmateUserInfos();
                    
                    if (classmateUserInfos != null) {
                        for (var c = 0; c < classmateUserInfos.length; c++) {
                            var classmateUserInfo = classmateUserInfos[c];
                            
                            if (classmateUserInfo != null) {
                                var tempWorkgroupId = classmateUserInfo.workgroupId;
                                
                                if (workgroupId === tempWorkgroupId) {
                                    userInfo = classmateUserInfo;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            
            return userInfo;
        };
        
        serviceObject.getUserNameByWorkgroupId = function(workgroupId) {
            var userName = null;
            
            if (workgroupId != null) {
                var userInfo = this.getUserInfoByWorkgroupId(workgroupId);
                
                if (userInfo != null) {
                    userName = userInfo.userName;
                }
            }
            
            return userName;
        };
        
        return serviceObject;
    }];
    
    return service;
});