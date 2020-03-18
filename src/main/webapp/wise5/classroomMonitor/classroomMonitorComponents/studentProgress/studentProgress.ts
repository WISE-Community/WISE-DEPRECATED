'use strict';

import ProjectProgress from './projectProgress/projectProgress';
import * as angular from 'angular';

const StudentProgress = angular
  .module('studentProgress', [])
  .component('projectProgress', ProjectProgress);

export default StudentProgress;
