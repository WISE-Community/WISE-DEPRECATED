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

        serviceObject.getStudentAssetsURL = function() {
            return this.getConfigParam('studentAssetsURL');
        };

        serviceObject.getStudentStatusURL = function() {
            return this.getConfigParam('studentStatusURL');
        };
        
        serviceObject.getStudentMaxTotalAssetsSize = function() {
            return this.getConfigParam('studentMaxTotalAssetsSize');
        };

        serviceObject.getStudentNotebookURL = function() {
            return this.getConfigParam('studentNotebookURL');
        };

        serviceObject.getStudentUploadsBaseURL = function() {
            return this.getConfigParam('studentUploadsBaseURL');
        };

        serviceObject.getWebSocketURL = function() {
            return this.getConfigParam('webSocketURL');
        };
        
        serviceObject.getMode = function() {
            return this.getConfigParam('mode');
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
        
        serviceObject.getClassmateWorkgroupIds = function(includeSelf) {
            var workgroupIds = [];
            
            if (includeSelf) {
                workgroupIds.push(this.getWorkgroupId());
            }
            
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

        /**
         * Get the student names
         * @param workgroupId the workgroup id
         * @return an array containing the student names
         */
        serviceObject.getStudentFirstNamesByWorkgroupId = function(workgroupId) {
            var studentNames = [];

            // get the user names for the workgroup e.g. "Spongebob Squarepants (SpongebobS0101):Patrick Star (PatrickS0101)"
            var userNames = this.getUserNameByWorkgroupId(workgroupId);

            if (userNames != null) {
                // split the user names string by ':'
                var userNamesSplit = userNames.split(':');

                if (userNamesSplit != null) {
                    // loop through each user name
                    for (var x = 0; x < userNamesSplit.length; x++) {
                        // get a user name e.g. "Spongebob Squarepants (spongebobs0101)"
                        var userName = userNamesSplit[x];

                        // get the index of the first empty space
                        var indexOfSpace = userName.indexOf(' ');

                        // get the student first name e.g. "Spongebob"
                        var studentFirstName = userName.substring(0, indexOfSpace);

                        // add the student name to the array
                        studentNames.push(studentFirstName);
                    }
                }
            }

            return studentNames;
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

        serviceObject.getUserNamesByWorkgroupId = function(workgroupId, noUserIds) {
            var userNames = [];

            if(workgroupId != null) {
                var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

                if (userInfo != null) {
                    userNames = userInfo.userName.split(':');

                    if(noUserIds) {
                        for (var i = 0; i < userNames.length; i++) {
                            userNames[i] = userNames[i].replace(/ \(.*\)$/g, '');
                        }
                    }
                }
            }

            return userNames;
        };
        
        serviceObject.isPreview = function() {
            var result = false;
            
            var mode = this.getMode();
            
            if (mode != null && mode === 'preview') {
                result = true;
            }
            
            return result;
        };
        
        return serviceObject;
    }];
    
    return service;
});