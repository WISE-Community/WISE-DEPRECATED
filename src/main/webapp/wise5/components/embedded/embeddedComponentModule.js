'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _embeddedService = require('./embeddedService');

var _embeddedService2 = _interopRequireDefault(_embeddedService);

var _embeddedController = require('./embeddedController');

var _embeddedController2 = _interopRequireDefault(_embeddedController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var embeddedComponentModule = angular.module('embeddedComponentModule', ['pascalprecht.translate']).service(_embeddedService2.default.name, _embeddedService2.default).controller(_embeddedController2.default.name, _embeddedController2.default).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('components/embedded/i18n');
}]);

exports.default = embeddedComponentModule;
//# sourceMappingURL=embeddedComponentModule.js.map