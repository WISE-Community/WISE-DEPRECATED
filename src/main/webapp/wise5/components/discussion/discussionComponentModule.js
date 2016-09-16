'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _discussionService = require('./discussionService');

var _discussionService2 = _interopRequireDefault(_discussionService);

var _discussionController = require('./discussionController');

var _discussionController2 = _interopRequireDefault(_discussionController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var discussionComponentModule = angular.module('discussionComponentModule', []).service(_discussionService2.default.name, _discussionService2.default).controller(_discussionController2.default.name, _discussionController2.default);

exports.default = discussionComponentModule;
//# sourceMappingURL=discussionComponentModule.js.map