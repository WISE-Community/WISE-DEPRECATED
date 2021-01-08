'use strict';

import { Directive } from '@angular/core';
import { StudentStatusService } from '../../../../services/studentStatusService';
import { TeacherDataService } from '../../../../services/teacherDataService';
import { TeacherProjectService } from '../../../../services/teacherProjectService';

@Directive()
class PeriodSelectController {
  $translate: any;
  currentPeriod: any;
  periods: any;
  rootNodeId: string;
  currentPeriodChangedSubscription: any;
  static $inject = [
    '$filter',
    '$scope',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService'
  ];

  constructor(
    $filter: any,
    private $scope: any,
    private ProjectService: TeacherProjectService,
    private StudentStatusService: StudentStatusService,
    private TeacherDataService: TeacherDataService
  ) {
    this.ProjectService = ProjectService;
    this.StudentStatusService = StudentStatusService;
    this.TeacherDataService = TeacherDataService;
    this.$translate = $filter('translate');

    let startNodeId = this.ProjectService.getStartNodeId();
    this.rootNodeId = this.ProjectService.getRootNode(startNodeId).id;

    this.currentPeriod = null;
    this.periods = [];
    this.initializePeriods();
    this.currentPeriodChangedSubscription = this.TeacherDataService.currentPeriodChanged$.subscribe(
      ({ currentPeriod }) => {
        this.currentPeriod = currentPeriod;
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

  initializePeriods() {
    this.periods = this.TeacherDataService.getPeriods();
    if (this.getCurrentPeriod()) {
      this.currentPeriod = this.getCurrentPeriod();
    } else {
      if (this.periods != null && this.periods.length > 0) {
        this.setCurrentPeriod(this.periods[0]);
      }
    }
    let n = this.periods.length;
    for (let i = 0; i < n; i++) {
      let period = this.periods[i];
      let id = i === 0 ? -1 : period.periodId;
      let numWorkgroupsInPeriod = this.getNumberOfWorkgroupsInPeriod(id);

      period.numWorkgroupsInPeriod = numWorkgroupsInPeriod;
    }
  }

  currentPeriodChanged() {
    this.setCurrentPeriod(this.currentPeriod);
  }

  setCurrentPeriod(period) {
    this.TeacherDataService.setCurrentPeriod(period);
  }

  getCurrentPeriod() {
    return this.TeacherDataService.getCurrentPeriod();
  }

  getNumberOfWorkgroupsInPeriod(periodId) {
    return this.StudentStatusService.getWorkgroupIdsOnNode(this.rootNodeId, periodId).length;
  }

  getSelectedText() {
    if (this.currentPeriod.periodId === -1) {
      return this.$translate('allPeriods');
    } else {
      return this.$translate('periodLabel', { name: this.currentPeriod.periodName });
    }
  }
}

const PeriodSelect = {
  bindings: {
    customClass: '<'
  },
  template: `<md-select md-theme="cm"
                    ng-model="$ctrl.currentPeriod"
                    ng-model-options="{ trackBy: '$value.periodId' }"
                    ng-class="$ctrl.customClass"
                    ng-change="$ctrl.currentPeriodChanged()"
                    aria-label="{{ ::'selectPeriod' | translate }}"
                    md-selected-text="$ctrl.getSelectedText()">
            <md-option ng-repeat="period in $ctrl.periods track by $index"
                       ng-value="period"
                       ng-disabled="!period.numWorkgroupsInPeriod">
                <span ng-if="period.periodId === -1" translate="allPeriods"></span>
                <span ng-if="period.periodId != -1" translate="periodLabel" translate-value-name="{{ period.periodName }}"></span>
                <span class="text-secondary">
                    (<ng-pluralize count="period.numWorkgroupsInPeriod"
                        when="{'0': '{{ &quot;numberOfTeams_0&quot; | translate }}',
                            'one': '{{ &quot;numberOfTeams_1&quot; | translate }}',
                            'other': '{{ &quot;numberOfTeams_other&quot; | translate:{count: period.numWorkgroupsInPeriod} }}'}">
                    </ng-pluralize>)
                </span>
            </md-option>
        </md-select>`,
  controller: PeriodSelectController
};

export default PeriodSelect;
