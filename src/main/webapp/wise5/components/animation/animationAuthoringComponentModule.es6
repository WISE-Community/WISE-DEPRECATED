'use strict';

import AnimationService from './animationService';
import AnimationController from './animationController';
import AnimationAuthoringController from './animationAuthoringController';

const animationAuthoringComponentModule = angular.module('animationAuthoringComponentModule', [
    'pascalprecht.translate'
  ])
  .service(AnimationService.name, AnimationService)
  .controller(AnimationController.name, AnimationController)
  .controller(AnimationAuthoringController.name, AnimationAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/animation/i18n');
    }
  ]);
export default animationAuthoringComponentModule;
