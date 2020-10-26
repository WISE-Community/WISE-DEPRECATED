'use strict';

import * as angular from 'angular';
import { TableService } from './tableService';
import { downgradeInjectable } from '@angular/upgrade/static';
import TableAuthoring from './tableAuthoring';

const tableAuthoringComponentModule = angular
  .module('tableAuthoringComponentModule', ['pascalprecht.translate'])
  .service('TableService', downgradeInjectable(TableService))
  .component('tableAuthoring', TableAuthoring)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/table/i18n');
    }
  ]);

export default tableAuthoringComponentModule;
