'use strict';

import ProjectProgress from './projectProgress/projectProgress';

let StudentProgress = angular.module('studentProgress', []);

StudentProgress.component('projectProgress', ProjectProgress);

export default StudentProgress;
