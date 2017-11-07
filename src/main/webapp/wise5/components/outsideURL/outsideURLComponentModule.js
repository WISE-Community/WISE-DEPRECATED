'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _outsideURLService = require('./outsideURLService');

var _outsideURLService2 = _interopRequireDefault(_outsideURLService);

var _outsideURLController = require('./outsideURLController');

var _outsideURLController2 = _interopRequireDefault(_outsideURLController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var outsideURLComponentModule = angular.module('outsideURLComponentModule', []).service(_outsideURLService2.default.name, _outsideURLService2.default).controller(_outsideURLController2.default.name, _outsideURLController2.default).config(['$translatePartialLoaderProvider', function ($translatePartialLoaderProvider) {
  $translatePartialLoaderProvider.addPart('components/outsideURL/i18n');
}]);

exports.default = outsideURLComponentModule;
//# sourceMappingURL=outsideURLComponentModule.js.map
