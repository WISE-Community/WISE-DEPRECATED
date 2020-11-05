'use strict';

import AlertStatusCorner from './alertStatusCorner/alertStatusCorner';
import AlertStatusIcon from './alertStatusIcon/alertStatusIcon';
import ComponentGrading from './componentGrading/componentGrading';
import { ComponentNewWorkBadgeComponent } from '../../../../site/src/app/classroom-monitor/component-new-work-badge/component-new-work-badge.component';
import ComponentRevisionsInfo from './componentRevisionsInfo/componentRevisionsInfo';
import MainMenu from './mainMenu/mainMenu';
import NodeCompletionIcon from './nodeCompletionIcon/nodeCompletionIcon';
import NodeInfo from './nodeInfo/nodeInfo';
import NotificationsMenu from './notificationsMenu/notificationsMenu';
import PauseScreensMenu from './pauseScreensMenu/pauseScreensMenu';
import PeriodSelect from './periodSelect/periodSelect';
import { StatusIconComponent } from '../../../../site/src/app/classroom-monitor/status-icon/status-icon.component';
import Toolbar from './toolbar/toolbar';
import TopBar from './topBar/topBar';
import WorkgroupComponentRevisions from './workgroupComponentRevisions/workgroupComponentRevisions';
import WorkgroupNodeGrading from './workgroupNodeGrading/workgroupNodeGrading';
import WorkgroupNodeStatus from './workgroupNodeStatus/workgroupNodeStatus';
import WorkgroupSelect from './workgroupSelect/workgroupSelect';
import * as angular from 'angular';
import { WorkgroupNodeScoreComponent } from './workgroupNodeScore/workgroup-node-score.component';
import { downgradeComponent } from '@angular/upgrade/static';

const Shared = angular
  .module('cmShared', [])
  .component('alertStatusCorner', AlertStatusCorner)
  .component('alertStatusIcon', AlertStatusIcon)
  .component('componentGrading', ComponentGrading)
  .directive('componentNewWorkBadge',
      downgradeComponent({ component: ComponentNewWorkBadgeComponent }) as angular.IDirectiveFactory)
  .component('componentRevisionsInfo', ComponentRevisionsInfo)
  .component('cmMainMenu', MainMenu)
  .component('notificationsMenu', NotificationsMenu)
  .component('nodeCompletionIcon', NodeCompletionIcon)
  .component('nodeInfo', NodeInfo)
  .component('pauseScreensMenu', PauseScreensMenu)
  .component('periodSelect', PeriodSelect)
  .directive('statusIcon',
      downgradeComponent({ component: StatusIconComponent }) as angular.IDirectiveFactory)
  .component('cmToolbar', Toolbar)
  .component('cmTopBar', TopBar)
  .component('workgroupComponentRevisions', WorkgroupComponentRevisions)
  .component('workgroupNodeGrading', WorkgroupNodeGrading)
  .directive('workgroupNodeScore',
      downgradeComponent({ component: WorkgroupNodeScoreComponent}) as angular.IDirectiveFactory)
  .component('workgroupNodeStatus', WorkgroupNodeStatus)
  .component('workgroupSelect', WorkgroupSelect);

export default Shared;
