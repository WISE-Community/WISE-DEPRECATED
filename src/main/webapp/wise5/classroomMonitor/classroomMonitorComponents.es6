'use strict';

import Milestones from './classroomMonitorComponents/milestones/milestones';
import NodeGrading from './classroomMonitorComponents/nodeGrading/nodeGrading';
import NodeProgress from './classroomMonitorComponents/nodeProgress/nodeProgress';
import StudentProgress from './classroomMonitorComponents/studentProgress/studentProgress';
import Shared from './classroomMonitorComponents/shared/shared';

let ClassroomMonitorComponents = angular.module('classroomMonitor.components', ['milestones', 'nodeGrading', 'nodeProgress', 'studentProgress', 'shared']);

export default ClassroomMonitorComponents;
