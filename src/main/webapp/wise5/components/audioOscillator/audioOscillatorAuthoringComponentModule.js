'use strict';

import AudioOscillatorService from './audioOscillatorService';
import AudioOscillatorController from './audioOscillatorController';
import AudioOscillatorAuthoringController from './audioOscillatorAuthoringController';

let audioOscillatorAuthoringComponentModule = angular.module('audioOscillatorAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service('AudioOscillatorService', AudioOscillatorService)
  .controller('AudioOscillatorController', AudioOscillatorController)
  .controller('AudioOscillatorAuthoringController', AudioOscillatorAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/audioOscillator/i18n');
    }
  ]);

export default audioOscillatorAuthoringComponentModule;
