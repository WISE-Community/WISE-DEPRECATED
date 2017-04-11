'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _navItem = require('./navItem/navItem');

var _navItem2 = _interopRequireDefault(_navItem);

var _navItemProgress = require('./navItemProgress/navItemProgress');

var _navItemProgress2 = _interopRequireDefault(_navItemProgress);

var _navItemScore = require('./navItemScore/navItemScore');

var _navItemScore2 = _interopRequireDefault(_navItemScore);

var _workgroupsOnNode = require('./workgroupsOnNode/workgroupsOnNode');

var _workgroupsOnNode2 = _interopRequireDefault(_workgroupsOnNode);

var _workgroupProgress = require('./workgroupProgress/workgroupProgress');

var _workgroupProgress2 = _interopRequireDefault(_workgroupProgress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NodeProgress = angular.module('nodeProgress', []);

NodeProgress.component('navItem', _navItem2.default);
NodeProgress.component('navItemProgress', _navItemProgress2.default);
NodeProgress.component('navItemScore', _navItemScore2.default);
NodeProgress.component('workgroupsOnNode', _workgroupsOnNode2.default);
NodeProgress.component('workgroupProgress', _workgroupProgress2.default);

exports.default = NodeProgress;
//# sourceMappingURL=nodeProgress.js.map