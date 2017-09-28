'use strict';

//import StudentGradingTools from './studentGradingTools/studentGradingTools';
import StepInfo from './stepInfo/stepInfo';
import StepItem from './stepItem/stepItem';

let StudentGrading = angular.module('studentGrading', []);


//StudentGrading.component('studentGradingTools', StudentGradingTools);
StudentGrading.component('stepInfo', StepInfo);
StudentGrading.component('stepItem', StepItem);

export default StudentGrading;
