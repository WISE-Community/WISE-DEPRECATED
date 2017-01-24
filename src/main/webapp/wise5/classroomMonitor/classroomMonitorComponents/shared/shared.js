'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _accountMenu = require('./accountMenu/accountMenu');

var _accountMenu2 = _interopRequireDefault(_accountMenu);

var _alertStatusCorner = require('./alertStatusCorner/alertStatusCorner');

var _alertStatusCorner2 = _interopRequireDefault(_alertStatusCorner);

var _alertStatusIcon = require('./alertStatusIcon/alertStatusIcon');

var _alertStatusIcon2 = _interopRequireDefault(_alertStatusIcon);

var _periodSelect = require('./periodSelect/periodSelect');

var _periodSelect2 = _interopRequireDefault(_periodSelect);

var _workgroupComponentRevisions = require('./workgroupComponentRevisions/workgroupComponentRevisions');

var _workgroupComponentRevisions2 = _interopRequireDefault(_workgroupComponentRevisions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Shared = angular.module('shared', []);

Shared.component('accountMenu', _accountMenu2.default);
Shared.component('alertStatusCorner', _alertStatusCorner2.default);
Shared.component('alertStatusIcon', _alertStatusIcon2.default);
Shared.component('periodSelect', _periodSelect2.default);
Shared.component('workgroupComponentRevisions', _workgroupComponentRevisions2.default);

exports.default = Shared;
//# sourceMappingURL=shared.js.map