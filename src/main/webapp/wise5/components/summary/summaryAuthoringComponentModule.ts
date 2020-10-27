'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { SummaryService } from './summaryService';
import SummaryAuthoring from './summaryAuthoring';

const summaryAuthoringComponentModule = angular
  .module('summaryAuthoringComponentModule', ['pascalprecht.translate'])
  .service('SummaryService', downgradeInjectable(SummaryService))
  .component('summaryAuthoring', SummaryAuthoring)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/summary/i18n');
    }
  ]);

export default summaryAuthoringComponentModule;
