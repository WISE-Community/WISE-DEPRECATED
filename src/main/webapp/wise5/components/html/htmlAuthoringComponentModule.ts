'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { HTMLService } from './htmlService';
import HTMLAuthoring from './htmlAuthoringController';

const htmlComponentModule = angular.module('htmlAuthoringComponentModule', [])
  .service('HTMLService', downgradeInjectable(HTMLService))
  .component('htmlAuthoring', HTMLAuthoring)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/html/i18n');
    }
  ]);

export default htmlComponentModule;
