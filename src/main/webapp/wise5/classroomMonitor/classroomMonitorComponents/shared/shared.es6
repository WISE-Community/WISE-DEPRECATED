'use strict';

//import AccountMenu from './accountMenu/accountMenu';
import AlertStatusCorner from './alertStatusCorner/alertStatusCorner';
import AlertStatusIcon from './alertStatusIcon/alertStatusIcon';
import ComponentGrading from './componentGrading/componentGrading';
import ComponentNewWorkBadge from './componentNewWorkBadge/componentNewWorkBadge';
import ComponentRevisionsInfo from './componentRevisionsInfo/componentRevisionsInfo';
import MainMenu from './mainMenu/mainMenu';
import NodeCompletionIcon from './nodeCompletionIcon/nodeCompletionIcon';
import NodeIcon from './nodeIcon/nodeIcon';
import NodeInfo from './nodeInfo/nodeInfo';
import NotificationsMenu from './notificationsMenu/notificationsMenu';
import PauseScreensMenu from './pauseScreensMenu/pauseScreensMenu'
import PeriodSelect from './periodSelect/periodSelect';
import SideMenu from './sideMenu/sideMenu';
import StatusIcon from './statusIcon/statusIcon';
import Toolbar from './toolbar/toolbar';
import TopBar from './topBar/topBar';
import WorkgroupComponentRevisions from './workgroupComponentRevisions/workgroupComponentRevisions';
import WorkgroupNodeGrading from './workgroupNodeGrading/workgroupNodeGrading';
import WorkgroupNodeScore from './workgroupNodeScore/workgroupNodeScore';
import WorkgroupNodeStatus from './workgroupNodeStatus/workgroupNodeStatus';
import WorkgroupSelect from './workgroupSelect/workgroupSelect';

let Shared = angular.module('shared', []);

//Shared.component('accountMenu', AccountMenu);
Shared.component('alertStatusCorner', AlertStatusCorner);
Shared.component('alertStatusIcon', AlertStatusIcon);
Shared.component('componentGrading', ComponentGrading);
Shared.component('componentNewWorkBadge', ComponentNewWorkBadge);
Shared.component('componentRevisionsInfo', ComponentRevisionsInfo);
Shared.component('mainMenu', MainMenu);
Shared.component('notificationsMenu', NotificationsMenu);
Shared.component('nodeCompletionIcon', NodeCompletionIcon);
Shared.component('nodeIcon', NodeIcon);
Shared.component('nodeInfo', NodeInfo);
Shared.component('pauseScreensMenu', PauseScreensMenu);
Shared.component('periodSelect', PeriodSelect);
Shared.component('sideMenu', SideMenu);
Shared.component('statusIcon', StatusIcon);
Shared.component('toolbar', Toolbar);
Shared.component('topBar', TopBar);
Shared.component('workgroupComponentRevisions', WorkgroupComponentRevisions);
Shared.component('workgroupNodeGrading', WorkgroupNodeGrading);
Shared.component('workgroupNodeScore', WorkgroupNodeScore);
Shared.component('workgroupNodeStatus', WorkgroupNodeStatus);
Shared.component('workgroupSelect', WorkgroupSelect);

export default Shared;
