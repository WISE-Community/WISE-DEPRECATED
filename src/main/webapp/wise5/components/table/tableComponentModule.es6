'use strict';

import TableService from './tableService';
import TableController from './tableController';

let tableComponentModule = angular.module('tableComponentModule', [
    'pascalprecht.translate'
  ])
  .service(TableService.name, TableService)
  .controller(TableController.name, TableController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/table/i18n');
    }
  ]);

export default tableComponentModule;
