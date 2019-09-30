'use strict';

import SummaryService from './summaryService';
import SummaryController from './summaryController';
import SummaryAuthoringController from './summaryAuthoringController';

const summaryAuthoringComponentModule = angular.module('summaryAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service(SummaryService.name, SummaryService)
  .controller(SummaryController.name, SummaryController)
  .controller(SummaryAuthoringController.name, SummaryAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/summary/i18n');
    }
  ]);

export default summaryAuthoringComponentModule;
