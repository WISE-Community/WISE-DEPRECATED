'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { TableService } from './tableService';
import TableController from './tableController';

let tableComponentModule = angular
  .module('tableComponentModule', ['pascalprecht.translate'])
  .service('TableService', downgradeInjectable(TableService))
  .controller('TableController', TableController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/table/i18n');
    }
  ]);

export default tableComponentModule;
