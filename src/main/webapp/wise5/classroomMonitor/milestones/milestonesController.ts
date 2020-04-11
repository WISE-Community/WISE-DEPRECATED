'use strict';

import AchievementService from '../../services/achievementService';
import MilestoneService from '../../services/milestoneService';
import * as angular from 'angular';

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
        this.updateMilestoneStatus(studentAchievement.id);
      }
    });

    this.$scope.$on('currentPeriodChanged', (event, args) => {
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
    const title = this.$translate('MILESTONE_DETAILS_TITLE', {
      name: milestone.name
    });
    const template = `<md-dialog class="dialog--wider">
          <md-toolbar>
            <div class="md-toolbar-tools">
              <h2>${title}</h2>
            </div>
          </md-toolbar>
          <md-dialog-content class="gray-lighter-bg md-dialog-content">
            <milestone-details milestone="milestone" on-show-workgroup="onShowWorkgroup(value)" on-visit-node-grading="onVisitNodeGrading()"></milestone-details>
          </md-dialog-content>
          <md-dialog-actions layout="row" layout-align="start center">
            <md-button class="warn"
                       ng-click="delete()"
                       ng-if="!milestone.type === 'milestoneReport'"
                       aria-label="{{ ::'DELETE' | translate }}">
              {{ ::'DELETE' | translate }}
            </md-button>
            <span flex></span>
            <md-button class="md-primary"
                       ng-click="edit()"
                       ng-if="milestone.type != 'milestoneReport'"
                       aria-label="{{ ::'EDIT' | translate }}">
              {{ ::'EDIT' | translate }}
            </md-button>
            <md-button class="md-primary"
                       ng-click="close()"
                       aria-label="{{ ::'CLOSE' | translate }}">
              {{ ::'CLOSE' | translate }}
            </md-button>
          </md-dialog-actions>
        </md-dialog>`;
    this.$mdDialog
      .show({
        parent: angular.element(document.body),
        template: template,
        ariaLabel: title,
        fullscreen: true,
        multiple: true,
        targetEvent: $event,
        clickOutsideToClose: true,
        escapeToClose: true,
        locals: {
          $event: $event,
          milestone: milestone
        },
        controller: [
          '$scope',
          '$state',
          '$mdDialog',
          'milestone',
          '$event',
          'TeacherDataService',
          function DialogController(
            $scope,
            $state,
            $mdDialog,
            milestone,
            $event,
            TeacherDataService
          ) {
            $scope.milestone = milestone;
            $scope.event = $event;
            $scope.close = function() {
              $scope.saveMilestoneClosedEvent();
              $mdDialog.hide();
            };
            $scope.edit = function() {
              $mdDialog.hide({
                milestone: $scope.milestone,
                action: 'edit',
                $event: $event
              });
            };
            $scope.delete = function() {
              $mdDialog.hide({ milestone: $scope.milestone, action: 'delete' });
            };
            $scope.onShowWorkgroup = function(workgroup) {
              $mdDialog.hide();
              TeacherDataService.setCurrentWorkgroup(workgroup);
              $state.go('root.nodeProgress');
            };
            $scope.onVisitNodeGrading = function() {
              $mdDialog.hide();
            };
            $scope.saveMilestoneOpenedEvent = function() {
              $scope.saveMilestoneEvent('MilestoneOpened');
            };
            $scope.saveMilestoneClosedEvent = function() {
              $scope.saveMilestoneEvent('MilestoneClosed');
            };
            $scope.saveMilestoneEvent = function(event) {
              const context = 'ClassroomMonitor',
                nodeId = null,
                componentId = null,
                componentType = null,
                category = 'Navigation',
                data = { milestoneId: $scope.milestone.id },
                projectId = null;
              TeacherDataService.saveEvent(
                context,
                nodeId,
                componentId,
                componentType,
                category,
                event,
                data,
                projectId
              );
            };
            $scope.saveMilestoneOpenedEvent();
          }
        ]
      })
      .then(
        data => {
          if (data && data.action && data.milestone) {
            if (data.action === 'edit') {
              let milestone = angular.copy(data.milestone);
              this.editMilestone(milestone, data.$event);
            } else if (data.action === 'delete') {
              this.deleteMilestone(data.milestone, data.$event);
            }
          }
        },
        () => {}
      );
  }

  editMilestone(milestone, $event) {
    let editMode = milestone ? true : false;
    let title = editMode ? this.$translate('EDIT_MILESTONE') : this.$translate('ADD_MILESTONE');

    if (!editMode) {
      milestone = this.MilestoneService.createMilestone();
    }

    let template = `<md-dialog class="dialog--wide">
          <md-toolbar>
            <div class="md-toolbar-tools">
              <h2>${title}</h2>
            </div>
          </md-toolbar>
          <md-dialog-content class="gray-lighter-bg md-dialog-content">
            <milestone-edit milestone="milestone" on-change="onChange(milestone, valid)"></milestone-edit>
          </md-dialog-content>
          <md-dialog-actions layout="row" layout-align="end center">
            <md-button ng-click="close()"
                       aria-label="{{ ::'CANCEL' | translate }}">
              {{ ::'CANCEL' | translate }}
            </md-button>
            <md-button class="md-warn"
                       ng-click="delete()"
                       aria-label="{{ ::'DELETE' | translate }}">
              {{ ::'DELETE' | translate }}
            </md-button>
            <md-button class="md-primary"
                       ng-click="save()"
                       aria-label="{{ ::'SAVE' | translate }}">
              {{ ::'SAVE' | translate }}
            </md-button>
          </md-dialog-actions>
        </md-dialog>`;

    // display the milestone edit form in a dialog
    this.$mdDialog
      .show({
        parent: angular.element(document.body),
        template: template,
        ariaLabel: title,
        fullscreen: true,
        targetEvent: $event,
        clickOutsideToClose: true,
        escapeToClose: true,
        locals: {
          editMode: editMode,
          $event: $event,
          milestone: milestone
        },
        controller: [
          '$scope',
          '$mdDialog',
          '$filter',
          'milestone',
          'editMode',
          '$event',
          function DialogController($scope, $mdDialog, $filter, milestone, editMode, $event) {
            $scope.editMode = editMode;
            $scope.milestone = milestone;
            $scope.$event = $event;
            $scope.valid = editMode;

            $scope.$translate = $filter('translate');

            $scope.close = function() {
              $mdDialog.hide({
                milestone: $scope.milestone,
                $event: $scope.$event
              });
            };

            $scope.save = function() {
              if ($scope.valid) {
                $mdDialog.hide({
                  milestone: $scope.milestone,
                  save: true,
                  $event: $scope.$event
                });
              } else {
                alert($scope.$translate('MILESTONE_EDIT_INVALID_ALERT'));
              }
            };

            $scope.delete = function() {
              $mdDialog.hide({
                milestone: $scope.milestone,
                delete: true,
                $event: $scope.$event
              });
            };

            $scope.onChange = function(milestone, valid) {
              $scope.milestone = milestone;
              $scope.valid = valid;
            };
          }
        ]
      })
      .then(
        data => {
          if (data) {
            if (data.milestone) {
              if (data.save) {
                this.saveMilestone(data.milestone);
              }
              if (data.delete) {
                this.deleteMilestone(data.milestone, $event);
              }
            }
          }
        },
        () => {}
      );
  }

  deleteMilestone(milestone, $event) {
    if (milestone) {
      const title = milestone.name;
      const label = this.$translate('DELETE_MILESTONE');
      const msg = this.$translate('DELETE_MILESTONE_CONFIRM', {
        name: milestone.name
      });
      const yes = this.$translate('YES');
      const cancel = this.$translate('CANCEL');

      const confirm = this.$mdDialog
        .confirm()
        .title(title)
        .textContent(msg)
        .ariaLabel(label)
        .targetEvent($event)
        .ok(yes)
        .cancel(cancel);

      this.$mdDialog.show(confirm).then(
        () => {
          this.MilestoneService.deleteMilestone(milestone);
          this.loadProjectMilestones();
        },
        () => {}
      );
    }
  }

  saveMilestone(milestone) {
    this.MilestoneService.saveMilestone(milestone);
    this.loadProjectMilestones();
  }
}

export default MilestonesController;
