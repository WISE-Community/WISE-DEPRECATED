'use strict';

import ComponentGrading from './componentGrading/componentGrading';
import { ComponentNewWorkBadgeComponent } from '../../../../site/src/app/classroom-monitor/component-new-work-badge/component-new-work-badge.component';
import ComponentRevisionsInfo from './componentRevisionsInfo/componentRevisionsInfo';
import MainMenu from './mainMenu/mainMenu';
import NodeInfo from './nodeInfo/nodeInfo';
import NotificationsMenu from './notificationsMenu/notificationsMenu';
import PauseScreensMenu from './pauseScreensMenu/pauseScreensMenu';
import PeriodSelect from './periodSelect/periodSelect';
import { StatusIconComponent } from '../../../../site/src/app/classroom-monitor/status-icon/status-icon.component';
import Toolbar from './toolbar/toolbar';
import TopBar from './topBar/topBar';
import WorkgroupComponentRevisions from './workgroupComponentRevisions/workgroupComponentRevisions';
import WorkgroupNodeGrading from './workgroupNodeGrading/workgroupNodeGrading';
import { WorkgroupNodeStatusComponent } from '../../../../site/src/app/classroom-monitor/workgroup-node-status/workgroup-node-status.component';
import { WorkgroupSelectAutocompleteComponent } from '../../../../site/src/app/classroom-monitor/workgroup-select/workgroup-select-autocomplete/workgroup-select-autocomplete.component';
import { WorkgroupSelectDropdownComponent } from '../../../../site/src/app/classroom-monitor/workgroup-select/workgroup-select-dropdown/workgroup-select-dropdown.component';
import { AlertStatusCornerComponent } from '../../../../site/src/app/classroom-monitor/alert-status-corner/alert-status-corner.component';
import * as angular from 'angular';
import { WorkgroupNodeScoreComponent } from './workgroupNodeScore/workgroup-node-score.component';
import { downgradeComponent } from '@angular/upgrade/static';

const Shared = angular
  .module('cmShared', [])
  .directive(
    'alertStatusCorner',
    downgradeComponent({ component: AlertStatusCornerComponent }) as angular.IDirectiveFactory
  )
  .component('componentGrading', ComponentGrading)
  .directive(
    'componentNewWorkBadge',
    downgradeComponent({ component: ComponentNewWorkBadgeComponent }) as angular.IDirectiveFactory
  )
  .component('componentRevisionsInfo', ComponentRevisionsInfo)
  .component('cmMainMenu', MainMenu)
  .component('notificationsMenu', NotificationsMenu)
  .component('nodeInfo', NodeInfo)
  .component('pauseScreensMenu', PauseScreensMenu)
  .component('periodSelect', PeriodSelect)
  .directive(
    'statusIcon',
    downgradeComponent({ component: StatusIconComponent }) as angular.IDirectiveFactory
  )
  .component('cmToolbar', Toolbar)
  .component('cmTopBar', TopBar)
  .component('workgroupComponentRevisions', WorkgroupComponentRevisions)
  .component('workgroupNodeGrading', WorkgroupNodeGrading)
  .directive(
    'workgroupNodeScore',
    downgradeComponent({ component: WorkgroupNodeScoreComponent }) as angular.IDirectiveFactory
  )
  .directive(
    'workgroupNodeStatus',
    downgradeComponent({ component: WorkgroupNodeStatusComponent }) as angular.IDirectiveFactory
  )
  .directive(
    'workgroupSelectAutocomplete',
    downgradeComponent({
      component: WorkgroupSelectAutocompleteComponent
    }) as angular.IDirectiveFactory
  )
  .directive(
    'workgroupSelectDropdown',
    downgradeComponent({ component: WorkgroupSelectDropdownComponent }) as angular.IDirectiveFactory
  );

export default Shared;
