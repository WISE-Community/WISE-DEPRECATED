'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { SummaryService } from './summaryService';
import SummaryAuthoring from './summaryAuthoring';
import { EditSummaryAdvancedComponent } from './edit-summary-advanced/edit-summary-advanced.component';

const summaryAuthoringComponentModule = angular
  .module('summaryAuthoringComponentModule', ['pascalprecht.translate'])
  .service('SummaryService', downgradeInjectable(SummaryService))
  .component('summaryAuthoring', SummaryAuthoring)
  .component('editSummaryAdvanced', EditSummaryAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/summary/i18n');
    }
  ]);

export default summaryAuthoringComponentModule;
