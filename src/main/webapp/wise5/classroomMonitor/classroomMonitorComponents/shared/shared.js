'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _periodSelect = require('./periodSelect/periodSelect');

var _periodSelect2 = _interopRequireDefault(_periodSelect);

var _workgroupInfo = require('./workgroupInfo/workgroupInfo');

var _workgroupInfo2 = _interopRequireDefault(_workgroupInfo);

var _workgroupStatusIcon = require('./workgroupStatusIcon/workgroupStatusIcon');

var _workgroupStatusIcon2 = _interopRequireDefault(_workgroupStatusIcon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Shared = angular.module('shared', []);

Shared.component('periodSelect', _periodSelect2.default);
Shared.component('workgroupInfo', _workgroupInfo2.default);
Shared.component('workgroupStatusIcon', _workgroupStatusIcon2.default);

exports.default = Shared;
//# sourceMappingURL=shared.js.map