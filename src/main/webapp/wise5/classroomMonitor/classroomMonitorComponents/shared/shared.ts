'use strict';

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
import PauseScreensMenu from './pauseScreensMenu/pauseScreensMenu';
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
import * as angular from 'angular';

const Shared = angular
  .module('shared', [])
  .component('alertStatusCorner', AlertStatusCorner)
  .component('alertStatusIcon', AlertStatusIcon)
  .component('componentGrading', ComponentGrading)
  .component('componentNewWorkBadge', ComponentNewWorkBadge)
  .component('componentRevisionsInfo', ComponentRevisionsInfo)
  .component('cmMainMenu', MainMenu)
  .component('notificationsMenu', NotificationsMenu)
  .component('nodeCompletionIcon', NodeCompletionIcon)
  .component('nodeIcon', NodeIcon)
  .component('nodeInfo', NodeInfo)
  .component('pauseScreensMenu', PauseScreensMenu)
  .component('periodSelect', PeriodSelect)
  .component('cmSideMenu', SideMenu)
  .component('statusIcon', StatusIcon)
  .component('cmToolbar', Toolbar)
  .component('cmTopBar', TopBar)
  .component('workgroupComponentRevisions', WorkgroupComponentRevisions)
  .component('workgroupNodeGrading', WorkgroupNodeGrading)
  .component('workgroupNodeScore', WorkgroupNodeScore)
  .component('workgroupNodeStatus', WorkgroupNodeStatus)
  .component('workgroupSelect', WorkgroupSelect);

export default Shared;
