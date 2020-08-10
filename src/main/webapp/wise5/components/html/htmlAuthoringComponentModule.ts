'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { HTMLService } from './htmlService';
import HTMLController from './htmlController';
import HTMLAuthoringController from './htmlAuthoringController';

const htmlComponentModule = angular.module('htmlAuthoringComponentModule', [])
  .service('HTMLService', downgradeInjectable(HTMLService))
  .controller('HTMLController', HTMLController)
  .controller('HTMLAuthoringController', HTMLAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/html/i18n');
    }
  ]);

export default htmlComponentModule;
