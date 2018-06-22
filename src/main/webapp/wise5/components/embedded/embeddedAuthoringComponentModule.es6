'use strict';

import EmbeddedService from './embeddedService';
import EmbeddedController from './embeddedController';
import EmbeddedAuthoringController from './embeddedAuthoringController';

const embeddedAuthoringComponentModule = angular.module('embeddedAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service(EmbeddedService.name, EmbeddedService)
  .controller(EmbeddedController.name, EmbeddedController)
  .controller(EmbeddedAuthoringController.name, EmbeddedAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/embedded/i18n');
    }
  ]);

export default embeddedAuthoringComponentModule;
