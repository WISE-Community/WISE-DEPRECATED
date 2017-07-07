'use strict';

//import AccountMenu from './accountMenu/accountMenu';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mainMenu = require('./mainMenu/mainMenu');

var _mainMenu2 = _interopRequireDefault(_mainMenu);

var _sideMenu = require('./sideMenu/sideMenu');

var _sideMenu2 = _interopRequireDefault(_sideMenu);

var _stepTools = require('./stepTools/stepTools');

var _stepTools2 = _interopRequireDefault(_stepTools);

var _toolbar = require('./toolbar/toolbar');

var _toolbar2 = _interopRequireDefault(_toolbar);

var _topBar = require('./topBar/topBar');

var _topBar2 = _interopRequireDefault(_topBar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Shared = angular.module('shared', []);

//Shared.component('accountMenu', AccountMenu);
Shared.component('mainMenu', _mainMenu2.default);
Shared.component('sideMenu', _sideMenu2.default);
Shared.component('stepTools', _stepTools2.default);
Shared.component('toolbar', _toolbar2.default);
Shared.component('topBar', _topBar2.default);

exports.default = Shared;
//# sourceMappingURL=shared.js.map