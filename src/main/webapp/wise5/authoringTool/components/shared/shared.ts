'use strict';

import MainMenu from './mainMenu/mainMenu';
import SideMenu from './sideMenu/sideMenu';
import StepTools from './stepTools/stepTools';
import Toolbar from './toolbar/toolbar';
import TopBar from './topBar/topBar';
import * as angular from 'angular';

const SharedComponents = angular
  .module('sharedComponents', [])
  .component('atMainMenu', MainMenu)
  .component('atSideMenu', SideMenu)
  .component('atStepTools', StepTools)
  .component('atToolbar', Toolbar)
  .component('atTopBar', TopBar);

export default SharedComponents;
