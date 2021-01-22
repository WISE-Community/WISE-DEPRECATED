'use strict';

import { Directive, Input } from '@angular/core';
import { ConfigService } from '../../../../../wise5/services/configService';
import { TeacherDataService } from '../../../../../wise5/services/teacherDataService';

@Directive()
export class WorkgroupSelectComponent {
  @Input()
  customClass: string;
  canViewStudentNames: boolean;
  periodId: number;
  selectedItem: any;
  workgroups: any;
  currentPeriodChangedSubscription: any;
  currentWorkgroupChangedSubscription: any;

  constructor(
    protected ConfigService: ConfigService,
    protected TeacherDataService: TeacherDataService
  ) {}

  ngOnInit() {
    this.canViewStudentNames = this.ConfigService.getPermissions().canViewStudentNames;
    this.periodId = this.TeacherDataService.getCurrentPeriod().periodId;
    this.setWorkgroups();
    this.currentWorkgroupChangedSubscription = this.TeacherDataService.currentWorkgroupChanged$.subscribe(
      ({ currentWorkgroup }) => {
        if (currentWorkgroup != null) {
          this.setWorkgroups();
        }
      }
    );
    this.currentPeriodChangedSubscription = this.TeacherDataService.currentPeriodChanged$.subscribe(
      ({ currentPeriod }) => {
        this.periodId = currentPeriod.periodId;
        this.setWorkgroups();
        this.currentPeriodChanged();
      }
    );
  }

  ngOnDestroy() {
    this.currentPeriodChangedSubscription.unsubscribe();
    this.currentWorkgroupChangedSubscription.unsubscribe();
  }

  setWorkgroups() {}

  currentPeriodChanged() {}

  sortByField(arr: any[], field: string): any[] {
    return arr.sort((workgroup1, workgroup2) => {
      return workgroup1[field] - workgroup2[field];
    });
  }

  sortByDisplayNames(arr: any[]): any[] {
    return arr.sort((workgroup1, workgroup2) => {
      return workgroup1.displayNames.localeCompare(workgroup2.displayNames);
    });
  }

  filterWorkgroupsBySelectedPeriod() {
    this.workgroups = this.ConfigService.getClassmateUserInfos().filter((workgroup) => {
      return this.periodId === -1 || workgroup.periodId === this.periodId;
    });
  }

  setCurrentWorkgroup(workgroup) {
    this.TeacherDataService.setCurrentWorkgroup(workgroup);
  }
}
