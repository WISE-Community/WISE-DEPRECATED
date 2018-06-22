'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _audioOscillatorService = require('./audioOscillatorService');

var _audioOscillatorService2 = _interopRequireDefault(_audioOscillatorService);

var _audioOscillatorController = require('./audioOscillatorController');

var _audioOscillatorController2 = _interopRequireDefault(_audioOscillatorController);

var _audioOscillatorAuthoringController = require('./audioOscillatorAuthoringController');

var _audioOscillatorAuthoringController2 = _interopRequireDefault(_audioOscillatorAuthoringController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audioOscillatorAuthoringComponentModule = angular.module('audioOscillatorAuthoringComponentModule', ['pascalprecht.translate']).service(_audioOscillatorService2.default.name, _audioOscillatorService2.default).controller(_audioOscillatorController2.default.name, _audioOscillatorController2.default).controller(_audioOscillatorAuthoringController2.default.name, _audioOscillatorAuthoringController2.default).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
  $translatePartialLoaderProvider.addPart('components/audioOscillator/i18n');
}]);

exports.default = audioOscillatorAuthoringComponentModule;
//# sourceMappingURL=audioOscillatorAuthoringComponentModule.js.map
