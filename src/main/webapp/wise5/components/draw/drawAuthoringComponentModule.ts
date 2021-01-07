'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { DrawService } from './drawService';
import DrawAuthoring from './drawAuthoring';
import { EditDrawAdvancedComponent } from './edit-draw-advanced/edit-draw-advanced.component';

const drawAuthoringComponentModule = angular
  .module('drawAuthoringComponentModule', ['pascalprecht.translate'])
  .service('DrawService', downgradeInjectable(DrawService))
  .component('drawAuthoring', DrawAuthoring)
  .component('editDrawAdvanced', EditDrawAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/draw/i18n');
    }
  ]);

export default drawAuthoringComponentModule;
