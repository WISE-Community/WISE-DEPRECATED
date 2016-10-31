'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _periodSelect = require('./periodSelect/periodSelect');

var _periodSelect2 = _interopRequireDefault(_periodSelect);

var _workgroupInfo = require('./workgroupInfo/workgroupInfo');

var _workgroupInfo2 = _interopRequireDefault(_workgroupInfo);

var _alertStatusCorner = require('./alertStatusCorner/alertStatusCorner');

var _alertStatusCorner2 = _interopRequireDefault(_alertStatusCorner);

var _alertStatusIcon = require('./alertStatusIcon/alertStatusIcon');

var _alertStatusIcon2 = _interopRequireDefault(_alertStatusIcon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Shared = angular.module('shared', []);

Shared.component('periodSelect', _periodSelect2.default);
Shared.component('workgroupInfo', _workgroupInfo2.default);
Shared.component('alertStatusCorner', _alertStatusCorner2.default);
Shared.component('alertStatusIcon', _alertStatusIcon2.default);

exports.default = Shared;
//# sourceMappingURL=shared.js.map