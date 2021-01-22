'use strict';

import * as angular from 'angular';
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { DrawService } from './drawService';
import { EditDrawAdvancedComponent } from './edit-draw-advanced/edit-draw-advanced.component';
import { DrawAuthoring } from './draw-authoring/draw-authoring.component';

const drawAuthoringComponentModule = angular
  .module('drawAuthoringComponentModule', ['pascalprecht.translate'])
  .service('DrawService', downgradeInjectable(DrawService))
  .directive(
    'drawAuthoring',
    downgradeComponent({ component: DrawAuthoring }) as angular.IDirectiveFactory
  )
  .component('editDrawAdvanced', EditDrawAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/draw/i18n');
    }
  ]);

export default drawAuthoringComponentModule;
