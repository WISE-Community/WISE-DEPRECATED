'use strict';

import TableService from './tableService';
import TableController from './tableController';
import TableAuthoringController from './tableAuthoringController';

let tableAuthoringComponentModule = angular.module('tableAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service(TableService.name, TableService)
  .controller(TableController.name, TableController)
  .controller(TableAuthoringController.name, TableAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/table/i18n');
    }
  ]);

export default tableAuthoringComponentModule;
