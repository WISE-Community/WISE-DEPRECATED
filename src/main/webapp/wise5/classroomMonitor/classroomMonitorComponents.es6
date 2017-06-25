'use strict';

import Milestones from './classroomMonitorComponents/milestones/milestones';
import NodeGrading from './classroomMonitorComponents/nodeGrading/nodeGrading';
import NodeProgress from './classroomMonitorComponents/nodeProgress/nodeProgress';
import Shared from './classroomMonitorComponents/shared/shared';

let ClassroomMonitorComponents = angular.module('classroomMonitor.components', ['milestones', 'nodeGrading', 'nodeProgress', 'shared']);

export default ClassroomMonitorComponents;
