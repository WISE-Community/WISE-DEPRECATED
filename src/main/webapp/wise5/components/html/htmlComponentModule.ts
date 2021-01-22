'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { HTMLService } from './htmlService';
import HTMLController from './htmlController';

const htmlComponentModule = angular
  .module('htmlComponentModule', [])
  .service('HTMLService', downgradeInjectable(HTMLService))
  .controller('HTMLController', HTMLController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/html/i18n');
    }
  ]);

export default htmlComponentModule;
