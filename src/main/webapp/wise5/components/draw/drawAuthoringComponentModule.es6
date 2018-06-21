'use strict';

import DrawService from './drawService';
import DrawController from './drawController';
import DrawAuthoringController from './drawAuthoringController';

let drawAuthoringComponentModule = angular.module('drawAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service(DrawService.name, DrawService)
  .controller(DrawController.name, DrawController)
  .controller(DrawAuthoringController.name, DrawAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/draw/i18n');
    }
  ]);

export default drawAuthoringComponentModule;
