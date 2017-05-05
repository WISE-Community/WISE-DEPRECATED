'use strict';

//import AccountMenu from './accountMenu/accountMenu';
import MainMenu from './mainMenu/mainMenu';
import SideMenu from './sideMenu/sideMenu';
import Toolbar from './toolbar/toolbar';
import TopBar from './topBar/topBar';

let Shared = angular.module('shared', []);

//Shared.component('accountMenu', AccountMenu);
Shared.component('mainMenu', MainMenu);
Shared.component('sideMenu', SideMenu);
Shared.component('toolbar', Toolbar);
Shared.component('topBar', TopBar);

export default Shared;
