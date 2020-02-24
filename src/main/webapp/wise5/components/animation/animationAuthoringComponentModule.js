'use strict';

import AnimationService from './animationService';
import AnimationController from './animationController';
import AnimationAuthoringController from './animationAuthoringController';

const animationAuthoringComponentModule = angular.module('animationAuthoringComponentModule', [
    'pascalprecht.translate'
  ])
  .service('AnimationService', AnimationService)
  .controller('AnimationController', AnimationController)
  .controller('AnimationAuthoringController', AnimationAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/animation/i18n');
    }
  ]);
export default animationAuthoringComponentModule;
