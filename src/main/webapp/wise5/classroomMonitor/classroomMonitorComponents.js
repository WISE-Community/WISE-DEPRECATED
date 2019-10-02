'use strict';

import './classroomMonitorComponents/milestones/milestones';
import './classroomMonitorComponents/nodeGrading/nodeGrading';
import './classroomMonitorComponents/nodeProgress/nodeProgress';
import './classroomMonitorComponents/studentGrading/studentGrading';
import './classroomMonitorComponents/studentProgress/studentProgress';
import './classroomMonitorComponents/shared/shared';

const ClassroomMonitorComponents = angular.module('classroomMonitor.components', ['milestones', 'nodeGrading', 'nodeProgress', 'studentGrading', 'studentProgress', 'shared']);

export default ClassroomMonitorComponents;
