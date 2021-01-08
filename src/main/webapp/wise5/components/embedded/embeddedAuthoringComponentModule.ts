'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { EmbeddedService } from './embeddedService';
import EmbeddedAuthoring from './embeddedAuthoring';
import { EditEmbeddedAdvancedComponent } from './edit-embedded-advanced/edit-embedded-advanced.component';

const embeddedAuthoringComponentModule = angular
  .module('embeddedAuthoringComponentModule', ['pascalprecht.translate'])
  .service('EmbeddedService', downgradeInjectable(EmbeddedService))
  .component('embeddedAuthoring', EmbeddedAuthoring)
  .component('editEmbeddedAdvanced', EditEmbeddedAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/embedded/i18n');
    }
  ]);

export default embeddedAuthoringComponentModule;
