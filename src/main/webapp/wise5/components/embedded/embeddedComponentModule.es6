'use strict';

import EmbeddedService from './embeddedService';
import EmbeddedController from './embeddedController';

let embeddedComponentModule = angular.module('embeddedComponentModule', [
    'pascalprecht.translate'
  ])
  .service(EmbeddedService.name, EmbeddedService)
  .controller(EmbeddedController.name, EmbeddedController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/embedded/i18n');
    }
  ]);

export default embeddedComponentModule;
