'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { EmbeddedService } from './embeddedService';
import EmbeddedController from './embeddedController';

const embeddedComponentModule = angular
  .module('embeddedComponentModule', ['pascalprecht.translate'])
  .service('EmbeddedService', downgradeInjectable(EmbeddedService))
  .controller('EmbeddedController', EmbeddedController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/embedded/i18n');
    }
  ]);

export default embeddedComponentModule;
