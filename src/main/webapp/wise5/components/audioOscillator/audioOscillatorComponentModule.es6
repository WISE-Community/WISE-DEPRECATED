'use strict';

import AudioOscillatorService from './audioOscillatorService';
import AudioOscillatorController from './audioOscillatorController';

let audioOscillatorComponentModule = angular.module('audioOscillatorComponentModule', [
    'pascalprecht.translate'
  ])
  .service(AudioOscillatorService.name, AudioOscillatorService)
  .controller(AudioOscillatorController.name, AudioOscillatorController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/audioOscillator/i18n');
    }
  ]);

export default audioOscillatorComponentModule;
