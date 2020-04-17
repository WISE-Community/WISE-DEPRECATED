'use strict';

import NodeGradingView from './nodeGradingView/nodeGradingView';
import ComponentSelect from './componentSelect/componentSelect';
import StepTools from './stepTools/stepTools';
import WorkgroupInfo from './workgroupInfo/workgroupInfo';
import WorkgroupItem from './workgroupItem/workgroupItem';
import * as angular from 'angular';

const NodeGrading = angular
  .module('nodeGrading', [])
  .component('nodeGradingView', NodeGradingView)
  .component('componentSelect', ComponentSelect)
  .component('stepTools', StepTools)
  .component('workgroupInfo', WorkgroupInfo)
  .component('workgroupItem', WorkgroupItem);

export default NodeGrading;
