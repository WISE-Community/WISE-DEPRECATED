'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentProgressController = function () {
    function StudentProgressController($rootScope, $scope, $state, ConfigService, ProjectService, StudentStatusService, TeacherDataService, TeacherWebSocketService) {
        var _this = this;

        _classCallCheck(this, StudentProgressController);

        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;

        this.teacherWorkgroupId = this.ConfigService.getWorkgroupId();

        var startNodeId = this.ProjectService.getStartNodeId();
        this.rootNodeId = this.ProjectService.getRootNode(startNodeId).id;

        // get the current sort order
        this.sort = this.TeacherDataService.studentProgressSort;

        // initialize the current workgroup
        this.TeacherDataService.setCurrentWorkgroup(null);

        // get the teacher permissions
        this.permissions = this.ConfigService.getPermissions();

        this.studentsOnline = this.TeacherWebSocketService.getStudentsOnline();

        this.students = [];
        this.initializeStudents();

        this.periods = [];

        // create an option for all periods
        var allPeriodOption = {
            periodId: -1,
            periodName: 'All'
        };

        this.periods.push(allPeriodOption);

        this.periods = this.periods.concat(this.ConfigService.getPeriods());

        // set the current period if it hasn't been set yet
        if (this.getCurrentPeriod() == null) {
            if (this.periods != null && this.periods.length > 0) {
                // set it to the all periods option
                this.setCurrentPeriod(this.periods[0]);
            }
        }

        // listen for the studentsOnlineReceived event
        this.$rootScope.$on('studentsOnlineReceived', function (event, args) {
            _this.studentsOnline = args.studentsOnline;

            // update the students
            _this.initializeStudents();
        });

        // listen for the studentStatusReceived event
        this.$rootScope.$on('studentStatusReceived', function (event, args) {
            // get the workgroup id
            var studentStatus = args.studentStatus;
            var workgroupId = studentStatus.workgroupId;

            // update the time spent for the workgroup
            _this.updateTimeSpentForWorkgroupId(workgroupId);

            // update students in the workgroup
            _this.updateStudents(workgroupId);
        });

        // listen for the studentDisconnected event
        this.$rootScope.$on('studentDisconnected', function (event, args) {
            var data = args.data;
            var workgroupId = data.workgroupId;

            var studentsOnline = _this.studentsOnline;

            var indexOfWorkgroupId = studentsOnline.indexOf(workgroupId);

            if (indexOfWorkgroupId != -1) {
                // remove the workgroup from the students online list
                studentsOnline.splice(indexOfWorkgroupId, 1);

                // update students in the workgroup
                _this.updateStudents(workgroupId);
            }
        });

        // listen for the currentWorkgroupChanged event
        this.$scope.$on('currentWorkgroupChanged', function (event, args) {
            _this.currentWorkgroup = args.currentWorkgroup;
        });

        // how often to update the time spent values in the view
        this.updateTimeSpentInterval = 10000;

        // mapping of workgroup id to time spent
        this.studentTimeSpent = {};

        // update the time spent values in the view
        this.updateTimeSpent();

        // update the time spent values every x seconds
        this.updateTimeSpentIntervalId = setInterval(function () {
            // update the time spent values in the view
            _this.updateTimeSpent();

            // refresh the view
            _this.$scope.$apply();
        }, this.updateTimeSpentInterval);

        // save event when student progress view is displayed
        var context = "ClassroomMonitor",
            nodeId = null,
            componentId = null,
            componentType = null,
            category = "Navigation",
            event = "studentProgressViewDisplayed",
            data = {};
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }

    _createClass(StudentProgressController, [{
        key: 'getCurrentNodeForWorkgroupId',
        value: function getCurrentNodeForWorkgroupId(workgroupId) {
            return this.StudentStatusService.getCurrentNodePositionAndNodeTitleForWorkgroupId(workgroupId);
        }
    }, {
        key: 'getStudentProjectCompletion',
        value: function getStudentProjectCompletion(workgroupId) {
            // get project completion data for the given workgroup (only include nodes with student work)
            return this.StudentStatusService.getStudentProjectCompletion(workgroupId, true);
        }
    }, {
        key: 'isWorkgroupOnline',
        value: function isWorkgroupOnline(workgroupId) {
            return this.studentsOnline.indexOf(workgroupId) != -1;
        }
    }, {
        key: 'isWorkgroupShown',
        value: function isWorkgroupShown(workgroup) {
            var show = false;

            var currentPeriod = this.getCurrentPeriod().periodId;

            if (currentPeriod === -1 || workgroup.periodId === this.getCurrentPeriod().periodId) {
                if (this.currentWorkgroup) {
                    if (workgroup.displayNames === this.currentWorkgroup.displayNames) {
                        show = true;
                    }
                } else {
                    show = true;
                }
            }

            return show;
        }

        /**
         * Set the current period
         * @param period the period object
         */

    }, {
        key: 'setCurrentPeriod',
        value: function setCurrentPeriod(period) {
            this.TeacherDataService.setCurrentPeriod(period);
            this.$rootScope.$broadcast('periodChanged', { period: period });
        }
    }, {
        key: 'getCurrentPeriod',


        /**
         * Get the current period
         */
        value: function getCurrentPeriod() {
            return this.TeacherDataService.getCurrentPeriod();
        }
    }, {
        key: 'getStudentTotalScore',
        value: function getStudentTotalScore(workgroupId) {
            return this.TeacherDataService.getTotalScoreByWorkgroupId(workgroupId);
        }

        /**
         * Get the time spent for a workgroup
         */

    }, {
        key: 'getStudentTimeSpent',
        value: function getStudentTimeSpent(workgroupId) {
            var timeSpent = null;

            if (this.studentTimeSpent) {
                timeSpent = this.studentTimeSpent[workgroupId];
            }

            return timeSpent;
        }

        /**
         * Update the time spent values in the view
         */

    }, {
        key: 'updateTimeSpent',
        value: function updateTimeSpent() {
            var studentsOnline = this.studentsOnline;

            if (studentsOnline != null) {

                // loop through all the workgroups that are online
                for (var s = 0; s < studentsOnline.length; s++) {
                    var workgroupId = studentsOnline[s];

                    if (workgroupId != null) {
                        // update the time spent for the workgroup
                        this.updateTimeSpentForWorkgroupId(workgroupId);
                    }
                }
            }
        }

        /**
         * Update the time spent for the workgroup
         * @workgroupId the workgroup id
         */

    }, {
        key: 'updateTimeSpentForWorkgroupId',
        value: function updateTimeSpentForWorkgroupId(workgroupId) {

            if (workgroupId != null) {
                // get the current client timestamp
                var currentClientTimestamp = new Date().getTime();

                // get the student status
                var studentStatus = this.StudentStatusService.getStudentStatusForWorkgroupId(workgroupId);

                if (studentStatus != null) {

                    // get the time the student status was posted to the server
                    var postTimestamp = studentStatus.postTimestamp;

                    /*
                     * convert the current client timestamp to a server timestamp
                     * this is requied in cases where the client and server clocks
                     * are not synchronized
                     */
                    var currentServerTimestamp = this.ConfigService.convertToServerTimestamp(currentClientTimestamp);

                    // get the amount of time the student has been on the step
                    var timeSpent = currentServerTimestamp - postTimestamp;

                    // get the total amount of seconds the student has been on the step
                    var totalSeconds = Math.floor(timeSpent / 1000);

                    // get the hours, minutes, and seconds
                    var hours = Math.floor(totalSeconds % 86400 / 3600);
                    var minutes = Math.floor(totalSeconds % 86400 % 3600 / 60);
                    var seconds = totalSeconds % 60;

                    if (hours < 0) {
                        hours = 0;
                    }

                    if (minutes < 0) {
                        minutes = 0;
                    }

                    if (seconds < 0) {
                        seconds = 0;
                    }

                    var timeSpentText = '';

                    if (hours > 0) {
                        timeSpentText += hours + ':';
                    }

                    if (hours > 0) {
                        // there are hours

                        if (minutes == 0) {
                            // fill with zeroes
                            timeSpentText += '00:';
                        } else if (minutes > 0 && minutes < 10) {
                            // add a leading zero
                            timeSpentText += '0' + minutes + ':';
                        } else {
                            timeSpentText += minutes + ':';
                        }
                    } else {
                        // there are no hours

                        timeSpentText += minutes + ':';
                    }

                    if (seconds == 0) {
                        // fill with zeroes
                        timeSpentText += '00';
                    } else if (seconds > 0 && seconds < 10) {
                        // add a leading zero
                        timeSpentText += '0' + seconds;
                    } else {
                        timeSpentText += seconds;
                    }

                    // update the mapping of workgroup id to time spent
                    //this.studentTimeSpent[workgroupId] = timeSpentText;

                    // update the timeSpent for the students with the matching workgroupID
                    for (var i = 0; i < this.students.length; i++) {
                        var student = this.students[i];
                        var id = student.workgroupId;

                        if (workgroupId === id) {
                            student.timeSpent = timeSpentText;
                        }
                    }
                }
            }
        }

        /**
         * Set up the array of students in the run. Split workgroups into
         * individual student objects.
         */

    }, {
        key: 'initializeStudents',
        value: function initializeStudents() {
            var students = [];

            // get the workgroups
            var workgroups = this.ConfigService.getClassmateUserInfos();

            // loop through all the workgroups
            for (var x = 0; x < workgroups.length; x++) {
                var workgroup = workgroups[x];

                if (workgroup != null) {
                    var workgroupId = workgroup.workgroupId;
                    var isOnline = this.isWorkgroupOnline(workgroupId);

                    var userName = workgroup.userName;
                    var displayNames = this.ConfigService.getDisplayUserNamesByWorkgroupId(workgroupId).split(', ');
                    var userIds = workgroup.userIds;

                    for (var i = 0; i < userIds.length; i++) {
                        var id = userIds[i];
                        var displayName = '';

                        if (this.permissions.canViewStudentNames) {
                            // put user display name in 'lastName, firstName' order
                            var names = displayNames[i].split(' ');
                            displayName = names[1] + ', ' + names[0];
                        } else {
                            displayName = id;
                        }

                        var user = {
                            userId: id,
                            periodId: workgroup.periodId,
                            periodName: workgroup.periodName,
                            workgroupId: workgroup.workgroupId,
                            displayNames: displayName,
                            userName: displayName,
                            online: isOnline,
                            location: this.getCurrentNodeForWorkgroupId(workgroup.workgroupId),
                            timeSpent: this.getStudentTimeSpent(workgroup.workgroupId),
                            completion: this.getStudentProjectCompletion(workgroup.workgroupId),
                            score: this.getStudentTotalScore(workgroup.workgroupId),
                            maxScore: this.StudentStatusService.getMaxScoreForWorkgroupId(workgroup.workgroupId)
                        };
                        students.push(user);
                    }
                }
            }

            this.students = students;
        }

        /**
         * Update student progress data for students with the given workgroup id
         * @param workgroupId
         */

    }, {
        key: 'updateStudents',
        value: function updateStudents(workgroupId) {
            var isOnline = this.isWorkgroupOnline(workgroupId);
            var location = this.getCurrentNodeForWorkgroupId(workgroupId);
            var timeSpent = this.getStudentTimeSpent(workgroupId);
            var completion = this.getStudentProjectCompletion(workgroupId);
            var score = this.getStudentTotalScore(workgroupId);
            var maxScore = this.StudentStatusService.getMaxScoreForWorkgroupId(workgroupId);

            for (var i = 0; i < this.students.length; i++) {
                var student = this.students[i];

                if (student.workgroupId === workgroupId) {
                    student.isOnline = isOnline;
                    student.location = location;
                    student.timeSpent = timeSpent;
                    student.completion = completion;
                    student.score = score;
                    student.maxScore = maxScore;
                }
            }
        }
    }, {
        key: 'showStudentGradingView',
        value: function showStudentGradingView(workgroup) {
            this.$state.go('root.studentGrading', { workgroupId: workgroup.workgroupId });
        }
    }, {
        key: 'setSort',
        value: function setSort(value) {
            if (this.sort === value) {
                this.sort = '-' + value;
            } else {
                this.sort = value;
            }

            // update value in the teacher data service so we can persist across views
            this.TeacherDataService.nodeGradingSort = this.sort;
        }
    }, {
        key: 'getOrderBy',
        value: function getOrderBy() {
            var orderBy = [];

            switch (this.sort) {
                case 'team':
                    orderBy = ['workgroupId', 'userName'];
                    break;
                case '-team':
                    orderBy = ['-workgroupId', 'userName'];
                    break;
                case 'student':
                    orderBy = ['userName', 'workgroupId'];
                    break;
                case '-student':
                    orderBy = ['-userName', 'workgroupId'];
                    break;
                case 'score':
                    orderBy = ['score', 'userName'];
                    break;
                case '-score':
                    orderBy = ['-score', 'userName'];
                    break;
                case 'completion':
                    orderBy = ['completion', 'userName'];
                    break;
                case '-completion':
                    orderBy = ['-completion', 'userName'];
                    break;
                case 'location':
                    orderBy = ['location', 'userName'];
                    break;
                case '-location':
                    orderBy = ['-location', 'userName'];
                    break;
                case 'time':
                    orderBy = ['-online', '-timeSpent', 'userName'];
                    break;
                case '-time':
                    orderBy = ['-online', 'timeSpent', 'userName'];
                    break;
                case 'online':
                    orderBy = ['online', 'userName'];
                    break;
                case '-online':
                    orderBy = ['-online', 'userName'];
                    break;
            }

            return orderBy;
        }
    }]);

    return StudentProgressController;
}();

StudentProgressController.$inject = ['$rootScope', '$scope', '$state', 'ConfigService', 'ProjectService', 'StudentStatusService', 'TeacherDataService', 'TeacherWebSocketService'];

exports.default = StudentProgressController;
//# sourceMappingURL=studentProgressController.js.map
