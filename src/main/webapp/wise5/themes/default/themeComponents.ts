'use strict';

import * as angular from 'angular';
import { downgradeComponent } from '@angular/upgrade/static';
import { HelpIconComponent } from './themeComponents/helpIcon/help-icon.component';
import StepToolsCtrl from './themeComponents/stepTools/stepToolsController';
import { NodeStatusIcon } from './themeComponents/nodeStatusIcon/node-status-icon.component';

const StepTools = {
  bindings: {
    showPosition: '<'
  },
  template: '<ng-include src="::stepToolsCtrl.getTemplateUrl()"></ng-include>',
  controller: 'StepToolsCtrl as stepToolsCtrl'
};

const ThemeComponents = angular
  .module('theme.components', [])
  .controller('StepToolsCtrl', StepToolsCtrl)
  .directive(
    'helpIcon',
    downgradeComponent({ component: HelpIconComponent }) as angular.IDirectiveFactory
  )
  .directive(
    'nodeStatusIcon',
    downgradeComponent({ component: NodeStatusIcon }) as angular.IDirectiveFactory
  )
  .component('stepTools', StepTools);

export default ThemeComponents;
