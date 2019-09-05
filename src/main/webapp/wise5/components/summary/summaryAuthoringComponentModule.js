'use strict';

import SummaryService from './summaryService';
import SummaryController from './summaryController';
import SummaryAuthoringController from './summaryAuthoringController';

const summaryAuthoringComponentModule = angular.module('summaryAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service('SummaryService', SummaryService)
  .controller('SummaryController', SummaryController)
  .controller('SummaryAuthoringController', SummaryAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/summary/i18n');
    }
  ]);

export default summaryAuthoringComponentModule;
