'use strict';

//import AccountMenu from './accountMenu/accountMenu';
import MainMenu from './mainMenu/mainMenu';
import SideMenu from './sideMenu/sideMenu';
import StepTools from './stepTools/stepTools';
import Toolbar from './toolbar/toolbar';
import TopBar from './topBar/topBar';

const SharedComponents = angular.module('sharedComponents', []);
//SharedComponents.component('accountMenu', AccountMenu);
SharedComponents.component('mainMenu', MainMenu);
SharedComponents.component('sideMenu', SideMenu);
SharedComponents.component('stepTools', StepTools);
SharedComponents.component('toolbar', Toolbar);
SharedComponents.component('topBar', TopBar);

export default SharedComponents;
