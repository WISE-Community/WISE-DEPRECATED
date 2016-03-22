'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ConfigService = function () {
    function ConfigService($http) {
        _classCallCheck(this, ConfigService);

        this.$http = $http;
        this.config = null;
    }

    _createClass(ConfigService, [{
        key: 'setConfig',
        value: function setConfig(config) {
            this.config = config;
            this.sortClassmateUserInfosAlphabeticallyByName();
        }
    }, {
        key: 'retrieveConfig',
        value: function retrieveConfig(configURL) {
            var _this = this;

            return this.$http.get(configURL).then(function (result) {
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

                _this.setConfig(configJSON);
                return configJSON;
            });
        }
    }, {
        key: 'getConfigParam',
        value: function getConfigParam(paramName) {
            if (this.config !== null) {
                return this.config[paramName];
            } else {
                return null;
            }
        }
    }, {
        key: 'getCRaterRequestURL',
        value: function getCRaterRequestURL() {
            return this.getConfigParam('cRaterRequestURL');
        }
    }, {
        key: 'getMainHomePageURL',
        value: function getMainHomePageURL() {
            return this.getConfigParam('mainHomePageURL');
        }
    }, {
        key: 'getRunId',
        value: function getRunId() {
            return this.getConfigParam('runId');
        }
    }, {
        key: 'getProjectId',
        value: function getProjectId() {
            return this.getConfigParam('projectId');
        }
    }, {
        key: 'getOpenCPUURL',
        value: function getOpenCPUURL() {
            return this.getConfigParam('openCPUURL');
        }
    }, {
        key: 'getSessionLogOutURL',
        value: function getSessionLogOutURL() {
            return this.getConfigParam('sessionLogOutURL');
        }
    }, {
        key: 'getStudentAssetsURL',
        value: function getStudentAssetsURL() {
            return this.getConfigParam('studentAssetsURL');
        }
    }, {
        key: 'getStudentStatusURL',
        value: function getStudentStatusURL() {
            return this.getConfigParam('studentStatusURL');
        }
    }, {
        key: 'getStudentMaxTotalAssetsSize',
        value: function getStudentMaxTotalAssetsSize() {
            return this.getConfigParam('studentMaxTotalAssetsSize');
        }
    }, {
        key: 'getStudentNotebookURL',
        value: function getStudentNotebookURL() {
            return this.getConfigParam('studentNotebookURL');
        }
    }, {
        key: 'getStudentUploadsBaseURL',
        value: function getStudentUploadsBaseURL() {
            return this.getConfigParam('studentUploadsBaseURL');
        }
    }, {
        key: 'getUserInfo',
        value: function getUserInfo() {
            return this.getConfigParam('userInfo');
        }
    }, {
        key: 'getWebSocketURL',
        value: function getWebSocketURL() {
            return this.getConfigParam('webSocketURL');
        }
    }, {
        key: 'getWISEBaseURL',
        value: function getWISEBaseURL() {
            return this.getConfigParam('wiseBaseURL');
        }
    }, {
        key: 'getMode',
        value: function getMode() {
            return this.getConfigParam('mode');
        }
    }, {
        key: 'getPeriodId',


        /**
         * Returns the period id of the logged-in user.
         */
        value: function getPeriodId() {
            var periodId = null;
            var myUserInfo = this.getMyUserInfo();
            if (myUserInfo != null) {
                periodId = myUserInfo.periodId;
            }
            return periodId;
        }
    }, {
        key: 'getPeriods',


        /**
         * Get the periods
         * @returns an array of period objects
         */
        value: function getPeriods() {
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
        }
    }, {
        key: 'getWorkgroupId',
        value: function getWorkgroupId() {
            var workgroupId = null;

            var myUserInfo = this.getMyUserInfo();
            if (myUserInfo != null) {
                workgroupId = myUserInfo.workgroupId;
            }

            return workgroupId;
        }
    }, {
        key: 'getMyUserInfo',
        value: function getMyUserInfo() {
            var myUserInfo = null;

            var userInfo = this.getUserInfo();
            if (userInfo != null) {
                myUserInfo = userInfo.myUserInfo;
            }

            return myUserInfo;
        }
    }, {
        key: 'getClassmateUserInfos',
        value: function getClassmateUserInfos() {
            var classmateUserInfos = null;
            var myUserInfo = this.getMyUserInfo();
            if (myUserInfo != null) {
                var myClassInfo = myUserInfo.myClassInfo;
                if (myClassInfo != null) {
                    classmateUserInfos = myClassInfo.classmateUserInfos;
                }
            }

            return classmateUserInfos;
        }
    }, {
        key: 'getTeacherWorkgroupId',
        value: function getTeacherWorkgroupId() {
            var teacherWorkgroupId = null;
            var teacherUserInfo = this.getTeacherUserInfo();
            if (teacherUserInfo != null) {
                teacherWorkgroupId = teacherUserInfo.workgroupId;
            }
            return teacherWorkgroupId;
        }
    }, {
        key: 'getTeacherUserInfo',
        value: function getTeacherUserInfo() {
            var teacherUserInfo = null;
            var myUserInfo = this.getMyUserInfo();
            if (myUserInfo != null) {
                var myClassInfo = myUserInfo.myClassInfo;
                if (myClassInfo != null) {
                    teacherUserInfo = myClassInfo.teacherUserInfo;
                }
            }
            return teacherUserInfo;
        }
    }, {
        key: 'getClassmateWorkgroupIds',
        value: function getClassmateWorkgroupIds(includeSelf) {
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
        }
    }, {
        key: 'sortClassmateUserInfosAlphabeticallyByName',
        value: function sortClassmateUserInfosAlphabeticallyByName() {
            var classmateUserInfos = this.getClassmateUserInfos();

            if (classmateUserInfos != null) {
                classmateUserInfos.sort(this.sortClassmateUserInfosAlphabeticallyByNameHelper);
            }

            return classmateUserInfos;
        }
    }, {
        key: 'sortClassmateUserInfosAlphabeticallyByNameHelper',
        value: function sortClassmateUserInfosAlphabeticallyByNameHelper(a, b) {
            var aUserName = a.userName;
            var bUserName = b.userName;
            var result = 0;

            if (aUserName < bUserName) {
                result = -1;
            } else if (aUserName > bUserName) {
                result = 1;
            }

            return result;
        }
    }, {
        key: 'getUserInfoByWorkgroupId',
        value: function getUserInfoByWorkgroupId(workgroupId) {
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
        }
    }, {
        key: 'getPeriodIdByWorkgroupId',


        /**
         * Get the period id for a workgroup id
         * @param workgroupId the workgroup id
         * @returns the period id the workgroup id is in
         */
        value: function getPeriodIdByWorkgroupId(workgroupId) {
            var periodId = null;

            if (workgroupId != null) {
                var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

                if (userInfo != null) {
                    periodId = userInfo.periodId;
                }
            }

            return periodId;
        }
    }, {
        key: 'getStudentFirstNamesByWorkgroupId',


        /**
         * Get the student names
         * @param workgroupId the workgroup id
         * @return an array containing the student names
         */
        value: function getStudentFirstNamesByWorkgroupId(workgroupId) {
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
        }
    }, {
        key: 'getUserNameByWorkgroupId',
        value: function getUserNameByWorkgroupId(workgroupId) {
            var userName = null;

            if (workgroupId != null) {
                var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

                if (userInfo != null) {
                    userName = userInfo.userName;
                }
            }

            return userName;
        }
    }, {
        key: 'getUserNamesByWorkgroupId',
        value: function getUserNamesByWorkgroupId(workgroupId) {
            var userNamesObjects = [];

            if (workgroupId != null) {
                var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

                if (userInfo != null) {
                    var userNames = userInfo.userName.split(':');

                    for (var i = 0; i < userNames.length; i++) {
                        var name = userNames[i];
                        var id = "";
                        var regex = /(.+) \((.+)\)/g;
                        var matches = regex.exec(name);
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
        }
    }, {
        key: 'isPreview',
        value: function isPreview() {
            var result = false;

            var mode = this.getMode();

            if (mode != null && mode === 'preview') {
                result = true;
            }

            return result;
        }
    }, {
        key: 'convertToServerTimestamp',


        /**
         * Convert a client timestamp to a server timestamp. This is required
         * in case the client and server clocks are not synchronized.
         * @param clientTimestamp the client timestamp
         */
        value: function convertToServerTimestamp(clientTimestamp) {

            // get the difference between the client time and server time
            var timestampDiff = this.getConfigParam('timestampDiff');

            // convert the client timestamp to a server timestamp
            var serverTimestamp = clientTimestamp - timestampDiff;

            return serverTimestamp;
        }
    }]);

    return ConfigService;
}();

;

ConfigService.$inject = ['$http'];

exports.default = ConfigService;
//# sourceMappingURL=configService.js.map