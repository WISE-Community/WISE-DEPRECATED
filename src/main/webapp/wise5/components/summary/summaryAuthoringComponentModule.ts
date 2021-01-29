'use strict';

import * as angular from 'angular';
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { SummaryService } from './summaryService';
import { EditSummaryAdvancedComponent } from './edit-summary-advanced/edit-summary-advanced.component';
import { SummaryAuthoring } from './summary-authoring/summary-authoring.component';

const summaryAuthoringComponentModule = angular
  .module('summaryAuthoringComponentModule', ['pascalprecht.translate'])
  .service('SummaryService', downgradeInjectable(SummaryService))
  .directive(
    'summaryAuthoring',
    downgradeComponent({ component: SummaryAuthoring }) as angular.IDirectiveFactory
  )
  .component('editSummaryAdvanced', EditSummaryAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/summary/i18n');
    }
  ]);

export default summaryAuthoringComponentModule;
