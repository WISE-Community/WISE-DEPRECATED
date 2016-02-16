
'use strict';

import NavItemController from './themeComponents/navItem/navItemController';
import StepToolsCtrl from './themeComponents/stepTools/stepToolsController';
import NodeStatusIconCtrl from './themeComponents/nodeStatusIcon/nodeStatusIconController';
import ProjectStatusController from './themeComponents/projectStatus/projectStatusController';
import ThemeController from './themeController';
import ThemeComponents from './themeComponents';

import './js/webfonts';

let themeModule = angular.module('theme', ['theme.components'])
    .controller(NavItemController.name, NavItemController)
    .controller(StepToolsCtrl.name, StepToolsCtrl)
    .controller(NodeStatusIconCtrl.name, NodeStatusIconCtrl)
    .controller(ProjectStatusController.name, ProjectStatusController)
    .controller(ThemeController.name, ThemeController);

export default themeModule;
