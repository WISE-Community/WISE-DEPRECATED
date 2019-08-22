'use strict';

import TableService from './tableService';
import TableController from './tableController';
import TableAuthoringController from './tableAuthoringController';

let tableAuthoringComponentModule = angular.module('tableAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service('TableService', TableService)
  .controller('TableController', TableController)
  .controller('TableAuthoringController', TableAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/table/i18n');
    }
  ]);

export default tableAuthoringComponentModule;
