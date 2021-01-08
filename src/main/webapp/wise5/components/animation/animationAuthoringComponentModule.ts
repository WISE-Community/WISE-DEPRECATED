'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { AnimationService } from './animationService';
import AnimationAuthoring from './animationAuthoring';
import { EditAnimationAdvancedComponent } from './edit-animation-advanced/edit-animation-advanced.component';

const animationAuthoringComponentModule = angular
  .module('animationAuthoringComponentModule', ['pascalprecht.translate'])
  .service('AnimationService', downgradeInjectable(AnimationService))
  .component('animationAuthoring', AnimationAuthoring)
  .component('editAnimationAdvanced', EditAnimationAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/animation/i18n');
    }
  ]);
export default animationAuthoringComponentModule;
