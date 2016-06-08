'use strict';

class ConfigService {

    constructor($http, $location) {
        this.$http = $http;
        this.$location = $location;
        this.config = null;
    };

    setConfig(config) {
        this.config = config;
        this.sortClassmateUserInfosAlphabeticallyByName();
    };

    retrieveConfig(configURL) {
        return this.$http.get(configURL).then((result) => {
            var configJSON = result.data;

            if (configJSON.retrievalTimestamp != null) {
                // get the client timestamp
                var clientTimestamp = new Date().getTime();

                // get the server timestamp
                var serverTimestamp = configJSON.retrievalTimestamp;

                // get the difference between the client and server time
                var timestampDiff = clientTimestamp - serverTimestamp;

                // add the timestamp diff to the config object
                configJSON.timestampDiff = timestampDiff;
            }
            
            var constraints = true;
            
            // get the full url
            var absURL = this.$location.$$absUrl;
            
            // regex to match constraints=false in the url
            var regEx = new RegExp("constraints=false", 'gi');
            
            if (absURL != null && absURL.match(regEx)) {
                // the url contains constraints=false
                constraints = false;
            }
            
            // set the constraints value into the config so we can access it later
            configJSON.constraints = constraints;

            this.setConfig(configJSON);

            if (this.isPreview()) {
                // assign a random workgroup id
                var myUserInfo = this.getMyUserInfo();
                if (myUserInfo != null) {
                    // set the workgroup id to a random integer between 1 and 100
                    myUserInfo.workgroupId = Math.floor(100 * Math.random()) + 1;
                }
            }

            return configJSON;
        });
    };

    getConfigParam(paramName) {
        if (this.config !== null) {
            return this.config[paramName];
        } else {
            return null;
        }
    };

    getCRaterRequestURL() {
        return this.getConfigParam('cRaterRequestURL');
    };

    getMainHomePageURL() {
        return this.getConfigParam('mainHomePageURL');
    };

    getNotificationURL() {
        return this.getConfigParam('notificationURL');
    };

    getRunId() {
        return this.getConfigParam('runId');
    };

    getProjectId() {
        return this.getConfigParam('projectId');
    };

    getOpenCPUURL() {
        return this.getConfigParam('openCPUURL');
    };

    getSessionLogOutURL() {
        return this.getConfigParam('sessionLogOutURL');
    };

    getStudentAssetsURL() {
        return this.getConfigParam('studentAssetsURL');
    };

    getStudentStatusURL() {
        return this.getConfigParam('studentStatusURL');
    };

    getStudentMaxTotalAssetsSize() {
        return this.getConfigParam('studentMaxTotalAssetsSize');
    };

    getStudentNotebookURL() {
        return this.getConfigParam('studentNotebookURL');
    };

    getStudentUploadsBaseURL() {
        return this.getConfigParam('studentUploadsBaseURL');
    };

    getUserInfo() {
        return this.getConfigParam('userInfo');
    };

    getWebSocketURL() {
        return this.getConfigParam('webSocketURL');
    };

    getWISEBaseURL() {
        return this.getConfigParam('wiseBaseURL');
    };

    getLocale() {
        return this.getConfigParam('locale') || 'en';
    };

    getMode() {
        return this.getConfigParam('mode');
    };

    /**
     * Returns the period id of the logged-in user.
     */
    getPeriodId() {
        var periodId = null;
        var myUserInfo = this.getMyUserInfo();
        if (myUserInfo != null) {
            periodId = myUserInfo.periodId;
        }
        return periodId;
    };

    /**
     * Get the periods
     * @returns an array of period objects
     */
    getPeriods() {
        var periods = [];

        var myUserInfo = this.getMyUserInfo();
        if (myUserInfo != null) {

            var myClassInfo = myUserInfo.myClassInfo;
            if (myClassInfo != null) {

                if (myClassInfo.periods != null) {
                    periods = myClassInfo.periods;
                }
            }
        }

        return periods;
    };

    getWorkgroupId() {
        var workgroupId = null;

        var myUserInfo = this.getMyUserInfo();
        if (myUserInfo != null) {
            workgroupId = myUserInfo.workgroupId;
        }

        return workgroupId;
    };

    getMyUserInfo() {
        var myUserInfo = null;

        var userInfo = this.getUserInfo();
        if (userInfo != null) {
            myUserInfo = userInfo.myUserInfo;
        }

        return myUserInfo;
    };

    getClassmateUserInfos() {
        var classmateUserInfos = null;
        var myUserInfo = this.getMyUserInfo();
        if (myUserInfo != null) {
            var myClassInfo = myUserInfo.myClassInfo;
            if (myClassInfo != null) {
                classmateUserInfos = myClassInfo.classmateUserInfos;
            }
        }

        return classmateUserInfos;
    };

    getTeacherWorkgroupId() {
        var teacherWorkgroupId = null;
        var teacherUserInfo = this.getTeacherUserInfo();
        if (teacherUserInfo != null) {
            teacherWorkgroupId = teacherUserInfo.workgroupId;
        }
        return teacherWorkgroupId;
    };

    getTeacherUserInfo() {
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

    getClassmateWorkgroupIds(includeSelf) {
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

    sortClassmateUserInfosAlphabeticallyByName() {
        var classmateUserInfos = this.getClassmateUserInfos();

        if (classmateUserInfos != null) {
            classmateUserInfos.sort(this.sortClassmateUserInfosAlphabeticallyByNameHelper);
        }

        return classmateUserInfos;
    };

    sortClassmateUserInfosAlphabeticallyByNameHelper(a, b) {
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

    getUserInfoByWorkgroupId(workgroupId) {
        var userInfo = null;

        if (workgroupId != null) {

            var myUserInfo = this.getMyUserInfo();

            if (myUserInfo != null) {
                var tempWorkgroupId = myUserInfo.workgroupId;

                if (workgroupId === tempWorkgroupId) {
                    userInfo = myUserInfo;
                }
            }

            if (userInfo == null) {
                var classmateUserInfos = this.getClassmateUserInfos();

                if (classmateUserInfos != null) {
                    for (var c = 0; c < classmateUserInfos.length; c++) {
                        var classmateUserInfo = classmateUserInfos[c];

                        if (classmateUserInfo != null) {
                            var tempWorkgroupId = classmateUserInfo.workgroupId;

                            if (workgroupId == tempWorkgroupId) {
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
     * Get the period id for a workgroup id
     * @param workgroupId the workgroup id
     * @returns the period id the workgroup id is in
     */
    getPeriodIdByWorkgroupId(workgroupId) {
        var periodId = null;

        if (workgroupId != null) {
            var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

            if (userInfo != null) {
                periodId = userInfo.periodId;
            }
        }

        return periodId;
    };

    /**
     * Get the student names
     * @param workgroupId the workgroup id
     * @return an array containing the student names
     */
    getStudentFirstNamesByWorkgroupId(workgroupId) {
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

    getUserNameByWorkgroupId(workgroupId) {
        var userName = null;

        if (workgroupId != null) {
            var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

            if (userInfo != null) {
                userName = userInfo.userName;
            }
        }

        return userName;
    };

    getUserNamesByWorkgroupId(workgroupId) {
        let userNamesObjects = [];

        if (workgroupId != null) {
            let userInfo = this.getUserInfoByWorkgroupId(workgroupId);

            if (userInfo != null) {
                let userNames = userInfo.userName.split(':');

                for (let i = 0; i < userNames.length; i++) {
                    let name = userNames[i];
                    let id = "";
                    let regex = /(.+) \((.+)\)/g;
                    let matches = regex.exec(name);
                    if (matches) {
                        name = matches[1];
                        id = matches[2];
                    }
                    userNamesObjects.push({
                        name: name,
                        id: id
                    });
                }
            }
        }

        return userNamesObjects;
    };

    isPreview() {
        var result = false;

        var mode = this.getMode();

        if (mode != null && mode === 'preview') {
            result = true;
        }

        return result;
    };

    /**
     * Convert a client timestamp to a server timestamp. This is required
     * in case the client and server clocks are not synchronized.
     * @param clientTimestamp the client timestamp
     */
    convertToServerTimestamp(clientTimestamp) {

        // get the difference between the client time and server time
        var timestampDiff = this.getConfigParam('timestampDiff');

        // convert the client timestamp to a server timestamp
        var serverTimestamp = clientTimestamp - timestampDiff;

        return serverTimestamp;
    }

    /**
     * Convert a server timestamp to a client timestamp. This is required
     * in case the client and server clocks are not synchronized.
     * @param serverTimestamp the client timestamp
     */
    convertToClientTimestamp(serverTimestamp) {

        // get the difference between the client time and server time
        var timestampDiff = this.getConfigParam('timestampDiff');

        // convert the client timestamp to a server timestamp
        var clientTimestamp = serverTimestamp + timestampDiff;

        return clientTimestamp;
    }
};

ConfigService.$inject = [
    '$http',
    '$location'
];

export default ConfigService;
