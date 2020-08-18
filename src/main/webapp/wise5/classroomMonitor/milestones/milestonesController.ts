'use strict';

import * as angular from 'angular';
import { AchievementService } from '../../services/achievementService';
import { MilestoneService } from '../../services/milestoneService';

class MilestonesController {
  $translate: any;
  milestones: any[];
  static $inject = [
    '$filter',
    '$mdDialog',
    '$rootScope',
    '$scope',
    'AchievementService',
    'MilestoneService',
    'moment'
  ];
  constructor(
    private $filter: any,
    private $mdDialog: any,
    private $rootScope: any,
    private $scope: any,
    private AchievementService: AchievementService,
    private MilestoneService: MilestoneService,
    private moment: any
  ) {
    this.$translate = this.$filter('translate');
    this.loadProjectMilestones();

    this.$rootScope.$on('newStudentAchievement', (event, args) => {
      if (args) {
        const studentAchievement = args.studentAchievement;
        this.AchievementService.addOrUpdateStudentAchievement(studentAchievement);
        this.updateMilestoneStatus(studentAchievement.achievementId);
      }
    });

    this.$scope.$on('currentPeriodChanged', () => {
      for (let milestone of this.milestones) {
        this.updateMilestoneStatus(milestone.id);
      }
    });

    this.$scope.$on('annotationReceived', (event, args) => {
      for (const milestone of this.milestones) {
        if (
          milestone.nodeId === args.annotation.nodeId &&
          milestone.componentId === args.annotation.componentId
        ) {
          this.updateMilestoneStatus(milestone.id);
        }
      }
    });

    this.$scope.$on('milestoneSaved', () => {
      this.loadProjectMilestones();
    });

    this.$scope.$on('milestoneDeleted', () => {
      this.loadProjectMilestones();
    });
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
