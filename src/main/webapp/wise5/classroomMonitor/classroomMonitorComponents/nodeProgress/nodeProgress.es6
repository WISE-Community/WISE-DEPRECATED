'use strict';

import WorkgroupsOnNode from './workgroupsOnNode/workgroupsOnNode';
import NavItem from './navItem/navItem';

let NodeProgress = angular.module('nodeProgress', []);

NodeProgress.component('workgroupsOnNode', WorkgroupsOnNode);
NodeProgress.component('navItem', NavItem);

export default NodeProgress;
