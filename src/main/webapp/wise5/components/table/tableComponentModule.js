'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _tableService = require('./tableService');

var _tableService2 = _interopRequireDefault(_tableService);

var _tableController = require('./tableController');

var _tableController2 = _interopRequireDefault(_tableController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var tableComponentModule = angular.module('tableComponentModule', []).service(_tableService2.default.name, _tableService2.default).controller(_tableController2.default.name, _tableController2.default);

exports.default = tableComponentModule;
//# sourceMappingURL=tableComponentModule.js.map