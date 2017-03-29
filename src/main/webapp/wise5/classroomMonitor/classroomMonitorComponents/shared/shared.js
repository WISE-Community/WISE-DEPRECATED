'use strict';

//import AccountMenu from './accountMenu/accountMenu';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alertStatusCorner = require('./alertStatusCorner/alertStatusCorner');

var _alertStatusCorner2 = _interopRequireDefault(_alertStatusCorner);

var _alertStatusIcon = require('./alertStatusIcon/alertStatusIcon');

var _alertStatusIcon2 = _interopRequireDefault(_alertStatusIcon);

var _periodSelect = require('./periodSelect/periodSelect');

var _periodSelect2 = _interopRequireDefault(_periodSelect);

var _workgroupComponentRevisions = require('./workgroupComponentRevisions/workgroupComponentRevisions');

var _workgroupComponentRevisions2 = _interopRequireDefault(_workgroupComponentRevisions);

var _workgroupSelect = require('./workgroupSelect/workgroupSelect');

var _workgroupSelect2 = _interopRequireDefault(_workgroupSelect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Shared = angular.module('shared', []);

//Shared.component('accountMenu', AccountMenu);
Shared.component('alertStatusCorner', _alertStatusCorner2.default);
Shared.component('alertStatusIcon', _alertStatusIcon2.default);
Shared.component('periodSelect', _periodSelect2.default);
Shared.component('workgroupComponentRevisions', _workgroupComponentRevisions2.default);
Shared.component('workgroupSelect', _workgroupSelect2.default);

exports.default = Shared;
//# sourceMappingURL=shared.js.map