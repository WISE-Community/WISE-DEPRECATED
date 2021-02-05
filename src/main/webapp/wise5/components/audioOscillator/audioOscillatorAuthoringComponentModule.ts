'use strict';

import * as angular from 'angular';
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { AudioOscillatorService } from './audioOscillatorService';
import { EditAudioOscillatorAdvancedComponent } from './edit-audio-oscillator-advanced/edit-audio-oscillator-advanced.component';
import { AudioOscillatorAuthoring } from './audio-oscillator-authoring/audio-oscillator-authoring.component';

const audioOscillatorAuthoringComponentModule = angular
  .module('audioOscillatorAuthoringComponentModule', ['pascalprecht.translate'])
  .service('AudioOscillatorService', downgradeInjectable(AudioOscillatorService))
  .directive(
    'audioOscillatorAuthoring',
    downgradeComponent({ component: AudioOscillatorAuthoring }) as angular.IDirectiveFactory
  )
  .component('editAudioOscillatorAdvanced', EditAudioOscillatorAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/audioOscillator/i18n');
    }
  ]);

export default audioOscillatorAuthoringComponentModule;
