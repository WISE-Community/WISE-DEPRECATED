'use strict';

import * as angular from 'angular';
import { downgradeComponent } from '@angular/upgrade/static';
import { TableGrading } from './table-grading/table-grading.component';

const tableGradingComponentModule = angular
  .module('tableGradingComponentModule', ['pascalprecht.translate'])
  .directive(
    'tableGrading',
    downgradeComponent({ component: TableGrading }) as angular.IDirectiveFactory
  );

export default tableGradingComponentModule;
