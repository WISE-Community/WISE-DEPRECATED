'use strict';

import * as angular from 'angular';
import Annotation from './annotation/annotation';
import Compile from './compile/compile';
import Component from './component/component';
import ComponentAnnotations from './componentAnnotations/componentAnnotations';
import DisableDeleteKeypress from './disableDeleteKeypress/disableDeleteKeypress';
import Draggable from './draggable/draggable';
import GlobalAnnotations from './globalAnnotations/globalAnnotations';
import GlobalAnnotationsList from './globalAnnotationsList/globalAnnotationsList';
import ListenForDeleteKeypress from './listenForDeleteKeypress/listenForDeleteKeypress';
import MilestoneReportGraph from './milestoneReportGraph/milestoneReportGraph';
import SummaryDisplay from './summaryDisplay/summaryDisplay';
import Wiselink from './wiselink/wiselink';
import Sticky from './sticky/sticky';
import { downgradeComponent } from '@angular/upgrade/static';
import { MilestoneReportDataComponent } from '../../site/src/app/teacher/milestone/milestone-report-data/milestone-report-data.component';
import { PossibleScoreComponent } from '../../site/src/app/possible-score/possible-score.component';

const Components = angular.module('components', []);

Components.component('annotation', Annotation);
Components.component('compile', Compile);
Components.component('component', Component);
Components.component('componentAnnotations', ComponentAnnotations);
Components.component('disableDeleteKeypress', DisableDeleteKeypress);
Components.component('draggable', Draggable);
Components.component('globalAnnotations', GlobalAnnotations);
Components.component('globalAnnotationsList', GlobalAnnotationsList);
Components.component('listenForDeleteKeypress', ListenForDeleteKeypress);
Components.directive('milestoneReportData',
    downgradeComponent({ component: MilestoneReportDataComponent}) as angular.IDirectiveFactory);
Components.component('milestoneReportGraph', MilestoneReportGraph);
Components.directive('possibleScore',
    downgradeComponent({ component: PossibleScoreComponent}) as angular.IDirectiveFactory);
Components.component('summaryDisplay', SummaryDisplay);
Components.component('wiselink', Wiselink);
Components.directive('sticky', Sticky);

export default Components;
