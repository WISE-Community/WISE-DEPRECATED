'use strict';

import SummaryService from './summaryService';
import SummaryController from './summaryController';

const summaryComponentModule = angular.module('summaryComponentModule', [
    'pascalprecht.translate'
  ])
  .service('SummaryService', SummaryService)
  .controller('SummaryController', SummaryController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/summary/i18n');
    }
  ]);

export default summaryComponentModule;
