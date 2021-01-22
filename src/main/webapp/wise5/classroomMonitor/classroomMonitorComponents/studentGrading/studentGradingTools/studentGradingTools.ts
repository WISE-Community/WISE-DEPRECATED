'use strict';

import { ConfigService } from '../../../../services/configService';
import { TeacherDataService } from '../../../../services/teacherDataService';
import * as $ from 'jquery';
import * as angular from 'angular';
import { Directive } from '@angular/core';

@Directive()
class StudentGradingToolsController {
  avatarColor: string;
  icons: any;
  is_rtl: boolean;
  nextId: any;
  periodId: number;
  prevId: any;
  workgroupId: number;
  workgroups: any;
  currentPeriodChangedSubscription: any;

  static $inject = ['$scope', '$state', 'orderByFilter', 'ConfigService', 'TeacherDataService'];

  constructor(
    private $scope: any,
    private $state: any,
    private orderBy: any,
    private ConfigService: ConfigService,
    private TeacherDataService: TeacherDataService
  ) {
    this.is_rtl = $('html').attr('dir') == 'rtl';
    this.icons = { prev: 'chevron_left', next: 'chevron_right' };
    if (this.is_rtl) {
      this.icons = { prev: 'chevron_right', next: 'chevron_left' };
    }

    this.currentPeriodChangedSubscription = this.TeacherDataService.currentPeriodChanged$.subscribe(
      ({ currentPeriod }) => {
        this.periodId = currentPeriod.periodId;
        this.filterForPeriod();
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

  $onInit() {}

  $onChanges() {
    this.avatarColor = this.ConfigService.getAvatarColorForWorkgroupId(this.workgroupId);
    this.periodId = this.TeacherDataService.getCurrentPeriod().periodId;
    let workgroups = angular.copy(this.ConfigService.getClassmateUserInfos());
    this.workgroups = this.orderBy(workgroups, 'workgroupId');
    this.filterForPeriod();
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
          let prevWorkgroup = this.workgroups[i - 1];
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
        if (i < n - 1) {
          let nextWorkgroup = this.workgroups[i + 1];
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
    this.$state.go('root.cm.team', { workgroupId: this.prevId });
  }

  goToNextTeam() {
    this.$state.go('root.cm.team', { workgroupId: this.nextId });
  }
}

const StudentGradingTools = {
  bindings: {
    workgroupId: '<'
  },
  template: `<div layout="row" layout-align="center center">
      <md-button aria-label="{{ ::'previousTeam' | translate }}"
                 class="md-icon-button toolbar__nav"
                 ng-disabled="!$ctrl.prevId" ng-click="$ctrl.goToPrevTeam()">
        <md-icon> {{ ::$ctrl.icons.prev }} </md-icon>
        <md-tooltip md-direction="bottom">{{ ::'previousTeam' | translate }}</md-tooltip>
      </md-button>
      <md-icon class="md-30" hide-xs
               style="color: {{ $ctrl.avatarColor }};"> account_circle </md-icon>&nbsp;
      <workgroup-select-dropdown custom-class="md-button md-no-underline toolbar__select toolbar__select--fixedwidth"></workgroup-select-dropdown>
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
