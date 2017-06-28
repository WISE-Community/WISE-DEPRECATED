'use strict';

//import AccountMenu from './accountMenu/accountMenu';
import AlertStatusCorner from './alertStatusCorner/alertStatusCorner';
import AlertStatusIcon from './alertStatusIcon/alertStatusIcon';
import MainMenu from './mainMenu/mainMenu';
import NodeCompletionIcon from './nodeCompletionIcon/nodeCompletionIcon';
import NodeIcon from './nodeIcon/nodeIcon';
import NotificationsMenu from './notificationsMenu/notificationsMenu';
import PauseScreensMenu from './pauseScreensMenu/pauseScreensMenu'
import PeriodSelect from './periodSelect/periodSelect';
import SideMenu from './sideMenu/sideMenu';
import StatusIcon from './statusIcon/statusIcon';
import Toolbar from './toolbar/toolbar';
import TopBar from './topBar/topBar';
import WorkgroupComponentRevisions from './workgroupComponentRevisions/workgroupComponentRevisions';
import WorkgroupSelect from './workgroupSelect/workgroupSelect';

let Shared = angular.module('shared', []);

//Shared.component('accountMenu', AccountMenu);
Shared.component('alertStatusCorner', AlertStatusCorner);
Shared.component('alertStatusIcon', AlertStatusIcon);
Shared.component('mainMenu', MainMenu);
Shared.component('notificationsMenu', NotificationsMenu);
Shared.component('nodeCompletionIcon', NodeCompletionIcon);
Shared.component('nodeIcon', NodeIcon);
Shared.component('pauseScreensMenu', PauseScreensMenu);
Shared.component('periodSelect', PeriodSelect);
Shared.component('sideMenu', SideMenu);
Shared.component('statusIcon', StatusIcon);
Shared.component('toolbar', Toolbar);
Shared.component('topBar', TopBar);
Shared.component('workgroupComponentRevisions', WorkgroupComponentRevisions);
Shared.component('workgroupSelect', WorkgroupSelect);

export default Shared;
