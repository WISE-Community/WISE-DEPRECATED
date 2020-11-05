'use strict';

import * as angular from 'angular';
import { downgradeComponent } from '@angular/upgrade/static';
import { HelpIconComponent } from './themeComponents/helpIcon/help-icon.component';
import NavItemController from './themeComponents/navItem/navItemController';
import StepToolsCtrl from './themeComponents/stepTools/stepToolsController';
import { NodeStatusIcon } from './themeComponents/nodeStatusIcon/node-status-icon.component';

const NavItem = {
  bindings: {
    nodeId: '<',
    showPosition: '<',
    type: '<'
  },
  template: '<ng-include src="::navitemCtrl.getTemplateUrl()"></ng-include>',
  controller: 'NavItemController as navitemCtrl'
}

const StepTools = {
  bindings: {
    showPosition: '<'
  },
  template: '<ng-include src="::stepToolsCtrl.getTemplateUrl()"></ng-include>',
  controller: 'StepToolsCtrl as stepToolsCtrl'
}

const ThemeComponents = angular.module('theme.components', [])
  .controller('NavItemController', NavItemController)
  .controller('StepToolsCtrl', StepToolsCtrl)
  .directive('helpIcon',
    downgradeComponent({ component: HelpIconComponent }) as angular.IDirectiveFactory)
  .component('navItem', NavItem)
  .component('nodeStatusIcon', NodeStatusIcon)
  .component('stepTools', StepTools);

export default ThemeComponents;
