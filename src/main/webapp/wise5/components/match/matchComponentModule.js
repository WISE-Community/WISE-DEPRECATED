'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _matchService = require('./matchService');

var _matchService2 = _interopRequireDefault(_matchService);

var _matchController = require('./matchController');

var _matchController2 = _interopRequireDefault(_matchController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var matchComponentModule = angular.module('matchComponentModule', []).service(_matchService2.default.name, _matchService2.default).controller(_matchController2.default.name, _matchController2.default);

exports.default = matchComponentModule;
//# sourceMappingURL=matchComponentModule.js.map