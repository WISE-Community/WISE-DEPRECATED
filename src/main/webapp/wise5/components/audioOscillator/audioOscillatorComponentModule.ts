'use strict';

import AudioOscillatorService from './audioOscillatorService';
import AudioOscillatorController from './audioOscillatorController';
import * as angular from 'angular';

let audioOscillatorComponentModule = angular
  .module('audioOscillatorComponentModule', ['pascalprecht.translate'])
  .service('AudioOscillatorService', AudioOscillatorService)
  .controller('AudioOscillatorController', AudioOscillatorController)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/audioOscillator/i18n');
    }
  ]);

export default audioOscillatorComponentModule;
