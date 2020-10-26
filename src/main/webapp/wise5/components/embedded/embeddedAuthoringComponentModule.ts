'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { EmbeddedService } from './embeddedService';
import EmbeddedAuthoring from './embeddedAuthoring';

const embeddedAuthoringComponentModule = angular
  .module('embeddedAuthoringComponentModule', ['pascalprecht.translate'])
  .service('EmbeddedService', downgradeInjectable(EmbeddedService))
  .component('embeddedAuthoring', EmbeddedAuthoring)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/embedded/i18n');
    }
  ]);

export default embeddedAuthoringComponentModule;
