import * as angular from 'angular';
import { ManageStudentsComponent } from '../../manageStudents/manage-students-component';
import { downgradeComponent } from '@angular/upgrade/static';

angular
  .module('manageStudents', [])
  .directive(
    'manageStudentsComponent',
    downgradeComponent({ component: ManageStudentsComponent }) as angular.IDirectiveFactory
  );
