'use strict';

import StepInfo from './stepInfo/stepInfo';
import StepItem from './stepItem/stepItem';
import StudentGradingTools from './studentGradingTools/studentGradingTools';

let StudentGrading = angular.module('studentGrading', []);

StudentGrading.component('stepInfo', StepInfo);
StudentGrading.component('stepItem', StepItem);
StudentGrading.component('studentGradingTools', StudentGradingTools);

export default StudentGrading;
