'use strict';

import { Component, ViewEncapsulation } from '@angular/core';
import { ConfigService } from '../../../../../../wise5/services/configService';
import { TeacherDataService } from '../../../../../../wise5/services/teacherDataService';
import { WorkgroupSelectComponent } from '../workgroup-select.component';

@Component({
  selector: 'workgroup-select-dropdown',
  styleUrls: ['workgroup-select-dropdown.component.scss'],
  templateUrl: 'workgroup-select-dropdown.component.html',
  encapsulation: ViewEncapsulation.None
})
export class WorkgroupSelectDropdownComponent extends WorkgroupSelectComponent {
  searchTerm: string = '';

  constructor(
    protected ConfigService: ConfigService,
    protected TeacherDataService: TeacherDataService
  ) {
    super(ConfigService, TeacherDataService);
  }

  setWorkgroups() {
    this.filterWorkgroupsBySelectedPeriod();
    this.workgroups = this.sortByField(this.workgroups, 'workgroupId');
    this.filterWorkgroupsBySearchTerm();
    this.selectedItem = this.getCurrentWorkgroup();
  }

  filterWorkgroupsBySearchTerm(): void {
    this.workgroups = this.workgroups.filter((workgroup) => {
      return workgroup.displayNames
        .concat(workgroup.workgroupId)
        .toLowerCase()
        .includes(this.searchTerm);
    });
  }

  getCurrentWorkgroup() {
    const currentWorkgroup = this.TeacherDataService.getCurrentWorkgroup();
    if (currentWorkgroup) {
      for (const workgroup of this.workgroups) {
        if (workgroup.workgroupId === currentWorkgroup.workgroupId) {
          return workgroup;
        }
      }
    }
    return null;
  }

  selectedItemChange() {
    this.setCurrentWorkgroup(this.selectedItem);
    this.searchTerm = '';
  }
}
