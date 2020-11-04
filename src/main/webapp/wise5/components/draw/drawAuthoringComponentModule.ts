'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { DrawService } from './drawService';
import DrawAuthoring from './drawAuthoring';

const drawAuthoringComponentModule = angular
  .module('drawAuthoringComponentModule', ['pascalprecht.translate'])
  .service('DrawService', downgradeInjectable(DrawService))
  .component('drawAuthoring', DrawAuthoring)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/draw/i18n');
    }
  ]);

export default drawAuthoringComponentModule;
