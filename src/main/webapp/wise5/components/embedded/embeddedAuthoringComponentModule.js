'use strict';

import EmbeddedService from './embeddedService';
import EmbeddedController from './embeddedController';
import EmbeddedAuthoringController from './embeddedAuthoringController';

const embeddedAuthoringComponentModule = angular.module('embeddedAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service('EmbeddedService', EmbeddedService)
  .controller('EmbeddedController', EmbeddedController)
  .controller('EmbeddedAuthoringController', EmbeddedAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/embedded/i18n');
    }
  ]);

export default embeddedAuthoringComponentModule;
