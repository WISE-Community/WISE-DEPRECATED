'use strict';

import * as angular from 'angular';
import DrawService from './drawService';
import DrawController from './drawController';
import DrawAuthoringController from './drawAuthoringController';

const drawAuthoringComponentModule = angular
  .module('drawAuthoringComponentModule', ['pascalprecht.translate'])
  .service('DrawService', DrawService)
  .controller('DrawController', DrawController)
  .controller('DrawAuthoringController', DrawAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/draw/i18n');
    }
  ]);

export default drawAuthoringComponentModule;
