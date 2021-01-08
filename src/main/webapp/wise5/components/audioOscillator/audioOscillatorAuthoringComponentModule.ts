'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { AudioOscillatorService } from './audioOscillatorService';
import AudioOscillatorAuthoring from './audioOscillatorAuthoring';
import { EditAudioOscillatorAdvancedComponent } from './edit-audio-oscillator-advanced/edit-audio-oscillator-advanced.component';

const audioOscillatorAuthoringComponentModule = angular
  .module('audioOscillatorAuthoringComponentModule', ['pascalprecht.translate'])
  .service('AudioOscillatorService', downgradeInjectable(AudioOscillatorService))
  .component('audioOscillatorAuthoring', AudioOscillatorAuthoring)
  .component('editAudioOscillatorAdvanced', EditAudioOscillatorAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/audioOscillator/i18n');
    }
  ]);

export default audioOscillatorAuthoringComponentModule;
