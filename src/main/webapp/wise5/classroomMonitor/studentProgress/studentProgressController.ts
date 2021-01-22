'use strict';

import { Directive } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../services/configService';
import { StudentStatusService } from '../../services/studentStatusService';
import { TeacherDataService } from '../../services/teacherDataService';
import { TeacherWebSocketService } from '../../services/teacherWebSocketService';

@Directive()
class StudentProgressController {
  currentWorkgroup: any;
  permissions: any;
  sort: any;
  sortOrder: object = {
    team: ['workgroupId', 'username'],
    '-team': ['-workgroupId', 'username'],
    student: ['username', 'workgroupId'],
    '-student': ['-username', 'workgroupId'],
    score: ['scorePct', 'username'],
    '-score': ['-scorePct', 'username'],
    completion: ['completion.completionPct', 'username'],
    '-completion': ['-completion.completionPct', 'username'],
    location: ['location', 'username'],
    '-location': ['-location', 'username']
  };
  students: any;
  teacherWorkgroupId: number;
  teams: any;
  studentStatusReceivedSubscription: Subscription;
  currentWorkgroupChangedSubscription: Subscription;

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
    this.students = [];
    this.initializeStudents();
    this.studentStatusReceivedSubscription = this.StudentStatusService.studentStatusReceived$.subscribe(
      (args) => {
        const studentStatus = args.studentStatus;
        const workgroupId = studentStatus.workgroupId;
        this.updateTeam(workgroupId);
      }
    );
    this.currentWorkgroupChangedSubscription = this.TeacherDataService.currentWorkgroupChanged$.subscribe(
      ({ currentWorkgroup }) => {
        this.currentWorkgroup = currentWorkgroup;
      }
    );
    const context = 'ClassroomMonitor',
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
    this.$scope.$on('$destroy', () => {
      this.ngOnDestroy();
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.studentStatusReceivedSubscription.unsubscribe();
    this.currentWorkgroupChangedSubscription.unsubscribe();
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

  isWorkgroupShown(workgroup) {
    return this.TeacherDataService.isWorkgroupShown(workgroup);
  }

  getStudentTotalScore(workgroupId) {
    return this.TeacherDataService.getTotalScoreByWorkgroupId(workgroupId);
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
    let location = this.getCurrentNodeForWorkgroupId(workgroupId);
    let completion = this.getStudentProjectCompletion(workgroupId);
    let score = this.getStudentTotalScore(workgroupId);
    let maxScore = this.StudentStatusService.getMaxScoreForWorkgroupId(workgroupId);
    maxScore = maxScore ? maxScore : 0;

    for (let i = 0; i < this.teams.length; i++) {
      let team = this.teams[i];

      if (team.workgroupId === workgroupId) {
        team.location = location;
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
