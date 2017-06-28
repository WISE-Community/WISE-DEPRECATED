'use strict';

//import AccountMenu from './accountMenu/accountMenu';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alertStatusCorner = require('./alertStatusCorner/alertStatusCorner');

var _alertStatusCorner2 = _interopRequireDefault(_alertStatusCorner);

var _alertStatusIcon = require('./alertStatusIcon/alertStatusIcon');

var _alertStatusIcon2 = _interopRequireDefault(_alertStatusIcon);

var _mainMenu = require('./mainMenu/mainMenu');

var _mainMenu2 = _interopRequireDefault(_mainMenu);

var _nodeCompletionIcon = require('./nodeCompletionIcon/nodeCompletionIcon');

var _nodeCompletionIcon2 = _interopRequireDefault(_nodeCompletionIcon);

var _nodeIcon = require('./nodeIcon/nodeIcon');

var _nodeIcon2 = _interopRequireDefault(_nodeIcon);

var _notificationsMenu = require('./notificationsMenu/notificationsMenu');

var _notificationsMenu2 = _interopRequireDefault(_notificationsMenu);

var _pauseScreensMenu = require('./pauseScreensMenu/pauseScreensMenu');

var _pauseScreensMenu2 = _interopRequireDefault(_pauseScreensMenu);

var _periodSelect = require('./periodSelect/periodSelect');

var _periodSelect2 = _interopRequireDefault(_periodSelect);

var _sideMenu = require('./sideMenu/sideMenu');

var _sideMenu2 = _interopRequireDefault(_sideMenu);

var _statusIcon = require('./statusIcon/statusIcon');

var _statusIcon2 = _interopRequireDefault(_statusIcon);

var _toolbar = require('./toolbar/toolbar');

var _toolbar2 = _interopRequireDefault(_toolbar);

var _topBar = require('./topBar/topBar');

var _topBar2 = _interopRequireDefault(_topBar);

var _workgroupComponentRevisions = require('./workgroupComponentRevisions/workgroupComponentRevisions');

var _workgroupComponentRevisions2 = _interopRequireDefault(_workgroupComponentRevisions);

var _workgroupSelect = require('./workgroupSelect/workgroupSelect');

var _workgroupSelect2 = _interopRequireDefault(_workgroupSelect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Shared = angular.module('shared', []);

//Shared.component('accountMenu', AccountMenu);
Shared.component('alertStatusCorner', _alertStatusCorner2.default);
Shared.component('alertStatusIcon', _alertStatusIcon2.default);
Shared.component('mainMenu', _mainMenu2.default);
Shared.component('notificationsMenu', _notificationsMenu2.default);
Shared.component('nodeCompletionIcon', _nodeCompletionIcon2.default);
Shared.component('nodeIcon', _nodeIcon2.default);
Shared.component('pauseScreensMenu', _pauseScreensMenu2.default);
Shared.component('periodSelect', _periodSelect2.default);
Shared.component('sideMenu', _sideMenu2.default);
Shared.component('statusIcon', _statusIcon2.default);
Shared.component('toolbar', _toolbar2.default);
Shared.component('topBar', _topBar2.default);
Shared.component('workgroupComponentRevisions', _workgroupComponentRevisions2.default);
Shared.component('workgroupSelect', _workgroupSelect2.default);

exports.default = Shared;
//# sourceMappingURL=shared.js.map