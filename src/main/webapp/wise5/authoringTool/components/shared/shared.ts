'use strict';

import MainMenu from './mainMenu/mainMenu';
import StepTools from './stepTools/stepTools';
import Toolbar from './toolbar/toolbar';
import TopBar from './topBar/topBar';
import * as angular from 'angular';
import PreviewComponent from '../preview-component/previewComponent';

const SharedComponents = angular
  .module('atShared', [])
  .component('atMainMenu', MainMenu)
  .component('atStepTools', StepTools)
  .component('atToolbar', Toolbar)
  .component('atTopBar', TopBar)
  .component('previewComponent', PreviewComponent);

export default SharedComponents;
