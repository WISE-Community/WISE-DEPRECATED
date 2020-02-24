"use strict";

class MilestoneDetailsController {
  constructor(
    $filter,
    $scope,
    $state,
    ConfigService,
    ProjectService,
    TeacherDataService
  ) {
    this.$filter = $filter;
    this.$scope = $scope;
    this.$state = $state;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.TeacherDataService = TeacherDataService;
    this.$translate = this.$filter("translate");
    this.periodId = this.TeacherDataService.getCurrentPeriod().periodId;
    this.$onInit = () => {
      this.requirements = this.getRequirements();
      this.saveMilestoneCurrentPeriodSelectedEvent(
        this.TeacherDataService.getCurrentPeriod()
      );
    };
    this.$scope.$on("currentPeriodChanged", (event, { currentPeriod }) => {
      this.periodId = currentPeriod.periodId;
      this.saveMilestoneCurrentPeriodSelectedEvent(currentPeriod);
    });
  }

  saveMilestoneCurrentPeriodSelectedEvent(currentPeriod) {
    const context = "ClassroomMonitor",
      nodeId = null,
      componentId = null,
      componentType = null,
      category = "Navigation",
      data = {
        milestoneId: this.milestone.id,
        periodId: currentPeriod.periodId,
        periodName: currentPeriod.periodName
      },
      event = "MilestonePeriodSelected",
      projectId = null;
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      event,
      data,
      projectId
    );
  }

  getRequirements() {
    let requirements = [];
    let items = this.milestone.items;

    angular.forEach(items, (value, key) => {
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

  /**
   * Get the user names for a workgroup id
   * @param workgroupId the workgroup id
   * @return the user names in the workgroup
   */
  getDisplayUsernamesByWorkgroupId(workgroupId) {
    return this.ConfigService.getDisplayUsernamesByWorkgroupId(workgroupId);
  }

  /**
   * Get the avatar coloer for a workgroup id
   * @param workgroupId the workgroup id
   * @return the avatar color for the workgroup
   */
  getAvatarColorForWorkgroupId(workgroupId) {
    return this.ConfigService.getAvatarColorForWorkgroupId(workgroupId);
  }

  showWorkgroup(workgroup) {
    this.onShowWorkgroup({ value: workgroup });
  }

  visitNodeGrading() {
    this.onVisitNodeGrading();
  }

  saveTabSelectedEvent(event) {
    const context = "ClassroomMonitor",
      nodeId = null,
      componentId = null,
      componentType = null,
      category = "Navigation",
      data = { milestoneId: this.milestone.id },
      projectId = null;
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      event,
      data,
      projectId
    );
  }

  studentWorkTabSelected() {}
}

MilestoneDetailsController.$inject = [
  "$filter",
  "$scope",
  "$state",
  "ConfigService",
  "ProjectService",
  "TeacherDataService"
];

const MilestoneDetails = {
  bindings: {
    milestone: "<",
    onShowWorkgroup: "&",
    onVisitNodeGrading: "&"
  },
  template: `<div class="milestone-details md-whiteframe-1dp">
            <span layout="row" layout-align="start center">
                <period-select custom-class="'md-no-underline md-button toolbar__select'"></period-select>
                <span flex></span>
                <span layout="row" layout-align="start center">
                    <md-progress-linear class="milestone-details__progress" md-mode="determinate" value="{{ $ctrl.milestone.percentageCompleted }}"></md-progress-linear>
                    <span class="md-body-2 text-secondary ng-binding">
                        {{ $ctrl.milestone.percentageCompleted }}%
                    </span>
                </span>
            </span>
            <p ng-if="$ctrl.milestone.description">
              <span class="heavy">{{ ::'description' | translate }}: </span>&nbsp;
              <compile data="$ctrl.milestone.description"></compile>
            </p>
            <p ng-if="$ctrl.milestone.params.targetDate"><span class="heavy">{{ ::'dueDate' | translate }}: </span> {{ $ctrl.milestone.params.targetDate | date: 'EEE MMM d, yyyy' }}</p>
            <p ng-if="$ctrl.requirements.length">
                <span class="heavy">{{ ::'REQUIREMENTS' | translate }}: </span>
                <a ng-repeat="requirement in $ctrl.requirements" ui-sref="root.project({nodeId: \'{{ requirement }}\'})" ng-click="$ctrl.visitNodeGrading(event)">
                    {{ ::$ctrl.getNodeNumberByNodeId(requirement) }}: {{ ::$ctrl.getNodeTitleByNodeId(requirement) }}<span ng-if="!$last">, </span>
                </a>
            </p>
        </div>
        <div ng-if="$ctrl.milestone.type === 'milestoneReport'"
                class="milestone-details md-whiteframe-1dp">
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
        </div>
        <div ng-if="$ctrl.milestone.recommendations && $ctrl.milestone.isReportAvailable"
             class="md-whiteframe-1dp gray-lightest-bg">
            <md-tabs md-dynamic-height>
                <md-tab label="{{ ::'recommendations' | translate }}" md-on-select="$ctrl.saveTabSelectedEvent('MilestoneRecommendationTabSelected')">
                    <div class="milestone-details">
                        <compile data="$ctrl.milestone.recommendations"></compile>
                    </div>
                </md-tab>
                <md-tab label="{{ ::'studentWork' | translate }}" md-on-select="$ctrl.saveTabSelectedEvent('MilestoneStudentWorkTabSelected')">
                    <div class="milestone-details">
                        <node-grading-view node-id="$ctrl.milestone.nodeId"
                                           milestone="$ctrl.milestone"></node-grading-view>
                    </div>
                </md-tab>
            </md-tabs>
        </div>
        <div ng-if="!$ctrl.milestone.recommendations || !$ctrl.milestone.isReportAvailable"
             class="milestone-details md-whiteframe-1dp">
            <div class="milestone-details__header primary md-body-2 gray-lightest-bg">{{ ::'studentCompletion' | translate }}</div>
            <ng-include src="'completion'"></ng-include>
        </div>
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
                    <p class="heavy">{{ $ctrl.getDisplayUsernamesByWorkgroupId(workgroup.workgroupId) }}</p>
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
        </script>`,
  controller: MilestoneDetailsController
};

export default MilestoneDetails;
