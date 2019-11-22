'use strict';

import AnimationService from './animationService';
import AnimationController from './animationController';

const animationComponentModule = angular.module('animationComponentModule', [
    'pascalprecht.translate'
  ])
  .service('AnimationService', AnimationService)
  .controller('AnimationController', AnimationController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/animation/i18n');
    }
  ]);

export default animationComponentModule;
