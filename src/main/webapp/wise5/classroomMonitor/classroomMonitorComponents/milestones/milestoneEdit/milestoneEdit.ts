'use strict';

import { AchievementService } from '../../../../services/achievementService';
import { UtilService } from '../../../../services/utilService';
import { TeacherProjectService } from '../../../../services/teacherProjectService';

class MilestoneDetailsController {
  $translate: any;
  date: any;
  milestone: any;
  onChange: any;

  static $inject = [
    '$filter',
    '$scope',
    'AchievementService',
    'ProjectService',
    'UtilService',
    'moment'
  ];

  constructor(
    private $filter: any,
    private $scope: any,
    private AchievementService: AchievementService,
    private ProjectService: TeacherProjectService,
    private UtilService: UtilService,
    private moment: any
  ) {
    this.$scope = $scope;
    this.AchievementService = AchievementService;
    this.ProjectService = ProjectService;
    this.UtilService = UtilService;
    this.moment = moment;
    this.$translate = this.$filter('translate');
  }

  $onInit() {
    if (!this.milestone) {
      this.createMilestone();
    }
    if (this.milestone) {
      this.date = new Date(this.milestone.params.targetDate);
    }
  }

  createMilestone() {
    const projectAchievements = this.ProjectService.getAchievementItems();
    if (projectAchievements != null) {
      let tomorrow = this.moment().add('days', 1).hours(23).minutes(11).seconds(59);
      this.milestone = {
        id: this.AchievementService.getAvailableAchievementId(),
        name: '',
        description: '',
        type: 'milestone',
        params: {
          nodeIds: [],
          targetDate: tomorrow.valueOf()
        },
        icon: {
          image: ''
        },
        items: this.UtilService.makeCopyOfJSONObject(this.ProjectService.idToOrder),
        isVisible: true
      };
    }
  }

  itemChanged(item) {
    if (this.milestone && this.milestone.params && this.milestone.params.nodeIds) {
      let nodeIds = this.milestone.params.nodeIds;
      let nodeId = item.$key;
      if (item.checked) {
        if (nodeIds.indexOf(nodeId) == -1) {
          this.milestone.params.nodeIds.push(nodeId);
        }
      } else {
        for (var n = nodeIds.length - 1; n >= 0; n--) {
          if (nodeId == nodeIds[n]) {
            nodeIds.splice(n, 1);
          }
        }
      }
      this.change();
    }
  }

  toggleSteps(groupId) {
    if (groupId) {
      let showSteps = !this.milestone.items[groupId].showSteps;
      this.milestone.items[groupId].showSteps = showSteps;
      let childIds = this.ProjectService.getChildNodeIdsById(groupId);
      for (let c = 0; c < childIds.length; c++) {
        let childId = childIds[c];
        if (this.milestone.items[childId] != null) {
          this.milestone.items[childId].show = showSteps;
        }
      }
    }
  }

  isGroupNode(nodeId) {
    return this.ProjectService.isGroupNode(nodeId);
  }

  getNodePositionAndTitleByNodeId(nodeId) {
    return this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
  }

  dateChange() {
    this.milestone.params.targetDate = this.date.getTime();
    this.change();
  }

  change() {
    let itemsArray = Object.keys(this.milestone.items).map((it) => this.milestone.items[it]);
    let valid =
      this.$scope.milestoneEditForm.$valid &&
      this.$filter('filter')(itemsArray, { checked: true }).length > 0;
    this.onChange({ milestone: this.milestone, valid: valid });
  }
}

const MilestoneDetails = {
  bindings: {
    milestone: '<',
    onChange: '&'
  },
  template: `<div class="milestone-details md-whiteframe-1dp" layout-padding>
            <form name="milestoneEditForm">
                <h6>{{ ::'DETAILS' | translate }}</h6>
                <div layout-gt-xs="row">
                    <md-input-container class="md-block" flex>
                        <label>{{ ::'name' | translate }}</label>
                        <input name="milestoneName" ng-model="$ctrl.milestone.name" ng-change="$ctrl.change()" required>
                    </md-input-container>

                    <md-input-container>
                        <label>{{ ::'dueDate' | translate }}</label>
                        <md-datepicker name="date" ng-model="$ctrl.date" ng-change="$ctrl.dateChange()" required></md-datepicker>
                    </md-input-container>
                </div>
                <md-input-container class="md-block" flex>
                    <label>{{ ::'DESCRIPTION' | translate }}</label>
                    <textarea ng-model="$ctrl.milestone.description" ng-change="$ctrl.change()" rows="1" md-select-on-focus></textarea>
                </md-input-container>
            </form>
        </div>
        <div class="milestone-details md-whiteframe-1dp" layout-padding>
            <form name="milestoneRequirementsForm">
                <h6>{{ ::'REQUIREMENTS' | translate }}</h6>
                <div ng-repeat="item in $ctrl.milestone.items | toArray | orderBy : 'order'"
                     ng-class="{ 'layout-margin': !$ctrl.isGroupNode(item.$key) }"
                     ng-show="$ctrl.isGroupNode(item.$key) || item.show">

                    <md-checkbox ng-model="item.checked"
                                 ng-if="item.order !== 0"
                                 ng-change="$ctrl.itemChanged(item)"
                                 aria-label="{{ ::$ctrl.getNodePositionAndTitleByNodeId(item.$key) }}">
                        <span class="md-body-2">{{ ::$ctrl.getNodePositionAndTitleByNodeId(item.$key) }}</span>
                    </md-checkbox>
                    <md-button class="md-primary md-icon-button"
                               ng-if="item.order!==0 && $ctrl.isGroupNode(item.$key)"
                               ng-click="$ctrl.toggleSteps(item.$key)"
                               aria-label="{{ $ctrl.milestone.items[item.$key].showSteps ? ('hideSteps' | translate) : ('showSteps' | translate) }}">
                        <md-icon ng-if="!$ctrl.milestone.items[item.$key].showSteps"> add </md-icon>
                        <md-icon ng-if="$ctrl.milestone.items[item.$key].showSteps"> remove </md-icon>
                    </button>
                </div>
            </form>
        </div>`,
  controller: MilestoneDetailsController
};

export default MilestoneDetails;
