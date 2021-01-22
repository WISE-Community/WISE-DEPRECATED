'use strict';

import { ComponentSelectComponent } from '../../../../site/src/app/classroom-monitor/component-select/component-select.component';
import NodeGradingView from './nodeGradingView/nodeGradingView';
import StepTools from './stepTools/stepTools';
import WorkgroupItem from './workgroupItem/workgroupItem';
import * as angular from 'angular';
import { WorkgroupInfoComponent } from './workgroupInfo/workgroup-info.component';
import { downgradeComponent } from '@angular/upgrade/static';

const NodeGrading = angular
  .module('nodeGrading', [])
  .component('nodeGradingView', NodeGradingView)
  .directive(
    'componentSelect',
    downgradeComponent({ component: ComponentSelectComponent }) as angular.IDirectiveFactory
  )
  .component('cmStepTools', StepTools)
  .directive(
    'workgroupInfo',
    downgradeComponent({ component: WorkgroupInfoComponent }) as angular.IDirectiveFactory
  )
  .component('workgroupItem', WorkgroupItem);

export default NodeGrading;
