'use strict';

import './classroomMonitorComponents/manageStudents/manageStudentsModule';
import './classroomMonitorComponents/milestones/milestones';
import './classroomMonitorComponents/nodeGrading/nodeGrading';
import './classroomMonitorComponents/nodeProgress/nodeProgress';
import './classroomMonitorComponents/studentGrading/studentGrading';
import './classroomMonitorComponents/studentProgress/studentProgress';
import './classroomMonitorComponents/shared/shared';
import './classroomMonitorComponents/notebook/notebook';
import * as angular from 'angular';

const ClassroomMonitorComponents = angular.module('classroomMonitor.components', [
  'cmShared',
  'manageStudents',
  'milestones',
  'nodeGrading',
  'nodeProgress',
  'notebook',
  'studentGrading',
  'studentProgress'
]);

export default ClassroomMonitorComponents;
