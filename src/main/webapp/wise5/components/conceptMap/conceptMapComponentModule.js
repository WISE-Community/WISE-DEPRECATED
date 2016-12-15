'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _conceptMapService = require('./conceptMapService');

var _conceptMapService2 = _interopRequireDefault(_conceptMapService);

var _conceptMapController = require('./conceptMapController');

var _conceptMapController2 = _interopRequireDefault(_conceptMapController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var conceptMapComponentModule = angular.module('conceptMapComponentModule', ['pascalprecht.translate']).service(_conceptMapService2.default.name, _conceptMapService2.default).controller(_conceptMapController2.default.name, _conceptMapController2.default).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('components/conceptMap/i18n');
}]);

exports.default = conceptMapComponentModule;
//# sourceMappingURL=conceptMapComponentModule.js.map