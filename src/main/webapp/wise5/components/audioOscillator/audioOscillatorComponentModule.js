'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _audioOscillatorService = require('./audioOscillatorService');

var _audioOscillatorService2 = _interopRequireDefault(_audioOscillatorService);

var _audioOscillatorController = require('./audioOscillatorController');

var _audioOscillatorController2 = _interopRequireDefault(_audioOscillatorController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audioOscillatorComponentModule = angular.module('audioOscillatorComponentModule', ['pascalprecht.translate']).service(_audioOscillatorService2.default.name, _audioOscillatorService2.default).controller(_audioOscillatorController2.default.name, _audioOscillatorController2.default).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
  $translatePartialLoaderProvider.addPart('components/audioOscillator/i18n');
}]);

exports.default = audioOscillatorComponentModule;
//# sourceMappingURL=audioOscillatorComponentModule.js.map
