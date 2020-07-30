'use strict';

import * as angular from 'angular';
import { TableService } from './tableService';
import TableController from './tableController';
import TableAuthoringController from './tableAuthoringController';
import { downgradeInjectable } from '@angular/upgrade/static';

const tableAuthoringComponentModule = angular
  .module('tableAuthoringComponentModule', ['pascalprecht.translate'])
  .service('TableService', downgradeInjectable(TableService))
  .controller('TableController', TableController)
  .controller('TableAuthoringController', TableAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/table/i18n');
    }
  ]);

export default tableAuthoringComponentModule;
