'use strict';

import { ConfigService } from '../../services/configService';
import { StudentStatusService } from '../../services/studentStatusService';
import { TeacherDataService } from '../../services/teacherDataService';
import { TeacherWebSocketService } from '../../services/teacherWebSocketService';

class StudentProgressController {
  currentWorkgroup: any;
  permissions: any;
  sort: any;
  sortOrder: object = {
    'team': ['workgroupId', 'username'],
    '-team': ['-workgroupId', 'username'],
    'student': ['username', 'workgroupId'],
    '-student': ['-username', 'workgroupId'],
    'score': ['scorePct', 'username'],
    '-score': ['-scorePct', 'username'],
    'completion': ['completion.completionPct', 'username'],
    '-completion': ['-completion.completionPct', 'username'],
    'location': ['location', 'username'],
    '-location': ['-location', 'username'],
    'time': ['-online', '-timeSpent', 'username'],
    '-time': ['-online', 'timeSpent', 'username'],
    'online': ['online', 'username'],
    '-online': ['-online', 'username']
  };
  students: any;
  studentsOnline: any;
  studentTimeSpent: any;
  teacherWorkgroupId: number;
  teams: any;
  updateTimeSpentInterval: any;
  updateTimeSpentIntervalId: any;

  static $inject = [
    '$rootScope',
    '$scope',
    '$state',
    'ConfigService',
    'StudentStatusService',
    'TeacherDataService',
    'TeacherWebSocketService'
  ];

  constructor(
    private $rootScope: any,
    private $scope: any,
    private $state: any,
    private ConfigService: ConfigService,
    private StudentStatusService: StudentStatusService,
    private TeacherDataService: TeacherDataService,
    private TeacherWebSocketService: TeacherWebSocketService
  ) {
    this.teacherWorkgroupId = this.ConfigService.getWorkgroupId();
    this.sort = this.TeacherDataService.studentProgressSort;
    this.permissions = this.ConfigService.getPermissions();
    this.studentsOnline = this.TeacherWebSocketService.getStudentsOnline();
    this.students = [];
    this.initializeStudents();
    this.$rootScope.$on('studentStatusReceived', (event, args) => {
      let studentStatus = args.studentStatus;
      let workgroupId = studentStatus.workgroupId;
      this.updateTimeSpentForWorkgroupId(workgroupId);
      this.updateTeam(workgroupId);
    });
    this.$scope.$on('currentWorkgroupChanged', (event, args) => {
      this.currentWorkgroup = args.currentWorkgroup;
    });
    this.updateTimeSpentInterval = 10000;
    this.studentTimeSpent = {};
    this.updateTimeSpent();
    this.updateTimeSpentIntervalId = setInterval(() => {
      this.updateTimeSpent();
      this.$scope.$apply();
    }, this.updateTimeSpentInterval);
    let context = 'ClassroomMonitor',
      nodeId = null,
      componentId = null,
      componentType = null,
      category = 'Navigation',
      event = 'studentProgressViewDisplayed',
      data = {};
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      event,
      data
    );
  }

  getCurrentNodeForWorkgroupId(workgroupId) {
    return this.StudentStatusService.getCurrentNodePositionAndNodeTitleForWorkgroupId(workgroupId);
  }

  /**
   * Get project completion data for the given workgroup (only include nodes
   * with student work)
   * @param workgroupId the workgroup id
   * @return object with completed, total, and percent completed (integer
   * between 0 and 100)
   */
  getStudentProjectCompletion(workgroupId) {
    return this.StudentStatusService.getStudentProjectCompletion(workgroupId, true);
  }

  isWorkgroupOnline(workgroupId) {
    return this.studentsOnline.indexOf(workgroupId) != -1;
  }

  isWorkgroupShown(workgroup) {
    return this.TeacherDataService.isWorkgroupShown(workgroup);
  }

  getStudentTotalScore(workgroupId) {
    return this.TeacherDataService.getTotalScoreByWorkgroupId(workgroupId);
  }

  getStudentTimeSpent(workgroupId) {
    let timeSpent = null;
    if (this.studentTimeSpent) {
      timeSpent = this.studentTimeSpent[workgroupId];
    }
    return timeSpent;
  }

  updateTimeSpent() {
    var studentsOnline = this.studentsOnline;
    if (studentsOnline != null) {
      for (var s = 0; s < studentsOnline.length; s++) {
        var workgroupId = studentsOnline[s];
        if (workgroupId != null) {
          this.updateTimeSpentForWorkgroupId(workgroupId);
        }
      }
    }
  }

  updateTimeSpentForWorkgroupId(workgroupId) {
    if (workgroupId != null) {
      var currentClientTimestamp = new Date().getTime();
      var studentStatus = this.StudentStatusService.getStudentStatusForWorkgroupId(workgroupId);
      if (studentStatus != null) {
        var postTimestamp = studentStatus.postTimestamp;
        /*
         * convert the current client timestamp to a server timestamp
         * this is requied in cases where the client and server clocks
         * are not synchronized
         */
        var currentServerTimestamp = this.ConfigService.convertToServerTimestamp(
          currentClientTimestamp
        );
        var timeSpent = currentServerTimestamp - postTimestamp;
        var totalSeconds = Math.floor(timeSpent / 1000);
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
          timeSpentText += hours + ':';
        }

        if (hours > 0) {
          if (minutes == 0) {
            timeSpentText += '00:';
          } else if (minutes > 0 && minutes < 10) {
            timeSpentText += '0' + minutes + ':';
          } else {
            timeSpentText += minutes + ':';
          }
        } else {
          timeSpentText += minutes + ':';
        }

        if (seconds == 0) {
          timeSpentText += '00';
        } else if (seconds > 0 && seconds < 10) {
          timeSpentText += '0' + seconds;
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

  initializeStudents() {
    this.teams = [];
    let workgroups = this.ConfigService.getClassmateUserInfos();
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
        team.scorePct = maxScore ? score / maxScore : score;
      }
    }
  }

  showStudentGradingView(workgroup) {
    this.$state.go('root.cm.team', { workgroupId: workgroup.workgroupId });
  }

  setSort(value) {
    if (this.sort === value) {
      this.sort = `-${value}`;
    } else {
      this.sort = value;
    }
    this.TeacherDataService.studentProgressSort = this.sort;
  }

  getOrderBy() {
    return this.sortOrder[this.sort];
  }
}

export default StudentProgressController;
