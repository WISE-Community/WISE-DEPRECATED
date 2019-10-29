'use strict';

import DrawService from './drawService';
import DrawController from './drawController';
import DrawAuthoringController from './drawAuthoringController';

let drawAuthoringComponentModule = angular.module('drawAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service('DrawService', DrawService)
  .controller('DrawController', DrawController)
  .controller('DrawAuthoringController', DrawAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/draw/i18n');
    }
  ]);

export default drawAuthoringComponentModule;
