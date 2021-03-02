'use strict';

import * as angular from 'angular';
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { EmbeddedService } from './embeddedService';
import { EditEmbeddedAdvancedComponent } from './edit-embedded-advanced/edit-embedded-advanced.component';
import { EmbeddedAuthoring } from './embedded-authoring/embedded-authoring.component';

const embeddedAuthoringComponentModule = angular
  .module('embeddedAuthoringComponentModule', ['pascalprecht.translate'])
  .service('EmbeddedService', downgradeInjectable(EmbeddedService))
  .directive(
    'embeddedAuthoring',
    downgradeComponent({ component: EmbeddedAuthoring }) as angular.IDirectiveFactory
  )
  .component('editEmbeddedAdvanced', EditEmbeddedAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/embedded/i18n');
    }
  ]);

export default embeddedAuthoringComponentModule;
