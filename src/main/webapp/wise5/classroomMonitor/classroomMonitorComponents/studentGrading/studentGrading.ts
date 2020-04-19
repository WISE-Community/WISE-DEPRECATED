'use strict';

import StepInfo from './stepInfo/stepInfo';
import StepItem from './stepItem/stepItem';
import StudentGradingTools from './studentGradingTools/studentGradingTools';
import * as angular from 'angular';

const StudentGrading = angular
  .module('studentGrading', [])
  .component('stepInfo', StepInfo)
  .component('stepItem', StepItem)
  .component('studentGradingTools', StudentGradingTools);

export default StudentGrading;
