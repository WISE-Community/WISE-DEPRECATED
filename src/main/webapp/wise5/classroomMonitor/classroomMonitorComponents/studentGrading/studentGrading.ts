'use strict';

import StepItem from './stepItem/stepItem';
import StudentGradingTools from './studentGradingTools/studentGradingTools';
import * as angular from 'angular';
import { StepInfoComponent } from '../../../../site/src/app/classroom-monitor/step-info/step-info.component';
import { downgradeComponent } from '@angular/upgrade/static';

const StudentGrading = angular
  .module('studentGrading', [])
  .directive(
    'stepInfo',
    downgradeComponent({ component: StepInfoComponent }) as angular.IDirectiveFactory
  )
  .component('stepItem', StepItem)
  .component('studentGradingTools', StudentGradingTools);

export default StudentGrading;
