'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { AudioOscillatorService } from './audioOscillatorService';
import AudioOscillatorController from './audioOscillatorController';
import AudioOscillatorAuthoringController from './audioOscillatorAuthoringController';

const audioOscillatorAuthoringComponentModule = angular
  .module('audioOscillatorAuthoringComponentModule', ['pascalprecht.translate'])
  .service('AudioOscillatorService', downgradeInjectable(AudioOscillatorService))
  .controller('AudioOscillatorController', AudioOscillatorController)
  .controller('AudioOscillatorAuthoringController', AudioOscillatorAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/audioOscillator/i18n');
    }
  ]);

export default audioOscillatorAuthoringComponentModule;
