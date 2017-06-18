'use strict';

import ComponentSelect from './componentSelect/componentSelect';
import NodeInfo from './nodeInfo/nodeInfo';
import StepTools from './stepTools/stepTools';
import WorkgroupInfo from './workgroupInfo/workgroupInfo';
import WorkgroupItem from './workgroupItem/workgroupItem';
import WorkgroupNodeGrading from './workgroupNodeGrading/workgroupNodeGrading';
import WorkgroupNodeScore from './workgroupNodeScore/workgroupNodeScore';
import WorkgroupNodeStatus from './workgroupNodeStatus/workgroupNodeStatus';

let NodeGrading = angular.module('nodeGrading', []);


NodeGrading.component('componentSelect', ComponentSelect);
NodeGrading.component('nodeInfo', NodeInfo);
NodeGrading.component('stepTools', StepTools);
NodeGrading.component('workgroupInfo', WorkgroupInfo);
NodeGrading.component('workgroupItem', WorkgroupItem);
NodeGrading.component('workgroupNodeScore', WorkgroupNodeScore);
NodeGrading.component('workgroupNodeGrading', WorkgroupNodeGrading);
NodeGrading.component('workgroupNodeStatus', WorkgroupNodeStatus);

export default NodeGrading;
