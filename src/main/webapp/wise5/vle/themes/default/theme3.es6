
'use strict';

import NavItemController from './navItemController';
import StepToolsCtrl from './stepToolsController';
import NodeStatusIconCtrl from './nodeStatusIconController';
import ProjectStatusController from './projectStatusController';
import ThemeController from './themeController';

import './js/webfonts';

let themeModule = angular.module('vle.theme', [])
    .controller(NavItemController.name, NavItemController)
    .controller(StepToolsCtrl.name, StepToolsCtrl)
    .controller(NodeStatusIconCtrl.name, NodeStatusIconCtrl)
    .controller(ProjectStatusController.name, ProjectStatusController)
    .controller(ThemeController.name, ThemeController);

export default themeModule;
