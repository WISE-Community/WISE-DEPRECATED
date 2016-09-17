'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _drawService = require('./drawService');

var _drawService2 = _interopRequireDefault(_drawService);

var _drawController = require('./drawController');

var _drawController2 = _interopRequireDefault(_drawController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var drawComponentModule = angular.module('drawComponentModule', []).service(_drawService2.default.name, _drawService2.default).controller(_drawController2.default.name, _drawController2.default);

exports.default = drawComponentModule;
//# sourceMappingURL=drawComponentModule.js.map