'use strict';

import { ConfigService } from '../../../../services/configService';
import { TeacherDataService } from '../../../../services/teacherDataService';
import * as angular from 'angular';
import { NodeService } from '../../../../services/nodeService';
import { TeacherProjectService } from '../../../../services/teacherProjectService';
import { Directive } from '@angular/core';

@Directive()
class MilestoneDetailsController {
  $translate: any;
  onShowWorkgroup: any;
  onVisitNodeGrading: any;
  milestone: any;
  periodId: number;
  requirements: any;
  currentPeriodChangedSubscription: any;

  static $inject = [
    '$filter',
    '$scope',
    'ConfigService',
    'NodeService',
    'ProjectService',
    'TeacherDataService'
  ];
  constructor(
    $filter,
    private $scope,
    private ConfigService: ConfigService,
    private NodeService: NodeService,
    private ProjectService: TeacherProjectService,
    private TeacherDataService: TeacherDataService
  ) {
    this.$translate = $filter('translate');
    this.periodId = this.TeacherDataService.getCurrentPeriod().periodId;
    this.currentPeriodChangedSubscription = this.TeacherDataService.currentPeriodChanged$.subscribe(
      ({ currentPeriod }) => {
        this.periodId = currentPeriod.periodId;
        this.saveMilestoneCurrentPeriodSelectedEvent(currentPeriod);
      }
    );
    this.$scope.$on('$destroy', () => {
      this.ngOnDestroy();
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.currentPeriodChangedSubscription.unsubscribe();
  }

  $onInit() {
    this.requirements = this.getRequirements();
    this.saveMilestoneCurrentPeriodSelectedEvent(this.TeacherDataService.getCurrentPeriod());
  }

  saveMilestoneCurrentPeriodSelectedEvent(currentPeriod) {
    const context = 'ClassroomMonitor',
      nodeId = null,
      componentId = null,
      componentType = null,
      category = 'Navigation',
      data = {
        milestoneId: this.milestone.id,
        periodId: currentPeriod.periodId,
        periodName: currentPeriod.periodName
      },
      event = 'MilestonePeriodSelected';
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

  getRequirements() {
    const requirements = [];
    angular.forEach(this.milestone.items, (value, key) => {
      if (value.checked) {
        requirements.push(key);
      }
    });
    return requirements;
  }

  getNodeNumberByNodeId(nodeId) {
    return this.ProjectService.nodeIdToNumber[nodeId];
  }

  getNodeTitleByNodeId(nodeId) {
    return this.ProjectService.getNodeTitleByNodeId(nodeId);
  }

  getNodeNumberAndTitleByNodeId(nodeId) {
    return `${this.getNodeNumberByNodeId(nodeId)}: ${this.getNodeTitleByNodeId(nodeId)}`;
  }

  getDisplayNamesByWorkgroupId(workgroupId) {
    return this.ConfigService.getDisplayNamesByWorkgroupId(workgroupId);
  }

  getAvatarColorForWorkgroupId(workgroupId) {
    return this.ConfigService.getAvatarColorForWorkgroupId(workgroupId);
  }

  showWorkgroup(workgroup) {
    this.onShowWorkgroup({ value: workgroup });
  }

  showMilestoneStepInfo($event) {
    this.NodeService.showNodeInfo(this.milestone.nodeId, $event);
  }

  visitNodeGrading() {
    this.onVisitNodeGrading();
  }

  saveTabSelectedEvent(event) {
    const context = 'ClassroomMonitor',
      nodeId = null,
      componentId = null,
      componentType = null,
      category = 'Navigation',
      data = { milestoneId: this.milestone.id };
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

  studentWorkTabSelected() {}
}

const MilestoneDetails = {
  bindings: {
    milestone: '<',
    hideStudentWork: '<',
    onShowWorkgroup: '&',
    onVisitNodeGrading: '&'
  },
  template: `<div class="milestone-details">
      <section class="milestone-details__section md-whiteframe-1dp">
        <div layout="row" layout-align="start center">
          <period-select custom-class="'md-no-underline md-button toolbar__select'"></period-select>
          <span flex></span>
          <div layout="row" layout-align="start center">
            <md-progress-linear class="milestone-details__progress" md-mode="determinate" value="{{ $ctrl.milestone.percentageCompleted }}"></md-progress-linear>
            <span class="md-body-2 text-secondary ng-binding">
              {{ $ctrl.milestone.percentageCompleted }}%
            </span>
          </div>
        </div>
        <p ng-if="$ctrl.milestone.description">
          <span class="heavy">{{ ::'description' | translate }}: </span>
          <compile data="$ctrl.milestone.description"></compile>
        </p>
        <p ng-if="$ctrl.milestone.params.targetDate"><span class="heavy">{{ ::'dueDate' | translate }}: </span> {{ $ctrl.milestone.params.targetDate | date: 'EEE MMM d, yyyy' }}</p>
        <p ng-if="$ctrl.requirements.length">
          <span class="heavy">{{ ::'REQUIREMENTS' | translate }}: </span>
          <a ng-repeat="requirement in $ctrl.requirements" ui-sref="root.cm.node({nodeId: \'{{ requirement }}\'})" ng-click="$ctrl.visitNodeGrading(event)">
            {{ ::$ctrl.getNodeNumberByNodeId(requirement) }}: {{ ::$ctrl.getNodeTitleByNodeId(requirement) }}<span ng-if="!$last">, </span>
          </a>
        </p>
        <p ng-if="$ctrl.milestone.type === 'milestoneReport'">
          <span class="heavy">{{ ::'itemLocation' | translate }}: </span>
          {{ $ctrl.getNodeNumberAndTitleByNodeId($ctrl.milestone.nodeId) }}
          (<a href ng-click="$ctrl.showMilestoneStepInfo($event)">{{ ::'STEP_INFO' | translate }}</a>)
        </p>
      </section>
      <section ng-if="$ctrl.milestone.type === 'milestoneReport'"
          class="milestone-details__section md-whiteframe-1dp">
        <div class="milestone-details__header primary md-body-2 gray-lightest-bg">{{ ::'classReport' | translate }}</div>
        <div ng-if="!$ctrl.milestone.isReportAvailable"
              class="center">
          <p>{{ ::'milestoneReportExplanation' | translate }} {{ ::'milestoneReportAvailability' | translate }}</p>
          <p class="bold" ng-if="$ctrl.milestone.satisfyConditional === 'any'">
            {{ ::'milestoneReportAvailabilityRequirementsAny' | translate: { num: $ctrl.milestone.satisfyMinNumWorkgroups, percent: $ctrl.milestone.satisfyMinPercentage } }}
          </p>
          <p class="bold" ng-if="$ctrl.milestone.satisfyConditional === 'all'">
            {{ ::'milestoneReportAvailabilityRequirementsAll' | translate: { num: $ctrl.milestone.satisfyMinNumWorkgroups, percent: $ctrl.milestone.satisfyMinPercentage } }}
          </p>
        </div>
        <div ng-if="$ctrl.milestone.isReportAvailable">
          <compile data="$ctrl.milestone.generatedReport"></compile>
        </div>
      </section>
      <section ng-if="$ctrl.hideStudentWork && $ctrl.milestone.generatedRecommendations && $ctrl.milestone.isReportAvailable"
               class="milestone-details__section md-whiteframe-1dp">
        <div class="milestone-details__header primary md-body-2 gray-lightest-bg">{{ ::'recommendations' | translate }}</div>
        <compile data="$ctrl.milestone.generatedRecommendations"></compile>
      </section>
      <section ng-if="!$ctrl.hideStudentWork" class="md-whiteframe-1dp gray-lightest-bg">
        <div ng-if="$ctrl.milestone.generatedRecommendations && $ctrl.milestone.isReportAvailable">
          <md-tabs md-dynamic-height>
            <md-tab label="{{ ::'recommendations' | translate }}" md-on-select="$ctrl.saveTabSelectedEvent('MilestoneRecommendationTabSelected')">
              <div class="milestone-details__section">
                <compile data="$ctrl.milestone.generatedRecommendations"></compile>
              </div>
            </md-tab>
            <md-tab label="{{ ::'studentWork' | translate }}" md-on-select="$ctrl.saveTabSelectedEvent('MilestoneStudentWorkTabSelected')">
              <div class="milestone-details__section">
                <node-grading-view node-id="$ctrl.milestone.nodeId"
                                   milestone="$ctrl.milestone"></node-grading-view>
              </div>
            </md-tab>
          </md-tabs>
        </div>
        <div ng-if="!$ctrl.milestone.generatedRecommendations && $ctrl.milestone.isReportAvailable"
                 class="milestone-details__section md-whiteframe-1dp">
          <div class="milestone-details__header primary md-body-2 gray-lightest-bg">{{ ::'studentWork' | translate }}</div>
          <node-grading-view node-id="$ctrl.milestone.nodeId"
                             milestone="$ctrl.milestone"></node-grading-view>
        </div>
      </section>
      <section ng-if="!$ctrl.milestone.isReportAvailable"
          class="milestone-details__section md-whiteframe-1dp">
        <div class="milestone-details__header primary md-body-2 gray-lightest-bg">{{ ::'studentCompletion' | translate }}</div>
        <ng-include src="'completion'"></ng-include>
      </section>
      <script type='text/ng-template' id="completion">
        <md-list class="user-list md-whiteframe-1dp">
          <md-list-item class="thead md-with-secondary gray-lightest-bg md-body-1">
            <p>{{ ::'team' | translate }}</p>
            <div class="md-secondary-container">{{ ::'completed' | translate }}</div>
          </md-list-item>
          <md-list-item class="list-item md-with-secondary"
                        ng-repeat="workgroup in $ctrl.milestone.workgroups | orderBy:'-achievementTime'">
            <div class="md-avatar" hide-xs>
              <md-icon class="md-36" style="color: {{ $ctrl.getAvatarColorForWorkgroupId(workgroup.workgroupId) }};"> account_circle </md-icon>
            </div>
            <p class="heavy">{{ $ctrl.getDisplayNamesByWorkgroupId(workgroup.workgroupId) }}</p>
            <div class="md-secondary-container heavy">
              <span ng-if="workgroup.achievementTime !== null" class="success">
                {{ workgroup.achievementTime | amTimeAgo }}
              </span>
              <span ng-if="workgroup.achievementTime === null" class="warn">
                {{ ::'notCompleted' | translate }}
              </span>
            </div>
          </md-list-item>
        </md-list>
      </script>
    </div>`,
  controller: MilestoneDetailsController
};

export default MilestoneDetails;
