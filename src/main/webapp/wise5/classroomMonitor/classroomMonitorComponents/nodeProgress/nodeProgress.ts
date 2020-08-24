'use strict';

import NodeProgressView from './nodeProgressView/nodeProgressView';
import NavItem from './navItem/navItem';
import NavItemProgress from './navItemProgress/navItemProgress';
import WorkgroupsOnNode from './workgroupsOnNode/workgroupsOnNode';
import WorkgroupProgress from './workgroupProgress/workgroupProgress';
import * as angular from 'angular';
import { downgradeComponent } from '@angular/upgrade/static';
import { NavItemScoreComponent } from './navItemScore/nav-item-score.component';

const NodeProgress = angular
  .module('nodeProgress', [])
  .component('nodeProgressView', NodeProgressView)
  .component('navItem', NavItem)
  .component('navItemProgress', NavItemProgress)
  .directive('navItemScore',
      downgradeComponent({ component: NavItemScoreComponent}) as angular.IDirectiveFactory)
  .component('workgroupsOnNode', WorkgroupsOnNode)
  .component('workgroupProgress', WorkgroupProgress);

export default NodeProgress;
