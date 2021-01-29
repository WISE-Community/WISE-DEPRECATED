'use strict';

import * as angular from 'angular';
import { TableService } from './tableService';
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { EditTableAdvancedComponent } from './edit-table-advanced/edit-table-advanced.component';
import { TableAuthoring } from './table-authoring/table-authoring.component';

const tableAuthoringComponentModule = angular
  .module('tableAuthoringComponentModule', ['pascalprecht.translate'])
  .service('TableService', downgradeInjectable(TableService))
  .directive(
    'tableAuthoring',
    downgradeComponent({ component: TableAuthoring }) as angular.IDirectiveFactory
  )
  .component('editTableAdvanced', EditTableAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/table/i18n');
    }
  ]);

export default tableAuthoringComponentModule;
