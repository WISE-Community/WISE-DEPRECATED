'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { AudioOscillatorService } from './audioOscillatorService';
import AudioOscillatorAuthoring from './audioOscillatorAuthoring';

const audioOscillatorAuthoringComponentModule = angular
  .module('audioOscillatorAuthoringComponentModule', ['pascalprecht.translate'])
  .service('AudioOscillatorService', downgradeInjectable(AudioOscillatorService))
  .component('audioOscillatorAuthoring', AudioOscillatorAuthoring)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/audioOscillator/i18n');
    }
  ]);

export default audioOscillatorAuthoringComponentModule;
