'use strict';

import EmbeddedService from './embeddedService';
import EmbeddedController from './embeddedController';

const embeddedComponentModule = angular.module('embeddedComponentModule', [
    'pascalprecht.translate'
  ])
  .service('EmbeddedService', EmbeddedService)
  .controller('EmbeddedController', EmbeddedController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/embedded/i18n');
    }
  ]);

export default embeddedComponentModule;
