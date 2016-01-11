
'use strict';

import NavItemController from './navItemController';
import StepToolsCtrl from './stepToolsController';
import NodeStatusIconCtrl from './nodeStatusIconController';
import ProjectStatusController from './projectStatusController';
import ThemeController from './themeController';

angular.module('vle').controller(NavItemController.name, NavItemController);
angular.module('vle').controller(StepToolsCtrl.name, StepToolsCtrl);
angular.module('vle').controller(NodeStatusIconCtrl.name, NodeStatusIconCtrl);
angular.module('vle').controller(ProjectStatusController.name, ProjectStatusController);
angular.module('vle').controller(ThemeController.name, ThemeController);