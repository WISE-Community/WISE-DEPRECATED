'use strict';

import StepTools from './stepTools/stepTools';
import WorkgroupItem from './workgroupItem/workgroupItem';
import WorkgroupNodeGrading from './workgroupNodeGrading/workgroupNodeGrading';
import WorkgroupNodeScore from './workgroupNodeScore/workgroupNodeScore';
import WorkgroupNodeStatus from './workgroupNodeStatus/workgroupNodeStatus';

let NodeGrading = angular.module('nodeGrading', []);

NodeGrading.component('stepTools', StepTools);
NodeGrading.component('workgroupItem', WorkgroupItem);
NodeGrading.component('workgroupNodeScore', WorkgroupNodeScore);
NodeGrading.component('workgroupNodeGrading', WorkgroupNodeGrading);
NodeGrading.component('workgroupNodeStatus', WorkgroupNodeStatus);

export default NodeGrading;
