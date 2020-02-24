'use strict';

class StudentProgressController {

    constructor($rootScope,
                $scope,
                $state,
                ConfigService,
                ProjectService,
                StudentStatusService,
                TeacherDataService,
                TeacherWebSocketService) {
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;

        this.teacherWorkgroupId = this.ConfigService.getWorkgroupId();

        // get the current sort order
        this.sort = this.TeacherDataService.studentProgressSort;

        // initialize the current workgroup to null
        this.TeacherDataService.setCurrentWorkgroup(null);

        // get the teacher permissions
        this.permissions = this.ConfigService.getPermissions();

        this.studentsOnline = this.TeacherWebSocketService.getStudentsOnline();
        this.students = [];
        this.initializeStudents();

        // listen for the studentsOnlineReceived event
        this.$rootScope.$on('studentsOnlineReceived', (event, args) => {
            this.studentsOnline = args.studentsOnline;

            // update the students
            this.initializeStudents();
        });

        // listen for the studentStatusReceived event
        this.$rootScope.$on('studentStatusReceived', (event, args) => {
            // get the workgroup id
            let studentStatus = args.studentStatus;
            let workgroupId = studentStatus.workgroupId;

            // update the time spent for the workgroup
            this.updateTimeSpentForWorkgroupId(workgroupId);

            // update team data
            this.updateTeam(workgroupId);
        });

        // listen for the studentDisconnected event
        this.$rootScope.$on('studentDisconnected', (event, args) => {
            var data = args.data;
            var workgroupId = data.workgroupId;

            var studentsOnline = this.studentsOnline;

            var indexOfWorkgroupId = studentsOnline.indexOf(workgroupId);

            if (indexOfWorkgroupId != -1) {
                // remove the workgroup from the students online list
                studentsOnline.splice(indexOfWorkgroupId, 1);

                // update team data
                this.updateTeam(workgroupId);
            }
        });

        // listen for the currentWorkgroupChanged event
        this.$scope.$on('currentWorkgroupChanged', (event, args) => {
            this.currentWorkgroup = args.currentWorkgroup;
        });

        // how often to update the time spent values in the view
        this.updateTimeSpentInterval = 10000;

        // mapping of workgroup id to time spent
        this.studentTimeSpent = {};

        // update the time spent values in the view
        this.updateTimeSpent();

        // update the time spent values every x seconds
        this.updateTimeSpentIntervalId = setInterval(() => {
            // update the time spent values in the view
            this.updateTimeSpent();

            // refresh the view
            this.$scope.$apply();
        }, this.updateTimeSpentInterval);

        // save event when student progress view is displayed
        let context = "ClassroomMonitor", nodeId = null, componentId = null, componentType = null,
            category = "Navigation", event = "studentProgressViewDisplayed", data = {};
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }

    getCurrentNodeForWorkgroupId(workgroupId) {
        return this.StudentStatusService.getCurrentNodePositionAndNodeTitleForWorkgroupId(workgroupId);
    };

    /**
     * Get project completion data for the given workgroup (only include nodes
     * with student work)
     * @param workgroupId the workgroup id
     * @return object with completed, total, and percent completed (integer
     * between 0 and 100)
     */
    getStudentProjectCompletion(workgroupId) {
        return this.StudentStatusService.getStudentProjectCompletion(workgroupId, true);
    };

    isWorkgroupOnline(workgroupId) {
        return this.studentsOnline.indexOf(workgroupId) != -1;
    };

    isWorkgroupShown(workgroup) {
        let show = false;

        let currentPeriod = this.TeacherDataService.getCurrentPeriod().periodId;

        if (currentPeriod === -1 || workgroup.periodId === currentPeriod) {
            if (this.currentWorkgroup) {
                if (workgroup.workgroupId === this.currentWorkgroup.workgroupId) {
                    show = true;
                }
            } else {
                show = true;
            }
        }

        return show;
    }

    getStudentTotalScore(workgroupId) {
        return this.TeacherDataService.getTotalScoreByWorkgroupId(workgroupId);
    }

    /**
     * Get the time spent for a workgroup
     */
    getStudentTimeSpent(workgroupId) {
        let timeSpent = null;

        if (this.studentTimeSpent) {
            timeSpent = this.studentTimeSpent[workgroupId];
        }

        return timeSpent;
    }

    /**
     * Update the time spent values in the view
     */
    updateTimeSpent() {
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
    updateTimeSpentForWorkgroupId(workgroupId) {

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
                var hours = Math.floor((totalSeconds % 86400) / 3600);
                var minutes = Math.floor(((totalSeconds % 86400) % 3600) / 60);
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
                    timeSpentText += (hours + ':');
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
                    timeSpentText += ('0' + seconds);
                } else {
                    timeSpentText += seconds;
                }

                // update the mapping of workgroup id to time spent
                //this.studentTimeSpent[workgroupId] = timeSpentText;

                // update the timeSpent for the team with the matching workgroupID
                for (let i = 0; i < this.teams.length; i++) {
                    let team = this.teams[i];
                    let id = team.workgroupId;

                    if (workgroupId === id) {
                        team.timeSpent = timeSpentText;
                    }
                }
            }
        }
    }

    /**
     * Set up the array of workgroups in the run
     */
    initializeStudents() {
        this.teams = [];

        // get the workgroups
        let workgroups = this.ConfigService.getClassmateUserInfos();

        // loop through all the workgroups
        for (let x = 0; x < workgroups.length; x++) {
            let workgroup = workgroups[x];

            if (workgroup != null) {
                let workgroupId = workgroup.workgroupId;
                let username = workgroup.username;
                let displayNames = this.ConfigService.getDisplayUsernamesByWorkgroupId(workgroupId);
                let team = {
                    periodId: workgroup.periodId,
                    periodName: workgroup.periodName,
                    workgroupId: workgroupId,
                    username: displayNames
                };
                this.teams.push(team);
                this.updateTeam(workgroupId);
            }
        }
    }

    /**
     * Update data for team with the given workgroup id
     * @param workgroupId
     */
    updateTeam(workgroupId) {
        let isOnline = this.isWorkgroupOnline(workgroupId);
        let location = this.getCurrentNodeForWorkgroupId(workgroupId);
        let timeSpent = this.getStudentTimeSpent(workgroupId);
        let completion = this.getStudentProjectCompletion(workgroupId);
        let score = this.getStudentTotalScore(workgroupId);
        let maxScore = this.StudentStatusService.getMaxScoreForWorkgroupId(workgroupId);
        maxScore = maxScore ? maxScore : 0;

        for (let i = 0; i < this.teams.length; i++) {
            let team = this.teams[i];

            if (team.workgroupId === workgroupId) {
                team.isOnline = isOnline;
                team.location = location;
                team.timeSpent = timeSpent;
                team.completion = completion;
                team.score = score;
                team.maxScore = maxScore;
                team.scorePct = maxScore ? (score/maxScore) : score;
            }
        }
    }

    showStudentGradingView(workgroup) {
        this.$state.go('root.team', {workgroupId: workgroup.workgroupId});
    }

    setSort(value) {
        if (this.sort === value) {
            this.sort = '-' + value;
        } else {
            this.sort = value;
        }

        // update value in the teacher data service so we can persist across views
        this.TeacherDataService.studentProgressSort = this.sort;
    }

    getOrderBy() {
        let orderBy = [];

        switch (this.sort) {
            case 'team':
                orderBy = ['workgroupId', 'username'];
                break;
            case '-team':
                orderBy = ['-workgroupId', 'username'];
                break;
            case 'student':
                orderBy = ['username', 'workgroupId'];
                break;
            case '-student':
                orderBy = ['-username', 'workgroupId'];
                break;
            case 'score':
                orderBy = ['scorePct', 'username'];
                break;
            case '-score':
                orderBy = ['-scorePct', 'username'];
                break;
            case 'completion':
                orderBy = ['completion.completionPct', 'username'];
                break;
            case '-completion':
                orderBy = ['-completion.completionPct', 'username'];
                break;
            case 'location':
                orderBy = ['location', 'username'];
                break;
            case '-location':
                orderBy = ['-location', 'username'];
                break;
            case 'time':
                orderBy = ['-online', '-timeSpent', 'username'];
                break;
            case '-time':
                orderBy = ['-online', 'timeSpent', 'username'];
                break;
            case 'online':
                orderBy = ['online', 'username'];
                break;
            case '-online':
                orderBy = ['-online', 'username'];
                break;
        }

        return orderBy;
    }
}

StudentProgressController.$inject = [
    '$rootScope',
    '$scope',
    '$state',
    'ConfigService',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService',
    'TeacherWebSocketService'
];

export default StudentProgressController;
