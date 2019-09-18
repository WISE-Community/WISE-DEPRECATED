'use strict';

import SummaryService from './summaryService';
import SummaryController from './summaryController';

const summaryComponentModule = angular.module('summaryComponentModule', [
    'pascalprecht.translate'
  ])
  .service(SummaryService.name, SummaryService)
  .controller(SummaryController.name, SummaryController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/summary/i18n');
    }
  ]);

export default summaryComponentModule;
