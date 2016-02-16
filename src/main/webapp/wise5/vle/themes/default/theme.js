
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _navItemController = require('./themeComponents/navItem/navItemController');

var _navItemController2 = _interopRequireDefault(_navItemController);

var _stepToolsController = require('./themeComponents/stepTools/stepToolsController');

var _stepToolsController2 = _interopRequireDefault(_stepToolsController);

var _nodeStatusIconController = require('./themeComponents/nodeStatusIcon/nodeStatusIconController');

var _nodeStatusIconController2 = _interopRequireDefault(_nodeStatusIconController);

var _projectStatusController = require('./themeComponents/projectStatus/projectStatusController');

var _projectStatusController2 = _interopRequireDefault(_projectStatusController);

var _themeController = require('./themeController');

var _themeController2 = _interopRequireDefault(_themeController);

var _themeComponents = require('./themeComponents');

var _themeComponents2 = _interopRequireDefault(_themeComponents);

require('./js/webfonts');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var themeModule = angular.module('theme', ['theme.components']).controller(_navItemController2.default.name, _navItemController2.default).controller(_stepToolsController2.default.name, _stepToolsController2.default).controller(_nodeStatusIconController2.default.name, _nodeStatusIconController2.default).controller(_projectStatusController2.default.name, _projectStatusController2.default).controller(_themeController2.default.name, _themeController2.default);

exports.default = themeModule;
//# sourceMappingURL=theme.js.map