"use strict";

class StudentGradingToolsController {
  constructor($filter,
              $scope,
              $state,
              orderBy,
              ConfigService,
              TeacherDataService) {
    this.$filter = $filter;
    this.$scope = $scope;
    this.$state = $state;
    this.orderBy = orderBy;
    this.ConfigService = ConfigService;
    this.TeacherDataService = TeacherDataService;
    this.$translate = this.$filter('translate');
    
    this.is_rtl = ($('html').attr('dir') == 'rtl');
    this.icons = { prev: 'chevron_left', next: 'chevron_right' };
    if (this.is_rtl) {
      this.icons = { prev: 'chevron_right', next: 'chevron_left' };
    }

    this.$onInit = () => {
      this.selectTeamPlaceholder = this.$translate('selectATeam');
    }

    this.$onChanges = () => {
      this.avatarColor = this.ConfigService.getAvatarColorForWorkgroupId(this.workgroupId);
      this.periodId = this.TeacherDataService.getCurrentPeriod().periodId;
      let workgroups = angular.copy(this.ConfigService.getClassmateUserInfos());
      this.workgroups = this.orderBy(workgroups, 'workgroupId');
      this.filterForPeriod();
    };

    /**
     * Listen for current period changed event
     */
    this.$scope.$on('currentPeriodChanged', (event, args) => {
        this.periodId = args.currentPeriod.periodId;
        this.filterForPeriod();
    });
  }

  filterForPeriod() {
    let n = this.workgroups.length;
    for (let i = 0; i < n; i++) {
      let workgroup = this.workgroups[i];
      let periodId = workgroup.periodId;
      if (this.periodId === -1 || periodId === this.periodId) {
        workgroup.visible = true;
      } else {
        workgroup.visible = false;
      }
    }

    this.setNextAndPrev();
  }

  setNextAndPrev() {
    let currentWorkgroupId = this.workgroupId;
    this.prevId = this.getPrevId(currentWorkgroupId);
    this.nextId = this.getNextId(currentWorkgroupId);
  }

  getPrevId(id) {
    let prevId = null;
    let n = this.workgroups.length;
    for (let i = 0; i < n; i++) {
      let workgroupId = this.workgroups[i].workgroupId;
      if (workgroupId === id) {
        if (i > 0) {
          let prevWorkgroup = this.workgroups[i-1];
          if (prevWorkgroup.visible) {
            prevId = prevWorkgroup.workgroupId;
          } else {
            prevId = this.getPrevId(prevWorkgroup.workgroupId);
          }
        }
        break;
      }
    }
    return prevId;
  }

  getNextId(id) {
    let nextId = null;
    let n = this.workgroups.length;
    for (let i = 0; i < n; i++) {
      let workgroupId = this.workgroups[i].workgroupId;
      if (workgroupId === id) {
        if (i < n-1) {
          let nextWorkgroup = this.workgroups[i+1];
          if (nextWorkgroup.visible) {
            nextId = nextWorkgroup.workgroupId;
          } else {
            nextId = this.getNextId(nextWorkgroup.workgroupId);
          }
        }
        break;
      }
    }
    return nextId;
  }

  goToPrevTeam() {
    this.$state.go('root.team', {workgroupId: this.prevId});
  }

  goToNextTeam() {
    this.$state.go('root.team', {workgroupId: this.nextId});
  }
}

StudentGradingToolsController.$inject = [
  '$filter',
  '$scope',
  '$state',
  'orderByFilter',
  'ConfigService',
  'TeacherDataService'
];

const StudentGradingTools = {
  bindings: {
    workgroupId: '<'
  },
  template:
    `<div layout="row" layout-align="center center">
      <md-button aria-label="{{ ::'previousTeam' | translate }}"
                 class="md-icon-button toolbar__nav"
                 ng-disabled="!$ctrl.prevId" ng-click="$ctrl.goToPrevTeam()">
        <md-icon> {{ ::$ctrl.icons.prev }} </md-icon>
        <md-tooltip md-direction="bottom">{{ ::'previousTeam' | translate }}</md-tooltip>
      </md-button>
      <md-icon class="md-30" hide-xs
               style="color: {{ $ctrl.avatarColor }};"> account_circle </md-icon>&nbsp;
      <workgroup-select custom-class="'md-button md-no-underline
                          toolbar__select toolbar__select--fixedwidth'"
                        custom-placeholder="$ctrl.selectTeamPlaceholder"></workgroup-select>
      <md-button aria-label="{{ ::'nextTeam' | translate }}"
                 class="md-icon-button toolbar__nav"
                 ng-disabled="!$ctrl.nextId" ng-click="$ctrl.goToNextTeam()">
        <md-icon> {{ ::$ctrl.icons.next }} </md-icon>
        <md-tooltip md-direction="bottom">{{ ::'nextTeam' | translate }}</md-tooltip>
      </md-button>
    </div>`,
  controller: StudentGradingToolsController
};

export default StudentGradingTools;
