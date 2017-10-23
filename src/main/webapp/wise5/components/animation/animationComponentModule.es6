'use strict';

import AnimationService from './animationService';
import AnimationController from './animationController';

let animationComponentModule = angular.module('animationComponentModule', [
    'pascalprecht.translate'
  ])
  .service(AnimationService.name, AnimationService)
  .controller(AnimationController.name, AnimationController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/animation/i18n');
    }
  ]);

export default animationComponentModule;
