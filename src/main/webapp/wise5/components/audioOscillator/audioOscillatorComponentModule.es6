'use strict';

import AudioOscillatorService from './audioOscillatorService';
import AudioOscillatorController from './audioOscillatorController';

let audioOscillatorComponentModule = angular.module('audioOscillatorComponentModule', [])
    .service(AudioOscillatorService.name, AudioOscillatorService)
    .controller(AudioOscillatorController.name, AudioOscillatorController);

export default audioOscillatorComponentModule;
