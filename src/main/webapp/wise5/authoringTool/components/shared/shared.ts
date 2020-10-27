'use strict';

import MainMenu from './mainMenu/mainMenu';
import SideMenu from './sideMenu/sideMenu';
import StepTools from './stepTools/stepTools';
import Toolbar from './toolbar/toolbar';
import TopBar from './topBar/topBar';
import * as angular from 'angular';
import PreviewComponent from '../preview-component/previewComponent';

const SharedComponents = angular
  .module('sharedComponents', [])
  .component('atMainMenu', MainMenu)
  .component('atSideMenu', SideMenu)
  .component('atStepTools', StepTools)
  .component('atToolbar', Toolbar)
  .component('atTopBar', TopBar)
  .component('previewComponent', PreviewComponent);

export default SharedComponents;
