'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _graphService = require('./graphService');

var _graphService2 = _interopRequireDefault(_graphService);

var _graphController = require('./graphController');

var _graphController2 = _interopRequireDefault(_graphController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var graphComponentModule = angular.module('graphComponentModule', []).service(_graphService2.default.name, _graphService2.default).controller(_graphController2.default.name, _graphController2.default);

exports.default = graphComponentModule;
//# sourceMappingURL=graphComponentModule.js.map