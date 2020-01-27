'use strict';

import DrawService from './drawService';
import DrawController from './drawController';

let drawComponentModule = angular.module('drawComponentModule', [
    'pascalprecht.translate'
  ])
  .service('DrawService', DrawService)
  .controller('DrawController', DrawController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/draw/i18n');
    }
  ]);

export default drawComponentModule;
