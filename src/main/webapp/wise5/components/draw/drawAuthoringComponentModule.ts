'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { DrawService } from './drawService';
import DrawController from './drawController';
import DrawAuthoringController from './drawAuthoringController';

const drawAuthoringComponentModule = angular
  .module('drawAuthoringComponentModule', ['pascalprecht.translate'])
  .service('DrawService', downgradeInjectable(DrawService))
  .controller('DrawController', DrawController)
  .controller('DrawAuthoringController', DrawAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/draw/i18n');
    }
  ]);

export default drawAuthoringComponentModule;
