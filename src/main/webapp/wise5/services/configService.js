'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ConfigService = function () {
    function ConfigService($filter, $http, $location) {
        _classCallCheck(this, ConfigService);

        this.$filter = $filter;
        this.$http = $http;
        this.$location = $location;
        this.config = null;

        this.$translate = this.$filter('translate');
    }

    _createClass(ConfigService, [{
        key: 'setConfig',
        value: function setConfig(config) {
            this.config = config;
            this.sortClassmateUserInfosAlphabeticallyByName();
            this.setPermissions();
            this.setClassmateDisplayNames();
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

                var constraints = true;

                // get the full url
                var absURL = _this.$location.$$absUrl;

                // regex to match constraints=false in the url
                var constraintsRegEx = new RegExp("constraints=false", 'gi');

                if (absURL != null && absURL.match(constraintsRegEx)) {
                    // the url contains constraints=false
                    constraints = false;
                }

                // set the constraints value into the config so we can access it later
                configJSON.constraints = constraints;

                // regex to match showProjectPath=true in the url
                var showProjectPathRegEx = new RegExp("showProjectPath=true", 'gi');

                if (absURL != null && absURL.match(showProjectPathRegEx)) {
                    // the url contains showProjectPath=true

                    // get the host e.g. http://wise.berkeley.edu
                    var host = location.origin;

                    // get the project URL e.g. /wise/curriculum/123/project.json
                    var projectURL = configJSON.projectURL;

                    // get the full project path
                    var projectPath = host + projectURL;

                    // output the full project path to the console
                    console.log(projectPath);
                }

                _this.setConfig(configJSON);

                if (_this.isPreview()) {
                    // assign a random workgroup id
                    var myUserInfo = _this.getMyUserInfo();
                    if (myUserInfo != null) {
                        // set the workgroup id to a random integer between 1 and 100
                        myUserInfo.workgroupId = Math.floor(100 * Math.random()) + 1;
                    }
                }

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
        key: 'getNotificationURL',
        value: function getNotificationURL() {
            return this.getConfigParam('notificationURL');
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
        key: 'getLocale',
        value: function getLocale() {
            return this.getConfigParam('locale') || 'en';
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
        key: 'getMyUserName',


        /**
         * Get the user name of the signed in user
         * @return the user name of the signed in user
         */
        value: function getMyUserName() {

            var userName = null;

            // get my user info
            var myUserInfo = this.getMyUserInfo();

            if (myUserInfo != null) {
                // get the user name
                userName = myUserInfo.userName;
            }

            return userName;
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
        key: 'setClassmateDisplayNames',
        value: function setClassmateDisplayNames() {
            var classmateUserInfos = this.getClassmateUserInfos();

            if (classmateUserInfos) {
                var n = classmateUserInfos.length;

                for (var i = 0; i < n; i++) {
                    var workgroup = classmateUserInfos[i];
                    workgroup.displayNames = this.getDisplayUserNamesByWorkgroupId(workgroup.workgroupId);
                }
            }
        }

        /**
         * Get the classmate user infos sorted by ascending workgroup id
         * @return an array of classmate user info objects sorted by ascending
         * workgroup id
         */

    }, {
        key: 'getClassmateUserInfosSortedByWorkgroupId',
        value: function getClassmateUserInfosSortedByWorkgroupId() {

            var sortedClassmateUserInfos = [];

            // get all the classmate user info objects
            var classmateUserInfos = this.getClassmateUserInfos();

            if (classmateUserInfos != null) {

                /*
                 * loop through all the classmate user info objects and add it to
                 * new array of classmate user infos
                 */
                for (var c = 0; c < classmateUserInfos.length; c++) {
                    sortedClassmateUserInfos.push(classmateUserInfos[c]);
                }
            }

            // sort the new classmate user infos array by ascending workgroup id
            sortedClassmateUserInfos.sort(this.compareClassmateUserInfosByWorkgroupId);

            return sortedClassmateUserInfos;
        }

        /**
         * Used to sort the classmate user infos by ascending workgroup id.
         * Use by calling myArray.sort(compareClassmateUserInfosByWorkgroupId)
         * @param a a user info object
         * @param b a user info Object
         * @return -1 if a comes before b
         * 1 if a comes after b
         * 0 if a equals b
         */

    }, {
        key: 'compareClassmateUserInfosByWorkgroupId',
        value: function compareClassmateUserInfosByWorkgroupId(a, b) {
            if (a.workgroupId < b.workgroupId) {
                return -1;
            } else if (a.workgroupId > b.workgroupId) {
                return 1;
            } else {
                return 0;
            }
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
        key: 'getSharedTeacherUserInfos',


        /**
         * Get the shared teacher user infos for the run
         */
        value: function getSharedTeacherUserInfos() {
            var sharedTeacherUserInfos = null;
            var myUserInfo = this.getMyUserInfo();
            if (myUserInfo != null) {
                var myClassInfo = myUserInfo.myClassInfo;
                if (myClassInfo != null) {
                    sharedTeacherUserInfos = myClassInfo.sharedTeacherUserInfos;
                }
            }
            return sharedTeacherUserInfos;
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
            var result = 0;

            if (a != null && a.userName != null && b != null && b.userName != null) {
                var aUserName = a.userName.toLowerCase();
                var bUserName = b.userName.toLowerCase();

                if (aUserName < bUserName) {
                    result = -1;
                } else if (aUserName > bUserName) {
                    result = 1;
                }
            }

            return result;
        }
    }, {
        key: 'setPermissions',
        value: function setPermissions() {
            // get the role of the teacher for the run e.g. 'owner', 'write', 'read'
            var role = this.getTeacherRole(this.getWorkgroupId());

            if (role === 'owner') {
                // the teacher is the owner of the run and has full access
                this.config.canViewStudentNames = true;
                this.config.canGradeStudentWork = true;
            } else if (role === 'write') {
                // the teacher is a shared teacher that can grade the student work
                this.config.canViewStudentNames = true;
                this.config.canGradeStudentWork = true;
            } else if (role === 'read') {
                // the teacher is a shared teacher that can only view the student work
                this.config.canViewStudentNames = false;
                this.config.canGradeStudentWork = false;
            } else {
                // teacher role is null, so assume we're in student mode
                this.config.canViewStudentNames = true;
                this.config.canGradeStudentWork = false;
            }
        }
    }, {
        key: 'getPermissions',
        value: function getPermissions() {
            return {
                canViewStudentNames: this.config.canViewStudentNames,
                canGradeStudentWork: this.config.canGradeStudentWork
            };
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
        key: 'getDisplayNamesByWorkgroupId',
        value: function getDisplayNamesByWorkgroupId(workgroupId) {
            var displayNames = null;

            if (workgroupId != null) {
                var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

                if (userInfo != null) {
                    displayNames = userInfo.displayNames;
                }
            }

            return displayNames;
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
        key: 'getDisplayUserNamesByWorkgroupId',
        value: function getDisplayUserNamesByWorkgroupId(workgroupId) {
            var usernames = '';

            if (workgroupId != null) {
                if (this.config.canViewStudentNames) {
                    var names = this.getUserNamesByWorkgroupId(workgroupId);
                    var l = names.length;
                    for (var i = 0; i < l; i++) {
                        var name = names[i].name;
                        usernames += name;

                        if (i < l - 1) {
                            usernames += ', ';
                        }
                    }
                } else {
                    // current user is not allowed to view student names, so return string with workgroupId
                    usernames = this.$translate('teamId', { id: workgroupId });
                }
            }

            return usernames;
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

        /**
         * Convert a server timestamp to a client timestamp. This is required
         * in case the client and server clocks are not synchronized.
         * @param serverTimestamp the client timestamp
         */

    }, {
        key: 'convertToClientTimestamp',
        value: function convertToClientTimestamp(serverTimestamp) {

            // get the difference between the client time and server time
            var timestampDiff = this.getConfigParam('timestampDiff');

            // convert the client timestamp to a server timestamp
            var clientTimestamp = serverTimestamp + timestampDiff;

            return clientTimestamp;
        }

        /**
         * Check if the workgroup is the owner of the run
         * @param workgroupId the workgroup id
         * @returns whether the workgroup is the owner of the run
         */

    }, {
        key: 'isRunOwner',
        value: function isRunOwner(workgroupId) {

            var result = false;

            if (workgroupId != null) {
                var teacherUserInfo = this.getTeacherUserInfo();

                if (teacherUserInfo != null) {

                    if (workgroupId == teacherUserInfo.workgroupId) {
                        result = true;
                    }
                }
            }

            return result;
        }

        /**
         * Check if the workgroup is a shared teacher for the run
         * @param workgroupId the workgroup id
         * @returns whether the workgroup is a shared teacher of the run
         */

    }, {
        key: 'isRunSharedTeacher',
        value: function isRunSharedTeacher(workgroupId) {

            var result = false;

            if (workgroupId != null) {
                var sharedTeacherUserInfos = this.getSharedTeacherUserInfos();

                if (sharedTeacherUserInfos != null) {

                    for (var s = 0; s < sharedTeacherUserInfos.length; s++) {
                        var sharedTeacherUserInfo = sharedTeacherUserInfos[s];

                        if (sharedTeacherUserInfo != null) {
                            if (workgroupId == sharedTeacherUserInfo.workgroupId) {
                                result = true;
                            }
                        }
                    }
                }
            }

            return result;
        }

        /**
         * Get the teacher role for the run
         * @param workgroupId the workgroup id
         * @returns the role of the teacher for the run. the possible values are
         * 'owner', 'write', 'read'
         */

    }, {
        key: 'getTeacherRole',
        value: function getTeacherRole(workgroupId) {
            var role = null;

            if (this.isRunOwner(workgroupId)) {
                // the teacher is the owner of the run
                role = 'owner';
            } else if (this.isRunSharedTeacher(workgroupId)) {
                // the teacher is a shared teacher so their role may be 'write' or 'read'
                role = this.getSharedTeacherRole(workgroupId);
            }

            return role;
        }

        /**
         * Get the shared teacher role for the run
         * @param workgroupId the workgroup id
         * @returns the shared teacher role for the run. the possible values are
         * 'write' or 'read'
         */

    }, {
        key: 'getSharedTeacherRole',
        value: function getSharedTeacherRole(workgroupId) {
            var role = null;

            if (workgroupId != null) {
                var sharedTeacherUserInfos = this.getSharedTeacherUserInfos();

                if (sharedTeacherUserInfos != null) {

                    for (var s = 0; s < sharedTeacherUserInfos.length; s++) {
                        var sharedTeacherUserInfo = sharedTeacherUserInfos[s];

                        if (sharedTeacherUserInfo != null) {
                            if (workgroupId == sharedTeacherUserInfo.workgroupId) {
                                role = sharedTeacherUserInfo.role;
                            }
                        }
                    }
                }
            }

            return role;
        }

        /**
         * Replace student names in the content.
         * For example, we will replace instances of {{firstStudentFirstName}}
         * with the actual first name of the first student in the workgroup.
         * @param content a content object or string
         * @return an updated content object or string
         */

    }, {
        key: 'replaceStudentNames',
        value: function replaceStudentNames(content) {
            if (content != null) {

                var contentString = content;

                if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object') {
                    // get the content as a string
                    contentString = JSON.stringify(content);
                }

                if (contentString != null) {

                    // get the workgroup id
                    var workgroupId = this.getWorkgroupId();

                    // get all the first names
                    var firstNames = this.getStudentFirstNamesByWorkgroupId(workgroupId);

                    if (firstNames.length >= 1) {
                        /*
                         * there are 1 or more students in the workgroup so we can
                         * replace the first student first name with the actual
                         * name
                         */
                        contentString = contentString.replace(new RegExp('{{firstStudentFirstName}}', 'gi'), firstNames[0]);

                        /*
                         * there are 1 or more students in the workgroup so we can
                         * replace the student first names with the actual names
                         */
                        contentString = contentString.replace(new RegExp('{{studentFirstNames}}', 'gi'), firstNames.join(", "));
                    }

                    if (firstNames.length >= 2) {
                        /*
                         * there are 2 or more students in the workgroup so we can
                         * replace the second student first name with the actual
                         * name
                         */
                        contentString = contentString.replace(new RegExp('{{secondStudentFirstName}}', 'gi'), firstNames[1]);
                    }

                    if (firstNames.length >= 3) {
                        /*
                         * there are 3 or more students in the workgroup so we can
                         * replace the third student first name with the actual
                         * name
                         */
                        contentString = contentString.replace(new RegExp('{{thirdStudentFirstName}}', 'gi'), firstNames[2]);
                    }
                }

                if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object') {
                    // convert the content string back into an object
                    content = JSON.parse(contentString);
                } else if (typeof content === 'string') {
                    // the content was a string so we can just use the content string
                    content = contentString;
                }
            }

            return content;
        }
    }, {
        key: 'getAvatarColorForWorkgroupId',
        value: function getAvatarColorForWorkgroupId(workgroupId) {
            var avatarColors = ['#E91E63', '#9C27B0', '#CDDC39', '#2196F3', '#FDD835', '#43A047', '#795548', '#EF6C00', '#C62828', '#607D8B'];
            var modulo = workgroupId % 10;
            return avatarColors[modulo];
        }

        /**
         * Get the library projects
         */

    }, {
        key: 'getLibraryProjects',
        value: function getLibraryProjects() {

            // get the URL to get the list of library projects
            var getLibraryProjectsURL = this.getConfigParam('getLibraryProjectsURL');

            if (getLibraryProjectsURL != null) {

                // request the list of library projects
                return this.$http.get(getLibraryProjectsURL).then(function (result) {
                    //console.log(result.data);
                    return result.data;
                });
            }
        }

        /**
         * Get the project assets folder path
         * @param includeHost whether to include the host in the URL
         * @return the project assets folder path
         * e.g.
         * with host
         * http://wise.berkeley.edu/wise/curriculum/3/assets
         * without host
         * /wise/curriculum/3/assets
         */

    }, {
        key: 'getProjectAssetsDirectoryPath',
        value: function getProjectAssetsDirectoryPath(includeHost) {
            var projectAssetsDirectoryPath = null;

            // get the project base URL e.g. /wise/curriculum/3/
            var projectBaseURL = this.getConfigParam('projectBaseURL');

            if (projectBaseURL != null) {
                if (includeHost) {
                    // get the host e.g. http://wise.berkeley.edu
                    var host = window.location.origin;

                    /*
                     * get the full path including the host
                     * e.g. http://wise.berkeley.edu/wise/curriculum/3/assets
                     */
                    projectAssetsDirectoryPath = host + projectBaseURL + 'assets';
                } else {
                    /*
                     * get the full path not including the host
                     * e.g. /wise/curriculum/3/assets
                     */
                    projectAssetsDirectoryPath = projectBaseURL + 'assets';
                }
            }

            return projectAssetsDirectoryPath;
        }

        /**
         * Remove the absolute asset paths
         * e.g.
         * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
         * will be changed to
         * <img src='sun.png'/>
         * @param html the html
         * @return the modified html without the absolute asset paths
         */

    }, {
        key: 'removeAbsoluteAssetPaths',
        value: function removeAbsoluteAssetPaths(html) {
            /*
             * get the assets directory path with the host
             * e.g.
             * https://wise.berkeley.edu/wise/curriculum/3/assets/
             */
            var includeHost = true;
            var assetsDirectoryPathIncludingHost = this.getProjectAssetsDirectoryPath(includeHost);
            var assetsDirectoryPathIncludingHostRegEx = new RegExp(assetsDirectoryPathIncludingHost, 'g');

            /*
             * get the assets directory path without the host
             * e.g.
             * /wise/curriculum/3/assets/
             */
            var assetsDirectoryPathNotIncludingHost = this.getProjectAssetsDirectoryPath() + '/';
            var assetsDirectoryPathNotIncludingHostRegEx = new RegExp(assetsDirectoryPathNotIncludingHost, 'g');

            /*
             * remove the directory path from the html so that only the file name
             * remains in asset references
             * e.g.
             * <img src='https://wise.berkeley.edu/wise/curriculum/3/assets/sun.png'/>
             * will be changed to
             * <img src='sun.png'/>
             */
            html = html.replace(assetsDirectoryPathIncludingHostRegEx, '');
            html = html.replace(assetsDirectoryPathNotIncludingHostRegEx, '');

            return html;
        }

        /**
         * Get the WISE IDs for a workgroup
         * @param workgroupId get the WISE IDs for this workgroup
         * @return an array of WISE IDs
         */

    }, {
        key: 'getWISEIds',
        value: function getWISEIds(workgroupId) {

            var wiseIds = [];

            if (workgroupId != null) {
                // get the user info object for the workgroup id
                var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

                if (userInfo != null) {
                    // get the WISE IDs
                    wiseIds = userInfo.userIds;
                }
            }

            return wiseIds;
        }
    }]);

    return ConfigService;
}();

;

ConfigService.$inject = ['$filter', '$http', '$location'];

exports.default = ConfigService;
//# sourceMappingURL=configService.js.map