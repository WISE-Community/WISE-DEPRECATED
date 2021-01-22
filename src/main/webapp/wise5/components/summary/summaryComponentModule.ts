'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { SummaryService } from './summaryService';
import SummaryController from './summaryController';

const summaryComponentModule = angular
  .module('summaryComponentModule', ['pascalprecht.translate'])
  .service('SummaryService', downgradeInjectable(SummaryService))
  .controller('SummaryController', SummaryController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/summary/i18n');
    }
  ]);

export default summaryComponentModule;
