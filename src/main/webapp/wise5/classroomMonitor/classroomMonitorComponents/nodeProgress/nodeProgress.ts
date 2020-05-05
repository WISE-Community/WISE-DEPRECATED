'use strict';

import NodeProgressView from './nodeProgressView/nodeProgressView';
import NavItem from './navItem/navItem';
import NavItemProgress from './navItemProgress/navItemProgress';
import NavItemScore from './navItemScore/navItemScore';
import WorkgroupsOnNode from './workgroupsOnNode/workgroupsOnNode';
import WorkgroupProgress from './workgroupProgress/workgroupProgress';
import * as angular from 'angular';

const NodeProgress = angular
  .module('nodeProgress', [])
  .component('nodeProgressView', NodeProgressView)
  .component('navItem', NavItem)
  .component('navItemProgress', NavItemProgress)
  .component('navItemScore', NavItemScore)
  .component('workgroupsOnNode', WorkgroupsOnNode)
  .component('workgroupProgress', WorkgroupProgress);

export default NodeProgress;
