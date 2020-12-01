'use strict';

import NodeGradingView from './nodeGradingView/nodeGradingView';
import ComponentSelect from './componentSelect/componentSelect';
import StepTools from './stepTools/stepTools';
import WorkgroupItem from './workgroupItem/workgroupItem';
import * as angular from 'angular';
import { WorkgroupInfoComponent } from './workgroupInfo/workgroup-info.component';
import { downgradeComponent } from '@angular/upgrade/static';

const NodeGrading = angular
  .module('nodeGrading', [])
  .component('nodeGradingView', NodeGradingView)
  .component('componentSelect', ComponentSelect)
  .component('cmStepTools', StepTools)
  .directive('workgroupInfo',
      downgradeComponent({ component: WorkgroupInfoComponent }) as angular.IDirectiveFactory)
  .component('workgroupItem', WorkgroupItem);

export default NodeGrading;
