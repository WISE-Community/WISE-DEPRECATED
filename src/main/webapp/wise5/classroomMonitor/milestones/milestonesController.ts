'use strict';

import { Directive } from '@angular/core';
import * as angular from 'angular';
import { AchievementService } from '../../services/achievementService';
import { AnnotationService } from '../../services/annotationService';
import { MilestoneService } from '../../services/milestoneService';
import { TeacherDataService } from '../../services/teacherDataService';

@Directive()
class MilestonesController {
  $translate: any;
  milestones: any[];
  annotationReceivedSubscription: any;
  currentPeriodChangedSubscription: any;
  newStudentAchievementSubscription: any;
  static $inject = [
    '$filter',
    '$mdDialog',
    '$rootScope',
    '$scope',
    'AchievementService',
    'AnnotationService',
    'MilestoneService',
    'TeacherDataService',
    'moment'
  ];
  constructor(
    private $filter: any,
    private $mdDialog: any,
    private $rootScope: any,
    private $scope: any,
    private AchievementService: AchievementService,
    private AnnotationService: AnnotationService,
    private MilestoneService: MilestoneService,
    private TeacherDataService: TeacherDataService,
    private moment: any
  ) {
    this.$translate = this.$filter('translate');
    this.loadProjectMilestones();

    this.newStudentAchievementSubscription = 
        this.AchievementService.newStudentAchievement$.subscribe((args: any) => {
      const studentAchievement = args.studentAchievement;
      this.AchievementService.addOrUpdateStudentAchievement(studentAchievement);
      this.updateMilestoneStatus(studentAchievement.achievementId);
    });

    this.currentPeriodChangedSubscription = this.TeacherDataService.currentPeriodChanged$
        .subscribe(() => {
      for (let milestone of this.milestones) {
        this.updateMilestoneStatus(milestone.id);
      }
    });

    this.annotationReceivedSubscription = 
        this.AnnotationService.annotationReceived$.subscribe(({ annotation }) => {
      for (const milestone of this.milestones) {
        if (
          milestone.nodeId === annotation.nodeId &&
          milestone.componentId === annotation.componentId
        ) {
          this.updateMilestoneStatus(milestone.id);
        }
      }
    });

    this.$scope.$on('$destroy', () => {
      this.ngOnDestroy();
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.annotationReceivedSubscription.unsubscribe();
    this.currentPeriodChangedSubscription.unsubscribe();
    this.newStudentAchievementSubscription.unsubscribe();
  }

  loadProjectMilestones() {
    this.milestones = this.MilestoneService.getProjectMilestones();
    for (let milestone of this.milestones) {
      milestone = this.MilestoneService.getProjectMilestoneStatus(milestone.id);
    }
  }

  updateMilestoneStatus(milestoneId) {
    let milestone = this.getProjectMilestoneById(milestoneId);
    milestone = this.MilestoneService.getProjectMilestoneStatus(milestoneId);
  }

  getProjectMilestoneById(milestoneId) {
    for (let milestone of this.milestones) {
      if (milestone.id === milestoneId) {
        return milestone;
      }
    }
    return {};
  }

  /**
   * Check if the given milestone date is before the current day (and
   * milestone completion is less than 100%)
   * @param date a date string or object
   * @param percentageCompleted Number percent completed
   * @return Boolean whether given date is before today
   */
  isBeforeDay(date, percentageCompleted) {
    let result = false;
    if (date && percentageCompleted < 100) {
      result = this.moment(date).isBefore(this.moment(), 'day');
    }
    return result;
  }

  /**
   * Check if the given milestone date is the same as the current day (and
   * milestone completion is less than 100%)
   * @param date a date string or object
   * @param percentageCompleted Number percent completed
   * @return Boolean whether given date is before today
   */
  isSameDay(date, percentageCompleted) {
    let result = false;
    if (date && percentageCompleted < 100) {
      result = this.moment(date).isSame(this.moment(), 'day');
    }
    return result;
  }

  showMilestoneDetails(milestone, $event) {
    this.MilestoneService.showMilestoneDetails(milestone, $event);
  }
}

export default MilestonesController;
